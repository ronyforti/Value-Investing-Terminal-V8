import { CompetitorItem, CompetitorRadarDossier, IndustryArchetype, PeerRankingMetric } from "../types.js";
import { fetchLiveFxRates } from "../currencyGuard.js";

interface FmpQuote {
  symbol: string;
  name?: string;
  price?: number;
  marketCap?: number;
  pe?: number;
}

interface FmpMetrics {
  enterpriseValue?: number;
  roic?: number;
  roe?: number;
  debtToEquity?: number;
  freeCashFlowYield?: number;
}

/**
 * Executes a network fetch with a hard timeout to guarantee non-blocking execution.
 */
async function fetchWithTimeout(url: string, timeoutMs: number = 3500): Promise<any> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(id);
    return null;
  }
}

export interface CandidatePeerInput {
  ticker: string;
  name?: string;
  source?: 'proxy_peer' | '10k_risk' | 'transcript_qa' | 'industry_benchmark';
  isReciprocal?: boolean;
  reason?: string;
}

export interface VerifiedPeerCandidate {
  ticker: string;
  name: string;
  source: 'proxy_peer' | '10k_risk' | 'transcript_qa' | 'industry_benchmark';
  isReciprocal?: boolean;
  reason?: string;
  verified: boolean;
}

/**
 * Deterministically cross-checks candidate competitors against FMP's /stable/profile and /stable/search-name endpoints.
 * Rejects closed-end funds (e.g. PEO), ETFs, delisted equities, and resolves corporate names to active ticker symbols.
 */
export async function verifyAndResolvePeerWithFmp(
  candidate: CandidatePeerInput,
  targetTicker: string,
  fmpApiKey?: string
): Promise<VerifiedPeerCandidate | null> {
  const apiKey = fmpApiKey || process.env.FMP_API_KEY || "";
  const cleanTarget = (targetTicker || "").trim().toUpperCase();
  let candidateSym = (candidate.ticker || "").trim().toUpperCase();
  const candidateName = (candidate.name || "").trim();

  // If no API key is present, fallback to basic regex ticker validation
  if (!apiKey) {
    if (candidateSym && candidateSym !== cleanTarget && /^[A-Z]{1,5}$/.test(candidateSym)) {
      return {
        ticker: candidateSym,
        name: candidateName || candidateSym,
        source: candidate.source || 'industry_benchmark',
        isReciprocal: candidate.isReciprocal,
        reason: candidate.reason,
        verified: false
      };
    }
    return null;
  }

  // 1. If ticker is provided, query FMP /stable/profile
  if (candidateSym && candidateSym !== cleanTarget && /^[A-Z]{1,5}$/.test(candidateSym)) {
    try {
      const profData = await fetchWithTimeout(
        `https://financialmodelingprep.com/stable/profile?symbol=${candidateSym}&apikey=${apiKey}`,
        3500
      );
      if (Array.isArray(profData) && profData.length > 0) {
        const p = profData[0];
        // Fund / ETF / Delisted Rejection:
        if (p.isFund === true || p.isEtf === true || p.isActivelyTrading === false) {
          console.log(`[FMP Peer Verification] Rejected ${candidateSym} (${p.companyName || 'Unknown'}): Fund/ETF/Inactive.`);
          return null;
        }

        const profileName = p.companyName || "";
        // If candidate name was also provided, check for extreme name collision
        if (candidateName && profileName) {
          const normCand = candidateName.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normProf = profileName.toLowerCase().replace(/[^a-z0-9]/g, "");
          const hasOverlap = normCand.includes(normProf.slice(0, 5)) || normProf.includes(normCand.slice(0, 5));
          if (!hasOverlap && normCand.length >= 6 && normProf.length >= 6) {
            console.warn(`[FMP Peer Verification] Potential collision between ticker ${candidateSym} (${profileName}) and expected name "${candidateName}". Re-verifying via name search...`);
            const nameSearchRes = await fetchWithTimeout(
              `https://financialmodelingprep.com/stable/search-name?query=${encodeURIComponent(candidateName)}&limit=5&apikey=${apiKey}`,
              3500
            );
            if (Array.isArray(nameSearchRes) && nameSearchRes.length > 0) {
              const bestMatch = nameSearchRes.find((item) => 
                item.symbol && item.symbol !== cleanTarget && (item.exchange === "NYSE" || item.exchange === "NASDAQ" || item.exchange === "AMEX")
              ) || nameSearchRes[0];
              if (bestMatch && bestMatch.symbol) {
                candidateSym = bestMatch.symbol.toUpperCase();
                return {
                  ticker: candidateSym,
                  name: bestMatch.name || candidateName,
                  source: candidate.source || 'industry_benchmark',
                  isReciprocal: candidate.isReciprocal,
                  reason: candidate.reason,
                  verified: true
                };
              }
            }
          }
        }

        return {
          ticker: candidateSym,
          name: profileName || candidateName || candidateSym,
          source: candidate.source || 'industry_benchmark',
          isReciprocal: candidate.isReciprocal,
          reason: candidate.reason,
          verified: true
        };
      }
    } catch (e) {
      console.warn(`[FMP Peer Verification] Profile check error for ${candidateSym}:`, e);
    }
  }

  // 2. If ticker was missing, invalid, or profile query failed, attempt name resolution via /stable/search-name
  if (candidateName && candidateName.length >= 3) {
    try {
      // Pass 1: Try exact candidate name
      let searchRes = await fetchWithTimeout(
        `https://financialmodelingprep.com/stable/search-name?query=${encodeURIComponent(candidateName)}&limit=5&apikey=${apiKey}`,
        3500
      );

      // Pass 2: If empty, strip corporate legal suffixes (Inc, Corp, Group, etc.) and retry
      if (!Array.isArray(searchRes) || searchRes.length === 0) {
        const cleanName = candidateName
          .replace(/[,.]/g, "")
          .replace(/\b(Inc|Corp|Corporation|Ltd|Limited|Holdings|Group|Co|Company|LLC)\b/gi, "")
          .replace(/\s+/g, " ")
          .trim();
        if (cleanName && cleanName.length >= 3 && cleanName !== candidateName) {
          searchRes = await fetchWithTimeout(
            `https://financialmodelingprep.com/stable/search-name?query=${encodeURIComponent(cleanName)}&limit=5&apikey=${apiKey}`,
            3500
          );
        }
      }

      if (Array.isArray(searchRes) && searchRes.length > 0) {
        const majorEquities = searchRes.filter((item) => 
          item.symbol && item.symbol.toUpperCase() !== cleanTarget &&
          (item.exchange === "NYSE" || item.exchange === "NASDAQ" || item.exchange === "AMEX" || item.exchange === "TSX")
        );
        const resolved = majorEquities.length > 0 ? majorEquities[0] : searchRes[0];
        if (resolved && resolved.symbol) {
          const resSym = resolved.symbol.toUpperCase();
          const profCheck = await fetchWithTimeout(
            `https://financialmodelingprep.com/stable/profile?symbol=${resSym}&apikey=${apiKey}`,
            3500
          );
          if (Array.isArray(profCheck) && profCheck.length > 0) {
            const p = profCheck[0];
            if (p.isFund === true || p.isEtf === true || p.isActivelyTrading === false) {
              return null;
            }
            return {
              ticker: resSym,
              name: p.companyName || resolved.name || candidateName,
              source: candidate.source || 'industry_benchmark',
              isReciprocal: candidate.isReciprocal,
              reason: candidate.reason,
              verified: true
            };
          }
        }
      }
    } catch (searchErr) {
      console.warn(`[FMP Peer Verification] Name search error for "${candidateName}":`, searchErr);
    }
  }

  return null;
}


/**
 * Resolves and harvests multi-source competitor data, calculating archetype-adjusted valuation metrics.
 * Designed with 100% non-blocking fault-tolerance.
 */
export async function harvestCompetitorRadar(
  targetTicker: string,
  targetName: string,
  candidatePeers: Array<{ ticker: string; name?: string; source?: 'proxy_peer' | '10k_risk' | 'transcript_qa' | 'industry_benchmark'; isReciprocal?: boolean }>,
  archetype: IndustryArchetype = 'standard_corporate',
  fmpApiKey?: string,
  flagshipKeywords: string[] = []
): Promise<CompetitorRadarDossier> {
  const timestamp = new Date().toISOString();
  const cleanTarget = (targetTicker || '').toUpperCase().trim();
  const apiKey = fmpApiKey || process.env.FMP_API_KEY || "";

  // Filter out target itself and deduplicate
  const uniqueCandidateMap = new Map<string, { ticker: string; name?: string; source: 'proxy_peer' | '10k_risk' | 'transcript_qa' | 'industry_benchmark'; isReciprocal?: boolean }>();
  for (const p of candidatePeers) {
    const sym = (p.ticker || '').toUpperCase().trim();
    if (sym && sym !== cleanTarget) {
      const isRecip = !!p.isReciprocal || p.source === 'proxy_peer';
      const existing = uniqueCandidateMap.get(sym);
      if (existing) {
        if (isRecip) {
          existing.isReciprocal = true;
          existing.source = 'proxy_peer';
        }
      } else {
        uniqueCandidateMap.set(sym, {
          ticker: sym,
          name: p.name || sym,
          source: p.source || (isRecip ? 'proxy_peer' : 'industry_benchmark'),
          isReciprocal: isRecip
        });
      }
    }
  }

  const selectedCandidates = Array.from(uniqueCandidateMap.values()).slice(0, 6);
  const items: CompetitorItem[] = [];

  if (!apiKey || selectedCandidates.length === 0) {
    // Graceful fallback if no API key or candidates
    for (const c of selectedCandidates) {
      items.push({
        name: c.name || c.ticker,
        ticker: c.ticker,
        type: 'direct_public',
        source: c.source,
        isReciprocalPeer: c.isReciprocal,
        provenanceStatus: apiKey ? 'NOT_FOUND' : 'UNAVAILABLE',
        provenanceNotes: apiKey ? 'Candidate identified; awaiting financial sync.' : 'FMP API key not configured; financial comps omitted.'
      });
    }

    return {
      targetTicker: cleanTarget,
      targetName,
      archetype,
      generatedAt: timestamp,
      peers: items,
      markdownSummary: generateCompetitorMarkdown(cleanTarget, targetName, archetype, items, null),
      csvData: generateCompetitorCsv(items)
    };
  }

  // Fetch quotes in batch with strict 3.5s timeout
  const tickersToFetch = [cleanTarget, ...selectedCandidates.map(c => c.ticker)];
  const symQuery = tickersToFetch.join(',');

  const [quotesData] = await Promise.allSettled([
    fetchWithTimeout(`https://financialmodelingprep.com/stable/batch-quote?symbols=${symQuery}&apikey=${apiKey}`, 3500)
  ]);

  const quotesMap = new Map<string, FmpQuote>();
  if (quotesData.status === 'fulfilled' && Array.isArray(quotesData.value)) {
    for (const q of quotesData.value) {
      if (q && q.symbol) quotesMap.set(q.symbol.toUpperCase(), q);
    }
  }

  // Helper to harvest comprehensive financial statements & metrics for a given symbol
  const fetchMetricsForSymbol = async (sym: string, quote?: FmpQuote) => {
    // 1. Primary TTM fetch: 4 quarters for Cash Flow & Income Statement, latest quarter for Balance Sheet
    const [cfRes, incRes, bsRes, kmRes] = await Promise.allSettled([
      fetchWithTimeout(`https://financialmodelingprep.com/stable/cash-flow-statement?symbol=${sym}&period=quarter&limit=4&apikey=${apiKey}`, 3500),
      fetchWithTimeout(`https://financialmodelingprep.com/stable/income-statement?symbol=${sym}&period=quarter&limit=4&apikey=${apiKey}`, 3500),
      fetchWithTimeout(`https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=${sym}&period=quarter&limit=1&apikey=${apiKey}`, 3500),
      fetchWithTimeout(`https://financialmodelingprep.com/stable/key-metrics-ttm?symbol=${sym}&apikey=${apiKey}`, 3500)
    ]);

    let cfList: any[] = (cfRes.status === 'fulfilled' && Array.isArray(cfRes.value)) ? cfRes.value : [];
    let incList: any[] = (incRes.status === 'fulfilled' && Array.isArray(incRes.value)) ? incRes.value : [];
    let bsList: any[] = (bsRes.status === 'fulfilled' && Array.isArray(bsRes.value)) ? bsRes.value : [];

    // Fallback circuit breaker: If quarterly statements are empty or fewer than 4 quarters
    // (e.g. foreign semi-annual filers or missing quarterly statements), fallback to annual filings
    let isTtm = true;
    if (cfList.length < 4 || incList.length < 4 || bsList.length === 0) {
      const fallbackPromises: Promise<any>[] = [];
      if (cfList.length < 4) {
        fallbackPromises.push(fetchWithTimeout(`https://financialmodelingprep.com/stable/cash-flow-statement?symbol=${sym}&period=annual&limit=1&apikey=${apiKey}`, 3000));
      } else {
        fallbackPromises.push(Promise.resolve(null));
      }
      if (incList.length < 4) {
        fallbackPromises.push(fetchWithTimeout(`https://financialmodelingprep.com/stable/income-statement?symbol=${sym}&period=annual&limit=1&apikey=${apiKey}`, 3000));
      } else {
        fallbackPromises.push(Promise.resolve(null));
      }
      if (bsList.length === 0) {
        fallbackPromises.push(fetchWithTimeout(`https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=${sym}&period=annual&limit=1&apikey=${apiKey}`, 3000));
      } else {
        fallbackPromises.push(Promise.resolve(null));
      }

      const [annualCf, annualInc, annualBs] = await Promise.all(fallbackPromises);
      if (Array.isArray(annualCf) && annualCf.length > 0 && cfList.length === 0) {
        cfList = annualCf;
        isTtm = false;
      }
      if (Array.isArray(annualInc) && annualInc.length > 0 && incList.length === 0) {
        incList = annualInc;
        isTtm = false;
      }
      if (Array.isArray(annualBs) && annualBs.length > 0 && bsList.length === 0) {
        bsList = annualBs;
      }
    }

    let metric: any;
    if (kmRes.status === 'fulfilled' && Array.isArray(kmRes.value) && kmRes.value.length > 0) {
      metric = kmRes.value[0];
    }

    let price = quote?.price;
    let marketCap = quote?.marketCap;
    let enterpriseValue = Number(metric?.enterpriseValueTTM || metric?.enterpriseValue || marketCap || 0);
    let peRatio = quote?.pe;
    let rawRoic = metric?.returnOnInvestedCapitalTTM ?? metric?.returnOnCapitalEmployedTTM ?? metric?.roic;
    let roic = rawRoic !== undefined ? Number((rawRoic * 100).toFixed(1)) : undefined;

    let revenue: number | undefined;
    let grossMargin: number | undefined;
    let operatingMargin: number | undefined;
    let fcf: number | undefined;
    let sbc: number | undefined;
    let trueFcf: number | undefined;
    let evToTrueFcf: number | undefined;
    let da: number | undefined;
    let maintenanceCapex: number | undefined;
    let growthCapex: number | undefined;
    let ownerEarnings: number | undefined;
    let evToOwnerEarnings: number | undefined;
    let pToOwnerEarnings: number | undefined;
    let netDebt: number | undefined;
    let netCashToMarketCap: number | undefined;

    // Parse Cash Flow (Sum 4 quarters for TTM, or 1 annual period)
    if (cfList.length > 0) {
      const ocf = cfList.reduce((sum, cf) => sum + Number(cf.operatingCashFlow || 0), 0);
      const capex = cfList.reduce((sum, cf) => sum + Math.abs(Number(cf.capitalExpenditure || 0)), 0);
      sbc = cfList.reduce((sum, cf) => sum + Number(cf.stockBasedCompensation || 0), 0);
      fcf = cfList.reduce((sum, cf) => {
        const itemOcf = Number(cf.operatingCashFlow || 0);
        const itemCapex = Math.abs(Number(cf.capitalExpenditure || 0));
        return sum + Number(cf.freeCashFlow ?? (itemOcf - itemCapex));
      }, 0);
      trueFcf = fcf - sbc; // True economic FCF deducting SBC dilution

      if (enterpriseValue && trueFcf > 0) {
        evToTrueFcf = Number((enterpriseValue / trueFcf).toFixed(2));
      }

      // Programmatic Owner Earnings Proxy (Greenwald / Buffett framework):
      // Maintenance CapEx is approximated by economic Depreciation & Amortization (D&A).
      const rawDa = cfList.reduce((sum, cf) => sum + Math.abs(Number(cf.depreciationAndAmortization || 0)), 0);
      da = rawDa > 0 ? rawDa : undefined;

      if (da !== undefined) {
        if (capex >= da) {
          maintenanceCapex = da;
          growthCapex = capex - da;
        } else {
          maintenanceCapex = capex;
          growthCapex = 0;
        }
      } else {
        maintenanceCapex = capex;
        growthCapex = 0;
      }

      // Owner Earnings = Operating Cash Flow - Maintenance CapEx - SBC
      ownerEarnings = ocf - maintenanceCapex - sbc;

      if (enterpriseValue && ownerEarnings > 0) {
        evToOwnerEarnings = Number((enterpriseValue / ownerEarnings).toFixed(2));
      }
      if (marketCap && ownerEarnings > 0) {
        pToOwnerEarnings = Number((marketCap / ownerEarnings).toFixed(2));
      }
    }

    // Parse Income Statement (Sum 4 quarters for TTM, or 1 annual period)
    let totalNetIncome = 0;
    let totalOperatingIncome = 0;
    let totalInterestInc = 0;
    let totalInterestExp = 0;
    let totalNetIntInc = 0;
    let totalOpExp = 0;

    if (incList.length > 0) {
      revenue = incList.reduce((sum, inc) => sum + Number(inc.revenue || 0), 0);
      const grossProfit = incList.reduce((sum, inc) => sum + Number(inc.grossProfit || 0), 0);
      totalOperatingIncome = incList.reduce((sum, inc) => sum + Number(inc.operatingIncome || 0), 0);
      totalNetIncome = incList.reduce((sum, inc) => sum + Number(inc.netIncome || 0), 0);
      totalInterestInc = incList.reduce((sum, inc) => sum + Number(inc.interestIncome || 0), 0);
      totalInterestExp = incList.reduce((sum, inc) => sum + Number(inc.interestExpense || 0), 0);
      totalNetIntInc = incList.reduce((sum, inc) => sum + Number(inc.netInterestIncome || (Number(inc.interestIncome || 0) - Number(inc.interestExpense || 0))), 0);
      totalOpExp = incList.reduce((sum, inc) => sum + Number(inc.operatingExpenses || inc.sellingGeneralAndAdministrativeExpenses || 0), 0);

      if (revenue > 0) {
        grossMargin = Number(((grossProfit / revenue) * 100).toFixed(1));
        operatingMargin = Number(((totalOperatingIncome / revenue) * 100).toFixed(1));
      }
    }

    // Parse Balance Sheet (Latest reported quarter or annual snapshot)
    let bsEquity = 0;
    let bsDebt = 0;
    let bsCash = 0;
    let bsTotalAssets = 0;

    if (bsList.length > 0) {
      const bs = bsList[0];
      bsCash = Number(bs.cashAndCashEquivalents || 0) + Number(bs.shortTermInvestments || 0);
      bsDebt = Number(bs.totalDebt || 0);
      bsEquity = Number(bs.totalStockholdersEquity || 0);
      bsTotalAssets = Number(bs.totalAssets || 0);
      netDebt = bsDebt - bsCash;

      let netCashNumerator = bsCash - bsDebt;
      let normalizedEquity = bsEquity;
      const reportedCurr = (bs.reportedCurrency || "").toUpperCase();
      if (reportedCurr && reportedCurr !== "USD") {
        try {
          const fxRates = await fetchLiveFxRates();
          const rate = fxRates[reportedCurr] || 1.0;
          if (rate > 0) {
            netCashNumerator = netCashNumerator / rate;
            normalizedEquity = normalizedEquity / rate;
          }
        } catch {
          // fallback to unadjusted if FX service unreachable
        }
      }

      if (marketCap && marketCap > 0) {
        netCashToMarketCap = Number(((netCashNumerator / marketCap) * 100).toFixed(1));
      }
    }

    let priceToBook = metric?.pbRatioTTM ?? metric?.pbRatio ?? metric?.priceToBookValueTTM;
    let roe = metric?.returnOnEquityTTM ?? metric?.roeTTM ?? metric?.roe;
    let priceToTangibleBook = metric?.ptbRatioTTM ?? metric?.priceToBookValueTTM;

    // Fallback: calculate P/B from Balance Sheet Equity if FMP metric was empty
    if (priceToBook === undefined && marketCap && marketCap > 0 && bsEquity > 0) {
      const reportedCurr = (bsList[0]?.reportedCurrency || "").toUpperCase();
      let equityForPb = bsEquity;
      if (reportedCurr && reportedCurr !== "USD") {
        try {
          const fxRates = await fetchLiveFxRates();
          const rate = fxRates[reportedCurr] || 1.0;
          if (rate > 0) equityForPb = equityForPb / rate;
        } catch {}
      }
      priceToBook = Number((marketCap / equityForPb).toFixed(2));
    } else if (priceToBook !== undefined) {
      priceToBook = Number(priceToBook.toFixed(2));
    }

    // Fallback: calculate ROE from Net Income / Stockholders Equity
    if (roe === undefined && bsEquity > 0 && totalNetIncome) {
      roe = Number(((totalNetIncome / bsEquity) * 100).toFixed(1));
    } else if (roe !== undefined) {
      roe = Number((roe * 100).toFixed(1));
    }

    // Fallback: calculate P/E from Market Cap / Net Income or Price / EPS
    if ((peRatio === undefined || peRatio <= 0) && marketCap && marketCap > 0 && totalNetIncome > 0) {
      peRatio = Number((marketCap / totalNetIncome).toFixed(1));
    }

    // Net Debt / Capital calculation (crucial for homebuilders, industrials, REITs)
    let netDebtToCapital: number | undefined;
    if (bsEquity > 0) {
      const net = bsDebt - bsCash;
      const totalCap = net > 0 ? (net + bsEquity) : bsEquity;
      netDebtToCapital = Number(((net / totalCap) * 100).toFixed(1));
    }

    // Fallback: calculate ROIC from NOPAT / Invested Capital if FMP metric was empty
    if (roic === undefined && totalOperatingIncome > 0) {
      const investedCap = bsDebt + bsEquity - bsCash;
      if (investedCap > 0) {
        roic = Number((((totalOperatingIncome * 0.79) / investedCap) * 100).toFixed(1));
      } else if (roe !== undefined) {
        roic = roe;
      }
    }

    // Bank metrics: Net Interest Margin (NIM) & Efficiency Ratio
    let nim = metric?.netInterestMarginTTM ?? metric?.netInterestMargin;
    if (nim !== undefined) {
      nim = Number((nim * (nim < 0.2 ? 100 : 1)).toFixed(2));
    } else if (bsTotalAssets > 0 && totalNetIntInc > 0) {
      nim = Number(((totalNetIntInc / bsTotalAssets) * 100).toFixed(2));
    }

    let efficiencyRatio = metric?.efficiencyRatioTTM ?? metric?.efficiencyRatio;
    if (efficiencyRatio !== undefined) {
      efficiencyRatio = Number((efficiencyRatio * (efficiencyRatio < 1 ? 100 : 1)).toFixed(1));
    } else if (revenue && revenue > 0 && totalOpExp > 0) {
      efficiencyRatio = Number(((totalOpExp / revenue) * 100).toFixed(1));
    }

    let dividendYield = metric?.dividendYieldTTM ?? metric?.dividendYield;
    if (dividendYield !== undefined) {
      dividendYield = Number((dividendYield * 100).toFixed(2));
    }

    return {
      price,
      marketCap: marketCap ? Number((marketCap / 1e9).toFixed(2)) : undefined, // in $B
      enterpriseValue: enterpriseValue ? Number((enterpriseValue / 1e9).toFixed(2)) : undefined, // in $B
      revenue: revenue ? Number((revenue / 1e9).toFixed(2)) : undefined, // in $B
      grossMargin,
      housingGrossMargin: grossMargin,
      netDebtToCapital,
      operatingMargin,
      fcf: fcf ? Number((fcf / 1e6).toFixed(1)) : undefined, // in $M
      sbc: sbc ? Number((sbc / 1e6).toFixed(1)) : undefined, // in $M
      trueFcf: trueFcf ? Number((trueFcf / 1e6).toFixed(1)) : undefined, // in $M
      evToTrueFcf,
      da: da ? Number((da / 1e6).toFixed(1)) : undefined, // in $M
      maintenanceCapex: maintenanceCapex !== undefined ? Number((maintenanceCapex / 1e6).toFixed(1)) : undefined, // in $M
      growthCapex: growthCapex !== undefined ? Number((growthCapex / 1e6).toFixed(1)) : undefined, // in $M
      ownerEarnings: ownerEarnings !== undefined ? Number((ownerEarnings / 1e6).toFixed(1)) : undefined, // in $M
      evToOwnerEarnings,
      pToOwnerEarnings,
      peRatio: peRatio && peRatio > 0 ? Number(peRatio.toFixed(1)) : undefined,
      roic,
      netDebt: netDebt ? Number((netDebt / 1e6).toFixed(1)) : undefined,
      netCashToMarketCap,
      priceToBook,
      roe,
      priceToTangibleBook: priceToTangibleBook ?? priceToBook,
      rotce: roe,
      nim,
      efficiencyRatio,
      dividendYield,
      isTtm
    };
  };

  // Fetch in-depth cash flow & income statement for True FCF (ex-SBC) per candidate
  const detailPromises = selectedCandidates.map(async (cand) => {
    const sym = cand.ticker;
    const quote = quotesMap.get(sym);
    const financials = await fetchMetricsForSymbol(sym, quote);

    const hasFinancials = financials.price !== undefined || financials.revenue !== undefined || financials.fcf !== undefined;
    const item: CompetitorItem = {
      name: quote?.name || cand.name || sym,
      ticker: sym,
      type: 'direct_public',
      source: cand.source,
      isReciprocalPeer: !!cand.isReciprocal || cand.source === 'proxy_peer',
      financials,
      provenanceStatus: hasFinancials ? 'VERIFIED_COMPLETE' : 'PARTIAL',
      provenanceNotes: hasFinancials
        ? (financials.isTtm ? `Verified via FMP real-time quote & TTM quarterly statements.` : `Verified via FMP real-time quote & annual filings (TTM fallback).`)
        : `Partial data retrieved; foreign or OTC listing.`
    };

    return item;
  });

  const resolvedItems = await Promise.all(detailPromises);
  items.push(...resolvedItems);

  // Parse Target Company Financials for the Benchmark Line
  const targetQuote = quotesMap.get(cleanTarget);
  const targetFinancials = await fetchMetricsForSymbol(cleanTarget, targetQuote);
  const targetItem: CompetitorItem = {
    name: targetName || targetQuote?.name || cleanTarget,
    ticker: cleanTarget,
    type: 'direct_public',
    source: 'industry_benchmark',
    financials: targetFinancials,
    provenanceStatus: 'VERIFIED_COMPLETE',
    provenanceNotes: targetFinancials.isTtm 
      ? 'Target Anchor Company (TTM)'
      : 'Target Anchor Company (Annual Baseline)'
  };

  const rankings = computePeerRankings(targetItem, items, archetype);
  const markdownSummary = generateCompetitorMarkdown(cleanTarget, targetName, archetype, items, targetItem, rankings);
  const csvData = generateCompetitorCsv([targetItem, ...items]);

  return {
    targetTicker: cleanTarget,
    targetName,
    archetype,
    generatedAt: timestamp,
    peers: items,
    targetFinancials,
    targetItem,
    rankings,
    markdownSummary,
    csvData
  };
}

/**
 * Generates the standardized Competitor Markdown Dossier with the Data Provenance Table.
 */
function generateCompetitorMarkdown(
  targetTicker: string,
  targetName: string,
  archetype: IndustryArchetype,
  peers: CompetitorItem[],
  targetItem: CompetitorItem | null,
  rankings: PeerRankingMetric[] = []
): string {
  let md = `**Company:** ${targetName || targetTicker}\n` +
    `**Ticker Symbol:** ${targetTicker}\n` +
    `**Filing Type:** Competitor Moat & Valuation Radar\n\n` +
    `### Competitor Moat & Valuation Radar\n\n`;
  md += `> **Target Company:** ${targetName} (\`${targetTicker}\`) | **Archetype:** \`${archetype}\`\n\n`;

  // 1. Data Lineage & Provenance Scorecard
  md += `#### 1. Data Lineage & Provenance Scorecard\n\n`;
  md += `| Peer / Competitor | Ticker | Peer Classification | Discovery Source | Financial Data Status | Provenance Notes |\n`;
  md += `| :--- | :---: | :--- | :---: | :---: | :--- |\n`;

  for (const p of peers) {
    const sym = p.ticker ? `\`${p.ticker}\`` : '`N/A`';
    const classification = 'Direct Public Competitor';
    const statusIcon = p.provenanceStatus === 'VERIFIED_COMPLETE' ? '🟢 Complete'
      : p.provenanceStatus === 'PARTIAL' ? '🟡 Partial'
      : p.provenanceStatus === 'QUALITATIVE_ONLY' ? '⚪ Context Only'
      : '🔴 Unavailable';

    md += `| **${p.name}** | ${sym} | ${classification} | ${formatSource(p.source)} | ${statusIcon} | ${p.provenanceNotes || 'Standard data sync'} |\n`;
  }
  md += `\n`;

  // 2. Comparative Comps Table
  md += `#### 2. Archetype Comparative Valuation & Moat Scorecard\n\n`;

  if (archetype === 'financial_bank') {
    md += `| Company | Ticker | Price | Market Cap ($B) | P / TBV | ROTCE % | NIM % | Efficiency Ratio % | Provenance |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |\n`;
    if (targetItem && targetItem.financials) {
      const tf = targetItem.financials;
      md += `| **${targetItem.name} (Anchor)** | **\`${targetItem.ticker}\`** | **$${tf.price ?? 'N/A'}** | **$${tf.marketCap ?? 'N/A'}** | **${tf.priceToTangibleBook ?? 'N/A'}x** | **${tf.rotce ?? 'N/A'}%** | **${tf.nim ?? 'N/A'}%** | **${tf.efficiencyRatio ?? 'N/A'}%** | **Target Anchor** |\n`;
    }
    for (const p of peers) {
      const f = p.financials || {};
      const prov = 'Direct Competitor';
      md += `| ${p.name} | \`${p.ticker || 'N/A'}\` | $${f.price ?? 'N/A'} | $${f.marketCap ?? 'N/A'} | ${f.priceToTangibleBook ?? 'N/A'}x | ${f.rotce ?? 'N/A'}% | ${f.nim ?? 'N/A'}% | ${f.efficiencyRatio ?? 'N/A'}% | ${prov} |\n`;
    }
  } else if (archetype === 'insurance') {
    md += `| Company | Ticker | Price | Market Cap ($B) | P / B | ROE % | P / E | EV / True FCF | Net Cash / MC | Provenance |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |\n`;
    if (targetItem && targetItem.financials) {
      const tf = targetItem.financials;
      const pb = tf.priceToBook !== undefined ? `${tf.priceToBook}x` : '--';
      const roe = tf.roe !== undefined ? `${tf.roe}%` : '--';
      const pe = tf.peRatio !== undefined ? `${tf.peRatio}x` : '--';
      const evFcf = tf.evToTrueFcf !== undefined ? `${tf.evToTrueFcf}x` : (tf.trueFcf !== undefined && tf.trueFcf <= 0 ? 'N/M (Neg)' : 'Target');
      const netCash = tf.netCashToMarketCap !== undefined ? `${tf.netCashToMarketCap}%` : '--';
      md += `| **${targetItem.name} (Anchor)** | **\`${targetItem.ticker}\`** | **$${tf.price ?? 'N/A'}** | **$${tf.marketCap ?? 'N/A'}** | **${pb}** | **${roe}** | **${pe}** | **${evFcf}** | **${netCash}** | **Target Anchor** |\n`;
    }
    for (const p of peers) {
      const f = p.financials || {};
      const pb = f.priceToBook !== undefined ? `${f.priceToBook}x` : 'N/A';
      const roe = f.roe !== undefined ? `${f.roe}%` : 'N/A';
      const pe = f.peRatio !== undefined ? `${f.peRatio}x` : 'N/A';
      const evFcf = f.evToTrueFcf !== undefined ? `${f.evToTrueFcf}x` : (f.trueFcf !== undefined && f.trueFcf <= 0 ? 'N/M (Neg)' : 'N/A');
      const netCash = f.netCashToMarketCap !== undefined ? `${f.netCashToMarketCap}%` : 'N/A';
      const prov = 'Direct Competitor';
      md += `| ${p.name} | \`${p.ticker || 'N/A'}\` | $${f.price ?? 'N/A'} | $${f.marketCap ?? 'N/A'} | ${pb} | ${roe} | ${pe} | ${evFcf} | ${netCash} | ${prov} |\n`;
    }
  } else if (archetype === 'homebuilder') {
    md += `| Company | Ticker | Price | Market Cap ($B) | Gross Margin % | ROIC % | Net Debt / Cap % | EV / Owner Earn | Net Cash / Mkt Cap % | Provenance |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |\n`;
    if (targetItem && targetItem.financials) {
      const tf = targetItem.financials;
      const gm = (tf.housingGrossMargin ?? tf.grossMargin) !== undefined ? `${tf.housingGrossMargin ?? tf.grossMargin}%` : '--';
      const roicStr = tf.roic !== undefined ? `${tf.roic}%` : '--';
      const ndc = tf.netDebtToCapital !== undefined ? `${tf.netDebtToCapital}%` : '--';
      const evOe = tf.evToOwnerEarnings !== undefined ? `${tf.evToOwnerEarnings}x` : 'Target';
      const netCash = tf.netCashToMarketCap !== undefined ? `${tf.netCashToMarketCap}%` : '--';
      md += `| **${targetItem.name} (Anchor)** | **\`${targetItem.ticker}\`** | **$${tf.price ?? 'N/A'}** | **$${tf.marketCap ?? 'N/A'}** | **${gm}** | **${roicStr}** | **${ndc}** | **${evOe}** | **${netCash}** | **Target Anchor** |\n`;
    }
    for (const p of peers) {
      const f = p.financials || {};
      const gm = (f.housingGrossMargin ?? f.grossMargin) !== undefined ? `${f.housingGrossMargin ?? f.grossMargin}%` : 'N/A';
      const roicStr = f.roic !== undefined ? `${f.roic}%` : 'N/A';
      const ndc = f.netDebtToCapital !== undefined ? `${f.netDebtToCapital}%` : 'N/A';
      const evOe = f.evToOwnerEarnings !== undefined ? `${f.evToOwnerEarnings}x` : (f.ownerEarnings !== undefined && f.ownerEarnings <= 0 ? 'N/M (Neg)' : 'N/A');
      const netCash = f.netCashToMarketCap !== undefined ? `${f.netCashToMarketCap}%` : 'N/A';
      const prov = 'Direct Competitor';
      md += `| ${p.name} | \`${p.ticker || 'N/A'}\` | $${f.price ?? 'N/A'} | $${f.marketCap ?? 'N/A'} | ${gm} | ${roicStr} | ${ndc} | ${evOe} | ${netCash} | ${prov} |\n`;
    }
  } else if (archetype === 'reit') {
    md += `| Company | Ticker | Price | Market Cap ($B) | P / FFO (or PE) | Div Yield % | ROE % | P / B | EV / True FCF | Provenance |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |\n`;
    if (targetItem && targetItem.financials) {
      const tf = targetItem.financials;
      const pe = tf.peRatio !== undefined ? `${tf.peRatio}x` : '--';
      const divYield = tf.dividendYield !== undefined ? `${tf.dividendYield}%` : '--';
      const roe = tf.roe !== undefined ? `${tf.roe}%` : '--';
      const pb = tf.priceToBook !== undefined ? `${tf.priceToBook}x` : '--';
      const evFcf = tf.evToTrueFcf !== undefined ? `${tf.evToTrueFcf}x` : 'Target';
      md += `| **${targetItem.name} (Anchor)** | **\`${targetItem.ticker}\`** | **$${tf.price ?? 'N/A'}** | **$${tf.marketCap ?? 'N/A'}** | **${pe}** | **${divYield}** | **${roe}** | **${pb}** | **${evFcf}** | **Target Anchor** |\n`;
    }
    for (const p of peers) {
      const f = p.financials || {};
      const pe = f.peRatio !== undefined ? `${f.peRatio}x` : 'N/A';
      const divYield = f.dividendYield !== undefined ? `${f.dividendYield}%` : 'N/A';
      const roe = f.roe !== undefined ? `${f.roe}%` : 'N/A';
      const pb = f.priceToBook !== undefined ? `${f.priceToBook}x` : 'N/A';
      const evFcf = f.evToTrueFcf !== undefined ? `${f.evToTrueFcf}x` : (f.trueFcf !== undefined && f.trueFcf <= 0 ? 'N/M (Neg)' : 'N/A');
      const prov = 'Direct Competitor';
      md += `| ${p.name} | \`${p.ticker || 'N/A'}\` | $${f.price ?? 'N/A'} | $${f.marketCap ?? 'N/A'} | ${pe} | ${divYield} | ${roe} | ${pb} | ${evFcf} | ${prov} |\n`;
    }
  } else {
    // Standard Corporate & Tech / Industrials
    md += `| Company | Ticker | Price | Mkt Cap ($B) | Gross Margin % | Operating Margin % | ROIC % | EV / True FCF | EV / Owner Earn | Net Cash / Mkt Cap % |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

    // Anchor line
    if (targetItem && targetItem.financials) {
      const tf = targetItem.financials;
      const gm = tf.grossMargin !== undefined ? `${tf.grossMargin}%` : '--';
      const opMgn = tf.operatingMargin !== undefined ? `${tf.operatingMargin}%` : '--';
      const evFcf = tf.evToTrueFcf !== undefined ? `${tf.evToTrueFcf}x` : 'Target';
      const evOe = tf.evToOwnerEarnings !== undefined ? `${tf.evToOwnerEarnings}x` : 'Target';
      const roic = tf.roic !== undefined ? `${tf.roic}%` : '--';
      const netCash = tf.netCashToMarketCap !== undefined ? `${tf.netCashToMarketCap}%` : '--';
      md += `| **${targetItem.name} (Anchor)** | **\`${targetItem.ticker}\`** | **$${tf.price ?? 'N/A'}** | **$${tf.marketCap ?? 'N/A'}** | **${gm}** | **${opMgn}** | **${roic}** | **${evFcf}** | **${evOe}** | **${netCash}** |\n`;
    }

    for (const p of peers) {
      const f = p.financials || {};
      const gm = f.grossMargin !== undefined ? `${f.grossMargin}%` : 'N/A';
      const opMgn = f.operatingMargin !== undefined ? `${f.operatingMargin}%` : 'N/A';
      const evFcf = f.evToTrueFcf !== undefined ? `${f.evToTrueFcf}x` : (f.trueFcf !== undefined && f.trueFcf <= 0 ? 'N/M (Neg)' : 'N/A');
      const evOe = f.evToOwnerEarnings !== undefined ? `${f.evToOwnerEarnings}x` : (f.ownerEarnings !== undefined && f.ownerEarnings <= 0 ? 'N/M (Neg)' : 'N/A');
      const roic = f.roic !== undefined ? `${f.roic}%` : 'N/A';
      const netCash = f.netCashToMarketCap !== undefined ? `${f.netCashToMarketCap}%` : 'N/A';

      md += `| ${p.name} | \`${p.ticker || 'N/A'}\` | $${f.price ?? 'N/A'} | $${f.marketCap ?? 'N/A'} | ${gm} | ${opMgn} | ${roic} | ${evFcf} | ${evOe} | ${netCash} |\n`;
    }
  }
  md += `\n`;

  // 3. Moat Leaderboard & Peer Group Standing
  if (rankings && rankings.length > 0) {
    md += `#### 3. Moat Leaderboard & Peer Group Standing\n\n`;
    md += `| Moat Dimension | Target Anchor (\`${targetTicker}\`) | Standing (Rank) | Peer Group Median | Group Leader | Competitive Moat Verdict |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :--- |\n`;

    for (const r of rankings) {
      const standingStr = r.direction === 'lower_is_better' && (r.key.includes('ev') || r.key.includes('pe') || r.key.includes('price'))
        ? `**#${r.rank} Cheapest of ${r.totalCount}**`
        : `**#${r.rank} of ${r.totalCount}**`;

      const verdictStr = r.verdict === 'LEADER'
        ? `🥇 **Industry Leader**`
        : r.verdict === 'TOP_QUARTILE'
        ? `🥈 **Top Half / Competitive Advantage**`
        : r.verdict === 'MEDIAN'
        ? `🥉 **Competitive Median**`
        : `⚠️ **Lagging Peer Group**`;

      const leaderStr = r.leaderTicker === targetTicker
        ? `Target Anchor (\`${targetTicker}\` - ${r.formattedLeaderValue})`
        : `${r.leaderName} (\`${r.leaderTicker}\` - ${r.formattedLeaderValue})`;

      md += `| **${r.label}** | **${r.formattedTargetValue}** | ${standingStr} | ${r.formattedPeerMedian} | ${leaderStr} | ${verdictStr} |\n`;
    }
    md += `\n`;
  }

  // 4. Strategic Guidance for Prompts
  md += `#### 4. Moat & Valuation Attack Guidance (For Red Team & Synthesis)\n`;
  md += `* **Trailing Twelve Months (TTM) Peer Normalization:** Peer margins, operating cash flows, and valuation multiples reflect the trailing twelve months (TTM) aggregated across reported quarterly filings (or audited annual baseline for semi-annual foreign filers), ensuring 1-to-1 temporal parity with the target company's current operating performance.\n`;
  md += `* **True Economic Cash Flow (ex-SBC) vs. Owner Earnings:** Compare \`EV / True FCF\` (deducts 100% of CapEx) and \`EV / Owner Earnings\` (institutional proxy normalizing Maintenance CapEx to D&A). If a competitor's EV/True FCF appears high but its EV/Owner Earnings is modest, recognize that the peer is aggressively reinvesting Growth CapEx to expand capacity rather than being encumbered by high maintenance expenses.\n`;
  md += `* **Capital Allocation:** Cross-check the target's ROIC against verified reciprocal peers to test if capital advantages are widening or compressing.\n`;
  md += `* **Forensic Verification:** If any peer is trading at a significantly lower EV/Owner Earnings multiple while matching or exceeding the target's Gross Margin, the Red Team must explicitly challenge the investment thesis on relative multiple risk.\n\n`;

  return md;
}

interface MetricConfig {
  key: string;
  label: string;
  direction: 'higher_is_better' | 'lower_is_better';
  isMultiple?: boolean;
  unit: string;
  getValue: (f: NonNullable<CompetitorItem['financials']>) => number | undefined;
}

export function computePeerRankings(
  targetItem: CompetitorItem | null,
  peers: CompetitorItem[],
  archetype: IndustryArchetype
): PeerRankingMetric[] {
  if (!targetItem || !targetItem.financials) return [];

  const configs: MetricConfig[] = [];

  if (archetype === 'financial_bank') {
    configs.push(
      { key: 'rotce', label: 'ROTCE', direction: 'higher_is_better', unit: '%', getValue: f => f.rotce },
      { key: 'nim', label: 'Net Interest Margin (NIM)', direction: 'higher_is_better', unit: '%', getValue: f => f.nim },
      { key: 'efficiencyRatio', label: 'Efficiency Ratio', direction: 'lower_is_better', unit: '%', getValue: f => f.efficiencyRatio },
      { key: 'priceToTangibleBook', label: 'Price / Tangible Book', direction: 'lower_is_better', isMultiple: true, unit: 'x', getValue: f => f.priceToTangibleBook },
      { key: 'cet1Ratio', label: 'CET1 Ratio', direction: 'higher_is_better', unit: '%', getValue: f => f.cet1Ratio }
    );
  } else if (archetype === 'insurance') {
    configs.push(
      { key: 'roe', label: 'Return on Equity (ROE)', direction: 'higher_is_better', unit: '%', getValue: f => f.roe },
      { key: 'priceToBook', label: 'Price / Book (P/B)', direction: 'lower_is_better', isMultiple: true, unit: 'x', getValue: f => f.priceToBook },
      { key: 'peRatio', label: 'P / E Ratio', direction: 'lower_is_better', isMultiple: true, unit: 'x', getValue: f => f.peRatio },
      { key: 'evToTrueFcf', label: 'EV / True FCF', direction: 'lower_is_better', isMultiple: true, unit: 'x', getValue: f => f.evToTrueFcf },
      { key: 'netCashToMarketCap', label: 'Net Cash / Mkt Cap', direction: 'higher_is_better', unit: '%', getValue: f => f.netCashToMarketCap }
    );
  } else if (archetype === 'homebuilder') {
    configs.push(
      { key: 'housingGrossMargin', label: 'Gross Margin (Housing)', direction: 'higher_is_better', unit: '%', getValue: f => f.housingGrossMargin ?? f.grossMargin },
      { key: 'roic', label: 'ROIC', direction: 'higher_is_better', unit: '%', getValue: f => f.roic },
      { key: 'netDebtToCapital', label: 'Net Debt / Capital', direction: 'lower_is_better', unit: '%', getValue: f => f.netDebtToCapital },
      { key: 'evToOwnerEarnings', label: 'EV / Owner Earnings', direction: 'lower_is_better', isMultiple: true, unit: 'x', getValue: f => f.evToOwnerEarnings ?? f.evToTrueFcf },
      { key: 'netCashToMarketCap', label: 'Net Cash / Mkt Cap', direction: 'higher_is_better', unit: '%', getValue: f => f.netCashToMarketCap }
    );
  } else if (archetype === 'reit') {
    configs.push(
      { key: 'dividendYield', label: 'Dividend Yield', direction: 'higher_is_better', unit: '%', getValue: f => f.dividendYield },
      { key: 'roe', label: 'Return on Equity (ROE)', direction: 'higher_is_better', unit: '%', getValue: f => f.roe },
      { key: 'peRatio', label: 'P / FFO (PE)', direction: 'lower_is_better', isMultiple: true, unit: 'x', getValue: f => f.peRatio },
      { key: 'priceToBook', label: 'Price / Book (P/B)', direction: 'lower_is_better', isMultiple: true, unit: 'x', getValue: f => f.priceToBook },
      { key: 'evToTrueFcf', label: 'EV / True FCF', direction: 'lower_is_better', isMultiple: true, unit: 'x', getValue: f => f.evToTrueFcf }
    );
  } else {
    // tech_platform, industrial_asset_heavy, standard_corporate
    configs.push(
      { key: 'grossMargin', label: 'Gross Margin', direction: 'higher_is_better', unit: '%', getValue: f => f.grossMargin },
      { key: 'operatingMargin', label: 'Operating Margin', direction: 'higher_is_better', unit: '%', getValue: f => f.operatingMargin },
      { key: 'roic', label: 'ROIC', direction: 'higher_is_better', unit: '%', getValue: f => f.roic },
      { key: 'evToOwnerEarnings', label: 'EV / Owner Earnings', direction: 'lower_is_better', isMultiple: true, unit: 'x', getValue: f => f.evToOwnerEarnings ?? f.evToTrueFcf },
      { key: 'netCashToMarketCap', label: 'Net Cash / Mkt Cap', direction: 'higher_is_better', unit: '%', getValue: f => f.netCashToMarketCap }
    );
  }

  const allEntities = [targetItem, ...peers];
  const rankings: PeerRankingMetric[] = [];

  for (const cfg of configs) {
    const targetVal = targetItem.financials ? cfg.getValue(targetItem.financials) : undefined;
    if (targetVal === undefined || isNaN(targetVal)) continue;

    // Collect all entities with valid numbers
    const validEntities: Array<{ name: string; ticker: string; val: number; isTarget: boolean }> = [];
    for (const ent of allEntities) {
      if (!ent.financials) continue;
      const v = cfg.getValue(ent.financials);
      if (v !== undefined && !isNaN(v)) {
        validEntities.push({
          name: ent.name,
          ticker: ent.ticker || ent.name,
          val: v,
          isTarget: ent.ticker === targetItem.ticker
        });
      }
    }

    if (validEntities.length === 0) continue;

    // Sort entities based on direction and multiple constraints
    validEntities.sort((a, b) => {
      if (cfg.isMultiple && cfg.direction === 'lower_is_better') {
        const aPos = a.val > 0;
        const bPos = b.val > 0;
        if (aPos && !bPos) return -1;
        if (!aPos && bPos) return 1;
        if (!aPos && !bPos) return 0;
        return a.val - b.val;
      }
      if (cfg.direction === 'higher_is_better') {
        return b.val - a.val;
      } else {
        return a.val - b.val;
      }
    });

    const targetIdx = validEntities.findIndex(e => e.isTarget);
    if (targetIdx === -1) continue;

    const rank = targetIdx + 1;
    const totalCount = validEntities.length;
    const leader = validEntities[0];

    // Compute peer median (excluding target)
    const peerVals = validEntities.filter(e => !e.isTarget).map(e => e.val).sort((a, b) => a - b);
    let peerMedian: number | undefined;
    if (peerVals.length > 0) {
      const mid = Math.floor(peerVals.length / 2);
      peerMedian = peerVals.length % 2 !== 0 ? peerVals[mid] : Math.round(((peerVals[mid - 1] + peerVals[mid]) / 2) * 100) / 100;
    }

    const formatVal = (v?: number) => {
      if (v === undefined || isNaN(v)) return '--';
      const formattedNum = (Math.round(v * 10) / 10).toString();
      if (cfg.unit === '%') {
        return cfg.key === 'netCashToMarketCap' && v > 0 ? `+${formattedNum}%` : `${formattedNum}%`;
      }
      if (cfg.unit === 'x') {
        return `${formattedNum}x`;
      }
      return `${formattedNum}${cfg.unit}`;
    };

    let verdict: PeerRankingMetric['verdict'] = 'MEDIAN';
    if (rank === 1) {
      verdict = 'LEADER';
    } else if (rank <= Math.ceil(totalCount / 2)) {
      verdict = 'TOP_QUARTILE';
    } else if (rank < totalCount) {
      verdict = 'MEDIAN';
    } else {
      verdict = 'LAGGING';
    }

    rankings.push({
      key: cfg.key,
      label: cfg.label,
      targetValue: targetVal,
      formattedTargetValue: formatVal(targetVal),
      rank,
      totalCount,
      peerMedian,
      formattedPeerMedian: peerMedian !== undefined ? formatVal(peerMedian) : '--',
      leaderName: leader.name,
      leaderTicker: leader.ticker,
      leaderValue: leader.val,
      formattedLeaderValue: formatVal(leader.val),
      direction: cfg.direction,
      verdict
    });
  }

  return rankings;
}

function formatSource(src?: string): string {
  if (src === 'proxy_peer') return 'SEC DEF 14A (CD&A)';
  if (src === '10k_risk') return '10-K Item 1 / 1A';
  if (src === 'transcript_qa') return 'Earnings Call Q&A';
  return 'Live Industry Grounding';
}

function generateCompetitorCsv(items: CompetitorItem[]): string {
  const headers = [
    "Ticker", "Company Name", "Type", "Source", "Classification", "Price", "Market Cap ($B)", "EV ($B)",
    "Gross Margin %", "Operating Margin %", "True FCF ($M)", "EV/True FCF", "D&A ($M)", "Maint CapEx ($M)", "Growth CapEx ($M)",
    "Owner Earnings ($M)", "EV/Owner Earnings", "P/Owner Earnings", "ROIC %", "Net Cash / Mkt Cap %", "Data Status"
  ];
  const rows = items.map(item => {
    const f = item.financials || {};
    return [
      `"${item.ticker || ''}"`,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${item.type}"`,
      `"${item.source}"`,
      `"${item.type === 'direct_public' ? 'Direct Competitor' : 'Target Anchor'}"`,
      f.price ?? '',
      f.marketCap ?? '',
      f.enterpriseValue ?? '',
      f.grossMargin ?? '',
      f.operatingMargin ?? '',
      f.trueFcf ?? '',
      f.evToTrueFcf ?? '',
      f.da ?? '',
      f.maintenanceCapex ?? '',
      f.growthCapex ?? '',
      f.ownerEarnings ?? '',
      f.evToOwnerEarnings ?? '',
      f.pToOwnerEarnings ?? '',
      f.roic ?? '',
      f.netCashToMarketCap ?? '',
      `"${item.provenanceStatus}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
