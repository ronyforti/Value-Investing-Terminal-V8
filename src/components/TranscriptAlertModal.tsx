import React from "react";
import { 
  MicOff, 
  ExternalLink, 
  X, 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";

interface TranscriptAlertModalProps {
  isOpen: boolean;
  ticker: string;
  period?: string;
  message?: string;
  provider?: "auto" | "tikr" | "stockanalysis";
  onClose: () => void;
  onProceedAnyway?: () => void;
}

export default function TranscriptAlertModal({
  isOpen,
  ticker,
  period,
  message,
  provider = "auto",
  onClose,
  onProceedAnyway
}: TranscriptAlertModalProps) {
  if (!isOpen) return null;

  const symbol = (ticker || "").toUpperCase();
  const stockAnalysisUrl = `https://stockanalysis.com/stocks/${symbol.toLowerCase()}/transcripts/`;
  const tikrUrl = `https://app.tikr.com`;

  const providerLabel = provider === "tikr" 
    ? "TIKR (S&P Capital IQ)" 
    : provider === "stockanalysis" 
      ? "StockAnalysis.com" 
      : "TIKR & Stock Analysis";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0d111a] border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-[#14121a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <MicOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-mono">
                Transcript Not Ready
              </h2>
              <p className="text-[11px] text-amber-300/80 font-sans mt-0.5">
                {symbol} {period ? `(${period})` : ""} • {providerLabel}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs font-sans">
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-amber-200 font-semibold">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Verbatim Call Dialogue Not Yet Available</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {message || `Verbatim transcript for ${symbol} (${period || "latest"}) is not published yet.`}
            </p>
          </div>

          <div className="bg-[#0b0e15] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-200 font-mono text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Zero-Search Institutional Directive Enforced</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Google Gemini web search fallback has been disabled per user mandate. Transcripts are ingested strictly from authoritative verbatim sources (TIKR S&P Capital IQ or Stock Analysis) to preserve speaker attribution and avoid hallucinations.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500 font-mono">Check availability directly:</span>
              <div className="flex items-center gap-2">
                <a
                  href={tikrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-lg transition"
                >
                  <span>TIKR App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={stockAnalysisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 rounded-lg transition"
                >
                  <span>Stock Analysis</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800/80 bg-[#131825] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs font-mono transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Close & Wait</span>
          </button>

          {onProceedAnyway && (
            <button
              type="button"
              onClick={onProceedAnyway}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-semibold rounded-xl text-[11px] font-mono transition cursor-pointer"
            >
              <span>Proceed with SEC Filings Only</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
