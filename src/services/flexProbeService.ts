import { GoogleGenAI } from "@google/genai";

export interface FlexProbeResult {
  available: boolean;
  status: number;
  reason: "available" | "saturated" | "rate_limit" | "error";
  message: string;
  latencyMs: number;
  timestamp: string;
  model: string;
}

export interface FlexWatcherState {
  isWaiting: boolean;
  target: "single" | "batch";
  model: string;
  startedAt: string | null;
  lastCheckedAt: string | null;
  nextCheckInSeconds: number;
  attempts: number;
  checkIntervalSeconds: number;
  maxWaitHours: number;
  lastProbeResult?: FlexProbeResult | null;
}

let cachedProbeResult: FlexProbeResult | null = null;
let lastProbeTime = 0;
const PROBE_CACHE_TTL_MS = 20000; // 20-second cache to prevent spamming Google API

let watcherTimer: NodeJS.Timeout | null = null;
let watcherState: FlexWatcherState = {
  isWaiting: false,
  target: "single",
  model: "models/gemini-4-argon",
  startedAt: null,
  lastCheckedAt: null,
  nextCheckInSeconds: 0,
  attempts: 0,
  checkIntervalSeconds: 45,
  maxWaitHours: 4,
  lastProbeResult: null
};

/**
 * Executes a lightweight 1-token canary probe against the Gemini Flex Tier.
 * Consumes exactly 1 input token (cost < $0.000001) and returns within ~1 second.
 */
export async function probeFlexTierAvailability(
  modelName: string = "models/gemini-4-argon",
  apiKey?: string,
  bypassCache: boolean = false
): Promise<FlexProbeResult> {
  const normalizedModel = modelName.startsWith("models/") ? modelName : `models/${modelName}`;
  const now = Date.now();

  if (!bypassCache && cachedProbeResult && (now - lastProbeTime < PROBE_CACHE_TTL_MS) && cachedProbeResult.model === normalizedModel) {
    return cachedProbeResult;
  }

  const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!effectiveApiKey) {
    const errorResult: FlexProbeResult = {
      available: false,
      status: 401,
      reason: "error",
      message: "Missing GEMINI_API_KEY for Flex tier probe.",
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      model: normalizedModel
    };
    return errorResult;
  }

  const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
  const startTime = Date.now();

  const PROBE_TIMEOUT_MS = 12000; // 12-second ceiling for fast canary probing

  try {
    const probePromise = ai.models.generateContent({
      model: normalizedModel,
      contents: [{ role: "user", parts: [{ text: "ping" }] }],
      config: {
        maxOutputTokens: 1,
        // @ts-ignore - Google SDK accepts serviceTier
        serviceTier: "flex"
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("503: Canary probe timeout (Flex cluster queue latency exceeded 12s)"));
      }, PROBE_TIMEOUT_MS);
      // Ensure timeout does not hold node process open
      if (typeof timer.unref === "function") timer.unref();
    });

    const res = await Promise.race([probePromise, timeoutPromise]);

    const latencyMs = Date.now() - startTime;
    cachedProbeResult = {
      available: true,
      status: 200,
      reason: "available",
      message: "Flex tier capacity is currently open and available.",
      latencyMs,
      timestamp: new Date().toISOString(),
      model: normalizedModel
    };
    lastProbeTime = Date.now();
    return cachedProbeResult;
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const msg = (err?.message || String(err)).toLowerCase();
    const code = err?.status || err?.code || (msg.includes("503") ? 503 : msg.includes("429") ? 429 : 500);

    let reason: FlexProbeResult["reason"] = "error";
    let userMessage = err?.message || "Unknown error during Flex probe.";

    if (code === 503 || msg.includes("high demand") || msg.includes("unavailable") || msg.includes("spikes in demand")) {
      reason = "saturated";
      userMessage = "Gemini Flex cluster currently at capacity (HTTP 503 High Demand). Off-peak capacity is temporarily constrained.";
    } else if (code === 429 || msg.includes("resource_exhausted") || msg.includes("rate limit") || msg.includes("quota")) {
      reason = "rate_limit";
      userMessage = "Gemini API rate limit or quota exceeded (HTTP 429).";
    }

    cachedProbeResult = {
      available: false,
      status: Number(code) || 500,
      reason,
      message: userMessage,
      latencyMs,
      timestamp: new Date().toISOString(),
      model: normalizedModel
    };
    lastProbeTime = Date.now();
    return cachedProbeResult;
  }
}

/**
 * Returns the current background watcher state.
 */
export function getFlexWatcherState(): FlexWatcherState {
  return { ...watcherState };
}

/**
 * Cancels any active background Flex watcher.
 */
export function cancelFlexWatcher(): boolean {
  if (watcherTimer) {
    clearInterval(watcherTimer);
    watcherTimer = null;
  }
  const wasWaiting = watcherState.isWaiting;
  watcherState = {
    ...watcherState,
    isWaiting: false,
    startedAt: null,
    nextCheckInSeconds: 0
  };
  return wasWaiting;
}

/**
 * Engages an automated background watcher that polls Flex capacity every intervalSeconds.
 * Once capacity opens, onCapacityAvailable() callback is triggered.
 */
export function startFlexWatcher(options: {
  target: "single" | "batch";
  model: string;
  apiKey?: string;
  checkIntervalSeconds?: number;
  maxWaitHours?: number;
  onProbe?: (result: FlexProbeResult, attempt: number) => void;
  onCapacityAvailable: (result: FlexProbeResult) => Promise<void> | void;
  onTimeout?: (elapsedHours: number) => void;
}): FlexWatcherState {
  cancelFlexWatcher();

  const checkInterval = options.checkIntervalSeconds || 45;
  const maxHours = options.maxWaitHours || 4;
  const startTime = Date.now();

  watcherState = {
    isWaiting: true,
    target: options.target,
    model: options.model,
    startedAt: new Date().toISOString(),
    lastCheckedAt: null,
    nextCheckInSeconds: checkInterval,
    attempts: 0,
    checkIntervalSeconds: checkInterval,
    maxWaitHours: maxHours,
    lastProbeResult: null
  };

  let secondsRemaining = checkInterval;

  const runProbe = async () => {
    watcherState.attempts++;
    watcherState.lastCheckedAt = new Date().toISOString();

    const elapsedMs = Date.now() - startTime;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    // Check max wait timeout
    if (elapsedHours >= maxHours) {
      cancelFlexWatcher();
      options.onTimeout?.(elapsedHours);
      return;
    }

    // Execute probe bypassing short cache
    const probeRes = await probeFlexTierAvailability(options.model, options.apiKey, true);
    watcherState.lastProbeResult = probeRes;
    options.onProbe?.(probeRes, watcherState.attempts);

    if (probeRes.available) {
      console.log(`[Flex Gatekeeper] Capacity cleared! Probe succeeded in ${probeRes.latencyMs}ms. Firing execution...`);
      cancelFlexWatcher();
      await options.onCapacityAvailable(probeRes);
    }
  };

  // Execute initial probe #1 immediately in background without blocking API response
  const initialProbeTimer = setTimeout(() => {
    runProbe().catch(err => console.warn("[Flex Watcher Initial Probe Error]:", err?.message || err));
  }, 50);
  if (typeof initialProbeTimer.unref === "function") initialProbeTimer.unref();

  // Run a countdown and polling loop
  watcherTimer = setInterval(async () => {
    secondsRemaining--;
    watcherState.nextCheckInSeconds = Math.max(0, secondsRemaining);

    if (secondsRemaining <= 0) {
      secondsRemaining = checkInterval;
      await runProbe();
    }
  }, 1000);

  return { ...watcherState };
}
