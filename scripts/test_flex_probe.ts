import "dotenv/config";
import { probeFlexTierAvailability, getFlexWatcherState } from "../src/services/flexProbeService.js";

async function runFlexProbeTests() {
  console.log("=== Testing Gemini Flex Tier Canary Probe & Service ===");

  // 1. Initial Watcher State & Missing Model Guard
  const initialWatcher = getFlexWatcherState();
  console.log("Initial Watcher State:", initialWatcher);
  if (initialWatcher.isWaiting !== false) {
    throw new Error("Initial watcher isWaiting should be false");
  }

  const missingModelRes = await probeFlexTierAvailability("", undefined, true);
  if (missingModelRes.available || missingModelRes.status !== 400) {
    throw new Error("Blank model probe must reject with status 400 rather than silently falling back");
  }

  const modelArg = process.argv.find(a => a.startsWith("--model="))?.replace("--model=", "") || "models/gemini-4-carbon";
  const targetModel = modelArg.startsWith("models/") ? modelArg : `models/${modelArg}`;

  // 2. Canary Probe on target Gemini 4 model
  console.log(`\nProbing Flex tier for ${targetModel}...`);
  const t0 = Date.now();
  const probeRes = await probeFlexTierAvailability(targetModel, undefined, true);
  console.log(`Probe Result (${Date.now() - t0}ms):`, {
    available: probeRes.available,
    status: probeRes.status,
    reason: probeRes.reason,
    latencyMs: probeRes.latencyMs,
    message: probeRes.message.slice(0, 80) + "..."
  });

  if (typeof probeRes.available !== "boolean" || typeof probeRes.status !== "number") {
    throw new Error("Probe result does not match FlexProbeResult schema");
  }

  // 3. Cache Invariance Verification
  console.log("\nTesting 20-second probe cache...");
  const tCacheStart = Date.now();
  const cachedProbe = await probeFlexTierAvailability(targetModel, undefined, false);
  const cacheElapsed = Date.now() - tCacheStart;
  console.log(`Cache Read Elapsed: ${cacheElapsed}ms (Must be < 15ms)`);
  if (cacheElapsed > 15) {
    throw new Error(`Cached probe took too long (${cacheElapsed}ms); expected instant RAM return`);
  }
  if (cachedProbe.timestamp !== probeRes.timestamp) {
    throw new Error("Cached probe timestamp does not match original probe");
  }

  console.log("\n✓ ALL FLEX PROBE UNIT TESTS PASSED PERFECTLY!");
}

runFlexProbeTests().catch((err) => {
  console.error("Flex Probe Test Failed:", err);
  process.exit(1);
});
