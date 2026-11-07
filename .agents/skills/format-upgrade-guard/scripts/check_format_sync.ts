import fs from "fs";
import path from "path";
import crypto from "crypto";

const LAB_GUARD = "c:/Users/Ronald/antigravity/Value-Investing-Terminal-Lab/src/utils/dossierFormatGuard.ts";
const MAIN_GUARD = "c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/utils/dossierFormatGuard.ts";

function getHash(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  return crypto.createHash("sha256").update(content).digest("hex");
}

console.log("=== Checking Dossier Format Sync Status (Lab vs. Main Production) ===");

if (!fs.existsSync(MAIN_GUARD)) {
  console.error("FAIL: Main Production format guard not found at", MAIN_GUARD);
  process.exit(1);
}

const mainHash = getHash(MAIN_GUARD);
console.log(`Main Guard: ${MAIN_GUARD} (SHA: ${mainHash?.slice(0, 10)}...)`);

if (!fs.existsSync(LAB_GUARD)) {
  console.log(`Lab Guard:  NOT PRESENT at ${LAB_GUARD}`);
  console.log("\nℹ️  INDEPENDENT WORKSPACE: Lab sandbox is not active on this environment; Main Terminal format guard is authoritative.");
} else {
  const labHash = getHash(LAB_GUARD);
  console.log(`Lab Guard:  ${LAB_GUARD} (SHA: ${labHash?.slice(0, 10)}...)`);
  if (labHash === mainHash) {
    console.log("\n✅  IN SYNC: Main Terminal matches Lab Terminal format guard perfectly!");
  } else {
    console.log("\n⚠️  FORMAT DRIFT: Lab Terminal has different formatting rules than Main Terminal.");
    console.log("    To inspect diff, run: git diff " + MAIN_GUARD + " " + LAB_GUARD);
  }
}
