---
name: financial-ingest-guard
description: Use this skill when ingesting, verifying, and harmonizing source documents (SEC 10-K, 10-Q, 8-K filings, DEF 14A proxy statements, earnings call transcripts, and 10-period financial CSV datasets). Enforces DocumentGuard roll call, CurrencyGuard ADR harmonization, and CSV-as-ground-truth directives.
---

# Financial Ingest Guard Skill: Ground-Truth & Filing Audit Protocol

This skill enforces strict data integrity, document accounting, and currency harmonization before any financial evaluation begins in the **Value Investing Terminal**.

## Core System Guardrails
- **Document Integrity Guard:** [`src/documentGuard.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/documentGuard.ts)
- **Currency & ADR Harmonizer:** [`src/currencyGuard.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/currencyGuard.ts)
- **Primary Prompt Directive:** [`src/prompts.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/prompts.ts) (Step 1 Master Prompt)

---

## 1. The Document Verification Roll Call (Step 1 Directive)

Before summarizing or analyzing any business, the engine must execute the **Document Verification Roll Call**:

1. **Source Document Accounting:**
   - Explicitly list the exact filenames of all ingested SEC filings (10-K, 10-Q), proxy statements (DEF 14A), earnings call transcripts, and financial spreadsheets.
   - **Strict Prohibition:** You are strictly forbidden from stating a document is missing if it appears in the active document manifest. Treat non-SEC supplementary documents as objective reality.
2. **Recency Precedence & Filing Exemptions:**
   - Form 10-Q and the latest Earnings Call Transcript take strict precedence over Form 10-K for current-quarter qualitative disclosures, operational guidance, and liquidity updates.
   - **Q4 / Fiscal Year-End Exemption:** When evaluating a company at its fourth quarter (Q4) or fiscal year-end, Form 10-Q is formally exempt from the roll call because Form 10-K covers the full annual period.
   - Form 10-K serves as the structural foundation for long-term customer concentration, itemized debt maturities, and significant accounting policies.

---

## 2. Financial CSV as Absolute Ground Truth

The SEC Form 10-K only provides 3 historical years of financial statements. The terminal provides an authoritative, harmonized 10-period financial CSV covering up to 10 historical years and Trailing Twelve Months (TTM).

### Critical Directives:
- **TTM Extraction:** You must extract all TTM figures (Revenue, Gross Profit, Operating Cash Flow, CapEx, FCF, Stock-Based Compensation) directly from the CSV.
- **True TTM Segment Ground-Truth:**
  - The ingest engine queries FMP stable endpoints (`/stable/revenue-geographic-segmentation` and `/stable/revenue-product-segmentation`) to aggregate 4 consecutive quarters into True TTM.
  - Extract segment revenue directly from the appended `Revenue Geographic Segments (TTM)` and `Revenue Product Segments (TTM)` tables in `Financials-TTM.csv`.
- **SEC Filing Bridge for Segment Operating Profit & Margin:**
  - For operating profitability and margins by segment (which FMP does not report quarterly), bridge interim reports to true TTM using the canonical SEC formula:
    > **Formula / Calculation:** TTM = Full Prior Fiscal Year (10-K) + Current YTD (10-Q) - Prior-Year YTD (10-Q)
  - If interim quarterly segment profit is not disclosed in the 10-Q notes, use the latest audited Form 10-K full-year breakdown and explicitly state the period.
- **10-Period Trend Consistency:** 5-year and 10-year compounding rates (revenue growth, gross margin trends, return on retained capital) must be anchored strictly in the CSV dataset.
- **Multi-Statement CSV Parser Protection:** Financial CSV files from FMP and SEC aggregate multiple statements (Cash Flow, Income Statement, Balance Sheet, Segments). Parsers (`scripts/valuation_engine.py` and backend ingests) must discard section headers containing `:` or `segment`/`breakdown`, disambiguate `costofrevenue` and `deferredrevenue` from top-line `revenue`, and protect already populated non-zero series from being overwritten by subsequent blank or all-zero rows.

---

## 3. Foreign Currency Preservation & ADR Harmonization (CurrencyGuard)

When analyzing international businesses, foreign private issuers, and American Depositary Receipts (ADRs):

### A. Home Currency Preservation
- The financial CSV is harmonized in the company's native Home Currency (e.g., MXN, JPY, EUR, GBP, CAD, CHF, BRL, DKK) across all historical periods.
- You must perform all operational evaluations, margin compounding, working capital analysis, and the Return on Retained Capital (RORC) strictly in the **native Home Currency**.
- **Rationale:** Prevents foreign exchange translation volatility from distorting underlying business unit economics.

### B. Balance Sheet Unit Consistency
- Ensure Cash, Marketable Securities, and Gross Funded Debt are evaluated in identical currency units before calculating Net Cash, Enterprise Value, or Cash-Adjusted Margin of Safety.

### C. Dual-Currency Valuation Bridge
- In Full Mode Parts 6, 7, and 8 (Valuation Floor, Engine, and Synthesis) and Mode 1 Slingshot (Pillars 4 and 6), calculate Intrinsic Value and the Zero-Growth EPV Floor per share/unit in the native Home Currency first.
- Then apply the verified Current Spot Exchange Rate and ADS conversion ratio to state the final Intrinsic Value and EPV Floor in **USD per ADS** to compare directly against the US Market Tape Price:
  $$\text{IV per ADS (USD)} = \frac{\text{IV per Ordinary Share (Native)} \times \text{Ordinary Shares per 1 ADS}}{\text{Spot FX Rate (Native per 1 USD)}}$$
- **US Market Tape Parity Contract:** In Mode 1 Pillar 6 and Mode 2 Part 11/Part 13 decision tables, Current Market Tape Price, Synthesized Intrinsic Value, and Zero-Growth EPV Floor Benchmark MUST be stated in USD per ADS. Never compare unadjusted native currency figures against the USD market tape.

---

## 4. Strict Materiality & Noise Filtering

Financial filings contain immense boilerplate. To maintain high-signal analysis:

- **Filter Out Immaterial Noise:**
  - Minor IT software implementations or routine ERP updates.
  - Standard legal boilerplate or low-probability claims with booked reserves <1% of cash flow.
  - Rounding differences <1% across intermediate decimal steps.
- **Ruthlessly Highlight Structural Contingencies:**
  - Customer concentration (e.g., single customer representing >20% of revenue or receivables).
  - Credit facility covenant triggers (Net Debt / EBITDA ceilings, fixed charge minimums).
  - Wafer/supplier non-cancellable take-or-pay commitments.
  - Unreserved tax examination liabilities or DOJ/regulatory penalties.
  - Management turnover (CEO/CFO departures) and executive compensation misalignment.

---

## 5. Clean Environment & Ticker Isolation Mandate (Zero Cross-Contamination)

Every valuation run must execute in a pristine, fully isolated environment. Data bleed across companies or runs is strictly unacceptable.

### The 13 Inviolable Ticker Isolation & Ingest Defense Rules:
1. **Automated Ticker Sanitization (`enforceCleanTickerEnvironment`):**
   - Whenever initializing a session (`/api/session/init`), switching tickers, soft-resetting, or ingesting filings (SEC, FMP, Transcripts), the system must purge all lingering documents, caches, and telemetry that do not match the target ticker.
2. **Zero Persistent Cross-Ticker Carryover (Permanent Pinning Elimination):**
   - File pinning and persistent file flags have been permanently eliminated across the entire terminal. Every evaluation session operates in complete ticker isolation. Switching tickers or ingesting filings unconditionally purges all previous documents, caches, and telemetry with zero carryover.
3. **Purge Intermediate Compilation Artefacts:**
   - Any prior compiled reports (`compiled-obsidian-report`), draft dossiers, or competitor radar cards from earlier runs must be unlinked and purged before Step 1 Document Verification Roll Call begins.
4. **Zero Company-Specific Parametric Residue in Engine Code:**
   - RegEx patterns, fallback format transformations, and output normalizers must be strictly generic. Never embed company names, specific ticker symbols, or historical price points as fallback strings in parsing rules.
5. **Preservation of Active Staged Documents on Initialization:**
   - Session initialization (`/api/session/init`) must strictly preserve all staged files verified to belong to the active company (`cleanTicker`). The `clearFiles` parameter must NEVER be implicitly coupled with `isTickerSwitch` or unconfigured initial session states (`!state.config`), preventing documents pulled prior to clicking "Initialize Terminal State" from dropping out. `clearFiles: true` is strictly reserved for explicit, user-commanded hard purges.
6. **Null-Safe Period & Ticker Audit Defense:**
   - All audit functions (`auditFileIntegrity`, `auditDocumentIntegrity`, `auditFinancialCsv`) must handle optional or undefined `targetPeriod` and `targetTicker` parameters defensively without throwing runtime exceptions (e.g. `TypeError: Cannot read properties of undefined (reading 'toUpperCase')`). All period and ticker variables must be guarded with safe fallbacks (`safePeriod = (targetPeriod || "").trim()`, `safeTicker = (ticker || "").trim().toUpperCase()`) before executing case normalizations or substring checks.
7. **Native Context Cache Prefix Invariant:**
   - Ingested financial files, SEC filings, transcripts, and CSV datasets are formatted as an immutable user prefix at the beginning of the prompt turn.
   - Leverages Google's automatic implicit prefix caching for all Gemini 2.5+ models above 4,096 tokens (2,048 on 2.5).
   - Eliminates explicit cache lifecycle management, preventing model rejection and pipeline pauses across all models including `gemini-4-argon`.
8. **Form 20-F / FPI Audited Statement Protection & Supplementary Retention:**
   - Under SEC Form 20-F rules for Foreign Private Issuers, **Item 18 contains the Audited Consolidated Financial Statements and Footnotes**.
   - Boilerplate truncation filters in `cleanSecHtmlToMarkdown()` must NEVER truncate at `ITEM 18.` on Form 20-F/40-F filings. Truncation must be restricted strictly to `ITEM 19.` or `SIGNATURES`.
   - `enforceCleanTickerEnvironment()` must retain unverified supplementary industry documents (`auditCategory === "Supplementary"`) during session initialization, unless an explicit company mismatch is proven.
9. **Form 8-K Current Report Exemption & Interim Earnings Release Protocol:**
   - **Form 8-K Current Report Exemption:** Form 8-K is an unscheduled Current Report (Item 2.02 earnings releases, material definitive agreements, executive changes). As long as the company ticker matches, Form 8-Ks are unconditionally accepted as valid supplemental context and never flagged as period mismatches.
   - **Post-Earnings / Pre-10-Q Interim Release Protocol:** When an evaluation is executed on or after earnings day before the official Form 10-Q is filed on EDGAR (staged Transcript or 8-K Item 2.02 is 1 sequential quarter ahead of the latest filed 10-Q), DocumentGuard validates the pairing as an active interim earnings release state without period discrepancy errors. Dossier filenames automatically append `_Earnings_Release` (e.g. `[TICKER] [PERIOD]_Earnings_Release_Complete Doc_[MODEL]_[DATE].md`), and YAML frontmatter injects `filing_status: "Interim Earnings Release (Pending SEC Form 10-Q)"`.
10. **Zero-Contamination Test & Session Initialization Protocol (Zero Prompt Injections / Zero Coaching):**
   - **Pristine Notes Mandate:** In session initialization payloads (`/api/session/init`), CLI commands, and automated test runner scripts, the `notes` field MUST strictly be empty (`notes: ""`) unless the user explicitly dictates text and commands you to insert it.
   - **Zero Editorial Coaching:** Strictly forbidden from injecting unprompted editorial notes, thematic cues, thesis cheat-sheets, or pre-digested answers into `notes` or session state (e.g., highlighting specific moats, stating exact net cash figures, pre-specifying normalization frameworks, or dictating valuation verdicts). All quantitative and qualitative insights must be independently derived by the AI solely from the ingested filings and canonical master prompts.
   - **Zero Legacy Script Carryover (No Contaminated Templates):** Never copy, clone, or adapt previous terminal test runner scripts without completely sanitizing and purging all legacy notes, thesis hints, old portfolio weights, and company-specific comments. Every test runner script must be built from a clean, sanitized template where `notes: ""` by default.
   - **Strict Portfolio Parameter Isolation:** Portfolio parameters (`holdsPosition`, `currentWeight`, `entryPrice`) must strictly reflect the user's explicit numeric inputs without qualitative or narrative embellishments.
11. **Authoritative Verbatim Transcript Pipeline (TIKR Default with Stock Analysis Fallback & Zero Search Fallback):**
    - **Tiered Dual-Source Architecture:** Earnings call transcripts are pulled primarily from **TIKR Terminal (S&P Capital IQ)** by default, which indexes verbatim dialogue significantly faster post-call. If TIKR has not indexed the call or returns unauth for older historical calls, the pipeline automatically falls back to **Stock Analysis** (`stockanalysis.com`).
    - **User-Selectable Provider:** The UI provides an explicit provider toggle: `Auto (TIKR ➔ Stock Analysis)` (default), `TIKR Only (Capital IQ)`, or `Stock Analysis Only`.
    - **Algolia Directory Resolution & Safety Disambiguation Gate:** TIKR company identification resolves via Algolia (`tikr-terminal-v1`), prioritizing `primaryflag === 3` (primary home exchange listing). A strict multi-tier safety gate (`calculateNameSimilarity`) validates candidate company names against the canonical SEC CIK / FMP profile (>= 40% word overlap required), permanently eliminating cross-market ticker collisions (e.g. Mexican BMV or European listings sharing the same ticker symbol).
    - **URL Path Integrity:** Transcript URLs must strictly target `/stocks/{ticker}/transcripts/` without extraneous `/financials/` segments.
    - **Numeric Slug Collision Guard:** Regular expression matching for two-digit years must require delimiter boundaries (`-${yrShort}-`, `-${yrShort}$`, or space boundaries) to prevent collisions with internal CMS database keys.
    - **Zero Web Search Fallbacks:** Generative Google Search and Gemini web search grounding fallbacks are permanently disabled across all transcript ingestion endpoints (`executeTranscriptIngest`). If neither provider has verbatim dialogue ready yet, the engine cleanly returns `{ success: false, notFound: true, notReady: true }` with an unmissable alert modal and direct links to both TIKR and Stock Analysis, rather than attempting to synthesize a transcript from secondary web summaries or news articles.
    - **Dual-Mode Stock Analysis Extraction:** When fallback to Stock Analysis is active, the scraper (`parseStockAnalysisTranscriptHtml`) extracts both server-rendered DOM speaker blocks and SvelteKit serialized script payloads (`fullTranscriptBody` and `summaryLongHtml`).
    - **Audio Stub Rejection:** Any transcript outputting `< 2,500` characters or `< 3` speaker sections is strictly rejected as an audio-only stub or pending publication.
12. **Pre-Flight File Substance Tripwire Safeguard (Guard 3):**
    - **Substance Check Before Run:** In `handleRunSteps` and `/api/session/step/run`, all staged documents must pass a rigorous substance audit (`auditFilesSubstance`) before an analytical run can proceed:
      - **Earnings Call Transcripts:** Minimum 1,000 tokens (or >= 10 KB). A full call is typically 4,000–12,000 tokens. Flag anything under 1,000 tokens as a preview stub or truncated dialogue.
      - **Form 10-K / 20-F / 40-F:** Minimum 2,000 tokens (or >= 30 KB). Prevents running with cover-only or truncated filings.
      - **Form 10-Q / 6-K:** Minimum 2,000 tokens (or >= 20 KB), unless covered by Form 8-K interim release.
      - **DEF 14A Proxy Statements:** Minimum 2,000 tokens. Prioritize official `DEF 14A` first to prevent downloading 1-page `DEFA14A` postcard notices.
      - **Financials TTM CSV:** Minimum 100 tokens and at least 5 rows.
    - **Blocking UI Modal (`FileSubstanceModal`):** If any staged document is flagged as truncated or incomplete, execution is paused and a blocking modal opens displaying the exact file, token count vs expected minimum, and diagnosis. Requires explicit user action to either **Cancel Run & Fix Documents** (default) or **Override & Proceed Anyway**.
    - **Repository & Checklist Badging:** Any file failing substance criteria displays an unmissable amber `⚠️ TRUNCATED / SMALL` badge in the Document Repository table and Checklist.
13. **Pre-Flight Competitor Radar Ingest, Safeguard Audit & Verification Protocol:**
    - **Mandatory Pre-Flight Audit Check:** `Competitor Radar` is registered in `REQUIREMENT_RULES` (`server.ts` and `runAuditLocally` in `src/App.tsx`). Attempting to launch an evaluation without harvesting competitor intelligence triggers `MissingDocumentsModal` with a 1-click `Harvest Competitor Radar` button.
    - **Supplementary Context Recognition:** `documentGuard.ts` recognizes `${cleanTicker}_Competitor_Radar.md` as verified context (`companyMatch: "MATCH"`, `periodMatch: "MATCH"`, exempt from filing period mismatch warnings) and attaches it to `docs.all`.
    - **DEF 14A Proxy Date Tolerance:** Form DEF 14A proxy statements share the same annual `[-1, +1]` calendar year window tolerance as Form 10-K filings.
    - **Deterministic FMP Grounding & Acronym Defense:** Pre-flight peer harvesting resolves names via FMP `/stable/search-name` and validates symbols via `/stable/profile`, strictly rejecting closed-end funds (e.g. `PEO`), ETFs, non-trading symbols, and SEC compensation acronyms (`CAP`, `NEO`, `RSU`).
14. **Agent Zero-Override Mandate & Pre-Flight Period Alignment (The KNSL Invariant):**
    - **Preservation of Terminal Confirmation Agency:** The terminal engine natively detects document mismatches and raises a confirmation prompt (`requiresIntegrityConfirmation: true`). This human confirmation modal is strictly preserved to permit legitimate Interim Earnings Releases (where Form 8-K or Transcript is 1 sequential quarter ahead of Form 10-Q).
    - **Strict Prohibition of Autonomous Agent Bypasses:** AI agents and automated execution scripts are strictly forbidden from passing `overrideIntegrityCheck: true` or `overrideMissingFiles: true` on their own. The agent must never autonomously click through or silence an integrity alarm.
    - **Exact Period CSV Matching & Live Fallback:** Staging scripts must require exact period matching for financial statement CSVs (`${cleanTicker} ${targetPeriod} - Financials-TTM.csv`). Blind wildcard matching of cached CSVs without period verification is strictly prohibited. If a target-period CSV is not available locally, the agent must invoke `POST /api/ingest/fmp-financials` to compile it dynamically.
    - **Mandatory Pre-Flight Manifest Roll Call:** Before initiating any evaluation, the agent must output a structured Pre-Flight Document Roll Call table in chat verifying the reporting periods of the CSV, 10-Q, 10-K, and Transcript.
    - **Interim Release vs. True Mismatch Disambiguation:**
      - *Legitimate Interim Release:* Form 10-Q is Q(t), CSV is Q(t), and Form 8-K / Transcript is Q(t+1). The agent alerts the user and asks for human confirmation to run an interim release valuation.
      - *Accidental Staging Mismatch:* Form 10-Q is already filed for Q(t+1), but the staged CSV is lagged at Q(t). This is NEVER an interim release; it is a staging lag. The agent must halt, pull the matching Q(t+1) CSV, and never proceed with out-of-sync filings.
    - **Self-Healing Purge & Re-Try on Mismatch (The Transient Hiccup Protocol):**
      If an integrity mismatch or staging warning is encountered, the agent must not immediately abort or blindly override. Instead, execute a 1-time automated clean purge and re-try:
      1. Trigger `POST /api/session/purge-mismatches` (or `POST /api/session/purge-all`) to clear lingering session artifacts or cross-ticker residue.
      2. Re-stage the target company's authoritative documents cleanly.
      3. Re-run `runAudit`.
      If the second audit passes with 0 mismatches, proceed normally (resolving transient session hiccups). Only if the mismatch persists on the second attempt does the agent halt and request human confirmation.
    - **Asynchronous Overnight Queue & Deferral Protocol (Non-Blocking Quarantine Queue):**
      When executing unattended multi-company portfolio or batch queues (e.g. overnight runs):
      1. *Strike 1 (Session Flush):* If an integrity mismatch or missing document is flagged, trigger `POST /api/session/purge-mismatches`, re-stage, and re-audit.
      2. *Strike 2 (Cooldown & Fresh Re-Fetch):* If Strike 1 fails, pause for 20–30s to allow API/rate-limit cooldowns, perform a fresh re-fetch/hard-reset, and re-audit.
      3. *Non-Blocking Queue Rotation:* If Strike 2 fails and the user is unavailable to confirm in real-time, the agent must NOT stall the entire batch. Instead, demote the problematic company to the end of the line (`Deferred Queue`), log the manifest in chat/telemetry, and immediately proceed to the next company in the queue.
      4. *End-of-Queue Final Sweep & Morning Debrief:* Once all healthy companies finish, re-examine deferred targets. If still unresolved, park them as `QUARANTINED (Pending Human Approval)` and generate a clean morning summary separating completed vs. quarantined positions.

15. **Form DEF 14A Shareholder Proposal Truncation (Anti-Prompt-Block Invariant):**
    - **Methodology Boundary:** In value investing analysis (Part 1 Section 2.9 Governance & Executive Compensation), Form DEF 14A is used strictly for Board Composition, Corporate Governance, and Executive Compensation audits (CD&A, bonus & equity performance metrics, ROIC hurdles, beneficial ownership, and clawbacks).
    - **Gemini Safety Filter Sensitivity:** Non-binding activist shareholder proposals (typically Proposals 4/5 through 15+) regularly quote politically sensitive election controversies, contentious external think-tank reports, and partisan advocacy URLs. When ingested into Google Gemini API, these external political quotes trigger an automated, non-configurable prompt block: `Gemini API Prompt Blocked: blockReason = OTHER` (which cannot be bypassed via `safetySettings` or `BLOCK_NONE`).
    - **Mandatory Truncation Guard:** `cleanSecHtmlToMarkdown()` in `server.ts` and `server.cloud.ts` must strictly truncate Form DEF 14A at the onset of non-binding shareholder proposals or administrative matters:
      `\n(?:#+\s*)?(?:Proposal\s*(?:Number\s*)?[4-9]:\s*(?:Shareholder|Stockholder)\s*Proposal|STOCKHOLDER\s+PROPOSALS|SHAREHOLDER\s+PROPOSALS|PROPOSALS\s+SUBMITTED\s+BY\s+(?:STOCKHOLDERS|SHAREHOLDERS)|OTHER\s+MATTERS|APPENDIX\s+[A-Z]|ANNEX\s+[A-Z]|FORM\s+OF\s+PROXY|HOUSEHOLDING)\b`
    - This strips tens of thousands of tokens of non-fiduciary bloat, prevents prompt blocks, and preserves 100% of executive compensation, director election, and corporate governance tables.

---

## References & Checklists
- Detailed filing breakdown: [`references/filing_requirements.md`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/.agents/skills/financial-ingest-guard/references/filing_requirements.md)


- Transcript Ingestion Protocol: [`references/transcript_ingestion_protocol.md`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/.agents/skills/financial-ingest-guard/references/transcript_ingestion_protocol.md)
