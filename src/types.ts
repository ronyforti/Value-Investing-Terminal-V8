export interface FlexProbeResult {
  available: boolean;
  status: number;
  reason: "available" | "saturated" | "rate_limit" | "error";
  message: string;
  latencyMs: number;
  timestamp: string;
  model: string;
}

export interface FlexWatcherState {
  isWaiting: boolean;
  target: "single" | "batch";
  model: string;
  startedAt: string | null;
  lastCheckedAt: string | null;
  nextCheckInSeconds: number;
  attempts: number;
  checkIntervalSeconds: number;
  maxWaitHours: number;
  lastProbeResult?: FlexProbeResult | null;
}

export enum ExecutionMode {
  Surgical = 1,
  Phased = 2,
  FullAuto = 3,
}

export interface PortfolioContext {
  holdsPosition: boolean;
  currentWeight?: string;
  entryPrice?: string;
}

export interface HybridConfig {
  phase1Model: string;
  phase2Model: string;
  transitionStepIndex: number; // 0-indexed (2 = Step 3 Cash Flow Integrity)
}

export type SessionMode = 'slingshot' | 'full' | 'sentinel';

export interface SessionConfig {
  ticker: string;
  period: string;
  price: string;
  model: string;
  executionMode: ExecutionMode;
  portfolio: PortfolioContext;
  sessionMode?: SessionMode;
  notes?: string;
  enableCrosscheck?: boolean;
  crosscheckModel?: string;
  pipelineMode?: 'single' | 'hybrid';
  hybridConfig?: HybridConfig;
  serviceTier?: 'standard' | 'flex';
  lastEarningsDate?: string | null;
  nextEarningsDate?: string | null;
  daysToNextEarnings?: number | null;
  isAdr?: boolean;
  country?: string | null;
  priorDossierPath?: string | null;
}

export interface FileLog {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  auditCategory?: string; // e.g., '10-K', '10-Q', 'Transcript', 'Financials TTM'
  geminiUri?: string;
  geminiName?: string;
  extractedDate?: string;
  displayName?: string;
  tokens?: number;
  detectedTicker?: string;
  detectedPeriod?: string;
  companyMatch?: 'MATCH' | 'MISMATCH' | 'UNVERIFIED';
  periodMatch?: 'MATCH' | 'MISMATCH' | 'UNVERIFIED';
  integrityDetails?: string[];
  isAmended?: boolean;
  filingDate?: string;
  reportDate?: string;
  lineCount?: number;
  fileUriVerifiedAt?: number;
}

export interface AuditCheck {
  category: string;
  label?: string;
  description?: string;
  isForeignEquivalent?: boolean;
  status: 'CONFIRMED' | 'MISSING';
  matchedFiles: string[];
  integrityStatus?: 'VALID' | 'WARNING' | 'MISMATCH';
  integrityDetails?: string[];
  detectedTicker?: string;
  detectedPeriod?: string;
  isCoveredBy8K?: boolean;
  substanceStatus?: 'VALID' | 'TRUNCATED';
  substanceReason?: string;
  optional?: boolean;
}

export interface FileSubstanceIssue {
  fileName: string;
  category: string;
  tokens?: number;
  size: number;
  expectedMinTokens: number;
  reason: string;
}

export interface FileSubstanceReport {
  hasIssues: boolean;
  issues: FileSubstanceIssue[];
}

export interface DocumentIntegrityAudit {
  fileName: string;
  category: string;
  detectedTicker: string | null;
  detectedPeriod: string | null;
  companyMatch: 'MATCH' | 'MISMATCH' | 'UNVERIFIED';
  periodMatch: 'MATCH' | 'MISMATCH' | 'UNVERIFIED';
  details: string[];
}

export interface DocumentIntegrityReport {
  targetTicker: string;
  targetPeriod: string;
  allMatch: boolean;
  hasMismatches: boolean;
  hasWarnings: boolean;
  mismatches: Array<{
    fileName: string;
    category: string;
    issue: string;
    expected: string;
    actual: string;
  }>;
  warnings: Array<{
    fileName: string;
    category: string;
    issue: string;
  }>;
  fileAudits: Record<string, DocumentIntegrityAudit>;
}

export interface StepOutput {
  index: number;
  title: string;
  status: 'idle' | 'executing' | 'completed' | 'failed' | 'paused';
  prompt: string;
  response?: string;
  temperature?: number;
  thinkingLevel?: 'low' | 'medium' | 'high';
  isCrosscheck?: boolean;
  model?: string;
  fallback?: {
    originalModel: string;
    fallbackModel: string;
    reason: string;
  };
  truncated?: boolean;
  finishReason?: string;
}

export interface CustomMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  type?: 'master_prompt' | 'custom_injection' | 'system' | 'crosscheck';
  index?: number;
  timestamp: string;
  actualTokens?: number;
  model?: string;
}

export interface RetryState {
  active: boolean;
  stepIndex: number;
  stepTitle: string;
  attempt: number;
  maxAttempts: number;
  nextRetryTimestamp: number;
  error: string;
}

export interface CacheApprovalInfo {
  model: string;
  ticker: string;
  estimatedTokens: number;
  reason: string;
}

export interface CacheKeepAliveState {
  active: boolean;
  startedAt: number;
  warningAt: number;
  expiresAt: number;
  lastPingAt: number | null;
  pingCount: number;
}

export interface PythonOkrItem {
  id: string;
  name: string;
  value: string;
  passed: boolean;
  target: string;
}

export interface PythonForensicVector {
  vector: string;
  metric: string;
  finding: 'PASS' | 'FLAG' | 'BREACH';
  threshold: string;
}

export interface PythonValuationResult {
  ticker: string;
  currency: string;
  price: number;
  mcap_usd: number;
  mcap_home: number;
  diluted_shares: number;
  oe_0: number;
  g_bolsa_raw_pct: number;
  g_bolsa_capped_pct: number;
  pv_10: number;
  bolsa_multiple: number;
  bolsa_tier: string;
  has_rd: boolean;
  rd_spectrum: Record<string, {
    alpha: number;
    oe_0: number;
    pv_10: number;
    bolsa_multiple: number;
    tier: string;
  }>;
  epv_per_share: number;
  dcf_bear: number;
  dcf_base: number;
  dcf_bull: number;
  dcf_expected: number;
  implied_reverse_g_pct: number;
  okr_scorecard: PythonOkrItem[];
  okr_passed_count: number;
  forensic_4vectors: PythonForensicVector[];
  qoq_deltas: Record<string, number>;
  markdown_block: string;
  computedAt?: string;
}

export interface SessionState {
  config: SessionConfig | null;
  files: FileLog[];
  auditPassed: boolean;
  activeStepIndex: number;
  steps: StepOutput[];
  history: CustomMessage[];
  status: 'idle' | 'initializing' | 'running' | 'paused' | 'completed' | 'failed' | 'retrying';
  currentPromptIndex: number;
  uploadedTokens?: number;
  liveTokensUsed?: number;
  customApiKey?: string;
  competitorRadar?: CompetitorRadarDossier | null;
  retryState?: RetryState | null;
  cachedTokenCount?: number;
  cacheStatus?: 'active' | 'unavailable' | 'bypassed';
  cacheKeepAlive?: CacheKeepAliveState | null;
  crosscheckVerdict?: {
    gatesPassed: number;
    totalGates: number;
    hasBreach: boolean;
    breaches: string[];
  };
  pythonValuation?: PythonValuationResult | null;
  hasDispatchedStartNotification?: boolean;
  priorDossierMeta?: {
    fileName: string;
    source: 'obsidian_dossiers' | 'obsidian_vault' | 'local_archive' | 'manual_upload';
    period?: string;
    priorIv?: string;
    priorDecision?: string;
  } | null;
}

export interface CurrencyAuditMismatch {
  item: string;
  description: string;
}

export interface CurrencyAuditResult {
  fileName: string;
  ticker?: string;
  hasForeignCurrency: boolean;
  hasMixedCurrencies: boolean;
  hasBsMismatch: boolean;
  homeCurrency: string;
  currenciesFound: string[];
  fxRate: number;
  requiresAction: boolean;
  mismatches: CurrencyAuditMismatch[];
  details: string[];
}

export interface CurrencyHarmonizeRequest {
  fileName: string;
  data: string; // base64 or raw text
  homeCurrency: string;
  fxRate: number;
}

export interface BatchQueueItem {
  id: string;
  ticker: string;
  period: string;
  price: string;
  model?: string;
  status: 'pending' | 'ready' | 'running' | 'completed' | 'failed' | 'blocked';
  currentStep: number;
  totalSteps: number;
  currentStepTitle?: string;
  dossierPath?: string;
  dossierHtmlPath?: string;
  dossierSize?: number;
  error?: string;
  files: {
    csv?: string;
    annual?: string;
    quarterly?: string;
    transcript?: string;
    count: number;
    isCoveredBy8K?: boolean;
  };
  isCoveredBy8K?: boolean;
  integrityReport?: DocumentIntegrityReport;
  fmpSynced?: boolean;
  fmpSource?: 'fmp' | 'fallback' | 'manual';
  isPullingDocs?: boolean;
  pullDocsError?: string;
  overridden?: boolean;
  overrideReason?: string;
  portfolio?: PortfolioContext;
  lastEarningsDate?: string | null;
  nextEarningsDate?: string | null;
  daysToNextEarnings?: number | null;
}

export interface BatchQueueState {
  status: 'idle' | 'running' | 'paused' | 'completed';
  items: BatchQueueItem[];
  activeTicker: string | null;
  completedCount: number;
  totalCount: number;
  retainStagingFiles?: boolean;
  stagingLocation?: 'gdrive' | 'local';
  activeStagingDir?: string;
}

export interface NotificationConfig {
  enabled: boolean;
  channels: {
    desktop: boolean;
    telegram: boolean;
    ntfy: boolean;
    email: boolean;
  };
  telegram?: {
    botToken: string;
    chatId: string;
    sendDossierDoc?: boolean;
    docFormat?: 'html' | 'md' | 'both';
  };
  ntfy: {
    topic: string;
    serverUrl?: string;
  };
  email: {
    provider: 'resend' | 'smtp';
    to: string;
    resendApiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    from?: string;
  };
  events: {
    singleCompany: boolean;
    batchComplete: boolean;
    batchCompany: boolean;
    blockedAlert: boolean;
  };
}

export interface NotificationPayload {
  event: 'session_start' | 'single_complete' | 'batch_complete' | 'batch_company' | 'blocked_alert' | 'test' | 'flex_gatekeeper_engaged' | 'flex_gatekeeper_launched' | 'model_selection_required' | 'cooldown_alert' | 'cooldown_recovered';
  title: string;
  message: string;
  ticker?: string;
  companyName?: string;
  period?: string;
  price?: string;
  sessionMode?: SessionMode;
  intrinsicValue?: string;
  marginOfSafety?: string;
  verdict?: string;
  bolsaMultiple?: string;
  divergenceStatus?: string;
  dossierPath?: string;
  dossierContent?: string;
  dossierHtmlPath?: string;
  dossierHtmlContent?: string;
  dossierMdFileName?: string;
  dossierHtmlFileName?: string;
  batchStats?: {
    total: number;
    completed: number;
    failed: number;
    blocked: number;
    tickers: string[];
  };
}

export type IndustryArchetype = 'tech_platform' | 'financial_bank' | 'insurance' | 'homebuilder' | 'reit' | 'industrial_asset_heavy' | 'standard_corporate';

export interface CompetitorItem {
  name: string;
  ticker?: string;
  type: 'direct_public' | 'conglomerate_division' | 'private_unlisted';
  parentTicker?: string;
  source: 'proxy_peer' | '10k_risk' | 'transcript_qa' | 'industry_benchmark';
  isReciprocalPeer?: boolean;
  transcriptMentions?: Array<{
    sourceSpeaker?: string;
    text: string;
    period?: string;
  }>;
  financials?: {
    price?: number;
    marketCap?: number;
    enterpriseValue?: number;
    revenue?: number;
    grossMargin?: number;
    operatingMargin?: number;
    fcf?: number;
    sbc?: number;
    trueFcf?: number; // FCF - SBC
    evToTrueFcf?: number;
    // Programmatic Owner Earnings Proxy (Greenwald / Buffett)
    da?: number; // Depreciation & Amortization ($M)
    maintenanceCapex?: number; // Estimated Maintenance CapEx ($M)
    growthCapex?: number; // Estimated Growth CapEx ($M)
    ownerEarnings?: number; // OCF - Maintenance CapEx - SBC ($M)
    evToOwnerEarnings?: number; // Enterprise Value / Owner Earnings
    pToOwnerEarnings?: number; // Market Cap / Owner Earnings
    peRatio?: number;
    roic?: number;
    netDebt?: number;
    netCashToMarketCap?: number;
    ruleOf40?: number;
    isTtm?: boolean;
    // Bank specific
    priceToTangibleBook?: number;
    rotce?: number;
    nim?: number;
    efficiencyRatio?: number;
    cet1Ratio?: number;
    // Homebuilder specific
    adjustedFcf?: number;
    housingGrossMargin?: number;
    netDebtToCapital?: number;
    landYearsControlled?: number;
    // Insurance specific
    combinedRatio?: number;
    lossRatio?: number;
    expenseRatio?: number;
    priceToBook?: number;
    roe?: number;
    netInvestmentIncome?: number; // in $M
    investmentYield?: number; // in %
    // REIT specific
    affo?: number; // in $M
    pToAffo?: number;
    debtToEbitdare?: number;
    dividendYield?: number;
    sameStoreNoiGrowth?: number;
    navDiscount?: number;
  };
  provenanceStatus: 'VERIFIED_COMPLETE' | 'PARTIAL' | 'QUALITATIVE_ONLY' | 'NOT_FOUND' | 'UNAVAILABLE';
  provenanceNotes?: string;
}

export interface PeerRankingMetric {
  key: string;
  label: string;
  targetValue?: number;
  formattedTargetValue: string;
  rank: number; // 1-based (1 = best)
  totalCount: number;
  peerMedian?: number;
  formattedPeerMedian: string;
  leaderName: string;
  leaderTicker: string;
  leaderValue?: number;
  formattedLeaderValue: string;
  direction: 'higher_is_better' | 'lower_is_better';
  verdict: 'LEADER' | 'TOP_QUARTILE' | 'MEDIAN' | 'LAGGING';
}

export interface CompetitorRadarDossier {
  targetTicker: string;
  targetName?: string;
  archetype: IndustryArchetype;
  generatedAt: string;
  peers: CompetitorItem[];
  targetFinancials?: CompetitorItem['financials'];
  targetItem?: CompetitorItem;
  rankings?: PeerRankingMetric[];
  markdownSummary: string;
  csvData?: string;
}

