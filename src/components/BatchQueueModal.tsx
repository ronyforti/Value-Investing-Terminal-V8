import React, { useState, useEffect, useRef } from "react";
import { 
  Layers, 
  Play, 
  Pause, 
  RefreshCw, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  X,
  UploadCloud,
  DownloadCloud,
  FileSpreadsheet,
  FolderOpen,
  Folder,
  FolderX,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Briefcase,
  Zap
} from "lucide-react";
import { BatchQueueState, BatchQueueItem, PortfolioContext, FlexWatcherState } from "../types";

interface BatchQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchState: BatchQueueState | null;
  onRefresh: () => void;
  onStartBatch: () => void;
  onStopBatch: () => void;
  onAddItem: (ticker: string, period?: string, price?: string, autoPullDocs?: boolean, portfolio?: PortfolioContext) => Promise<void> | void;
  onBulkAdd?: (params: { tickers?: string[]; rawText?: string; filePath?: string; autoPullDocs?: boolean }) => Promise<{ success: boolean; addedCount?: number; items?: BatchQueueItem[]; error?: string }>;
  onPullDocs?: (ticker: string, period?: string) => Promise<{ success: boolean; error?: string } | void>;
  onPullAllDocs?: () => Promise<{ success: boolean; count?: number } | void>;
  onReAudit?: (ticker?: string) => Promise<void> | void;
  onSyncPeriods?: () => Promise<{ success: boolean; updated?: any[] } | void>;
  onRemoveItem: (id: string, purgeStaging?: boolean) => void;
  onClearQueue: (purgeStaging?: boolean) => void;
  fmpApiKey?: string;
  onSetRetention?: (retain: boolean) => Promise<void> | void;
  onPurgeStaging?: (ticker?: string) => Promise<any>;
  onSetStagingLocation?: (location: 'gdrive' | 'local') => Promise<void> | void;
  onToggleOverride?: (idOrTicker: string, overridden?: boolean) => Promise<void> | void;
  onDeleteFile?: (fileName: string, ticker?: string) => Promise<void> | void;
  onPreviewFile?: (file: any) => void;
  onUpdatePortfolio?: (idOrTicker: string, portfolio: PortfolioContext) => Promise<void> | void;
  flexWatcherState?: FlexWatcherState | null;
  onQueueForFlex?: () => void;
  onCancelFlexWait?: () => void;
}

export const BatchQueueModal: React.FC<BatchQueueModalProps> = ({
  isOpen,
  onClose,
  batchState,
  onRefresh,
  onStartBatch,
  onStopBatch,
  onAddItem,
  onBulkAdd,
  onPullDocs,
  onPullAllDocs,
  onReAudit,
  onSyncPeriods,
  onRemoveItem,
  onClearQueue,
  fmpApiKey = "",
  onSetRetention,
  onPurgeStaging,
  onSetStagingLocation,
  onToggleOverride,
  onDeleteFile,
  onPreviewFile,
  onUpdatePortfolio,
  flexWatcherState,
  onQueueForFlex,
  onCancelFlexWait
}) => {
  // Diagnostics & Progress State
  const [expandedMismatchTicker, setExpandedMismatchTicker] = useState<string | null>(null);
  const [isSyncingPeriods, setIsSyncingPeriods] = useState(false);
  const [pullProgress, setPullProgress] = useState<{
    isActive: boolean;
    ticker: string;
    index: number;
    total: number;
    stepDescription: string;
    logs: string[];
  }>({
    isActive: false,
    ticker: "",
    index: 0,
    total: 0,
    stepDescription: "",
    logs: []
  });

  // Single Add Form State
  const [newTicker, setNewTicker] = useState("");
  const [newPeriod, setNewPeriod] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newHoldsPosition, setNewHoldsPosition] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newEntryPrice, setNewEntryPrice] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [fmpStatus, setFmpStatus] = useState<"idle" | "fetching" | "synced" | "fallback" | "failed">("idle");
  const [fmpStatusMsg, setFmpStatusMsg] = useState("");
  const [singleAutoPull, setSingleAutoPull] = useState(false);

  // Position Editor State for queue items
  const [editingPositionItem, setEditingPositionItem] = useState<BatchQueueItem | null>(null);
  const [editHoldsPosition, setEditHoldsPosition] = useState(false);
  const [editWeight, setEditWeight] = useState("");
  const [editEntryPrice, setEditEntryPrice] = useState("");
  const [isSavingPosition, setIsSavingPosition] = useState(false);

  // Bulk Import State
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkTab, setBulkTab] = useState<"paste" | "path" | "upload">("paste");
  const [bulkText, setBulkText] = useState("");
  const [bulkPath, setBulkPath] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkAutoPull, setBulkAutoPull] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkStatusText, setBulkStatusText] = useState("");
  const [bulkFeedback, setBulkFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Action Loading States
  const [pullingDocsMap, setPullingDocsMap] = useState<Record<string, boolean>>({});
  const [isPullingAll, setIsPullingAll] = useState(false);
  const [isReAuditingAll, setIsReAuditingAll] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-sync price & period from FMP when user types ticker in Single Add
  useEffect(() => {
    const clean = newTicker.trim().toUpperCase();
    if (clean.length < 2) {
      setFmpStatus("idle");
      setFmpStatusMsg("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsFetchingInfo(true);
        setFmpStatus("fetching");
        const res = await fetch("/api/ingest/fmp-ticker-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: clean, fmpApiKey })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.period) setNewPeriod(data.period);
            if (data.price) setNewPrice(data.price);
            const earningsInfo = data.nextEarningsDate
              ? ` • Next: ${data.nextEarningsDate}${typeof data.daysToNextEarnings === 'number' ? ` (${data.daysToNextEarnings <= 14 ? `⚠️ in ${data.daysToNextEarnings}d` : `in ${data.daysToNextEarnings}d`})` : ''}`
              : '';
            if (data.fmpSucceeded) {
              setFmpStatus("synced");
              setFmpStatusMsg(`✓ FMP Synced: Live price & period verified${earningsInfo}`);
            } else if (data.source === "fallback") {
              setFmpStatus("fallback");
              setFmpStatusMsg(`⚠️ FMP Unavailable: Using market price fallback${earningsInfo}`);
            } else {
              setFmpStatus("failed");
              setFmpStatusMsg("❌ Price & period unavailable; manual entry required");
            }
          } else {
            setFmpStatus("failed");
            setFmpStatusMsg("❌ FMP lookup failed");
          }
        } else {
          setFmpStatus("failed");
          setFmpStatusMsg("❌ FMP lookup failed");
        }
      } catch (err) {
        console.warn("[FMP AutoFill Error]", err);
        setFmpStatus("failed");
        setFmpStatusMsg("❌ FMP lookup error");
      } finally {
        setIsFetchingInfo(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [newTicker, fmpApiKey]);

  if (!isOpen) return null;

  const items = batchState?.items || [];
  const isRunning = batchState?.status === "running";
  const readyCount = items.filter(i => i.status === "ready").length;
  const blockedCount = items.filter(i => i.status === "blocked" || i.status === "failed").length;
  const completedCount = items.filter(i => i.status === "completed").length;

  const openPositionEditor = (item: BatchQueueItem) => {
    setEditingPositionItem(item);
    setEditHoldsPosition(Boolean(item.portfolio?.holdsPosition));
    setEditWeight(item.portfolio?.currentWeight || "");
    setEditEntryPrice(item.portfolio?.entryPrice || "");
  };

  const handleSavePosition = async () => {
    if (!editingPositionItem) return;
    try {
      setIsSavingPosition(true);
      const portfolio: PortfolioContext = {
        holdsPosition: editHoldsPosition,
        currentWeight: editHoldsPosition && editWeight.trim() ? editWeight.trim() : undefined,
        entryPrice: editHoldsPosition && editEntryPrice.trim() ? editEntryPrice.trim() : undefined
      };
      await onUpdatePortfolio?.(editingPositionItem.id, portfolio);
      setToastMsg({ type: "success", text: `Position updated for ${editingPositionItem.ticker}` });
      setTimeout(() => setToastMsg(null), 3000);
      setEditingPositionItem(null);
    } catch (e: any) {
      setToastMsg({ type: "error", text: "Failed to update position" });
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsSavingPosition(false);
    }
  };

  const handleClearPosition = async () => {
    if (!editingPositionItem) return;
    try {
      setIsSavingPosition(true);
      const portfolio: PortfolioContext = {
        holdsPosition: false
      };
      await onUpdatePortfolio?.(editingPositionItem.id, portfolio);
      setToastMsg({ type: "info", text: `Position cleared for ${editingPositionItem.ticker}` });
      setTimeout(() => setToastMsg(null), 3000);
      setEditingPositionItem(null);
    } catch (e: any) {
      setToastMsg({ type: "error", text: "Failed to clear position" });
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsSavingPosition(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim()) return;
    const portfolio: PortfolioContext | undefined = newHoldsPosition
      ? {
          holdsPosition: true,
          currentWeight: newWeight.trim() || undefined,
          entryPrice: newEntryPrice.trim() || undefined
        }
      : undefined;
    await onAddItem(newTicker.trim().toUpperCase(), newPeriod.trim().toUpperCase(), newPrice.trim(), singleAutoPull, portfolio);
    setNewTicker("");
    setNewPeriod("");
    setNewPrice("");
    setNewHoldsPosition(false);
    setNewWeight("");
    setNewEntryPrice("");
    setFmpStatus("idle");
    setFmpStatusMsg("");
    setSingleAutoPull(false);
    setIsAdding(false);
    onRefresh();
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onBulkAdd) return;

    setBulkFeedback(null);
    setIsBulkLoading(true);
    setBulkStatusText("Parsing tickers, querying FMP" + (bulkAutoPull ? ", and pulling missing documents into _STAGING..." : "..."));

    try {
      let result;
      if (bulkTab === "paste") {
        if (!bulkText.trim()) {
          setBulkFeedback({ type: "error", text: "Please enter at least one ticker symbol." });
          setIsBulkLoading(false);
          return;
        }
        result = await onBulkAdd({ rawText: bulkText.trim(), autoPullDocs: bulkAutoPull });
      } else if (bulkTab === "path") {
        if (!bulkPath.trim()) {
          setBulkFeedback({ type: "error", text: "Please enter a valid file path." });
          setIsBulkLoading(false);
          return;
        }
        result = await onBulkAdd({ filePath: bulkPath.trim(), autoPullDocs: bulkAutoPull });
      } else if (bulkTab === "upload") {
        if (!bulkFile) {
          setBulkFeedback({ type: "error", text: "Please select or drop a file to import." });
          setIsBulkLoading(false);
          return;
        }
        const fileContent = await bulkFile.text();
        result = await onBulkAdd({ rawText: fileContent, autoPullDocs: bulkAutoPull });
      }

      if (result && result.success) {
        const total = result.addedCount || 0;
        const itemsList = result.items || [];
        const syncedCount = itemsList.filter(i => i.fmpSynced).length;
        const fallbackCount = total - syncedCount;

        setBulkFeedback({
          type: "success",
          text: `Successfully added ${total} companies (${syncedCount} FMP Synced${fallbackCount > 0 ? `, ${fallbackCount} Fallback` : ""})!`
        });
        setBulkText("");
        setBulkPath("");
        setBulkFile(null);
        onRefresh();
        setTimeout(() => {
          setIsBulkOpen(false);
          setBulkFeedback(null);
        }, 1500);
      } else {
        setBulkFeedback({
          type: "error",
          text: result?.error || "Failed importing tickers."
        });
      }
    } catch (err: any) {
      setBulkFeedback({
        type: "error",
        text: err?.message || "Failed bulk import."
      });
    } finally {
      setIsBulkLoading(false);
      setBulkStatusText("");
    }
  };

  const handleItemPullDocs = async (ticker: string, period?: string) => {
    if (!onPullDocs) return;
    setPullingDocsMap(prev => ({ ...prev, [ticker]: true }));
    try {
      const res = await onPullDocs(ticker, period);
      if (res && res.success) {
        setToastMsg({ type: "success", text: `Retrieved filings & staged for ${ticker}.` });
      } else if (res && res.error) {
        setToastMsg({ type: "error", text: `Warning for ${ticker}: ${res.error}` });
      }
      onRefresh();
    } catch (e: any) {
      setToastMsg({ type: "error", text: `Failed pulling docs for ${ticker}: ${e.message}` });
    } finally {
      setPullingDocsMap(prev => ({ ...prev, [ticker]: false }));
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleItemReAudit = async (ticker: string) => {
    if (!onReAudit) return;
    try {
      await onReAudit(ticker);
      onRefresh();
      setToastMsg({ type: "info", text: `Re-audited ${ticker} against _STAGING files.` });
    } catch (e) {}
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleClearQueueClick = () => {
    if (isRunning || items.length === 0) return;
    const confirmClear = window.confirm("Clear all items from the batch queue?");
    if (!confirmClear) return;
    const purgeStaging = window.confirm(
      "Do you also want to PURGE all staged documents from the active staging directory?\n\n• Click OK to clear the queue AND delete all staging files.\n• Click Cancel to clear the queue but KEEP staging files intact."
    );
    onClearQueue(purgeStaging);
    setToastMsg({ 
      type: "info", 
      text: purgeStaging ? "Queue cleared and staging directory purged." : "Queue cleared (staging files retained)." 
    });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRemoveItemClick = (item: BatchQueueItem) => {
    if (isRunning) return;
    const confirmRemove = window.confirm(`Remove ${item.ticker} from the batch queue?`);
    if (!confirmRemove) return;
    const purgeFiles = window.confirm(
      `Do you also want to DELETE all downloaded staging files for ${item.ticker}?\n\n• Click OK to remove ${item.ticker} AND delete its files from staging.\n• Click Cancel to remove from queue only.`
    );
    onRemoveItem(item.id, purgeFiles);
    setToastMsg({ 
      type: "info", 
      text: purgeFiles ? `Removed ${item.ticker} and deleted staging files.` : `Removed ${item.ticker} from queue.` 
    });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePurgeStagingClick = async () => {
    if (isRunning) return;
    const activeDir = batchState?.activeStagingDir || (batchState?.stagingLocation === 'local' ? './staging' : 'G:/My Drive/Company Data/_STAGING');
    const confirmed = window.confirm(
      `Are you sure you want to PURGE all files in the active staging directory?\n(${activeDir})\n\nThis will delete all staged 10-K, 10-Q, earnings transcripts, and financial CSVs.`
    );
    if (!confirmed) return;
    if (onPurgeStaging) {
      try {
        const res = await onPurgeStaging();
        onRefresh();
        setToastMsg({ type: "info", text: `Purged staging directory (${res?.deletedCount ?? 0} files removed).` });
      } catch (e: any) {
        setToastMsg({ type: "error", text: `Failed to purge staging: ${e?.message || 'Error'}` });
      }
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  const handleTriggerPullAllDocs = async () => {
    if (!onPullDocs && !onPullAllDocs) return;
    setIsPullingAll(true);

    const blockedItems = items.filter(it => it.status === 'blocked' || it.status === 'failed' || it.integrityReport?.hasMismatches || it.files.count < 4);
    const targetItems = blockedItems.length > 0 ? blockedItems : items;

    if (targetItems.length === 0) {
      setToastMsg({ type: "info", text: "No blocked or incomplete companies found to pull." });
      setIsPullingAll(false);
      return;
    }

    setPullProgress({
      isActive: true,
      ticker: targetItems[0].ticker,
      index: 1,
      total: targetItems.length,
      stepDescription: "Starting bulk document pull into _STAGING...",
      logs: [`Initiating document retrieval for ${targetItems.length} companies...`]
    });

    try {
      if (onPullDocs) {
        for (let i = 0; i < targetItems.length; i++) {
          const item = targetItems[i];
          setPullProgress(prev => ({
            ...prev,
            ticker: item.ticker,
            index: i + 1,
            stepDescription: `Fetching SEC Filings ➔ FMP CSV ➔ Transcripts for ${item.ticker} (${i + 1}/${targetItems.length})...`,
            logs: [...prev.logs.slice(-6), `[${i + 1}/${targetItems.length}] Pulling filings for ${item.ticker} (${item.period})...`]
          }));

          try {
            const res = await onPullDocs(item.ticker, item.period);
            if (res && res.error) {
              setPullProgress(prev => ({
                ...prev,
                logs: [...prev.logs.slice(-6), `⚠️ ${item.ticker}: ${res.error}`]
              }));
            } else {
              setPullProgress(prev => ({
                ...prev,
                logs: [...prev.logs.slice(-6), `✓ ${item.ticker}: Filings staged and verified.`]
              }));
            }
          } catch (err: any) {
            setPullProgress(prev => ({
              ...prev,
              logs: [...prev.logs.slice(-6), `❌ ${item.ticker}: ${err.message}`]
            }));
          }
          onRefresh();
        }
      } else if (onPullAllDocs) {
        await onPullAllDocs();
      }

      onRefresh();
      setToastMsg({ type: "success", text: `Completed pulling missing documents for ${targetItems.length} companies into _STAGING.` });
    } catch (e: any) {
      setToastMsg({ type: "error", text: "Failed pulling all docs: " + e.message });
    } finally {
      setIsPullingAll(false);
      setPullProgress(prev => ({
        ...prev,
        stepDescription: "Completed all downloads."
      }));
      setTimeout(() => {
        setPullProgress(prev => ({ ...prev, isActive: false }));
      }, 3500);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleTriggerSyncPeriods = async () => {
    if (!onSyncPeriods) return;
    setIsSyncingPeriods(true);
    try {
      const res = await onSyncPeriods();
      if (res && res.updated && res.updated.length > 0) {
        const listStr = res.updated.map((u: any) => `${u.ticker} (${u.oldPeriod} ➔ ${u.newPeriod})`).join(", ");
        setToastMsg({ type: "success", text: `Synced ${res.updated.length} companies to live FMP periods: ${listStr}` });
      } else {
        setToastMsg({ type: "info", text: "All companies in queue already match their latest live reported periods on FMP." });
      }
      onRefresh();
    } catch (e: any) {
      setToastMsg({ type: "error", text: "Failed syncing periods: " + e.message });
    } finally {
      setIsSyncingPeriods(false);
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  const handleTriggerReAuditAll = async () => {
    if (!onReAudit) return;
    setIsReAuditingAll(true);
    try {
      await onReAudit();
      onRefresh();
      setToastMsg({ type: "info", text: "Re-audited all batch items against _STAGING files." });
    } catch (e) {}
    finally {
      setIsReAuditingAll(false);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#121620] border-0 sm:border sm:border-slate-700/80 rounded-none sm:rounded-2xl w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* --- Header --- */}
        <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-slate-800 bg-[#171c2a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                  Autonomous Valuation Batch Queue
                </h2>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono shrink-0">
                  {items.length} Companies
                </span>
                {isRunning && (
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono flex items-center gap-1 animate-pulse shrink-0">
                    <Loader2 className="w-3 h-3 animate-spin" /> RUNNING: {batchState?.activeTicker}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Pre-Flight Document Integrity Verification & Direct Obsidian Dossier Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
            <button
              onClick={onRefresh}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Refresh Queue State"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- Queue Statistics & Control Bar --- */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#141924] border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-3.5 lg:gap-4 text-xs shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-0.5 text-xs whitespace-nowrap shrink-0">
            <div className="flex items-center gap-1.5 font-mono px-2.5 py-1 bg-slate-800/70 rounded-md border border-slate-700/60 shadow-sm shrink-0">
              <span className="text-slate-400 font-medium">Progress:</span>
              <strong className="text-white font-bold">{completedCount} / {items.length} Completed</strong>
            </div>
            <div className="flex items-center gap-1.5 font-mono px-2.5 py-1 bg-emerald-950/40 text-emerald-400 rounded-md border border-emerald-700/40 shadow-sm shrink-0">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="font-semibold">{readyCount} Ready</span>
            </div>
            {blockedCount > 0 && (
              <div className="flex items-center gap-1.5 font-mono px-2.5 py-1 bg-rose-950/40 text-rose-400 rounded-md border border-rose-700/40 shadow-sm shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="font-semibold">{blockedCount} Blocked</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 w-full lg:w-auto">
            {/* Download All Completed Dossiers (.zip) */}
            {completedCount > 0 && (
              <a
                href="/api/batch/download-all-dossiers"
                download
                className="shrink-0 px-3 sm:px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/60 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                title="Download all completed valuation dossiers as a single ZIP archive"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Dossiers ({completedCount})</span>
              </a>
            )}

            {/* Sync Periods Button */}
            {onSyncPeriods && (
              <button
                type="button"
                onClick={handleTriggerSyncPeriods}
                disabled={isRunning || isSyncingPeriods || items.length === 0}
                className="shrink-0 px-3 sm:px-3.5 py-2 bg-indigo-950/40 hover:bg-indigo-900/60 disabled:opacity-50 text-indigo-300 border border-indigo-700/50 hover:border-indigo-600/60 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Check FMP for latest live reporting quarters and prices, syncing queue to actual fiscal filings"
              >
                <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isSyncingPeriods ? "animate-spin" : ""}`} />
                <span>Sync Periods</span>
              </button>
            )}

            {/* Re-audit All Button */}
            <button
              type="button"
              onClick={handleTriggerReAuditAll}
              disabled={isRunning || isReAuditingAll || items.length === 0}
              className="shrink-0 px-3 sm:px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Re-audit all documents against _STAGING"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isReAuditingAll ? "animate-spin" : ""}`} />
              <span>Re-audit All</span>
            </button>

            {/* Pull Missing Filings for All Blocked Button */}
            {blockedCount > 0 && (
              <button
                type="button"
                onClick={handleTriggerPullAllDocs}
                disabled={isRunning || isPullingAll}
                className="shrink-0 px-3 sm:px-3.5 py-2 bg-blue-950/40 hover:bg-blue-900/60 disabled:opacity-50 text-blue-300 border border-blue-700/50 hover:border-blue-600/60 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Automatically pull missing filings (10-K, 10-Q, Transcript, TTM CSV) for all blocked companies into _STAGING"
              >
                {isPullingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : (
                  <DownloadCloud className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>Pull Missing ({blockedCount})</span>
              </button>
            )}

            {/* Add Company Button */}
            <button
              type="button"
              onClick={() => {
                setIsAdding(!isAdding);
                setIsBulkOpen(false);
              }}
              disabled={isRunning}
              className={`shrink-0 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 ${
                isAdding
                  ? "bg-slate-700 text-white border border-emerald-500 ring-1 ring-emerald-500/50"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600"
              }`}
            >
              <Plus className={`w-3.5 h-3.5 ${isAdding ? "text-emerald-300" : "text-emerald-400"}`} />
              <span>Add Company</span>
            </button>

            {/* Bulk Import Button */}
            <button
              type="button"
              onClick={() => {
                setIsBulkOpen(!isBulkOpen);
                setIsAdding(false);
              }}
              disabled={isRunning}
              className={`shrink-0 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 ${
                isBulkOpen
                  ? "bg-emerald-900/80 text-white border border-emerald-500 ring-1 ring-emerald-500/50"
                  : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 hover:border-emerald-600/60"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Bulk Import</span>
            </button>

            {/* Clear Queue Button */}
            <button
              type="button"
              onClick={handleClearQueueClick}
              disabled={isRunning || items.length === 0}
              className="shrink-0 px-2.5 sm:px-3 py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 hover:border-rose-700/60 rounded-lg text-xs font-mono transition-all duration-150 flex items-center gap-1 cursor-pointer disabled:opacity-40 shadow-sm"
              title="Clear all companies from batch queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            {/* Purge Staging Button */}
            <button
              type="button"
              onClick={handlePurgeStagingClick}
              disabled={isRunning}
              className="shrink-0 px-2.5 sm:px-3 py-2 bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-700/50 rounded-lg text-xs font-mono transition-all duration-150 flex items-center gap-1 cursor-pointer disabled:opacity-40 shadow-sm"
              title="Purge all downloaded documents from active staging directory"
            >
              <FolderX className="w-3.5 h-3.5 text-rose-400" />
              <span>Purge Staging</span>
            </button>
          </div>
        </div>

        {/* --- Add Single Company Form Drawer (with FMP Auto-Fill & Auto-Pull Option) --- */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="px-4 sm:px-6 py-4 bg-[#192132] border-b border-slate-700/60 animate-in fade-in duration-150 shrink-0">
            <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-2.5 sm:gap-3">
              <div className="relative w-full sm:w-36">
                <input
                  type="text"
                  value={newTicker}
                  onChange={e => setNewTicker(e.target.value.toUpperCase())}
                  placeholder="Ticker (e.g. MSFT)"
                  className="bg-[#0f131c] border border-slate-700 rounded-lg px-3 py-2 sm:py-1.5 text-xs text-white uppercase font-mono w-full focus:border-emerald-500 focus:outline-none"
                  required
                  autoFocus
                />
                {isFetchingInfo && (
                  <div className="absolute right-2.5 top-2.5 sm:top-2 text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                  </div>
                )}
              </div>

              <div className="relative w-full sm:w-36">
                <input
                  type="text"
                  value={newPeriod}
                  onChange={e => setNewPeriod(e.target.value.toUpperCase())}
                  placeholder={isFetchingInfo ? "Syncing..." : "Period (e.g. Q4-26)"}
                  className="bg-[#0f131c] border border-slate-700 rounded-lg px-3 py-2 sm:py-1.5 text-xs text-white uppercase font-mono w-full focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="relative w-full sm:w-32">
                <input
                  type="text"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder={isFetchingInfo ? "Syncing..." : "Price ($)"}
                  className="bg-[#0f131c] border border-slate-700 rounded-lg px-3 py-2 sm:py-1.5 text-xs text-white font-mono w-full focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              {/* Auto-pull docs checkbox */}
              <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer select-none py-1">
                <input
                  type="checkbox"
                  checked={singleAutoPull}
                  onChange={e => setSingleAutoPull(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span>Auto-pull into _STAGING</span>
              </label>

              {/* Portfolio Position Context in Single Add */}
              <div className="flex items-center gap-2 py-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 font-mono cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newHoldsPosition}
                    onChange={e => setNewHoldsPosition(e.target.checked)}
                    className="rounded border-slate-700 text-teal-500 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <span className="flex items-center gap-1 text-teal-300 font-medium">
                    <Briefcase className="w-3 h-3 text-teal-400" /> Hold Position
                  </span>
                </label>
              </div>

              {newHoldsPosition && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="w-24">
                    <input
                      type="text"
                      value={newWeight}
                      onChange={e => setNewWeight(e.target.value)}
                      placeholder="Weight %"
                      className="bg-[#0f131c] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono w-full focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="text"
                      value={newEntryPrice}
                      onChange={e => setNewEntryPrice(e.target.value)}
                      placeholder="Entry ($)"
                      className="bg-[#0f131c] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono w-full focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition cursor-pointer text-center"
                >
                  Add to Queue
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>

              {/* FMP Provenance Badges */}
              {fmpStatus === "synced" && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> {fmpStatusMsg}
                </span>
              )}
              {fmpStatus === "fallback" && (
                <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  <AlertTriangle className="w-3 h-3 text-amber-400" /> {fmpStatusMsg}
                </span>
              )}
              {fmpStatus === "failed" && (
                <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                  <XCircle className="w-3 h-3 text-rose-400" /> {fmpStatusMsg}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              💡 Type a ticker — market price and latest reporting quarter auto-populate via FMP. Check "Auto-pull into _STAGING" to automatically download 10-K, 10-Q, Transcript, and Financials CSV.
            </p>
          </form>
        )}

        {/* --- Bulk Import Drawer (Delimited List, File Path, File Upload) --- */}
        {isBulkOpen && (
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[#182030] border-b border-slate-700/80 animate-in fade-in duration-150 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Bulk Company Import
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  — Auto-populates live prices & reporting periods via FMP
                </span>
              </div>
              
              {/* Tab Selector */}
              <div className="flex items-center bg-[#0e121a] p-0.5 rounded-lg border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setBulkTab("paste")}
                  className={`px-3 py-1 text-xs font-mono rounded-md transition cursor-pointer ${bulkTab === "paste" ? "bg-slate-800 text-emerald-400 font-bold shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Paste List
                </button>
                <button
                  type="button"
                  onClick={() => setBulkTab("path")}
                  className={`px-3 py-1 text-xs font-mono rounded-md transition cursor-pointer ${bulkTab === "path" ? "bg-slate-800 text-emerald-400 font-bold shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  File on Drive
                </button>
                <button
                  type="button"
                  onClick={() => setBulkTab("upload")}
                  className={`px-3 py-1 text-xs font-mono rounded-md transition cursor-pointer ${bulkTab === "upload" ? "bg-slate-800 text-emerald-400 font-bold shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Upload File
                </button>
              </div>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-3">
              {bulkTab === "paste" && (
                <div>
                  <textarea
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value.toUpperCase())}
                    placeholder="Enter ticker symbols separated by space, comma, semicolon, or newlines:&#10;e.g. AAPL, MSFT, GOOGL, NVDA, AMZN, META"
                    rows={3}
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-xl p-3 text-xs text-white font-mono uppercase placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    disabled={isBulkLoading}
                    autoFocus
                  />
                </div>
              )}

              {bulkTab === "path" && (
                <div>
                  <input
                    type="text"
                    value={bulkPath}
                    onChange={e => setBulkPath(e.target.value)}
                    placeholder="e.g. G:\My Drive\Company Data\GTD_Investing_Journal\GTD_Investment_Latticework_Organized\02 AI_Terminal\Screens\Tier1_Quality_Franchises_Master_20260907_170105.md"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    disabled={isBulkLoading}
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 font-mono mt-1.5">
                    Parses markdown screens, CSVs, or text files directly from your computer or Google Drive folder.
                  </p>
                </div>
              )}

              {bulkTab === "upload" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.csv,.md,.json"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setBulkFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 bg-[#0d1117] rounded-xl p-4 text-center cursor-pointer transition"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-mono text-slate-300">
                      {bulkFile ? (
                        <span className="text-emerald-400 font-bold">Selected: {bulkFile.name} ({(bulkFile.size / 1024).toFixed(1)} KB)</span>
                      ) : (
                        "Click to browse or drop a .txt, .csv, .md, or .json file containing company tickers"
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Auto-pull docs option for bulk import */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={bulkAutoPull}
                    onChange={e => setBulkAutoPull(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Auto-pull missing filings (10-K, 10-Q, Transcript, TTM CSV) into _STAGING</span>
                </label>
              </div>

              {/* Status and Action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                <div className="text-xs font-mono">
                  {isBulkLoading ? (
                    <span className="text-amber-400 flex items-center gap-2 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> {bulkStatusText}
                    </span>
                  ) : bulkFeedback ? (
                    <span className={bulkFeedback.type === "success" ? "text-emerald-400" : "text-rose-400"}>
                      {bulkFeedback.text}
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Each ticker will be sequentially queried on FMP for market price and fiscal period.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isBulkLoading}
                    className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isBulkLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Import & Pull FMP Data
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBulkOpen(false);
                      setBulkFeedback(null);
                    }}
                    disabled={isBulkLoading}
                    className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* --- Toast / Alert Banner --- */}
        {toastMsg && (
          <div className={`px-6 py-2 border-b font-mono text-xs flex items-center justify-between transition-all ${
            toastMsg.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' :
            toastMsg.type === 'error' ? 'bg-rose-950/40 text-rose-300 border-rose-800/50' :
            'bg-blue-950/40 text-blue-300 border-blue-800/50'
          }`}>
            <div className="flex items-center gap-2">
              {toastMsg.type === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              {toastMsg.type === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
              {toastMsg.type === 'info' && <RefreshCw className="w-3.5 h-3.5 text-blue-400" />}
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* --- Main Queue Table & Live Progress --- */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
          {/* Active Bulk Pull Live Visual Card */}
          {pullProgress.isActive && (
            <div className="p-4 bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-cyan-950/40 border border-blue-500/40 rounded-xl shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <span className="text-xs font-bold text-white font-mono tracking-wide">
                    DOWNLOADING FILINGS: <span className="text-blue-300 text-sm font-black">{pullProgress.ticker}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-200 border border-blue-700/60 font-mono">
                    {pullProgress.index} of {pullProgress.total} Companies
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-blue-300">
                  {Math.round((pullProgress.index / Math.max(pullProgress.total, 1)) * 100)}% Complete
                </div>
              </div>

              {/* Visual Pipeline Stages */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5 text-[10px] font-mono text-center">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-blue-500/40 text-blue-300 flex items-center justify-center gap-1.5 shadow-sm">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>1. SEC 10-K / 10-Q</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-1.5 shadow-sm">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. FMP TTM CSV</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-purple-500/40 text-purple-300 flex items-center justify-center gap-1.5 shadow-sm">
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  <span>3. Call Transcript</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-cyan-300 flex items-center justify-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>4. _STAGING Audit</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden mb-2 border border-slate-700/50">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${Math.round((pullProgress.index / Math.max(pullProgress.total, 1)) * 100)}%` }}
                />
              </div>

              {/* Live Step Status & Logs */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1.5 text-blue-200">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  {pullProgress.stepDescription}
                </span>
              </div>

              {pullProgress.logs.length > 0 && (
                <div className="mt-2 p-2.5 bg-black/50 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1 max-h-24 overflow-y-auto">
                  {pullProgress.logs.map((log, lIdx) => (
                    <div key={lIdx} className={log.includes("✓") ? "text-emerald-400" : log.includes("⚠️") || log.includes("❌") ? "text-rose-300" : "text-slate-400"}>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {items.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-mono text-xs">
              <Layers className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-bold mb-1">Queue is currently empty</p>
              <p>Click "+ Add Company" or "📥 Bulk Import" above to add tickers to the batch pipeline.</p>
            </div>
          ) : (
            <>
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block border border-slate-800 rounded-xl overflow-x-auto shadow-lg bg-[#0e1117]">
              <table className="min-w-[800px] w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#161c28] border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-3">Period</th>
                    <th className="py-3 px-3">Price / FMP</th>
                    <th className="py-3 px-3 text-center">Position</th>
                    <th className="py-3 px-4 text-center">Filing Files Audit (4/4)</th>
                    <th className="py-3 px-4 text-center">Integrity Status</th>
                    <th className="py-3 px-4 text-center">Execution Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {items.map(item => {
                    const isQ4 = Boolean(item.period && (item.period.toUpperCase().includes("Q4") || item.period.toUpperCase().includes("FY")));
                    const has10K = Boolean(item.files.annual);
                    const has10Q = Boolean(item.files.quarterly);
                    const isCoveredBy8K = Boolean(
                      item.isCoveredBy8K ||
                      item.files?.isCoveredBy8K ||
                      (item.files.quarterly && (
                        item.files.quarterly.toLowerCase().includes("8-k") ||
                        item.files.quarterly.toLowerCase().includes("8k") ||
                        item.files.quarterly.toLowerCase().includes("item2.02") ||
                        item.files.quarterly.toLowerCase().includes("item-2.02") ||
                        item.files.quarterly.toLowerCase().includes("earnings-release") ||
                        item.files.quarterly.toLowerCase().includes("earnings_release")
                      ))
                    );
                    const hasTranscript = Boolean(item.files.transcript);
                    const hasCsv = Boolean(item.files.csv);
                    const hasMismatches = item.integrityReport?.hasMismatches;
                    const allAudited = has10K && (isQ4 || has10Q) && hasTranscript && hasCsv && !hasMismatches;
                    const isPullingThisItem = Boolean(pullingDocsMap[item.ticker]);

                    return (
                      <React.Fragment key={item.id}>
                      <tr 
                        className={`hover:bg-[#131822] transition ${item.status === 'running' ? 'bg-emerald-950/20 border-l-2 border-emerald-500' : ''}`}
                      >
                        {/* Company Ticker */}
                        <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                          {item.ticker}
                        </td>

                        {/* Target Period */}
                        <td className="py-3.5 px-3 font-mono text-slate-300">
                          {item.period}
                        </td>

                        {/* Price & FMP Provenance Badge */}
                        <td className="py-3.5 px-3 font-mono">
                          <div className="text-emerald-400 font-medium">${item.price}</div>
                          <div className="mt-0.5">
                            {item.fmpSynced || item.fmpSource === 'fmp' ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono" title="Live price and reporting period verified via Financial Modeling Prep">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> FMP Synced
                              </span>
                            ) : item.fmpSource === 'fallback' ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-mono" title="FMP unavailable; market fallback price used">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> Fallback
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono" title="Manual price entry">
                                Manual
                              </span>
                            )}
                            {item.nextEarningsDate && typeof item.daysToNextEarnings === 'number' && item.daysToNextEarnings >= 0 && item.daysToNextEarnings <= 14 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-600/50 font-mono font-semibold" title={`Scheduled earnings on ${item.nextEarningsDate}`}>
                                  ⚠️ Reports in {item.daysToNextEarnings}d
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Portfolio Position Context */}
                        <td className="py-3.5 px-3 text-center font-mono">
                          {item.portfolio?.holdsPosition ? (
                            <button
                              type="button"
                              onClick={() => openPositionEditor(item)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-950/70 hover:bg-teal-900 text-teal-300 border border-teal-700/60 font-mono text-[10px] cursor-pointer transition shadow-xs"
                              title={`Holding position: ${item.portfolio.currentWeight ? `${item.portfolio.currentWeight}%` : ''} ${item.portfolio.entryPrice ? `@ $${item.portfolio.entryPrice}` : ''} (Click to edit)`}
                            >
                              <Briefcase className="w-3 h-3 text-teal-400" />
                              <span className="font-bold">{item.portfolio.currentWeight ? `${item.portfolio.currentWeight}%` : 'Held'}</span>
                              {item.portfolio.entryPrice && <span className="text-slate-400 text-[9px]">@ ${item.portfolio.entryPrice}</span>}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openPositionEditor(item)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-teal-300 border border-slate-800 hover:border-slate-700 font-mono text-[10px] cursor-pointer transition"
                              title="Click to specify if you already hold a position in this company"
                            >
                              <Plus className="w-2.5 h-2.5 text-slate-500" />
                              <span>Position</span>
                            </button>
                          )}
                        </td>

                        {/* 4 Files Checklist Badges with Direct Preview */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5 font-mono text-[10px]">
                            {has10K && onPreviewFile ? (
                              <button
                                type="button"
                                onClick={() => onPreviewFile({
                                  id: item.files.annual?.split(/[\\/]/).pop() || item.files.annual,
                                  name: item.files.annual?.split(/[\\/]/).pop() || item.files.annual,
                                  auditCategory: "10-K"
                                })}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-700/70 cursor-pointer transition shadow-xs"
                                title={`Click to preview 10-K: ${item.files.annual?.split(/[\\/]/).pop()}`}
                              >
                                <Eye className="w-2.5 h-2.5 text-emerald-400" />
                                <span>10-K</span>
                              </button>
                            ) : (
                              <span 
                                className="px-1.5 py-0.5 rounded border bg-rose-950/50 text-rose-300 border-rose-800/60"
                                title="10-K / 20-F Missing"
                              >
                                10-K
                              </span>
                            )}

                            {isQ4 && !has10Q ? (
                              <span 
                                className="px-1.5 py-0.5 rounded border bg-slate-900/60 text-slate-400 border-slate-700"
                                title="10-Q not required for Q4 (Form 10-K covers Q4 & FY)"
                              >
                                10-K (Q4)
                              </span>
                            ) : has10Q && isCoveredBy8K && onPreviewFile ? (
                              <button
                                type="button"
                                onClick={() => onPreviewFile({
                                  id: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                                  name: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                                  auditCategory: "8-K"
                                })}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border-cyan-600/70 cursor-pointer transition shadow-xs"
                                title={`Form 10-Q pending SEC filing; interim quarterly results covered by Form 8-K (Item 2.02 Earnings Release): ${item.files.quarterly?.split(/[\\/]/).pop()}`}
                              >
                                <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                                <span>8-K (Interim)</span>
                              </button>
                            ) : has10Q && isCoveredBy8K ? (
                              <span 
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-cyan-950/80 text-cyan-300 border-cyan-600/70 font-mono text-[10px]"
                                title="Form 10-Q pending SEC filing; interim quarterly results covered by Form 8-K (Item 2.02 Earnings Release)"
                              >
                                <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                                <span>8-K (Interim)</span>
                              </span>
                            ) : has10Q && onPreviewFile ? (
                              <button
                                type="button"
                                onClick={() => onPreviewFile({
                                  id: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                                  name: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                                  auditCategory: "10-Q"
                                })}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-700/70 cursor-pointer transition shadow-xs"
                                title={`Click to preview Quarterly filing: ${item.files.quarterly?.split(/[\\/]/).pop()}`}
                              >
                                <Eye className="w-2.5 h-2.5 text-emerald-400" />
                                <span>10-Q</span>
                              </button>
                            ) : (
                              <span 
                                className="px-1.5 py-0.5 rounded border bg-rose-950/50 text-rose-300 border-rose-800/60"
                                title="10-Q / 6-K Missing"
                              >
                                10-Q
                              </span>
                            )}

                            {hasTranscript && onPreviewFile ? (
                              <button
                                type="button"
                                onClick={() => onPreviewFile({
                                  id: item.files.transcript?.split(/[\\/]/).pop() || item.files.transcript,
                                  name: item.files.transcript?.split(/[\\/]/).pop() || item.files.transcript,
                                  auditCategory: "Transcript"
                                })}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-700/70 cursor-pointer transition shadow-xs"
                                title={`Click to preview Call Transcript: ${item.files.transcript?.split(/[\\/]/).pop()}`}
                              >
                                <Eye className="w-2.5 h-2.5 text-emerald-400" />
                                <span>Call</span>
                              </button>
                            ) : (
                              <span 
                                className="px-1.5 py-0.5 rounded border bg-rose-950/50 text-rose-300 border-rose-800/60"
                                title="Transcript Missing"
                              >
                                Call
                              </span>
                            )}

                            {hasCsv && onPreviewFile ? (
                              <button
                                type="button"
                                onClick={() => onPreviewFile({
                                  id: item.files.csv?.split(/[\\/]/).pop() || item.files.csv,
                                  name: item.files.csv?.split(/[\\/]/).pop() || item.files.csv,
                                  auditCategory: "Financials TTM"
                                })}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-700/70 cursor-pointer transition shadow-xs"
                                title={`Click to preview TTM Financials CSV: ${item.files.csv?.split(/[\\/]/).pop()}`}
                              >
                                <Eye className="w-2.5 h-2.5 text-emerald-400" />
                                <span>CSV</span>
                              </button>
                            ) : (
                              <span 
                                className="px-1.5 py-0.5 rounded border bg-rose-950/50 text-rose-300 border-rose-800/60"
                                title="TTM CSV Missing"
                              >
                                CSV
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Integrity Audit */}
                        <td className="py-3.5 px-4 text-center">
                          {item.overridden ? (
                            <button 
                              type="button"
                              onClick={() => setExpandedMismatchTicker(expandedMismatchTicker === item.ticker ? null : item.ticker)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-[10px] font-bold cursor-pointer transition shadow-sm"
                              title="Safeguard overridden by user. Click to inspect discrepancies or revoke."
                            >
                              <ShieldCheck className="w-3 h-3 text-amber-400" /> Overridden
                              {expandedMismatchTicker === item.ticker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          ) : hasMismatches ? (
                            <button 
                              type="button"
                              onClick={() => setExpandedMismatchTicker(expandedMismatchTicker === item.ticker ? null : item.ticker)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono text-[10px] font-bold cursor-pointer transition shadow-sm"
                              title="Click to inspect exact mismatched files, periods, and audit discrepancies"
                            >
                              <ShieldAlert className="w-3 h-3 text-rose-400" /> Mismatch
                              {expandedMismatchTicker === item.ticker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          ) : allAudited ? (
                            <button
                              type="button"
                              onClick={() => setExpandedMismatchTicker(expandedMismatchTicker === item.ticker ? null : item.ticker)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold cursor-pointer transition shadow-sm"
                              title="0 Mismatches detected. Click to inspect all 4 verified files and previews."
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" /> 0 Mismatches
                              {expandedMismatchTicker === item.ticker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => setExpandedMismatchTicker(expandedMismatchTicker === item.ticker ? null : item.ticker)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-[10px] cursor-pointer transition shadow-sm"
                              title="Click to inspect missing filing files"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-400" /> Incomplete
                              {expandedMismatchTicker === item.ticker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </td>

                        {/* Execution Status */}
                        <td className="py-3.5 px-4 text-center font-mono">
                          {item.status === 'completed' && (
                            <div className="flex items-center justify-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px]">
                                <CheckCircle className="w-3 h-3" /> Dossier Saved ({item.dossierSize || 0} KB)
                              </span>
                              <a
                                href={`/api/batch/dossier/${encodeURIComponent(item.ticker)}`}
                                download
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 transition cursor-pointer"
                                title={`Download ${item.ticker} Deep Valuation Dossier (.md)`}
                              >
                                <DownloadCloud className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                          {item.status === 'running' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin" /> Step {item.currentStep}/17
                            </span>
                          )}
                          {item.status === 'ready' && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                              item.overridden
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium"
                                : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                            }`}>
                              {item.overridden ? "Ready (Overridden)" : "Ready to Run"}
                            </span>
                          )}
                          {item.status === 'blocked' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px]" title={item.error}>
                              <XCircle className="w-3 h-3" /> Blocked
                            </span>
                          )}
                          {item.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800 text-[10px]" title={item.error}>
                              Failed
                            </span>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onPullDocs && item.status !== 'completed' && item.status !== 'running' && (
                              <button
                                type="button"
                                onClick={() => handleItemPullDocs(item.ticker, item.period)}
                                disabled={isRunning || isPullingThisItem}
                                className="px-2 py-1 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border border-blue-700/50 rounded text-[10px] font-mono transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                                title={`Pull missing filings (10-K, 10-Q, Transcript, TTM CSV) for ${item.ticker} into _STAGING`}
                              >
                                {isPullingThisItem ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                                ) : (
                                  <DownloadCloud className="w-3 h-3 text-blue-400" />
                                )}
                                <span>Pull Docs</span>
                              </button>
                            )}

                            {onReAudit && item.status !== 'running' && (
                              <button
                                type="button"
                                onClick={() => handleItemReAudit(item.ticker)}
                                disabled={isRunning}
                                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition disabled:opacity-30 cursor-pointer"
                                title={`Re-audit ${item.ticker} files against _STAGING`}
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setExpandedMismatchTicker(expandedMismatchTicker === item.ticker ? null : item.ticker)}
                              className={`p-1.5 rounded transition cursor-pointer ${
                                expandedMismatchTicker === item.ticker
                                  ? "text-cyan-300 bg-cyan-950/80 border border-cyan-700/80"
                                  : "text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                              }`}
                              title={expandedMismatchTicker === item.ticker ? "Collapse file diagnostic drawer" : "Inspect all 4 filings & document previews"}
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveItemClick(item)}
                              disabled={isRunning}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition disabled:opacity-30 cursor-pointer"
                              title={`Remove ${item.ticker} from queue (with option to delete staging files)`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Diagnostic Mismatch & Incomplete Inspector Drawer */}
                      {expandedMismatchTicker === item.ticker && (
                        <tr key={`inspect-${item.id}`} className="bg-[#0f1420] border-y-2 border-rose-600/40">
                          <td colSpan={7} className="p-4">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                    <ShieldAlert className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                                      <span>Pre-Flight Integrity Diagnostic: {item.ticker}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Target: {item.period}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">${item.price}</span>
                                    </h4>
                                    <p className="text-[10px] text-slate-400">
                                      Detailed file-by-file audit comparing expected fiscal period against actual staged filings in _STAGING.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {onSyncPeriods && (
                                    <button
                                      type="button"
                                      onClick={handleTriggerSyncPeriods}
                                      disabled={isSyncingPeriods}
                                      className="px-2.5 py-1 bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 rounded text-[10px] font-mono transition flex items-center gap-1 cursor-pointer"
                                      title="Sync this ticker's target period to latest live reported quarter on FMP"
                                    >
                                      <Sparkles className="w-3 h-3 text-indigo-400" />
                                      <span>Sync to Live FMP Period</span>
                                    </button>
                                  )}
                                  {onPullDocs && (
                                    <button
                                      type="button"
                                      onClick={() => handleItemPullDocs(item.ticker, item.period)}
                                      disabled={isPullingThisItem}
                                      className="px-2.5 py-1 bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-700/50 rounded text-[10px] font-mono transition flex items-center gap-1 cursor-pointer"
                                      title="Re-download all 4 filings anchored to target period into _STAGING"
                                    >
                                      <DownloadCloud className="w-3 h-3 text-blue-400" />
                                      <span>Pull Filings for {item.period}</span>
                                    </button>
                                  )}
                                  {onToggleOverride && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        await onToggleOverride(item.id, !item.overridden);
                                        setToastMsg({ 
                                          type: item.overridden ? "info" : "success", 
                                          text: item.overridden 
                                            ? `Revoked override for ${item.ticker}.` 
                                            : `Accepted interim filings for ${item.ticker}. Ready to run!` 
                                        });
                                        setTimeout(() => setToastMsg(null), 3500);
                                      }}
                                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition flex items-center gap-1 cursor-pointer border shadow-sm ${
                                        item.overridden 
                                          ? "bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border-amber-600/50" 
                                          : "bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border-emerald-600/60"
                                      }`}
                                      title={item.overridden 
                                        ? "Revoke override and restore strict safeguard blocking" 
                                        : "Accept prior-quarter 10-Q as interim baseline and approve this company for batch execution"
                                      }
                                    >
                                      <ShieldCheck className={`w-3.5 h-3.5 ${item.overridden ? 'text-amber-400' : 'text-emerald-400'}`} />
                                      <span>{item.overridden ? "Revoke Override" : "Accept Interim 10-Q & Override"}</span>
                                    </button>
                                  )}
                                  {onDeleteFile && item.integrityReport?.mismatches && item.integrityReport.mismatches.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const count = item.integrityReport?.mismatches?.length || 0;
                                        const confirmed = window.confirm(`Delete all ${count} mismatched file(s) for ${item.ticker} from staging and re-audit?`);
                                        if (!confirmed) return;
                                        for (const m of item.integrityReport?.mismatches || []) {
                                          await onDeleteFile(m.fileName, item.ticker);
                                        }
                                        setToastMsg({ type: "info", text: `Deleted mismatched file(s) and re-audited ${item.ticker}.` });
                                        setTimeout(() => setToastMsg(null), 3500);
                                      }}
                                      className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/50 rounded text-[10px] font-mono transition flex items-center gap-1 cursor-pointer"
                                      title="Delete all mismatched files for this ticker and re-audit immediately"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                      <span>Delete Mismatches</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleItemReAudit(item.ticker)}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] font-mono transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Re-audit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedMismatchTicker(null)}
                                    className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Specific Mismatch Table if any exist */}
                              {item.integrityReport?.mismatches && item.integrityReport.mismatches.length > 0 ? (
                                <div className="border border-rose-800/40 rounded-lg overflow-hidden bg-rose-950/10">
                                  <div className="px-3 py-1.5 bg-rose-950/40 border-b border-rose-800/40 text-[10px] font-mono font-bold text-rose-300 flex items-center gap-1.5">
                                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                    <span>Detected Period / Company Mismatches ({item.integrityReport.mismatches.length})</span>
                                  </div>
                                  <table className="w-full text-left font-mono text-[10px]">
                                    <thead>
                                      <tr className="bg-black/30 border-b border-rose-900/30 text-slate-400">
                                        <th className="py-1.5 px-3">File / Document</th>
                                        <th className="py-1.5 px-2">Category</th>
                                        <th className="py-1.5 px-2">Issue</th>
                                        <th className="py-1.5 px-2 text-amber-300">Expected</th>
                                        <th className="py-1.5 px-2 text-rose-300 font-bold">Found in File</th>
                                        {onDeleteFile && <th className="py-1.5 px-2 text-right">Action</th>}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-rose-900/20">
                                      {item.integrityReport.mismatches.map((m, mIdx) => (
                                        <tr key={mIdx} className="hover:bg-rose-950/20">
                                          <td className="py-1.5 px-3 text-white truncate max-w-xs" title={m.fileName}>
                                            {m.fileName}
                                          </td>
                                          <td className="py-1.5 px-2 text-slate-300 uppercase">{m.category}</td>
                                          <td className="py-1.5 px-2 text-rose-300">{m.issue}</td>
                                          <td className="py-1.5 px-2 text-emerald-400 bg-emerald-950/30 rounded">{m.expected}</td>
                                          <td className="py-1.5 px-2 text-rose-400 font-bold bg-rose-950/40 rounded">{m.actual}</td>
                                           {(onDeleteFile || onPreviewFile) && (
                                            <td className="py-1.5 px-2 text-right whitespace-nowrap">
                                              <div className="flex items-center justify-end gap-1">
                                                {onPreviewFile && (
                                                  <button
                                                    type="button"
                                                    onClick={() => onPreviewFile({
                                                      id: m.fileName,
                                                      name: m.fileName,
                                                      auditCategory: m.category
                                                    })}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-mono cursor-pointer transition shadow-sm"
                                                    title={`Preview ${m.fileName}`}
                                                  >
                                                    <Eye className="w-3 h-3 text-cyan-400" />
                                                    <span>Preview</span>
                                                  </button>
                                                )}
                                                {onDeleteFile && (
                                                  <button
                                                    type="button"
                                                    onClick={async () => {
                                                      const confirmed = window.confirm(`Delete "${m.fileName}" from staging and re-audit ${item.ticker}?`);
                                                      if (!confirmed) return;
                                                      await onDeleteFile(m.fileName, item.ticker);
                                                      setToastMsg({ type: "info", text: `Deleted ${m.fileName} and re-audited ${item.ticker}.` });
                                                      setTimeout(() => setToastMsg(null), 3500);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-[10px] font-mono cursor-pointer transition shadow-sm"
                                                    title={`Delete ${m.fileName} from staging directory`}
                                                  >
                                                    <Trash2 className="w-3 h-3 text-rose-400" />
                                                    <span>Delete</span>
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                item.error && (
                                  <div className="p-2.5 rounded bg-amber-950/20 border border-amber-800/40 text-[11px] font-mono text-amber-300 flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                    <span>{item.error}</span>
                                  </div>
                                )
                              )}

                              {/* 4 Files Breakdown Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 font-mono text-[10px]">
                                {/* Annual (10-K) */}
                                <div className={`p-2.5 rounded-lg border ${item.files.annual ? 'bg-slate-900/80 border-slate-700' : 'bg-rose-950/20 border-rose-800/40'}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-200">10-K / 20-F Annual</span>
                                    <div className="flex items-center gap-1.5">
                                      {item.files.annual && onPreviewFile && (
                                        <button
                                          type="button"
                                          onClick={() => onPreviewFile({
                                            id: item.files.annual?.split(/[\\/]/).pop() || item.files.annual,
                                            name: item.files.annual?.split(/[\\/]/).pop() || item.files.annual,
                                            auditCategory: "10-K"
                                          })}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-mono cursor-pointer transition shadow-xs"
                                          title={`Preview ${item.files.annual?.split(/[\\/]/).pop()}`}
                                        >
                                          <Eye className="w-3 h-3 text-cyan-400" />
                                          <span>Preview</span>
                                        </button>
                                      )}
                                      {item.files.annual ? (
                                        <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Found</span>
                                      ) : (
                                        <span className="text-rose-400 flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Missing</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-slate-400 truncate" title={item.files.annual || 'Missing'}>
                                    {item.files.annual || 'None in _STAGING'}
                                  </div>
                                  {item.integrityReport?.fileAudits?.[item.files.annual || ""] && (
                                    <div className="mt-1 pt-1 border-t border-slate-800 text-[9px] text-slate-400">
                                      Detected: <span className="text-white font-bold">{item.integrityReport.fileAudits[item.files.annual || ""].detectedPeriod || "N/A"}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Quarterly (10-Q / 8-K Interim) */}
                                <div className={`p-2.5 rounded-lg border ${
                                  item.files.quarterly 
                                    ? (isCoveredBy8K ? 'bg-cyan-950/20 border-cyan-700/50' : 'bg-slate-900/80 border-slate-700') 
                                    : isQ4 
                                      ? 'bg-slate-900/40 border-slate-800' 
                                      : 'bg-rose-950/20 border-rose-800/40'
                                }`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-200">
                                      {isCoveredBy8K ? "Interim Form 8-K (Item 2.02)" : "10-Q / 6-K Quarterly"}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {item.files.quarterly && onPreviewFile && (
                                        <button
                                          type="button"
                                          onClick={() => onPreviewFile({
                                            id: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                                            name: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                                            auditCategory: isCoveredBy8K ? "8-K" : "10-Q"
                                          })}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-mono cursor-pointer transition shadow-xs"
                                          title={`Preview ${item.files.quarterly?.split(/[\\/]/).pop()}`}
                                        >
                                          <Eye className="w-3 h-3 text-cyan-400" />
                                          <span>Preview</span>
                                        </button>
                                      )}
                                      {isCoveredBy8K ? (
                                        <span className="text-cyan-300 flex items-center gap-1 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-700/60 text-[10px] font-mono">
                                          <ShieldCheck className="w-3 h-3 text-cyan-400" /> Covered by 8-K (Interim)
                                        </span>
                                      ) : item.files.quarterly ? (
                                        <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Found</span>
                                      ) : isQ4 ? (
                                        <span className="text-slate-400 flex items-center gap-0.5"><ShieldCheck className="w-3 h-3 text-slate-400" /> Covered by 10-K (Q4)</span>
                                      ) : (
                                        <span className="text-rose-400 flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Missing</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-slate-400 truncate" title={item.files.quarterly || (isQ4 ? 'Form 10-K covers Q4 & FY' : 'Missing')}>
                                    {item.files.quarterly || (isQ4 ? 'Covered by Form 10-K (Not filed for Q4)' : 'None in _STAGING')}
                                  </div>
                                  {item.integrityReport?.fileAudits?.[item.files.quarterly || ""] && (
                                    <div className="mt-1 pt-1 border-t border-slate-800 text-[9px] text-slate-400">
                                      Detected: <span className="text-white font-bold">{item.integrityReport.fileAudits[item.files.quarterly || ""].detectedPeriod || "N/A"}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Transcript */}
                                <div className={`p-2.5 rounded-lg border ${item.files.transcript ? 'bg-slate-900/80 border-slate-700' : 'bg-rose-950/20 border-rose-800/40'}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-200">Call Transcript</span>
                                    <div className="flex items-center gap-1.5">
                                      {item.files.transcript && onPreviewFile && (
                                        <button
                                          type="button"
                                          onClick={() => onPreviewFile({
                                            id: item.files.transcript?.split(/[\\/]/).pop() || item.files.transcript,
                                            name: item.files.transcript?.split(/[\\/]/).pop() || item.files.transcript,
                                            auditCategory: "Transcript"
                                          })}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-mono cursor-pointer transition shadow-xs"
                                          title={`Preview ${item.files.transcript?.split(/[\\/]/).pop()}`}
                                        >
                                          <Eye className="w-3 h-3 text-cyan-400" />
                                          <span>Preview</span>
                                        </button>
                                      )}
                                      {item.files.transcript ? (
                                        <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Found</span>
                                      ) : (
                                        <span className="text-rose-400 flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Missing</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-slate-400 truncate" title={item.files.transcript || 'Missing'}>
                                    {item.files.transcript || 'None in _STAGING'}
                                  </div>
                                  {item.integrityReport?.fileAudits?.[item.files.transcript || ""] && (
                                    <div className="mt-1 pt-1 border-t border-slate-800 text-[9px] text-slate-400">
                                      Detected: <span className="text-white font-bold">{item.integrityReport.fileAudits[item.files.transcript || ""].detectedPeriod || "N/A"}</span>
                                    </div>
                                  )}
                                </div>

                                {/* CSV */}
                                <div className={`p-2.5 rounded-lg border ${item.files.csv ? 'bg-slate-900/80 border-slate-700' : 'bg-rose-950/20 border-rose-800/40'}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-200">TTM Financials CSV</span>
                                    <div className="flex items-center gap-1.5">
                                      {item.files.csv && onPreviewFile && (
                                        <button
                                          type="button"
                                          onClick={() => onPreviewFile({
                                            id: item.files.csv?.split(/[\\/]/).pop() || item.files.csv,
                                            name: item.files.csv?.split(/[\\/]/).pop() || item.files.csv,
                                            auditCategory: "Financials TTM"
                                          })}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-mono cursor-pointer transition shadow-xs"
                                          title={`Preview ${item.files.csv?.split(/[\\/]/).pop()}`}
                                        >
                                          <Eye className="w-3 h-3 text-cyan-400" />
                                          <span>Preview</span>
                                        </button>
                                      )}
                                      {item.files.csv ? (
                                        <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Found</span>
                                      ) : (
                                        <span className="text-rose-400 flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Missing</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-slate-400 truncate" title={item.files.csv || 'Missing'}>
                                    {item.files.csv || 'None in _STAGING'}
                                  </div>
                                  {item.integrityReport?.fileAudits?.[item.files.csv || ""] && (
                                    <div className="mt-1 pt-1 border-t border-slate-800 text-[9px] text-slate-400">
                                      Detected: <span className="text-white font-bold">{item.integrityReport.fileAudits[item.files.csv || ""].detectedPeriod || "N/A"}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Queue Card View (< md) */}
            <div className="md:hidden space-y-3">
              {items.map(item => {
                const isQ4 = Boolean(item.period && (item.period.toUpperCase().includes("Q4") || item.period.toUpperCase().includes("FY")));
                const has10K = Boolean(item.files.annual);
                const has10Q = Boolean(item.files.quarterly);
                const isCoveredBy8K = Boolean(
                  item.isCoveredBy8K ||
                  item.files?.isCoveredBy8K ||
                  (item.files.quarterly && (
                    item.files.quarterly.toLowerCase().includes("8-k") ||
                    item.files.quarterly.toLowerCase().includes("8k") ||
                    item.files.quarterly.toLowerCase().includes("item2.02") ||
                    item.files.quarterly.toLowerCase().includes("item-2.02") ||
                    item.files.quarterly.toLowerCase().includes("earnings-release") ||
                    item.files.quarterly.toLowerCase().includes("earnings_release")
                  ))
                );
                const hasTranscript = Boolean(item.files.transcript);
                const hasCsv = Boolean(item.files.csv);
                const hasMismatches = item.integrityReport?.hasMismatches;
                const allAudited = has10K && (isQ4 || has10Q) && hasTranscript && hasCsv && !hasMismatches;
                const isPullingThisItem = Boolean(pullingDocsMap[item.ticker]);

                return (
                  <div 
                    key={`mobile-${item.id}`}
                    className={`bg-[#0e121a] border rounded-xl p-3.5 space-y-3 shadow-md transition ${
                      item.status === 'running' 
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-emerald-950/40' 
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Header: Ticker, Period, Price, and Execution Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-base tracking-wide">
                            {item.ticker}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.period}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-400">
                            ${item.price}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {item.fmpSynced || item.fmpSource === 'fmp' ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> FMP Synced
                            </span>
                          ) : item.fmpSource === 'fallback' ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-mono">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> Fallback
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                              Manual
                            </span>
                          )}
                          {item.nextEarningsDate && typeof item.daysToNextEarnings === 'number' && item.daysToNextEarnings >= 0 && item.daysToNextEarnings <= 14 && (
                            <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-600/50 font-mono font-semibold" title={`Scheduled earnings on ${item.nextEarningsDate}`}>
                              ⚠️ Reports in {item.daysToNextEarnings}d
                            </span>
                          )}

                          {/* Portfolio Position Context in Mobile Card */}
                          {item.portfolio?.holdsPosition ? (
                            <button
                              type="button"
                              onClick={() => openPositionEditor(item)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-700/60 font-mono text-[9px] font-bold cursor-pointer"
                              title="Click to edit position"
                            >
                              <Briefcase className="w-2.5 h-2.5 text-teal-400" />
                              <span>{item.portfolio.currentWeight ? `${item.portfolio.currentWeight}%` : 'Held'} {item.portfolio.entryPrice ? `@ $${item.portfolio.entryPrice}` : ''}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openPositionEditor(item)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-teal-300 border border-slate-700 font-mono text-[9px] cursor-pointer"
                              title="Click to set existing position"
                            >
                              <Plus className="w-2.5 h-2.5" /> Position
                            </button>
                          )}

                          {/* Integrity status badge / button */}
                          {item.overridden ? (
                            <button
                              type="button"
                              onClick={() => setExpandedMismatchTicker(expandedMismatchTicker === item.ticker ? null : item.ticker)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[9px] font-bold cursor-pointer"
                            >
                              <ShieldCheck className="w-2.5 h-2.5 text-amber-400" /> Overridden
                            </button>
                          ) : hasMismatches ? (
                            <button
                              type="button"
                              onClick={() => setExpandedMismatchTicker(expandedMismatchTicker === item.ticker ? null : item.ticker)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-[9px] font-bold cursor-pointer"
                            >
                              <ShieldAlert className="w-2.5 h-2.5 text-rose-400" /> Mismatch
                            </button>
                          ) : allAudited ? (
                            <button
                              type="button"
                              onClick={() => setExpandedMismatchTicker(expandedMismatchTicker === item.ticker ? null : item.ticker)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[9px] font-bold cursor-pointer"
                            >
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> 0 Mismatches
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setExpandedMismatchTicker(expandedMismatchTicker === item.ticker ? null : item.ticker)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[9px] cursor-pointer"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> Incomplete
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right Status Pill */}
                      <div className="shrink-0 font-mono text-right">
                        {item.status === 'completed' && (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                              <CheckCircle className="w-3 h-3" /> Done ({item.dossierSize || 0} KB)
                            </span>
                            <a
                              href={`/api/batch/dossier/${encodeURIComponent(item.ticker)}`}
                              download
                              className="p-1 rounded bg-slate-800 text-emerald-400 border border-slate-700 cursor-pointer"
                              title="Download Dossier"
                            >
                              <DownloadCloud className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {item.status === 'running' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] animate-pulse">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Step {item.currentStep}/17
                          </span>
                        )}
                        {item.status === 'ready' && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                            item.overridden
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium"
                              : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                          }`}>
                            {item.overridden ? "Ready (Overridden)" : "Ready to Run"}
                          </span>
                        )}
                        {item.status === 'blocked' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px]" title={item.error}>
                            <XCircle className="w-2.5 h-2.5" /> Blocked
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800 text-[10px]" title={item.error}>
                            Failed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4 Files Checklist Badges (Mobile Grid) */}
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Filing Files Audit (4/4)</span>
                        <span className="text-[9px] text-slate-500">Tap file to preview</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px]">
                        {/* 10-K */}
                        {has10K && onPreviewFile ? (
                          <button
                            type="button"
                            onClick={() => onPreviewFile({
                              id: item.files.annual?.split(/[\\/]/).pop() || item.files.annual,
                              name: item.files.annual?.split(/[\\/]/).pop() || item.files.annual,
                              auditCategory: "10-K"
                            })}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border bg-emerald-950/70 hover:bg-emerald-900 active:bg-emerald-900 text-emerald-300 border-emerald-700/70 cursor-pointer shadow-xs"
                            title={`Preview 10-K: ${item.files.annual?.split(/[\\/]/).pop()}`}
                          >
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>10-K</span>
                          </button>
                        ) : (
                          <span className="flex items-center justify-center py-1.5 px-2 rounded-lg border bg-rose-950/50 text-rose-300 border-rose-800/60">
                            10-K Missing
                          </span>
                        )}

                        {/* 10-Q / 8-K */}
                        {isQ4 && !has10Q ? (
                          <span className="flex items-center justify-center py-1.5 px-2 rounded-lg border bg-slate-900/60 text-slate-400 border-slate-700">
                            10-K (Q4)
                          </span>
                        ) : has10Q && isCoveredBy8K && onPreviewFile ? (
                          <button
                            type="button"
                            onClick={() => onPreviewFile({
                              id: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                              name: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                              auditCategory: "8-K"
                            })}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border bg-cyan-950/80 hover:bg-cyan-900 active:bg-cyan-900 text-cyan-300 border-cyan-600/70 cursor-pointer shadow-xs"
                            title={`Preview 8-K Interim: ${item.files.quarterly?.split(/[\\/]/).pop()}`}
                          >
                            <ShieldCheck className="w-3 h-3 text-cyan-400" />
                            <span>8-K Interim</span>
                          </button>
                        ) : has10Q && onPreviewFile ? (
                          <button
                            type="button"
                            onClick={() => onPreviewFile({
                              id: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                              name: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                              auditCategory: "10-Q"
                            })}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border bg-emerald-950/70 hover:bg-emerald-900 active:bg-emerald-900 text-emerald-300 border-emerald-700/70 cursor-pointer shadow-xs"
                            title={`Preview 10-Q: ${item.files.quarterly?.split(/[\\/]/).pop()}`}
                          >
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>10-Q</span>
                          </button>
                        ) : (
                          <span className="flex items-center justify-center py-1.5 px-2 rounded-lg border bg-rose-950/50 text-rose-300 border-rose-800/60">
                            10-Q Missing
                          </span>
                        )}

                        {/* Transcript */}
                        {hasTranscript && onPreviewFile ? (
                          <button
                            type="button"
                            onClick={() => onPreviewFile({
                              id: item.files.transcript?.split(/[\\/]/).pop() || item.files.transcript,
                              name: item.files.transcript?.split(/[\\/]/).pop() || item.files.transcript,
                              auditCategory: "Transcript"
                            })}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border bg-emerald-950/70 hover:bg-emerald-900 active:bg-emerald-900 text-emerald-300 border-emerald-700/70 cursor-pointer shadow-xs"
                            title={`Preview Transcript: ${item.files.transcript?.split(/[\\/]/).pop()}`}
                          >
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>Call</span>
                          </button>
                        ) : (
                          <span className="flex items-center justify-center py-1.5 px-2 rounded-lg border bg-rose-950/50 text-rose-300 border-rose-800/60">
                            Call Missing
                          </span>
                        )}

                        {/* CSV */}
                        {hasCsv && onPreviewFile ? (
                          <button
                            type="button"
                            onClick={() => onPreviewFile({
                              id: item.files.csv?.split(/[\\/]/).pop() || item.files.csv,
                              name: item.files.csv?.split(/[\\/]/).pop() || item.files.csv,
                              auditCategory: "Financials TTM"
                            })}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border bg-emerald-950/70 hover:bg-emerald-900 active:bg-emerald-900 text-emerald-300 border-emerald-700/70 cursor-pointer shadow-xs"
                            title={`Preview TTM CSV: ${item.files.csv?.split(/[\\/]/).pop()}`}
                          >
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>CSV</span>
                          </button>
                        ) : (
                          <span className="flex items-center justify-center py-1.5 px-2 rounded-lg border bg-rose-950/50 text-rose-300 border-rose-800/60">
                            CSV Missing
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mobile Action Controls */}
                    <div className="flex items-center gap-2 pt-1">
                      {onPullDocs && item.status !== 'completed' && item.status !== 'running' && (
                        <button
                          type="button"
                          onClick={() => handleItemPullDocs(item.ticker, item.period)}
                          disabled={isRunning || isPullingThisItem}
                          className="flex-1 py-2 bg-blue-950/50 hover:bg-blue-900/60 active:bg-blue-900/80 text-blue-300 border border-blue-700/50 rounded-lg text-xs font-mono font-medium transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          title={`Pull missing filings for ${item.ticker}`}
                        >
                          {isPullingThisItem ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                          ) : (
                            <DownloadCloud className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span>Pull Docs</span>
                        </button>
                      )}

                      {onReAudit && item.status !== 'running' && (
                        <button
                          type="button"
                          onClick={() => handleItemReAudit(item.ticker)}
                          disabled={isRunning}
                          className="p-2 text-slate-400 hover:text-cyan-300 bg-slate-800/80 border border-slate-700 rounded-lg transition cursor-pointer"
                          title={`Re-audit ${item.ticker}`}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedMismatchTicker(expandedMismatchTicker === item.ticker ? null : item.ticker)}
                        className={`p-2 rounded-lg transition flex items-center gap-1 text-xs font-mono border cursor-pointer ${
                          expandedMismatchTicker === item.ticker
                            ? "text-cyan-300 bg-cyan-950/80 border-cyan-700/80"
                            : "text-slate-400 bg-slate-800/80 border-slate-700 hover:text-cyan-300"
                        }`}
                        title="Inspect individual filing details and previews"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Files</span>
                        {expandedMismatchTicker === item.ticker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveItemClick(item)}
                        disabled={isRunning}
                        className="p-2 text-slate-500 hover:text-rose-400 bg-slate-800/80 border border-slate-700 rounded-lg transition cursor-pointer"
                        title={`Remove ${item.ticker} from queue`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile Diagnostic Inspector Accordion (When Expanded) */}
                    {expandedMismatchTicker === item.ticker && (
                      <div className="mt-2 p-3 bg-[#0a0d14] rounded-lg border border-slate-800 space-y-2.5 animate-in fade-in duration-150">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2 gap-2">
                          <span className="text-xs font-bold text-white font-mono">
                            Diagnostic: {item.ticker} ({item.period})
                          </span>
                          {onToggleOverride && (
                            <button
                              type="button"
                              onClick={async () => {
                                await onToggleOverride(item.id, !item.overridden);
                                setToastMsg({ 
                                  type: item.overridden ? "info" : "success", 
                                  text: item.overridden 
                                    ? `Revoked override for ${item.ticker}.` 
                                    : `Accepted interim filings for ${item.ticker}. Ready to run!` 
                                });
                                setTimeout(() => setToastMsg(null), 3500);
                              }}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium border cursor-pointer transition ${
                                item.overridden 
                                  ? "bg-slate-800 text-slate-300 border-slate-700"
                                  : "bg-amber-950/70 text-amber-300 border-amber-600/70"
                              }`}
                            >
                              {item.overridden ? "Revoke Override" : "Accept Interim & Run"}
                            </button>
                          )}
                        </div>

                        {/* 4 Files Breakdown */}
                        <div className="grid grid-cols-1 gap-2 text-[10px] font-mono">
                          {/* 10-K */}
                          <div className={`p-2 rounded-lg border ${item.files.annual ? 'bg-slate-900/80 border-slate-700' : 'bg-rose-950/20 border-rose-800/40'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-200">10-K / 20-F</span>
                              {item.files.annual && onPreviewFile ? (
                                <button
                                  type="button"
                                  onClick={() => onPreviewFile({
                                    id: item.files.annual?.split(/[\\/]/).pop() || item.files.annual,
                                    name: item.files.annual?.split(/[\\/]/).pop() || item.files.annual,
                                    auditCategory: "10-K"
                                  })}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 text-[10px] cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-cyan-400" /> Preview
                                </button>
                              ) : item.files.annual ? (
                                <span className="text-emerald-400">Found</span>
                              ) : (
                                <span className="text-rose-400">Missing</span>
                              )}
                            </div>
                            <div className="text-slate-400 break-all">{item.files.annual || 'None in _STAGING'}</div>
                          </div>

                          {/* 10-Q / 8-K */}
                          <div className={`p-2 rounded-lg border ${item.files.quarterly || isQ4 ? 'bg-slate-900/80 border-slate-700' : 'bg-rose-950/20 border-rose-800/40'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-200">10-Q / 8-K</span>
                              {item.files.quarterly && onPreviewFile ? (
                                <button
                                  type="button"
                                  onClick={() => onPreviewFile({
                                    id: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                                    name: item.files.quarterly?.split(/[\\/]/).pop() || item.files.quarterly,
                                    auditCategory: isCoveredBy8K ? "8-K" : "10-Q"
                                  })}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 text-[10px] cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-cyan-400" /> Preview
                                </button>
                              ) : isQ4 ? (
                                <span className="text-slate-400">Covered by 10-K (Q4)</span>
                              ) : item.files.quarterly ? (
                                <span className="text-emerald-400">Found</span>
                              ) : (
                                <span className="text-rose-400">Missing</span>
                              )}
                            </div>
                            <div className="text-slate-400 break-all">{item.files.quarterly || (isQ4 ? 'Covered by 10-K (Not filed for Q4)' : 'None in _STAGING')}</div>
                          </div>

                          {/* Transcript */}
                          <div className={`p-2 rounded-lg border ${item.files.transcript ? 'bg-slate-900/80 border-slate-700' : 'bg-rose-950/20 border-rose-800/40'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-200">Call Transcript</span>
                              {item.files.transcript && onPreviewFile ? (
                                <button
                                  type="button"
                                  onClick={() => onPreviewFile({
                                    id: item.files.transcript?.split(/[\\/]/).pop() || item.files.transcript,
                                    name: item.files.transcript?.split(/[\\/]/).pop() || item.files.transcript,
                                    auditCategory: "Transcript"
                                  })}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 text-[10px] cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-cyan-400" /> Preview
                                </button>
                              ) : item.files.transcript ? (
                                <span className="text-emerald-400">Found</span>
                              ) : (
                                <span className="text-rose-400">Missing</span>
                              )}
                            </div>
                            <div className="text-slate-400 break-all">{item.files.transcript || 'None in _STAGING'}</div>
                          </div>

                          {/* CSV */}
                          <div className={`p-2 rounded-lg border ${item.files.csv ? 'bg-slate-900/80 border-slate-700' : 'bg-rose-950/20 border-rose-800/40'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-200">TTM Financials CSV</span>
                              {item.files.csv && onPreviewFile ? (
                                <button
                                  type="button"
                                  onClick={() => onPreviewFile({
                                    id: item.files.csv?.split(/[\\/]/).pop() || item.files.csv,
                                    name: item.files.csv?.split(/[\\/]/).pop() || item.files.csv,
                                    auditCategory: "Financials TTM"
                                  })}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 text-[10px] cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-cyan-400" /> Preview
                                </button>
                              ) : item.files.csv ? (
                                <span className="text-emerald-400">Found</span>
                              ) : (
                                <span className="text-rose-400">Missing</span>
                              )}
                            </div>
                            <div className="text-slate-400 break-all">{item.files.csv || 'None in _STAGING'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>

        {/* --- Footer Controls --- */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-[#141822] border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            {blockedCount > 0 ? (
              <span className="text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-[11px] sm:text-xs">{blockedCount} company is blocked. Only companies with 0 mismatches will be executed.</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="text-[11px] sm:text-xs">All documents verified with zero mismatches. Execution gate unlocked.</span>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            {/* Staging Directory Switcher (G-Drive vs Local) */}
            <div 
              className="flex items-center justify-between sm:justify-start gap-2 bg-slate-900/80 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-800 text-xs font-mono"
              title={`Active staging folder: ${batchState?.activeStagingDir || (batchState?.stagingLocation === 'local' ? './staging' : 'G:/My Drive/Company Data/_STAGING')}`}
            >
              <div className="flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 text-[11px]">Staging:</span>
              </div>
              <button
                type="button"
                onClick={() => onSetStagingLocation?.(batchState?.stagingLocation === 'local' ? 'gdrive' : 'local')}
                className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                title="Click to toggle staging directory between Google Drive and Local ./staging"
              >
                {batchState?.stagingLocation === 'local' ? '📁 Local (./staging)' : '☁️ G-Drive (_STAGING)'}
              </button>
            </div>

            {/* Staging Source Files Retention Option */}
            <label 
              className="flex items-center justify-between sm:justify-start gap-2 text-slate-300 text-xs font-mono select-none cursor-pointer bg-slate-900/80 hover:bg-slate-850 px-3 py-2 rounded-xl border border-slate-800 transition"
              title="When checked: Raw 10-K, 10-Q & CSVs remain in staging for fast re-runs (~35 MB for 50 companies). When unchecked: Raw files are purged after dossier compilation to keep disk minimal."
            >
              <span className="text-[11px]">Retain Staging Files</span>
              <input
                type="checkbox"
                checked={batchState?.retainStagingFiles !== false}
                onChange={(e) => onSetRetention?.(e.target.checked)}
                className="rounded border-slate-700 bg-slate-850 text-emerald-500 focus:ring-emerald-500 cursor-pointer w-4 h-4"
              />
            </label>

            {isRunning ? (
              <button
                type="button"
                onClick={onStopBatch}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-lg shadow-rose-950/50 cursor-pointer"
              >
                <Pause className="w-4 h-4" /> Stop Batch Pipeline
              </button>
            ) : flexWatcherState?.isWaiting && flexWatcherState?.target === 'batch' ? (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-950/60 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-mono font-bold animate-pulse">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Flex Gatekeeper Active (Next probe in {flexWatcherState.nextCheckInSeconds}s)</span>
                </div>
                {onCancelFlexWait && (
                  <button
                    type="button"
                    onClick={onCancelFlexWait}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-semibold border border-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {onQueueForFlex && (
                  <button
                    type="button"
                    onClick={onQueueForFlex}
                    disabled={readyCount === 0}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 disabled:opacity-40 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                    title="Monitor Gemini Flex cluster and automatically launch batch pipeline when capacity opens (HTTP 200)"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Queue for Flex</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onStartBatch}
                  disabled={readyCount === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl text-xs font-mono font-bold transition shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" /> Start Batch Pipeline ({readyCount} Ready)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- Portfolio Position Editor Modal --- */}
        {editingPositionItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-[#121620] border border-slate-750 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-mono font-bold text-white">
                    Portfolio Position: {editingPositionItem.ticker}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPositionItem(null)}
                  className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Specify whether you currently hold shares in <span className="font-mono text-emerald-400 font-bold">{editingPositionItem.ticker}</span>. 
                When active, the valuation pipeline grounds intermediate steps and customizes final Munger synthesis towards portfolio sizing, trimming, or accumulating.
              </p>

              <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-slate-800/80 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editHoldsPosition}
                    onChange={(e) => setEditHoldsPosition(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-semibold text-white">
                    User Already Holds Position
                  </span>
                </label>

                {editHoldsPosition && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60 animate-in fade-in duration-100">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                        Portfolio Weight %
                      </label>
                      <input
                        type="text"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        placeholder="e.g. 5.5"
                        className="w-full bg-[#141822] border border-slate-750 focus:border-teal-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                        Entry Price ($)
                      </label>
                      <input
                        type="text"
                        value={editEntryPrice}
                        onChange={(e) => setEditEntryPrice(e.target.value)}
                        placeholder="e.g. 142.50"
                        className="w-full bg-[#141822] border border-slate-750 focus:border-teal-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div>
                  {editingPositionItem.portfolio?.holdsPosition && (
                    <button
                      type="button"
                      onClick={handleClearPosition}
                      disabled={isSavingPosition}
                      className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-mono transition cursor-pointer"
                    >
                      Clear Position
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPositionItem(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePosition}
                    disabled={isSavingPosition}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {isSavingPosition ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Save Position Context
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
