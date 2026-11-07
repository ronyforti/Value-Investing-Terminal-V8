/**
 * Surgical Competitor & Proxy Parser
 * Isolates high-signal peer groups, executive incentive alignment, and cross-call transcript mentions
 * without flooding the LLM context window with 100+ pages of boilerplate.
 */

export interface SurgicalProxyExtract {
  rawExcerpt: string;
  peerGroupMentions: string[];
  incentiveKpis: string[];
  ceoOwnershipMention?: string;
  foundSection: boolean;
}

export interface TranscriptMentionMatch {
  speaker: string;
  text: string;
  matchedTerm: string;
}

/**
 * Surgically extracts the Item 1 Competition disclosure from a Form 10-K or Form 20-F.
 * Management explicitly names their direct operational competitors and industry structure here.
 */
export function extract10KCompetitionSection(tenKText: string): string {
  if (!tenKText || tenKText.length < 1000) return "";

  // 1. Isolate Item 1 (Business) boundary to avoid Table of Contents or subsequent unrelated sections
  const item1Idx = tenKText.search(/(?:^|[|\n#*>\s])ITEM\s+1\.?\s+BUSINESS\b/i);
  const searchStart = item1Idx !== -1 ? item1Idx : 0;
  const item1AIdx = tenKText.search(/(?:^|[|\n#*>\s])ITEM\s+1A\.?\s+RISK\s+FACTORS\b/i);
  const searchEnd = item1AIdx > searchStart ? item1AIdx : Math.min(tenKText.length, searchStart + 160000);
  const item1Corpus = tenKText.slice(searchStart, searchEnd);

  // Strategy A: Targeted phrases where management enumerates rivals (highest signal)
  const phraseRegex = /\b(?:(?:our\s+)?(?:primary|principal|main)\s+competitors\b|\bcompetitors\s+(?:in\s+[^.,;\n]+)?include\b|\bwe\s+compete\s+(?:primarily|directly)\s+with\b)/i;
  const phraseMatch = item1Corpus.search(phraseRegex);
  if (phraseMatch !== -1) {
    const start = Math.max(0, phraseMatch - 400);
    const rawSnippet = item1Corpus.slice(start, start + 3500);
    return formatCompetitionExtract(rawSnippet);
  }

  // Strategy B: "Competition" section header inside Item 1
  const compHeaderRegex = /(?:^|[|\n#*>\s])(?:COMPETITION|Competitive\s+Conditions|Competitive\s+Landscape|Competition\s+and\s+Markets)(?:\b|(?=[A-Z]))/i;
  const headerMatch = item1Corpus.search(compHeaderRegex);
  if (headerMatch !== -1) {
    const rawSnippet = item1Corpus.slice(headerMatch, headerMatch + 3500);
    return formatCompetitionExtract(rawSnippet);
  }

  // Strategy C: Global search in entire 10-K for competitor enumeration phrase
  const globalPhrase = tenKText.search(phraseRegex);
  if (globalPhrase !== -1) {
    const start = Math.max(0, globalPhrase - 400);
    const rawSnippet = tenKText.slice(start, start + 3500);
    return formatCompetitionExtract(rawSnippet);
  }

  return "";
}

function formatCompetitionExtract(rawText: string): string {
  const cleaned = rawText
    .replace(/&amp;/g, '&')
    .replace(/&#8226;/g, '•')
    .replace(/&#\d+;/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return `### Form 10-K / 20-F Item 1 Competition Extract\n\n> ${cleaned.slice(0, 2500)}\n\n`;
}

/**
 * Surgically extracts the CD&A Compensation Peer Group, Incentive KPIs, and Ownership from DEF 14A or 20-F.
 */
export function extractSurgicalProxy(proxyText: string): SurgicalProxyExtract {
  if (!proxyText || proxyText.length < 500) {
    return {
      rawExcerpt: "No valid proxy text provided.",
      peerGroupMentions: [],
      incentiveKpis: [],
      foundSection: false
    };
  }

  const result: SurgicalProxyExtract = {
    rawExcerpt: "",
    peerGroupMentions: [],
    incentiveKpis: [],
    foundSection: false
  };

  // 1. Locate CD&A / Compensation Section
  const cdaMatch = proxyText.search(/\b(COMPENSATION DISCUSSION AND ANALYSIS|EXECUTIVE COMPENSATION|CD&A|DIRECTORS' REMUNERATION REPORT)\b/i);
  const searchCorpus = cdaMatch !== -1 ? proxyText.slice(cdaMatch, cdaMatch + 120000) : proxyText;

  // 2. Locate Peer Group Section - Skip Pay-Versus-Performance and PvP TSR tables
  const peerHeaderRegex = /\b(PEER GROUP|BENCHMARKING PEER GROUP|COMPENSATION PEER GROUP|COMPETITIVE PEER GROUP|PEER COMPANIES|COMPARATOR GROUP)\b/gi;
  
  let bestPeerSnippet = "";
  let headerMatch: RegExpExecArray | null;

  while ((headerMatch = peerHeaderRegex.exec(searchCorpus)) !== null) {
    const startIdx = Math.max(0, headerMatch.index - 200);
    const candidateSnippet = searchCorpus.slice(startIdx, startIdx + 3500);

    // Skip Pay-Versus-Performance tables (PvP) which contain compensation headers like CAP, PEO, SCT
    const isPvpTable = /pay\s+versus\s+performance/i.test(candidateSnippet) || 
                       /compensation\s+actually\s+paid/i.test(candidateSnippet) ||
                       /summary\s+compensation\s+table\s+total\s+for\s+peo/i.test(candidateSnippet);

    if (!isPvpTable) {
      bestPeerSnippet = candidateSnippet;
      result.foundSection = true;
      break;
    } else if (!bestPeerSnippet) {
      // Keep as weak fallback if no pure CD&A peer group exists (e.g. index benchmark mentions)
      bestPeerSnippet = candidateSnippet;
    }
  }

  if (bestPeerSnippet) {
    // Look for company names or tickers listed in bullets, commas, or parentheses
    const tickerMatches = bestPeerSnippet.match(/\b([A-Z]{1,5})\b(?=[\s,\)\]])/g) || [];
    
    // Comprehensive acronym blacklist: excludes SEC compensation metrics, roles, and common corporate words
    const bannedAcronyms = new Set([
      "THE", "AND", "FOR", "INC", "CORP", "LTD", "LLC", "OUR", "NEW", "SEC", "CEO", "CFO", "COO", "CTO", "CIO",
      "TSR", "EPS", "GAAP", "NON", "S&P", "NET", "REV", "PEO", "NEO", "CAP", "SCT", "LTIP", "STIP", "PSU", "RSU",
      "ROIC", "ROE", "ROA", "EBITDA", "EBIT", "CAGR", "NYSE", "NASDAQ", "PCAOB", "KPMG", "PWC", "EY", "BROAD",
      "COMP", "PEER", "BASE", "CASH", "FORM", "ITEM", "NOTE", "TOTAL", "INDEX", "GROUP", "VALUE", "STOCK",
      "SHARE", "AWARD", "PLAN", "TARGET", "BENCHMARK", "TABLE", "YEAR", "RATE", "HIGH", "LOW", "AVG", "US", "USA"
    ]);

    // Filter reasonable ticker candidates
    const candidateTickers = tickerMatches
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length >= 2 && t.length <= 5 && !bannedAcronyms.has(t));

    result.peerGroupMentions = Array.from(new Set(candidateTickers)).slice(0, 25);
  }

  // 3. Locate Incentive Plan KPIs (ROIC vs. Revenue vs. TSR)
  const kpiRegex = /\b(ROIC|RETURN ON INVESTED CAPITAL|TSR|TOTAL SHAREHOLDER RETURN|REVENUE|ORGANIC REVENUE|ADJUSTED EBITDA|OPERATING INCOME|FREE CASH FLOW)\b/gi;
  const kpiMatches = searchCorpus.slice(0, 40000).match(kpiRegex) || [];
  const normalizedKpis = Array.from(new Set(kpiMatches.map(k => k.toUpperCase())));
  result.incentiveKpis = normalizedKpis.slice(0, 8);

  // 4. Locate Beneficial Ownership of CEO/Board
  const ownRegex = /\b(beneficial ownership|security ownership of management|named executive officers as a group)\b[\s\S]{0,1500}?\b([0-9]{1,2}\.[0-9]{1,2}%|\b[0-9]{1,3}%\b)/i;
  const ownMatch = proxyText.match(ownRegex);
  if (ownMatch) {
    result.ceoOwnershipMention = ownMatch[0].replace(/\s+/g, ' ').slice(0, 300);
  }

  // Compile a surgical markdown extract (< 1,000 tokens)
  let excerpt = `### DEF 14A / Remuneration Surgical Extract\n\n`;
  if (bestPeerSnippet) {
    excerpt += `**Disclosed Peer Benchmarking Context:**\n> ${bestPeerSnippet.slice(0, 1500).replace(/\n\s*\n/g, '\n> ')}\n\n`;
  } else {
    excerpt += `*Note: Explicit CD&A peer group table not isolated in text extract.*\n\n`;
  }

  if (result.incentiveKpis.length > 0) {
    excerpt += `**Incentive KPIs Identified in CD&A:** ${result.incentiveKpis.join(', ')}\n\n`;
  }

  if (result.ceoOwnershipMention) {
    excerpt += `**Executive Ownership Alignment:**\n> ${result.ceoOwnershipMention}\n\n`;
  }

  result.rawExcerpt = excerpt;
  return result;
}

/**
 * Checks for mentions of the target company in a competitor's earnings call transcript.
 * Implements compound entity disambiguation to avoid false positives on words like "Target" or "Block".
 */
export function scanTranscriptForTargetMentions(
  transcriptText: string,
  targetTicker: string,
  targetCompanyName: string,
  flagshipKeywords: string[] = []
): TranscriptMentionMatch[] {
  if (!transcriptText || transcriptText.length < 500) return [];

  const matches: TranscriptMentionMatch[] = [];
  const tickerUpper = (targetTicker || '').trim().toUpperCase();
  const companyClean = (targetCompanyName || '').trim().replace(/,\s*(Inc\.|Corp\.|Ltd\.|Co\.|Group|Holdings)\b/gi, '').trim();

  // Guard against generic word collisions (e.g. Target, Block, Match)
  const isCommonWord = /^(TARGET|BLOCK|MATCH|GAP|BEST|NEXT|KEY|BOX|TRUE)$/i.test(tickerUpper) ||
                       /^(Target|Block|Match|Gap|Best|Next|Key|Box|True)$/i.test(companyClean);

  // Split into speech blocks or paragraphs
  const blocks = transcriptText.split(/\n\s*\n|\n(?=[A-Z][a-zA-Z\s\.\-]+:\s*)/);

  for (const block of blocks) {
    if (block.length < 30) continue;

    let matchedTerm = "";

    // If it's a common word, require compound matching (e.g., "Target Corporation" or "Target stores" or TGT)
    if (isCommonWord) {
      const compoundRegex = new RegExp(`\\b(${companyClean}\\s+(Corporation|Stores|Wholesale|Platform|DSP)|\\b${tickerUpper}\\b)`, 'i');
      if (compoundRegex.test(block)) {
        matchedTerm = companyClean;
      }
    } else {
      // Standard company name search
      if (companyClean.length >= 4 && new RegExp(`\\b${companyClean}\\b`, 'i').test(block)) {
        matchedTerm = companyClean;
      } else if (tickerUpper.length >= 3 && new RegExp(`\\b${tickerUpper}\\b`).test(block)) {
        matchedTerm = tickerUpper;
      }
    }

    // Also check flagship keywords (e.g. "Kokai", "UID2", "Unified ID 2.0")
    if (!matchedTerm) {
      for (const kw of flagshipKeywords) {
        if (kw && kw.length >= 4 && new RegExp(`\\b${kw}\\b`, 'i').test(block)) {
          matchedTerm = kw;
          break;
        }
      }
    }

    if (matchedTerm) {
      // Extract speaker if available
      const speakerMatch = block.match(/^([A-Z][a-zA-Z\s\.\-]+):/);
      const speaker = speakerMatch ? speakerMatch[1].trim() : "Participant / Q&A";
      const cleanText = block.replace(/\s+/g, ' ').trim();

      matches.push({
        speaker,
        text: cleanText.length > 500 ? cleanText.slice(0, 500) + "..." : cleanText,
        matchedTerm
      });

      if (matches.length >= 3) break; // Limit to top 3 highest-signal mentions
    }
  }

  return matches;
}
