import fs from "fs";
import path from "path";
import { BatchQueueItem, BatchQueueState, DocumentIntegrityReport, PortfolioContext } from "./types.js";
import { auditDocumentIntegrity, parsePeriodString, extractFromFileName } from "./documentGuard.js";
import { cleanMarkdownForRendering, convertMarkdownToHtml } from "./utils/googleDocs.js";
import { MASTER_PROMPTS } from "./prompts.js";

const IS_LOCAL_WINDOWS = fs.existsSync("G:/My Drive");

export const GDRIVE_STAGING_DIR = "G:/My Drive/Company Data/_STAGING";
export const LOCAL_STAGING_DIR = path.join(process.cwd(), "staging");

export let STAGING_DIR = (IS_LOCAL_WINDOWS && fs.existsSync("G:/My Drive/Company Data"))
  ? GDRIVE_STAGING_DIR
  : LOCAL_STAGING_DIR;

const CACHE_DIR = (IS_LOCAL_WINDOWS && fs.existsSync("C:/Users/Ronald/Downloads/Cache"))
  ? "C:/Users/Ronald/Downloads/Cache/TTM_Output_20260821"
  : path.join(process.cwd(), "staging");

export const VAULT_DOSSIER_DIR = (IS_LOCAL_WINDOWS && fs.existsSync("G:/My Drive/Company Data/GTD_Investing_Journal"))
  ? "G:/My Drive/Company Data/GTD_Investing_Journal/GTD_Investment_Latticework_Organized/02 AI_Terminal"
  : path.join(process.cwd(), "dossiers");

if (!fs.existsSync(STAGING_DIR)) {
  try { fs.mkdirSync(STAGING_DIR, { recursive: true }); } catch (e) {}
}
if (!fs.existsSync(LOCAL_STAGING_DIR)) {
  try { fs.mkdirSync(LOCAL_STAGING_DIR, { recursive: true }); } catch (e) {}
}
if (!fs.existsSync(VAULT_DOSSIER_DIR)) {
  try { fs.mkdirSync(VAULT_DOSSIER_DIR, { recursive: true }); } catch (e) {}
}

export const DEFAULT_PRESET_COMPANIES = [
  { ticker: "ADBE", period: "Q2-26", price: "266.51" },
  { ticker: "RMD", period: "Q4-26", price: "228.35" },
  { ticker: "CARG", period: "Q2-26", price: "33.74" },
  { ticker: "DOCU", period: "Q2-27", price: "65.54" },
  { ticker: "INTU", period: "Q4-26", price: "314.96" }
];

const REQUIREMENT_RULES = [
  { key: "10-K", synonyms: ["10-k", "10k", "20-f", "20f", "40-f", "40f", "annual"] },
  { key: "10-Q", synonyms: ["10-q", "10q", "quarterly", "interim", "6-k_quarterly", "6k_quarterly", "6-k_interim", "6k_q"] },
  { key: "8-K", synonyms: ["8-k", "8k", "item2.02", "earnings_release", "press_release"] },
  { key: "Transcript", synonyms: ["transcript", "call", "earnings call"] },
  { key: "Financials TTM", synonyms: ["financials ttm", "ttm", "csv", "financial"] }
];

export function sanitizeLatex(text: string): string {
  return cleanMarkdownForRendering(text);
}

function findFiles(dir: string, pattern: RegExp): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findFiles(fullPath, pattern));
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath.replace(/\\/g, "/"));
      }
    }
  } catch {}
  return results;
}

export function locateDocumentsForTicker(ticker: string, targetPeriod?: string): {
  csv?: string;
  annual?: string;
  quarterly?: string;
  interim8K?: string;
  transcript?: string;
  proxy?: string;
  competitorRadar?: string;
  all: string[];
} {
  const sym = ticker.toUpperCase();
  const docs: { csv?: string; annual?: string; quarterly?: string; interim8K?: string; transcript?: string; proxy?: string; competitorRadar?: string; all: string[] } = { all: [] };

  // 1. Financials TTM CSV: Check STAGING_DIR first, fall back to CACHE_DIR
  const stagingCsvs = findFiles(STAGING_DIR, new RegExp(`^${sym}[ _].*Financials-TTM\\.csv$`, "i"));
  if (stagingCsvs.length > 0) {
    docs.csv = stagingCsvs[0];
    docs.all.push(stagingCsvs[0]);
  } else {
    const directStagingCsv = findFiles(STAGING_DIR, new RegExp(`^${sym}.*\\.csv$`, "i"));
    if (directStagingCsv.length > 0) {
      docs.csv = directStagingCsv[0];
      docs.all.push(directStagingCsv[0]);
    } else {
      // Fallback to CACHE_DIR if not yet present in STAGING_DIR
      const cacheCsvs = findFiles(CACHE_DIR, new RegExp(`^${sym}[ _].*Financials-TTM\\.csv$`, "i"));
      if (cacheCsvs.length > 0) {
        docs.csv = cacheCsvs[0];
        docs.all.push(cacheCsvs[0]);
      } else {
        const directCsv = findFiles(CACHE_DIR, new RegExp(`^${sym}\\.csv$`, "i"));
        if (directCsv.length > 0) {
          docs.csv = directCsv[0];
          docs.all.push(directCsv[0]);
        }
      }
    }
  }

  // 2. Annual, Quarterly & Transcripts: All strictly sourced from STAGING_DIR
  const allStagingFiles = findFiles(STAGING_DIR, /.*/);
  const normTarget = targetPeriod ? parsePeriodString(targetPeriod) : null;

  for (const fp of allStagingFiles) {
    const fn = path.basename(fp).toLowerCase();
    if (fn.includes(sym.toLowerCase())) {
      if (fn.endsWith(".zip") || fn.endsWith(".csv")) continue;

      const fnExtract = extractFromFileName(path.basename(fp));
      const isPeriodMatch = Boolean(
        normTarget && 
        fnExtract.detectedPeriod && 
        fnExtract.detectedPeriod.quarter === normTarget.quarter && 
        (fnExtract.detectedPeriod.year === normTarget.year || 
         fnExtract.detectedPeriod.year === (normTarget.year ? normTarget.year % 100 : undefined))
      );

      if (fn.includes("10-k") || fn.includes("20-f") || fn.includes("40-f") || fn.includes("40f") || fn.includes("annual")) {
        const isAnnualYearMatch = Boolean(normTarget && fnExtract.detectedPeriod?.year === normTarget.year);
        if (!docs.annual || isAnnualYearMatch) {
          docs.annual = fp;
        }
      } else if (fn.includes("8-k") || fn.includes("8k") || fn.includes("item2.02") || (fn.includes("earnings") && (fn.includes("release") || fn.includes("press")))) {
        // Form 8-K Item 2.02 / Earnings release
        const current8KExtract = docs.interim8K ? extractFromFileName(path.basename(docs.interim8K)) : null;
        const current8KFullMatch = Boolean(
          normTarget && 
          current8KExtract?.detectedPeriod && 
          current8KExtract.detectedPeriod.quarter === normTarget.quarter && 
          (current8KExtract.detectedPeriod.year === normTarget.year || 
           current8KExtract.detectedPeriod.year === (normTarget.year ? normTarget.year % 100 : undefined))
        );
        if (!docs.interim8K || (isPeriodMatch && !current8KFullMatch)) {
          docs.interim8K = fp;
        }
      } else if (fn.includes("10-q") || fn.includes("6-k") || fn.includes("quarterly")) {
        const currentQExtract = docs.quarterly ? extractFromFileName(path.basename(docs.quarterly)) : null;
        const currentQFullMatch = Boolean(
          normTarget && 
          currentQExtract?.detectedPeriod && 
          currentQExtract.detectedPeriod.quarter === normTarget.quarter && 
          (currentQExtract.detectedPeriod.year === normTarget.year || 
           currentQExtract.detectedPeriod.year === (normTarget.year ? normTarget.year % 100 : undefined))
        );
        if (!docs.quarterly || (isPeriodMatch && !currentQFullMatch)) {
          docs.quarterly = fp;
        }
      } else if (fn.includes("transcript") || fn.includes("call") || (fn.includes("earnings") && !fn.includes("release"))) {
        const currentTrExtract = docs.transcript ? extractFromFileName(path.basename(docs.transcript)) : null;
        const currentTrFullMatch = Boolean(
          normTarget && 
          currentTrExtract?.detectedPeriod && 
          currentTrExtract.detectedPeriod.quarter === normTarget.quarter && 
          (currentTrExtract.detectedPeriod.year === normTarget.year || 
           currentTrExtract.detectedPeriod.year === (normTarget.year ? normTarget.year % 100 : undefined))
        );
        if (!docs.transcript || (isPeriodMatch && !currentTrFullMatch)) {
          docs.transcript = fp;
        }
      } else if (fn.includes("def_14a") || fn.includes("def14a") || fn.includes("def 14a") || fn.includes("proxy")) {
        docs.proxy = fp;
      } else if (fn.includes("competitor_radar")) {
        docs.competitorRadar = fp;
      }
    }
  }

  // Compile strictly required filing documents (for Q4, Form 10-K covers Q4 & FY, 10-Q is optional)
  const isQ4Target = Boolean(normTarget && (normTarget.quarter === "Q4" || normTarget.quarter === "FY"));
  if (isQ4Target) {
    docs.all = [docs.csv, docs.annual, docs.transcript].filter(Boolean) as string[];
    if (docs.quarterly && !docs.all.includes(docs.quarterly)) {
      docs.all.push(docs.quarterly);
    }
    if (docs.interim8K && !docs.all.includes(docs.interim8K)) {
      docs.all.push(docs.interim8K);
    }
  } else {
    // If 10-Q is missing or if 8-K matches the target period while 10-Q does not, use 8-K as interim quarterly doc
    const effectiveQuarterly = docs.quarterly || docs.interim8K;
    docs.all = [docs.csv, docs.annual, effectiveQuarterly, docs.transcript].filter(Boolean) as string[];
    if (docs.interim8K && !docs.all.includes(docs.interim8K)) {
      docs.all.push(docs.interim8K);
    }
    if (docs.quarterly && !docs.all.includes(docs.quarterly)) {
      docs.all.push(docs.quarterly);
    }
  }
  if (docs.proxy && !docs.all.includes(docs.proxy)) {
    docs.all.push(docs.proxy);
  }
  if (docs.competitorRadar && !docs.all.includes(docs.competitorRadar)) {
    docs.all.push(docs.competitorRadar);
  }
  return docs;
}

export function auditQueueItem(item: BatchQueueItem): void {
  const docs = locateDocumentsForTicker(item.ticker, item.period);
  const isQuarterlyCoveredBy8K = Boolean(!docs.quarterly && docs.interim8K);
  const effectiveQuarterly = docs.quarterly || docs.interim8K;
  item.files = {
    csv: docs.csv,
    annual: docs.annual,
    quarterly: effectiveQuarterly,
    transcript: docs.transcript,
    count: docs.all.length,
    isCoveredBy8K: isQuarterlyCoveredBy8K
  };
  item.isCoveredBy8K = isQuarterlyCoveredBy8K;

  const isQ4 = Boolean(item.period && (item.period.toUpperCase().includes("Q4") || item.period.toUpperCase().includes("FY")));
  const missingCategories: string[] = [];
  if (!docs.csv) missingCategories.push("Financials TTM CSV");
  if (!docs.annual) missingCategories.push("Annual Report (10-K)");
  if (!isQ4 && !effectiveQuarterly) missingCategories.push("Quarterly Report (10-Q / 8-K Item 2.02)");
  if (!docs.transcript) missingCategories.push("Earnings Transcript");

  if (missingCategories.length > 0) {
    if (item.overridden) {
      item.status = "ready";
      item.error = undefined;
    } else {
      item.status = "blocked";
      item.error = `Missing required filings: ${missingCategories.join(", ")}`;
      return;
    }
  }

  const fileInputs = docs.all.map(fp => {
    const fn = path.basename(fp);
    const cat = REQUIREMENT_RULES.find(r => r.synonyms.some(s => fn.toLowerCase().includes(s)))?.key || "Supplementary";
    let content = "";
    try {
      content = fs.readFileSync(fp, "utf-8");
    } catch {}
    return { name: fn, content, category: cat };
  });

  const rep = auditDocumentIntegrity(fileInputs, item.ticker, item.period);
  item.integrityReport = rep;

  if (rep.hasMismatches) {
    if (item.overridden) {
      item.status = "ready";
      item.error = undefined;
    } else {
      item.status = "blocked";
      item.error = `Document integrity mismatch: ${rep.mismatches.map(m => `${m.fileName} (${m.issue})`).join(", ")}`;
    }
  } else {
    item.status = "ready";
    item.error = undefined;
  }
}

export class BatchManager {
  public state: BatchQueueState = {
    status: "idle",
    items: [],
    activeTicker: null,
    completedCount: 0,
    totalCount: 0,
    retainStagingFiles: true,
    stagingLocation: (IS_LOCAL_WINDOWS && fs.existsSync("G:/My Drive/Company Data")) ? 'gdrive' : 'local',
    activeStagingDir: STAGING_DIR
  };

  private stopRequested = false;

  constructor() {
    // Start with a clean, empty queue to prevent stale filings from interfering
    this.state.items = [];
    this.syncCounts();
  }

  public setRetainStagingFiles(retain: boolean): void {
    this.state.retainStagingFiles = retain;
  }

  public setStagingLocation(location: 'gdrive' | 'local'): string {
    if (location === 'gdrive' && fs.existsSync("G:/My Drive/Company Data")) {
      STAGING_DIR = GDRIVE_STAGING_DIR;
      this.state.stagingLocation = 'gdrive';
    } else {
      STAGING_DIR = LOCAL_STAGING_DIR;
      this.state.stagingLocation = 'local';
    }
    if (!fs.existsSync(STAGING_DIR)) {
      try { fs.mkdirSync(STAGING_DIR, { recursive: true }); } catch (e) {}
    }
    this.state.activeStagingDir = STAGING_DIR;
    console.log(`[Batch Staging Location] Switched to: ${STAGING_DIR} (${this.state.stagingLocation})`);
    this.reAuditAll();
    return STAGING_DIR;
  }

  public purgeItemStagingFiles(ticker: string): number {
    const cleanSym = ticker.trim().toUpperCase();
    if (!cleanSym) return 0;
    let deletedCount = 0;
    const dirsToClean = new Set([STAGING_DIR, LOCAL_STAGING_DIR, GDRIVE_STAGING_DIR]);
    for (const dir of dirsToClean) {
      if (!dir || !fs.existsSync(dir)) continue;
      try {
        const files = fs.readdirSync(dir);
        for (const fn of files) {
          const fnUpper = fn.toUpperCase();
          if (
            fnUpper.startsWith(`${cleanSym}_`) ||
            fnUpper.startsWith(`${cleanSym} `) ||
            fnUpper.startsWith(`${cleanSym}-`)
          ) {
            const fullPath = path.join(dir, fn);
            try {
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                deletedCount++;
              }
            } catch (e) {}
          }
        }
      } catch (err) {}
    }
    console.log(`[Batch Staging Purge] Purged ${deletedCount} files for ${cleanSym} across staging directories.`);
    this.reAuditItem(cleanSym);
    return deletedCount;
  }

  public purgeSpecificStagingFile(fileName: string, ticker?: string): boolean {
    if (!fileName) return false;
    let deleted = false;
    const baseName = path.basename(fileName);
    const dirsToClean = new Set([STAGING_DIR, LOCAL_STAGING_DIR, GDRIVE_STAGING_DIR]);
    for (const dir of dirsToClean) {
      if (!dir || !fs.existsSync(dir)) continue;
      const fullPath = path.join(dir, baseName);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          deleted = true;
        }
      } catch (e) {}
    }
    console.log(`[Batch File Purge] Deleted specific file "${baseName}": ${deleted}`);
    if (ticker) {
      this.reAuditItem(ticker);
    } else {
      this.reAuditAll();
    }
    return deleted;
  }

  public purgeAllStagingFiles(): number {
    if (this.state.status === "running") {
      console.warn("[Batch Safety] Blocked purgeAllStagingFiles() while batch pipeline is running.");
      return 0;
    }
    let deletedCount = 0;
    const dirsToClean = new Set([STAGING_DIR, LOCAL_STAGING_DIR, GDRIVE_STAGING_DIR]);
    for (const dir of dirsToClean) {
      if (!dir || !fs.existsSync(dir)) continue;
      try {
        const files = fs.readdirSync(dir);
        for (const fn of files) {
          const fullPath = path.join(dir, fn);
          try {
            const stat = fs.statSync(fullPath);
            if (stat.isFile()) {
              fs.unlinkSync(fullPath);
              deletedCount++;
            }
          } catch (e) {}
        }
      } catch (err) {}
    }
    console.log(`[Batch Staging Purge All] Purged ${deletedCount} files across all staging directories.`);
    this.reAuditAll();
    return deletedCount;
  }

  public loadPreset(): void {
    if (this.state.status === "running") {
      console.warn("[Batch Safety] Blocked loadPreset() while batch pipeline is running.");
      return;
    }
    this.state.items = DEFAULT_PRESET_COMPANIES.map(p => {
      const item: BatchQueueItem = {
        id: `batch-${p.ticker}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ticker: p.ticker,
        period: p.period,
        price: p.price,
        status: "pending",
        currentStep: 0,
        totalSteps: MASTER_PROMPTS.length + 1,
        files: { count: 0 },
        fmpSynced: true,
        fmpSource: 'fmp'
      };
      auditQueueItem(item);
      return item;
    });

    this.syncCounts();
  }

  public addItem(
    ticker: string,
    period: string,
    price: string,
    fmpSynced: boolean = false,
    fmpSource: 'fmp' | 'fallback' | 'manual' = 'manual',
    portfolio?: PortfolioContext,
    lastEarningsDate?: string | null,
    nextEarningsDate?: string | null,
    daysToNextEarnings?: number | null
  ): BatchQueueItem {
    const sym = ticker.trim().toUpperCase();
    const existing = this.state.items.find(i => i.ticker === sym);
    if (existing) {
      existing.period = period.trim();
      existing.price = price.trim();
      existing.fmpSynced = fmpSynced;
      existing.fmpSource = fmpSource;
      if (portfolio) existing.portfolio = portfolio;
      if (lastEarningsDate !== undefined) existing.lastEarningsDate = lastEarningsDate;
      if (nextEarningsDate !== undefined) existing.nextEarningsDate = nextEarningsDate;
      if (daysToNextEarnings !== undefined) existing.daysToNextEarnings = daysToNextEarnings;
      auditQueueItem(existing);
      this.syncCounts();
      return existing;
    }

    const item: BatchQueueItem = {
      id: `batch-${sym}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticker: sym,
      period: period.trim(),
      price: price.trim(),
      status: "pending",
      currentStep: 0,
      totalSteps: MASTER_PROMPTS.length + 1,
      files: { count: 0 },
      fmpSynced,
      fmpSource,
      portfolio,
      lastEarningsDate: lastEarningsDate || null,
      nextEarningsDate: nextEarningsDate || null,
      daysToNextEarnings: typeof daysToNextEarnings === 'number' ? daysToNextEarnings : null
    };
    auditQueueItem(item);
    this.state.items.push(item);
    this.syncCounts();
    return item;
  }

  public updateItemPortfolio(idOrTicker: string, portfolio: PortfolioContext): BatchQueueItem | null {
    const clean = idOrTicker.trim().toUpperCase();
    const item = this.state.items.find(i => i.id === idOrTicker || i.ticker === clean);
    if (item) {
      item.portfolio = portfolio;
      this.syncCounts();
      return item;
    }
    return null;
  }

  public removeItem(id: string, purgeStaging: boolean = false): void {
    const item = this.state.items.find(i => i.id === id);
    if (item && purgeStaging) {
      this.purgeItemStagingFiles(item.ticker);
    }
    this.state.items = this.state.items.filter(i => i.id !== id);
    this.syncCounts();
  }

  public clearQueue(purgeStaging: boolean = false): void {
    if (this.state.status === "running") return;
    if (purgeStaging) {
      for (const item of this.state.items) {
        this.purgeItemStagingFiles(item.ticker);
      }
    }
    this.state.items = [];
    this.syncCounts();
  }

  public getState(): BatchQueueState {
    return this.state;
  }

  public reAuditAll(): BatchQueueState {
    for (const item of this.state.items) {
      if (item.status !== "completed") {
        auditQueueItem(item);
      }
    }
    this.syncCounts();
    return this.state;
  }

  public reAuditItem(ticker: string): BatchQueueItem | null {
    const sym = ticker.trim().toUpperCase();
    const item = this.state.items.find(i => i.ticker === sym);
    if (item && item.status !== "completed") {
      auditQueueItem(item);
      this.syncCounts();
      return item;
    }
    return item || null;
  }

  public toggleItemOverride(idOrTicker: string, overridden?: boolean): BatchQueueItem | null {
    const clean = idOrTicker.trim().toUpperCase();
    const item = this.state.items.find(i => i.id === idOrTicker || (i.ticker || '').toUpperCase() === clean);
    if (!item) return null;
    item.overridden = typeof overridden === 'boolean' ? overridden : !item.overridden;
    if (item.overridden) {
      item.overrideReason = "User explicitly approved interim filing override";
    } else {
      item.overrideReason = undefined;
    }
    auditQueueItem(item);
    this.syncCounts();
    return item;
  }

  public recheckAll(): void {
    for (const item of this.state.items) {
      if (item.status !== "completed") {
        auditQueueItem(item);
      }
    }
    this.syncCounts();
  }

  public stop(): void {
    this.stopRequested = true;
    this.state.status = "paused";
    this.state.activeTicker = null;
  }

  public async runBatch(
    executeCompanyRunner: (
      item: BatchQueueItem,
      docs: string[],
      onStep: (stepIdx: number, stepTitle: string) => void
    ) => Promise<{ success: boolean; compiledMarkdown: string; mdFileName?: string; htmlFileName?: string; htmlDocTitle?: string; error?: string }>,
    callbacks?: {
      onCompanyComplete?: (item: BatchQueueItem) => void;
      onBatchComplete?: (state: BatchQueueState) => void;
      onCompanyBlocked?: (item: BatchQueueItem) => void;
    }
  ): Promise<void> {
    if (this.state.status === "running") return;
    this.stopRequested = false;
    this.state.status = "running";

    console.log(`[Batch Queue Engine] Starting batch execution across ${this.state.items.length} items...`);

    for (let i = 0; i < this.state.items.length; i++) {
      if (this.stopRequested) {
        console.log(`[Batch Queue Engine] Stop requested by user. Pausing queue.`);
        this.state.status = "paused";
        this.state.activeTicker = null;
        return;
      }

      const item = this.state.items[i];
      if (item.status === "completed") {
        continue;
      }

      // Re-audit to ensure files are 100% verified right before execution
      auditQueueItem(item);
      if (item.status !== "ready") {
        console.warn(`[Batch Queue Engine] Skipping blocked or invalid item: ${item.ticker} (${item.error})`);
        callbacks?.onCompanyBlocked?.(item);
        continue;
      }

      this.state.activeTicker = item.ticker;
      item.status = "running";
      item.currentStep = 0;
      console.log(`\n======================================================================`);
      console.log(`  [BATCH ENGINE] ENGAGING PIPELINE: ${item.ticker} ($${item.price} | Period: ${item.period})`);
      console.log(`======================================================================`);

      const docs = locateDocumentsForTicker(item.ticker, item.period);

      try {
        const result = await executeCompanyRunner(item, docs.all, (stepIdx, stepTitle) => {
          item.currentStep = stepIdx + 1;
          item.currentStepTitle = stepTitle;
        });

        if (result.success && result.compiledMarkdown) {
          // Sanitize LaTeX into clean plain-text bullets
          const cleanMarkdown = sanitizeLatex(result.compiledMarkdown);

          // Write directly to Obsidian vault using canonical Dual-Format Delivery Contract naming
          if (!fs.existsSync(VAULT_DOSSIER_DIR)) {
            fs.mkdirSync(VAULT_DOSSIER_DIR, { recursive: true });
          }

          const formattedDate = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }).replace(/\//g, "-");
          const outFileName = result.mdFileName || `${item.ticker} ${item.period}_Complete Doc_gemini_${formattedDate}.md`;
          const outPath = path.join(VAULT_DOSSIER_DIR, outFileName).replace(/\\/g, "/");

          fs.writeFileSync(outPath, cleanMarkdown, "utf-8");
          const stat = fs.statSync(outPath);

          // Also generate and save companion standalone HTML dossier with embedded flywheel & charts
          let htmlPath: string | undefined;
          try {
            const htmlDocTitle = result.htmlDocTitle || `${item.ticker} - ${item.period} Deep Valuation Dossier`;
            const htmlContent = convertMarkdownToHtml(cleanMarkdown, htmlDocTitle, item.ticker);
            const htmlFileName = result.htmlFileName || `${item.ticker} ${item.period}_Valuation_Dossier_gemini_${formattedDate}.html`;
            htmlPath = path.join(VAULT_DOSSIER_DIR, htmlFileName).replace(/\\/g, "/");
            fs.writeFileSync(htmlPath, htmlContent, "utf-8");
          } catch (htmlErr: any) {
            console.warn(`  [BATCH HTML WARNING] Could not save HTML dossier for ${item.ticker}:`, htmlErr.message);
          }

          item.status = "completed";
          item.dossierPath = outPath;
          item.dossierHtmlPath = htmlPath;
          item.dossierSize = Math.round(stat.size / 1024);
          item.error = undefined;
          console.log(`  [BATCH SUCCESS] Dossier for ${item.ticker} saved to Obsidian (${item.dossierSize} KB MD${htmlPath ? ", HTML saved" : ""})`);
          callbacks?.onCompanyComplete?.(item);

          // If user chose to purge staging source files upon completion, auto-clean raw filings
          if (this.state.retainStagingFiles === false && docs.all && docs.all.length > 0) {
            try {
              console.log(`  [BATCH RETENTION] Purging ${docs.all.length} raw source filings for ${item.ticker} from staging...`);
              for (const fp of docs.all) {
                if (fs.existsSync(fp)) fs.unlinkSync(fp);
              }
            } catch (cleanErr: any) {
              console.warn(`  [BATCH RETENTION WARNING] Could not clean source files for ${item.ticker}:`, cleanErr?.message || cleanErr);
            }
          }
        } else {
          item.status = "failed";
          item.error = result.error || "Step execution failed.";
        }
      } catch (err: any) {
        console.error(`[BATCH FAILURE] Error running company ${item.ticker}:`, err);
        item.status = "failed";
        item.error = err.message || String(err);
      }

      this.syncCounts();
      await new Promise(r => setTimeout(r, 1200));
    }

    this.state.status = "completed";
    this.state.activeTicker = null;
    console.log(`[Batch Queue Engine] All queued items processed.`);
    callbacks?.onBatchComplete?.(this.state);
  }

  private syncCounts(): void {
    this.state.totalCount = this.state.items.length;
    this.state.completedCount = this.state.items.filter(i => i.status === "completed").length;
  }
}

export const batchManager = new BatchManager();
