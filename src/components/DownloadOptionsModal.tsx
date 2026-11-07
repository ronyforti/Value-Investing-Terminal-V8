import React from "react";
import { 
  DownloadCloud, 
  RefreshCw, 
  Sparkles, 
  XCircle 
} from "lucide-react";

interface DownloadOptionsModalProps {
  isOpen: boolean;
  targetTicker: string;
  targetPeriod: string;
  missingCategories: string[];
  confirmedCount: number;
  totalRequired: number;
  isLoading: boolean;
  loadingProgress?: string;
  onDownloadMissing: () => void;
  onDownloadAll: () => void;
  onClose: () => void;
}

export default function DownloadOptionsModal({
  isOpen,
  targetTicker,
  targetPeriod,
  missingCategories,
  confirmedCount,
  totalRequired,
  isLoading,
  loadingProgress,
  onDownloadMissing,
  onDownloadAll,
  onClose
}: DownloadOptionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0d111a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-[#131825] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-mono">
                  Document Retrieval Options
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Choose retrieval scope for {targetTicker || "Target Company"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Close dialog"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 font-sans text-xs text-slate-300">
          {/* Staging Summary */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#080b11] border border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Target</span>
              <span className="text-sm font-bold font-mono text-white">{targetTicker || "----"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Period</span>
              <span className="text-sm font-bold font-mono text-cyan-400">{targetPeriod || "----"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Repository</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {confirmedCount} / {totalRequired} Ready
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 rounded-xl bg-[#080b11] border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
              <RefreshCw className="w-8 h-8 text-[#10B981] animate-spin" />
              <div className="font-mono text-xs text-emerald-400 font-semibold animate-pulse">
                {loadingProgress || "Retrieving and converting documents..."}
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Extracting filings, computing 10-year financials, and formatting earnings transcript.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Option 1: Download Missing Only */}
              <button
                type="button"
                onClick={onDownloadMissing}
                className="w-full text-left p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/15 hover:bg-emerald-950/30 hover:border-emerald-500/70 transition-all cursor-pointer group flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                      Download Missing Only
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-mono font-bold rounded uppercase">
                        Recommended
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400/80">
                      {missingCategories.length} file{missingCategories.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {missingCategories.length > 0 ? (
                      <>Only retrieves missing categories: <span className="font-semibold text-emerald-400 font-mono">{missingCategories.join(", ")}</span>. Preserves existing files and avoids redundant API calls.</>
                    ) : (
                      <>All required categories are already staged. Checks and confirms repository status.</>
                    )}
                  </p>
                </div>
              </button>

              {/* Option 2: Re-download All */}
              <button
                type="button"
                onClick={onDownloadAll}
                className="w-full text-left p-4 rounded-xl border border-slate-700/80 bg-slate-900/40 hover:bg-slate-850 hover:border-cyan-500/40 transition-all cursor-pointer group flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-200">
                      Re-Download Everything
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Full Refresh</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Overwrites and pulls all Form 10-K, 10-Q, FMP Financials CSV, and Transcript from scratch.
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800/80 bg-[#131825] flex items-center justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
