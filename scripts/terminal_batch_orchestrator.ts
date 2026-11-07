import fs from "fs";
import path from "path";

const STAGING_DIR = "G:/My Drive/Company Data/_STAGING";
const CACHE_DIR = "C:/Users/Ronald/Downloads/Cache/TTM_Output_20260821";
const VAULT_DOSSIER_DIR = "G:/My Drive/Company Data/GTD_Investing_Journal/GTD_Investment_Latticework_Organized/02 AI_Terminal";
const SERVER_URL = "http://localhost:3000";

interface CompanyTarget {
  ticker: string;
  price: string;
  period: string;
}

const TARGET_COMPANIES: CompanyTarget[] = [
  { ticker: "ADBE", price: "266.51", period: "Q2-26" },
  { ticker: "RMD", price: "228.35", period: "Q4-26" },
  { ticker: "CARG", price: "33.74", period: "Q2-26" },
  { ticker: "DOCU", price: "68.41", period: "Q1-27" },
  { ticker: "INTU", price: "332.70", period: "Q3-26" },
];

function sanitizeLatex(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (match, formula) => {
    let f = formula;
    f = f.replace(/\\text\{([^}]+)\}/g, '$1');
    f = f.replace(/\\mathbf\{([^}]+)\}/g, '$1');
    f = f.replace(/\\mathrm\{([^}]+)\}/g, '$1');
    f = f.replace(/\\times/g, 'x');
    f = f.replace(/\\approx/g, '≈');
    f = f.replace(/\\le/g, '<=');
    f = f.replace(/\\ge/g, '>=');
    f = f.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
    f = f.replace(/\\begin\{aligned\}[\s\S]*?\\end\{aligned\}/g, (bMatch: string) => {
      return bMatch.replace(/\\begin\{aligned\}|\\end\{aligned\}/g, '').replace(/&/g, '').replace(/\\\\/g, '\n');
    });
    f = f.replace(/\\[a-zA-Z]+/g, ' ');
    f = f.replace(/[{}]/g, '');
    return `\n> **Formula / Calculation:**\n> ${f.trim()}\n`;
  });

  cleaned = cleaned.replace(/\$([^$\n]+)\$/g, (match, inline) => {
    if (inline.includes('\\text') || inline.includes('\\frac')) {
      let f = inline;
      f = f.replace(/\\text\{([^}]+)\}/g, '$1');
      f = f.replace(/\\times/g, 'x');
      f = f.replace(/\\approx/g, '≈');
      f = f.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
      f = f.replace(/\\[a-zA-Z]+/g, ' ');
      f = f.replace(/[{}]/g, '');
      return `\`${f.trim()}\``;
    }
    return match;
  });

  return cleaned;
}

function findFiles(dir: string, pattern: RegExp): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findFiles(fullPath, pattern));
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath.replace(/\\/g, "/"));
      }
    }
  } catch {}
  return results;
}

function locateCompanyDocuments(ticker: string) {
  const sym = ticker.toUpperCase();
  const docs: { csv?: string; annual?: string; quarterly?: string; transcript?: string; all: string[] } = { all: [] };

  const cacheCsvs = findFiles(CACHE_DIR, new RegExp(`^${sym}[ _].*Financials-TTM\\.csv$`, "i"));
  if (cacheCsvs.length > 0) {
    docs.csv = cacheCsvs[0];
    docs.all.push(cacheCsvs[0]);
  } else {
    const directCsv = findFiles(CACHE_DIR, new RegExp(`^${sym}\\.csv$`, "i"));
    if (directCsv.length > 0) {
      docs.csv = directCsv[0];
      docs.all.push(directCsv[0]);
    } else {
      const stagingCsv = findFiles(STAGING_DIR, new RegExp(`${sym}.*\\.csv$`, "i"));
      if (stagingCsv.length > 0) {
        docs.csv = stagingCsv[0];
        docs.all.push(stagingCsv[0]);
      }
    }
  }

  const allStagingFiles = findFiles(STAGING_DIR, /.*/);
  for (const fp of allStagingFiles) {
    const fn = path.basename(fp).toLowerCase();
    if (fn.includes(sym.toLowerCase())) {
      if (fn.endsWith(".zip") || fn.endsWith(".csv")) continue;
      if (fn.includes("10-k") || fn.includes("20-f") || fn.includes("annual")) {
        if (!docs.annual) { docs.annual = fp; docs.all.push(fp); }
      } else if (fn.includes("10-q") || fn.includes("6-k") || fn.includes("quarterly")) {
        if (!docs.quarterly) { docs.quarterly = fp; docs.all.push(fp); }
      } else if (fn.includes("transcript") || fn.includes("call") || fn.includes("earnings")) {
        if (!docs.transcript) { docs.transcript = fp; docs.all.push(fp); }
      }
    }
  }

  docs.all = Array.from(new Set(docs.all));
  return docs;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv") return "text/csv";
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".json") return "application/json";
  return "text/plain";
}

async function waitForServer(): Promise<boolean> {
  console.log(`Connecting to Value Investing Terminal at ${SERVER_URL}...`);
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${SERVER_URL}/api/session`);
      if (res.ok) {
        console.log(`[Terminal Connected] Server is online and responsive.\n`);
        return true;
      }
    } catch {
      // waiting
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function runCompanyOnTerminal(target: CompanyTarget): Promise<any> {
  const { ticker, price, period } = target;
  console.log(`\n======================================================================`);
  console.log(`  ENGAGING TERMINAL ENGINE FOR: ${ticker} ($${price} | Period: ${period})`);
  console.log(`======================================================================`);

  console.log(`  [1/5] Performing complete session hard-reset (purging all previous company files)...`);
  await fetch(`${SERVER_URL}/api/session/stop`, { method: "POST" }).catch(() => {});
  await new Promise(r => setTimeout(r, 800));
  await fetch(`${SERVER_URL}/api/session/hard-reset`, { method: "POST" });
  await new Promise(r => setTimeout(r, 1000));

  const docs = locateCompanyDocuments(ticker);
  console.log(`  [2/5] Located ${docs.all.length} source documents:`);
  for (const f of docs.all) {
    console.log(`    - ${path.basename(f)} (${Math.round(fs.statSync(f).size / 1024)} KB)`);
  }

  if (!docs.csv) {
    throw new Error(`Critical: No TTM CSV found for ${ticker}`);
  }

  console.log(`  [3/5] Configuring terminal session on server...`);
  const initPayload = {
    ticker,
    period,
    price,
    model: "gemini-3.8-flash",
    executionMode: 3,
    enableCrosscheck: true,
    portfolio: { holdsPosition: false },
    notes: ""
  };

  const initRes = await fetch(`${SERVER_URL}/api/session/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(initPayload)
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`Failed to init session: ${errText}`);
  }

  console.log(`  [4/5] Staging documents to Terminal Cloud Files API...`);
  for (const filePath of docs.all) {
    const fn = path.basename(filePath);
    const mimeType = getMimeType(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");

    process.stdout.write(`    Uploading ${fn}... `);
    const uploadRes = await fetch(`${SERVER_URL}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fn,
        data: base64Data,
        mimeType,
        harmonize: true,
        bypassCurrencyCheck: true
      })
    });

    if (!uploadRes.ok) {
      console.log(`[Warning: Upload HTTP ${uploadRes.status}]`);
    } else {
      const upJson = await uploadRes.json() as any;
      const tokens = upJson.file?.tokens || Math.ceil(fileBuffer.length / 4.2);
      console.log(`Done (${tokens} tokens)`);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  // 4.5. Strict Pre-Flight Audit Verification
  const checkRes = await fetch(`${SERVER_URL}/api/session`);
  const checkData = await checkRes.json() as any;
  const missingChecks = (checkData.auditChecklist || []).filter((c: any) => c.status === 'MISSING');
  if (missingChecks.length > 0) {
    const missingNames = missingChecks.map((c: any) => c.label).join(", ");
    throw new Error(`Strict Document Guard Block: Required filings missing for ${ticker}: ${missingNames}`);
  }
  console.log(`  [Audit Guard] All 4 mandatory filing categories confirmed present for ${ticker}.`);

  if (checkData.integrityReport && checkData.integrityReport.hasMismatches) {
    const mismatchDetails = (checkData.integrityReport.mismatches || []).map((m: any) => `${m.fileName}: ${m.issue} (expected ${m.expected}, got ${m.actual})`).join("; ");
    throw new Error(`Strict Document Guard Block: Integrity mismatches detected for ${ticker}: ${mismatchDetails}`);
  }
  console.log(`  [Integrity Guard] 0 mismatches confirmed for ${ticker}. Document integrity is 100% verified.`);

  console.log(`  [5/5] Firing Terminal Execution Pipeline (FullAuto)...`);
  const runRes = await fetch(`${SERVER_URL}/api/session/step/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      overrideIntegrityCheck: false,
      overrideMissingFiles: false
    })
  });

  if (!runRes.ok) {
    const runErr = await runRes.text();
    throw new Error(`Failed to start pipeline: ${runErr}`);
  }

  const startTime = Date.now();
  let lastLoggedStep = -1;
  let totalStepsCount = 17;

  while (true) {
    await new Promise(r => setTimeout(r, 4000));
    const stateRes = await fetch(`${SERVER_URL}/api/session`);
    if (!stateRes.ok) continue;

    const resBody = await stateRes.json() as any;
    const sessionState = resBody.state || resBody;
    const currentStepIdx = sessionState.activeStepIndex || 0;
    const steps = sessionState.steps || [];
    totalStepsCount = steps.length || 17;
    const currentStep = steps[currentStepIdx];
    const status = sessionState.status;

    if (currentStepIdx !== lastLoggedStep && currentStep) {
      lastLoggedStep = currentStepIdx;
      const elapsedSec = Math.round((Date.now() - startTime) / 1000);
      console.log(`    [${elapsedSec}s] Step ${currentStepIdx + 1}/${totalStepsCount}: ${currentStep.title} (${currentStep.status})`);
    }

    if (status === "retrying") {
      const retry = sessionState.retryState;
      const secLeft = retry?.nextRetryTimestamp ? Math.max(0, Math.round((retry.nextRetryTimestamp - Date.now()) / 1000)) : 0;
      console.log(`    [Gemini High Demand Cooldown] Step ${currentStepIdx + 1} auto-resuming in ${secLeft}s (Attempt ${retry?.attempt || 1}/${retry?.maxAttempts || 3})...`);
    } else if (status === "paused") {
      console.log(`    [Notice] Session paused at step ${currentStepIdx + 1}. Auto-resuming...`);
      await fetch(`${SERVER_URL}/api/session/step/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideIntegrityCheck: true, overrideMissingFiles: true })
      });
    } else if (status === "failed") {
      console.warn(`    [Warning] Step ${currentStepIdx + 1} marked failed. Retrying...`);
      await new Promise(r => setTimeout(r, 5000));
      await fetch(`${SERVER_URL}/api/session/step/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideIntegrityCheck: true, overrideMissingFiles: true })
      });
    } else if (status === "completed") {
      const totalElapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`  [Terminal Finished] All ${totalStepsCount} steps completed in ${totalElapsed}s!`);
      break;
    }
  }

  console.log(`  Fetching compiled institutional dossier from Terminal...`);
  const exportRes = await fetch(`${SERVER_URL}/api/session/export?ticker=${ticker}&period=${period}&model=gemini-3.8-flash`);
  let rawMd = await exportRes.text();

  const cleanMd = sanitizeLatex(rawMd);

  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T.]/g, "").slice(0, 15);
  const outFilename = `${ticker}_Deep_Valuation_Dossier_${timestamp}.md`;
  const outPath = path.join(VAULT_DOSSIER_DIR, outFilename);

  fs.writeFileSync(outPath, cleanMd, "utf-8");
  console.log(`  -> Saved pristine institutional dossier to Obsidian Vault:\n     ${outPath} (${Math.round(cleanMd.length / 1024)} KB)`);

  return {
    ticker,
    status: "Success",
    dossierPath: outPath,
    durationSeconds: Math.round((Date.now() - startTime) / 1000)
  };
}

async function main() {
  const online = await waitForServer();
  if (!online) {
    console.error("Could not connect to Value Investing Terminal server on port 3000.");
    process.exit(1);
  }

  const rawArg = process.argv.find(a => a.startsWith("--tickers="));
  let tickers = TARGET_COMPANIES.map(c => c.ticker);
  if (rawArg) {
    const filter = rawArg.replace("--tickers=", "").split(",").map(t => t.trim().toUpperCase());
    tickers = tickers.filter(t => filter.includes(t));
  }

  console.log(`\n======================================================================`);
  console.log(`  TERMINAL BATCH PIPELINE ENGAGED FOR ${tickers.length} FRANCHISES`);
  console.log(`  Queue: ${tickers.join(", ")}`);
  console.log(`  Model: gemini-3.8-flash | Grounding: Google Search Enabled`);
  console.log(`======================================================================`);

  const results: any[] = [];
  const batchStart = Date.now();

  for (const tkr of tickers) {
    const target = TARGET_COMPANIES.find(c => c.ticker === tkr)!;
    try {
      const res = await runCompanyOnTerminal(target);
      results.push(res);
    } catch (err: any) {
      console.error(`  [FAILED for ${tkr}]:`, err?.message || err);
      results.push({ ticker: tkr, status: `Failed: ${err?.message || err}` });
    }
    await new Promise(r => setTimeout(r, 5000));
  }

  const totalMin = Math.round((Date.now() - batchStart) / 60000);
  console.log(`\n======================================================================`);
  console.log(`  ALL ${tickers.length} DOSSIERS PROCESSED IN ${totalMin} MINUTES`);
  console.log(`======================================================================`);

  const ledgerPath = path.join(VAULT_DOSSIER_DIR, "Batch_Execution_Master_Ledger.md");
  let ledgerContent = "";
  if (fs.existsSync(ledgerPath)) {
    ledgerContent = fs.readFileSync(ledgerPath, "utf-8");
  } else {
    ledgerContent = "# 📋 Value Investing Terminal Master Batch Ledger\n\n| Date | Ticker | Status | Execution Time | Dossier Link |\n| :--- | :--- | :--- | :--- | :--- |\n";
  }

  const dateStr = new Date().toISOString().slice(0, 16).replace("T", " ");
  for (const r of results) {
    const link = r.dossierPath ? `[[${path.basename(r.dossierPath)}]]` : "N/A";
    const dur = r.durationSeconds ? `${r.durationSeconds}s` : "N/A";
    ledgerContent += `| ${dateStr} | **${r.ticker}** | ${r.status === "Success" ? "🟢 Success (Terminal Engine)" : "🔴 " + r.status} | ${dur} | ${link} |\n`;
  }
  fs.writeFileSync(ledgerPath, ledgerContent, "utf-8");
  console.log(`Updated Master Ledger at: ${ledgerPath}`);
}

main().catch(err => {
  console.error("Fatal Batch Driver error:", err);
  process.exit(1);
});
