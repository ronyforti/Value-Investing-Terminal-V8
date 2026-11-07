import "dotenv/config";
import { probeFlexTierAvailability, getFlexWatcherState } from "../src/services/flexProbeService.js";

async function runFlexProbeTests() {
  console.log("=== Testing Gemini Flex Tier Canary Probe & Service ===");

  // 1. Initial Watcher State
  const initialWatcher = getFlexWatcherState();
  console.log("Initial Watcher State:", initialWatcher);
  if (initialWatcher.isWaiting !== false) {
    throw new Error("Initial watcher isWaiting should be false");
  }

  // 2. Canary Probe on Gemini 4 Argon
  console.log("\nProbing Flex tier for models/gemini-4-argon...");
  const t0 = Date.now();
  const probeArgon = await probeFlexTierAvailability("models/gemini-4-argon", undefined, true);
  console.log(`Argon Probe Result (${Date.now() - t0}ms):`, {
    available: probeArgon.available,
    status: probeArgon.status,
    reason: probeArgon.reason,
    latencyMs: probeArgon.latencyMs,
    message: probeArgon.message.slice(0, 80) + "..."
  });

  if (typeof probeArgon.available !== "boolean" || typeof probeArgon.status !== "number") {
    throw new Error("Probe result does not match FlexProbeResult schema");
  }

  // 3. Cache Invariance Verification
  console.log("\nTesting 20-second probe cache...");
  const tCacheStart = Date.now();
  const cachedProbe = await probeFlexTierAvailability("models/gemini-4-argon", undefined, false);
  const cacheElapsed = Date.now() - tCacheStart;
  console.log(`Cache Read Elapsed: ${cacheElapsed}ms (Must be < 15ms)`);
  if (cacheElapsed > 15) {
    throw new Error(`Cached probe took too long (${cacheElapsed}ms); expected instant RAM return`);
  }
  if (cachedProbe.timestamp !== probeArgon.timestamp) {
    throw new Error("Cached probe timestamp does not match original probe");
  }

  console.log("\n✓ ALL FLEX PROBE UNIT TESTS PASSED PERFECTLY!");
}

runFlexProbeTests().catch((err) => {
  console.error("Flex Probe Test Failed:", err);
  process.exit(1);
});
