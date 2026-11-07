import React from "react";
import { 
  FileWarning, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  RefreshCw, 
  UploadCloud,
  FileSpreadsheet,
  Mic,
  Play,
  ArrowRight,
  Sparkles,
  Download,
  Radar
} from "lucide-react";
import { AuditCheck } from "../types.js";

interface MissingDocumentsModalProps {
  isOpen: boolean;
  targetTicker: string;
  targetPeriod: string;
  checklist: AuditCheck[];
  onClose: () => void;
  onOverrideProceed: () => void;
  onTriggerUpload: () => void;
  onRetrieveTranscript?: () => void;
  onRetrieveSec?: () => void;
  onRetrieveFmp?: () => void;
  onRetrieveAll?: () => void;
  onHarvestCompetitorRadar?: () => void;
  isRadarLoading?: boolean;
  isTranscriptLoading?: boolean;
  isSecLoading?: boolean;
  isFmpLoading?: boolean;
  isPullAllLoading?: boolean;
  pullAllProgress?: string;
}

export default function MissingDocumentsModal({
  isOpen,
  targetTicker,
  targetPeriod,
  checklist,
  onClose,
  onOverrideProceed,
  onTriggerUpload,
  onRetrieveTranscript,
  onRetrieveSec,
  onRetrieveFmp,
  onRetrieveAll,
  onHarvestCompetitorRadar,
  isRadarLoading = false,
  isTranscriptLoading = false,
  isSecLoading = false,
  isFmpLoading = false,
  isPullAllLoading = false,
  pullAllProgress = ""
}: MissingDocumentsModalProps) {
  if (!isOpen) return null;

  const missingItems = checklist.filter(c => c.status === "MISSING");
  const confirmedItems = checklist.filter(c => c.status === "CONFIRMED");

  if (missingItems.length === 0) return null;

  const getCategoryDetails = (category: string) => {
    switch (category) {
      case "Transcript":
        return {
          icon: <Mic className="w-5 h-5 text-purple-400" />,
          colorClass: "border-purple-500/30 bg-purple-950/20 text-purple-300",
          tag: "EARNINGS CALL TRANSCRIPT",
          rationale: "Essential for evaluating management commentary, tone, forward guidance veracity, and analyst Q&A cross-examination.",
          fetchAction: onRetrieveTranscript,
          fetchLabel: isTranscriptLoading ? "Fetching Transcript..." : "Auto-Fetch Transcript",
          isLoading: isTranscriptLoading
        };
      case "Financials TTM":
        return {
          icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
          colorClass: "border-emerald-500/30 bg-emerald-950/20 text-emerald-300",
          tag: "FINANCIAL STATEMENTS (TTM / 10-YR)",
          rationale: "Essential for DCF valuation inputs, historical margin trends, ROIC calculation, and balance sheet capital structure analysis.",
          fetchAction: onRetrieveFmp,
          fetchLabel: isFmpLoading ? "Pulling Financials..." : "Auto-Pull Financials (FMP)",
          isLoading: isFmpLoading
        };
      case "10-Q":
        return {
          icon: <FileText className="w-5 h-5 text-cyan-400" />,
          colorClass: "border-cyan-500/30 bg-cyan-950/20 text-cyan-300",
          tag: "QUARTERLY REPORT (10-Q / 6-K)",
          rationale: "Essential for the latest quarterly financial footnotes, interim balance sheet changes, and segment revenue disclosures.",
          fetchAction: onRetrieveSec,
          fetchLabel: isSecLoading ? "Downloading SEC..." : "Auto-Fetch SEC Filings",
          isLoading: isSecLoading
        };
      case "10-K":
        return {
          icon: <FileText className="w-5 h-5 text-blue-400" />,
          colorClass: "border-blue-500/30 bg-blue-950/20 text-blue-300",
          tag: "ANNUAL REPORT (10-K / 20-F / 40-F)",
          rationale: "Essential for comprehensive annual risk factors, long-term debt schedules, accounting policies, and MD&A context.",
          fetchAction: onRetrieveSec,
          fetchLabel: isSecLoading ? "Downloading SEC..." : "Auto-Fetch SEC Filings",
          isLoading: isSecLoading
        };
      case "Competitor Radar":
        return {
          icon: <Radar className="w-5 h-5 text-cyan-400" />,
          colorClass: "border-cyan-500/30 bg-cyan-950/20 text-cyan-300",
          tag: "COMPETITOR MOAT & VALUATION RADAR",
          rationale: "Essential for peer benchmarking, relative valuation multiples (EV/True FCF, EV/Owner Earnings), and moat differentiation. Running without competitor research risks evaluating the business in a vacuum.",
          fetchAction: onHarvestCompetitorRadar,
          fetchLabel: isRadarLoading ? "Harvesting Radar..." : "Harvest Competitor Radar",
          isLoading: isRadarLoading
        };
      default:
        return {
          icon: <FileText className="w-5 h-5 text-amber-400" />,
          colorClass: "border-amber-500/30 bg-amber-950/20 text-amber-300",
          tag: (category || '').toUpperCase(),
          rationale: "Required for complete terminal analysis synthesis.",
          fetchAction: undefined,
          fetchLabel: undefined,
          isLoading: false
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0d111a] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-[#131825] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileWarning className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-mono">
                  Pre-Flight Audit Warning
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">
                  {missingItems.length} FILE{missingItems.length > 1 ? "S" : ""} MISSING
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Required Filings & Documents Safeguard Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto font-sans text-xs leading-relaxed text-slate-300">
          {/* Target Config Summary Banner */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#080b11] border border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Target Company</span>
              <span className="text-base font-bold font-mono text-white tracking-wide">{targetTicker || "UNSPECIFIED"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Target Period</span>
              <span className="text-base font-bold font-mono text-cyan-400 tracking-wide">{targetPeriod || "UNSPECIFIED"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Staging Status</span>
              <span className="text-sm font-bold font-mono text-amber-400 tracking-wide">
                {confirmedItems.length} / {checklist.length} Confirmed
              </span>
            </div>
          </div>

          {/* Core Warning Alert */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Mandatory Research Documents Missing:</span>
            </div>
            <p className="text-[11px] text-slate-300">
              The Value Investing Terminal requires key filings to perform accurate valuation modeling, cash flow reconciliation, and executive commentary cross-checks. Executing without these files will result in gaps in qualitative tone analysis or quantitative DCF precision.
            </p>
          </div>

          {/* Master 1-Click Pull All Button */}
          {onRetrieveAll && (
            <button
              type="button"
              onClick={onRetrieveAll}
              disabled={isPullAllLoading || isTranscriptLoading || isSecLoading || isFmpLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-[#10B981] to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#0d1117] font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:pointer-events-none group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-black/15 text-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider font-mono font-bold flex items-center gap-2">
                    <span>Pull All Documents (1-Click Auto-Sync)</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-black/20 text-black rounded font-mono font-semibold">ALL-IN-ONE</span>
                  </div>
                  <div className="text-[10px] text-[#0d1117]/80 font-mono font-medium">
                    {isPullAllLoading ? (pullAllProgress || "Fetching documents...") : `Auto-fetches SEC Filings, Financials CSV, and Transcript for ${targetTicker}`}
                  </div>
                </div>
              </div>
              <div className="shrink-0 pl-2">
                {isPullAllLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0d1117]" />
                ) : (
                  <Download className="w-4 h-4 text-[#0d1117] group-hover:scale-110 transition-transform" />
                )}
              </div>
            </button>
          )}

          {/* Missing Items Action List */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Action Required — Stage or Auto-Retrieve Missing Documents:
            </span>

            {missingItems.map(item => {
              const details = getCategoryDetails(item.category);
              return (
                <div 
                  key={item.category}
                  className="p-4 rounded-xl border border-slate-800 bg-[#0c1017] hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-[#141926] border border-slate-800 shrink-0 mt-0.5">
                      {details.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-white text-xs">
                          {item.label || item.category}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded">
                          MISSING
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {details.rationale}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this item */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {details.fetchAction && details.fetchLabel && (
                      <button
                        onClick={details.fetchAction}
                        disabled={details.isLoading}
                        className="px-3 py-1.5 bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/40 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {details.isLoading ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        <span>{details.fetchLabel}</span>
                      </button>
                    )}
                    <button
                      onClick={onTriggerUpload}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                      title="Upload local file"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Already Confirmed Items */}
          {confirmedItems.length > 0 && (
            <div className="p-3 rounded-xl bg-[#080b11] border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2 font-semibold">
                Already Staged & Confirmed ({confirmedItems.length}):
              </span>
              <div className="space-y-1.5">
                {confirmedItems.map(c => (
                  <div key={c.category} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{c.label || c.category}:</span>
                    <span className="font-mono text-[10px] text-slate-400 truncate">
                      {c.matchedFiles.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-[#131825] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onTriggerUpload}
              className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#10B981]" />
              <span>Upload Files</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onRetrieveAll && (
              <button
                type="button"
                onClick={onRetrieveAll}
                disabled={isPullAllLoading}
                className="w-full sm:w-auto px-4 py-2 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/40 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                title="Automatically download missing files for target company"
              >
                {isPullAllLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isPullAllLoading ? (pullAllProgress || "Downloading...") : `Download Missing Files (${missingItems.length})`}</span>
              </button>
            )}

            <button
              onClick={onOverrideProceed}
              className="w-full sm:w-auto px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Force-run analysis without missing required files"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Proceed Without Files</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
