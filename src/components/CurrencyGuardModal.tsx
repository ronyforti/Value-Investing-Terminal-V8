import React from "react";
import { 
  ShieldAlert, 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  TrendingUp, 
  HelpCircle,
  Layers
} from "lucide-react";
import { CurrencyAuditResult } from "../types.js";

interface CurrencyGuardModalProps {
  isOpen: boolean;
  audit: CurrencyAuditResult | null;
  onHarmonize: () => void;
  onUseRaw: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function CurrencyGuardModal({
  isOpen,
  audit,
  onHarmonize,
  onUseRaw,
  onCancel,
  isProcessing = false
}: CurrencyGuardModalProps) {
  if (!isOpen || !audit) return null;

  const uniqueCurrencies = Array.from(new Set(audit.currenciesFound));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0d111a] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-[#131825] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-mono">
                  Institutional Multi-Currency Safeguard
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ADR Statement Audit & Operational Currency Preservation
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Cancel upload"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto font-sans text-xs leading-relaxed text-slate-300">
          {/* Target & Currency Stats Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-[#080b11] border border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Target Symbol</span>
              <span className="text-sm font-bold font-mono text-white">{audit.ticker || "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Home Currency</span>
              <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
                {audit.homeCurrency}
                <span className="text-[10px] font-normal text-emerald-500/70">(Native)</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Spot FX Rate</span>
              <span className="text-sm font-bold font-mono text-cyan-400">
                1 USD = {audit.fxRate.toFixed(2)} {audit.homeCurrency}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">CSV Currencies</span>
              <span className="text-sm font-bold font-mono text-amber-300">
                {uniqueCurrencies.join(", ") || "Mixed"}
              </span>
            </div>
          </div>

          {/* Anomaly Breakdown Box */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200/90 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Statement Discrepancy Identified in File:</span>
            </div>
            <p className="text-[11px] text-amber-300/80 font-mono break-all pl-6">
              "{audit.fileName}"
            </p>
            <ul className="list-disc pl-10 space-y-1 text-[11px] text-amber-200/80">
              {audit.hasMixedCurrencies && (
                <li>
                  Data provider mixed USD (recent periods) with native {audit.homeCurrency} (historical periods), corrupting trend CAGR.
                </li>
              )}
              {audit.hasBsMismatch && audit.mismatches.map((m, idx) => (
                <li key={idx}>
                  <strong className="text-amber-300">{m.item}</strong>: {m.description}
                </li>
              ))}
              {audit.details.map((d, idx) => (
                <li key={`d-${idx}`}>{d}</li>
              ))}
            </ul>
          </div>

          {/* Value Investing Framework Rationale */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Institutional Value Investing Framework Rationale:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300/90">
              Translating 10-year historical financials into USD at past fluctuating exchange rates severely distorts operational metrics (sales CAGR, operating margins, and Bruce Greenwald's Return on Retained Capital) due to macro currency depreciation.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-300/90">
              By harmonizing all 10 periods into pure <strong>{audit.homeCurrency}</strong>, 100% of currency fluctuation noise is eliminated from the business evaluation. Section 12 will convert final Intrinsic Value to USD at current Spot FX (<strong>1 USD = {audit.fxRate.toFixed(2)} {audit.homeCurrency}</strong>) to compare directly against the US ADR market price.
            </p>
          </div>

          {/* Action Options Prompt */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block tracking-wider">
              Select Desired Action for this File:
            </span>

            {/* Option 1: Harmonize (Recommended) */}
            <button
              type="button"
              onClick={onHarmonize}
              disabled={isProcessing}
              className="w-full p-3 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 hover:border-emerald-400 rounded-xl text-left transition-all group flex items-start justify-between cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-300 text-xs">
                      Harmonize to Home Currency ({audit.homeCurrency})
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-200/70 mt-0.5 leading-normal">
                    Converts USD quarters back to native {audit.homeCurrency} using live Spot FX. Aligns all 10 historical years with audited Form 20-F. Eliminates FX volatility.
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
            </button>

            {/* Option 2: Keep Raw File */}
            <button
              type="button"
              onClick={onUseRaw}
              disabled={isProcessing}
              className="w-full p-3 bg-slate-900/40 hover:bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 rounded-xl text-left transition-all group flex items-start justify-between cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-medium text-slate-200 text-xs">
                    Keep Original Raw File
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                    Bypass harmonization and stage the unmodified CSV file with mixed currency headers as-is.
                  </p>
                </div>
              </div>
            </button>

            {/* Option 3: Cancel */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full py-2 bg-transparent hover:bg-red-950/20 border border-transparent hover:border-red-900/40 text-slate-400 hover:text-red-400 rounded-xl text-center text-xs font-mono transition-all cursor-pointer"
            >
              Cancel / Abort File Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
