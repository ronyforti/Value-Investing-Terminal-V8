import { CurrencyAuditResult, CurrencyAuditMismatch } from "./types.js";

/**
 * Universal Multi-Currency Safeguard Engine for Value Investing Terminal.
 * Supports 160+ global currencies dynamically via real-time Open Exchange rates.
 * Audits financial CSVs, preserves native Home Currency to eliminate exchange
 * rate fluctuation noise from 10-year operational metrics and audited longitudinal RORC,
 * and provides full transparency with interactive decision workflows.
 */

// Fallback rates against 1 USD in case external network is unreachable
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  CAD: 1.376,
  BRL: 5.18,
  EUR: 0.856,
  GBP: 0.733,
  JPY: 158.95,
  KRW: 1385.74,
  INR: 84.0,
  MXN: 18.0057,
  AUD: 1.40,
  CHF: 0.801,
  HKD: 7.84,
  TWD: 31.81,
  CNY: 7.15,
  SEK: 9.80,
  NOK: 9.90,
  DKK: 6.38,
  SGD: 1.28,
  ZAR: 17.50,
  ILS: 3.65,
  CLP: 930.0,
  COP: 4100.0,
  NZD: 1.65,
  TRY: 33.50,
  IDR: 16200.0,
  PLN: 3.95,
  THB: 36.50,
  MYR: 4.70,
  PHP: 58.50,
  SAR: 3.75,
  AED: 3.67
};

let cachedFxRates: Record<string, number> = { ...FALLBACK_RATES };
let lastFxFetchTimestamp = 0;
const FX_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

export async function fetchLiveFxRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (now - lastFxFetchTimestamp < FX_CACHE_TTL_MS && Object.keys(cachedFxRates).length > 25) {
    return cachedFxRates;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as any;
      if (data && data.rates && typeof data.rates === "object") {
        cachedFxRates = { ...FALLBACK_RATES, ...data.rates, USD: 1.0 };
        lastFxFetchTimestamp = now;
        console.log(`[CurrencyGuard] Successfully updated live FX rates for ${Object.keys(cachedFxRates).length} currencies.`);
        return cachedFxRates;
      }
    }
  } catch (err) {
    console.warn("[CurrencyGuard] Could not fetch live FX rates, using reliable fallbacks.", (err as any)?.message || err);
  }

  return cachedFxRates;
}

export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  const lines = csvText.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

export function formatCsvRows(rows: string[][]): string {
  return rows
    .map(row =>
      row
        .map(cell => {
          const s = String(cell ?? "");
          if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(",")
    )
    .join("\r\n");
}

export async function auditFinancialCsv(
  csvContent: string,
  fileName: string,
  ticker?: string
): Promise<CurrencyAuditResult> {
  const rates = await fetchLiveFxRates();
  const safeTicker = (ticker || "").trim().toUpperCase();
  const result: CurrencyAuditResult = {
    fileName,
    ticker: safeTicker,
    hasForeignCurrency: false,
    hasMixedCurrencies: false,
    hasBsMismatch: false,
    homeCurrency: "USD",
    currenciesFound: [],
    fxRate: 1.0,
    requiresAction: false,
    mismatches: [],
    details: []
  };

  if (!csvContent || csvContent.length < 50) {
    result.details.push("CSV content is empty or insufficient.");
    return result;
  }

  const rows = parseCsvRows(csvContent);
  if (rows.length < 5) {
    result.details.push("CSV contains too few rows for statement audit.");
    return result;
  }

  // Look for reportedCurrency row(s) across all statements and segments
  const currencyRowIndices: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const firstCell = rows[i][0]?.trim().toLowerCase();
    if (firstCell === "reportedcurrency" || firstCell === "reported_currency" || firstCell === "currency") {
      currencyRowIndices.push(i);
    }
  }

  let rawCurrencies: string[] = [];
  if (currencyRowIndices.length > 0) {
    for (const idx of currencyRowIndices) {
      const rowCurs = rows[idx]
        .slice(1)
        .map(c => (c || "").trim().toUpperCase())
        .filter(c => c.length > 0 && c !== "NAN" && c !== "NULL");
      if (rawCurrencies.length === 0) {
        rawCurrencies = rowCurs;
      } else {
        for (let j = 0; j < rowCurs.length; j++) {
          if (rowCurs[j] && !rawCurrencies[j]) rawCurrencies[j] = rowCurs[j];
          else if (rowCurs[j] && rowCurs[j] !== "USD" && rawCurrencies[j] === "USD") rawCurrencies[j] = rowCurs[j];
        }
      }
    }
  } else {
    result.details.push("No explicit reportedCurrency row detected; scanning cell markers.");
  }

  result.currenciesFound = rawCurrencies;

  const nonUsd = rawCurrencies.filter(c => c !== "USD");
  result.hasForeignCurrency = nonUsd.length > 0;
  result.hasMixedCurrencies = (rawCurrencies.includes("USD") && nonUsd.length > 0) || new Set(rawCurrencies).size > 1;

  if (nonUsd.length > 0) {
    const counts: Record<string, number> = {};
    for (const cur of nonUsd) {
      counts[cur] = (counts[cur] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    result.homeCurrency = sorted[0][0];
    result.fxRate = rates[result.homeCurrency] || FALLBACK_RATES[result.homeCurrency] || 1.0;
  } else if (result.currenciesFound.length > 0) {
    result.homeCurrency = result.currenciesFound[0] || "USD";
    result.fxRate = rates[result.homeCurrency] || FALLBACK_RATES[result.homeCurrency] || 1.0;
  }

  // Detect Balance Sheet unit mismatch (e.g. Cash in local currency while Debt or Income statement is in USD)
  if (result.hasForeignCurrency && result.fxRate > 1.5) {
    for (const row of rows) {
      const key = row[0]?.trim();
      if (key === "cashAndCashEquivalents" || key === "cashAndShortTermInvestments") {
        const val1 = row[1];
        if (val1) {
          const num = parseFloat(val1);
          if (!isNaN(num) && num > 50000) {
            result.hasBsMismatch = true;
            result.mismatches.push({
              item: key,
              description: `Already reported in native ${result.homeCurrency} (${num.toLocaleString()}) while neighboring periods were translated to USD.`
            });
          }
        }
      }
    }
  }

  result.requiresAction = result.hasMixedCurrencies || result.hasBsMismatch;

  if (result.requiresAction) {
    result.details.push(
      `Detected mixed/foreign currencies (${Array.from(new Set(result.currenciesFound)).join(", ")}). Preserving native Home Currency (${result.homeCurrency}) removes multi-year FX volatility from operational analysis.`
    );
  } else {
    result.details.push("Clean single-currency financials. No harmonization required.");
  }

  return result;
}

export function harmonizeFinancialCsv(
  csvContent: string,
  audit: CurrencyAuditResult
): { harmonizedCsv: string; newFileName: string } {
  if (!audit.requiresAction || !csvContent) {
    return { harmonizedCsv: csvContent, newFileName: audit.fileName };
  }

  const rows = parseCsvRows(csvContent);
  const currencyRowIndices: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const firstCell = rows[i][0]?.trim().toLowerCase();
    if (firstCell === "reportedcurrency" || firstCell === "reported_currency" || firstCell === "currency") {
      currencyRowIndices.push(i);
    }
  }

  const currencies = audit.currenciesFound;
  const homeCur = audit.homeCurrency;
  const fxRate = audit.fxRate;

  const META_EXCLUDE = new Set([
    "period ending",
    "symbol",
    "cik",
    "filingdate",
    "accepteddate",
    "fiscalquarter",
    "fiscalyear",
    "reportedcurrency",
    "reported_currency"
  ]);

  const SHARE_KEYS = new Set([
    "weightedaverageshsout",
    "weightedaverageshsoutdil",
    "weighted_average_shs_out",
    "weighted_average_shs_out_dil",
    "shares",
    "shsout"
  ]);

  const harmonizedRows = rows.map(r => [...r]);

  for (let rIdx = 0; rIdx < harmonizedRows.length; rIdx++) {
    const row = harmonizedRows[rIdx];
    const key = (row[0] || "").trim();
    const keyLower = key.toLowerCase();

    if (key.endsWith(":") || META_EXCLUDE.has(keyLower)) {
      continue;
    }

    const isShareMetric = Array.from(SHARE_KEYS).some(k => keyLower.includes(k));
    if (isShareMetric) {
      continue;
    }

    for (let cIdx = 1; cIdx < row.length; cIdx++) {
      const cur = currencies[cIdx - 1] || "USD";
      const cellVal = row[cIdx];
      if (!cellVal || cellVal === "null" || cellVal === "undefined" || cellVal === "NaN") {
        continue;
      }

      const numVal = parseFloat(cellVal);
      if (isNaN(numVal)) continue;

      // If column was translated to USD and home currency is foreign, convert BACK to Home Currency
      if (cur === "USD" && homeCur !== "USD") {
        if (
          (key === "cashAndCashEquivalents" || key === "cashAndShortTermInvestments") &&
          numVal > 50000
        ) {
          // Already in native currency
          continue;
        }

        const converted = numVal * fxRate;
        harmonizedRows[rIdx][cIdx] = converted % 1 === 0 ? String(converted) : converted.toFixed(4);
      }
    }
  }

  // Update all reportedCurrency rows across statements and segments to declare pure Home Currency
  for (const cIdxRow of currencyRowIndices) {
    for (let cIdx = 1; cIdx < harmonizedRows[cIdxRow].length; cIdx++) {
      harmonizedRows[cIdxRow][cIdx] = `${homeCur} (Home Currency)`;
    }
  }

  const baseSymbol = audit.ticker || "COMPANY";
  const newFileName = `${baseSymbol}_Financials-TTM_${homeCur}.csv`;

  return {
    harmonizedCsv: formatCsvRows(harmonizedRows),
    newFileName
  };
}
