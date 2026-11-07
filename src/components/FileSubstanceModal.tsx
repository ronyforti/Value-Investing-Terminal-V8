import React from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  Eye, 
  X, 
  ArrowLeft, 
  Play,
  FileWarning
} from "lucide-react";
import { FileSubstanceIssue } from "../types.js";

interface FileSubstanceModalProps {
  isOpen: boolean;
  issues: FileSubstanceIssue[];
  onClose: () => void;
  onProceedAnyway: () => void;
  onPreviewFile?: (file: any) => void;
}

export default function FileSubstanceModal({
  isOpen,
  issues,
  onClose,
  onProceedAnyway,
  onPreviewFile
}: FileSubstanceModalProps) {
  if (!isOpen || !issues || issues.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0d111a] border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-[#14121a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-mono">
                  Pre-Flight Warning: Incomplete / Truncated Document
                </h2>
                <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-full font-mono font-bold">
                  {issues.length} Flagged
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80 font-sans mt-0.5">
                Analytical run paused to protect against degraded findings and wasted API quota.
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Explanation Banner */}
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-300 leading-relaxed text-[11px]">
              <p className="font-semibold text-amber-200">
                Suspiciously small source document detected
              </p>
              <p>
                The analytical engine requires complete verbatim filings and transcripts to extract audited metrics. 
                Running with preview stubs or truncated HTML files produces incomplete analysis and consumes Gemini API quota.
              </p>
            </div>
          </div>

          {/* List of Flagged Files */}
          <div className="space-y-2.5">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Flagged Files ({issues.length})
            </h3>
            <div className="space-y-2">
              {issues.map((issue, idx) => (
                <div 
                  key={idx}
                  className="bg-[#0b0e15] border border-amber-500/30 rounded-xl p-3.5 space-y-2 hover:border-amber-500/50 transition"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileWarning className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-mono font-semibold text-slate-200 truncate" title={issue.fileName}>
                        {issue.fileName}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700 shrink-0">
                        {issue.category}
                      </span>
                    </div>

                    {onPreviewFile && (
                      <button
                        type="button"
                        onClick={() => onPreviewFile({ id: issue.fileName, name: issue.fileName, auditCategory: issue.category })}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition cursor-pointer shrink-0"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>Preview File</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-amber-400 font-bold bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                      {issue.tokens ? `${issue.tokens.toLocaleString()} tokens` : `${Math.round(issue.size / 1024)} KB`}
                    </span>
                    <span className="text-slate-500">
                      (Minimum expected: ~{issue.expectedMinTokens.toLocaleString()} tokens)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed bg-[#111624] p-2.5 rounded-lg border border-slate-800">
                    {issue.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800/80 bg-[#131825] flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-xl text-xs font-mono transition cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel Run & Fix Documents</span>
          </button>

          <button
            type="button"
            onClick={onProceedAnyway}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 hover:border-rose-800/60 border border-slate-700 rounded-xl text-[11px] font-mono transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Override & Proceed Anyway</span>
          </button>
        </div>
      </div>
    </div>
  );
}
