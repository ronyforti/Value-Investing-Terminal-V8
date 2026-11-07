import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  FileText, CheckCircle2, XCircle, Play, Pause, RotateCcw, 
  HelpCircle, Download, RefreshCw, UploadCloud, Info, Check, 
  TrendingUp, HardHat, AlertTriangle, Cpu, Terminal, Sparkles, BookOpen,
  Pin, Eye, EyeOff, Key, ChevronDown, ChevronUp, Trash2, Globe, ShieldAlert,
  FileWarning, Layers, Loader2, Zap, ShieldCheck, Bell, Radar, ArrowRight, Calendar
} from "lucide-react";
import { ExecutionMode, SessionMode, SessionState, FileLog, AuditCheck, StepOutput, CurrencyAuditResult, DocumentIntegrityReport, BatchQueueState, NotificationConfig, CompetitorRadarDossier, PortfolioContext, FlexProbeResult, FlexWatcherState } from "./types.js";
import { MASTER_PROMPTS, CROSSCHECK_PROMPT } from "./prompts.js";
import MarkdownView, { cleanMarkdownForRendering } from "./components/MarkdownView.tsx";
import DocumentPreviewModal from "./components/DocumentPreviewModal.tsx";
import CurrencyGuardModal from "./components/CurrencyGuardModal.tsx";
import DocumentIntegrityModal from "./components/DocumentIntegrityModal.tsx";
import MissingDocumentsModal from "./components/MissingDocumentsModal.tsx";
import DownloadOptionsModal from "./components/DownloadOptionsModal.tsx";
import { BatchQueueModal } from "./components/BatchQueueModal.tsx";
import NotificationModal from "./components/NotificationModal.tsx";
import CompetitorRadarModal from "./components/CompetitorRadarModal.tsx";
import FileSubstanceModal from "./components/FileSubstanceModal.tsx";
import TranscriptAlertModal from "./components/TranscriptAlertModal.tsx";
import { checkFileSubstance, auditFilesSubstance, runAudit } from "./documentGuard.js";
import { FileSubstanceIssue } from "./types.js";
import { triggerDesktopAlert } from "./utils/audioAlert.js";
import { auditDocumentIntegrity, parsePeriodString } from "./documentGuard.js";
import { downloadStandaloneHtml } from "./utils/googleDocs.js";
import { isInterimEarningsRelease } from "./documentGuard.js";

function CollapsiblePrompt({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const snippet = text.length > 120 ? text.slice(0, 120) + "..." : text;
  
  return (
    <div className="bg-[#0b0e15]/90 border border-slate-800/80 rounded-xl p-3.5 mt-1.5 transition-all shadow-sm">
      <div className="flex items-center justify-between gap-3 min-w-0">
        <span className="text-slate-400 font-mono text-[10px] sm:text-xs truncate flex-1 leading-normal">
          {isOpen ? "Full System Directive Instructions (Token Optimized)" : snippet}
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-lg border border-[#10B981]/35 hover:bg-[#10B981]/25 transition-all font-mono shrink-0 cursor-pointer text-right"
        >
          {isOpen ? "Collapse Directive ▴" : "Expand Directive ▾"}
        </button>
      </div>
      {isOpen && (
        <div className="mt-2.5 text-slate-300 font-sans text-xs md:text-sm leading-relaxed whitespace-pre-wrap border-t border-slate-800/70 pt-2.5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {text}
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Session State
  const [session, setSession] = useState<SessionState | null>(null);
  const [auditChecklist, setAuditChecklist] = useState<AuditCheck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const userManuallyEditedTickerRef = useRef(false);

  // Standalone HTML Dossier Export State
  const [htmlExporting, setHtmlExporting] = useState<boolean>(false);

  // Auto-Resume Cooldown Countdown (seconds)
  const [retryCountdown, setRetryCountdown] = useState<number>(0);

  // Mobile View Toggling: Config & Files vs Terminal Console
  const [activeMobileTab, setActiveMobileTab] = useState<'config' | 'console'>('config');

  // Custom key override input and fetch interceptor
  const [customKeyInput, setCustomKeyInput] = useState<string>(() => {
    return localStorage.getItem("invest_terminal_gemini_key") || "";
  });
  
  // API Keys Dropdown state
  const [apiKeysDropdownOpen, setApiKeysDropdownOpen] = useState<boolean>(false);

  const handleKeyInputChange = (val: string) => {
    setCustomKeyInput(val);
    if (val.trim()) {
      localStorage.setItem("invest_terminal_gemini_key", val.trim());
    } else {
      localStorage.removeItem("invest_terminal_gemini_key");
    }
  };

  const authFetch = useCallback((url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {};
    if (options.headers) {
      Object.entries(options.headers).forEach(([k, v]) => {
        headers[k.toLowerCase()] = String(v);
      });
    }
    // Inject key from localStorage override or form state inside the custom header
    headers["x-gemini-key"] = customKeyInput ? customKeyInput.trim() : "";
    
    return fetch(url, {
      ...options,
      headers
    });
  }, [customKeyInput]);

  // Collapsible Steps State for Performance Optimization
  const [expandedStepIndices, setExpandedStepIndices] = useState<Record<number, boolean>>({});
  const [expandAllSteps, setExpandAllSteps] = useState<boolean>(false);

  const toggleStepExpanded = (idx: number) => {
    setExpandedStepIndices(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Competitor Radar State
  const [competitorRadarOpen, setCompetitorRadarOpen] = useState<boolean>(false);
  const [competitorDossier, setCompetitorDossier] = useState<CompetitorRadarDossier | null>(null);
  const [isRefreshingRadar, setIsRefreshingRadar] = useState<boolean>(false);

  // Automatically sync competitor dossier when session state updates with a newly generated radar
  useEffect(() => {
    if (session?.competitorRadar && (!competitorDossier || competitorDossier.targetTicker !== session.competitorRadar.targetTicker)) {
      setCompetitorDossier(session.competitorRadar);
    }
  }, [session?.competitorRadar]);

  const fetchCompetitorRadar = async () => {
    try {
      const activeTicker = (ticker || session?.config?.ticker || "").toUpperCase().trim();
      const res = await authFetch("/api/competitors");
      if (res.ok) {
        const data = await res.json();
        if (data.dossier && (!activeTicker || data.dossier.targetTicker === activeTicker)) {
          setCompetitorDossier(data.dossier);
        } else {
          setCompetitorDossier(null);
        }
      }
    } catch (e) {
      console.warn("Could not fetch competitor radar:", e);
    }
  };

  const handleRefreshCompetitorRadar = async (customPeers?: string[]) => {
    const activeTicker = (ticker || session?.config?.ticker || "").toUpperCase().trim();
    if (!activeTicker) return;
    setIsRefreshingRadar(true);
    try {
      const res = await authFetch("/api/competitors/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: activeTicker,
          customPeers,
          fmpApiKey
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dossier) {
          setCompetitorDossier(data.dossier);
        }
        if (data.state) {
          setSession(data.state);
          if (data.state.files) {
            setAuditChecklist(runAuditLocally(data.state.files).checklist);
          }
        }
      }
    } catch (err) {
      console.error("Failed refreshing competitor radar:", err);
    } finally {
      setIsRefreshingRadar(false);
    }
  };

  const getDossierTitle = () => {
    if (!session) return "Institutional Valuation Dossier";
    const tickerStr = session.config?.ticker || "UNSPECIFIED";
    const periodStr = session.config?.period || "UNSPECIFIED";
    const isInterim = isInterimEarningsRelease(session.files);
    return `${tickerStr} — ${periodStr}${isInterim ? ' (Earnings Release)' : ''} Institutional Valuation Dossier`;
  };

  const generateExportMarkdown = () => {
    if (!session) return "";
    const isInterim = isInterimEarningsRelease(session.files);
    const modelName = session.config?.model.replace("models/", "") || "generic";
    const tickerStr = session.config?.ticker || "UNSPECIFIED";
    const periodStr = session.config?.period || "UNSPECIFIED";
    
    let md = "";
    if (isInterim) {
      md += `---\nfiling_status: "Interim Earnings Release (Pending SEC Form 10-Q)"\nrefresh_required: true\n---\n\n`;
    }
    md += `# Valuation Analysis: ${tickerStr} ${periodStr}${isInterim ? ' (Earnings Release)' : ''}\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**AI Model:** ${modelName}\n\n`;

    md += `\n**Ticker:** ${tickerStr}  |  **Period:** ${periodStr}  |  **Market price:** $${session.config?.price || "N/A"}\n`;
    md += `---\n\n`;

    let competitorRadarInjected = false;
    const radarDossier = competitorDossier || session.competitorRadar;

    session.history.forEach((msg, idx) => {
      if (msg.role === 'user') {
        if (msg.type === 'crosscheck') {
          md += `## [Step ${MASTER_PROMPTS.length + 1}: Forensic Audit & Fact-Check Crosscheck]\n\n`;
        } else if (msg.type === 'master_prompt') {
          const stepNum = (msg.index !== undefined ? msg.index + 1 : idx);
          md += `## [Step ${stepNum} Output]\n\n`;
        } else if (msg.type === 'custom_injection') {
          md += `**User Interrogation:** ${msg.text}\n\n`;
        } else {
          md += `### User\n${msg.text}\n\n`;
        }
      } else if (msg.role === 'model') {
        const prevMsg = idx > 0 ? session.history[idx - 1] : null;
        const isStep2 = prevMsg && prevMsg.role === 'user' && prevMsg.type === 'master_prompt' && prevMsg.index === 1;

        if (isStep2 && radarDossier && !competitorRadarInjected) {
          // Embed Competitor Moat & Valuation Radar directly into Section 5.1 (Competitors), strictly BEFORE Section 5.2 (TAM)
          const sec52Regex = /(?:^|\n)(?:[#*]{0,4}\s*5\.2[\.\s]|5\.2\.\s*Total\s*Addressable)/i;
          const sec5aRegex = /(?:^|\n)(?:[#*]{0,4}\s*5A[\.\s]|5A\.\s*Market\s*&?\s*Sentiment)/i;
          const sec52Idx = msg.text.search(sec52Regex);
          const sec5aIdx = msg.text.search(sec5aRegex);
          const targetSplitIdx = sec52Idx !== -1 ? sec52Idx : sec5aIdx;

          if (targetSplitIdx !== -1) {
            const beforeSplit = msg.text.substring(0, targetSplitIdx).trimEnd();
            const afterSplit = msg.text.substring(targetSplitIdx).trimStart();
            md += `${beforeSplit}\n\n---\n\n${radarDossier.markdownSummary.trim()}\n\n---\n\n${afterSplit}\n\n`;
            competitorRadarInjected = true;
          } else {
            md += `${msg.text}\n\n---\n\n${radarDossier.markdownSummary.trim()}\n\n---\n\n`;
            competitorRadarInjected = true;
          }
        } else {
          md += `${msg.text}\n\n`;
        }
      }
    });

    // Fallback: If radar exists but Step 2 was not yet reached or matched, append it
    if (radarDossier && !competitorRadarInjected) {
      md += `---\n\n${radarDossier.markdownSummary.trim()}\n\n---\n\n`;
      competitorRadarInjected = true;
    }

    return cleanMarkdownForRendering(md);
  };

  const handleExportHtml = async () => {
    try {
      setHtmlExporting(true);
      const isInterim = isInterimEarningsRelease(session?.files);
      const releaseTag = isInterim ? "_Earnings_Release" : "";
      const cleanTicker = (ticker || session?.config?.ticker || 'Dossier').toUpperCase();
      const cleanPeriod = (period || session?.config?.period || 'Report').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const modelName = (session?.config?.model || '').replace('models/', '') || 'generic';
      const formattedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
      const fallbackFilename = `${cleanTicker} ${cleanPeriod}${releaseTag}_Valuation_Dossier_${modelName}_${formattedDate}.html`;

      // 1. First attempt to fetch the authoritative server-compiled HTML dossier
      try {
        const queryParams = new URLSearchParams({
          ticker: cleanTicker,
          period: cleanPeriod,
          model: session?.config?.model || ''
        });
        const resp = await fetch(`/api/session/export-html?${queryParams.toString()}`);
        if (resp.ok) {
          const contentDisposition = resp.headers.get("Content-Disposition");
          let filename = fallbackFilename;
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^";]+)"?/i);
            if (match) filename = match[1];
          }
          const htmlBlob = await resp.blob();
          const blobUrl = URL.createObjectURL(htmlBlob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          return;
        }
      } catch (netErr) {
        console.warn("[Export HTML] Server export fetch failed, falling back to client-side compiler:", netErr);
      }

      // 2. Client-side fallback compiler
      const docTitle = getDossierTitle();
      const markdownContent = generateExportMarkdown();
      downloadStandaloneHtml(markdownContent, docTitle, fallbackFilename);
    } catch (err: any) {
      console.error("HTML Export failed:", err);
      alert("Failed to export HTML dossier: " + (err?.message || err));
    } finally {
      setTimeout(() => setHtmlExporting(false), 600);
    }
  };

  // Form Inputs
  const [ticker, setTicker] = useState<string>("");
  const [period, setPeriod] = useState<string>("----");
  const [price, setPrice] = useState<string>("----");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [customModelId, setCustomModelId] = useState<string>("");






  const [serviceTier, setServiceTier] = useState<'standard' | 'flex'>('flex');
  const [sessionMode, setSessionMode] = useState<SessionMode>('full');
  const [priorDossierPath, setPriorDossierPath] = useState<string | null>(null);
  const [priorDossierSearching, setPriorDossierSearching] = useState<boolean>(false);
  const [escalating, setEscalating] = useState<boolean>(false);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(ExecutionMode.FullAuto);
  const [holdsPosition, setHoldsPosition] = useState<boolean>(false);
  const [currentWeight, setCurrentWeight] = useState<string>("----");
  const [entryPrice, setEntryPrice] = useState<string>("----");
  const [notes, setNotes] = useState<string>("");
  const [lastEarningsDate, setLastEarningsDate] = useState<string | null>(null);
  const [nextEarningsDate, setNextEarningsDate] = useState<string | null>(null);
  const [daysToNextEarnings, setDaysToNextEarnings] = useState<number | null>(null);
  const [enableCrosscheck, setEnableCrosscheck] = useState<boolean>(true);
  const [crosscheckModel, setCrosscheckModel] = useState<string>("default");
  const [customCrosscheckModelId, setCustomCrosscheckModelId] = useState<string>("");
  const [crosscheckLoading, setCrosscheckLoading] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<FileLog | null>(null);
  const [currencyAuditPending, setCurrencyAuditPending] = useState<{
    audit: CurrencyAuditResult;
    pendingFile: { name: string; data: string; mimeType: string };
  } | null>(null);
  const [currencyProcessing, setCurrencyProcessing] = useState<boolean>(false);
  const [integrityReport, setIntegrityReport] = useState<DocumentIntegrityReport | null>(null);
  const [integrityModalOpen, setIntegrityModalOpen] = useState<boolean>(false);
  const [dismissedMismatchesKey, setDismissedMismatchesKey] = useState<string>("");

  // Automatically pop up the Document Integrity Safeguard Modal whenever new mismatches are detected
  useEffect(() => {
    if (!integrityReport || !integrityReport.hasMismatches) return;
    if (session?.status === 'running') return;

    const currentKey = `${integrityReport.targetTicker}_${integrityReport.targetPeriod}_${integrityReport.mismatches.map(m => m.fileName + m.actual).sort().join("|")}`;
    if (currentKey !== dismissedMismatchesKey) {
      setIntegrityModalOpen(true);
    }
  }, [integrityReport, dismissedMismatchesKey, session?.status]);

  // Missing Documents Safeguard State
  const [missingModalOpen, setMissingModalOpen] = useState<boolean>(false);
  const [dismissedMissingKey, setDismissedMissingKey] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Scope Options Modal State
  const [downloadOptionsModalOpen, setDownloadOptionsModalOpen] = useState<boolean>(false);
  // File Substance Safeguard State (Pre-Flight Tripwire)
  const [substanceModalOpen, setSubstanceModalOpen] = useState<boolean>(false);
  const [substanceIssues, setSubstanceIssues] = useState<FileSubstanceIssue[]>([]);

  // Transcript Availability Alert Modal State
  const [transcriptAlertOpen, setTranscriptAlertOpen] = useState<boolean>(false);
  const [transcriptAlertMessage, setTranscriptAlertMessage] = useState<string>("");

  // --- Gemini Flex Tier Canary Probe & Gatekeeper State ---
  const [flexProbe, setFlexProbe] = useState<FlexProbeResult | null>(null);
  const [probingFlex, setProbingFlex] = useState<boolean>(false);
  const [flexWatcher, setFlexWatcher] = useState<FlexWatcherState | null>(null);
  const [flexEngaging, setFlexEngaging] = useState<boolean>(false);
  const [runStarting, setRunStarting] = useState<boolean>(false);
  const prevWatcherWaitingRef = useRef<boolean>(false);

  // --- Notification Center State (Desktop, Telegram, ntfy, Email) ---
  const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
    enabled: true,
    channels: { desktop: true, telegram: true, ntfy: false, email: true },
    telegram: { 
      botToken: "", 
      chatId: "", 
      sendDossierDoc: true,
      docFormat: "both"
    },
    ntfy: { topic: "" },
    email: { 
      provider: "resend", 
      to: "",
      resendApiKey: ""
    },
    events: { singleCompany: true, batchComplete: true, batchCompany: false, blockedAlert: true }
  };

  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>(() => {
    try {
      const saved = localStorage.getItem("terminal_notification_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_NOTIFICATION_CONFIG,
          ...parsed,
          enabled: parsed.enabled ?? true,
          channels: {
            ...DEFAULT_NOTIFICATION_CONFIG.channels,
            ...(parsed.channels || {}),
            telegram: true,
            email: parsed.channels?.email ?? true
          },
          telegram: {
            ...DEFAULT_NOTIFICATION_CONFIG.telegram,
            ...(parsed.telegram || {}),
            botToken: parsed.telegram?.botToken || DEFAULT_NOTIFICATION_CONFIG.telegram.botToken,
            chatId: parsed.telegram?.chatId || DEFAULT_NOTIFICATION_CONFIG.telegram.chatId
          },
          email: {
            ...DEFAULT_NOTIFICATION_CONFIG.email,
            ...(parsed.email || {}),
            to: parsed.email?.to || DEFAULT_NOTIFICATION_CONFIG.email.to,
            resendApiKey: parsed.email?.resendApiKey || DEFAULT_NOTIFICATION_CONFIG.email.resendApiKey
          }
        };
      }
    } catch (e) {}
    return DEFAULT_NOTIFICATION_CONFIG;
  });

  const [notificationModalOpen, setNotificationModalOpen] = useState<boolean>(false);
  const [idleWarningOpen, setIdleWarningOpen] = useState<boolean>(false);
  const [idleRemainingSeconds, setIdleRemainingSeconds] = useState<number>(0);
  const [extendingCache, setExtendingCache] = useState<boolean>(false);

  const executeAppReset = async () => {
    try {
      setCompetitorDossier(null);
      localStorage.removeItem("invest_terminal_active_ticker");
      localStorage.removeItem("invest_terminal_active_period");
      localStorage.removeItem("invest_terminal_active_price");
      localStorage.removeItem("invest_terminal_active_model");
      setTicker("");
      setPeriod("----");
      setPrice("----");
      setSelectedModel("");
      setLastEarningsDate(null);
      setNextEarningsDate(null);
      setDaysToNextEarnings(null);
      await authFetch("/api/session/hard-reset", { method: "POST" });
      window.location.reload();
    } catch (err: any) {
      console.warn("Failed to reset session cleanly:", err);
      window.location.reload();
    }
  };

  const handleExtendCache = async () => {
    if (extendingCache) return;
    setExtendingCache(true);
    try {
      const res = await authFetch("/api/session/cache/extend", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIdleWarningOpen(false);
        if (data.cacheKeepAlive && session) {
          setSession({
            ...session,
            cacheKeepAlive: data.cacheKeepAlive
          });
        }
      }
    } catch (e) {
      console.warn("Failed to extend cache keep-alive:", e);
    } finally {
      setExtendingCache(false);
    }
  };

  const handleDismissAndReset = () => {
    setIdleWarningOpen(false);
    executeAppReset();
  };

  const handleSaveNotificationConfig = async (newConfig: NotificationConfig) => {
    setNotificationConfig(newConfig);
    try {
      localStorage.setItem("terminal_notification_config", JSON.stringify(newConfig));
      await authFetch("/api/notifications/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: newConfig })
      });
    } catch (err) {
      console.warn("[Notification Save Error]:", err);
    }
  };

  // Sync saved notification config from server on mount
  useEffect(() => {
    authFetch("/api/notifications/config")
      .then(r => r.json())
      .then(data => {
        if (data.config && typeof data.config === "object") {
          setNotificationConfig(prev => {
            const merged = { ...prev, ...data.config };
            try {
              localStorage.setItem("terminal_notification_config", JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Client-side Desktop Alert trigger on single-company completion
  const prevSessionStatusRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      prevSessionStatusRef.current === "running" && 
      session?.status === "completed" && 
      notificationConfig.enabled && 
      notificationConfig.channels.desktop && 
      notificationConfig.events.singleCompany
    ) {
      triggerDesktopAlert(
        `🚀 Valuation Complete: ${session.config?.ticker || "Target"}`,
        `Analysis for ${session.config?.ticker} (${session.config?.period}) finalized all steps.`
      );
    }
    prevSessionStatusRef.current = session?.status || null;
  }, [session?.status, session?.config, notificationConfig]);

  // Automatically pop up the Missing Documents Warning when session is configured/initialized and required files are missing
  useEffect(() => {
    if (!session || !session.config || !session.config.ticker) return;
    if (session.status === 'running') return;
    const missing = auditChecklist.filter(c => c.status === "MISSING");
    if (missing.length === 0) return;

    // If integrity mismatch is active, prioritize showing integrity mismatch modal first
    if (integrityReport && integrityReport.hasMismatches) return;

    const currentKey = `${session.config.ticker}_${session.config.period}_${missing.map(m => m.category).sort().join("|")}`;
    if (currentKey !== dismissedMissingKey) {
      setMissingModalOpen(true);
    }
  }, [session, auditChecklist, dismissedMissingKey, integrityReport, session?.status]);

  // --- BATCH QUEUE STATE & HANDLERS ---
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [batchState, setBatchState] = useState<BatchQueueState | null>(null);

  // Client-side Desktop Alert trigger on batch queue completion
  const prevBatchStatusRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      prevBatchStatusRef.current === "running" && 
      batchState?.status === "completed" && 
      notificationConfig.enabled && 
      notificationConfig.channels.desktop && 
      notificationConfig.events.batchComplete
    ) {
      triggerDesktopAlert(
        `🏁 Autonomous Batch Complete`,
        `${batchState.completedCount}/${batchState.totalCount} companies finished execution.`
      );
    }
    prevBatchStatusRef.current = batchState?.status || null;
  }, [batchState?.status, batchState?.completedCount, batchState?.totalCount, notificationConfig]);

  const fetchBatchState = async () => {
    try {
      const res = await authFetch("/api/batch/state");
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) {
          setBatchState(prev => {
            if (JSON.stringify(prev) === JSON.stringify(data.batchState)) {
              return prev;
            }
            return data.batchState;
          });
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchBatchState();
    // Only poll periodically if batch queue is actively running or batch modal is open
    if (batchState?.status === "running" || batchModalOpen) {
      const interval = setInterval(() => {
        fetchBatchState();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [batchState?.status, batchModalOpen]);

  // --- Gemini Flex Tier Canary Probe & Gatekeeper Handlers ---
  const fetchFlexStatus = useCallback(async (force: boolean = false) => {
    try {
      setProbingFlex(true);
      const targetModel = session?.config?.model || (selectedModel === "custom" ? customModelId.trim() : selectedModel) || "models/gemini-4-argon";
      const res = await authFetch(`/api/flex/status?model=${encodeURIComponent(targetModel)}${force ? '&force=true' : ''}`);
      const data = await res.json();
      if (data.success && data.probe) {
        setFlexProbe(data.probe);
      }
    } catch (err) {
      console.warn("[Flex Probe] Failed to fetch flex status:", err);
    } finally {
      setProbingFlex(false);
    }
  }, [authFetch, session?.config?.model, selectedModel, customModelId]);

  const fetchFlexWatcherStatus = useCallback(async () => {
    try {
      const res = await authFetch("/api/flex/waiter-status");
      const data = await res.json();
      if (data.success && data.watcher) {
        setFlexWatcher(data.watcher);
        // If watcher was waiting and transitioned to not waiting, capacity cleared and auto-launch engaged!
        if (prevWatcherWaitingRef.current && !data.watcher.isWaiting) {
          await fetchSession(true);
        }
        prevWatcherWaitingRef.current = !!data.watcher.isWaiting;
      }
    } catch (err) {
      console.warn("[Flex Watcher] Failed to fetch watcher status:", err);
    }
  }, [authFetch]);

  // Periodic poll of Flex cluster probe (every 60s when serviceTier is flex)
  useEffect(() => {
    if (serviceTier === 'flex' || session?.config?.serviceTier === 'flex') {
      fetchFlexStatus(false);
      const interval = setInterval(() => {
        fetchFlexStatus(false);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [serviceTier, session?.config?.serviceTier, fetchFlexStatus]);

  // Periodic poll of Flex Gatekeeper watcher status (every 1.5s when waiting, otherwise every 10s)
  useEffect(() => {
    fetchFlexWatcherStatus();
    const interval = setInterval(() => {
      fetchFlexWatcherStatus();
    }, flexWatcher?.isWaiting ? 1500 : 10000);
    return () => clearInterval(interval);
  }, [fetchFlexWatcherStatus, flexWatcher?.isWaiting]);


  const handleBatchStart = async () => {
    const effectiveModel = selectedModel === "custom" ? customModelId.trim() : selectedModel;
    if (!effectiveModel) {
      alert("Please select a model from the Model dropdown before starting batch execution.");
      return;
    }
    try {
      const res = await authFetch("/api/batch/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: effectiveModel })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to start batch.");
      } else {
        if (data.batchState) setBatchState(data.batchState);
      }
    } catch (e: any) {
      alert("Failed to start batch: " + (e.message || e));
    }
  };

  const handleBatchStop = async () => {
    try {
      const res = await authFetch("/api/batch/stop", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) setBatchState(data.batchState);
      }
    } catch {}
  };

  const handleBatchRemoveItem = async (id: string, purgeStaging: boolean = false) => {
    try {
      const res = await authFetch("/api/batch/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, purgeStaging })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) setBatchState(data.batchState);
      }
    } catch {}
  };

  const handleBatchClear = async (purgeStaging: boolean = false) => {
    try {
      const res = await authFetch("/api/batch/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purgeStaging })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) setBatchState(data.batchState);
      }
    } catch {}
  };

  const handleBatchPurgeStaging = async (ticker?: string) => {
    try {
      const res = await authFetch("/api/batch/purge-staging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) setBatchState(data.batchState);
        return data;
      }
    } catch {}
  };

  const handleBatchSetStagingLocation = async (location: 'gdrive' | 'local') => {
    try {
      const res = await authFetch("/api/batch/set-staging-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) setBatchState(data.batchState);
      }
    } catch {}
  };

  const handleBatchToggleOverride = async (idOrTicker: string, overridden?: boolean) => {
    try {
      const res = await authFetch("/api/batch/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idOrTicker, overridden })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) setBatchState(data.batchState);
      }
    } catch (e: any) {
      alert("Failed to toggle override: " + (e.message || e));
    }
  };

  const handleBatchDeleteFile = async (fileName: string, ticker?: string) => {
    try {
      const res = await authFetch("/api/batch/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, ticker })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) setBatchState(data.batchState);
      }
    } catch (e: any) {
      alert("Failed deleting file: " + (e.message || e));
    }
  };

  // --- INGEST PIPELINE STATE ---
  const [fmpApiKey, setFmpApiKey] = useState<string>(() => localStorage.getItem("invest_terminal_fmp_key") || "");
  const [fmpKeyVisible, setFmpKeyVisible] = useState<boolean>(false);
  const [geminiKeyVisible, setGeminiKeyVisible] = useState<boolean>(false);
  const [stockAnalysisCookie, setStockAnalysisCookie] = useState<string>(() => localStorage.getItem("invest_terminal_stock_analysis_cookie") || "");
  const [cookieVisible, setCookieVisible] = useState<boolean>(false);
  const [transcriptProvider, setTranscriptProvider] = useState<"auto" | "tikr" | "stockanalysis">(() => {
    return (localStorage.getItem("invest_terminal_transcript_provider") as any) || "auto";
  });
  const [secName, setSecName] = useState<string>(() => localStorage.getItem("invest_terminal_sec_name") || "Ronald Forti");
  const [secEmail, setSecEmail] = useState<string>(() => localStorage.getItem("invest_terminal_sec_email") || "ronforti@gmail.com");

  const handleBatchAddItem = async (ticker: string, period?: string, price?: string, autoPullDocs?: boolean, portfolio?: PortfolioContext) => {
    try {
      const res = await authFetch("/api/batch/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, period, price, autoPullDocs, portfolio, fmpApiKey, stockAnalysisCookie })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) setBatchState(data.batchState);
      }
    } catch (e: any) {
      alert("Failed to add item: " + (e.message || e));
    }
  };

  const handleBatchUpdatePortfolio = async (idOrTicker: string, portfolio: PortfolioContext) => {
    try {
      const res = await authFetch("/api/batch/update-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idOrTicker, portfolio })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) setBatchState(data.batchState);
      }
    } catch (e: any) {
      console.warn("Failed to update position:", e);
    }
  };

  const handleBatchBulkAdd = async (params: { tickers?: string[]; rawText?: string; filePath?: string; autoPullDocs?: boolean }) => {
    try {
      const res = await authFetch("/api/batch/bulk-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, fmpApiKey, stockAnalysisCookie })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bulk import failed.");
      }
      if (data.batchState) setBatchState(data.batchState);
      return { success: true, addedCount: data.addedCount, skipped: data.skipped, items: data.batchState?.items || [] };
    } catch (e: any) {
      alert("Bulk Add Error: " + (e.message || e));
      return { success: false, error: e.message || String(e) };
    }
  };

  const handleBatchPullDocs = async (ticker: string, period?: string) => {
    try {
      const res = await authFetch("/api/batch/pull-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, period, fmpApiKey, stockAnalysisCookie })
      });
      const data = await res.json();
      if (data.batchState) setBatchState(data.batchState);
      return data;
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  };

  const handleBatchPullAllDocs = async () => {
    try {
      const res = await authFetch("/api/batch/pull-all-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fmpApiKey, stockAnalysisCookie })
      });
      const data = await res.json();
      if (data.batchState) setBatchState(data.batchState);
      return data;
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  };

  const handleBatchSetRetention = async (retain: boolean) => {
    try {
      const res = await authFetch("/api/batch/set-retention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retain })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.batchState) setBatchState(data.batchState);
      }
    } catch {}
  };

  const handleBatchReAudit = async (ticker?: string) => {
    try {
      const res = await authFetch("/api/batch/re-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker })
      });
      const data = await res.json();
      if (data.batchState) setBatchState(data.batchState);
      return data;
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  };

  const handleBatchSyncPeriods = async () => {
    try {
      const res = await authFetch("/api/batch/sync-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fmpApiKey })
      });
      const data = await res.json();
      if (data.batchState) setBatchState(data.batchState);
      return data;
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  };

  // Filing selections checkboxes
  const [ingest10K, setIngest10K] = useState<boolean>(true);
  const [ingest10Q, setIngest10Q] = useState<boolean>(true);
  const [ingest8K, setIngest8K] = useState<boolean>(false);
  const [ingestProxy, setIngestProxy] = useState<boolean>(true);

  // Ingestion loading variables
  const [fmpIngesting, setFmpIngesting] = useState<boolean>(false);
  const [secIngesting, setSecIngesting] = useState<boolean>(false);
  const [transcriptIngesting, setTranscriptIngesting] = useState<boolean>(false);
  const [fmpSyncing, setFmpSyncing] = useState<boolean>(false);
  const [pullAllLoading, setPullAllLoading] = useState<boolean>(false);
  const [pullAllProgress, setPullAllProgress] = useState<string>("");

  // Success/error messages from auto ingest
  const [ingestFeedback, setIngestFeedback] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const handleFmpApiKeyChange = (val: string) => {
    setFmpApiKey(val);
    localStorage.setItem("invest_terminal_fmp_key", val);
  };

  const handleStockAnalysisCookieChange = (val: string) => {
    setStockAnalysisCookie(val);
    localStorage.setItem("invest_terminal_stock_analysis_cookie", val);
  };

  const handleTranscriptProviderChange = (val: "auto" | "tikr" | "stockanalysis") => {
    setTranscriptProvider(val);
    localStorage.setItem("invest_terminal_transcript_provider", val);
  };

  const handleSecNameChange = (val: string) => {
    setSecName(val);
    localStorage.setItem("invest_terminal_sec_name", val);
  };

  const handleSecEmailChange = (val: string) => {
    setSecEmail(val);
    localStorage.setItem("invest_terminal_sec_email", val);
  };

  // Auto-sync price and period from FMP when ticker or FMP key changes
  useEffect(() => {
    if (!ticker || ticker.trim().length < 2) return;

    // Reset competitor radar if user switches to a different ticker
    const cleanSym = ticker.toUpperCase().trim();
    if (competitorDossier && competitorDossier.targetTicker !== cleanSym) {
      setCompetitorDossier(null);
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setFmpSyncing(true);
        const res = await authFetch("/api/ingest/fmp-ticker-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: ticker.toUpperCase(), fmpApiKey })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.price) setPrice(data.price);
            if (data.period) setPeriod(data.period);
            setLastEarningsDate(data.lastEarningsDate || null);
            setNextEarningsDate(data.nextEarningsDate || null);
            setDaysToNextEarnings(typeof data.daysToNextEarnings === 'number' ? data.daysToNextEarnings : null);
          }
        }
      } catch (err) {
        console.warn("FMP Auto-sync failed:", err);
      } finally {
        setFmpSyncing(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [ticker, fmpApiKey, competitorDossier]);

  const handleFetchFmpData = async () => {
    if (!ticker || ticker.trim().length < 2) {
      setIngestFeedback({ type: 'error', text: 'Specify a ticker token before syncing FMP data.' });
      return;
    }
    setFmpSyncing(true);
    setIngestFeedback({ type: 'warning', text: `Syncing core market data from Financial Modeling Prep for ${ticker.toUpperCase()}...` });
    try {
      const res = await authFetch("/api/ingest/fmp-ticker-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.toUpperCase(), fmpApiKey })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.price) setPrice(data.price);
          if (data.period) setPeriod(data.period);
          setLastEarningsDate(data.lastEarningsDate || null);
          setNextEarningsDate(data.nextEarningsDate || null);
          setDaysToNextEarnings(typeof data.daysToNextEarnings === 'number' ? data.daysToNextEarnings : null);

          const nextNote = data.nextEarningsDate 
            ? ` | Next Earnings: ${data.nextEarningsDate}${typeof data.daysToNextEarnings === 'number' ? ` (${data.daysToNextEarnings === 0 ? "Today" : data.daysToNextEarnings === 1 ? "Tomorrow" : `in ${data.daysToNextEarnings}d`})` : ''}`
            : '';
          setIngestFeedback({
            type: 'success',
            text: `Successfully synced FMP metadata for ${ticker.toUpperCase()}! Price: $${data.price || "----"} | Target Quarter: ${data.period || "----"}${nextNote}`
          });
        } else {
          setIngestFeedback({ type: 'error', text: data.message || "Failed syncing FMP data. Check ticker or FMP key." });
        }
      } else {
        setIngestFeedback({ type: 'error', text: "Failed syncing FMP data. Server returned status error." });
      }
    } catch (err: any) {
      console.warn("FMP Fetch failed:", err);
      setIngestFeedback({ type: 'error', text: err.message || "FMP Fetch failed." });
    } finally {
      setFmpSyncing(false);
    }
  };

  const runAuditLocally = (files: any[]) => {
    const activeTicker = ticker || session?.config?.ticker || "";
    const activePeriod = period || session?.config?.period || "";
    const activeMode = sessionMode || session?.config?.sessionMode || 'full';
    const effectivePriorPath = priorDossierPath || session?.config?.priorDossierPath;

    const res = runAudit(files, {
      ticker: activeTicker,
      period: activePeriod,
      sessionMode: activeMode,
      competitorRadarMemory: {
        hasRadar: Boolean(
          (competitorDossier?.peers?.length && (!activeTicker || (competitorDossier.targetTicker || '').toUpperCase() === activeTicker.toUpperCase())) ||
          (session?.competitorRadar?.peers?.length && (!activeTicker || (session.competitorRadar.targetTicker || '').toUpperCase() === activeTicker.toUpperCase()))
        ),
        peerCount: competitorDossier?.peers?.length || session?.competitorRadar?.peers?.length || 0
      },
      priorDossierMemory: {
        hasPrior: Boolean(effectivePriorPath),
        name: effectivePriorPath ? effectivePriorPath.split(/[/\\]/).pop() : undefined
      }
    });

    if (res.integrityReport) {
      setIntegrityReport(res.integrityReport);
    }
    return res;
  };

  // --- Handlers ---
  const handleRetrieveFmp = async () => {
    if (!ticker) {
      setIngestFeedback({ type: 'error', text: 'Specify a ticker in the Form input before launching auto-ingestion.' });
      return;
    }
    
    const isAlreadyPulled = auditChecklist.find(c => c.category === "Financials TTM")?.status === "CONFIRMED";
    if (isAlreadyPulled) {
      const confirmPull = window.confirm("Financials data is already present in the Document Repository. Are you sure you want to pull it again?");
      if (!confirmPull) return;
    }

    setFmpIngesting(true);
    setIngestFeedback(null);
    setDismissedMismatchesKey("");
    setDismissedMissingKey("");
    try {
      const res = await authFetch("/api/ingest/fmp-financials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.toUpperCase(), fmpApiKey, period })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "FMP financials compilation query failed.");
      
      setSession(data.state);
      if (data.state && data.state.files) {
        setAuditChecklist(runAuditLocally(data.state.files).checklist);
      }
      setIngestFeedback({ type: 'success', text: `Success: calculated and staged trailing twelve months csv financials grid: "${data.fileName}"` });
    } catch (err: any) {
      console.error(err);
      setIngestFeedback({ type: 'error', text: err.message || "Failed retrieving from FMP API. Ensure your key is valid." });
    } finally {
      setFmpIngesting(false);
    }
  };

  const handleRetrieveSec = async () => {
    if (!ticker) {
      setIngestFeedback({ type: 'error', text: 'Specify a ticker in the Form input before retrieving filings.' });
      return;
    }
    const parsedTargetPeriod = parsePeriodString(period);
    const isQ4 = parsedTargetPeriod.quarter === "Q4" || parsedTargetPeriod.quarter === "FY" || (period && (period.toUpperCase().includes("Q4") || period.toUpperCase().includes("FY")));
    const filingTypes = [];
    if (ingest10K) filingTypes.push("10-K");
    if (ingest10Q && !isQ4) filingTypes.push("10-Q");
    if (ingest8K) filingTypes.push("8-K");
    if (ingestProxy) filingTypes.push("DEF 14A");

    if (filingTypes.length === 0) {
      if (isQ4 && (ingest10K || ingest10Q)) {
        filingTypes.push("10-K");
      } else {
        setIngestFeedback({ type: 'error', text: 'Check at least one Filing Type checkbox for retrieval.' });
        return;
      }
    }

    const isAlreadyPulled = filingTypes.some(type => {
      const synonyms = type === "10-K" ? ["10k", "10-k", "20f", "20-f", "40f", "40-f", "annual"] : 
                       type === "10-Q" ? ["10q", "10-q", "6k", "6-k", "quarterly", "interim"] : 
                       type === "8-K" ? ["8k", "8-k", "current"] : 
                       ["def 14a", "proxy", "agm"];
      return session?.files?.some(f => synonyms.some(syn => f.name.toLowerCase().includes(syn)));
    });

    if (isAlreadyPulled) {
      const confirmPull = window.confirm("Some of the selected SEC filings are already present in the Document Repository. Are you sure you want to pull them again?");
      if (!confirmPull) return;
    }

    setSecIngesting(true);
    setIngestFeedback(null);
    setDismissedMismatchesKey("");
    setDismissedMissingKey("");
    try {
      const res = await authFetch("/api/ingest/sec-filings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          filingTypes,
          email: secEmail,
          name: secName,
          period
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "EDGAR filing retrieval sequence failed.");
      
      setSession(data.state);
      if (data.state && data.state.files) {
        setAuditChecklist(runAuditLocally(data.state.files).checklist);
      }
      setIngestFeedback({ type: 'success', text: data.message || `Filings successfully downloaded & converted.` });
    } catch (err: any) {
      console.error(err);
      setIngestFeedback({ type: 'error', text: err.message || "Failed downloading EDGAR filings. Check connection & credentials." });
    } finally {
      setSecIngesting(false);
    }
  };

  const handleRetrieveTranscript = async () => {
    if (!ticker) {
      setIngestFeedback({ type: 'error', text: 'Specify a ticker in the Form input before retrieving transcript.' });
      return;
    }
    const isAlreadyPulled = auditChecklist.find(c => c.category === "Transcript")?.status === "CONFIRMED";
    if (isAlreadyPulled) {
      const confirmPull = window.confirm("A transcript is already present in the Document Repository. Are you sure you want to pull it again?");
      if (!confirmPull) return;
    }

    setTranscriptIngesting(true);
    setIngestFeedback(null);
    setDismissedMismatchesKey("");
    setDismissedMissingKey("");
    try {
      const res = await authFetch("/api/ingest/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.toUpperCase(), fmpApiKey, period, stockAnalysisCookie, provider: transcriptProvider, canonicalCompanyName: session?.config?.companyName || "" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcript download pipeline failed.");
      
      if (data.notFound || data.notReady) {
        const alertMsg = data.message || `Stock Analysis has not published the verbatim transcript for ${ticker.toUpperCase()} (${period || "latest"}) yet.`;
        setTranscriptAlertMessage(alertMsg);
        setTranscriptAlertOpen(true);
        setIngestFeedback({
          type: 'warning',
          text: alertMsg
        });
        return;
      }
      
      setSession(data.state);
      if (data.state && data.state.files) {
        setAuditChecklist(runAuditLocally(data.state.files).checklist);
      }
      const sourceLabel = data.source ? `${data.source}` : "verbatim dialogue";
      setIngestFeedback({ 
        type: 'success', 
        text: `Success: Retrieved and cleaned earnings call transcript via ${sourceLabel}: "${data.fileName}"` 
      });
    } catch (err: any) {
      console.error(err);
      setIngestFeedback({ type: 'error', text: err.message || "Failed retrieving transcript." });
    } finally {
      setTranscriptIngesting(false);
    }
  };

  // Unified 1-Click Master Ingest: Pulls SEC filings, FMP Financials CSV, and Transcript
  // If onlyMissing is true, skips filings that are already confirmed in the audit checklist
  const handleRetrieveAllDocuments = async (onlyMissing: boolean = false) => {
    if (!ticker) {
      setIngestFeedback({ type: 'error', text: 'Specify a ticker in the Form input before launching document retrieval.' });
      return;
    }

    setDownloadOptionsModalOpen(false);
    setPullAllLoading(true);
    setIngestFeedback(null);
    setDismissedMismatchesKey("");
    setDismissedMissingKey("");

    const results: string[] = [];
    let hadError = false;

    const parsedTargetPeriod = parsePeriodString(period);
    const isQ4 = parsedTargetPeriod.quarter === "Q4" || parsedTargetPeriod.quarter === "FY" || (period && (period.toUpperCase().includes("Q4") || period.toUpperCase().includes("FY")));

    const is10KConfirmed = auditChecklist.find(c => c.category === "10-K")?.status === "CONFIRMED";
    const is10QConfirmed = auditChecklist.find(c => c.category === "10-Q")?.status === "CONFIRMED";
    const isProxyConfirmed = Boolean(session?.files?.some(f => f.auditCategory === "DEF 14A" || /def[\s_\-]?14a|proxy/i.test(f.name)));
    const isFinancialsConfirmed = auditChecklist.find(c => c.category === "Financials TTM")?.status === "CONFIRMED";
    const isTranscriptConfirmed = auditChecklist.find(c => c.category === "Transcript")?.status === "CONFIRMED";
    const hasRadarAlready = Boolean(session?.competitorRadar || session?.files?.some(f => f.name.includes("_Competitor_Radar.md")));

    const needSec = !onlyMissing || (!is10KConfirmed || (!is10QConfirmed && !isQ4) || (!isProxyConfirmed && ingestProxy));
    const needFinancials = !onlyMissing || !isFinancialsConfirmed;
    const needTranscript = !onlyMissing || !isTranscriptConfirmed;
    const needRadar = !onlyMissing || !hasRadarAlready;

    if (onlyMissing && !needSec && !needFinancials && !needTranscript && !needRadar) {
      setPullAllLoading(false);
      setIngestFeedback({ type: 'success', text: "All required research documents are already confirmed in the Document Repository." });
      return;
    }

    // Step 1: SEC Filings (10-K, 10-Q)
    if (needSec) {
      try {
        setPullAllProgress(isQ4 ? "Step 1/3: Downloading SEC Filings (Form 10-K for Q4 & FY)..." : "Step 1/3: Downloading SEC Filings (10-K & 10-Q)...");
        const filingTypes = [];
        if (onlyMissing) {
          if (!is10KConfirmed && ingest10K) filingTypes.push("10-K");
          if (!is10QConfirmed && !isQ4 && ingest10Q) filingTypes.push("10-Q");
          if (!isProxyConfirmed && ingestProxy) filingTypes.push("DEF 14A");
          if (filingTypes.length === 0) {
            if (!is10KConfirmed) filingTypes.push("10-K");
            else if (!is10QConfirmed && !isQ4) filingTypes.push("10-Q");
            if (!isProxyConfirmed && ingestProxy) filingTypes.push("DEF 14A");
          }
        } else {
          if (ingest10K) filingTypes.push("10-K");
          if (ingest10Q && !isQ4) filingTypes.push("10-Q");
          if (ingest8K) filingTypes.push("8-K");
          if (ingestProxy) filingTypes.push("DEF 14A");
          if (filingTypes.length === 0) {
            if (isQ4) {
              filingTypes.push("10-K");
            } else {
              filingTypes.push("10-K", "10-Q");
            }
          }
        }

        const secRes = await authFetch("/api/ingest/sec-filings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticker: ticker.toUpperCase(),
            filingTypes,
            email: secEmail,
            name: secName,
            period
          })
        });
        const secData = await secRes.json();
        if (secRes.ok) {
          setSession(secData.state);
          if (secData.state?.files) {
            setAuditChecklist(runAuditLocally(secData.state.files).checklist);
          }
          results.push("SEC Filings ✓");
        } else {
          hadError = true;
          results.push(`SEC Filings (${secData.error || "Failed"})`);
        }
      } catch (e: any) {
        hadError = true;
        results.push(`SEC Filings (${e.message})`);
      }
    } else {
      results.push("SEC Filings (Already Staged ✓)");
    }

    // Step 2: FMP Financials CSV (TTM)
    if (needFinancials) {
      try {
        setPullAllProgress("Step 2/3: Calculating FMP Financials (TTM CSV)...");
        const fmpRes = await authFetch("/api/ingest/fmp-financials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: ticker.toUpperCase(), fmpApiKey, period })
        });
        const fmpData = await fmpRes.json();
        if (fmpRes.ok) {
          setSession(fmpData.state);
          if (fmpData.state?.files) {
            setAuditChecklist(runAuditLocally(fmpData.state.files).checklist);
          }
          results.push("Financials TTM ✓");
        } else {
          hadError = true;
          results.push(`Financials (${fmpData.error || "Failed"})`);
        }
      } catch (e: any) {
        hadError = true;
        results.push(`Financials (${e.message})`);
      }
    } else {
      results.push("Financials TTM (Already Staged ✓)");
    }

    // Step 3: Stock Analysis Earnings Call Transcript
    if (needTranscript) {
      try {
        setPullAllProgress("Step 3/3: Downloading Earnings Call Transcript...");
        const trRes = await authFetch("/api/ingest/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: ticker.toUpperCase(), fmpApiKey, period, stockAnalysisCookie, provider: transcriptProvider, canonicalCompanyName: session?.config?.companyName || "" })
        });
        const trData = await trRes.json();
        if (trRes.ok) {
          if (trData.notFound || trData.notReady) {
            const alertMsg = trData.message || `Transcript not ready on Stock Analysis for ${period || "requested period"}.`;
            results.push(`Transcript (${alertMsg})`);
            setTranscriptAlertMessage(alertMsg);
            setTranscriptAlertOpen(true);
          } else {
            setSession(trData.state);
            if (trData.state?.files) {
              setAuditChecklist(runAuditLocally(trData.state.files).checklist);
            }
            const srcTag = trData.source || "Transcript";
            results.push(`Transcript (${srcTag}) ✓`);
          }
        } else {
          hadError = true;
          results.push(`Transcript (${trData.error || "Failed"})`);
        }
      } catch (e: any) {
        hadError = true;
        results.push(`Transcript (${e.message})`);
      }
    } else {
      results.push("Transcript (Already Staged ✓)");
    }

    // Step 4: Verified Competitor Radar Harvest (10-K + DEF 14A + Search Grounding + FMP)
    if (needRadar) {
      try {
        setPullAllProgress("Step 4/4: Harvesting Verified Competitor Radar (10-K + Proxy + Search Grounding + FMP)...");
        const compRes = await authFetch("/api/competitors/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: ticker.toUpperCase(), fmpApiKey })
        });
        const compData = await compRes.json();
        if (compRes.ok) {
          if (compData.dossier) setCompetitorDossier(compData.dossier);
          if (compData.state) {
            setSession(compData.state);
            if (compData.state.files) {
              setAuditChecklist(runAuditLocally(compData.state.files).checklist);
            }
          }
          results.push(`Competitor Radar (${compData.dossier?.peers?.length || 0} Peers) ✓`);
        } else {
          results.push("Competitor Radar (Deferred)");
        }
      } catch (e: any) {
        results.push(`Competitor Radar (${e.message})`);
      }
    } else {
      results.push("Competitor Radar (Already Staged ✓)");
    }

    setPullAllLoading(false);
    setPullAllProgress("");
    fetchSession();

    setIngestFeedback({
      type: hadError ? 'warning' : 'success',
      text: `1-Click Document Ingest: ${results.join(" | ")}`
    });
  };

  const handleRetrieveAllClick = () => {
    if (!ticker) {
      setIngestFeedback({ type: 'error', text: 'Specify a ticker in the Form input before launching document retrieval.' });
      return;
    }
    const hasAnyStaged = auditChecklist.some(c => c.status === "CONFIRMED");
    if (hasAnyStaged) {
      setDownloadOptionsModalOpen(true);
    } else {
      handleRetrieveAllDocuments(false);
    }
  };

  // Dynamic models retrieval state
  const [modelOptions, setModelOptions] = useState<Array<{ name: string; displayName: string }>>([
    { name: "models/gemini-3.8-flash", displayName: "Gemini 3.8 Flash (Default Flagship Fast & Smart)" },
    { name: "models/gemini-4-argon", displayName: "Gemini 4 Argon (Frontier Deep Reasoning)" },
    { name: "models/gemini-3.5-flash-lite", displayName: "Gemini 3.5 Flash-Lite (Fast & Cost-Efficient)" },
    { name: "models/gemini-3.1-pro-preview", displayName: "Gemini 3.1 Pro Preview (Heavy Reasoning)" }
  ]);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const res = await authFetch("/api/session/models");
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          setModelOptions(data.models);
        }
      }
    } catch (err) {
      console.warn("Could not retrieve dynamic models list, using initial listing.", err);
    } finally {
      setLoadingModels(false);
    }
  };

  // Interactive controls
  const [customQuery, setCustomQuery] = useState<string>("");
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [tempOverrides, setTempOverrides] = useState<{ [key: number]: number }>({});
  const [tempDropdownOpen, setTempDropdownOpen] = useState<number | null>(null);

  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  // Initial load and periodic polling since execution runs sequentially in the background
  const fetchSession = async (isInitialLoad: boolean = false) => {
    try {
      const res = await authFetch("/api/session");
      if (!res.ok) throw new Error("Failed to load terminal session.");
      const data = await res.json();
      setSession(data.state);
      setAuditChecklist(data.auditChecklist || []);
      if (data.integrityReport) setIntegrityReport(data.integrityReport);
      
      // Auto-populate form on initial load if config exists
      if (data.state.config && isInitialLoad) {
        setTicker(data.state.config.ticker);
        setPeriod(data.state.config.period);
        setPrice(data.state.config.price);
        setSelectedModel(data.state.config.model);
        setExecutionMode(data.state.config.executionMode);
        setHoldsPosition(data.state.config.portfolio?.holdsPosition || false);
        setCurrentWeight(data.state.config.portfolio?.currentWeight || "----");
        setEntryPrice(data.state.config.portfolio?.entryPrice || "----");
        setNotes(data.state.config.notes || "");
        setLastEarningsDate(data.state.config.lastEarningsDate || null);
        setNextEarningsDate(data.state.config.nextEarningsDate || null);
        setDaysToNextEarnings(typeof data.state.config.daysToNextEarnings === 'number' ? data.state.config.daysToNextEarnings : null);
        setEnableCrosscheck(data.state.config.enableCrosscheck !== false);
        setCrosscheckModel(data.state.config.crosscheckModel || "default");
        if (data.state.config.serviceTier) {
          setServiceTier(data.state.config.serviceTier);
        }
        if (data.state.config.sessionMode) {
          setSessionMode(data.state.config.sessionMode);
        }
        if (data.state.config.priorDossierPath) {
          setPriorDossierPath(data.state.config.priorDossierPath);
        }

        const currModel = data?.state?.config?.model;
        if (currModel && currModel !== "custom") {
          setModelOptions(prev => {
            const list = prev || [];
            if (list.some(x => x && x.name === currModel)) return list;
            const dispName = String(currModel).replace("models/", "");
            return [...list, { name: String(currModel), displayName: dispName }];
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Could not retrieve state from analytical core.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Purge any stale active keys from previous runs
    localStorage.removeItem("invest_terminal_active_ticker");
    localStorage.removeItem("invest_terminal_active_period");
    localStorage.removeItem("invest_terminal_active_price");
    localStorage.removeItem("invest_terminal_active_model");
    fetchSession(true);
    fetchModels();
  }, []);

  // Polling loop: 2s when running, retrying, or flex gatekeeper waiting/engaging; NO polling when idle
  useEffect(() => {
    const isBusy = session?.status === "running" || session?.status === "retrying" || flexWatcher?.isWaiting || flexEngaging;
    if (!isBusy) return;

    const interval = setInterval(() => {
      fetchSession();
    }, 2000);
    return () => clearInterval(interval);
  }, [session?.status, flexWatcher?.isWaiting, flexEngaging]);

  // Live countdown timer for auto-resume cooldown
  useEffect(() => {
    if (session?.status !== 'retrying' || !session.retryState?.nextRetryTimestamp) {
      setRetryCountdown(0);
      return;
    }

    const updateRemaining = () => {
      const ms = session.retryState?.nextRetryTimestamp ? session.retryState.nextRetryTimestamp - Date.now() : 0;
      setRetryCountdown(Math.max(0, Math.ceil(ms / 1000)));
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [session?.status, session?.retryState?.nextRetryTimestamp]);

  // 45-Minute Post-Analysis Context Cache Keep-Alive & Idle Auto-Reset Guard (Zero Polling between 0-40m)
  useEffect(() => {
    const keepAlive = session?.cacheKeepAlive;
    if (!keepAlive?.active || !keepAlive.warningAt || !keepAlive.expiresAt) {
      if (idleWarningOpen) setIdleWarningOpen(false);
      return;
    }

    let interval: NodeJS.Timeout | null = null;
    let warningTimeout: NodeJS.Timeout | null = null;

    const startCountdown = () => {
      setIdleWarningOpen(true);
      const updateClock = () => {
        const remainingSec = Math.max(0, Math.ceil((keepAlive.expiresAt - Date.now()) / 1000));
        setIdleRemainingSeconds(remainingSec);
        if (remainingSec <= 0) {
          if (interval) clearInterval(interval);
          setIdleWarningOpen(false);
          executeAppReset();
        }
      };

      updateClock();
      interval = setInterval(updateClock, 1000);
    };

    const now = Date.now();
    const msUntilWarning = keepAlive.warningAt - now;

    if (msUntilWarning <= 0) {
      // In warning window (minutes 40-45)
      startCountdown();
    } else {
      // Before warning window (minutes 0-40): Single scheduled timeout (Zero polling / zero re-renders)
      warningTimeout = setTimeout(() => {
        startCountdown();
      }, msUntilWarning);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (warningTimeout) clearTimeout(warningTimeout);
    };
  }, [session?.cacheKeepAlive?.active, session?.cacheKeepAlive?.warningAt, session?.cacheKeepAlive?.expiresAt]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [session?.history?.length, session?.status]);

  const discoverPriorDossier = async (targetTicker?: string) => {
    const t = targetTicker || ticker || session?.config?.ticker;
    if (!t) return;
    setPriorDossierSearching(true);
    try {
      const res = await authFetch(`/api/sentinel/prior-dossier?ticker=${encodeURIComponent(t.toUpperCase())}`);
      const data = await res.json();
      if (data.success && data.found && data.dossier) {
        setPriorDossierPath(data.dossier.filePath);
        if (data.state) {
          setSession(data.state);
          setAuditChecklist(runAuditLocally(data.state.files).checklist);
        }
      }
    } catch (err) {
      console.warn("Could not discover prior dossier:", err);
    } finally {
      setPriorDossierSearching(false);
    }
  };

  const handleEscalateSession = async () => {
    setEscalating(true);
    try {
      const res = await authFetch("/api/session/escalate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Escalation failed");
      setSession(data.state);
      setSessionMode('full');
      setAuditChecklist(runAuditLocally(data.state.files).checklist);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to escalate session.");
    } finally {
      setEscalating(false);
    }
  };

  // Init Session Handlers
  const handleInitialize = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const effectiveModel = selectedModel === "custom" ? customModelId.trim() : selectedModel;

    if (!effectiveModel) {
      setErrorMessage("Please select a Gemini Model.");
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    setDismissedMismatchesKey("");
    setDismissedMissingKey("");

    try {
      const res = await authFetch("/api/session/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          period,
          price,
          model: effectiveModel,
          executionMode,
          sessionMode,
          priorDossierPath,
          portfolio: {
            holdsPosition,
            currentWeight: holdsPosition ? currentWeight : undefined,
            entryPrice: holdsPosition ? entryPrice : undefined
          },
          notes: notes,
          enableCrosscheck: enableCrosscheck,
          crosscheckModel: crosscheckModel === "custom" ? customCrosscheckModelId.trim() : crosscheckModel,
          pipelineMode: 'single',
          serviceTier,
          lastEarningsDate,
          nextEarningsDate,
          daysToNextEarnings
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to configure terminal.");
      }

      const data = await res.json();
      setSession(data.state);
      setAuditChecklist(data.auditChecklist || []);
      if (data.integrityReport) setIntegrityReport(data.integrityReport);
      setActiveMobileTab('console');
    } catch (err: any) {
      setErrorMessage(err.message || "Initialization failure.");
    } finally {
      setLoading(false);
    }
  };

  // --- Gemini Flex Gatekeeper Execution Handlers ---
  const handleQueueForFlex = async (target: 'single' | 'batch' = 'single') => {
    if (flexEngaging || flexWatcher?.isWaiting || session?.status === 'running') return;
    try {
      setErrorMessage(null);
      setFlexEngaging(true);
      if (target === 'single' && (!session || !session.config)) {
        await handleInitialize();
      }

      const res = await authFetch("/api/flex/wait-and-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          checkIntervalSeconds: 45,
          maxWaitHours: 4
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to engage Flex Gatekeeper.");
        setFlexEngaging(false);
        return;
      }
      if (data.watcher) {
        setFlexWatcher(data.watcher);
      }
      await fetchSession();
      await fetchFlexWatcherStatus();
    } catch (err: any) {
      setErrorMessage(err.message || String(err));
    } finally {
      setFlexEngaging(false);
    }
  };

  const handleCancelFlexWait = async () => {
    try {
      const res = await authFetch("/api/flex/cancel-wait", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to cancel Flex Gatekeeper.");
        return;
      }
      await fetchFlexWatcherStatus();
    } catch (err: any) {
      setErrorMessage(err.message || String(err));
    }
  };

  // Upload Staged Files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);
    setDismissedMismatchesKey("");
    setDismissedMissingKey("");

    const totalFiles = files.length;
    let successCount = 0;
    let lastState = session;
    let lastChecklist = auditChecklist;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: totalFiles, name: file.name });

      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const rawResult = reader.result as string;
            const b64 = rawResult.split(",")[1];
            resolve(b64);
          };
          reader.onerror = () => reject(new Error(`Could not read file ${file.name}`));
          reader.readAsDataURL(file);
        });

        const res = await authFetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            data: base64Data
          })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Upload failed for "${file.name}"`);
        }

        const data = await res.json();
        if (data.requiresConfirmation && data.currencyAudit) {
          setCurrencyAuditPending({
            audit: data.currencyAudit,
            pendingFile: data.pendingFile || {
              name: file.name,
              mimeType: file.type || "text/csv",
              data: base64Data
            }
          });
          continue;
        }

        lastState = data.state || lastState;
        lastChecklist = data.auditChecklist || lastChecklist;
        successCount++;
      } catch (err: any) {
        console.error(err);
        setErrorMessage(prev => prev ? `${prev}\n${err.message}` : err.message);
      }
    }

    if (successCount > 0) {
      setSession(lastState);
      setAuditChecklist(lastChecklist);
    }

    setUploading(false);
    setUploadProgress(null);
    e.target.value = "";
    fetchSession();
  };

  // Currency Safeguard Modal Handlers
  const handleCurrencyHarmonizeConfirm = async () => {
    if (!currencyAuditPending) return;
    setCurrencyProcessing(true);
    try {
      const { pendingFile, audit } = currencyAuditPending;
      const res = await authFetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pendingFile.name,
          mimeType: pendingFile.mimeType,
          data: pendingFile.data,
          harmonize: true,
          bypassCurrencyCheck: true
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to harmonize and stage document.");
      }

      const data = await res.json();
      if (data.state) setSession(data.state);
      if (data.auditChecklist) setAuditChecklist(data.auditChecklist);
      setIngestFeedback({
        type: 'success',
        text: `Currency Safeguard: Preserved native ${audit.homeCurrency} (Spot FX: 1 USD = ${audit.fxRate.toFixed(2)} ${audit.homeCurrency}) across 10 years for "${data.file?.name}".`
      });
      setCurrencyAuditPending(null);
      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed during currency harmonization.");
    } finally {
      setCurrencyProcessing(false);
    }
  };

  const handleCurrencyUseRawConfirm = async () => {
    if (!currencyAuditPending) return;
    setCurrencyProcessing(true);
    try {
      const { pendingFile } = currencyAuditPending;
      const res = await authFetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pendingFile.name,
          mimeType: pendingFile.mimeType,
          data: pendingFile.data,
          harmonize: false,
          bypassCurrencyCheck: true
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed staging original raw file.");
      }

      const data = await res.json();
      if (data.state) setSession(data.state);
      if (data.auditChecklist) setAuditChecklist(data.auditChecklist);
      setIngestFeedback({
        type: 'warning',
        text: `Currency Safeguard: Staged raw file "${data.file?.name}" with unmodified currencies.`
      });
      setCurrencyAuditPending(null);
      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed staging raw file.");
    } finally {
      setCurrencyProcessing(false);
    }
  };

  const handleCurrencyCancel = () => {
    setCurrencyAuditPending(null);
    setIngestFeedback({
      type: 'warning',
      text: "Currency Safeguard: Upload aborted by user."
    });
  };


  // Remove File
  const handleRemoveFile = async (id: string) => {
    try {
      setErrorMessage(null);
      const res = await authFetch("/api/session/remove-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id })
      });
      if (!res.ok) throw new Error("Could not remove staged file.");
      
      const data = await res.json();
      setSession(data.state || session);
      setAuditChecklist(data.auditChecklist || auditChecklist);
      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message || "Error removing file.");
    }
  };

  // Re-fetch a single document directly from its source
  const handleRefetchSingleFile = async (file: FileLog) => {
    if (!ticker) {
      setIngestFeedback({ type: 'error', text: 'Specify a ticker before refreshing filings.' });
      return;
    }
    const cat = file.auditCategory || "";
    if (cat === "Financials TTM") {
      await handleRetrieveFmp();
    } else if (cat === "Transcript") {
      await handleRetrieveTranscript();
    } else if (cat === "10-K" || cat === "10-Q" || cat === "8-K" || cat === "DEF 14A") {
      setSecIngesting(true);
      setIngestFeedback({ type: 'info' as any, text: `Refreshing ${cat} filing for ${ticker.toUpperCase()}...` });
      try {
        const res = await authFetch("/api/ingest/sec-filings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticker: ticker.toUpperCase(),
            filingTypes: [cat],
            email: secEmail,
            name: secName,
            period
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed refreshing ${cat}`);
        setSession(data.state);
        if (data.state?.files) {
          setAuditChecklist(runAuditLocally(data.state.files).checklist);
        }
        setIngestFeedback({ type: 'success', text: `Successfully refreshed ${cat} for ${ticker.toUpperCase()}.` });
      } catch (err: any) {
        setIngestFeedback({ type: 'error', text: err.message || `Failed refreshing ${cat}.` });
      } finally {
        setSecIngesting(false);
      }
    }
  };


  // Purge all files (including pinned/persistent ones)
  const handlePurgeAllFiles = async () => {
    if (!confirm("Are you sure you want to purge all files? This will delete them completely from local server cache and Gemini storage.")) {
      return;
    }
    try {
      setErrorMessage(null);
      const res = await authFetch("/api/session/purge-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error("Could not purge all files.");
      const data = await res.json();
      setSession(data.state || session);
      setAuditChecklist(data.auditChecklist || auditChecklist);
      setIngestFeedback({ type: 'success', text: "Staged document repository successfully purged." });
      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message || "Error purging all files.");
    }
  };

  // Download physical file from local container disk cache
  const handleDownloadFile = async (id: string, name: string) => {
    try {
      setErrorMessage(null);
      const res = await authFetch(`/api/session/download-file/${id}`);
      if (!res.ok) throw new Error("File not found on server cache.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setIngestFeedback({ type: 'success', text: `Successfully downloaded file: "${name}"` });
    } catch (err: any) {
      setErrorMessage(err.message || "Error downloading file.");
      setIngestFeedback({ type: 'error', text: err.message || "Failed downloading file." });
    }
  };

  const handleDownloadAllFiles = async () => {
    try {
      setErrorMessage(null);
      const configTicker = ticker && ticker.trim() ? ticker.trim() : (session?.config?.ticker || "Symbol");
      const configPeriod = period && period.trim() && period.trim() !== "----" ? period.trim() : (session?.config?.period || "Q#-YY");
      const res = await authFetch(`/api/session/download-all?ticker=${encodeURIComponent(configTicker)}&period=${encodeURIComponent(configPeriod)}`);
      if (!res.ok) throw new Error("Failed to generate zip file of document repository.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${configTicker} ${configPeriod} Docs.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setIngestFeedback({ type: 'success', text: `Successfully downloaded all files.` });
    } catch (err: any) {
      setErrorMessage(err.message || "Error downloading files.");
      setIngestFeedback({ type: 'error', text: err.message || "Failed downloading all files." });
    }
  };

  // Execute terminal steps
  const handleRunSteps = async (
    overrideIntegrity: boolean | any = false, 
    overrideMissing: boolean | any = false,
    allowUncachedFallback: boolean = false,
    overrideSubstance: boolean = false
  ) => {
    if (!session || !session.config) return;

    const shouldOverrideIntegrity = overrideIntegrity === true;
    const shouldOverrideMissing = overrideMissing === true;
    const shouldOverrideSubstance = overrideSubstance === true;

    // Guard 1: Check for critical document integrity mismatches
    if (!shouldOverrideIntegrity && integrityReport && integrityReport.hasMismatches) {
      setIntegrityModalOpen(true);
      return;
    }

    // Guard 2: Check for missing required pre-flight documents
    const missingItems = auditChecklist.filter(c => c.status === "MISSING");
    if (!shouldOverrideMissing && missingItems.length > 0) {
      setMissingModalOpen(true);
      return;
    }

    // Guard 3: Pre-Flight File Substance Tripwire (Check for truncated / stub files)
    const substanceRep = auditFilesSubstance(session.files || []);
    if (!shouldOverrideSubstance && substanceRep.hasIssues) {
      setSubstanceIssues(substanceRep.issues);
      setSubstanceModalOpen(true);
      return;
    }

    if (runStarting || session.status === 'running') return;
    setRunStarting(true);
    setErrorMessage(null);
    setActiveMobileTab('console');
    setIntegrityModalOpen(false);
    setMissingModalOpen(false);
    setSubstanceModalOpen(false);
    setSession(prev => prev ? { ...prev, status: 'running' } : prev);

    try {
      const res = await authFetch("/api/session/step/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          overrideIntegrityCheck: shouldOverrideIntegrity,
          overrideMissingFiles: shouldOverrideMissing,
          overrideSubstanceFiles: shouldOverrideSubstance,
          allowUncachedFallback: allowUncachedFallback
        })
      });
      if (!res.ok) {
        const data = await res.json();
        // Revert optimistic running status on error
        setSession(prev => prev ? { ...prev, status: 'idle' } : prev);
        if (data.requiresIntegrityConfirmation && data.integrityReport) {
          setIntegrityReport(data.integrityReport);
          setIntegrityModalOpen(true);
          return;
        }
        if (data.requiresMissingFilesConfirmation && data.checklist) {
          setAuditChecklist(data.checklist);
          setMissingModalOpen(true);
          return;
        }
        if (data.requiresSubstanceConfirmation && data.substanceIssues) {
          setSubstanceIssues(data.substanceIssues);
          setSubstanceModalOpen(true);
          return;
        }
        throw new Error(data.error || "Analytical engine crashed at boot.");
      }
      setIntegrityModalOpen(false);
      setMissingModalOpen(false);
      setSubstanceModalOpen(false);
      fetchSession();
    } catch (err: any) {
      setSession(prev => prev ? { ...prev, status: 'idle' } : prev);
      setErrorMessage(err.message);
    } finally {
      setRunStarting(false);
    }
  };

  const handleSubstanceModalClose = () => {
    setSubstanceModalOpen(false);
  };

  const handleSubstanceOverrideProceed = () => {
    setSubstanceModalOpen(false);
    handleRunSteps(true, true, false, true);
  };

  // Document Integrity Modal Handlers
  const handleIntegrityFixFiles = () => {
    if (integrityReport) {
      const currentKey = `${integrityReport.targetTicker}_${integrityReport.targetPeriod}_${integrityReport.mismatches.map(m => m.fileName + m.actual).sort().join("|")}`;
      setDismissedMismatchesKey(currentKey);
    }
    setIntegrityModalOpen(false);
  };

  const handleIntegrityPurgeMismatches = async () => {
    try {
      setLoading(true);
      const res = await authFetch("/api/session/purge-mismatches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: session?.config?.ticker || ticker,
          period: session?.config?.period || period
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed purging mismatched files.");
      }

      const data = await res.json();
      if (data.state) setSession(data.state);
      if (data.auditChecklist) setAuditChecklist(data.auditChecklist);
      setIntegrityReport(data.integrityReport || null);
      setIntegrityModalOpen(false);
      setIngestFeedback({
        type: 'success',
        text: `Document Integrity Guard: Purged ${data.purgedCount || 0} mismatched document(s) from repository.`
      });
      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed removing mismatched files.");
    } finally {
      setLoading(false);
    }
  };

  const handleIntegritySyncConfig = async (suggestedTicker?: string, suggestedPeriod?: string) => {
    if (!session || !session.config) return;
    const newTicker = suggestedTicker || session.config.ticker;
    const newPeriod = suggestedPeriod || session.config.period;
    setTicker(newTicker);
    setPeriod(newPeriod);
    setIntegrityModalOpen(false);

    try {
      setLoading(true);
      const res = await authFetch("/api/session/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...session.config,
          ticker: newTicker,
          period: newPeriod
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.state);
        setAuditChecklist(data.auditChecklist || []);
        if (data.integrityReport) setIntegrityReport(data.integrityReport);
        setIngestFeedback({
          type: 'success',
          text: `Document Integrity Guard: Updated target configuration to ${newTicker} ${newPeriod} to match staged filings.`
        });
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Failed syncing configuration to detected documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrityOverride = () => {
    if (integrityReport) {
      const currentKey = `${integrityReport.targetTicker}_${integrityReport.targetPeriod}_${integrityReport.mismatches.map(m => m.fileName + m.actual).sort().join("|")}`;
      setDismissedMismatchesKey(currentKey);
    }
    setIntegrityModalOpen(false);

    const missing = auditChecklist.filter(c => c.status === "MISSING");
    const activeT = ticker || session?.config?.ticker || "";
    const activeP = period || session?.config?.period || "";
    const missingKey = `${activeT}_${activeP}_${missing.map(m => m.category).sort().join("|")}`;
    const missingAlreadyDismissed = missing.length === 0 || dismissedMissingKey === missingKey;

    if (missingAlreadyDismissed) {
      handleRunSteps(true, true);
    } else {
      handleRunSteps(true, false);
    }
  };

  // Missing Documents Modal Handlers
  const handleMissingModalClose = () => {
    const missing = auditChecklist.filter(c => c.status === "MISSING");
    const activeT = ticker || session?.config?.ticker || "";
    const activeP = period || session?.config?.period || "";
    const currentKey = `${activeT}_${activeP}_${missing.map(m => m.category).sort().join("|")}`;
    setDismissedMissingKey(currentKey);
    setMissingModalOpen(false);
  };

  const handleMissingOverrideProceed = () => {
    const missing = auditChecklist.filter(c => c.status === "MISSING");
    const activeT = ticker || session?.config?.ticker || "";
    const activeP = period || session?.config?.period || "";
    const currentKey = `${activeT}_${activeP}_${missing.map(m => m.category).sort().join("|")}`;
    setDismissedMissingKey(currentKey);
    setMissingModalOpen(false);

    if (integrityReport && integrityReport.hasMismatches) {
      const mismatchesKey = `${integrityReport.targetTicker}_${integrityReport.targetPeriod}_${integrityReport.mismatches.map(m => m.fileName + m.actual).sort().join("|")}`;
      setDismissedMismatchesKey(mismatchesKey);
    }

    handleRunSteps(true, true);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Trigger Forensic Crosscheck Audit on-demand
  const handleRunCrosscheck = async () => {
    if (!session || !session.config) return;
    setCrosscheckLoading(true);
    setErrorMessage(null);
    setActiveMobileTab('console');

    try {
      const effectiveModel = crosscheckModel === "custom" ? customCrosscheckModelId.trim() : crosscheckModel;
      const res = await authFetch("/api/session/crosscheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crosscheckModel: effectiveModel })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to engage Forensic Crosscheck.");
      }
      fetchSession();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed running Forensic Crosscheck.");
    } finally {
      setCrosscheckLoading(false);
    }
  };

  // Interrogative Query Submit
  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setQueryLoading(true);
    setErrorMessage(null);
    const userText = customQuery;
    setCustomQuery("");

    try {
      const res = await authFetch("/api/session/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to interrogate the model.");
      }

      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setQueryLoading(false);
    }
  };

  // Rewind Steps Handlers
  const handleRewind = async () => {
    if (confirm("Are you sure you want to rewind the last completed analysis step? This will reset the step results and undo its changes in the context window.")) {
      try {
        const res = await authFetch("/api/session/rewind", { method: "POST" });
        if (!res.ok) throw new Error("Could not execute rewinding operation.");
        fetchSession();
      } catch (err: any) {
        setErrorMessage(err.message);
      }
    }
  };

  // Halt active modeling loop sequential run
  const handleStopSession = async () => {
    try {
      setErrorMessage(null);
      const res = await authFetch("/api/session/stop", { method: "POST" });
      if (!res.ok) throw new Error("Could not pause engine.");
      const data = await res.json();
      setSession(data.state || session);
      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to pause engine.");
    }
  };

  // Immediately trigger retry step bypassing cooldown timer
  const handleRetryNow = async () => {
    try {
      setErrorMessage(null);
      const res = await authFetch("/api/session/retry-now", { method: "POST" });
      if (!res.ok) throw new Error("Could not resume retry.");
      const data = await res.json();
      setSession(data.state || session);
      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to trigger retry.");
    }
  };

  // Explicitly switch to Standard tier and resume step
  const handleRetryStandard = async () => {
    try {
      setErrorMessage(null);
      const res = await authFetch("/api/session/retry-standard", { method: "POST" });
      if (!res.ok) throw new Error("Could not switch to Standard tier.");
      const data = await res.json();
      setSession(data.state || session);
      if (data.state?.config?.serviceTier) {
        setServiceTier(data.state.config.serviceTier);
      }
      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to switch to Standard tier.");
    }
  };

  // Cancel auto-resume cooldown countdown and pause session
  const handleRetryCancel = async () => {
    try {
      setErrorMessage(null);
      const res = await authFetch("/api/session/retry-cancel", { method: "POST" });
      if (!res.ok) throw new Error("Could not cancel auto-resume.");
      const data = await res.json();
      setSession(data.state || session);
      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to cancel auto-resume.");
    }
  };

  // Inject a context comment without running an immediate LLM turn
  const handleInjectComment = async () => {
    if (!customQuery.trim()) return;
    setQueryLoading(true);
    setErrorMessage(null);
    const textToComment = customQuery;
    setCustomQuery("");
    try {
      const res = await authFetch("/api/session/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToComment })
      });
      if (!res.ok) throw new Error("Failed to inject custom comment.");
      const data = await res.json();
      setSession(data.state || session);
      fetchSession();
    } catch (err: any) {
      setErrorMessage(err.message || "Error saving comment details.");
    } finally {
      setQueryLoading(false);
    }
  };

  // Reset Terminal
  const handleReset = async () => {
    if (confirm("Are you sure you want to soft-purge the current analysis logs? This will wipe the conversation and reset steps back to Step 1, while keeping your stock settings and staged files.")) {
      try {
        const res = await authFetch("/api/session/reset", { method: "POST" });
        if (!res.ok) throw new Error("Error purging terminal session.");
        window.location.reload();
      } catch (err: any) {
        setErrorMessage(err.message);
      }
    }
  };

  const handleHardReset = async () => {
    if (confirm("Are you sure you want to completely reset the app? This will purge all logs, clear all inputs and configurations, and reset everything.")) {
      await executeAppReset();
    }
  };

  // Adjust default parameters
  const adjustThinkingLevel = async (stepIndex: number, newLevel: 'low' | 'medium' | 'high') => {
    try {
      const res = await authFetch("/api/session/step/thinking-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: stepIndex, thinkingLevel: newLevel })
      });
      if (!res.ok) throw new Error("Could not adjust thinking level parameter.");
      fetchSession();
      setTempDropdownOpen(null);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const adjustTemperature = async (stepIndex: number, newTemp: number) => {
    try {
      const res = await authFetch("/api/session/step/temp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: stepIndex, temperature: newTemp })
      });
      if (!res.ok) throw new Error("Could not adjust temperature parameter.");
      fetchSession();
      setTempDropdownOpen(null);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Check for ticker mismatches in files
  const getTickerWarnings = () => {
    if (!session || !session.config) return [];
    const tickerStr = session.config.ticker.toLowerCase();
    const warnings: string[] = [];

    session.files.forEach(f => {
      const name = f.name.toLowerCase();
      // Look for capital ticker-like structures in file names (e.g., AAPL, MSFT)
      // and spot if they do not contain the active ticker
      const firstWordMatch = f.name.match(/^[^ _\-]+/);
      if (firstWordMatch) {
        const firstWord = firstWordMatch[0];
        if (/^[A-Z]{2,5}$/.test(firstWord)) {
          // exclude technical files or terms
          const technicalTerms = ["TTM", "CSV", "PDF", "DOC", "Q1", "Q2", "Q3", "Q4", "FORM", "HELO"];
          if (!technicalTerms.includes(firstWord)) {
            if (firstWord.toLowerCase() !== tickerStr) {
              warnings.push(`Staged file "${f.name}" matches potential ticker prefix "${firstWord}" instead of entered ticker "${session.config.ticker}". Check if you are auditing multiple companies.`);
            }
          }
        }
      }
    });

    return warnings;
  };

  const tickerWarnings = getTickerWarnings();

  // Progress maths
  const getProgress = () => {
    if (!session) return 0;
    const completedSteps = session.steps.filter(s => s.status === 'completed').length;
    return Math.round((completedSteps / session.steps.length) * 100);
  };

  const completedCount = session ? session.steps.filter(s => s.status === 'completed').length : 0;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#0d0f14] text-gray-200 flex flex-col font-sans selection:bg-[#10B981]/30 selection:text-[#10B981]">
      {/* --- Top Navbar --- */}
      <header className="bg-[#141822] border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 shadow-xl shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-[#1e2536] rounded-xl border border-slate-700/50 text-[#10B981]">
              <Terminal className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight font-sans text-white">
                  Value Investing Terminal
                </h1>
                <span className="text-[9px] sm:text-[10px] bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full font-mono border border-[#10B981]/30 uppercase tracking-widest">
                  Prompt V7
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                Forti Capital Quantitative & Structural Analysis Workstation
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
          {/* Autonomous Batch Queue Button */}
          <button
            type="button"
            onClick={() => setBatchModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition shadow-md border ${
              batchState?.status === 'running'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse shadow-emerald-950/40'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
            title="Open Autonomous Valuation Batch Queue"
          >
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>BATCH QUEUE</span>
            {batchState && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-emerald-300 border border-emerald-800">
                {batchState.completedCount}/{batchState.totalCount}
              </span>
            )}
          </button>

          {/* Competitor Moat & Valuation Radar Button */}
          <button
            type="button"
            onClick={() => {
              fetchCompetitorRadar();
              setCompetitorRadarOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition shadow-md border bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
            title="Open Competitor Moat & Valuation Radar"
          >
            <Radar className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>COMPETITOR RADAR</span>
            {competitorDossier && competitorDossier.peers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-cyan-300 border border-cyan-800">
                {competitorDossier.peers.length}
              </span>
            )}
          </button>

          {/* Flight Crew Operating Manual (FCOM) Button */}
          <a
            href="/terminal_v7_manual.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition shadow-md border bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
            title="Open Flight Crew Operating Manual (FCOM) in a new tab"
          >
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>FCOM MANUAL</span>
          </a>

          {/* Gemini Flex Tier Live Capacity HUD Pill */}
          {probingFlex ? (
            <button
              type="button"
              onClick={() => fetchFlexStatus(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition shadow-md border bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/70"
              title="Probing Google Flex Tier cluster... Click to refresh."
            >
              <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin shrink-0" />
              <span>FLEX: CHECKING...</span>
            </button>
          ) : flexProbe?.status === 200 || flexProbe?.reason === 'available' ? (
            <button
              type="button"
              onClick={() => fetchFlexStatus(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition shadow-md border bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/40"
              title={`Flex Tier Ready: ${flexProbe.latencyMs}ms canary latency (${flexProbe.cached ? 'cached' : 'live'}). Click to re-probe.`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>FLEX OPEN ({flexProbe.latencyMs}ms)</span>
            </button>
          ) : flexProbe?.status === 503 || flexProbe?.reason === 'saturated' ? (
            <button
              type="button"
              onClick={() => fetchFlexStatus(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition shadow-md border bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 animate-pulse"
              title="Flex Tier 503 High Demand: Google Flex cluster saturated. Click to re-probe or engage Gatekeeper."
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>FLEX: 503 SATURATED</span>
            </button>
          ) : flexProbe?.status === 429 || flexProbe?.reason === 'rate_limit' ? (
            <button
              type="button"
              onClick={() => fetchFlexStatus(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition shadow-md border bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/40"
              title="Flex Tier 429 Rate Limit. Click to re-probe."
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>FLEX: 429 RATE LIMIT</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fetchFlexStatus(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition shadow-md border bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 border-slate-700/50"
              title="Click to probe Gemini Flex Tier cluster availability"
            >
              <Zap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>PROBE FLEX</span>
            </button>
          )}

          {integrityReport && integrityReport.hasMismatches && (
            <button
              type="button"
              onClick={() => setIntegrityModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 rounded-lg text-xs font-mono font-bold animate-pulse cursor-pointer transition shadow-lg shadow-rose-950/40"
              title="Click to review and resolve document mismatches"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{integrityReport.mismatches.length} MISMATCH{integrityReport.mismatches.length > 1 ? "ES" : ""}</span>
            </button>
          )}

          {auditChecklist.filter(c => c.status === "MISSING").length > 0 && (
            <button
              type="button"
              onClick={() => setMissingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-mono font-bold cursor-pointer transition shadow-lg shadow-amber-950/40"
              title="Click to review and stage missing required documents"
            >
              <FileWarning className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{auditChecklist.filter(c => c.status === "MISSING").length} MISSING FILE{auditChecklist.filter(c => c.status === "MISSING").length > 1 ? "S" : ""}</span>
            </button>
          )}

          {session?.config && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#181d2a] rounded-lg border border-slate-800 text-xs text-slate-300">
              <span className="font-mono text-[#10B981]">Ticker:</span> <strong className="text-white font-semibold">{session.config.ticker}</strong>
              <span className="text-slate-600 mx-1">|</span>
              <span className="font-mono text-[#10B981]">Period:</span> <strong className="text-white font-semibold">{session.config.period}</strong>
              <span className="text-slate-600 mx-1">|</span>
              <span className="font-mono text-[#10B981]">Price:</span> <strong className="text-white font-semibold">${session.config.price}</strong>
            </div>
          )}

          {Boolean(session?.config?.ticker) && session?.cacheStatus === 'active' && Boolean(session?.cachedTokenCount) && (
            <div 
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-mono font-bold select-none"
              title={`Native Implicit Prefix Cache Active (${session.cachedTokenCount?.toLocaleString()} tokens cached by Gemini)${session?.cacheKeepAlive?.active ? ` • Heartbeat Keep-Alive Active (${session.cacheKeepAlive.pingCount} pings)` : ''}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>PREFIX CACHE HIT ({session.cachedTokenCount?.toLocaleString()} TOKENS)</span>
              {session?.cacheKeepAlive?.active && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Heartbeat Keep-Alive Active" />
              )}
            </div>
          )}

          {Boolean(session?.config?.ticker) && session?.crosscheckVerdict && session?.steps?.some(s => s.isCrosscheck && s.status === 'completed') && (
            <div 
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold select-none border ${
                session.crosscheckVerdict.hasBreach
                  ? 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
              title={
                session.crosscheckVerdict.hasBreach
                  ? `Forensic Breach Detected (${session.crosscheckVerdict.gatesPassed}/${session.crosscheckVerdict.totalGates} gates passed): ${session.crosscheckVerdict.breaches.join(', ')}`
                  : `All ${session.crosscheckVerdict.gatesPassed}/${session.crosscheckVerdict.totalGates} Pre-Flight Forensic Gates Passed`
              }
            >
              <span>{session.crosscheckVerdict.hasBreach ? '🚨' : '🛡️'}</span>
              <span>
                CROSSCHECK: {session.crosscheckVerdict.gatesPassed}/{session.crosscheckVerdict.totalGates} GATES {session.crosscheckVerdict.hasBreach ? 'BREACH DETECTED' : 'PASSED'}
              </span>
            </div>
          )}

          {/* 3-Tier Notification Center Button */}
          <button
            type="button"
            onClick={() => setNotificationModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              notificationConfig.enabled
                ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-700/60 shadow-xs'
                : 'bg-[#1e2536]/50 hover:bg-[#1e2536] text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
            title="Notification Center: Desktop chimes, ntfy mobile push, email delivery"
          >
            <Bell className={`w-4 h-4 ${notificationConfig.enabled ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="inline">Notifications</span>
            {notificationConfig.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>
        </div>
      </header>

      {/* --- Error Message Display --- */}
      {errorMessage && (
        <div className="bg-red-950/40 border-y border-red-800/60 px-6 py-3.5 flex justify-between items-center text-sm text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            className="text-xs bg-red-900/40 hover:bg-red-900 px-3 py-1 rounded-md border border-red-700 transition"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* --- Mobile Tab Selector --- */}
      <div className="md:hidden shrink-0 px-4 md:px-6 pt-3 flex gap-2 select-none bg-[#0d0f14]">
        <button
          type="button"
          onClick={() => setActiveMobileTab('config')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'config'
              ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/40 shadow-md font-bold'
              : 'bg-[#141822] text-slate-400 border-slate-800/80'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Config & Files</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('console')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'console'
              ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/40 shadow-md font-bold'
              : 'bg-[#141822] text-slate-400 border-slate-800/80'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Terminal Console</span>
          {session && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {completedCount}/{MASTER_PROMPTS.length}
            </span>
          )}
        </button>
      </div>

      {/* --- Main Dashboard Container --- */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0 md:h-[calc(100vh-100px)] md:overflow-hidden overflow-y-auto">
        
        {/* === Left Grid: Configuration, Files, Audit Checklist (4 Columns) === */}
        <section className={`md:col-span-4 flex-col gap-6 md:h-full md:overflow-y-auto md:pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 pb-12 ${activeMobileTab === 'config' ? 'flex' : 'hidden md:flex'}`}>
          
          {/* Card 1: Session Setup Form */}
          <div className="shrink-0 bg-[#141822] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-[#10B981] to-cyan-500"></div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#10B981]" /> 
                <span>Analyst Configuration</span>
              </h2>
              <button
                type="button"
                onClick={handleHardReset}
                className="p-1.5 bg-[#1e2536] hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-lg border border-slate-800 hover:border-red-900/50 transition cursor-pointer flex items-center gap-1 text-[10px] font-mono"
                title="Hard Reset App (Purge all staged files, logs, and inputs)"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            <form onSubmit={handleInitialize} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-mono text-[#10B981] uppercase">Ticker Token</label>
                    <button
                      type="button"
                      onClick={handleFetchFmpData}
                      disabled={fmpSyncing}
                      title="Fetch FMP Data (Price & Period)"
                      className="text-[#10B981] hover:text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-1.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-[9px] uppercase font-mono tracking-wider">
                        {fmpSyncing ? "Syncing..." : "Sync FMP"}
                      </span>
                      <RefreshCw className={`w-3 h-3 ${fmpSyncing ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => {
                      userManuallyEditedTickerRef.current = true;
                      setTicker(e.target.value.toUpperCase());
                      setPeriod("----");
                      setPrice("----");
                      setHoldsPosition(false);
                      setCurrentWeight("----");
                      setEntryPrice("----");
                      setLastEarningsDate(null);
                      setNextEarningsDate(null);
                      setDaysToNextEarnings(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFetchFmpData();
                      } else if (e.key === 'Tab') {
                        handleFetchFmpData();
                      }
                    }}
                    className="w-full bg-[#0a0d14] border border-slate-800 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase tracking-wider"
                    placeholder="e.g. MSFT"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#10B981] uppercase mb-1.5">Audit Quarter</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-slate-800 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                    placeholder="Auto-filled"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#10B981] uppercase mb-1.5">Current Stock Price ($)</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-800 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-mono text-white"
                  placeholder="Auto-filled"
                  required
                />
              </div>

              {/* Earnings Calendar Horizon Strip */}
              {(lastEarningsDate || nextEarningsDate) && (
                <div className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                  daysToNextEarnings !== null && daysToNextEarnings >= 0 && daysToNextEarnings <= 14
                    ? "bg-amber-950/30 border-amber-500/40 text-amber-300"
                    : "bg-[#0b0e15] border-slate-800 text-slate-400"
                }`}>
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className={`w-3.5 h-3.5 shrink-0 ${
                        daysToNextEarnings !== null && daysToNextEarnings >= 0 && daysToNextEarnings <= 14
                          ? "text-amber-400"
                          : "text-[#10B981]"
                      }`} />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        Earnings Horizon
                      </span>
                    </div>
                    {daysToNextEarnings !== null && daysToNextEarnings >= 0 && (
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        daysToNextEarnings <= 14
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {daysToNextEarnings === 0 ? "⚠️ Today" : daysToNextEarnings === 1 ? "⚠️ Tomorrow" : daysToNextEarnings <= 14 ? `⚠️ In ${daysToNextEarnings}d` : `In ${daysToNextEarnings}d`}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-500 block">Last Reported</span>
                      <span className="text-slate-300 font-semibold">{lastEarningsDate || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-500 block">Next Scheduled</span>
                      <span className={`font-semibold ${
                        daysToNextEarnings !== null && daysToNextEarnings >= 0 && daysToNextEarnings <= 14
                          ? "text-amber-300"
                          : "text-slate-200"
                      }`}>{nextEarningsDate || "TBD"}</span>
                    </div>
                  </div>

                  {daysToNextEarnings !== null && daysToNextEarnings >= 0 && daysToNextEarnings <= 14 && (
                    <p className="text-[10px] text-amber-400/90 mt-2 leading-tight font-sans pt-1.5 border-t border-amber-500/20">
                      Pre-Earnings Horizon: Company reports within 14 days. Output dossier will feature an Event Horizon advisory.
                    </p>
                  )}
                </div>
              )}

              <div className="border border-slate-800/80 rounded-xl bg-[#0b0e15]/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setApiKeysDropdownOpen(!apiKeysDropdownOpen)}
                  className="w-full flex items-center justify-between p-3.5 focus:outline-none hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-[#10B981]">
                    <Key className="w-4 h-4" />
                    <span className="text-[11px] font-mono uppercase tracking-wide font-semibold">API Key Overrides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(customKeyInput.trim() || fmpApiKey.trim()) && (
                      <span className="text-[9px] bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-1.5 py-0.5 rounded font-mono uppercase">
                        Active Limit(s)
                      </span>
                    )}
                    {apiKeysDropdownOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>
                
                {apiKeysDropdownOpen && (
                  <div className="p-3.5 pt-1 border-t border-slate-800/50 space-y-4 animate-fade-in">
                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-mono">
                        <label className="block text-[11px] text-[#10B981] uppercase">Gemini API Key</label>
                        {customKeyInput.trim() && (
                          <button
                            type="button"
                            onClick={() => handleKeyInputChange("")}
                            className="text-[9px] text-red-400 hover:text-red-300 active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer font-bold"
                            title="Unlink and completely erase custom API key from browser cache"
                          >
                            ✕ Unlink Key
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={geminiKeyVisible ? "text" : "password"}
                          value={customKeyInput}
                          onChange={(e) => handleKeyInputChange(e.target.value)}
                          className="w-full bg-[#0a0d14] border border-slate-800 focus:border-emerald-600 focus:outline-none rounded-xl pl-3.5 pr-28 py-2.5 text-xs text-white placeholder-slate-600 font-mono tracking-widest text-ellipsis"
                          placeholder="AIzaSy... (Unlink to clear)"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 select-none">
                          {customKeyInput.trim() && (
                            <button
                              type="button"
                              onClick={() => setGeminiKeyVisible(!geminiKeyVisible)}
                              className="p-1 text-slate-500 hover:text-slate-350 active:scale-95 transition-all cursor-pointer flex items-center"
                              title={geminiKeyVisible ? "Hide key" : "Show key"}
                            >
                              {geminiKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <span className={`text-[9px] font-mono uppercase border px-1.5 py-0.5 rounded ${customKeyInput.trim() ? "bg-emerald-950/40 text-[#10B981] border-emerald-800" : "bg-slate-900 text-slate-400 border-slate-800"}`}>
                            {customKeyInput.trim() ? "LINKED" : "VACANT"}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        Saves securely in local cache. Blank out or click <strong>Unlink Key</strong> to disconnect anytime.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-mono">
                        <label className="block text-[11px] text-[#10B981] uppercase">FMP API Key</label>
                        {fmpApiKey.trim() && (
                          <button
                            type="button"
                            onClick={() => handleFmpApiKeyChange("")}
                            className="text-[9px] text-red-400 hover:text-red-300 active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer font-bold"
                            title="Unlink and completely erase FMP API key from browser cache"
                          >
                            ✕ Unlink Key
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={fmpKeyVisible ? "text" : "password"}
                          value={fmpApiKey}
                          onChange={(e) => handleFmpApiKeyChange(e.target.value)}
                          className="w-full bg-[#0a0d14] border border-slate-800 focus:border-[#10B981] focus:outline-none rounded-xl pl-3.5 pr-28 py-2.5 text-xs text-white placeholder-slate-600 font-mono tracking-widest text-ellipsis"
                          placeholder="FMP API Key Override"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 select-none">
                          {fmpApiKey.trim() && (
                            <button
                              type="button"
                              onClick={() => setFmpKeyVisible(!fmpKeyVisible)}
                              className="p-1 text-slate-500 hover:text-slate-350 active:scale-95 transition-all cursor-pointer flex items-center"
                              title={fmpKeyVisible ? "Hide key" : "Show key"}
                            >
                              {fmpKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <span className={`text-[9px] font-mono uppercase border px-1.5 py-0.5 rounded ${fmpApiKey.trim() ? "bg-emerald-950/40 text-[#10B981] border-emerald-800" : "bg-slate-900 text-slate-400 border-slate-800"}`}>
                            {fmpApiKey.trim() ? "LINKED" : "VACANT"}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        If left blank, the system's default FMP Secret will be used automatically.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-mono">
                        <label className="block text-[11px] text-[#10B981] uppercase">Stock Analysis Cookie</label>
                        {stockAnalysisCookie.trim() && (
                          <button
                            type="button"
                            onClick={() => handleStockAnalysisCookieChange("")}
                            className="text-[9px] text-red-400 hover:text-red-300 active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer font-bold"
                            title="Unlink and completely erase Stock Analysis cookie from browser cache"
                          >
                            ✕ Unlink Cookie
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={cookieVisible ? "text" : "password"}
                          value={stockAnalysisCookie}
                          onChange={(e) => handleStockAnalysisCookieChange(e.target.value)}
                          className="w-full bg-[#0a0d14] border border-slate-800 focus:border-[#10B981] focus:outline-none rounded-xl pl-3.5 pr-28 py-2.5 text-xs text-white placeholder-slate-600 font-mono tracking-widest text-ellipsis"
                          placeholder="Cookie string (session_id=...)"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 select-none">
                          {stockAnalysisCookie.trim() && (
                            <button
                              type="button"
                              onClick={() => setCookieVisible(!cookieVisible)}
                              className="p-1 text-slate-500 hover:text-slate-350 active:scale-95 transition-all cursor-pointer flex items-center"
                              title={cookieVisible ? "Hide cookie" : "Show cookie"}
                            >
                              {cookieVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <span className={`text-[9px] font-mono uppercase border px-1.5 py-0.5 rounded ${stockAnalysisCookie.trim() ? "bg-emerald-950/40 text-[#10B981] border-emerald-800" : "bg-slate-900 text-slate-400 border-slate-800"}`}>
                            {stockAnalysisCookie.trim() ? "LINKED" : "VACANT"}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        Used to bypass paywalls for automated stockanalysis.com transcript scraping.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Single Model Configuration */}
              <div className="grid grid-cols-1 gap-1.5 animate-fade-in pt-1">
                <div className="flex justify-between items-center mb-0.5">
                  <label className="block text-[11px] font-mono text-[#10B981] uppercase font-semibold">Gemini Model</label>
                  <button
                    type="button"
                    onClick={fetchModels}
                    disabled={loadingModels}
                    className="text-[9px] text-[#10B981]/70 hover:text-[#10B981] active:scale-95 transition-all flex items-center gap-1 cursor-pointer font-mono"
                    title="Poll Google's catalog dynamically to update available Gemini models"
                  >
                    {loadingModels ? "Updating..." : "↻ Refresh List"}
                  </button>
                </div>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-800 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-sans text-white text-ellipsis cursor-pointer"
                >
                  <option value="" disabled>Select Model...</option>
                  {(modelOptions || []).map((opt) => {
                    const oName = opt?.name || "";
                    const oDisp = String(opt?.displayName || opt?.name || oName).replace("models/", "");
                    return (
                      <option key={oName} value={oName}>
                        {oDisp}
                      </option>
                    );
                  })}
                  <option value="custom">Custom Model ID / Brand New Release...</option>
                </select>

                {selectedModel === "custom" && (
                  <div className="mt-1">
                    <input
                      type="text"
                      value={customModelId}
                      onChange={(e) => setCustomModelId(e.target.value)}
                      placeholder="e.g. gemini-4-argon"
                      className="w-full bg-[#0a0d14] border border-slate-700 focus:border-[#10B981] focus:outline-none rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">Specify any model ID from Google's catalog when new releases launch.</span>
                  </div>
                )}

                {/* Google Gemini Flex Tier Discount Toggle */}
                <div className="p-2.5 bg-[#0a0d14] border border-slate-800/80 rounded-xl mt-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-200 font-medium">
                      <input
                        type="checkbox"
                        checked={serviceTier === 'flex'}
                        onChange={(e) => setServiceTier(e.target.checked ? 'flex' : 'standard')}
                        className="w-4 h-4 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#141822] bg-[#141822]"
                      />
                      <span>Enable Gemini Flex Tier (<code className="text-emerald-400 text-[10px]">serviceTier: "flex"</code>)</span>
                    </label>
                    <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                      50% OFF
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 pl-6 leading-relaxed">
                    Applies Google's 50% discount on inputs, outputs, and cached tokens. Full 10-minute HTTP queue timeout configured.
                  </p>
                  {serviceTier === 'flex' && !flexWatcher?.isWaiting && session?.status !== 'running' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Flex Gatekeeper:</span>
                      <button
                        type="button"
                        onClick={() => handleQueueForFlex('single')}
                        className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-lg font-mono font-bold text-[10px] transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        title="Monitors Flex cluster every 45s and automatically launches single valuation when capacity opens (HTTP 200)"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Queue for Next Flex Opening</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Mode Terminal Architecture Selector */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-mono text-[#10B981] uppercase font-semibold">Terminal Analysis Mode</label>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                    {sessionMode === 'slingshot' ? '1 Prompt' : sessionMode === 'sentinel' ? '1 Prompt' : '11 Prompts + Crosscheck'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { 
                      val: 'slingshot' as SessionMode, 
                      icon: '⚡', 
                      name: 'Mode 1', 
                      title: 'Slingshot Triage'
                    },
                    { 
                      val: 'full' as SessionMode, 
                      icon: '🏛️', 
                      name: 'Mode 2', 
                      title: 'Full Dossier'
                    },
                    { 
                      val: 'sentinel' as SessionMode, 
                      icon: '🛡️', 
                      name: 'Mode 3', 
                      title: 'Sentinel Pulse'
                    }
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => {
                        setSessionMode(m.val);
                        if (m.val === 'sentinel') {
                          discoverPriorDossier();
                        }
                      }}
                      className={`py-2 px-1.5 rounded-xl text-center cursor-pointer border transition-all flex flex-col items-center justify-center gap-1 ${
                        sessionMode === m.val
                          ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/50 shadow-sm"
                          : "bg-[#0a0d14] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-sm">{m.icon}</span>
                      <span className="text-[11px] font-bold tracking-tight leading-none">{m.name}</span>
                      <span className="text-[9px] font-mono opacity-80 leading-none truncate max-w-full">{m.title.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                  {sessionMode === 'slingshot' && '⚡ Mode 1: Rapid institutional triage memo. Underwrite or pass in 1 turn (INVEST / PASS / ESCALATE).'}
                  {sessionMode === 'full' && '🏛️ Mode 2: Deep 11-step institutional valuation dossier with forensic crosscheck & double-blind dual valuation.'}
                  {sessionMode === 'sentinel' && '🛡️ Mode 3: 90-day holding pulse. 40Q operational delta, Part 11 dashboard (HOLD / ACCUMULATE / LIQUIDATE).'}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#10B981] uppercase mb-1.5">Workflow Execution Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: ExecutionMode.FullAuto, label: "Full Auto" },
                    { val: ExecutionMode.Surgical, label: "Surgical" }
                  ].map((mode) => (
                    <button
                      key={mode.val}
                      type="button"
                      onClick={() => setExecutionMode(mode.val)}
                      className={`py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                        executionMode === mode.val
                          ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/40 shadow-sm"
                          : "bg-[#0a0d14] text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                  {executionMode === ExecutionMode.FullAuto && "Runs all prompts sequentially through to the final forensic audit."}
                  {executionMode === ExecutionMode.Surgical && "Pauses after every single prompt block for audit controls."}
                </p>
              </div>

              {/* Forensic Crosscheck Configuration */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-200 font-medium">
                    <input
                      type="checkbox"
                      checked={enableCrosscheck}
                      onChange={(e) => setEnableCrosscheck(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#141822] bg-[#0a0d14]"
                    />
                    <span>Run Forensic Crosscheck & Fact-Check Audit</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Anti-Hallucination
                  </span>
                </div>

                {enableCrosscheck && (
                  <div className="pl-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-mono text-slate-400">Crosscheck Auditor Model</label>
                      <span className="text-[9px] text-slate-500 font-mono">Thinking: HIGH (Audit Rigidity)</span>
                    </div>
                    <select
                      value={crosscheckModel}
                      onChange={(e) => setCrosscheckModel(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-slate-800 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2 text-xs font-sans text-white text-ellipsis"
                    >
                      <option value="default">Default: Use Same Model as Terminal Analysis</option>
                      {(modelOptions || []).map((opt) => {
                        const oName = opt?.name || "";
                        const oDisp = String(opt?.displayName || opt?.name || oName).replace("models/", "");
                        return (
                          <option key={oName} value={oName}>
                            {oDisp}
                          </option>
                        );
                      })}
                      <option value="custom">Custom Model ID...</option>
                    </select>

                    {crosscheckModel === "custom" && (
                      <div className="mt-1">
                        <input
                          type="text"
                          value={customCrosscheckModelId}
                          onChange={(e) => setCustomCrosscheckModelId(e.target.value)}
                          placeholder="e.g. gemini-3.1-pro-preview"
                          className="w-full bg-[#0a0d14] border border-slate-700 focus:border-[#10B981] focus:outline-none rounded-xl px-3.5 py-1.5 text-xs font-mono text-white placeholder-slate-500"
                        />
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Audits mathematical calculations, scans 10-Q/10-K for material omissions, and tests for narrative hallucinations without anchoring bias.
                    </p>
                  </div>
                )}
              </div>

              {/* Portfolio Position override context */}
              <div className="pt-3 border-t border-slate-800/80">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={holdsPosition}
                    onChange={(e) => setHoldsPosition(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 text-teal-600 focus:ring-emerald-500 focus:ring-offset-[#141822] bg-[#0a0d14]"
                  />
                  <span>User Already Holds Position</span>
                </label>

                {holdsPosition && (
                  <div className="grid grid-cols-2 gap-3 mt-3 p-3 rounded-lg bg-[#0a0d14] border border-slate-800/50">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Portfolio Weight %</label>
                      <input
                        type="text"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        className="w-full bg-[#141822] border border-slate-800 focus:outline-none rounded px-2 py-1 text-xs text-white"
                        placeholder="----"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Entry Price ($)</label>
                      <input
                        type="text"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(e.target.value)}
                        className="w-full bg-[#141822] border border-slate-800 focus:outline-none rounded px-2 py-1 text-xs text-white"
                        placeholder="----"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Custom notes / directives */}
              <div className="pt-3 border-t border-slate-800/80">
                <label className="block text-[11px] font-mono text-[#10B981] uppercase mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Strategic Directives / Notes</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-800 focus:border-emerald-600 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 min-h-[70px] resize-none h-20"
                  placeholder="Insert custom notes, memo dates, specific concerns, or rules for the AI to prioritize..."
                />
              </div>
            </form>
          </div>

          {/* Card 2: File Staging & Picker */}
          <div className="shrink-0 bg-[#141822] border border-slate-800/80 rounded-2xl p-5 shadow-lg select-text">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-3.5">
              <UploadCloud className="w-4 h-4 text-[#10B981]" />
              <span>Document Repository</span>
            </h2>

            {/* Document Select Box */}
            <div className="border border-dashed border-slate-800 rounded-xl p-4 bg-[#0a0d14] text-center hover:border-slate-600 transition-colors relative cursor-pointer group">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              />
              <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-slate-200">
                <UploadCloud className="w-8 h-8 text-[#10B981] group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold">Select supplementary report(s) to stage</span>
                <span className="text-[10px] text-slate-500 font-mono">Select single or multiple: MD, CSV, TXT, JSON, PDF</span>
              </div>
            </div>

            {uploading && (
              <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1.5 text-[#10B981]">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Gemini sync...</span>
                  </div>
                  {uploadProgress && (
                    <span>
                      {uploadProgress.current} / {uploadProgress.total} Files
                    </span>
                  )}
                </div>
                {uploadProgress && (
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 truncate max-w-full italic">
                      Uploading: {uploadProgress.name}
                    </div>
                    <div className="w-full h-1.5 bg-[#141822] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-[#10B981] rounded-full transition-all duration-300" 
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Uploaded File List */}
            {session && session.files.length > 0 ? (
              <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-mono text-[#10B981] tracking-wider block">Staged Documents ({session.files.length})</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={handleDownloadAllFiles}
                      className="text-[9px] bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] hover:text-[#34d399] border border-[#10B981]/20 px-2 py-0.5 rounded transition-all duration-200 cursor-pointer font-sans select-none tracking-wider font-semibold active:scale-[0.97]"
                      title="Download all staged files as a ZIP archive"
                    >
                      Download All
                    </button>

                    <button
                      type="button"
                      onClick={handlePurgeAllFiles}
                      className="text-[9px] bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-800/40 px-2 py-0.5 rounded transition-all duration-200 cursor-pointer font-sans select-none tracking-wider font-semibold active:scale-[0.97]"
                      title="Purge all files from workspace"
                    >
                      Purge All
                    </button>
                  </div>
                </div>
                {session.files.map((file) => {
                  return (
                    <div key={file.id} className="flex flex-col gap-1.5 bg-[#0d121c] p-2.5 rounded-xl border border-slate-800/60 text-[11px] hover:border-slate-700/80 transition-all font-sans">
                      <div className="flex justify-between items-start gap-1.5 min-w-0">
                        <div 
                          className="flex items-center gap-1.5 min-w-0 truncate cursor-pointer group/file"
                          onClick={() => setPreviewFile(file)}
                          title="Click to preview document contents"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#10B981] shrink-0 group-hover/file:scale-110 transition-transform" />
                          <span className="font-semibold text-slate-100 group-hover/file:text-[#10B981] truncate transition-colors" title={file.name}>
                            {file.name}
                          </span>
                          {file.name.match(/_([A-Za-z]{3})\.csv$/i) && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded shrink-0">
                              {file.name.match(/_([A-Za-z]{3})\.csv$/i)?.[1].toUpperCase()}
                            </span>
                          )}
                          {file.isAmended && (
                            <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/80 rounded shrink-0" title="Amended SEC filing">
                              AMENDED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Re-fetch single file */}
                          {file.auditCategory && ["10-K", "10-Q", "Financials TTM", "Transcript", "8-K", "DEF 14A"].includes(file.auditCategory) && (
                            <button
                              type="button"
                              onClick={() => handleRefetchSingleFile(file)}
                              disabled={secIngesting || fmpIngesting || transcriptIngesting}
                              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer disabled:opacity-40"
                              title={`Re-fetch latest ${file.auditCategory} from source`}
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${(secIngesting || fmpIngesting || transcriptIngesting) ? "animate-spin" : ""}`} />
                            </button>
                          )}
                          {/* Preview Button */}
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-[#10B981] transition-colors cursor-pointer"
                            title="Preview document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* File Download */}
                          <button
                            onClick={() => handleDownloadFile(file.id, file.name)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-[#10B981] transition-colors cursor-pointer"
                            title="Download file copy"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {/* Quick Delete */}
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete file"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono pl-5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {file.auditCategory && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-sans border ${
                              file.auditCategory === 'Generated Output'
                                ? 'bg-emerald-950/80 text-[#10B981] border-emerald-800/80 font-bold'
                                : 'bg-slate-900 text-slate-400 border-slate-800/80'
                            }`}>
                              {file.auditCategory === 'Generated Output' ? 'LIVE ANALYSIS MD' : file.auditCategory}
                            </span>
                          )}
                          {file.detectedPeriod && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border ${
                              file.periodMatch === 'MISMATCH'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800/80 font-bold'
                                : file.periodMatch === 'MATCH'
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 font-semibold'
                                : 'bg-slate-900 text-slate-400 border-slate-800/80'
                            }`}>
                              {file.detectedPeriod}
                            </span>
                          )}
                          {file.detectedTicker && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border ${
                              file.companyMatch === 'MISMATCH'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800/80 font-bold'
                                : file.companyMatch === 'MATCH'
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 font-semibold'
                                : 'bg-slate-900 text-slate-400 border-slate-800/80'
                            }`}>
                              {file.detectedTicker}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 flex items-center gap-1.5">
                          {file.lineCount ? `${file.lineCount.toLocaleString()} lines • ` : ""}
                          {file.tokens ? `${file.tokens.toLocaleString()} tokens` : `${Math.round(file.size / 1024)} KB`}
                          {(() => {
                            const issue = checkFileSubstance(file);
                            if (issue) {
                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSubstanceIssues([issue]);
                                    setSubstanceModalOpen(true);
                                  }}
                                  className="text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer transition shadow-sm animate-pulse ml-1"
                                  title={`${issue.reason} Click for alert details.`}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                  <span>TRUNCATED / SMALL</span>
                                </button>
                              );
                            }
                            return null;
                          })()}

                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-[11px] text-slate-500 font-mono mt-3">
                No supplementary files staged.
              </div>
            )}

            {/* Auto-Retrieve section in Document Repository */}
            <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#10B981] animate-pulse" />
                <h3 className="text-xs uppercase font-mono font-semibold text-slate-200 tracking-wider">Auto Ingest Pipelines</h3>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                Connect and download official financial grids and filings sequentially without manual copy-paste.
              </p>

              {/* Ingestion feedback */}
              {ingestFeedback && (
                <div className={`p-2.5 rounded-xl text-[10px] leading-relaxed border flex items-start gap-2 ${
                  ingestFeedback.type === 'success' 
                    ? 'bg-emerald-950/20 text-[#10B981] border-emerald-900/40' 
                    : ingestFeedback.type === 'warning'
                    ? 'bg-amber-950/20 text-amber-400 border-amber-900/40'
                    : 'bg-red-950/20 text-red-400 border-red-900/40'
                }`}>
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <p className="flex-1 font-sans">{ingestFeedback.text}</p>
                </div>
              )}

              {/* EDGAR SEC User Agent Identity Section */}
              <div className="space-y-2 bg-[#0c0f15]/50 p-3 rounded-xl border border-slate-800/40">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#10B981] uppercase">
                  <span>SEC EDGAR Identity</span>
                  <span className="text-[9px] text-slate-500">Required by SEC Rate Rules</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-mono text-slate-400 mb-0.5 uppercase">Analyst Name</label>
                    <input
                      type="text"
                      value={secName}
                      onChange={(e) => handleSecNameChange(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-slate-850 focus:outline-none focus:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-sans text-white placeholder-slate-600"
                      placeholder="Ronald Forti"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono text-slate-400 mb-0.5 uppercase">Contact Email</label>
                    <input
                      type="email"
                      value={secEmail}
                      onChange={(e) => handleSecEmailChange(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-slate-850 focus:outline-none focus:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-sans text-white placeholder-slate-600"
                      placeholder="ronforti@gmail.com"
                    />
                  </div>
                </div>
                
                {/* Filings type choices checklist */}
                <div className="pt-2 border-t border-slate-800/40">
                  <span className="block text-[8px] font-mono text-slate-400 mb-1.5 uppercase">Filings Selection Checklist:</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-mono">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={ingest10K}
                        onChange={(e) => setIngest10K(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-800 bg-[#0a0d14] text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <span>10-K (Annual)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={ingest10Q}
                        onChange={(e) => setIngest10Q(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-800 bg-[#0a0d14] text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <span>10-Q (Quarter)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={ingest8K}
                        onChange={(e) => setIngest8K(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-800 bg-[#0a0d14] text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <span>8-K (Critical Event)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={ingestProxy}
                        onChange={(e) => setIngestProxy(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-800 bg-[#0a0d14] text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <span>DEF 14A (Proxy)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {/* MASTER 1-CLICK: PULL ALL DOCUMENTS */}
                <button
                  type="button"
                  onClick={handleRetrieveAllClick}
                  disabled={pullAllLoading || secIngesting || fmpIngesting || transcriptIngesting}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600/25 via-[#10B981]/20 to-teal-600/25 hover:from-emerald-600/35 hover:to-teal-600/35 border border-[#10B981]/50 text-left px-3 text-xs text-white rounded-xl active:scale-[0.99] transition-all flex items-center justify-between group disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-sans shadow-md shadow-[#10B981]/10 mb-0.5"
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <div className="p-1 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>Pull All Documents</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-[#10B981] text-[#0d0f14] rounded-full font-mono font-bold uppercase tracking-wider">1-Click</span>
                      </div>
                      <div className="text-[9px] text-emerald-400 font-mono truncate">
                        {pullAllLoading ? pullAllProgress : "Auto-fetches SEC 10-K/10-Q + Financials CSV + Transcript in 1 shot"}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 pl-1.5">
                    {pullAllLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 text-[#10B981] animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-[#10B981] group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                </button>

                {/* DIRECT QUICK-ACTION: PULL MISSING ONLY */}
                {auditChecklist.some(c => c.status === "CONFIRMED") && auditChecklist.some(c => c.status === "MISSING") && (
                  <button
                    type="button"
                    onClick={() => handleRetrieveAllDocuments(true)}
                    disabled={pullAllLoading || secIngesting || fmpIngesting || transcriptIngesting}
                    className="w-full py-2 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 text-left px-3 text-xs text-emerald-300 rounded-xl active:scale-[0.99] transition-all flex items-center justify-between group disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-sans mb-1"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                          <span>Pull Missing Files Only</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-full font-mono font-bold">
                            {auditChecklist.filter(c => c.status === "MISSING").length} Missing
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono truncate">
                          Skips already confirmed filings to save time & API quota
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">Fast Sync</span>
                  </button>
                )}

                {/* 1. SEC FILINGS */}
                <button
                  type="button"
                  onClick={handleRetrieveSec}
                  disabled={secIngesting}
                  className="w-full py-2 bg-[#0c0f15]/40 border border-slate-800/80 hover:border-emerald-600/40 text-left px-3 text-xs text-white rounded-xl hover:bg-slate-850 active:scale-[0.99] transition-all flex items-center justify-between group disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-sans"
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <FileText className="w-4 h-4 text-[#10B981] shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-slate-200">Pull SEC Filings (EDGAR)</div>
                      <div className="text-[9px] text-slate-500 font-mono truncate">Downloads official files to staged Markdown context</div>
                    </div>
                  </div>
                  <div className="shrink-0 pl-1.5">
                    {secIngesting ? (
                      <RefreshCw className="w-3.5 h-3.5 text-[#10B981] animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#10B981]" />
                    )}
                  </div>
                </button>

                {/* 2. FMP FINANCIALS */}
                <button
                  type="button"
                  onClick={handleRetrieveFmp}
                  disabled={fmpIngesting}
                  className="w-full py-2 bg-[#0c0f15]/40 border border-slate-800/80 hover:border-emerald-600/40 text-left px-3 text-xs text-white rounded-xl hover:bg-slate-850 active:scale-[0.99] transition-all flex items-center justify-between group disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-sans"
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <FileText className="w-4 h-4 text-[#10B981] shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-slate-200">Recover Financials (FMP TTM CSV)</div>
                      <div className="text-[9px] text-slate-500 font-mono truncate">Aggregating quarterly records to Trailing 12M matrix</div>
                    </div>
                  </div>
                  <div className="shrink-0 pl-1.5">
                    {fmpIngesting ? (
                      <RefreshCw className="w-3.5 h-3.5 text-[#10B981] animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#10B981]" />
                    )}
                  </div>
                </button>

                {/* 3. VERBATIM CALL TRANSCRIPT */}
                <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Transcript Source
                    </span>
                    <div className="inline-flex rounded-lg bg-[#0a0d14] p-0.5 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleTranscriptProviderChange("auto")}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded-md transition ${transcriptProvider === "auto" ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40" : "text-slate-400 hover:text-slate-200"}`}
                        title="Auto: TIKR (S&P Capital IQ) primary with automatic Stock Analysis fallback"
                      >
                        Auto (TIKR ➔ SA)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTranscriptProviderChange("tikr")}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded-md transition ${transcriptProvider === "tikr" ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40" : "text-slate-400 hover:text-slate-200"}`}
                        title="TIKR Terminal (S&P Capital IQ) Only"
                      >
                        TIKR Only
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTranscriptProviderChange("stockanalysis")}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded-md transition ${transcriptProvider === "stockanalysis" ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40" : "text-slate-400 hover:text-slate-200"}`}
                        title="Stock Analysis Only"
                      >
                        Stock Analysis
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRetrieveTranscript}
                    disabled={transcriptIngesting}
                    className="w-full py-2 bg-[#0c0f15]/40 border border-slate-800/80 hover:border-emerald-600/40 text-left px-3 text-xs text-white rounded-xl hover:bg-slate-850 active:scale-[0.99] transition-all flex items-center justify-between group disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-sans"
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                      <FileText className="w-4 h-4 text-[#10B981] shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-slate-200">
                          Pull Transcript ({transcriptProvider === "auto" ? "Auto: TIKR ➔ Stock Analysis" : transcriptProvider === "tikr" ? "TIKR (Capital IQ)" : "Stock Analysis"})
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono truncate">
                          {transcriptProvider === "auto" 
                            ? "TIKR (S&P Capital IQ) verbatim dialogue with Stock Analysis fallback" 
                            : transcriptProvider === "tikr" 
                              ? "Verbatim dialogue direct from S&P Capital IQ via TIKR" 
                              : "Verbatim dialogue direct from Stock Analysis"}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 pl-1.5">
                      {transcriptIngesting ? (
                        <RefreshCw className="w-3.5 h-3.5 text-[#10B981] animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#10B981]" />
                      )}
                    </div>
                  </button>
                </div>

                {/* 4. COMPETITOR MOAT & VALUATION RADAR */}
                {(() => {
                  const hasRadar = Boolean(
                    (competitorDossier && competitorDossier.peers.length > 0) ||
                    (session?.competitorRadar && session.competitorRadar.peers.length > 0) ||
                    session?.files?.some(f => f.name.includes("_Competitor_Radar.md"))
                  );
                  const peerCount = competitorDossier?.peers?.length || session?.competitorRadar?.peers?.length || 0;

                  return (
                    <div className="pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => handleRefreshCompetitorRadar()}
                        disabled={isRefreshingRadar || !ticker}
                        className={`w-full py-2.5 text-left px-3 text-xs rounded-xl active:scale-[0.99] transition-all flex items-center justify-between group disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-sans ${
                          hasRadar
                            ? "bg-[#0c0f15]/70 border border-emerald-500/30 hover:border-emerald-500/50 text-white"
                            : "bg-gradient-to-r from-cyan-950/40 via-[#0d1424] to-cyan-950/30 border border-cyan-500/60 hover:border-cyan-400 text-white shadow-md shadow-cyan-950/30"
                        }`}
                        title="Harvest and stage Competitor Radar from 10-K, Proxy, Search Grounding, and FMP"
                      >
                        <div className="flex items-center gap-2.5 truncate min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${hasRadar ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/50" : "bg-cyan-950/80 text-cyan-300 border border-cyan-600/60"}`}>
                            <Radar className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                              <span>4. Harvest Competitor Radar</span>
                              {hasRadar ? (
                                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded font-mono font-bold flex items-center gap-1">
                                  ✓ ${peerCount} Peers Staged
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-mono font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                  Action Required
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono truncate">
                              10-K Item 1 + DEF 14A Proxy + Search Grounding + FMP Verification
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 pl-2">
                          {isRefreshingRadar ? (
                            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                          ) : hasRadar ? (
                            <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 flex items-center gap-1">
                              Re-Harvest <RefreshCw className="w-3 h-3 text-slate-500 group-hover:text-cyan-300" />
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-cyan-300 group-hover:text-cyan-200 flex items-center gap-1 bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/40 shadow-sm">
                              Harvest Now <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Card 3: Filing Preflight Audit */}
          <div className="shrink-0 bg-[#141822] border border-slate-800/80 rounded-2xl p-5 shadow-lg select-text">
            {(() => {
              const hasForeignFiling = (session?.files || []).some(f => {
                const n = f.name.toLowerCase();
                return n.includes("20-f") || n.includes("20f") || n.includes("40-f") || n.includes("40f") || n.includes("6-k") || n.includes("6k");
              }) || auditChecklist.some(c => c.isForeignEquivalent);

              return (
                <>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Mandatory Pre-Flight Audit</span>
                    </h2>
                    {hasForeignFiling && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-cyan-950/50 text-cyan-300 border border-cyan-700/60 shrink-0">
                        <Globe className="w-2.5 h-2.5 text-cyan-400" />
                        <span>FPI (20-F / 6-K)</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mb-3.5 font-sans leading-relaxed">
                    Verifies presence of critical SEC and market filings before launching analysis. Fully adapts to both US Domestic (10-K, 10-Q) and Foreign Private Issuer (20-F, 40-F, 6-K) frameworks.
                  </p>
                </>
              );
            })()}

            {/* Document Integrity Alert Banner */}
            {integrityReport && integrityReport.hasMismatches && (
              <div className="mb-4 p-3.5 bg-rose-950/30 border border-rose-800/60 rounded-xl text-xs text-rose-200 leading-relaxed space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-400 font-mono text-[11px]">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>DOCUMENT INTEGRITY MISMATCH</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIntegrityModalOpen(true)}
                    className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded text-[10px] font-mono font-bold cursor-pointer transition"
                  >
                    Review & Fix
                  </button>
                </div>
                <p className="text-[10px] text-rose-200/90 font-sans leading-normal">
                  One or more files do not match target <strong className="font-mono text-white">{session?.config?.ticker || ticker}</strong> or target period <strong className="font-mono text-white">{session?.config?.period || period}</strong>.
                </p>
                <ul className="list-disc pl-4 text-[9px] text-rose-300 space-y-0.5 font-mono">
                  {integrityReport.mismatches.slice(0, 2).map((m, i) => (
                    <li key={i}>{m.issue}: Expected {m.expected}, detected {m.actual}</li>
                  ))}
                  {integrityReport.mismatches.length > 2 && (
                    <li>+{integrityReport.mismatches.length - 2} more discrepancies</li>
                  )}
                </ul>
              </div>
            )}

            {/* Ticker Mismatch Alerts (Legacy Heuristic) */}
            {tickerWarnings.length > 0 && (!integrityReport || !integrityReport.hasMismatches) && (
              <div className="mb-4 p-3 bg-yellow-950/30 border border-yellow-800/60 rounded-xl text-[10px] text-yellow-200 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1 font-semibold text-yellow-400 font-sans">
                  <AlertTriangle className="w-3.5 h-3.5" /> 
                  <span>POTENTIAL TICKER MISMATCH</span>
                </div>
                {tickerWarnings.map((warn, i) => (
                  <p key={i}>{warn}</p>
                ))}
              </div>
            )}

            {/* Checklist Matrix */}
            <div className="space-y-3">
              {auditChecklist.filter(c => c.category !== "Competitor Radar").map((check) => {
                const checked = check.status === "CONFIRMED";
                const isForeignMatched = check.isForeignEquivalent || check.matchedFiles?.some(fn => {
                  const n = fn.toLowerCase();
                  return n.includes("20-f") || n.includes("20f") || n.includes("40-f") || n.includes("40f") || n.includes("6-k") || n.includes("6k");
                });

                const displayLabel = check.label || (
                  check.category === "10-K" ? "Annual Report (10-K / 20-F / 40-F)" :
                  check.category === "10-Q" ? "Quarterly Report (10-Q / 6-K)" :
                  check.category === "Transcript" ? "Earnings Call Transcript" :
                  check.category === "Financials TTM" ? "Financial Statements (TTM / 10-Yr)" :
                  check.category
                );

                const displayDesc = check.description || (
                  check.category === "10-K" ? "Form 10-K (Domestic) or Form 20-F / 40-F (Foreign Issuer)" :
                  check.category === "10-Q" ? "Form 10-Q (Domestic) or Form 6-K Interim (Foreign Issuer)" :
                  check.category === "Transcript" ? "Quarterly management earnings call transcript" :
                  check.category === "Financials TTM" ? "10-Yr historical financials or CSV statements" :
                  ""
                );

                return (
                  <div key={check.category} className="bg-[#0b0e15]/70 border border-slate-800/80 rounded-xl p-2.5 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-200 font-semibold text-xs">{displayLabel}</span>
                          {isForeignMatched && (
                            <span className="text-[8px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.2 rounded font-mono">
                              FPI Match
                            </span>
                          )}
                        </div>
                        {displayDesc && (
                          <div className="text-[9px] text-slate-500 font-sans mt-0.5">
                            {displayDesc}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {checked ? (
                          check.integrityStatus === 'MISMATCH' ? (
                            <div 
                              onClick={() => setIntegrityModalOpen(true)}
                              className="flex items-center gap-1 bg-rose-950/40 text-rose-300 px-2 py-0.5 rounded-full border border-rose-800/60 text-[10px] font-semibold cursor-pointer hover:bg-rose-900/40 transition" 
                              title={check.integrityDetails?.join(" | ") || "Mismatch detected"}
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>Mismatch</span>
                            </div>
                          ) : check.substanceStatus === 'TRUNCATED' ? (
                            <div 
                              onClick={() => {
                                const matchedF = session?.files?.find(f => check.matchedFiles?.includes(f.name));
                                const issue = matchedF ? checkFileSubstance(matchedF) : null;
                                if (issue) {
                                  setSubstanceIssues([issue]);
                                  setSubstanceModalOpen(true);
                                }
                              }}
                              className="flex items-center gap-1 bg-amber-950/70 text-amber-300 px-2 py-0.5 rounded-full border border-amber-600/70 text-[10px] font-bold cursor-pointer hover:bg-amber-900/60 transition shadow-sm animate-pulse"
                              title={check.substanceReason || "File appears suspiciously small or truncated. Click to review."}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>Truncated / Small</span>
                            </div>
                          ) : check.isCoveredBy8K ? (
                            <div 
                              className="flex items-center gap-1 bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700/60 text-[10px] font-medium" 
                              title="Form 10-Q pending SEC filing; interim quarterly results covered by Form 8-K (Item 2.02 Earnings Release)"
                            >
                              <ShieldCheck className="w-3 h-3 text-cyan-400" />
                              <span>Covered by 8-K (Interim)</span>
                            </div>
                          ) : check.integrityStatus === 'VALID' ? (
                            <div className="flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/30 text-[10px] font-medium" title={check.integrityDetails?.join(" | ") || "Verified"}>
                              <Check className="w-3 h-3" />
                              <span>{check.detectedTicker || "Verified"} {check.detectedPeriod ? `• ${check.detectedPeriod}` : ""}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-amber-950/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-900/40 text-[10px] font-medium" title={check.integrityDetails?.join(" | ") || "Confirmed"}>
                              <Check className="w-3 h-3 text-amber-400" />
                              <span>Confirmed</span>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {check.category === "Prior Dossier" && (
                              <button
                                type="button"
                                onClick={() => discoverPriorDossier()}
                                disabled={priorDossierSearching}
                                className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/50 transition cursor-pointer flex items-center gap-1"
                                title="Search local downloads and dossiers directory for previous dossier matching ticker"
                              >
                                {priorDossierSearching ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Layers className="w-2.5 h-2.5 text-emerald-400" />}
                                <span>{priorDossierSearching ? "Searching..." : "Auto-Discover"}</span>
                              </button>
                            )}
                            <div 
                              onClick={() => setMissingModalOpen(true)}
                              className="flex items-center gap-1 bg-red-950/20 text-red-400 px-2 py-0.5 rounded-full border border-red-900/40 text-[10px] font-semibold cursor-pointer hover:bg-red-900/30 transition"
                              title="Click to view and stage missing required document"
                            >
                              <span>{check.optional ? "Optional" : "Missing"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Matched files preview */}
                    {checked && check.matchedFiles && check.matchedFiles.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-800/50 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">Source:</span>
                        {check.matchedFiles.slice(0, 3).map((fn, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1 bg-slate-900/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 max-w-[220px]">
                            <span className="text-[9px] font-mono truncate" title={fn}>{fn}</span>
                            <button
                              type="button"
                              onClick={() => setPreviewFile({ id: fn, name: fn, auditCategory: check.category })}
                              className="p-0.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded cursor-pointer transition shrink-0"
                              title={`Preview ${fn}`}
                            >
                              <Eye className="w-2.5 h-2.5 text-cyan-400" />
                            </button>
                          </div>
                        ))}
                        {check.matchedFiles.length > 3 && (
                          <span className="text-[8px] text-slate-500 font-mono">+{check.matchedFiles.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Dedicated Pre-Flight Competitor Radar Check Row */}
              {(() => {
                const hasRadar = Boolean(
                  session?.competitorRadar || 
                  competitorDossier || 
                  session?.files?.some(f => f.name.includes("_Competitor_Radar.md"))
                );
                const activeRadar = competitorDossier || session?.competitorRadar;
                const peersCount = activeRadar?.peers?.length || 0;
                const radarFileName = session?.files?.find(f => f.name.includes("_Competitor_Radar.md"))?.name || `${ticker || session?.config?.ticker || "Company"}_Competitor_Radar.md`;

                return (
                  <div className={`rounded-xl p-2.5 transition-all ${
                    hasRadar && peersCount > 0
                      ? "bg-[#0b0e15]/70 border border-slate-800/80"
                      : "bg-amber-950/15 border border-amber-500/50 shadow-sm shadow-amber-950/20"
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-200 font-semibold text-xs">Competitor Moat & Valuation Radar</span>
                          {hasRadar && peersCount > 0 ? (
                            <span className="text-[8px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.2 rounded font-mono font-bold">
                              {peersCount} Peers
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded">
                              MISSING
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-slate-500 font-sans mt-0.5">
                          10-K Item 1 + DEF 14A Proxy + Search Grounding + FMP Verification
                        </div>
                      </div>

                      <div className="shrink-0">
                        {hasRadar && peersCount > 0 ? (
                          <div 
                            onClick={() => setCompetitorRadarOpen(true)}
                            className="flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/30 text-[10px] font-medium cursor-pointer hover:bg-[#10B981]/20 transition"
                            title="Click to view and edit verified competitor radar comps"
                          >
                            <Check className="w-3 h-3" />
                            <span>Verified ({peersCount} Peers)</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isRefreshingRadar || !ticker}
                            onClick={() => handleRefreshCompetitorRadar()}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-950/50 cursor-pointer disabled:opacity-50 active:scale-95 animate-pulse"
                            title="Harvest and stage Competitor Radar now"
                          >
                            {isRefreshingRadar ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                            ) : (
                              <Radar className="w-3.5 h-3.5 text-slate-950" />
                            )}
                            <span>{isRefreshingRadar ? "Harvesting Radar..." : "Harvest Competitor Radar"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Verified Peers Badges & Radar Preview */}
                    {hasRadar && activeRadar && activeRadar.peers && activeRadar.peers.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-800/50 flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">Peers:</span>
                          {activeRadar.peers.map((p, idx) => (
                            <span key={idx} className="inline-flex items-center px-1.5 py-0.2 rounded bg-slate-900 text-[9px] font-mono font-bold text-cyan-300 border border-slate-700">
                              {p.ticker}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewFile({ id: radarFileName, name: radarFileName, auditCategory: "Supplementary" })}
                            className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded cursor-pointer transition"
                            title="Preview Competitor Radar Markdown"
                          >
                            <Eye className="w-3 h-3 text-cyan-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompetitorRadarOpen(true)}
                            className="text-[9px] font-mono text-cyan-400 hover:underline cursor-pointer pl-1"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Real-time Token Monitoring Dashboard */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#10B981] uppercase tracking-wider">Dynamic Token Audit</span>
                <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">Live telemetry</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#0a0d14] border border-slate-800 p-2.5 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[9px] font-sans text-slate-400 font-medium">Staged Materials</span>
                  <span className="text-sm font-semibold font-mono text-white">
                    {session?.uploadedTokens !== undefined ? session.uploadedTokens.toLocaleString() : "0"}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500">Staged file tokens</span>
                </div>
                <div className="bg-[#0a0d14] border border-slate-800 p-2.5 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[9px] font-sans text-slate-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse shrink-0"></span>
                    <span>Live Total Context</span>
                  </span>
                  <span className="text-sm font-semibold font-mono text-[#10B981]">
                    {session?.liveTokensUsed !== undefined ? session.liveTokensUsed.toLocaleString() : "0"}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500">Cumulative conversation</span>
                </div>
              </div>
            </div>

            {/* Overall status bar */}
            <div className="mt-5 pt-3.5 border-t border-slate-800/80 space-y-3">
              {session?.auditPassed ? (
                <div className="bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl text-center text-xs text-[#10B981] font-semibold">
                  ✔ Preflight Audit Succeeded! Ready to generate.
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 p-2.5 rounded-xl text-center text-[11px] text-slate-400 italic">
                  Complete staged checklist to satisfy preflight rules.
                </div>
              )}

              <button
                type="button"
                onClick={() => handleInitialize()}
                disabled={loading}
                className="w-full py-3 bg-[#10B981] text-[#0d0f14] hover:bg-[#34D399] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-[#10B981]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                <span>{loading ? "Configuring Engine..." : "Initialize Terminal State"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* === Right Grid: Analysis Console Log (8 Columns) === */}
        <main className={`md:col-span-8 flex-col min-h-0 bg-[#141822] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden ${activeMobileTab === 'console' ? 'flex' : 'hidden md:flex'}`}>
          
          {/* Top Panel Console Info */}
          <div className="bg-[#191e2b] px-5 py-4 border-b border-slate-800 flex justify-between items-center gap-4 shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full relative">
                {session?.status === "running" ? (
                  <>
                    <span className="absolute inset-0 bg-[#10B981] rounded-full animate-ping opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
                  </>
                ) : session?.status === "retrying" ? (
                  <>
                    <span className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                  </>
                ) : session?.status === "paused" ? (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
                ) : session?.status === "completed" ? (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 animate-pulse"></span>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500"></span>
                )}
              </div>

              <div>
                <div className="text-xs uppercase font-mono text-slate-400 tracking-wider">Core Status</div>
                <div className="text-sm font-semibold text-white font-sans">
                  {session?.status === "running" && `Analyst Computing - Executing Step ${session.activeStepIndex + 1}/${MASTER_PROMPTS.length}...`}
                  {session?.status === "retrying" && `Auto-Resume Cooldown: Retrying Step ${session.activeStepIndex + 1} in ${retryCountdown}s (${session.retryState?.attempt || 1}/${session.retryState?.maxAttempts || 3})`}
                  {session?.status === "paused" && `Paused on human-in-the-loop audit gate (Step ${session.activeStepIndex + 1})`}
                  {session?.status === "completed" && "Structural Analysis 100% Finalized."}
                  {session?.status === "idle" && "Analyst Engine Offline. Awaiting configuration."}
                  {session?.status === "failed" && "Terminal Crashed. Resolve error logs."}
                </div>
              </div>
            </div>

            {/* Progress calculations */}
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-mono text-[#10B981] mb-1">COMPLETED: {completedCount} / {MASTER_PROMPTS.length} PROMPTS</div>
              <div className="w-24 md:w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-[#10B981] rounded-full transition-all duration-500" 
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Gemini Flex Gatekeeper Active Monitoring HUD Card */}
          {(flexWatcher?.isWaiting || flexEngaging) && (
            <div className="m-4 p-4 bg-gradient-to-r from-amber-950/40 via-[#181e2b] to-slate-900 border border-amber-500/50 rounded-2xl shadow-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/40 rounded-xl">
                    <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-mono font-bold text-amber-300 uppercase tracking-wider">
                        Gemini Flex Gatekeeper Active
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold animate-pulse">
                        MONITORING CLUSTER
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Target: <strong className="text-white font-mono">{flexWatcher.target === 'batch' ? 'Batch Queue Pipeline' : `${session?.config?.ticker || ticker} (${session?.config?.period || period})`}</strong> • Model: <code className="text-emerald-400 font-mono">{flexWatcher.model.replace('models/', '')}</code> (Zero Downgrades)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchFlexStatus(true)}
                    disabled={probingFlex}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-750 rounded-xl text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5"
                    title="Force an immediate 1-token canary probe right now"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${probingFlex ? 'animate-spin' : ''}`} />
                    <span>Probe Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelFlexWait}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                  >
                    Cancel Gatekeeper
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-[#0e121a] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Cluster Status</span>
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    503 Saturated (High Demand)
                  </span>
                </div>
                <div className="bg-[#0e121a] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Next Canary Probe</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                    in {flexWatcher.nextCheckInSeconds}s
                  </span>
                </div>
                <div className="bg-[#0e121a] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Probes Executed</span>
                  <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 block">
                    Attempt #{flexWatcher.attempts}
                  </span>
                </div>
                <div className="bg-[#0e121a] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Action on HTTP 200</span>
                  <span className="text-xs font-mono font-bold text-cyan-400 mt-0.5 block truncate" title="Auto-launch pipeline + notify Telegram and Email">
                    Auto-Launch + Alert
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                The Gatekeeper sends a lightweight 1-token probe (<code className="text-slate-300 font-mono">&lt;$0.000001</code>) every 45s. As soon as Google's Flex cluster opens with HTTP 200, the terminal automatically launches execution and sends you a Telegram and Email notification.
              </p>
            </div>
          )}

          {/* Core scrollable console view */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-[#0c0e15] text-slate-300">
            {session === null || !session.config ? (
              // Idle state: Empty terminal banner
              <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none max-w-lg mx-auto">
                <Cpu className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
                <h3 className="text-lg font-semibold text-gray-200">System Ready for Boot</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  The terminal is currently offline. Complete your local ticker settings checklist on the left and click <strong>Initialize Terminal State</strong> to spin up the investment session. Make sure to stage your 10-K, 10-Q and Financial CSV files in the Staging repository!
                </p>
                <div className="mt-6 p-4 bg-[#141822] rounded-xl border border-slate-800 text-left space-y-2 text-[11px] font-mono w-full text-slate-400 leading-relaxed">
                  <div className="text-[#10B981] font-semibold">RECOMMENDED FILENAMES SYNONYMS:</div>
                  <div>- <strong className="text-white">"AAPL_10K.txt"</strong> or <strong className="text-white">"AAPL_10-K.csv"</strong></div>
                  <div>- <strong className="text-white">"AAPL_10Q.txt"</strong> or <strong className="text-white">"AAPL_10-Q.csv"</strong></div>
                  <div>- <strong className="text-white">"AAPL_Earnings_Transcript.txt"</strong></div>
                  <div>- <strong className="text-white">"AAPL_Financials_TTM.csv"</strong> (Essential source)</div>
                </div>
              </div>
            ) : session.history.length === 0 && session.status === "idle" ? (
              // Booted but no prompt ran yet
              <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none max-w-lg mx-auto">
                <Sparkles className="w-12 h-12 text-[#10B981] mb-4 animate-pulse" />
                <h3 className="text-base font-semibold text-gray-100">Analytical Core successfully loaded!</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  A virtual session is initialized for <strong className="text-white font-semibold">{session.config.ticker} {session.config.period}</strong> using {session.config.model.replace("models/", "")} {session.config.serviceTier === 'flex' ? <span className="text-emerald-400 font-mono text-[10px] ml-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">FLEX (50% OFF)</span> : null}.
                </p>

                {!session.auditPassed && (
                  <div className="mt-4 p-3 bg-yellow-950/20 border border-yellow-800/40 rounded-xl text-xs text-yellow-300 leading-relaxed">
                    <strong>Caution:</strong> Some of your mandatory pre-flight audited files matches are still missing. You can still force-boot the Analyst terminal, but the model may have gaps in math precision without the Financial CSV.
                  </div>
                )}
                
                {session.files.some(f => f.size < 20000 && (f.auditCategory === '10-K' || f.auditCategory === '10-Q' || f.auditCategory === 'Transcript')) && (
                  <div className="mt-4 p-3 bg-red-950/20 border border-red-800/40 rounded-xl text-xs text-red-300 leading-relaxed flex items-start gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Warning: Suspiciously Small Staged Files Detected.</strong> 
                      <p className="mt-1 opacity-90">One or more of your staged official filings (10-K, 10-Q, or Transcript) are very small (under 20 KB). This typically means the SEC extraction only grabbed the <strong>Cover & TOC</strong> instead of the full document content, or the transcript was empty.</p>
                      <p className="mt-1 opacity-90"><strong>Recommendation:</strong> Verify the document contents before launching the analysis to avoid spending tokens on a hollow filing.</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => handleRunSteps()}
                    disabled={flexEngaging || runStarting || flexWatcher?.isWaiting || session.status === 'running' || session.status === 'retrying'}
                    className="px-6 py-3 bg-[#10B981] text-[#0d0f14] hover:bg-[#34D399] disabled:opacity-50 disabled:pointer-events-none rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-[#10B981]/10 cursor-pointer flex items-center gap-2"
                  >
                    {runStarting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Booting Analytical Core...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Enact Analyst Terminal Session</span>
                      </>
                    )}
                  </button>

                  {session.config.serviceTier === 'flex' && (
                    <button
                      type="button"
                      onClick={() => handleQueueForFlex('single')}
                      disabled={flexEngaging || runStarting || flexWatcher?.isWaiting || session.status === 'running' || session.status === 'retrying'}
                      className="px-5 py-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 disabled:opacity-50 disabled:pointer-events-none border border-amber-500/40 rounded-xl font-mono font-bold text-sm transition cursor-pointer flex items-center gap-2"
                      title="Monitors Flex cluster in background and auto-launches the moment HTTP 200 clearance is verified"
                    >
                      {flexEngaging ? (
                        <>
                          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                          <span>Engaging Gatekeeper...</span>
                        </>
                      ) : flexWatcher?.isWaiting ? (
                        <>
                          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                          <span>Gatekeeper Active (Attempt #{flexWatcher.attempts})</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span>Queue for Next Flex Opening</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Active chat feed log
              <div className="space-y-6 select-text max-w-3xl mx-auto">
                {session.history.length > 0 && (
                  <div className="flex items-center justify-between pb-2.5 mb-1 border-b border-slate-800/80 text-xs select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Analytical Cockpit Log</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800/90 text-emerald-400 font-mono text-[10px] border border-slate-700/50">
                        {session.history.filter(m => m.role === 'model').length} Step Outputs
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandAllSteps(prev => !prev)}
                      className="px-2.5 py-1 bg-[#161c28] hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-lg font-mono text-[11px] transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <span>{expandAllSteps ? "Collapse Completed Steps" : "Expand All Steps"}</span>
                      <span className="text-[#10B981]">{expandAllSteps ? "▴" : "▾"}</span>
                    </button>
                  </div>
                )}
                {session.history.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  const isSystem = msg.role === 'system';
                  const isCrosscheckMsg = msg.type === 'crosscheck' || (msg.index !== undefined && msg.index >= MASTER_PROMPTS.length);
                  
                  if (isSystem) {
                    return (
                      <div key={index} className="flex justify-center my-3 select-none">
                        <span className="text-xs bg-red-950/30 text-red-400 px-3 py-1.5 rounded-full border border-red-900/40 font-mono flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{msg.text}</span>
                        </span>
                      </div>
                    );
                  }

                  const prevMsg = index > 0 ? session.history[index - 1] : null;
                  const isStep2Model = !isUser && prevMsg?.role === 'user' && prevMsg?.type === 'master_prompt' && (prevMsg?.index === 1);
                  const activeRadar = competitorDossier || session.competitorRadar;

                  return (
                    <React.Fragment key={index}>
                      <div 
                        className={`flex gap-4 p-5 rounded-2xl border transition-all ${
                          isUser 
                            ? "bg-[#141822]/40 border-slate-800/60 ml-12" 
                            : isCrosscheckMsg
                              ? "bg-[#131a26] border-amber-500/35 shadow-sm shadow-amber-950/20"
                              : "bg-[#131722] border-slate-800"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="shrink-0 select-none">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-semibold text-xs border ${
                            isUser 
                              ? "bg-slate-800 text-[#10B981] border-slate-700/60" 
                              : isCrosscheckMsg
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                                : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
                          }`}>
                            {isUser ? "USR" : isCrosscheckMsg ? "AUD" : "AI"}
                          </div>
                        </div>

                        {/* Msg Body */}
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center mb-1 text-xs select-none">
                            <span className="font-semibold text-gray-200">
                              {isUser 
                                ? "Human Analyst" 
                                : isCrosscheckMsg
                                  ? (
                                    <span className="text-amber-300 flex items-center gap-1.5">
                                      <span>⚖️ Forensic Financial Auditor</span>
                                      <span className="text-[10px] font-mono text-slate-400 font-normal">
                                        ({(session.config?.crosscheckModel && session.config.crosscheckModel !== "default" ? session.config.crosscheckModel : session.config?.model || "").replace("models/", "")})
                                      </span>
                                    </span>
                                  )
                                  : `Senior Invest Analyst (${(msg.model || session.config?.model || "").replace("models/", "")})`}
                            </span>
                            <span className="text-gray-500 font-mono text-[10px]">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>

                          {/* Title indicator for Crosscheck or Master prompts */}
                          {isUser && msg.type === "crosscheck" && (
                            <div className="mb-2 text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>⚖️ Step {MASTER_PROMPTS.length + 1}: Forensic Audit & Fact-Check Crosscheck</span>
                            </div>
                          )}
                          {isUser && msg.type === "master_prompt" && msg.index !== undefined && (
                            <div className="mb-2 text-xs font-mono text-[#10B981] uppercase tracking-wider">
                              Sequential Prompt {msg.index + 1}: {MASTER_PROMPTS[msg.index]?.title || session.steps[msg.index]?.title}
                            </div>
                          )}

                          <div className="mt-1">
                            {isUser ? (
                              (msg.type === "master_prompt" || msg.type === "crosscheck") ? (
                                <CollapsiblePrompt text={msg.text} />
                              ) : (
                                <p className="text-gray-300 font-sans text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              )
                            ) : (() => {
                              const isShortMsg = msg.text.length < 400;
                              const isLatestRunning = session.status === "running" && index >= session.history.length - 2;
                              const isExpanded = expandAllSteps || isShortMsg || isLatestRunning || !!expandedStepIndices[index];

                              if (!isExpanded) {
                                return (
                                  <div className="mt-2 bg-[#0c1017] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                      <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                                      <span className="text-xs text-slate-400 font-sans truncate">
                                        Completed Analysis Step ({msg.text.length.toLocaleString()} characters) • Tables & Metrics compiled
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => toggleStepExpanded(index)}
                                      className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[#10B981] border border-slate-700/60 transition cursor-pointer active:scale-95 shrink-0 flex items-center gap-1"
                                    >
                                      <span>Inspect Step</span>
                                      <span>▾</span>
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div>
                                  {!isShortMsg && !isLatestRunning && (
                                    <div className="flex justify-end mb-1">
                                      <button
                                        type="button"
                                        onClick={() => toggleStepExpanded(index)}
                                        className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition cursor-pointer flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-800"
                                      >
                                        <span>Collapse Step</span>
                                        <span>▴</span>
                                      </button>
                                    </div>
                                  )}
                                  <MarkdownView content={msg.text} price={typeof price === 'number' ? price : (parseFloat(price) || undefined)} />
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Embedded Competitor Moat & Valuation Radar Card right after Step 2 */}
                      {isStep2Model && activeRadar && (
                        <div className="p-5 rounded-2xl bg-[#0b1320] border border-cyan-500/30 shadow-lg shadow-cyan-950/20 my-2">
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-cyan-900/40">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
                                <Radar className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                                  <span>Competitor Moat & Valuation Radar</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-mono lowercase">
                                    {activeRadar.archetype}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
                                  Target: <span className="font-semibold text-slate-200">{activeRadar.targetTicker}</span> • Verified Peers ({activeRadar.peers.length}): <span className="font-semibold text-slate-200">{activeRadar.peers.map(p => p.ticker).join(', ')}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCompetitorRadarOpen(true)}
                              className="text-xs px-3.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1.5 font-medium shadow-sm cursor-pointer"
                            >
                              <Radar className="w-3.5 h-3.5" />
                              <span>Open Radar Modal</span>
                            </button>
                          </div>
                          <div className="prose prose-invert max-w-none text-xs leading-relaxed overflow-x-auto">
                            <MarkdownView content={activeRadar.markdownSummary} price={typeof price === 'number' ? price : (parseFloat(price) || undefined)} />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Progress Loader inside Feed */}
                {session.status === "running" && (
                  <div className="flex gap-4 p-5 rounded-2xl bg-[#141822]/40 border border-slate-800 text-slate-300 ml-12 animate-pulse">
                    <div className="shrink-0 select-none">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-950/20 text-[#10B981] border border-[#10B981]/30">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs uppercase font-mono text-slate-500 mb-1">Analytic State Working</div>
                      <p className="text-xs text-[#10B981] font-semibold">
                        Gemini computing Step {session.activeStepIndex + 1}: "{session.steps[session.activeStepIndex]?.title}"
                      </p>
                      <div className="mt-2 h-1 bg-slate-900 rounded-full overflow-hidden w-2/3">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-[#10B981] rounded-full animate-marquee"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-Resume Cooldown Banner inside Feed */}
                {session.status === "retrying" && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-950/25 border border-amber-500/40 text-amber-200 ml-12 shadow-lg shadow-amber-950/20">
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                        <RotateCcw className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase font-mono tracking-wider text-amber-400 font-bold flex items-center gap-2">
                          <span>Auto-Resume Cooldown Active</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-600/40 text-amber-200">
                            Attempt {session.retryState?.attempt || 1} of {session.retryState?.maxAttempts || 3}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 truncate">
                          Transient API demand spike on Step {(session.retryState?.stepIndex ?? session.activeStepIndex) + 1}: "{session.steps[session.retryState?.stepIndex ?? session.activeStepIndex]?.title}". Prompt cache preserved.
                        </p>
                        <p className="text-[11px] font-mono text-amber-300/80 mt-0.5">
                          Resuming automatically on Flex tier in <span className="font-bold text-amber-200">{retryCountdown !== null ? retryCountdown : 0}s</span>...
                        </p>
                        {session.retryState?.error && (
                          <div className="mt-2 text-[11px] font-mono text-amber-200/90 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40 break-words">
                            <span className="text-amber-400 font-bold uppercase">Reported Error:</span> {session.retryState.error}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                      {session?.config?.serviceTier === 'flex' && (
                        <button
                          type="button"
                          onClick={handleRetryStandard}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          title="Switch to Standard Tier and retry step immediately"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Switch to Standard</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRetryCancel}
                        className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
                        title="Cancel cooldown and pause session"
                      >
                        Pause
                      </button>
                      <button
                        type="button"
                        onClick={handleRetryNow}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Skip cooldown and retry step on Flex immediately"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resume Now</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress Loader for Interrogate / Inject Comment */}
                {queryLoading && session.status !== "running" && (
                  <div className="flex gap-4 p-5 rounded-2xl bg-[#141822]/40 border border-slate-800 text-slate-300 ml-12 animate-pulse">
                    <div className="shrink-0 select-none">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-950/20 text-[#10B981] border border-[#10B981]/30">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="text-xs uppercase font-mono text-slate-500 mb-1">Processing Query</div>
                      <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-semibold">
                        <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-bounce delay-150"></div>
                        <span className="ml-1">Generating response / Injecting...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Slingshot Completion Callout with Warm-Cache Escalation */}
                {session.status === "completed" && session.config?.sessionMode === "slingshot" && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-cyan-950/40 border border-emerald-500/40 text-emerald-200 ml-12 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold flex items-center gap-2">
                        <span>⚡ Slingshot Triage Finalized</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-600/40 text-emerald-200">
                          Mode 1 Complete
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Triage Underwriting complete. If this company presents high strategic optionality or requires the full 11-step deep dive, escalate now to immediately hit the warm Gemini KV prefix cache.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleEscalateSession}
                      disabled={escalating}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 border border-emerald-400/40 shrink-0 self-start sm:self-center"
                      title="Escalate from Slingshot Triage to Full Institutional Dossier using warm Gemini KV prefix cache"
                    >
                      {escalating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                      <span>🏛️ Escalate to Full Dossier</span>
                    </button>
                  </div>
                )}

                <div ref={consoleEndRef} />
              </div>
            )}
          </div>

          {/* Bottom terminal control cockpit console (shrink-0) */}
          <div className="bg-[#141822] border-t border-slate-800 px-5 py-4 shrink-0 flex flex-col gap-3">
            
            {/* Steps Navigation Slider Overlay */}
            {session && session.config && (
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 select-none border-b border-slate-800/65 pb-2.5">
                <span className="text-[10px] font-mono text-slate-400 mr-2 uppercase tracking-widest shrink-0">Prompt Queue:</span>
                <div className="flex flex-wrap items-center gap-1.5 flex-1">
                  {session.steps.map((st, sIdx) => {
                    const isActive = sIdx === session.activeStepIndex;
                    const isDone = st.status === 'completed';
                    const isExecuting = st.status === 'executing';
                    const isCrosscheckStep = st.isCrosscheck || st.index >= MASTER_PROMPTS.length;
                    
                    return (
                      <div 
                        key={st.index}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] shrink-0 font-sans border transition-all ${
                          isCrosscheckStep
                            ? isActive
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/50 cursor-default font-semibold shadow-sm"
                              : isDone
                                ? "bg-amber-950/25 text-amber-300 border-amber-900/40 cursor-help"
                                : "bg-slate-950 text-amber-400/60 border-slate-800"
                            : isActive 
                              ? "bg-[#10B981]/15 hover:bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40 cursor-default font-semibold"
                              : isDone
                                ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30 cursor-help"
                                : "bg-slate-950 text-slate-500 border-slate-900"
                        }`}
                        title={`${st.title} | Model: ${(st.model || session.config?.model || '').replace('models/', '')} | Thinking Level: ${st.thinkingLevel || 'high'}${st.fallback ? ` [FALLBACK: ${st.fallback.originalModel} -> ${st.fallback.fallbackModel}]` : ''}${st.truncated ? ` [TRUNCATED: ${st.finishReason}]` : ''}`}
                      >
                        <span className="font-mono text-[9px]">{isCrosscheckStep ? `⚖️ ${MASTER_PROMPTS.length + 1}` : st.index + 1}</span>
                        <span className="max-w-[75px] truncate">{isCrosscheckStep ? "Crosscheck" : (st.title.split(":")[1]?.trim() || st.title.split(":").slice(-1)[0]?.trim())}</span>
                        
                        {st.fallback && (
                          <span 
                            className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono shrink-0" 
                            title={`Fell back from ${st.fallback.originalModel} to ${st.fallback.fallbackModel}: ${st.fallback.reason}`}
                          >
                            ⚠️ FB
                          </span>
                        )}
                        {st.truncated && (
                          <span 
                            className="text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 py-0.2 rounded font-mono shrink-0" 
                            title={`Output truncated: Hit MAX_TOKENS limit (${st.finishReason})`}
                          >
                            ✂️ TRUNC
                          </span>
                        )}
                        
                        {/* Thinking level fine-tune trigger */}
                        {isActive && session.status === "paused" && (
                          <div className="relative inline-block ml-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setTempDropdownOpen(tempDropdownOpen === st.index ? null : st.index);
                              }}
                              className="px-1 text-[9px] bg-slate-800 text-slate-300 rounded font-mono hover:text-white"
                              title="Override Thinking Level"
                            >
                              🧠 {st.thinkingLevel || "high"}
                            </button>

                            {tempDropdownOpen === st.index && (
                              <div className="absolute bottom-6 right-0 bg-[#1e2536] border border-slate-700 rounded-lg shadow-xl py-1 z-50 w-28">
                                {(["high", "medium", "low"] as const).map(lvl => (
                                  <button
                                    key={lvl}
                                    onClick={() => adjustThinkingLevel(st.index, lvl)}
                                    className="block w-full text-left px-2 py-1 text-[10px] font-mono text-slate-300 hover:bg-[#10B981] hover:text-[#0d0f14]"
                                  >
                                    {lvl === "high" ? "High (Deep)" : lvl === "medium" ? "Med (Standard)" : "Low (Fast)"}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom interrogation and main playback button */}
            {session && session.config ? (
              <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3">
                
                {/* Form of Custom Interrogative Query */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendQuery(e);
                  }} 
                  className="w-full xl:flex-1 flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="text"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    disabled={session.status === "running" || queryLoading}
                    placeholder={
                      session.status === "running"
                        ? "Engine sequential calculations running..."
                        : `Ask structural/forensic questions or type standard comment guidelines...`
                    }
                    className="flex-1 bg-[#0a0d14] border border-slate-800 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="submit"
                      disabled={session.status === "running" || queryLoading || !customQuery.trim()}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 rounded-xl text-xs font-semibold border border-[#10B981]/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Interrogate</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInjectComment}
                      disabled={session.status === "running" || !customQuery.trim()}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-[#1e2536] text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                      title="Inject text as a persistent background context instruction in history"
                    >
                      <span>Inject Comment</span>
                    </button>
                  </div>
                </form>

                {/* Session controls play continue, rewind, download, reset */}
                <div className="flex flex-wrap items-center gap-2 select-none justify-end">
                  
                  {/* Rewind previous step */}
                  <button
                    onClick={handleRewind}
                    disabled={session.status === "running" || session.history.length < 2}
                    className="p-2.5 bg-[#1e2536] text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl border border-slate-800 transition cursor-pointer"
                    title="Rewind previous completed analyst step"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Reset whole session */}
                  <button
                    onClick={handleReset}
                    className="p-2.5 bg-[#1e2536] hover:bg-red-950/20 text-slate-300 hover:text-red-400 rounded-xl border border-slate-800 transition cursor-pointer"
                    title="Soft Purge Conversations"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {/* Hard Reset App */}
                  <button
                    onClick={handleHardReset}
                    className="p-2.5 bg-[#1e2536] hover:bg-red-950/40 text-slate-300 hover:text-red-500 rounded-xl border border-slate-800 transition cursor-pointer"
                    title="Hard Reset App (Clear All)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden md:block"></div>

                  {/* Export Markdown file output */}
                  <a
                    href={session?.config ? `/api/session/export?ticker=${encodeURIComponent(session.config.ticker || '')}&period=${encodeURIComponent(session.config.period || '')}&model=${encodeURIComponent(session.config.model || '')}` : "/api/session/export"}
                    className="px-3 py-2.5 bg-[#1e2536] text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-800 transition cursor-pointer flex items-center gap-1.5"
                    title="Save Terminal Logs to Markdown"
                  >
                    <Download className="w-4 h-4 text-[#10B981]" />
                    <span className="hidden sm:inline">Save Logs (Obsidian)</span>
                  </a>

                  {/* Export Standalone Interactive HTML Dossier */}
                  <button
                    type="button"
                    onClick={handleExportHtml}
                    disabled={htmlExporting || !session || session.history.length === 0}
                    className="px-3 py-2.5 bg-[#1e2536] text-slate-300 hover:text-white hover:bg-cyan-950/50 hover:border-cyan-700/80 rounded-xl text-xs font-semibold border border-slate-800 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Export self-contained, interactive HTML dossier with visual charts"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="hidden sm:inline">{htmlExporting ? "Exporting HTML..." : "Export HTML Dossier"}</span>
                  </button>

                  {/* On-Demand Forensic Crosscheck Trigger */}
                  {session.steps.some(s => s.index >= 14 && s.status === 'completed') && (
                    <button
                      type="button"
                      onClick={handleRunCrosscheck}
                      disabled={crosscheckLoading || session.status === "running"}
                      className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      title="Trigger or re-audit analysis report with independent forensic fact-check"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {crosscheckLoading
                          ? "Auditing..."
                          : session.steps.some(s => s.isCrosscheck && s.status === 'completed')
                          ? "Re-Run Crosscheck"
                          : "Run Crosscheck"}
                      </span>
                    </button>
                  )}

                  {/* Play / Pause Toggle block */}
                  {session.status === "running" ? (
                    <button
                      type="button"
                      onClick={handleStopSession}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer animate-pulse shrink-0"
                      title="Halt running sequential analysis sequential turns"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Stop Job</span>
                    </button>
                  ) : session.status === "retrying" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      {session?.config?.serviceTier === 'flex' && (
                        <button
                          type="button"
                          onClick={handleRetryStandard}
                          className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/30"
                          title="Switch this analysis to Standard Tier and retry immediately"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Switch to Standard</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRetryCancel}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                        title="Cancel retry cooldown and pause session"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRetryNow}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/30"
                        title="Skip cooldown timer and retry step on Flex immediately"
                      >
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Resume Now {retryCountdown !== null ? `(${retryCountdown}s)` : ''}</span>
                      </button>
                    </div>
                  ) : session.status === "completed" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      {session?.config?.sessionMode === 'slingshot' && (
                        <button
                          type="button"
                          onClick={handleEscalateSession}
                          disabled={escalating}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 border border-emerald-400/40 shrink-0"
                          title="Escalate from Slingshot Triage to Full Institutional Dossier using warm Gemini KV prefix cache"
                        >
                          {escalating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                          <span>🏛️ Escalate to Full Dossier</span>
                        </button>
                      )}
                      <div className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0">
                        <Check className="w-4 h-4" />
                        <span>Job Completed</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {session?.config?.serviceTier === 'flex' && (
                        <button
                          type="button"
                          onClick={() => handleQueueForFlex('single')}
                          disabled={flexEngaging || runStarting || flexWatcher?.isWaiting || session.status === 'running' || session.status === 'retrying'}
                          className="px-3.5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 disabled:opacity-50 disabled:pointer-events-none border border-amber-500/40 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                          title="Monitor cluster in background and auto-launch on next Flex opening"
                        >
                          {flexEngaging ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                              <span>Engaging...</span>
                            </>
                          ) : flexWatcher?.isWaiting ? (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>Waiting...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span>Wait for Flex</span>
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleRunSteps()}
                        disabled={flexEngaging || runStarting || flexWatcher?.isWaiting || session.status === 'running' || session.status === 'retrying'}
                        className="px-5 py-2.5 bg-[#10B981] text-[#0d0f14] hover:bg-[#34D399] disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs font-bold transition shadow-md hover:shadow-[#10B981]/10 flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {runStarting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Booting...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>{session.history.length === 0 ? "Begin Analysis" : "Continue Workspace"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : null}

          </div>

        </main>



      {/* Multi-Currency Safeguard & ADR Auditor Modal */}
      <CurrencyGuardModal
        isOpen={!!currencyAuditPending}
        audit={currencyAuditPending?.audit || null}
        onHarmonize={handleCurrencyHarmonizeConfirm}
        onUseRaw={handleCurrencyUseRawConfirm}
        onCancel={handleCurrencyCancel}
        isProcessing={currencyProcessing}
      />

      {/* Pre-Flight Document Integrity Safeguard Modal */}
      <DocumentIntegrityModal
        isOpen={integrityModalOpen}
        report={integrityReport}
        onFixFiles={handleIntegrityFixFiles}
        onSyncConfig={handleIntegritySyncConfig}
        onOverride={handleIntegrityOverride}
        onPurgeMismatches={handleIntegrityPurgeMismatches}
        onPreviewFile={(f: any) => setPreviewFile(f)}
      />

      {/* Pre-Flight Missing Required Documents Safeguard Modal */}
      <MissingDocumentsModal
        isOpen={missingModalOpen}
        targetTicker={ticker || session?.config?.ticker || ""}
        targetPeriod={period || session?.config?.period || ""}
        checklist={auditChecklist}
        onClose={handleMissingModalClose}
        onOverrideProceed={handleMissingOverrideProceed}
        onTriggerUpload={handleTriggerUpload}
        onRetrieveTranscript={handleRetrieveTranscript}
        onRetrieveSec={handleRetrieveSec}
        onRetrieveFmp={handleRetrieveFmp}
        isTranscriptLoading={transcriptIngesting}
        isSecLoading={secIngesting}
        isFmpLoading={fmpIngesting}
        onRetrieveAll={() => handleRetrieveAllDocuments(true)}
        onHarvestCompetitorRadar={() => handleRefreshCompetitorRadar()}
        isRadarLoading={isRefreshingRadar}
        isPullAllLoading={pullAllLoading}
        pullAllProgress={pullAllProgress}
      />

      {/* Pre-Flight File Substance Safeguard Modal (Tripwire) */}
      <FileSubstanceModal
        isOpen={substanceModalOpen}
        issues={substanceIssues}
        onClose={handleSubstanceModalClose}
        onProceedAnyway={handleSubstanceOverrideProceed}
        onPreviewFile={(f: any) => setPreviewFile(f)}
      />

      {/* Transcript Not Ready Alert Modal */}
      <TranscriptAlertModal
        isOpen={transcriptAlertOpen}
        ticker={ticker || session?.config?.ticker || ""}
        period={period || session?.config?.period || ""}
        message={transcriptAlertMessage}
        provider={transcriptProvider}
        onClose={() => setTranscriptAlertOpen(false)}
        onProceedAnyway={() => setTranscriptAlertOpen(false)}
      />

      {/* Retrieval Scope Modal: Download All vs Missing Only */}
      <DownloadOptionsModal
        isOpen={downloadOptionsModalOpen}
        targetTicker={ticker || session?.config?.ticker || ""}
        targetPeriod={period || session?.config?.period || ""}
        missingCategories={auditChecklist.filter(c => c.status === "MISSING").map(c => c.label || c.category)}
        confirmedCount={auditChecklist.filter(c => c.status === "CONFIRMED").length}
        totalRequired={auditChecklist.length}
        isLoading={pullAllLoading}
        loadingProgress={pullAllProgress}
        onDownloadMissing={() => handleRetrieveAllDocuments(true)}
        onDownloadAll={() => handleRetrieveAllDocuments(false)}
        onClose={() => setDownloadOptionsModalOpen(false)}
      />

      {/* Autonomous Valuation Batch Queue Modal */}
      <BatchQueueModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        batchState={batchState}
        onRefresh={fetchBatchState}
        onStartBatch={handleBatchStart}
        onStopBatch={handleBatchStop}
        onAddItem={handleBatchAddItem}
        onBulkAdd={handleBatchBulkAdd}
        onPullDocs={handleBatchPullDocs}
        onPullAllDocs={handleBatchPullAllDocs}
        onReAudit={handleBatchReAudit}
        onSyncPeriods={handleBatchSyncPeriods}
        onRemoveItem={handleBatchRemoveItem}
        onClearQueue={handleBatchClear}
        fmpApiKey={fmpApiKey}
        onSetRetention={handleBatchSetRetention}
        onPurgeStaging={handleBatchPurgeStaging}
        onSetStagingLocation={handleBatchSetStagingLocation}
        onToggleOverride={handleBatchToggleOverride}
        onDeleteFile={handleBatchDeleteFile}
        onPreviewFile={(f: any) => setPreviewFile(f)}
        onUpdatePortfolio={handleBatchUpdatePortfolio}
        flexWatcherState={flexWatcher}
        onQueueForFlex={() => handleQueueForFlex('batch')}
        onCancelFlexWait={handleCancelFlexWait}
      />

      {/* 3-Tier Notification Center Modal */}
      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        config={notificationConfig}
        onSaveConfig={handleSaveNotificationConfig}
        authFetch={authFetch}
      />

      {/* 45-Minute Post-Analysis Context Cache Idle Warning Modal */}
      {idleWarningOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-amber-500/50 rounded-xl max-w-md w-full p-6 shadow-2xl relative text-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-white">45-Minute Idle Cache Warning</h3>
                <p className="text-xs text-amber-400/90 font-mono">Automatic Session Reset Imminent</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              The valuation terminal for <strong className="text-white font-mono">{session?.config?.ticker || "this company"}</strong> has been idle for 40 minutes. To protect your account from unnecessary background token charges, the session and staged documents will automatically reset in:
            </p>

            <div className="bg-[#0b0f17] border border-amber-500/30 rounded-lg p-3 mb-5 text-center">
              <div className="font-mono text-3xl font-extrabold text-amber-400 tracking-wider">
                {String(Math.floor(idleRemainingSeconds / 60)).padStart(2, '0')}:{String(idleRemainingSeconds % 60).padStart(2, '0')}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                Time Remaining Until Auto-Reset
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleExtendCache}
                disabled={extendingCache}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                {extendingCache ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extending...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Keep Cache Warm (+45m)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDismissAndReset}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                Reset Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competitor Moat & Valuation Radar Modal */}
      <CompetitorRadarModal
        isOpen={competitorRadarOpen}
        dossier={competitorDossier}
        targetTicker={ticker || session?.config?.ticker || ""}
        onClose={() => setCompetitorRadarOpen(false)}
        onRefresh={handleRefreshCompetitorRadar}
        isRefreshing={isRefreshingRadar}
      />

      {/* Document Repository Preview Modal (Layered on top of all modals) */}
      {previewFile && (
        <DocumentPreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={handleDownloadFile}
          authFetch={authFetch}
        />
      )}

      </div>
    </div>
  );
}
