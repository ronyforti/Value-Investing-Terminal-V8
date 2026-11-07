import "dotenv/config";
import fs from "fs";
import path from "path";

const STAGING_DIR = "G:/My Drive/Company Data/_STAGING";
const CACHE_DIR = "C:/Users/Ronald/Downloads/Cache/TTM_Output_20260821";
const SEC_USER_AGENT = "Ronald Forti (ronforti@gmail.com)";

if (!fs.existsSync(STAGING_DIR)) {
  fs.mkdirSync(STAGING_DIR, { recursive: true });
}

function cleanSecHtmlToMarkdown(htmlContent: string, filingType: string, metadata: any): string {
  let output = htmlContent;
  
  output = output.replace(/<ix:header[\s\S]*?<\/ix:header>/gi, '');
  output = output.replace(/&lt;\?xml[\s\S]*?\?&gt;/gi, '');
  output = output.replace(/<\?xml[\s\S]*?\?>/gi, '');
  output = output.replace(/&lt;!--[\s\S]*?--&gt;/g, '');
  output = output.replace(/<!--[\s\S]*?-->/g, '');
  output = output.replace(/&lt;\/?grbk-[\s\S]*?&gt;/gi, '');
  output = output.replace(/<\/?grbk-[\s\S]*?>/gi, '');

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
  output = output.replace(/<[^>]*?>/g, '');

  output = output.replace(/&nbsp;/g, ' ');
  output = output.replace(/&#160;/g, ' ');
  output = output.replace(/^[?\s]*xml version=[\s\S]*?\?[?\s]*$/gim, '');
  output = output.replace(/^[a-z0-9]+-[0-9]{8}\s*$/gim, '');
  output = output.replace(/\r/g, '');

  output = output.split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ');

  const fType = (filingType || '').toUpperCase();
  const skipLength = Math.min(output.length * 0.3, 75000);

  if (fType.includes("10-K") || fType.includes("20-F") || fType.includes("40-F") || fType.includes("10-Q")) {
    const searchArea = output.slice(skipLength);
    const cutoffIndex = searchArea.search(/\n(PART\s*III|PART\s*IV|ITEM\s*10\.|ITEM\s*15\.|ITEM\s*18\.|ITEM\s*19\.)\b/gi);
    if (cutoffIndex !== -1) {
      output = output.slice(0, skipLength + cutoffIndex) + "\n\n> [... PART III / ADMINISTRATIVE BOILERPLATE STRIPPED BY VALUE INVESTING TERMINAL ...]\n";
    }
  }

  let prefix = "";
  if (metadata) {
    prefix += `# ${metadata.company || 'Unknown Company'}\n\n`;
    prefix += `**Filing Type:** ${filingType}\n`;
    if (metadata.period) {
      prefix += `**Period:** ${metadata.period}\n`;
    }
    prefix += `**Filing Date:** ${metadata.filed_date || 'N/A'}\n`;
    prefix += `**Period of Report:** ${metadata.period_date || 'N/A'}\n`;
    prefix += `**Fiscal Year End:** ${metadata.fye || 'N/A'}\n`;
    prefix += "===\n\n";
  }

  return prefix + output.trim();
}

async function resolveCik(ticker: string, secUserAgent: string): Promise<string> {
  const cleanTicker = ticker.trim().toUpperCase();
  const url = "https://www.sec.gov/files/company_tickers.json";
  const res = await fetch(url, { headers: { "User-Agent": secUserAgent } });
  if (!res.ok) throw new Error(`SEC company_tickers.json failed: HTTP ${res.status}`);
  const data = await res.json() as any;
  for (const k in data) {
    if (data[k].ticker && data[k].ticker.toUpperCase() === cleanTicker) {
      return String(data[k].cik_str);
    }
  }
  const exchangeUrl = "https://www.sec.gov/files/company_tickers_exchange.json";
  const exRes = await fetch(exchangeUrl, { headers: { "User-Agent": secUserAgent } });
  if (exRes.ok) {
    const exData = await exRes.json() as any;
    if (exData.data && Array.isArray(exData.data)) {
      for (const row of exData.data) {
        if (row[2] && String(row[2]).toUpperCase() === cleanTicker) {
          return String(row[0]);
        }
      }
    }
  }
  throw new Error(`Could not locate SEC CIK identifier for ticker "${cleanTicker}".`);
}

async function fetchEdgarDocumentWithExhibits(
  cikNumber: string,
  accessionNoDashes: string,
  docName: string,
  secUserAgent: string
): Promise<string> {
  const cikInt = parseInt(cikNumber, 10);
  const primaryDocUrl = `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accessionNoDashes}/${docName}`;
  const primaryRes = await fetch(primaryDocUrl, { headers: { "User-Agent": secUserAgent } });
  if (!primaryRes.ok) throw new Error(`Failed fetching primary document: HTTP ${primaryRes.status}`);
  let htmlContent = await primaryRes.text();

  const exhibitMatches = [...htmlContent.matchAll(/href=["']([^"']+\.htm[l]?)/gi)]
    .map(m => m[1].trim())
    .filter(f => !f.startsWith("http") && !f.startsWith("#") && !f.startsWith("/"));

  const uniqueExhibits = Array.from(new Set(exhibitMatches));
  for (const exDoc of uniqueExhibits) {
    const exLower = exDoc.toLowerCase();
    const isFinancialExhibit = exLower.includes("99") || exLower.includes("exhibit") || exLower.includes("epr") || exLower.includes("press") || exLower.includes("results") || htmlContent.length < 30000;
    if (isFinancialExhibit) {
      const exUrl = `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accessionNoDashes}/${exDoc}`;
      try {
        const exRes = await fetch(exUrl, { headers: { "User-Agent": secUserAgent } });
        if (exRes.ok) {
          const exHtml = await exRes.text();
          htmlContent += `\n\n<hr/>\n\n<!-- EXHIBIT ATTACHMENT: ${exDoc} -->\n\n` + exHtml;
        }
      } catch (e) {}
    }
  }
  return htmlContent;
}

let cachedStockAnalysisCookie = "";
let cachedStockAnalysisCookieExpires = 0;

async function loginToStockAnalysis(): Promise<string> {
  const activeEmail = process.env.STOCK_ANALYSIS_EMAIL;
  const activePassword = process.env.STOCK_ANALYSIS_PASSWORD;
  if (!activeEmail || !activePassword) return "";

  if (cachedStockAnalysisCookie && Date.now() < cachedStockAnalysisCookieExpires) {
    return cachedStockAnalysisCookie;
  }

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
  const cookiePairs: string[] = [];
  for (const sc of setCookies) {
    if (sc) cookiePairs.push(sc.split(";")[0].trim());
  }

  if (cookiePairs.length > 0) {
    cachedStockAnalysisCookie = cookiePairs.join("; ");
    cachedStockAnalysisCookieExpires = Date.now() + 6 * 24 * 60 * 60 * 1000;
    return cachedStockAnalysisCookie;
  }
  return "";
}

function cleanTranscriptTextBlock(text: string): string {
  const boilerplateRegexes = [
    /welcome to the.*(earnings|conference call)/i,
    /(quarter|year).*earnings conference call/i,
    /call is being recorded/i,
    /conference is being recorded/i,
    /is being webcast/i,
    /webcast live/i,
    /listen-only mode/i,
    /operator assistance/i,
    /press star zero/i,
    /question and answer session will follow/i,
    /forward-looking statements/i,
    /safe harbor/i,
    /non-gaap/i,
    /reconciliation of/i,
    /disclaimer/i
  ];

  const paragraphs = text.split("\n");
  const cleaned: string[] = [];

  for (let p of paragraphs) {
    let pStr = p.trim();
    if (!pStr) continue;
    let isBoiler = false;
    for (const rx of boilerplateRegexes) {
      if (rx.test(pStr) && pStr.length < 300) {
        isBoiler = true;
        break;
      }
    }
    if (!isBoiler) cleaned.push(pStr);
  }
  return cleaned.join("\n\n").trim();
}

async function fetchTranscript(symbol: string, targetPeriod?: string): Promise<string | null> {
  try {
    const cookie = await loginToStockAnalysis();
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://stockanalysis.com/"
    };
    if (cookie) headers["Cookie"] = cookie;

    const listUrl = `https://stockanalysis.com/stocks/${symbol.toLowerCase()}/transcripts/`;
    const listRes = await fetch(listUrl, { headers });
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

    // If target period provided, find exact match in slugs
    if (targetPeriod) {
      const norm = targetPeriod.toLowerCase().replace(/[^a-z0-9]/g, ""); // e.g. "q226"
      const periodMatch = matches.find(m => {
        const slugNorm = m.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
        return slugNorm.includes(norm);
      });
      if (periodMatch) {
        chosen = periodMatch;
      }
    }

    // Never choose a conference/fireside chat if an actual quarterly earnings call is available
    if (/fireside|summit|conference|agm|annual-meeting/i.test(chosen.slug)) {
      const quarterlyCall = matches.find(m => /q[1-4]/i.test(m.slug) && !/fireside|summit|conference|agm/i.test(m.slug));
      if (quarterlyCall) {
        chosen = quarterlyCall;
      }
    }

    const transcriptUrl = `https://stockanalysis.com${chosen.href}`;
    const trRes = await fetch(transcriptUrl, { headers });
    if (!trRes.ok) return null;
    const trHtml = await trRes.text();

    let bodyText = trHtml;
    const mainMatch = trHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) bodyText = mainMatch[1];

    let plain = bodyText
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

    return cleanTranscriptTextBlock(plain);
  } catch (e) {
    console.warn(`    [Transcript Warning for ${symbol}]:`, e);
    return null;
  }
}

async function stageDocumentsForTicker(ticker: string, targetPeriod?: string) {
  const symbol = ticker.trim().toUpperCase();
  console.log(`\n======================================================================`);
  console.log(`  STAGING TERMINAL DOCUMENTS: ${symbol}${targetPeriod ? ` (${targetPeriod})` : ""}`);
  console.log(`======================================================================`);

  const stagedFiles: string[] = [];

  // 1. Check SEC filings
  try {
    const cik = await resolveCik(symbol, SEC_USER_AGENT);
    const cikPadded = cik.padStart(10, '0');
    const subUrl = `https://data.sec.gov/submissions/CIK${cikPadded}.json`;
    const subRes = await fetch(subUrl, { headers: { "User-Agent": SEC_USER_AGENT } });
    if (!subRes.ok) throw new Error(`EDGAR submissions fetch failed: HTTP ${subRes.status}`);
    const subData = await subRes.json() as any;
    const recent = subData.filings?.recent;

    const hasDomestic10K = recent.form.some((f: string) => f === "10-K" || f === "10-K/A");
    const isFpi = !hasDomestic10K && recent.form.some((f: string) => f === "20-F" || f === "40-F");

    // Annual (10-K / 20-F)
    const annualForms = isFpi ? ["20-F", "40-F", "10-K"] : ["10-K", "10-K/A"];
    let annualItem: any = null;
    for (let i = 0; i < recent.form.length; i++) {
      if (annualForms.includes(recent.form[i])) {
        annualItem = {
          form: recent.form[i],
          accession: recent.accessionNumber[i],
          doc: recent.primaryDocument[i],
          filingDate: recent.filingDate[i],
          reportDate: recent.reportDate[i]
        };
        break;
      }
    }

    if (annualItem) {
      console.log(`  Fetching SEC Annual Report: ${annualItem.form} (${annualItem.filingDate})...`);
      const accClean = annualItem.accession.replace(/-/g, '');
      const rawHtml = await fetchEdgarDocumentWithExhibits(cik, accClean, annualItem.doc, SEC_USER_AGENT);
      const meta = { company: subData.name || symbol, filed_date: annualItem.filingDate, period_date: annualItem.reportDate, fye: subData.fiscalYearEnd };
      const md = cleanSecHtmlToMarkdown(rawHtml, annualItem.form, meta);
      const yearStr = annualItem.reportDate ? annualItem.reportDate.slice(0, 4) : annualItem.filingDate.slice(0, 4);
      const outPath = path.join(STAGING_DIR, `${symbol}_${annualItem.form}_${yearStr}.md`);
      fs.writeFileSync(outPath, md, 'utf-8');
      console.log(`  -> Saved: ${path.basename(outPath)} (${Math.round(md.length / 1024)} KB)`);
      stagedFiles.push(outPath);
      await new Promise(r => setTimeout(r, 400));
    }

    // Quarterly (10-Q / 6-K)
    const isQ4Target = Boolean(targetPeriod && (targetPeriod.toUpperCase().includes("Q4") || targetPeriod.toUpperCase().includes("FY")));
    let quarterlyItem: any = null;
    if (isQ4Target) {
      console.log(`  Target period is ${targetPeriod}: Form 10-K covers Q4 & FY. Skipping Form 10-Q retrieval.`);
    } else if (!isFpi) {
      for (let i = 0; i < recent.form.length; i++) {
        if (recent.form[i] === "10-Q" || recent.form[i] === "10-Q/A") {
          quarterlyItem = {
            form: recent.form[i],
            accession: recent.accessionNumber[i],
            doc: recent.primaryDocument[i],
            filingDate: recent.filingDate[i],
            reportDate: recent.reportDate[i]
          };
          break;
        }
      }
    } else {
      for (let i = 0; i < Math.min(recent.form.length, 30); i++) {
        if (recent.form[i] === "6-K") {
          const doc = (recent.primaryDocument[i] || "").toLowerCase();
          const desc = (recent.primaryDocDescription?.[i] || "").toLowerCase();
          if (doc.includes("results") || doc.includes("earn") || doc.includes("q") || desc.includes("results")) {
            quarterlyItem = {
              form: "6-K_Quarterly",
              accession: recent.accessionNumber[i],
              doc: recent.primaryDocument[i],
              filingDate: recent.filingDate[i],
              reportDate: recent.reportDate[i]
            };
            break;
          }
        }
      }
    }

    if (quarterlyItem) {
      console.log(`  Fetching SEC Quarterly Report: ${quarterlyItem.form} (${quarterlyItem.filingDate})...`);
      const accClean = quarterlyItem.accession.replace(/-/g, '');
      const rawHtml = await fetchEdgarDocumentWithExhibits(cik, accClean, quarterlyItem.doc, SEC_USER_AGENT);
      const meta = { company: subData.name || symbol, filed_date: quarterlyItem.filingDate, period_date: quarterlyItem.reportDate };
      const md = cleanSecHtmlToMarkdown(rawHtml, quarterlyItem.form, meta);
      const yearStr = quarterlyItem.reportDate ? quarterlyItem.reportDate.slice(0, 7).replace('-', '_') : quarterlyItem.filingDate.slice(0, 7).replace('-', '_');
      const outPath = path.join(STAGING_DIR, `${symbol}_${quarterlyItem.form}_${yearStr}.md`);
      fs.writeFileSync(outPath, md, 'utf-8');
      console.log(`  -> Saved: ${path.basename(outPath)} (${Math.round(md.length / 1024)} KB)`);
      stagedFiles.push(outPath);
      await new Promise(r => setTimeout(r, 400));
    }

    // Proxy (DEF 14A)
    let proxyItem: any = null;
    for (let i = 0; i < recent.form.length; i++) {
      if (recent.form[i] === "DEF 14A") {
        proxyItem = {
          form: "DEF 14A",
          accession: recent.accessionNumber[i],
          doc: recent.primaryDocument[i],
          filingDate: recent.filingDate[i],
          reportDate: recent.reportDate[i]
        };
        break;
      }
    }

    if (proxyItem) {
      console.log(`  Fetching SEC Definitive Proxy: ${proxyItem.form} (${proxyItem.filingDate})...`);
      const accClean = proxyItem.accession.replace(/-/g, '');
      const rawHtml = await fetchEdgarDocumentWithExhibits(cik, accClean, proxyItem.doc, SEC_USER_AGENT);
      const meta = { company: subData.name || symbol, filed_date: proxyItem.filingDate, period_date: proxyItem.reportDate };
      const md = cleanSecHtmlToMarkdown(rawHtml, proxyItem.form, meta);
      const yearStr = proxyItem.filingDate ? proxyItem.filingDate.slice(0, 4) : '2026';
      const outPath = path.join(STAGING_DIR, `${symbol}_DEF 14A_${yearStr}.md`);
      fs.writeFileSync(outPath, md, 'utf-8');
      console.log(`  -> Saved: ${path.basename(outPath)} (${Math.round(md.length / 1024)} KB)`);
      stagedFiles.push(outPath);
      await new Promise(r => setTimeout(r, 400));
    }

    // Stage TTM CSV from CACHE_DIR
    if (fs.existsSync(CACHE_DIR)) {
      const cacheCsvs = fs.readdirSync(CACHE_DIR).filter(f => f.startsWith(`${symbol} `) && f.endsWith("- Financials-TTM.csv"));
      if (cacheCsvs.length > 0) {
        const srcPath = path.join(CACHE_DIR, cacheCsvs[0]);
        const destPath = path.join(STAGING_DIR, cacheCsvs[0]);
        fs.copyFileSync(srcPath, destPath);
        console.log(`  -> Staged Financials CSV: ${cacheCsvs[0]}`);
        stagedFiles.push(destPath);
      }
    }

  } catch (err: any) {
    console.warn(`  [SEC Error for ${symbol}]:`, err?.message || err);
  }

  // 2. Transcript
  console.log(`  Fetching latest Earnings Call Transcript from Stock Analysis...`);
  const transcriptText = await fetchTranscript(symbol, targetPeriod);
  if (transcriptText && transcriptText.length > 500) {
    const trPath = path.join(STAGING_DIR, `${symbol}_Earnings_Transcript.txt`);
    fs.writeFileSync(trPath, transcriptText, 'utf-8');
    console.log(`  -> Saved: ${path.basename(trPath)} (${Math.round(transcriptText.length / 1024)} KB)`);
    stagedFiles.push(trPath);
  } else {
    console.log(`  -> No transcript found or could not authenticate to Stock Analysis.`);
  }

  console.log(`  Staging complete for ${symbol}: ${stagedFiles.length} filings prepared.`);
}

async function main() {
  const rawArg = process.argv.find(a => a.startsWith("--tickers="));
  let tickers = ["TTD", "CRUS", "TME", "ADBE", "RMD", "CARG", "DOCU", "INTU"];
  if (rawArg) {
    tickers = rawArg.replace("--tickers=", "").split(",").map(t => t.trim().toUpperCase());
  } else if (process.argv[2] && !process.argv[2].startsWith("--")) {
    tickers = process.argv[2].split(",").map(t => t.trim().toUpperCase());
  }

  console.log(`Starting Value Investing Terminal Batch Staging for ${tickers.length} companies...`);
  console.log(`Target Queue: ${tickers.join(", ")}`);

  const PRESET_TARGETS: Record<string, string> = {
    ADBE: "Q2-26",
    RMD: "Q4-26",
    CARG: "Q2-26",
    DOCU: "Q1-27",
    INTU: "Q3-26",
    TTD: "Q2-26",
    CRUS: "Q1-27",
    TME: "Q2-26"
  };

  for (const t of tickers) {
    const p = PRESET_TARGETS[t];
    await stageDocumentsForTicker(t, p);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n======================================================================`);
  console.log(`  ALL ${tickers.length} COMPANIES STAGED IN _STAGING`);
  console.log(`======================================================================`);
}

main().catch(err => {
  console.error("Batch Staging failed:", err);
  process.exit(1);
});
