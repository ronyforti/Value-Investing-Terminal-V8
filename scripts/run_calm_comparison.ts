import fs from "fs";
import path from "path";

const SERVER_URL = "http://localhost:3000";
const STAGING_DIR = path.resolve("staging/CALM");
const DIST_DOSSIER_DIR = path.resolve("output/dossiers");
const TELEMETRY_DIR = path.resolve("output/telemetry");

interface FileToUpload {
  name: string;
  filePath: string;
  mimeType: string;
}

interface StepTiming {
  stepIndex: number;
  title: string;
  startTime: number;
  endTime?: number;
  durationSeconds?: number;
  status: string;
}

interface ValuationRunResult {
  model: string;
  ticker: string;
  period: string;
  totalDurationSeconds: number;
  stepTimings: StepTiming[];
  mdPath: string;
  htmlPath: string;
  rawMd: string;
  rawHtml: string;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv") return "text/csv";
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".json") return "application/json";
  return "text/plain";
}

async function runModelValuation(targetModel: string): Promise<ValuationRunResult> {
  const modelShortName = targetModel.replace("models/", "");
  console.log("\n======================================================================");
  console.log(`  LAUNCHING CALM VALUATION RUN: ${targetModel}`);
  console.log(`  Target: CALM | Period: Q1-27 | Price: $66.67 | Model: ${modelShortName}`);
  console.log(`  Position: EXISTING HOLDING (Weight: 5.84% | Entry: $80.36)`);
  console.log(`  Pipeline: 11 Unified Chapters + Step 12 Forensic Crosscheck (Gate 4)`);
  console.log("======================================================================\n");

  if (!fs.existsSync(DIST_DOSSIER_DIR)) {
    fs.mkdirSync(DIST_DOSSIER_DIR, { recursive: true });
  }
  if (!fs.existsSync(TELEMETRY_DIR)) {
    fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
  }

  // 1. Verify files in STAGING_DIR
  if (!fs.existsSync(STAGING_DIR)) {
    throw new Error(`Staging directory not found: ${STAGING_DIR}`);
  }

  const calmFiles = ["CALM_10-K_2026.md", "CALM_10-Q1_2027.md", "CALM Q1-27 - Financials-TTM.csv", "CALM_Q1-27_Transcript.md"];
  const stagedFiles: FileToUpload[] = [];
  for (const fn of calmFiles) {
    const fullPath = path.join(STAGING_DIR, fn);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing required staging file: ${fullPath}`);
    }
    const stat = fs.statSync(fullPath);
    const mime = getMimeType(fullPath);
    stagedFiles.push({ name: fn, filePath: fullPath, mimeType: mime });
  }

  // 2. Hard Reset previous session
  console.log(`[Stage 1/4] Resetting terminal session...`);
  await fetch(`${SERVER_URL}/api/session/stop`, { method: "POST" }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  const resetRes = await fetch(`${SERVER_URL}/api/session/hard-reset`, { method: "POST" });
  if (!resetRes.ok) {
    console.warn("  Hard-reset returned non-200, continuing...");
  } else {
    console.log("  Clean ticker environment enforced.");
  }

  // 3. Initialize Session
  console.log(`[Stage 2/4] Configuring session with User Position (5.84% @ $80.36)...`);
  const initPayload = {
    ticker: "CALM",
    period: "Q1-27",
    price: "66.67",
    model: targetModel,
    executionMode: 3, // Full Auto
    enableCrosscheck: true,
    crosscheckModel: "default",
    portfolio: {
      holdsPosition: true,
      currentWeight: "5.84%",
      entryPrice: "80.36"
    },
    notes: ""
  };

  const initRes = await fetch(`${SERVER_URL}/api/session/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(initPayload)
  });

  if (!initRes.ok) {
    throw new Error(`Session init failed: ${await initRes.text()}`);
  }
  console.log(`  Session initialized for CALM Q1-27 with ${targetModel}.`);

  // 4. Upload Files
  console.log(`[Stage 3/4] Uploading filings & CSV datasets...`);
  for (const f of stagedFiles) {
    const fileBuffer = fs.readFileSync(f.filePath);
    const base64Data = fileBuffer.toString("base64");
    const uploadRes = await fetch(`${SERVER_URL}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: f.name,
        data: base64Data,
        mimeType: f.mimeType,
        harmonize: true,
        bypassCurrencyCheck: true
      })
    });
    if (!uploadRes.ok) {
      throw new Error(`Upload failed for ${f.name}: ${await uploadRes.text()}`);
    }
    console.log(`  Uploaded ${f.name} [OK]`);
  }

  // 5. Fire Terminal Execution & Telemetry
  console.log(`\n[Stage 4/4] Starting 12-Step Streamlined Pipeline with ${modelShortName}...`);
  const runRes = await fetch(`${SERVER_URL}/api/session/step/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      overrideIntegrityCheck: true,
      overrideMissingFiles: true
    })
  });

  if (!runRes.ok) {
    throw new Error(`Pipeline execution failed: ${await runRes.text()}`);
  }

  const runStartTime = Date.now();
  const stepTimings: StepTiming[] = [];
  let currentActiveIdx = -1;
  let lastLoggedStatus = "";

  while (true) {
    await new Promise(r => setTimeout(r, 4000));
    let stateRes;
    try {
      stateRes = await fetch(`${SERVER_URL}/api/session`);
    } catch {
      continue;
    }
    if (!stateRes.ok) continue;

    const resBody = await stateRes.json() as any;
    const sessionState = resBody.state || resBody;
    const activeIdx = sessionState.activeStepIndex || 0;
    const steps = sessionState.steps || [];
    const status = sessionState.status;

    // Track step transitions and timings
    if (activeIdx !== currentActiveIdx) {
      const now = Date.now();
      if (currentActiveIdx >= 0 && stepTimings[currentActiveIdx]) {
        stepTimings[currentActiveIdx].endTime = now;
        stepTimings[currentActiveIdx].durationSeconds = Math.round((now - stepTimings[currentActiveIdx].startTime) / 1000);
        stepTimings[currentActiveIdx].status = "completed";
      }

      currentActiveIdx = activeIdx;
      if (steps[activeIdx]) {
        stepTimings[activeIdx] = {
          stepIndex: activeIdx,
          title: steps[activeIdx].title,
          startTime: now,
          status: "running"
        };
      }
    }

    const elapsed = Math.round((Date.now() - runStartTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    const timeStr = `${m}m ${s.toString().padStart(2, "0")}s`;

    if (status !== lastLoggedStatus || activeIdx !== currentActiveIdx) {
      lastLoggedStatus = status;
      const stepTitle = steps[activeIdx]?.title || `Step ${activeIdx + 1}`;
      console.log(`  [${timeStr}] Step ${activeIdx + 1}/${steps.length || 12}: ${stepTitle} [${status.toUpperCase()}]`);
    }

    if (status === "retrying") {
      const retry = sessionState.retryState;
      const secLeft = retry?.nextRetryTimestamp ? Math.max(0, Math.round((retry.nextRetryTimestamp - Date.now()) / 1000)) : 0;
      console.log(`    ↳ Gemini Cooldown / Retry: auto-resuming in ${secLeft}s...`);
    } else if (status === "paused") {
      console.log(`    ↳ Session paused at Step ${activeIdx + 1}. Auto-resuming...`);
      await fetch(`${SERVER_URL}/api/session/step/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideIntegrityCheck: true, overrideMissingFiles: true })
      });
    } else if (status === "failed") {
      console.warn(`    ↳ Step ${activeIdx + 1} marked failed. Retrying...`);
      await new Promise(r => setTimeout(r, 5000));
      await fetch(`${SERVER_URL}/api/session/step/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideIntegrityCheck: true, overrideMissingFiles: true })
      });
    } else if (status === "completed") {
      const totalElapsed = Math.round((Date.now() - runStartTime) / 1000);
      if (currentActiveIdx >= 0 && stepTimings[currentActiveIdx]) {
        stepTimings[currentActiveIdx].endTime = Date.now();
        stepTimings[currentActiveIdx].durationSeconds = Math.round((Date.now() - stepTimings[currentActiveIdx].startTime) / 1000);
        stepTimings[currentActiveIdx].status = "completed";
      }
      console.log(`\n======================================================================`);
      console.log(`  ${modelShortName.toUpperCase()} FINISHED ALL 12 STEPS IN ${Math.floor(totalElapsed / 60)}m ${totalElapsed % 60}s!`);
      console.log(`======================================================================\n`);
      break;
    }
  }

  // Export dossiers
  const exportMdRes = await fetch(`${SERVER_URL}/api/session/export?ticker=CALM&period=Q1-27&model=${modelShortName}`);
  const rawMd = await exportMdRes.text();

  const exportHtmlRes = await fetch(`${SERVER_URL}/api/session/export-html?ticker=CALM&period=Q1-27&model=${modelShortName}`);
  const rawHtml = await exportHtmlRes.text();

  const formattedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
  const mdFilename = `CALM Q1-27_Complete Doc_${modelShortName}_${formattedDate}.md`;
  const htmlFilename = `CALM Q1-27_Valuation_Dossier_${modelShortName}_${formattedDate}.html`;

  const distMdPath = path.join(DIST_DOSSIER_DIR, mdFilename);
  const distHtmlPath = path.join(DIST_DOSSIER_DIR, htmlFilename);
  fs.writeFileSync(distMdPath, rawMd, "utf-8");
  fs.writeFileSync(distHtmlPath, rawHtml, "utf-8");

  // Save telemetry JSON
  const telemetryPath = path.join(TELEMETRY_DIR, `CALM_Q1-27_Telemetry_${modelShortName}.json`);
  const totalDurationSeconds = Math.round((Date.now() - runStartTime) / 1000);
  const result: ValuationRunResult = {
    model: targetModel,
    ticker: "CALM",
    period: "Q1-27",
    totalDurationSeconds,
    stepTimings,
    mdPath: distMdPath,
    htmlPath: distHtmlPath,
    rawMd,
    rawHtml
  };
  fs.writeFileSync(telemetryPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`  Saved Dossiers & Telemetry:\n    - ${distMdPath}\n    - ${distHtmlPath}\n    - ${telemetryPath}`);

  return result;
}

async function main() {
  const modelArg = process.argv.find(a => a.startsWith("--model="))?.replace("--model=", "");
  
  if (modelArg) {
    await runModelValuation(modelArg);
  } else {
    console.log("No specific model passed. Running full comparison sequence (Argon then Flash)...");
    const argonResult = await runModelValuation("models/gemini-4-argon");
    console.log("\nResting 5 seconds between runs...\n");
    await new Promise(r => setTimeout(r, 5000));
    const flashResult = await runModelValuation("models/gemini-3.8-flash");

    console.log("\n======================================================================");
    console.log("  DUAL MODEL EVALUATION COMPLETE!");
    console.log(`  Argon Total Duration: ${Math.floor(argonResult.totalDurationSeconds / 60)}m ${argonResult.totalDurationSeconds % 60}s`);
    console.log(`  Flash Total Duration: ${Math.floor(flashResult.totalDurationSeconds / 60)}m ${flashResult.totalDurationSeconds % 60}s`);
    console.log("======================================================================\n");
  }
}

main().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
