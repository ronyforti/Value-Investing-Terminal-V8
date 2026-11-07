import "dotenv/config";
import fs from "fs";
import path from "path";

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
  } else if (fType.includes("DEF 14A") || fType.includes("PROXY")) {
    // Sanitize non-fiduciary shareholder proposals to prevent Gemini API prompt blocks while preserving 100% of executive comp, beneficial ownership, and governance
    const cutoffIndex = output.search(/\n(?:#+\s*)?(?:Proposal\s*(?:Number\s*)?[5-9]:\s*Shareholder\s*Proposal|Shareholder\s*Proposals\s*\n)/i);
    if (cutoffIndex !== -1 && cutoffIndex > 40000) {
      output = output.slice(0, cutoffIndex) + "\n\n> [... NON-FIDUCIARY SHAREHOLDER PROPOSALS STRIPPED BY VALUE INVESTING TERMINAL ...]\n";
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

export async function preStageTicker(ticker: string, period?: string) {
  const clean = ticker.toUpperCase();
  const targetDir = path.resolve("staging", clean);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`\nPre-staging ${clean} into ${targetDir}...`);

  // 1. Copy CSV from CACHE_DIR
  if (fs.existsSync(CACHE_DIR)) {
    const csvMatches = fs.readdirSync(CACHE_DIR).filter(f => f.startsWith(`${clean} `) && f.endsWith("- Financials-TTM.csv"));
    if (csvMatches.length > 0) {
      const dest = path.join(targetDir, csvMatches[0]);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(path.join(CACHE_DIR, csvMatches[0]), dest);
        console.log(`  [CSV] Copied: ${csvMatches[0]}`);
      }
    }
  }

  // 2. SEC Filings
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
          const raw = await fetchEdgarDoc(cik, acc, recent.primaryDocument[annualIdx]);
          const md = cleanSecHtmlToMarkdown(raw, "10-K", { company: subData.name, filed_date: fDate, period_date: rDate });
          fs.writeFileSync(outPath, md, "utf-8");
          console.log(`  [10-K] Saved: ${path.basename(outPath)} (${Math.round(md.length / 1024)} KB)`);
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
          const raw = await fetchEdgarDoc(cik, acc, recent.primaryDocument[qIdx]);
          const md = cleanSecHtmlToMarkdown(raw, "10-Q", { company: subData.name, filed_date: fDate, period_date: rDate });
          fs.writeFileSync(outPath, md, "utf-8");
          console.log(`  [10-Q] Saved: ${path.basename(outPath)} (${Math.round(md.length / 1024)} KB)`);
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
          const raw = await fetchEdgarDoc(cik, acc, recent.primaryDocument[proxyIdx]);
          const md = cleanSecHtmlToMarkdown(raw, "DEF 14A", { company: subData.name, filed_date: fDate });
          fs.writeFileSync(outPath, md, "utf-8");
          console.log(`  [DEF 14A] Saved: ${path.basename(outPath)} (${Math.round(md.length / 1024)} KB)`);
        }
      }
    }
  } catch (err: any) {
    console.warn(`  [Warning]:`, err?.message || err);
  }

  const files = fs.readdirSync(targetDir);
  console.log(`Pre-staging for ${clean} complete: ${files.length} files in staging/${clean}.`);
}

async function main() {
  const queue = ["KNSL", "ADBE", "UBER", "COF", "GRBK", "CALM", "STRL"];
  for (const t of queue) {
    await preStageTicker(t);
    await new Promise(r => setTimeout(r, 1000));
  }
}

if (process.argv[1].includes("stage_all_portfolio")) {
  main().catch(console.error);
}
