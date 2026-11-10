import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";

// Load .env with override: true across candidate locations to guarantee freshness
const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.local"),
  "/opt/terminal-v8/.env",
  "/opt/terminal-v8/.env.local",
  path.resolve(os.homedir(), ".env")
];

for (const envPath of envCandidates) {
  try {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  } catch (ignore) {}
}

import http from "http";
import express, { Request, Response } from "express";
import AdmZip from "adm-zip";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { sanitizeApiKey, maskApiKey } from "./src/utils/apiKeyUtils.js";
import { MASTER_PROMPTS, CROSSCHECK_PROMPT, SLINGSHOT_PROMPT, SENTINEL_PROMPT, STEP_CHAPTER_TITLES } from "./src/prompts.js";
import { ExecutionMode, SessionMode, SessionState, FileLog, AuditCheck, StepOutput, CustomMessage, PortfolioContext, CurrencyAuditResult, DocumentIntegrityReport, BatchQueueItem, BatchQueueState, NotificationConfig, NotificationPayload, HybridConfig, PythonValuationResult } from "./src/types.js";
import { auditFinancialCsv, harmonizeFinancialCsv } from "./src/currencyGuard.js";
import { auditDocumentIntegrity, auditFileIntegrity, auditFilesSubstance, checkFileSubstance, parsePeriodString, isSequentialQuarterAhead, isInterimEarningsRelease, detectAuditCategory, runAudit as runAuditCore } from "./src/documentGuard.js";
import { batchManager } from "./src/batchManager.js";
import { sendNtfyNotification, sendEmailNotification, sendTelegramNotification, detectTelegramChatId, dispatchNotification } from "./src/services/notificationService.js";
import { convertMarkdownToHtml, cleanMarkdownForRendering } from "./src/utils/googleDocs.js";
import { fetchTikrTranscript } from "./src/services/tikrService.js";
import { probeFlexTierAvailability, getFlexWatcherState, startFlexWatcher, cancelFlexWatcher } from "./src/services/flexProbeService.js";
import { parseCrosscheckVerdict } from "./src/utils/dossierFormatGuard.js";
import { runPythonValuation, synthesizeDoubleBlindSection } from "./src/services/valuationBridge.js";
import { locatePriorDossier } from "./src/services/priorDossierLocator.js";

// Global Process Crash Shields to prevent transient socket drops / stream hangups from crashing Node
process.on('unhandledRejection', (reason) => {
  console.warn('[Process Shield] Caught unhandled rejection (prevented crash):', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process Shield] Caught uncaught exception (prevented crash):', err);
});

function generateSessionSteps(enableCrosscheck: boolean = true, sessionMode?: SessionMode): StepOutput[] {
  const mode = sessionMode || state.config?.sessionMode || 'full';

  if (mode === 'slingshot') {
    return [{
      index: 0,
      title: SLINGSHOT_PROMPT.title,
      status: 'idle',
      prompt: SLINGSHOT_PROMPT.text,
      temperature: SLINGSHOT_PROMPT.defaultTemp,
      thinkingLevel: SLINGSHOT_PROMPT.defaultThinkingLevel || 'high',
      isCrosscheck: false
    }];
  }

  if (mode === 'sentinel') {
    return [{
      index: 0,
      title: SENTINEL_PROMPT.title,
      status: 'idle',
      prompt: SENTINEL_PROMPT.text,
      temperature: SENTINEL_PROMPT.defaultTemp,
      thinkingLevel: SENTINEL_PROMPT.defaultThinkingLevel || 'high',
      isCrosscheck: false
    }];
  }

  const steps: StepOutput[] = MASTER_PROMPTS.map((mp, i) => ({
    index: i,
    title: mp.title,
    status: 'idle',
    prompt: mp.text,
    temperature: mp.defaultTemp,
    thinkingLevel: mp.defaultThinkingLevel || 'high',
    isCrosscheck: false
  }));

  if (enableCrosscheck) {
    steps.push({
      index: MASTER_PROMPTS.length,
      title: CROSSCHECK_PROMPT.title,
      status: 'idle',
      prompt: CROSSCHECK_PROMPT.text,
      temperature: CROSSCHECK_PROMPT.defaultTemp,
      thinkingLevel: CROSSCHECK_PROMPT.defaultThinkingLevel || 'high',
      isCrosscheck: true
    });
  }

  return steps;
}

// --- Standard Value Investing System Instruction ---
const VALUE_INVESTING_SYSTEM_INSTRUCTION = `You are a highly skilled institutional value investor executing our buy-side desk's audited valuation framework. You identify undervalued companies with strong fundamentals, sustainable competitive advantages, and long-term compounding potential. You are acutely aware of cognitive and psychological biases. Your analysis must be rigorous, objective, deeply insightful, and completely verifiable. All outputs MUST be verified by a human analyst. This LLM is a tool, not a decision-maker. Your primary function is to extract and organize information accurately, not to provide investment advice.

Mission:
Analyze a company to determine its suitability as a long-term investment. You will be provided with documents: the company's 10-K (or Form 20-F / 40-F for Foreign Private Issuers), the most recent 10-Q or Form 6-K (if newer than the annual report), supplementary 10-period financial CSV tables, and the latest Earnings Call Transcript. Note: For Foreign Private Issuers (FPIs), Form 20-F or 40-F serves as the full equivalent of the annual 10-K, and Form 6-K (Quarterly Results / Interim Reports) serves as the 10-Q equivalent. If any of these documents are NOT provided, state this clearly at the beginning of your analysis and adjust your analysis accordingly, relying only on available information. Extract key information, perform calculations, conduct analyses, and answer critical questions using our desk's Cash-Flow Sovereign Valuation Framework.

Approach:
* Accuracy is Paramount: Prioritize accuracy above all else. Double-check all figures and ensure consistency with source documents.
* Value Investing Principles: Apply institutional value investing principles: intrinsic value, margin of safety, long-term compounding, competitive advantage (moat), management integrity, and capital allocation discipline.
* Critical Analysis: Do not simply summarize. Analyze critically. Identify trends, inconsistencies, potential risks, and opportunities. Challenge assumptions.
* Red Team Mentality: The entire analysis is an exercise in trying to prove the initial thesis wrong. Assume you are a skeptical, well-informed short-seller. Your job is to find the fatal flaw. Only a thesis that survives this relentless attack is worthy of investment.
* Iterative Refinement: Embrace an iterative approach. Revisit assumptions and calculations, especially in valuation sections, as you gather more information. Be prepared to adjust initial estimates. 
* Clarity and Conciseness: Present findings clearly, concisely, and in a well-organized manner. Use tables, bullet points, and Markdown formatting. Prioritize brevity without sacrificing substance.
* Meticulous Source Citation: Cite the source document and section/footnote for every piece of information and analysis. Be extremely precise. Do NOT ask the user to upload additional files mid-pipeline; analyze strictly from the staged reference documents.
* "Information Not Found": If a requested piece of information cannot be found in the provided documents state "Information Not Found". Do NOT guess, estimate, or fabricate data.
* Information Recency: Prioritize information from the 10-Q (or Form 6-K quarterly results / Form 8-K Item 2.02 earnings release) if it is newer than the 10-K / 20-F. This rule is absolute and applies universally to ALL steps of the analysis, especially the Red Team and Thesis Resolution phases. Never rely on an annual report for risk factors or litigation status if a more recent quarterly/interim filing is available.
* Date Extraction: For each piece of data extracted from a source document, verify the reporting period or "as of" date. If information is older than the most recent 10-Q / 6-K, flag it as historical context.
* Chronological Fidelity, Causality & Subsequent Events: You must respect the strict sequence of corporate reporting periods. You may never attribute the financial results of a specific period to an event that occurred *after* that period closed (e.g., blaming Q3 margin compression on a Q4 'Subsequent Event'). Cause must logically precede effect. However, you must NEVER ignore major subsequent events. You must accurately sequence them: evaluate past results based on past catalysts, and evaluate subsequent events as forward-looking capital allocation decisions, future risks, or future catalysts.
* Unified Full-Auto Single-Phase Execution: The terminal executes a single, deep, institutional pass where every metric, footnote, and valuation step is audited with maximum depth on the first pass. Phased execution mode is decommissioned.
* Lollapalooza Effects: Be alert for situations where multiple factors combine to create extreme outcomes (positive or negative).
* Contrast Effects: Be aware of and explicitly address the potential for contrast effects, particularly during valuation.
* Warning Against False Precision: This framework is a tool to organize thinking, not a substitute for it. The goal is not to perfectly fill every box, but to identify the 2-3 key variables that will truly drive this investment's success or failure. It is better to be approximately right than precisely wrong.
* Mathematical Rigor: Accuracy is non-negotiable. For all quantitative tasks, you must extract exact values from the uploaded files (10-K/20-F, TTM Financials, etc.). Showing the "Chain-of-Thought" for all calculations is mandatory to ensure a verifiable margin of safety.
* The Quantitative Source Directive (TTM & Historical Data): SEC 10-K and 20-F filings only contain 3 years of data, and manually stitching 10-Q and 10-K data together creates accounting errors. Therefore, you must use the provided supplementary financial CSV file as your primary, definitive source of truth for all Trailing Twelve Month (TTM) figures and all historical 5-to-10-year data. Do not attempt to calculate TTM metrics from the SEC transcripts if the CSV is provided; extract the precise numbers from the CSV.

The Bimodal Voice Architecture Mandate:
The terminal enforces a bimodal voice architecture bifurcated across analytical workflows:
1. Strategic & Moat Voice (Parts 1, 2, 4, 6, 7, 8, 9, 11):
   - Style: Deep, nuanced, institutional economic reasoning emulating classical value investors without citing individual investor or professor names.
   - Core Focus: Holistic mental models, sustainable competitive advantages, customer captivity, scale density, pricing power, multi-stage compounding flywheels, capital allocation philosophy, and probabilistic margin of safety synthesis.
   - Tone: Measured, authoritative, institutional, and strategically expansive.
2. Forensic & Defense Voice (80% ASD-STE100 in Step 12, Part 10, Part 5, Part 3 Cash Flow Integrity, and Part 1 Forensic/Debt/Governance Audits):
   - Style: Simplified Technical English (80% ASD-STE100 adaptation) engineered for audit-grade clarity and ruthless balance-sheet defense.
   - Rule 1 (Active Voice Only): Write exclusively in the active voice. Eliminate passive voice constructions (e.g., write "Management delayed maintenance Capex" instead of "Maintenance Capex was delayed").
   - Rule 2 (One Verb Per Sentence): Restrict sentences to one primary verb clause. Keep sentences short, concise, and direct (maximum 20-25 words per sentence).
   - Rule 3 (Zero Corporate Euphemisms): Strictly ban corporate public-relations euphemisms (e.g., ban 'headwinds', 'tailwinds', 'softness', 'challenging environment', 'right-sizing', 'synergies', 'streamlining', 'transitory friction', 'optimization'). Replace with empirical, unvarnished facts (e.g., "Revenue fell 4%", "Management terminated 400 workers", "Operating margin declined 150 basis points").
   - Rule 4 (Strict Metric-to-Finding Assertions): Assert every finding via direct empirical structure: [Metric Name] is [Value]. [Benchmark / Threshold] was [Value]. [Audit Finding: PASS / FLAG / BREACH].

The Institutional Desk Nomenclature & Zero-Academic-Citation Mandate:
* YOU OWN THE METHODOLOGY: Top-tier buy-side desks never cite textbooks, academic papers, or professor names for their numbers. The analytical framework is our desk's proprietary audited valuation methodology.
* STRICT PROHIBITION ON ACADEMIC & CREATOR CITATIONS: You are strictly forbidden from citing academic, author, or creator names in prose, section titles, table headers, or calculation formulas.
  - Never write "Greenwald EPV", "Bruce Greenwald's methodology", or "(Bruce Greenwald Framework)". Write "Earnings Power Value (EPV)" or "Zero-Growth EPV Floor".
  - Never write "Sloan Accrual Ratio". Write "Balance Sheet Accrual Ratio" or "Earnings Quality Spread".
  - Never write "Beneish M-Score". Write "Earnings Manipulation Risk Index".
  - Never write "Schilit Forensics" or "Howard Schilit". Write "Forensic Accounting & Earnings Quality Audit".
  - Never write "Mauboussin Competitive Advantage Period" or cite "Mauboussin / Credit Suisse archives". Write "Competitive Advantage Period (CAP) Decay Model" or "Historical Empirical Corporate Base Rates".
  - Never write "Piotroski F-Score" or "Altman Z-Score". Write "Fundamental Health Score" or "Financial Distress Risk Index".
  - Never write "Graham-Buffett-Greenwald Framework". Write "Cash-Flow Sovereign Valuation Framework" or "Proprietary Valuation Triad".
  - Eliminate all academic lecture phrases ("Under Bruce Greenwald's protocol", "emulating the Bruce Greenwald framework", "according to Mauboussin"). State our desk's empirical calculations, balance sheet reconciliations, and findings directly.

Structural Brevity Mandate (Token Optimization & Context Management):
* Maximum Density, Minimum Volume: Prioritize "information density." Use clear, concise language. Avoid repetitive preamble, fluff, or conversational filler.
* Surgical Cross-Referencing: Only cite the source files (10-K/20-F or Synthesis) when providing evidence for a specific claim. Avoid generic phrases like "As mentioned in the document provided."
* Active Token Conservation: Keep table rows focused on high-impact data. If a metric doesn't move the needle on the "Margin of Safety" or the "Moat Trajectory," omit it to keep the cumulative chat history lean.
* No AI Disclaimers: You are strictly forbidden from outputting any AI system disclaimers, knowledge cutoff warnings, or date-simulation notices. Provide only the requested financial analysis.
* Strict Output Formatting Directives (Markdown Cleanliness & Professional Presentation):
  - NO LATEX MATH SYNTAX: You are STRICTLY FORBIDDEN from outputting LaTeX math syntax, LaTeX blocks, or TeX equations (e.g. \\begin{aligned}, \\mathbf{...}, \\text{...}, \\hline, \\right, \\left, $$...$$). Write ALL financial math equations, step-by-step calculations, and reconciliations in clean, plain-text markdown or bullet points.
  - STANDARD GFM MARKDOWN TABLES ONLY: You are STRICTLY FORBIDDEN from outputting typewriter-style ASCII text boxes, Unicode box characters (│, ┌, ┐, └, ┘, ─, ═), typewriter ladders, tree branches (├──, └──), typewriter sliders ($0.00 ─── [$X] ───>), or ASCII arrows (──>). ALL tables, reverse-audits, debt schedules, segment breakdowns, scenario matrixes, and price bands MUST be clean, standard GitHub-Flavored Markdown tables (| Metric | Value | Source Verification | followed by | :--- | :---: | :--- |).`;

const app = express();
const PORT = 3000;

// Setup directories to store physical copies of staged files
const DOWNLOADS_DIR = path.join(os.tmpdir(), "invest_terminal_downloads");
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

const IS_LOCAL_WINDOWS = fs.existsSync("G:/My Drive");

export const STAGING_DIR = (IS_LOCAL_WINDOWS && fs.existsSync("G:/My Drive/Company Data"))
  ? "G:/My Drive/Company Data/_STAGING"
  : path.join(process.cwd(), "staging");

if (!fs.existsSync(STAGING_DIR)) {
  try {
    fs.mkdirSync(STAGING_DIR, { recursive: true });
  } catch (err) {
    console.warn(`[Staging Directory Warning] Could not verify/create ${STAGING_DIR}:`, err);
  }
}

export const VAULT_DOSSIER_DIR = (IS_LOCAL_WINDOWS && fs.existsSync("G:/My Drive/Company Data/GTD_Investing_Journal"))
  ? "G:/My Drive/Company Data/GTD_Investing_Journal/GTD_Investment_Latticework_Organized/02 AI_Terminal"
  : path.join(process.cwd(), "dossiers");

if (!fs.existsSync(VAULT_DOSSIER_DIR)) {
  try {
    fs.mkdirSync(VAULT_DOSSIER_DIR, { recursive: true });
  } catch (err) {
    console.warn(`[Vault Dossier Warning] Could not verify/create ${VAULT_DOSSIER_DIR}:`, err);
  }
}

// Enable large base64 uploads for text/CSV/Excel documents
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Optional Password Gate (HTTP Basic Auth) for Cloud & Remote Deployments
const CLOUD_AUTH_PASSWORD = process.env.TERMINAL_PASSWORD || process.env.AUTH_PASSWORD;
if (CLOUD_AUTH_PASSWORD && CLOUD_AUTH_PASSWORD.trim()) {
  console.log('[Security Guard] Cloud Password Authentication ACTIVE.');
  app.use((req: Request, res: Response, next) => {
    if (req.path === '/api/health') return next();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Value Investing Terminal"');
      return res.status(401).send('Authentication required.');
    }
    const [scheme, credentials] = authHeader.split(' ');
    if (scheme !== 'Basic' || !credentials) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Value Investing Terminal"');
      return res.status(401).send('Authentication required.');
    }
    const decoded = Buffer.from(credentials, 'base64').toString('utf8');
    const [user, pass] = decoded.includes(':') ? decoded.split(':') : ['', decoded];
    const target = CLOUD_AUTH_PASSWORD.trim();
    if (pass === target || user === target || decoded === target) {
      return next();
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="Value Investing Terminal"');
    return res.status(401).send('Access denied. Invalid credentials.');
  });
}

// --- App State In-Memory ---
let state: SessionState = {
  config: null,
  files: [],
  auditPassed: false,
  activeStepIndex: 0,
  steps: generateSessionSteps(true),
  history: [],
  status: 'idle',
  currentPromptIndex: 0,
};

// --- Persistent Notification Configuration ---
const NOTIFICATION_CONFIG_FILE = path.join(DOWNLOADS_DIR, "notification_config.json");
let notificationConfig: NotificationConfig = {
  enabled: true,
  channels: { desktop: true, telegram: true, ntfy: false, email: true },
  telegram: { botToken: process.env.TELEGRAM_BOT_TOKEN || "", chatId: process.env.TELEGRAM_CHAT_ID || "", sendDossierDoc: true, docFormat: "both" },
  ntfy: { topic: "" },
  email: { provider: "resend", to: process.env.NOTIFICATION_EMAIL_TO || "", resendApiKey: process.env.RESEND_API_KEY || "" },
  events: { singleCompany: true, batchComplete: true, batchCompany: false, blockedAlert: true }
};

try {
  if (fs.existsSync(NOTIFICATION_CONFIG_FILE)) {
    const loaded = JSON.parse(fs.readFileSync(NOTIFICATION_CONFIG_FILE, "utf-8"));
    notificationConfig = {
      ...notificationConfig,
      ...loaded,
      events: { ...notificationConfig.events, ...(loaded.events || {}), blockedAlert: true }
    };
  }
} catch (cfgErr) {
  console.warn("[Notification Config Warning] Could not load saved config:", cfgErr);
}

// --- Lazy Gemini SDK initialization ---
function getApiHeaderKey(req: any): string {
  // Check explicit application custom headers first
  const headerKey = req.headers["x-gemini-key"] || req.headers["x-custom-key"];
  if (typeof headerKey === "string" && headerKey.trim()) {
    const clean = sanitizeApiKey(headerKey);
    if (clean) return clean;
  }
  // Check authorization header ONLY if it is a Bearer token or direct key, NEVER HTTP Basic auth
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.trim() && !authHeader.toLowerCase().startsWith("basic ")) {
    const clean = sanitizeApiKey(authHeader);
    if (clean) return clean;
  }
  return "";
}

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const cleanCustom = sanitizeApiKey(customApiKey);
  const cleanEnv = sanitizeApiKey(process.env.GEMINI_API_KEY);
  const key = cleanCustom || cleanEnv;
  if (!key) {
    throw new Error("GEMINI_API_KEY is missing. Please set your Gemini API key in /opt/terminal-v8/.env on the server or in the API Key Overrides panel of the UI.");
  }
  const source = cleanCustom ? "Client UI/Header Override" : "Server .env";
  console.log(`[Gemini Client] Initializing client using key from ${source} [${maskApiKey(key)}]`);
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      },
      timeout: 600000 // 10-minute timeout for deep financial reasoning
    }
  });
}

async function triggerOutOrBandPythonValuation(csvPath: string): Promise<void> {
  if (!state.config) return;
  try {
    console.log(`[Valuation Engine] Launching out-of-band Python Stream 1 valuation from ${csvPath}...`);
    let fxRate = 1.0;
    if (fs.existsSync(csvPath)) {
      try {
        const csvContent = fs.readFileSync(csvPath, "utf-8");
        const audit = await auditFinancialCsv(csvContent, path.basename(csvPath), state.config.ticker);
        if (audit.hasForeignCurrency && audit.fxRate > 0) {
          fxRate = audit.fxRate;
          if (state.config.isAdr === undefined) {
            state.config.isAdr = true;
          }
        }
      } catch (e) {}
    }
    state.pythonValuation = await runPythonValuation(csvPath, state.config, fxRate);
    console.log(`[Valuation Engine] Python valuation completed: Intrinsic Value = $${state.pythonValuation.dcf_expected.toFixed(2)}, Bolsa Multiple = ${state.pythonValuation.bolsa_multiple}x (Gate 12 passed)`);
  } catch (err) {
    console.warn(`[Valuation Engine] Out-of-band execution error:`, err);
  }
}

function runAudit(files: FileLog[], ticker?: string, period?: string, sessionMode?: SessionMode): { passed: boolean; checklist: AuditCheck[]; integrityReport?: DocumentIntegrityReport } {
  const activeTicker = ticker || state.config?.ticker || "";
  const activePeriod = period || state.config?.period || "";
  const activeMode = sessionMode || state.config?.sessionMode || 'full';

  const fileInputs = files.map(f => {
    let content: string | undefined;
    const localCachePath = path.join(DOWNLOADS_DIR, f.id);
    if (fs.existsSync(localCachePath)) {
      try {
        content = fs.readFileSync(localCachePath, "utf-8");
      } catch (e) {}
    }
    return {
      name: f.name,
      content,
      auditCategory: f.auditCategory,
      tokens: f.tokens,
      size: f.size
    };
  });

  return runAuditCore(fileInputs, {
    ticker: activeTicker,
    period: activePeriod,
    sessionMode: activeMode,
    priorDossierMemory: { hasPrior: Boolean(state.config?.priorDossierPath), name: state.config?.priorDossierPath ? path.basename(state.config.priorDossierPath) : undefined }
  });
}

function updateTokenCounts() {
  const uploadedTokens = state.files.reduce((sum, f) => sum + (f.tokens || 0), 0);
  
  const historyTokens = state.history.reduce((sum, msg) => {
    if (typeof msg.actualTokens === 'number') {
      return sum + msg.actualTokens;
    }
    return sum + Math.ceil(msg.text.length / 4.2);
  }, 0);
  
  state.uploadedTokens = uploadedTokens;
  state.liveTokensUsed = uploadedTokens + historyTokens;
}

// --- Enforce contextual execution instructions on top level ---
function getVoiceArchitecturePrompt(promptIndex: number, isCrosscheck: boolean): string {
  // Step 12 (Crosscheck), Step 10 (promptIndex 9: Red Team), Step 5 (promptIndex 4: Qualitative Audit), Step 3 (promptIndex 2: Cash Flow Integrity)
  if (isCrosscheck || promptIndex === 9 || promptIndex === 4 || promptIndex === 2) {
    return `CRITICAL VOICE DIRECTIVE — FORENSIC & DEFENSE VOICE (80% ASD-STE100):
- Active voice only: Eliminate passive voice constructions.
- One verb per sentence: Keep sentences short and direct (maximum 20-25 words).
- Zero corporate euphemisms: Ban 'headwinds', 'tailwinds', 'softness', 'synergies', 'streamlining'. State exact numbers and operational facts.
- Strict metric-to-finding assertions: State metric -> State threshold -> State audit finding (PASS / FLAG / BREACH).`;
  }

  // Step 1 (promptIndex 0): Hybrid Voice Architecture
  if (promptIndex === 0) {
    return `CRITICAL VOICE DIRECTIVE — HYBRID BIMODAL ARCHITECTURE:
- Sections 2.1–2.5 & 2.8: Strategic & Moat Voice (rich qualitative depth, business model mechanics, unit economics, capital allocation philosophy).
- Sections 2.6, 2.7, 2.9 (Test 2 & Test 3): 80% ASD-STE100 Forensic & Defense Voice (active voice, one verb per sentence, zero corporate euphemisms, strict PASS / FLAG / BREACH assertions for accounting quality, footnote debt, and buyback dilution).`;
  }

  // Steps 2, 4, 6, 7, 8, 9, 11 -> Strategic & Moat Voice
  return `CRITICAL VOICE DIRECTIVE — STRATEGIC & MOAT VOICE:
- Deep, nuanced, institutional economic reasoning emulating classical value investors.
- Rich qualitative depth, sustainable competitive moat dynamics, unit economics, and capital allocation philosophy.`;
}

function buildPromptRequest(promptIndex: number, currentStep: StepOutput) {
  const isHolding = state.config?.portfolio?.holdsPosition;
  const sessionMode = state.config?.sessionMode || 'full';

  if (sessionMode === 'slingshot') {
    const slingshotDirective = isHolding
      ? `USER PORTFOLIO CONTEXT: The user ALREADY HOLDS an existing position in ${state.config?.ticker || "this company"}.
- Entry Price / Cost Basis: $${state.config?.portfolio?.entryPrice ?? "N/A"}
- Portfolio Weight: ${state.config?.portfolio?.currentWeight ?? "N/A"}%
- Mandatory Verdict Rule: Because the user is an EXISTING HOLDER, the final portfolio action directive in Section 1 MUST strictly be HOLD, ACCUMULATE, or LIQUIDATE. Under our Never-Trim Compounding Doctrine, we NEVER trim positions simply because they grow large or trade at elevated multiples.`
      : `USER PORTFOLIO CONTEXT: Prospective NEW POSITION (zero existing holdings).
- Mandatory Verdict Rule: The suggested action in Section 1 MUST strictly be one of:
  - SUGGESTED ACTION: INVEST (if MoS >= 30%, clean forensic audit, and durable moat)
  - SUGGESTED ACTION: PASS (if structurally impaired, aggressive non-GAAP dilution, or overvalued)
  - SUGGESTED ACTION: ESCALATE TO FULL MODE (if intriguing qualitative moat, dynamic R&D capitalization divergence, complex multi-segment inflection, or close to hurdle requiring full 11-step deep-dive investigation)`;

    const customNotesText = state.config?.notes 
      ? `CUSTOM USER NOTES / STRATEGIC DIRECTIVES (MUST ENFORCE):\n"${state.config.notes}"\n` 
      : "";

    const slingshotVoicePrompt = `CRITICAL VOICE DIRECTIVE — ASD-STE100 FORENSIC & UNDERWRITING VOICE (80% ASD-STE100):
- Active voice only: Eliminate passive voice constructions.
- One primary verb per sentence: Keep sentences short, punchy, and declarative (maximum 15-20 words).
- Zero corporate euphemisms: Strictly ban 'headwinds', 'tailwinds', 'softness', 'synergies', 'navigating', 'dynamic environment'. State empirical operational facts and exact dollar figures.
- Strict metric-to-finding assertions: [Metric] is [Value]. [Desk Standard / Benchmark] was [Threshold]. [Finding: PASS / FLAG / BREACH].
- High-density bullet format: Output exactly 2-3 high-impact declarative bullet points per subsection. Zero multi-paragraph narrative essays.`;

    return `CRITICAL INSTRUCTIONS: The financial filings, macro reports, and CSV spreadsheets are attached to this context under reference files.
Do NOT ask the user to provide them again, and do NOT pretend they are absent.

${slingshotVoicePrompt}

Ticker Context: ${state.config?.ticker}
Reporting Period: ${state.config?.period}
Market Valuation Price: $${state.config?.price}
${slingshotDirective}

${customNotesText}

Perform the following analytical step immediately using files attached to this prompt contents list, providing the completed analysis with pristine, readable tables and markdown structure.

${currentStep.prompt}`;
  }

  if (sessionMode === 'sentinel') {
    const sentinelDirective = `USER PORTFOLIO CONTEXT: Active Position Monitoring.
- Entry Price / Cost Basis: $${state.config?.portfolio?.entryPrice ?? "N/A"}
- Portfolio Weight: ${state.config?.portfolio?.currentWeight ?? "N/A"}%
- Mandatory Verdict Rule: The final portfolio action directive MUST strictly be HOLD, ACCUMULATE, or LIQUIDATE. (TRIM is permanently banned under our Never-Trim Compounding Doctrine).
- Isolation Gates: Evaluate the 4 Isolation Gates (1. Moat Breach, 2. Capital Allocation Malpractice, 3. Deteriorating Runway / Disruption, 4. Chronic Value Destruction) before rendering your verdict.`;

    const customNotesText = state.config?.notes 
      ? `CUSTOM USER NOTES / STRATEGIC DIRECTIVES (MUST ENFORCE):\n"${state.config.notes}"\n` 
      : "";

    return `CRITICAL INSTRUCTIONS: The financial filings, macro reports, refreshed 40Q financial CSV, and Prior Dossier are attached to this context under reference files.
Do NOT ask the user to provide them again, and do NOT pretend they are absent.

${getVoiceArchitecturePrompt(0, false)}

Ticker Context: ${state.config?.ticker}
Reporting Period: ${state.config?.period}
Market Valuation Price: $${state.config?.price}
${sentinelDirective}

${customNotesText}

Perform the following analytical step immediately using files attached to this prompt contents list, providing the completed analysis with pristine, readable tables and markdown structure.

${currentStep.prompt}`;
  }

  const portfolioDirective = isHolding
    ? `USER PORTFOLIO CONTEXT: The user ALREADY HOLDS an existing position in ${state.config?.ticker || "this company"}.
- Entry Price / Cost Basis: $${state.config?.portfolio?.entryPrice ?? "N/A"}
- Portfolio Weight: ${state.config?.portfolio?.currentWeight ?? "N/A"}%
- Mandatory Verdict Rule: Because the user is an EXISTING HOLDER, the final portfolio action directive in Step 11 MUST strictly be HOLD, ACCUMULATE, or LIQUIDATE. Under our Never-Trim Compounding Doctrine, we NEVER trim positions simply because they grow large or trade at elevated multiples; if the story is intact, the verdict is strictly HOLD (or ACCUMULATE if deeply undervalued). Any PASS, INVEST, or TRIM verdict rendered on an existing holding is a severe methodology breach.`
    : `USER PORTFOLIO CONTEXT: Prospective NEW POSITION (zero existing holdings).
- Mandatory Verdict Rule: The final portfolio action directive in Step 11 MUST strictly be INVEST or PASS. Any HOLD, ACCUMULATE, TRIM, or LIQUIDATE verdict rendered for a new prospective buyer is a severe methodology breach.`;

  if (currentStep.isCrosscheck || promptIndex >= MASTER_PROMPTS.length) {
    const completedAnalyses = state.steps
      .filter(s => !s.isCrosscheck && s.status === 'completed' && s.response)
      .map(s => `## [${STEP_CHAPTER_TITLES[s.index + 1] || `Step ${s.index + 1}: ${s.title}`}]\n\n${s.response}`)
      .join("\n\n---\n\n");

    return `CRITICAL AUDIT INSTRUCTIONS:
You are acting as the independent Forensic Financial Auditor and Fact-Checker.
${getVoiceArchitecturePrompt(promptIndex, true)}

The target company's primary 10-K, 10-Q, earnings transcripts, and financial tables are attached to this context as your immutable ground truth.

Target Ticker: ${state.config?.ticker}
Reporting Period: ${state.config?.period}
Current Market Price: $${state.config?.price}

${portfolioDirective}

${state.config?.notes ? `CUSTOM USER NOTES / STRATEGIC DIRECTIVES:\n"${state.config.notes}"\n` : ""}
=== COMPILED VALUATION ANALYSIS REPORT TO AUDIT (STEPS 1-${MASTER_PROMPTS.length}) ===
${completedAnalyses || "*(No prior step outputs recorded)*"}
================================================================

${currentStep.prompt}`;
  }

  let portfolioText = "";

  if (promptIndex < MASTER_PROMPTS.length - 1) {
    portfolioText = isHolding
      ? `HOLDING CONTEXT: User already holds a position in this firm. original price: ${state.config?.portfolio?.entryPrice}, current weight: ${state.config?.portfolio?.currentWeight}%. Keep this context in mind throughout. You are STILL in the intermediate analysis phases. You are STRICTLY FORBIDDEN from outputting any final buy/sell recommendations, portfolio allocation directives (INVEST, PASS, HOLD, ACCUMULATE, LIQUIDATE), or final investment verdicts yet. Do NOT render any premature portfolio verdicts; focus strictly and exclusively on satisfying the checklist items and valuation calculations of this current analytical step.`
      : `NEW POSITION: User does not hold any shares yet. Keep this context in mind throughout. You are STILL in the intermediate analysis phases. You are STRICTLY FORBIDDEN from outputting any final buy/sell recommendations, portfolio allocation directives (INVEST, PASS, HOLD, ACCUMULATE, LIQUIDATE), or final investment verdicts yet. Do NOT render any premature portfolio verdicts; focus strictly and exclusively on satisfying the checklist items and valuation calculations of this current analytical step.`;
  } else {
    portfolioText = isHolding
      ? `HOLDING CONTEXT: User already holds a position in this firm. original price: ${state.config?.portfolio?.entryPrice}, current weight: ${state.config?.portfolio?.currentWeight}%. You are now in the final synthesis stage. Synthesize all previously compiled data and render your final definitive investment verdict and clear portfolio allocations/sizing. Remember our fundamental mandate: we NEVER trim positions simply because they grew large or trade at elevated multiples; as long as the moat and fundamental story are intact, the verdict is strictly HOLD (or ACCUMULATE if undervalued, or LIQUIDATE if the core moat is broken).`
      : `NEW POSITION: User does not hold any shares yet. You are now in the final synthesis stage. Verify the target price and margin of safety to decide and output a definitive, clear INVEST or PASS decision in your final analysis.`;
  }

  const customNotesText = state.config?.notes 
    ? `CUSTOM USER NOTES / STRATEGIC DIRECTIVES (MUST ENFORCE):
"${state.config.notes}"`
    : "";

  return `CRITICAL INSTRUCTIONS: The financial filings, macro reports, and CSV spreadsheets are attached to this context under reference files. 
Do NOT ask the user to provide them again, and do NOT pretend they are absent. 

${getVoiceArchitecturePrompt(promptIndex, false)}

Ticker Context: ${state.config?.ticker}
Reporting Period: ${state.config?.period}
Market Valuation Price: $${state.config?.price}
${portfolioText}

${customNotesText}

Perform the following analytical step immediately using files attached to this prompt contents list, providing the completed analysis with pristine, readable tables and markdown structure.

${currentStep.prompt}`;
}

async function prepareFileContextParts(ai: any, files: FileLog[]): Promise<any[]> {
  const parts: any[] = [];
  const expectedFiles = files.filter(f => f.id !== "compiled-obsidian-report");

  if (expectedFiles.length > 0) {
    const manifestLines = expectedFiles.map((f, idx) => `${idx + 1}. \`${f.name}\` (${f.auditCategory || "Source Document"})`);
    parts.push({
      text: `### Source Documents\nThe following verified source documents are attached to this evaluation session in exact sequential order:\n${manifestLines.join("\n")}\n`
    });
  }

  let attachedFilesCount = 0;

  for (const f of expectedFiles) {
    const localCachePath = path.join(DOWNLOADS_DIR, f.id);
    const hasLocalCache = fs.existsSync(localCachePath);

    let validUri = f.geminiUri;
    const isRecentlyVerified = validUri && f.geminiName && f.fileUriVerifiedAt && (Date.now() - f.fileUriVerifiedAt < 24 * 60 * 60 * 1000);

    if (f.geminiName && !isRecentlyVerified) {
      try {
        const check = await ai.files.get({ name: f.geminiName });
        if (check && check.uri) {
          validUri = check.uri;
          f.geminiUri = check.uri;
          f.fileUriVerifiedAt = Date.now();
        } else {
          validUri = undefined;
        }
      } catch (err: any) {
        console.log(`[Gemini File Sync] Existing file URI invalid or permission mismatch for ${f.name}. Refreshing...`);
        validUri = undefined;
      }
    }

    // If URI is missing or inaccessible, attempt to re-upload cached file
    if (!validUri && hasLocalCache) {
      try {
        console.log(`[Gemini File Sync] Re-uploading cached document to Gemini Files API: ${f.name}`);
        const uploadedFile = await ai.files.upload({
          file: localCachePath,
          config: {
            mimeType: f.mimeType || "text/plain"
          }
        });
        if (uploadedFile && uploadedFile.uri) {
          validUri = uploadedFile.uri;
          f.geminiUri = uploadedFile.uri;
          f.geminiName = uploadedFile.name;
          f.fileUriVerifiedAt = Date.now();
        }
      } catch (uploadErr: any) {
        console.warn(`[Gemini File Sync Upload Failed] Could not upload via Files API for ${f.name}:`, uploadErr?.message || uploadErr);
      }
    }

    if (validUri) {
      parts.push({
        fileData: {
          fileUri: validUri,
          mimeType: f.mimeType
        }
      });
      attachedFilesCount++;
    } else if (hasLocalCache) {
      // Fallback: If Files API upload failed, attach text or inline data
      try {
        const fileBuffer = await fs.promises.readFile(localCachePath);
        if (f.mimeType?.startsWith("text/") || f.name.endsWith(".txt") || f.name.endsWith(".csv") || f.name.endsWith(".md") || f.name.endsWith(".json")) {
          const textStr = fileBuffer.toString("utf-8");
          parts.push({
            text: `\n=== SOURCE DOCUMENT: ${f.name} (${f.auditCategory || "Document"}) ===\n${textStr}\n=== END OF DOCUMENT ===\n`
          });
          attachedFilesCount++;
        } else if (fileBuffer.length <= 15 * 1024 * 1024) {
          parts.push({
            inlineData: {
              data: fileBuffer.toString("base64"),
              mimeType: f.mimeType || "application/octet-stream"
            }
          });
          attachedFilesCount++;
        }
      } catch (inlineErr) {
        console.warn(`[Gemini File Inline Error] Could not read local file ${f.name}`, inlineErr);
      }
    }
  }

  // Zero-Drop Context Invariant: Ensure 100% of non-report staged files are successfully attached
  if (attachedFilesCount !== expectedFiles.length) {
    const attachedUris = new Set(parts.map(p => p.fileData?.fileUri).filter(Boolean));
    const missing = expectedFiles.filter(f => !f.geminiUri || !attachedUris.has(f.geminiUri));
    const missingNames = missing.map(m => m.name).join(", ") || "Unknown document";
    throw new Error(`CRITICAL INTEGRITY HALT: Document Roll Call failed. Expected ${expectedFiles.length} filings in context, but only ${attachedFilesCount} attached. Missing: [${missingNames}]. Pipeline execution halted to prevent analysis on incomplete financial data.`);
  }

  return parts;
}

// --- Local Ollama Integration Helpers ---
async function fetchLocalOllamaModels(): Promise<Array<{ name: string; displayName: string }>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch("http://127.0.0.1:11434/api/tags", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json() as any;
      if (Array.isArray(data.models)) {
        return data.models.map((m: any) => ({
          name: `ollama/${m.name}`,
          displayName: `[Local Ollama] ${m.name}`
        }));
      }
    }
  } catch (err) {
    // Ollama not reachable; return empty list quietly
  }
  return [];
}

async function prepareOllamaFileContext(files: FileLog[], maxChars: number = 40000): Promise<string> {
  const fileBlocks: string[] = [];
  let currentTotalChars = 0;

  for (const f of files) {
    if (f.id === "compiled-obsidian-report") continue;
    const localCachePath = path.join(DOWNLOADS_DIR, f.id);
    if (fs.existsSync(localCachePath)) {
      try {
        const fileBuffer = await fs.promises.readFile(localCachePath);
        if (f.mimeType?.startsWith("text/") || f.name.endsWith(".txt") || f.name.endsWith(".csv") || f.name.endsWith(".md") || f.name.endsWith(".json")) {
          let textStr = fileBuffer.toString("utf-8");
          if (textStr.length > 15000) {
            textStr = textStr.slice(0, 15000) + "\n\n... [TRUNCATED FOR LOCAL OLLAMA CONTEXT BUDGET] ...";
          }
          const block = `=== SOURCE DOCUMENT: ${f.name} (${f.auditCategory || "Document"}) ===\n${textStr}\n=== END OF DOCUMENT ===\n`;
          if (currentTotalChars + block.length <= maxChars) {
            fileBlocks.push(block);
            currentTotalChars += block.length;
          }
        }
      } catch (err) {
        console.warn(`[Ollama File Context Error] Could not read file ${f.name}`, err);
      }
    }
  }

  return fileBlocks.join("\n\n");
}

async function generateContentWithOllama(
  modelNameWithPrefix: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.2
): Promise<{ text: string; usageMetadata: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number } }> {
  const rawModel = modelNameWithPrefix.replace(/^ollama\//i, "");

  console.log(`[Ollama Generation Engine] Calling local model: ${rawModel} with ${messages.length} messages...`);

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: rawModel,
      messages: messages,
      stream: false,
      options: {
        temperature: temperature,
        num_ctx: 16384
      }
    });

    const options: http.RequestOptions = {
      hostname: "127.0.0.1",
      port: 11434,
      path: "/api/chat",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      },
      timeout: 0 // Never timeout while local model is evaluating
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            const responseText = parsed.message?.content || "";
            const promptTokens = parsed.prompt_eval_count || Math.ceil(messages.reduce((sum, m) => sum + m.content.length, 0) / 4.2);
            const candidateTokens = parsed.eval_count || Math.ceil(responseText.length / 4.2);
            resolve({
              text: responseText,
              usageMetadata: {
                promptTokenCount: promptTokens,
                candidatesTokenCount: candidateTokens,
                totalTokenCount: promptTokens + candidateTokens
              }
            });
          } catch (e) {
            reject(new Error("Failed to parse Ollama JSON response: " + data));
          }
        } else {
          reject(new Error(`Ollama returned status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// --- Active Retry Management for Unsupervised Resilience ---
let activeRetryTimeout: NodeJS.Timeout | null = null;
const activeStepRetryCounts: Map<number, number> = new Map();
const activeStepStartTimes: Map<number, number> = new Map();
let activeBatchStepCallback: ((stepIdx: number, stepTitle: string) => void) | null = null;

function clearRetryTimer() {
  if (activeRetryTimeout) {
    clearTimeout(activeRetryTimeout);
    activeRetryTimeout = null;
  }
}

function isTransientError(err: any): boolean {
  if (!err) return false;
  const msg = (err?.message || String(err)).toLowerCase();
  const code = String(err?.code || err?.status || err?.statusCode || '');
  
  // 503 UNAVAILABLE / High demand
  if (code === '503' || msg.includes('503') || msg.includes('unavailable') || msg.includes('high demand') || msg.includes('temporarily unavailable') || msg.includes('spikes in demand')) {
    return true;
  }
  // 429 RESOURCE_EXHAUSTED / Rate limit
  if (code === '429' || msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('rate limit') || msg.includes('quota') || msg.includes('too many requests')) {
    return true;
  }
  // 500, 502, 504 server errors
  if (code === '500' || code === '502' || code === '504' || msg.includes('internal error') || msg.includes('bad gateway') || msg.includes('gateway timeout') || msg.includes('deadline exceeded')) {
    return true;
  }
  // Transient network / socket errors, severed SSE streams, JSON truncation
  if (
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('socket hang up') ||
    msg.includes('fetch failed') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('incomplete json') ||
    msg.includes('premature close') ||
    msg.includes('unexpected end') ||
    msg.includes('response body is empty') ||
    msg.includes('broken pipe') ||
    msg.includes('rst_stream') ||
    msg.includes('stream timeout') ||
    msg.includes('und_err_info')
  ) {
    return true;
  }
  return false;
}

async function generateContentWithRetry(ai: any, params: any, maxRetries = 6, initialDelay = 2000) {
  let attempt = 0;
  let currentParams = { ...params };
  const originalRequestedModel = params.model;
  let fallbackInfo: { originalModel: string; fallbackModel: string; reason: string } | undefined = undefined;

  while (true) {
    try {
      const hasTools = Array.isArray(currentParams.config?.tools) && currentParams.config.tools.length > 0;
      const effectiveServiceTier = hasTools ? undefined : (currentParams.config?.serviceTier || state.config?.serviceTier || "flex");
      const nonStreamParams = {
        ...currentParams,
        config: {
          ...currentParams.config,
          ...(effectiveServiceTier ? { serviceTier: effectiveServiceTier } : {})
        }
      };
      const response = await ai.models.generateContent(nonStreamParams);
      return {
        text: response.text,
        usageMetadata: response.usageMetadata,
        effectiveModel: currentParams.model,
        fallbackInfo,
        finishReason: response.candidates?.[0]?.finishReason
      };
    } catch (err: any) {
      attempt++;
      const errMsg = (err?.message || String(err)).toLowerCase();
      const isTransient = isTransientError(err);
      const effectiveMaxRetries = isTransient ? maxRetries : 2;
      console.warn(`[Gemini API Warning] Attempt ${attempt} failed (transient: ${isTransient}): ${err?.message || err}`);

      // Spike-Proof Tool Defense: If a tool-enabled call fails on Attempt 1 with 503/timeout/socket error, disable tools on Attempt 2
      if (currentParams.config?.tools && (isTransient || errMsg.includes("503") || errMsg.includes("timeout") || errMsg.includes("socket") || errMsg.includes("unavailable"))) {
        console.warn(`[Gemini API Tool Spike Defense] Disabling search tool on attempt ${attempt + 1} after transient failure to prevent repeated paid search queries...`);
        currentParams = {
          ...currentParams,
          config: {
            ...currentParams.config,
            tools: undefined
          }
        };
        continue;
      }

      // Handle 403 PERMISSION_DENIED or search tool permissions
      if (currentParams.config?.tools && (errMsg.includes("403") || errMsg.includes("permission_denied") || errMsg.includes("caller does not have permission") || errMsg.includes("tool") || errMsg.includes("grounding"))) {
        console.log(`[Gemini API Fallback] Disabling googleSearch tool due to 403 permission restriction and retrying...`);
        currentParams = {
          ...currentParams,
          config: {
            ...currentParams.config,
            tools: undefined
          }
        };
        continue;
      }

      // Handle model not found / model permission restriction
      if (errMsg.includes("404") || (errMsg.includes("403") && !currentParams.config?.tools)) {
        if (currentParams.model !== "gemini-3.8-flash" && currentParams.model !== "models/gemini-3.8-flash") {
          console.log(`[Gemini API Model Fallback] Switching model from ${currentParams.model} to gemini-3.8-flash...`);
          fallbackInfo = {
            originalModel: originalRequestedModel,
            fallbackModel: "gemini-3.8-flash",
            reason: `Model not found or permission error: ${errMsg.slice(0, 80)}`
          };
          currentParams = {
            ...currentParams,
            model: "gemini-3.8-flash"
          };
          continue;
        }
      }

      if (attempt >= effectiveMaxRetries) {
        throw err;
      }

      // Calculate delay with exponential backoff and jitter (capped at 60s)
      const baseDelay = initialDelay * Math.pow(2, attempt - 1);
      const delay = Math.min(60000, baseDelay) + Math.floor(Math.random() * 1000);
      console.log(`[Gemini API In-Flight Retry] ${isTransient ? 'High demand / transient spike detected.' : 'Retrying...'} Attempt ${attempt + 1}/${effectiveMaxRetries} in ${Math.round(delay / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// --- Background loop processor for sequentially running prompts ---
async function runStepProcessor(startingIdx: number) {
  state.status = 'running';
  
  if (startingIdx === 0 && !state.hasDispatchedStartNotification) {
    state.hasDispatchedStartNotification = true;
    const mode = state.config?.sessionMode || 'full';
    const modeLabel = mode === 'slingshot' ? 'Mode 1: Slingshot Triage' : mode === 'sentinel' ? 'Mode 3: Quarterly Sentinel' : 'Mode 2: Full Institutional Dossier';
    dispatchNotification(notificationConfig, {
      event: 'session_start',
      title: `⚡ Valuation Started: ${state.config?.ticker || "Company"} (${state.config?.period || "N/A"})`,
      message: `Initiating ${modeLabel} for ${state.config?.ticker} at $${state.config?.price}. Service Tier: ${state.config?.serviceTier?.toUpperCase() || 'FLEX'}.`,
      ticker: state.config?.ticker,
      period: state.config?.period,
      price: state.config?.price,
      sessionMode: mode
    }).catch(err => console.warn("[Notification Warning] Start dispatch:", err.message));
  }

  for (let i = startingIdx; i < state.steps.length; i++) {
    // Check if state is still running
    if (state.status !== 'running') {
      break;
    }

    state.activeStepIndex = i;
    state.currentPromptIndex = i;
    const step = state.steps[i];
    step.status = 'executing';
    activeBatchStepCallback?.(i, step.title);

    try {
      const isCrosscheck = step.isCrosscheck || i >= MASTER_PROMPTS.length;
      
      let modelToUse = state.config?.model || "models/gemini-3.8-flash";
      if (isCrosscheck && state.config?.crosscheckModel && state.config.crosscheckModel !== "default") {
        modelToUse = state.config.crosscheckModel;
      }
      console.log(`[Executing Analyst Engine] Step ${i + 1}/${state.steps.length}: ${step.title} | Model: ${modelToUse} | Tier: ${state.config?.serviceTier || 'flex'}`);
      const temperature = isCrosscheck ? 0.0 : (step.temperature ?? 0.2);
      const thinkingLevel = (step.thinkingLevel || "high") as "low" | "medium" | "high";

      let responseText = "";
      let promptTokens = 0;
      let replyTokens = 0;

      const isOllamaModel = modelToUse.toLowerCase().includes("ollama") || modelToUse.toLowerCase().includes("qwen") || modelToUse.toLowerCase().includes("gemma");

      if (isOllamaModel) {
        console.log(`[Executing Analyst Engine via Ollama] Model: ${modelToUse} (Crosscheck: ${isCrosscheck})`);
        const ollamaMessages: Array<{ role: string; content: string }> = [
          { role: "system", content: VALUE_INVESTING_SYSTEM_INSTRUCTION }
        ];

        const fileContextText = await prepareOllamaFileContext(state.files);
        if (fileContextText) {
          ollamaMessages.push({
            role: "user",
            content: `These are the target company's financial records, SEC filings, earnings transcripts, and supplementary CSV datasets:\n\n${fileContextText}\n\nIndex them as your reference context.`
          });
          ollamaMessages.push({
            role: "assistant",
            content: "Acknowledged. I have indexed these reference materials as my core contextual memory prefix. I am ready to perform analysis with precise citations."
          });
        }

        state.history.forEach(msg => {
          ollamaMessages.push({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.text
          });
        });

        const enforcedPrompt = buildPromptRequest(i, step);
        ollamaMessages.push({
          role: "user",
          content: enforcedPrompt
        });

        const ollamaRes = await generateContentWithOllama(modelToUse, ollamaMessages, temperature);
        responseText = ollamaRes.text || "Analyzed successfully with no direct text response.";
        promptTokens = ollamaRes.usageMetadata.promptTokenCount;
        replyTokens = ollamaRes.usageMetadata.candidatesTokenCount;
        console.log(`[Ollama Telemetry] Step ${i + 1}: Prompt tokens = ${promptTokens}, Candidate tokens = ${replyTokens}`);
      } else {
        const ai = getGeminiClient(state.customApiKey);
        // Extract file components safely with validation and fallback
        const fileParts = await prepareFileContextParts(ai, state.files);

        // Construct cache-optimized contents array
        const contents: any[] = [];

        // 1. Immutable Caching Prefix: heavy files are attached first
        if (fileParts.length > 0) {
          contents.push({
            role: "user",
            parts: [
              ...fileParts,
              { text: "These are the target company's financial records, SEC filings, earnings transcripts, and supplementary CSV datasets. Index them as your immutable reference context." }
            ]
          });
          contents.push({
            role: "model",
            parts: [{ text: "Acknowledged. I have indexed these reference materials as my core contextual memory prefix. I am ready to perform analysis with precise citations." }]
          });
        }

        // 2. Append session logs / previous turns (strictly dialogue turns, never system errors to preserve prompt cache)
        state.history
          .filter(msg => msg.role === 'user' || msg.role === 'model')
          .forEach(msg => {
            contents.push({
              role: msg.role === 'model' ? 'model' : 'user',
              parts: [{ text: msg.text }]
            });
          });

        // 3. Build and append system-enforced prompt for the latest turn
        const enforcedPrompt = buildPromptRequest(i, step);
        contents.push({
          role: "user",
          parts: [{ text: enforcedPrompt }]
        });

        // Pre-Flight Invariance: Eliminate runtime tool toggles in the main 12-step generation pipeline to preserve 100% KV prefix cache invariance.
        const toolsConfig = undefined;

        const response = await generateContentWithRetry(ai, {
          model: modelToUse,
          contents: contents,
          config: {
            thinkingConfig: {
              thinkingLevel: thinkingLevel
            },
            systemInstruction: VALUE_INVESTING_SYSTEM_INSTRUCTION,
            serviceTier: state.config?.serviceTier || "flex",
            ...(toolsConfig ? { tools: toolsConfig } : {})
          }
        });

        if (!response.text || response.text.trim().length === 0) {
          throw new Error(`Gemini API returned empty response text for Step ${i + 1}. Candidate generation failed.`);
        }
        responseText = response.text;
        if (response.effectiveModel) {
          modelToUse = response.effectiveModel;
        }
        if (response.fallbackInfo) {
          step.fallback = response.fallbackInfo;
        }
        if (response.finishReason) {
          step.finishReason = response.finishReason;
          if (response.finishReason === 'MAX_TOKENS') {
            step.truncated = true;
            console.warn(`[Integrity Warning] Step ${i + 1} candidate hit MAX_TOKENS limit. Output may be truncated.`);
          }
        }
        if (response.usageMetadata) {
          promptTokens = response.usageMetadata.promptTokenCount || 0;
          replyTokens = response.usageMetadata.candidatesTokenCount || 0;
          const cachedTokens = (response.usageMetadata as any).cachedContentTokenCount || 0;
          if (cachedTokens > 0) {
            state.cachedTokenCount = cachedTokens;
            state.cacheStatus = 'active';
            console.log(`[Gemini Prompt Flow Telemetry] Step ${i + 1}: Prompt = ${promptTokens}, Candidate = ${replyTokens}, Cached = ${cachedTokens} (Native implicit cache hit), Total = ${response.usageMetadata.totalTokenCount}`);
          } else {
            state.cacheStatus = 'bypassed';
            console.log(`[Gemini Prompt Flow Telemetry] Step ${i + 1}: Prompt tokens = ${promptTokens}, Candidate tokens = ${replyTokens}, Total = ${response.usageMetadata.totalTokenCount}`);
          }
        }
      }

      // Record result
      step.status = 'completed';
      step.response = responseText;
      step.model = modelToUse;
      if (isCrosscheck) {
        state.crosscheckVerdict = parseCrosscheckVerdict(responseText);
        console.log(`[Crosscheck Verdict] Passed: ${state.crosscheckVerdict.gatesPassed}/${state.crosscheckVerdict.totalGates}, Breach: ${state.crosscheckVerdict.hasBreach}`);
      }

      // Back on Track Recovery: If step recovered from an active Auto-Resume Cooldown, dispatch alert
      const priorAttempts = activeStepRetryCounts.get(i) || 0;
      const stepStartTime = activeStepStartTimes.get(i);
      const elapsedMin = stepStartTime ? Math.round((Date.now() - stepStartTime) / 60000) : 0;

      if (priorAttempts > 0) {
        console.log(`[Auto-Resume Recovery] Step ${i + 1} ("${step.title}") recovered successfully after ${priorAttempts} cooldown attempt(s) (${elapsedMin}m). Dispatching recovery notification.`);
        dispatchNotification(notificationConfig, {
          event: 'cooldown_recovered',
          title: `✅ Valuation Back on Track: ${state.config?.ticker || "Company"}`,
          message: `Step ${i + 1} ("${step.title}") cleared cluster saturation after ${priorAttempts} cooldown attempt(s) (${elapsedMin}m wait) on ${state.config?.serviceTier?.toUpperCase() || 'FLEX'} tier. Pipeline execution resumed.`,
          ticker: state.config?.ticker,
          period: state.config?.period,
          price: state.config?.price
        }).catch(err => console.warn("[Notification Warning] Cooldown recovery alert:", err.message));
      }

      activeStepRetryCounts.delete(i);
      activeStepStartTimes.delete(i);
      clearRetryTimer();
      state.retryState = null;

      const uploadedTokens = state.files.reduce((sum, f) => sum + (f.tokens || 0), 0);
      const previousHistoryTokens = state.history.reduce((sum, msg) => sum + (msg.actualTokens || Math.ceil(msg.text.length / 4.2)), 0);
      const userTurnTokens = Math.max(0, promptTokens - uploadedTokens - previousHistoryTokens);

      // Append to session log
      state.history.push({
        role: 'user',
        text: step.prompt,
        type: isCrosscheck ? 'crosscheck' : 'master_prompt',
        index: i,
        timestamp: new Date().toISOString(),
        actualTokens: userTurnTokens
      });
      state.history.push({
        role: 'model',
        text: responseText,
        timestamp: new Date().toISOString(),
        actualTokens: replyTokens,
        model: modelToUse
      });

      // Update auto-accumulating Obsidian report file in Document Repository
      await updateCompiledReportFile();

      console.log(`[Analyst Engine Completed] Step ${i + 1} finalized successfully.`);

      // Handle pause conditions
      const mode = state.config?.executionMode;
      if (mode === ExecutionMode.Surgical) {
        state.status = 'paused';
        console.log(`[User Feedback Loop Activates] Surgical block pause.`);
        break;
      }

    } catch (err: any) {
      console.error(`[CRITICAL ERROR in Analyst Step ${i + 1}]`, err);
      let detailedError = err.message || String(err);
      if (err.cause) {
        detailedError += ` (Cause: ${err.cause.message || err.cause.code || JSON.stringify(err.cause)})`;
      }

      const isTransient = isTransientError(err);
      const currentAttempts = (activeStepRetryCounts.get(i) || 0) + 1;
      const maxStepRetries = 60; // 60 attempts * 45s = 45 minutes maximum wait window prior to cache eviction
      const stepStartTime = activeStepStartTimes.get(i) || Date.now();
      if (!activeStepStartTimes.has(i)) activeStepStartTimes.set(i, stepStartTime);

      const elapsedMs = Date.now() - stepStartTime;
      const MAX_WAIT_MS = 45 * 60 * 1000; // 45 minutes

      if (isTransient && currentAttempts <= maxStepRetries && elapsedMs < MAX_WAIT_MS) {
        activeStepRetryCounts.set(i, currentAttempts);
        const cooldownMs = 45000;
        console.warn(`[Analyst Step Auto-Resume Cooldown] Step ${i + 1} ("${step.title}") encountered transient API spike / cluster saturation (${detailedError}). Entering cooldown (${currentAttempts}/${maxStepRetries}, ${Math.round(elapsedMs / 60000)}m elapsed), retrying in ${cooldownMs / 1000}s...`);

        step.status = 'idle';
        state.status = 'retrying';
        state.retryState = {
          active: true,
          stepIndex: i,
          stepTitle: step.title,
          attempt: currentAttempts,
          maxAttempts: maxStepRetries,
          nextRetryTimestamp: Date.now() + cooldownMs,
          error: detailedError
        };

        // Dispatch Telegram alert on Attempt 1 so user is notified immediately without repeated spam every 45s
        if (currentAttempts === 1) {
          dispatchNotification(notificationConfig, {
            event: 'cooldown_alert',
            title: `⏳ Flex Tier Saturated: ${state.config?.ticker || "Company"}`,
            message: `Step ${i + 1} ("${step.title}") encountered transient Flex cluster saturation:\n\n"${detailedError}"\n\n⚠️ ACTION REQUIRED: The terminal is waiting in the Auto-Resume queue on FLEX tier (retrying every 45s). To bypass the queue and run immediately on Standard Tier, open the terminal UI and click [⚡ Switch to Standard], or leave it to keep waiting for Flex capacity.`,
            ticker: state.config?.ticker,
            period: state.config?.period,
            price: state.config?.price
          }).catch(notifErr => console.warn("[Notification Warning] Cooldown alert:", notifErr.message));
        }

        clearRetryTimer();
        activeRetryTimeout = setTimeout(() => {
          console.log(`[Auto-Resume Engaged] Cooldown completed for Step ${i + 1}. Resuming analysis...`);
          state.retryState = null;
          state.status = 'running';
          runStepProcessor(i);
        }, cooldownMs);

        break;
      }

      // Hard failure if not transient or max retries exhausted
      step.status = 'failed';
      state.status = 'failed';
      state.retryState = null;
      activeStepRetryCounts.delete(i);
      clearRetryTimer();

      state.history.push({
        role: 'system',
        text: `Error executing step ${i + 1}: ${detailedError}`,
        timestamp: new Date().toISOString()
      });

      // Auto-dispatch failure alert
      dispatchNotification(notificationConfig, {
        event: 'blocked_alert',
        title: `⚠️ Valuation Stalled on Error: ${state.config?.ticker || "Company"}`,
        message: `Step ${i + 1} ("${step.title}") failed after ${currentAttempts} retry attempts: ${detailedError}`,
        ticker: state.config?.ticker,
        period: state.config?.period,
        price: state.config?.price
      }).catch(notifErr => console.warn("[Notification Warning] Failure alert:", notifErr.message));

      break;
    }
  }

  // End conditions
  if (state.activeStepIndex === state.steps.length - 1 && state.steps[state.steps.length - 1].status === 'completed') {
    state.status = 'completed';
    console.log(`[Valuation Analyst Terminal Runs Complete] Output generated.`);

    // Auto-dispatch single company completion notification
    try {
      const compiledMd = await updateCompiledReportFile();
      const modelName = (state.config?.model || "").replace("models/", "") || "generic";
      const tickerStr = state.config?.ticker || "UNSPECIFIED";
      const periodStr = state.config?.period || "UNSPECIFIED";
      const formattedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
      const isInterim = isInterimEarningsReleaseSession();
      const releaseTag = isInterim ? "_Earnings_Release" : "";
      const sessionMode = state.config?.sessionMode || 'full';
      let modeTag = "_Complete Doc_";
      if (sessionMode === 'slingshot') {
        modeTag = "_Slingshot_Memo_";
      } else if (sessionMode === 'sentinel') {
        modeTag = "_Sentinel_Pulse_";
      }
      const mdFileName = `${tickerStr} ${periodStr}${releaseTag}${modeTag}${modelName}_${formattedDate}.md`;
      const docTitle = `${tickerStr} - ${periodStr}${isInterim ? ' (Earnings Release)' : ''} Deep Valuation Dossier (${modelName})`;
      const htmlContent = convertMarkdownToHtml(compiledMd, docTitle, tickerStr);
      const htmlFileName = `${tickerStr} ${periodStr}${releaseTag}_Valuation_Dossier_${modelName}_${formattedDate}.html`;

      const fm = extractFrontmatter(compiledMd, tickerStr, periodStr, state.config?.price, modelName);
      const ivMatch = fm.match(/intrinsic_value:\s*([^\r\n]+)/);
      const mosMatch = fm.match(/margin_of_safety:\s*"([^"\r\n]+)"/);
      const decMatch = fm.match(/decision:\s*([^\r\n]+)/);

      let modeTitle = `🚀 Valuation Complete: ${tickerStr} (${periodStr})`;
      let modeMsg = `Valuation analysis for ${tickerStr} (${periodStr}) at $${state.config?.price} finalized all ${state.steps.length} prompts.`;
      if (sessionMode === 'slingshot') {
        modeTitle = `⚡ Slingshot Triage Complete: ${tickerStr} (${periodStr})`;
        modeMsg = `Slingshot institutional triage memo finalized for ${tickerStr} (${periodStr}) at $${state.config?.price}. Suggested Action: ${decMatch ? decMatch[1] : 'PENDING'}.`;
      } else if (sessionMode === 'sentinel') {
        modeTitle = `🛡️ Quarterly Sentinel Pulse Complete: ${tickerStr} (${periodStr})`;
        modeMsg = `Quarterly position sentinel pulse finalized for ${tickerStr} (${periodStr}) at $${state.config?.price}. Suggested Action: ${decMatch ? decMatch[1] : 'PENDING'}.`;
      }

      const bolsaMultipleStr = state.pythonValuation?.bolsa_multiple ? `${state.pythonValuation.bolsa_multiple}x (${state.pythonValuation.bolsa_tier || 'Hurdle <= 0.70x'})` : undefined;
      const divergenceStatusStr = state.pythonValuation?.bolsa_tier || "Parity Verified";

      dispatchNotification(notificationConfig, {
        event: 'single_complete',
        title: modeTitle,
        message: modeMsg,
        ticker: tickerStr,
        period: periodStr,
        price: state.config?.price,
        sessionMode,
        intrinsicValue: ivMatch ? `$${ivMatch[1]}` : undefined,
        marginOfSafety: mosMatch ? mosMatch[1] : undefined,
        verdict: decMatch ? decMatch[1] : undefined,
        bolsaMultiple: bolsaMultipleStr,
        divergenceStatus: divergenceStatusStr,
        dossierContent: compiledMd,
        dossierHtmlContent: htmlContent,
        dossierMdFileName: mdFileName,
        dossierHtmlFileName: htmlFileName
      }).catch(err => console.warn("[Notification Warning] Single company dispatch:", err.message));
    } catch (notifErr: any) {
      console.warn("[Notification Error]:", notifErr.message);
    }
  }
}

// --- API Router Endpoints ---

// state retrieval
app.get("/api/session", (req: Request, res: Response) => {
  const auditResult = runAudit(state.files);
  state.auditPassed = auditResult.passed;
  updateTokenCounts();
  res.json({
    state,
    auditChecklist: auditResult.checklist,
    integrityReport: auditResult.integrityReport
  });
});

// list dynamic models
app.get("/api/session/models", async (req: Request, res: Response) => {
  const FALLBACK_MODELS = [
    { name: "models/gemini-4-argon", displayName: "Gemini 4 Argon (Frontier Deep Reasoning)" },
    { name: "models/gemini-3.8-flash", displayName: "Gemini 3.8 Flash (Default Flagship Fast & Smart)" },
    { name: "models/gemini-3.5-flash-lite", displayName: "Gemini 3.5 Flash-Lite (Fast & Cost-Efficient)" },
    { name: "models/gemini-3.1-pro-preview", displayName: "Gemini 3.1 Pro Preview (Heavy Reasoning)" }
  ];

  try {
    const ai = getGeminiClient(getApiHeaderKey(req));
    const listResponse = await ai.models.list();
    
    let rawModels: any[] = [];
    for await (const m of listResponse) {
      if (m) {
        rawModels.push(m);
      }
    }

    if (!rawModels || rawModels.length === 0) {
      return res.json({ models: FALLBACK_MODELS });
    }

    // Define function to extract version and tier weighting for sorting
    const getModelWeight = (modelName: string) => {
      const match = modelName.match(/gemini-(\d+\.\d+|\d+)/i);
      let version = match ? parseFloat(match[1]) : 0;
      if (version === 0 && modelName.includes("gemini")) {
        version = 1.0;
      }
      let tier = 0;
      if (modelName.toLowerCase().includes("argon")) {
        tier = 3;
        if (version === 0 || version === 1.0) version = 4.0;
      } else if (modelName.toLowerCase().includes("pro")) {
        tier = 2;
      } else if (modelName.toLowerCase().includes("flash")) {
        tier = 1;
      }
      return { version, tier };
    };

    // Filter, validate and clean up models
    const filtered = rawModels
      .filter((m: any) => {
        const id = m.name || m.id || "";
        const idLower = id.toLowerCase();
        const displayLower = (m.displayName || "").toLowerCase();
        
        // Exclude embedded/nano/vision/audio special names and deprecated legacy models
        if (!idLower.includes("gemini")) return false;
        if (idLower.includes("nano") || displayLower.includes("nano")) return false;
        if (idLower.includes("embedding") || displayLower.includes("embedding")) return false;
        if (idLower.includes("vision") || displayLower.includes("vision")) return false;
        if (idLower.includes("bidi") || displayLower.includes("bidi")) return false;
        if (idLower.includes("audio") || displayLower.includes("audio")) return false;
        if (idLower.includes("search") || displayLower.includes("search")) return false;
        if (idLower.includes("classic") || displayLower.includes("classic")) return false;
        if (idLower.includes("1.0") || displayLower.includes("1.0")) return false;
        if (idLower.includes("8b") || displayLower.includes("8b")) return false;
        if (idLower.includes("learnlm") || displayLower.includes("learnlm")) return false;
        if (idLower.includes("banana") || displayLower.includes("banana")) return false;
        if (idLower.includes("image") || displayLower.includes("image")) return false;
        if (idLower.includes("custom") || displayLower.includes("custom")) return false;
        if (idLower.includes("live") || displayLower.includes("live")) return false;
        if (idLower.includes("tts") || displayLower.includes("tts")) return false;

        // Must support content generation
        let canGen = false;
        if (Array.isArray(m.supportedGenerationMethods)) {
          canGen = m.supportedGenerationMethods.includes("generateContent");
        } else {
          canGen = true; // fallback
        }
        return canGen;
      })
      .map((m: any) => {
        let name = m.name || m.id || "";
        // ensure standard prefix "models/"
        if (name && !name.startsWith("models/")) {
          name = `models/${name}`;
        }
        
        // build beautiful display name
        let displayName = m.displayName || m.name || m.id || "";
        displayName = displayName.replace("models/", "");
        
        return {
          name,
          displayName: displayName
        };
      });

    // Sort newer key versions first, pro before flash
    filtered.sort((a: any, b: any) => {
      const wA = getModelWeight(a.name);
      const wB = getModelWeight(b.name);
      
      if (wB.version !== wA.version) {
        return wB.version - wA.version; // newer versions first
      }
      return wB.tier - wA.tier; // pro before flash
    });

    // Avoid duplicates of standard aliases or double names
    const seen = new Set();
    const unique: any[] = [];
    for (const m of filtered) {
      if (!seen.has(m.name)) {
        seen.add(m.name);
        unique.push(m);
      }
    }

    // Return the top 8 latest models
    const top8 = unique.slice(0, 8);
    const limit = top8.length >= 3 ? top8 : FALLBACK_MODELS;
    const ollamaModels = await fetchLocalOllamaModels();

    res.json({ models: [...limit, ...ollamaModels] });
  } catch (err: any) {
    console.warn(`[Dynamic Models Retrieval failed, using fallout list]`, err);
    const ollamaModels = await fetchLocalOllamaModels();
    res.json({ models: [...FALLBACK_MODELS, ...ollamaModels] });
  }
});

// initialize terminal session
app.post("/api/session/init", (req: Request, res: Response) => {
  const { 
    ticker, period, price, model, executionMode, portfolio, notes, 
    enableCrosscheck, crosscheckModel, clearFiles,
    pipelineMode, hybridConfig, serviceTier, sessionMode, priorDossierPath,
    lastEarningsDate, nextEarningsDate, daysToNextEarnings,
    isAdr, country, fmpApiKey
  } = req.body;
  
  if (!ticker || !period || !price) {
    return res.status(400).json({ error: "Missing ticker, reporting period or market price." });
  }

  const clientKey = getApiHeaderKey(req);
  if (clientKey) {
    state.customApiKey = clientKey;
  } else {
    delete state.customApiKey;
  }

  // If clearFiles requested or if switching to a different ticker, purge previous files
  const newTicker = String(ticker).toUpperCase();
  const isTickerSwitch = Boolean(state.config && state.config.ticker !== newTicker);

  const retainedFiles: FileLog[] = [];
  for (const fileLog of state.files) {
    const audit = auditFileIntegrity({ name: fileLog.name, category: fileLog.auditCategory }, newTicker, String(period));
    const isMismatchedCompany = audit.companyMatch === "MISMATCH" || (audit.detectedTicker && audit.detectedTicker !== newTicker);
    const shouldPurge = Boolean(clearFiles) || isMismatchedCompany;

    if (shouldPurge) {
      try {
        const localCachePath = path.join(DOWNLOADS_DIR, fileLog.id);
        if (fs.existsSync(localCachePath)) fs.unlinkSync(localCachePath);
      } catch (ignore) {}
    } else {
      retainedFiles.push(fileLog);
    }
  }
  state.files = retainedFiles;

  const parsedPipelineMode: 'single' | 'hybrid' = 'single';
  const parsedServiceTier: 'standard' | 'flex' = (serviceTier === 'standard' || serviceTier === 'flex') ? serviceTier : 'flex';
  const parsedSessionMode: SessionMode = (sessionMode === 'slingshot' || sessionMode === 'sentinel' || sessionMode === 'full') ? sessionMode : 'full';

  state.config = {
    ticker: newTicker,
    period: String(period),
    price: String(price),
    model: model || "models/gemini-3.8-flash",
    executionMode: Number(executionMode) as ExecutionMode,
    sessionMode: parsedSessionMode,
    priorDossierPath: priorDossierPath || undefined,
    portfolio: portfolio as PortfolioContext,
    notes: notes || "",
    enableCrosscheck: enableCrosscheck !== false,
    crosscheckModel: crosscheckModel || "default",
    pipelineMode: parsedPipelineMode,
    serviceTier: parsedServiceTier,
    lastEarningsDate: lastEarningsDate || null,
    nextEarningsDate: nextEarningsDate || null,
    daysToNextEarnings: typeof daysToNextEarnings === 'number' ? daysToNextEarnings : null,
    isAdr: typeof isAdr === 'boolean' ? isAdr : undefined,
    country: country || null
  };

  const fmpKey = (typeof fmpApiKey === 'string' ? fmpApiKey.trim() : '') || process.env.FMP_API_KEY || '';
  if (fmpKey && (!state.config.country || state.config.isAdr === undefined)) {
    try {
      fetch(`https://financialmodelingprep.com/stable/profile?symbol=${newTicker}&apikey=${fmpKey}`)
        .then(res => res.ok ? res.json() : null)
        .then(pData => {
          if (Array.isArray(pData) && pData[0] && state.config && state.config.ticker === newTicker) {
            state.config.isAdr = Boolean(pData[0].isAdr);
            state.config.country = pData[0].country || 'US';
          }
        })
        .catch(() => {});
    } catch {}
  }

  // Reset analysis logs
  state.activeStepIndex = 0;
  state.currentPromptIndex = 0;
  state.status = 'idle';
  state.history = [];
  delete state.pythonValuation;
  state.hasDispatchedStartNotification = false;
  state.files = state.files.filter(f => f.id !== "compiled-obsidian-report");
  state.steps = generateSessionSteps(state.config.enableCrosscheck, parsedSessionMode);
  delete state.crosscheckVerdict;

  console.log(`[Terminal Configured] Ticker: ${state.config.ticker}, Mode: ${state.config.executionMode}, SessionMode: ${state.config.sessionMode}`);
  const auditResult = runAudit(state.files, state.config.ticker, state.config.period, state.config.sessionMode);
  state.auditPassed = auditResult.passed;
  updateTokenCounts();

  // Launch out-of-band Python valuation stream in background if CSV is already staged
  const csvFile = state.files.find(f => f.name.toLowerCase().endsWith('.csv') || f.auditCategory === 'Financials TTM');
  if (csvFile) {
    const localCsv = path.join(DOWNLOADS_DIR, csvFile.id);
    if (fs.existsSync(localCsv)) {
      triggerOutOrBandPythonValuation(localCsv);
    }
  }
  
  res.json({ success: true, state, auditChecklist: auditResult.checklist, integrityReport: auditResult.integrityReport });
});

// Mode 1 Slingshot -> Mode 2 Full Dossier Warm-Cache Escalation Endpoint
app.post("/api/session/escalate", async (req: Request, res: Response) => {
  if (!state.config) {
    return res.status(400).json({ error: "No active session to escalate." });
  }

  console.log(`[Session Escalation] Escalating ${state.config.ticker} from Slingshot Triage to Full Institutional Dossier`);

  // Archive existing Mode 1 report if present
  const memoFile = state.files.find(f => f.id === "compiled-obsidian-report");
  if (memoFile) {
    const memoPath = path.join(DOWNLOADS_DIR, memoFile.id);
    if (fs.existsSync(memoPath)) {
      const archiveName = `${state.config.ticker}_${state.config.period}_Slingshot_Memo_Archived_${Date.now()}.md`;
      const archivePath = path.join(DOWNLOADS_DIR, archiveName);
      try {
        fs.copyFileSync(memoPath, archivePath);
        state.files.push({
          id: archiveName,
          name: archiveName,
          displayName: archiveName,
          size: fs.statSync(archivePath).size,
          mimeType: "text/markdown",
          uploadedAt: new Date().toISOString(),
          auditCategory: "Prior Dossier"
        });
      } catch (e) {
        console.warn("[Session Escalation] Could not archive Slingshot memo:", e);
      }
    }
  }

  // Wipe history to eliminate cognitive bias / anchoring
  state.history = [];
  delete state.crosscheckVerdict;

  // Switch to Full mode
  state.config.sessionMode = 'full';
  state.steps = generateSessionSteps(state.config.enableCrosscheck, 'full');
  state.activeStepIndex = 0;
  state.currentPromptIndex = 0;
  state.status = 'idle';

  // Files and geminiUri handles are strictly preserved for 100% KV prefix cache hits
  updateTokenCounts();

  res.json({ success: true, state });
});

// Mode 3 Sentinel Prior Dossier Discovery Endpoint
app.get("/api/sentinel/prior-dossier", async (req: Request, res: Response) => {
  const ticker = (req.query.ticker as string) || state.config?.ticker;
  if (!ticker) {
    return res.status(400).json({ error: "Ticker symbol is required to locate prior dossier." });
  }

  try {
    const searchDirs = [DOWNLOADS_DIR, process.cwd(), path.join(process.cwd(), "public")];
    const dossier = await locatePriorDossier(ticker, searchDirs);

    if (dossier && dossier.filePath) {
      if (state.config) {
        state.config.priorDossierPath = dossier.filePath;
      }

      // Check if already in state.files
      const alreadyStaged = state.files.some(f => f.name === dossier.fileName || f.auditCategory === 'Prior Dossier');
      if (!alreadyStaged && fs.existsSync(dossier.filePath)) {
        const fileContent = fs.readFileSync(dossier.filePath, 'utf-8');
        const fileId = `prior-dossier-${Date.now()}`;
        fs.writeFileSync(path.join(DOWNLOADS_DIR, fileId), fileContent, 'utf-8');
        state.files.push({
          id: fileId,
          name: dossier.fileName,
          displayName: dossier.fileName,
          size: Buffer.byteLength(fileContent, 'utf-8'),
          mimeType: 'text/markdown',
          uploadedAt: new Date().toISOString(),
          auditCategory: 'Prior Dossier',
          tokens: Math.ceil(fileContent.length / 4.2)
        });
        const auditRes = runAudit(state.files, ticker, state.config?.period, 'sentinel');
        state.auditPassed = auditRes.passed;
      }

      return res.json({ success: true, found: true, dossier, state });
    }

    return res.json({ success: true, found: false });
  } catch (err: any) {
    console.warn(`[Prior Dossier Error] Could not locate prior dossier for ${ticker}:`, err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// file processing & upload to Gemini
app.post("/api/upload", async (req: Request, res: Response) => {
  const { name, data, mimeType, bypassCurrencyCheck, harmonize } = req.body;

  if (!name || !data || !mimeType) {
    return res.status(400).json({ error: "Filename, base64 payload data, and mimeType are requested." });
  }

  try {
    let finalBuffer = Buffer.from(data, 'base64');
    let finalName = name;
    const finalMimeType = mimeType;

    const isCsv = name.toLowerCase().endsWith('.csv') || mimeType === 'text/csv';
    if (isCsv) {
      const csvText = finalBuffer.toString('utf-8');
      const currencyAudit = await auditFinancialCsv(csvText, name, state.config?.ticker || "");

      // If action is required and user hasn't made an explicit choice yet:
      if (currencyAudit.requiresAction && !bypassCurrencyCheck && !harmonize) {
        console.log(`[Currency Safeguard] Inconsistency detected in ${name}. Prompting user decision.`);
        return res.json({
          success: false,
          requiresConfirmation: true,
          currencyAudit,
          pendingFile: { name, data, mimeType }
        });
      }

      // If user chose to harmonize:
      if (harmonize && currencyAudit.requiresAction) {
        console.log(`[Currency Safeguard] User approved harmonization for ${name} -> ${currencyAudit.homeCurrency}`);
        const { harmonizedCsv, newFileName } = harmonizeFinancialCsv(csvText, currencyAudit);
        finalName = newFileName;
        finalBuffer = Buffer.from(harmonizedCsv, 'utf-8');
      }
    }

    const ai = getGeminiClient(getApiHeaderKey(req) || state.customApiKey);
    console.log(`[Staging File] Processing upload for: ${finalName}`);

    // Create a temporary local file on the container filesystem
    const tempDir = os.tmpdir();
    // Clean string for filesystem safety
    const safeName = finalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const tempPath = path.join(tempDir, `inv_terminal_${Date.now()}_${safeName}`);
    
    await fs.promises.writeFile(tempPath, finalBuffer);

    // Identify category by detectAuditCategory
    const matchedCategory = detectAuditCategory(finalName);

    console.log(`[Gemini Sync] Cloud Files uploading: ${finalName} (${matchedCategory})`);
    
    // Call the standard GenAI Files upload API
    const uploadedFile = await ai.files.upload({
      file: tempPath,
      config: {
        mimeType: finalMimeType
      }
    });

    console.log(`[Gemini Sync Complete] Name: ${uploadedFile.name}, URI: ${uploadedFile.uri}`);

    // Clean up local temp file instantly
    await fs.promises.unlink(tempPath).catch(console.error);

    // Poll file processing state to ensure it is fully processed and ready for token calculation
    let activeFile = uploadedFile;
    if (uploadedFile.state === 'PROCESSING') {
      console.log(`[Staging File] File ${finalName} is processing, polling status from Gemini...`);
      let attempts = 0;
      while (activeFile.state === 'PROCESSING' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        activeFile = await ai.files.get({ name: uploadedFile.name });
        attempts++;
      }
    }

    // Call the Gemini countTokens API to get the exact token count, with a fallback
    let computedTokens = Math.max(12, Math.ceil(finalBuffer.length / 4.2));
    try {
      const modelToUse = state.config?.model || "gemini-3.8-flash";
      const tokenCountResponse = await ai.models.countTokens({
        model: modelToUse,
        contents: [
          {
            role: "user",
            parts: [
              {
                fileData: {
                  fileUri: activeFile.uri,
                  mimeType: finalMimeType
                }
              }
            ]
          }
        ]
      });
      if (tokenCountResponse && typeof tokenCountResponse.totalTokens === 'number') {
        computedTokens = tokenCountResponse.totalTokens;
        console.log(`[Gemini Token Count] Counted true tokens for ${finalName}: ${computedTokens}`);
      }
    } catch (tokenErr) {
      console.warn(`[Gemini Token Count Warning] Could not count tokens via Gemini API, falling back to estimate for ${finalName}`, tokenErr);
    }

    const log: FileLog = {
      id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: finalName,
      size: finalBuffer.length,
      mimeType: finalMimeType,
      uploadedAt: new Date().toISOString(),
      auditCategory: matchedCategory,
      geminiUri: activeFile.uri,
      geminiName: activeFile.name,
      displayName: finalName,
      tokens: computedTokens
    };

    // Cache physical file on local container disk for external downloads
    await fs.promises.writeFile(path.join(DOWNLOADS_DIR, log.id), finalBuffer).catch(err => {
      console.warn(`[Download Cache Error] Could not cache file: ${finalName}`, err);
    });

    state.files = state.files.filter(f => f.name !== finalName);
    state.files.push(log);

    if (matchedCategory === 'Financials TTM' || finalName.toLowerCase().endsWith('.csv')) {
      triggerOutOrBandPythonValuation(path.join(DOWNLOADS_DIR, log.id));
    }

    const auditRes = runAudit(state.files);
    state.auditPassed = auditRes.passed;
    updateTokenCounts();

    res.json({ success: true, file: log, auditChecklist: auditRes.checklist, integrityReport: auditRes.integrityReport, state });
  } catch (err: any) {
    console.error(`[Upload Error]`, err);
    res.status(500).json({ error: err.message || "Failed uploading file to server & Gemini." });
  }
});

// Dedicated Document Integrity Safeguard Endpoints
app.post("/api/document/audit", (req: Request, res: Response) => {
  const { ticker, period } = req.body || {};
  const activeTicker = ticker || state.config?.ticker || "";
  const activePeriod = period || state.config?.period || "";
  const auditRes = runAudit(state.files, activeTicker, activePeriod);
  res.json({
    success: true,
    checklist: auditRes.checklist,
    integrityReport: auditRes.integrityReport
  });
});

// Dedicated Currency Safeguard Endpoints
app.post("/api/currency/audit", async (req: Request, res: Response) => {
  try {
    const { name, data, ticker } = req.body;
    if (!data) return res.status(400).json({ error: "Missing CSV data payload." });
    const text = typeof data === "string" && !data.includes("\n") && data.length > 50
      ? Buffer.from(data, 'base64').toString('utf-8')
      : data;
    const audit = await auditFinancialCsv(text, name || "financials.csv", ticker || state.config?.ticker || "");
    res.json({ success: true, audit });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Currency audit failed." });
  }
});

app.post("/api/currency/harmonize", async (req: Request, res: Response) => {
  try {
    const { name, data, ticker } = req.body;
    if (!data) return res.status(400).json({ error: "Missing CSV data payload." });
    const text = typeof data === "string" && !data.includes("\n") && data.length > 50
      ? Buffer.from(data, 'base64').toString('utf-8')
      : data;
    const audit = await auditFinancialCsv(text, name || "financials.csv", ticker || state.config?.ticker || "");
    const { harmonizedCsv, newFileName } = harmonizeFinancialCsv(text, audit);
    res.json({
      success: true,
      audit,
      newFileName,
      harmonizedData: Buffer.from(harmonizedCsv, 'utf-8').toString('base64')
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Currency harmonization failed." });
  }
});

// delete staged file
app.post("/api/session/remove-file", async (req: Request, res: Response) => {
  const { fileId } = req.body;
  
  const fileLog = state.files.find(f => f.id === fileId || f.name === fileId);
  if (fileLog && fileLog.geminiName) {
    try {
      const ai = getGeminiClient(getApiHeaderKey(req) || state.customApiKey);
      console.log(`[Purging File] Contacting Gemini to delete: ${fileLog.geminiName}`);
      await ai.files.delete({ name: fileLog.geminiName }).catch(console.error);
    } catch (e) {
      console.warn("Could not delete file from Gemini storage:", e);
    }
  }

  const fileName = fileLog?.name || fileId;
  state.files = state.files.filter(f => f.id !== fileId && f.name !== fileId);
  
  // Clean up physical copy from download cache
  const localCachePath = path.join(DOWNLOADS_DIR, fileId);
  await fs.promises.unlink(localCachePath).catch(() => {});

  // Clean up physical copy from STAGING_DIR if present
  if (fileName) {
    const stagingPath = path.join(STAGING_DIR, fileName);
    await fs.promises.unlink(stagingPath).catch(() => {});
  }

  const auditRes = runAudit(state.files);
  state.auditPassed = auditRes.passed;
  updateTokenCounts();

  res.json({ success: true, files: state.files, auditChecklist: auditRes.checklist, state });
});

// Dedicated endpoint to purge all files from memory, downloads, and staging that mismatch the active target
app.post("/api/session/purge-mismatches", async (req: Request, res: Response) => {
  const activeTicker = req.body?.ticker || state.config?.ticker || "";
  const activePeriod = req.body?.period || state.config?.period || "";

  const auditRes = runAudit(state.files, activeTicker, activePeriod);
  const mismatches = auditRes.integrityReport?.mismatches || [];
  const mismatchedNames = new Set(mismatches.map(m => m.fileName));

  const ai = getGeminiClient(getApiHeaderKey(req) || state.customApiKey);
  const remainingFiles: FileLog[] = [];

  for (const f of state.files) {
    if (mismatchedNames.has(f.name) || (f.detectedTicker && activeTicker && f.detectedTicker !== activeTicker)) {
      if (f.geminiName) {
        try {
          await ai.files.delete({ name: f.geminiName }).catch(() => {});
        } catch (ignore) {}
      }
      try {
        const localCachePath = path.join(DOWNLOADS_DIR, f.id);
        if (fs.existsSync(localCachePath)) fs.unlinkSync(localCachePath);
      } catch (ignore) {}
      try {
        const stagingPath = path.join(STAGING_DIR, f.name);
        if (fs.existsSync(stagingPath)) fs.unlinkSync(stagingPath);
      } catch (ignore) {}
    } else {
      remainingFiles.push(f);
    }
  }

  state.files = remainingFiles;
  const newAudit = runAudit(state.files, activeTicker, activePeriod);
  state.auditPassed = newAudit.passed;
  updateTokenCounts();

  res.json({
    success: true,
    purgedCount: mismatches.length,
    files: state.files,
    state,
    auditChecklist: newAudit.checklist,
    integrityReport: newAudit.integrityReport
  });
});


// purge all files
app.post("/api/session/purge-all", async (req: Request, res: Response) => {
  for (const fileLog of state.files) {
    try {
      if (fileLog.geminiName) {
        try {
          const ai = getGeminiClient(getApiHeaderKey(req) || state.customApiKey);
          await ai.files.delete({ name: fileLog.geminiName }).catch(console.error);
        } catch (e) {
          console.warn(`Could not delete file ${fileLog.name} from Gemini:`, e);
        }
      }
    } catch (ignore) {}
    try {
      // Clean up physical copy from download cache
      const localCachePath = path.join(DOWNLOADS_DIR, fileLog.id);
      await fs.promises.unlink(localCachePath).catch(() => {});
    } catch (ignore) {}
  }

  // Purge staging files for current company
  if (state.config?.ticker) {
    try {
      batchManager.purgeItemStagingFiles(state.config.ticker);
    } catch (e) {}
  }

  // Clear all files
  state.files = [];
  
  const auditRes = runAudit(state.files);
  state.auditPassed = auditRes.passed;
  updateTokenCounts();

  console.log(`[Purge All] Cleaned up all staged files from repository.`);
  res.json({ success: true, state, auditChecklist: auditRes.checklist, integrityReport: auditRes.integrityReport });
});

async function hardResetSessionState(customKey?: string) {
  console.log(`[Hard Reset] Initiating full terminal session hard-reset...`);
  clearRetryTimer();
  activeStepRetryCounts.clear();
  state.status = 'idle';
  state.activeStepIndex = 0;
  state.currentPromptIndex = 0;
  state.history = [];
  state.config = null;
  state.steps = generateSessionSteps(true);
  state.retryState = null;
  delete state.crosscheckVerdict;
  state.cachedTokenCount = 0;
  state.cacheStatus = 'bypassed';

  for (const fileLog of state.files) {
    try {
      if (fileLog.geminiName) {
        const ai = getGeminiClient(customKey || state.customApiKey);
        await ai.files.delete({ name: fileLog.geminiName }).catch(() => {});
      }
    } catch (ignore) {}
    try {
      const localCachePath = path.join(DOWNLOADS_DIR, fileLog.id);
      await fs.promises.unlink(localCachePath).catch(() => {});
    } catch (ignore) {}
  }

  // Completely purge all files from staging directories and wipe batch queue
  try {
    batchManager.purgeAllStagingFiles();
    batchManager.clearQueue(true);
  } catch (stgErr) {
    console.warn("[Hard Reset Warning] Could not purge staging files:", stgErr);
  }

  state.files = [];
  const auditRes = runAudit(state.files);
  state.auditPassed = auditRes.passed;
  updateTokenCounts();
  console.log(`[Hard Reset Complete] All files, history, and state completely purged.`);
  return auditRes;
}

// hard reset: complete purge of files, history, config, and state
app.post("/api/session/hard-reset", async (req: Request, res: Response) => {
  const auditRes = await hardResetSessionState(getApiHeaderKey(req));
  res.json({ success: true, state, auditChecklist: auditRes.checklist, integrityReport: auditRes.integrityReport });
});

// Reset session-level execution pipeline specifically for autonomous batch company execution.
// CRITICAL: NEVER call batchManager.purgeAllStagingFiles() or batchManager.clearQueue() here,
// as doing so destroys all staged filings and blocks remaining queue items.
async function resetBatchSessionState(customKey?: string) {
  console.log(`[Batch Engine] Initializing clean session state for company execution...`);
  clearRetryTimer();
  activeStepRetryCounts.clear();
  state.status = 'idle';
  state.activeStepIndex = 0;
  state.currentPromptIndex = 0;
  state.history = [];
  state.config = null;
  state.steps = generateSessionSteps(true);
  state.competitorRadar = null;
  state.retryState = null;
  delete state.crosscheckVerdict;
  state.cachedTokenCount = 0;
  state.cacheStatus = 'bypassed';

  for (const fileLog of state.files) {
    try {
      if (fileLog.geminiName) {
        const ai = getGeminiClient(customKey || state.customApiKey);
        await ai.files.delete({ name: fileLog.geminiName }).catch(() => {});
      }
    } catch (ignore) {}
    try {
      const localCachePath = path.join(DOWNLOADS_DIR, fileLog.id);
      await fs.promises.unlink(localCachePath).catch(() => {});
    } catch (ignore) {}
  }

  state.files = [];
  const auditRes = runAudit(state.files);
  state.auditPassed = auditRes.passed;
  updateTokenCounts();
  return auditRes;
}

async function stageFileToSession(filePath: string): Promise<FileLog> {
  const finalName = path.basename(filePath);
  const finalBuffer = await fs.promises.readFile(filePath);
  const isCsv = finalName.toLowerCase().endsWith(".csv");
  const finalMimeType = isCsv ? "text/csv" : "text/plain";

  const matchedCategory = detectAuditCategory(finalName);

  const ai = getGeminiClient(state.customApiKey);
  const tempDir = os.tmpdir();
  const safeName = finalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const tempPath = path.join(tempDir, `inv_terminal_${Date.now()}_${safeName}`);
  await fs.promises.writeFile(tempPath, finalBuffer);

  let activeFile: any = null;
  try {
    activeFile = await ai.files.upload({
      file: tempPath,
      config: { mimeType: finalMimeType }
    });
    let attempts = 0;
    while (activeFile && activeFile.state === 'PROCESSING' && attempts < 10) {
      await new Promise(r => setTimeout(r, 1000));
      activeFile = await ai.files.get({ name: activeFile.name });
      attempts++;
    }
  } catch (err) {
    console.warn(`[Batch Staging Warning] Upload via Files API fallback for ${finalName}:`, err);
  } finally {
    await fs.promises.unlink(tempPath).catch(() => {});
  }

  const logId = `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const log: FileLog = {
    id: logId,
    name: finalName,
    size: finalBuffer.length,
    mimeType: finalMimeType,
    uploadedAt: new Date().toISOString(),
    auditCategory: matchedCategory,
    geminiUri: activeFile?.uri,
    geminiName: activeFile?.name,
    displayName: finalName,
    tokens: Math.max(12, Math.ceil(finalBuffer.length / 4.2))
  };

  await fs.promises.writeFile(path.join(DOWNLOADS_DIR, log.id), finalBuffer).catch(() => {});
  state.files.push(log);
  return log;
}

async function executeBatchCompany(
  item: BatchQueueItem,
  docs: string[],
  onStep: (stepIdx: number, stepTitle: string) => void
): Promise<{ success: boolean; compiledMarkdown: string; error?: string }> {
  await resetBatchSessionState();

  state.config = {
    ticker: item.ticker,
    period: item.period,
    price: item.price,
    model: "gemini-3.8-flash",
    executionMode: ExecutionMode.FullAuto,
    portfolio: item.portfolio || { holdsPosition: false },
    notes: "",
    enableCrosscheck: true,
    crosscheckModel: "default"
  };
  state.steps = generateSessionSteps(true);

  console.log(`[Batch Engine] Staging ${docs.length} source documents for ${item.ticker}...`);
  for (const fp of docs) {
    await stageFileToSession(fp);
  }

  const auditRes = runAudit(state.files, item.ticker, item.period);
  state.auditPassed = auditRes.passed;
  if (auditRes.integrityReport?.hasMismatches) {
    const errDetails = auditRes.integrityReport.mismatches.map(m => `${m.fileName}: ${m.issue}`).join("; ");
    throw new Error(`Pre-execution document guard blocked ${item.ticker}: ${errDetails}`);
  }
  console.log(`[Batch Engine] All documents verified with 0 mismatches for ${item.ticker}. Firing analyst pipeline...`);

  activeBatchStepCallback = onStep;
  try {
    state.status = 'running';
    await runStepProcessor(0);

    // If session is waiting in auto-resume cooldown or running sequential turns, wait for resolution
    while ((state.status as SessionState['status']) === 'retrying' || (state.status as SessionState['status']) === 'running') {
      await new Promise(r => setTimeout(r, 1000));
    }
  } finally {
    activeBatchStepCallback = null;
  }

  if ((state.status as string) === 'failed') {
    throw new Error(`Pipeline execution encountered an error on ${item.ticker}.`);
  }

  const completedSteps = state.steps.filter(s => s.status === 'completed' && s.response);
  const modelName = state.config?.model || "gemini-3.8-flash";
  let body = "";
  let batchRadarInjected = false;
  const batchRadar = state.competitorRadar;

  completedSteps.forEach((s) => {
    const stepNum = s.index + 1;
    const chapterTitle = STEP_CHAPTER_TITLES[stepNum] || (s.isCrosscheck ? `Part ${stepNum}: Forensic Audit & Fact-Check Crosscheck` : `Part ${stepNum}: ${s.title.replace(/^Part\s+\d+:\s*/i, '')}`);
    body += `## ${chapterTitle}\n\n${s.response}\n\n---\n\n`;
    if (s.index === 1 && batchRadar && !batchRadarInjected) {
      const radarSummary = batchRadar.markdownSummary.trim()
        .replace(/^##\s+Competitor Moat & Valuation Radar/gim, '### Competitor Moat & Valuation Radar')
        .replace(/^###\s+([1-4]\.\s+(?:Data Lineage|Archetype Comparative|Moat Leaderboard|Moat & Valuation))/gim, '#### $1');
      body += `${radarSummary}\n\n---\n\n`;
      batchRadarInjected = true;
    }
  });

  if (batchRadar && !batchRadarInjected) {
    const radarSummary = batchRadar.markdownSummary.trim()
      .replace(/^##\s+Competitor Moat & Valuation Radar/gim, '### Competitor Moat & Valuation Radar')
      .replace(/^###\s+([1-4]\.\s+(?:Data Lineage|Archetype Comparative|Moat Leaderboard|Moat & Valuation))/gim, '#### $1');
    body += `${radarSummary}\n\n---\n\n`;
    batchRadarInjected = true;
  }

  const frontmatter = extractFrontmatter(body, item.ticker, item.period, item.price, modelName);

  const header = `${frontmatter}
# Valuation Analysis: ${item.ticker} ${item.period}
**Date:** ${new Date().toLocaleDateString()}
**AI Model:** ${modelName}

**Ticker:** ${item.ticker}  |  **Period:** ${item.period}  |  **Market price:** $${item.price}

---

`;

  const fullMarkdown = header + body;
  const formattedMd = cleanMarkdownForRendering(alignMarkdownTables(fullMarkdown));

  return { success: true, compiledMarkdown: formattedMd };
}

// --- Batch Queue API Endpoints ---
app.get("/api/batch/state", (req: Request, res: Response) => {
  res.json({ success: true, batchState: batchManager.state });
});

app.post("/api/batch/load-preset", (req: Request, res: Response) => {
  batchManager.loadPreset();
  res.json({ success: true, batchState: batchManager.state });
});

export function extractTickersFromContent(content: string): string[] {
  if (!content || !content.trim()) return [];

  const stopWords = new Set([
    "NYSE", "NASDAQ", "AMEX", "USA", "USD", "EUR", "GBP", "CAD", "SEC", "EDGAR",
    "TTM", "EBITDA", "EBIT", "ROIC", "ROE", "ROA", "WACC", "DCF", "PE", "EPS", "CAP",
    "DEBT", "DATE", "CSV", "PDF", "HTML", "TXT", "JSON", "DOC", "FORM", "HELO", "THE",
    "AND", "FOR", "WITH", "FROM", "INTO", "PRICE", "TICKER", "SYMBOL", "NAME", "COMPANY",
    "SECTOR", "INDUSTRY", "MARKET", "VALUE", "GROWTH", "TOTAL", "ALERT", "SCREEN", "WATCHLIST",
    "TIER", "TIER1", "RADAR", "STRIKE", "BUY", "SELL", "HOLD", "HIGH", "LOW", "GAP",
    "CASH", "FREE", "FLOW", "NET", "TRUE", "FALSE", "NULL", "ITEM", "PART", "NOTE", "FY",
    "Q1", "Q2", "Q3", "Q4", "ANNUAL", "QUARTER", "REPORT", "FILING", "CALL", "TRANSCRIPT",
    "TARGET", "MOS", "INTRINSIC", "YIELD", "BALANCE", "SHEET", "HEALTH", "HUNTING", "GROUND",
    "ESTABLISHED", "FRANCHISES", "SECTION", "MASTER", "DISCOVERY", "QUALITY", "FIRST"
  ]);

  const candidates: string[] = [];

  // Check if content looks like markdown table with | **TICKER** | or | TICKER |
  const mdTableRegex = /\|\s*\*{0,2}([A-Z]{1,5})\*{0,2}\s*\|/g;
  let mdMatch;
  let mdFound = false;
  while ((mdMatch = mdTableRegex.exec(content)) !== null) {
    const sym = mdMatch[1].toUpperCase();
    if (!stopWords.has(sym)) {
      candidates.push(sym);
      mdFound = true;
    }
  }

  // If not a markdown table or if few matches, parse delimited tokens
  if (!mdFound || candidates.length === 0) {
    // Split by comma, semicolon, newline, pipe, tab, or spaces
    const tokens = content.split(/[\s,;|"'`\t\r\n]+/);
    for (const t of tokens) {
      const clean = t.trim().toUpperCase().replace(/[^A-Z]/g, "");
      if (clean.length >= 1 && clean.length <= 5 && !stopWords.has(clean) && !/^\d+$/.test(clean)) {
        candidates.push(clean);
      }
    }
  }

  // Return deduplicated array while preserving order
  return Array.from(new Set(candidates));
}

app.post("/api/batch/bulk-add", async (req: Request, res: Response) => {
  try {
    const { tickers, rawText, filePath, fmpApiKey } = req.body;
    let extractedTickers: string[] = [];

    if (Array.isArray(tickers) && tickers.length > 0) {
      extractedTickers = Array.from(new Set(tickers.map((t: string) => String(t).trim().toUpperCase()).filter(Boolean)));
    } else if (filePath && typeof filePath === "string") {
      const cleanPath = filePath.trim().replace(/^["']|["']$/g, "");
      if (!fs.existsSync(cleanPath)) {
        return res.status(404).json({ error: `File not found on drive: "${cleanPath}"` });
      }
      const fileContent = fs.readFileSync(cleanPath, "utf-8");
      extractedTickers = extractTickersFromContent(fileContent);
    } else if (rawText && typeof rawText === "string") {
      extractedTickers = extractTickersFromContent(rawText);
    }

    if (extractedTickers.length === 0) {
      return res.status(400).json({ error: "No valid tickers detected in the provided input." });
    }

    const addedItems: BatchQueueItem[] = [];
    const skipped: Array<{ ticker: string; reason: string }> = [];

    console.log(`[Batch Bulk-Add] Processing ${extractedTickers.length} tickers: ${extractedTickers.join(", ")}`);

    for (let i = 0; i < extractedTickers.length; i++) {
      const sym = extractedTickers[i];
      try {
        const info = await fetchTickerInfoFromFmpOrYf(sym, fmpApiKey);
        const item = batchManager.addItem(sym, info.period, info.price, info.fmpSucceeded, info.source);
        addedItems.push(item);
        console.log(`  [Bulk Add ${i + 1}/${extractedTickers.length}] Added ${sym} ($${info.price} | ${info.period}) [${info.source}] -> Status: ${item.status}`);
        if (i < extractedTickers.length - 1) {
          await new Promise(r => setTimeout(r, 120));
        }
      } catch (err: any) {
        console.warn(`  [Bulk Add Error] Failed fetching data for ${sym}:`, err.message);
        skipped.push({ ticker: sym, reason: err.message || "Failed FMP resolution" });
      }
    }

    // If autoPullDocs was requested, automatically trigger document pulling for blocked items
    const { autoPullDocs, stockAnalysisCookie, cookie } = req.body;
    const activeCookie = stockAnalysisCookie || cookie;
    if (autoPullDocs) {
      const blocked = addedItems.filter(i => i.status === "blocked");
      console.log(`[Batch Bulk-Add] Auto-pulling documents for ${blocked.length} blocked items...`);
      const reqHeaderKey = getApiHeaderKey(req);
      for (const bItem of blocked) {
        try {
          await pullDocsInternal(bItem.ticker, bItem.period, fmpApiKey, activeCookie, reqHeaderKey);
        } catch (pullErr: any) {
          console.warn(`[Batch Bulk-Add Auto-Pull Warning for ${bItem.ticker}]:`, pullErr.message);
        }
      }
      batchManager.reAuditAll();
    }

    res.json({
      success: true,
      addedCount: addedItems.length,
      items: addedItems,
      skipped,
      batchState: batchManager.state
    });
  } catch (err: any) {
    console.error("[Batch Bulk-Add Error]", err);
    res.status(500).json({ error: err.message || "Failed bulk adding companies." });
  }
});

async function pullDocsInternal(
  ticker: string,
  period?: string,
  fmpApiKey?: string,
  cookie?: string,
  reqHeaderKey?: string
): Promise<{ success: boolean; results: { sec: boolean; financials: boolean; transcript: boolean }; errors: string[] }> {
  const sym = ticker.trim().toUpperCase();
  const activeFmpKey = fmpApiKey?.trim() || process.env.FMP_API_KEY || "";
  const errors: string[] = [];
  const results = { sec: false, financials: false, transcript: false };

  console.log(`[Batch Pull-Docs] Staging 4 filings into _STAGING for ${sym} (${period || 'latest'})...`);

  // 1. SEC Filings (10-K & 10-Q)
  try {
    const secRes = await executeSecIngest(sym, ["10-K", "10-Q"], period, undefined, undefined, reqHeaderKey);
    results.sec = secRes.uploaded.length > 0;
  } catch (err: any) {
    console.warn(`[Batch Pull-Docs SEC Error for ${sym}]:`, err.message);
    errors.push(`SEC Filings: ${err.message}`);
  }

  // 2. FMP Financials TTM CSV
  try {
    const fmpRes = await executeFmpIngest(sym, activeFmpKey, reqHeaderKey, period);
    results.financials = fmpRes.success;
  } catch (err: any) {
    console.warn(`[Batch Pull-Docs FMP Error for ${sym}]:`, err.message);
    errors.push(`Financials CSV: ${err.message}`);
  }

  // 3. Earnings Call Transcript
  try {
    const trRes = await executeTranscriptIngest(sym, period, cookie, reqHeaderKey);
    results.transcript = trRes.success;
  } catch (err: any) {
    console.warn(`[Batch Pull-Docs Transcript Error for ${sym}]:`, err.message);
    errors.push(`Transcript: ${err.message}`);
  }

  // Re-audit the item in batchManager against the newly saved files in STAGING_DIR
  batchManager.reAuditItem(sym);

  return {
    success: results.sec || results.financials || results.transcript,
    results,
    errors
  };
}

app.post("/api/batch/pull-docs", async (req: Request, res: Response) => {
  const { ticker, period, fmpApiKey, stockAnalysisCookie, cookie } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: "Missing ticker." });
  }

  const activeCookie = stockAnalysisCookie || cookie;
  const reqHeaderKey = getApiHeaderKey(req);
  try {
    const outcome = await pullDocsInternal(ticker, period, fmpApiKey, activeCookie, reqHeaderKey);
    const updatedItem = batchManager.reAuditItem(ticker);
    res.json({
      success: outcome.success,
      item: updatedItem,
      results: outcome.results,
      errors: outcome.errors,
      batchState: batchManager.state
    });
  } catch (err: any) {
    console.error(`[Batch Pull-Docs Error for ${ticker}]:`, err);
    res.status(500).json({ error: err.message || "Failed pulling documents." });
  }
});

app.post("/api/batch/pull-all-docs", async (req: Request, res: Response) => {
  const { fmpApiKey, stockAnalysisCookie, cookie } = req.body;
  const activeCookie = stockAnalysisCookie || cookie;
  const reqHeaderKey = getApiHeaderKey(req);
  const blockedItems = batchManager.state.items.filter(i => i.status === "blocked");
  const results: Record<string, any> = {};

  console.log(`[Batch Pull-All] Pulling documents for ${blockedItems.length} blocked companies...`);
  for (const item of blockedItems) {
    try {
      results[item.ticker] = await pullDocsInternal(item.ticker, item.period, fmpApiKey, activeCookie, reqHeaderKey);
    } catch (e: any) {
      results[item.ticker] = { success: false, error: e.message };
    }
  }

  batchManager.reAuditAll();
  res.json({ success: true, count: blockedItems.length, results, batchState: batchManager.state });
});

app.post("/api/batch/re-audit", (req: Request, res: Response) => {
  const { ticker } = req.body;
  if (ticker) {
    const item = batchManager.reAuditItem(ticker);
    res.json({ success: true, item, batchState: batchManager.state });
  } else {
    const state = batchManager.reAuditAll();
    res.json({ success: true, batchState: state });
  }
});

app.post("/api/batch/sync-periods", async (req: Request, res: Response) => {
  const { fmpApiKey } = req.body;
  const items = batchManager.state.items;
  const updated: Array<{ ticker: string; oldPeriod: string; newPeriod: string; price: string }> = [];

  for (const item of items) {
    try {
      const info = await fetchTickerInfoFromFmpOrYf(item.ticker, fmpApiKey);
      if (info.period && info.period !== item.period) {
        console.log(`[Batch Sync-Periods] Updating ${item.ticker} from ${item.period} to ${info.period} ($${info.price})`);
        updated.push({
          ticker: item.ticker,
          oldPeriod: item.period,
          newPeriod: info.period,
          price: info.price
        });
        item.period = info.period;
        if (info.price) item.price = info.price;
        item.fmpSynced = info.fmpSucceeded;
        item.fmpSource = info.source;
      }
    } catch (e) {}
  }

  batchManager.reAuditAll();
  res.json({ success: true, updated, batchState: batchManager.state });
});

app.post("/api/batch/add", async (req: Request, res: Response) => {
  let { ticker, period, price, portfolio, fmpApiKey, autoPullDocs, stockAnalysisCookie, cookie } = req.body;
  const activeCookie = stockAnalysisCookie || cookie;
  if (!ticker) {
    return res.status(400).json({ error: "Missing ticker." });
  }

  let fmpSucceeded = false;
  let fmpSource: 'fmp' | 'fallback' | 'manual' = 'manual';

  // If period or price missing, auto-fill from FMP / YF
  if (!period || !price) {
    try {
      const info = await fetchTickerInfoFromFmpOrYf(ticker, fmpApiKey);
      if (!period) period = info.period;
      if (!price) price = info.price;
      fmpSucceeded = info.fmpSucceeded;
      fmpSource = info.source;
    } catch (e) {
      if (!period) period = "Q1-26";
      if (!price) price = "100.00";
    }
  }

  const item = batchManager.addItem(ticker, period, price, fmpSucceeded, fmpSource, portfolio);

  if (autoPullDocs && item.status === "blocked") {
    try {
      const reqHeaderKey = getApiHeaderKey(req);
      await pullDocsInternal(ticker, period, fmpApiKey, activeCookie, reqHeaderKey);
    } catch (e: any) {
      console.warn(`[Auto-Pull Error on Add for ${ticker}]:`, e.message);
    }
  }

  res.json({ success: true, item: batchManager.reAuditItem(ticker), batchState: batchManager.state });
});

app.post("/api/batch/update-portfolio", (req: Request, res: Response) => {
  const { id, ticker, portfolio } = req.body;
  const target = id || ticker;
  if (!target) {
    return res.status(400).json({ error: "Missing id or ticker." });
  }
  const item = batchManager.updateItemPortfolio(target, portfolio);
  res.json({ success: Boolean(item), item, batchState: batchManager.state });
});

app.post("/api/batch/remove", (req: Request, res: Response) => {
  const { id, purgeStaging } = req.body;
  if (id) {
    batchManager.removeItem(id, Boolean(purgeStaging));
  }
  res.json({ success: true, batchState: batchManager.state });
});

app.post("/api/batch/clear", (req: Request, res: Response) => {
  const { purgeStaging } = req.body;
  batchManager.clearQueue(Boolean(purgeStaging));
  if (purgeStaging) {
    state.files = [];
    updateTokenCounts();
  }
  res.json({ success: true, batchState: batchManager.state });
});

app.post("/api/batch/purge-staging", (req: Request, res: Response) => {
  const { ticker } = req.body;
  let count = 0;
  if (ticker) {
    count = batchManager.purgeItemStagingFiles(ticker);
    state.files = state.files.filter(f => !f.name.toUpperCase().includes(ticker.toUpperCase()));
  } else {
    count = batchManager.purgeAllStagingFiles();
    state.files = [];
  }
  updateTokenCounts();
  res.json({ success: true, purgedCount: count, batchState: batchManager.state });
});

app.post("/api/batch/set-staging-location", (req: Request, res: Response) => {
  const { location } = req.body;
  if (location === "gdrive" || location === "local") {
    batchManager.setStagingLocation(location);
  }
  res.json({ success: true, batchState: batchManager.state });
});

app.post("/api/batch/override", (req: Request, res: Response) => {
  const { id, ticker, overridden } = req.body;
  const target = id || ticker;
  if (!target) {
    return res.status(400).json({ error: "Missing id or ticker to override." });
  }
  const item = batchManager.toggleItemOverride(target, overridden);
  res.json({ success: true, item, batchState: batchManager.state });
});

app.post("/api/batch/delete-file", (req: Request, res: Response) => {
  const { fileName, ticker } = req.body;
  if (!fileName) {
    return res.status(400).json({ error: "Missing fileName to delete." });
  }
  const deleted = batchManager.purgeSpecificStagingFile(fileName, ticker);
  state.files = state.files.filter(f => f.name !== fileName && f.id !== fileName);
  updateTokenCounts();
  res.json({ success: true, deleted, batchState: batchManager.state });
});

app.post("/api/batch/recheck", (req: Request, res: Response) => {
  batchManager.recheckAll();
  res.json({ success: true, batchState: batchManager.state });
});

app.post("/api/batch/stop", (req: Request, res: Response) => {
  batchManager.stop();
  state.status = 'paused';
  res.json({ success: true, batchState: batchManager.state });
});

app.post("/api/batch/start", (req: Request, res: Response) => {
  if (batchManager.state.status === 'running') {
    return res.json({ success: true, message: "Batch is already running.", batchState: batchManager.state });
  }

  if (batchManager.state.items.length === 0) {
    return res.status(400).json({ error: "Batch queue is empty." });
  }

  batchManager.recheckAll();
  const readyItems = batchManager.state.items.filter(i => i.status === 'ready');
  if (readyItems.length === 0) {
    return res.status(422).json({
      error: "No ready items in queue. Resolve any blocked items with missing files or mismatches.",
      batchState: batchManager.state
    });
  }

  res.json({ success: true, message: "Batch execution started in background.", batchState: batchManager.state });

  // Launch in background
  batchManager.runBatch(executeBatchCompany, {
    onCompanyComplete: (item) => {
      dispatchNotification(notificationConfig, {
        event: 'batch_company',
        title: `✅ Batch Progress: ${item.ticker} (${item.period}) Done`,
        message: `Company ${item.ticker} (${item.period}) valuation completed. Dossier compiled (${item.dossierSize || 0} KB).`,
        ticker: item.ticker,
        period: item.period,
        price: item.price,
        dossierPath: item.dossierPath,
        dossierHtmlPath: item.dossierHtmlPath
      }).catch(err => console.warn("[Notification Warning] Batch company dispatch:", err.message));
    },
    onBatchComplete: (bState) => {
      const completed = bState.items.filter(i => i.status === 'completed');
      const failed = bState.items.filter(i => i.status === 'failed');
      const blocked = bState.items.filter(i => i.status === 'blocked');
      const tickers = completed.map(i => i.ticker);

      dispatchNotification(notificationConfig, {
        event: 'batch_complete',
        title: `🏁 Autonomous Batch Complete: ${completed.length}/${bState.items.length} Finished`,
        message: `Autonomous Valuation Batch finished.\n• Completed: ${completed.length}\n• Failed: ${failed.length}\n• Blocked: ${blocked.length}\nCompanies: ${tickers.join(", ")}`,
        batchStats: {
          total: bState.items.length,
          completed: completed.length,
          failed: failed.length,
          blocked: blocked.length,
          tickers
        }
      }).catch(err => console.warn("[Notification Warning] Batch complete dispatch:", err.message));
    },
    onCompanyBlocked: (item) => {
      dispatchNotification(notificationConfig, {
        event: 'blocked_alert',
        title: `⚠️ Batch Alert: ${item.ticker} is Blocked`,
        message: `Company ${item.ticker} (${item.period}) was blocked: ${item.error || 'Missing required filings'}`,
        ticker: item.ticker,
        period: item.period,
        price: item.price
      }).catch(err => console.warn("[Notification Warning] Batch blocked dispatch:", err.message));
    }
  }).catch(err => {
    console.error("[Batch Queue Fatal Error]", err);
  });
});

app.post("/api/batch/set-retention", (req: Request, res: Response) => {
  const { retain } = req.body;
  batchManager.setRetainStagingFiles(retain !== false);
  res.json({ success: true, batchState: batchManager.state });
});

// Download a single company's completed valuation dossier
app.get("/api/batch/dossier/:ticker", (req: Request, res: Response) => {
  const ticker = req.params.ticker.toUpperCase();
  if (!fs.existsSync(VAULT_DOSSIER_DIR)) {
    return res.status(404).json({ error: "Dossier repository directory not found." });
  }

  try {
    const files = fs.readdirSync(VAULT_DOSSIER_DIR);
    const matched = files.filter(f => f.toUpperCase().startsWith(`${ticker}_DEEP_VALUATION_DOSSIER_`));
    if (matched.length === 0) {
      return res.status(404).json({ error: `No dossier found for ${ticker}.` });
    }
    // Pick the most recent dossier file
    matched.sort().reverse();
    const filePath = path.join(VAULT_DOSSIER_DIR, matched[0]);
    res.setHeader("Content-Disposition", `attachment; filename="${matched[0]}"`);
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    fs.createReadStream(filePath).pipe(res);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed retrieving dossier." });
  }
});

// Download all completed dossiers as a single ZIP archive
app.get("/api/batch/download-all-dossiers", (req: Request, res: Response) => {
  if (!fs.existsSync(VAULT_DOSSIER_DIR)) {
    return res.status(404).json({ error: "Dossier repository directory not found." });
  }

  try {
    const files = fs.readdirSync(VAULT_DOSSIER_DIR).filter(f => f.endsWith(".md"));
    if (files.length === 0) {
      return res.status(404).json({ error: "No completed valuation dossiers found to download." });
    }

    const zip = new AdmZip();
    for (const f of files) {
      const fullPath = path.join(VAULT_DOSSIER_DIR, f);
      zip.addLocalFile(fullPath);
    }

    const zipBuffer = zip.toBuffer();
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Disposition", `attachment; filename="Completed_Valuation_Dossiers_${dateStr}.zip"`);
    res.setHeader("Content-Type", "application/zip");
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed generating dossiers zip." });
  }
});

// --- Notification API Endpoints ---
app.get("/api/notifications/config", (req: Request, res: Response) => {
  res.json({ success: true, config: notificationConfig });
});

app.post("/api/notifications/config", (req: Request, res: Response) => {
  const { config } = req.body;
  if (config && typeof config === "object") {
    notificationConfig = config;
    try {
      fs.writeFileSync(NOTIFICATION_CONFIG_FILE, JSON.stringify(notificationConfig, null, 2), "utf-8");
    } catch (e) {
      console.warn("[Notification Warning] Could not persist notification config:", e);
    }
  }
  res.json({ success: true, config: notificationConfig });
});

app.post("/api/notifications/test", async (req: Request, res: Response) => {
  const { channel, config } = req.body;
  const cfg: NotificationConfig = config || notificationConfig;

  const testPayload: NotificationPayload = {
    event: "test",
    title: "🔔 Value Investing Terminal: Alert Test",
    message: "Your automated valuation notification system is connected and working properly!",
    ticker: "TEST",
    period: "FY-26",
    price: "100.00"
  };

  try {
    if (channel === "telegram") {
      const result = await sendTelegramNotification(cfg, testPayload);
      return res.json(result);
    } else if (channel === "ntfy") {
      const result = await sendNtfyNotification(cfg, testPayload);
      return res.json(result);
    } else if (channel === "email") {
      const result = await sendEmailNotification(cfg, testPayload);
      return res.json(result);
    } else {
      return res.status(400).json({ success: false, error: "Unsupported channel specified." });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

app.post("/api/notifications/telegram/detect-chat", async (req: Request, res: Response) => {
  const { botToken } = req.body;
  const token = botToken || notificationConfig.telegram?.botToken;
  try {
    const result = await detectTelegramChatId(token);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

app.post("/api/notifications/dispatch", async (req: Request, res: Response) => {
  const { payload, config } = req.body;
  const cfg = config || notificationConfig;
  try {
    const results = await dispatchNotification(cfg, payload);
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Download all staged files as a single ZIP
app.get("/api/session/download-all", (req: Request, res: Response) => {
  if (state.files.length === 0) {
    return res.status(404).json({ error: "No files found in the document repository." });
  }

  try {
    const zip = new AdmZip();

    for (const fileLog of state.files) {
      const filePath = path.join(DOWNLOADS_DIR, fileLog.id);
      if (fs.existsSync(filePath)) {
        zip.addLocalFile(filePath, "", fileLog.name);
      }
    }

    const zipBuffer = zip.toBuffer();
    const configTicker = (req.query.ticker as string) || state.config?.ticker || "Symbol";
    const configPeriod = (req.query.period as string) || state.config?.period || "Q#-YY";
    res.setHeader("Content-Disposition", `attachment; filename="${configTicker} ${configPeriod} Docs.zip"`);
    res.setHeader("Content-Type", "application/zip");
    res.send(zipBuffer);
  } catch (err: any) {
    console.error("[Download All Error]", err);
    res.status(500).json({ error: "Failed to generate zip file." });
  }
});

// Download staged file from server download cache
app.get("/api/session/download-file/:fileId", (req: Request, res: Response) => {
  const { fileId } = req.params;
  const fileLog = state.files.find(f => f.id === fileId);
  if (!fileLog) {
    return res.status(404).json({ error: "File metadata not found inside session." });
  }

  const filePath = path.join(DOWNLOADS_DIR, fileId);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File physical contents not found on server cache." });
  }

  res.setHeader("Content-Disposition", `attachment; filename="${fileLog.name}"`);
  res.setHeader("Content-Type", fileLog.mimeType || "application/octet-stream");
  res.sendFile(filePath);
});

// Serve inline file stream for document repository preview (e.g., iframe PDF/image embedding)
app.get("/api/session/view-file/:fileId", (req: Request, res: Response) => {
  const { fileId } = req.params;
  const fileLog = state.files.find(f => f.id === fileId);
  if (!fileLog) {
    return res.status(404).json({ error: "File metadata not found inside session." });
  }

  const filePath = path.join(DOWNLOADS_DIR, fileId);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File physical contents not found on server cache." });
  }

  res.setHeader("Content-Disposition", `inline; filename="${fileLog.name}"`);
  res.setHeader("Content-Type", fileLog.mimeType || "application/octet-stream");
  res.sendFile(filePath);
});

// Detailed JSON file content & metadata preview endpoint for Document Repository & Batch Staging
app.get(["/api/session/file-content/:fileId", "/api/batch/file-content"], async (req: Request, res: Response) => {
  const fileId = String(req.params.fileId || req.query.fileName || req.query.fileId || "");
  if (!fileId) {
    return res.status(400).json({ error: "No fileId or fileName specified." });
  }

  let fileLog = state.files.find(f => f.id === fileId || f.name === fileId);
  let filePath = path.join(DOWNLOADS_DIR, fileId);

  // If not found in session downloads, search active staging directories (for batch documents)
  if (!fs.existsSync(filePath)) {
    const candidateDirs = [
      batchManager?.state?.activeStagingDir,
      STAGING_DIR,
      path.join(process.cwd(), "staging"),
      "G:/My Drive/Company Data/_STAGING",
      DOWNLOADS_DIR
    ].filter(Boolean) as string[];
    const cleanId = path.basename(fileId);
    let foundStagingPath = "";

    for (const dir of candidateDirs) {
      if (!dir || !fs.existsSync(dir)) continue;
      const direct = path.join(dir, cleanId);
      if (fs.existsSync(direct)) {
        try {
          if (fs.statSync(direct).isFile()) {
            foundStagingPath = direct;
            break;
          }
        } catch (e) {}
      }
      // Check case-insensitive
      try {
        const entries = fs.readdirSync(dir);
        const match = entries.find(e => e.toLowerCase() === cleanId.toLowerCase());
        if (match) {
          const matchPath = path.join(dir, match);
          if (fs.statSync(matchPath).isFile()) {
            foundStagingPath = matchPath;
            break;
          }
        }
      } catch (e) {}
    }

    if (foundStagingPath) {
      filePath = foundStagingPath;
      try {
        const stats = fs.statSync(filePath);
        const fn = path.basename(filePath);
        const fnLower = fn.toLowerCase();
        let mimeType = "text/plain";
        if (fnLower.endsWith(".md")) mimeType = "text/markdown";
        else if (fnLower.endsWith(".csv")) mimeType = "text/csv";
        else if (fnLower.endsWith(".json")) mimeType = "application/json";
        else if (fnLower.endsWith(".pdf")) mimeType = "application/pdf";

        let auditCat = "Supplementary";
        if (fnLower.includes("10-k") || fnLower.includes("20-f") || fnLower.includes("annual")) auditCat = "10-K";
        else if (fnLower.includes("10-q") || fnLower.includes("6-k") || fnLower.includes("quarterly")) auditCat = "10-Q";
        else if (fnLower.includes("8-k") || fnLower.includes("item2.02") || fnLower.includes("release")) auditCat = "8-K";
        else if (fnLower.includes("transcript") || fnLower.includes("call")) auditCat = "Transcript";
        else if (fnLower.includes("csv") || fnLower.includes("ttm") || fnLower.includes("financial")) auditCat = "Financials TTM";

        fileLog = {
          id: fn,
          name: fn,
          size: stats.size,
          mimeType,
          uploadedAt: stats.mtime.toISOString(),
          auditCategory: auditCat,
          displayName: fn
        };
      } catch (e) {}
    }
  }

  if (!fileLog || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File physical contents not found on server cache or staging repository." });
  }

  const mime = (fileLog.mimeType || "").toLowerCase();
  const name = (fileLog.name || "").toLowerCase();

  const isPdf = mime.includes("pdf") || name.endsWith(".pdf");
  const isImage = mime.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name);
  const isCsv = mime.includes("csv") || name.endsWith(".csv");
  const isJson = mime.includes("json") || name.endsWith(".json");
  const isMarkdown = name.endsWith(".md") || mime.includes("markdown");
  const isText = isCsv || isJson || isMarkdown || mime.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".xml") || name.endsWith(".htm") || name.endsWith(".html") || name.endsWith(".tsv") || name.endsWith(".log");

  let textContent = "";
  let truncated = false;
  let lineCount = 0;

  if (isText) {
    try {
      const stats = await fs.promises.stat(filePath);
      const MAX_TEXT_SIZE = 2 * 1024 * 1024; // 2MB max text readout
      if (stats.size > MAX_TEXT_SIZE) {
        const stream = fs.createReadStream(filePath, { start: 0, end: MAX_TEXT_SIZE });
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(Buffer.from(chunk));
        }
        textContent = Buffer.concat(chunks).toString("utf-8");
        truncated = true;
      } else {
        textContent = await fs.promises.readFile(filePath, "utf-8");
      }
      lineCount = textContent.split("\n").length;
    } catch (err) {
      console.warn("Could not read text file content:", err);
    }
  }

  res.json({
    id: fileLog.id,
    name: fileLog.name,
    size: fileLog.size,
    mimeType: fileLog.mimeType,
    uploadedAt: fileLog.uploadedAt,
    auditCategory: fileLog.auditCategory,
    displayName: fileLog.displayName,
    isPdf,
    isImage,
    isCsv,
    isJson,
    isMarkdown,
    isText,
    textContent,
    truncated,
    lineCount
  });
});

// run next/all steps
app.post("/api/session/step/run", (req: Request, res: Response) => {
  if (!state.config) {
    return res.status(400).json({ error: "Session is not configured yet." });
  }

  const { overrideIntegrityCheck, overrideMissingFiles, overrideSubstanceFiles } = req.body || {};
  if (!overrideIntegrityCheck) {
    const auditRes = runAudit(state.files);
    if (auditRes.integrityReport?.hasMismatches) {
      return res.status(400).json({
        error: "Document integrity mismatch detected. Analysis blocked to protect against inaccurate valuation metrics.",
        requiresIntegrityConfirmation: true,
        integrityReport: auditRes.integrityReport
      });
    }
  }

  if (!overrideMissingFiles) {
    const auditRes = runAudit(state.files);
    const missingChecks = auditRes.checklist.filter(c => c.status === 'MISSING');
    if (missingChecks.length > 0) {
      return res.status(400).json({
        error: "Required pre-flight documents are missing from the staging repository.",
        requiresMissingFilesConfirmation: true,
        checklist: auditRes.checklist,
        missingFiles: missingChecks.map(c => ({
          category: c.category,
          label: c.label,
          description: c.description
        }))
      });
    }
  }

  if (!overrideSubstanceFiles) {
    const substanceReport = auditFilesSubstance(state.files);
    if (substanceReport.hasIssues) {
      return res.status(400).json({
        error: "Potential truncated or incomplete documents detected in staging repository.",
        requiresSubstanceConfirmation: true,
        substanceIssues: substanceReport.issues
      });
    }
  }

  const clientKey = getApiHeaderKey(req);
  if (clientKey) {
    state.customApiKey = clientKey;
  }

  if (state.status === 'running') {
    return res.status(200).json({ success: true, message: "Workflow processor is already running.", state });
  }

  // If session is waiting in retry cooldown, protect the cooldown timer against accidental duplicate clicks
  if (state.status === 'retrying') {
    return res.status(200).json({ success: true, message: "Engine is currently in Auto-Resume cooldown queue.", state });
  }

  if (!state.steps || state.steps.length === 0) {
    return res.status(400).json({ error: "Session steps have not been generated yet. Please initialize the session." });
  }

  let nextIndex = state.activeStepIndex || 0;
  
  // If last step is done and they trigger again, reset or return
  if (state.steps[nextIndex] && (state.steps[nextIndex].status === 'completed' || (state.steps[nextIndex].status === 'paused' && state.steps[nextIndex].response))) {
    nextIndex += 1;
  }

  if (nextIndex >= state.steps.length) {
    return res.json({ message: "All analysis steps completed.", state });
  }

  // Set running status synchronously before engaging async background worker
  state.status = 'running';

  // Trigger non-blocking async execution
  runStepProcessor(nextIndex);

  res.json({ message: "Engine successfully engaged in the background.", state });
});

// Run or re-run Crosscheck on-demand
app.post("/api/session/crosscheck", async (req: Request, res: Response) => {
  if (!state.config) {
    return res.status(400).json({ error: "Session is not configured yet." });
  }

  const clientKey = getApiHeaderKey(req);
  if (clientKey) {
    state.customApiKey = clientKey;
  }

  if (state.status === 'running') {
    return res.status(400).json({ error: "Workflow processor is already running." });
  }

  const { crosscheckModel } = req.body || {};
  if (crosscheckModel && state.config) {
    state.config.crosscheckModel = crosscheckModel;
  }

  // Ensure crosscheck step exists in state.steps
  let crosscheckStep = state.steps.find(s => s.isCrosscheck);
  if (!crosscheckStep) {
    crosscheckStep = {
      index: state.steps.length,
      title: CROSSCHECK_PROMPT.title,
      status: 'idle',
      prompt: CROSSCHECK_PROMPT.text,
      temperature: CROSSCHECK_PROMPT.defaultTemp,
      isCrosscheck: true
    };
    state.steps.push(crosscheckStep);
    state.config.enableCrosscheck = true;
  } else {
    // Reset status to idle for re-running
    crosscheckStep.status = 'idle';
    crosscheckStep.response = undefined;
    // Remove previous crosscheck messages from history to keep it fresh
    state.history = state.history.filter(m => m.type !== 'crosscheck');
  }

  const crosscheckIdx = state.steps.findIndex(s => s.isCrosscheck);
  state.activeStepIndex = crosscheckIdx;
  state.currentPromptIndex = crosscheckIdx;

  runStepProcessor(crosscheckIdx);
  res.json({ message: "Forensic Crosscheck engaged in the background.", state });
});

// stop / pause current sequential analysis job
app.post("/api/session/stop", (req: Request, res: Response) => {
  console.log(`[Stop Clicked] Halting running sequential loops.`);
  clearRetryTimer();
  state.retryState = null;
  state.status = 'paused';
  
  // Revert any executing step back to paused or idle
  state.steps.forEach(st => {
    if (st.status === 'executing') {
      st.status = 'paused';
    }
  });
  
  res.json({ success: true, state });
});

// Immediately bypass retry cooldown and execute step now
app.post("/api/session/retry-now", (req: Request, res: Response) => {
  const stepIdx = state.retryState ? state.retryState.stepIndex : state.activeStepIndex;
  console.log(`[Retry Now Requested] Immediately resuming execution on Step ${stepIdx + 1}...`);
  clearRetryTimer();
  state.retryState = null;
  state.status = 'running';
  runStepProcessor(stepIdx);
  res.json({ success: true, message: `Immediately resuming Step ${stepIdx + 1}.`, state });
});

// Explicitly switch to Standard Tier and resume execution immediately
app.post("/api/session/retry-standard", (req: Request, res: Response) => {
  const stepIdx = state.retryState ? state.retryState.stepIndex : state.activeStepIndex;
  console.log(`[Upgrade to Standard Tier Requested] Switching serviceTier to 'standard' and resuming Step ${stepIdx + 1}...`);
  if (state.config) {
    state.config.serviceTier = 'standard';
  }
  clearRetryTimer();
  state.retryState = null;
  state.status = 'running';
  runStepProcessor(stepIdx);
  res.json({ success: true, message: `Switched to Standard Tier and resuming Step ${stepIdx + 1}.`, state });
});

// Cancel auto-resume cooldown timer and pause session
app.post("/api/session/retry-cancel", (req: Request, res: Response) => {
  console.log(`[Retry Cancel Requested] Cancelling auto-resume countdown and pausing session.`);
  clearRetryTimer();
  state.retryState = null;
  state.status = 'paused';
  res.json({ success: true, message: "Auto-resume cancelled. Session paused.", state });
});

// inject commentary to current history context without trigger LLM immediately
app.post("/api/session/comment", (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "No comment content received." });
  }
  
  console.log(`[Comment Injection] Direct-staged in analyst thread: "${text.slice(0, 50)}..."`);
  
  state.history.push({
    role: 'user',
    text: `[INJECTED USER COMMENTARY]: ${text}`,
    timestamp: new Date().toISOString()
  });
  
  res.json({ success: true, state });
});

// temperature / thinkingLevel override for dynamic step
app.post("/api/session/step/temp", (req: Request, res: Response) => {
  const { index, temperature, thinkingLevel } = req.body;
  const idx = Number(index);
  if (state.steps[idx]) {
    if (temperature !== undefined) {
      state.steps[idx].temperature = Number(temperature);
    }
    if (thinkingLevel !== undefined) {
      state.steps[idx].thinkingLevel = thinkingLevel;
    }
    res.json({ success: true, step: state.steps[idx] });
  } else {
    res.status(404).json({ error: "Step index not found." });
  }
});

app.post("/api/session/step/thinking-level", (req: Request, res: Response) => {
  const { index, thinkingLevel } = req.body;
  const idx = Number(index);
  if (state.steps[idx]) {
    if (thinkingLevel !== undefined) {
      state.steps[idx].thinkingLevel = thinkingLevel;
    }
    res.json({ success: true, step: state.steps[idx] });
  } else {
    res.status(404).json({ error: "Step index not found." });
  }
});

// rewind previous interaction
app.post("/api/session/rewind", async (req: Request, res: Response) => {
  if (state.history.length < 2) {
    return res.status(400).json({ error: "Cannot rewind further back. Log history is at initial state." });
  }

  console.log(`[Rewind Requested] Reverting last analyst transaction.`);
  
  // Pop the AI reply and user prompt
  state.history.pop(); // Reverts last 'model' message
  const lastUserMsg = state.history.pop(); // Reverts corresponding 'user' prompt

  // Reset the status of corresponding step
  if (lastUserMsg && lastUserMsg.type === 'master_prompt' && lastUserMsg.index !== undefined) {
    const rolledIndex = lastUserMsg.index;
    state.steps[rolledIndex].status = 'idle';
    state.steps[rolledIndex].response = undefined;
    state.activeStepIndex = rolledIndex;
    state.currentPromptIndex = rolledIndex;
  }

  state.status = 'paused';
  await updateCompiledReportFile();
  res.json({ success: true, state });
});

// custom interrogation question
app.post("/api/session/interrogate", async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No query text provided." });
  }

  if (state.status === 'running') {
    return res.status(400).json({ error: "Forensic analyst engine busy. Wait until paused/idle." });
  }

  try {
    const customKey = getApiHeaderKey(req) || state.customApiKey;
    const ai = getGeminiClient(customKey);
    console.log(`[Custom Interrogation] Processing query: "${text}"`);
    const modelToUse = state.config?.model || "gemini-3.8-flash";
    state.status = 'running';

    let reply = "";
    let promptTokens = 0;
    let replyTokens = 0;

    const isOllamaModel = modelToUse.toLowerCase().includes("ollama") || modelToUse.toLowerCase().includes("qwen") || modelToUse.toLowerCase().includes("gemma");

    if (isOllamaModel) {
      console.log(`[Interrogation via Ollama] Model: ${modelToUse}`);
      const ollamaMessages: Array<{ role: string; content: string }> = [
        { role: "system", content: VALUE_INVESTING_SYSTEM_INSTRUCTION }
      ];

      const fileContextText = await prepareOllamaFileContext(state.files);
      if (fileContextText) {
        ollamaMessages.push({
          role: "user",
          content: `These are the target company's financial records, SEC filings, earnings transcripts, and supplementary CSV datasets:\n\n${fileContextText}\n\nIndex them as your reference context.`
        });
        ollamaMessages.push({
          role: "assistant",
          content: "Acknowledged. I have indexed these reference materials as my core contextual memory prefix. I am ready to perform analysis with precise citations."
        });
      }

      state.history.forEach(msg => {
        ollamaMessages.push({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.text
        });
      });

      const promptMessage = `HUMAN INTERROGATION QUESTION: ${text}\n\nUsing all reference reports and data files loaded, provide a thorough response answering the human's query.`;
      ollamaMessages.push({
        role: "user",
        content: promptMessage
      });

      const ollamaRes = await generateContentWithOllama(modelToUse, ollamaMessages, 0.5);
      reply = ollamaRes.text || "Analyzed successfully with no direct reply text.";
      promptTokens = ollamaRes.usageMetadata.promptTokenCount;
      replyTokens = ollamaRes.usageMetadata.candidatesTokenCount;
    } else {
      const customKey = getApiHeaderKey(req) || state.customApiKey;
      const ai = getGeminiClient(customKey);
      // Compile file components as Part objects safely
      const fileParts = await prepareFileContextParts(ai, state.files);

      // Construct cache-optimized contents array for custom query
      const contents: any[] = [];

      // 1. Immutable Caching Prefix: heavy files are attached first
      if (fileParts.length > 0) {
        contents.push({
          role: "user",
          parts: [
            ...fileParts,
            { text: "These are the target company's financial records, SEC filings, earnings transcripts, and supplementary CSV datasets. Index them as your immutable reference context." }
          ]
        });
        contents.push({
          role: "model",
          parts: [{ text: "Acknowledged. I have indexed these reference materials as my core contextual memory prefix. I am ready to perform analysis with precise citations." }]
        });
      }

      // 2. Append history (strictly dialogue turns to preserve prefix cache)
      state.history
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .forEach(msg => {
          contents.push({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          });
        });

      // 3. Append latest interrogation turn
      const promptMessage = `HUMAN INTERROGATION QUESTION: ${text}\n\nUsing all reference reports and data files loaded, provide a thorough response answering the human's query.`;
      contents.push({
        role: "user",
        parts: [{ text: promptMessage }]
      });

      const response = await generateContentWithRetry(ai, {
        model: modelToUse,
        contents: contents,
        config: {
          thinkingConfig: {
            thinkingLevel: "high"
          },
          systemInstruction: VALUE_INVESTING_SYSTEM_INSTRUCTION,
          serviceTier: state.config?.serviceTier || "flex"
        }
      });

      reply = response.text || "Analyzed successfully with no direct reply text.";
      if (response.usageMetadata) {
        promptTokens = response.usageMetadata.promptTokenCount || 0;
        replyTokens = response.usageMetadata.candidatesTokenCount || 0;
        const cachedTokens = (response.usageMetadata as any)?.cachedContentTokenCount || 0;
        if (cachedTokens > 0) {
          state.cachedTokenCount = cachedTokens;
          state.cacheStatus = 'active';
          console.log(`[Gemini Interrogation Telemetry]: Prompt = ${promptTokens}, Candidate = ${replyTokens}, Cached = ${cachedTokens} (Native implicit cache hit), Total = ${response.usageMetadata.totalTokenCount}`);
        } else {
          console.log(`[Gemini Interrogation Telemetry]: Prompt tokens = ${promptTokens}, Candidate tokens = ${replyTokens}, Total = ${response.usageMetadata.totalTokenCount}`);
        }
      }
    }

    const uploadedTokens = state.files.reduce((sum, f) => sum + (f.tokens || 0), 0);
    const previousHistoryTokens = state.history.reduce((sum, msg) => sum + (msg.actualTokens || Math.ceil(msg.text.length / 4.2)), 0);
    const userTurnTokens = Math.max(0, promptTokens - uploadedTokens - previousHistoryTokens);

    // Save strictly to interactive logger
    state.history.push({
      role: 'user',
      text: text,
      type: 'custom_injection',
      timestamp: new Date().toISOString(),
      actualTokens: userTurnTokens
    });
    state.history.push({
      role: 'model',
      text: reply,
      timestamp: new Date().toISOString(),
      actualTokens: replyTokens
    });

    state.status = 'paused';
    await updateCompiledReportFile();
    res.json({ success: true, state });
  } catch (err: any) {
    console.error(`[Interrogation Error]`, err);
    state.status = 'paused';
    res.status(500).json({ error: err.message || "Failed during interrogation analysis." });
  }
});

// Extend Context Cache Keep-Alive
app.post("/api/session/cache/extend", async (req: Request, res: Response) => {
  res.json({ success: true, cacheKeepAlive: state.cacheKeepAlive || null });
});

// Reset Terminal (Hard Purge)
app.post("/api/session/hard-reset", async (req: Request, res: Response) => {
  state.status = 'idle';
  state.activeStepIndex = 0;
  state.currentPromptIndex = 0;
  state.history = [];
  state.steps = generateSessionSteps(true);

  for (const fileLog of state.files) {
    try {
      if (fileLog.geminiName) {
        try {
          const ai = getGeminiClient(getApiHeaderKey(req) || state.customApiKey);
          await ai.files.delete({ name: fileLog.geminiName }).catch(console.error);
        } catch (e) {
          console.warn(`Could not delete file ${fileLog.name} from Gemini:`, e);
        }
      }
    } catch (ignore) {}
    try {
      const localCachePath = path.join(DOWNLOADS_DIR, fileLog.id);
      await fs.promises.unlink(localCachePath).catch(() => {});
    } catch (ignore) {}
  }
  state.files = [];
  delete state.config;

  updateTokenCounts();
  const auditResult = runAudit(state.files);
  state.auditPassed = auditResult.passed;

  console.log(`[Terminal Hard Reset] Session completely wiped.`);
  res.json({ success: true, state, auditChecklist: auditResult.checklist });
});

// Reset Terminal (Soft Purge)
app.post("/api/session/reset", (req: Request, res: Response) => {
  state.status = 'idle';
  state.activeStepIndex = 0;
  state.currentPromptIndex = 0;
  state.history = [];
  state.files = state.files.filter(f => f.id !== "compiled-obsidian-report");
  state.steps = generateSessionSteps(state.config?.enableCrosscheck !== false);
  delete state.crosscheckVerdict;
  state.cachedTokenCount = 0;
  state.cacheStatus = 'bypassed';

  updateTokenCounts();

  console.log(`[Terminal Reset] Session workspace conversations soft-purged. Config & staged files retained.`);
  res.json({ success: true, state });
});

function alignMarkdownTables(md: string): string {
  return md;
}

function extractFrontmatter(
  text: string,
  ticker: string,
  period: string,
  configPrice: string | number | undefined,
  model: string
): string {
  // 1. Price
  let price = configPrice ? String(configPrice) : null;
  if (!price || price === 'N/A') {
    const pm = text.match(/(?:Current Market Valuation Price|Current Stock Price|Current Market Price).*?\$([0-9,]+\.?[0-9]*)/i);
    if (pm) price = pm[1];
  }

  const p11Match = text.match(/^##?\s+\[?Part\s+11:/im);
  const p12Match = text.match(/^##?\s+\[?Part\s+12:/im);
  const m1Match = text.match(/^###?\s+\[?(?:(?:Pillar\s+)?6\.?\s+)?Decision-Support\s+Triage\s+Directive/im);
  const m3Match = text.match(/^###?\s+\[?(?:(?:Part\s+)?(?:5\.?\s+)?)(?:The\s+4\s+)?Isolation\s+Gates/im);
  let verdictText = '';
  if (p11Match && p11Match.index !== undefined) {
    const p11Idx = p11Match.index;
    if (p12Match && p12Match.index !== undefined && p12Match.index > p11Idx) {
      verdictText = text.slice(p11Idx, p12Match.index);
    } else {
      verdictText = text.slice(p11Idx);
    }
  } else if (p12Match && p12Match.index !== undefined) {
    verdictText = text.slice(p12Match.index);
  } else if (m1Match && m1Match.index !== undefined) {
    verdictText = text.slice(m1Match.index);
  } else if (m3Match && m3Match.index !== undefined) {
    verdictText = text.slice(m3Match.index);
  }

  const dbMatch = verdictText.match(/^##\s+Quantitative Double-Blind/im);
  if (dbMatch && dbMatch.index !== undefined) {
    verdictText = verdictText.slice(0, dbMatch.index);
  }

  // 2. Intrinsic Value (check verdict block first, then synthesis tables)
  const curSymbolPattern = "(?:[\\$\\€\\¥\\£]|CA\\$|R\\$|MX\\$|CHF|USD)?\\s*";
  const curSymbolPatternStrict = "(?:[\\$\\€\\¥\\£]|CA\\$|R\\$|MX\\$|CHF|USD)\\s*";
  let iv: string | null = null;
  const verdictIvMatch = verdictText ? (
    verdictText.match(new RegExp(`(?:\\|\\s*)?[\\\`*]{0,3}(?:Refreshed\\s+|Mandate\\s+|Final\\s+|Synthesized\\s+|Sovereign\\s+|Probability-Weighted\\s+|Expected\\s+)*Intrinsic\\s+Value[^$\\d\\n|]{0,50}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?!%)`, 'i')) ||
    verdictText.match(new RegExp(`\\|\\s*[\\\`*]{0,3}(?:Refreshed\\s+|Final\\s+|Synthesized\\s+|Sovereign\\s+|Probability-Weighted\\s+|Expected\\s+)*Intrinsic\\s+Value[^\\n|]*[\\\`*]{0,3}\\s*\\|\\s*[:\\s]*[\\\`*]{0,3}${curSymbolPattern}([0-9,]+\\.?[0-9]*)(?!%)`, 'i')) ||
    verdictText.match(new RegExp(`(?:\\|\\s*)?(?:[\\\`*]{0,3})?(?:Refreshed\\s+|Mandate\\s+|Final\\s+|Synthesized\\s+|Sovereign\\s+|Probability-Weighted\\s+|Expected\\s+)*Intrinsic\\s+Value[^\\n$|]*?[:=|\\s]\\s*[\\\`*]{0,3}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?!%)`, 'i'))
  ) : null;
  if (verdictIvMatch) {
    iv = verdictIvMatch[1];
  } else {
    const synthMatch = text.match(new RegExp(`\\|\\s*[\\\`*]{0,3}(?:Refreshed\\s+|Final |Synthesized |Sovereign )*(?:Sovereign )?Intrinsic Value[^\\n|]*[\\\`*]{0,3}\\s*\\|\\s*[:\\s]*[\\\`*]{0,3}${curSymbolPattern}([0-9,]+\\.?[0-9]*)(?!%)`, 'i')) ||
                       text.match(new RegExp(`\\*\\s*[\\\`*]{0,3}(?:Refreshed\\s+|Final |Synthesized |Sovereign )*(?:Sovereign )?Intrinsic Value[^\\n]*?[:=][^\\n$]*?${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?!%)`, 'i')) ||
                       text.match(new RegExp(`(?:synthesized sovereign intrinsic value|synthesized intrinsic value|final intrinsic value)[^\\n$]*?${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?!%)`, 'i'));
    if (synthMatch) {
      iv = synthMatch[1];
    } else {
      const tableMatch = text.match(new RegExp(`\\|\\s*[\\\`*]{0,3}(?:Refreshed\\s+|Final |Synthesized )?Intrinsic Value[^\\n|]*[\\\`*]{0,3}\\s*\\|\\s*[:\\s]*[\\\`*]{0,3}${curSymbolPattern}([0-9,]+\\.?[0-9]*)(?!%)`, 'i'));
      if (tableMatch) {
        iv = tableMatch[1];
      } else {
        const bulletMatch = text.match(new RegExp(`\\*\\s*[\\\`*]{0,3}(?:Refreshed\\s+|Final |Synthesized )?Intrinsic Value[^\\n]*?[:=]\\s*[\\\`*]{0,3}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?!%)`, 'i'));
        if (bulletMatch) {
          iv = bulletMatch[1];
        } else {
          const proseMatch = text.match(new RegExp(`(?:synthesized intrinsic value|final intrinsic value)[^\\n$]*?${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?!%)`, 'i'));
          if (proseMatch) {
            iv = proseMatch[1];
          } else {
            const fallback = text.match(new RegExp(`(?:Synthesized Final Intrinsic Value Per Share|Synthesized Final Intrinsic Value|Synthesized Intrinsic Value)[^$\\d\\n]{0,40}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?!%)`, 'i')) ||
                             text.match(new RegExp(`(?:Final Synthesized Intrinsic Value:?\\s*${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*))(?!%)`, 'i')) ||
                             text.match(new RegExp(`(?:Intrinsic Value Per Share)[^$\\d\\n]{0,30}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?!%)`, 'i'));
            if (fallback) iv = fallback[1];
          }
        }
      }
    }
  }

  // 3. Margin of Safety (check verdict block first, then synthesis tables)
  let mos: string | null = null;
  const verdictMosMatch = verdictText ? (
    verdictText.match(/\|\s*[`*]{0,3}(?:Refreshed\s+|Current\s+|Standard\s+|Calculated\s+)?Margin\s+of\s+Safety[^\n|]*[`*]{0,3}\s*\|\s*[:\s]*[`*]{0,3}([+-]?[0-9,.]+\%)/i) ||
    verdictText.match(/(?:\|\s*)?[`*]{0,3}(?:Refreshed\s+|Current\s+|Standard\s+|Calculated\s+)?Margin\s+of\s+Safety(?:\s*\(Standard\))?[^\n|%]{0,45}?(?:[:|=]\s*|\s*\|\s*)([+-]?[0-9,.]+\%)/i) ||
    verdictText.match(/(?:Refreshed Margin of Safety|Current Margin of Safety|Standard Margin of Safety|Margin of Safety)[^%\n]{1,45}?([+-]?[0-9,.]+\%)/i)
  ) : null;
  const mosTableMatch = verdictMosMatch ||
                        text.match(/\|\s*[`*]{0,3}(?:Refreshed\s+|Standard\s+|Calculated\s+)?Margin\s+of\s+Safety[`*]{0,3}\s*\|\s*[:\s]*[`*]{0,3}([+-]?[0-9,.]+\%)/i);
  if (mosTableMatch) {
    mos = mosTableMatch[1];
  } else {
    const mosMatch = text.match(/(?:Refreshed Standard Margin of Safety|Current Standard Margin of Safety at Market|Margin of Safety at Market|Standard Margin of Safety)[^%\r\n]*?([+-]?[0-9,.]+\%)/i) ||
                     text.match(/Standard Margin of Safety\s*=?[^%\r\n]*?([+-]?[0-9,.]+\%)/i);
    if (mosMatch) {
      mos = mosMatch[1];
      const matchIdx = mosMatch.index || 0;
      const surrounding = text.slice(Math.max(0, matchIdx - 25), matchIdx + 65);
      if ((surrounding.toLowerCase().includes('negative') || surrounding.toLowerCase().includes('deficit')) && !mos.startsWith('-')) {
        mos = `-${mos.replace(/^[+-]/, '')}`;
      }
    }
  }

  // Exact mathematical fallback if price & intrinsic value are present
  if (price && iv) {
    const numP = parseFloat(price.replace(/,/g, ''));
    const numIv = parseFloat(iv.replace(/,/g, ''));
    if (!isNaN(numP) && !isNaN(numIv) && numIv > 0) {
      const calcPct = ((numIv - numP) / numIv * 100).toFixed(2);
      if (!mos || mos.includes('25%') || mos.includes('40%')) {
        mos = `${calcPct}%`;
      }
      if (numP > numIv && !mos.startsWith('-')) {
        mos = `-${mos.replace(/^[+-]/, '')}`;
      }
    }
  }

  // 4. Decision / Verdict (check Part 11 final verdict first to avoid catching intermediate turns or crosscheck tripwires)
  let decision: string | null = null;
  const bodyText = text.replace(/^---[\s\S]*?---\r?\n/, '');
  const decSearchText = verdictText || bodyText;
  // Strip template examples to prevent prompt echoes from being matched as verdicts
  const cleanDecSearchText = decSearchText.replace(/\|\s*\*{0,2}Final Portfolio Action Directive\*{0,2}\s*\|\s*\*{0,2}INVEST\s*\/\s*PASS[^\n]*\n/gi, '');
  const decMatch = cleanDecSearchText.match(/(?:Final Portfolio Action Directive|Portfolio Action Directive|Action Directive|Audited Portfolio Verdict|Authoritative Portfolio Verdict|Portfolio Verdict|Action on Existing (?:Holding|Shares)|Mandate Decision|Definitive Action|Definitive Verdict|EXISTING POSITION VERDICT|PORTFOLIO ALLOCATION ACTION|Allocation Action|FINAL CAPITAL ALLOCATION DECISION|Definitive Decision|Final Definitive Decision|FINAL DECISION|Investment Decision|Ultimate Verdict|Decision Classification|Final Recommendation Check|FINAL DEFINITIVE VERDICT|RECOMMENDATION|Suggested Action|Decision)[^a-zA-Z\n]{1,50}\b(INVEST|PASS|HOLD|ACCUMULATE|MAINTAIN|TRIM|LIQUIDATE|EXIT|ESCALATE(?:\s+TO\s+FULL\s+MODE)?)\b/i) ||
                   bodyText.replace(/\|\s*\*{0,2}Final Portfolio Action Directive\*{0,2}\s*\|\s*\*{0,2}INVEST\s*\/\s*PASS[^\n]*\n/gi, '').match(/(?:Final Portfolio Action Directive|Portfolio Action Directive|Action Directive|Audited Portfolio Verdict|Authoritative Portfolio Verdict|Portfolio Verdict|Action on Existing (?:Holding|Shares)|Mandate Decision|Definitive Action|Definitive Verdict|EXISTING POSITION VERDICT|PORTFOLIO ALLOCATION ACTION|Allocation Action|FINAL CAPITAL ALLOCATION DECISION|Definitive Decision|Final Definitive Decision|FINAL DECISION|Investment Decision|Ultimate Verdict|Decision Classification|Final Recommendation Check|FINAL DEFINITIVE VERDICT|RECOMMENDATION|Definitive Verdict|VERDICT|Suggested Action|Decision)[^a-zA-Z\n]{1,50}\b(INVEST|PASS|HOLD|ACCUMULATE|MAINTAIN|TRIM|LIQUIDATE|EXIT|ESCALATE(?:\s+TO\s+FULL\s+MODE)?)\b/i);
  if (decMatch) {
    decision = decMatch[1].toUpperCase();
    if (decision.includes('ESCALATE')) decision = 'ESCALATE';
    if (decision === 'MAINTAIN') decision = 'HOLD';
    if (decision === 'TRIM') decision = 'HOLD'; // Never-Trim Compounding Doctrine
    if (decision === 'ACCUMULATE') decision = state.config?.portfolio?.holdsPosition ? 'ACCUMULATE' : 'INVEST';
    if (decision === 'EXIT') decision = 'LIQUIDATE';
  }

  // 5. Lynch Archetype (support Part 9 GFM table row + Cyclical Compounder disambiguation)
  let lynch: string | null = null;
  const lynchTableMatch = text.match(/\|\s*\*{0,2}(Cyclical Compounder|Pure Commodity Cyclical|Wide-Moat Stalwart|Slow Grower|Stalwart|Fast Grower|Cyclical|Asset Play|Turnaround)\*{0,2}\s*\|\s*\*{0,2}ACTIVE ARCHETYPE\*{0,2}/i);
  const lynchMatch = lynchTableMatch || text.match(/(?:Classification|Archetype Assignment|Lynch Archetype Classification|Lynch Archetype|Lynch Category)[^a-zA-Z\n]{1,30}\b(Cyclical Compounder|Pure Commodity Cyclical|Wide-Moat Stalwart|Slow Grower|Stalwart|Fast Grower|Cyclical|Asset Play|Turnaround)\b(?![,\/])/i);
  if (lynchMatch) lynch = lynchMatch[1].trim();

  // 6. Company Name (strictly avoid cross-line capture and peer misattribution)
  let company: string | null = null;
  if (state.competitorRadar?.targetName && (!ticker || (state.competitorRadar.targetTicker || '').toUpperCase() === ticker.toUpperCase())) {
    company = state.competitorRadar.targetName;
  }
  if (!company && ticker) {
    const tickerEscaped = ticker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const directCompMatch = text.match(new RegExp(`([A-Z][A-Za-z0-9 \\t,\\.&]{2,60}?)(?:\\s*\\(${tickerEscaped}\\)|\\s*\\([A-Z]+:\\s*${tickerEscaped}\\))`, 'i'));
    if (directCompMatch) {
      company = directCompMatch[1].replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').replace(/[:\|\-]+$/, '').trim();
    }
  }
  if (!company) {
    const compMatch = text.match(/(?:source documents provided for|coverage of|target company:\s*|analyzing\s*)([A-Z0-9 \t,\.\&]+?)(?:\s*\(NYSE:|\s*\(NASDAQ:|\s*\([A-Z]{1,5}\s*:\s*[A-Z]{1,5}\)|\s*\([A-Z]{1,5}\))/i) ||
                      text.match(/([A-Z][A-Za-z0-9 \t,\.\&]{2,60}?)(?:\s*\([A-Z]{1,5}\s*:\s*[A-Z]{1,5}\)|\s*\(NASDAQ:\s*[A-Z]{1,5}\)|\s*\(NYSE:\s*[A-Z]{1,5}\))/);
    if (compMatch) {
      company = compMatch[1].replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').replace(/[:\|\-]+$/, '').trim();
      if (company.length > 70) company = company.slice(0, 70).trim();
    }
  }
  if (!company) {
    const filingTitleMatch = text.match(/(?:Primary\s+)?(?:Annual Regulatory Filing|Interim Regulatory Filing):\*{0,2}\s*([A-Za-z0-9 \t,\.\&]{2,60}?)(?: Form 10-K| Form 10-Q| Form 20-F)/i) ||
                            text.match(/\*\*Company:\*\*\s*([^\r\n]+)/i);
    if (filingTitleMatch) {
      company = filingTitleMatch[1].replace(/[*#]/g, '').trim();
    }
  }

  const frontmatter = [
    '---',
    `ticker: ${ticker}`,
    company ? `company: "${company}"` : null,
    `period: ${period}`,
    price ? `market_price: ${price}` : null,
    iv ? `intrinsic_value: ${iv}` : null,
    mos ? `margin_of_safety: "${mos}"` : null,
    decision ? `decision: ${decision}` : null,
    lynch ? `lynch_profile: "${lynch}"` : null,
    state.config?.portfolio?.holdsPosition && state.config?.portfolio?.entryPrice ? `user_cost_basis: ${state.config.portfolio.entryPrice}` : null,
    state.config?.portfolio?.holdsPosition && state.config?.portfolio?.currentWeight ? `user_portfolio_weight: "${state.config.portfolio.currentWeight.replace(/%+$/, '')}%"` : null,
    `date: ${new Date().toISOString().split('T')[0]}`,
    `ai_model: ${model}`,
    'tags:',
    '  - value-investing',
    '  - valuation-dossier',
    '---',
    ''
  ].filter(Boolean).join('\n');

  return frontmatter;
}

export function isInterimEarningsReleaseSession(): boolean {
  return isInterimEarningsRelease(state.files);
}

// Auto-generates and updates the cumulative Markdown analysis document in state.files and DOWNLOADS_DIR
async function updateCompiledReportFile(): Promise<string> {
  const modelName = (state.config?.model || "").replace("models/", "") || "generic";
  const tickerStr = state.config?.ticker || "UNSPECIFIED";
  const periodStr = state.config?.period || "UNSPECIFIED";
  const formattedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
  
  const sessionMode = state.config?.sessionMode || 'full';
  let modeTag = "_Complete Doc_";
  if (sessionMode === 'slingshot') {
    modeTag = "_Slingshot_Memo_";
  } else if (sessionMode === 'sentinel') {
    modeTag = "_Sentinel_Pulse_";
  }
  const isInterim = isInterimEarningsReleaseSession();
  const releaseTag = isInterim ? "_Earnings_Release" : "";
  const reportFileName = `${tickerStr} ${periodStr}${releaseTag}${modeTag}${modelName}_${formattedDate}.md`;
  const fileId = "compiled-obsidian-report";

  if (!state.history || state.history.length === 0) {
    state.files = state.files.filter(f => f.id !== fileId);
    const localCachePath = path.join(DOWNLOADS_DIR, fileId);
    await fs.promises.unlink(localCachePath).catch(() => {});
    return "";
  }

  let bodyMd = `# Valuation Analysis: ${tickerStr} ${periodStr}\n`;
  bodyMd += `**Date:** ${new Date().toLocaleDateString()}\n`;
  bodyMd += `**AI Model:** ${modelName}\n\n`;
  bodyMd += `**Ticker:** ${tickerStr}  |  **Period:** ${periodStr}  |  **Market price:** $${state.config?.price || "N/A"}\n`;
  bodyMd += `---\n\n`;

  let competitorRadarInjected = false;
  const radarDossier = state.competitorRadar;

  state.history.forEach((msg, idx) => {
    if (msg.role === 'user') {
      if (msg.type === 'crosscheck') {
        const crosscheckStepNum = MASTER_PROMPTS.length + 1;
        const title = STEP_CHAPTER_TITLES[crosscheckStepNum] || `Part ${crosscheckStepNum}: Forensic Audit & Fact-Check Crosscheck`;
        bodyMd += `\n\n## ${title}\n\n`;
      } else if (msg.type === 'master_prompt') {
        const stepNum = (msg.index !== undefined ? msg.index + 1 : idx);
        const chapterTitle = STEP_CHAPTER_TITLES[stepNum] || `Part ${stepNum}: Step Analysis`;
        bodyMd += `\n\n## ${chapterTitle}\n\n`;
      } else if (msg.type === 'custom_injection') {
        bodyMd += `\n\n**User Interrogation:** ${msg.text}\n\n`;
      } else {
        bodyMd += `\n\n### User\n${msg.text}\n\n`;
      }
    } else if (msg.role === 'model') {
      const prevMsg = idx > 0 ? state.history[idx - 1] : null;
      const isStep2 = prevMsg && prevMsg.role === 'user' && prevMsg.type === 'master_prompt' && prevMsg.index === 1;

      if (isStep2 && radarDossier && !competitorRadarInjected) {
        // Embed Competitor Moat & Valuation Radar directly into Section 5.1 (Competitors), strictly BEFORE Section 5.2 (TAM)
        const sec52Regex = /(?:^|\n)(?:[#*]{0,4}\s*5\.2[\.\s]|5\.2\.\s*Total\s*Addressable)/i;
        const sec5aRegex = /(?:^|\n)(?:[#*]{0,4}\s*5A[\.\s]|5A\.\s*Market\s*&?\s*Sentiment)/i;
        const sec52Idx = msg.text.search(sec52Regex);
        const sec5aIdx = msg.text.search(sec5aRegex);
        const targetSplitIdx = sec52Idx !== -1 ? sec52Idx : sec5aIdx;

        const radarSummary = radarDossier.markdownSummary.trim()
          .replace(/^##\s+Competitor Moat & Valuation Radar/gim, '### Competitor Moat & Valuation Radar')
          .replace(/^###\s+([1-4]\.\s+(?:Data Lineage|Archetype Comparative|Moat Leaderboard|Moat & Valuation))/gim, '#### $1');

        if (targetSplitIdx !== -1) {
          const beforeSplit = msg.text.substring(0, targetSplitIdx).trimEnd();
          const afterSplit = msg.text.substring(targetSplitIdx).trimStart();
          bodyMd += `${beforeSplit}\n\n---\n\n${radarSummary}\n\n---\n\n${afterSplit}\n\n`;
          competitorRadarInjected = true;
        } else {
          bodyMd += `${msg.text}\n\n---\n\n${radarSummary}\n\n---\n\n`;
          competitorRadarInjected = true;
        }
      } else {
        bodyMd += `${msg.text}\n\n`;
      }
    }
  });

  if (radarDossier && !competitorRadarInjected) {
    const radarSummary = radarDossier.markdownSummary.trim()
      .replace(/^##\s+Competitor Moat & Valuation Radar/gim, '### Competitor Moat & Valuation Radar')
      .replace(/^###\s+([1-4]\.\s+(?:Data Lineage|Archetype Comparative|Moat Leaderboard|Moat & Valuation))/gim, '#### $1');
    bodyMd += `---\n\n${radarSummary}\n\n---\n\n`;
    competitorRadarInjected = true;
  }

  // Double-Blind Dual-Valuation Synthesis: Appended only after all active steps are completed
  const allStepsCompleted = state.steps.length > 0 && state.steps.every(s => s.status === 'completed');
  if (allStepsCompleted) {
    if (!state.pythonValuation) {
      const csvFile = state.files.find(f => f.name.toLowerCase().endsWith('.csv') || f.auditCategory === 'Financials TTM');
      if (csvFile) {
        const localCsv = path.join(DOWNLOADS_DIR, csvFile.id);
        if (fs.existsSync(localCsv)) {
          try {
            let fxRate = 1.0;
            try {
              const csvContent = fs.readFileSync(localCsv, "utf-8");
              const audit = await auditFinancialCsv(csvContent, path.basename(localCsv), state.config.ticker);
              if (audit.hasForeignCurrency && audit.fxRate > 0) {
                fxRate = audit.fxRate;
                if (state.config.isAdr === undefined) {
                  state.config.isAdr = true;
                }
              }
            } catch (e) {}
            state.pythonValuation = await runPythonValuation(localCsv, state.config, fxRate);
          } catch (e) {
            console.warn('[Valuation Engine] Could not run valuation for double-blind section:', e);
          }
        }
      }
    }
    if (state.pythonValuation && !bodyMd.includes("## Part 13: Double-Blind Dual-Valuation Synthesis")) {
      const doubleBlindMd = synthesizeDoubleBlindSection(state.pythonValuation, bodyMd, sessionMode, state.config);
      if (doubleBlindMd) {
        bodyMd += `\n\n${doubleBlindMd}\n\n`;
      }
    }
  }

  const frontmatter = extractFrontmatter(bodyMd, tickerStr, periodStr, state.config?.price, modelName);
  const md = `${frontmatter}\n${bodyMd}`;
  const formattedMd = cleanMarkdownForRendering(alignMarkdownTables(md));
  const fileBuffer = Buffer.from(formattedMd, "utf-8");

  let reportFile = state.files.find(f => f.id === fileId);
  if (!reportFile) {
    reportFile = {
      id: fileId,
      name: reportFileName,
      size: fileBuffer.length,
      mimeType: "text/markdown",
      uploadedAt: new Date().toISOString(),
      auditCategory: "Generated Output",
      displayName: reportFileName,
      tokens: Math.ceil(formattedMd.length / 4.2)
    };
    state.files.push(reportFile);
  } else {
    reportFile.name = reportFileName;
    reportFile.displayName = reportFileName;
    reportFile.size = fileBuffer.length;
    reportFile.uploadedAt = new Date().toISOString();
    reportFile.tokens = Math.ceil(formattedMd.length / 4.2);
  }

  await fs.promises.writeFile(path.join(DOWNLOADS_DIR, fileId), fileBuffer).catch(err => {
    console.warn(`[Download Cache Error Report] Could not cache generated report file`, err);
  });

  updateTokenCounts();
  return formattedMd;
}

// --- Gemini Flex Tier Probe & Automated Gatekeeper Endpoints ---

// Check live Flex Tier capacity with a 1-token canary probe
app.get("/api/flex/status", async (req: Request, res: Response) => {
  const model = (req.query.model as string) || state.config?.model || "models/gemini-4-argon";
  const force = req.query.force === "true";
  const clientKey = getApiHeaderKey(req) || state.customApiKey;

  try {
    const probe = await probeFlexTierAvailability(model, clientKey, force);
    res.json({ success: true, probe });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Get current Flex Gatekeeper Watcher state
app.get("/api/flex/waiter-status", (req: Request, res: Response) => {
  res.json({ success: true, watcher: getFlexWatcherState() });
});

// Engage the Automated Flex Gatekeeper (waits for Flex capacity, then auto-launches)
app.post("/api/flex/wait-and-launch", (req: Request, res: Response) => {
  const { target = "single", checkIntervalSeconds = 45, maxWaitHours = 4 } = req.body || {};
  const model = state.config?.model || "models/gemini-4-argon";
  const clientKey = getApiHeaderKey(req) || state.customApiKey;

  if (target === "single" && !state.config) {
    return res.status(400).json({ error: "Session is not configured yet. Initialize session first." });
  }

  // If already waiting, return existing watcher state immediately (<5ms response)
  const existingWatcher = getFlexWatcherState();
  if (existingWatcher.isWaiting) {
    return res.json({ success: true, waiting: true, watcher: existingWatcher });
  }

  const ticker = state.config?.ticker || "Target";
  const period = state.config?.period || "";

  dispatchNotification(notificationConfig, {
    event: "flex_gatekeeper_engaged",
    title: `⏳ Flex Gatekeeper Engaged: ${ticker}`,
    message: `Gemini Flex tier gatekeeper active for ${ticker}. Monitoring ${model} in background and will auto-launch the moment capacity clears.`,
    ticker,
    period
  }).catch(err => console.warn("[Notification Warning] Flex gatekeeper engaged:", err.message));

  const watcher = startFlexWatcher({
    target,
    model,
    apiKey: clientKey,
    checkIntervalSeconds: Number(checkIntervalSeconds) || 45,
    maxWaitHours: Number(maxWaitHours) || 4,
    onProbe: (probeRes, attempt) => {
      console.log(`[Flex Gatekeeper Watcher] Probe attempt ${attempt} for ${model}: ${probeRes.available ? "AVAILABLE" : probeRes.reason} (${probeRes.latencyMs}ms)`);
    },
    onCapacityAvailable: async (probeRes) => {
      console.log(`[Flex Gatekeeper] Capacity cleared! Probe responded in ${probeRes.latencyMs}ms. Auto-launching ${target}...`);
      dispatchNotification(notificationConfig, {
        event: "flex_gatekeeper_launched",
        title: `🚀 Flex Capacity Cleared: ${ticker}`,
        message: `Gemini Flex cluster capacity opened up (probe responded in ${probeRes.latencyMs}ms). Launching ${ticker} valuation on ${model} (Tier: flex)...`,
        ticker,
        period
      }).catch(err => console.warn("[Notification Warning] Flex gatekeeper launch alert:", err.message));

      if (target === "single") {
        state.status = "running";
        runStepProcessor(state.activeStepIndex || 0);
      } else {
        batchManager.runBatch(executeBatchCompany, {
          onCompanyComplete: (item) => {
            dispatchNotification(notificationConfig, {
              event: 'batch_company',
              title: `✅ Batch Progress: ${item.ticker} (${item.period}) Done`,
              message: `Company ${item.ticker} (${item.period}) valuation completed. Dossier compiled (${item.dossierSize || 0} KB).`,
              ticker: item.ticker,
              period: item.period,
              price: item.price,
              dossierPath: item.dossierPath,
              dossierHtmlPath: item.dossierHtmlPath
            }).catch(err => console.warn("[Notification Warning] Batch company dispatch:", err.message));
          },
          onBatchComplete: (bState) => {
            const completed = bState.items.filter(i => i.status === 'completed');
            const failed = bState.items.filter(i => i.status === 'failed');
            const blocked = bState.items.filter(i => i.status === 'blocked');
            const tickers = completed.map(i => i.ticker);
            dispatchNotification(notificationConfig, {
              event: 'batch_complete',
              title: `🏁 Autonomous Batch Complete: ${completed.length}/${bState.items.length} Finished`,
              message: `Autonomous Valuation Batch finished.\n• Completed: ${completed.length}\n• Failed: ${failed.length}\n• Blocked: ${blocked.length}\nCompanies: ${tickers.join(", ")}`,
              batchStats: {
                total: bState.items.length,
                completed: completed.length,
                failed: failed.length,
                blocked: blocked.length,
                tickers
              }
            }).catch(err => console.warn("[Notification Warning] Batch complete dispatch:", err.message));
          },
          onCompanyBlocked: (item) => {
            dispatchNotification(notificationConfig, {
              event: 'blocked_alert',
              title: `⚠️ Batch Alert: ${item.ticker} is Blocked`,
              message: `Company ${item.ticker} (${item.period}) was blocked: ${item.error || 'Missing required filings'}`,
              ticker: item.ticker,
              period: item.period,
              price: item.price
            }).catch(err => console.warn("[Notification Warning] Batch blocked dispatch:", err.message));
          }
        });
      }
    },
    onTimeout: (elapsedHours) => {
      console.warn(`[Flex Gatekeeper] Timed out after ${elapsedHours} hours without Flex capacity.`);
      dispatchNotification(notificationConfig, {
        event: "blocked_alert",
        title: `⚠️ Flex Gatekeeper Expired: ${ticker}`,
        message: `Flex capacity for ${model} did not clear after ${elapsedHours.toFixed(1)} hours. The gatekeeper has timed out.`,
        ticker,
        period
      }).catch(err => console.warn("[Notification Warning] Flex timeout dispatch:", err.message));
    }
  });

  res.json({ success: true, waiting: true, watcher });
});

// Cancel active Flex Gatekeeper Watcher
app.post("/api/flex/cancel-wait", (req: Request, res: Response) => {
  const wasWaiting = cancelFlexWatcher();
  res.json({ success: true, wasWaiting, watcher: getFlexWatcherState() });
});


// Download full Markdown file formatted for Obsidian
app.get("/api/session/export", async (req: Request, res: Response) => {
  const formattedMd = await updateCompiledReportFile();
  const qModel = req.query.model as string;
  const qTicker = req.query.ticker as string;
  const qPeriod = req.query.period as string;
  
  const modelName = (qModel || state.config?.model || "").replace("models/", "") || "generic";
  const tickerStr = qTicker || state.config?.ticker || "UNSPECIFIED";
  const periodStr = qPeriod || state.config?.period || "UNSPECIFIED";
  const formattedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
  
  const isInterim = isInterimEarningsReleaseSession();
  const releaseTag = isInterim ? "_Earnings_Release" : "";
  const sessionMode = state.config?.sessionMode || 'full';
  let modeTag = "_Complete Doc_";
  if (sessionMode === 'slingshot') {
    modeTag = "_Slingshot_Memo_";
  } else if (sessionMode === 'sentinel') {
    modeTag = "_Sentinel_Pulse_";
  }
  const outputFilename = `${tickerStr} ${periodStr}${releaseTag}${modeTag}${modelName}_${formattedDate}.md`;

  res.setHeader('Content-disposition', `attachment; filename="${outputFilename}"`);
  res.setHeader('Content-type', 'text/markdown; charset=utf-8');
  res.send(formattedMd);
});

// Download standalone HTML dossier
app.get("/api/session/export-html", async (req: Request, res: Response) => {
  const formattedMd = await updateCompiledReportFile();
  const qModel = req.query.model as string;
  const qTicker = req.query.ticker as string;
  const qPeriod = req.query.period as string;
  
  const modelName = (qModel || state.config?.model || "").replace("models/", "") || "generic";
  const tickerStr = qTicker || state.config?.ticker || "UNSPECIFIED";
  const periodStr = qPeriod || state.config?.period || "UNSPECIFIED";
  const formattedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
  
  const isInterim = isInterimEarningsReleaseSession();
  const releaseTag = isInterim ? "_Earnings_Release" : "";
  const sessionMode = state.config?.sessionMode || 'full';
  let modeTag = "_Valuation_Dossier_";
  let docTitleMode = "Deep Valuation Dossier";
  if (sessionMode === 'slingshot') {
    modeTag = "_Slingshot_Memo_";
    docTitleMode = "Slingshot Triage Memo";
  } else if (sessionMode === 'sentinel') {
    modeTag = "_Sentinel_Pulse_";
    docTitleMode = "Quarterly Sentinel Pulse";
  }
  const outputFilename = `${tickerStr} ${periodStr}${releaseTag}${modeTag}${modelName}_${formattedDate}.html`;
  const docTitle = `${tickerStr} - ${periodStr}${isInterim ? ' (Earnings Release)' : ''} ${docTitleMode} (${modelName})`;
  const htmlContent = convertMarkdownToHtml(formattedMd, docTitle, tickerStr);

  res.setHeader('Content-disposition', `attachment; filename="${outputFilename}"`);
  res.setHeader('Content-type', 'text/html; charset=utf-8');
  res.send(htmlContent);
});

// ==========================================
// --- NEW DATA RETRIEVAL INGEST PIPELINES ---
// ==========================================

async function saveAndUploadFile(name: string, content: Buffer | string, mimeType: string, requestHeaderKey: string, explicitCategory?: string) {
  const customKey = requestHeaderKey || state.customApiKey;
  const tempDir = os.tmpdir();
  const safeName = name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const tempPath = path.join(tempDir, `inv_terminal_${Date.now()}_${safeName}`);
  
  const fileBuffer = typeof content === "string" ? Buffer.from(content, 'utf-8') : content;
  await fs.promises.writeFile(tempPath, fileBuffer);

  const matchedCategory = detectAuditCategory(name, explicitCategory);

  console.log(`[Staging File] Processing: ${name} (${matchedCategory})`);
  
  let activeUri: string | undefined = undefined;
  let activeGeminiName: string | undefined = undefined;
  let computedTokens = Math.max(12, Math.ceil(fileBuffer.length / 4.2));

  try {
    const ai = getGeminiClient(customKey);
    const uploadedFile = await ai.files.upload({
      file: tempPath,
      config: { mimeType }
    });

    let activeFile = uploadedFile;
    if (uploadedFile.state === 'PROCESSING') {
      let attempts = 0;
      while (activeFile.state === 'PROCESSING' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        activeFile = await ai.files.get({ name: uploadedFile.name });
        attempts++;
      }
    }

    activeUri = activeFile.uri;
    activeGeminiName = activeFile.name;

    try {
      const modelToUse = state.config?.model || "models/gemini-3.8-flash";
      const tokenCountResponse = await ai.models.countTokens({
        model: modelToUse,
        contents: [
          {
            role: "user",
            parts: [
              {
                fileData: {
                  fileUri: activeFile.uri,
                  mimeType: mimeType
                }
              }
            ]
          }
        ]
      });
      if (tokenCountResponse && typeof tokenCountResponse.totalTokens === 'number') {
        computedTokens = tokenCountResponse.totalTokens;
        console.log(`[Gemini Helper Token Count] Counted true tokens for ${name}: ${computedTokens}`);
      }
    } catch (tokenErr) {
      console.warn(`[Gemini Helper Token Count Warning] Could not count tokens via Gemini API for ${name}`, tokenErr);
    }
  } catch (cloudUploadErr: any) {
    console.warn(`[Cloud Files API Warning] Could not upload ${name} directly to Files API (will use local fallback during reasoning):`, cloudUploadErr?.message || cloudUploadErr);
  } finally {
    await fs.promises.unlink(tempPath).catch(() => {});
  }

  const existing = state.files.find(f => f.name === name);
  const textStr = typeof content === "string" ? content : content.toString('utf-8');
  const lineCount = textStr.split('\n').length;

  const log: FileLog = {
    id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    size: fileBuffer.length,
    mimeType,
    uploadedAt: new Date().toISOString(),
    auditCategory: matchedCategory,
    geminiUri: activeUri,
    geminiName: activeGeminiName,
    displayName: name,
    tokens: computedTokens,
    lineCount
  };

  // Cache physical copy of generated file on container disk for user download
  await fs.promises.writeFile(path.join(DOWNLOADS_DIR, log.id), fileBuffer).catch(err => {
    console.warn(`[Download Cache Error Ingest] Could not cache generated file: ${name}`, err);
  });

  // Permanently stage generated document into STAGING_DIR for batch queue and terminal access
  if (fs.existsSync(STAGING_DIR)) {
    try {
      await fs.promises.writeFile(path.join(STAGING_DIR, name), fileBuffer);
      console.log(`[Staging Storage] Persisted document "${name}" to ${STAGING_DIR}`);
    } catch (stgErr) {
      console.warn(`[Staging Storage Warning] Could not save "${name}" to ${STAGING_DIR}:`, stgErr);
    }
  }

  // Prevent duplicate files under same name
  state.files = state.files.filter(f => f.name !== name);
  state.files.push(log);
  const auditRes = runAudit(state.files);
  state.auditPassed = auditRes.passed;
  updateTokenCounts();
  return log;
}

function cleanSecHtmlToMarkdown(htmlContent: string, filingType: string, metadata: any): string {
  let output = htmlContent;
  
  // Remove inline XBRL headers and XML schema indicators completely
  output = output.replace(/<ix:header[\s\S]*?<\/ix:header>/gi, '');
  output = output.replace(/&lt;\?xml[\s\S]*?\?&gt;/gi, '');
  output = output.replace(/<\?xml[\s\S]*?\?>/gi, '');
  output = output.replace(/&lt;!--[\s\S]*?--&gt;/g, '');
  output = output.replace(/<!--[\s\S]*?-->/g, '');
  output = output.replace(/&lt;\/?grbk-[\s\S]*?&gt;/gi, '');
  output = output.replace(/<\/?grbk-[\s\S]*?>/gi, '');

  // Strip head, style, script, noscript, svg, iframe
  output = output.replace(/<head[\s\S]*?<\/head>/gi, '');
  output = output.replace(/<style[\s\S]*?<\/style>/gi, '');
  output = output.replace(/<script[\s\S]*?<\/script>/gi, '');
  output = output.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  output = output.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  output = output.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  
  // Remove hidden display:none elements
  output = output.replace(/<[^>]*?style\s*=\s*['"]\s*display\s*:\s*none[\s\S]*?\/?>[\s\S]*?<\/div>/gi, '');
  
  // Map tables to markdown-like tables with delimiters
  output = output.replace(/<\/tr>/gi, '\n');
  output = output.replace(/<tr[^>]*?>/gi, '| ');
  output = output.replace(/<\/td>/gi, ' | ');
  output = output.replace(/<td[^>]*?>/gi, '');

  // Strip remaining HTML tags
  output = output.replace(/<[^>]*?>/g, '');

  // Replace common HTML space entities
  output = output.replace(/&nbsp;/g, ' ');
  output = output.replace(/&#160;/g, ' ');

  // Strip raw leftovers of entity elements, namespace strings, or raw SGML tags
  output = output.replace(/^[?\s]*xml version=[\s\S]*?\?[?\s]*$/gim, '');
  output = output.replace(/^[a-z0-9]+-[0-9]{8}\s*$/gim, ''); // e.g. grbk-20251231
  output = output.replace(/\r/g, '');

  // Split, trim lines, filter out empty space lines safely
  output = output.split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' '); // collapse inline spaces

  // Truncation Boilerplate Stripping
  const fType = (filingType || '').toUpperCase();
  const skipLength = Math.min(output.length * 0.3, 75000); // Skip initial portion to avoid Table of Contents false matches

  if (fType.includes("10-K") || fType.includes("20-F") || fType.includes("40-F") || fType.includes("10-Q")) {
    const searchArea = output.slice(skipLength);
    const cutoffIndex = searchArea.search(/\n(PART\s*III|PART\s*IV|ITEM\s*10\.|ITEM\s*15\.|ITEM\s*18\.|ITEM\s*19\.)\b/gi);
    if (cutoffIndex !== -1) {
      output = output.slice(0, skipLength + cutoffIndex) + "\n\n> [... PART III / ADMINISTRATIVE BOILERPLATE STRIPPED FOR TOKEN CONSERVATION ...]\n";
    }
  } else if (fType.includes("DEF 14A") || fType.includes("PROXY")) {
    // Cut off massive appendices, voting mechanics, and non-binding activist shareholder proposals
    // Prevents Gemini API prompt blocks (blockReason = OTHER) while preserving 100% of executive comp, beneficial ownership, and governance
    const searchArea = output.slice(skipLength);
    const tailIndex = searchArea.search(/\n(?:#+\s*)?(?:Proposal\s*(?:Number\s*)?[4-9]:\s*(?:Shareholder|Stockholder)\s*Proposal|STOCKHOLDER\s+PROPOSALS|SHAREHOLDER\s+PROPOSALS|PROPOSALS\s+SUBMITTED\s+BY\s+(?:STOCKHOLDERS|SHAREHOLDERS)|OTHER\s+MATTERS|APPENDIX\s+[A-Z]|ANNEX\s+[A-Z]|FORM\s+OF\s+PROXY|HOUSEHOLDING)\b/i);
    if (tailIndex !== -1) {
      output = output.slice(0, skipLength + tailIndex) + "\n\n> [... NON-BINDING SHAREHOLDER PROPOSALS & ADMINISTRATIVE MATTERS STRIPPED FOR TOKEN CONSERVATION & SAFETY COMPLIANCE ...]\n";
    }
    // Remove voting Q&As
    const qaMatch = output.search(/\n(QUESTIONS AND ANSWERS|INFORMATION ABOUT THE ANNUAL MEETING)\b/gi);
    const qaEndMatch = output.search(/\n(PROPOSAL 1|ELECTION OF DIRECTORS|CORPORATE GOVERNANCE)\b/gi);
    if (qaMatch !== -1 && qaEndMatch !== -1 && qaMatch > skipLength && qaMatch < qaEndMatch) {
      output = output.slice(0, qaMatch) + "\n\n> [... ADMINISTRATIVE VOTING MECHANICS STRIPPED BY GTD TERMINAL ...]\n\n" + output.slice(qaEndMatch);
    }
    // Remove Auditor Ratification
    const auditStart = output.search(/\n(RATIFICATION OF.*?INDEPENDENT|REPORT OF THE AUDIT COMMITTEE)\b/gi);
    if (auditStart !== -1 && auditStart > skipLength) {
      const remaining = output.slice(auditStart + 100);
      const nextSecMatch = remaining.search(/\n(PROPOSAL \d+|EXECUTIVE COMPENSATION|SECURITY OWNERSHIP)\b/gi);
      if (nextSecMatch !== -1) {
        output = output.slice(0, auditStart) + "\n\n> [... AUDITOR RATIFICATION STRIPPED BY GTD TERMINAL ...]\n\n" + remaining.slice(nextSecMatch);
      }
    }
  }

  // Prepend metadata headers
  let prefix = "";
  if (metadata) {
    prefix += `# ${metadata.company || 'Unknown Company'}\n\n`;
    prefix += `**Filing Type:** ${filingType}\n`;
    prefix += `**Filing Date:** ${metadata.filed_date || 'N/A'}\n`;
    prefix += `**Period of Report:** ${metadata.period_date || 'N/A'}\n`;
    prefix += `**Fiscal Year End:** ${metadata.fye || 'N/A'}\n`;
    prefix += "===\n\n";
  }

  return prefix + output.trim();
}

async function resolveCik(ticker: string, secUserAgent: string): Promise<string> {
  const cleanTicker = ticker.trim().toUpperCase();
  const url = "https://www.sec.gov/files/company_tickers.json";
  const res = await fetch(url, {
    headers: {
      "User-Agent": secUserAgent
    }
  });
  if (!res.ok) {
    throw new Error(`SEC company_tickers.json request failed with status: ${res.status}`);
  }
  const data = await res.json() as any;
  for (const k in data) {
    if (data[k].ticker && data[k].ticker.toUpperCase() === cleanTicker) {
      return String(data[k].cik_str);
    }
  }

  // Secondary fallback for foreign/exchange tickers
  try {
    const exchangeUrl = "https://www.sec.gov/files/company_tickers_exchange.json";
    const exRes = await fetch(exchangeUrl, { headers: { "User-Agent": secUserAgent } });
    if (exRes.ok) {
      const exData = await exRes.json() as any;
      if (exData.data && Array.isArray(exData.data)) {
        for (const row of exData.data) {
          if (row[2] && String(row[2]).toUpperCase() === cleanTicker) {
            return String(row[0]);
          }
        }
      }
    }
  } catch (exErr) {
    console.warn(`[SEC CIK Exchange Search Warning]`, exErr);
  }

  throw new Error(`Could not locate SEC CIK identifier for ticker "${cleanTicker}".`);
}

// Helper to fetch document content and attached exhibits from EDGAR
async function fetchEdgarDocumentWithExhibits(
  cikNumber: string,
  accessionNoDashes: string,
  docName: string,
  secUserAgent: string
): Promise<string> {
  const cikInt = parseInt(cikNumber, 10);
  const primaryDocUrl = `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accessionNoDashes}/${docName}`;
  console.log(`[SEC Ingest] Fetching primary document: ${primaryDocUrl}`);
  
  const primaryRes = await fetch(primaryDocUrl, {
    headers: { "User-Agent": secUserAgent }
  });
  if (!primaryRes.ok) {
    throw new Error(`Failed fetching primary document: HTTP ${primaryRes.status}`);
  }

  let htmlContent = await primaryRes.text();

  // Detect exhibit links in the primary document
  const exhibitMatches = [...htmlContent.matchAll(/href=["']([^"']+\.htm[l]?)/gi)]
    .map(m => m[1].trim())
    .filter(f => !f.startsWith("http") && !f.startsWith("#") && !f.startsWith("/"));

  const uniqueExhibits = new Set(exhibitMatches);

  // Also query EDGAR's directory index.json to discover Exhibit 99.1 even if not hyperlinked
  try {
    const indexUrl = `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accessionNoDashes}/index.json`;
    const indexRes = await fetch(indexUrl, { headers: { "User-Agent": secUserAgent } });
    if (indexRes.ok) {
      const indexData = await indexRes.json() as any;
      const items = indexData?.directory?.item;
      if (Array.isArray(items)) {
        for (const it of items) {
          const itName = (it.name || "").toLowerCase();
          const itType = (it.type || "").toUpperCase();
          const itDesc = (it.description || "").toLowerCase();
          if (
            itType.includes("EX-99") || 
            itName.includes("ex99") || 
            itName.includes("ex-99") || 
            itName.includes("exhibit99") ||
            itDesc.includes("exhibit 99") ||
            itDesc.includes("press release") ||
            itDesc.includes("earnings release")
          ) {
            if (itName.endsWith(".htm") || itName.endsWith(".html") || itName.endsWith(".txt")) {
              uniqueExhibits.add(it.name);
            }
          }
        }
      }
    }
  } catch (idxErr) {
    console.warn(`[SEC Ingest Warning] Could not fetch EDGAR index.json for ${accessionNoDashes}:`, idxErr);
  }

  for (const exDoc of uniqueExhibits) {
    const exLower = exDoc.toLowerCase();
    const isFinancialExhibit = exLower.includes("99") || exLower.includes("exhibit") || exLower.includes("epr") || exLower.includes("press") || exLower.includes("results") || htmlContent.length < 30000;
    if (isFinancialExhibit) {
      const exUrl = `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accessionNoDashes}/${exDoc}`;
      console.log(`[SEC Ingest] Fetching referenced financial exhibit: ${exUrl}`);
      try {
        const exRes = await fetch(exUrl, { headers: { "User-Agent": secUserAgent } });
        if (exRes.ok) {
          const exHtml = await exRes.text();
          htmlContent += `\n\n<hr/>\n\n<!-- EXHIBIT ATTACHMENT: ${exDoc} -->\n\n` + exHtml;
        }
      } catch (exFetchErr) {
        console.warn(`[SEC Ingest Warning] Could not fetch exhibit ${exDoc}:`, exFetchErr);
      }
    }
  }

  return htmlContent;
}

// 1. SEC filings downloader & converter
export async function executeSecIngest(
  ticker: string,
  filingTypes: string[] = ["10-K", "10-Q"],
  period?: string,
  email?: string,
  name?: string,
  reqHeaderKey?: string
): Promise<{ success: boolean; message: string; uploaded: any[] }> {
  const selectedTypes = filingTypes || ["10-K", "10-Q"];
  const userEmail = email?.trim() || "ronforti@gmail.com";
  const userName = name?.trim() || "Ronald Forti";
  const secUserAgent = `${userName} (${userEmail})`;
  const parsedTargetPeriod = parsePeriodString(period || state.config?.period);

  const cleanTicker = ticker.trim().toUpperCase();
  console.log(`[SEC Ingest] Starting filing retrieval process for ${cleanTicker}`);

  // Auto-Purge files from other tickers to prevent lingering company mismatches
  const oldCompanyFiles = state.files.filter(f => f.name.includes("_") && !f.name.startsWith(`${cleanTicker}_`) && !f.name.startsWith(`${cleanTicker} `));
  if (oldCompanyFiles.length > 0) {
    console.log(`[SEC Ingest Auto-Purge] Purging ${oldCompanyFiles.length} files from previous ticker.`);
    for (const oldFile of oldCompanyFiles) {
      try {
        const localCachePath = path.join(DOWNLOADS_DIR, oldFile.id);
        if (fs.existsSync(localCachePath)) fs.unlinkSync(localCachePath);
      } catch (e) {}
    }
    state.files = state.files.filter(f => !oldCompanyFiles.some(of => of.id === f.id));
  }

  const cik = await resolveCik(cleanTicker, secUserAgent);
  const cikPadded = cik.padStart(10, '0');
  console.log(`[SEC Ingest] Resolved CIK: ${cik} -> ${cikPadded}`);

  const submissionsUrl = `https://data.sec.gov/submissions/CIK${cikPadded}.json`;
  const subRes = await fetch(submissionsUrl, {
    headers: { "User-Agent": secUserAgent }
  });
  if (!subRes.ok) throw new Error(`Could not fetch filings list from EDGAR (HTTP ${subRes.status})`);
  const subData = await subRes.json() as any;
  
  const recent = subData.filings?.recent;
  if (!recent || !Array.isArray(recent.form)) {
    throw new Error("SEC filings endpoint returned invalid schema.");
  }

  const companyName = subData.name || cleanTicker;
  const fyeStr = subData.fiscalYearEnd || "1231";
  const fyEndFormatted = `${fyeStr.slice(0, 2)}-${fyeStr.slice(2)}`;

  // Check if issuer is a Foreign Private Issuer (files 20-F / 6-K instead of 10-K / 10-Q)
  const hasDomestic10K = recent.form.some((f: string) => f === "10-K" || f === "10-K/A");
  const hasForeign20F = recent.form.some((f: string) => f === "20-F" || f === "20-F/A" || f === "40-F" || f === "40-F/A");
  const isFpi = !hasDomestic10K && hasForeign20F;
  console.log(`[SEC Ingest] Issuer Type for ${cleanTicker}: ${isFpi ? "Foreign Private Issuer (FPI - 20-F / 6-K)" : "Domestic US Filer (10-K / 10-Q)"}`);

  interface FilingCandidate {
    form: string;
    category: string;
    resolvedType: string;
    accession: string;
    doc: string;
    filingDate: string;
    reportDate: string;
    fiscalYear?: number;
    isEarnings?: boolean;
  }

  const candidates: FilingCandidate[] = [];

  // 1. Annual Report (10-K / 20-F / 40-F)
  if (selectedTypes.includes("10-K")) {
    const targetAnnualForms = isFpi 
      ? ["20-F", "20-F/A", "40-F", "40-F/A", "10-K", "10-K/A"] 
      : ["10-K", "10-K/A"];
    
    for (let i = 0; i < recent.form.length; i++) {
      if (targetAnnualForms.includes(recent.form[i])) {
        const reportDateStr = recent.reportDate[i];
        let fYear: number | undefined;
        if (reportDateStr) {
          const fyeMonth = parseInt(fyeStr.slice(0, 2), 10) || 12;
          const reportYear = parseInt(reportDateStr.slice(0, 4), 10);
          const reportMonth = parseInt(reportDateStr.slice(5, 7), 10);
          fYear = (fyeMonth < 12 && reportMonth > fyeMonth) ? reportYear + 1 : reportYear;
        }
        candidates.push({
          form: recent.form[i],
          category: "10-K",
          resolvedType: recent.form[i],
          accession: recent.accessionNumber[i],
          doc: recent.primaryDocument[i],
          filingDate: recent.filingDate[i],
          reportDate: recent.reportDate[i],
          fiscalYear: fYear
        });
        break; // Keep latest annual filing
      }
    }
  }

  // 2. Quarterly / Interim Report (10-Q / 6-K Quarterly)
  const isQ4Period = parsedTargetPeriod.quarter === "Q4" || parsedTargetPeriod.quarter === "FY" || (period && period.toUpperCase().includes("Q4")) || (state.config?.period && state.config.period.toUpperCase().includes("Q4"));
  const shouldSkip10QForQ4 = isQ4Period && selectedTypes.includes("10-K");

  if (shouldSkip10QForQ4) {
    console.log(`[SEC Ingest] Target period for ${cleanTicker} is Q4/FY — Form 10-K fulfills Q4 requirements. Skipping Form 10-Q retrieval to avoid stale Q3 mismatch.`);
  } else if (selectedTypes.includes("10-Q")) {
    if (!isFpi) {
      let bestCandidate: FilingCandidate | null = null;
      let latestCandidate: FilingCandidate | null = null;

      for (let i = 0; i < recent.form.length; i++) {
        const formType = recent.form[i];
        if (formType === "10-Q" || formType === "10-Q/A") {
          const reportDateStr = recent.reportDate[i];
          let qSuffix = "";
          let fYear: number | undefined;
          if (reportDateStr) {
            const fyeMonth = parseInt(fyeStr.slice(0, 2), 10) || 12;
            const reportYear = parseInt(reportDateStr.slice(0, 4), 10);
            const reportMonth = parseInt(reportDateStr.slice(5, 7), 10);
            const diff = (reportMonth - fyeMonth + 12) % 12;
            if (diff >= 2 && diff <= 4) qSuffix = "1";
            else if (diff >= 5 && diff <= 7) qSuffix = "2";
            else if (diff >= 8 && diff <= 10) qSuffix = "3";
            else if (diff <= 1 || diff >= 11) qSuffix = "4";

            // If company's fiscal year ends in any month other than December,
            // any report date with month > fyeMonth falls into the NEXT calendar year's fiscal year!
            fYear = (fyeMonth < 12 && reportMonth > fyeMonth) ? reportYear + 1 : reportYear;
          }
          const candidate: FilingCandidate = {
            form: formType,
            category: "10-Q",
            resolvedType: qSuffix ? `10-Q${qSuffix}` : "10-Q",
            accession: recent.accessionNumber[i],
            doc: recent.primaryDocument[i],
            filingDate: recent.filingDate[i],
            reportDate: recent.reportDate[i],
            fiscalYear: fYear
          };

          if (!latestCandidate) latestCandidate = candidate;

          // If target period was specified, prioritize the exact quarter match
          if (parsedTargetPeriod.quarter && parsedTargetPeriod.year && reportDateStr && fYear) {
            const targetQNum = parsedTargetPeriod.quarter.replace("Q", "");
            if (qSuffix === targetQNum && fYear === parsedTargetPeriod.year) {
              bestCandidate = candidate;
              break;
            }
          } else if (!bestCandidate) {
            bestCandidate = candidate;
          }
        }
      }

      const chosenQuarterly = bestCandidate || latestCandidate;

      // Check if 10-Q for the target quarter is missing or outdated
      const hasExact10QMatch = Boolean(
        parsedTargetPeriod.quarter && parsedTargetPeriod.year && 
        bestCandidate && 
        bestCandidate.resolvedType === `10-Q${parsedTargetPeriod.quarter.replace("Q", "")}` &&
        bestCandidate.fiscalYear === parsedTargetPeriod.year
      );

      // If exact 10-Q was not found for target quarter, search for Form 8-K Item 2.02 (Earnings Release)
      let found8KEarnings = false;
      if (!hasExact10QMatch) {
        const itemsList = recent.items || [];
        for (let i = 0; i < Math.min(recent.form.length, 60); i++) {
          const formType = recent.form[i];
          if (formType === "8-K" || formType === "8-K/A") {
            const formItems = String(itemsList[i] || "");
            const isItem202 = formItems.includes("2.02");
            const primaryDesc = String(recent.primaryDocDescription?.[i] || "").toLowerCase();
            const isEarningsDesc = primaryDesc.includes("earnings") || primaryDesc.includes("press release") || primaryDesc.includes("results");

            if (isItem202 || isEarningsDesc) {
              const qTag = parsedTargetPeriod.quarter ? `${parsedTargetPeriod.quarter}-${String(parsedTargetPeriod.year || "").slice(-2) || "Interim"}` : "Interim";
              candidates.push({
                form: formType,
                category: "8-K",
                resolvedType: `8-K_Item2.02_${qTag}_Earnings_Release`,
                accession: recent.accessionNumber[i],
                doc: recent.primaryDocument[i],
                filingDate: recent.filingDate[i],
                reportDate: recent.reportDate[i],
                fiscalYear: parsedTargetPeriod.year || undefined,
                isEarnings: true
              });
              found8KEarnings = true;
              console.log(`[SEC Ingest] Identified Form 8-K Item 2.02 Earnings Release (${recent.filingDate[i]}) as interim quarterly filing for ${cleanTicker}`);
              break;
            }
          }
        }
      }

      // If we found an 8-K Item 2.02 because 10-Q is not yet filed, we skip pulling the older/mismatched 10-Q
      if (chosenQuarterly && (!found8KEarnings || hasExact10QMatch)) {
        candidates.push(chosenQuarterly);
      }
    } else {
      let foundQuarterly6K = false;
      for (let i = 0; i < Math.min(recent.form.length, 50); i++) {
        if (recent.form[i] === "6-K" || recent.form[i] === "6-K/A") {
          const doc = (recent.primaryDocument[i] || "").toLowerCase();
          const desc = (recent.primaryDocDescription?.[i] || "").toLowerCase();
          const isEarnings = doc.includes("quarter") || doc.includes("interim") || doc.includes("half") || 
                             doc.includes("financial") || doc.includes("q1") || doc.includes("q2") || 
                             doc.includes("q3") || doc.includes("results") || doc.includes("epr") ||
                             desc.includes("quarter") || desc.includes("interim") || desc.includes("results") || desc.includes("financial");
          if (isEarnings) {
            candidates.push({
              form: recent.form[i],
              category: "10-Q",
              resolvedType: "6-K_Quarterly",
              accession: recent.accessionNumber[i],
              doc: recent.primaryDocument[i],
              filingDate: recent.filingDate[i],
              reportDate: recent.reportDate[i],
              isEarnings: true
            });
            foundQuarterly6K = true;
            break;
          }
        }
      }
      // Fallback if no specific earnings 6-K detected: use the most recent 6-K
      if (!foundQuarterly6K) {
        for (let i = 0; i < recent.form.length; i++) {
          if (recent.form[i] === "6-K") {
            candidates.push({
              form: "6-K",
              category: "10-Q",
              resolvedType: "6-K_Interim",
              accession: recent.accessionNumber[i],
              doc: recent.primaryDocument[i],
              filingDate: recent.filingDate[i],
              reportDate: recent.reportDate[i]
            });
            break;
          }
        }
      }
    }
  }

  // 3. Proxy / Annual General Meeting (DEF 14A / 6-K AGM)
  if (selectedTypes.includes("DEF 14A")) {
    if (!isFpi) {
      // Prioritize official DEF 14A first to avoid picking up 1-page DEFA14A postcard notices
      let proxyIdx = recent.form.findIndex((f: string) => f === "DEF 14A");
      if (proxyIdx === -1) {
        proxyIdx = recent.form.findIndex((f: string) => ["DEF 14N", "PRE 14A", "DEFA14A"].includes(f));
      }
      if (proxyIdx !== -1) {
        candidates.push({
          form: recent.form[proxyIdx],
          category: "DEF 14A",
          resolvedType: "DEF 14A",
          accession: recent.accessionNumber[proxyIdx],
          doc: recent.primaryDocument[proxyIdx],
          filingDate: recent.filingDate[proxyIdx],
          reportDate: recent.reportDate[proxyIdx]
        });
      }
    } else {
      for (let i = 0; i < Math.min(recent.form.length, 50); i++) {
        if (recent.form[i] === "6-K" || recent.form[i] === "6-K/A") {
          const doc = (recent.primaryDocument[i] || "").toLowerCase();
          const desc = (recent.primaryDocDescription?.[i] || "").toLowerCase();
          if (doc.includes("agm") || doc.includes("proxy") || doc.includes("meeting") || desc.includes("meeting") || desc.includes("proxy")) {
            candidates.push({
              form: "6-K",
              category: "DEF 14A",
              resolvedType: "6-K_AGM_Proxy",
              accession: recent.accessionNumber[i],
              doc: recent.primaryDocument[i],
              filingDate: recent.filingDate[i],
              reportDate: recent.reportDate[i]
            });
            break;
          }
        }
      }
    }
  }

  // 4. Current Events / Material Updates (8-K / 6-K Current)
  if (selectedTypes.includes("8-K")) {
    const baselineDate = candidates.length > 0 
      ? new Date(candidates[0].filingDate) 
      : new Date("1900-01-01");
    
    let countEvents = 0;
    for (let i = 0; i < recent.form.length; i++) {
      const formType = recent.form[i];
      const filedDateStr = recent.filingDate[i];
      const filingDateObj = new Date(filedDateStr);

      if (!isFpi && (formType === "8-K" || formType === "8-K/A")) {
        if (filingDateObj >= baselineDate && countEvents < 3) {
          candidates.push({
            form: formType,
            category: "8-K",
            resolvedType: "8-K",
            accession: recent.accessionNumber[i],
            doc: recent.primaryDocument[i],
            filingDate: filedDateStr,
            reportDate: recent.reportDate[i]
          });
          countEvents++;
        }
      } else if (isFpi && (formType === "6-K" || formType === "6-K/A")) {
        if (filingDateObj >= baselineDate && countEvents < 3) {
          candidates.push({
            form: formType,
            category: "8-K",
            resolvedType: "6-K_Event",
            accession: recent.accessionNumber[i],
            doc: recent.primaryDocument[i],
            filingDate: filedDateStr,
            reportDate: recent.reportDate[i]
          });
          countEvents++;
        }
      }
    }
  }

  console.log(`[SEC Ingest] Identified ${candidates.length} filing candidates for retrieval`);

  const uploadResults: any[] = [];

  for (const item of candidates) {
    const accessionNoDashes = item.accession.replace(/-/g, '');
    try {
      const rawHtml = await fetchEdgarDocumentWithExhibits(cik, accessionNoDashes, item.doc, secUserAgent);
      const meta = {
        company: companyName,
        filed_date: item.filingDate,
        period_date: item.reportDate,
        fye: fyEndFormatted
      };

      const mdContent = cleanSecHtmlToMarkdown(rawHtml, item.resolvedType, meta);
      let datePart = "";
      if (item.category === "8-K" || item.resolvedType.includes("Event")) {
        datePart = item.filingDate.replace(/-/g, '');
      } else if (item.fiscalYear) {
        datePart = String(item.fiscalYear);
      } else if (item.reportDate) {
        const fyeMonth = parseInt(fyeStr.slice(0, 2), 10) || 12;
        const rYear = parseInt(item.reportDate.slice(0, 4), 10);
        const rMonth = parseInt(item.reportDate.slice(5, 7), 10);
        datePart = String((fyeMonth < 12 && rMonth > fyeMonth) ? rYear + 1 : rYear);
      } else {
        datePart = item.filingDate.slice(0, 4);
      }
      const fileName = `${cleanTicker}_${item.resolvedType}_${datePart}.md`;

      const log = await saveAndUploadFile(fileName, mdContent, "text/markdown", reqHeaderKey, item.category);
      const isAmended = item.form.includes('/A') || item.resolvedType.includes('/A');
      log.isAmended = isAmended;
      log.filingDate = item.filingDate;
      log.reportDate = item.reportDate;

      uploadResults.push({
        fileName: log.name,
        category: item.category,
        resolvedType: item.resolvedType,
        isEarnings: item.isEarnings,
        tokens: log.tokens,
        isAmended,
        filingDate: item.filingDate,
        reportDate: item.reportDate,
        lineCount: log.lineCount
      });
    } catch (docErr: any) {
      console.warn(`[SEC Ingest Doc Error] Could not process document for accession ${item.accession}:`, docErr?.message || docErr);
    }
  }

  const hasAmended = uploadResults.some(u => u.isAmended);
  return {
    success: true,
    message: `Form extraction completed. Retrieved and staged ${uploadResults.length} filings for ${cleanTicker}${hasAmended ? ' (includes amended SEC filing)' : ''}.`,
    uploaded: uploadResults
  };
}

app.post("/api/ingest/sec-filings", async (req: Request, res: Response) => {
  const { ticker, filingTypes, email, name, period } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: "No ticker symbol specified." });
  }
  const reqHeaderKey = getApiHeaderKey(req);
  try {
    const result = await executeSecIngest(ticker, filingTypes, period, email, name, reqHeaderKey);
    res.json({ ...result, state });
  } catch (err: any) {
    console.error("[SEC Ingest Error]", err);
    res.status(500).json({ error: err.message || "Failed to retrieve and stage EDGAR filings." });
  }
});

// 2. FMP financial statements TTM aggregator & compiler helper
export async function executeFmpIngest(
  ticker: string,
  activeFmpKey: string,
  reqHeaderKey?: string,
  targetPeriod?: string
) {
  const symbol = ticker.toUpperCase();
  console.log(`[FMP Ingest] Fetching quarterly statements for ${symbol}`);

  const fetchFmpStatement = async (statementType: string) => {
    const stableUrl = `https://financialmodelingprep.com/stable/${statementType}?symbol=${symbol}&period=quarter&limit=100&apikey=${activeFmpKey}`;
    try {
      const response = await fetch(stableUrl);
      if (response.ok) {
        const data = await response.json() as any;
        if (Array.isArray(data) && data.length > 0 && !data[0].Error) return data;
      }
    } catch (e) {
      console.warn(`[FMP Ingest] Stable endpoint failed for ${statementType}, trying legacy...`, e);
    }

    const legacyUrl = `https://financialmodelingprep.com/api/v3/${statementType}/${symbol}?period=quarter&limit=100&apikey=${activeFmpKey}`;
    const response = await fetch(legacyUrl);
    if (!response.ok) throw new Error(`Received HTTP ${response.status} from FMP`);
    const data = await response.json() as any;
    if (Array.isArray(data) && data.length > 0 && data[0]['Error Message']) {
      throw new Error(data[0]['Error Message']);
    }
    return data;
  };

  const fetchFmpSegments = async (segmentType: string) => {
    try {
      const stableUrl = `https://financialmodelingprep.com/stable/${segmentType}?symbol=${symbol}&period=quarter&limit=100&apikey=${activeFmpKey}`;
      const response = await fetch(stableUrl);
      if (response.ok) {
        const data = await response.json() as any;
        if (Array.isArray(data) && data.length > 0 && !data[0].Error && !data[0]['Error Message']) return data;
      }
    } catch (e) {
      console.warn(`[FMP Ingest] Stable segment endpoint failed for ${segmentType}, trying legacy...`, e);
    }

    try {
      const legacyUrl = `https://financialmodelingprep.com/api/v4/${segmentType}?symbol=${symbol}&structure=flat&period=quarter&apikey=${activeFmpKey}`;
      const response = await fetch(legacyUrl);
      if (response.ok) {
        const data = await response.json() as any;
        if (Array.isArray(data) && data.length > 0 && !data[0]['Error Message']) return data;
      }
    } catch (e) {}

    return null;
  };

  const isData = await fetchFmpStatement('income-statement');
  const bsData = await fetchFmpStatement('balance-sheet-statement');
  const cfData = await fetchFmpStatement('cash-flow-statement');
  const geoData = await fetchFmpSegments('revenue-geographic-segmentation');
  const prodData = await fetchFmpSegments('revenue-product-segmentation');

  if (!isData || isData.length === 0 || !bsData || bsData.length === 0 || !cfData || cfData.length === 0) {
    throw new Error(`One or more quarterly financial statements are empty. Confirm ticker and premium limits.`);
  }

  const Q_MAP: Record<string, number> = {'Q1': 0, 'Q2': 1, 'Q3': 2, 'Q4': 3};
  const Q_INV: Record<number, string> = {0: 'Q1', 1: 'Q2', 2: 'Q3', 3: 'Q4'};

  const getQuarterKey = (r: any) => {
    const year = parseInt(r.calendarYear || r.fiscalYear || "0", 10);
    const period = r.period || "Q1";
    return `${year}_${period}`;
  };

  const parseQuarterKey = (k: string) => {
    const parts = k.split("_");
    return { year: parseInt(parts[0], 10), period: parts[1] };
  };

  const chronologicalSort = (a: any, b: any) => {
    const qA = parseQuarterKey(getQuarterKey(a));
    const qB = parseQuarterKey(getQuarterKey(b));
    if (qA.year !== qB.year) return qA.year - qB.year;
    return Q_MAP[qA.period] - Q_MAP[qB.period];
  };

  const isSorted = [...isData].sort(chronologicalSort);
  const bsSorted = [...bsData].sort(chronologicalSort);
  const cfSorted = [...cfData].sort(chronologicalSort);

  const isByQuarter: Record<string, any> = {};
  const bsByQuarter: Record<string, any> = {};
  const cfByQuarter: Record<string, any> = {};

  isSorted.forEach(r => { isByQuarter[getQuarterKey(r)] = r; });
  bsSorted.forEach(r => { bsByQuarter[getQuarterKey(r)] = r; });
  cfSorted.forEach(r => { cfByQuarter[getQuarterKey(r)] = r; });

  const allKeys = Array.from(new Set([
    ...Object.keys(isByQuarter),
    ...Object.keys(bsByQuarter),
    ...Object.keys(cfByQuarter)
  ]));

  allKeys.sort((a, b) => {
    const qA = parseQuarterKey(a);
    const qB = parseQuarterKey(b);
    if (qA.year !== qB.year) return qA.year - qB.year;
    return Q_MAP[qA.period] - Q_MAP[qB.period];
  });

  let latestKey = allKeys[allKeys.length - 1];

  // If a targetPeriod is provided (e.g. "Q3-26" or "Q3-2026"), check if it matches a known quarter in FMP
  if (targetPeriod) {
    const tMatch = targetPeriod.match(/Q([1-4])[-_ ]?(\d{2,4})/i);
    if (tMatch) {
      const tQuarter = `Q${tMatch[1]}`;
      const tYear = tMatch[2].length === 2 ? parseInt(`20${tMatch[2]}`, 10) : parseInt(tMatch[2], 10);
      const wantedKey = `${tYear}_${tQuarter}`;
      if (allKeys.includes(wantedKey)) {
        latestKey = wantedKey;
        console.log(`[FMP Ingest] Targeted quarter found in FMP dataset: ${tQuarter} ${tYear}`);
      }
    }
  }

  const { year: latestYear, period: latestPeriod } = parseQuarterKey(latestKey);
  console.log(`[FMP Ingest] Quarter identified for TTM compilation: ${latestPeriod} ${latestYear}`);

  const outputQuarters = allKeys
    .map(parseQuarterKey)
    .filter(q => q.period === latestPeriod)
    .sort((a, b) => b.year - a.year)
    .slice(0, 10);

  const metaKeys = new Set(['date', 'symbol', 'reportedCurrency', 'cik', 'filingDate', 'acceptedDate', 'fiscalYear', 'period', 'calendarYear']);
  const isMetricKeys = Object.keys(isSorted[0]).filter(k => !metaKeys.has(k));
  const bsMetricKeys = Object.keys(bsSorted[0]).filter(k => !metaKeys.has(k));
  const cfMetricKeys = Object.keys(cfSorted[0]).filter(k => !metaKeys.has(k));

  const NON_SCALED_KEYS = new Set([
    'eps', 'epsdiluted', 'epsDiluted', 'eps_diluted',
    'weightedAverageShsOut', 'weightedAverageShsOutDil',
    'weighted_average_shs_out', 'weighted_average_shs_out_dil'
  ]);

  const cleanNumericValue = (val: any, key: string) => {
    if (val === null || val === undefined || val === "") return "";
    const shouldScale = !NON_SCALED_KEYS.has(key);
    try {
      let numVal = parseFloat(val);
      if (isNaN(numVal)) return val;
      if (shouldScale) {
        numVal = numVal / 1000000.0;
      }
      if (Number.isInteger(numVal)) return numVal;
      return Number(numVal.toFixed(6));
    } catch (e) {
      return val;
    }
  };

  const getConsecutiveQuarters = (y: number, p: string) => {
    const startIdx = y * 4 + Q_MAP[p];
    const quarters = [];
    for (let i = 0; i < 4; i++) {
      const idx = startIdx - i;
      const year = Math.floor(idx / 4);
      const period = Q_INV[idx % 4];
      quarters.push(`${year}_${period}`);
    }
    return quarters;
  };

  const calculateTtmValue = (byQuarterSet: Record<string, any>, y: number, p: string, key: string) => {
    const qSequence = getConsecutiveQuarters(y, p);
    const records = qSequence.map(k => byQuarterSet[k]);
    if (records.some(r => !r)) return null;

    const values = records.map(r => r[key]);
    if (values.every(v => v === null || v === undefined)) return null;

    let sum = 0.0;
    for (const v of values) {
      if (v !== null && v !== undefined) {
        const parsed = parseFloat(v);
        if (!isNaN(parsed)) sum += parsed;
      }
    }
    return sum;
  };

  const getSnapshotValue = (byQuarterSet: Record<string, any>, y: number, p: string, key: string) => {
    const record = byQuarterSet[`${y}_${p}`];
    if (!record) return null;
    return record[key];
  };

  let csvContent = "";
  const appendRow = (row: any[]) => {
    csvContent += row.map(v => {
      const s = String(v === null || v === undefined ? "" : v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }).join(",") + "\r\n";
  };

  const formatFmpDate = (dStr: string) => {
    if (!dStr) return "";
    try {
      const dateObj = new Date(dStr);
      const opts: any = { month: 'short', day: 'numeric', year: 'numeric' };
      return dateObj.toLocaleDateString("en-US", opts);
    } catch (e) {
      return dStr;
    }
  };

  const writeSection = (title: string, byQuarterSet: Record<string, any>, metricKeys: string[], isFlow: boolean) => {
    appendRow([`${title}:`]);
    appendRow(["Fiscal Quarter", ...outputQuarters.map(q => `${q.period} ${q.year}`)]);
    appendRow(["Period Ending", ...outputQuarters.map(q => formatFmpDate(byQuarterSet[`${q.year}_${q.period}`]?.date || ''))]);
    appendRow(["symbol", ...outputQuarters.map(q => byQuarterSet[`${q.year}_${q.period}`]?.symbol || symbol)]);
    appendRow(["reportedCurrency", ...outputQuarters.map(q => byQuarterSet[`${q.year}_${q.period}`]?.reportedCurrency || 'USD')]);
    appendRow(["cik", ...outputQuarters.map(q => byQuarterSet[`${q.year}_${q.period}`]?.cik || '')]);
    appendRow(["filingDate", ...outputQuarters.map(q => byQuarterSet[`${q.year}_${q.period}`]?.filingDate || '')]);
    appendRow(["acceptedDate", ...outputQuarters.map(q => byQuarterSet[`${q.year}_${q.period}`]?.acceptedDate || '')]);
    appendRow(["fiscalYear", ...outputQuarters.map(q => byQuarterSet[`${q.year}_${q.period}`]?.fiscalYear || '')]);

    const SNAPSHOT_FLOW_KEYS = new Set(['weightedAverageShsOut', 'weightedAverageShsOutDil', 'weighted_average_shs_out', 'weighted_average_shs_out_dil']);
    
    metricKeys.forEach(k => {
      const row = [k];
      outputQuarters.forEach(q => {
        if (isFlow && !SNAPSHOT_FLOW_KEYS.has(k)) {
          const val = calculateTtmValue(byQuarterSet, q.year, q.period, k);
          row.push(cleanNumericValue(val, k));
        } else {
          const val = getSnapshotValue(byQuarterSet, q.year, q.period, k);
          row.push(cleanNumericValue(val, k));
        }
      });
      appendRow(row);
    });
    appendRow([]);
  };

  const writeSegmentSection = (title: string, segmentList: any[] | null) => {
    if (!segmentList || !Array.isArray(segmentList) || segmentList.length === 0) return;
    const segByQuarter: Record<string, Record<string, number>> = {};
    const allSegKeys = new Set<string>();

    segmentList.forEach(r => {
      const qKey = getQuarterKey(r);
      const rawData = r.data || r;
      segByQuarter[qKey] = {};
      for (const [k, v] of Object.entries(rawData)) {
        if (metaKeys.has(k) || k === 'data') continue;
        const numVal = parseFloat(String(v));
        if (!isNaN(numVal)) {
          segByQuarter[qKey][k] = numVal;
          allSegKeys.add(k);
        }
      }
    });

    if (allSegKeys.size === 0) return;

    appendRow([`${title}:`]);
    appendRow(["Fiscal Quarter", ...outputQuarters.map(q => `${q.period} ${q.year}`)]);
    appendRow(["Period Ending", ...outputQuarters.map(q => formatFmpDate(segmentList.find(s => getQuarterKey(s) === `${q.year}_${q.period}`)?.date || ''))]);
    appendRow(["symbol", ...outputQuarters.map(() => symbol)]);
    appendRow(["reportedCurrency", ...outputQuarters.map(() => 'USD')]);

    const segKeysArray = Array.from(allSegKeys).sort();
    segKeysArray.forEach(k => {
      const row = [k];
      outputQuarters.forEach(q => {
        const qSequence = getConsecutiveQuarters(q.year, q.period);
        const records = qSequence.map(key => segByQuarter[key]);
        if (records.some(rec => !rec || rec[k] === undefined)) {
          row.push("");
        } else {
          const sum = records.reduce((acc, rec) => acc + (rec[k] || 0), 0);
          row.push(cleanNumericValue(sum, k));
        }
      });
      appendRow(row);
    });
    appendRow([]);
  };

  writeSection("Cash Flow Statement", cfByQuarter, cfMetricKeys, true);
  writeSection("Income Statement", isByQuarter, isMetricKeys, true);
  writeSection("Balance Statement", bsByQuarter, bsMetricKeys, false);
  writeSegmentSection("Revenue Geographic Segments (TTM)", geoData);
  writeSegmentSection("Revenue Product Segments (TTM)", prodData);

  const yearSuffix = String(latestYear).slice(-2);
  let fileName = `${symbol} ${latestPeriod}-${yearSuffix} - Financials-TTM.csv`;

  const currencyAudit = await auditFinancialCsv(csvContent, fileName, symbol);
  if (currencyAudit.requiresAction) {
    console.log(`[FMP Currency Safeguard] Foreign/Mixed currency detected for ${symbol}. Harmonizing to ${currencyAudit.homeCurrency}...`);
    const harmonized = harmonizeFinancialCsv(csvContent, currencyAudit);
    csvContent = harmonized.harmonizedCsv;
    fileName = harmonized.newFileName;
  }

  const log = await saveAndUploadFile(fileName, csvContent, "text/csv", reqHeaderKey);

  return {
    success: true,
    message: `FMP quarterly compilation executed. Trailing Twelve Month (TTM) aggregation complete. Staged: ${fileName}` + (currencyAudit.requiresAction ? ` (Preserved native ${currencyAudit.homeCurrency} at Spot FX ${currencyAudit.fxRate.toFixed(2)})` : ''),
    fileName: log.name,
    tokens: log.tokens,
    currencyAudit
  };
}

app.post("/api/ingest/fmp-financials", async (req: Request, res: Response) => {
  const { ticker, fmpApiKey, period } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: "Missing ticker." });
  }
  
  const activeFmpKey = fmpApiKey?.trim() || process.env.FMP_API_KEY || "";
  if (!activeFmpKey) {
    return res.status(400).json({ error: "FMP API Key is missing. Provide FMP API key in the configuration panel." });
  }

  const activePeriod = period || state.config?.period || undefined;
  const reqHeaderKey = getApiHeaderKey(req);
  try {
    const result = await executeFmpIngest(ticker, activeFmpKey, reqHeaderKey, activePeriod);
    res.json({ ...result, state });
  } catch (err: any) {
    console.error("[FMP Ingest Error]", err);
    res.status(500).json({ error: err.message || "Failed to fetch and aggregate FMP financial statements." });
  }
});

// Helper to sanitize Gemini response text and parse JSON robustly, ignoring search/grounding footnotes or markdown tags
function cleanAndParseJson(text: string): any {
  if (!text) return {};
  const trimmed = text.trim();
  
  // 1. Try to parse directly
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Parsing failed, proceed with robust extraction
  }

  // Find the first occurrence of either '{' or '['
  const firstBrace = trimmed.indexOf("{");
  const firstBracket = trimmed.indexOf("[");
  
  let startIdx = -1;
  let openChar = "";
  let closeChar = "";
  
  if (firstBrace !== -1 && firstBracket !== -1) {
    if (firstBrace < firstBracket) {
      startIdx = firstBrace;
      openChar = "{";
      closeChar = "}";
    } else {
      startIdx = firstBracket;
      openChar = "[";
      closeChar = "]";
    }
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
    openChar = "{";
    closeChar = "}";
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    openChar = "[";
    closeChar = "]";
  }
  
  if (startIdx === -1) return {};

  let count = 0;
  let inString = false;
  let escape = false;
  let extracted = "";

  for (let i = startIdx; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === "\\") {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === openChar) {
        count++;
      } else if (char === closeChar) {
        count--;
        if (count === 0) {
          extracted = trimmed.slice(startIdx, i + 1);
          break;
        }
      }
    }
  }

  if (!extracted) {
    // Fallback: if we couldn't balance braces correctly, just slice from startIdx to last index of closeChar
    const lastClose = trimmed.lastIndexOf(closeChar);
    if (lastClose > startIdx) {
      extracted = trimmed.slice(startIdx, lastClose + 1);
    }
  }

  try {
    return JSON.parse(extracted || trimmed);
  } catch (err: any) {
    console.warn(`[cleanAndParseJson] Extraction parsed failed: ${err.message}. Raw text: ${trimmed}`);
    return {};
  }
}

// FMP Ticker AutoFill info endpoint
async function queryGeminiForTickerInfo(symbol: string, userKey?: string): Promise<{ price: string; period: string }> {
  const apiKey = userKey || process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("Missing Gemini API Key for search fallback.");
  }
  const ai = getGeminiClient(userKey);
  const prompt = `Use Google Search to find the following information for stock ticker "${symbol}":
1. Current live/recent market stock price (e.g., "120.45" or "45.12").
2. The latest completed fiscal quarter reporting period in the format "QX-YY" (e.g., Q1-26, Q4-25, Q3-25, etc.). Try to find the exact latest completed quarter that has reported earnings.

Provide your output as a raw JSON object with the exact keys:
"price": string containing the decimal price value,
"period": string formatted exactly as QX-YY.

Example:
{
  "price": "98.54",
  "period": "Q1-26"
}
Do not include any markdown backticks or other text, just valid JSON.`;

  const response = await generateContentWithRetry(ai, {
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: {
        thinkingLevel: "low"
      }
    }
  });

  const parsed = cleanAndParseJson(response.text || "{}");
  return {
    price: parsed.price ? String(parsed.price) : "",
    period: parsed.period ? String(parsed.period) : ""
  };
}

export async function fetchTickerInfoFromFmpOrYf(
  ticker: string,
  fmpApiKey?: string
): Promise<{ price: string; period: string; fmpSucceeded: boolean; source: 'fmp' | 'fallback' | 'manual' }> {
  const symbol = ticker.toUpperCase().trim();
  const activeFmpKey = fmpApiKey?.trim() || process.env.FMP_API_KEY || "";

  let price = "";
  let period = "";
  let fmpSucceeded = false;

  // 1. Try fetching from FMP first
  if (activeFmpKey) {
    try {
      // Fetch Quote for Price (try modern stable endpoint first, then legacy fallback)
      let qData: any[] | null = null;
      try {
        const stableQuoteUrl = `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${activeFmpKey}`;
        const stableQuoteRes = await fetch(stableQuoteUrl);
        if (stableQuoteRes.ok) {
          const sData = await stableQuoteRes.json() as any[];
          if (Array.isArray(sData) && sData.length > 0 && !sData[0]['Error Message']) {
            qData = sData;
          }
        }
      } catch (e) {}

      if (!qData) {
        const legacyQuoteUrl = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${activeFmpKey}`;
        const quoteRes = await fetch(legacyQuoteUrl);
        if (quoteRes.ok) {
          const lData = await quoteRes.json() as any[];
          if (Array.isArray(lData) && lData.length > 0 && !lData[0]['Error Message']) {
            qData = lData;
          }
        }
      }

      if (qData && qData.length > 0) {
        price = String(qData[0].price || "");
        fmpSucceeded = true;
      }

      // Fetch Income Statement for Period (try stable endpoint first, then legacy)
      let isData: any[] | null = null;
      try {
        const stableIsUrl = `https://financialmodelingprep.com/stable/income-statement?symbol=${symbol}&period=quarter&limit=1&apikey=${activeFmpKey}`;
        const stableIsRes = await fetch(stableIsUrl);
        if (stableIsRes.ok) {
          const sData = await stableIsRes.json() as any[];
          if (Array.isArray(sData) && sData.length > 0 && !sData[0].Error && !sData[0]['Error Message']) {
            isData = sData;
          }
        }
      } catch (e) {}

      if (!isData) {
        const legacyIsUrl = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=quarter&limit=1&apikey=${activeFmpKey}`;
        const legacyIsRes = await fetch(legacyIsUrl);
        if (legacyIsRes.ok) {
          const lData = await legacyIsRes.json() as any[];
          if (Array.isArray(lData) && lData.length > 0 && !lData[0].Error && !lData[0]['Error Message']) {
            isData = lData;
          }
        }
      }

      if (isData && isData.length > 0) {
        const item = isData[0];
        const rawPeriod = item.period || "Q1";
        const year = item.calendarYear || item.fiscalYear || (item.date ? item.date.slice(0, 4) : new Date().getFullYear());
        const yearShort = String(year).slice(-2);
        period = `${rawPeriod}-${yearShort}`;
        fmpSucceeded = true;
      }
    } catch (fmpErr: any) {
      console.log(`[FMP AutoFill] FMP request error for ${symbol}:`, fmpErr?.message || fmpErr);
    }
  }

  // 2. Fallback to Yahoo Finance for price if FMP failed or key was missing
  if (!price) {
    try {
      const yfUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`;
      const yfRes = await fetch(yfUrl, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
      if (yfRes.ok) {
        const yfData = await yfRes.json();
        const yfPrice = yfData?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (yfPrice) {
          price = String(yfPrice);
        }
      }
    } catch (err: any) {
      console.error(`[FMP AutoFill Fallback Error] Yahoo Finance fallback failed for ${symbol}:`, err);
    }
  }

  // Ensure reasonable default values in case both failed
  if (!price) price = "100.00";
  if (!period) {
    const dVal = new Date();
    const curYear = dVal.getFullYear();
    const curMonth = dVal.getMonth() + 1;
    let fallbackQuarter = "Q1";
    let fallbackYear = String(curYear).slice(-2);
    if ([1, 2, 3].includes(curMonth)) {
      fallbackQuarter = "Q4";
      fallbackYear = String(curYear - 1).slice(-2);
    } else if ([4, 5, 6].includes(curMonth)) {
      fallbackQuarter = "Q1";
    } else if ([7, 8, 9].includes(curMonth)) {
      fallbackQuarter = "Q2";
    } else {
      fallbackQuarter = "Q3";
    }
    period = `${fallbackQuarter}-${fallbackYear}`;
  }

  const source: 'fmp' | 'fallback' | 'manual' = fmpSucceeded
    ? 'fmp'
    : (price !== "100.00" ? 'fallback' : 'manual');

  return { price, period, fmpSucceeded, source };
}

app.post("/api/ingest/fmp-ticker-info", async (req: Request, res: Response) => {
  const { ticker, fmpApiKey } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: "Missing ticker." });
  }

  const activeFmpKey = fmpApiKey?.trim() || process.env.FMP_API_KEY || "";
  const info = await fetchTickerInfoFromFmpOrYf(ticker, activeFmpKey);

  res.json({
    success: true,
    price: info.price,
    period: info.period,
    fmpSucceeded: info.fmpSucceeded,
    source: info.source,
    message: info.fmpSucceeded
      ? "Live market price & fiscal period verified via FMP."
      : "FMP lookup was unavailable; used market price fallback."
  });
});

// 3. Earnings call transcripts downloader & de-boilerplater
async function optimizeTranscriptForTokens(symbol: string, period: string, rawText: string, userKey?: string): Promise<string> {
  const apiKey = userKey || process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    return cleanTranscriptTextBlock(rawText);
  }

  try {
    const ai = getGeminiClient(userKey);
    console.log(`[Token Optimization] Running Gemini clean on transcript for ${symbol} (${period}) to minimize tokens...`);
    const prompt = `You are an expert financial analyst. Your task is to process a raw earnings call transcript and thoroughly optimize it for downstream LLM analysis by removing non-substantive noise, legal disclaimers, administrative/operator overhead, and promotional boilerplate. 

You must STRICTLY preserve the actual dialogue, strategic updates, operational context, product insights, guidance narrative, analyst questions, and executive answers. DO NOT summarize the transcript into an "executive summary" or consolidated report. Keep the original conversational flow and detail, just strip the administrative fluff.

Important: We already have the raw financial performance numbers (revenue, EPS, margins) in our quantitative datasets. Therefore, you do not need to highlight or consolidate standard financial performance metrics. Instead, focus heavily on preserving the verbatim explanations, business context, market dynamics, and especially the complete Q&A session.

Identify and remove the following sections:
1. Legal Disclaimers: Safe harbor statements, forward-looking statements warnings, references to SEC filings (Form 10-K, 10-Q, 8-K), and non-GAAP reconciliation disclaimers.
2. Administrative/Operator Remarks: Operator introduction, dialing instructions, queue announcements, and closing operator remarks. (Keep transition phrasing if it adds conversational context, but drop boilerplate logistics).
3. Promotional Boilerplate: Corporate overview boilerplate at the beginning/end, advertisements, and other non-relevant metadata.

Ensure the final output focuses exclusively on:
1. Executive Prepared Remarks (e.g., CEO, CFO, COO presentations) preserving the narrative, market observations, and strategic commentary verbatim or near-verbatim.
2. The Q&A Session - this is the most critical part. Keep the actual exchange between analysts (including analyst name and firm) and management intact without summarizing the discussion.

Format the output cleanly in Markdown:
- Add high-level headers for the speakers or sections.
- Maintain the original conversational details.

Here is the raw text to optimize:
---
${rawText}
---`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a precise financial document cleaner. Your job is to trim disclaimers, operator prompts/dial-in logistics, and safe harbor text from earnings transcripts, while preserving all actual executive remarks and analyst Q&As with absolute technical fidelity and no loss of numeric details.",
        thinkingConfig: {
          thinkingLevel: "low"
        }
      }
    });

    return response.text || cleanTranscriptTextBlock(rawText);
  } catch (err) {
    console.warn(`[Token Optimization] Gemini cleaning failed for ${symbol}, falling back to regex clean:`, err);
    return cleanTranscriptTextBlock(rawText);
  }
}

let cachedStockAnalysisCookie = "";
let cachedStockAnalysisCookieExpires = 0;

async function loginToStockAnalysis(email?: string, password?: string): Promise<string> {
  const activeEmail = email || process.env.STOCK_ANALYSIS_EMAIL;
  const activePassword = password || process.env.STOCK_ANALYSIS_PASSWORD;

  if (!activeEmail || !activePassword) {
    throw new Error("Missing Stock Analysis email or password. Please configure STOCK_ANALYSIS_EMAIL and STOCK_ANALYSIS_PASSWORD in .env.");
  }

  if (cachedStockAnalysisCookie && Date.now() < cachedStockAnalysisCookieExpires) {
    return cachedStockAnalysisCookie;
  }

  console.log(`[Stock Analysis Auth] Logging in directly as ${activeEmail}...`);
  const params = new URLSearchParams();
  params.append("email", activeEmail);
  params.append("password", activePassword);

  const loginRes = await fetch("https://stockanalysis.com/login/?redir=%2F", {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": "https://stockanalysis.com/login/",
      "Origin": "https://stockanalysis.com"
    },
    body: params.toString(),
    redirect: "manual"
  });

  if (loginRes.status !== 200 && loginRes.status !== 302 && loginRes.status !== 303) {
    throw new Error(`Stock Analysis direct login failed with HTTP status ${loginRes.status}`);
  }

  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie")];
  const cookiePairs: string[] = [];
  for (const sc of setCookies) {
    if (sc) {
      cookiePairs.push(sc.split(";")[0].trim());
    }
  }

  if (cookiePairs.length === 0) {
    throw new Error("Stock Analysis login succeeded but no session cookies were returned.");
  }

  cachedStockAnalysisCookie = cookiePairs.join("; ");
  cachedStockAnalysisCookieExpires = Date.now() + 6 * 24 * 60 * 60 * 1000;
  console.log("[Stock Analysis Auth] Login successful, new session cookie cached!");

  return cachedStockAnalysisCookie;
}

function parseStockAnalysisTranscriptHtml(
  pageHtml: string, 
  symbol: string, 
  matchedPeriodStr: string
): { markdownText: string; isStub: boolean; blocksCount: number } {
  // Strategy 1: Check DOM speaker blocks
  const cleanHtml = pageHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '');

  const speakerBlockRegex = /<div class="[^"]*text-lg font-bold[^"]*">([^<]+)<\/div>(?:[\s\S]*?<div class="[^"]*text-sm italic[^"]*">([^<]+)<\/div>)?([\s\S]*?)(?=<div class="[^"]*text-lg font-bold|$)/gi;
  let sMatch;
  const blocks: string[] = [];
  while ((sMatch = speakerBlockRegex.exec(cleanHtml)) !== null) {
    const speaker = sMatch[1].trim();
    const title = sMatch[2] ? sMatch[2].trim() : '';
    const contentHtml = sMatch[3];
    
    const pMatches = contentHtml.matchAll(/<p[^>]*?>([\s\S]*?)<\/p>/gi);
    const paras: string[] = [];
    for (const p of pMatches) {
      let text = p[1].replace(/<[^>]*?>/g, '').trim();
      text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&#160;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      if (!text) continue;
      const textLower = text.toLowerCase();
      if (textLower.includes("image source") || textLower.includes("copyright")) continue;
      paras.push(text);
    }
    if (paras.length > 0) {
      const header = title ? `### ${speaker} — *${title}*` : `### ${speaker}`;
      blocks.push(`${header}\n\n${paras.join('\n\n')}`);
    }
  }

  let transcriptMarkdown = "";
  if (blocks.length >= 3) {
    transcriptMarkdown = blocks.join("\n\n---\n\n");
    console.log(`[Stock Analysis Scraper] Fast complete extraction via DOM: ${blocks.length} speaker sections compiled.`);
  } else {
    // Strategy 2: Extract fullTranscriptBody from SvelteKit serialized data payload
    // When Stock Analysis defaults to the "Summary" tab on server render, the complete
    // verbatim transcript sits inside the page data script as fullTranscriptBody:"..."
    const bodyMatch = pageHtml.match(/fullTranscriptBody:\s*"((?:[^"\\]|\\.)*)"/);
    if (bodyMatch) {
      try {
        const rawBody = JSON.parse(`"${bodyMatch[1]}"`);
        if (rawBody && rawBody.length >= 2500) {
          console.log(`[Stock Analysis Scraper] Extracted full verbatim transcript via SvelteKit payload: ${rawBody.length} chars, ${rawBody.split(/\s+/).length} words.`);
          
          // Format into clean dialogue sections
          const rawParas = rawBody.split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean);
          const formattedSections: string[] = [];
          
          for (const p of rawParas) {
            const operatorQMatch = p.match(/^(Your next question comes from the line of\s+([A-Z][a-zA-Z\s\.\-]+)\s+with\s+([A-Z][a-zA-Z\s\.\-]+)\.)\s*(.*)/is);
            const speakerMatch = p.match(/^([A-Z][a-zA-Z\s\.\-]{2,40}):\s*(.*)/s);
            
            if (operatorQMatch) {
              formattedSections.push(`---\n\n### Question from ${operatorQMatch[2].trim()} (${operatorQMatch[3].trim()})\n\n${operatorQMatch[1]}`);
              if (operatorQMatch[4]?.trim()) {
                formattedSections.push(operatorQMatch[4].trim());
              }
            } else if (speakerMatch) {
              formattedSections.push(`### ${speakerMatch[1].trim()}\n\n${speakerMatch[2].trim()}`);
            } else {
              formattedSections.push(p);
            }
          }

          let formattedBody = formattedSections.join("\n\n");

          // Optional: Extract summaryLongHtml if present to prepend as high-level highlights
          const summaryMatch = pageHtml.match(/summaryLongHtml:\s*"((?:[^"\\]|\\.)*)"/);
          if (summaryMatch) {
            try {
              const rawSummary = JSON.parse(`"${summaryMatch[1]}"`);
              if (rawSummary && rawSummary.length > 200) {
                const cleanSummary = rawSummary
                  .replace(/<h3>(.*?)<\/h3>/gi, '\n#### $1\n')
                  .replace(/<li>(.*?)<\/li>/gi, '* $1\n')
                  .replace(/<ul[^>]*?>|<\/ul>/gi, '')
                  .replace(/<p[^>]*?>|<\/p>/gi, '\n')
                  .trim();
                formattedBody = `### Executive Summary & Operational Highlights\n\n${cleanSummary}\n\n---\n\n### Verbatim Earnings Call Transcript\n\n${formattedBody}`;
              }
            } catch (ignore) {}
          }

          transcriptMarkdown = formattedBody;
        }
      } catch (err) {
        console.warn("[Stock Analysis Scraper] Failed to parse fullTranscriptBody JSON string:", err);
      }
    }

    // Strategy 3: Fallback paragraphs if neither DOM speaker blocks nor fullTranscriptBody succeeded
    if (!transcriptMarkdown) {
      const paragraphs: string[] = [];
      const pMatches = cleanHtml.matchAll(/<p[^>]*?>([\s\S]*?)<\/p>/gi);
      for (const p of pMatches) {
        let text = p[1].replace(/<[^>]*?>/g, '').trim();
        text = text
          .replace(/&nbsp;/g, ' ')
          .replace(/&#160;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        if (!text) continue;
        const textLower = text.toLowerCase();
        if (textLower.includes("image source") || textLower.includes("copyright")) continue;
        paragraphs.push(text);
      }
      transcriptMarkdown = paragraphs.join("\n\n");
    }
  }

  // Strict Substance Validation:
  // A complete transcript must have substantive dialogue (>= 3000 chars and >= 500 words).
  // Audio stubs / pending pages only contain audio player links, disclaimers, or a brief 2-sentence summary.
  const isStub = transcriptMarkdown.length < 3000 || 
                 transcriptMarkdown.split(/\s+/).length < 500 ||
                 (blocks.length < 3 && !pageHtml.includes("fullTranscriptBody") && pageHtml.includes("published within hours after each earnings call"));

  const mdOutput = `# Earnings Call Transcript: ${symbol}\n**Company:** ${symbol}\n**Period:** ${matchedPeriodStr}\n**Fiscal Quarter:** ${matchedPeriodStr}\n**Source:** Stock Analysis (Official Full Transcript)\n---\n\n${transcriptMarkdown}`;

  return {
    markdownText: mdOutput,
    isStub,
    blocksCount: blocks.length
  };
}

async function fetchStockAnalysisTranscript(
  symbol: string, 
  targetPeriod: string | null, 
  cookie?: string, 
  userKey?: string
): Promise<{ markdownText: string; fileName: string } | null> {
  let activeCookie = cookie?.trim() || process.env.STOCK_ANALYSIS_COOKIE || "";
  if (!activeCookie && (process.env.STOCK_ANALYSIS_EMAIL && process.env.STOCK_ANALYSIS_PASSWORD)) {
    console.log("[Stock Analysis Scraper] No cookie provided, authenticating via email and password...");
    activeCookie = await loginToStockAnalysis();
  }

  if (!activeCookie) {
    throw new Error("Stock Analysis authentication missing. Please configure STOCK_ANALYSIS_EMAIL and STOCK_ANALYSIS_PASSWORD in .env.");
  }

  const symbolClean = symbol.toLowerCase();
  const listUrl = `https://stockanalysis.com/stocks/${symbolClean}/transcripts/`;
  
  const browserHeaders: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://stockanalysis.com/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "Cookie": activeCookie
  };

  console.log(`[Stock Analysis Scraper] Fetching transcripts list from: ${listUrl}`);
  const listRes = await fetch(listUrl, { headers: browserHeaders });

  if (!listRes.ok) {
    throw new Error(`Failed to fetch Stock Analysis transcript list: status ${listRes.status}`);
  }

  const listHtml = await listRes.text();

  // Regex to extract transcript links
  const linkRegex = /<a[^>]*?href\s*=\s*['"](?:https:\/\/stockanalysis\.com)?(\/stocks\/[a-zA-Z0-9\-]+\/transcripts\/([a-zA-Z0-9\-]+)\/?)['"][^>]*?>([\s\S]*?)<\/a>/gi;
  
  const matches: Array<{ href: string; slug: string; text: string }> = [];
  let match;
  while ((match = linkRegex.exec(listHtml)) !== null) {
    matches.push({
      href: match[1],
      slug: match[2],
      text: match[3].replace(/<[^>]*?>/g, '').trim()
    });
  }

  if (matches.length === 0) {
    console.warn("[Stock Analysis Scraper] No transcript links found in HTML.");
    return null;
  }

  const findQuarterMatch = (target: string) => {
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const m of matches) {
      const cleanText = m.text.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSlug = m.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanText.includes(cleanTarget) || cleanSlug.includes(cleanTarget)) return m;
      const qMatch = target.match(/q([1-4])/i);
      const yMatch = target.match(/(\d{2,4})$/);
      if (qMatch && yMatch) {
        const q = qMatch[1].toLowerCase();
        const rawY = yMatch[1];
        const yrFull = rawY.length === 2 ? `20${rawY}` : rawY;
        const yrShort = rawY.length === 4 ? rawY.slice(-2) : rawY;
        const hasQ = cleanText.includes(`q${q}`) || cleanSlug.includes(`q${q}`);
        const hasY = cleanText.includes(yrFull) || cleanSlug.includes(yrFull) || cleanText.includes(` ${yrShort} `) || cleanSlug.endsWith(`-${yrShort}`) || cleanSlug.includes(`-${yrShort}-`);
        if (hasQ && hasY) return m;
      }
    }
    return null;
  };

  let selected = matches[0]; // Default to newest/first transcript
  let isNewEarningsRelease = false;

  if (targetPeriod) {
    const topMatch = matches[0];
    const topQ = topMatch.text.match(/q([1-4])/i) || topMatch.slug.match(/q([1-4])/i);
    const topY = topMatch.text.match(/\b(20\d{2}|\d{2})\b/) || topMatch.slug.match(/\b(20\d{2}|\d{2})\b/);
    if (topQ && topY) {
      const yrStr = topY[1].length === 2 ? `20${topY[1]}` : topY[1];
      const topPeriodStr = `Q${topQ[1]} ${yrStr}`;
      if (isSequentialQuarterAhead(targetPeriod, topPeriodStr)) {
        console.log(`[Transcript Ingest] Active earnings release candidate on Stock Analysis: ${topPeriodStr} is 1 quarter ahead of form period ${targetPeriod}.`);
        selected = topMatch;
        isNewEarningsRelease = true;
      }
    }

    if (!isNewEarningsRelease) {
      const found = findQuarterMatch(targetPeriod);
      if (found) {
        selected = found;
      } else {
        console.warn(`[Stock Analysis Scraper] Requested quarter (${targetPeriod}) not found in transcript list. Available: ${matches.map(m => m.text).join(", ")}`);
        return null;
      }
    }
  }

  const fetchAndParseMatch = async (m: typeof matches[0], periodLabel?: string) => {
    let qNum = 1;
    let yNum = new Date().getFullYear();
    const textQMatch = m.text.match(/q([1-4])/i) || m.slug.match(/q([1-4])/i);
    if (textQMatch) qNum = parseInt(textQMatch[1], 10);
    const textYMatch = m.text.match(/\b(20\d{2}|\d{2})\b/) || m.slug.match(/\b(20\d{2}|\d{2})\b/);
    if (textYMatch) {
      const yr = textYMatch[1];
      yNum = yr.length === 2 ? parseInt("20" + yr, 10) : parseInt(yr, 10);
    }
    const pStr = periodLabel || `Q${qNum}-${String(yNum).slice(-2)}`;
    const targetUrl = m.href.startsWith("http") ? m.href : `https://stockanalysis.com${m.href}`;
    console.log(`[Stock Analysis Scraper] Fetching transcript page: ${targetUrl} (${pStr})`);

    const pageRes = await fetch(targetUrl, {
      headers: { ...browserHeaders, "Referer": listUrl }
    });
    if (!pageRes.ok) return null;
    const pageHtml = await pageRes.text();
    const parsed = parseStockAnalysisTranscriptHtml(pageHtml, symbol, pStr);
    return {
      ...parsed,
      fileName: `${symbol}_${pStr}_Transcript.md`,
      periodStr: pStr
    };
  };

  let activeResult = await fetchAndParseMatch(selected);

  // If speculative interim release candidate is an audio stub (not yet transcribed), revert to targetPeriod match
  if (activeResult && activeResult.isStub && isNewEarningsRelease && targetPeriod) {
    console.log(`[Stock Analysis Scraper] Speculative interim match ${activeResult.periodStr} is an audio stub (transcription pending). Falling back to requested period ${targetPeriod}...`);
    const fallbackMatch = findQuarterMatch(targetPeriod);
    if (fallbackMatch) {
      const fallbackResult = await fetchAndParseMatch(fallbackMatch, targetPeriod);
      if (fallbackResult && !fallbackResult.isStub) {
        console.log(`[Stock Analysis Scraper] Successfully retrieved full verified transcript for prior period: ${fallbackResult.periodStr}`);
        activeResult = fallbackResult;
      }
    }
  }

  // Reject audio stubs and incomplete summaries
  if (!activeResult || activeResult.isStub) {
    console.warn(`[Stock Analysis Scraper] Transcript for ${symbol} is an audio stub or pending publication on stockanalysis.com.`);
    return null;
  }

  return {
    markdownText: activeResult.markdownText,
    fileName: activeResult.fileName
  };
}

export async function executeTranscriptIngest(
  ticker: string,
  period?: string,
  stockAnalysisCookie?: string,
  reqHeaderKey?: string,
  provider: "auto" | "tikr" | "stockanalysis" = "auto",
  canonicalCompanyName?: string
): Promise<{ success: boolean; notFound?: boolean; notReady?: boolean; message?: string; fileName?: string; tokens?: number; source?: string }> {
  const symbol = ticker.toUpperCase();
  const requestedPeriod = period && period !== "----" ? period.toUpperCase() : null;
  

  const activeProvider = provider || "auto";
  const canonicalName = canonicalCompanyName || undefined;

  let tikrResult: { markdownText: string; fileName: string; periodStr: string } | null = null;
  let tikrError: string | null = null;

  // 1. If provider is "auto" (Default) or "tikr", attempt TIKR Terminal (Capital IQ) first
  if (activeProvider === "auto" || activeProvider === "tikr") {
    try {
      console.log(`[Transcript Ingest] Querying TIKR Terminal (Capital IQ) for ${symbol} (${requestedPeriod || 'latest'})...`);
      tikrResult = await fetchTikrTranscript(
        symbol,
        requestedPeriod,
        process.env.TIKR_EMAIL,
        process.env.TIKR_PASSWORD,
        canonicalName,
        process.env.FMP_API_KEY
      );
    } catch (tikrErr: any) {
      console.warn(`[Transcript Ingest] TIKR fetch error:`, tikrErr?.message || tikrErr);
      tikrError = tikrErr?.message || String(tikrErr);
    }

    if (tikrResult && tikrResult.markdownText && tikrResult.markdownText.length >= 2500) {
      const log = await saveAndUploadFile(tikrResult.fileName, tikrResult.markdownText, "text/markdown", reqHeaderKey);
      return {
        success: true,
        fileName: log.name,
        tokens: log.tokens,
        source: "TIKR (Capital IQ)"
      };
    }

    if (activeProvider === "tikr") {
      return {
        success: false,
        notFound: true,
        notReady: true,
        message: tikrError 
          ? `TIKR error: ${tikrError}` 
          : `The earnings call transcript for ${symbol} ${requestedPeriod ? `(${requestedPeriod})` : ''} is not available on TIKR Terminal yet.`,
        source: "TIKR (Capital IQ)"
      };
    }
  }

  // 2. If provider is "auto" (TIKR was not ready) or "stockanalysis", query Stock Analysis
  console.log(`[Transcript Ingest] Querying Stock Analysis for ${symbol} (${requestedPeriod || 'latest'})...`);
  let saResult: { markdownText: string; fileName: string } | null = null;
  let saError: string | null = null;

  try {
    let saCookie = stockAnalysisCookie?.trim() || process.env.STOCK_ANALYSIS_COOKIE || "";
    if (!saCookie && (process.env.STOCK_ANALYSIS_EMAIL && process.env.STOCK_ANALYSIS_PASSWORD)) {
      saCookie = await loginToStockAnalysis();
    }
    if (saCookie) {
      saResult = await fetchStockAnalysisTranscript(symbol, requestedPeriod, saCookie, reqHeaderKey || state.customApiKey);
    }
  } catch (saErr: any) {
    console.warn(`[Transcript Ingest] Stock Analysis fetch error:`, saErr?.message || saErr);
    saError = saErr?.message || String(saErr);
  }

  if (saResult && saResult.markdownText && saResult.markdownText.length >= 2500) {
    const log = await saveAndUploadFile(saResult.fileName, saResult.markdownText, "text/markdown", reqHeaderKey);
    return {
      success: true,
      fileName: log.name,
      tokens: log.tokens,
      source: "Stock Analysis"
    };
  }

  // 3. Neither provider has verbatim dialogue ready yet
  const notReadyMessage = `The earnings call transcript for ${symbol} ${requestedPeriod ? `(${requestedPeriod})` : ''} is not ready yet on TIKR or Stock Analysis. Verbatim transcription typically takes 1 to 4 hours after the call ends. Please try again shortly or upload a transcript file manually.`;

  return {
    success: false,
    notFound: true,
    notReady: true,
    message: saError || tikrError 
      ? `Transcript error: ${[tikrError, saError].filter(Boolean).join(" | ")}` 
      : notReadyMessage
  };
}

app.post("/api/ingest/transcript", async (req: Request, res: Response) => {
  const { ticker, period, stockAnalysisCookie, provider, canonicalCompanyName } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: "Missing ticker." });
  }

  const reqHeaderKey = getApiHeaderKey(req);
  try {
    const result = await executeTranscriptIngest(ticker, period, stockAnalysisCookie, reqHeaderKey, provider, canonicalCompanyName);
    return res.json({
      ...result,
      method: result.source ? `${result.source} (Official Transcript)` : "Official Transcript",
      state
    });
  } catch (err: any) {
    console.error(`[Transcript Ingest Error for ${ticker}]:`, err);
    return res.status(500).json({
      error: err.message || `Failed to retrieve transcript for ${ticker}.`
    });
  }
});

function cleanTranscriptTextBlock(text: string): string {
  const boilerplateRegexes = [
    /welcome to the.*(earnings|conference call)/i,
    /(quarter|year).*earnings conference call/i,
    /call is being recorded/i,
    /conference is being recorded/i,
    /is being webcast/i,
    /webcast live/i,
    /replay the call/i,
    /view the transcript/i,
    /opening remarks/i,
    /turn the call over to/i,
    /turn the conference over to/i,
    /please go ahead/i,
    /listen-only mode/i,
    /operator assistance/i,
    /press star zero/i,
    /telephone keypad/i,
    /question and answer session will follow/i,
    /question-and-answer session/i,
    /speaking first today is/i,
    /on the call with me are/i,
    /joined today by/i,
    /investor relations website/i,
    /earnings press release/i,
    /supplement our prepared remarks/i,
    /prepared remarks to our website/i,
    /post our prepared remarks/i,
    /outlook slides/i,
    /growth comparisons we make/i,
    /growth rates are the same/i,
    /framework for assessing how our/i,
    /thank you for joining us/i,
    /thanks for joining the call/i,
    /forward-looking statements/i,
    /forward-looking statement/i,
    /safe harbor/i,
    /risk factors/i,
    /filed with the SEC/i,
    /filings with the SEC/i,
    /form 10-k/i,
    /form 8-k/i,
    /form 10-q/i,
    /securities and exchange commission/i,
    /obligation to update/i,
    /duty to update/i,
    /results.*differ materially/i,
    /results could materially differ/i,
    /non-gaap/i,
    /reconciliation of/i,
    /substitute for or superior to/i,
    /substitute for, or superior to/i,
    /risks and uncertainties/i,
    /clarifying items to aid investors/i,
    /live transmission/i,
    /future use of the recording/i,
    /transcript.*generated/i,
    /speech recognition/i,
    /errors or omissions/i,
    /not a certified transcript/i,
    /disclaimer/i
  ];

  const abbrevs: Record<string, string> = {
    "Mr.": "MR_PH", "Ms.": "MS_PH", "Mrs.": "MRS_PH", "Dr.": "DR_PH",
    "C.F.O.": "CFO_PH", "C.E.O.": "CEO_PH", "E.P.S.": "EPS_PH", "U.S.": "US_PH",
    "Co.": "CO_PH", "Inc.": "INC_PH", "Ltd.": "LTD_PH"
  };

  const restored: Record<string, string> = {};
  Object.entries(abbrevs).forEach(([k,v]) => { restored[v] = k; });

  const paragraphs = text.split("\n");
  const cleanedParagraphs: string[] = [];

  for (let paragraph of paragraphs) {
    let pStr = paragraph.trim();
    if (!pStr) continue;

    Object.entries(abbrevs).forEach(([k,v]) => {
      pStr = pStr.replace(new RegExp(k.replace(/\./g, '\\.'), 'g'), v);
    });

    const sentences = pStr.split(/(?<=[.!?])\s+/);
    const keptSentences: string[] = [];

    for (let sentence of sentences) {
      let cleanSentence = sentence;
      Object.entries(restored).forEach(([v,k]) => {
        cleanSentence = cleanSentence.replace(new RegExp(v, 'g'), k);
      });

      let isBoiler = false;
      for (const rx of boilerplateRegexes) {
        if (rx.test(cleanSentence)) {
          isBoiler = true;
          break;
        }
      }
      if (!isBoiler) {
        keptSentences.push(cleanSentence);
      }
    }

    if (keptSentences.length > 0) {
      cleanedParagraphs.push(keptSentences.join(" "));
    }
  }

  return cleanedParagraphs.join("\n\n").trim();
}

// ------------------------------------------

// --- Initialize Server Middleware ---
async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || (fs.existsSync(path.join(distPath, "index.html")) && process.env.NODE_ENV !== "development");

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server Core Online] Listening continuously at http://localhost:${PORT}`);
  });
}

startServer();
