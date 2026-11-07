import fs from "fs";
import path from "path";

const SERVER_URL = "http://localhost:3000";
const STAGING_INTU_DIR = path.resolve("staging/INTU");
const DIST_DOSSIER_DIR = path.resolve("dist/dossiers");
const VAULT_DOSSIER_DIR = "G:/My Drive/Company Data/GTD_Investing_Journal/GTD_Investment_Latticework_Organized/02 AI_Terminal";

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

async function runINTUValuation() {
  console.log("======================================================================");
  console.log("  LAUNCHING FULL INTU (INTUIT INC.) VALUATION RUN ON TERMINAL ENGINE");
  console.log("  Target: INTU | Period: Q4-26 | Price: $270.54 | Model: gemini-3.8-flash");
  console.log("======================================================================\n");

  // Ensure output dirs exist
  if (!fs.existsSync(DIST_DOSSIER_DIR)) {
    fs.mkdirSync(DIST_DOSSIER_DIR, { recursive: true });
  }

  // 1. Verify files in staging/INTU
  if (!fs.existsSync(STAGING_INTU_DIR)) {
    throw new Error(`Staging directory not found: ${STAGING_INTU_DIR}`);
  }

  const filesInDir = fs.readdirSync(STAGING_INTU_DIR);
  console.log(`[Stage 1/5] Checking staged filings in ${STAGING_INTU_DIR}:`);
  const stagedFiles: FileToUpload[] = [];
  for (const fn of filesInDir) {
    const fullPath = path.join(STAGING_INTU_DIR, fn);
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      const mime = getMimeType(fullPath);
      stagedFiles.push({ name: fn, filePath: fullPath, mimeType: mime });
      console.log(`  - ${fn} (${(stat.size / 1024).toFixed(1)} KB, ${mime})`);
    }
  }

  if (stagedFiles.length === 0) {
    throw new Error("No files found in staging/INTU!");
  }

  // 2. Hard Reset previous session
  console.log(`\n[Stage 2/5] Resetting terminal session...`);
  await fetch(`${SERVER_URL}/api/session/stop`, { method: "POST" }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  const resetRes = await fetch(`${SERVER_URL}/api/session/hard-reset`, { method: "POST" });
  if (!resetRes.ok) {
    throw new Error(`Failed to hard reset: ${await resetRes.text()}`);
  }
  console.log("  Terminal session cleanly reset.");

  // 3. Initialize Session
  console.log(`\n[Stage 3/5] Configuring session parameters...`);
  const initPayload = {
    ticker: "INTU",
    period: "Q4-26",
    price: "270.54",
    model: "gemini-3.8-flash",
    executionMode: 3, // Full Auto
    enableCrosscheck: true,
    crosscheckModel: "default",
    portfolio: { holdsPosition: false },
    notes: "Q4-26 comprehensive 10-K audit run with upgraded Schilit forensic, Thorndike capital allocation, and Mauboussin reverse DCF frameworks."
  };

  const initRes = await fetch(`${SERVER_URL}/api/session/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(initPayload)
  });

  if (!initRes.ok) {
    throw new Error(`Session init failed: ${await initRes.text()}`);
  }
  console.log("  Session initialized: INTU Q4-26 ($270.54), Model: gemini-3.8-flash, Crosscheck: ON.");

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
      console.log(`FAILED (${uploadRes.status}): ${await uploadRes.text()}`);
    } else {
      const upData = await uploadRes.json() as any;
      const tokens = upData.file?.tokens || Math.ceil(fileBuffer.length / 4);
      console.log(`OK (${tokens.toLocaleString()} tokens)`);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  // Pre-flight DocumentGuard Check
  const sessionCheck = await (await fetch(`${SERVER_URL}/api/session`)).json() as any;
  const auditList = sessionCheck.auditChecklist || [];
  console.log(`\n  Filing Ingestion Audit Checklist:`);
  for (const c of auditList) {
    const statusMark = c.status === "PRESENT" ? "[OK]" : (c.status === "EXEMPT" ? "[EXEMPT]" : "[MISSING]");
    console.log(`    ${statusMark} ${c.label}: ${c.details || ""}`);
  }

  // 5. Fire Terminal Execution
  console.log(`\n[Stage 5/5] Initiating 16-Step Valuation Pipeline...`);
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
  let totalStepsCount = 17;

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
    totalStepsCount = steps.length || 17;
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
  const exportMdRes = await fetch(`${SERVER_URL}/api/session/export?ticker=INTU&period=Q4-26&model=gemini-3.8-flash`);
  const rawMd = await exportMdRes.text();

  // Export HTML
  console.log("Fetching compiled standalone HTML dossier...");
  const exportHtmlRes = await fetch(`${SERVER_URL}/api/session/export-html?ticker=INTU&period=Q4-26&model=gemini-3.8-flash`);
  const rawHtml = await exportHtmlRes.text();

  const mdFilename = `INTU_Q4-26_Valuation_Dossier.md`;
  const htmlFilename = `INTU_Q4-26_Valuation_Dossier.html`;

  // Write to local dist/dossiers
  const distMdPath = path.join(DIST_DOSSIER_DIR, mdFilename);
  const distHtmlPath = path.join(DIST_DOSSIER_DIR, htmlFilename);
  fs.writeFileSync(distMdPath, rawMd, "utf-8");
  fs.writeFileSync(distHtmlPath, rawHtml, "utf-8");
  console.log(`  Saved Markdown: ${distMdPath} (${(rawMd.length / 1024).toFixed(1)} KB)`);
  console.log(`  Saved HTML:     ${distHtmlPath} (${(rawHtml.length / 1024).toFixed(1)} KB)`);

  // Write to Obsidian Vault if available
  if (fs.existsSync(VAULT_DOSSIER_DIR)) {
    const vaultMdPath = path.join(VAULT_DOSSIER_DIR, mdFilename);
    const vaultHtmlPath = path.join(VAULT_DOSSIER_DIR, htmlFilename);
    fs.writeFileSync(vaultMdPath, rawMd, "utf-8");
    fs.writeFileSync(vaultHtmlPath, rawHtml, "utf-8");
    console.log(`  Synced to Obsidian Vault:\n    - ${vaultMdPath}\n    - ${vaultHtmlPath}`);
  }

  console.log("\nValuation execution completed successfully!");
}

runINTUValuation().catch(err => {
  console.error("Fatal error running INTU valuation:", err);
  process.exit(1);
});
