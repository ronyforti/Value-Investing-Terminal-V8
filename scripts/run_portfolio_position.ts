import "dotenv/config";
import fs from "fs";
import path from "path";

const SERVER_URL = "http://localhost:3000";
const IS_LOCAL_WINDOWS = fs.existsSync("G:/My Drive");

const GDRIVE_STAGING_DIR = "G:/My Drive/Company Data/_STAGING";
const LOCAL_STAGING_DIR = path.resolve("staging");
const STAGING_DIR = (IS_LOCAL_WINDOWS && fs.existsSync("G:/My Drive/Company Data"))
  ? GDRIVE_STAGING_DIR
  : LOCAL_STAGING_DIR;

const TERMINAL_OUTPUT_DIR = "G:/My Drive/Company Data/GTD_Investing_Journal/GTD_Investment_Latticework_Organized/02 AI_Terminal";
const DIST_DOSSIER_DIR = path.resolve("dist/dossiers");

const CACHE_DIR = "C:/Users/Ronald/Downloads/Cache/TTM_Output_20260821";
const SEC_USER_AGENT = "Ronald Forti (ronforti@gmail.com)";

function cleanSecHtmlToMarkdown(htmlContent: string, filingType: string, metadata: any): string {
  let output = htmlContent;
  output = output.replace(/<ix:header[\s\S]*?<\/ix:header>/gi, '');
  output = output.replace(/&lt;\?xml[\s\S]*?\?&gt;/gi, '');
  output = output.replace(/<\?xml[\s\S]*?\?>/gi, '');
  output = output.replace(/&lt;!--[\s\S]*?--&gt;/g, '');
  output = output.replace(/<!--[\s\S]*?-->/g, '');
  output = output.replace(/<head[\s\S]*?<\/head>/gi, '');
  output = output.replace(/<style[\s\S]*?<\/style>/gi, '');
  output = output.replace(/<script[\s\S]*?<\/script>/gi, '');
  output = output.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  output = output.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  output = output.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  output = output.replace(/<[^>]*?style\s*=\s*['"]\s*display\s*:\s*none[\s\S]*?\/?>[\s\S]*?<\/div>/gi, '');
  output = output.replace(/<\/tr>/gi, '\n');
  output = output.replace(/<tr[^>]*?>/gi, '| ');
  output = output.replace(/<\/td>/gi, ' | ');
  output = output.replace(/<td[^>]*?>/gi, '');
  output = output.replace(/<[^>]+>/g, '');
  output = output.replace(/&nbsp;/g, ' ');
  output = output.replace(/&#160;/g, ' ');
  output = output.replace(/\r/g, '');
  output = output.split('\n').map(line => line.trim()).join('\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ');

  const fType = (filingType || '').toUpperCase();
  const skipLength = Math.min(output.length * 0.3, 75000);
  if (fType.includes("10-K") || fType.includes("20-F") || fType.includes("10-Q")) {
    const searchArea = output.slice(skipLength);
    const cutoffIndex = searchArea.search(/\n(PART\s*III|PART\s*IV|ITEM\s*10\.|ITEM\s*15\.)\b/gi);
    if (cutoffIndex !== -1) {
      output = output.slice(0, skipLength + cutoffIndex) + "\n\n> [... PART III / ADMINISTRATIVE BOILERPLATE STRIPPED BY VALUE INVESTING TERMINAL ...]\n";
    }
  }

  let prefix = "";
  if (metadata) {
    prefix += `# ${metadata.company || 'Unknown Company'}\n\n`;
    prefix += `**Filing Type:** ${filingType}\n`;
    if (metadata.period) prefix += `**Period:** ${metadata.period}\n`;
    prefix += `**Filing Date:** ${metadata.filed_date || 'N/A'}\n`;
    prefix += `**Period of Report:** ${metadata.period_date || 'N/A'}\n`;
    prefix += "===\n\n";
  }
  return prefix + output.trim();
}

async function resolveCik(ticker: string): Promise<string> {
  const cleanTicker = ticker.trim().toUpperCase();
  const res = await fetch("https://www.sec.gov/files/company_tickers.json", { headers: { "User-Agent": SEC_USER_AGENT } });
  if (!res.ok) throw new Error(`SEC company_tickers.json failed: HTTP ${res.status}`);
  const data = await res.json() as any;
  for (const k in data) {
    if (data[k].ticker && data[k].ticker.toUpperCase() === cleanTicker) {
      return String(data[k].cik_str);
    }
  }
  throw new Error(`Could not locate SEC CIK identifier for ticker "${cleanTicker}".`);
}

async function fetchEdgarDoc(cik: string, accessionNoDashes: string, docName: string): Promise<string> {
  const cikInt = parseInt(cik, 10);
  const primaryDocUrl = `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accessionNoDashes}/${docName}`;
  const res = await fetch(primaryDocUrl, { headers: { "User-Agent": SEC_USER_AGENT } });
  if (!res.ok) throw new Error(`Failed fetching primary document: HTTP ${res.status}`);
  let html = await res.text();
  const exhibitMatches = [...html.matchAll(/href=["']([^"']+\.htm[l]?)/gi)]
    .map(m => m[1].trim())
    .filter(f => !f.startsWith("http") && !f.startsWith("#") && !f.startsWith("/"));
  for (const exDoc of Array.from(new Set(exhibitMatches))) {
    const exLower = exDoc.toLowerCase();
    if (exLower.includes("99") || exLower.includes("exhibit") || exLower.includes("press") || exLower.includes("results")) {
      try {
        const exRes = await fetch(`https://www.sec.gov/Archives/edgar/data/${cikInt}/${accessionNoDashes}/${exDoc}`, { headers: { "User-Agent": SEC_USER_AGENT } });
        if (exRes.ok) {
          html += `\n\n<hr/>\n\n<!-- EXHIBIT: ${exDoc} -->\n\n` + await exRes.text();
        }
      } catch {}
    }
  }
  return html;
}

async function fetchTranscriptFromStockAnalysis(ticker: string, period?: string): Promise<string | null> {
  try {
    const activeEmail = process.env.STOCK_ANALYSIS_EMAIL;
    const activePassword = process.env.STOCK_ANALYSIS_PASSWORD;
    let cookie = "";
    if (activeEmail && activePassword) {
      const params = new URLSearchParams();
      params.append("email", activeEmail);
      params.append("password", activePassword);
      const loginRes = await fetch("https://stockanalysis.com/login/?redir=%2F", {
        method: "POST",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": "https://stockanalysis.com/login/",
          "Origin": "https://stockanalysis.com"
        },
        body: params.toString(),
        redirect: "manual"
      });
      const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie")];
      cookie = setCookies.map(sc => sc?.split(";")[0].trim()).filter(Boolean).join("; ");
    }

    const headers: Record<string, string> = { "User-Agent": "Mozilla/5.0", "Referer": "https://stockanalysis.com/" };
    if (cookie) headers["Cookie"] = cookie;

    const listRes = await fetch(`https://stockanalysis.com/stocks/${ticker.toLowerCase()}/transcripts/`, { headers });
    if (!listRes.ok) return null;
    const listHtml = await listRes.text();
    const linkRegex = /<a[^>]*?href\s*=\s*['"](?:https:\/\/stockanalysis\.com)?(\/stocks\/[a-zA-Z0-9\-]+\/transcripts\/([a-zA-Z0-9\-]+)\/?)['"][^>]*?>([\s\S]*?)<\/a>/gi;
    const matches: Array<{ href: string; slug: string }> = [];
    let match;
    while ((match = linkRegex.exec(listHtml)) !== null) {
      matches.push({ href: match[1], slug: match[2] });
    }
    if (matches.length === 0) return null;

    let chosen = matches[0];
    if (period) {
      const norm = period.toLowerCase().replace(/[^a-z0-9]/g, "");
      const found = matches.find(m => m.slug.toLowerCase().replace(/[^a-z0-9]/g, "").includes(norm));
      if (found) chosen = found;
    }

    const trRes = await fetch(`https://stockanalysis.com${chosen.href}`, { headers });
    if (!trRes.ok) return null;
    const trHtml = await trRes.text();
    let body = trHtml;
    const mainMatch = trHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) body = mainMatch[1];
    return body
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n\n### $1\n\n')
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } catch {
    return null;
  }
}

async function ensureTargetStaged(ticker: string, period: string, targetDir: string): Promise<string[]> {
  const clean = ticker.toUpperCase();
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Copy CSV from CACHE_DIR if not present
  if (fs.existsSync(CACHE_DIR)) {
    const csvMatches = fs.readdirSync(CACHE_DIR).filter(f => f.startsWith(`${clean} `) && f.endsWith("- Financials-TTM.csv"));
    if (csvMatches.length > 0) {
      const dest = path.join(targetDir, csvMatches[0]);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(path.join(CACHE_DIR, csvMatches[0]), dest);
        console.log(`  -> Staged CSV from Cache: ${csvMatches[0]}`);
      }
    }
  }

  // 2. Query SEC EDGAR for 10-K, 10-Q, DEF 14A
  try {
    const cik = await resolveCik(clean);
    const subRes = await fetch(`https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`, { headers: { "User-Agent": SEC_USER_AGENT } });
    if (subRes.ok) {
      const subData = await subRes.json() as any;
      const recent = subData.filings?.recent;

      // 10-K
      const annualIdx = recent.form.findIndex((f: string) => f === "10-K" || f === "10-K/A");
      if (annualIdx !== -1) {
        const acc = recent.accessionNumber[annualIdx].replace(/-/g, '');
        const fDate = recent.filingDate[annualIdx];
        const rDate = recent.reportDate[annualIdx];
        const year = rDate ? rDate.slice(0, 4) : fDate.slice(0, 4);
        const outPath = path.join(targetDir, `${clean}_10-K_${year}.md`);
        if (!fs.existsSync(outPath)) {
          console.log(`  -> Fetching SEC 10-K (${fDate})...`);
          const raw = await fetchEdgarDoc(cik, acc, recent.primaryDocument[annualIdx]);
          const md = cleanSecHtmlToMarkdown(raw, "10-K", { company: subData.name, filed_date: fDate, period_date: rDate });
          fs.writeFileSync(outPath, md, "utf-8");
          console.log(`  -> Saved 10-K: ${path.basename(outPath)} (${Math.round(md.length / 1024)} KB)`);
        }
      }

      // 10-Q
      const qIdx = recent.form.findIndex((f: string) => f === "10-Q" || f === "10-Q/A");
      if (qIdx !== -1) {
        const acc = recent.accessionNumber[qIdx].replace(/-/g, '');
        const fDate = recent.filingDate[qIdx];
        const rDate = recent.reportDate[qIdx];
        const qPeriod = rDate ? rDate.slice(0, 7).replace('-', '_') : fDate.slice(0, 7).replace('-', '_');
        const outPath = path.join(targetDir, `${clean}_10-Q_${qPeriod}.md`);
        if (!fs.existsSync(outPath)) {
          console.log(`  -> Fetching SEC 10-Q (${fDate})...`);
          const raw = await fetchEdgarDoc(cik, acc, recent.primaryDocument[qIdx]);
          const md = cleanSecHtmlToMarkdown(raw, "10-Q", { company: subData.name, filed_date: fDate, period_date: rDate });
          fs.writeFileSync(outPath, md, "utf-8");
          console.log(`  -> Saved 10-Q: ${path.basename(outPath)} (${Math.round(md.length / 1024)} KB)`);
        }
      }

      // DEF 14A
      const proxyIdx = recent.form.findIndex((f: string) => f === "DEF 14A");
      if (proxyIdx !== -1) {
        const acc = recent.accessionNumber[proxyIdx].replace(/-/g, '');
        const fDate = recent.filingDate[proxyIdx];
        const year = fDate ? fDate.slice(0, 4) : '2026';
        const outPath = path.join(targetDir, `${clean}_DEF 14A_${year}.md`);
        if (!fs.existsSync(outPath)) {
          console.log(`  -> Fetching SEC DEF 14A Proxy (${fDate})...`);
          const raw = await fetchEdgarDoc(cik, acc, recent.primaryDocument[proxyIdx]);
          const md = cleanSecHtmlToMarkdown(raw, "DEF 14A", { company: subData.name, filed_date: fDate });
          fs.writeFileSync(outPath, md, "utf-8");
          console.log(`  -> Saved DEF 14A: ${path.basename(outPath)} (${Math.round(md.length / 1024)} KB)`);
        }
      }
    }
  } catch (err: any) {
    console.warn(`  [SEC Fetch Warning]:`, err?.message || err);
  }

  // 3. Transcript
  const trOut = path.join(targetDir, `${clean}_Earnings_Transcript.txt`);
  if (!fs.existsSync(trOut)) {
    console.log(`  -> Fetching latest Earnings Call Transcript...`);
    const trText = await fetchTranscriptFromStockAnalysis(clean, period);
    if (trText && trText.length > 500) {
      fs.writeFileSync(trOut, trText, "utf-8");
      console.log(`  -> Saved Transcript: ${path.basename(trOut)} (${Math.round(trText.length / 1024)} KB)`);
    }
  }

  return fs.readdirSync(targetDir).map(f => path.join(targetDir, f));
}

export interface PortfolioTarget {
  ticker: string;
  name: string;
  period: string;
  price: string;
  weight: string;
  costBasis: string;
  notes: string;
}

export const PORTFOLIO_TARGETS: Record<string, PortfolioTarget> = {
  GOOGL: {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    period: "Q2-26",
    price: "320.58",
    weight: "10.90%",
    costBasis: "121.89",
    notes: ""
  },
  KNSL: {
    ticker: "KNSL",
    name: "Kinsale Capital Group, Inc.",
    period: "Q3-26",
    price: "360.66",
    weight: "9.94%",
    costBasis: "311.02",
    notes: ""
  },
  ADBE: {
    ticker: "ADBE",
    name: "Adobe Inc.",
    period: "Q3-26",
    price: "248.36",
    weight: "9.46%",
    costBasis: "203.29",
    notes: ""
  },
  UBER: {
    ticker: "UBER",
    name: "Uber Technologies, Inc.",
    period: "Q2-26",
    price: "65.78",
    weight: "8.28%",
    costBasis: "78.53",
    notes: ""
  },
  COF: {
    ticker: "COF",
    name: "Capital One Financial Corporation",
    period: "Q2-26",
    price: "203.44",
    weight: "8.03%",
    costBasis: "205.23",
    notes: ""
  },
  GRBK: {
    ticker: "GRBK",
    name: "Green Brick Partners, Inc.",
    period: "Q2-26",
    price: "64.08",
    weight: "6.92%",
    costBasis: "65.03",
    notes: ""
  },
  CALM: {
    ticker: "CALM",
    name: "Cal-Maine Foods, Inc.",
    period: "Q1-27",
    price: "62.37",
    weight: "5.90%",
    costBasis: "80.36",
    notes: ""
  },
  STRL: {
    ticker: "STRL",
    name: "Sterling Infrastructure, Inc.",
    period: "Q2-26",
    price: "367.50",
    weight: "4.94%",
    costBasis: "112.77",
    notes: "Historical execution context: Initial invested principal was de-risked by selling 50% of the position at +100% gain. The remaining 4.94% position is held as compounded equity ('house money')."
  }
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv") return "text/csv";
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".json") return "application/json";
  return "text/plain";
}

function findStagedFiles(ticker: string): Array<{ name: string; filePath: string; mimeType: string }> {
  const clean = ticker.toUpperCase();
  const searchDirs = [STAGING_DIR, path.join(LOCAL_STAGING_DIR, clean)];
  const files: Array<{ name: string; filePath: string; mimeType: string }> = [];

  for (const d of searchDirs) {
    if (!fs.existsSync(d)) continue;
    try {
      const entries = fs.readdirSync(d);
      for (const entry of entries) {
        if (entry.toUpperCase().startsWith(clean)) {
          const fullPath = path.join(d, entry);
          if (fs.statSync(fullPath).isFile()) {
            files.push({
              name: entry,
              filePath: fullPath,
              mimeType: getMimeType(fullPath)
            });
          }
        }
      }
    } catch {}
  }

  // Deduplicate by filename
  const seen = new Set<string>();
  const unique: Array<{ name: string; filePath: string; mimeType: string }> = [];
  for (const f of files) {
    if (!seen.has(f.name)) {
      seen.add(f.name);
      unique.push(f);
    }
  }

  return unique;
}

export async function runPortfolioValuation(target: PortfolioTarget, modelArg = "models/gemini-4-argon") {
  const modelShortName = modelArg.replace("models/", "");

  console.log("\n======================================================================");
  console.log(`  LAUNCHING EVALUATION: ${target.ticker} (${target.name})`);
  console.log(`  Period: ${target.period} | Price: $${target.price} | Model: ${modelShortName}`);
  console.log(`  Portfolio Context: Weight: ${target.weight} | Cost Basis: $${target.costBasis}`);
  console.log(`  Notes: ${target.notes}`);
  console.log("======================================================================\n");

  if (!fs.existsSync(DIST_DOSSIER_DIR)) {
    fs.mkdirSync(DIST_DOSSIER_DIR, { recursive: true });
  }

  // 1. Hard Reset terminal state first (Clean Environment Directive)
  console.log(`[Stage 1/5] Resetting terminal session...`);
  await fetch(`${SERVER_URL}/api/session/stop`, { method: "POST" }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  const resetRes = await fetch(`${SERVER_URL}/api/session/hard-reset`, { method: "POST" });
  if (resetRes.ok) {
    console.log("  Session reset cleanly (Clean Environment Directive verified).");
  }

  // 2. Ensure target documents are staged in dedicated staging directory
  const targetDir = path.resolve("staging", target.ticker);
  console.log(`\n[Stage 2/5] Staging authoritative filings for ${target.ticker} in ${targetDir}...`);
  await ensureTargetStaged(target.ticker, target.period, targetDir);

  const stagedEntries = fs.readdirSync(targetDir);
  const stagedFiles: Array<{ name: string; filePath: string; mimeType: string }> = [];
  for (const entry of stagedEntries) {
    const fullPath = path.join(targetDir, entry);
    if (fs.statSync(fullPath).isFile()) {
      stagedFiles.push({
        name: entry,
        filePath: fullPath,
        mimeType: getMimeType(fullPath)
      });
      const stat = fs.statSync(fullPath);
      console.log(`  - ${entry} (${Math.round(stat.size / 1024)} KB)`);
    }
  }

  if (stagedFiles.length < 2) {
    throw new Error(`Insufficient staged filings found for ${target.ticker} in ${targetDir}.`);
  }

  // 3. Initialize Session
  console.log(`\n[Stage 3/5] Initializing session parameters with Portfolio Context...`);
  const initPayload = {
    ticker: target.ticker,
    period: target.period,
    price: target.price,
    model: modelArg,
    pipelineMode: "single",
    serviceTier: "flex", // 50% Flex Tier discount
    executionMode: 3, // Full Auto
    enableCrosscheck: true,
    crosscheckModel: "default",
    portfolio: {
      holdsPosition: true,
      currentWeight: target.weight,
      entryPrice: target.costBasis
    },
    notes: target.notes
  };

  const initRes = await fetch(`${SERVER_URL}/api/session/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(initPayload)
  });

  if (!initRes.ok) {
    throw new Error(`Session init failed: ${await initRes.text()}`);
  }
  console.log(`  Session initialized for ${target.ticker} with portfolio context and Flex Tier.`);

  // 4. Upload Files
  console.log(`\n[Stage 4/5] Ingesting documents into Terminal Engine...`);
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
    console.log(`[OK] (${uploadJson.file?.auditCategory || "Ingested"})`);
  }

  // 4b. Pre-flight Competitor Radar Generation
  console.log(`\n  Executing Pre-flight Competitor Radar Harvester for ${target.ticker}...`);
  try {
    const compRes = await fetch(`${SERVER_URL}/api/competitors/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: target.ticker })
    });
    if (compRes.ok) {
      const compJson = await compRes.json() as any;
      console.log(`  [OK] Competitor Radar generated: ${compJson.dossier?.peers?.length || 0} peers harvested.`);
    } else {
      console.warn(`  [Notice] Competitor radar endpoint returned ${compRes.status}, continuing...`);
    }
  } catch (err: any) {
    console.warn(`  [Notice] Pre-flight competitor harvest skipped:`, err?.message || err);
  }

  // 5. Fire Terminal Execution
  console.log(`\n[Stage 5/5] Launching 12-Step Unified Valuation Pipeline...`);
  let runRes = await fetch(`${SERVER_URL}/api/session/step/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      overrideIntegrityCheck: false,
      overrideMissingFiles: false
    })
  });

  if (!runRes.ok) {
    const errJson = await runRes.clone().json().catch(() => null) as any;
    if (errJson && (errJson.requiresIntegrityConfirmation || errJson.requiresMissingFilesConfirmation)) {
      console.warn(`\n[Pre-Flight Warning] Integrity or missing file alarm detected for ${target.ticker}:`);
      console.warn(`  ↳ ${errJson.error}`);

      // STRIKE 1: Session flush and re-audit
      console.log(`  [Strike 1/2] Attempting automated session purge (/api/session/purge-mismatches)...`);
      await fetch(`${SERVER_URL}/api/session/purge-mismatches`, { method: "POST" }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
      runRes = await fetch(`${SERVER_URL}/api/session/step/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideIntegrityCheck: false, overrideMissingFiles: false })
      });

      if (!runRes.ok) {
        // STRIKE 2: Cooldown & clean re-init
        console.warn(`  [Strike 2/2] Strike 1 did not clear warning. Cooling down 20s before secondary attempt...`);
        await new Promise(r => setTimeout(r, 20000));
        await fetch(`${SERVER_URL}/api/session/hard-reset`, { method: "POST" }).catch(() => {});
        await fetch(`${SERVER_URL}/api/session/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initPayload)
        });
        for (const f of stagedFiles) {
          const fileBuffer = fs.readFileSync(f.filePath);
          await fetch(`${SERVER_URL}/api/upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: f.name,
              data: fileBuffer.toString("base64"),
              mimeType: f.mimeType,
              harmonize: true,
              bypassCurrencyCheck: true
            })
          });
        }
        runRes = await fetch(`${SERVER_URL}/api/session/step/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrideIntegrityCheck: false, overrideMissingFiles: false })
        });
      }
    }
    if (!runRes.ok) {
      throw new Error(`Pre-flight integrity blocked ${target.ticker}: ${await runRes.text()}`);
    }
  }
  console.log("  Valuation pipeline active. Telemetry monitoring engaged...\n");

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
        console.log(`  [${timeStr}] Step ${currentStepIdx + 1}/${totalStepsCount}: ${currentStep.title} -> [${status.toUpperCase()}]`);
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
        body: JSON.stringify({ overrideIntegrityCheck: false, overrideMissingFiles: false })
      });
    } else if (status === "failed") {
      console.warn(`    ↳ Step ${currentStepIdx + 1} marked failed. Retrying...`);
      await new Promise(r => setTimeout(r, 5000));
      await fetch(`${SERVER_URL}/api/session/step/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideIntegrityCheck: false, overrideMissingFiles: false })
      });
    } else if (status === "completed") {
      console.log(`\n======================================================================`);
      console.log(`  ALL ${totalStepsCount} VALUATION STEPS COMPLETED IN ${timeStr}!`);
      console.log(`======================================================================\n`);
      break;
    }
  }

  // Export Markdown & HTML Dossiers
  console.log("Fetching compiled institutional Markdown dossier...");
  const exportMdRes = await fetch(`${SERVER_URL}/api/session/export?ticker=${target.ticker}&period=${target.period}&model=${modelShortName}`);
  const rawMd = await exportMdRes.text();

  console.log("Fetching compiled standalone HTML dossier...");
  const exportHtmlRes = await fetch(`${SERVER_URL}/api/session/export-html?ticker=${target.ticker}&period=${target.period}&model=${modelShortName}`);
  const rawHtml = await exportHtmlRes.text();

  const formattedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
  const mdFilename = `${target.ticker} ${target.period}_Complete Doc_${modelShortName}_${formattedDate}.md`;
  const htmlFilename = `${target.ticker} ${target.period}_Valuation_Dossier_${modelShortName}_${formattedDate}.html`;

  // Write to local dist/dossiers
  const distMdPath = path.join(DIST_DOSSIER_DIR, mdFilename);
  const distHtmlPath = path.join(DIST_DOSSIER_DIR, htmlFilename);
  fs.writeFileSync(distMdPath, rawMd, "utf-8");
  fs.writeFileSync(distHtmlPath, rawHtml, "utf-8");
  console.log(`  Saved Local Markdown: ${distMdPath} (${Math.round(rawMd.length / 1024)} KB)`);
  console.log(`  Saved Local HTML:     ${distHtmlPath} (${Math.round(rawHtml.length / 1024)} KB)`);

  // Write to Terminal Output Directory in Google Drive
  if (fs.existsSync(TERMINAL_OUTPUT_DIR)) {
    const termMdPath = path.join(TERMINAL_OUTPUT_DIR, mdFilename);
    const termHtmlPath = path.join(TERMINAL_OUTPUT_DIR, htmlFilename);
    fs.writeFileSync(termMdPath, rawMd, "utf-8");
    fs.writeFileSync(termHtmlPath, rawHtml, "utf-8");
    console.log(`  Synced to Terminal Output Directory:\n    - ${termMdPath}\n    - ${termHtmlPath}`);
  }


  console.log(`\nValuation for ${target.ticker} completed successfully!`);
}

async function runBatchQueue(targets: PortfolioTarget[]) {
  const queue = [...targets];
  const completed: string[] = [];
  const quarantined: Array<{ ticker: string; period: string; reason: string }> = [];
  const deferredRetries: Record<string, number> = {};
  const MAX_DEFERRED_RETRIES = 1;

  console.log(`\n======================================================================`);
  console.log(`  STARTING ASYNCHRONOUS OVERNIGHT BATCH: ${queue.length} TARGETS`);
  console.log(`  Queue: ${queue.map(t => t.ticker).join(", ")}`);
  console.log(`======================================================================\n`);

  while (queue.length > 0) {
    const target = queue.shift()!;
    const remainingInQueue = queue.length;
    console.log(`\n>>> Processing [${target.ticker}] (${remainingInQueue} remaining in queue) <<<`);

    try {
      await runPortfolioValuation(target);
      completed.push(target.ticker);
      console.log(`\n[Queue Progress] Successfully completed ${target.ticker}. Total completed: ${completed.length}/${targets.length}`);
    } catch (err: any) {
      const isIntegrityBlocked = err.message?.includes("Pre-flight integrity blocked") || err.message?.includes("Insufficient staged filings");
      const retries = deferredRetries[target.ticker] || 0;

      if (isIntegrityBlocked && retries < MAX_DEFERRED_RETRIES && remainingInQueue > 0) {
        deferredRetries[target.ticker] = retries + 1;
        console.warn(`\n⚠️  [NON-BLOCKING DEFERRAL] ${target.ticker} encountered pre-flight integrity alarm.`);
        console.warn(`   ↳ Moving ${target.ticker} to the END OF THE LINE (Deferred Queue).`);
        console.warn(`   ↳ Continuing overnight evaluation with remaining positions...\n`);
        queue.push(target);
      } else {
        console.error(`\n❌ [QUARANTINE] ${target.ticker} parked for human review: ${err.message}`);
        quarantined.push({ ticker: target.ticker, period: target.period, reason: err.message });
      }
    }

    if (queue.length > 0) {
      console.log(`Cooling down 10s before next position...`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  console.log(`\n======================================================================`);
  console.log(`  OVERNIGHT BATCH SUMMARY`);
  console.log(`  Completed (${completed.length}/${targets.length}): ${completed.join(", ") || "None"}`);
  if (quarantined.length > 0) {
    console.log(`  Quarantined for Review (${quarantined.length}):`);
    for (const q of quarantined) {
      console.log(`    - ${q.ticker} (${q.period}): ${q.reason.slice(0, 140)}...`);
    }
  }
  console.log(`======================================================================\n`);
}

async function main() {
  const arg = process.argv[2]?.toUpperCase();
  if (arg && PORTFOLIO_TARGETS[arg]) {
    await runPortfolioValuation(PORTFOLIO_TARGETS[arg]);
  } else if (arg === "--ALL") {
    const tickers = ["GOOGL", "KNSL", "ADBE", "UBER", "COF", "GRBK", "CALM", "STRL"];
    await runBatchQueue(tickers.map(t => PORTFOLIO_TARGETS[t]));
  } else if (arg === "--REMAINING") {
    const tickers = ["KNSL", "ADBE", "UBER", "COF", "GRBK", "CALM", "STRL"];
    await runBatchQueue(tickers.map(t => PORTFOLIO_TARGETS[t]));
  } else if (arg === "--AUDIT-RERUN") {
    const tickers = ["KNSL", "CALM"];
    await runBatchQueue(tickers.map(t => PORTFOLIO_TARGETS[t]));
  } else {
    console.log("Usage: npx tsx scripts/run_portfolio_position.ts <TICKER | --all | --remaining | --audit-rerun>");
    console.log("Available targets:", Object.keys(PORTFOLIO_TARGETS).join(", "));
  }
}

if (process.argv[1].includes("run_portfolio_position")) {
  main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
