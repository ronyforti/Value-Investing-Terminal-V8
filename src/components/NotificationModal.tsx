import React, { useState } from "react";
import { 
  Bell, 
  X, 
  Check, 
  Smartphone, 
  Mail, 
  Volume2, 
  ExternalLink, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  Loader2,
  Key,
  Server,
  Eye,
  EyeOff,
  Sparkles,
  Bot,
  MessageSquare
} from "lucide-react";
import { NotificationConfig } from "../types.js";
import { triggerDesktopAlert, requestDesktopNotificationPermission } from "../utils/audioAlert.js";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NotificationConfig;
  onSaveConfig: (config: NotificationConfig) => void;
  authFetch?: (url: string, init?: RequestInit) => Promise<Response>;
}

export default function NotificationModal({
  isOpen,
  onClose,
  config: initialConfig,
  onSaveConfig,
  authFetch
}: NotificationModalProps) {
  const [config, setConfig] = useState<NotificationConfig>(() => ({
    ...initialConfig,
    channels: {
      ...initialConfig.channels,
      telegram: initialConfig.channels?.telegram ?? false
    },
    telegram: initialConfig.telegram || {
      botToken: "",
      chatId: "",
      sendDossierDoc: true
    }
  }));

  const [telegramTesting, setTelegramTesting] = useState<boolean>(false);
  const [telegramStatus, setTelegramStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [telegramDetecting, setTelegramDetecting] = useState<boolean>(false);
  const [showBotToken, setShowBotToken] = useState<boolean>(false);

  const [ntfyTesting, setNtfyTesting] = useState<boolean>(false);
  const [ntfyStatus, setNtfyStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const [emailTesting, setEmailTesting] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    if (!isOpen) return;

    setConfig(prev => ({
      ...prev,
      ...initialConfig,
      channels: {
        ...prev.channels,
        ...initialConfig.channels,
        telegram: initialConfig.channels?.telegram ?? prev.channels.telegram ?? true
      },
      telegram: {
        botToken: initialConfig.telegram?.botToken || prev.telegram?.botToken || "",
        chatId: initialConfig.telegram?.chatId || prev.telegram?.chatId || "",
        sendDossierDoc: initialConfig.telegram?.sendDossierDoc ?? prev.telegram?.sendDossierDoc ?? true
      },
      email: {
        ...prev.email,
        ...initialConfig.email,
        to: initialConfig.email?.to || prev.email?.to || "",
        resendApiKey: initialConfig.email?.resendApiKey || prev.email?.resendApiKey || ""
      }
    }));

    const fetchFn = authFetch || fetch;
    fetchFn("/api/notifications/config")
      .then(r => r.json())
      .then(data => {
        if (data.config && typeof data.config === "object") {
          setConfig(prev => ({
            ...prev,
            ...data.config,
            channels: {
              ...prev.channels,
              ...(data.config.channels || {})
            },
            telegram: {
              botToken: data.config.telegram?.botToken || prev.telegram?.botToken || "",
              chatId: data.config.telegram?.chatId || prev.telegram?.chatId || "",
              sendDossierDoc: data.config.telegram?.sendDossierDoc ?? prev.telegram?.sendDossierDoc ?? true
            },
            email: {
              ...prev.email,
              ...(data.config.email || {}),
              to: data.config.email?.to || prev.email?.to || "",
              resendApiKey: data.config.email?.resendApiKey || prev.email?.resendApiKey || ""
            }
          }));
        }
      })
      .catch(() => {});
  }, [isOpen, initialConfig, authFetch]);

  if (!isOpen) return null;

  const handleToggleChannel = (channel: 'desktop' | 'telegram' | 'ntfy' | 'email') => {
    setConfig(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel]
      }
    }));
  };

  const handleToggleEvent = (event: 'singleCompany' | 'batchComplete' | 'batchCompany' | 'blockedAlert') => {
    setConfig(prev => ({
      ...prev,
      events: {
        ...prev.events,
        [event]: !prev.events[event]
      }
    }));
  };

  // Test Tier 1: Desktop Alert & Chime
  const handleTestDesktop = async () => {
    await requestDesktopNotificationPermission();
    triggerDesktopAlert(
      "🔔 Terminal Notification Test",
      "Desktop notifications and harmonic sound chimes are operational!"
    );
  };

  // Test Tier 2: Telegram Bot Notification
  const handleTestTelegram = async () => {
    const token = config.telegram?.botToken?.trim();
    const chat = config.telegram?.chatId?.trim();
    if (!token || !chat) {
      setTelegramStatus({ success: false, msg: "Please enter both Bot Token and Chat ID first (or click Auto-Detect)." });
      return;
    }
    setTelegramTesting(true);
    setTelegramStatus(null);
    try {
      const fetchFn = authFetch || fetch;
      const res = await fetchFn("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "telegram",
          config
        })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramStatus({ success: true, msg: "Test alert dispatched! Check your Telegram chat." });
      } else {
        setTelegramStatus({ success: false, msg: data.error || "Failed sending Telegram alert." });
      }
    } catch (err: any) {
      setTelegramStatus({ success: false, msg: err.message || "Failed to communicate with server." });
    } finally {
      setTelegramTesting(false);
    }
  };

  // Auto-Detect Telegram Chat ID
  const handleDetectTelegramChat = async () => {
    const token = config.telegram?.botToken?.trim();
    if (!token) {
      setTelegramStatus({ success: false, msg: "Please enter your Telegram Bot Token before auto-detecting." });
      return;
    }
    setTelegramDetecting(true);
    setTelegramStatus(null);
    try {
      const fetchFn = authFetch || fetch;
      const res = await fetchFn("/api/notifications/telegram/detect-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: token })
      });
      const data = await res.json();
      if (data.success && data.chatId) {
        setConfig(prev => ({
          ...prev,
          telegram: {
            botToken: prev.telegram?.botToken || token,
            chatId: data.chatId,
            sendDossierDoc: prev.telegram?.sendDossierDoc ?? true,
            docFormat: prev.telegram?.docFormat || "both"
          }
        }));
        const identifier = data.username ? `@${data.username}` : (data.firstName || "Chat");
        setTelegramStatus({
          success: true,
          msg: `Auto-detected Chat ID ${data.chatId} for ${identifier}!`
        });
      } else {
        setTelegramStatus({
          success: false,
          msg: data.error || "No recent messages found. Open your bot in Telegram, send any message (like /start or hi), then click Auto-Detect again!"
        });
      }
    } catch (err: any) {
      setTelegramStatus({ success: false, msg: err.message || "Failed auto-detecting chat ID." });
    } finally {
      setTelegramDetecting(false);
    }
  };

  // Test Tier 2: ntfy.sh Mobile Push
  const handleTestNtfy = async () => {
    if (!config.ntfy.topic?.trim()) {
      setNtfyStatus({ success: false, msg: "Please enter an ntfy topic name first." });
      return;
    }
    setNtfyTesting(true);
    setNtfyStatus(null);
    try {
      const fetchFn = authFetch || fetch;
      const res = await fetchFn("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "ntfy",
          config
        })
      });
      const data = await res.json();
      if (data.success) {
        setNtfyStatus({ success: true, msg: "Test push sent! Check your ntfy mobile app." });
      } else {
        setNtfyStatus({ success: false, msg: data.error || "Failed sending test push." });
      }
    } catch (err: any) {
      setNtfyStatus({ success: false, msg: err.message || "Failed to communicate with server." });
    } finally {
      setNtfyTesting(false);
    }
  };

  // Test Tier 3: Email Delivery
  const handleTestEmail = async () => {
    if (!config.email.to?.trim()) {
      setEmailStatus({ success: false, msg: "Please enter a recipient email address." });
      return;
    }
    setEmailTesting(true);
    setEmailStatus(null);
    try {
      const fetchFn = authFetch || fetch;
      const res = await fetchFn("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "email",
          config
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus({ success: true, msg: `Test email sent to ${config.email.to}!` });
      } else {
        setEmailStatus({ success: false, msg: data.error || "Failed sending test email." });
      }
    } catch (err: any) {
      setEmailStatus({ success: false, msg: err.message || "Failed to communicate with server." });
    } finally {
      setEmailTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div 
        className="relative flex flex-col w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] bg-[#0c101a] border-0 sm:border sm:border-slate-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 bg-[#101624] border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Notification Center</h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  config.enabled 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/70' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {config.enabled ? "ACTIVE" : "OFF"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time alerts when single-company valuations or batch queues finish
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 text-slate-300 text-xs">
          
          {/* Master Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141a29] border border-slate-800">
            <div>
              <div className="font-semibold text-slate-200">Enable Terminal Notifications</div>
              <div className="text-[11px] text-slate-400">Send alerts across your configured channels when executions finalize.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Tier 1: Desktop Alert & Chime */}
          <div className={`p-4 rounded-xl border transition-all ${config.channels.desktop ? 'bg-[#121827] border-slate-700' : 'bg-slate-900/40 border-slate-800/80 opacity-70'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-sm">Tier 1: Desktop Sound Chime & Toast</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Synthesized harmonic success chime + Windows / Mac desktop toast.
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.channels.desktop}
                  onChange={() => handleToggleChannel('desktop')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {config.channels.desktop && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Works at your desk with browser minimized.</span>
                <button
                  type="button"
                  onClick={handleTestDesktop}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-mono text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Desktop Alert</span>
                </button>
              </div>
            )}
          </div>

          {/* Tier 2: Telegram Bot (Alerts & Dossier Attachments) */}
          <div className={`p-4 rounded-xl border transition-all ${config.channels.telegram ? 'bg-[#121827] border-slate-700' : 'bg-slate-900/40 border-slate-800/80 opacity-70'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <span>Tier 2: Telegram Bot Alerts & Dossiers</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-sky-900/60 text-sky-300 rounded border border-sky-700/60 font-mono font-medium">RECOMMENDED</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Direct alerts on your phone, watch, or desktop with executive card and dossier Markdown file attached.
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.channels.telegram}
                  onChange={() => handleToggleChannel('telegram')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>

            {config.channels.telegram && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                {/* 30-sec setup instruction tip */}
                <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-900/50 text-[11px] text-sky-300/90 leading-relaxed">
                  <div className="font-semibold text-sky-200 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Quick 30-Second Setup:</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-0.5 text-[10.5px] text-slate-300">
                    <li>Open <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline font-mono">@BotFather</a> in Telegram, type <code className="text-amber-300">/newbot</code>, and copy your <strong>Bot Token</strong>.</li>
                    <li>Open your newly created bot in Telegram and send it any message (e.g. <code className="text-amber-300">/start</code> or <code className="text-amber-300">hi</code>).</li>
                    <li>Paste your Bot Token below and click <strong>Auto-Detect Chat ID</strong>!</li>
                  </ol>
                </div>

                {/* Bot Token Input */}
                <div>
                  <label className="block font-mono text-[11px] text-slate-400 uppercase mb-1">
                    Telegram Bot Token:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showBotToken ? "text" : "password"}
                      value={config.telegram?.botToken || ""}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        telegram: {
                          botToken: e.target.value,
                          chatId: prev.telegram?.chatId || "",
                          sendDossierDoc: prev.telegram?.sendDossierDoc ?? true
                        }
                      }))}
                      placeholder="e.g. 7123456789:AAHk1_example_token_xyz"
                      className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBotToken(!showBotToken)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                    >
                      {showBotToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Chat ID Input & Auto-Detect Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-mono text-[11px] text-slate-400 uppercase">
                      Telegram Chat ID:
                    </label>
                    <span className="text-[10px] text-slate-500">Personal chat ID or Group chat ID (e.g. -100...)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.telegram?.chatId || ""}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        telegram: {
                          botToken: prev.telegram?.botToken || "",
                          chatId: e.target.value,
                          sendDossierDoc: prev.telegram?.sendDossierDoc ?? true
                        }
                      }))}
                      placeholder="e.g. 123456789 or click Auto-Detect"
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleDetectTelegramChat}
                      disabled={telegramDetecting || !config.telegram?.botToken}
                      className="px-3 py-2 rounded-lg bg-sky-950/70 hover:bg-sky-900/80 text-sky-300 border border-sky-700/60 font-mono text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      title="Automatically fetch Chat ID from recent messages sent to your bot"
                    >
                      {telegramDetecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Auto-Detect</span>
                    </button>
                  </div>
                </div>

                {/* Send Dossier Document Checkbox & Format Selector */}
                <div className="pt-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="telegram-send-doc"
                      checked={config.telegram?.sendDossierDoc ?? true}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        telegram: {
                          botToken: prev.telegram?.botToken || "",
                          chatId: prev.telegram?.chatId || "",
                          sendDossierDoc: e.target.checked,
                          docFormat: prev.telegram?.docFormat || "both"
                        }
                      }))}
                      className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                    <label htmlFor="telegram-send-doc" className="text-[11px] text-slate-300 cursor-pointer select-none">
                      Attach compiled valuation dossier to Telegram alert
                    </label>
                  </div>

                  {(config.telegram?.sendDossierDoc ?? true) && (
                    <div className="ml-6 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Attachment Format:
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'html', label: 'HTML (.html)', desc: 'Interactive + Flywheel' },
                          { id: 'md', label: 'Markdown (.md)', desc: 'Obsidian Vault' },
                          { id: 'both', label: 'Both Files', desc: '.html & .md' }
                        ].map(opt => {
                          const currentFormat = config.telegram?.docFormat || 'both';
                          const isSelected = currentFormat === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setConfig(prev => ({
                                ...prev,
                                telegram: {
                                  botToken: prev.telegram?.botToken || "",
                                  chatId: prev.telegram?.chatId || "",
                                  sendDossierDoc: prev.telegram?.sendDossierDoc ?? true,
                                  docFormat: opt.id as 'html' | 'md' | 'both'
                                }
                              }))}
                              className={`p-2 rounded-md text-left border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-sky-950/70 border-sky-600/80 text-sky-200'
                                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                              }`}
                            >
                              <div className="text-[11px] font-bold font-mono">{opt.label}</div>
                              <div className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status banner if test/detect was run */}
                {telegramStatus && (
                  <div className={`p-2.5 rounded-lg border text-[11px] flex items-center gap-2 ${
                    telegramStatus.success
                      ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                  }`}>
                    {telegramStatus.success ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{telegramStatus.msg}</span>
                  </div>
                )}

                {/* Test Telegram Alert Button */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={telegramTesting || !config.telegram?.botToken || !config.telegram?.chatId}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900 text-sky-300 border border-sky-700/60 font-mono text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {telegramTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Test Telegram Alert</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tier 3: ntfy.sh Mobile Push */}
          <div className={`p-4 rounded-xl border transition-all ${config.channels.ntfy ? 'bg-[#121827] border-slate-700' : 'bg-slate-900/40 border-slate-800/80 opacity-70'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-sm">Tier 3: Mobile Push (ntfy.sh)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Instant phone vibration & alert anywhere you are. 100% free, zero accounts needed.
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.channels.ntfy}
                  onChange={() => handleToggleChannel('ntfy')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {config.channels.ntfy && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                <div>
                  <label className="block font-mono text-[11px] text-slate-400 uppercase mb-1">
                    Your Private Topic Name:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 bg-slate-950 px-2.5 py-2 rounded-lg border border-slate-800 select-none">
                      https://ntfy.sh/
                    </span>
                    <input
                      type="text"
                      value={config.ntfy.topic}
                      onChange={(e) => setConfig(prev => ({ ...prev, ntfy: { ...prev.ntfy, topic: e.target.value } }))}
                      placeholder="e.g. forti-terminal-ronald"
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleTestNtfy}
                      disabled={ntfyTesting}
                      className="px-3.5 py-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-mono text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {ntfyTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Test Phone Push</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Subscribe to this topic in the free <strong>ntfy app</strong> on your iPhone or Android.</span>
                  <a
                    href="https://ntfy.sh"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Download App</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {ntfyStatus && (
                  <div className={`p-2 rounded-lg border text-[11px] flex items-center gap-1.5 ${
                    ntfyStatus.success ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  }`}>
                    {ntfyStatus.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{ntfyStatus.msg}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tier 4: Email Delivery with Dossier Attached */}
          <div className={`p-4 rounded-xl border transition-all ${config.channels.email ? 'bg-[#121827] border-slate-700' : 'bg-slate-900/40 border-slate-800/80 opacity-70'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-sm">Tier 4: Email Delivery (Dual Dossiers Attached)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Permanent inbox archive with executive card; automatically attaches both standalone HTML (with flywheel graphics) & Markdown (.md) dossiers.
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.channels.email}
                  onChange={() => handleToggleChannel('email')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            {config.channels.email && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                {/* Recipient Email */}
                <div>
                  <label className="block font-mono text-[11px] text-slate-400 uppercase mb-1">
                    Send Dossiers To:
                  </label>
                  <input
                    type="email"
                    value={config.email.to}
                    onChange={(e) => setConfig(prev => ({ ...prev, email: { ...prev.email, to: e.target.value } }))}
                    placeholder="e.g. your-email@gmail.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Provider Selector */}
                <div>
                  <label className="block font-mono text-[11px] text-slate-400 uppercase mb-1.5">
                    Email Service Provider:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, email: { ...prev.email, provider: 'resend' } }))}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                        config.email.provider === 'resend' 
                          ? 'bg-indigo-950/60 border-indigo-500/70 text-indigo-200' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">Resend API</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">3,000 free emails/mo. Recommended for cloud.</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, email: { ...prev.email, provider: 'smtp' } }))}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                        config.email.provider === 'smtp' 
                          ? 'bg-indigo-950/60 border-indigo-500/70 text-indigo-200' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">Gmail / SMTP</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Using Gmail App Password or custom mail server.</div>
                    </button>
                  </div>
                </div>

                {/* Resend Fields */}
                {config.email.provider === 'resend' && (
                  <div>
                    <label className="block font-mono text-[11px] text-slate-400 uppercase mb-1">
                      Resend API Key:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                        <input
                          type="password"
                          value={config.email.resendApiKey || ""}
                          onChange={(e) => setConfig(prev => ({ ...prev, email: { ...prev.email, resendApiKey: e.target.value } }))}
                          placeholder="re_123456789..."
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleTestEmail}
                        disabled={emailTesting}
                        className="px-3.5 py-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 font-mono text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {emailTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Send Test Email</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Get a free key at <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">resend.com</a>. Defaults to RESEND_API_KEY environment variable if empty.
                    </div>
                  </div>
                )}

                {/* SMTP Fields */}
                {config.email.provider === 'smtp' && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">SMTP Host</label>
                        <input
                          type="text"
                          value={config.email.smtpHost || ""}
                          onChange={(e) => setConfig(prev => ({ ...prev, email: { ...prev.email, smtpHost: e.target.value } }))}
                          placeholder="smtp.gmail.com"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">Port</label>
                        <input
                          type="number"
                          value={config.email.smtpPort || 587}
                          onChange={(e) => setConfig(prev => ({ ...prev, email: { ...prev.email, smtpPort: Number(e.target.value) } }))}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">Username / Email</label>
                        <input
                          type="text"
                          value={config.email.smtpUser || ""}
                          onChange={(e) => setConfig(prev => ({ ...prev, email: { ...prev.email, smtpUser: e.target.value } }))}
                          placeholder="your-email@gmail.com"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">Password / App Pass</label>
                        <input
                          type="password"
                          value={config.email.smtpPass || ""}
                          onChange={(e) => setConfig(prev => ({ ...prev, email: { ...prev.email, smtpPass: e.target.value } }))}
                          placeholder="••••••••••••••••"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleTestEmail}
                        disabled={emailTesting}
                        className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 font-mono text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {emailTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Send Test Email via SMTP</span>
                      </button>
                    </div>
                  </div>
                )}

                {emailStatus && (
                  <div className={`p-2 rounded-lg border text-[11px] flex items-center gap-1.5 ${
                    emailStatus.success ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  }`}>
                    {emailStatus.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{emailStatus.msg}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trigger Events */}
          <div className="p-4 rounded-xl bg-[#121827] border border-slate-800 space-y-2.5">
            <div className="font-bold text-slate-200 text-xs font-mono uppercase tracking-wider mb-1">
              Trigger Notification When:
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.events.singleCompany}
                onChange={() => handleToggleEvent('singleCompany')}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-900 focus:ring-0"
              />
              <span className="text-slate-300 text-xs">Single Company Valuation Completes (Step 16 Finalized)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.events.batchComplete}
                onChange={() => handleToggleEvent('batchComplete')}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-900 focus:ring-0"
              />
              <span className="text-slate-300 text-xs">Entire Batch Queue Completes (All companies processed)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.events.batchCompany}
                onChange={() => handleToggleEvent('batchCompany')}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-900 focus:ring-0"
              />
              <span className="text-slate-300 text-xs">Each Individual Company in Batch Finishes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.events.blockedAlert}
                onChange={() => handleToggleEvent('blockedAlert')}
                className="w-4 h-4 rounded border-slate-700 text-rose-500 bg-slate-900 focus:ring-0"
              />
              <span className="text-slate-300 text-xs">Company Blocked in Batch (Missing required filings warning)</span>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#101624] border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save Notification Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
