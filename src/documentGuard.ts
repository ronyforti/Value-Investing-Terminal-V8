import { AuditCheck, DocumentIntegrityAudit, DocumentIntegrityReport, FileSubstanceIssue, FileSubstanceReport, SessionMode } from "./types.js";

/**
 * Universal Document Integrity Guard for Value Investing Terminal.
 * Audits uploaded, staged, and auto-ingested files to verify they strictly
 * belong to the target company (ticker/CIK/name) and target reporting period
 * (e.g. STRL Q2-26).
 */

export interface ParsedPeriod {
  quarter: "Q1" | "Q2" | "Q3" | "Q4" | "FY" | null;
  year: number | null;
  raw: string;
}

/**
 * Normalizes user and document period strings (e.g. 'Q2-26', 'Q2 2026', '2026-Q2', '2Q26', 'FY2025')
 */
export function parsePeriodString(periodStr: string | null | undefined): ParsedPeriod {
  if (!periodStr || !periodStr.trim()) {
    return { quarter: null, year: null, raw: "" };
  }

  const clean = periodStr.trim();
  let quarter: "Q1" | "Q2" | "Q3" | "Q4" | "FY" | null = null;
  let year: number | null = null;

  // Check for quarter (Q1-Q4)
  const qMatch = clean.match(/(?:Q([1-4])|([1-4])Q)/i);
  if (qMatch) {
    const qNum = qMatch[1] || qMatch[2];
    quarter = `Q${qNum}` as "Q1" | "Q2" | "Q3" | "Q4";
  } else if (/annual|10-k|20-f|40-f|fiscal\s*year|fy/i.test(clean)) {
    quarter = "FY";
  }

  // Check for 4-digit year (e.g. 2026, FY2025) or 2-digit year (e.g. 26, FY25)
  const year4Match = clean.match(/(?:^|\D)(20\d{2}|19\d{2})(?:\D|$)/);
  if (year4Match) {
    year = parseInt(year4Match[1], 10);
  } else {
    // Check for 2-digit year after Q, FY, dash, slash or space, e.g. Q2-26, FY25, Q2'26, 26
    const year2Match = clean.match(/(?:[Q\-_\s/'’]|FY|^)(\d{2})(?:\D|$)/i);
    if (year2Match) {
      const y2 = parseInt(year2Match[1], 10);
      if (y2 >= 0 && y2 <= 99) {
        year = y2 < 70 ? 2000 + y2 : 1900 + y2;
      }
    }
  }

  return { quarter, year, raw: clean };
}

export function formatNormalizedPeriod(parsed: ParsedPeriod): string {
  if (!parsed.year && !parsed.quarter) return parsed.raw || "Unknown Period";
  if (parsed.quarter && parsed.year) {
    return `${parsed.quarter} ${parsed.year}`;
  }
  if (parsed.quarter) return parsed.quarter;
  return String(parsed.year);
}

/**
 * Checks whether newer is exactly 1 sequential quarter ahead of older.
 * E.g., Q2 2026 -> Q3 2026 (true), Q4 2025 -> Q1 2026 (true).
 */
/**
 * Checks whether a collection of staged files represents an interim earnings release session
 * (i.e. Form 8-K Item 2.02 is staged or Transcript is 1 sequential quarter ahead of Form 10-Q).
 */
export function isInterimEarningsRelease(files?: { name: string; auditCategory?: string; category?: string }[]): boolean {
  if (!files || files.length === 0) return false;

  const has8KEarnings = files.some(f => {
    const fn = (f.name || "").toLowerCase();
    return fn.includes("8-k") && (fn.includes("item2.02") || fn.includes("item 2.02") || fn.includes("earnings") || fn.includes("release"));
  });

  const qDoc = files.find(f => f.auditCategory === "10-Q" || f.category === "10-Q" || /10-?q/i.test(f.name));
  const trDoc = files.find(f => f.auditCategory === "Transcript" || f.category === "Transcript" || /transcript|call/i.test(f.name));

  let isTranscriptAhead = false;
  if (qDoc && trDoc) {
    const qPeriod = parsePeriodString(qDoc.name);
    const trPeriod = parsePeriodString(trDoc.name);
    if (qPeriod.quarter && trPeriod.quarter && isSequentialQuarterAhead(formatNormalizedPeriod(qPeriod), formatNormalizedPeriod(trPeriod))) {
      isTranscriptAhead = true;
    }
  }

  return has8KEarnings || isTranscriptAhead;
}

export function isSequentialQuarterAhead(olderStr?: string | null, newerStr?: string | null): boolean {
  if (!olderStr || !newerStr) return false;
  const pOlder = parsePeriodString(olderStr);
  const pNewer = parsePeriodString(newerStr);
  if (!pOlder.quarter || !pNewer.quarter || !pOlder.year || !pNewer.year) return false;
  
  const qOrder = ["Q1", "Q2", "Q3", "Q4"];
  const oldIdx = qOrder.indexOf(pOlder.quarter);
  const newIdx = qOrder.indexOf(pNewer.quarter);
  if (oldIdx === -1 || newIdx === -1) return false;

  if (oldIdx === 3 && newIdx === 0) {
    return pNewer.year === pOlder.year + 1;
  }
  return newIdx === oldIdx + 1 && pNewer.year === pOlder.year;
}

/**
 * Checks if two periods match. Handles FY comparison for annual reports.
 */
export function isPeriodMatch(
  detected: ParsedPeriod,
  target: ParsedPeriod,
  category?: string
): { isMatch: boolean; reason?: string } {
  if (!target.year && !target.quarter) {
    return { isMatch: true }; // Target unspecified
  }

  if (!detected.year && !detected.quarter) {
    return { isMatch: false, reason: "Unable to detect period from document." };
  }

  // Annual Report (10-K / 20-F) & Proxy Statement (DEF 14A) handling:
  // An annual report or proxy statement covers FY. If target is Q4 2025, the proxy may be filed in 2026 (diff = -1).
  const isProxyDoc = category === "DEF 14A" || /def[\s_\-]?14a|proxy/i.test(category || "");
  if (category === "10-K" || isProxyDoc || detected.quarter === "FY") {
    if (detected.year && target.year) {
      const diff = target.year - detected.year;
      // Valid if it's current year (0), preceding year (1), or next calendar year (-1 for off-calendar FY ends / spring proxies)
      if (diff >= -1 && diff <= 1) {
        return { isMatch: true };
      }
      return {
        isMatch: false,
        reason: `${isProxyDoc ? 'Proxy Statement' : 'Annual Report'} is for FY ${detected.year}, which is too distant from target year ${target.year}.`
      };
    }
    return { isMatch: true };
  }

  // For Quarterly documents (10-Q, Transcript, Financials TTM):
  const quarterMatches = !target.quarter || !detected.quarter || target.quarter === detected.quarter;
  const yearMatches = !target.year || !detected.year || target.year === detected.year;

  if (quarterMatches && yearMatches) {
    return { isMatch: true };
  }

  // When target is Q4 or FY, companies do not file a Form 10-Q (Form 10-K is the annual/Q4 filing).
  // Any Form 10-Q is supplemental interim context and should never be flagged as a period mismatch.
  const is10QDoc = category === "10-Q" || /10-?q/i.test(category || "");
  const isQ4OrFyTarget = target.quarter === "Q4" || target.quarter === "FY";
  if (is10QDoc && isQ4OrFyTarget) {
    return { isMatch: true };
  }

  // Form 8-K handling:
  // Form 8-K is a current event report or interim earnings release.
  // Form 8-K handling:
  // Form 8-K is an event-driven Current Report (Item 2.02 earnings releases,
  // material definitive agreements, executive changes, credit facilities). As long as ticker matches,
  // an 8-K is valid supplemental context and must never be flagged as a period mismatch.
  const is8KDoc = category === "8-K" || /8-?k/i.test(category || "");
  if (is8KDoc) {
    return { isMatch: true };
  }

  // Earnings Call Transcript ahead by 1 sequential quarter (Interim Earnings Release window):
  const isTranscriptDoc = category === "Transcript" || /transcript|call|earnings/i.test(category || "");
  if (isTranscriptDoc && isSequentialQuarterAhead(formatNormalizedPeriod(target), formatNormalizedPeriod(detected))) {
    return { isMatch: true };
  }

  const expectedStr = formatNormalizedPeriod(target);
  const detectedStr = formatNormalizedPeriod(detected);
  return {
    isMatch: false,
    reason: `Document period (${detectedStr}) does not match target period (${expectedStr}).`
  };
}

/**
 * Extracts ticker and period from CSV (Financial Statements)
 */
export function extractFromCsv(csvText: string): {
  detectedTicker: string | null;
  detectedPeriod: ParsedPeriod | null;
  latestQuarterDate: string | null;
} {
  let detectedTicker: string | null = null;
  let detectedPeriod: ParsedPeriod | null = null;
  let latestQuarterDate: string | null = null;

  if (!csvText || csvText.length < 20) {
    return { detectedTicker, detectedPeriod, latestQuarterDate };
  }

  const lines = csvText.split(/\r?\n/).slice(0, 30); // scan top metadata rows

  let calendarYearVal: string | null = null;
  let periodVal: string | null = null;
  let periodEndingVal: string | null = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = line.split(",").map(c => c.replace(/^["']|["']$/g, "").trim());
    const key = cells[0]?.toLowerCase().replace(/[\s_\-]+/g, "");

    if (key === "symbol" || key === "ticker") {
      if (cells[1] && cells[1].length > 0 && cells[1] !== "null") {
        detectedTicker = cells[1].toUpperCase();
      }
    } else if (key === "period" || key === "fiscalquarter" || key === "quarter") {
      if (cells[1] && cells[1].length > 0) {
        periodVal = cells[1];
      }
    } else if (key === "calendaryear" || key === "fiscalyear" || key === "year") {
      if (cells[1] && cells[1].length > 0) {
        calendarYearVal = cells[1];
      }
    } else if (key === "periodending" || key === "date") {
      if (cells[1] && cells[1].length > 0) {
        periodEndingVal = cells[1];
      }
    }
  }

  // Construct detected period
  if (periodVal) {
    // If periodVal is already "Q2 2026" or "Q3 2026", parse directly!
    const parsed = parsePeriodString(periodVal);
    if (parsed.quarter && parsed.year) {
      detectedPeriod = parsed;
    } else if (calendarYearVal) {
      detectedPeriod = parsePeriodString(`${periodVal} ${calendarYearVal}`);
    } else {
      detectedPeriod = parsed;
    }
  } else if (periodEndingVal) {
    latestQuarterDate = periodEndingVal;
    // Derive quarter from date e.g. 2026-06-30 or "Jun 27, 2026"
    const dMatch = periodEndingVal.match(/^(\d{4})-(\d{2})/);
    if (dMatch) {
      const y = parseInt(dMatch[1], 10);
      const m = parseInt(dMatch[2], 10);
      let q: "Q1" | "Q2" | "Q3" | "Q4" = "Q4";
      if (m >= 1 && m <= 3) q = "Q1";
      else if (m >= 4 && m <= 6) q = "Q2";
      else if (m >= 7 && m <= 9) q = "Q3";
      detectedPeriod = { quarter: q, year: y, raw: `${q} ${y}` };
    }
  }

  return { detectedTicker, detectedPeriod, latestQuarterDate };
}

/**
 * Extracts ticker and period from SEC markdown/HTML/text
 */
export function extractFromSecText(
  text: string,
  category?: string
): {
  detectedTicker: string | null;
  detectedPeriod: ParsedPeriod | null;
  companyName: string | null;
} {
  let detectedTicker: string | null = null;
  let detectedPeriod: ParsedPeriod | null = null;
  let companyName: string | null = null;

  if (!text || text.length < 50) {
    return { detectedTicker, detectedPeriod, companyName };
  }

  // Inspect first 15,000 characters for header information
  const headerChunk = text.slice(0, 15000);

  // 1. Company Name / Registrant Name
  const nameRegexes = [
    /COMPANY CONFORMED NAME:\s*([^\r\n]+)/i,
    /Exact name of registrant as specified in its charter:\s*([^\r\n]+)/i,
    /REGISTRANT NAME:\s*([^\r\n]+)/i,
    /\*\*Company:\*\*\s*([^\r\n]+)/i,
    /# .*?Report:\s*([A-Za-z0-9\s.,&\-]+)/i
  ];
  for (const reg of nameRegexes) {
    const match = headerChunk.match(reg);
    if (match && match[1]) {
      companyName = match[1].replace(/[*#]/g, "").trim();
      break;
    }
  }

  // 2. Ticker symbol
  const tickerRegexes = [
    /Trading Symbol(?:\(s\))?:\s*([A-Z]{1,5})\b/i,
    /Ticker Symbol:\s*([A-Z]{1,5})\b/i,
    /\(NASDAQ:\s*([A-Z]{1,5})\)/i,
    /\(NYSE:\s*([A-Z]{1,5})\)/i,
    /\(Ticker:\s*([A-Z]{1,5})\)/i
  ];
  for (const reg of tickerRegexes) {
    const match = headerChunk.match(reg);
    if (match && match[1]) {
      detectedTicker = match[1].toUpperCase();
      break;
    }
  }

  // 3. Period / Date
  // Check for explicit metadata Period: **Period:** Q1-27 or **Period:** Q1 2027 or **Reporting Period:** Q1 2027
  const metaExplicitPeriod = headerChunk.match(/\*\*(?:Reporting\s+)?Period(?:\s+of\s+Report)?:\*\*\s*(Q[1-4][_\-\s']*(?:20\d{2}|\d{2})|FY[_\-\s]*(?:20\d{2}|\d{2}))/i) || headerChunk.match(/\*\*Period:\*\*\s*([^\r\n]+)/i);
  if (metaExplicitPeriod) {
    const parsed = parsePeriodString(metaExplicitPeriod[1]);
    if (parsed.quarter || parsed.year) {
      detectedPeriod = parsed;
    }
  }

  // Check for metadata Filing Type: **Filing Type:** 10-Q3 or 10-Q2 or 10-Q1
  const metaFilingType = headerChunk.match(/\*\*Filing Type:\*\*\s*(?:Form\s+)?10-?Q([1-4])\b/i);
  const fyeMatch = headerChunk.match(/\*\*Fiscal Year End:\*\*\s*(\d{2})/i) || headerChunk.match(/Fiscal Year End:\s*(\d{2})/i);

  // Look for SEC quarterly ended text: "For the quarterly period ended June 30, 2026"
  if (!detectedPeriod) {
    const qEndedRegex = /For the quarterly period ended\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(20\d{2})/i;
    const qMatch = headerChunk.match(qEndedRegex);
    if (qMatch) {
      const month = qMatch[1].toLowerCase();
      let year = parseInt(qMatch[3], 10);
      const fyeMonth = fyeMatch ? parseInt(fyeMatch[1], 10) || 12 : 12;
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const reportMonth = monthNames.findIndex(m => month.startsWith(m)) + 1;
      if (reportMonth > 0 && fyeMonth < 12 && reportMonth > fyeMonth) {
        year = year + 1;
      }
      if (metaFilingType) {
        const quarter = `Q${metaFilingType[1]}` as "Q1" | "Q2" | "Q3" | "Q4";
        detectedPeriod = { quarter, year, raw: `${quarter} ${year}` };
      } else if (fyeMatch) {
        if (reportMonth > 0) {
          const diff = (reportMonth - fyeMonth + 12) % 12;
          let quarter: "Q1" | "Q2" | "Q3" | "Q4" = "Q2";
          if (diff >= 2 && diff <= 4) quarter = "Q1";
          else if (diff >= 5 && diff <= 7) quarter = "Q2";
          else if (diff >= 8 && diff <= 10) quarter = "Q3";
          else quarter = "Q4";
          detectedPeriod = { quarter, year, raw: `${quarter} ${year}` };
        }
      } else {
        let quarter: "Q1" | "Q2" | "Q3" | "Q4" = "Q2";
        if (month.includes("mar") || month.includes("apr")) quarter = "Q1";
        else if (month.includes("jun") || month.includes("jul")) quarter = "Q2";
        else if (month.includes("sep") || month.includes("oct")) quarter = "Q3";
        else if (month.includes("dec") || month.includes("jan")) quarter = "Q4";
        detectedPeriod = { quarter, year, raw: `${quarter} ${year}` };
      }
    }
  }

  // Also check if metaFilingType is present without quarterly text
  if (!detectedPeriod && metaFilingType) {
    const periodDateMatch = headerChunk.match(/\*\*Period of Report:\*\*\s*(20\d{2})-(\d{2})/i) || headerChunk.match(/\*\*Period of Report:\*\*\s*(20\d{2})/i) || headerChunk.match(/\*\*Filing Date:\*\*\s*(20\d{2})/i);
    let year = periodDateMatch ? parseInt(periodDateMatch[1], 10) : new Date().getFullYear();
    const rMonth = periodDateMatch && periodDateMatch[2] ? parseInt(periodDateMatch[2], 10) : 0;
    const fyeMonth = fyeMatch ? parseInt(fyeMatch[1], 10) || 12 : 12;
    if (rMonth > 0 && fyeMonth < 12 && rMonth > fyeMonth) {
      year = year + 1;
    }
    const quarter = `Q${metaFilingType[1]}` as "Q1" | "Q2" | "Q3" | "Q4";
    detectedPeriod = { quarter, year, raw: `${quarter} ${year}` };
  }

  // Look for SEC annual ended text: "For the fiscal year ended December 31, 2025"
  if (!detectedPeriod) {
    const fyEndedRegex = /For the fiscal year ended\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(20\d{2})/i;
    const fyMatch = headerChunk.match(fyEndedRegex);
    if (fyMatch) {
      const year = parseInt(fyMatch[3], 10);
      detectedPeriod = { quarter: "FY", year, raw: `FY ${year}` };
    }
  }

  // Look for metadata markdown header (generated by our SEC converter):
  // **Period Date:** 2026-06-30
  if (!detectedPeriod) {
    const metaPeriodMatch = headerChunk.match(/\*\*Period(?: Date)?:\*\*\s*(20\d{2})-(\d{2})/i);
    if (metaPeriodMatch) {
      const year = parseInt(metaPeriodMatch[1], 10);
      const m = parseInt(metaPeriodMatch[2], 10);
      let quarter: "Q1" | "Q2" | "Q3" | "Q4" = "Q4";
      if (m <= 3) quarter = "Q1";
      else if (m <= 6) quarter = "Q2";
      else if (m <= 9) quarter = "Q3";
      detectedPeriod = { quarter, year, raw: `${quarter} ${year}` };
    }
  }

  return { detectedTicker, detectedPeriod, companyName };
}

/**
 * Extracts ticker and period from an Earnings Call Transcript
 */
export function extractFromTranscript(text: string): {
  detectedTicker: string | null;
  detectedPeriod: ParsedPeriod | null;
} {
  let detectedTicker: string | null = null;
  let detectedPeriod: ParsedPeriod | null = null;

  if (!text || text.length < 30) {
    return { detectedTicker, detectedPeriod };
  }

  const topChunk = text.slice(0, 6000);

  // Check transcript header:
  // # Earnings Call Transcript: STRL
  // **Period:** Q2 2026
  const tickerMatch = topChunk.match(/# Earnings Call Transcript:\s*([A-Z0-9.\-]+)/i);
  if (tickerMatch) {
    detectedTicker = tickerMatch[1].toUpperCase();
  }

  const periodMatch = topChunk.match(/\*\*Period:\*\*\s*([^\r\n]+)/i);
  if (periodMatch) {
    detectedPeriod = parsePeriodString(periodMatch[1]);
  }

  // Generic transcript headline regex:
  // "Sterling Infrastructure, Inc. (NASDAQ:STRL) Q2 2026 Earnings Call Transcript"
  if (!detectedPeriod || !detectedTicker) {
    const headlineMatch = topChunk.match(
      /(?:NASDAQ|NYSE):\s*([A-Z]{1,5})[\s\S]*?(Q[1-4]|first|second|third|fourth\s+quarter)[\s\S]*?(20\d{2})/i
    );
    if (headlineMatch) {
      if (!detectedTicker) detectedTicker = headlineMatch[1].toUpperCase();
      if (!detectedPeriod) {
        let qStr = headlineMatch[2].toUpperCase();
        if (/first/i.test(qStr)) qStr = "Q1";
        else if (/second/i.test(qStr)) qStr = "Q2";
        else if (/third/i.test(qStr)) qStr = "Q3";
        else if (/fourth/i.test(qStr)) qStr = "Q4";
        const y = parseInt(headlineMatch[3], 10);
        detectedPeriod = { quarter: qStr as any, year: y, raw: `${qStr} ${y}` };
      }
    }
  }

  return { detectedTicker, detectedPeriod };
}

/**
 * Extracts ticker and period heuristics from filename
 */
export function extractFromFileName(fileName: string): {
  detectedTicker: string | null;
  detectedPeriod: ParsedPeriod | null;
} {
  let detectedTicker: string | null = null;
  let detectedPeriod: ParsedPeriod | null = null;
  const safeFileName = fileName || "";

  // 1. Ticker from prefix: e.g. STRL_10-Q_2026.md, BOUGHT - TICKER Q2-26... or STRL Q2 2026 Transcript.md
  const cleanNameForTicker = safeFileName.replace(/^(?:BOUGHT|SOLD|TRIM|WATCH|HOLD|PORTFOLIO|RESEARCH|ANALYSIS)\s*[-_–]\s*/i, "");
  const prefixMatch = cleanNameForTicker.match(/^([A-Z]{1,5})[_\-\s]/i);
  if (prefixMatch) {
    const candidate = prefixMatch[1].toUpperCase();
    const technical = ["TTM", "CSV", "PDF", "DOC", "FORM", "HELO", "THE", "SEC"];
    if (!technical.includes(candidate)) {
      detectedTicker = candidate;
    }
  }

  // 2. Period from filename
  // Check for 8-K_Item2.02_${qTag}_Earnings_Release
  const item202Match = safeFileName.match(/8-K_Item2\.02_(Q[1-4]|[1-4]Q)[_\-]?(\d{2,4})?_Earnings_Release/i);
  if (item202Match) {
    const qStr = item202Match[1].toUpperCase();
    let yStr = item202Match[2];
    if (!yStr) {
      const dateMatch = safeFileName.match(/_(\d{4})\d{4}(?:_[a-z0-9]+)?\.md$/i);
      if (dateMatch) yStr = dateMatch[1];
    }
    detectedPeriod = parsePeriodString(`${qStr} ${yStr || ''}`.trim());
  } else {
    // Check for 10-Q3_2026 or 10Q2_2025
    const qFilingMatch = safeFileName.match(/10-?Q([1-4])[_\-\s'’]?(20\d{2}|\d{2})/i);
    if (qFilingMatch) {
      const qStr = `Q${qFilingMatch[1]}`;
      const yStr = qFilingMatch[2];
      detectedPeriod = parsePeriodString(`${qStr} ${yStr}`);
    } else {
      // Check for Q1 2026, Q2-26, Q3_2025, 2026_Q2, etc.
      const fnPeriodMatch = safeFileName.match(/(?:^|[_\-\s])(Q[1-4]|[1-4]Q)[_\-\s'’]?(20\d{2}|\d{2})(?:[_\-\s.]|$)/i);
      if (fnPeriodMatch) {
        const qStr = fnPeriodMatch[1].toUpperCase();
        const yStr = fnPeriodMatch[2];
        detectedPeriod = parsePeriodString(`${qStr} ${yStr}`);
      } else {
        // Check for Annual / Year e.g. 10-K_2025
        const annualMatch = safeFileName.match(/(?:10-?k|20-?f|40-?f|def[\s_\-]?14a|proxy|annual)[_\-\s]?(20\d{2})/i);
        if (annualMatch) {
          detectedPeriod = { quarter: "FY", year: parseInt(annualMatch[1], 10), raw: `FY ${annualMatch[1]}` };
        }
      }
    }
  }

  return { detectedTicker, detectedPeriod };
}

/**
 * Audits a single file's integrity against target ticker and period
 */
export function auditFileIntegrity(
  file: {
    name: string;
    content?: string;
    category?: string;
  },
  targetTicker?: string,
  targetPeriod?: string
): DocumentIntegrityAudit {
  const normTargetTicker = targetTicker ? targetTicker.trim().toUpperCase() : "";
  const normTargetPeriod = parsePeriodString(targetPeriod);

  const fnExtract = extractFromFileName(file.name);
  let detectedTicker: string | null = fnExtract.detectedTicker;
  let detectedPeriod: ParsedPeriod | null = fnExtract.detectedPeriod;
  let detectedCompanyName: string | null = null;

  const content = file.content || "";
  const isCsv = file.name.toLowerCase().endsWith(".csv") || file.category === "Financials TTM";
  const isTranscript = file.category === "Transcript" || /transcript|call|earnings/i.test(file.name);
  const isSec = file.category === "10-K" || file.category === "10-Q" || /10-?k|10-?q|20-?f|6-?k/i.test(file.name);

  // Extract from content if available
  if (content && isCsv) {
    const csvData = extractFromCsv(content);
    if (csvData.detectedTicker) detectedTicker = csvData.detectedTicker;
    if (csvData.detectedPeriod) detectedPeriod = csvData.detectedPeriod;
  } else if (content && isTranscript) {
    const trData = extractFromTranscript(content);
    if (trData.detectedTicker) detectedTicker = trData.detectedTicker;
    if (trData.detectedPeriod) detectedPeriod = trData.detectedPeriod;
  } else if (content && isSec) {
    const secData = extractFromSecText(content, file.category);
    if (secData.detectedTicker) detectedTicker = secData.detectedTicker;
    const is8KEarnings = file.category === "8-K" || /item\s*2\.02|earnings_release/i.test(file.name);
    if (is8KEarnings && fnExtract.detectedPeriod?.quarter) {
      // Preserve target quarter parsed from filename qTag for Form 8-K Item 2.02 Earnings Release
      detectedPeriod = fnExtract.detectedPeriod;
    } else if (secData.detectedPeriod) {
      detectedPeriod = secData.detectedPeriod;
    }
    if (secData.companyName) detectedCompanyName = secData.companyName;
  } else if (content) {
    // Fallback: search first 10k chars
    const fallbackSec = extractFromSecText(content);
    if (fallbackSec.detectedTicker) detectedTicker = fallbackSec.detectedTicker;
    if (fallbackSec.detectedPeriod) detectedPeriod = fallbackSec.detectedPeriod;
    if (fallbackSec.companyName) detectedCompanyName = fallbackSec.companyName;
  }

  // Determine Company Match
  let companyMatch: "MATCH" | "MISMATCH" | "UNVERIFIED" = "UNVERIFIED";
  const details: string[] = [];

  if (normTargetTicker) {
    const hasTickerInName = new RegExp(`(^|[\\s_\\-])${normTargetTicker}([\\s_\\-]|$)`, 'i').test(file.name);

    if (detectedTicker === normTargetTicker || hasTickerInName) {
      detectedTicker = normTargetTicker;
      companyMatch = "MATCH";
      details.push(`Company verified: matches target ticker ${normTargetTicker}.`);
    } else if (detectedTicker) {
      companyMatch = "MISMATCH";
      details.push(`Ticker Mismatch: file identified as "${detectedTicker}" instead of target "${normTargetTicker}".`);
    } else if (detectedCompanyName) {
      // If company name was detected, check if it contains target ticker or similar
      const cleanTarget = normTargetTicker.toLowerCase();
      const cleanName = detectedCompanyName.toLowerCase();
      const cleanFileName = file.name.toLowerCase();
      if (cleanName.includes(cleanTarget) || (detectedTicker && cleanName.includes(detectedTicker.toLowerCase())) || (cleanTarget.length >= 3 && cleanFileName.includes(cleanTarget))) {
        companyMatch = "MATCH";
        details.push(`Company verified: name "${detectedCompanyName}" matches target.`);
      } else {
        companyMatch = "UNVERIFIED";
        details.push(`Registrant identified as "${detectedCompanyName}".`);
      }
    } else {
      details.push("Company ticker could not be explicitly confirmed from document headers.");
    }
  }

  // Determine Period Match
  let periodMatch: "MATCH" | "MISMATCH" | "UNVERIFIED" = "UNVERIFIED";
  const safePeriod = (targetPeriod || "").trim();
  const isTargetQ4OrFy = normTargetPeriod.quarter === "Q4" || normTargetPeriod.quarter === "FY" || (Boolean(safePeriod) && (safePeriod.toUpperCase().includes("Q4") || safePeriod.toUpperCase().includes("FY")));
  const is10QFile = file.category === "10-Q" || /10-?q/i.test(file.name) || /10-?q/i.test(file.category || "");
  const isCompetitorRadar = file.name.includes("_Competitor_Radar.md") || file.category === "Competitor Radar";
  const isPriorDossier = file.category === "Prior Dossier" || /prior|complete_doc|slingshot_memo|sentinel_pulse/i.test(file.name);
  const isSupplementaryFile = file.category === "Supplementary" || isCompetitorRadar || isPriorDossier || /bought|prior|thesis|supplementary|article|analysis|impact/i.test(file.name);

  if (isTargetQ4OrFy && is10QFile) {
    periodMatch = "MATCH";
    details.push("Form 10-Q is supplemental interim context for Q4/FY target (Form 10-K covers Q4 & FY).");
  } else if (normTargetPeriod.quarter || normTargetPeriod.year) {
    if (detectedPeriod && (detectedPeriod.quarter || detectedPeriod.year)) {
      const pCheck = isPeriodMatch(detectedPeriod, normTargetPeriod, file.category);
      if (pCheck.isMatch) {
        periodMatch = "MATCH";
        const is8KEarnings = file.category === "8-K" || /item\s*2\.02|earnings_release/i.test(file.name);
        const is8KDoc = file.category === "8-K" || /8-?k/i.test(file.name) || /8-?k/i.test(file.category || "");
        const isTranscriptDoc = file.category === "Transcript" || /transcript|call/i.test(file.name);
        if (is8KEarnings) {
          details.push(`Form 8-K Item 2.02 (Earnings Release) confirmed as interim reporting substitute.`);
        } else if (is8KDoc) {
          details.push(`Form 8-K (Current Report) confirmed as supplemental material event context.`);
        } else if (isTranscriptDoc && isSequentialQuarterAhead(formatNormalizedPeriod(normTargetPeriod), formatNormalizedPeriod(detectedPeriod))) {
          details.push(`Interim earnings call transcript confirmed (${formatNormalizedPeriod(detectedPeriod)} is active release ahead of Form 10-Q).`);
        } else {
          details.push(`Period verified: ${formatNormalizedPeriod(detectedPeriod)} matches target.`);
        }
      } else if (isPriorDossier) {
        periodMatch = "MATCH";
        details.push(`Prior Dossier (${formatNormalizedPeriod(detectedPeriod)}) accepted as baseline context.`);
      } else if (isSupplementaryFile) {
        periodMatch = "MATCH";
        details.push(`Supplementary/historical document (${formatNormalizedPeriod(detectedPeriod)}) accepted as background thesis context.`);
      } else {
        periodMatch = "MISMATCH";
        details.push(pCheck.reason || "Period mismatch detected.");
      }
    } else if (isPriorDossier) {
      periodMatch = "MATCH";
      details.push("Prior Dossier accepted as baseline context without strict reporting period binding.");
    } else if (isSupplementaryFile) {
      periodMatch = "MATCH";
      details.push("Supplementary article/thesis accepted without strict reporting period binding.");
    } else {
      details.push("Fiscal period could not be explicitly confirmed from document headers.");
    }
  }

  return {
    fileName: file.name,
    category: file.category || "Supplementary",
    detectedTicker,
    detectedPeriod: detectedPeriod ? formatNormalizedPeriod(detectedPeriod) : null,
    companyMatch,
    periodMatch,
    details
  };
}

/**
 * Audits full collection of staged files against target ticker and period
 */
export function auditDocumentIntegrity(
  files: Array<{
    name: string;
    content?: string;
    category?: string;
  }>,
  targetTicker?: string,
  targetPeriod?: string
): DocumentIntegrityReport {
  const normTicker = targetTicker ? targetTicker.trim().toUpperCase() : "";
  const normPeriod = targetPeriod ? targetPeriod.trim() : "";

  const fileAudits: Record<string, DocumentIntegrityAudit> = {};
  const mismatches: DocumentIntegrityReport["mismatches"] = [];
  const warnings: DocumentIntegrityReport["warnings"] = [];

  for (const file of files) {
    const audit = auditFileIntegrity(file, normTicker, normPeriod);
    fileAudits[file.name] = audit;

    if (audit.companyMatch === "MISMATCH") {
      if (audit.category !== "Supplementary" && audit.category !== "Competitor Radar") {
        mismatches.push({
          fileName: file.name,
          category: audit.category,
          issue: "Company Mismatch",
          expected: normTicker,
          actual: audit.detectedTicker || "Unknown"
        });
      } else {
        warnings.push({
          fileName: file.name,
          category: audit.category,
          issue: `Supplementary document "${file.name}" detected as "${audit.detectedTicker || 'Unknown'}" instead of target "${normTicker}".`
        });
      }
    }

    if (audit.periodMatch === "MISMATCH") {
      if (audit.category !== "Supplementary" && audit.category !== "Competitor Radar") {
        mismatches.push({
          fileName: file.name,
          category: audit.category,
          issue: "Period Mismatch",
          expected: normPeriod,
          actual: audit.detectedPeriod || "Unknown"
        });
      } else {
        warnings.push({
          fileName: file.name,
          category: audit.category,
          issue: `Supplementary document "${file.name}" has reporting period "${audit.detectedPeriod || 'Unknown'}" differing from target "${normPeriod}".`
        });
      }
    }

    if (audit.companyMatch === "UNVERIFIED" && normTicker) {
      warnings.push({
        fileName: file.name,
        category: audit.category,
        issue: `Could not verify company ticker from headers for "${file.name}".`
      });
    }

    if (audit.periodMatch === "UNVERIFIED" && normPeriod) {
      warnings.push({
        fileName: file.name,
        category: audit.category,
        issue: `Could not verify fiscal reporting period from headers for "${file.name}".`
      });
    }
  }

  // Cross-document alignment check:
  // e.g. If 10-Q detected period differs from Transcript detected period
  const qAudit = Object.values(fileAudits).find(a => a.category === "10-Q");
  const trAudit = Object.values(fileAudits).find(a => a.category === "Transcript");
  const csvAudit = Object.values(fileAudits).find(a => a.category === "Financials TTM");

  const parsedTarget = parsePeriodString(normPeriod);
  const isQ4Target = parsedTarget.quarter === "Q4" || parsedTarget.quarter === "FY" || (Boolean(normPeriod) && (normPeriod.toUpperCase().includes("Q4") || normPeriod.toUpperCase().includes("FY")));

  // In Q4/FY targets, 10-Q is not compared against Q4 transcript or CSV because 10-Q is interim
  if (!isQ4Target && qAudit && trAudit && qAudit.detectedPeriod && trAudit.detectedPeriod) {
    if (qAudit.detectedPeriod !== trAudit.detectedPeriod) {
      if (isSequentialQuarterAhead(qAudit.detectedPeriod, trAudit.detectedPeriod)) {
        warnings.push({
          fileName: `${qAudit.fileName} vs ${trAudit.fileName}`,
          category: "Cross-Document Alignment",
          issue: `Interim Earnings Release State: Staged Transcript (${trAudit.detectedPeriod}) is 1 quarter ahead of Form 10-Q (${qAudit.detectedPeriod}, pending SEC filing).`
        });
      } else {
        mismatches.push({
          fileName: `${qAudit.fileName} vs ${trAudit.fileName}`,
          category: "Cross-Document Alignment",
          issue: "10-Q & Transcript Period Discrepancy",
          expected: qAudit.detectedPeriod,
          actual: trAudit.detectedPeriod
        });
      }
    }
  }

  if (!isQ4Target && qAudit && csvAudit && qAudit.detectedPeriod && csvAudit.detectedPeriod) {
    if (qAudit.detectedPeriod !== csvAudit.detectedPeriod) {
      mismatches.push({
        fileName: `${qAudit.fileName} vs ${csvAudit.fileName}`,
        category: "Cross-Document Alignment",
        issue: "10-Q & Financials CSV Latest Period Discrepancy",
        expected: qAudit.detectedPeriod,
        actual: csvAudit.detectedPeriod
      });
    }
  }

  const hasMismatches = mismatches.length > 0;
  const hasWarnings = warnings.length > 0;
  const allMatch = !hasMismatches && files.length > 0 && Object.values(fileAudits).every(
    a => (a.companyMatch === "MATCH" || a.companyMatch === "UNVERIFIED") &&
         (a.periodMatch === "MATCH" || a.periodMatch === "UNVERIFIED")
  );

  return {
    targetTicker: normTicker,
    targetPeriod: normPeriod,
    allMatch,
    hasMismatches,
    hasWarnings,
    mismatches,
    warnings,
    fileAudits
  };
}

/**
 * Checks an individual file for potential substance issues (truncated dialogue, preview stubs, small files).
 */
export function checkFileSubstance(file: {
  name: string;
  category?: string;
  auditCategory?: string;
  tokens?: number;
  size?: number;
  lineCount?: number;
}): FileSubstanceIssue | null {
  const nameLower = file.name.toLowerCase();
  const category = file.auditCategory || file.category || "";
  const isTranscript = category === "Transcript" || (!nameLower.includes("8-k") && (nameLower.includes("transcript") || nameLower.includes("earnings_call") || (nameLower.includes("call") && !nameLower.includes("recall"))));
  const is10K = category === "10-K" || (!nameLower.includes("8-k") && (nameLower.includes("10-k") || nameLower.includes("10k") || nameLower.includes("20-f") || nameLower.includes("20f") || nameLower.includes("40-f")));
  const is10Q = category === "10-Q" || (!nameLower.includes("8-k") && (nameLower.includes("10-q") || nameLower.includes("10q") || nameLower.includes("6-k") || nameLower.includes("6k")));
  const isProxy = category === "DEF 14A" || nameLower.includes("def_14a") || nameLower.includes("def14a") || nameLower.includes("proxy");
  const isCsv = category === "Financials TTM" || nameLower.endsWith(".csv");

  const tokens = typeof file.tokens === "number" ? file.tokens : 0;
  const size = typeof file.size === "number" ? file.size : 0;

  if (isTranscript) {
    if ((tokens > 0 && tokens < 1000) || (tokens === 0 && size > 0 && size < 10000)) {
      return {
        fileName: file.name,
        category: "Transcript",
        tokens,
        size,
        expectedMinTokens: 1000,
        reason: tokens > 0 
          ? `Transcript contains only ${tokens.toLocaleString()} tokens (expected >= 1,000). Likely an incomplete summary preview or truncated dialogue.`
          : `Transcript file size is only ${Math.round(size / 1024)} KB (< 10 KB). Likely a stub or incomplete dialogue.`
      };
    }
  }

  if (is10K) {
    if ((tokens > 0 && tokens < 2000) || (tokens === 0 && size > 0 && size < 30000)) {
      return {
        fileName: file.name,
        category: "10-K",
        tokens,
        size,
        expectedMinTokens: 2000,
        reason: tokens > 0
          ? `Form 10-K / 20-F contains only ${tokens.toLocaleString()} tokens (expected >= 2,000). May only contain cover/TOC.`
          : `Form 10-K / 20-F file size is only ${Math.round(size / 1024)} KB (< 30 KB).`
      };
    }
  }

  if (is10Q) {
    if (!nameLower.includes("8-k") && !nameLower.includes("item2.02")) {
      if ((tokens > 0 && tokens < 2000) || (tokens === 0 && size > 0 && size < 20000)) {
        return {
          fileName: file.name,
          category: "10-Q",
          tokens,
          size,
          expectedMinTokens: 2000,
          reason: tokens > 0
            ? `Form 10-Q / 6-K contains only ${tokens.toLocaleString()} tokens (expected >= 2,000). May only contain cover/TOC.`
            : `Form 10-Q / 6-K file size is only ${Math.round(size / 1024)} KB (< 20 KB).`
        };
      }
    }
  }

  if (isProxy) {
    if ((tokens > 0 && tokens < 2000) || (tokens === 0 && size > 0 && size < 20000)) {
      return {
        fileName: file.name,
        category: "DEF 14A",
        tokens,
        size,
        expectedMinTokens: 2000,
        reason: tokens > 0
          ? `Proxy statement contains only ${tokens.toLocaleString()} tokens. May be a 1-page notice (DEFA14A) rather than full DEF 14A proxy.`
          : `Proxy statement size is only ${Math.round(size / 1024)} KB.`
      };
    }
  }

  if (isCsv) {
    if ((tokens > 0 && tokens < 100) || (tokens === 0 && size > 0 && size < 500)) {
      return {
        fileName: file.name,
        category: "Financials TTM",
        tokens,
        size,
        expectedMinTokens: 100,
        reason: "Financial statements CSV contains virtually no data."
      };
    }
  }

  const isPriorDossier = category === "Prior Dossier" || nameLower.includes("prior_dossier") || nameLower.includes("complete_doc") || nameLower.includes("slingshot_memo") || nameLower.includes("sentinel_pulse");
  if (isPriorDossier) {
    if ((tokens > 0 && tokens < 500) || (tokens === 0 && size > 0 && size < 2000)) {
      return {
        fileName: file.name,
        category: "Prior Dossier",
        tokens,
        size,
        expectedMinTokens: 500,
        reason: tokens > 0
          ? `Prior Dossier contains only ${tokens.toLocaleString()} tokens (expected >= 500). Incomplete or empty dossier.`
          : `Prior Dossier file size is only ${Math.round(size / 1024)} KB (< 2 KB).`
      };
    }
  }

  return null;
}

/**
 * Audits all staged files for potential substance issues (truncated dialogue, preview stubs).
 */
export function auditFilesSubstance(files: Array<{
  name: string;
  category?: string;
  auditCategory?: string;
  tokens?: number;
  size?: number;
  lineCount?: number;
}>): FileSubstanceReport {
  const issues: FileSubstanceIssue[] = [];
  for (const f of files) {
    const issue = checkFileSubstance(f);
    if (issue) {
      issues.push(issue);
    }
  }
  return {
    hasIssues: issues.length > 0,
    issues
  };
}

/**
 * Detects the standard audit category for a given file name and optional category
 */
export function detectAuditCategory(fileName: string, explicitCategory?: string): string {
  if (explicitCategory && explicitCategory !== "Supplementary") return explicitCategory;
  const fnLower = (fileName || "").toLowerCase();
  if (fnLower.endsWith(".csv") || fnLower.includes("financials") || fnLower.includes("ttm")) {
    return "Financials TTM";
  }
  if (
    fnLower.includes("prior_dossier") ||
    fnLower.includes("prior dossier") ||
    fnLower.includes("complete_doc") ||
    fnLower.includes("complete doc") ||
    fnLower.includes("slingshot_memo") ||
    fnLower.includes("slingshot memo") ||
    fnLower.includes("sentinel_pulse") ||
    fnLower.includes("sentinel pulse") ||
    (fnLower.endsWith(".md") && (fnLower.includes("dossier") || fnLower.includes("memo") || fnLower.includes("pulse")))
  ) {
    return "Prior Dossier";
  }
  if (fnLower.includes("competitor_radar") || fnLower.includes("competitor radar") || fnLower.includes("_competitor_radar")) {
    return "Competitor Radar";
  }
  if (fnLower.includes("8-k") || fnLower.includes("item2.02") || fnLower.includes("item 2.02") || (fnLower.includes("earnings") && (fnLower.includes("release") || fnLower.includes("press")))) {
    return "8-K";
  }
  if (fnLower.includes("transcript") || fnLower.includes("earnings_call") || (fnLower.includes("call") && !fnLower.includes("recall"))) {
    return "Transcript";
  }
  if (fnLower.includes("10-k") || fnLower.includes("10k") || fnLower.includes("20-f") || fnLower.includes("20f") || fnLower.includes("40-f") || fnLower.includes("40f") || fnLower.includes("annual")) {
    return "10-K";
  }
  if (fnLower.includes("10-q") || fnLower.includes("10q") || fnLower.includes("6-k") || fnLower.includes("6k") || fnLower.includes("interim")) {
    return "10-Q";
  }
  if (fnLower.includes("def_14a") || fnLower.includes("def14a") || fnLower.includes("def 14a") || fnLower.includes("proxy")) {
    return "DEF 14A";
  }
  return "Supplementary";
}

export interface RequirementRule {
  key: string;
  label: string;
  description: string;
  synonyms: string[];
  optional?: boolean;
}

export function getRequirementRules(sessionMode?: SessionMode): RequirementRule[] {
  if (sessionMode === "sentinel") {
    return [
      {
        key: "10-Q",
        label: "Quarterly Report (10-Q / 6-K or 8-K)",
        description: "Form 10-Q, Form 6-K Quarterly, or Form 8-K Item 2.02 Interim Earnings Release",
        synonyms: ["10q", "10-q", "quarterly", "interim", "6-k_quarterly", "6k_quarterly", "6-k_interim", "6k_q", "8-k", "8k", "item2.02", "item 2.02"]
      },
      {
        key: "Transcript",
        label: "Earnings Call Transcript",
        description: "Quarterly management earnings call text transcript",
        synonyms: ["transcript", "call", "earnings"]
      },
      {
        key: "Financials TTM",
        label: "Financial Statements (TTM / 40Q Refreshed CSV)",
        description: "40-Quarter historical financials CSV refreshed with latest reported quarter",
        synonyms: ["financials ttm", "ttm", "csv", "financial"]
      },
      {
        key: "Prior Dossier",
        label: "Prior Institutional Dossier",
        description: "Previous complete dossier or Slingshot memo establishing Part 11 baseline and monitoring metrics",
        synonyms: ["prior_dossier", "prior dossier", "complete doc", "complete_doc", "slingshot_memo", "sentinel_pulse", "dossier"]
      },
      {
        key: "10-K",
        label: "Annual Report (10-K / 20-F) [Optional]",
        description: "Form 10-K (Domestic) or Form 20-F (Foreign Private Issuer) - optional baseline in Mode 3 Sentinel",
        synonyms: ["10k", "10-k", "20f", "20-f", "40f", "40-f", "annual"],
        optional: true
      },
      {
        key: "Competitor Radar",
        label: "Competitor Moat & Valuation Radar [Optional]",
        description: "Peer benchmarking and relative multiples - optional in Mode 3 Sentinel",
        synonyms: ["competitor_radar", "competitor radar", "_competitor_radar"],
        optional: true
      }
    ];
  }

  return [
    {
      key: "10-K",
      label: "Annual Report (10-K / 20-F / 40-F)",
      description: "Form 10-K (Domestic) or Form 20-F / 40-F (Foreign Private Issuer)",
      synonyms: ["10k", "10-k", "20f", "20-f", "40f", "40-f", "annual"]
    },
    {
      key: "10-Q",
      label: "Quarterly Report (10-Q / 6-K)",
      description: "Form 10-Q (Domestic) or Form 6-K Quarterly / Interim (Foreign Private Issuer)",
      synonyms: ["10q", "10-q", "quarterly", "interim", "6-k_quarterly", "6k_quarterly", "6-k_interim", "6k_q"]
    },
    {
      key: "Transcript",
      label: "Earnings Call Transcript",
      description: "Quarterly management earnings call text transcript",
      synonyms: ["transcript", "call", "earnings"]
    },
    {
      key: "Financials TTM",
      label: "Financial Statements (TTM / 10-Yr)",
      description: "10-Year historical financials or quarterly statements CSV/Sheets",
      synonyms: ["financials ttm", "ttm", "csv", "financial"]
    },
    {
      key: "Competitor Radar",
      label: "Competitor Moat & Valuation Radar",
      description: "10-K Item 1 + DEF 14A Proxy + Search Grounding + FMP Verification",
      synonyms: ["competitor_radar", "competitor radar", "_competitor_radar"]
    }
  ];
}

export interface RunAuditOptions {
  ticker?: string;
  period?: string;
  sessionMode?: SessionMode;
  competitorRadarMemory?: { hasRadar: boolean; peerCount: number };
  priorDossierMemory?: { hasPrior: boolean; name?: string };
  integrityReport?: DocumentIntegrityReport;
}

export function runAudit(
  files: Array<{
    name: string;
    auditCategory?: string;
    category?: string;
    content?: string;
    tokens?: number;
    size?: number;
    lineCount?: number;
    detectedTicker?: string;
    detectedPeriod?: string;
    companyMatch?: "MATCH" | "MISMATCH" | "UNVERIFIED";
    periodMatch?: "MATCH" | "MISMATCH" | "UNVERIFIED";
    integrityDetails?: string[];
  }>,
  optionsOrTicker?: string | RunAuditOptions,
  period?: string,
  sessionMode?: SessionMode
): { passed: boolean; checklist: AuditCheck[]; integrityReport?: DocumentIntegrityReport } {
  let activeTicker: string | undefined;
  let activePeriod: string | undefined;
  let activeMode: SessionMode | undefined;
  let competitorRadarMemory: { hasRadar: boolean; peerCount: number } | undefined;
  let priorDossierMemory: { hasPrior: boolean; name?: string } | undefined;
  let externalIntegrity: DocumentIntegrityReport | undefined;

  if (typeof optionsOrTicker === "string") {
    activeTicker = optionsOrTicker;
    activePeriod = period;
    activeMode = sessionMode;
  } else if (optionsOrTicker && typeof optionsOrTicker === "object") {
    activeTicker = optionsOrTicker.ticker;
    activePeriod = optionsOrTicker.period;
    activeMode = optionsOrTicker.sessionMode;
    competitorRadarMemory = optionsOrTicker.competitorRadarMemory;
    priorDossierMemory = optionsOrTicker.priorDossierMemory;
    externalIntegrity = optionsOrTicker.integrityReport;
  }

  const normTicker = (activeTicker || "").trim().toUpperCase();
  const normPeriod = (activePeriod || "").trim();
  const parsedTargetPeriod = parsePeriodString(normPeriod);
  const isQ4Target = parsedTargetPeriod.quarter === "Q4" || parsedTargetPeriod.quarter === "FY" || normPeriod.toUpperCase().includes("Q4") || normPeriod.toUpperCase().includes("FY");

  const rules = getRequirementRules(activeMode);
  const checks: AuditCheck[] = [];

  // Generate or use integrity report
  const integrityReport = externalIntegrity || ((normTicker || normPeriod)
    ? auditDocumentIntegrity(files.map(f => ({ name: f.name, content: f.content, category: f.auditCategory || f.category })), normTicker, normPeriod)
    : undefined);

  if (integrityReport) {
    files.forEach(f => {
      const fa = integrityReport.fileAudits[f.name];
      if (fa) {
        f.detectedTicker = fa.detectedTicker || undefined;
        f.detectedPeriod = fa.detectedPeriod || undefined;
        f.companyMatch = fa.companyMatch;
        f.periodMatch = fa.periodMatch;
        f.integrityDetails = fa.details;
      }
    });
  }

  rules.forEach(rule => {
    if (rule.key === "Competitor Radar") {
      const matched = files.filter(f => {
        const fnLower = (f.name || "").toLowerCase();
        return rule.synonyms.some(syn => fnLower.includes(syn));
      });
      const hasRadar = Boolean(matched.length > 0 || competitorRadarMemory?.hasRadar);
      const isConfirmed = hasRadar || Boolean(rule.optional);
      const peerCount = competitorRadarMemory?.peerCount || 0;
      const matchedFilesList = matched.length > 0
        ? matched.map(f => f.name)
        : (competitorRadarMemory?.hasRadar ? [`${normTicker || 'Target'}_Competitor_Radar.md (in-memory)`] : []);

      checks.push({
        category: rule.key,
        label: rule.label,
        description: rule.description,
        isForeignEquivalent: false,
        status: (matched.length > 0 || competitorRadarMemory?.hasRadar) ? "CONFIRMED" : "MISSING",
        matchedFiles: matchedFilesList,
        integrityStatus: hasRadar ? "VALID" : undefined,
        integrityDetails: hasRadar
          ? [`Competitor Moat & Valuation Radar verified with ${peerCount > 0 ? `${peerCount} peers` : "staged dossier"}`]
          : ["Competitor Moat & Valuation Radar not harvested. Peer benchmarking and relative multiples will lack empirical industry grounding."],
        detectedTicker: normTicker || undefined,
        detectedPeriod: normPeriod || undefined,
        isCoveredBy8K: false,
        substanceStatus: hasRadar ? "VALID" : undefined,
        optional: rule.optional
      });
      return;
    }

    if (rule.key === "Prior Dossier") {
      const matched = files.filter(f => {
        const fnLower = (f.name || "").toLowerCase();
        const cat = f.auditCategory || f.category || detectAuditCategory(f.name);
        return cat === "Prior Dossier" || rule.synonyms.some(syn => fnLower.includes(syn));
      });
      const hasPrior = Boolean(matched.length > 0 || priorDossierMemory?.hasPrior);
      const isConfirmed = hasPrior;
      const matchedFilesList = matched.length > 0
        ? matched.map(f => f.name)
        : (priorDossierMemory?.name ? [priorDossierMemory.name] : []);

      checks.push({
        category: rule.key,
        label: rule.label,
        description: rule.description,
        isForeignEquivalent: false,
        status: isConfirmed ? "CONFIRMED" : "MISSING",
        matchedFiles: matchedFilesList,
        integrityStatus: isConfirmed ? "VALID" : undefined,
        integrityDetails: isConfirmed
          ? [`Prior Institutional Dossier baseline located and confirmed for Sentinel pulse tracking.`]
          : ["Prior Institutional Dossier missing. Sentinel mode requires prior dossier baseline to extract Part 11 monitoring metrics."],
        detectedTicker: normTicker || undefined,
        detectedPeriod: normPeriod || undefined,
        isCoveredBy8K: false,
        substanceStatus: matched.map(checkFileSubstance).find(Boolean) ? "TRUNCATED" : (isConfirmed ? "VALID" : undefined),
        substanceReason: matched.map(checkFileSubstance).find(Boolean)?.reason,
        optional: rule.optional
      });
      return;
    }

    const matched = files.filter(f => {
      const fnLower = (f.name || "").toLowerCase();
      if (rule.key === "Transcript" && (fnLower.includes("8-k") || fnLower.includes("item2.02") || (fnLower.includes("earnings") && (fnLower.includes("release") || fnLower.includes("press"))))) {
        const hasTrueTranscript = files.some(other => {
          const otherLower = (other.name || "").toLowerCase();
          return (otherLower.includes("transcript") || otherLower.includes("call")) && !otherLower.includes("8-k") && !otherLower.includes("item2.02");
        });
        if (hasTrueTranscript) return false;
      }
      return rule.synonyms.some(syn => fnLower.includes(syn));
    });

    const isExemptQ4 = rule.key === "10-Q" && isQ4Target;
    const isForeign = matched.some(f => {
      const n = (f.name || "").toLowerCase();
      return n.includes("20-f") || n.includes("20f") || n.includes("40-f") || n.includes("40f") || n.includes("6-k") || n.includes("6k");
    });

    let isCoveredBy8K = false;
    let effectiveMatched = [...matched];

    if (rule.key === "10-Q" && effectiveMatched.length === 0 && !isExemptQ4) {
      const candidate8K = files.find(f => {
        const fnLower = (f.name || "").toLowerCase();
        const is8K = fnLower.includes("8-k") || fnLower.includes("8k") || fnLower.includes("item2.02") || (fnLower.includes("earnings") && (fnLower.includes("release") || fnLower.includes("press")));
        if (!is8K) return false;
        const fa = integrityReport?.fileAudits[f.name];
        if (fa && fa.companyMatch === "MISMATCH") return false;
        return true;
      });

      if (candidate8K) {
        isCoveredBy8K = true;
        effectiveMatched.push(candidate8K);
      }
    }

    let integrityStatus: "VALID" | "WARNING" | "MISMATCH" | undefined = undefined;
    const details: string[] = [];
    let detectedTicker: string | undefined;
    let detectedPeriod: string | undefined;

    if (isExemptQ4) {
      integrityStatus = "VALID";
      details.push("Form 10-K covers Q4 & FY (Form 10-Q is not filed for Q4)");
      detectedPeriod = effectiveMatched.length > 0 ? (detectedPeriod || "Covered by 10-K") : "Covered by 10-K";
      if (effectiveMatched.length > 0 && integrityReport) {
        const matchedAudits = effectiveMatched.map(m => integrityReport.fileAudits[m.name]).filter(Boolean);
        matchedAudits.forEach(a => {
          if (a.detectedTicker) detectedTicker = a.detectedTicker;
          if (a.detectedPeriod) detectedPeriod = a.detectedPeriod;
          details.push(...a.details);
        });
      }
    } else if (isCoveredBy8K) {
      integrityStatus = "VALID";
      details.push("Form 10-Q pending SEC filing; interim quarterly results covered by Form 8-K (Item 2.02 Earnings Release)");
      if (integrityReport && effectiveMatched.length > 0) {
        const matchedAudits = effectiveMatched.map(m => integrityReport.fileAudits[m.name]).filter(Boolean);
        matchedAudits.forEach(a => {
          if (a.detectedTicker) detectedTicker = a.detectedTicker;
          if (a.detectedPeriod) detectedPeriod = a.detectedPeriod;
          details.push(...a.details);
        });
      }
    } else if (integrityReport && effectiveMatched.length > 0) {
      const matchedAudits = effectiveMatched.map(m => integrityReport.fileAudits[m.name]).filter(Boolean);
      const hasMismatch = matchedAudits.some(a => a.companyMatch === "MISMATCH" || a.periodMatch === "MISMATCH");
      const hasUnverified = matchedAudits.some(a => a.companyMatch === "UNVERIFIED" || a.periodMatch === "UNVERIFIED");

      if (hasMismatch) {
        integrityStatus = "MISMATCH";
      } else if (hasUnverified) {
        integrityStatus = "WARNING";
      } else {
        integrityStatus = "VALID";
      }

      matchedAudits.forEach(a => {
        if (a.detectedTicker) detectedTicker = a.detectedTicker;
        if (a.detectedPeriod) detectedPeriod = a.detectedPeriod;
        details.push(...a.details);
      });
    }

    const validMatches = effectiveMatched.filter(m => {
      const audit = integrityReport?.fileAudits[m.name];
      return !audit || audit.companyMatch !== "MISMATCH";
    });

    const isConfirmed = validMatches.length > 0 || isExemptQ4 || isCoveredBy8K || Boolean(rule.optional && matched.length === 0);

    const description = isExemptQ4 && effectiveMatched.length === 0
      ? "Form 10-K covers Q4 & FY (Form 10-Q is not filed for Q4)"
      : isCoveredBy8K
        ? "Form 10-Q pending filing with SEC. Current quarter covered by Form 8-K (Item 2.02 Earnings Release)."
        : rule.description;

    checks.push({
      category: rule.key,
      label: isCoveredBy8K ? "Quarterly Interim (Form 8-K)" : rule.label,
      description,
      isForeignEquivalent: isForeign,
      status: (validMatches.length > 0 || isExemptQ4 || isCoveredBy8K) ? "CONFIRMED" : "MISSING",
      matchedFiles: effectiveMatched.map(f => f.name),
      integrityStatus,
      integrityDetails: details.length > 0 ? Array.from(new Set(details)) : undefined,
      detectedTicker,
      detectedPeriod,
      isCoveredBy8K,
      substanceStatus: effectiveMatched.map(checkFileSubstance).find(Boolean) ? "TRUNCATED" : (effectiveMatched.length > 0 ? "VALID" : undefined),
      substanceReason: effectiveMatched.map(checkFileSubstance).find(Boolean)?.reason,
      optional: rule.optional
    });
  });

  const passed = checks.filter(c => !c.optional).every(c => c.status === "CONFIRMED");
  return { passed, checklist: checks, integrityReport };
}
