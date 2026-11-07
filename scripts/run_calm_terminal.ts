import fs from "fs";
import path from "path";

const SERVER_URL = "http://localhost:3000";
const STAGING_DIR = path.resolve("staging/CALM");
const DIST_DOSSIER_DIR = path.resolve("dist/dossiers");
const TERMINAL_OUTPUT_DIR = "G:/My Drive/Company Data/GTD_Investing_Journal/GTD_Investment_Latticework_Organized/02 AI_Terminal";

interface FileToUpload {
  name: string;
  filePath: string;
  mimeType: string;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv") return "text/csv";
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".json") return "application/json";
  return "text/plain";
}

async function runCALMValuation() {
  const modelArg = process.argv.find(a => a.startsWith("--model="))?.replace("--model=", "") || "models/gemini-4-argon";
  const targetModel = modelArg.startsWith("models/") ? modelArg : `models/${modelArg}`;
  const modelShortName = targetModel.replace("models/", "");

  console.log("======================================================================");
  console.log("  LAUNCHING FULL CALM (CAL-MAINE FOODS) VALUATION RUN");
  console.log(`  Target: CALM | Period: Q1-27 | Price: $66.67 | Model: ${modelShortName}`);
  console.log("  Position: EXISTING HOLDING (Weight: 5.78% | Entry: $80.36)");
  console.log("  Pipeline: 11 Unified Institutional Chapters + Step 12 Crosscheck");
  console.log("======================================================================\n");

  if (!fs.existsSync(DIST_DOSSIER_DIR)) {
    fs.mkdirSync(DIST_DOSSIER_DIR, { recursive: true });
  }

  // 1. Verify files in STAGING_DIR
  if (!fs.existsSync(STAGING_DIR)) {
    throw new Error(`Staging directory not found: ${STAGING_DIR}`);
  }

  const calmFiles = ["CALM_10-K_2026.md", "CALM_10-Q1_2027.md", "CALM Q1-27 - Financials-TTM.csv", "CALM_Q1-27_Transcript.md"];
  console.log(`[Stage 1/5] Checking staged filings in ${STAGING_DIR}:`);
  const stagedFiles: FileToUpload[] = [];
  for (const fn of calmFiles) {
    const fullPath = path.join(STAGING_DIR, fn);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing required staging file: ${fullPath}`);
    }
    const stat = fs.statSync(fullPath);
    const mime = getMimeType(fullPath);
    stagedFiles.push({ name: fn, filePath: fullPath, mimeType: mime });
    console.log(`  - ${fn} (${(stat.size / 1024).toFixed(1)} KB, ${mime})`);
  }

  // 2. Hard Reset previous session
  console.log(`\n[Stage 2/5] Resetting terminal session...`);
  await fetch(`${SERVER_URL}/api/session/stop`, { method: "POST" }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  const resetRes = await fetch(`${SERVER_URL}/api/session/hard-reset`, { method: "POST" });
  if (!resetRes.ok) {
    console.warn("  Hard-reset endpoint returned non-200, continuing...");
  } else {
    console.log("  Terminal session state reset cleanly.");
  }

  // 3. Initialize Session
  console.log(`\n[Stage 3/5] Configuring session parameters with User Position...`);
  const initPayload = {
    ticker: "CALM",
    period: "Q1-27",
    price: "66.67",
    model: targetModel,
    pipelineMode: "single",
    serviceTier: "flex",
    executionMode: 3, // Full Auto
    enableCrosscheck: true,
    crosscheckModel: "default",
    portfolio: {
      holdsPosition: true,
      currentWeight: "5.78%",
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
  console.log(`  Session initialized: CALM Q1-27 ($66.67), Model: ${modelShortName}, Crosscheck: ON.`);
  console.log("  Portfolio context active: holdsPosition=true, weight=5.78%, entryPrice=$80.36.");

  // 4. Upload Files
  console.log(`\n[Stage 4/5] Uploading documents to Terminal Engine...`);
  for (const f of stagedFiles) {
    const fileBuffer = fs.readFileSync(f.filePath);
    const base64Data = fileBuffer.toString("base64");

    process.stdout.write(`  Uploading ${f.name}... `);
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
      throw new Error(`Failed to upload ${f.name}: ${await uploadRes.text()}`);
    }
    const uploadJson = await uploadRes.json() as any;
    console.log(`[OK] (${uploadJson.file?.auditCategory || "Document Ingested"})`);
  }

  // Pre-flight DocumentGuard Check
  const sessionCheck = await (await fetch(`${SERVER_URL}/api/session`)).json() as any;
  const auditList = sessionCheck.auditChecklist || [];
  console.log("\n  Document Verification Roll Call:");
  for (const c of auditList) {
    const statusMark = c.status === "PRESENT" ? "[OK]" : (c.status === "EXEMPT" ? "[EXEMPT]" : "[MISSING]");
    console.log(`    ${statusMark} ${c.label}: ${c.details || ""}`);
  }

  // 5. Fire Terminal Execution
  console.log(`\n[Stage 5/5] Initiating 12-Step Streamlined Valuation Pipeline...`);
  const runRes = await fetch(`${SERVER_URL}/api/session/step/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      overrideIntegrityCheck: true,
      overrideMissingFiles: true
    })
  });

  if (!runRes.ok) {
    throw new Error(`Pipeline start failed: ${await runRes.text()}`);
  }
  console.log("  Valuation pipeline started successfully. Monitoring progress...\n");

  const startTime = Date.now();
  let lastLoggedStep = -1;
  let lastLoggedStatus = "";
  let totalStepsCount = 12;

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
    const currentStepIdx = sessionState.activeStepIndex || 0;
    const steps = sessionState.steps || [];
    totalStepsCount = steps.length || 12;
    const currentStep = steps[currentStepIdx];
    const status = sessionState.status;

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

    if (currentStepIdx !== lastLoggedStep || status !== lastLoggedStatus) {
      lastLoggedStep = currentStepIdx;
      lastLoggedStatus = status;
      if (currentStep) {
        console.log(`  [${timeStr}] Step ${currentStepIdx + 1}/${totalStepsCount}: ${currentStep.title} -> Status: [${status.toUpperCase()}]`);
      }
    }

    if (status === "retrying") {
      const retry = sessionState.retryState;
      const secLeft = retry?.nextRetryTimestamp ? Math.max(0, Math.round((retry.nextRetryTimestamp - Date.now()) / 1000)) : 0;
      console.log(`    ↳ Gemini Cooldown / Retry: auto-resuming in ${secLeft}s (Attempt ${retry?.attempt || 1}/${retry?.maxAttempts || 3})...`);
    } else if (status === "paused") {
      console.log(`    ↳ Session paused at Step ${currentStepIdx + 1}. Auto-resuming...`);
      await fetch(`${SERVER_URL}/api/session/step/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideIntegrityCheck: true, overrideMissingFiles: true })
      });
    } else if (status === "failed") {
      console.warn(`    ↳ Step ${currentStepIdx + 1} marked failed. Retrying...`);
      await new Promise(r => setTimeout(r, 5000));
      await fetch(`${SERVER_URL}/api/session/step/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideIntegrityCheck: true, overrideMissingFiles: true })
      });
    } else if (status === "completed") {
      console.log(`\n======================================================================`);
      console.log(`  ALL ${totalStepsCount} VALUATION STEPS COMPLETED IN ${timeStr}!`);
      console.log(`======================================================================\n`);
      break;
    }
  }

  // Export Markdown
  console.log("Fetching compiled institutional Markdown dossier...");
  const exportMdRes = await fetch(`${SERVER_URL}/api/session/export?ticker=CALM&period=Q1-27&model=${modelShortName}`);
  const rawMd = await exportMdRes.text();

  // Export HTML
  console.log("Fetching compiled standalone HTML dossier...");
  const exportHtmlRes = await fetch(`${SERVER_URL}/api/session/export-html?ticker=CALM&period=Q1-27&model=${modelShortName}`);
  const rawHtml = await exportHtmlRes.text();

  const formattedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
  const mdFilename = `CALM Q1-27_Complete Doc_${modelShortName}_${formattedDate}.md`;
  const htmlFilename = `CALM Q1-27_Valuation_Dossier_${modelShortName}_${formattedDate}.html`;

  // Write to local dist/dossiers
  const distMdPath = path.join(DIST_DOSSIER_DIR, mdFilename);
  const distHtmlPath = path.join(DIST_DOSSIER_DIR, htmlFilename);
  fs.writeFileSync(distMdPath, rawMd, "utf-8");
  fs.writeFileSync(distHtmlPath, rawHtml, "utf-8");
  console.log(`  Saved Local Markdown: ${distMdPath} (${(rawMd.length / 1024).toFixed(1)} KB)`);
  console.log(`  Saved Local HTML:     ${distHtmlPath} (${(rawHtml.length / 1024).toFixed(1)} KB)`);

  // Write directly to Terminal Directory in Google Drive
  if (fs.existsSync(TERMINAL_OUTPUT_DIR)) {
    const termMdPath = path.join(TERMINAL_OUTPUT_DIR, mdFilename);
    const termHtmlPath = path.join(TERMINAL_OUTPUT_DIR, htmlFilename);
    fs.writeFileSync(termMdPath, rawMd, "utf-8");
    fs.writeFileSync(termHtmlPath, rawHtml, "utf-8");
    console.log(`  Synced to Terminal Output Directory:\n    - ${termMdPath}\n    - ${termHtmlPath}`);
  }


  console.log("\nValuation execution completed successfully!");
}

runCALMValuation().catch(err => {
  console.error("Fatal error running CALM valuation:", err);
  process.exit(1);
});
