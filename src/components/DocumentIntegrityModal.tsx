import React from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  RefreshCw, 
  ArrowRight,
  Play,
  HelpCircle,
  Trash2,
  Eye
} from "lucide-react";
import { DocumentIntegrityReport } from "../types.js";

interface DocumentIntegrityModalProps {
  isOpen: boolean;
  report: DocumentIntegrityReport | null;
  onFixFiles: () => void;
  onSyncConfig: (suggestedTicker?: string, suggestedPeriod?: string) => void;
  onOverride: () => void;
  onPurgeMismatches?: () => void;
  onPreviewFile?: (file: any) => void;
}

export default function DocumentIntegrityModal({
  isOpen,
  report,
  onFixFiles,
  onSyncConfig,
  onOverride,
  onPurgeMismatches,
  onPreviewFile
}: DocumentIntegrityModalProps) {
  if (!isOpen || !report) return null;

  // Find most common detected ticker and period among files to suggest sync
  const detectedTickers = Object.values(report.fileAudits)
    .map(a => a.detectedTicker)
    .filter((t): t is string => Boolean(t && t !== report.targetTicker));
  const suggestedTicker = detectedTickers.length > 0 ? detectedTickers[0] : undefined;

  const detectedPeriods = Object.values(report.fileAudits)
    .map(a => a.detectedPeriod)
    .filter((p): p is string => Boolean(p && !p.startsWith("FY") && p !== report.targetPeriod));
  const suggestedPeriod = detectedPeriods.length > 0 ? detectedPeriods[0] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0d111a] border-0 sm:border sm:border-amber-500/40 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800/80 bg-[#131825] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-mono">
                  Document Integrity Safeguard
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full">
                  MISMATCH DETECTED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Company & Reporting Period Verification Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onFixFiles}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal and fix files"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto font-sans text-xs leading-relaxed text-slate-300">
          {/* Target Config Summary Banner */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#080b11] border border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Configured Target Ticker</span>
              <span className="text-base font-bold font-mono text-white tracking-wide">{report.targetTicker || "UNSPECIFIED"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Configured Target Period</span>
              <span className="text-base font-bold font-mono text-cyan-400 tracking-wide">{report.targetPeriod || "UNSPECIFIED"}</span>
            </div>
          </div>

          {/* Mismatch Alerts Box */}
          {report.mismatches.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-200/90 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold font-mono text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Critical Document Mismatches ({report.mismatches.length}):</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-[11px]">
                {report.mismatches.map((m, idx) => (
                  <li key={idx}>
                    <strong className="text-rose-300 font-mono">{m.issue}</strong>:{" "}
                    <span className="text-slate-300">"{m.fileName}"</span> — Expected{" "}
                    <span className="text-emerald-400 font-mono font-semibold">{m.expected}</span>, but detected{" "}
                    <span className="text-rose-400 font-mono font-semibold">{m.actual}</span>.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Staged Documents Audit Table */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Staged Documents Integrity Matrix</span>
            </h3>
            <div className="border border-slate-800/80 rounded-xl overflow-x-auto bg-[#080b11]">
              <table className="min-w-[480px] w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-900/70 border-b border-slate-800/80 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="py-2 px-3">File / Category</th>
                    <th className="py-2 px-2">Company</th>
                    <th className="py-2 px-2">Period</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    {onPreviewFile && <th className="py-2 px-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {Object.values(report.fileAudits).map((audit, idx) => {
                    const isCompanyMismatch = audit.companyMatch === "MISMATCH";
                    const isPeriodMismatch = audit.periodMatch === "MISMATCH";
                    const isAllGood = audit.companyMatch === "MATCH" && audit.periodMatch === "MATCH";

                    return (
                      <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-2 px-3 font-sans">
                          <div className="font-semibold text-slate-200 truncate max-w-[220px]" title={audit.fileName}>
                            {audit.fileName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{audit.category}</div>
                        </td>
                        <td className="py-2 px-2">
                          {audit.detectedTicker ? (
                            <span className={isCompanyMismatch ? "text-rose-400 font-bold" : "text-emerald-400"}>
                              {audit.detectedTicker}
                            </span>
                          ) : (
                            <span className="text-slate-500">Unspecified</span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {audit.detectedPeriod ? (
                            <span className={isPeriodMismatch ? "text-rose-400 font-bold" : "text-emerald-400"}>
                              {audit.detectedPeriod}
                            </span>
                          ) : (
                            <span className="text-slate-500">Unspecified</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isAllGood ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> MATCH
                            </span>
                          ) : isCompanyMismatch || isPeriodMismatch ? (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[10px]">
                              <XCircle className="w-3 h-3" /> DISCREPANCY
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 text-[10px]">
                              <AlertTriangle className="w-3 h-3" /> UNVERIFIED
                            </span>
                          )}
                        </td>
                        {onPreviewFile && (
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => onPreviewFile({
                                id: audit.fileName,
                                name: audit.fileName,
                                auditCategory: audit.category
                              })}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 text-[10px] font-mono cursor-pointer transition shadow-sm"
                              title={`Preview ${audit.fileName}`}
                            >
                              <Eye className="w-3 h-3 text-cyan-400" />
                              <span>Preview</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-start gap-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Analyzing documents from mismatched reporting periods or companies corrupts trailing twelve months (TTM) calculations, Moat Trajectory evaluations, and intrinsic valuation models.
            </span>
          </div>
        </div>

        {/* Footer Decision Buttons */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-800/80 bg-[#131825] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={onFixFiles}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Fix Staged Files</span>
            </button>

            {onPurgeMismatches && report.mismatches.length > 0 && (
              <button
                type="button"
                onClick={onPurgeMismatches}
                className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="Automatically purge mismatched files from the staged repository"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Mismatches ({report.mismatches.length})</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {(suggestedTicker || suggestedPeriod) && (
              <button
                onClick={() => onSyncConfig(suggestedTicker, suggestedPeriod)}
                className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                title={`Sync terminal target configuration to detected: ${suggestedTicker || report.targetTicker} ${suggestedPeriod || report.targetPeriod}`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Sync Config to {suggestedPeriod ? `"${suggestedPeriod}"` : ""} {suggestedTicker ? `("${suggestedTicker}")` : ""}
                </span>
              </button>
            )}

            <button
              onClick={onOverride}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="Deliberately proceed with analysis despite document discrepancies"
            >
              <Play className="w-3.5 h-3.5 text-rose-400" />
              <span>Override & Proceed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
