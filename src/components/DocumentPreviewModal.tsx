import React, { useState, useEffect } from "react";
import { 
  X, Download, FileText, Copy, Check, Search, Table, Code, 
  Image as ImageIcon, RefreshCw, AlertCircle, ExternalLink, FileSpreadsheet, Eye
} from "lucide-react";
import { FileLog } from "../types.js";
import MarkdownView from "./MarkdownView.tsx";

interface DocumentPreviewModalProps {
  file: FileLog | {
    id?: string;
    name: string;
    size?: number;
    mimeType?: string;
    auditCategory?: string;
    displayName?: string;
    isAmended?: boolean;
    lineCount?: number;
    filingDate?: string;
  } | null;
  onClose: () => void;
  onDownload?: (fileId: string, fileName: string) => void;
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
}

interface PreviewData {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  auditCategory?: string;
  displayName?: string;
  isPdf: boolean;
  isImage: boolean;
  isCsv: boolean;
  isJson: boolean;
  isMarkdown: boolean;
  isText: boolean;
  textContent?: string;
  truncated?: boolean;
  lineCount?: number;
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
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
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function DocumentPreviewModal({
  file,
  onClose,
  onDownload,
  authFetch
}: DocumentPreviewModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PreviewData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [csvViewMode, setCsvViewMode] = useState<"table" | "raw">("table");
  const [mdViewMode, setMdViewMode] = useState<"rendered" | "raw">("rendered");

  const fileKey = file ? (file.id || file.name) : null;

  useEffect(() => {
    if (!fileKey) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchContent = async () => {
      try {
        const encodedKey = encodeURIComponent(fileKey);
        const res = await authFetch(`/api/session/file-content/${encodedKey}`);
        if (!res.ok) {
          throw new Error("Failed to load file preview content from server.");
        }
        const json = await res.json();
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Error fetching file preview.");
          setLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [fileKey]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const handleCopyText = () => {
    if (data?.textContent) {
      navigator.clipboard.writeText(data.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parsedCsv = data?.isCsv && data.textContent ? parseCsv(data.textContent) : null;
  
  // Filtered rows for CSV
  const filteredCsvRows = parsedCsv ? parsedCsv.rows.filter(row => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return row.some(cell => cell.toLowerCase().includes(q));
  }) : [];

  // Formatted JSON if applicable
  let formattedJsonStr = "";
  if (data?.isJson && data.textContent) {
    try {
      formattedJsonStr = JSON.stringify(JSON.parse(data.textContent), null, 2);
    } catch (e) {
      formattedJsonStr = data.textContent;
    }
  }

  const fileTitle = data?.displayName || file.displayName || file.name;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Card Container */}
      <div 
        className="relative flex flex-col w-full max-w-5xl h-full sm:h-[85vh] max-h-none sm:max-h-[900px] bg-[#0b0f19] border-0 sm:border sm:border-slate-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-4 bg-[#0e1422] border-b border-slate-800/80 gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-emerald-950/50 border border-emerald-800/50 rounded-xl text-[#10B981] shrink-0">
              {data?.isCsv ? (
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : data?.isImage ? (
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : data?.isJson ? (
                <Code className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate" title={fileTitle}>
                  {fileTitle}
                </h3>
                {file.isAmended && (
                  <span className="text-[10px] font-mono uppercase bg-purple-950/80 border border-purple-800/80 text-purple-300 px-2 py-0.5 rounded-md font-bold shrink-0">
                    Amended Filing
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-mono mt-0.5 flex-wrap">
                <span>{formatBytes(file.size)}</span>
                {file.lineCount && (
                  <>
                    <span>•</span>
                    <span>{file.lineCount.toLocaleString()} lines</span>
                  </>
                )}
                <span>•</span>
                <span className="truncate">{file.mimeType || "document"}</span>
                {data?.auditCategory && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{data.auditCategory}</span>
                  </>
                )}
                {file.filingDate && (
                  <>
                    <span>•</span>
                    <span className="text-cyan-400">Filed: {file.filingDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">

            {data?.textContent && (
              <button
                type="button"
                onClick={handleCopyText}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Copy contents to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>
            )}

            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(file.id || file.name, file.name)}
                className="p-2 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/50 rounded-lg text-[#10B981] hover:text-emerald-300 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Download file copy"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-toolbar for search / view toggles */}
        {!loading && !error && data && (
          <div className="flex items-center justify-between px-5 py-2.5 bg-[#090d16] border-b border-slate-800/60 text-xs">
            {/* View mode toggle for CSV */}
            {data.isCsv && (
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCsvViewMode("table")}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                    csvViewMode === "table"
                      ? "bg-[#10B981] text-slate-950 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Table className="w-3 h-3" /> Table Grid
                </button>
                <button
                  type="button"
                  onClick={() => setCsvViewMode("raw")}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                    csvViewMode === "raw"
                      ? "bg-[#10B981] text-slate-950 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code className="w-3 h-3" /> Raw Text
                </button>
              </div>
            )}

            {/* View mode toggle for Markdown */}
            {data.isMarkdown && (
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMdViewMode("rendered")}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                    mdViewMode === "rendered"
                      ? "bg-[#10B981] text-slate-950 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Eye className="w-3 h-3" /> Rendered
                </button>
                <button
                  type="button"
                  onClick={() => setMdViewMode("raw")}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                    mdViewMode === "raw"
                      ? "bg-[#10B981] text-slate-950 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code className="w-3 h-3" /> Raw Markdown
                </button>
              </div>
            )}

            {/* General Info or Line Count */}
            <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              {data.lineCount ? <span>{data.lineCount.toLocaleString()} lines</span> : null}
              {data.truncated && (
                <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  Preview truncated (first 2MB shown)
                </span>
              )}
            </div>

            {/* Search filter for text/CSV */}
            {(data.isText || data.isCsv) && (
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter preview..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-[#10B981] w-48 sm:w-64"
                />
              </div>
            )}
          </div>
        )}

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-auto p-5 bg-[#0b0f19]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 text-[#10B981] animate-spin" />
              <span className="text-xs font-mono">Loading document preview...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-400">
              <AlertCircle className="w-10 h-10" />
              <div className="text-sm font-semibold">{error}</div>
              <button
                type="button"
                onClick={() => onDownload(file.id, file.name)}
                className="mt-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#10B981]" /> Download Raw File Directly
              </button>
            </div>
          ) : data?.isImage ? (
            /* Image Preview */
            <div className="flex flex-col items-center justify-center min-h-full p-4">
              <div className="p-2 bg-[#080b12] border border-slate-800 rounded-xl shadow-lg max-w-full overflow-hidden">
                <img
                  src={`/api/session/view-file/${file.id}`}
                  alt={file.name}
                  className="max-h-[65vh] max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          ) : data?.isPdf ? (
            /* PDF Preview */
            <div className="h-full flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                <span>Rendering PDF stream via browser viewer</span>
                <a
                  href={`/api/session/view-file/${file.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#10B981] hover:underline flex items-center gap-1 font-semibold"
                >
                  Open in Full Window <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={`/api/session/view-file/${file.id}`}
                title={file.name}
                className="w-full flex-1 rounded-xl border border-slate-800/80 bg-slate-950"
              />
            </div>
          ) : data?.isCsv && csvViewMode === "table" && parsedCsv ? (
            /* CSV Structured Table Preview */
            <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-[#0d121d]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#121826] border-b border-slate-800 text-[#10B981] font-mono text-[11px]">
                    <th className="py-2.5 px-3 border-r border-slate-800/80 w-12 text-center text-slate-500">#</th>
                    {parsedCsv.headers.map((h, idx) => (
                      <th key={idx} className="py-2.5 px-3 font-semibold border-r border-slate-800/80 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-200">
                  {filteredCsvRows.length > 0 ? (
                    filteredCsvRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 border-r border-slate-800/60 text-slate-500 text-center select-none text-[10px]">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 border-r border-slate-800/60 whitespace-nowrap truncate max-w-xs">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={parsedCsv.headers.length + 1} className="py-8 text-center text-slate-500 italic">
                        {searchQuery ? "No matching rows found." : "No data rows available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : data?.isMarkdown && mdViewMode === "rendered" && data.textContent ? (
            /* Markdown Rendered View */
            <div className="p-6 bg-[#0e1422] border border-slate-800/80 rounded-xl text-slate-200 leading-relaxed max-w-none">
              <MarkdownView content={data.textContent} />
            </div>
          ) : data?.isText ? (
            /* Formatted Plain Text / Code / JSON / Raw Markdown View */
            <div className="relative font-mono text-xs bg-[#080c16] border border-slate-800/80 rounded-xl overflow-hidden">
              <pre className="p-4 overflow-x-auto text-slate-200 whitespace-pre leading-relaxed select-text font-mono text-[11.5px]">
                {data.isJson && formattedJsonStr ? (
                  searchQuery ? (
                    formattedJsonStr.split("\n").filter(l => l.toLowerCase().includes(searchQuery.toLowerCase())).join("\n")
                  ) : (
                    formattedJsonStr
                  )
                ) : searchQuery && data.textContent ? (
                  data.textContent.split("\n").filter(l => l.toLowerCase().includes(searchQuery.toLowerCase())).join("\n")
                ) : (
                  data.textContent || "Empty file content."
                )}
              </pre>
            </div>
          ) : (
            /* Fallback for binary unrenderable files */
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <FileText className="w-12 h-12 text-slate-600" />
              <div className="text-sm font-semibold text-slate-300">Binary Document Preview</div>
              <div className="text-xs text-slate-500 max-w-sm text-center">
                This document format ({file.mimeType || "binary"}) cannot be directly displayed in the text viewer.
              </div>
              <button
                type="button"
                onClick={() => onDownload(file.id, file.name)}
                className="mt-2 text-xs bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download File ({formatBytes(file.size)})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
