# VALUE INVESTING TERMINAL: COMPREHENSIVE REPOSITORY & PROMPTS AUDIT BUNDLE

> **Target Auditor:** Gemini 4  
> **Generation Date:** 2026-11-08T16:01:04.710Z  
> **Repository:** `c:/Users/Ronald/antigravity/Value-Investing-Terminal`  
> **Scope:** Full-Auto 11+1 Valuation Pipeline, Master Prompts, Execution Engine, Formatting Guard & Ingestion Defense.

---

# TABLE OF CONTENTS
1. [Section 0: Master Auditor Directive & Rubric](#section-0-master-auditor-directive--rubric)
2. [Section 1: Ground Truth Methodology & Living Rules](#section-1-ground-truth-methodology--living-rules)
   - 1.1 GEMINI.md (Core Directives & Inviolable Laws)
   - 1.2 terminal_methodology_snapshot.md (Canonical Pipeline Snapshot)
   - 1.3 DOSSIER_FORMAT_SPEC.md (Institutional Formatting Specification)
   - 1.4 system_instructions.txt (Gemini API System Instruction)
   - 1.5 src/types.ts (Data Models & Contract Definitions)
3. [Section 2: The Canonical 11+1 Master Valuation Prompts](#section-2-the-canonical-111-master-valuation-prompts)
   - Complete prompts source (`src/prompts.ts`)
4. [Section 3: Backend Execution Engine & Orchestrator](#section-3-backend-execution-engine--orchestrator)
   - Core API server & pipeline runner (`server.ts`)
5. [Section 4: Format Guard, Parser Resilience & Visualizers](#section-4-format-guard-parser-resilience--visualizers)
   - Dossier Format Guard (`src/utils/dossierFormatGuard.ts`)
6. [Section 5: Ingestion Defenses & Currency Harmonization](#section-5-ingestion-defenses--currency-harmonization)
   - Document Guard (`src/documentGuard.ts`)
   - Currency Guard (`src/currencyGuard.ts`)
7. [Section 6: Verification Harness & Invariance Gates](#section-6-verification-harness--invariance-gates)
   - Engine Prompt Verification Gates (`scripts/test_engine_prompts.ts`)

---

# SECTION 0: MASTER AUDITOR DIRECTIVE & RUBRIC

# Institutional Audit Directive: Value Investing Terminal & Canonical Prompts

**Target Model:** Gemini 4  
**Audit Role:** Senior Principal AI Systems Architect & Managing Director of Buy-Side Equity Research  
**Objective:** Perform a rigorous, audit-grade evaluation of the complete terminal codebase, valuation prompts, parser invariance guards, and document ingestion pipeline.

---

## 1. System Overview & Core Directives

The **Value Investing Terminal** is an institutional-grade, full-auto valuation platform. It analyzes equity filings (SEC 10-K, 10-Q, 8-K, DEF 14A, earnings call transcripts, and 10-period financial CSV datasets) through a unified **11 Master Prompts + Step 12 Crosscheck** sequential pipeline.

### Core Institutional Philosophy (Ground Truth):
1. **Micro-Primacy & Cash-Flow Sovereignty:** Zero generic macro forecasting or interest rate speculation. Valuation is anchored in empirical unit economics, balance sheet defense, and organic cash flows.
2. **Buffett-Munger-Greenwald Valuation Triad:**
   * **100% Probability-Weighted Expected DCF:** Baseline intrinsic valuation driven by historical compounding realities, dynamic reinvestment rates (RORC), and a strict **10% static hurdle rate**.
   * **Zero-Growth EPV Floor (Earnings Power Value):** Pure reproduction cost of operational assets and normalized zero-growth operating earnings, acting as an uncompromising margin-of-safety floor.
   * **Elimination of Academic Bloat:** CAPM, beta, subjective WACC, and creator/professor names in titles/headers are permanently eliminated.
3. **Never-Trim Coffee-Can Compounding Doctrine:**
   * Permissible portfolio allocation actions are strictly **`HOLD`**, **`ACCUMULATE`**, or **`LIQUIDATE`** (`TRIM` and `MAINTAIN` are permanently banned).
   * High-conviction compounders are held indefinitely as long as moat, unit economics, and management integrity remain intact.
4. **Bimodal Voice Architecture:**
   * **Strategic & Moat Voice (Parts 1, 2, 4, 7, 8, 9, 11):** Nuanced qualitative depth, competitive moats, customer captivity, scale economics, and capital allocation philosophy.
   * **Forensic & Defense Voice (80% ASD-STE100 in Step 12, Part 10, Part 5, Part 3 Cash Flow Integrity):** Simplified Technical English. Active voice only, one verb per sentence, maximum 20-25 words per sentence, zero corporate euphemisms, strict `[Metric] is [Value]. [Finding: PASS / FLAG / BREACH]` assertions.
5. **The 5 Inviolable Formatting Laws (Enforced via dossierFormatGuard.ts):**
   * **Law 1: Zero Raw LaTeX Math** (plain-text markdown math only).
   * **Law 2: Zero ASCII / Monospace Typewriter Tables / Sliders / Box Characters** (clean GFM pipe tables only).
   * **Law 3: Numbered Compounding Architecture, Zero Premature Flywheels, Dual Visualizer Parity & Mandatory Falsification Audit** (clean stages 1 to 5; Section 1.7 explicitly falsifies linear commodity chains; dual Mermaid/SVG rendering).
   * **Law 4: Dual-Format Delivery Contract** (Obsidian Markdown with 11-13 line-1 YAML frontmatter keys + standalone HTML with cockpit extraction).
   * **Law 5: Parser & Numeric Invariance** (Clean stripping of bold negatives like `**($19.00)**`, trend series disambiguation, and audit badge column invariance).

---

## 2. Six-Dimension Audit Rubric

Please conduct your audit systematically across the following six dimensions:

### Dimension 1: Valuation Methodology & Mathematical Rigor
* Scrutinize the mathematical integrity of the prompts and calculations (Parts 3, 5, 6, 7, 8).
* Verify whether the 10% hurdle rate, normalized Owner Earnings formulas, EPV reproduction cost adjustments, and Market-Implied Reverse DCF expectations are logically airtight.
* Identify any remaining subtle theoretical contradictions, potential double-counting, or circular reasoning.

### Dimension 2: Prompt Engineering & Bimodal Voice Enforceability
* Review the canonical 11 Master Prompts + Step 12 Crosscheck in detail.
* Assess prompt clarity, instructional strength, and resistance to LLM hallucination or drift.
* Evaluate whether the prompt constraints properly enforce the distinction between the Strategic Moat Voice and the ASD-STE100 Forensic Defense Voice.

### Dimension 3: Formatting Invariance & Output Contracts
* Audit the output templates, GFM table schemas, YAML frontmatter keys, and visualizer generation logic.
* Check if there are ambiguities in the prompt instructions that could tempt an LLM to violate the 5 Inviolable Formatting Laws (e.g. emitting raw LaTeX, ASCII borders, premature flywheels in Part 1/2, or unclosed table rows).

### Dimension 4: Backend Execution Engine & Orchestration (`server.ts`)
* Review the execution flow: dynamic prompt injection, streaming handling, token usage telemetry, Gemini model fallback logic, and rate-limit backoff.
* Audit the clean ticker isolation guarantee (`enforceCleanTickerEnvironment`) to verify that zero residual data, filings, competitor radars, or session logs can ever leak between tickers.

### Dimension 5: Parser & Format Guard Resilience (`dossierFormatGuard.ts`)
* Scrutinize the regular expressions, regex lookaheads, numeric parsers (`parseNumeric`, `parseNumericValue`), and HTML sanitizers.
* Identify potential parser breakages (e.g., negative accounting brackets, bolded numbers, foreign currency symbols, multi-sentence audit verdicts, complex markdown tables).

### Dimension 6: Ingestion & Document Harmonization (`documentGuard.ts`, `currencyGuard.ts`)
* Audit the roll-call verification for 10-Ks, 10-Qs, 8-Ks, DEF 14As, earnings call transcripts, and 10-period CSV financials.
* Check ADR currency conversion mechanics and defense against unit mismatches or missing period fields.

---

## 3. Required Deliverable Structure

Please deliver your audit report organized into the following sections:

1. **Executive Verdict & Institutional Scorecard:**
   * A table rating each of the 6 dimensions on a 1–10 scale, with clear audit verdicts (PASS / PASS WITH RECOMMENDATIONS / DEFICIENT).
2. **Top 5 High-Impact Vulnerabilities / Blind Spots:**
   * Specific flaws, edge-case risks, or logical gaps ranked by severity (Critical, High, Medium).
3. **Prompt-by-Prompt Audit & Optimization Recommendations:**
   * Line-by-line or section-by-section audit of Part 1 through Part 11 + Step 12 Crosscheck, highlighting exact sentences to refine, strengthen, or eliminate.
4. **Code Engine & Format Guard Edge-Case Analysis:**
   * Concrete code-level observations in `server.ts` and `dossierFormatGuard.ts` (e.g., regex failure cases, unhandled promises, state mutations).
5. **Concrete Action Plan:**
   * Step-by-step prioritized improvements to take the terminal to absolute institutional perfection.


---

# SECTION 1: GROUND TRUTH METHODOLOGY & LIVING RULES

## 1.1 GEMINI.md (Core Directives & Inviolable Laws)
```markdown
# Value Investing Terminal Rules

## Core Terminal Directive
- **Default Terminal:** All references to "the terminal" or "the Value Investing Terminal" strictly refer to this repository: `c:\Users\Ronald\antigravity\Value-Investing-Terminal`.
- **Legacy Deprecation:** The repository at `G:\My Drive\Company Data\GTD_terminal` is legacy and outdated. Never use files, scripts, or configurations from `GTD_terminal` unless the user explicitly asks for "Legacy GTD_Terminal".
- **Source of Truth:** All prompts, system instructions, document ingestion routines, and batch execution runners must strictly originate from `c:\Users\Ronald\antigravity\Value-Investing-Terminal`.

- **Port:** Default Port `3001` (Isolated from production terminal on port `3000`).
- **Repository Isolation:** Work in `Value-Investing-Terminal-V8` at `/home/antigravity/repos/terminal-v8` on port 3001. The production repository `Value-Investing-Terminal-App` (port 3000) is 100% frozen and untouched.

## Multi-Mode Terminal Architecture
The terminal supports 3 specialized operating modes configured via `sessionMode`:
1. **Mode 1 — Slingshot Triage (`sessionMode: 'slingshot'`):**
   - Single-turn institutional underwriting triage memo executed across 6 Indispensable Pillars and 4 Cash Integrity Vectors.
   - Dynamic Red Queen R&D Capitalization spectrum (`0% | 50% | 75%`).
   - Suggested Action Directive: strictly `INVEST / PASS / ESCALATE TO FULL MODE` for prospective positions (`HOLD / ACCUMULATE / LIQUIDATE` for existing holdings; `TRIM` permanently banned).
   - 1-Click Warm-Cache Escalation: Clicking `[🏛️ Escalate to Full Dossier]` preserves staged files and Gemini file handles (`geminiUri`), purges conversation history to eliminate cognitive anchoring, and switches to Mode 2 to immediately hit the warm Gemini KV prefix cache.
2. **Mode 2 — Full Institutional Dossier (`sessionMode: 'full'`):**
   - Canonical 11 Master Prompts + Step 12 Forensic Crosscheck (`Gates 0–4`).
   - 100% tool-free closed-universe pipeline preserving byte-for-byte KV prefix cache invariance.
   - Out-of-band Python valuation stream executed asynchronously and synthesized double-blind.
3. **Mode 3 — Quarterly Position Sentinel (`sessionMode: 'sentinel'`):**
   - 90-day holding pulse monitoring active positions.
   - 4-Way Prior Dossier ingestion triad (discovers previous complete dossier or Slingshot memo).
   - 40Q historical financials refreshed with latest quarter; YoY and Q/Q operational delta extraction.
   - Grades the 5 monitoring metrics defined in Part 11 of the Prior Dossier.
   - Enforces Universal Transitory vs. Structural Standard (Snowstorm Protocol) and Deliberate Strategic Reinvestment Protocol (MELI Doctrine).
   - Evaluates 4 Isolation Gates: 1. Moat Breach, 2. Capital Allocation Malpractice, 3. Deteriorating Runway / Disruption, 4. Chronic Value Destruction.
   - Suggested Action Directive: strictly `HOLD / ACCUMULATE / LIQUIDATE`.

## Core Valuation Engine & Bolsa 6.0 10-Yr Cash Multiple
- **Universal Trailing 3-Year Baseline (`OE_0`):** Every forward DCF and Bolsa valuation in all modes anchors starting owner earnings to the trailing 3-year average (`(OE_{t-2} + OE_{t-1} + OE_t) / 3`) with 100% of SBC expensed as cash and 2-step empirical Maintenance CapEx applied.
- **Pure Tri-Horizon Growth Average:** Growth rate is calculated strictly as `(Var_3Y + Var_5Y + Var_7Y) / 3`, capped at `15%` standard or `20%` for verified high-growers (`ROIC > 20%` and `3Y Rev CAGR > 20%`).
- **Bolsa 6.0 10-Yr Cash Multiple Formula:**
  $$\text{Bolsa Multiple} = \frac{\text{Market Cap}}{\sum_{t=1}^{10} \text{PV of } OE_t \text{ at } 10.00\% \text{ Hurdle}}$$
  Zero constant or terminal/residual value is credited in the denominator. Hurdle benchmark is `Market Cap / PV_10 <= 0.70x` (~30%+ Margin of Safety). Redundant "Cash Coverage %" row is permanently eliminated.
- **Dynamic R&D Spectrum (`0% | 50% | 75%`):** Tech/software companies are classified on an empirical spectrum: `0%` (mature/defense maintenance), `50%` (standard growth), or `75%` (aggressive expansionary growth). Net capitalized R&D must deduct 5-year straight-line amortization drag (`Amortization = Gross Capitalized R&D / 5`).
- **Share-Cannibal Negative Equity Guard:** Companies with negative accounting book value resulting from disciplined historical share repurchases (`BKNG` pattern, cumulative repurchases > net equity deficit) are recognized as fortress capital allocators, not distressed credits.
- **Negative-WC Float Model:** Companies operating with customer float and negative working capital credit the structural float advantage without penalizing short-term liquidity ratios.

## Hardcore Anti-Anchoring Firewall (Gate 14)
- **Zero Python Numbers in LLM Pre-Flight Context:** Zero forward DCF numbers, intrinsic value calculations, or Bolsa 6.0 multiples from Python Stream 1 ever enter Gemini prompt context or `state.files`. The LLM derives intrinsic value and margin of safety 100% independently from filings and master prompts.
- **Post-Execution Double-Blind Synthesis:** The Double-Blind Dual-Valuation Synthesis comparison table (`Part 13`) is generated out-of-band and appended to the final dossier only after all analytical steps are completed.

## Telegram Notification Standard
- **Zero Build-Time Noise:** Zero Telegram alerts during local compilation, manual testing, or code modification.
- **Standardized Runtime Telemetry (Modes 1, 2, 3):**
  1. *Start Alert (`session_start`):* Dispatched when Mode 1, 2, or 3 begins execution.
  2. *Cooldown / Auto-Resume Alert:* Dispatched on Attempt 1 if Google Flex Tier experiences transient saturation, and recovery alert dispatched on success.
  3. *Completion Alert (`single_complete`):* Dispatched upon final step completion with mode-specific title, intrinsic value, margin of safety, definitive suggested action, Bolsa 6.0 10-Yr cash multiple, divergence status, and dual file attachments (`.md` and `.html`).
  - **No Generic Macro / Howard Marks Market Temperature:** The 21-pair macro survey is permanently eliminated under the **Micro-Primacy Directive** (Part 7 is DCF Models & Market-Implied Reverse DCF, not macro forecasting).
  - **No Legacy 12+1, 15/16-Part Numbering:** Part titles must strictly match the 11+1 canonical pipeline.
  - **Zero Deprecated Sampling Parameters (`temperature`, `top_p`, `top_k`, `thinking_budget`):** In accordance with Google Gemini API deprecation standards, custom sampling parameters (`temperature`, `top_p`, `top_k`) and legacy `thinking_budget` are permanently eliminated from all Gemini API payloads. All pipeline steps enforce `thinking_level: "high"` (via `thinkingConfig: { thinkingLevel: 'high' }`), ensuring deep dynamic reasoning across all valuation, forensics, and crosscheck phases. Local Ollama parameters remain isolated to local models.
  - **Zero TRIM Directives (Never-Trim Compounding Doctrine & Archetype Eligibility Gate):** In accordance with the user's core institutional doctrine ("Coffee-Can Compounding") backed by Thomas Phelps, Christopher Mayer, Philip Fisher, Charlie Munger, and Warren Buffett, `TRIM` is permanently eliminated across the entire terminal. When evaluating existing holdings (`holdsPosition: true`), permissible portfolio allocation actions are strictly **`HOLD`**, **`ACCUMULATE`**, or **`LIQUIDATE`** (`TRIM` is strictly banned). We hold high-conviction compounders (verified Fast Growers, Wide-Moat Stalwarts, and Cyclical Compounders) indefinitely regardless of multiple expansion, position size (even past 20%–30%+ of portfolio equity), or cyclical margin troughs, as long as the fundamental moat, unit economics, and management integrity remain intact. A position is ONLY liquidated if it fails the mandatory 4-Gate Peer-Relative Isolation Diagnostic (structural moat decay, capital destruction/forensic breach, or thesis invalidation/category drift). Pure Commodity Cyclicals, Turnarounds, Slow Growers, and Asset Plays follow category-specific exit discipline (cycle peaks or fair-value convergence). If any model outputs legacy `TRIM` or `MAINTAIN`, output parsers and format guards unconditionally normalize them to `HOLD`.
  - **Charlie Munger Zero-EBITDA Doctrine:** In accordance with Charlie Munger's core doctrine, EBITDA and Adjusted EBITDA are permanently eliminated as valid measures of cash flow, operating earnings, or leverage across the entire terminal. Depreciation is real wear-and-tear, interest and taxes are unavoidable cash claims, and stock-based compensation is real economic dilution. All cash flow integrity audits, REIT leverage ratios (Net Debt to AFFO or NOI), and executive compensation audits strictly reject EBITDA.
  - **Elimination of Brittle Academic Accounting Tripwires:** Brittle single-period academic ratios (DSO, AR Divergence Index, DPO, Sloan NOA Accruals, Beneish M-Score, Greenwald revenue-delta Maintenance CapEx) are permanently eliminated. They mechanically generate false fraud alarms during commodity price drops, seasonal inventory cycles, or cash-funded PP&E/M&A investments. Replaced with the **4-Vector Buy-Side Cash Integrity Protocol (3-Year Rolling Window)** and the **2-Step Empirical Maintenance CapEx Protocol**.
  - **Strict Prohibition of Sunk-Cost Bias (Gate 4):** Forward intrinsic value is evaluated strictly against current market price. Comparing forward intrinsic value against the user's historical purchase price (`user_cost_basis`) to justify `LIQUIDATE` is strictly forbidden. A price drawdown below historical purchase cost is an unrecoverable sunk cost and never constitutes thesis invalidation.
  - **Fortress Balance Sheet & Cyclical Trough Protection:** Existing holdings with net cash or zero funded debt that maintain customer captivity and trough-to-trough operational escalation cannot be liquidated at cyclical commodity troughs. The Senior Value Investor possesses full institutional authority to issue `HOLD` (or `ACCUMULATE`) through the trough.
  - **Confirmed Legal Contingency Boundary:** Speculative, early-stage class-action lawsuits or uncertified complaint prayers are strictly forbidden from being deducted as funded debt in the equity bridge. Deduct only confirmed judicial judgments, posted appeal bonds, signed settlements, or GAAP-probable balance-sheet reserves (ASC 450). Track unquantified litigation qualitatively.
  - **The Frictional Cost Rule (International Account / 0% Capital Gains Tax):** The user operates exclusively within a tax-exempt international brokerage account where capital gains are **never taxed (0% capital gains tax rate)**. Models, prompts, and evaluation reports are **strictly forbidden from citing capital gains taxes, tax drag, taxable events, or tax liabilities** as a penalty, friction, or justification for holding or refusing to trim. Portfolio allocation directives and the Never-Trim Compounding Doctrine must be justified purely on fundamental microeconomic grounds: business quality, competitive moat durability, ROIC, reinvestment runway, unit economics, opportunity cost, and downside valuation protection.
- **Buy-Side Desk Nomenclature Mandate (Zero Academic Citations):**
  - Output files and prompts represent an institutional buy-side desk's audited valuation framework, NOT an academic lecture.
  - Drop all creator/professor/textbook names in titles, headers, and prose:
    - *Greenwald EPV* ➔ **Earnings Power Value (EPV)** or **Zero-Growth EPV Floor**.
    - *Academic Accruals / M-Score / DSO / DPO* ➔ Permanently replaced by the **4-Vector Buy-Side Cash Integrity Protocol (3-Year Rolling Window)**.
    - *Graham-Buffett-Greenwald Framework* ➔ **Cash-Flow Sovereign Valuation Framework** (Zero-Growth EPV Floor + Probabilistic Expected DCF).
    - *Greenwald Revenue-Delta Maintenance CapEx* ➔ Permanently replaced by the **2-Step Empirical Maintenance CapEx Protocol** (`1.0x–1.1x D&A` or management disclosure).
    - *Mauboussin / Rappaport Reverse DCF* ➔ **Market-Implied Expectations Reverse DCF**.
    - *Schilit / O'glove Forensic Shenanigans* ➔ **Forensic Accounting & Earnings Quality Audit**.
    - *Thorndike Capital Allocation / Buybacks* ➔ **Capital Allocation & Share Repurchase Discipline**.
    - *Bill Gurley / Hamilton Helmer Moat Scorecard* ➔ **Platform Network Effects & Structural Moat Scorecard**.
- **Valuation Invariance & Free-Growth Defense:**
  - *50/30/20 Recency Weighting & 5-Year Rolling $1 Value Test:* Anchor longitudinal growth rates, RORC, and Sustainable NOPAT to `50% 3-Yr / 30% 5-Yr / 20% 10-Yr` recency weighting, and evaluate the Buffett `$1` Test over a 5-year rolling window including cumulative cash dividends paid (`(ΔMarket Cap + ∑Dividends) / ∑Retained Earnings >= 1.00x`).
  - *Free-Growth DCF Trap Elimination:* Distributable Free Cash Flow in Part 7 multi-year DCFs must deduct the capital investment required to achieve projected growth: `FCF = Sustainable NOPAT * (1 - Reinvestment Rate)`, where `Reinvestment Rate = Projected Growth / Marginal ROIIC`. Growth without reinvestment is strictly forbidden.
  - *R&D Amortization Drag:* When capitalizing R&D in Part 3 and Part 7, distributable cash flows must deduct ongoing amortization of prior capitalized R&D rather than adding gross Growth R&D.
  - *Operating Contract & Debt Bridge Boundary (No Double-Counting):* Operational purchase obligations (cloud hosting compute, software subscriptions, dedicated freight charters) and unvested multi-year executive retention compensation (LTRP) represent ongoing operating costs funded by future revenues. Prohibit deducting them as funded debt in the Equity Bridge (Parts 5, 6, 7). Similarly, never deduct SaaS Deferred/Unearned Revenue as funded debt.
  - *Fintech CECL Normalization:* In growing fintech/lending operations under US GAAP (ASC 326 / CECL), Day-1 provision builds are non-cash accounting growth reserves. Steady-state credit losses must equal trailing cash charge-offs plus a normalized net delinquency buffer, adding back 100% of excess upfront Day-1 CECL growth reserves to NOPAT/Owner Earnings. When deducting fintech funding debt in the debt bridge, credit the performing net loan portfolio asset it finances.
  - *Margin-Recovery Reinvestment Rate Defense:* When projected near-term NOPAT growth is driven by operating margin recovery from an operational or cyclical trough (operating leverage), cap the explicit reinvestment rate (20%–35%) rather than mechanically applying `Reinvestment Rate = g / ROIIC`. Profit expansion from margin normalization requires minimal incremental physical capital.
  - *Secular Compounder vs. Cyclical Standard (4-Point Disambiguation Test):* Ground Peter Lynch classification strictly in 3-to-10 year multi-year top-line, GMV, and physical volume trends. Prohibit tagging a company as "Cyclical" if 5-to-10 year revenue and volume compound at >= 20% CAGR and near-term margin compression is driven by deliberate reinvestment. Furthermore, protect disguised compounders in cyclical sectors (e.g. STLD, Nucor, CALM) via the 4-Point Cyclical Compounder Test using the `3-to-10 year recency-weighted window (50% 3-Yr / 30% 5-Yr / 20% 10-Yr)`: (1) Trough-to-trough EPS/BVPS escalation ("higher lows"), (2) Physical unit volume compounding decoupled from spot commodity prices, (3) Recency-weighted through-the-cycle ROIC > 10.0%, and (4) Countercyclical balance-sheet/buyback execution.
  - *Signed Margin of Safety Contract:* The definitive verdict table (Part 11, Step 4) must strictly output signed percentages (`+XX.XX%` for discount, `-XX.XX%` for premium/deficit).
  - *Epistemic Step Ordering & Anti-Hallucination Continuity Mandate:*
    - *Zero Forward-Reference Traps:* Earlier pipeline steps (e.g. Step 1 Section 2.9 Share Repurchase Audit) must never require comparing historical figures against valuation outputs computed in later steps (e.g. Step 7 Probabilistic Expected DCF). Step 1 evaluates buyback timing against empirical historical valuation multiples and share count contraction, while exact Expected DCF comparisons are cross-checked in Parts 8–12.
    - *Scoped Intermediate Verdict Gag Order (`buildPromptRequest`):* Intermediate steps (Steps 1–10) strictly prohibit issuing premature portfolio allocation directives (`INVEST`, `PASS`, `HOLD`, `ACCUMULATE`, `LIQUIDATE`) or final buy/sell recommendations, while explicitly requiring intermediate per-share valuation models in Steps 6, 7, 8, and 9.
    - *Conditional Red Queen `N/A` Continuity (Parts 7 & 8):* When Part 7 Part 3 (`Adjusted DCF - R&D Capitalized`) is skipped under the Red Queen Effect gate, Part 8 synthesis tables (`Step 1` & `Step 2`) must explicitly output `N/A` (`or N/A if skipped in Part 7`) rather than fabricating uncalculated per-share figures.
  - *Agent Zero-Override Mandate & Pre-Flight Period Alignment (The KNSL Invariant):* The terminal engine's human confirmation modal (`requiresIntegrityConfirmation: true`) is strictly preserved so the user can deliberately approve legitimate Interim Earnings Releases (where Form 8-K or Transcript is 1 sequential quarter ahead of Form 10-Q). AI agents and automated execution scripts are strictly forbidden from passing `overrideIntegrityCheck: true` autonomously. Exact period matching is required for financial CSVs (`${cleanTicker} ${targetPeriod} - Financials-TTM.csv`), with automated fallback to `POST /api/ingest/fmp-financials`. When Form 10-Q is already filed for the target quarter, a lagged prior-quarter CSV is an accidental staging mismatch and the agent must pull the matching CSV or halt rather than bypassing integrity checks. If an unexpected mismatch occurs, the agent executes a 1-time self-healing recovery: purge session residue (`POST /api/session/purge-mismatches` or `/api/session/purge-all`), re-stage authoritative documents, and re-run audit. If the second audit clears the transient hiccup, proceed; if the mismatch persists, halt and request human confirmation.
  - *Asynchronous Overnight Queue & Deferral Protocol (Non-Blocking Quarantine Queue):* During unattended multi-target batch and portfolio evaluations (e.g. overnight runs), encountering a persistent filing mismatch or staging blocker must never stall the entire queue. The runner executes a 2-strike self-healing verification (Strike 1: session purge & re-stage; Strike 2: 20-30s cooldown & fresh re-fetch). If Strike 2 fails and the user is unavailable to confirm in real-time, the runner demotes the blocked company to the end of the line (`Deferred Queue`), logs the diagnostic manifest, and immediately advances to the next position in the batch. Unresolved deferred companies are safely parked at the end of the run and summarized in the morning debrief.

  - *DEF 14A Shareholder Proposal Truncation & Gemini Prompt Block Defense:* Form DEF 14A proxy statements must strictly truncate before non-binding activist shareholder proposals (`STOCKHOLDER PROPOSALS`, `SHAREHOLDER PROPOSALS`, `Proposal [4-9]: Shareholder/Stockholder Proposal`). These external non-fiduciary petitions contain political advocacy and controversial URLs that trigger Gemini API prompt blockage (`blockReason = OTHER`). 100% of CD&A executive compensation, equity award tables, insider ownership, and governance must be preserved while non-binding petitions are cleanly stripped.

## Bimodal Voice Architecture Mandate
- **Strategic & Moat Voice (Parts 1, 2, 4, 7, 8, 9, 11):** Deep, nuanced, institutional economic reasoning emulating classical value investors. Rich qualitative depth, customer captivity, scale economics, multi-stage compounding flywheels, capital allocation philosophy, and probabilistic margin of safety synthesis.
- **Forensic & Defense Voice (80% ASD-STE100 in Step 12, Part 10, Part 5, Part 3 Cash Flow Integrity, and Governance/Capital Allocation Audits):** Simplified Technical English adapted for audit-grade clarity and ruthless balance-sheet defense:
  1. **Active Voice Only:** Strictly eliminate passive constructions.
  2. **One Verb Per Sentence:** Maximum 20-25 words per sentence; short, punchy declarative statements with a single primary verb clause.
  3. **Zero Corporate Euphemisms:** Strictly eliminate vague corporate fluff ('headwinds', 'tailwinds', 'softness', 'challenging macro', 'synergies', 'right-sizing', 'streamlining', 'transitory friction'). State empirical facts and exact numbers directly.
  4. **Strict Metric-to-Finding Assertions:** Assert every finding directly: [Metric] is [Value]. [Threshold / Benchmark] was [Value]. [Audit Finding: PASS / FLAG / BREACH].

## Strict Formatting Invariance Mandate (Zero Formatting Drift)
- **Authoritative Spec & Guard:** All dossier generation, parsing, and export logic must strictly adhere to `DOSSIER_FORMAT_SPEC.md` and be enforced through [`src/utils/dossierFormatGuard.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/utils/dossierFormatGuard.ts). Governed by the `.agents/skills/format-upgrade-guard` skill. Never alter prompt output structures or markdown templates without explicit instruction.
- **The 5 Inviolable Formatting Laws:**
  1. **Zero Raw LaTeX Math:** Strictly forbidden from outputting LaTeX/TeX syntax (`\begin{aligned}`, `$$...$$`, `\mathbf{...}`, `\text{...}`, `\frac{...}{...}`). All valuation math, reconciliations, and formulas must be clean, plain-text markdown or bullet points.
  2. **Zero ASCII / Monospace Typewriter Tables / Code-Fenced Prose / Text Progress Bars / Sliders / Box Characters:** Strictly forbidden from outputting ASCII borders (`====`, `----`), typewriter boxes, plus corners (`+----+`), Unicode box lines (`│`, `┌`, `└`), typewriter sliders (`$0.00 ─── [$X] ───>`), ASCII arrows (`──>`), enclosing tables/prose in monospace code blocks (```), or generating text-based progress bars / hash bars (`[#####]`, `[###]`). ALL tables, segment breakdowns, market shares, credit portfolio integrity audits, and trajectory series MUST be standard GitHub-Flavored Markdown (GFM) pipe tables (`| Header | Header |` followed by `| :--- | :---: |`) or clean markdown bullet points. Piped bullet items (`* **PEER** | Col | ...`) are strictly forbidden. Pseudo-table title rows (`| TITLE |`) and missing separator lines (`| --- |`) are strictly normalized to guarantee native Obsidian table rendering.
     - **Tree Branch & Divider Invariance:** Programmatic format guards (`dossierFormatGuard.ts`) unconditionally normalize bullet-prefixed tree characters (`* ├─`, `* ├──`, `* └─`, `* └──`) into clean indented sub-bullet lists (`  * **Key:** Value`), convert inline directional arrows (`──>`) into clean Unicode arrows (`➔`), and unconditionally strip all box-drawing divider lines (including `┤`, `├`, `┬`, `┴`, `┼`).
     - **Mandatory 5 Standard Table Schemas:**
       - *Competitor Moat & Valuation Radar (Part 2, Sec 1.4):* 7 columns (`| Competitor / Peer | Gross Margin | Operating Margin | ROIC | EV / True FCF | EV / Owner Earnings | Net Cash / Mkt Cap |`).
       - *DCF Scenarios & Projections (Part 7, Sec 2):* 4 columns (`| Valuation Scenario | Probability Weight | Per Diluted Share Value | Implied MoS vs. Market Tape |`).
       - *Lynch Category Continuum (Part 9, Sec 1.1):* 3 columns (`| Peter Lynch Archetype | Classification Status | Empirical Operational Validation |`).
       - *Target Buy Price Bands (Part 9, Sec 1.4):* 4 columns (`| Target Buy Price Band | Price Range ($) | Margin of Safety Discount | Allocation Directive |`).
       - *Definitive Investment Verdict (Part 11, Step 4):* 2 columns (`| Decision Parameter | Audited Portfolio Verdict |`).
       - *Symmetrical Balance Sheet Synthesis (Part 5, Sec 2):* 3 columns (`| Off-Balance-Sheet Vector | Valuation Spread ($M) | Balance Sheet Impact |`).
       - *Step 12 Gate 4 Arithmetic Proof Scratchpad (Part 12, Sec 2):* 5 columns (`| Mathematical Vector | Report Claimed Value | Independent Recalculation | Delta / Variance | Audit Verdict (PASS / BREACH) |`).
       - *Chapter Preamble Normalization:* Unprompted typewriter preamble boxes are strictly eliminated in Parts 2, 3, 7, and 8 via prompt directives. If an LLM generates a chapter summary preamble, it must be normalized to standard 4 columns (`| Strategic Parameter | Audited Economic Anchor | Strategic Parameter | Audited Economic Anchor |`), with typewriter boxes and 4+ space indentations strictly eliminated.
     - **Table Cell Alignment & Layout Contract:** 2-column key-value and verdict tables assign `.cell-verdict-val` (`text-align: left !important; padding-left: 1.5rem !important;`), preventing jagged zig-zag misalignment where numeric figures right-align against centered text cells.
  3. **Numbered Compounding Architecture, Zero Premature Flywheels, Dual Visualizer & Mandatory Falsification Audit:** Flywheels (Part 4, Section 1.7) must strictly output as clean numbered stages (1 to 5) with bold titles (`1. **[Stage Name]**: ...`) and an explicit Stage 5 description so programmatic parsers can reliably generate Mermaid and HTML cards. Compounding loops/flywheels are STRICTLY FORBIDDEN in Part 1 or Part 2 (e.g., Section 1.1 Core Business & Economic Engine must detail empirical operational pillars, never a premature compounding flywheel). Flywheels are synthesized exclusively in Part 4 after forensic balance-sheet, capital allocation, and moat audits.
     - **Mandatory Flywheel Falsification:** The terminal does NOT force or invent artificial flywheels for linear commodity processors or cyclical manufacturers. If a business lacks an organic compounding loopback, Section 1.7 must explicitly state `#### 1.7 Compounding Architecture: LINEAR VALUE CHAIN / CYCLICAL COMMODITY (NO ORGANIC FLYWHEEL)` and detail its operational constraints.
     - **Dual Visualizer Parity (Flywheel vs. Linear Value Chain):** When Section 1.7 represents an organic flywheel, the engine renders a circular Mermaid graph (`S5 ==> S1`) and radial circular SVG with `THE COMPOUNDING RETURN LOOP`. When Section 1.7 falsifies an organic flywheel (`NO ORGANIC FLYWHEEL` / `LINEAR VALUE CHAIN`), the engine renders a linear Mermaid pipeline (`S1 --> S2 --> S3 --> S4 --> S5` with zero loopback arrow to S1) and a dedicated horizontal vector SVG pipeline (`viewBox="0 0 760 140"`) with an `AUDIT VERDICT: LINEAR VALUE CHAIN / DISCRETIONARY CAPITAL ALLOCATION` banner.
     - **HTML Duplicate Walkthrough Suppression:** In standalone HTML dossiers, redundant stage text lists ("Flywheel Mechanics Walkthrough" or "Linear Value Chain Walkthrough") are suppressed when the interactive SVG diagram and cards are rendered, ensuring zero visual repetition.
  4. **Dual-Format Delivery Contract:**
     - **Obsidian Markdown (`.md`):** Line 1 MUST contain structured YAML frontmatter (11-13 canonical keys, including `user_cost_basis:` and `user_portfolio_weight:` when `holdsPosition: true`). Trailing percent signs in `user_portfolio_weight` must be normalized to prevent double percent signs (`"5.78%%"` -> `"5.78%"`). Headings must map to institutional chapter titles via `STEP_CHAPTER_TITLES`. Filename strictly follows `${tickerStr} ${periodStr}_Complete Doc_${modelName}_${formattedDate}.md`.
     - **Standalone HTML (`.html`):** Fully self-contained, zero external CDN scripts, high-contrast institutional typography (no neon-green text flood), sticky first table columns, and `.formula-card` containers for calculations. Executive cockpit metrics (market price, intrinsic value, user position weight, cost basis) MUST be extracted directly from line-1 YAML frontmatter (`market_price:`, `intrinsic_value:`, `user_portfolio_weight:`, `user_cost_basis:`), preventing DCF CAGR table or prose price cross-matching. Filename strictly follows `${cleanTicker} ${cleanPeriod}_Valuation_Dossier_${modelName}_${formattedDate}.html`.
     - **Dual-Export Parity & Interim Earnings Release Contract:** When an evaluation is executed on or after earnings day before the official Form 10-Q is filed on EDGAR (staged Transcript or Form 8-K Item 2.02 is 1 sequential quarter ahead of the latest filed 10-Q), both Markdown and Standalone HTML exports append `_Earnings_Release` to their filenames (`${tickerStr} ${periodStr}_Earnings_Release_Complete Doc_${modelName}_${formattedDate}.md` and `${cleanTicker} ${cleanPeriod}_Earnings_Release_Valuation_Dossier_${modelName}_${formattedDate}.html`). Frontmatter injects `filing_status: "Interim Earnings Release (Pending SEC Form 10-Q)"` and `refresh_required: true`. Standalone HTML dossiers render the amber `⚠️ INTERIM VALUATION` warning banner. The browser "Export HTML Dossier" button must query the authoritative backend route (`/api/session/export-html`) to eliminate client-side frontmatter stripping and guarantee 100% parity with Telegram/Email and vault outputs.
     - **Autonomous Batch Queue Vault Export Parity (`executeBatchCompany` & `batchManager.ts`):** Autonomous batch runs must preserve `serviceTier` (`flex`) and export strictly through `updateCompiledReportFile` and `generateStandaloneDossierHtml` using the canonical Dual-Format Delivery Contract filenames (`${tickerStr} ${periodStr}${releaseTag}_Complete Doc_${modelName}_${formattedDate}.md` with 11-13 YAML frontmatter keys and `${cleanTicker} ${cleanPeriod}${releaseTag}_Valuation_Dossier_${modelName}_${formattedDate}.html`). Writing duplicate legacy `_Deep_Valuation_Dossier_` files without frontmatter is strictly prohibited.
  5. **Parser & Chart Invariance:**
     - **Numeric Parsing Resilience:** Programmatic parsers (`parseNumeric`, `parseNumericValue`) must cleanly strip markdown bolding (`**`), italics, and code markers, and correctly parse accounting negatives like `**($19.00)**` or `($19.00)` to avoid `NaN -> 0` collapse.
      - **Trend Series Disambiguation & Single Trajectory Chart Latch (Gate 13):** In standalone HTML dossiers and Markdown views, the Cash Flow & Owner Earnings Trajectory visualizer chart must render exclusively in Part 3 Section 1.4 (Historical Cash Flow & Owner Earnings Trend Table) and strictly at most once (enforced via `hasRenderedTrendChart` single-instance latch). It is strictly forbidden from triggering on Part 1 Section 2.9 RORC / Retained Capital tables or Part 3 Section 1.5 CAGR / Growth Rate Calibration tables. `getTableChartType` strictly enforces negative schema exclusions (`rorc`, `retained capital`, `hurdle rate`, `cagr`, `growth rate`, `longitudinal metric`, `base ($m)`), requires >= 80% temporal column density (minimum 3 chronological periods), and requires two distinct rows for OCF and Normalized Owner Earnings. Cash flow and trajectory visualizers must strictly filter out margin, percentage, yield, and growth rows (e.g. `Owner Earnings Margin (%)`) when extracting absolute dollar metrics (e.g. `Normalized Owner Earnings`), preventing flat-line $0M distortion.
     - **Interactive Owner Earnings Waterfall Bridge Contract:** The Waterfall Bridge visualizer card must render exclusively in Part 3 (`Normalized Owner Earnings & Cash Flow Integrity`), immediately above the audited TTM Owner Earnings Reconciliation Table. It is strictly forbidden from triggering on Part 2 Competitor Radar tables containing the multiple header `EV / Owner Earnings`. Detection is strictly gated on the table containing both an Operating Cash Flow row and a Normalized Owner Earnings row, while excluding 10-year longitudinal tables (`headers.length > 5`). Values are parsed directly from the Part 3 reconciliation table with strict `!isNaN()` validation, permanently eliminating `-$NaNM` artifacts.
     - **Audit Finding Badge & Table Column Invariance:** Programmatic HTML converters must strictly limit `.audit-badge` application to concise status verdicts (`length <= 30`, excluding conditional `if` sentences), preventing multi-sentence trigger rules (e.g. `Flag if...`) from blowing up column widths or pushing audit finding columns off-screen. Table cells enforce `overflow-wrap: break-word`.
      - **Revenue Mix Part-to-Whole Integrity Invariant (Gate 13):** The horizontal segmented bar visualizers (`Revenue Mix: Operating Business Segments` and `Revenue Mix: Geographic Distribution`) in Part 1 Section 1.2 represent 100% composition of the business. Programmatic column resolvers (`renderSegmentBarHtml` in `src/utils/googleDocs.ts` and `SegmentMixChart` in `src/components/MarkdownView.tsx`) must strictly prioritize revenue contribution and share percentage columns (`% of Total Revenue`, `Share %`, `Revenue Share`) and explicitly exclude growth velocity or rate columns (`growth`, `yoy`, `cagr`, `change`, `margin`, `take rate`, `rate`). In addition, breakdown sub-components starting with dashes (`—`, `–`, `-`) must be omitted from primary segment bars so primary segments sum cleanly to 100%.
- **Verification Gate Before Push:** Any changes modifying prompts, parsers, templates, or documentation must pass `npm run build`, `npx tsx scripts/test_engine_prompts.ts` (all 14 verification gates, including Gate 13 Visualizer Chart Disambiguation & Single Cardinality Guard and Gate 14 Hardcore Anti-Anchoring Firewall & Multi-Mode Prompt Integrity), and preserve existing layout contracts.

## Clean Environment & Ticker Isolation Directive (Zero Cross-Contamination)
- **Absolute Company Isolation:** Every evaluation session must run in a completely sanitized, unpolluted workspace. Zero residual data, filings, transcripts, competitor cards, or pricing from a prior ticker may linger into a new run.
- **Automated Ticker Sanitization (`enforceCleanTickerEnvironment`):** Whenever a session is initialized, reset, or when filings are ingested, the system automatically purges non-matching documents from memory and local cache, resets competitor radars, clears conversational history, and re-initializes step telemetry.
- **Zero Persistent Cross-Ticker Carryover (Permanent Pinning Elimination):** File pinning and persistent file flags have been permanently eliminated across the entire terminal. Every evaluation session operates in complete ticker isolation with zero persistent carryover. If the active ticker changes or a new session begins, all previous ticker documents, cached downloads, competitor radars, and session logs are unconditionally purged.
- **Zero Company-Specific Parametric Residue (Ticker-Agnostic Engine):** Production source code, regex patterns, fallback transformations, and output normalizers must be 100% generic. It is strictly forbidden to hardcode company tickers (e.g. `PLTR`, `CALM`, `AAPL`), specific quotes, or test case values into codebase logic or regex fallbacks. Gate 12 explicitly enforces zero hardcoded tickers in format guards.
- **Preservation of Matching Staged Documents on Initialization:** Session initialization (`/api/session/init`) and ticker switching must preserve all staged documents verified to belong to the active ticker (`cleanTicker`). `clearFiles` is strictly reserved for explicit user-commanded purges and must never be triggered implicitly by session initialization or unconfigured initial states (`!state.config`), ensuring documents pulled prior to clicking "Initialize Terminal State" are never dropped.
- **Null-Safe Period & Ticker Audit Defense:** All audit functions in `src/documentGuard.ts` and `src/currencyGuard.ts` must defensively handle optional or undefined period/ticker parameters with explicit fallbacks (`safePeriod = (targetPeriod || "").trim()`, `safeTicker = (ticker || "").trim().toUpperCase()`) to prevent unhandled `.toUpperCase()` runtime exceptions during ingestion roll calls.
- **Form 20-F Item 18 Preservation & Supplementary Document Defense:**
  - *Form 20-F / 40-F Audited Financial Statements:* Under SEC Form 20-F rules for Foreign Private Issuers, Item 18 is the Audited Financial Statements and Footnotes. Boilerplate truncation filters must NEVER truncate at `ITEM 18.`. Truncation is restricted strictly to `ITEM 19.` or `SIGNATURES`.
  - *Supplementary Document Preservation:* `enforceCleanTickerEnvironment()` must retain unverified supplementary files (`auditCategory === "Supplementary"`) unless an explicit company mismatch is detected.
- **Form 8-K Current Report Exemption & Interim Earnings Release Protocol:**
  - *Form 8-K Current Report Exemption:* Form 8-K is an unscheduled Current Report (Item 2.02 earnings releases, material definitive agreements, executive changes). As long as the company ticker matches, Form 8-Ks are unconditionally accepted as valid supplemental context and never flagged as period mismatches.
  - *Post-Earnings / Pre-10-Q Interim Release Protocol:* When an evaluation is executed on or after earnings day before the official Form 10-Q is filed on EDGAR (staged Transcript or 8-K Item 2.02 is 1 sequential quarter ahead of the latest filed 10-Q), DocumentGuard validates the pairing as an active interim earnings release state without period discrepancy errors. Dossier filenames automatically append `_Earnings_Release` (e.g. `${tickerStr} ${periodStr}_Earnings_Release_Complete Doc_${modelName}_${formattedDate}.md`), and YAML frontmatter injects `filing_status: "Interim Earnings Release (Pending SEC Form 10-Q)"`.
- **Zero-Contamination Test & Session Initialization Protocol (Zero Prompt Injections / Zero Coaching):**
  - *Pristine Notes Mandate:* In session initialization payloads (`/api/session/init`), CLI commands, and automated test runner scripts, the `notes` field MUST strictly be empty (`notes: ""`) unless the user explicitly dictates text and commands you to insert it.
  - *Zero Editorial Coaching:* Strictly forbidden from injecting unprompted editorial notes, thematic cues, thesis cheat-sheets, or pre-digested answers into `notes` or session state (e.g., highlighting specific moats, stating exact net cash figures, pre-specifying normalization frameworks, or dictating valuation verdicts). All quantitative and qualitative insights must be independently derived by the AI solely from the ingested filings and canonical master prompts.
  - *Zero Legacy Script Carryover (No Contaminated Templates):* Never copy, clone, or adapt previous terminal test runner scripts without completely sanitizing and purging all legacy notes, thesis hints, old portfolio weights, and company-specific comments. Every test runner script must be built from a clean, sanitized template where `notes: ""` by default.
  - *Strict Portfolio Parameter Isolation:* Portfolio parameters (`holdsPosition`, `currentWeight`, `entryPrice`) must strictly reflect the user's explicit numeric inputs without qualitative or narrative embellishments.
- **Clean Reset & Anti-Sticky State Invariance:**
  - *Zero Sticky Input Trapping in LocalStorage:* Active setup inputs (`ticker`, `period`, `price`, `selectedModel`) must never be trapped in persistent browser storage across resets. Authoritative configuration state resides strictly in backend `state.config`. When `state.config` is null (initial/purged state), inputs must cleanly default to empty (`ticker: ""`, `period: "----"`, `price: "----"`, `selectedModel: ""`).
  - *Crosscheck & Prefix Cache HUD Invariance (Zero Idle Badge Ghosting):* The `CROSSCHECK` forensic gate badge and `PREFIX CACHE HIT` badge must render strictly when an active ticker session is configured (`Boolean(session.config?.ticker)`) and (for crosscheck) Step 12 has actually executed and completed (`session.steps?.some(s => s.isCrosscheck && s.status === 'completed')`). Whenever a session is reset or sanitized (`enforceCleanTickerEnvironment`, `hardResetSessionState`, and `/api/session/reset`), backend state unconditionally executes `delete state.crosscheckVerdict; state.cachedTokenCount = 0; state.cacheStatus = 'bypassed';`, permanently preventing residual crosscheck badges (e.g. `5/5 GATES PASSED`) or token counts from ghosting on initial load or idle states.
  - *Hard Reset Purge Contract:* Hard Reset (`handleHardReset` / `/api/session/hard-reset`) must unconditionally purge all server files, batch queues, conversation history, and clear all temporary client-side form caches, guaranteeing that reloaded workspaces present a completely blank canvas for new ticker entry.
- **Vite Development Watcher Scoping (Zero Page Reload Churn):**
  - *Strict Non-Frontend Exclusion:* Vite's file watcher (`server.watch.ignored` in `vite.config.ts`) must strictly exclude all non-frontend files: `**/*.md`, `**/.agents/**`, `**/.gemini/**`, `**/public/**`, `**/scripts/**`, `**/dist/**`, `**/*.txt`, `**/*.pdf`, `**/*.csv`, and `**/server*.ts`.
  - *Zero Agent-Edit Flickering:* Automated prompt tests, markdown file staging, and manual compilation must never trigger full browser page reloads (`page reload ...`), preventing accidental wipeout of active user inputs or disruption of in-progress sessions.
- **Session Polling Discipline (Zero Idle Polling):**
  - *Activity-Gated Polling Loop:* The client polling loop (`fetchSession`) must be active strictly when `session.status === 'running' || session.status === 'retrying' || flexWatcher?.isWaiting || flexEngaging`. When the terminal is `idle`, all interval polling must halt (`if (!isBusy) return;`) to eliminate unnecessary network traffic and React re-render churn.
- **Authoritative Verbatim Transcript Pipeline (TIKR Default with Stock Analysis Fallback & Zero Search Fallback):**
  - *Tiered Dual-Source Architecture:* Earnings call transcripts are pulled primarily from **TIKR Terminal (S&P Capital IQ)** by default, which indexes verbatim dialogue significantly faster post-call. If TIKR has not indexed the call or returns unauthorized for older historical periods, the pipeline automatically falls back to **Stock Analysis** (`stockanalysis.com`).
  - *User-Selectable Provider:* The UI provides an explicit provider toggle allowing the user to select `Auto (TIKR ➔ Stock Analysis)` (default), `TIKR Only (Capital IQ)`, or `Stock Analysis Only`.
  - *Algolia Directory Resolution & Safety Disambiguation Gate:* TIKR company identification resolves via Algolia (`tikr-terminal-v1`), prioritizing `primaryflag === 3` (primary home exchange listing). A strict multi-tier safety gate (`calculateNameSimilarity`) validates candidate company names against canonical SEC CIK / FMP profiles (>= 40% word overlap required), permanently eliminating cross-market ticker collisions (e.g. Mexican BMV or European listings sharing the same ticker symbol).
  - *URL Path & Slug Disambiguation Invariance:* Stock Analysis transcript URLs strictly follow `https://stockanalysis.com/stocks/{symbol}/transcripts/` (never `/financials/transcripts/`). Scraper period matching must enforce exact word/delimiter boundaries when checking two-digit years (e.g. `28` for 2028), preventing false matches on internal numeric page IDs (e.g. `402818`).
  - *Zero Web Search Fallbacks:* Generative Google Search and Gemini web search grounding fallbacks are permanently eliminated across all transcript ingestion routines (`executeTranscriptIngest`). If neither provider has verbatim dialogue ready yet, the engine cleanly returns `notReady: true` with an unmissable alert modal and direct links to both TIKR and Stock Analysis, rather than attempting to synthesize a transcript from secondary web summaries or news articles.
  - *Dual-Mode Stock Analysis Extraction (DOM + SvelteKit Script):* The Stock Analysis fallback extracts both server-rendered DOM speaker blocks and SvelteKit serialized script payloads (`fullTranscriptBody` and `summaryLongHtml`), ensuring that newly published calls that default to the "Summary" tab still decode the complete verbatim dialogue with proper speaker attribution.
- **Pre-Flight File Substance Tripwire Safeguard (Guard 3):**
  - *Substance Check Before Run:* In `handleRunSteps` and `/api/session/step/run`, all staged documents must pass a rigorous substance audit (`auditFilesSubstance`) before an analytical run can proceed:
    - *Earnings Call Transcripts:* Minimum 1,000 tokens (or >= 10 KB). A full call is typically 4,000–12,000 tokens. Flag anything under 1,000 tokens as a preview stub or truncated dialogue.
    - *Form 10-K / 20-F / 40-F:* Minimum 2,000 tokens (or >= 30 KB). Prevents running with cover-only or truncated filings.
    - *Form 10-Q / 6-K:* Minimum 2,000 tokens (or >= 20 KB), unless covered by Form 8-K interim release.
    - *DEF 14A Proxy Statements:* Minimum 2,000 tokens. Prioritize official `DEF 14A` first to prevent downloading 1-page `DEFA14A` postcard notices.
    - *Financials TTM CSV:* Minimum 100 tokens and at least 5 rows.
  - *Blocking UI Modal (`FileSubstanceModal`):* If any staged document is flagged as truncated or incomplete, execution is paused and a blocking modal opens displaying the exact file, token count vs expected minimum, and diagnosis. Requires explicit user action to either **Cancel Run & Fix Documents** (default) or **Override & Proceed Anyway**.
  - *Repository & Checklist Badging:* Any file failing substance criteria displays an unmissable amber `⚠️ TRUNCATED / SMALL` badge in the Document Repository table and Checklist.

## Native Implicit Prefix Caching & Model-Agnostic Execution Directive
- **Universal Implicit Caching (>= 4,096 tokens):** In accordance with official Google Gemini documentation, all Gemini 2.5 and newer models (including 3.x and 4.x frontier models) feature automatic **Implicit Caching** by default. Whenever reference materials exceed 4,096 tokens, Google's servers automatically cache the prompt prefix and apply discounted input rates.
- **Zero Silent Downgrades on Frontier Models (Strict Model Retention):** When running `models/gemini-4-argon` (or `pro`), cluster saturation or stream timeouts on Flex Tier never silently downgrade in-flight to Flash. Execution strictly preserves the requested model across all 11+1 steps. Transient cluster congestion escalates to the outer Auto-Resume cooldown queue (45s pacing for up to 45 minutes prior to cache eviction). If the cluster remains saturated at the 45-minute mark, execution is gracefully halted before server-side KV cache eviction, and an immediate multi-channel Telegram + Email alert is dispatched.
- **Immutable Context Prefix Architecture:** Every analyst prompt turn attaches target filings, transcripts, and financial datasets as an immutable contextual prefix at the very beginning of the prompt payload (`role: "user"` fileParts followed by `role: "model"` acknowledgment). This architecture maximizes native cache hit probability without requiring manual cache object creation.
- **Two-Stage Ingestion Protocol & Tool-Free Cache Invariance:**
  - **Pre-Flight Competitor Radar Harvesting & Spike Defense:** Competitor intelligence and valuation multiples are pre-harvested during pre-flight ingestion and staged into `state.files` as `${cleanTicker}_Competitor_Radar.md` before Step 1 starts. Extraction combines:
    1. *Form 10-K Item 1 Competition Extraction:* Surgical parsing of executive management's disclosed operational competitors.
    2. *Form DEF 14A Proxy Peer Extraction:* Hardened proxy extraction skipping Pay-Versus-Performance tables and blacklisting role/compensation acronyms (`PEO`, `CAP`, `NEO`, `RSU`, `TSR`).
    3. *Deterministic FMP Resolution:* Real-time validation via FMP `/stable/profile` (rejecting closed-end funds, ETFs, inactive tickers) and `/stable/search-name` (resolving corporate names to active trading symbols).
    4. *Standard-Tier 1-Attempt Flash Harvester:* Runs `gemini-3.8-flash` on Standard On-Demand Tier (~$0.0004 cost) with Google Search Grounding capped at 1 attempt, falling back immediately on Attempt 2 to synthesize peers directly from 10-K/DEF 14A documents without looping retries.
    5. *Rolling Trailing Twelve Month (TTM) Peer Normalization:* Financial statement metrics (Gross Margin, Operating Margin, True FCF, Normalized Owner Earnings, and valuation multiples) aggregate the last 4 reported quarterly statements (`period=quarter&limit=4`) to eliminate mid-year reporting lag and staggered fiscal year drift, with an automatic fallback to annual 10-K filings for semi-annual foreign filers. Target anchor metrics use the identical TTM routine for 1-to-1 parity.
  - **Closed-Universe Tool-Free Pipeline (100% Cache Invariance):** The main 12-step sequential generation pipeline runs completely tool-free (`toolsConfig = undefined`), eliminating tool declarations from the system payload. This guarantees that the 300,000+ token filing context prefix hash remains 100% byte-for-byte invariant across all pipeline steps, permanently locking in the **80% cache discount** + **50% Flex discount** and eliminating 503 retry storms or socket close timeouts.
  - **Pre-Flight Matrix, Safeguard Audit & Cockpit Control:** `Competitor Radar` is enforced as a formal pre-flight audit requirement in `REQUIREMENT_RULES` and `MissingDocumentsModal` (preventing accidental execution without peer research). The UI surfaces a high-contrast Competitor Radar row in the Pre-Flight Checklist Matrix (with verified peer badge pills, Eye preview, `MISSING` alert badge, and prominent `[Harvest Competitor Radar]` CTA button) and a highlighted `4. Harvest Competitor Radar` button in the Document Ingest cockpit, fully integrated as Step 4/4 into 1-Click "Retrieve All Documents".
- **Mandatory Explicit Model Selection Protocol (Zero Silent Fallbacks):**
  - The terminal backend and batch engine strictly forbid silent hardcoded fallbacks to any model. If no model is explicitly passed or selected, execution must halt immediately with an explicit error: `"Execution blocked: Explicit model selection required. No model specified."`
  - *Frontend Guardrail:* The Model selection dropdown defaults to `"Select Model..."` (`""`), and both single-company analysis and batch execution (`handleBatchStart`) require explicit selection before initiating, alerting the user if unselected.
  - *Agent Operational Protocol & Instant Telegram Alert:* Whenever the user asks to run companies on the terminal or execute a batch queue without explicitly specifying the model name in their prompt:
    1. The assistant MUST prompt the user in the chat to choose from the live available models (e.g. `Gemini 4 Argon`, `Gemini 3.8 Flash`).
    2. The assistant MUST simultaneously fire an instant Telegram notification to the user's phone (via `scripts/send_telegram_alert.py`) stating that the batch is staged and waiting for model selection. This ensures that if the user stepped away from their computer, their phone buzzes immediately.
    3. The assistant strictly pauses and waits for the user's explicit reply before initiating execution.
  - *Cache Continuity Invariant:* All pipeline steps execute sequentially under the single chosen Gemini model, guaranteeing 100% prefix cache continuity from Step 1 through Step 12 without cold cache re-ingestion penalties.
- **Google Gemini Flex Tier (`serviceTier: "flex"`) Protocol:**
  - Both streaming (`generateContentStream`) and non-streaming (`generateContent`) payloads support passing `serviceTier: "flex"`.
  - Flex tier provides a 50% discount across inputs, outputs, and cached tokens. Full 10-minute HTTP client timeouts (`timeout: 600000`) are enforced to absorb queue latency under peak load without socket termination.
  - **Pre-Flight 1-Token Canary Probe & Automated Wait-and-Launch Gatekeeper:**
    - *Lightweight Canary Probe:* `probeFlexTierAvailability` tests Flex capacity using a 1-token query (`"ping"` with `maxOutputTokens: 1`), costing `<$0.000001` and returning in ~1-3s. Live results are cached in server RAM for 20s to prevent API flooding from client re-renders.
    - *Capacity Classification:* HTTP 200 = `available` (Open), HTTP 503 = `saturated` (High Demand), HTTP 429 = `rate_limit`.
    - *Non-Blocking Asynchronous Canary & Fast Client Registration:* `startFlexWatcher` launches probe #1 asynchronously (`setTimeout(..., 50)`), and `/api/flex/wait-and-launch` registers the watcher in RAM and returns an immediate response (`< 5ms`) to the frontend. Never block incoming client HTTP requests with synchronous 12-second probe timeouts.
    - *Automated Background Gatekeeper (`startFlexWatcher`):* When Google's Flex cluster returns 503, the gatekeeper polls the cluster every 45s in the background (up to 4 hours max wait) with zero user intervention required.
    - *Auto-Launch & Multi-Channel Alerting:* The moment Google clears the cluster (HTTP 200), the watcher automatically dispatches execution (`runStepProcessor` for single-company or `batchManager.start()` for autonomous batch queue) and fires Telegram and Email alerts (`flex_gatekeeper_launched`).
    - *Universal Dual-Polling UI Synchronization:* Frontend clients enforce a universal dual-interval polling loop (2s during active execution, cooldown, or Flex waiting; 5s heartbeat otherwise). When the background Gatekeeper auto-launches, transition detection (`!data.watcher.isWaiting`) immediately triggers an authoritative session fetch, switching the UI into the active console without requiring a manual page refresh.
    - *Re-Entrancy & Auto-Resume Cooldown Protection:* `/api/session/step/run` strictly protects active steps (`status: 'running'`) and Auto-Resume cooldown timers (`status: 'retrying'`) against duplicate clicks, returning safe 200 OK no-ops rather than canceling cooldown timers or re-submitting requests to saturated clusters.
    - *Global Process Crash Shields:* Top-level `process.on('unhandledRejection')` and `process.on('uncaughtException')` crash shields are enforced across all server runtimes (`server.ts`, `server.cloud.ts`), guaranteeing that transient network blips, socket drops, or API aborts never terminate or reset the Node.js process.
    - *Strict Model Retention Invariant:* Zero downgrades to Flash or lower models. Target model (e.g. `models/gemini-4-argon`) is strictly preserved across all canary probes and pipeline steps.
    - *Flex Tier Sovereignty & User-Authorized Escalation Invariant:* The terminal must NEVER automatically step up from `flex` to `standard` tier. When Google API clusters experience demand spikes (`503 UNAVAILABLE`) or transient stream terminations, the pipeline strictly preserves `serviceTier: "flex"` and enters the 45-minute Auto-Resume cooldown queue (`60 retries × 45s = 45m`) prior to context cache eviction. Switching to Standard tier is strictly gated behind explicit user confirmation/action (`POST /api/session/retry-standard` via the "Switch to Standard" button in UI).
    - *Multi-Channel Telegram Cooldown & Recovery Protocol:* On Attempt 1 of entering cooldown, an instant Telegram notification (`⏳ Flex Tier Cooldown`) is dispatched to the user's phone (`chatId: 1549521479`), reporting the exact transient error and confirming the 45-minute auto-resume queue. Intermediate 45-second retries remain silent to prevent spam. The moment Google clears cluster capacity and the step finishes successfully, an instant recovery alert (`✅ Valuation Back on Track`) is dispatched, confirming the number of cooldown attempts, wait elapsed, and resumption of pipeline execution. `blockedAlert` in `notification_config.json` must remain permanently set to `true`.
- **Zero Explicit Cache Forcing (Zero Execution Stalls):** Never force explicit context caching via `ai.caches.create()`, and never pause execution on false cache wait states (`status: 'awaiting_cache_approval'`). Frontier preview models (such as `models/gemini-4-argon`) do not support explicit caching (`HTTP 400`), and explicit caches prohibit tool usage (`googleSearch`). All models must execute cleanly and natively via streaming `generateContentStream` with implicit prefix caching.
- **Weekly Documentation & Capability Audit:** The terminal maintains continuous alignment with Google Gemini documentation via automated weekly checks (`npm run check:gemini-docs`) inspecting live model actions, caching behaviors, and SDK updates.
- **In-Memory File URI Caching (24h TTL):** Verified Gemini Files API URIs (`fileData.fileUri`) are cached in memory with a 24-hour verification TTL (`fileUriVerifiedAt`). Repeated prompt steps within a session reuse verified URIs without redundant `ai.files.get` network roundtrips, reducing API request counts by up to 85% (from ~72 HTTP roundtrips down to 1 per step).
- **Zero-Drop Context Invariant & Deterministic Source Document Manifest (`prepareFileContextParts`):** Because Gemini Files API `fileData: { fileUri, mimeType }` parts do not expose local filenames (`f.name`) to the LLM, `prepareFileContextParts` prepends a deterministic `### Source Documents` manifest at index 0 listing exact staged filenames and categories (`- **${f.name}** (${f.auditCategory})`) so Step 1 Roll Calls never guess or hallucinate filenames, while remaining 100% deterministic across all 12 steps to preserve implicit KV prefix caching. Pre-flight verification checks `attachedFilesCount === expectedFiles.length`, halting immediately with a `CRITICAL INTEGRITY HALT` error if any staged financial filing fails to attach.
- **Adaptive In-Flight Safeguards & Truncation Guards:** In-flight error recoveries (stepping down thinking level from high to medium, retrying on 404 model deprecation, or recovering from transient socket drops while strictly preserving requested frontier models on 503 Flex saturation per Line 127) and candidate truncation (`finishReason === 'MAX_TOKENS'`) are explicitly tracked on `step.fallback` and `step.truncated`, surfacing warning badges on UI step pills (`⚠️ FB`, `✂️ TRUNC`).
- **Executive Crosscheck Gate Verdict Badging:** Step 12 (Forensic Audit & Fact-Check Crosscheck) parses Gate 0–4 verdicts into `state.crosscheckVerdict` (`gatesPassed`, `totalGates`, `hasBreach`, `breaches`), surfacing an authoritative badge in the executive cockpit (`🛡️ CROSSCHECK: 5/5 GATES PASSED` vs `🚨 BREACH DETECTED`).
- **Section 2.8 Dual Segment Breakdown Architecture (Option B):** Segment breakdown in Part 1 (Section 2.8) strictly outputs Table 1A (Operating Business Segments, summing to 100%) and Table 1B (Geographic Territory Breakdown, summing to 100%) as separate GFM tables. Visualizers render distinct horizontal breakdown bars (`Revenue Mix: Operating Business Segments` vs `Revenue Mix: Geographic Distribution`) and enforce defensive partition guardrails to prevent 200% double-counting distortion if rows sum to > 110%.
- **Context Cache Keep-Alive Telemetry & 45-Minute Idle Auto-Reset Contract:**
  - *4-Minute Keep-Alive Heartbeat:* Every 4 minutes post-analysis (`KEEP_ALIVE_INTERVAL_MS = 4m`), the terminal fires a lightweight 1-token background ping (`sendCacheKeepAlivePing`) keeping the immutable financial filing prefix warm on Gemini's GPU/TPU KV cache (`PREFIX CACHE HIT`).
  - *Rolling 45-Minute Window on User Interaction:* Every human interrogation question (`/api/session/interrogate` or manual cache extension `/api/session/cache/extend`) completely restarts the 45-minute countdown from zero (`startedAt = now`, `warningAt = now + 40m`, `expiresAt = now + 45m`). Dialogue interactions can continue indefinitely without cache drops as long as intervals between prompts do not exceed 45 minutes.
  - *Automated Reset & Browser Reload Invariant (`executeAppReset`):* Between minutes 40 and 45, an amber warning modal appears displaying an active 1-second countdown initialized immediately at `05:00` (computed dynamically from `keepAlive.expiresAt - Date.now()`, never uninitialized `00:00`). Upon countdown expiration or clicking "Reset Now", the client executes unprompted `executeAppReset()` (purging local storage, issuing `POST /api/session/hard-reset`, and reloading via `window.location.reload()`), strictly bypassing blocking browser `confirm()` dialogs to ensure unattended terminals cleanly auto-reset and refresh. Manual clicks on the header/footer trash can reset buttons strictly preserve the safety `confirm()` dialog via `handleHardReset()`.

## Instruction Synchronization & Evolution Protocol (Living Rules)
- **Synchronous Rule Updates:** If we intentionally make architectural, pipeline, or formatting changes that supersede or evolve any hardcoded rule in this document (or `DOSSIER_FORMAT_SPEC.md` / `terminal_methodology_snapshot.md`), you MUST proactively update these hardcoded instructions in the exact same commit.
- **Preventing Stale Rule Traps:** Never allow code and prompts to diverge from `GEMINI.md`. Updating the rules ensures future sessions immediately recognize the new behavior as the intended ground truth, preventing the assistant from treating intentional improvements as violations or attempting to revert them back to old baselines.
- **Recursive Skill, Reference & Script Audit Mandate:** Whenever auditing or updating Living Rules, you MUST recursively inspect all workspace skills (`.agents/skills/*/SKILL.md`), nested reference documents (`.agents/skills/*/references/*.md`), skill verification scripts (`.agents/skills/*/scripts/*.ts`), and global publishing skills (`~/.gemini/config/skills/*`), plus verify Lab-to-Main parity via `check_format_sync.ts`. Never leave legacy doctrines (such as banned `TRIM`, academic creator names, or outdated table schemas) inside auxiliary `references/` files.
- **Zero Raw LaTeX in Skills & References (Context-Priming Defense):** All mathematical formulas inside `SKILL.md` and `references/*.md` files must be written in clean plain-text markdown (`> **Formula / Calculation:** ...`), never raw `$...$` or `\text{...}` LaTeX, ensuring skill files loaded into the context window never prime the LLM to violate Inviolable Formatting Law 1.

## Git & Version Control Directive
- **Auto-Push to GitHub:** Whenever updates, fixes, or refactors are made and verified, automatically commit and push the changes to GitHub (`git push origin main`) to ensure the remote repository is always synchronized.

```

## 1.2 terminal_methodology_snapshot.md (Canonical Pipeline Snapshot)
```markdown
# Value Investing Terminal — Canonical Methodology & Literature Benchmark Snapshot

**Document Target:** Google NotebookLM Source Ingestion  
**Primary Objective:** System Audit, Empirical Verification, and Hallucination Crosscheck against Classical Value Investing Literature.  
**Repository Source of Truth:** `c:\Users\Ronald\antigravity\Value-Investing-Terminal`  
**Pipeline Standard:** Unified 11 Master Prompts + Step 12 Forensic Crosscheck (11+1 Full-Auto Canonical Pipeline)  
**Thinking Standard:** Google Gemini Dynamic Deep Reasoning (`thinkingConfig: { thinkingLevel: 'high' }`)  

---

## 1. Executive Philosophy & The Micro-Primacy Directive

The **Value Investing Terminal** operates as an institutional buy-side desk’s automated forensic valuation and capital underwriting engine. It synthesizes classical security analysis, forensic accounting, competitive strategy, and probabilistic expectations analysis into a unified, deterministic framework.

### The Micro-Primacy Directive
- **Elimination of Macro Forecasting:** In accordance with Warren Buffett and Charlie Munger’s core doctrine, macroeconomic forecasting (interest rate predictions, GDP guessing, currency fluctuation models) is permanently eliminated from analysis. 
- **Micro Focus:** 100% of analytical capacity is dedicated to micro-level economic moats, unit economics, balance-sheet defense, forensic earnings quality, management capital allocation track records, and normalized owner cash flows.
- **Decommissioned Macro Surveys:** Legacy top-down macro questionnaires (including 21-pair macro sentiment surveys) have been permanently decommissioned. Part 7 is exclusively dedicated to Probabilistic Owner Earnings DCF and Market-Implied Expectations Reverse DCF.

### The Never-Trim Compounding Doctrine (Coffee-Can Portfolio Architecture)
- **Elimination of TRIM:** In accordance with Thomas Phelps (*100 to 1 in the Stock Market*), Christopher Mayer (*100 Baggers*), Philip Fisher (*Common Stocks and Uncommon Profits*), Charlie Munger, and Warren Buffett, the legacy portfolio directive `TRIM` is permanently eliminated.
- **Permissible Directives for Existing Holdings:** Strictly **`HOLD`**, **`ACCUMULATE`**, or **`LIQUIDATE`**.
- **Archetype Eligibility Gate:** The Never-Trim Compounding Doctrine applies strictly to verified **Fast Growers**, **Wide-Moat Stalwarts**, and **Cyclical Compounders** maintaining a normalized through-cycle ROIC > 10.0% static hurdle rate. High-conviction compounders are held indefinitely through multiple expansions, cyclical margin troughs, and position weight growth (even past 20%–30%+ of portfolio equity), so long as the structural moat, unit economics, and management integrity remain intact.
- **4-Point Cyclical Compounder Disambiguation:** Disguised compounders in cyclical sectors (e.g. STLD, Nucor, CALM) are protected from false cyclical liquidation if they demonstrate over the `3-to-10 year recency-weighted window (50% 3-Yr / 30% 5-Yr / 20% 10-Yr)`: (1) Trough-to-Trough EPS/Book Value escalation ("higher lows"), (2) Physical unit volume compounding decoupled from spot commodity prices, (3) Recency-weighted through-the-cycle ROIC > 10.0%, and (4) Countercyclical balance-sheet/buyback discipline. Pure Commodity Cyclicals, Turnarounds, Slow Growers, and Asset Plays follow Peter Lynch & Charlie Munger's category-specific exit discipline (cycle-peak inventory/CapEx warnings or fair-value convergence).
- **Mandatory 4-Gate Peer-Relative Isolation Diagnostic:** Before issuing `HOLD`, `ACCUMULATE`, or `LIQUIDATE` during margin compression or drawdowns, the terminal must test:
  1. *Gate 1 (Peer-Relative Captivity & Share):* Contraction must be industry-wide over a 3-year rolling window (market share stable/rising, customer captivity intact), not idiosyncratic defection to peers.
  2. *Gate 2 (Gross Margin Pricing Power vs. Fixed-Cost Deleverage):* Gross Margin must hold firm relative to cycle stage (proving pricing power while Operating Margin deleverages on lower volume). Structural peer-relative Gross Margin collapse triggers liquidation.
  3. *Gate 3 (Capital Allocation & Forensic Integrity):* Recency-weighted through-cycle ROIC >= 10.0% and 5-Year Rolling Buffett $1 Total Shareholder Value Test >= $1.00 (including dividends). Immediate breach on out-of-moat M&A diworseification, restructuring addiction, or 3-Year Rolling Cash Conversion breach.
  4. *Gate 4 (Zero-Base Thesis & Fade Recalibration — Strict Sunk-Cost Prohibition):* Zero-base underwriting stripping MD&A excuses; recalculating EPV and Expected DCF strictly against current market price (never against historical user purchase cost basis). Fortress balance-sheet holdings (net cash / zero debt) at cyclical troughs are protected from trough liquidation.
- **Strict Liquidation Criteria:** A holding is ONLY liquidated if it fails any of the 4 Gates (structural moat decay, capital destruction/forensic breach, or thesis invalidation/category drift).
- **Accumulation Criteria:** `ACCUMULATE` is permitted ONLY if all 4 Gates PASS and current market price trades at >= 15%–20% Margin of Safety discount for Wide-Moat Compounders (>= 20%–25% for Cyclicals) to Intrinsic Value. Default is `HOLD`.

---

## 2. Bimodal Voice Architecture Mandate

The terminal enforces a dual-voice system to ensure analytical depth where economic moats matter, and ruthless precision where balance-sheet defense is required:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      BIMODAL VOICE ARCHITECTURE                        │
├───────────────────────────────────┬────────────────────────────────────┤
│      STRATEGIC & MOAT VOICE       │      FORENSIC & DEFENSE VOICE      │
│     (Parts 1, 2, 4, 7, 8, 9, 11)  │  (Step 12, Part 10, Part 5, Part 3)│
├───────────────────────────────────┼────────────────────────────────────┤
│ • Classical Value Investor Tone   │ • 80% ASD-STE100 Aerospace English │
│ • Deep Qualitative Moat Nuance    │ • Active Voice Only (Zero Passive) │
│ • Scale Economics & Customer Lock │ • One Verb Per Sentence (Max 25 w) │
│ • Reinvestment Flywheels & ROIC   │ • Zero Corporate Fluff / Euphemism │
│ • Probabilistic Underwriting      │ • Metric ➔ Benchmark ➔ Audit Verdict│
└───────────────────────────────────┴────────────────────────────────────┘
```

1. **Strategic & Moat Voice (Parts 1, 2, 4, 7, 8, 9, 11):** Emulates Warren Buffett, Charlie Munger, and Peter Lynch. Focuses on customer captivity, high switching costs, network effects, scale advantages, management capital allocation philosophy, and multi-scenario margin of safety synthesis.
2. **Forensic & Defense Voice (80% ASD-STE100 in Step 12, Part 10, Part 5, Part 3 Cash Flow Integrity, and Governance Audits):** Simplified Technical English adapted for audit-grade clarity:
   - **Active Voice Only:** Strictly eliminates passive voice constructions.
   - **One Verb Per Sentence:** Maximum 20-25 words per sentence; short, punchy declarative statements with a single primary verb clause.
   - **Zero Corporate Euphemisms:** Banned words include *"headwinds"*, *"tailwinds"*, *"softness"*, *"challenging macro"*, *"synergies"*, *"right-sizing"*, and *"streamlining"*. Empirical facts, exact dollar values, and accounting line items must be stated directly.
   - **Strict Metric-to-Finding Assertions:** Every finding must follow the deterministic formula:  
     `[Metric] is [Value]. [Threshold / Benchmark] was [Value]. [Audit Finding: PASS / FLAG / BREACH]`.

---

## 3. The 11+1 Canonical Pipeline Architecture

Execution is unified and full-auto across 11 Master Prompts followed by a mandatory 12th Forensic Crosscheck:

```
[ Step 1: Forensics & Capital Allocation ]
                   │
[ Step 2: Operational Engine & Competitor Radar ]
                   │
[ Step 3: Normalized Owner Earnings (3-Yr Avg Anchor) ]
                   │
[ Step 4: Moat Architecture (Dual Parity: Flywheel vs. Linear Value Chain) ]
                   │
[ Step 5: Qualitative Audit & Symmetrical Balance Sheet ]
                   │
[ Step 6: Valuation Floor: Zero-Growth EPV (10% Static Hurdle) ]
                   │
[ Step 7: Valuation Engine: Reverse DCF & Probabilistic DCF (25/50/25) ]
                   │
[ Step 8: Valuation Synthesis: 100% Expected DCF Anchor ]
                   │
[ Step 9: Lynch Archetype Continuum & Price Bands ]
                   │
[ Step 10: Red Team Forensic Short Attack (ASD-STE100) ]
                   │
[ Step 11: Definitive Verdict & Monitoring Cockpit ]
                   │
[ Step 12: Forensic Audit Crosscheck (Gates 0-4 Pre-Flight Tripwires) ]
```

### Detailed Methodology by Pipeline Part:

#### Part 1: Financial Forensics & Capital Allocation Discipline
- **Document Verification Roll Call:** Cross-reconciles uploaded Form 10-K (or 20-F/40-F), latest 10-Q (or 6-K), DEF 14A proxy, earnings call transcripts, and 10-period CSV financials.
- **Forensic Accounting Audit (4-Vector Buy-Side Cash Integrity Protocol — 3-Year Rolling Window):**
  - Under institutional buy-side principles, brittle single-period academic ratios (DSO, DPO, Sloan NOA Accruals, Beneish M-Score) are permanently eliminated. They mechanically generate false fraud alarms during commodity price drops, inventory cycles, or cash-funded M&A.
  - **Vector 1 (3-Year Cumulative Cash Conversion Reality):** Cumulative 3-year Operating Cash Flow must equal $\ge 85\% - 100\%$ of cumulative GAAP Net Income. Excludes single-quarter working capital timing swings.
  - **Vector 2 (Charlie Munger Zero-EBITDA & Non-GAAP Add-Back Rejection):** Strictly rejects EBITDA and Adjusted EBITDA as valid cash flow measures. Strips recurring add-backs for SBC, restructuring, and M&A integration. Flags if SBC exceeds 10% of OCF (or > 5% of Revenue) without executive performance deduction.
  - **Vector 3 (Aggressive Expense Capitalization & Revenue Pull-Forward):** Audits capitalized software and unbilled contract assets growing at $> 2.0\text{x}$ revenue growth.
  - **Vector 4 (Balance Sheet Asset & Working Capital Integrity):** Productive cash deployment (cash-funded M&A PP&E, factory construction, IRS income tax refund receivables) is strictly recognized as productive capital deployment and NOT penalized as accrual manipulation.
- **Footnote Debt Equivalents (Confirmed Legal Contingency Boundary):** Uncovers unrecorded contractual liabilities:
  - Operating lease liabilities verified under ASC 842 (pre-ASC 842 7.5x rental expense rule eliminated).
  - Net unfunded pension PBO deficits: $(\text{PBO} - \text{Plan Assets}) \times (1 - T)$.
  - Unconditional purchase obligations and debt guarantees (strictly excluding ongoing operational contracts such as cloud compute, freight charters, unvested LTRP salaries, and SaaS deferred revenue).
  - **Confirmed Legal Contingency Boundary:** Deducts strictly confirmed judicial court judgments, posted appeal bonds, signed settlement agreements, or GAAP-probable balance-sheet reserves (ASC 450). Speculative, early-stage class-action lawsuits or uncertified complaint prayers are strictly excluded from balance-sheet debt deductions and tracked qualitatively.
- **Capital Allocation Discipline (William Thorndike & Warren Buffett Framework):**
  - **Buffett's $1 Retained Earnings Test (5-Year Rolling Window & Total Wealth Basis):**
    $$\text{Market Value Creation Ratio} = \frac{\Delta \text{Market Capitalization} + \sum \text{Cash Dividends Paid}}{\sum \text{Retained Earnings}}$$
    Demands $\ge \$1.00$ of total shareholder wealth created for every $\$1.00$ of earnings retained.
  - **Thorndike Share Repurchase Audit:** Evaluates whether share buybacks contracted the diluted share count or merely neutralized employee stock-based compensation (SBC). Repurchases above intrinsic value are classified as value-destructive.
  - **Return on Retained Capital (RORC Test — Recency-Weighted 50/30/20):** Evaluates RORC weighting recent capital productivity to eliminate 10-year scale drag: 50% 3-Year, 30% 5-Year, 20% 10-Year. Hurdle: $> 10.00\%$.

#### Part 2: Operational Engine & Market Analysis
- **Core Business Segments & Unit Economics:** Details revenue streams, pricing power, customer concentration, and geographic exposure.
- **Competitor Moat & Valuation Radar (7-Column Standard GFM Table):**
  $$\text{Columns: } | \text{Competitor / Peer} \mid \text{Gross Margin} \mid \text{Operating Margin} \mid \text{ROIC} \mid \text{EV / True FCF} \mid \text{EV / Owner Earnings} \mid \text{Net Cash / Mkt Cap} |$$
  Surgically benchmarks the subject company against 2 to 4 direct public peers harvested from SEC proxy peer groups and transcripts.
- **Platform Network Effects Scorecard (Bill Gurley Protocol):**
  - Evaluates Gross Margin ($\ge 75\%$), LTV/CAC ($\ge 4.0\text{x}$), Net Revenue Retention (NRR $\ge 110\%$), Gross Churn ($\le 5\%$), and customer concentration ($< 10\%$).
  - **Sector Exemption:** Physical retailers, capital-heavy manufacturers, and logistics pure-plays (e.g. Costco, railroads) are strictly exempted from software gross margin rules and audited on local scale density and asset turnover.

#### Part 3: Normalized Owner Earnings & Cash Flow Integrity
- **The Classical Owner Earnings Equation:** Banned from using basic accounting shorthand ($\text{Net Income} + \text{D\&A} - \text{CapEx}$). Strictly enforces:
  $$\text{Owner Earnings} = \text{Operating Cash Flow} - \text{Maintenance CapEx} - \text{SBC} \pm \Delta \text{Working Capital Normalization} - \text{Tax Normalizations}$$
- **2-Step Empirical Maintenance CapEx Protocol:**
  - *Step A (Discrete Growth Carve-Out):* Inspects 10-K/10-Q Item 7 MD&A disclosures for explicit capacity investments (greenfield plants, new store buildouts, cloud infrastructure) and carves them out from Total CapEx. Never misclassifies disclosed capacity expansions as maintenance simply because single-quarter cyclical revenue dipped.
  - *Step B (3-Year Rolling D&A Baseline):* Benchmarks remaining Maintenance CapEx against $0.85\text{x} - 1.10\text{x}$ 3-Year Rolling Average tangible Depreciation & Amortization.
- **100% Stock-Based Compensation Deduction:** SBC is treated as a hard cash expense, recognizing continuous economic dilution.
- **Adjusted FCF & Tech R&D Capitalization (Red Queen Gate):** For verified tech/software compounders passing the Red Queen Gate, Growth R&D is capitalized and after-tax Growth R&D-Adjusted Owner Earnings carries into Part 7 (Adjusted DCF) and serves as an active valuation input for Part 8 Sovereign Intrinsic Value.
- **3-Year Rolling Average Anchor (Section 1.5):** Uses the 3-year rolling average Normalized Owner Earnings as the forward cash flow baseline to eliminate cyclical peak/trough distortions.
- **Synthesized CSV-Weighted Longitudinal Growth Anchor:**
  $$\text{Weighted Historical Growth} = (3\text{-Yr CAGR} \times 0.50) + (5\text{-Yr CAGR} \times 0.30) + (10\text{-Yr CAGR} \times 0.20)$$

#### Part 4: Structural Moat Architecture & Antifragility (Dual Compounding Parity)
- **Zero Premature Flywheels:** Compounding loops are strictly forbidden in Part 1 and Part 2. Moat compounding is synthesized exclusively in Part 4 Section 1.7.
- **Mandatory Flywheel Falsification Audit:** Does NOT invent artificial compounding loops for cyclical commodity processors or contract builders. If a business lacks an organic loopback, Section 1.7 explicitly asserts:  
  `#### 1.7 Compounding Architecture: LINEAR VALUE CHAIN / CYCLICAL COMMODITY (NO ORGANIC FLYWHEEL)`.
- **Dual Visualizer Parity:**
  - **Branch A (Organic Compounder - e.g. MELI, V, MA):** Renders radial orbital SVG (`viewBox="0 0 640 430"`) with central compounding acceleration core, curved loopback paths, `THE COMPOUNDING RETURN LOOP` banner, and closed-loop Mermaid flowchart (`S5 ==>|Closed-Loop Reinvestment| S1`).
  - **Branch B (Audited Linear Value Chain - e.g. STRL, CALM):** Renders horizontal vector SVG pipeline (`viewBox="0 0 760 140"`) with 5 sequential chevron cards, rightward glowing arrows, Stage 5 terminal node (`TERMINAL NODE`), bottom `AUDIT VERDICT: LINEAR VALUE CHAIN / DISCRETIONARY CAPITAL ALLOCATION` banner, and linear top-to-bottom Mermaid pipeline (`S1 --> S2 --> S3 --> S4 --> S5` with **zero loopback arrow**).

#### Part 5: Qualitative Filing Audit & Hidden Assets (80% ASD-STE100)
- **Symmetrical Balance Sheet Synthesis (3-Column Standard GFM Table):**
  $$\text{Columns: } | \text{Off-Balance-Sheet Vector} \mid \text{Valuation Spread (\$M)} \mid \text{Balance Sheet Impact} |$$
- **Assets Audited:** Real estate replacement values, LIFO inventory reserves, under-recognized intellectual property/royalties, and overfunded pensions.
- **Liabilities Audited:** Operating leases under ASC 842, unfunded pension PBO deficits, environmental reserves, and confirmed legal claims (enforcing the Confirmed Legal Contingency Boundary and Operating Contract Boundary).

#### Part 6: Valuation Floor: Zero-Growth Earnings Power Value (EPV)
- **The Sustainable No-Growth Floor (Bruce Greenwald Framework):** Capitalizes current operational earnings into perpetuity assuming **zero future growth**:
  $$\text{Sustainable Operating NOPAT} = \text{Normalized Operating Income} \times (1 - \text{Effective Tax Rate})$$
  $$\text{Operating EPV} = \frac{\text{Sustainable Operating NOPAT}}{R} \quad (R = 10.00\% \text{ Static Hurdle Rate})$$
  $$\text{Equity EPV} = \text{Operating EPV} + \text{Net Cash} - \text{Footnote Debt Equivalents}$$
- **NOPAT Recency-Weighted Baseline:** Anchors Sustainable NOPAT to the 50% 3-Yr / 30% 5-Yr / 20% 10-Yr Recency-Weighted baseline (or 3-Year Rolling Average). Prohibits extrapolating single-quarter commodity trough margins into perpetuity; capitalizes mid-cycle sustainable earnings power.
- **Confirmed Legal Contingency Boundary:** Deducts only confirmed court judgments, posted appeal bonds, signed settlements, or GAAP-probable ASC 450 reserves. Speculative class actions are strictly excluded from equity debt deductions.
- **The Static Hurdle Rate Mandate:** Banned from using WACC, CAPM, or Beta. Discount rate is fixed at **10.00%** across all models. Risk is managed through Margin of Safety on price, not by manipulating discount rates.

#### Part 7: Valuation Engine: Reverse DCF & Probabilistic Owner Earnings DCF
- **Price-Implied Expectations Reverse DCF (Alfred Rappaport & Michael Mauboussin Framework):**
  - Inverts current market price to solve for:
    1. Implied 10-Year Organic Sales Growth ($g_{\text{implied}}$).
    2. Implied Steady-State Operating Margin ($\text{OPM}_{\text{implied}}$).
    3. Market-Implied Competitive Advantage Period (CAP in years).
  - Calibrates implied metrics against empirical 10-year industry base rate distributions.
- **Probabilistic 10-Year Owner Earnings DCF:**
  - Initial Cash Flow Anchor: 3-Year Rolling Average Normalized Owner Earnings from Part 3.
  - Marginal ROIIC Anchor: Modern 3-to-5 year operational baseline (50% 3-Yr / 30% 5-Yr / 20% 10-Yr).
  - Growth Reinvestment Deduction: `FCF = Sustainable NOPAT * (1 - Reinvestment Rate)`. Zero double-taxation on tech R&D reinvestment.
  - Three probabilistic scenarios discounted at 10.00% static hurdle rate:
    - **Conservative / Bear Case (25% Weight):** Low growth, margin compression, high maintenance capex.
    - **Base Case (50% Weight):** Historical trend continuation anchored to CSV-weighted growth rate.
    - **Optimistic / Bull Case (25% Weight):** Secular TAM expansion, operating leverage, pricing power.
  $$\text{Expected DCF} = (0.25 \times \text{Bear}) + (0.50 \times \text{Base}) + (0.25 \times \text{Bull})$$
  - Terminal Growth Rate capped conservatively at $2.0\% - 2.5\%$.
- **Permanent Elimination of ARV:** Net Asset Reproduction Cost (ARV) is permanently eliminated from intrinsic value weighting under the Buffett-Munger Cash-Flow Sovereign Model.

#### Part 8: Valuation Synthesis & Sensitivity Matrix
- **Cash-Flow Sovereignty Principle:** Intrinsic value is anchored to forward cash flows: **100% to Probability-Weighted Expected DCF** for physical/industrial businesses, or **R&D-Capitalized Expected DCF** for verified tech compounders passing the Red Queen Gate.
- **Zero-Growth EPV Floor Role:** Serves as the conservative sanity-check floor benchmark to establish how much of the stock price is supported by current operations with zero future growth.
- **Quality-Tiered Margin of Safety:**
  - Wide-Moat Stalwarts, Fast Growers, and Net-Cash Cyclical Compounders: $\ge 15\% - 25\%$ Margin of Safety.
  - Moderate-Moat or Pure Cyclicals: $\ge 25\% - 35\%$ Margin of Safety.
  - Turnarounds, Deep Value Asset Plays, or Financially Leveraged Businesses: $\ge 35\% - 50\%$ Margin of Safety.
- **Institutional Valuation Summary Table:** Standard 4-column GFM table detailing EPV vs. Expected DCF vs. Current Market Tape.

#### Part 9: Preliminary Investment Thesis & Lynch Archetype
- **Peter Lynch Archetype Continuum & Cyclical Compounder Disambiguation:**
  - Classifies the asset into *Fast Grower*, *Wide-Moat Stalwart*, *Cyclical Compounder*, *Pure Commodity Cyclical*, *Slow Grower*, *Turnaround*, or *Asset Play*.
  - **4-Point Cyclical Compounder Test (3-to-10 Year Window):** Protects disguised compounders in cyclical sectors (e.g. STLD, Nucor, CALM) via: (1) Trough-to-trough "higher lows" in EPS and BVPS, (2) 3-to-10 year physical unit volume compounding decoupling from spot commodity prices, (3) 3-to-10 year recency-weighted rolling average ROIC > 10.0%, and (4) Countercyclical balance-sheet (net cash) and buyback execution.
- **Target Buy Price Bands (4-Column Standard GFM Table):**
  - **Screaming Buy Band (35% to 50% Margin of Safety / 0.50x to 0.65x IV):** Maximum conviction accumulation tier.
  - **Target Buy Band (15% to 25% Margin of Safety / 0.75x to 0.85x IV):** Standard margin of safety entry tier for high-quality compounders.
  - **Intrinsic Value Parity (0% Margin of Safety / 1.00x IV):** Sovereign fair value ceiling.

#### Part 10: Stress Test: Red Team Forensic Short Attack (80% ASD-STE100)
- **Pre-Mortem Analysis (Gary Klein / Charlie Munger Protocol):** Assumes the investment thesis failed catastrophically 5 years in the future. Identifies the exact causal chain of capital destruction.
- **Short-Seller Vulnerabilities:** Weaponizes 3-year cash flow conversion divergence, unbilled contract assets, executive buyback dilution masking, and competitor radar spreads.

#### Part 11: Definitive Verdict, Resolution & Monitoring Dashboard
- **Definitive Investment Verdict (2-Column Key-Value Table):**
  - Reports Active Portfolio Position, Current Tape Price, Probability-Weighted Intrinsic Value, Margin of Safety, and Final Directive.
  - **Portfolio Directives:**
    - If `holdsPosition: false`: Permissible actions are **`INVEST`** or **`PASS`**.
    - If `holdsPosition: true`: Permissible actions are strictly **`HOLD`**, **`ACCUMULATE`**, or **`LIQUIDATE`** (`TRIM` is strictly banned).
  - **Core Portfolio Decision Contract (The Never-Trim Compounding Doctrine & 4-Gate Isolation Matrix):**
    - *Rule 1 (Archetype Eligibility Gate):* Never-Trim doctrine strictly confined to Fast Growers, Wide-Moat Stalwarts, and verified Cyclical Compounders (rolling ROIC > 10.0%). Pure Commodity Cyclicals, Turnarounds, Slow Growers, and Asset Plays follow strict category exit discipline (selling at peak cycles or fair-value convergence).
    - *Rule 2 (Mandatory 4-Gate Isolation Diagnostic — 3-Year Rolling Window):* Eliminates management excuses and falling-knife traps by auditing: Gate 1 (Peer-Relative Captivity & Share via Part 2 Radar), Gate 2 (Gross Margin Pricing Power vs. Fixed-Cost Volume Deleverage), Gate 3 (Capital Allocation $1 Test / Incremental ROIC $\ge 10\%$ / Zero Diworseification / 3-Year Cash Conversion Reality), and Gate 4 (Zero-Base Thesis Recalibration).
      - **Strict Prohibition of Sunk-Cost Bias (Gate 4):** Evaluates forward intrinsic value strictly against current market price. Comparing forward intrinsic value against `user_cost_basis` to justify `LIQUIDATE` is strictly forbidden.
    - *Rule 3 (Deterministic Execution Routing):*
      - `LIQUIDATE`: Mandatory if failing ANY gate (structural moat decay, capital destruction, or category drift).
      - `FORTRESS BALANCE SHEET & TROUGH PROTECTION`: Net-cash compounders passing Gates 1 & 2 over a 3-year cycle trading at or below Zero-Growth EPV or in Target Buy bands CANNOT be liquidated at cyclical commodity troughs; Senior Value Investor issues `HOLD` (or `ACCUMULATE`).
      - `ACCUMULATE`: Permitted if passing ALL 4 gates AND trading at $\ge 15\% - 20\%$ Margin of Safety discount for Wide-Moat Compounders ($\ge 20\% - 25\%$ for Cyclicals).
      - `HOLD`: Default directive when passing ALL 4 gates above accumulation bands.

#### Part 12: Forensic Audit & Fact-Check Crosscheck (80% ASD-STE100)
- **Mandatory Pre-Flight Tripwire Gates (Gates 0-4):**
  - *Gate 0 (Structural Completeness & Chapter Roll Call):* Verifies all 11 prior chapters are present, sequential, and fully populated.
  - *Gate 1 (Entity & Ticker Integrity Audit):* Verifies zero alien ticker or peer data contamination.
  - *Gate 2 (User Portfolio Directive & Context Alignment):* Audits portfolio holding directive (`HOLD`/`ACCUMULATE`/`LIQUIDATE` vs `INVEST`/`PASS`), the Archetype Eligibility Gate, and the 4-Gate Isolation Diagnostic (with sunk-cost prohibition).
  - *Gate 3 (Valuation Anchor & Math Invariance Audit):* Reconciles Intrinsic Value, EPV, and DCF metrics across Parts 6, 7, 8, and 11 with zero drift.
  - *Gate 4 (Mandatory Arithmetic Proof Scratchpad):* Independent recalculation of scenario weighting (including Tech R&D-Capitalized DCF parity), share count division, quality-tiered target buy bands (`0.75x–0.85x IV`), signed MoS, equity bridge (enforcing Confirmed Legal Contingency & Operating Contract boundaries), and distributable FCF consistency in an authoritative 6-row GFM table.

---

## 4. The 27-Source Literature Codex & Benchmark Matrix

The following matrix provides the definitive grounding between the Value Investing Terminal's automated pipeline and the classical investment literature library. NotebookLM should use this matrix to audit each step against original texts:

| Terminal Part & Methodology | Foundational Book & Author | Specific Chapter / Section | Exact Quantitative Metric / Operational Rule Enforced |
| :--- | :--- | :--- | :--- |
| **Part 1: Buy-Side Cash Integrity Protocol (3-Year Rolling Window)** | *Quality of Earnings* (Thornton L. O'glove), *Financial Shenanigans* (Howard Schilit) & Charlie Munger | O'glove Ch. 4; Schilit Part Two; Munger Zero-EBITDA Doctrine | 4-Vector Cash Integrity Check: 3-Year Cumulative CFO $\ge 85\%-100\%$ of Net Income; rejection of EBITDA/Adjusted EBITDA as cash flow; capitalized costs $< 2\text{x}$ revenue; M&A PP&E separated from accrual manipulation. Brittle single-period DSO/DPO/Sloan/Beneish ratios permanently eliminated. |
| **Part 1: Confirmed Legal Contingency Boundary** | *Security Analysis* (Benjamin Graham & David Dodd, 1934/1940) | Part II: Analysis of Financial Statements (Debt & Contingencies) | Deduct strictly confirmed judicial judgments, posted appeal bonds, signed settlements, or GAAP-probable ASC 450 reserves. Speculative class-action complaint prayers strictly excluded from balance-sheet debt deductions. |
| **Part 1: Buffett $1 Retained Earnings Test (Total Wealth Basis)** | *The Essays of Warren Buffett* (Warren Buffett & Lawrence Cunningham) | Section II: Corporate Finance & Investing ($1 Principle) | $(\Delta \text{Market Value} + \sum \text{Dividends}) / \sum \text{Retained Earnings} \ge \$1.00$ over 5-year rolling window. |
| **Part 1: Share Repurchase Discipline** | *The Outsiders* (William N. Thorndike, Jr., 2012) | Ch. 1–8 (Capital Allocation Profiles); Conclusion | Buybacks must contract share count below share-based dilution and execute below conservative intrinsic value. |
| **Part 2: Competitor Moat Radar** | *Understanding Michael Porter* (Joan Magretta) & Porter (1980) | Ch. 2 (Five Forces); Ch. 3 (Competitive Advantage) | 7-column comparative benchmarking against 2–4 public peers on Gross Margin, Operating Margin, ROIC, and Owner Earnings Yield. |
| **Part 2: Platform Moat Scorecard** | *All Markets Are Not Created Equal* (Bill Gurley) | Benchmark Criteria for Network Effects Platforms | Gross Margin $\ge 75\%$, LTV/CAC $\ge 4.0\text{x}$, NRR $\ge 110\%$, Gross Churn $\le 5\%$, Customer Concentration $< 10\%$. Physical compounders exempted. |
| **Part 3: Normalized Owner Earnings** | *Berkshire Hathaway Annual Report* (Warren Buffett, 1986) | Appendix to 1986 Chairman's Letter: "Owner Earnings" | $\text{OCF} - \text{Maintenance CapEx} - \text{SBC} \pm \Delta \text{Working Capital}$. SBC treated 100% as hard cash outflow. |
| **Part 3: 2-Step Empirical Maintenance CapEx Protocol** | *Value Investing: From Graham to Buffett and Beyond* (Bruce Greenwald et al.) & Warren Buffett | Greenwald Ch. 5; Buffett 1986 Owner Earnings | Step A: MD&A greenfield capacity carve-outs. Step B: $0.85\text{x}-1.10\text{x}$ 3-year rolling D&A baseline. Replaces brittle revenue-delta formula. |
| **Part 3: Tech R&D Capitalization & Red Queen Test** | *Quality Investing* (Lawrence Cunningham) & *Common Stocks and Uncommon Profits* (Philip Fisher) | Cunningham Ch. 3; Fisher Ch. 4 | For verified tech compounders passing Red Queen Gate, Growth R&D is capitalized and after-tax Growth R&D-Adjusted Owner Earnings carries into Part 7 & 8 Sovereign Intrinsic Value. |
| **Part 3: 3-Year Cash Flow Rolling Anchor** | *Security Analysis* (Graham & Dodd, 1940) | Ch. 31: The Concept of Earning Power | 3-year rolling average eliminates cyclical margin peak/trough distortions before forward DCF projection. |
| **Part 4: Structural Moat Trajectory** | *Competition Demystified* (Bruce Greenwald & Judd Kahn, 2005) & *7 Powers* (Hamilton Helmer, 2016) | Greenwald Ch. 2–3 (Customer Captivity, Scale); Helmer Ch. 1–7 | Empirical isolation of scale economies, network effects, counter-positioning, switching friction, and pricing power. |
| **Part 4: Dual Compounding Parity (Flywheel vs. Linear)** | *Good to Great* (Jim Collins, 2001) & *Quality Investing* (Lawrence Cunningham et al., 2016) | Collins Flywheel Concept; Cunningham Ch. 3 (Reinvestment Moats) | Organic compounders render closed-loop flywheel ($S5 \implies S1$). Linear project/commodity firms render linear pipeline with zero loopback arrow. |
| **Part 5: Symmetrical Balance Sheet Synthesis** | *Margin of Safety* (Seth Klarman, 1991) & *Creative Cash Flow Reporting* (Mulford & Comiskey) | Klarman Ch. 8 (The Art of Business Valuation); Mulford Ch. 6 | Off-balance sheet asset reserves (real estate, LIFO) reconciled symmetrically against hidden liabilities and contingent claims. |
| **Part 6: Zero-Growth Earnings Power Value (EPV)** | *Value Investing* (Bruce Greenwald, Judd Kahn et al., 2001) | Ch. 2: The Three Sources of Value; Ch. 5: Earnings Power Value | $\text{Sustainable NOPAT} / 0.10 + \text{Net Cash} - \text{Footnote Debt}$. Mid-cycle earnings power capitalized; zero growth assumed. Floor benchmark for valuation. |
| **Part 6 & 7: Static 10% Hurdle Rate** | *The Essays of Warren Buffett* (Warren Buffett) & *Poor Charlie's Almanack* (Charlie Munger) | Section II: Corporate Finance; Munger Speech: Academic Economics | Academic WACC, Beta, and CAPM permanently banned. Static 10.00% hurdle rate enforces absolute return discipline. |
| **Part 7: Reverse DCF Expectations Protocol** | *Expectations Investing* (Alfred Rappaport & Michael J. Mauboussin, 2001/2021) | Ch. 1–4 (The Expectations Framework, Inversion Process) | Invert market price for implied 10-Yr sales CAGR ($g_{\text{implied}}$), operating margin ($\text{OPM}_{\text{implied}}$), and CAP duration vs. base rates. |
| **Part 7: Probabilistic Owner Earnings DCF** | *Valuation: Measuring and Managing the Value of Companies* (McKinsey / Tim Koller et al.) | Ch. 7: Forecasting Performance; Ch. 9: Scenario Valuation | 3 probabilistic scenarios (Bear 25% / Base 50% / Bull 25%) discounted at 10.00%. Terminal growth capped at $2.0\% - 2.5\%$. |
| **Part 8: Cash-Flow Sovereign Valuation & Quality-Tiered MoS** | *The Intelligent Investor* (Graham, 1949) & *The Essays of Warren Buffett* | Graham Ch. 20 (Margin of Safety); Buffett 1992 Letter | Intrinsic Value anchored to Expected DCF (or R&D-Capitalized DCF for verified tech compounders). Quality-tiered MoS: 15%-25% for wide-moat compounders, 25%-35% for cyclicals, 35%-50% for turnarounds. |
| **Part 9: Lynch Archetype Continuum & 4-Point Test** | *One Up On Wall Street* (Peter Lynch, 1989) | Ch. 9: The Six Categories of Stocks | Classifies into 7 disambiguated archetypes. 4-Point Cyclical Compounder Test over 3-10 yr window protects disguised compounders from false cyclical tagging. |
| **Part 9: Target Buy Price Bands** | *Margin of Safety* (Seth Klarman, 1991) & *The Little Book of Value Investing* (Christopher Browne) | Klarman Ch. 2; Browne Ch. 3 (Buy Cheap) | Deep Value Band (50% MoS / 0.50x IV), Screaming Buy Band (35% MoS / 0.65x IV), Target Buy Band (15%-25% MoS / 0.75x-0.85x IV), Intrinsic Value Parity (0% MoS / 1.00x IV). |
| **Part 10: Red Team Forensic Short Attack** | *Poor Charlie's Almanack* (Charlie Munger) & *Antifragile* (Nassim Nicholas Taleb, 2012) | Munger: Inversion Principle; Taleb Ch. 1–4 (Via Negativa) | Pre-mortem analysis assumes capital destruction 5 years out. Short-seller attack challenges 3-year cash flow conversion and customer concentration. |
| **Part 11: Never-Trim Compounding Doctrine & Sunk-Cost Prohibition** | *100 to 1 in the Stock Market* (Thomas Phelps, 1972), *100 Baggers* (Christopher Mayer, 2015), Charlie Munger | Phelps Ch. 1–3 (Coffee-Can Portfolio); Mayer Ch. 2; Munger Sunk Cost Principle | TRIM banned. Permissible directives strictly `HOLD`, `ACCUMULATE`, or `LIQUIDATE`. Gate 4 strictly bans comparing forward IV against user cost basis. Fortress Balance Sheet Protection protects net-cash compounders from trough liquidation. |
| **Part 12: Forensic Crosscheck Tripwires** | *The Checklist Manifesto* (Atul Gawande, 2009) & Munger Checklist Investing | Gawande Ch. 3–5; Munger Investing Checklists | Automated pre-flight tripwires (Gates 0–4) enforce structural completeness, entity isolation, holding directive alignment, valuation invariance, Confirmed Legal Contingency boundary, and arithmetic scratchpad recalculation before report delivery. |

---

## 5. The 5 Inviolable Formatting Laws Reference

To guarantee deterministic Obsidian Markdown and Standalone HTML rendering across all client devices without layout drift, the terminal enforces:

1. **Zero Raw LaTeX Math:** All equations must be plain-text markdown or bullet points. Strictly forbidden from outputting `\begin{aligned}`, `$$...$$`, `\mathbf{...}`, `\text{...}`, or `\frac{...}{...}`.
2. **Zero ASCII / Monospace Typewriter Tables / Code-Fenced Prose / Text Progress Bars / Sliders / Box Characters:** Strictly forbidden from outputting ASCII borders (`====`, `----`), typewriter boxes, Unicode box lines (`│`, `┌`, `└`), typewriter sliders (`$0.00 ─── [$X] ───>`), ASCII arrows (`──>`), or text progress bars (`[#####]`). ALL tables must use standard GitHub-Flavored Markdown (GFM) pipe syntax.
3. **Numbered Compounding Architecture & Dual Parity:** Flywheels and Linear Value Chains must use numbered stages (1 to 5) with bold titles (`1. **[Stage Name]**: ...`). Dual visualizer parity renders circular SVG/Mermaid for flywheels, and horizontal pipeline SVG/Mermaid with zero loopback for linear value chains.
4. **Dual-Format Delivery Contract:**
   - `.md`: Line 1 YAML frontmatter with 11-13 canonical keys (`ticker`, `company`, `period`, `market_price`, `intrinsic_value`, `margin_of_safety`, `decision`, `user_cost_basis`, `user_portfolio_weight`).
   - `.html`: Standalone single-file portability, zero external CDNs, high-contrast typography, sticky first table columns, and direct extraction of cockpit metrics from Line 1 YAML.
5. **Parser & Chart Invariance:** Resilient numeric parsing stripping markdown bolding (`**($19.00)**` -> `-19.00`), trend series disambiguation (filtering percentage rows from dollar cash flow charts), and concise audit badges (`PASS`, `FLAG`, `BREACH`).

---

## 6. Automated Verification Infrastructure (14 Verification Gates + Offline Snapshot Suite)

Every code change, prompt edit, or guard modification must pass the automated pre-flight testing suite:

```powershell
npm test          # Runs both test:engine (14 Gates) and test:format (Offline Snapshot Suite)
npm run lint      # tsc --noEmit: 0 TypeScript errors allowed
npm run build     # Production Vite client bundle + esbuild Node server
```

### The 14 Engine Verification Gates (`scripts/test_engine_prompts.ts`):
1. **Gate 1:** Master Prompts Count (Exactly 11 canonical prompts).
2. **Gate 2:** Crosscheck Prompt Integrity (Part 12).
3. **Gate 3:** Chapter Titles Mapping (All 12 step titles).
4. **Gate 4:** Step 1 Buy-Side Cash Integrity Protocol (4 Vectors), Zero-EBITDA Doctrine & Capital Allocation Discipline.
5. **Gate 5:** Step 2 Platform Network Effects Scorecard & Macro Survey Elimination.
6. **Gate 6:** Step 3 Authoritative Owner Earnings, 2-Step Empirical Maintenance CapEx & 3-Year Rolling Average Anchor.
7. **Gate 7:** Step 7 Reverse DCF Expectations Protocol & 50/30/20 Recency Weighting.
8. **Gate 8:** Step 8 Valuation Synthesis (Expected DCF & Tech R&D-Capitalized DCF Parity; Quality-Tiered MoS; ARV eliminated).
9. **Gate 9:** Step 10 Red Team Forensic Short Attack.
10. **Gate 10:** Step 11 Definitive Verdict, Sunk-Cost Prohibition, Fortress Balance Sheet Protection & Monitoring Dashboard.
11. **Gate 11:** Bimodal Voice Architecture across all 12 steps.
12. **Gate 12:** Dossier Format Guard (Static Prompt Directives, Mermaid preservation, zero LaTeX, GFM tables, dual visualizer parity, zero hardcoded tickers).
13. **Gate 13:** Trend Series Disambiguation & Single Trajectory Chart Latch.
14. **Gate 14:** Hardcore Anti-Anchoring Firewall & Multi-Mode Prompt Integrity.

### The Offline Golden Snapshot Regression Suite (`scripts/test_format_regression.ts`):
- Runs against [`tests/fixtures/golden_dossier_fixture.md`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/tests/fixtures/golden_dossier_fixture.md) in **34 milliseconds** with zero API calls.
- Programmatically verifies zero LaTeX, zero typewriter sliders, rogue fence unwrapping, linear value chain zero-loop parity, and HTML standalone cockpit integrity.

```

## 1.3 DOSSIER_FORMAT_SPEC.md (Institutional Formatting Specification)
```markdown
# Value Investing Terminal — Dossier Formatting Specification & Architecture Reference
*Canonical Baseline: v1.1-pre-aesthetic-refactor (Tag: `v1.1-pre-aesthetic-refactor`)*

This document defines the exact architecture, rendering rules, data visualization pipelines, and styling specifications for all Institutional Valuation Dossiers generated by the **Value Investing Terminal**.

If future changes need to be audited, modified, or rolled back, this document and git tags `v1.0-dossier-golden-format` and `v1.1-pre-aesthetic-refactor` serve as the immutable single sources of truth.

---

## 1. Dual-Output Export Pipeline & Multi-Mode File Conventions

Every analysis run produces two synchronized output formats, systematically tagged with both the **active AI model**, **session mode**, and the **evaluation date** to guarantee collision-free multi-model comparisons:
1. **Obsidian Markdown (`.md`)**:
   - **Mode 1 Slingshot Triage:** `${tickerStr} ${periodStr}${releaseTag}_Slingshot_Memo_${modelName}_${formattedDate}.md`
   - **Mode 2 Full Institutional Dossier:** `${tickerStr} ${periodStr}${releaseTag}_Complete Doc_${modelName}_${formattedDate}.md`
   - **Mode 3 Quarterly Sentinel:** `${tickerStr} ${periodStr}${releaseTag}_Sentinel_Pulse_${modelName}_${formattedDate}.md`
   - Prepend structured **YAML Frontmatter** at line 1 (includes `ticker`, `company`, `period`, `market_price`, `intrinsic_value`, `margin_of_safety`, `decision`, `lynch_profile`, `date`, `ai_model`, and `tags`). In Mode 1, `decision` can be `INVEST`, `PASS`, or `ESCALATE`.
   - Native Obsidian Knowledge Graphs, local linking (`![[...]]`), Markdown callouts (`> [!NOTE]`), and interactive Mermaid flowchart diagrams.
   - Chapter-level titles mapped cleanly via `STEP_CHAPTER_TITLES` (`Part 1: Financial Forensics...` through `Part 12: Forensic Audit...`, plus `Part 13: Double-Blind Dual-Valuation Synthesis`), eliminating raw machine engine markers (`[Step X Output]`).
2. **Institutional Standalone HTML (`.html`)**:
   - **Filename Convention:** `${cleanTicker} ${cleanPeriod}${releaseTag}_Valuation_Dossier_${modelName}_${formattedDate}.html`.
   - Fully self-contained single-file executive report with zero external CDN dependencies, embedded WebP vector/image assets, interactive Quick Jump Navigator, dynamic Dark/Light theme toggle, and print-to-PDF formatting.
   - High-contrast institutional typography: bold terms are rendered in crisp text primary (`#f8fafc` dark / `#0f172a` light) rather than neon green, preserving emerald accents strictly for quantitative badges, KPI cards, and valuation highlights.

---

## 2. Heading Hierarchy & Navigation Architecture

### Chapter-Level Institutional Hierarchy
Machine engine markers (`## [Step X Output]`) are mapped to executive chapter headers:
* `Part 1: Financial Forensics & Capital Allocation Discipline`
* `Part 2: Operational Engine & Market Analysis`
* `Part 3: Normalized Owner Earnings & Cash Flow Integrity`
* `Part 4: Structural Moat Architecture & Antifragility`
* `Part 5: Qualitative Filing Audit & Hidden Assets`
* `Part 6: Valuation Floor: Zero-Growth Earnings Power Value (EPV)`
* `Part 7: Valuation Engine: Probabilistic Owner Earnings DCF & Reverse DCF`
* `Part 8: Valuation Synthesis & Sensitivity Matrix`
* `Part 9: Preliminary Investment Thesis & Lynch Archetype`
* `Part 10: Stress Test: Red Team Forensic Short Attack`
* `Part 11: Definitive Verdict, Resolution & Monitoring Dashboard`
* `Part 12: Forensic Audit & Fact-Check Crosscheck`
* `Part 13: Double-Blind Dual-Valuation Synthesis` (Post-Execution Synthesis)

### Unique ID Generation & Deduplication
To ensure 100% reliability in navigation, every heading level ($H_1$ through $H_4$) is stripped of markdown symbols and assigned a deterministic, sanitized DOM ID:
```typescript
let baseId = `sec-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
if (!baseId || baseId === 'sec') baseId = `sec-heading-${headerCount}`;
let secId = baseId;
let counter = 1;
while (usedIds.has(secId)) {
  secId = `${baseId}-${counter++}`;
}
usedIds.add(secId);
```

### Viewport Scroll Offset
All headings with an `id` attribute have smooth scrolling and an `80px` margin to guarantee they never collide with fixed toolbars or viewport edges:
```css
html {
  scroll-behavior: smooth;
}
h1[id], h2[id], h3[id], h4[id] {
  scroll-margin-top: 80px;
}
```

### Floating Quick Jump Navigator
* **Structure:**
  * Fixed floating pill button at bottom-right (`bottom: 24px; right: 24px; z-index: 100`).
  * Dropdown drawer (`.toc-menu`, `max-height: 440px; width: 320px; overflow-y: auto; backdrop-filter: blur(8px)`).
  * On Mobile (`max-width: 768px`): Automatically expands to full width (`width: calc(100vw - 32px); right: 16px; bottom: 60px;`).
* **Checklist De-cluttering:**
  * Repetitive step summary checklist headings (`Step Summary Checklist`, `Verification Checklist`) are filtered from the TOC list, ensuring high signal-to-noise ratio.
* **Visual Hierarchy in Menu:**
  * Level 1 & 2 sections: Primary font weight, standard left padding.
  * Level 3 sections (`.toc-indent-3`): `padding-left: 1.35rem; font-size: 11px; color: var(--text-muted);`.
* **Dynamic Scrollspy:**
  * Uses a high-performance passive `scroll` listener calculating `rect.top <= 140px` on all headings.
  * Dynamically updates the floating button text with the active section: `📑 [Active Section Title] ▾`.
  * Highlights the current active section link with an emerald accent indicator (`border-left: 3px solid var(--accent-emerald)`).
* **Click Action (`jumpToSection(event, id)`):**
  * Closes dropdown immediately.
  * Executes smooth scroll into view.
  * Updates browser URL hash without causing a page jump glitch.
* **Mobile Software Keyboard Prevention Mandate:**
  * Floating Quick Jump Navigator must NEVER contain text filter inputs (`<input>`) or autofocus triggers (`input.focus()`). On mobile smartphones (iOS/Android touchscreens), focusing an input immediately summons the on-screen software keyboard, which completely obstructs the section list and distorts viewport scrolling. The menu is strictly a zero-keyboard, tap-to-select anchor list.

---

## 3. Data Visualizations & Financial Cards

The HTML renderer automatically inspects Markdown tables and parses them into custom interactive CSS/SVG components:

| Chart Type | Trigger Condition | Visual Output |
| :--- | :--- | :--- |
| **Cash Flow Trajectory** | Longitudinal Table in Part 3 Sec 1.4 with >= 80% time headers + distinct OCF & Owner Earnings rows (Single-instance latch enforced; strictly excludes RORC and CAGR calibration tables) | SVG dual-line chart with data point callouts ($M) and custom legend. |
| **Competitor Radar & Moat Matrix** | Table with category ranking, Target Anchor, and Peer Median | Vector SVG Radar polygon and institutional comparative GFM table. |
| **Debt Maturity Profile** | Table with debt amounts, maturity dates, and interest rates | Proportional horizontal bar charts with yield badges and maturity timeline. |
| **Revenue Segment Mix** | Table with business or geographic segment percentage splits in Part 1 Sec 1.2 (Strictly prioritizes `% of Total Revenue` / `Share %`; excludes `YoY Growth Rate (%)`; omits sub-component rows prefixed with `—`, `–`, `-`) | Stacked segmented progress bar with colored legend pills. |
| **Valuation Formula Cards** | Blockquotes containing `Formula / Calculation:` | Styled accent card (`.formula-card`) with monospace font and `Valuation Formula` badge. |

### Revenue Mix Visualizer Rules (Part-to-Whole Invariant)
* **Priority Column Matching:** Segment mix stacked bars must visualize composition (part-to-whole), never growth velocity. Programmatic parsers must prioritize columns named `% of Total Revenue`, `Share %`, or `Revenue Share`, and strictly exclude columns containing `growth`, `yoy`, `cagr`, `change`, `margin`, `take rate`, or `rate`.
* **Sub-Component Filtering:** Rows starting with dashes (`—`, `–`, `-`) indicate sub-segment breakdowns and must be excluded from primary stacked bars to avoid double-counting and ensure segments sum cleanly to 100%.

### Table Cell Badges & Column Width Invariance
* **Audit Finding Badges (`.audit-badge`):** Badges (`badge-pass`, `badge-flag`, `badge-breach`) are strictly reserved for concise, standalone audit verdicts (`<= 30` characters, e.g., `PASS`, `FLAG`, `BREACH`, `FAIL`, `CLEAN`, `CORROBORATED`).
* **Trigger Condition Invariance:** Explanatory trigger condition sentences (e.g. starting with `"Flag if..."` or containing conditional clauses like `\bif\b`) MUST NOT be converted into audit badges. They must render as standard wrapped table text.
* **Cell Word-Break Protection:** All table cells (`th`, `td`) enforce `overflow-wrap: break-word` and `word-break: normal` to guarantee that multi-sentence threshold descriptions wrap naturally without expanding column widths or pushing subsequent columns off-screen.

---

## 4. Dual Compounding Architecture (Flywheel vs. Linear Value Chain)

In **Part 4, Section 1.7**, the raw text or numbered stage list is transformed into an interactive dual-branch compounding visualization:

The terminal enforces factual economic reality: businesses with network effects and scalable digital platform loops possess compounding flywheels; linear project contractors or cyclical commodity manufacturers do NOT have organic flywheels. The visualizer dynamically switches between two branches based on the model's falsification audit in Section 1.7:

### Branch A: Organic Compounding Flywheel (MELI, V, MA)
1. **Interactive Mermaid Flowchart:**
   ```mermaid
   flowchart TD
       S1["Stage 01: Marketplace Entry & Scale"] --> S2["Stage 02: Logistics Reinforcement"]
       S2 --> S3["Stage 03: Fintech Velocity"]
       S3 --> S4["Stage 04: Data Moat & Credit Scoring"]
       S4 --> S5["Stage 05: Retail Media Monetization"]
       S5 ==>|<b>Closed-Loop Compounding Reinvestment</b>| S1
   ```
2. **Obsidian Callout:** `> [!NOTE] **${ticker} Compounding Architecture**`
3. **HTML Diagram:** Radial Orbital Vector SVG (`viewBox="0 0 640 430"`) with central compounding acceleration core and curved loopback paths.
4. **HTML Banner:** `THE COMPOUNDING RETURN LOOP` detailing reinvestment of terminal cash flows back into Stage 01.

### Branch B: Audited Linear Value Chain (STRL, CALM)
1. **Interactive Mermaid Flowchart (Zero Loopback Arrow):**
   ```mermaid
   flowchart TD
       classDef default fill:#0b0e14,stroke:#0284c7,stroke-width:2px,color:#f8fafc,rx:8,ry:8;
       classDef terminal fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#94a3b8,rx:8,ry:8;

       S1["<b>Stage 01: Project Screening & Bidding Discipline</b>"]
       S2["<b>Stage 02: Specialized Fleet & Labor Mobilization</b>"]
       S3["<b>Stage 03: Precision Infrastructure Project Execution</b>"]
       S4["<b>Stage 04: Milestone Cash Collection & Profit Realization</b>"]
       S5["<b>Stage 05: Discretionary Capital Allocation (No Organic Loopback)</b>"]

       S1 --> S2
       S2 --> S3
       S3 --> S4
       S4 --> S5

       class S1,S2,S3,S4 default;
       class S5 terminal;
   ```
2. **Obsidian Callout:** `> [!NOTE] **${ticker} Linear Value Chain Architecture (Audited: No Organic Flywheel)**`
3. **HTML Diagram:** Horizontal Pipeline Vector SVG (`viewBox="0 0 760 140"`) with 5 sequential cards, glowing directional arrows (`➔`), and terminal node styling with zero return arrow.
4. **HTML Banner:** `AUDIT VERDICT: LINEAR VALUE CHAIN / DISCRETIONARY CAPITAL ALLOCATION` detailing that operating cash flows do NOT automatically re-enter the loop, making compounding strictly dependent on management's disciplined capital deployment.

---

## 5. Styling & Theme Engine

### Color Palette & CSS Variables

| Variable | Light Theme | Dark Theme (`[data-theme="dark"]`) |
| :--- | :--- | :--- |
| `--bg-page` | `#f8fafc` (Slate 50) | `#0b0f17` (Deep Navy Charcoal) |
| `--bg-card` | `#ffffff` | `#111827` (Rich Gray 900) |
| `--border-card` | `#e2e8f0` | `#1e293b` (Slate 800) |
| `--text-primary` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) |
| `--text-secondary` | `#334155` (Slate 700) | `#cbd5e1` (Slate 300) |
| `--text-muted` | `#64748b` (Slate 500) | `#94a3b8` (Slate 400) |
| `--accent-emerald` | `#059669` (Emerald 600) | `#10b981` (Emerald 500) |
| `--table-header-bg` | `#f8fafc` | `#1a2234` |
| `--table-row-alt` | `#fcfcfd` | `#131b2c` |

### Dark / Light Mode Persistence
Theme is toggled via `#theme-btn` and persisted in `localStorage('invest_dossier_theme')`. On load, the saved preference is immediately restored before first paint.

### Print / Save to PDF
Includes dedicated `@media print` rules:
* Removes UI toolbars and floating buttons (`.toolbar-bar, .toc-floating-btn, .toc-menu { display: none !important; }`).
* Forces clean white background (`#ffffff !important; color: #0f172a !important;`).
* Page-break controls:
  * `page-break-after: avoid; break-after: avoid;` on all headings ($H_1$, $H_2$, $H_3$).
  * `page-break-inside: avoid; break-inside: avoid;` on all tables, charts, and cards.
  * Responsive for both Portrait and Landscape print settings.

---

## 6. Table Sanitization & Epistemic Flow Mandates

Both Markdown and HTML pipelines execute automated cleaning before rendering via `src/utils/dossierFormatGuard.ts`:
1. **Zero Monospace Typewriter Borders, Box Drawing Characters & Blocks:** Strips all ASCII/typewriter borders (`====`, `----`, `++++`), Unicode box characters (`│`, `┌`, `└`, etc.), unwraps prose/tables trapped in markdown code blocks, eliminates ASCII hash progress bars (`[#####]`), and removes typewriter sliders (`$0.00 ─── [$X] ───>`) and ASCII arrows (`──>`).
2. **Obsidian GFM Standard Pipe Tables (`normalizeSinglePipeTables`):** Every markdown table must possess a valid GFM header and separator row (`| Header 1 | Header 2 |` followed by `| :--- | :--- |`). Single-pipe pseudo-headers (`| TITLE |`) are transformed into clean markdown headings (`### Title`), and table rows lacking separators are dynamically reconciled with alignment dividers so Obsidian never collapses them into monospace text.
3. **Piped Bullet List Transformation:** Bullet items formatted with pipe delimiters (e.g. `* **PEER** | Col | ...`) are strictly prohibited and programmatically converted to clean GFM pipe tables.
4. **Standard Table Schemas & Aesthetic Layouts:**
   - **Competitor Moat & Valuation Radar (Part 2, Sec 1.4):** 7 columns (`| Competitor / Peer | Gross Margin | Operating Margin | ROIC | EV / True FCF | EV / Owner Earnings | Net Cash / Mkt Cap |`).
   - **Probabilistic DCF Scenarios & Projections (Part 7, Sec 2):** 4 columns (`| Valuation Scenario | Probability Weight | Per Diluted Share Value | Implied MoS vs. Market Tape |`).
   - **Lynch Category Continuum (Part 9, Sec 1.1):** 3 columns (`| Peter Lynch Archetype | Classification Status | Empirical Operational Validation |`).
   - **Target Buy Price Bands (Part 9, Sec 1.4):** 4 columns (`| Target Buy Price Band | Price Range ($) | Margin of Safety Discount | Allocation Directive |`).
   - **Definitive Investment Verdict (Part 11, Step 4):** 2 columns (`| Decision Parameter | Audited Portfolio Verdict |`).
   - **Symmetrical Balance Sheet Synthesis (Part 5, Sec 2):** 3 columns (`| Off-Balance-Sheet Vector | Valuation Spread ($M) | Balance Sheet Impact |`).
   - **Chapter Preamble Summaries (Parts 2, 3, 7, 8):** 4 columns (`| Strategic Parameter | Audited Economic Anchor | Strategic Parameter | Audited Economic Anchor |`). Typewriter boxes and leading 4+ spaces triggering dark monospace code blocks in Obsidian are strictly eliminated.
5. **Zero Premature Flywheels & Falsification Directive (`stripPrematureFlywheels`):** Compounding loops/flywheels are strictly banned from Part 1 and Part 2 (e.g. Section 1.1 Core Business & Economic Engine). Section 1.1 is normalized to empirical operational pillars. Full compounding flywheels are synthesized exclusively in Part 4 Section 1.7. If a company is a cyclical commodity processor or linear manufacturer without an organic compounding flywheel, the engine explicitly falsifies the flywheel: `#### 1.7 Compounding Architecture: LINEAR VALUE CHAIN / CYCLICAL COMMODITY (NO ORGANIC FLYWHEEL)`. In HTML dossiers, redundant stage text lists ("Flywheel Mechanics Walkthrough") are suppressed when the interactive diagram and cards render.
6. **Cockpit Frontmatter Ground-Truth Invariant:** The standalone HTML executive cockpit (`extractCockpitData` in `src/utils/googleDocs.ts`) strictly reads `market_price` from Line-1 YAML frontmatter (`market_price:`), never guessing prices via fragile body regexes.
7. **Institutional HTML Table Styling & Column Alignment:** Converts raw Markdown tables to clean institutional HTML data tables (`.dossier-table`) with alternating row shading. Numeric-only columns right-align (`.cell-numeric`), while 2-column key-value / verdict tables and mixed text-numeric cells left-align cleanly with padding (`.cell-verdict-val`, `text-align: left !important; padding-left: 1.5rem !important;`), preventing jagged zig-zag margins.
8. **Sticky First Column:** Sticky metric column on horizontal scroll for mobile and tablet screens:
   ```css
   .dossier-table td:first-child,
   .dossier-table th:first-child {
     position: sticky;
     left: 0;
     background-color: var(--bg-card);
     z-index: 2;
   }
   ```

---

## 7. Buy-Side Desk Nomenclature & Zero-Academic-Citation Mandate

To maintain the authority of an institutional buy-side desk (Baupost, Bridgewater, Gotham) and eliminate academic lecture tone, dossiers strictly omit textbook and creator names:
* `Greenwald EPV` ➔ **Earnings Power Value (EPV)** or **Zero-Growth EPV Floor**.
* `Greenwald Asset Value Reproduction` ➔ **Net Asset Reproduction Floor (ARV)** (Permanently eliminated under Cash-Flow Sovereign Model).
* `Sloan Accrual Ratio` ➔ **Balance Sheet Accrual Ratio** or **Earnings Quality Spread**.
* `Beneish M-Score` ➔ **Earnings Manipulation Risk Index**.
* `Graham-Buffett-Greenwald Framework` ➔ **Cash-Flow Sovereign Valuation Framework** or **Proprietary Valuation Triad**.
* `Mauboussin / Rappaport Reverse DCF` ➔ **Market-Implied Expectations Reverse DCF**.
* `Schilit / O'glove Forensic Shenanigans` ➔ **Forensic Accounting & Earnings Quality Audit**.
* `Thorndike Capital Allocation / Buybacks` ➔ **Capital Allocation & Share Repurchase Discipline**.
* `Bill Gurley / Hamilton Helmer Moat Scorecard` ➔ **Platform Network Effects & Structural Moat Scorecard**.

Enforced across prompt templates, system instructions, and programmatic scrubbing in `dossierFormatGuard.ts`.

---

## 8. Rollback & Backup Instructions

If any subsequent update introduces regression or undesired behavior, use the following commands to inspect or restore this golden baseline:

### View Differences Against Golden Baseline
```powershell
git diff v1.0-dossier-golden-format
```

### Roll Back to Golden Baseline
```powershell
git checkout v1.0-dossier-golden-format -- src/utils/googleDocs.ts src/components/MarkdownView.tsx src/assets/meliFlywheelBase64.ts
npm run build
```

### Key Source Files Map
* **HTML Dossier Generator & TOC Navigator:** `src/utils/googleDocs.ts`
* **Markdown Renderer & Mermaid Flywheel:** `src/components/MarkdownView.tsx`
* **Optimized WebP Flywheel Asset:** `src/assets/meliFlywheelBase64.ts`
* **Vault Attachment Graphic:** `public/meli_flywheel.jpg` & `99_Attachments/MELI_Compounding_Flywheel.jpg`
* **Document Prompts & Valuation Chain:** `src/prompts.ts` & `Investment Analysis and Valuation Framework Master Prompts.txt`

```

## 1.4 system_instructions.txt (Gemini API System Instruction)
```text
You are a highly skilled institutional buy-side value investor executing our desk's proprietary valuation framework. You identify undervalued companies with strong fundamentals, sustainable competitive advantages, and long-term growth potential. You are acutely aware of psychological biases. Your analysis must be rigorous, objective, deeply insightful, and completely verifiable. All outputs MUST be verified by a human analyst. This LLM is a tool, not a decision-maker. Your primary function is to extract and organize information accurately, not to provide investment advice.

Mission:
Analyze a company to determine its suitability as a long-term investment. You will be provided with documents: the company's 10-K (or Form 20-F / 40-F for Foreign Private Issuers), the most recent 10-Q or Form 6-K (if newer than the annual report), and the latest Earnings Call Transcript. Note: For Foreign Private Issuers (FPIs), Form 20-F or 40-F serves as the full equivalent of the annual 10-K, and Form 6-K (Quarterly Results / Interim Reports) serves as the 10-Q equivalent. If any of these documents are NOT provided, state this clearly at the beginning of your analysis and adjust your analysis accordingly, relying only on available information. Extract key information, perform calculations, conduct analyses, and answer critical questions using a value investing framework.

Approach:
* Accuracy is Paramount: Prioritize accuracy above all else. Double-check all figures and ensure consistency with source documents.
* Value Investing Principles: Apply value investing principles: intrinsic value, margin of safety, long-term growth, competitive advantage (moat), management quality, and capital allocation.
* Critical Analysis: Do not simply summarize. Analyze critically. Identify trends, inconsistencies, potential risks, and opportunities. Challenge assumptions.
* Red Team Mentality: The entire analysis is an exercise in trying to prove the initial thesis wrong. Assume you are a skeptical, well-informed short-seller. Your job is to find the fatal flaw. Only a thesis that survives this relentless attack is worthy of investment.
* Iterative Refinement: Embrace an iterative approach. Revisit assumptions and calculations, especially in valuation sections, as you gather more information. Be prepared to adjust initial estimates. 
* Clarity and Conciseness: Present findings clearly, concisely, and in a well-organized manner. Use tables, bullet points, and Markdown formatting. Prioritize brevity without sacrificing substance.
* Meticulous Source Citation: Cite the source document and page number (if applicable) for every piece of information and analysis. Be extremely precise. If information is not in the provided documents, request the missing information.
* "Information Not Found": If a requested piece of information cannot be found in the provided documents state "Information Not Found". Do NOT guess, estimate, or fabricate data.
* Information Recency: Prioritize information from the 10-Q (or Form 6-K quarterly results) if it's newer than the 10-K / 20-F. This rule is absolute and applies universally to ALL tiers and steps of the analysis, especially the Red Team and Thesis Resolution phases. Never rely on an annual report for risk factors or litigation status if a more recent quarterly/interim filing is available.
* Date Specificity: When requesting data, specify the date range or "as of" date whenever possible.
* Date Extraction: For each piece of data extracted from an external source, also extract the date the information was published or last updated. Report this date alongside the data. If the information is older than the most recent 10-Q / 6-K, flag it as potentially outdated.
* Chronological Fidelity, Causality & Subsequent Events: You must respect the strict sequence of corporate reporting periods. You may never attribute the financial results of a specific period to an event that occurred *after* that period closed (e.g., blaming Q3 margin compression on a Q4 'Subsequent Event'). Cause must logically precede effect. However, you must NEVER ignore major subsequent events. You must accurately sequence them: evaluate past results based on past catalysts, and evaluate subsequent events as forward-looking capital allocation decisions, future risks, or future catalysts.
* Unified Full-Auto Single-Phase Execution: The terminal executes a single, deep, institutional pass where every metric, footnote, and valuation tier is audited with maximum depth on the first pass. Phased execution mode is decommissioned.
* Lollapalooza Effects: Be alert for situations where multiple factors combine to create extreme outcomes (positive or negative).
* Contrast Effects: Be aware of and explicitly address the potential for contrast effects, particularly during valuation.
* Warning Against False Precision: This framework is a tool to organize thinking, not a substitute for it. The goal is not to perfectly fill every box, but to identify the 2-3 key variables that will truly drive this investment's success or failure. As classical value investing dictates, "It's better to be approximately right than precisely wrong."
* Mathematical Rigor: Accuracy is non-negotiable. For all quantitative tasks, you must extract exact values from the uploaded files (10-K/20-F, TTM Financials, etc.). Showing the "Chain-of-Thought" for all calculations is mandatory to ensure a verifiable margin of safety.
* The Quantitative Source Directive (TTM & Historical Data): SEC 10-K and 20-F filings only contain 3 years of data, and manually stitching 10-Q and 10-K data together creates accounting errors. Therefore, you must use the provided supplementary financial CSV file as your primary, definitive source of truth for all Trailing Twelve Month (TTM) figures and all historical 5-to-10-year data. Do not attempt to calculate TTM metrics from the SEC transcripts if the CSV is provided; extract the precise numbers from the CSV.

The Bimodal Voice Architecture Mandate:
The terminal enforces a bimodal voice architecture bifurcated across analytical workflows:
1. Strategic & Moat Voice (Parts 1, 2, 4, 6, 7, 8, 9, 11):
   - Style: Deep, nuanced, institutional economic reasoning emulating classical value investors.
   - Core Focus: Holistic mental models, sustainable competitive advantages, customer captivity, scale density, pricing power, multi-stage compounding flywheels, capital allocation philosophy, and probabilistic margin of safety synthesis.
   - Tone: Measured, authoritative, institutional, and strategically expansive.
2. Forensic & Defense Voice (80% ASD-STE100 in Step 12, Part 10, Part 5, Part 3 Cash Flow Integrity, and Part 1 Forensic/Debt/Governance Audits):
   - Style: Simplified Technical English (80% ASD-STE100 adaptation) engineered for audit-grade clarity and ruthless balance-sheet defense.
   - Rule 1 (Active Voice Only): Write exclusively in the active voice. Eliminate passive voice constructions (e.g., write "Management delayed maintenance Capex" instead of "Maintenance Capex was delayed").
   - Rule 2 (One Verb Per Sentence): Restrict sentences to one primary verb clause. Keep sentences short, concise, and direct (maximum 20-25 words per sentence).
   - Rule 3 (Zero Corporate Euphemisms): Strictly ban corporate public-relations euphemisms (e.g., ban 'headwinds', 'tailwinds', 'softness', 'challenging environment', 'right-sizing', 'synergies', 'streamlining', 'transitory friction', 'optimization'). Replace with empirical, unvarnished facts (e.g., "Revenue fell 4%", "Management terminated 400 workers", "Operating margin declined 150 basis points").
   - Rule 4 (Strict Metric-to-Finding Assertions): Assert every finding via direct empirical structure: [Metric Name] is [Value]. [Benchmark / Threshold] was [Value]. [Audit Finding: PASS / FLAG / BREACH].

The Institutional Desk Nomenclature & Zero-Academic-Citation Mandate:
* YOU OWN THE METHODOLOGY: Top-tier buy-side desks (Baupost, Bridgewater, Gotham) never cite textbooks, academic papers, or professor names for their numbers. The analytical framework is our desk's proprietary audited valuation methodology.
* STRICT PROHIBITION ON ACADEMIC & CREATOR CITATIONS: You are strictly forbidden from citing academic, author, or creator names in prose, section titles, table headers, or calculation formulas.
  - Never write "Greenwald EPV", "Bruce Greenwald's methodology", or "(Bruce Greenwald Framework)". Write "Earnings Power Value (EPV)" or "Zero-Growth EPV Floor".
  - Never write "Greenwald Asset Reproduction Value". Write "Net Asset Reproduction Floor (ARV)" or "Asset Floor".
  - Never write "Sloan Accrual Ratio". Write "Balance Sheet Accrual Ratio" or "Earnings Quality Spread".
  - Never write "Beneish M-Score". Write "Earnings Manipulation Risk Index".
  - Never write "Schilit Forensics" or "Howard Schilit". Write "Forensic Accounting & Shenanigans Audit".
  - Never write "Mauboussin Competitive Advantage Period" or cite "Mauboussin / Credit Suisse archives". Write "Competitive Advantage Period (CAP) Decay Model" or "Historical Empirical Corporate Base Rates".
  - Never write "Piotroski F-Score" or "Altman Z-Score". Write "Fundamental Health Score" or "Financial Distress Risk Index".
  - Never write "Graham-Buffett-Greenwald Framework". Write "Forensic Valuation Framework" or "Proprietary Valuation Triad".
  - Eliminate all academic lecture phrases ("Under Bruce Greenwald's protocol", "emulating the Bruce Greenwald framework", "according to Mauboussin"). State our desk's empirical calculations, balance sheet reconciliations, and findings directly.

Structural Brevity Mandate (Token Optimization & Context Management):
* Maximum Density, Minimum Volume: Prioritize "information density." Use clear, concise language. Avoid repetitive preamble, fluff, or conversational filler.
* Surgical Cross-Referencing: Only cite the source files (10-K/20-F or Synthesis) when providing evidence for a specific claim. Avoid generic phrases like "As mentioned in the document provided."
* Active Token Conservation: Keep table rows focused on high-impact data. If a metric doesn't move the needle on the "Margin of Safety" or the "Moat Trajectory," omit it to keep the cumulative chat history lean.
* No AI Disclaimers: You are strictly forbidden from outputting any AI system disclaimers, knowledge cutoff warnings, or date-simulation notices. Provide only the requested financial analysis.
* Strict Output Formatting Directives (Markdown Cleanliness & Professional Presentation):
  - NO LATEX MATH SYNTAX: You are STRICTLY FORBIDDEN from outputting LaTeX math syntax, LaTeX blocks, or TeX equations (e.g. \begin{aligned}, \mathbf{...}, \text{...}, \hline, \right, \left, $$...$$). Write ALL financial math equations, step-by-step calculations, and reconciliations in clean, plain-text markdown or bullet points.
  - STANDARD GFM MARKDOWN TABLES ONLY: You are STRICTLY FORBIDDEN from outputting typewriter-style ASCII text boxes, Unicode box characters (│, ┌, ┐, └, ┘, ─, ═), typewriter ladders, tree branches (├──, └──), typewriter sliders ($0.00 ─── [$X] ───>), or ASCII arrows (──>). ALL tables, reverse-audits, debt schedules, segment breakdowns, scenario matrixes, and price bands MUST be clean, standard GitHub-Flavored Markdown tables (| Metric | Value | Source Verification | followed by | :--- | :---: | :--- |).

```

## 1.5 src/types.ts (Data Models & Contract Definitions)
```typescript
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


```

---

# SECTION 2: THE CANONICAL 11+1 MASTER VALUATION PROMPTS

## Source File: `src/prompts.ts`
```typescript
export interface MasterPrompt {
  id: number;
  title: string;
  category: string;
  defaultTemp: number;
  defaultThinkingLevel?: 'low' | 'medium' | 'high';
  text: string;
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
const currentPeriodString = `${currentMonth} ${currentYear}`;

export const MASTER_PROMPTS: MasterPrompt[] = [
  {
    id: 1,
    title: "Part 1: Financial Forensics & Capital Allocation Discipline",
    category: "Forensics & Capital Allocation",
    defaultTemp: 0.2,
    defaultThinkingLevel: "high",
    text: `VOICE & REASONING ARCHITECTURE:
- Strategic & Moat Voice (Sections 2.1 - 2.5, 2.8): Deep, nuanced, institutional economic reasoning reflecting our firm's audited valuation framework.
- Forensic & Defense Voice (Sections 2.6 Forensic Accounting Audit, 2.7 Debt Equivalents, 2.9 Governance & Capital Allocation): 80% ASD-STE100. Active voice only. One verb per sentence. Zero corporate euphemisms. Strict metric-to-finding assertions.

1. The Document Verification Roll Call & Ingestion Audit
Before summarizing the business, you MUST read the ### Source Documents list generated at the top of this file. You are strictly forbidden from stating a document is missing if it appears in that list. Treat any non-SEC supplementary files provided by the user as objective external reality.
Execute the following verification:
* The Verification Roll Call: Explicitly list the exact filenames of the supplementary documents, filings (10-K, 10-Q), earnings call transcripts, and financial spreadsheets you are analyzing in this step. Confirm that all provided documents have been ingested and accounted for before proceeding.

2. Financial and Operational Analysis: Use the company's provided 10-K, the most recent 10-Q, the latest Earnings Call Transcript, and the financial CSV file.
CRITICAL DIRECTIVE: The 10-K only provides 3 years of data. You must use the provided financial CSV file as your absolute source of truth for all Trailing Twelve Month (TTM) figures and 5+ year historical data. Do not manually calculate TTM figures by adding/subtracting 10-Q and 10-K data; extract the exact TTM numbers directly from the CSV.
CRITICAL CURRENCY & ADR DIRECTIVE: For foreign private issuers, international companies, and American Depositary Receipts (ADRs):
- Home Currency Preservation: The financial CSV is harmonized in the company's native Home Currency (e.g., MXN, JPY, EUR, GBP, CAD, CHF, BRL, etc.) across all 10 historical periods. You must perform all operational evaluations, margin trends, sales compounding, and the Return on Retained Capital (RORC) strictly in the native Home Currency to eliminate foreign exchange translation noise.
- Balance Sheet Consistency: Ensure Cash and Gross Debt are evaluated in identical Home Currency units before calculating Net Cash, Enterprise Value, or Cash-Adjusted Margin of Safety.
- Mandatory ADS-to-Ordinary Share Ratio Audit: If the target security is an American Depositary Receipt (ADR) or American Depositary Share (ADS), you MUST explicitly audit the exact ADS-to-Ordinary Share conversion ratio from the SEC Form 20-F cover page or Note 1 disclosures before computing per-share valuation. Verify whether 1 ADS represents multiple Ordinary Shares or a fractional Ordinary Share.
- Dual-Currency Valuation Bridge: In Parts 6, 7, and 8 (Valuation Floor, Engine, and Synthesis), calculate Intrinsic Value per share in the native Home Currency. If the security is an ADR, explicitly multiply or divide by the audited ADS-to-Ordinary Share conversion ratio to determine native value per ADS, and then apply the disclosed Current Spot Exchange Rate to state the final Intrinsic Value in USD per ADS to compare directly against the US ADR Market Price. You are strictly forbidden from discarding verified trailing TTM cash flows solely because they are reported in Home Currency.
- Reporting Transparency: Explicitly state in the Executive Cockpit and Section 2.1 whether the analyzed security is a U.S. Domestic Common Stock or an American Depositary Receipt (ADR), along with the company's native Country of Incorporation, Home Currency, and ADS conversion ratio.
CRITICAL FORMATTING DIRECTIVE: You are strictly forbidden from outputting LaTeX math notation (\\begin{aligned}, \\text{}, \\mathbf{}, \\hline, $$). Present all financial math, equations, and reconciliations in clean plain-text bullet points or equations. You are STRICTLY FORBIDDEN from outputting typewriter-style ASCII text boxes, equals-sign borders (====), dashed lines (----), plus-sign corners (+----+), wrapping tables/audits in monospace code blocks (triple backticks), or generating text-based progress bars / hash bars (e.g. [#####], [###]). ALL tables MUST use standard GitHub-Flavored Markdown pipe syntax (| Header 1 | Header 2 | followed by | :--- | :---: |), and all market shares, segment distributions, and historical trajectories must be clean GFM pipe tables or standard markdown bullet points.
CRITICAL EPISTEMIC SEQUENCE DIRECTIVE: You are strictly forbidden from generating flywheels, circular flowcharts, loop diagrams, or declaring a compounding flywheel in this section. Do not anticipate or jump ahead to Part 4. The 5-stage compounding flywheel belongs exclusively in Part 4 Section 1.7, and ONLY after the balance sheet, cash flows, and moats have been forensically audited.
CRITICAL NARRATIVE DIRECTIVE: You are strictly forbidden from committing timeline hallucinations or source misattributions.
- Timeline Accuracy: You must properly attribute events and financial impacts to their exact quarter and year. Do not conflate events from previous periods as happening in the current period.
- Source Attribution: You must explicitly and accurately state which document from the provided sources a quote or fact originates from. Do not misattribute a quote or fact from one document to another.
Prioritize the 10-Q data if it is more recent than the 10-K for qualitative updates. If any documents are missing, state this clearly.

* 2.1 Business Overview: Concise summary of the company's business model (pure prose only; no cycle diagrams or flowchart art).
* 2.2 Risks: What are the primary structural risks hidden in the 10-K? (e.g., customer concentration, debt maturities, related-party transactions).
* 2.3 From the 10-K file: Item 7 Management's Discussion and Analysis (MD&A):
   * 2.3.1 The most important information of the most important subtitles. Do not include standard disclaimers or boilerplate definitions.
   * 2.3.2 Cash Flow and CAPEX: Detail historical Capex, Maintenance Capex, and Growth CAPEX disclosures.
   * Confidence Level:
* 2.4 Balance Sheet Strength (Net Cash Rebate Test):
   * Objective: Assess the company's net cash position as a measure of financial strength and a potential margin of safety.
   * Calculation: Calculate Net Cash = (Cash & Cash Equivalents + Short-Term Marketable Securities - Restricted Customer Balances) - (Short-Term Debt + Long-Term Debt). Rebate Calculation: Calculate Net Cash as a percentage of current Market Capitalization.
   * Industry-Specific Adjustment (Banks & Financials): Skip the standard Net Cash calculation. Instead, assess the CET1 Ratio, Liquidity Coverage Ratio, and Tangible Common Equity (TCE) ratio to determine balance sheet strength.
   * Industry-Specific Adjustment (Insurers): Skip the standard Net Cash calculation. Insurance companies hold massive fixed-income portfolios to back policyholder reserves. Assess Tangible Book Value per share, Risk-Based Capital (RBC) ratio or statutory capital surplus, and investment portfolio asset quality (split between investment-grade fixed income vs. equities/alternative investments).
   * Industry-Specific Adjustment (REITs): Skip the standard Net Cash calculation. Real estate businesses operate with permanent property-level debt. Under Charlie Munger's Zero-EBITDA Doctrine, assess Net Debt / AFFO (or Net Operating Income [NOI]), Fixed Charge Coverage Ratio, and debt maturity distribution (weighted average maturity and % fixed vs. floating rate) rather than misleading EBITDA metrics.
   * Analysis: If this percentage is 10% or greater, explicitly state that the company has a significant net cash position that provides a financial cushion. This cash could be considered a "rebate" to shareholders at the current price.
   * Confidence Level:
* 2.5 Accounting Policies: Summarize the company's significant accounting policies: revenue recognition, inventory valuation, depreciation methods, goodwill impairment tests. Highlight any aggressive or non-standard choices.
   * Confidence Level:
* 2.6 Forensic Accounting & Earnings Quality Audit (Buy-Side Cash Integrity Protocol):
   * Execute an objective quantitative audit of earnings quality and cash flow integrity. You MUST output a clean Markdown table with EXACTLY these four columns: | Forensic Test Vector | Calculated Metric / Trend | Trigger Threshold | Audit Finding (🟢 PASS / 🔴 FLAG) |.
   * [ELIMINATION OF OUTDATED ACADEMIC RATIOS & CHARLIE MUNGER ZERO-EBITDA DOCTRINE]: Under institutional buy-side principles, brittle academic ratios (DSO, AR Divergence, DPO, Sloan NOA Accruals, Beneish M-Score) are permanently eliminated. They mechanically generate false fraud alarms during commodity price drops, inventory cycles, or cash-funded M&A. Furthermore, enforce Charlie Munger's Zero-EBITDA Doctrine: EBITDA and Adjusted EBITDA are strictly rejected as valid measures of cash flow, earnings, or leverage (depreciation is real wear-and-tear, taxes/interest are cash obligations, and SBC is real dilution).
   * Quantitative Test Vectors to Calculate (Evaluated Over a 3-Year Rolling Window):
     1. 3-Year Cumulative Cash Conversion Reality (Vector 1): Calculate 3-Year Cumulative Cash Conversion = (3-Year Cumulative Operating Cash Flow / 3-Year Cumulative GAAP Net Income). Benchmark: PASS if Cumulative OCF >= 85% - 100% of Cumulative Net Income. Flag only if multi-year net income persistently fails to convert into real cash flow collections (or if OCF is negative over a multi-year span while GAAP Net Income is positive). Exclude single-quarter working capital timing swings (e.g., seasonal inventory builds, commodity price troughs, or IRS tax overpayment receivables).
     2. Charlie Munger Zero-EBITDA & Non-GAAP Add-Back Rejection (Vector 2): Audit management's non-GAAP adjustments. Strip out recurring add-backs for Stock-Based Compensation (SBC), restructuring charges, acquisition integration costs, and ongoing litigation. Flag if management relies on aggressive non-GAAP / "Adjusted EBITDA" add-backs to disguise underlying GAAP operating losses or if Stock-Based Compensation exceeds 10% of Operating Cash Flow (or > 5% of Total Revenue) without being deducted from executive performance targets.
     3. Aggressive Expense Capitalization & Revenue Pull-Forward (Vector 3): Audit capitalized software, capitalized development costs, unbilled contract assets, and intangible asset reclassifications. Flag if capitalized operating costs grow at > 2.0x revenue growth, if finite-life intangibles are reclassified to indefinite life to artificially lower quarterly amortization expense, or if unbilled contract assets/receivables chronically expand while deferred revenue declines over a multi-year period.
     4. Balance Sheet Asset & Working Capital Integrity (Vector 4): Audit balance sheet asset growth versus underlying cash generation, explicitly separating productive capital deployment from non-cash accounting inflation. Benchmark: Cash-funded acquisitions of physical plant, property, equipment (PP&E), and proven operating businesses, as well as temporary income tax receivables/refunds from the IRS, represent productive cash conversion and MUST NOT be flagged as accounting accrual manipulation. Flag only if operating assets inflate via uncollectible customer receivables, inventory obsolescence, or unamortized deferred costs without corresponding cash collections.
   * [CRITICAL INDUSTRY-SPECIFIC BYPASS ROUTING FOR FORENSIC ACCOUNTING AUDIT]:
     - For Banks, Financial Institutions & Embedded Fintech Lenders: Skip standard inventory and software capitalization tests. Instead, execute the Credit Quality Forensic Check: compare Provision for Credit Losses against historical through-the-cycle Net Charge-Offs (flag aggressive reserve releases used to artificially boost net interest income) and audit CET1 / Non-Performing Loan (NPL) formation rates. In growing fintech/lending operations under CECL (ASC 326), distinguish upfront Day-1 non-cash growth reserve builds from true credit deterioration; do not confuse upfront accounting reserves with permanent operational cash burns.
     - For Insurers: Inspect the 10-K Loss Reserve Note for Prior-Year Reserve Development (flag favorable reserve releases masking underlying underwriting deterioration) and evaluate the Combined Ratio (< 100%).
     - For REITs: Audit tenant lease expirations, straight-line rent adjustments, same-store tenant creditworthiness, and Net Debt to AFFO (or NOI).
   * Confidence Level:
* 2.7 Long-Term Debt Analysis & Footnote Debt Equivalents (Footnote Debt Equivalents Protocol):
   * Debt Maturity Schedule: Table: Instrument Type, Amount Outstanding/Available, Maturity Date, Interest Rate/Terms. Assess the company's ability to service its debt.
   * Footnote & Off-Balance-Sheet Exposure (Footnote Debt Equivalents Protocol):
     - Operating Lease Obligations: Verify whether Operating Lease Liabilities are already included inside on-balance-sheet Total Debt under ASC 842 / IFRS 16; only add incremental unrecorded off-balance-sheet commitments to avoid double-counting lease debt. (The pre-ASC 842 "7.5x rental expense" rule of thumb is permanently eliminated).
     - Net Unfunded Pension & Postretirement Deficits: Add (Projected Benefit Obligation [PBO] - Fair Value of Plan Assets) * (1 - Effective Tax Rate) to debt equivalents.
     - Unconditional Purchase Obligations & Commitments: Detail take-or-pay supply contracts or capital commitments that act as contractual claims against cash flows. [CRITICAL DEBT-EQUIVALENT BOUNDARY]: Operating contracts that generate future revenue (e.g. cloud compute hosting, dedicated freight/logistics service charters) and unvested executive retention compensation (LTRP) belong strictly inside operating margins and COGS; you are strictly forbidden from classifying them as balance-sheet debt equivalents.
     - Recourse Debt, Guarantees & Confirmed Legal Contingencies: Full recourse debt of customer financing subsidiaries. [CONFIRMED LEGAL CONTINGENCY BOUNDARY]: Deduct only confirmed court judgments, posted appeal bonds, signed settlement agreements, or GAAP-probable and reasonably estimable legal accruals (ASC 450) as debt equivalents. You are strictly forbidden from inventing arbitrary dollar debt deductions for early-stage, uncertified class-action lawsuits or open regulatory subpoenas; track unquantified litigation qualitatively in Part 5 and the Step 11 Monitoring Dashboard.
     - [Industry-Specific Adjustment (Banks & Insurers)]: Bypass standard lease/pension debt additions as regulatory capital ratios (CET1, RBC) already incorporate balance sheet obligations. For REITs, property-level debt is handled directly in Net Asset Value.
   * Confidence Level:
* 2.8 Segment Analysis (Trailing Twelve Month TTM Ground-Truth):
   * Trailing Twelve Month (TTM) Ground-Truth Directive: Extract TTM Segment Revenue directly from the 'Revenue Product Segments (TTM)' and 'Revenue Geographic Segments (TTM)' sections appended to the provided Financials-TTM.csv file.
   * SEC Filing Bridge for Segment Operating Profit & Margin: For segment operating income/profit and margins, bridge interim reporting periods to true TTM using the canonical SEC formula: TTM = Full Prior Fiscal Year (10-K) + Current YTD Interim (10-Q) - Prior-Year YTD Interim (10-Q). If segment operating profits are only reported annually in the 10-K, use the latest audited 10-K segment results and explicitly state the reporting period.
   * CRITICAL SEGMENTATION INTEGRITY RULE: You are strictly forbidden from combining product/operating segments and geographic territories into a single table. They represent distinct orthogonal dimensions. You MUST generate separate, dedicated clean GFM pipe tables:
     - Table 1A: Trailing Twelve Month (TTM) Operating Business Segments:
       | Operating Business Segment | TTM Revenue ($M) | % of Total Revenue | YoY Growth Rate (%) | Core Product Lines & Customer Verticals |
       (Rows must reflect pure business divisions and sum strictly to 100.0% of total revenue).
     - Table 1B: Trailing Twelve Month (TTM) Geographic Territory Breakdown:
       | Geographic Region / Territory | TTM Revenue ($M) | % of Total Revenue | YoY Growth Rate (%) | Regional Market Dynamics & Headwinds |
       (Rows must reflect pure geographic territories and sum strictly to 100.0% of total revenue).
     - Table 2: Trailing Twelve Month (TTM) Segment Operating Profitability & Margin Spread:
       | Operating Business Segment | TTM Operating Profit ($M) | Operating Margin (%) | % Contribution to Total Operating Profit | Unit Economic Driver |
   * Strategic Analysis: Identify the company's "star" compounding segments and margin drivers versus commoditized drag segments. Analyze their unit economics, operating leverage, and competitive defensibility.
   * Confidence Level:
* 2.9 Management Quality & Capital Allocation Discipline:
   * Track Record & Integrity: Assess management's honesty, transparency, capital allocation discipline, and long-term orientation. Look for red flags (excessive optimism, related-party transactions, obfuscation).
   * Test 1: Capital Allocation $1 Retained Earnings Test (5-Year Rolling Window & Total Wealth Basis):
      * Calculate Market Value Creation Ratio = (Change in Market Capitalization over 5-year rolling period + Cumulative Cash Dividends Distributed over 5-year rolling period) / (Sum of Retained Earnings over 5-year rolling period).
      * Benchmark: Pass if Ratio >= 1.0 (management creates at least $1 of total shareholder wealth for every $1 retained). Flag if Ratio < 1.0 (management is destroying economic capital). (Supplement with 10-year context measured strictly mid-cycle to mid-cycle for cyclical companies).
      * Guardrail (M&A / One-Time Distributions): If the company executed material debt-funded M&A, equity issuances, or transformative restructuring over the period, adjust Market Cap change to isolate organic retained capital creation. If cumulative retained earnings are zero or negative due to return of capital / special distributions, evaluate capital allocation via aggregate cumulative shareholder distributions plus net enterprise value creation.
      * [Industry-Specific Adjustment (REITs)]: Bypass standard $1 Retained Earnings Test (REITs must distribute >= 90% of taxable net income; assess Capital Allocation via ROIC on incremental property developments and AFFO per share growth).
      * [Industry-Specific Adjustment (Cyclicals)]: Measure strictly from mid-cycle to mid-cycle to eliminate peak-to-trough market cap distortions.
   * Test 2: Share Repurchase Capital Allocation Audit (Capital Discipline Protocol):
      * Buyback Price Discipline: Did historical share buybacks occur at opportunistic valuation multiples (e.g., during cycle troughs or below historical median Price-to-Normalized-FCF / Owner Earnings multiples) rather than at peak speculative multiples? Buying back stock at peak multiples destroys continuing shareholder wealth (exact comparison against Probabilistic Expected DCF Intrinsic Value per share is cross-checked in Parts 8–12).
      * Share Count Contraction vs. SBC Neutralization: Calculate the 5-year Diluted Share Count Index = (Diluted Shares in TTM / Diluted Shares 5 Years Ago). Explicitly state whether buybacks actively reduced outstanding share count (Index < 1.0) or were merely used to neutralize executive Stock-Based Compensation dilution at elevated prices.
   * Test 3: DEF 14A Proxy Compensation Incentive Alignment:
      * Audit executive bonus and long-term incentive metrics from the DEF 14A proxy.
      * Grade A / Aligned: Compensation packages that explicitly incorporate a capital charge (e.g., ROIC, Economic Value Added [EVA] with hurdle rates > 10%, or per-share intrinsic value growth).
      * Red Flag / Misaligned: Compensation tied to unadjusted gross revenue, volume growth, or raw EBITDA targets without a capital charge (under Charlie Munger's Zero-EBITDA Doctrine), which incentivizes reckless empire-building acquisitions and debt-fueled growth.
   * Test 4: The Return on Retained Capital (RORC) Test (Recency-Weighted 50% 3-Yr / 30% 5-Yr / 20% 10-Yr):
      * Calculate RORC across available historical periods in the financial CSV file, weighting recent performance to eliminate the 10-Year Scale Drag: 50% 3-Year Horizon, 30% 5-Year Horizon, 20% 10-Year Horizon.
      * Calculate Denominator (Capital Retained): Sum of (Free Cash Flow - Dividends) over the period. [Banks: Sum of (Net Income - Dividends)]. [Homebuilders: Sum of (Adjusted FCF - Dividends)]. [Insurers: Sum of (Comprehensive Net Income - Dividends), or evaluate TBV/share + Dividends compounded growth vs. 10% hurdle]. [REITs: evaluate ROIC on incremental development relative to cost of capital].
      * Calculate Numerator (Earnings Power Variance): Owner Earnings in final year MINUS Owner Earnings in first year. [Banks: Normalized Net Income]. [Homebuilders: Adjusted FCF]. [Insurers: Operating Underwriting Profit + Net Investment Income]. [REITs: AFFO final year MINUS AFFO first year].
      * Calculate RORC = Numerator / Denominator. Explicitly state if this historical yield on retained cash is above or below the 10.00% Static Hurdle Rate.
      * Guardrail (Endpoint & Negative Base Calibration): Measure strictly between normalized mid-cycle operational periods, eliminating peak-to-trough or anomaly endpoints (e.g., pandemic disruptions or one-time asset sales). If the cumulative denominator (Capital Retained) is zero or negative (cumulative distributions exceeded cash flow), or if starting earnings power was negative/near-zero, standard RORC is mathematically undefined; evaluate incremental capital deployment via Return on Incremental Invested Capital (ROIIC) or return on capital employed across individual multi-year investment cycles.
   * Confidence Level (Management Qualities):
* 2.10 Consistency of Narrative: If prior years' documents are available, briefly assess if management's stated strategy and capital allocation priorities have been consistent over the past 3-5 years. Note any significant changes in the story.`
  },
  {
    id: 2,
    title: "Part 2: Operational Engine & Market Analysis",
    category: "Operational Engine & Market",
    defaultTemp: 0.2,
    defaultThinkingLevel: "high",
    text: `VOICE DIRECTIVE — STRATEGIC & MOAT VOICE:
Apply deep, nuanced, institutional economic reasoning reflecting our desk's audited valuation framework. Analyze structural competitive advantages, customer captivity, scale economics, unit-economic spreads from the Competitor Radar, and compounding dynamics with institutional depth.

1. Operational Engine & Market Analysis: Objective: Provide an exhaustive institutional analysis of the company's operating engine, competitive landscape, competitor intelligence, and addressable market. Use the uploaded filings, transcripts, financial files, and the pre-harvested Competitor Radar dossier ([TICKER]_Competitor_Radar.md) as your ground truth. Synthesize peer benchmarks directly from these verified sources.
CRITICAL PREAMBLE DIRECTIVE: You are strictly forbidden from outputting unprompted preamble typewriter summary cards, space-padded headers, or indented ASCII boxes before Section 1.1. Begin directly with '#### 1.1 Core Business & Economic Engine'.
CRITICAL FORMATTING DIRECTIVE: You are strictly forbidden from outputting typewriter ASCII/Unicode tree structures (├─, ├──, └──, │), pseudo-divider lines (─────┤), typewriter flowcharts, box drawings, or text diagrams using characters like |, v, ^, ▼, ──>, or +---+, or text progress bars / hash bars (e.g. [#####], [###]). Format all segment breakdowns, market share hierarchies, unit economic comparisons, supply chain logistics, and facility footprints as clean standard indented Markdown bullet lists or clean GFM Markdown pipe tables only.

* 1.1 Core Business & Economic Engine: What business is the company really in? What is its core economic engine? Define the precise transaction or value delivery mechanism. Does this engine actually generate high-margin cash flow, or is it a low-margin commodity cycle?
   CRITICAL EPISTEMIC SEQUENCE DIRECTIVE: You are strictly forbidden from generating flywheels, circular flowcharts, loop diagrams, or declaring a compounding flywheel in this section. Focus strictly on describing empirical business mechanics. The compounding flywheel is reserved strictly for Part 4 Section 1.7 after forensic verification.
   * Confidence Level:
* 1.2 End Market Portfolio & Revenue Breakdown:
   * End Market Portfolio: Create a well-formatted Markdown table (ensure an empty line before the table) listing the company's end markets, customer verticals, and the percentage of total company revenue derived from each. Cite source filings.
   * Confidence Level:
* 1.3 Major Competitors & Market Share:
   * Major Competitors: List the company's top 3-5 major competitors. Estimate the company's overall market share (provide a documented range if known). Discuss the competitive landscape: Is the market fragmented (many small players) or consolidated (dominated by an oligopoly)? Format market concentration and competitor lists using clean standard indented Markdown bullet points or clean GFM pipe tables. Strictly avoid typewriter tree structures (├─, └──) or ASCII divider lines.
   * Confidence Level:
* 1.4 Competitor Radar Synthesis:
   * Cross-reference the pre-computed "Competitor Moat & Valuation Radar" provided in the staged reference documents ('[TICKER]_Competitor_Radar.md'), or derive directly from 10-K/Proxy peer disclosures if no pre-computed radar file is staged.
   * Format the multi-factor comparative standings in a clean GFM pipe table:
     | Competitor / Peer | Gross Margin | Operating Margin | ROIC | EV / True FCF | EV / Owner Earnings | Net Cash / Mkt Cap |
     | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
     You are strictly forbidden from outputting bullet lists with pipe delimiters or typewriter ASCII art.
   * Analyze and compare the target company's unit economics, margins (Gross & Operating), ROIC / ROTCE, and valuation multiples against its direct public competitors. Format unit economic comparisons and margin profiles as clean standard indented Markdown bullets or GFM pipe tables (never ASCII tree structures).
   * [SHARE-COUNT CANNIBAL & NEGATIVE INVESTED CAPITAL GUARDRAIL]: When aggressive share repurchases (Treasury Stock contra-equity) or customer float (negative working capital / deferred revenue) compress GAAP Book Equity or Invested Capital near or below zero, textbook ROIC (NOPAT / Invested Capital) becomes mathematically negative or distorted. In these cases, evaluate capital efficiency via Return on Tangible Operating Assets (excluding Treasury Stock reductions) and Normalized Owner Earnings Margin, and never penalize a high-cash-conversion cannibal for having negative GAAP stockholders' equity.
   * Highlight both the company's structural advantages (e.g., gross margin dominance, operating leverage, ROIC spread, net cash fortress) and any areas where rivals demonstrate superior velocity or lower multiples.
   * Provide dense, quantitative, and qualitative comparative analysis.
   * Confidence Level:
* 1.5 Structural Moat Verification (The Vulnerability Audit):
   * Scale vs. Customer Captivity Architecture: Identify the company's *claimed* structural advantage. **CONDITIONAL FALSIFICATION GATE**: Now, attempt to break it. What specific competitor action, regulatory shift, or technological change destroys this advantage within 36 months? Distinguish defensible niche/local scale from a commoditized global scale trap.
   * Platform Network Effects & Moat Scorecard [STRICTLY FOR SOFTWARE, CLOUD, MARKETPLACES & DIGITAL PLATFORMS ONLY]:
     Evaluate the 5 core criteria in a concise GFM Markdown table: | Platform Moat Criterion | Standard Threshold | Company Metric | Audit Verdict (PASS / EXEMPT / BREACH) |. Do NOT output typewriter ASCII boxes, duplicate summaries, or redundant prose blocks:
     1. Gross Margin Quality: GAAP Gross Margin >= 75.0% - 80.0%.
     2. Organic Demand (LTV / CAC): LTV/CAC >= 4.0x with paid sales/marketing <= 15.0% of revenue.
     3. Customer Lock-In & Churn: Net Revenue Retention (NRR) >= 110.0% and Annual Gross Churn <= 5.0%.
     4. Network Effects: Direct or two-sided utility scaling with user count.
     5. Customer Concentration: Largest single customer < 10.0% of total revenue (for enterprise software/B2B services).
   * [SECTOR & DISTRIBUTION CHANNEL EXEMPTION]: You are STRICTLY FORBIDDEN from penalizing physical retail, industrial manufacturing, logistics, or capital-heavy businesses under the 75% software gross margin rule. For physical compounders (e.g. Costco, railroads, specialized distributors, food/staples producers), evaluate fixed-cost spreading, regional density, and supply-chain barriers. Furthermore, distinguish single-enterprise cancellation risk from major retail/OEM distribution channel aggregation (e.g., selling 15%–25% of volume through Walmart, Costco, or a sovereign defense/foundry channel): evaluate channel concentration via multi-year gross margin stability and end-consumer brand or regional supply captivity rather than issuing an automatic software breach.
   * Confidence Level:
* 1.6 Total Addressable Market (TAM):
   * Detail the TAM for Key Products/Services. Cross-reference management claims against credible industry research.
   * Confidence Level:
* 1.7 External Forces & Market Trends (The External Impact Assessment):
   * Secular Demand Drivers & Growth Catalysts: Identify secular shifts, regulatory mandates, technological developments, or structural demand drivers that expand TAM or bolster pricing power.
   * Structural Industry Friction & Downside Constraints: Identify cyclical contractions, cost inflation, regulatory burdens, geopolitical risks, or specific competitive threats (e.g., price wars, substitute products).
   * Market Trends & Growth Projections: Provide a quantitative overview of current market trends relevant to the company's industry, citing projected industry CAGR and velocity.
   * Confidence Level:
* 1.8 Geographic Market Segmentation:
   * Provide the geographic revenue breakdown and market share by region in a clean Markdown table. If geographic segmentation data is not readily available, state 'Information Not Found - Detailed Geographic Data Not Readily Available'.
   * Confidence Level:`
  },
  {
    id: 3,
    title: "Part 3: Normalized Owner Earnings & Cash Flow Integrity",
    category: "Cash Flow & Owner Earnings",
    defaultTemp: 0.2,
    defaultThinkingLevel: "high",
    text: `VOICE DIRECTIVE — FORENSIC & DEFENSE VOICE (80% ASD-STE100):
Execute this analysis using strict Forensic & Defense Voice (80% ASD-STE100):
- Active voice only. Eliminate passive voice constructions.
- One verb per sentence. Keep sentences short, concise, and direct (maximum 20-25 words).
- Zero corporate euphemisms. Ban words like 'headwinds', 'tailwinds', 'softness', 'synergies', or 'streamlining'. State exact dollar figures, percentages, and accounting entries.
- Strict metric-to-finding assertions: Every adjustment, SBC deduction, and working capital normalization must state the metric, comparison threshold, and audit finding directly.

1. Normalized Owner Earnings & Cash Flow Integrity Engine: Use the provided financial CSV file as your ground truth.
CRITICAL PREAMBLE DIRECTIVE: You are strictly forbidden from outputting unprompted preamble typewriter summary cards or space-padded pseudo-tables. Begin directly with '#### 1.1 Authoritative Free Cash Flow & Normalized Owner Earnings Calculation'.

* 1.1 Authoritative Free Cash Flow & Normalized Owner Earnings Calculation:
CRITICAL OWNER EARNINGS DIRECTIVE: You are strictly forbidden from calculating Owner Earnings using the basic "Net Income + D&A - Capex" shorthand. You must calculate it using this exact institutional framework:
1. Operating Cash Flow (OCF) Baseline: Start with Total Operating Cash Flow for the TTM period, extracted directly from the provided financial CSV file.
2. Normalization Adjustments:
   - Working Capital Normalization: Scan the cash flow statement and the CSV for massive, temporary working capital swings (abnormal inventory accumulation, payables stretching) or one-off charges. Adjust OCF to remove temporary distortions so it reflects structural cash-generating power.
   - CRITICAL SBC ADJUSTMENT: Explicitly deduct 100% of Stock-Based Compensation (SBC) from Operating Cash Flow. Treat SBC as a hard cash expense, as it represents real economic dilution. You are strictly forbidden from ignoring SBC just because the company repurchases shares.
   - Tax Normalizations: Audit the effective tax rate versus statutory rates. Normalize for non-recurring tax holidays, windfalls, or credits (e.g., R&D tax credits, temporary statutory relief) to establish a sustainable after-tax cash baseline.
3. Maintenance vs. Growth CapEx Estimation (Empirical Carve-Out Protocol):
   - Step A: Discrete Growth CapEx Carve-Out — Inspect 10-K/10-Q Item 7 MD&A disclosures for explicit growth investments (e.g., greenfield facilities, new manufacturing lines, retail unit expansions, strategic software/cloud infrastructure) and carve them out directly from Total CapEx. Never classify disclosed capacity expansion projects as Maintenance CapEx simply because revenue dipped in a single cyclical quarter.
   - Step B: 3-Year Rolling D&A & PP&E Replacement Baseline — Benchmark remaining Maintenance CapEx against the 3-Year Rolling Average of tangible Depreciation & Amortization (typically 0.85x – 1.10x D&A). If estimated Maintenance CapEx falls below 0.70x D&A (deferral risk) or spikes above 1.30x D&A without disclosed asset replacement programs, calibrate between 1.0x D&A and the empirical carve-out. Err on the side of conservatism (overestimating Maintenance CapEx).
4. Final Owner Earnings Reconciliation:
   - State the starting OCF, each explicit adjustment (SBC deduction, working capital adjustment, tax normalization), Maintenance CapEx subtracted, and both the Levered and Unlevered Normalized Owner Earnings figures:
     * Levered Normalized Owner Earnings (Equity cash flow): OCF - Maintenance CapEx - SBC
     * Unlevered Normalized Owner Earnings (Firm cash flow): Levered Owner Earnings + After-Tax Net Interest Expense [Net Interest Expense * (1 - Effective Tax Rate)]
   - Calculate valuation multiples: P/FCF, P/Owner Earnings, EV/Owner Earnings, and the Owner Earnings Yield (Owner Earnings / Market Cap).

* 1.2 Adjusted FCF & Owner Earnings (The Red Queen Test & Tech R&D Capitalization):
   - Rationale: For modern technology, software, platform, and biotech companies, Growth R&D and customer acquisition investments represent digital Growth CapEx. While GAAP expenses them 100% inside operating cash flows (depressing reported profits), genuine growth investments build long-term economic earning power.
   - **CONDITIONAL FALSIFICATION GATE**: Evaluate if the company's R&D yields actual margin expansion, TAM growth, and market share compounding, or if it is merely defensive table stakes (The Red Queen Effect). 
     - If it is the Red Queen (e.g., hyper-competitive hardware/semiconductors or commodity processors where R&D yields no lasting moat), you MUST expense 100% of R&D, capitalize NOTHING, and explicitly state "**RED QUEEN EFFECT: ALL R&D CLASSIFIED AS DEFENSIVE EXPENSE**".
     - If and only if structural growth is proven: Divide TTM R&D/CAC into "Maintenance R&D" (needed to protect existing products) and "Growth R&D" (invested in new revenue pillars). 
       - Adjusted FCF = FCF + Growth R&D.
       - Growth R&D-Adjusted Owner Earnings = Normalized Owner Earnings + After-Tax Growth R&D - Amortization of Prior Capitalized R&D (or Net R&D Reinvestment).
       - Analysis: For verified Technology/R&D Compounders that pass this gate, this Growth R&D-Adjusted Owner Earnings baseline is carried directly into Part 7 (Adjusted DCF) and serves as the primary cash flow anchor for Part 8's Sovereign Intrinsic Value.

* 1.3 Industry-Specific Adjustments:
   - Homebuilders & Real Estate: Add back "Change in Land Inventory" (land acquisitions and development costs) to OCF and reclassify as Growth CapEx (Investing Cash Flow).
   - Banks, Financials & Embedded Fintech Lenders: Start with OCF, acknowledge customer deposits are financing flows, and normalize Provision for Credit Losses to reflect a historical through-the-cycle Net Charge-Off run rate. In growing fintech/lending operations under CECL (ASC 326), upfront Day-1 provision builds are non-cash accounting accruals tied to portfolio expansion; add back 100% of excess upfront Day-1 CECL growth reserves over trailing cash charge-offs to starting Owner Earnings. Do NOT deduct gross principal deployed into originating performing interest-earning loan assets as an operating cash expense if those loans generate positive net interest margins after losses (NIMAL). In the equity debt bridge, if deducting fintech funding debt (SPEs, financial bills), credit the performing net loan portfolio asset it finances, or isolate corporate debt from fintech asset-backed funding debt.
   - Insurers: Owner Earnings = Underwriting Profit (Net Earned Premiums - Losses & Loss Adjustment Expenses - Underwriting Expenses) + Normalized Net Investment Income (recurring yield on float) - SBC - Maintenance IT CapEx. Explicitly evaluate Combined Ratio (< 100%) and inspect the Loss Reserve Note for prior-year reserve development.
   - REITs: Owner Earnings = Adjusted Funds From Operations (AFFO = Net Income + Real Estate D&A - Property Sales Gains - Recurring Maintenance CapEx - Tenant Improvements & Leasing Commissions - Straight-Line Rent). Analyze Same-Store Net Operating Income (SS-NOI) growth and occupancy.

* 1.4 Historical Cash Flow & Owner Earnings Trend Table:
   - You MUST output a clean Markdown table showing the historical trend across all available periods in the CSV for:
     | Metric | Period 1 | Period 2 | ... | TTM |
     - Operating Cash Flow (GAAP)
     - Free Cash Flow (OCF - Total CapEx)
     - Stock-Based Compensation (SBC)
     - Maintenance CapEx
     - Normalized Owner Earnings
     - Owner Earnings Margin (% of Revenue)

* 1.5 Rolling 3-Year Baseline & Longitudinal Growth Rate Calibration:
   - 3-Year Rolling Average Normalized Owner Earnings (Mandatory Universal Cash Baseline OE_0): Calculate the arithmetic mean of Normalized Owner Earnings over the last 3 fiscal periods [(OE_TTM0 + OE_TTM1 + OE_TTM2) / 3]. You must strictly use this 3-Year Rolling Average as your starting cash flow anchor (OE_0) across all forward DCF projections and intrinsic value calculations to eliminate single-year cyclical peak/trough distortions and normalize through-the-cycle economic earning power.
   - 10-Period Longitudinal Growth Rate Calibration: Using all available periods from the financial CSV, calculate the compound annual growth rates (CAGR) for Revenue and Normalized Owner Earnings across:
     1. 3-Year Horizon (50% weighting)
     2. 5-Year Horizon (30% weighting)
     3. 10-Year Horizon (20% weighting)
   - Guardrail (Endpoint & Negative Base Calibration): If the base period or terminal period has negative or near-zero Normalized Owner Earnings, do not calculate standard CAGR (which produces mathematical error or misleading sign inversions). Use the absolute dollar change normalized over the period, or calculate CAGR using structural revenue growth combined with steady-state margin assumptions. Exclude one-time endpoint anomalies (e.g. single-year pandemic shutdowns or one-time asset sales) by referencing adjacent fiscal years.
   - Synthesized CSV-Weighted Longitudinal Growth Rate: Calculate the weighted growth rate [Weighted Growth = (3-Yr CAGR * 0.50) + (5-Yr CAGR * 0.30) + (10-Yr CAGR * 0.20)]. This empirical rate serves as the historical growth anchor for forward DCF modeling.`
  },
  {
    id: 4,
    title: "Part 4: Structural Moat Architecture & Antifragility",
    category: "Moat & Antifragility",
    defaultTemp: 0.2,
    defaultThinkingLevel: "high",
    text: `VOICE DIRECTIVE — STRATEGIC & MOAT VOICE:
Apply deep, nuanced, institutional economic reasoning reflecting our desk's audited valuation framework. Analyze moat trajectory, customer captivity, switching friction, antifragility, multi-disciplinary Lollapalooza effects, and the 5-stage compounding flywheel with rich institutional depth.

1. In-Depth Moat Architecture & Antifragility: Use the company's provided 10-K, the most recent 10-Q, and the latest Earnings Call Transcript.
CRITICAL FORMATTING DIRECTIVE: You are strictly forbidden from outputting typewriter ASCII separator lines or decorative banners (e.g. repeated '=====' or '-----') or wrapping this section in a table. Use standard Markdown headings (###, ####) and horizontal rules (---).

* 1.1 Moat Trajectory & Pricing Power:
   - Moat Trajectory: Does the company's moat appear to be strengthening, stable, or deteriorating? Provide specific evidence: Are gross and operating margins expanding or contracting? Is market share growing? Are return on invested capital figures improving or declining?
   - Pricing Power: Does the company possess structural pricing power? Provide historical examples of price increases executed without volume attrition. Cross-reference the Competitor Radar: Do target gross margins and ROIC demonstrate pricing power superior to direct competitors?
   - Confidence Level:
* 1.2 Customer-Centric Moat & Switching Costs:
   - Customer Value Proposition: In simple terms, what job is the customer hiring this product or service to do? How well does it solve the customer's problem compared to alternatives?
   - Pain of Switching: Quantify the real pain (in time, capital expense, operational disruption, or regulatory risk) a customer would endure to switch to a competitor. Is it a minor inconvenience or an existential operational nightmare? Provide documented evidence.
   - Customer Loyalty: Is the customer base comprised of loyal evangelists or price-shopping mercenaries? Examine repeat purchase rates, gross retention, Net Revenue Retention (NRR), and customer churn.
   - Confidence Level:
* 1.3 Antifragility & Resilience:
   - How antifragile is the company? Would it thrive or suffer in an economic downturn, credit freeze, or period of market volatility? Analyze balance sheet cushion, gross margins, variable cost structure, and customer mission-criticality.
   - Cross-reference the Competitor Radar: Does the company's Net Cash position and Owner Earnings yield provide superior counter-cyclical capital allocation strength compared to leveraged peers?
   - Confidence Level:
* 1.4 Replicability & Barriers to Entry:
   - How difficult would it be for a well-funded competitor (or hyperscaler) to replicate the company's business model and competitive advantages?
   - Estimate the capital expenditure, engineering time, regulatory approvals, and organizational trust required to duplicate its moat.
   - Confidence Level:
* 1.5 Hidden Path Dependencies & Key Success Drivers:
   - Identify critical historical path dependencies that enabled its dominant position (e.g., early regulatory approvals, unique distribution agreements, key proprietary standards).
   - What are the pivotal internal and external factors that will dictate the company's success or failure over the next decade?
   - Confidence Level:
* 1.6 Multi-Disciplinary Confluence & Antifragile Compounding (Multi-Factor Falsification Gate):
   - **CONDITIONAL FALSIFICATION GATE**: Multi-factor compounding is rare by definition. Ask yourself: Are there 3+ independent psychological or economic forces interacting to create a non-linear outcome?
   - If YES -> Document the non-linear confluence and cite evidence from the filings.
   - If NO -> You must explicitly state "**STANDARD COMPOUNDING: NO MULTI-FACTOR CONFLUENCE PRESENT**" and move on. Do not invent artificial synergies for ordinary businesses.
   - Confidence Level:
* 1.7 Compounding Flywheel Mechanics:
   - **MANDATORY FALSIFICATION AUDIT**: Evaluate whether the company genuinely possesses an organic, self-reinforcing compounding flywheel (where each stage automatically accelerates the next, e.g. Amazon, Costco, Visa), OR if it is a **linear value chain / cyclical commodity business** that operates via capital allocation playbooks.
   - **IF LINEAR OR COMMODITY CYCLICAL (e.g., agricultural processors, oil & gas, commercial real estate, basic manufacturing)**:
     - You are STRICTLY FORBIDDEN from inventing a fictitious organic flywheel.
     - You must explicitly output:
       '#### 1.7 Compounding Architecture: LINEAR VALUE CHAIN / CYCLICAL COMMODITY (NO ORGANIC FLYWHEEL)'
     - Structure the linear conversion pipeline strictly as 5 sequential numbered stages (1 to 5) with zero loopback arrow to Stage 1:
       1. **[Stage Name]**: [Input procurement, raw material sourcing, or project origination].
       2. **[Stage Name]**: [Processing, asset utilization, or fleet mobilization].
       3. **[Stage Name]**: [Distribution, contract execution, or value-added delivery].
       4. **[Stage Name]**: [Cash conversion, milestone settlement, or margin collection].
       5. **Discretionary Capital Allocation (No Organic Loopback)**: [Cash does NOT automatically loop back to re-accelerate Stage 1. Management exercises discretionary through-the-cycle capital allocation via dividends, debt paydown, opportunistically timed buybacks, or episodic M&A].
   - **IF AND ONLY IF A TRUE SELF-REINFORCING LOOP EXISTS (e.g. scale economies shared, platform two-sided networks, proprietary customer habituation)**:
     - Structure it strictly as a clean numbered cycle of strictly 5 interconnected stages (1 to 5):
       1. **[Stage Name] (Primary Vector)**: [Concise description of footprint, customer acquisition, or product utility].
       2. **[Stage Name] (Ecosystem/Data Capture)**: [How Stage 1 generates lock-in, proprietary data telemetry, or habituation].
       3. **[Stage Name] (Monetization & High-Margin Cash Flow)**: [How Stage 2 converts into high-margin recurring cash flows or float].
       4. **[Stage Name] (Reinvestment & Moat Widening)**: [How Stage 3 cash is reinvested into R&D, infrastructure, or customer value].
       5. **Loopback & Compounding Acceleration**: Explicitly articulate how the final stage flows back into Stage 1 with accelerating velocity.
   - CRITICAL FORMATTING DIRECTIVE: You are STRICTLY FORBIDDEN from outputting ASCII art, text boxes, unicode box-drawing characters, or enclosing flowcharts in monospace code blocks.
   - Confidence Level:`
  },
  {
    id: 5,
    title: "Part 5: Qualitative Filing Audit & Hidden Assets",
    category: "Qualitative Audit & Hidden Assets",
    defaultTemp: 0.2,
    defaultThinkingLevel: "high",
    text: `VOICE DIRECTIVE — FORENSIC & DEFENSE VOICE (80% ASD-STE100):
Execute the entire analysis (Sections 1 and 2) using strict Forensic & Defense Voice (80% ASD-STE100):
- Active voice only. Eliminate passive voice constructions.
- One verb per sentence. Write short, direct sentences (maximum 20-25 words).
- Zero corporate euphemisms. Ban words like 'headwinds', 'challenges', 'restructuring', or 'optimization'. State exact litigation facts, management departures, and contract terms directly.
- Strict metric-to-finding assertions: Assert each audit vector directly (Fact -> Threshold / Impact -> Audit Finding).

1. Qualitative & Contingency Audit:
* Perform a strict audit of the most recent filings (10-Q, 10-K), transcripts, and proxy statements for material non-financial items:
  1. Executive/Management Changes: Any recent or upcoming departures, key promotions, or leadership turnover, and are they material to operational execution?
  2. Capital Allocation Executions: Any recent major capital deployments (e.g., large acquisitions, divestitures, accelerated share repurchase programs, debt refinancings)?
  3. Pending Litigation & Regulatory Contingencies: Any ongoing lawsuits, antitrust investigations, patent disputes, or regulatory proceedings, and do they pose a solvency threat, operational constraint, or reputational damage?
  4. Unseen Material Operational Commitments: Any material off-balance-sheet commitments, long-term supply purchase agreements, or contractual minimums that could constrain cash flow during a downturn?
* FORMATTING DIRECTIVE: Present the audit strictly as a GitHub-Flavored Markdown pipe table with headers:
| Audit Vector | Filing / Source Evidence | Materiality & Thesis Impact |
| :--- | :--- | :--- |
Followed by exactly 4 rows for each vector (1. Management & Executive Stability, 2. Capital Allocation Executions, 3. Pending Litigation & Contingencies, 4. Unseen Material Operational Commitments). For "Materiality & Thesis Impact", begin with a bold impact rating (e.g., **IMMATERIAL / LOW OPERATIONAL RISK**, **HIGH POSITIVE THESIS IMPACT**, **MATERIAL RISK FACTOR**), followed by concise bullet points.

2. The Symmetrical Discovery Engine: Hidden Assets & Toxic Liabilities:
* **CONDITIONAL FALSIFICATION GATE**: You must mandate a symmetrical hunt. For every unit of effort spent looking for unrecognized assets, an equal unit must be spent hunting for hidden off-balance-sheet liabilities or structural decay. You must present whichever force is dominant.
* Scrutinize the balance sheet footnotes and corporate history:
  - Hidden Positive Assets: Undervalued real estate held at historical cost, proprietary IP expensed as R&D, hidden equity stakes/JVs, tax loss carryforwards, overfunded pensions, or under-monetized carve-out potential.
  - Hidden Toxic Liabilities: Aggressive revenue recognition, massive off-balance-sheet contractual claims, capitalized operating expenses masking cash burn, underfunded pensions, or toxic debt covenants. [DEBT-BRIDGE BOUNDARY NOTICE]: Operational purchase obligations (e.g. cloud compute hosting, software subscriptions, dedicated freight/logistics contracts) and unvested executive retention compensation (LTRP) represent ongoing operational commitments paid out of future gross revenues. Analyze their operational rigidity in Part 5, but do NOT classify them as funded debt in the Part 6 or Part 7 Equity Bridges if projected margins already expense ongoing technology, logistics, and personnel costs. [CONFIRMED LEGAL CONTINGENCY BOUNDARY]: Deduct only confirmed court judgments, posted appeal bonds, signed settlement agreements, or GAAP-probable and reasonably estimable legal accruals (ASC 450) as debt equivalents in the equity bridge. Track early-stage uncertified class actions, MDL proceedings, and open regulatory subpoenas qualitatively in Part 5 and the Step 11 Monitoring Dashboard; you are strictly forbidden from inventing arbitrary speculative dollar debt deductions for uncertified or unadjudicated claims.
  - Explicitly state whether the balance sheet's hidden forces are structurally POSITIVE (Assets) or structurally NEGATIVE (Liabilities).
* Symmetrical Balance Sheet Synthesis Table:
  Synthesize the final Net Hidden Position strictly as a clean 3-column GitHub-Flavored Markdown pipe table:
  | Off-Balance-Sheet Vector | Valuation Spread ($M) | Balance Sheet Impact |
  | :--- | :---: | :---: |
  Followed by rows for each positive asset, total positive assets subtotal, negative liabilities, total liabilities subtotal, and the net economic surplus/deficit position. You are STRICTLY FORBIDDEN from outputting typewriter ASCII text blocks, space-aligned lists, or unformatted text math summaries.
* Confidence Level:`
  },
  {
    id: 6,
    title: "Part 6: Valuation Floor: Zero-Growth Earnings Power Value (EPV)",
    category: "Detailed Valuation - No-Growth Floor",
    defaultTemp: 0.0,
    defaultThinkingLevel: "high",
    text: `VOICE DIRECTIVE — STRATEGIC & MOAT VOICE:
Apply deep, nuanced, institutional economic reasoning reflecting our desk's audited valuation framework. Establish the sustainable zero-growth cash baseline and evaluate the zero-growth intrinsic value floor with institutional precision.

1. Mathematical Rigor & Valuation Input Reverse-Audit:
Accuracy is non-negotiable. For all quantitative tasks, extract exact values from uploaded filings and the financial CSV file. Showing the "Chain-of-Thought" for all calculations is mandatory.
[PRECISION MANDATE]: Maintain 100% mathematical rigidity:
* Extract: Pull exact figures from the TTM Financials and 10-K/10-Q filings.
* Chain-of-Thought: Show every formula and intermediate calculation.
* Reverse-Audit Table: Present the Valuation Input Reverse-Audit strictly as a clean GitHub-Flavored Markdown table:
| Valuation Input / Financial Metric | Audited Value | Primary Source Document Citation & Verification |
| :--- | :---: | :--- |
* No Approximations: If a number is $1,245.67, do not round to $1,246.
* CRITICAL FORMATTING DIRECTIVE: You are strictly forbidden from outputting LaTeX math notation ($$, \\mathbf, \\frac, \\text, \\times) or backslashed dollar signs (\\$). Present all formulas and calculations as clean plain-text equations. ALL tables MUST use standard GitHub-Flavored Markdown pipe syntax (| Col 1 | Col 2 |).

2. The Static Hurdle Rate:
You are strictly forbidden from calculating WACC, CAPM, or Beta. Academic risk models that equate volatility with risk are invalid here. Apply a strict, static discount rate of 10.00% to all EPV and DCF calculations across this entire valuation suite. Risk is not mitigated by manipulating the denominator; it is mitigated by demanding a strict Margin of Safety to the final Intrinsic Value.

3. Valuation Part 1: Zero-Growth Earnings Power Value (EPV) (The Sustainable No-Growth Floor):
CRITICAL FORMATTING DIRECTIVE: You are strictly forbidden from outputting typewriter ASCII separator lines or decorative banners (e.g. repeated '=====' or '-----') or wrapping this section in a table. Use standard Markdown headings (###, ####) and horizontal rules (---). No LaTeX notation.
* The Valuation Firewall (The Floor): For Earnings Power Value (EPV), you are strictly forbidden from incorporating growth assumptions. Rely 100% on audited historical data to establish the sustainable zero-growth cash baseline.

* Objective: Determine the conservative intrinsic value of the company's current operations assuming zero future growth, capitalized into perpetuity at the 10.00% Static Hurdle Rate.
* Step 1: Sustainable Operating Earnings Baseline (Unlevered Sustainable NOPAT):
  - Start with the Normalized Owner Earnings calculated in Part 3, or calculate Sustainable NOPAT (Normalized Operating Income * (1 - Normalized Effective Tax Rate)).
  - Levered-to-Unlevered NOPAT Reconciliation: Explicitly reconcile GAAP Operating Income (EBIT) to unlevered sustainable NOPAT: NOPAT = Normalized GAAP Operating Income (EBIT) * (1 - Normalized Effective Tax Rate) + Depreciation & Amortization (D&A) - Audited Maintenance CapEx (from Part 3 Section 1.1). (Note: Ensure 100% of Stock-Based Compensation is expensed inside EBIT and never added back). Ensure this operating earnings figure is strictly UNLEVERED (before debt interest expense) to avoid double-counting debt obligations in the equity bridge.
  - Tax Rate Normalization: Normalize the tax rate to the sustainable statutory rate (e.g. 21% US corporate tax rate plus state apportionment, or native home country statutory rate), eliminating one-time valuation allowance releases, tax settlements, or transitory tax credits.
  - Strip out any non-operating income, non-recurring subsidies, or transitory windfalls to arrive at Sustainable Normalized NOPAT. Anchor Sustainable NOPAT to modern operating scale using the 50% 3-Year / 30% 5-Year / 20% 10-Year Recency-Weighted baseline (or 3-Year Rolling Average from Part 3 Section 1.5). For cyclical or commodity businesses at an earnings trough, do not extrapolate single-quarter or single-year trough margins into perpetuity; capitalize mid-cycle sustainable earnings power.
* Step 2: Capitalize Operating Earnings at the Static Hurdle Rate:
  - Capitalize Sustainable Operating Earnings into perpetuity at the 10.00% Static Hurdle Rate:
    Operating EPV = Sustainable NOPAT / 0.10
* Step 3: Equity Value Bridge:
  - Add: Cash & Cash Equivalents and Short-Term Marketable Securities (net of restricted customer deposits).
  - Subtract: Total Gross Debt (Short-Term + Long-Term) and Footnote Debt Equivalents (confirmed supplier finance obligations, net unfunded pension deficits, and confirmed legal judgments/bonds). Strictly enforce the Confirmed Legal Contingency Boundary: you are forbidden from deducting speculative class-action damage claims or unreserved complaint prayers as funded debt; deduct only probable accrued balance-sheet reserves or formal judicial bonds/settlements.
  - Operating Lease & Contract Double-Count Guardrail: If operating lease expenses or operational contracts (cloud compute hosting, dedicated freight charters) are already fully expensed within operating income / EBIT, do NOT deduct them as debt in the equity bridge. Maintain strict parity between operating flows and balance sheet debt deductions:
    1. Operational Commitments & Unvested Salaries: You are strictly forbidden from deducting future operational purchase obligations (e.g. AWS/Google Cloud hosting, software subscriptions, dedicated air cargo charters) or unvested multi-year executive retention compensation (LTRP) as funded balance-sheet debt. These are future operating costs funded by future revenues and already reflected in operating margins. Deducting them from Equity Value constitutes textbook double-counting.
    2. SaaS Deferred Revenue: Never deduct Deferred / Unearned Revenue as funded debt; it represents cash already collected for future high-margin service delivery, not a financial creditor claim.
    3. Fintech Debt Parity: If deducting fintech funding debt (SPEs, deposit certificates, financial bills), credit the performing net loan portfolio asset it finances, or isolate corporate debt from fintech asset-backed funding debt whose interest is already expensed inside COGS/EBIT.
  - Equity EPV = Operating EPV + Net Cash - Footnote Debt Equivalents.
* Step 4: Calculate EPV Per Share:
  - Divide Equity EPV by total diluted shares outstanding. Compare directly against current market price.
* [INDUSTRY-SPECIFIC ROUTING FOR ZERO-GROWTH EPV FLOOR]:
  - Non-Financial Operating Companies: Capitalize Sustainable NOPAT at 10.00% hurdle rate, bridge through Net Cash / Debt to Equity EPV.
  - Banks & Financials: Operating EPV = Normalized Through-the-Cycle Net Income / 0.10 (direct equity capitalization; customer deposits are operating financing, not debt bridge items).
  - Insurers: Operating EPV = (Underwriting Profit + Normalized Net Investment Income - Statutory Taxes) / 0.10 + Tangible Capital Surplus (direct equity capitalization).
  - REITs: Operating EPV = AFFO / 0.10 (or Net Operating Income capitalized at conservative market capitalization rate, less Gross Debt).
* Step 5: Economic Moat Interpretation & Margin of Safety Benchmark:
  - Compare EPV Per Share directly against Market Tape Price:
    * If EPV Per Share >= Market Price: The investment offers an institutional margin of safety on existing operations alone, requiring ZERO future growth to justify the purchase.
    * If EPV Per Share < Market Price: The market tape embeds forward growth expectations. Quantify the exact growth premium the market requires.`
  },
  {
    id: 7,
    title: "Part 7: Valuation Engine: Probabilistic Owner Earnings DCF & Reverse DCF",
    category: "Detailed Valuation - Engine",
    defaultTemp: 0.0,
    defaultThinkingLevel: "high",
    text: `VOICE DIRECTIVE — STRATEGIC & MOAT VOICE:
Apply deep, nuanced, institutional economic reasoning reflecting our desk's audited multi-stage valuation framework. Balance mathematical rigor with institutional expectations analysis. Invert market expectations against historical base rates and evaluate the structural economic value of profitable growth.

1. The Valuation Engine & Probabilistic Forward-Looking Cash Flow Models:
[PRECISION MANDATE]: Maintain 100% mathematical rigidity. Show all Chain-of-Thought calculations. Use the 10.00% Static Hurdle Rate.
CRITICAL FORMATTING DIRECTIVE: Present all growth multipliers, reinvestment fractions, and calculations as clean plain-text equations. You are strictly forbidden from outputting LaTeX math ($$, \\mathbf, \\frac, \\times) or typewriter boxes (====). All summary tables must use Markdown pipe syntax (| Col 1 | Col 2 |).
CRITICAL PREAMBLE DIRECTIVE: You are strictly forbidden from outputting unprompted preamble typewriter summary cards or space-padded pseudo-tables. Begin directly with '#### Part 0: Market-Implied Expectations Model (Reverse DCF Expectations Protocol)'.

* The Valuation Firewall: Before integrating forward-looking assumptions into DCF models:
  1. Internal Corporate Initiatives: You may integrate concrete management roadmaps and capital deployment plans disclosed in 10-K/10-Q filings.
  2. External Market Projections: Treat third-party TAM forecasts strictly as unverified hypotheses. You are STRICTLY FORBIDDEN from inflating DCF growth rates UNLESS the company's historical ROIC and current CapEx/R&D spending in the 10-K mathematically corroborate the capacity to capture that growth.

* Part 0: Market-Implied Expectations Model (Reverse DCF Expectations Protocol):
  - Objective: Invert the valuation equation using the Reverse DCF expectations framework. Instead of guessing the future, solve for what operational performance the current market price implies at the 10.00% Static Hurdle Rate:
    1. Implied Organic Sales Growth (g_implied): Holding operating margins at historical normalized levels, what 10-year revenue CAGR is implied by the current market price?
    2. Implied Operating Margin (OPM_implied): Holding revenue growth at historical industry base rates, what steady-state operating profit margin does the current valuation require?
    3. Market-Implied Competitive Advantage Period (CAP): How many continuous years of value-creating growth (ROIC > 10%) does the stock price price in?
    4. Base Rate Calibration: Compare g_implied and OPM_implied against empirical 10-year industry base rates. Flag as OVERVALUATION if the market price requires statistically rare top-decile sustained growth or margins above historic industry peaks. Flag as UNDERVALUATION if market price implies zero or negative growth for a business with high Net Revenue Retention (NRR >= 110%) and expanding moat.
  - [INDUSTRY-SPECIFIC ROUTING FOR REVERSE VALUATION]:
    * Non-Financial Operating Companies: Invert Market Enterprise Value to solve for implied revenue growth and operating margin.
    * Banks & Financials: Invert Price-to-Tangible Book Value (P/TBV) to solve for the through-the-cycle implied Return on Tangible Common Equity (ROTCE).
    * Insurers: Invert Price-to-Tangible Book Value (P/TBV) to solve for the implied sustainable Underwriting Combined Ratio and recurring net investment yield.
    * REITs: Invert Price-to-AFFO to solve for the implied Net Property Initial Capitalization Rate.

* Part 1: Initial Cash Flow Anchor & Longitudinal Growth Anchor:
  - Initial Cash Flow Anchor (Mandatory Universal OE_0 Baseline): Start strictly from the 3-Year Rolling Average Normalized Owner Earnings calculated in Part 3, Section 1.5 [(OE_TTM0 + OE_TTM1 + OE_TTM2) / 3] to eliminate single-year cyclical distortions and anchor valuation to sustainable through-the-cycle economic earning power. Clarify that because Part 2's Enterprise-to-Equity Bridge adds Cash & Short-Term Investments and subtracts Gross Debt and Debt Equivalents, the cash flow stream discounted in Part 2 must be Unlevered Normalized Owner Earnings (i.e., if starting from Part 3's OCF-based Normalized Owner Earnings, add back After-Tax Interest Expense = Interest Expense * (1 - Normalized Effective Tax Rate) so debt is not double-counted in both the cash flow stream and the Gross Debt deduction).
  - Growth Rate Anchor: Anchor base-case projections to the Synthesized CSV-Weighted Longitudinal Growth Rate from Part 3, Section 1.5 (50% 3-Yr, 30% 5-Yr, 20% 10-Yr CAGR).
  - Economic Profit Engine: Verify that Return on Invested Capital (ROIC) and Marginal Return on Incremental Invested Capital (Marginal ROIIC) exceed the 10% hurdle rate. Marginal ROIIC must be anchored to the modern 3-to-5 year operational baseline (using the 50% 3-Yr / 30% 5-Yr / 20% 10-Yr recency weighting) rather than pulling forward a distant 10-year historical anchor from a pre-scale era. If ROIC <= 10%, incremental growth destroys value.

* Part 2: Probabilistic 10-Year Owner Earnings DCF Scenario Spectrum:
  - Perform a 10-year DCF Analysis discounted at the 10.00% Static Hurdle Rate across 3 explicit probabilistic scenarios:
    1. Conservative / Bear Case (25% Probability): Low growth, margin compression, high maintenance capex.
    2. Base Case (50% Probability): Historical trend continuation anchored to CSV-weighted growth rate, steady normalized margins.
    3. Optimistic / Bull Case (25% Probability): Secular TAM expansion, operating leverage, pricing power execution.
  - Calculate Terminal Value: Perpetual Growth Rate capped at 2.0-2.5% or conservative exit multiple.
  - Growth Reinvestment Deduction (Eliminating the Free-Growth Trap): Distributable Free Cash Flow must deduct the capital investment required to generate projected growth. For each projected year: Free Cash Flow to Firm = Sustainable NOPAT * (1 - Reinvestment Rate), where Reinvestment Rate = Projected Revenue/Earnings Growth Rate / Marginal ROIIC (or explicit Net Growth CapEx + Incremental Working Capital). If growth is projected at g%, you are strictly forbidden from assuming zero growth reinvestment. Zero Double-Taxation on Tech R&D: In Part 2 (Standard DCF), R&D is already 100% expensed inside operating income/NOPAT; therefore, do not double-penalize cash flow by deducting both expensed R&D and R&D reinvestment—incremental reinvestment in Part 2 is strictly incremental physical Growth CapEx + capitalized software + incremental working capital. Furthermore, for negative-working-capital / customer-float compounders or share-count cannibals where growth is self-funded by upfront customer cash collections, bound the explicit reinvestment rate to empirical historical Net Growth CapEx + Working Capital changes rather than forcing an artificial textbook reinvestment penalty. In the terminal year, taper growth to terminal rate (2.0-2.5%) and set terminal reinvestment = Terminal Growth / Long-Run ROIC.
    * Margin-Recovery Reinvestment Rate Defense: When projected near-term NOPAT growth is driven by operating margin recovery from an operational, price-investment, or cyclical trough (operating leverage), cap the explicit reinvestment rate (e.g., 20%–35%) rather than mechanically applying Reinvestment Rate = g / ROIIC. Profit expansion driven by operating leverage, shipping subsidy normalization, or capacity utilization recovery requires minimal incremental physical capital; forcing a rigid 60%+ reinvestment rate on post-trough margin recovery double-penalizes the company by forcing it to re-purchase capacity it already owns.
    * Cross-Industry Life-Cycle Rules: (1) For SaaS/Asset-Light Platforms: Base reinvestment on net capitalized software and incremental working capital, not gross revenue growth; (2) For Pharma/Biotech: When blockbuster patents expire within the 10-year forecast window, enforce a Patent Cliff decay model (reducing post-patent revenues by 70%-85%) rather than extrapolating perpetual compound growth; (3) For Cyclicals/Semis: Normalize peak fab/facility CapEx to through-cycle maintenance requirements so multi-year factory construction is not treated as permanent annual maintenance drag.
  - Enterprise-to-Equity Bridge: For each scenario, bridge from discounted cash flows to per-share equity value: Operating Enterprise Value (PV of 10-Year Cash Flows + PV of Terminal Value) + Cash & Short-Term Investments - Gross Debt - Debt Equivalents = Implied Equity Value. Per Diluted Share Value = Implied Equity Value / Total Diluted Shares Outstanding. Enforce the Operating Contract & Lease Double-Count Guardrail from Part 6 (strictly forbid deducting future operational contracts, unvested LTRP salaries, or SaaS deferred revenue as funded debt; maintain Fintech Debt Parity).
  - Format the Probabilistic 10-Year DCF Scenario Spectrum as a clean GFM pipe table:
    | Valuation Scenario | Probability Weight | Per Diluted Share Value | Implied MoS vs. Market Tape |
    | :--- | :---: | :---: | :---: |
    | **Conservative / Bear Case** | 25% | $XX.XX | XX.XX% |
    | **Base Case** | 50% | $XX.XX | XX.XX% |
    | **Optimistic / Bull Case** | 25% | $XX.XX | XX.XX% |
    | **Probability-Weighted Expected DCF** | **100%** | **$XX.XX** | **XX.XX%** |
    | **Current Market Tape** | — | $XX.XX | — |
    You are strictly forbidden from enclosing these scenarios in Unicode box drawing characters (│) or typewriter ASCII borders.
  - Calculate Probability-Weighted Expected DCF Per Share:
    Expected DCF = (Conservative Case * 0.25) + (Base Case * 0.50) + (Optimistic Case * 0.25)
  - [Industry-Specific Adjustment for Banks & Financials]: 10-Year Excess Return on Equity (ROE) / Residual Income Model: Project annual Net Income and Tangible Common Equity (TCE). Annual Excess Return = Net Income - (10.00% Hurdle Rate * Beginning TCE). Equity Value = Current TCE + PV of 10-Year Excess Returns + PV of Terminal Excess Return. (Or 10-Year Dividend Discount Model discounting distributable capital above regulatory minimums at 10%).
  - [Industry-Specific Adjustment for Insurers]: Excess Return on Equity (ROE) Model or Compounded Tangible Book Value (TBV) Model projecting TBV growth discounted at 10%.
  - [Industry-Specific Adjustment for REITs]: 10-Year AFFO Discount Model using per-share AFFO growth and a terminal multiple anchored to Net Asset Value.

* Part 3: Adjusted DCF (R&D Capitalized):
  - Evaluate economic intrinsic value by treating Growth R&D (from Part 3 Section 1.2) as a multi-year capital investment rather than a period operating expense. **CONDITIONAL GATE:** Perform this separate 10-year DCF analysis ONLY if you verified in Part 3 that the company passes the Red Queen Test. If it failed, explicitly state "Adjusted DCF skipped due to Red Queen Effect."
  - When capitalizing R&D, add back Growth R&D to NOPAT and deduct ongoing R&D amortization (or net R&D capital investment = Growth R&D Expense - Amortization of Prior Capitalized R&D) along with physical Growth CapEx and working capital reinvestment. You are strictly forbidden from adding gross Growth R&D without accounting for ongoing R&D amortization drag. For verified tech compounders passing the Red Queen Gate, compute the Conservative/Bear (25%), Base (50%), and Optimistic/Bull (25%) probability-weighted Expected R&D-Capitalized DCF Per Share, which reflects the company's true economic compounding power and serves as the primary valuation anchor in Part 8.`
  },
  {
    id: 8,
    title: "Part 8: Valuation Synthesis & Sensitivity Matrix",
    category: "Valuation Synthesis",
    defaultTemp: 0.0,
    defaultThinkingLevel: "high",
    text: `VOICE DIRECTIVE — STRATEGIC & MOAT VOICE:
Apply deep, nuanced, institutional economic reasoning reflecting our desk's audited cash-flow sovereign valuation framework. Anchor intrinsic value 100% to the Probability-Weighted Expected DCF (or R&D-Capitalized Expected DCF for verified Tech Compounders passing the Red Queen Gate), using Zero-Growth EPV as the conservative no-growth benchmark. Formulate the expectations gap and margin of safety with rich probabilistic insight.

1. Valuation Synthesis & Sensitivity Matrix (Cash-Flow Sovereign Valuation Model):
* Objective: Synthesize forward cash flow models into an authoritative Intrinsic Value, benchmark against the Zero-Growth EPV Floor, and test robustness across sensitivity matrixes.
CRITICAL FORMATTING DIRECTIVE: Present all Margin of Safety and per-share formulas as clean plain-text equations. You are strictly forbidden from outputting LaTeX math notation ($$, \\mathbf, \\frac, \\text, \\times) or backslashed dollar signs (\\$). All summary tables must use Markdown pipe syntax (| Col 1 | Col 2 |).
CRITICAL PREAMBLE DIRECTIVE: You are strictly forbidden from outputting unprompted preamble typewriter summary cards or space-padded pseudo-tables. Begin directly with '#### Step 1: Institutional Valuation Summary Table'.

* Principle of Cash-Flow Sovereignty: The intrinsic value of any business is unequivocally the discounted present value of all distributable cash flows owners can withdraw over its remaining life. Intrinsic value is anchored to forward cash flows: for physical, industrial, or non-R&D businesses, anchor 100% to the Probability-Weighted Expected DCF from Part 7; for verified Tech Compounders passing the Red Queen Gate, anchor Intrinsic Value to the R&D-Capitalized Expected DCF (or a disciplined synthesis with Standard Expected DCF) to fully recognize expensed growth investments. Zero-Growth EPV from Part 6 serves as the conservative floor benchmark to demonstrate how much of the company's value is supported with zero future growth. (Net Asset Reproduction Floor is completely eliminated under the cash flow sovereignty doctrine).

* Step 1: Institutional Valuation Summary Table:
  Create an institutional summary table featuring:
  | Valuation Methodology | Framework Role | Per Share Value | Implied Valuation / Expectations Gap |
  | :--- | :--- | :---: | :--- |
  | Zero-Growth Earnings Power Value (EPV) | Conservative No-Growth Floor | $XX.XX | [Current Cash Power Capitalized at 10% Floor] |
  | Probabilistic Expected Owner Earnings DCF | Sovereign Intrinsic Value Benchmark | $XX.XX | [Probability-Weighted Expected DCF (25/50/25)] |
  | DCF Base Case | Central Compounding Scenario | $XX.XX | [Base Case Compounding at 10% Hurdle Rate] |
  | DCF Conservative / Bear Case | Downside Stress Scenario | $XX.XX | [Margin Compression / Low Growth Floor] |
  | DCF Optimistic / Bull Case | Secular Growth Ceiling | $XX.XX | [High Compounding / Margin Expansion] |
  | Adjusted DCF (R&D Capitalized) | Tech / R&D Compounder Anchor (or Growth Reference) | $XX.XX (or N/A if skipped in Part 7) | [Growth R&D Capitalization Anchor / Red Queen Gate] |
  | Market-Implied Expectations (Reverse DCF) | Market Tape Reality Benchmark | $XX.XX (Current Price) | [Implied g: X.X%, Implied OPM: X.X%] |

* Step 2: Cash Flow Spread & Expectations Analysis:
  - Format the Valuation Spread Breakdown in a clean GFM pipe table:
    | Valuation Layer | Value Per Diluted Share | Valuation Spread & Margin Layer |
    | :--- | :---: | :--- |
    | **Adjusted DCF (R&D Capitalized)** | $XX.XX (or N/A if skipped in Part 7) | [Growth R&D Capitalization Layer / Red Queen Gate] |
    | **DCF Optimistic / Bull Case** | $XX.XX | [Secular Expansion Spread] |
    | **Probabilistic Expected DCF (Sovereign IV)** | $XX.XX | [Probability-Weighted Central Anchor] |
    | **Market Tape Price** | $XX.XX | [Expectations Gap vs. Expected DCF] |
    | **DCF Conservative / Bear Case** | $XX.XX | [Downside Stress Test Floor] |
    | **Zero-Growth Earnings Power Value (EPV)** | $XX.XX | [No-Growth Cash Flow Floor Benchmark] |
    You are strictly forbidden from outputting typewriter ladder diagrams or Unicode box vertical lines (│).
  - Analyze the spread between the Zero-Growth EPV Floor and the Expected DCF: How much value is dependent on future growth vs. existing earning power?
  - Compare the Expected DCF against Market-Implied Expectations: Does current market price require unrealistic growth or margin expansion relative to historical base rates, or is the market pricing in excessive pessimism?

* Step 3: Authoritative Synthesized Intrinsic Value Estimate:
  - Dual-Currency Per-Share Breakdown: For foreign private issuers and American Depositary Receipts (ADRs), state the synthesized intrinsic value in both the native Home Currency per Ordinary Share and the final USD value per American Depositary Share (ADS), explicitly reconciling the audited ADS-to-Ordinary conversion ratio and current spot FX rate.
  - Synthesized Intrinsic Value: Set to Probability-Weighted Expected DCF ($XX.XX per share) for standard/physical businesses, or R&D-Capitalized Expected DCF ($XX.XX per share) for verified Tech Compounders passing the Red Queen Gate.
  - State the final intrinsic value per share and the exact probability weighting composition (25% Bear, 50% Base, 25% Bull).

* Step 4: The Margin of Safety:
  - Standard Margin of Safety: Calculate the percentage discount using your final Intrinsic Value estimate versus the current Market Price:
    Standard Margin of Safety = (Intrinsic Value - Market Price) / Intrinsic Value
  - Cash-Adjusted Margin of Safety (Enterprise Value Discount): Calculate Net Cash Per Share = Net Cash / Diluted Shares. Strip out cash from both intrinsic value and price:
    Cash-Adjusted Margin of Safety = ((Intrinsic Value - Net Cash Per Share) - (Market Price - Net Cash Per Share)) / (Intrinsic Value - Net Cash Per Share)
    (Or on an aggregate level: ((Operating Intrinsic Value - Enterprise Value) / Operating Intrinsic Value)).
    Clarification (Net Cash vs. Net Debt Dynamic): If the company holds Net Cash (Cash > Gross Debt), Net Cash acts as a shareholder rebate cushion, widening the margin of safety. If the company holds Net Debt (Gross Debt > Cash), Net Debt acts as a prior claim against operating cash flows; calculate Net Debt Per Share = (Gross Debt - Cash) / Diluted Shares, where Operating Value = Intrinsic Value + Net Debt Per Share, and Enterprise Value = Market Price + Net Debt Per Share, noting that financial leverage magnifies downside risk and narrows equity protection.
  - Valuation Conclusion & Quality-Tiered Margin of Safety: Does this company offer an institutional Margin of Safety? Calibrate required margin of safety to business quality and balance sheet durability:
    * Wide-Moat Stalwarts, Fast Growers, and Net-Cash Cyclical Compounders: Require >= 15%–25% Margin of Safety. Elite compounding franchises with high cash conversion, pricing power, and negative net debt warrant accumulation at a 15%–20% discount.
    * Moderate-Moat or Pure Cyclicals: Require >= 25%–35% Margin of Safety.
    * Turnarounds, Deep Value Asset Plays, or Financially Leveraged Businesses: Require >= 35%–50% Margin of Safety.

* Step 5: Valuation Sensitivity Matrix:
  - Construct a comprehensive 20-cell Markdown table testing per-share Intrinsic Value across:
    * Terminal Growth Rates (Rows): 1.5%, 2.0%, 2.5%, 3.0%
    * Discount Rates (Columns): 8.0%, 9.0%, 10.0%, 11.0%, 12.0%

[STRICT GAG ORDER]: You are strictly forbidden from outputting an investment verdict (e.g., "This is a Buy") or portfolio advice here. State the mathematical conclusions objectively, end sharply, and wait for the investment thesis and red team phases.`
  },
  {
    id: 9,
    title: "Part 9: Preliminary Investment Thesis & Lynch Archetype",
    category: "Investment Thesis Formulation",
    defaultTemp: 0.5,
    defaultThinkingLevel: "high",
    text: `VOICE DIRECTIVE — STRATEGIC & MOAT VOICE:
Apply deep, nuanced, institutional economic reasoning reflecting our desk's audited valuation framework. Synthesize business profile categories, formulate high-conviction compounding pillars, and calibrate target buy price bands with institutional depth.

1. Preliminary Investment Thesis & Lynch Archetype:
CRITICAL FORMATTING DIRECTIVE: Use standard Markdown headings (###, ####) and horizontal rules (---). Do not output ASCII borders, code boxes, or LaTeX syntax.

* 1.1 The Peter Lynch Archetype Classification:
  - Synthesize all financial data, capital allocation records, and moat dynamics to classify the company into one of our canonical Peter Lynch archetypes: Fast Grower, Wide-Moat Stalwart (or Stalwart), Cyclical Compounder, Pure Commodity Cyclical, Slow Grower, Asset Play, or Turnaround.
  - Format the classification as a clean GFM table:
    | Peter Lynch Archetype | Classification Status | Empirical Operational Validation |
    | :--- | :---: | :--- |
    | **[Active Archetype Name]** | **ACTIVE ARCHETYPE** | Top-Line: +X.X% YoY • Operating Margin: X.X% • ROIC: X.X% |
    You are strictly forbidden from outputting ASCII continuum lines, typewriter text arrows (──, └──>), or typewriter bracket diagrams.
  - Justify this classification based on historical growth rates, market saturation, and balance sheet structure.
  - [CRITICAL STRUCTURAL TRANSFORMATION DIRECTIVE & CYCLICAL DISAMBIGUATION]: You are strictly forbidden from classifying a company as a "Cyclical" solely based on its legacy industry sector if the data proves a structural transformation. Conversely, do not force a secular narrative onto a true cyclical.
  - Secular Compounder vs. Cyclical Standard: Ground Peter Lynch classification strictly in 5-to-10 year multi-year top-line, GMV, and unit volume trends. You are strictly forbidden from tagging a company as "Cyclical" (in prose, tables, or YAML metadata) if its 5-to-10 year revenue and volume compound at >= 20% CAGR and near-term margin compression is driven by deliberate, moat-widening scale reinvestment (e.g. logistics/shipping subsidies or R&D offensives). True cyclicals experience contracting revenues and falling unit volumes during macro downturns. Fast growers and stalwarts experiencing deliberate reinvestment phases remain Fast Growers or Stalwarts.
  - **CONDITIONAL GATE (4-POINT CYCLICAL COMPOUNDER DISAMBIGUATION TEST):** You must separate macro sensitivity from structural moat decay. Do not classify an industrial, materials, or technology leader as a "Pure Commodity Cyclical" if it passes the 4-Point Cyclical Compounder Test across a 3-to-10 year recency-weighted window (50% 3-Yr / 30% 5-Yr / 20% 10-Yr):
    (1) Trough-to-Trough Escalation: Operating cash flow remains positive at cycle bottoms, and each cyclical trough's EPS and Book Value per share are structurally higher than the prior cycle's trough ("higher lows").
    (2) Physical Unit Volume Decoupling: Physical shipped volume or capacity compounds over a 3-to-10 year cycle (stealing market share from high-cost legacy peers) independent of spot commodity price swings.
    (3) Through-Cycle ROIC Superiority: 3-to-10 year recency-weighted rolling average ROIC comfortably exceeds our 10.0% static hurdle rate, driven by lowest-quartile variable cost structures.
    (4) Countercyclical Capital Allocation: Maintains a resilient balance sheet (net cash or low leverage) and deploys cash countercyclically (repurchasing shares or acquiring distressed capacity in downturns).
    Companies passing these criteria MUST be classified as a "Cyclical Compounder" (and mapped to Fast Grower / Stalwart compounding protection). If a business exhibits flat 10-year physical volume, negative trough cash flows, and sub-10% through-cycle ROIC, classify it as a "Pure Commodity Cyclical" and warn of mean-reversion.

* 1.2 The Core Thesis (Bull Case):
  - State your conviction level (High, Medium, Low) on the business quality and moat durability.
  - Articulate the 3-4 primary structural and operational reasons this business will compound intrinsic value over the next 5-10 years.
  - Competitor Radar Moat Corroboration: Integrate findings from the Competitor Moat & Valuation Radar. Cite specific unit-economic spreads (Gross or Operating Margin spread, ROIC superiority, Owner Earnings yield dominance) against direct peers in clean markdown tables or bullets. You are strictly forbidden from outputting ASCII arrows (──>).

* 1.3 The Counter-Thesis (Primary Structural Vulnerabilities):
  - Formulate a concise, rigorous counter-thesis highlighting the primary threats: valuation multiple risk, balance sheet drag, customer concentration, technological disruption, or capital allocation failure.

* 1.4 Target Buy Price Band:
  - Establish your explicit target buy price bands based on your calculated Synthesized Intrinsic Value (IV) from Part 8 (Screaming Buy = 0.50x to 0.65x IV [35%–50% MoS]; Target Buy = 0.75x–0.85x IV [15%–25% MoS for Wide-Moat Compounders; 25% MoS standard]; Fair Value = 1.00x IV [0% MoS]):
    Format the Target Buy Price Band Spectrum as a clean GFM pipe table:
    | Target Buy Price Band | Price Range ($) | Margin of Safety Discount | Allocation Directive |
    | :--- | :---: | :---: | :--- |
    | **Screaming Buy** | $XX.XX - $XX.XX | 35% - 50% MoS | Aggressive Tranche 2 Value Accumulation |
    | **Target Buy** | $XX.XX | 15% - 25% MoS | Initial Tranche 1 Capital Entry |
    | **Fair Value** | $XX.XX | 0% MoS | Synthesized Intrinsic Value Ceiling |
    | **Current Market Tape** | $XX.XX | Speculative Premium / Deficit | Allocation Status |
    You are strictly forbidden from outputting typewriter sliders ($0.00 ─── [$X] ───>), ASCII dashes, or text progress bars.
  - Detail the operational requirements and margin conditions for each band.

[STRICT DECISION GUARDRAIL]: You are STRICTLY FORBIDDEN from rendering a final INVEST, PASS, HOLD, or SELL decision here. Do not suggest portfolio sizing. You must wait for the Red Team to stress-test this thesis in the next step before any capital allocation decisions can be made.`
  },
  {
    id: 10,
    title: "Part 10: Stress Test: Red Team Forensic Short Attack",
    category: "The Final Gauntlet - Red Team",
    defaultTemp: 0.5,
    defaultThinkingLevel: "high",
    text: `VOICE DIRECTIVE — FORENSIC & DEFENSE VOICE (80% ASD-STE100):
Execute this forensic short attack using ruthless Forensic & Defense Voice (80% ASD-STE100):
- Active voice only. Eliminate all passive voice. Management is the active agent or the numbers actively fail.
- One verb per sentence. Write short, punchy, declarative sentences (maximum 20-25 words).
- Zero corporate euphemisms. Ban corporate fluff ('headwinds', 'tailwinds', 'softness', 'strategic repositioning'). State exact financial deteriorations, margin contractions, and multiples.
- Strict metric-to-finding assertions: Attack the thesis with unsparing metric-to-finding assertions. State metric -> State threshold -> State structural failure.

1. Red Team Attack: The Forensic Short-Seller
CRITICAL FORMATTING DIRECTIVE: You are strictly forbidden from outputting typewriter ASCII separator lines or decorative banners (e.g. repeated '=====' or '-----') or wrapping this section in a table. Use standard Markdown headings (###, ####) and horizontal rules (---).
Objective: Subject the investment thesis to a ruthless, math-driven, and structurally focused forensic short attack.
Persona: Adopt the persona of a deeply cynical short-seller known for tearing apart 10-Ks and uncovering the hidden structural decay of competitive moats. Your attack is scathing, surgical, and backed exclusively by the hard data.
[THE OBJECTIVITY DIRECTIVE]: Adopt a ruthless, skeptical mindset, but your attack MUST be strictly bound by actual math and filing disclosures. Do not fabricate data. If the business is pristine, attack the most realistic execution risk and valuation vulnerability.

Your Task: A Five-Step Teardown:
* Step 1: Operational Pre-Mortem & Killing the Moat:
  - Operational Pre-Mortem: Imagine it is 5 years from today, and this business has failed structurally. Write a brief, 3-sentence narrative focusing EXCLUSIVELY on operational, competitive, or technological failure (e.g., technological obsolescence, commoditization, supply chain collapse). Do NOT mention valuation or stock price here.
  - Killing the Moat: If you were a well-funded competitor, what specific strategic vulnerability would you exploit to destroy this company's margins and pricing power? (2 sentences max).

* Step 2: Deconstruct the Moat & Math:
  - Explicitly isolate the 3-4 core structural and financial pillars of the bullish investment thesis formulated in Part 9.

* Step 3: Forensic & Competitor Weaponization:
  - Scan the 10-Q, 10-K, TTM Financials, DEF 14A proxy, and Competitor Radar for objective contradictions to the bull case:
    1. Forensic Accounting Red Flags: Flag divergence between 3-year cumulative operating cash flow and net income, unbilled contract assets/receivables outrunning revenue over a multi-year period, aggressive software/R&D capitalization without revenue expansion, or EBITDA add-back gimmicks.
    2. Dilutive Share Repurchases: Flag if management bought back stock above intrinsic value/EPV or spent massive cash on buybacks while diluted share count failed to contract (masking executive SBC dilution).
    3. Market-Implied Expectations Gap: Attack the valuation multiple if current market price implies 10-year organic growth or operating margins that break historical industry base rates.
    4. Footnote Claims: Capitalize confirmed legal judgments/bonds, operating leases, unfunded pension deficits, and non-cancellable deadweight/take-or-pay capital commitments into enterprise debt (strictly excluding ongoing operational purchase contracts such as cloud compute, freight charters, unvested LTRP salaries, and SaaS deferred revenue; enforce Confirmed Legal Contingency Boundary).
    5. Competitor Radar Weaponization: Attack any multiple premium (e.g., Target trading at 40x True FCF vs. direct peers at 15x) if rivals deliver comparable margins or ROIC. Cite rival disclosures or cross-call transcript quotes that contradict moat expansion.

* Step 4: The Search for Structural Decay:
  - Output a clean Markdown table with EXACTLY these two columns:
    | Bull Pillar | Contradictory Evidence (Math & Structure) |
  - For each bull pillar from Step 2, list specific, cited hard data from the filings proving the moat is eroding or the math is flawed.

* Step 5: The Forensic Attack Profile:
  - Output a highly dense, bulleted teardown with exactly these four headers. You are strictly forbidden from using conversational filler or roleplay formatting:
    * The Fatal Flaw: Attack the single weakest structural/financial pillar using exact numbers extracted in Step 3.
    * The Cascade: Explain how the mathematical failure of this pillar impacts the intrinsic value calculation.
    * The Downside Target: Articulate a justifiable downside price target based strictly on the most conservative valuation metric (Zero-Growth EPV Floor from Part 6 or Conservative DCF Case from Part 7).
    * The Catalyst: Identify the specific, measurable financial metric that would break first to prove this bear case correct (e.g., "If maintenance CapEx normalizes to $X, FCF turns negative").

[HARD STOP DIRECTIVE]: Stop generating text immediately after you write 'The Catalyst'. You are strictly forbidden from resolving the thesis, defending the company, or offering a final investment verdict here. Leave the resolution for the next step.`
  },
  {
    id: 11,
    title: "Part 11: Definitive Verdict, Resolution & Monitoring Dashboard",
    category: "The Final Gauntlet - Resolution",
    defaultTemp: 0.5,
    defaultThinkingLevel: "high",
    text: `VOICE DIRECTIVE — STRATEGIC & MOAT VOICE:
Return to the Strategic & Moat Voice of the Senior Value Investor. Apply deep, nuanced, institutional economic reasoning reflecting our desk's audited cash-flow sovereign valuation framework. Weigh the bull thesis against the forensic attack, evaluate whether operational competitive advantages refute short arguments, and render an authoritative capital allocation decision. (Note: Step 6 Monitoring Dashboard table retains strict metric-to-breaker assertions).

1. Definitive Thesis Resolution & Monitoring Dashboard:
CRITICAL FORMATTING DIRECTIVE: You are strictly forbidden from outputting typewriter ASCII separator lines or decorative banners (e.g. repeated '=====' or '-----') or wrapping this section in a table. Use standard Markdown headings (###, ####) and horizontal rules (---).
Persona Reset: You are no longer "The Forensic Short-Seller." Return to the objective, cautious persona of the Senior Value Investor.
Objective: Weigh the original Investment Thesis against the Forensic Bear Attack using pure mathematical and structural logic, render an actionable portfolio verdict, and establish a quarterly monitoring dashboard.

Task: The Six-Step Resolution Matrix:
* Step 1: Address the Fatal Flaw:
  - Directly evaluate the "Fatal Flaw" identified by the Red Team.
  - Do the most recent 10-Q, 10-K, and TTM Financial data provide concrete evidence to refute this attack, or is the vulnerability mathematically undeniable? Prioritize the 10-Q for the most up-to-date legal and operational disclosures.
  - If the Red Team weaponized competitor valuation multiples or peer threats, evaluate whether the company's verified operational outperformance in the Competitor Moat Radar (e.g., Gross Margin spread, ROIC superiority, Net Cash fortress) successfully defends against the attack or justifies a valuation premium.

* Step 2: Catalyst Probability:
  - Assess the "Catalyst" the Red Team proposed. Look at historical capital allocation, margin volatility, and cycle behavior.
  - What is the objective probability of this specific catalyst breaking over the next 12-36 months?

* Step 3: Margin of Safety Recalculation:
  - Compare the Red Team's Downside Target against your original Intrinsic Value estimate from Part 8.
  - Does the forensic audit reveal that our original Margin of Safety was too narrow? State clearly if the Target Buy Price must be adjusted downward.
  - Maintain strict Intrinsic Value invariance with Part 8: keep the Synthesized Intrinsic Value ($XX.XX) and Standard Margin of Safety (XX.XX%) in Step 4 identical to Part 8 (to satisfy Step 12 Gate 3). If the Red Team audit reveals elevated structural or governance risk, adjust the required entry tier (e.g., demanding the 35%-50% Screaming Buy Margin of Safety band rather than the 25% Target Buy band) rather than altering the Part 8 Intrinsic Value figure.

* Step 4: The Definitive Verdict (The Portfolio Directive):
  - Format the definitive investment verdict as an authoritative summary table:
    | Decision Parameter | Audited Portfolio Verdict |
    | :--- | :---: |
    | **Ticker** | \`TICKER\` |
    | **Market Tape Price** | $XX.XX |
    | **Synthesized Intrinsic Value** | $XX.XX |
    | **Standard Margin of Safety** | +XX.XX% (Discount) / -XX.XX% (Deficit) |
    | **Final Portfolio Action Directive** | **INVEST / PASS / HOLD / ACCUMULATE / LIQUIDATE** |
    You are strictly forbidden from outputting raw key-value lines without a table. In the Final Portfolio Action Directive cell, output strictly the single chosen uppercase action keyword (e.g. **INVEST**, **PASS**, **HOLD**, **ACCUMULATE**, or **LIQUIDATE**), never the unselected slash alternatives. Require an explicit '+' sign for a discount or '-' sign for a premium/deficit.
  - Provide a final, definitive, actionable decision. The user operates a tax-exempt international account (no capital gains penalties):
    * If a NEW Position: INVEST or PASS.
    * If an EXISTING Position: HOLD, ACCUMULATE, or LIQUIDATE. (TRIM is strictly and permanently eliminated).
  - Core Portfolio Decision Contract (The Never-Trim Compounding Doctrine & 4-Gate Isolation Matrix):
    Rule 1 (Archetype Eligibility Gate): The Never-Trim Compounding Doctrine applies strictly to verified Fast Growers, Wide-Moat Stalwarts, and Cyclical Compounders maintaining a normalized through-cycle ROIC > 10.0% static hurdle rate. For these compounding franchises, we NEVER sell or trim merely due to multiple expansion, unrealized gains, or portfolio weighting (even past 10%, 20%, or 30%+ of portfolio equity). However, if the holding is classified in Part 9 as a Pure Commodity Cyclical, Turnaround, Slow Grower, or Asset Play, enforce category-specific exit discipline: recommend LIQUIDATE when a turnaround/asset play converges on intrinsic value or when a pure commodity cyclical exhibits peak-cycle harbingers (bloated inventories, spot prices falling below futures, or peak-cycle CapEx surges).
    Rule 2 (Mandatory 4-Gate Isolation Diagnostic — Cyclical Compression vs. Permanent Moat Decay): Whenever an existing holding experiences revenue deceleration, margin compression, or a >20% price drawdown, you are strictly forbidden from accepting management's MD&A excuses at face value. You MUST evaluate the holding across four quantitative gates before selecting HOLD, ACCUMULATE, or LIQUIDATE:
      * Gate 1 (Peer-Relative Captivity & Share — Part 2 Radar): Is the contraction industry-wide (company market share stable or rising over a 3-year window, customer captivity intact), or is the company suffering idiosyncratic share loss and customer defections to direct peers or substitutes?
      * Gate 2 (Gross Margin Pricing Power vs. Fixed-Cost Deleverage): Is Gross Margin structurally stable over a 3-year rolling window (proving intact pricing power while Operating Margin temporarily deleverages on lower cyclical volume), or is Gross Margin compressing structurally due to forced discounting and loss of pricing power?
      * Gate 3 (Capital Allocation & Forensic Integrity — Parts 1 & 3): Has management maintained through-cycle incremental ROIC >= 10.0% and passed the 5-Year Capital Allocation $1 Retained Earnings Test (>= $1.00 market value created per $1.00 retained)? Flag an immediate breach if management engages in value-destructive out-of-moat M&A ("diworseification"), recurring cost-restructuring charges, or severe cash conversion deficits (3-year CFO < 80% Net Income). You are strictly forbidden from triggering a forensic breach on mechanical single-quarter working capital timing swings or cash-funded M&A acquisition accounting.
      * Gate 4 (Zero-Base Thesis & Fade Recalibration — Parts 6, 7 & 8): Re-underwrite the core story from a zero base. Verify whether the operational trajectory still supports the Part 6 Zero-Growth EPV Floor and Part 7 Expected DCF without thesis creep.
        - STRICT PROHIBITION OF SUNK-COST BIAS: Gate 4 evaluates forward intrinsic value ($XX.XX) EXCLUSIVELY against the CURRENT MARKET PRICE ($XX.XX). You are STRICTLY FORBIDDEN from comparing forward intrinsic value against the user's historical purchase price (cost basis / \`user_cost_basis\`) to justify a LIQUIDATE verdict. Historical purchase price is an unrecoverable sunk cost; a drawdown below cost basis NEVER constitutes thesis invalidation if current market price trades at or below intrinsic value.
    Rule 3 (Deterministic Execution Routing for Existing Holdings):
      * LIQUIDATE: Mandatory if ANY of the following fire: (a) Structural Moat Decay (fails Gate 1 or Gate 2 via sustained multi-year share loss, broken customer captivity, structural gross margin erosion, or operating in a secularly shrinking TAM with heavy fixed scale costs); (b) Capital Destruction or Forensic Breach (fails Gate 3 via value-destructive M&A diworseification, chronic sub-hurdle reinvestment, fraudulent accounting manipulation, or acute governance failure); (c) Thesis Invalidation or Category Drift (fails Gate 4, a Fast Grower permanently decelerates into a single-digit Slow Grower while priced for high growth, or a Pure Cyclical/Turnaround reaches its cycle peak/fair-value exit).
        - FORTRESS BALANCE SHEET & TROUGH PROTECTION: If an existing holding holds Net Cash (or zero funded debt), passes Gates 1 and 2 over a 3-year cycle, and trades at or below its Zero-Growth EPV Floor or within its Target Buy Band, the Senior Value Investor has full institutional authority to issue HOLD (or ACCUMULATE), recognizing cyclical trough earnings. You are strictly forbidden from liquidating a net-cash cyclical compounder at the trough of its commodity cycle.
      * ACCUMULATE: Permitted ONLY if Gates 1, 2, 3, and 4 PASS (proving temporary cyclical compression or macro pessimism with an intact moat) AND the current market price trades at a >= 15%–20% Margin of Safety discount (Target Buy or Screaming Buy band) to Intrinsic Value for Wide-Moat Compounders (>= 20%–25% for Cyclicals).
      * HOLD: Default directive when Gates 1, 2, 3, and 4 PASS and the stock trades above our accumulation buy bands (or when holding a net-cash compounder through a cyclical trough). Maintain the full position uninterrupted without trimming.
  - State exactly why the Red Team's forensic attack either broke the thesis or was refuted by the filing data.

* Step 5: Portfolio Construction & Sizing:
  - Given a concentrated portfolio (maximum 13 companies, 5% to 13% target weighting):
    * If INVEST (New): State your proposed initial position size linked to business quality and margin of safety. Detail a 2-Tranche execution plan (Tranche 1 immediate allocation at current prices, Tranche 2 limit order at the Screaming Buy / Deep Value band).
    * If HOLD or ACCUMULATE (Existing): Maintain the full position without trimming. If price pulls back to or below our margin of safety / Screaming Buy band, recommend ACCUMULATE. Never trim solely due to position size or multiple expansion.
    * If PASS or LIQUIDATE: State "No capital allocated."

* Step 6: The 5-Metric Quarterly Monitoring Dashboard:
  - Construct an institutional 'Monitoring Dashboard' to track this investment thesis over time.
  - Identify 3-5 Key Thesis Metrics to track every quarter, the specific 'Thesis-Breaker' trigger event for each (incorporating the Red Team's catalyst), and the 'Current Status'.
  - You MUST output this strictly as a clean Markdown table with EXACTLY these three columns:
    | Key Thesis Metric | Thesis-Breaker Event | Current Status |

CRITICAL FORMATTING DIRECTIVE: You are strictly forbidden from outputting ASCII art boxes (+----+), typewriter-style bordered headers, equals-sign borders (====), dashed lines (----), or wrapping tables/verdicts in monospace code blocks (\`\`\`). Present the Executive Verdict Summary, Valuation Benchmark Comparison, and Monitoring Dashboard strictly as standard GitHub-Flavored Markdown tables (| Header 1 | Header 2 |) with matching columns, standard delimiters (| :--- | :---: |), and no enclosing code fences.`
  }
];

export const CROSSCHECK_PROMPT: MasterPrompt = {
  id: 12,
  title: "Part 12: Forensic Audit & Fact-Check Crosscheck",
  category: "Forensic Audit & Fact-Check",
  defaultTemp: 0.0,
  defaultThinkingLevel: "high",
  text: `VOICE DIRECTIVE — FORENSIC & DEFENSE VOICE (80% ASD-STE100):
Execute this independent forensic audit strictly adhering to Forensic & Defense Voice (80% ASD-STE100):
- Active voice only. Eliminate passive constructions (e.g. Write "Report miscalculated Net Debt", "Filings prove $45M Capex", not "Net debt was miscalculated").
- One verb per sentence. Write short, direct, audit-ready sentences (maximum 20-25 words).
- Zero corporate euphemisms. Ban all corporate and advisory euphemisms ('headwinds', 'synergies', 'softness', 'challenges'). State exact numerical discrepancies and filing facts.
- Strict metric-to-finding assertions: Format every verification directly: Reported metric -> Audited recalculation -> Material variance -> Binary audit finding (PASS / FLAG / BREACH).

**Role:** Act as a forensic financial auditor and fact-checker aligned with a strict value investing framework. I am providing you with a financial analysis document (the compiled output of Steps 1-11 above) and several raw source files (SEC filings, financial tables, and earnings transcripts). Your job is to verify the structural and financial accuracy of the analysis document.

### MANDATORY PRE-FLIGHT AUDIT TRIPWIRES (EXECUTE BEFORE DETAILED RECALCULATION):

**Gate 0: Structural Pipeline Completeness & Chapter Roll Call Audit**
- **Action:** Inspect the compiled document and verify that all 11 prior chapters (Parts 1 through 11) are present, sequential, and fully populated.
- **Fail Condition:** If any chapter is missing, skipped, or truncated (e.g., jumping from Part 2 to Part 6, missing Part 3 Owner Earnings, Part 4 Moats, Part 5 Qualitative, Part 6 Zero-Growth EPV, or Part 7 DCF), you MUST immediately issue an audit breach:
  \`🔴 CRITICAL THESIS-BREAKER: STRUCTURAL PIPELINE DEFICIT — Parts [List Missing] are missing from the analysis.\`

**Gate 1: Entity & Ticker Integrity Audit (Zero Alien Contamination)**
- **Action:** Verify that every table, company name, ticker symbol, and market price tape across all 11 parts strictly belongs to the target company.
- **Fail Condition:** If ANY table or metric contains a foreign ticker symbol (e.g., PLTR, AAPL, etc., in a different company's dossier), or if any table quotes an alien tape price that contradicts the target company's market price tape by >10%, you MUST immediately issue an audit breach:
  \`🔴 CRITICAL THESIS-BREAKER: ALIEN ENTITY CONTAMINATION — Foreign company data detected in Part [X].\`
- **Legitimate Peer Benchmarking Exception:** Foreign peer tickers and comparative metrics are fully permitted and expected in the Competitor Moat & Valuation Radar (Part 2 Section 1.4), Peer Moat Comparisons (Part 4), Thesis Radar Integration (Part 9), and Red Team Competitor Weaponization (Part 10), provided they are explicitly designated as competitor/peer benchmarks and not substituted as the target company's primary identity or market price tape.

**Gate 2: Portfolio Mandate & Definitive Verdict Alignment Audit**
- **Action:** Cross-check the Step 11 Definitive Verdict table against the provided User Portfolio Context:
  - **Existing Holding (\`holdsPosition: true\`):** The final portfolio action directive in Step 11 MUST strictly be **HOLD**, **ACCUMULATE**, or **LIQUIDATE**. Under the Never-Trim Compounding Doctrine, \`TRIM\` is strictly eliminated. If Step 11 outputs \`PASS\`, \`INVEST\`, or \`TRIM\`, you MUST issue an audit breach:
    \`🔴 CRITICAL THESIS-BREAKER: PORTFOLIO ACTION DIRECTIVE MISALIGNMENT — Evaluated existing holding with invalid action directive (PASS/INVEST/TRIM). Valid directives: HOLD, ACCUMULATE, LIQUIDATE.\`
    Furthermore, verify that Step 11 enforced the **Archetype Eligibility Gate** (distinguishing Fast Growers, Wide-Moat Stalwarts, and verified Cyclical Compounders from Pure Commodity Cyclicals and Turnarounds) and evaluated the **4-Gate Isolation Diagnostic** (Peer-Relative Share, Gross Margin Pricing Power vs. Fixed-Cost Deleverage, Capital Allocation $1 Test / Zero Diworseification, and Zero-Base Thesis Recalibration with strict prohibition of sunk-cost bias) before issuing \`HOLD\`, \`ACCUMULATE\`, or \`LIQUIDATE\`.
  - **New Position (\`holdsPosition: false\`):** The final portfolio action directive in Step 11 MUST strictly be **INVEST** or **PASS**. If Step 11 outputs \`HOLD\`, \`ACCUMULATE\`, \`TRIM\`, or \`LIQUIDATE\`, you MUST issue an audit breach:
    \`🔴 CRITICAL THESIS-BREAKER: PORTFOLIO ACTION DIRECTIVE MISALIGNMENT — Evaluated new prospective buyer with existing holding directive.\`

**Gate 3: Cash-Flow Valuation Consistency Crosscheck**
- **Action:** Verify that the Intrinsic Value and Target Price Bands in Part 11 match the audited values synthesized in Part 6 (Zero-Growth EPV Floor), Part 7 (Probabilistic DCF Scenarios & Expected DCF), and Part 8 (Valuation Synthesis & Sensitivity Matrix).
- **Fail Condition:** Flag any internal mathematical contradiction where Part 11 uses prices or multiples that contradict Parts 6 through 8.

**Gate 4: Mandatory Arithmetic Proof & Formula Recalculation Scratchpad**
- **Action:** Execute an independent, scratchpad arithmetic proof of the primary valuation formulas and table summations to eliminate token-level language model hallucinations:
  1. **Scenario Weighting Summation (Part 7, Sec 2 or Sec 3):** Calculate \`(0.25 * Bear Value) + (0.50 * Base Value) + (0.25 * Bull Value)\` from Part 7 Sec 2 (or Part 7 Sec 3 R&D-Capitalized DCF for verified Tech Compounders passing the Red Queen Gate). Compare against the reported "Synthesized Intrinsic Value". Flag any delta > 1.0% (or > $0.25 per share).
  2. **Diluted Share Count Division (Parts 6, 7, 8):** Verify \`Verified Per-Share IV = (Audited Equity Value in $M * 1,000,000) / Diluted Shares Outstanding\`. Verify that Common Diluted Shares from Form 10-Q/10-K (including options/RSUs) were used rather than basic shares. Flag any delta > 1.0% (or > $0.25 per share).
  3. **Target Buy Price Band Math (Part 9, Sec 1.4 & Part 11):** Calculate:
     - Quality-Tiered Target Buy Band (15%–25% MoS): \`Reported Intrinsic Value * 0.75\` to \`Reported Intrinsic Value * 0.85\` (verifying exact consistency with the stated MoS % in Part 9 and Part 11: \`0.75x–0.85x IV\` for Wide-Moat Compounders; \`0.75x IV\` / 25% MoS standard)
     - 35%–50% Screaming Buy / Deep Value Band: \`Reported Intrinsic Value * 0.50\` to \`Reported Intrinsic Value * 0.65\`
     Compare against the price bands reported in Part 9 and Part 11. Flag any unaligned drift > 1.0%.
  4. **Signed Margin of Safety Contract (Part 11, Step 4 & YAML):** Calculate \`Verified MoS % = ((Reported Intrinsic Value - Market Tape Price) / Reported Intrinsic Value) * 100%\`. Verify that the signed contract is strictly enforced: \`+XX.XX% (Discount)\` when Market Tape < Intrinsic Value, and \`-XX.XX% (Deficit)\` when Market Tape > Intrinsic Value. Flag inverted signs or reversed denominators (0.0% zero tolerance on sign inversions).
  5. **Equity Bridge Summation & Operational Boundary Audit (Parts 5, 6, 7):** Sum all positive and negative bridge items: \`Verified Equity Value = Enterprise Value + Cash - Funded Debt - Audited Off-Balance-Sheet Liabilities\` (for Banks, Insurers, and REITs evaluated via Direct Equity / Excess Return / AFFO models in Parts 6 & 7, verify that customer deposits, insurance float/reserves, and operating funding liabilities are NOT deducted as enterprise debt). Verify that line items sum to the reported Equity Value within 1.0% rounding tolerance. Furthermore, enforce the **Confirmed Legal Contingency & Operating Contract Boundary**: deduct only confirmed legal judgments/bonds or probable accrued balance-sheet reserves (strictly forbid deducting speculative class-action complaint prayers); flag any deduction of ongoing executory contracts (AWS/Google cloud compute, dedicated air/cargo freight, unvested multi-year executive cash compensation) or SaaS unearned revenue as an immediate double-count breach.
  6. **Multi-Year Distributable FCF Reinvestment Consistency (Part 7):** Verify \`Distributable FCFF = Sustainable NOPAT * (1 - Reinvestment Rate)\`. Verify that cash flows projected in the DCF table adhere strictly to the stated reinvestment rate within 1.0% rounding tolerance.
- **Fail Condition:** If any calculation exhibits a material arithmetic variance > 1.0% (or > $0.25 per share beyond normal intermediate table rounding), inverts Margin of Safety signs, or double-counts executory operating contracts / speculative litigation, you MUST issue an audit breach:
  \`🔴 CRITICAL THESIS-BREAKER: ARITHMETIC RECALCULATION VARIANCE — [Metric] was reported as [Claimed Value] but verified recalculation equals [Calculated Value] (Delta: [+/-Delta]).\`

---

### CORE FACT-CHECK & FORENSIC AUDIT PROTOCOL:
To ensure a focused, high-signal fact-check that avoids immaterial "false alarms," you must execute the following four steps based strictly on materiality:

**1. Independent Mathematical Verification (The Anti-Anchoring Check)**
- **Action:** Recalculate all core financial metrics mentioned (Net Debt including off-balance sheet lease/pension equivalents and confirmed legal reserves, Net Cash, Free Cash Flow, Owner Earnings, Margins, Return on Retained Capital (RORC), Capital Allocation $1 Total Shareholder Value Test, Forensic Accounting & Earnings Quality vectors (Buy-Side Cash Integrity Protocol: 3-Year Cumulative Cash Conversion, Charlie Munger Zero-EBITDA & Non-GAAP Add-Back Rejection, Aggressive Expense Capitalization & Revenue Pull-Forward, and Balance Sheet Asset & Working Capital Integrity), and Market-Implied Reverse DCF expectations) using the raw balance sheet, income statement, and cash flow CSV tables.
- **Focus:** Ensure liabilities, capitalized costs, and cash equivalents are accurately accounted for. Flag mathematical discrepancies _only if_ they materially misstate the company's valuation ceiling, downside floor, or earnings quality status.

**2. The Material Omission Audit (The Solvency & Trajectory Check)**
- **Action:** Scan the 10-Q/10-K filings and Earnings Transcripts for massive strategic events.
- **Focus:** Identify any major capital allocations (acquisitions, massive stock buybacks), executive/management departures, or pending litigation/contingencies. You must flag an omission _only if_ it poses a solvency threat, an operational risk, or significantly alters the company's risk profile and growth trajectory. Explicitly ignore routine business updates, minor IT implementations, or standard administrative boilerplate.

**3. Explicit Claim Verification (The Commission Check)**
- **Action:** Cross-check operational claims, market share percentages, combined ratios, and competitor metrics.
- **Focus:** Ensure the document is not structurally exaggerating the company's competitive moat or downplaying cycle headwinds.

**4. Causality & Hallucination Check (The Narrative Check)**
- **Action:** Verify the _reasons_ given for strategic moves against management's explicit statements in the earnings transcripts.
- **Focus:** Flag instances where the text assigns a false narrative to a business decision. You must ignore minor chronological misattributions or quote-sourcing errors _unless_ they actively distort the investment thesis or misrepresent the company's economic reality.

**CRITICAL FORMATTING & AUDIT REPORT STRUCTURE:**
You are strictly forbidden from outputting LaTeX math syntax. You are strictly forbidden from outputting ASCII art box tables with +----+ borders or wrapping tables in code blocks. Use clean standard markdown pipe tables (| Header 1 | Header 2 |) and plain text bullet points.

Provide your findings structured under the following exact sections:

### 1. Executive Audit Summary & Verification Triage
State your high-level audit verdict:
- Overall Audit Status: [🟢 Clean & Corroborated / 🟡 Material Non-Fatal Variances / 🔴 Critical Thesis-Breakers Detected]
- Pipeline Completeness: [PASS — All 11 Chapters Present / BREACH — Missing Parts]
- Entity & Ticker Integrity: [PASS — 100% Target Company Isolated / BREACH — Alien Data Detected]
- Portfolio Mandate Alignment: [PASS — Action Directive Matches Holding Status / BREACH — Misaligned Action]
- Valuation Arithmetic & Bridge Integrity: [PASS — 100% Formulas & Summations Verified / BREACH — Recalculation Variance Detected]
- Summary of high-level audit findings in 2-3 sentences.

### 2. Structural & Pipeline Audit (Pre-Flight Roll Call)
Report the results of Gate 0 (Chapter Roll Call), Gate 1 (Zero Alien Contamination), Gate 2 (Portfolio Mandate Alignment), Gate 3 (Cash-Flow Valuation Consistency), and Gate 4 (Arithmetic Proof & Formula Recalculation Scratchpad).

You MUST output the Gate 4 Arithmetic Proof Scratchpad as an explicit 6-row GitHub-flavored markdown table:
| Mathematical Vector | Report Claimed Value | Independent Recalculation | Delta / Variance | Audit Verdict (PASS / BREACH) |
| :--- | :---: | :---: | :---: | :---: |
| **1. DCF Scenario Weighting Sum** | $XX.XX | $XX.XX | $0.00 | PASS / BREACH |
| **2. Diluted Share Count Division** | $XX.XX | $XX.XX | $0.00 | PASS / BREACH |
| **3. Target Buy Band Math (15%–25% MoS)** | $XX.XX | $XX.XX | $0.00 | PASS / BREACH |
| **4. Signed Margin of Safety Contract** | +/-XX.XX% | +/-XX.XX% | 0.00% | PASS / BREACH |
| **5. Equity Bridge Line-Item Sum** | $XX.XXM | $XX.XXM | $0.00M | PASS / BREACH |
| **6. DCF Distributable FCF Consistency** | $XX.XXM | $XX.XXM | $0.00M | PASS / BREACH |

Explicitly detail any missing chapters, foreign ticker tables, portfolio directive violations, or arithmetic calculation breaches.

### 3. What is Accurate (Corroborated Pillars)
Briefly list the primary metrics, balance sheet positions, and strategic assumptions from the analysis that were verified as mathematically sound and factually accurate against the filings.

### 4. Mathematical & Metric Discrepancies
If discrepancies exist, format them in this exact GitHub-flavored markdown table:
| Claimed Value in Report | Filing Citation & Table | Verified Recalculation | Material Variance & Valuation Impact | Severity (🔴/🟡) |
| --- | --- | --- | --- | --- |
*(If no material math errors exist, explicitly state: "No material mathematical discrepancies found.")*

### 5. Material Omission Audit (Solvency & Trajectory)
Detail any overlooked strategic events, major capital allocations, management turnover, or pending legal/contingent liabilities that alter the company's risk profile or trajectory.

### 6. Explicit Claims & Moat Verification
Review market share percentages, unit economics, or competitive claims. Note whether claims are substantiated or if the analysis structurally exaggerated the moat.

### 7. Causality & Narrative Check
Highlight any narrative misattributions or false justifications assigned to management decisions that distort the economic reality of the business.

[STRICT MATERIALITY DIRECTIVE]: Do not report immaterial discrepancies or minor rounding variations (<1-2%). Focus ruthlessly on factors that shift intrinsic value or margin of safety.`
};

export const SLINGSHOT_PROMPT: MasterPrompt = {
  id: 101,
  title: "Mode 1: Slingshot Underwriting Triage Memo",
  category: "Slingshot Triage",
  defaultTemp: 0.1,
  defaultThinkingLevel: "high",
  text: `CRITICAL FORMATTING DIRECTIVE:
You are strictly forbidden from outputting raw LaTeX math notation ($$, \\frac, \\mathbf, \\text, \\times) or backslashed dollar signs (\\$). Present all formulas and calculations as clean plain-text equations. You are strictly forbidden from outputting typewriter-style ASCII text boxes, Unicode box characters (│, ┌, ┐, └, ┘, ─, ═), typewriter sliders, or monospace code fences around narrative sections. ALL tables MUST be clean, standard GitHub-Flavored Markdown pipe tables (| Col 1 | Col 2 |).

CRITICAL VOICE DIRECTIVE — HYBRID BIMODAL ARCHITECTURE:
- Pillar 1 (Thesis) & Pillar 3 (Moat & Capital Allocation): Strategic & Moat Voice (rich qualitative depth, business model mechanics, unit economics, capital allocation philosophy).
- Pillar 2 (Cash Integrity), Pillar 4 (Valuation Math), Pillar 5 (Pre-Mortem), & Pillar 6 (Verdict): Strict 80% ASD-STE100 Forensic & Defense Voice (active voice, one verb per sentence, zero corporate euphemisms, direct metric-to-finding assertions: PASS / FLAG / BREACH).

CRITICAL FOREIGN CURRENCY & ADR DIRECTIVE:
For foreign private issuers, international common stocks, and American Depositary Receipts (ADRs) such as NVO (Novo Nordisk in DKK), OMAB (in MXN), ASML (in EUR), etc.:
- Home Currency Operational Invariance: The financial CSV is harmonized in the company's native Home Currency across all historical periods. Perform all operational evaluations, margin trends, sales compounding, starting baseline OE_0, and Return on Retained Capital (RORC) strictly in the native Home Currency to eliminate foreign exchange translation noise.
- Balance Sheet Consistency: Ensure Cash and Gross Debt are evaluated in identical Home Currency units before calculating Net Cash, Enterprise Value, or Cash-Adjusted Margin of Safety.
- Dual-Currency Valuation Bridge: In Pillar 4 and Pillar 6, calculate Intrinsic Value and EPV Floor per share first in the native Home Currency per ordinary share. Then apply the disclosed Current Spot Exchange Rate and ADS ratio (Ordinary Shares per 1 ADS) to convert to USD per ADS:
  Intrinsic Value per ADS (USD) = [Intrinsic Value per Ordinary Share (Native) * Ordinary Shares per 1 ADS] / Spot FX Rate (Native per 1 USD)
- US Market Tape Parity Contract: In the Pillar 6 decision table, the Current Market Tape Price, Synthesized Intrinsic Value, and Zero-Growth EPV Floor Benchmark MUST be stated in USD per ADS so they compare 1:1 against the US market price ($XX.XX USD). Never compare unadjusted native currency figures against the USD tape price.

You are acting as the Chief Investment Officer and Forensic Underwriter executing a high-conviction, single-turn Institutional Underwriting Triage Memo on the provided target company filings (Form 10-K/20-F, Form 10-Q/6-K, Earnings Transcript, 40-Quarter Financials CSV, and Competitor Radar).

Execute the triage memo across the following 6 Indispensable Decision Pillars:

### 1. Executive Thesis & Core Business Economics
- Business Model & Revenue Engine: What job does the customer hire this product/service to do? Describe the unit economics, pricing structure, and customer value proposition.
- Peter Lynch Archetype Classification: Classify into exactly one archetype (Fast Grower, Stalwart, Cyclical Compounder, Pure Commodity Cyclical, Slow Grower, Asset Play, Turnaround) with supporting top-line, operating margin, and ROIC thresholds.
- Industry Archetype Routing: Specify whether this business operates under standard corporate economics, digital banking/fintech, insurance, homebuilder, or REIT framework.

### 2. 4-Vector Buy-Side Forensic Cash Integrity Audit (3-Year Rolling Window)
Execute a strict 3-year rolling cash integrity audit across the 4 core vectors, presenting the results in a clean GFM pipe table:
| Forensic Cash Vector | Audited 3-Year Metric | Desk Standard | Finding (PASS / FLAG / BREACH) |
| :--- | :---: | :---: | :---: |
| **1. 3-Year Cumulative Cash Conversion** | [3Y Cum OCF / 3Y Cum GAAP NI %] | >= 85.0% | PASS / FLAG / BREACH |
| **2. Non-GAAP Add-Back & SBC Dilution Audit** | [SBC % of OCF / SBC % of Revenue] | <= 10.0% OCF / 5.0% Rev | PASS / FLAG / BREACH |
| **3. Aggressive Capitalization & Receivables Pull-Forward** | [Receivables Growth vs Rev Growth] | <= 1.5x Rev Growth | PASS / FLAG / BREACH |
| **4. Balance Sheet Integrity & Solvency** | [Net Cash or Net Debt / 3Y OE_0] | Net Cash or Net Debt/OE <= 2.5x | PASS / FLAG / BREACH |

### 3. Substantiated Moat & Management Capital Allocation
- Moat Classification & Durability: Rate moat as **Wide**, **Narrow**, or **None**. Cite concrete evidence: pricing power without customer attrition, switching costs (quantified in time/capital), and customer loyalty (gross retention, NRR).
- Moat Trajectory & Competitor Radar Benchmarking: Compare gross margin, operating margin, and ROIC against the provided Competitor Radar direct peers. Is the moat widening, stable, or decaying?
- Deliberate Strategic Reinvestment Protocol (The MELI Doctrine): If operating margin compressed in recent periods, audit whether compression is driven by deliberate, moat-widening customer-value reinvestment (e.g. logistics buildout, free shipping, R&D scaling) with accelerating GMV/volume and through-cycle ROIC > 10.0%, OR structural competitive deterioration.
- Capital Allocation Track Record: Grade management on historical ROIC vs. 10.00% hurdle, M&A discipline, and share repurchases (opportunistic share retirement vs. anti-dilutive SBC offsetting).

### 4. Ground-Up Cash-Flow Sovereign Valuation (Stream 2)
[PRECISION MANDATE]: Maintain 100% mathematical rigidity. Show plain-text calculations. Zero WACC/Beta (static 10.00% hurdle rate).
- Universal 3-Year Trailing Average Starting Baseline (OE_0): Calculate Normalized Owner Earnings across the trailing 3 fiscal years (deducting 100% of SBC as cash expense and subtracting empirical Maintenance CapEx). State the universal starting cash base OE_0 = (OE_TTM0 + OE_TTM1 + OE_TTM2) / 3.
- Foreign Currency & ADR Dual-Currency Bridge: If the company reports in a foreign native currency (e.g. DKK for NVO), show the native currency calculation first, then apply the Spot FX rate and ADS ratio to state the per-share DCF scenarios and EPV Floor in USD per ADS to compare directly against the US tape price.
- The Red Queen Test & Dynamic Tech R&D Capitalization Gate: Evaluate whether Growth R&D compounds TAM/margins or represents defensive maintenance table stakes (The Red Queen Effect). If verified tech compounder passing the gate, dynamically calibrate the substantiated Growth R&D % from filing disclosures (net of 5-year ongoing R&D amortization drag).
- Zero-Growth Earnings Power Value (EPV) Floor: Capitalize OE_0 at the static 10.00% hurdle rate, bridge through Net Cash (Cash - Total Gross Debt), and compute EPV Per Share.
- Probabilistic 10-Year Owner Earnings DCF Scenario Spectrum: Project 10-year cash flows discounted at 10.00% across 3 explicit scenarios:
  | Valuation Scenario | Probability Weight | Per Diluted Share Value | Implied MoS vs. Market Tape |
  | :--- | :---: | :---: | :---: |
  | **Conservative / Bear Case** | 25% | $XX.XX | XX.XX% |
  | **Base Case** | 50% | $XX.XX | XX.XX% |
  | **Optimistic / Bull Case** | 25% | $XX.XX | XX.XX% |
  | **Probability-Weighted Expected DCF** | **100%** | **$XX.XX** | **XX.XX%** |
  | **Current Market Tape** | — | $XX.XX | — |
- Reverse DCF Expectations Gap: Solve for the 10-year organic growth rate implied by current market price. State whether the market is pricing in excessive pessimism or unrealistic perfection.

### 5. Pre-Mortem Structural Kill-Switch Risks
- Articulate the top 2–3 structural, existential thesis-breakers that would permanently impair the business model.
- Apply the Universal Transitory vs. Structural Standard (Snowstorm Protocol): Distinguish exogenous non-recurring macro/weather friction from structural customer defection or competitive margin erosion.

### 6. Decision-Support Triage Directive & Escalation Triggers
Present the authoritative decision-support triage summary in this exact GFM pipe table:
| Decision Parameter | Audited Portfolio Verdict |
| :--- | :--- |
| **Target Company & Ticker** | [Company Name] ([TICKER]) |
| **Current Market Tape Price** | $[XX.XX] |
| **Synthesized Intrinsic Value (Stream 2)** | $[XX.XX] |
| **Standard Margin of Safety** | [+/-XX.XX%] |
| **Zero-Growth EPV Floor Benchmark** | $[XX.XX] |
| **Substantiated Moat Rating** | [Wide / Narrow / None] |
| **Peter Lynch Classification** | [Active Archetype] |
| **Final Portfolio Action Directive** | **[INVEST / PASS / ESCALATE / HOLD / ACCUMULATE / LIQUIDATE]** |

*Rules for Final Portfolio Action Directive:*
- For prospective new positions (user holds 0 shares): Must strictly be **INVEST**, **PASS**, or **ESCALATE**.
  - Output **ESCALATE** (Escalate to Full Mode) if filing evidence reveals complex structural nuances, turnarounds, or significant qualitative divergence from trailing quantitative numbers (e.g., deliberate MELI-style margin compression, dynamic R&D capitalization shifting an apparent pass into prime buy territory, complex off-balance-sheet/debt/SPE footnotes, or pending litigation) that warrant deep 12-step forensic underwriting. If ESCALATE is chosen, list the exact forensic hypotheses for Mode 2 Steps 3, 5, 6, 7, and 8 to investigate.
- For existing holdings (user holds shares): Must strictly be **HOLD**, **ACCUMULATE**, or **LIQUIDATE** (under Never-Trim Compounding Doctrine, TRIM is permanently banned).
- In narrative prose, frame as decision-support: \`SUGGESTED ACTION: [DIRECTIVE] (Pending Human Verification)\`.`
};

export const SENTINEL_PROMPT: MasterPrompt = {
  id: 102,
  title: "Mode 3: Quarterly Position Sentinel (90-Day Position Pulse)",
  category: "Position Sentinel",
  defaultTemp: 0.1,
  defaultThinkingLevel: "high",
  text: `CRITICAL FORMATTING DIRECTIVE:
You are strictly forbidden from outputting raw LaTeX math notation ($$, \\frac, \\mathbf, \\text, \\times) or backslashed dollar signs (\\$). Present all formulas and calculations as clean plain-text equations. You are strictly forbidden from outputting typewriter-style ASCII text boxes, Unicode box characters (│, ┌, ┐, └, ┘, ─, ═), typewriter sliders, or monospace code fences around narrative sections. ALL tables MUST be clean, standard GitHub-Flavored Markdown pipe tables (| Col 1 | Col 2 |).

CRITICAL VOICE DIRECTIVE — ASD-STE100 FORENSIC & DEFENSE VOICE:
Execute the entire audit using active voice, short direct sentences, zero corporate euphemisms, and direct metric-to-finding assertions. Ban words like 'headwinds', 'tailwinds', 'softness', or 'synergies'. State exact dollar figures, percentages, and accounting entries.

You are acting as the Chief Risk Officer and Senior Portfolio Sentinel conducting a strict 90-day maintenance audit on an existing portfolio holding. The target company's latest quarterly filing (Form 10-Q or Form 8-K Item 2.02 earnings release), earnings transcript, refreshed 40-quarter financial CSV, and the Prior Valuation Dossier are attached to this context as your immutable reference materials.

Execute the sentinel maintenance audit across the following 5 analytical pillars:

### 1. Executive Quarterly Update & 40Q Operational Delta
- Period Audited: State the latest reporting quarter and compare against the Prior Dossier reporting period.
- Operational Momentum Deltas: Compare the latest quarter against both the same quarter 1 year ago (Q/Q YoY ex-seasonal noise) and sequential quarter across: Revenue, Gross Margin, Operating Income, Operating Cash Flow, Stock-Based Compensation, and Diluted Share Count.
- Management Conference Call Interrogation: Audit the transcript for executive tone, guidance revisions, customer retention comments, CapEx commitments, and competitive commentary.

### 2. Prior Dossier Part 11 Monitoring Dashboard Audit
Inspect the 5 specific thesis monitoring metrics established in Part 11 of the Prior Dossier. Grade each metric objectively:
| Metric # | Thesis Metric & Baseline (Prior Dossier) | Latest Q Audited Result | Delta / Status (🟢 INTACT / 🟡 TRANSITORY DRIFT / 🔴 BREACHED) | Thesis Impact |
| :---: | :--- | :--- | :---: | :--- |
| **1** | [Prior Metric 1] | [Current Value] | 🟢 / 🟡 / 🔴 | [Intact / Watch / Thesis Risk] |
| **2** | [Prior Metric 2] | [Current Value] | 🟢 / 🟡 / 🔴 | [Intact / Watch / Thesis Risk] |
| **3** | [Prior Metric 3] | [Current Value] | 🟢 / 🟡 / 🔴 | [Intact / Watch / Thesis Risk] |
| **4** | [Prior Metric 4] | [Current Value] | 🟢 / 🟡 / 🔴 | [Intact / Watch / Thesis Risk] |
| **5** | [Prior Metric 5] | [Current Value] | 🟢 / 🟡 / 🔴 | [Intact / Watch / Thesis Risk] |

### 3. Universal Transitory vs. Structural Standard (Snowstorm Protocol) & MELI Doctrine
- Universal Snowstorm Audit: If revenue growth slowed or margins contracted, determine whether the driver is **Transitory** (exogenous non-recurring weather/timing/calendar friction with intact customer captivity and pricing power) or **Structural** (loss of market share to direct peers, customer defection, pricing destruction, or obsolescence). Zero hardcoded event words.
- Deliberate Strategic Reinvestment Audit (The MELI Doctrine): If operating margin contracted, verify whether gross margins and customer unit volumes accelerated from deliberate capacity/fulfillment investments. If ROIC remains > 10.0%, classify as moat-widening compounding, not thesis decay.

### 4. Ground-Up Refreshed Valuation & Intrinsic Value Delta
- Universal 3-Year Rolling Average Baseline (OE_0): Recompute the 3-Year Rolling Average Normalized Owner Earnings from the refreshed CSV tables.
- Refreshed Zero-Growth EPV Floor: Capitalize refreshed OE_0 at 10.00% hurdle, bridge through current Net Cash, and compare to Prior EPV.
- Refreshed Probabilistic Expected DCF: Compute refreshed probability-weighted Intrinsic Value at 10.00% hurdle across Bear (25%), Base (50%), and Bull (25%) scenarios.
- Intrinsic Value & Margin of Safety Delta Table:
  | Valuation Anchor | Prior Dossier Baseline | Refreshed Sentinel Value | Variance ($ / %) | Audit Direction |
  | :--- | :---: | :---: | :---: | :---: |
  | **Market Tape Price** | $[XX.XX] | $[XX.XX] | [+$X.XX / +X.X%] | Market Tape Delta |
  | **Zero-Growth EPV Floor** | $[XX.XX] | $[XX.XX] | [+$X.XX / +X.X%] | Floor Delta |
  | **Expected Intrinsic Value** | $[XX.XX] | $[XX.XX] | [+$X.XX / +X.X%] | Compounding Trajectory |
  | **Standard Margin of Safety** | [XX.XX%] | [XX.XX%] | [+/-X.XX%] | Valuation Safety Spread |

### 5. The 4 Isolation Gates & Portfolio Action Directive
Evaluate the 4 Isolation Gates for existing holdings:
- Gate 1: Structural Moat Impairment (Has core moat permanently breached? PASS / BREACH)
- Gate 2: Balance Sheet Solvency Threat (Are net debt or debt maturities unserviceable? PASS / BREACH)
- Gate 3: Management Predation & Capital Destruction (Has management acted against owners? PASS / BREACH)
- Gate 4: Superior Capital Allocation Opportunity (Does an actionable alternative exist at 0% tax friction with significantly higher conviction? PASS / BREACH)

Present the authoritative decision-support summary in this exact GFM pipe table:
| Decision Parameter | Audited Portfolio Verdict |
| :--- | :--- |
| **Holding Ticker & Company** | [Company Name] ([TICKER]) |
| **Current Market Tape Price** | $[XX.XX] |
| **User Portfolio Cost Basis** | $[XX.XX] ([Current Weight]%) |
| **Refreshed Intrinsic Value (Stream 2)** | $[XX.XX] |
| **Refreshed Margin of Safety** | [+/-XX.XX%] |
| **Prior Dossier Intrinsic Value** | $[XX.XX] |
| **Net Compounding Trajectory** | [Moat Expanding / Steady Compounding / Decaying] |
| **Final Portfolio Action Directive** | **[HOLD / ACCUMULATE / LIQUIDATE]** |

*Rules for Existing Holdings:*
- Verdict MUST strictly be **HOLD**, **ACCUMULATE**, or **LIQUIDATE**.
- Under our Never-Trim Compounding Doctrine, TRIM and PROBATION are permanently banned.
- In narrative prose, frame as decision-support: \`SUGGESTED ACTION: [DIRECTIVE] (Pending Human Verification)\`.`
};

export const STEP_CHAPTER_TITLES: Record<number, string> = {
  1: "Part 1: Financial Forensics & Capital Allocation Discipline",
  2: "Part 2: Operational Engine & Market Analysis",
  3: "Part 3: Normalized Owner Earnings & Cash Flow Integrity",
  4: "Part 4: Structural Moat Architecture & Antifragility",
  5: "Part 5: Qualitative Filing Audit & Hidden Assets",
  6: "Part 6: Valuation Floor: Zero-Growth Earnings Power Value (EPV)",
  7: "Part 7: Valuation Engine: Probabilistic Owner Earnings DCF & Reverse DCF",
  8: "Part 8: Valuation Synthesis & Sensitivity Matrix",
  9: "Part 9: Preliminary Investment Thesis & Lynch Archetype",
  10: "Part 10: Stress Test: Red Team Forensic Short Attack",
  11: "Part 11: Definitive Verdict, Resolution & Monitoring Dashboard",
  12: "Part 12: Forensic Audit & Fact-Check Crosscheck"
};

```

---

# SECTION 3: BACKEND EXECUTION ENGINE & ORCHESTRATOR

## Source File: `server.ts`
```typescript
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "/opt/terminal-v8/.env" });
import http from "http";
import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import os from "os";
import AdmZip from "adm-zip";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { MASTER_PROMPTS, CROSSCHECK_PROMPT, SLINGSHOT_PROMPT, SENTINEL_PROMPT, STEP_CHAPTER_TITLES } from "./src/prompts.js";
import { ExecutionMode, SessionMode, SessionState, FileLog, AuditCheck, StepOutput, CustomMessage, PortfolioContext, CurrencyAuditResult, DocumentIntegrityReport, HybridConfig, CacheKeepAliveState, PythonValuationResult } from "./src/types.js";
import { auditFinancialCsv, harmonizeFinancialCsv } from "./src/currencyGuard.js";
import { auditDocumentIntegrity, auditFileIntegrity, auditFilesSubstance, checkFileSubstance, parsePeriodString, isSequentialQuarterAhead, formatNormalizedPeriod, isInterimEarningsRelease, detectAuditCategory, runAudit as runAuditCore } from "./src/documentGuard.js";
import { batchManager } from "./src/batchManager.js";
import { sendNtfyNotification, sendEmailNotification, sendTelegramNotification, detectTelegramChatId, dispatchNotification } from "./src/services/notificationService.js";
import { extractSurgicalProxy, scanTranscriptForTargetMentions, extract10KCompetitionSection } from "./src/services/competitorParser.js";
import { harvestCompetitorRadar, verifyAndResolvePeerWithFmp, CandidatePeerInput } from "./src/services/competitorHarvester.js";
import { CompetitorRadarDossier, IndustryArchetype, BatchQueueItem, BatchQueueState, NotificationConfig, NotificationPayload } from "./src/types.js";
import { convertMarkdownToHtml, cleanMarkdownForRendering } from "./src/utils/googleDocs.js";
import { fetchTikrTranscript } from "./src/services/tikrService.js";
import { parseCrosscheckVerdict } from "./src/utils/dossierFormatGuard.js";
import { probeFlexTierAvailability, getFlexWatcherState, startFlexWatcher, cancelFlexWatcher } from "./src/services/flexProbeService.js";
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
  const mode = sessionMode || (state && state.config ? state.config.sessionMode : undefined) || 'full';

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
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

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
  steps: [],
  history: [],
  status: 'idle',
  currentPromptIndex: 0,
  competitorRadar: null,
  cachedTokenCount: 0,
  cacheStatus: 'bypassed',
  cacheKeepAlive: null,
};
state.steps = generateSessionSteps(true);

// --- Persistent Notification Configuration ---
const NOTIFICATION_CONFIG_FILE = path.join(DOWNLOADS_DIR, "notification_config.json");
let notificationConfig: NotificationConfig = {
  enabled: true,
  channels: { desktop: true, telegram: true, ntfy: false, email: true },
  telegram: { 
    botToken: process.env.TELEGRAM_BOT_TOKEN || "", 
    chatId: process.env.TELEGRAM_CHAT_ID || "", 
    sendDossierDoc: true, 
    docFormat: "both" 
  },
  ntfy: { topic: "" },
  email: { 
    provider: "resend", 
    to: process.env.NOTIFICATION_EMAIL_TO || "", 
    resendApiKey: process.env.RESEND_API_KEY || "" 
  },
  events: { singleCompany: true, batchComplete: true, batchCompany: false, blockedAlert: true }
};

try {
  if (fs.existsSync(NOTIFICATION_CONFIG_FILE)) {
    const loaded = JSON.parse(fs.readFileSync(NOTIFICATION_CONFIG_FILE, "utf-8"));
    notificationConfig = {
      ...notificationConfig,
      ...loaded,
      channels: { ...notificationConfig.channels, ...(loaded.channels || {}) },
      telegram: {
        ...notificationConfig.telegram,
        ...(loaded.telegram || {}),
        botToken: loaded.telegram?.botToken || process.env.TELEGRAM_BOT_TOKEN || "",
        chatId: loaded.telegram?.chatId || process.env.TELEGRAM_CHAT_ID || ""
      },
      email: {
        ...notificationConfig.email,
        ...(loaded.email || {}),
        to: loaded.email?.to || process.env.NOTIFICATION_EMAIL_TO || "",
        resendApiKey: loaded.email?.resendApiKey || process.env.RESEND_API_KEY || ""
      },
      events: { ...notificationConfig.events, ...(loaded.events || {}), blockedAlert: true }
    };
  } else {
    // Persist active default notification config to disk on first boot
    fs.writeFileSync(NOTIFICATION_CONFIG_FILE, JSON.stringify(notificationConfig, null, 2), "utf-8");
  }
} catch (cfgErr) {
  console.warn("[Notification Config Warning] Could not load saved config:", cfgErr);
}

// --- Lazy Gemini SDK initialization ---
function getApiHeaderKey(req: any): string {
  const headerKey = req.headers["x-gemini-key"] || req.headers["x-custom-key"] || req.headers["authorization"];
  if (typeof headerKey === "string" && headerKey.trim()) {
    return headerKey.replace("Bearer ", "").trim();
  }
  return "";
}

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is missing. Please set your Gemini API key in Settings > Secrets or in the custom key field of the Analyst Configuration panel.");
  }
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
  const hasRadarMemory = Boolean(
    (state.competitorRadar?.targetTicker?.toUpperCase() === activeTicker.toUpperCase() && state.competitorRadar?.peers?.length) ||
    (activeCompetitorRadar?.targetTicker?.toUpperCase() === activeTicker.toUpperCase() && activeCompetitorRadar?.peers?.length)
  );
  const activeRadar = (state.competitorRadar?.targetTicker?.toUpperCase() === activeTicker.toUpperCase() ? state.competitorRadar : null)
    || (activeCompetitorRadar?.targetTicker?.toUpperCase() === activeTicker.toUpperCase() ? activeCompetitorRadar : null);
  const peerCount = activeRadar?.peers?.length || 0;

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
    competitorRadarMemory: { hasRadar: hasRadarMemory, peerCount },
    priorDossierMemory: { hasPrior: Boolean(state.config?.priorDossierPath), name: state.config?.priorDossierPath ? path.basename(state.config.priorDossierPath) : undefined }
  });
}

function updateTokenCounts() {
  const uploadedTokens = state.files
    .filter(f => f.id !== "compiled-obsidian-report")
    .reduce((sum, f) => sum + (f.tokens || 0), 0);
  
  const historyTokens = state.history.reduce((sum, msg) => {
    if (typeof msg.actualTokens === 'number') {
      return sum + msg.actualTokens;
    }
    return sum + Math.ceil(msg.text.length / 4.2);
  }, 0);
  
  state.uploadedTokens = uploadedTokens;
  state.liveTokensUsed = uploadedTokens + historyTokens;
}

// --- Competitor Radar Intelligence Core ---
let activeCompetitorRadar: CompetitorRadarDossier | null = null;

async function readStagedFileText(fileLog: FileLog): Promise<string | null> {
  try {
    const localPath = path.join(DOWNLOADS_DIR, fileLog.id);
    if (fs.existsSync(localPath)) {
      return await fs.promises.readFile(localPath, 'utf-8');
    }
    if (fs.existsSync(STAGING_DIR)) {
      const stagingPath = path.join(STAGING_DIR, fileLog.name);
      if (fs.existsSync(stagingPath)) {
        return await fs.promises.readFile(stagingPath, 'utf-8');
      }
    }
  } catch (e) {
    console.warn(`[File Reader] Could not read staged file ${fileLog.name}:`, e);
  }
  return null;
}

async function generateAndInjectCompetitorRadar(ticker: string, customPeers?: string[], userFmpKey?: string): Promise<CompetitorRadarDossier | null> {
  const cleanTicker = ticker.toUpperCase().trim();
  const fmpKey = userFmpKey?.trim() || process.env.FMP_API_KEY || "";

  let candidatePeers: Array<{ ticker: string; name?: string; source: 'proxy_peer' | '10k_risk' | 'transcript_qa' | 'industry_benchmark'; isReciprocal?: boolean; reason?: string }> = [];

  // 1. Surgical 10-K / 20-F Item 1 Competition extraction
  const tenKFile = state.files.find(f => 
    f.auditCategory === '10-K' || /(?:10-?k|20-?f|annual)/i.test(f.name)
  );
  let tenKCompetitionExcerpt = "";
  if (tenKFile) {
    try {
      const tenKText = await readStagedFileText(tenKFile);
      if (tenKText) {
        tenKCompetitionExcerpt = extract10KCompetitionSection(tenKText);
        if (tenKCompetitionExcerpt) {
          console.log(`[Competitor Engine] Surgically extracted 10-K Item 1 Competition disclosure for ${cleanTicker} (${tenKCompetitionExcerpt.length} chars).`);
        }
      }
    } catch (e) {
      console.warn(`[Competitor Engine] Could not parse 10-K competition disclosure for ${cleanTicker}:`, e);
    }
  }

  // 2. Surgical DEF 14A Proxy CD&A extraction
  const proxyFile = state.files.find(f => 
    (f.auditCategory === 'DEF 14A' || f.name.toLowerCase().includes('proxy') || f.name.toLowerCase().includes('def14a') || f.name.toLowerCase().includes('def_14a'))
  );
  let proxyExcerpt = "";
  if (proxyFile) {
    try {
      const proxyText = await readStagedFileText(proxyFile);
      if (proxyText) {
        const proxyExtract = extractSurgicalProxy(proxyText);
        proxyExcerpt = proxyExtract.rawExcerpt;
        for (const pt of proxyExtract.peerGroupMentions) {
          candidatePeers.push({ ticker: pt, source: 'proxy_peer', isReciprocal: true });
        }
      }
    } catch (e) {
      console.warn(`[Competitor Engine] Could not parse proxy for ${cleanTicker}:`, e);
    }
  }

  // 3. Add any custom peers requested
  if (customPeers && customPeers.length > 0) {
    for (const cp of customPeers) {
      const cUpper = cp.toUpperCase().trim();
      if (cUpper && !candidatePeers.some(p => p.ticker === cUpper)) {
        candidatePeers.push({ ticker: cUpper, source: 'industry_benchmark' });
      }
    }
  }

  // 4. Deduce Archetype via Official FMP Company Profile
  let archetype: IndustryArchetype = 'standard_corporate';
  let targetIndustry = "";
  let targetSector = "";
  let targetCompanyName = cleanTicker;

  if (fmpKey) {
    try {
      const profRes = await fetch(`https://financialmodelingprep.com/stable/profile?symbol=${cleanTicker}&apikey=${fmpKey}`);
      if (profRes.ok) {
        const profData = await profRes.json() as any[];
        if (Array.isArray(profData) && profData.length > 0) {
          const p = profData[0];
          if (p.companyName) targetCompanyName = p.companyName;
          targetSector = (p.sector || "").toLowerCase();
          targetIndustry = (p.industry || "").toLowerCase();

          if (targetIndustry.includes("insurance") || targetSector.includes("insurance")) {
            archetype = 'insurance';
          } else if (targetIndustry.includes("bank") || targetIndustry.includes("savings") || (targetSector.includes("financial") && (targetIndustry.includes("credit") || targetIndustry.includes("depository")))) {
            archetype = 'financial_bank';
          } else if (targetIndustry.includes("residential construction") || targetIndustry.includes("homebuilding") || targetIndustry.includes("homebuilder")) {
            archetype = 'homebuilder';
          } else if (targetIndustry.includes("reit") || targetIndustry.includes("real estate investment trust") || (targetSector.includes("real estate") && !targetIndustry.includes("development") && !targetIndustry.includes("services"))) {
            archetype = 'reit';
          } else if (targetSector.includes("technology") || targetSector.includes("communication") || targetIndustry.includes("software") || targetIndustry.includes("internet") || targetIndustry.includes("application")) {
            archetype = 'tech_platform';
          } else if (targetSector.includes("industrials") || targetSector.includes("basic materials") || targetSector.includes("energy") || targetIndustry.includes("machinery") || targetIndustry.includes("aerospace")) {
            archetype = 'industrial_asset_heavy';
          }
        }
      }
    } catch (profErr) {
      console.warn(`[Competitor Engine] Could not fetch profile for archetype deduction:`, profErr);
    }
  }

  // 5. Dynamic Peer Discovery via Google Search Grounding (Live Wall Street & SEC Reality)
  const rawCandidatesToVerify: CandidatePeerInput[] = [...candidatePeers];

  if (process.env.GEMINI_API_KEY || state.customApiKey) {
    try {
      console.log(`[Competitor Grounding Engine] Initiating Google Search Grounded peer discovery for ${cleanTicker}...`);
      const ai = getGeminiClient(state.customApiKey);
      const companyDesc = targetIndustry ? `${targetIndustry} (${targetSector})` : (targetCompanyName || cleanTicker);
      const prompt = `You are a senior Wall Street equity research analyst specializing in competitive moat analysis and industry benchmarking.
Target Company: ${targetCompanyName} (Ticker: ${cleanTicker})
Business Sector / Industry: ${companyDesc}

${tenKCompetitionExcerpt ? `PRIMARY SEC DISCLOSURE — 10-K ITEM 1 COMPETITION EXCERPT:\n${tenKCompetitionExcerpt}\n` : ""}
${proxyExcerpt ? `SEC DEF 14A PROXY BENCHMARKING EXCERPT:\n${proxyExcerpt}\n` : ""}

TASK:
Identify the top 4 to 6 direct, publicly traded competitors that compete in the EXACT same core product lines, unit economics, and operational business model.

CRITICAL INSTRUCTIONS:
1. PRIORITY DISCOVERY FROM FILINGS: If management explicitly enumerates direct competitors in the 10-K Competition excerpt or DEF 14A Proxy above (e.g. naming specific corporate rivals), prioritize those direct rivals and resolve their active stock tickers. Exclude private entities (e.g. Lloyd's of London) or broad market indices (e.g. S&P 500 P&C Index).
2. LIVE GOOGLE SEARCH GROUNDING: Use Google Search to verify exact active stock ticker symbols for named competitors, and supplement with verified pure-play publicly traded rivals in the exact same sub-industry if needed to reach 4 to 6 peers.
3. SUB-INDUSTRY PURITY: Exclude companies operating in different sub-industries even if they share a broad sector (e.g. for P&C / specialty insurance, exclude banks, depository thrifts, and ratings agencies; for steel, exclude gold/copper miners and fertilizer producers).
4. PUBLIC TRADING REQUIREMENT: Every competitor MUST be a publicly traded company with an active, liquid stock ticker on a major exchange (NYSE, NASDAQ, TSX, LSE). Do NOT return private companies.

OUTPUT REQUIREMENT:
Output a pure JSON array of objects with EXACTLY this structure:
[
  { "ticker": "TICKER", "name": "Full Company Name", "source": "10k_risk" | "proxy_peer" | "industry_benchmark", "reason": "1-sentence direct competitive rationale" }
]
Do NOT include markdown formatting, conversational text, or backticks outside the JSON.`;

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

      const parsed = cleanAndParseJson(response.text || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[Competitor Grounding Engine] Google Search discovered ${parsed.length} candidates for ${cleanTicker}:`, parsed.map((p: any) => p.ticker || p.name));
        for (const item of parsed) {
          const sym = (item.ticker || "").toUpperCase().trim();
          const name = (item.name || "").trim();
          if ((sym || name) && sym !== cleanTicker && !rawCandidatesToVerify.some(p => p.ticker === sym)) {
            rawCandidatesToVerify.push({
              ticker: sym,
              name: name || sym,
              source: (item.source === '10k_risk' || item.source === 'proxy_peer') ? item.source : 'industry_benchmark',
              reason: item.reason
            });
          }
        }
      }
    } catch (groundErr) {
      console.warn(`[Competitor Grounding Engine Warning] Grounded peer discovery failed:`, groundErr);
    }
  }

  // 6. Secondary Fallback: If candidates are still fewer than 4, query FMP stock-peers API
  if (rawCandidatesToVerify.length < 4 && fmpKey) {
    try {
      console.log(`[Competitor Engine Fallback] Querying FMP stock-peers for ${cleanTicker}...`);
      const peerRes = await fetch(`https://financialmodelingprep.com/stable/stock-peers?symbol=${cleanTicker}&apikey=${fmpKey}`);
      if (peerRes.ok) {
        const peerData = await peerRes.json() as Array<{ symbol: string; companyName?: string }>;
        if (Array.isArray(peerData)) {
          for (const item of peerData.slice(0, 10)) {
            const sym = (item.symbol || "").toUpperCase().trim();
            if (sym && sym !== cleanTicker && !rawCandidatesToVerify.some(p => p.ticker === sym)) {
              rawCandidatesToVerify.push({
                ticker: sym,
                name: item.companyName,
                source: 'industry_benchmark'
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn(`[Competitor Engine] Could not fetch FMP stock-peers for ${cleanTicker}:`, err);
    }
  }

  // 7. Deterministic FMP Verification & Name Resolution Gate
  console.log(`[Competitor Engine] Verifying ${rawCandidatesToVerify.length} candidate peers against FMP for ${cleanTicker}...`);
  const verificationPromises = rawCandidatesToVerify.map(cand => verifyAndResolvePeerWithFmp(cand, cleanTicker, fmpKey));
  const verifiedResults = await Promise.all(verificationPromises);

  const finalVerifiedPeers: Array<{ ticker: string; name?: string; source: 'proxy_peer' | '10k_risk' | 'transcript_qa' | 'industry_benchmark'; isReciprocal?: boolean }> = [];
  const seenTickers = new Set<string>();

  for (const vp of verifiedResults) {
    if (vp && vp.ticker && vp.ticker !== cleanTicker && !seenTickers.has(vp.ticker)) {
      seenTickers.add(vp.ticker);
      finalVerifiedPeers.push({
        ticker: vp.ticker,
        name: vp.name,
        source: vp.source,
        isReciprocal: vp.isReciprocal
      });
    }
  }

  console.log(`[Competitor Engine] Verified ${finalVerifiedPeers.length} direct public competitors for ${cleanTicker}:`, finalVerifiedPeers.map(p => `${p.ticker} (${p.name})`));

  const dossier = await harvestCompetitorRadar(
    cleanTicker,
    targetCompanyName,
    finalVerifiedPeers,
    archetype,
    fmpKey
  );

  activeCompetitorRadar = dossier;
  state.competitorRadar = dossier;

  // Save and upload dossier to Gemini Files API, DOWNLOADS_DIR, and STAGING_DIR
  const dossierName = `${cleanTicker}_Competitor_Radar.md`;
  await saveAndUploadFile(dossierName, dossier.markdownSummary, "text/plain", state.customApiKey || "", "Supplementary");
  console.log(`[Competitor Engine] Staged ${dossierName} via saveAndUploadFile to Files API and repository.`);

  // Auto-refresh the compiled analysis document with the newly embedded radar
  await updateCompiledReportFile().catch(() => {});

  return dossier;
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
- Mandatory Verdict Rule: Because the user is an EXISTING HOLDER, the final portfolio action directive MUST strictly be HOLD, ACCUMULATE, or LIQUIDATE. Under our Never-Trim Compounding Doctrine, we NEVER trim positions simply because they grow large or trade at elevated multiples.`
      : `USER PORTFOLIO CONTEXT: Prospective NEW POSITION (zero existing holdings).
- Mandatory Verdict Rule: The suggested action in Section 6 MUST strictly be one of:
  - SUGGESTED ACTION: INVEST (if MoS >= 30%, clean forensic audit, and durable moat)
  - SUGGESTED ACTION: PASS (if structurally impaired, aggressive non-GAAP dilution, or overvalued)
  - SUGGESTED ACTION: ESCALATE TO FULL MODE (if intriguing qualitative moat, dynamic R&D capitalization divergence, complex multi-segment inflection, or close to hurdle requiring full 11-step deep-dive investigation)`;

    const customNotesText = state.config?.notes 
      ? `CUSTOM USER NOTES / STRATEGIC DIRECTIVES (MUST ENFORCE):\n"${state.config.notes}"\n` 
      : "";

    return `CRITICAL INSTRUCTIONS: The financial filings, macro reports, and CSV spreadsheets are attached to this context under reference files.
Do NOT ask the user to provide them again, and do NOT pretend they are absent.

${getVoiceArchitecturePrompt(0, false)}

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

// --- Native Gemini Implicit Prefix Caching Protocol ---
// In accordance with official Google Gemini API architecture, all Gemini 2.5+ models automatically
// cache prompt prefixes exceeding 4,096 tokens (2,048 on 2.5) without explicit cache creation.
// Ingested SEC filings, transcripts, and financial datasets are formatted as an immutable prefix
// at the beginning of each turn to trigger automatic server-side KV cache reuse and input discounts.

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

// --- Context Cache Keep-Alive & 45-Minute Post-Analysis Idle Auto-Reset ---
const KEEP_ALIVE_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes
const IDLE_WARNING_MS = 40 * 60 * 1000; // 40 minutes
const IDLE_MAX_MS = 45 * 60 * 1000; // 45 minutes

let cacheKeepAliveInterval: NodeJS.Timeout | null = null;
let cacheAutoResetTimeout: NodeJS.Timeout | null = null;

function stopCacheKeepAlive() {
  if (cacheKeepAliveInterval) {
    clearInterval(cacheKeepAliveInterval);
    cacheKeepAliveInterval = null;
  }
  if (cacheAutoResetTimeout) {
    clearTimeout(cacheAutoResetTimeout);
    cacheAutoResetTimeout = null;
  }
  if (state.cacheKeepAlive) {
    state.cacheKeepAlive = null;
  }
}

function startCacheKeepAlive() {
  // Never start keep-alive if analysis is actively running or retrying, or during batch queue execution
  if (state.status === 'running' || state.status === 'retrying' || batchManager.getState().status === 'running') {
    return;
  }
  // Must have an active ticker and staged files to keep cached
  if (!state.config?.ticker || state.files.length === 0) {
    return;
  }

  stopCacheKeepAlive();

  const now = Date.now();
  state.cacheKeepAlive = {
    active: true,
    startedAt: now,
    warningAt: now + IDLE_WARNING_MS,
    expiresAt: now + IDLE_MAX_MS,
    lastPingAt: null,
    pingCount: 0
  };

  console.log(`[Cache Keep-Alive Guard] Started 4-minute keep-alive heartbeat and 45-minute idle auto-reset for ${state.config.ticker} (Tier: ${state.config.serviceTier || 'flex'}).`);

  cacheAutoResetTimeout = setTimeout(async () => {
    console.log(`[Cache Keep-Alive Guard] 45-minute idle window reached for ${state.config?.ticker || 'session'}. Executing automated clean terminal reset...`);
    stopCacheKeepAlive();
    try {
      await hardResetSessionState();
    } catch (resetErr) {
      console.warn(`[Cache Keep-Alive Guard] Auto-reset failed:`, resetErr);
    }
  }, IDLE_MAX_MS);
  if (cacheAutoResetTimeout.unref) cacheAutoResetTimeout.unref();

  cacheKeepAliveInterval = setInterval(async () => {
    await sendCacheKeepAlivePing();
  }, KEEP_ALIVE_INTERVAL_MS);
  if (cacheKeepAliveInterval.unref) cacheKeepAliveInterval.unref();
}

function extendCacheKeepAlive() {
  if (!state.cacheKeepAlive?.active) {
    startCacheKeepAlive();
    return;
  }

  if (cacheAutoResetTimeout) {
    clearTimeout(cacheAutoResetTimeout);
  }

  const now = Date.now();
  state.cacheKeepAlive.startedAt = now;
  state.cacheKeepAlive.warningAt = now + IDLE_WARNING_MS;
  state.cacheKeepAlive.expiresAt = now + IDLE_MAX_MS;

  console.log(`[Cache Keep-Alive Guard] Session keep-alive extended for an additional 45 minutes for ${state.config?.ticker || 'session'}.`);

  cacheAutoResetTimeout = setTimeout(async () => {
    console.log(`[Cache Keep-Alive Guard] 45-minute idle window reached for ${state.config?.ticker || 'session'}. Executing automated clean terminal reset...`);
    stopCacheKeepAlive();
    try {
      await hardResetSessionState();
    } catch (resetErr) {
      console.warn(`[Cache Keep-Alive Guard] Auto-reset failed:`, resetErr);
    }
  }, IDLE_MAX_MS);
  if (cacheAutoResetTimeout.unref) cacheAutoResetTimeout.unref();
}

async function sendCacheKeepAlivePing() {
  if (state.status === 'running' || state.status === 'retrying' || batchManager.getState().status === 'running') {
    return;
  }
  if (!state.config?.ticker || state.files.length === 0) {
    stopCacheKeepAlive();
    return;
  }

  const modelToUse = state.config?.model || "models/gemini-4-argon";
  const isOllamaModel = modelToUse.toLowerCase().includes("ollama") || modelToUse.toLowerCase().includes("qwen") || modelToUse.toLowerCase().includes("gemma");
  if (isOllamaModel) {
    // Local Ollama models do not incur cloud billing or cloud KV cache eviction
    return;
  }

  try {
    const ai = getGeminiClient(state.customApiKey);
    const fileParts = await prepareFileContextParts(ai, state.files);
    if (fileParts.length === 0) return;

    const contents: any[] = [];
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

    state.history
      .filter(msg => msg.role === 'user' || msg.role === 'model')
      .forEach(msg => {
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      });

    contents.push({
      role: "user",
      parts: [{ text: "Context cache keep-alive heartbeat ping. Reply with OK." }]
    });

    const pingRes = await generateContentWithRetry(ai, {
      model: modelToUse,
      contents: contents,
      config: {
        maxOutputTokens: 1,
        thinkingConfig: { thinkingLevel: "low" },
        systemInstruction: VALUE_INVESTING_SYSTEM_INSTRUCTION,
        serviceTier: state.config?.serviceTier || "flex"
      }
    }, 2, 1000, false);

    const cachedTokens = (pingRes.usageMetadata as any)?.cachedContentTokenCount || 0;
    if (state.cacheKeepAlive) {
      state.cacheKeepAlive.lastPingAt = Date.now();
      state.cacheKeepAlive.pingCount++;
    }
    if (cachedTokens > 0) {
      state.cachedTokenCount = cachedTokens;
      state.cacheStatus = 'active';
      console.log(`[Cache Keep-Alive Telemetry] Ping #${state.cacheKeepAlive?.pingCount}: Cache HIT (${cachedTokens.toLocaleString()} tokens cached on ${state.config?.serviceTier || 'flex'} tier).`);
    } else {
      console.log(`[Cache Keep-Alive Telemetry] Ping #${state.cacheKeepAlive?.pingCount}: Cold ping (${pingRes.usageMetadata?.totalTokenCount || 0} total tokens on ${state.config?.serviceTier || 'flex'} tier).`);
    }
  } catch (pingErr: any) {
    console.warn(`[Cache Keep-Alive Warning] Heartbeat ping failed (will retry next interval):`, pingErr?.message || pingErr);
  }
}

function isTransientError(err: any): boolean {
  if (!err) return false;
  const msg = (err?.message || String(err)).toLowerCase();
  const causeMsg = (err?.cause?.message || String(err?.cause || '')).toLowerCase();
  const causeCode = String(err?.cause?.code || '').toLowerCase();
  const code = String(err?.code || err?.status || err?.statusCode || '').toLowerCase();
  
  const combined = `${msg} ${causeMsg} ${causeCode} ${code}`;

  // HTTP/2 stream timeout, und_err_info, fetch failed, severed SSE stream, JSON truncation
  if (
    combined.includes('und_err_info') ||
    combined.includes('stream timeout') ||
    combined.includes('http/2') ||
    combined.includes('fetch failed') ||
    combined.includes('incomplete json') ||
    combined.includes('premature close') ||
    combined.includes('unexpected end') ||
    combined.includes('response body is empty') ||
    combined.includes('broken pipe') ||
    combined.includes('rst_stream')
  ) {
    return true;
  }
  // 503 UNAVAILABLE / High demand
  if (code === '503' || combined.includes('503') || combined.includes('unavailable') || combined.includes('high demand') || combined.includes('temporarily unavailable') || combined.includes('spikes in demand')) {
    return true;
  }
  // 429 RESOURCE_EXHAUSTED / Rate limit
  if (code === '429' || combined.includes('429') || combined.includes('resource_exhausted') || combined.includes('rate limit') || combined.includes('quota') || combined.includes('too many requests')) {
    return true;
  }
  // 500, 502, 504 server errors
  if (code === '500' || code === '502' || code === '504' || combined.includes('internal error') || combined.includes('bad gateway') || combined.includes('gateway timeout') || combined.includes('deadline exceeded')) {
    return true;
  }
  // Transient network / socket errors
  if (combined.includes('econnreset') || combined.includes('etimedout') || combined.includes('socket hang up') || combined.includes('econnrefused') || combined.includes('enotfound')) {
    return true;
  }
  return false;
}

async function generateContentWithRetry(ai: any, params: any, maxRetries = 6, initialDelay = 2000, useStreaming = true) {
  let attempt = 0;
  let currentParams = { ...params };
  let activeUseStreaming = useStreaming;
  const originalRequestedModel = params.model;
  let fallbackInfo: { originalModel: string; fallbackModel: string; reason: string } | undefined = undefined;

  while (true) {
    const rawTier = currentParams.config?.serviceTier ?? state.config?.serviceTier ?? (process.env.SERVICE_TIER || "standard");
    try {
      if (activeUseStreaming && typeof ai.models?.generateContentStream === 'function') {
        // Thought Frame Keep-Alive: enable includeThoughts in thinkingConfig
        const currentThinkingLevel = currentParams.config?.thinkingConfig?.thinkingLevel || "high";
        const hasTools = Array.isArray(currentParams.config?.tools) && currentParams.config.tools.length > 0;
        const effectiveServiceTier = (hasTools || rawTier === 'standard' || rawTier === 'none') ? undefined : rawTier;
        const streamParams = {
          ...currentParams,
          config: {
            ...currentParams.config,
            thinkingConfig: {
              ...(currentParams.config?.thinkingConfig || {}),
              thinkingLevel: currentThinkingLevel,
              includeThoughts: true
            },
            ...(effectiveServiceTier ? { serviceTier: effectiveServiceTier } : {})
          }
        };

        const responseStream = await ai.models.generateContentStream(streamParams);
        let fullText = "";
        let usageMetadata: any = undefined;
        let lastFinishReason: string | undefined = undefined;
        let lastPromptFeedback: any = undefined;

        for await (const chunk of responseStream) {
          if (chunk.usageMetadata) usageMetadata = chunk.usageMetadata;
          if (chunk.promptFeedback) lastPromptFeedback = chunk.promptFeedback;
          if (chunk.candidates?.[0]?.finishReason) {
            lastFinishReason = chunk.candidates[0].finishReason;
          }

          const parts = chunk.candidates?.[0]?.content?.parts;
          if (Array.isArray(parts) && parts.length > 0) {
            for (const part of parts) {
              if ((part as any).thought === true) {
                // Heartbeat frame during reasoning phase; do not append to final text
                continue;
              }
              if (typeof part.text === 'string') {
                fullText += part.text;
              }
            }
          } else if (chunk.text) {
            fullText += chunk.text;
          }
        }

        if (!fullText && lastPromptFeedback?.blockReason) {
          console.error(`[Gemini API Prompt Blocked] blockReason: ${lastPromptFeedback.blockReason}`, JSON.stringify(lastPromptFeedback));
          throw new Error(`Gemini API Prompt Blocked: blockReason = ${lastPromptFeedback.blockReason}`);
        }

        return {
          text: fullText,
          usageMetadata,
          effectiveModel: currentParams.model,
          fallbackInfo,
          finishReason: lastFinishReason,
          promptFeedback: lastPromptFeedback
        };
      } else {
        const hasTools = Array.isArray(currentParams.config?.tools) && currentParams.config.tools.length > 0;
        const effectiveServiceTier = (hasTools || rawTier === 'standard' || rawTier === 'none') ? undefined : rawTier;
        const nonStreamParams = {
          ...currentParams,
          config: {
            ...currentParams.config,
            ...(effectiveServiceTier ? { serviceTier: effectiveServiceTier } : {})
          }
        };
        const nonStreamRes = await ai.models.generateContent(nonStreamParams);
        return {
          text: nonStreamRes.text,
          usageMetadata: nonStreamRes.usageMetadata,
          effectiveModel: currentParams.model,
          fallbackInfo,
          finishReason: nonStreamRes.candidates?.[0]?.finishReason
        };
      }
    } catch (err: any) {
      attempt++;
      const errMsg = (err?.message || String(err)).toLowerCase();
      const causeMsg = (err?.cause?.message || String(err?.cause || '')).toLowerCase();
      const causeCode = String(err?.cause?.code || '').toLowerCase();
      const errCombined = `${errMsg} ${causeMsg} ${causeCode}`;
      const isTransient = isTransientError(err);
      const effectiveMaxRetries = isTransient ? maxRetries : 2;
      console.warn(`[Gemini API Warning] Attempt ${attempt} failed (transient: ${isTransient}): ${err?.message || err}`);

      const modelStr = String(currentParams.model || '').toLowerCase();
      const isArgonOrPro = modelStr.includes("argon") || modelStr.includes("pro");
      const isTimeoutOrUnavailable = 
        errCombined.includes("und_err_info") || 
        errCombined.includes("stream timeout") || 
        errCombined.includes("503") || 
        errCombined.includes("unavailable") || 
        errCombined.includes("fetch failed") || 
        errCombined.includes("incomplete json") || 
        errCombined.includes("premature close");

      // Progressive Stream Fallback: If streaming repeatedly fails with truncated chunks/incomplete JSON, switch to robust non-streaming on Flex tier
      if (activeUseStreaming && attempt >= 2 && (errCombined.includes("incomplete json") || errCombined.includes("premature close"))) {
        console.warn(`[Gemini API Stream Fallback] Streaming SSE disconnected repeatedly (${err?.message || err}). Falling back to robust non-streaming generation on attempt ${attempt + 1}...`);
        activeUseStreaming = false;
      }

      // Spike-Proof Tool Defense: If a tool-enabled call fails on Attempt 1 with 503/timeout/socket error, disable tools on Attempt 2
      if (currentParams.config?.tools && (isTimeoutOrUnavailable || errCombined.includes("socket") || errCombined.includes("closed"))) {
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

      // Adaptive Retry Degradation for Heavy Preview Models (argon / pro)
      if (isArgonOrPro && isTimeoutOrUnavailable) {
        if (attempt === 1 && currentParams.config?.thinkingConfig?.thinkingLevel === 'high') {
          console.log(`[Gemini API Adaptive Retry] Stepping down thinkingLevel from 'high' to 'medium' on ${currentParams.model} to prevent HTTP/2 stream timeout...`);
          currentParams = {
            ...currentParams,
            config: {
              ...currentParams.config,
              thinkingConfig: {
                ...(currentParams.config?.thinkingConfig || {}),
                thinkingLevel: 'medium'
              },
              tools: undefined // disable tools if attached to speed up recovery
            }
          };
          continue;
        } else if (attempt >= 2) {
          // Zero Flash Downgrade: Strictly preserve requested frontier model (argon / pro).
          // Escalate transient saturation to outer Auto-Resume cooldown queue (45s pacing up to 45m).
          console.warn(`[Gemini API Cluster Saturation] ${currentParams.model} cluster saturated on flex tier after ${attempt} in-flight attempts. Escalating to outer Auto-Resume queue.`);
          throw err;
        }
      }

      // Handle 403 PERMISSION_DENIED or search tool permissions
      if (currentParams.config?.tools && (errCombined.includes("403") || errCombined.includes("permission_denied") || errCombined.includes("caller does not have permission") || errCombined.includes("tool") || errCombined.includes("grounding"))) {
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
      if (errCombined.includes("404") || (errCombined.includes("403") && !currentParams.config?.tools)) {
        if (currentParams.model !== "gemini-3.8-flash" && currentParams.model !== "models/gemini-3.8-flash") {
          console.log(`[Gemini API Model Fallback] Switching model from ${currentParams.model} to models/gemini-3.8-flash...`);
          fallbackInfo = {
            originalModel: originalRequestedModel,
            fallbackModel: "models/gemini-3.8-flash",
            reason: `Model not found or permission error: ${errMsg.slice(0, 80)}`
          };
          currentParams = {
            ...currentParams,
            model: "models/gemini-3.8-flash"
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
async function runStepProcessor(startingIdx: number, allowUncachedFallback = false) {
  stopCacheKeepAlive();
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
    }).catch(err => console.warn("[Notification Warning] Session start alert:", err.message));
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
    let modelToUse = state.config?.model || "models/gemini-4-argon";

    try {
      // Automated Pre-Flight Competitor Radar Hook: Ensure radar is generated and staged to state.files BEFORE Step 1 executes
      const hasRadarFile = state.files.some(f => f.name.includes("_Competitor_Radar.md"));
      if (i >= 0 && !state.competitorRadar && !hasRadarFile && state.config?.ticker) {
        try {
          console.log(`[Competitor Engine Hook] Automatically preparing Competitor Radar before Step ${i + 1} for ${state.config.ticker}...`);
          await generateAndInjectCompetitorRadar(state.config.ticker);
        } catch (compErr) {
          console.warn(`[Competitor Engine Hook Warning] Could not harvest competitor radar:`, compErr);
        }
      }

      const isCrosscheck = step.isCrosscheck || i >= MASTER_PROMPTS.length;
      
      modelToUse = state.config?.model || "models/gemini-4-argon";
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

        const cleanModel = modelToUse.replace(/^models\//, "");
        // Pre-Flight Invariance: Eliminate runtime tool toggles in the main 12-step generation pipeline to preserve 100% KV prefix cache invariance.
        // Competitor intelligence is pre-harvested and staged into state.files as [TICKER]_Competitor_Radar.md.
        const toolsConfig = undefined;

        // Construct cache-optimized contents array with Immutable Context Prefix
        const contents: any[] = [];

        // 1. Immutable Caching Prefix: heavy files attached first to maximize native implicit KV cache reuse
        const fileParts = await prepareFileContextParts(ai, state.files);
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
        // When executing Step 12 (Crosscheck), skip appending history turns to contents because buildPromptRequest()
        // already concatenates the entire compiled Steps 1-11 report as the audit payload.
        if (!isCrosscheck) {
          state.history
            .filter(msg => msg.role === 'user' || msg.role === 'model')
            .forEach(msg => {
              contents.push({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
              });
            });
        }

        // 3. Build and append system-enforced prompt for the latest turn
        const enforcedPrompt = buildPromptRequest(i, step);
        contents.push({
          role: "user",
          parts: [{ text: enforcedPrompt }]
        });

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
        console.warn(`[Analyst Step Auto-Resume Cooldown] Step ${i + 1} ("${step.title}") encountered transient API spike / cluster saturation (${detailedError}). Entering cooldown (${currentAttempts}/${maxStepRetries}, ${Math.round(elapsedMs / 60000)}m elapsed), retrying in ${cooldownMs / 1000}s on ${modelToUse}...`);

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
            title: `⏳ Flex Tier Cooldown: ${state.config?.ticker || "Company"}`,
            message: `Step ${i + 1} ("${step.title}") encountered transient cluster saturation / stream drop:\n\n"${detailedError}"\n\nEntering 45-minute Auto-Resume queue on ${state.config?.serviceTier?.toUpperCase() || 'FLEX'} tier. Retrying automatically every 45s. You can also open the terminal to switch to Standard tier if preferred.`,
            ticker: state.config?.ticker,
            period: state.config?.period,
            price: state.config?.price
          }).catch(notifErr => console.warn("[Notification Warning] Cooldown alert:", notifErr.message));
        }

        clearRetryTimer();
        activeRetryTimeout = setTimeout(() => {
          console.log(`[Auto-Resume Engaged] Cooldown completed for Step ${i + 1}. Resuming analysis on ${modelToUse}...`);
          state.retryState = null;
          state.status = 'running';
          runStepProcessor(i);
        }, cooldownMs);

        break;
      }

      // Hard failure if not transient or pre-cache-eviction timeout / max retries exhausted
      step.status = 'failed';
      state.status = 'failed';
      state.retryState = null;
      activeStepRetryCounts.delete(i);
      activeStepStartTimes.delete(i);
      clearRetryTimer();

      const failureReason = elapsedMs >= MAX_WAIT_MS 
        ? `Pre-Cache-Eviction Cutoff: ${modelToUse} cluster remained saturated on ${state.config?.serviceTier || 'flex'} tier for 45 minutes. Execution halted to protect context cache integrity.`
        : `Step ${i + 1} ("${step.title}") failed after ${currentAttempts} retry attempts: ${detailedError}`;

      state.history.push({
        role: 'system',
        text: `Error executing step ${i + 1}: ${failureReason}`,
        timestamp: new Date().toISOString()
      });

      // Auto-dispatch failure alert
      dispatchNotification(notificationConfig, {
        event: 'blocked_alert',
        title: `⚠️ Valuation Stalled on Error: ${state.config?.ticker || "Company"}`,
        message: failureReason,
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
    if (batchManager.getState().status !== 'running') {
      startCacheKeepAlive();
    }

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

// restore session state
app.post("/api/session/restore", (req: Request, res: Response) => {
  try {
    const payload = req.body?.state || req.body;
    if (payload && typeof payload === 'object') {
      Object.assign(state, payload);
      updateTokenCounts();
      return res.json({ success: true, ticker: state.config?.ticker, period: state.config?.period, steps: state.steps?.length });
    }
    return res.status(400).json({ error: "Invalid state payload" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
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

/**
 * Clean Environment Guard: Enforces strict ticker isolation.
 * Guarantees zero residual cross-contamination from previous tickers or prior runs.
 */
function enforceCleanTickerEnvironment(newTicker?: string, period?: string, clearFiles = false): {
  purgedFilesCount: number;
  purgedRadar: boolean;
} {
  const cleanTicker = (newTicker || '').trim().toUpperCase();
  let purgedFilesCount = 0;
  let purgedRadar = false;
  const cleanPeriod = (period || state.config?.period || '').trim();

  if (clearFiles) {
    stopCacheKeepAlive();
  }

  // 1. Wipe competitor radar if it belonged to another ticker or if explicitly reset
  if (state.competitorRadar || activeCompetitorRadar) {
    const radarTicker = (state.competitorRadar?.targetTicker || '').toUpperCase();
    if (radarTicker !== cleanTicker || clearFiles) {
      state.competitorRadar = null;
      activeCompetitorRadar = null;
      purgedRadar = true;
      console.log(`[Clean Environment Guard] Purged competitor radar (${radarTicker || 'unassigned'}) for new ticker ${cleanTicker}.`);
    }
  }

  // 2. Strict file isolation: Only retain files strictly belonging to the active ticker
  const retainedFiles: FileLog[] = [];
  for (const fileLog of state.files) {
    if (fileLog.id === "compiled-obsidian-report") {
      purgedFilesCount++;
      continue;
    }

    if (clearFiles) {
      purgedFilesCount++;
      try {
        const localCachePath = path.join(DOWNLOADS_DIR, fileLog.id);
        if (fs.existsSync(localCachePath)) fs.unlinkSync(localCachePath);
      } catch (ignore) {}
      continue;
    }

    let cachedContent: string | undefined = undefined;
    try {
      const localCachePath = path.join(DOWNLOADS_DIR, fileLog.id);
      if (fs.existsSync(localCachePath)) {
        cachedContent = fs.readFileSync(localCachePath, 'utf-8');
      }
    } catch (ignore) {}

    const audit = auditFileIntegrity({ name: fileLog.name, content: cachedContent, category: fileLog.auditCategory }, cleanTicker, cleanPeriod || undefined);
    const isMismatchedCompany = audit.companyMatch === "MISMATCH" || (audit.detectedTicker && audit.detectedTicker !== cleanTicker);
    
    // Check if filename explicitly indicates matching ticker
    const upperName = fileLog.name.toUpperCase();
    const tickerRegex = cleanTicker ? new RegExp("(^|[^A-Z0-9])" + cleanTicker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^A-Z0-9]|$)", "i") : null;
    const matchesNewTicker = cleanTicker ? (
      upperName.startsWith(`${cleanTicker}_`) || 
      upperName.startsWith(`${cleanTicker} `) || 
      (tickerRegex ? tickerRegex.test(upperName) : false)
    ) : false;

    const isSupplementary = fileLog.auditCategory === "Supplementary";
    const isConfirmedMatch = audit.companyMatch === "MATCH" || matchesNewTicker || (isSupplementary && audit.companyMatch !== "MISMATCH");
    const shouldPurge = isMismatchedCompany || !isConfirmedMatch;

    if (shouldPurge) {
      purgedFilesCount++;
      console.log(`[Clean Environment Guard] Purging lingering file from different ticker: "${fileLog.name}" (Active: ${cleanTicker})`);
      try {
        const localCachePath = path.join(DOWNLOADS_DIR, fileLog.id);
        if (fs.existsSync(localCachePath)) fs.unlinkSync(localCachePath);
      } catch (ignore) {}
    } else {
      retainedFiles.push(fileLog);
    }
  }
  state.files = retainedFiles;

  // 3. Clear execution session telemetry, retry timers, and cloud context cache
  clearRetryTimer();
  activeStepRetryCounts.clear();
  activeStepStartTimes.clear();
  state.retryState = null;
  state.history = [];
  state.status = 'idle';
  state.activeStepIndex = 0;
  state.currentPromptIndex = 0;
  delete state.crosscheckVerdict;
  state.cachedTokenCount = 0;
  state.cacheStatus = 'bypassed';

  console.log(`[Clean Environment Guard] Workspace sanitized for ${cleanTicker}. Retained files: ${state.files.length}, Purged files: ${purgedFilesCount}, Radar reset: ${purgedRadar}`);
  return { purgedFilesCount, purgedRadar };
}

// initialize terminal session
app.post("/api/session/init", (req: Request, res: Response) => {
  const { 
    ticker, period, price, model, executionMode, portfolio, notes, 
    enableCrosscheck, crosscheckModel, clearFiles,
    pipelineMode, hybridConfig, serviceTier,
    lastEarningsDate, nextEarningsDate, daysToNextEarnings,
    isAdr, country, fmpApiKey, sessionMode, priorDossierPath
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

  const newTicker = String(ticker).toUpperCase();
  const isTickerSwitch = Boolean(state.config && state.config.ticker !== newTicker);

  // Enforce Clean Environment on init or ticker switch
  enforceCleanTickerEnvironment(newTicker, period ? String(period) : undefined, Boolean(clearFiles));

  const parsedPipelineMode: 'single' | 'hybrid' = 'single';
  const defaultTier: 'standard' | 'flex' = (process.env.SERVICE_TIER === 'flex' || process.env.SERVICE_TIER === 'standard') ? process.env.SERVICE_TIER : 'flex';
  const parsedServiceTier: 'standard' | 'flex' = (serviceTier === 'standard' || serviceTier === 'flex') ? serviceTier : defaultTier;
  const parsedSessionMode: SessionMode = (sessionMode === 'slingshot' || sessionMode === 'sentinel' || sessionMode === 'full') ? sessionMode : 'full';

  state.config = {
    ticker: newTicker,
    period: String(period),
    price: String(price),
    model: model || "models/gemini-4-argon",
    executionMode: Number(executionMode) as ExecutionMode,
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
    country: country || null,
    sessionMode: parsedSessionMode,
    priorDossierPath: priorDossierPath || null
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

  // Reset analysis steps according to session mode
  state.steps = generateSessionSteps(state.config.enableCrosscheck, parsedSessionMode);
  delete state.crosscheckVerdict;

  console.log(`[Terminal Configured] Ticker: ${state.config.ticker}, Model: ${state.config.model} (Tier: ${state.config.serviceTier}), Mode: ${state.config.sessionMode} (${state.config.executionMode})`);
  const auditResult = runAudit(state.files);
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
      const modelToUse = state.config?.model || "models/gemini-4-argon";
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

// Dedicated Competitor Intelligence Radar Endpoints
app.get("/api/competitors", (req: Request, res: Response) => {
  const currentTicker = (state.config?.ticker || "").toUpperCase().trim();
  const validDossier = activeCompetitorRadar && (!currentTicker || (activeCompetitorRadar.targetTicker || "").toUpperCase().trim() === currentTicker)
    ? activeCompetitorRadar
    : null;
  res.json({
    success: true,
    dossier: validDossier,
    targetTicker: state.config?.ticker || null
  });
});

app.post("/api/competitors/generate", async (req: Request, res: Response) => {
  try {
    const { ticker, customPeers, fmpApiKey } = req.body || {};
    const targetTicker = ticker || state.config?.ticker;
    if (!targetTicker) {
      return res.status(400).json({ error: "No target ticker provided or active in session." });
    }
    const dossier = await generateAndInjectCompetitorRadar(targetTicker, customPeers, fmpApiKey);
    res.json({
      success: true,
      dossier,
      state
    });
  } catch (err: any) {
    console.error("[Competitor Generation Error]", err);
    res.status(500).json({ error: err.message || "Failed generating competitor radar." });
  }
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
  stopCacheKeepAlive();
  clearRetryTimer();
  activeStepRetryCounts.clear();
  activeStepStartTimes.clear();
  state.status = 'idle';
  state.activeStepIndex = 0;
  state.currentPromptIndex = 0;
  state.history = [];
  state.config = null;
  state.steps = generateSessionSteps(true);
  activeCompetitorRadar = null;
  state.competitorRadar = null;
  state.retryState = null;
  delete state.crosscheckVerdict;
  state.cachedTokenCount = 0;
  state.cacheStatus = 'bypassed';
  state.cacheKeepAlive = null;

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
  stopCacheKeepAlive();
  clearRetryTimer();
  activeStepRetryCounts.clear();
  activeStepStartTimes.clear();
  state.status = 'idle';
  state.activeStepIndex = 0;
  state.currentPromptIndex = 0;
  state.history = [];
  state.config = null;
  state.steps = generateSessionSteps(true);
  activeCompetitorRadar = null;
  state.competitorRadar = null;
  state.retryState = null;
  delete state.crosscheckVerdict;
  state.cachedTokenCount = 0;
  state.cacheStatus = 'bypassed';
  state.cacheKeepAlive = null;

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
  let finalName = path.basename(filePath);
  let finalBuffer = await fs.promises.readFile(filePath);
  const isCsv = finalName.toLowerCase().endsWith(".csv");

  if (isCsv) {
    const rawCsvText = finalBuffer.toString('utf-8');
    const currencyAudit = await auditFinancialCsv(rawCsvText, finalName, state.config?.ticker);
    if (currencyAudit.requiresAction) {
      console.log(`[Batch Currency Safeguard] Foreign/Mixed currency detected for ${state.config?.ticker || finalName}. Harmonizing to ${currencyAudit.homeCurrency}...`);
      const harmonized = harmonizeFinancialCsv(rawCsvText, currencyAudit);
      finalName = harmonized.newFileName;
      finalBuffer = Buffer.from(harmonized.harmonizedCsv, 'utf-8');
    }
  }

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

function formatRadarSummary(summary: string): string {
  return summary.trim()
    .replace(/^##\s+Competitor Moat & Valuation Radar/gim, '### Competitor Moat & Valuation Radar')
    .replace(/^###\s+([1-4]\.\s+(?:Data Lineage|Archetype Comparative|Moat Leaderboard|Moat & Valuation))/gim, '#### $1');
}

function injectCompetitorRadarIntoStep2(step2Text: string, radarSummary: string): string {
  const targetRegex = /(?:^|\n)(?:[#*]{0,4}\s*1\.[456][\.\s]|[#*]{0,4}\s*5\.2[\.\s])/i;
  const targetSplitIdx = step2Text.search(targetRegex);
  if (targetSplitIdx !== -1) {
    const beforeSplit = step2Text.substring(0, targetSplitIdx).trimEnd();
    const afterSplit = step2Text.substring(targetSplitIdx).trimStart();
    return `${beforeSplit}\n\n---\n\n${radarSummary}\n\n---\n\n${afterSplit}`;
  }
  return `${step2Text}\n\n---\n\n${radarSummary}\n\n`;
}

function stripLeadingDuplicateHeader(text: string, title: string): string {
  let cleaned = text.trimStart();
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^##\\s+(?:\\[?${escaped}\\]?|Part\\s+\\d+:[^\\n]+)\\r?\\n+`, 'i');
  return cleaned.replace(regex, '');
}

async function executeBatchCompany(
  item: BatchQueueItem,
  docs: string[],
  onStep: (stepIdx: number, stepTitle: string) => void
): Promise<{ success: boolean; compiledMarkdown: string; mdFileName?: string; htmlFileName?: string; htmlDocTitle?: string; error?: string }> {
  const preferredModel = item.model || state.config?.model;
  if (!preferredModel) {
    throw new Error(`Execution blocked on ${item.ticker}: Explicit model selection required. No model specified.`);
  }
  const preferredCrosscheckModel = state.config?.crosscheckModel || "default";
  const preferredServiceTier = state.config?.serviceTier || (process.env.SERVICE_TIER as any) || "standard";

  await resetBatchSessionState();

  state.config = {
    ticker: item.ticker,
    period: item.period,
    price: item.price,
    model: preferredModel,
    serviceTier: preferredServiceTier,
    pipelineMode: "single",
    executionMode: ExecutionMode.FullAuto,
    portfolio: item.portfolio || { holdsPosition: false },
    notes: "",
    enableCrosscheck: true,
    crosscheckModel: preferredCrosscheckModel,
    lastEarningsDate: item.lastEarningsDate || null,
    nextEarningsDate: item.nextEarningsDate || null,
    daysToNextEarnings: typeof item.daysToNextEarnings === 'number' ? item.daysToNextEarnings : null
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
    await runStepProcessor(0, true);

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
  const modelName = state.config?.model || "models/gemini-4-argon";
  let body = "";
  let batchRadarInjected = false;
  const batchRadar = state.competitorRadar || activeCompetitorRadar;

  completedSteps.forEach((s) => {
    const stepNum = s.index + 1;
    const chapterTitle = STEP_CHAPTER_TITLES[stepNum] || (s.isCrosscheck ? `Part ${stepNum}: Forensic Audit & Fact-Check Crosscheck` : `Part ${stepNum}: ${s.title.replace(/^Part\s+\d+:\s*/i, '')}`);
    const cleanedResponse = stripLeadingDuplicateHeader(s.response, chapterTitle);

    if (s.index === 1 && batchRadar && !batchRadarInjected) {
      const radarSummary = formatRadarSummary(batchRadar.markdownSummary);
      const injectedText = injectCompetitorRadarIntoStep2(cleanedResponse, radarSummary);
      body += `## ${chapterTitle}\n\n${injectedText}\n\n---\n\n`;
      batchRadarInjected = true;
    } else {
      body += `## ${chapterTitle}\n\n${cleanedResponse}\n\n---\n\n`;
    }
  });

  if (batchRadar && !batchRadarInjected) {
    const radarSummary = formatRadarSummary(batchRadar.markdownSummary);
    body += `${radarSummary}\n\n---\n\n`;
    batchRadarInjected = true;
  }

  const frontmatter = extractFrontmatter(body, item.ticker, item.period, item.price, modelName);

  const lastDate = state.config?.lastEarningsDate || item.lastEarningsDate;
  const nextDate = state.config?.nextEarningsDate || item.nextEarningsDate;
  const daysNext = typeof state.config?.daysToNextEarnings === 'number' ? state.config.daysToNextEarnings : item.daysToNextEarnings;
  let earningsLine = "";
  if (lastDate || nextDate) {
    const nextFormatted = nextDate
      ? (daysNext === 0 ? `${nextDate} (Today)` : daysNext === 1 ? `${nextDate} (Tomorrow)` : typeof daysNext === 'number' ? `${nextDate} (in ${daysNext} days)` : nextDate)
      : "TBD";
    earningsLine = `**Last Earnings Reported:** ${lastDate || "N/A"}  |  **Next Scheduled Earnings:** ${nextFormatted}\n`;
  }

  let horizonCallout = "";
  if (typeof daysNext === 'number' && daysNext >= 0 && daysNext <= 14 && nextDate) {
    const countdownText = daysNext === 0 ? "on the day of" : daysNext === 1 ? "1 day prior to" : `${daysNext} days prior to`;
    horizonCallout = `\n> **PRE-EARNINGS HORIZON ADVISORY:** This analysis was compiled ${countdownText} the scheduled ${nextDate} earnings release. Core structural moat, Zero-Growth EPV floor, and multi-year compounding models remain foundational; review post-release filings for updated TTM figures and guidance.\n`;
  }

  const header = `${frontmatter}
# Valuation Analysis: ${item.ticker} ${item.period}
**Date:** ${new Date().toLocaleDateString()}
**AI Model:** ${modelName}

**Ticker:** ${item.ticker}  |  **Period:** ${item.period}  |  **Market price:** $${item.price}
${earningsLine}${horizonCallout}---

`;

  const fullMarkdown = header + body;
  const formattedMd = cleanMarkdownForRendering(alignMarkdownTables(fullMarkdown));

  const cleanModelName = modelName.replace("models/", "") || "generic";
  const formattedDate = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }).replace(/\//g, "-");
  const isInterim = isInterimEarningsReleaseSession();
  const releaseTag = isInterim ? "_Earnings_Release" : "";
  const mdFileName = `${item.ticker} ${item.period}${releaseTag}_Complete Doc_${cleanModelName}_${formattedDate}.md`;
  const htmlFileName = `${item.ticker} ${item.period}${releaseTag}_Valuation_Dossier_${cleanModelName}_${formattedDate}.html`;
  const htmlDocTitle = `${item.ticker} - ${item.period}${isInterim ? " (Earnings Release)" : ""} Deep Valuation Dossier (${cleanModelName})`;

  return { success: true, compiledMarkdown: formattedMd, mdFileName, htmlFileName, htmlDocTitle };
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
        const item = batchManager.addItem(sym, info.period, info.price, info.fmpSucceeded, info.source, undefined, info.lastEarningsDate, info.nextEarningsDate, info.daysToNextEarnings);
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
      if (info.lastEarningsDate !== undefined) item.lastEarningsDate = info.lastEarningsDate;
      if (info.nextEarningsDate !== undefined) item.nextEarningsDate = info.nextEarningsDate;
      if (info.daysToNextEarnings !== undefined) item.daysToNextEarnings = info.daysToNextEarnings;
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
  let lastEarningsDate: string | null = null;
  let nextEarningsDate: string | null = null;
  let daysToNextEarnings: number | null = null;

  // If period or price missing, auto-fill from FMP / YF
  if (!period || !price) {
    try {
      const info = await fetchTickerInfoFromFmpOrYf(ticker, fmpApiKey);
      if (!period) period = info.period;
      if (!price) price = info.price;
      fmpSucceeded = info.fmpSucceeded;
      fmpSource = info.source;
      lastEarningsDate = info.lastEarningsDate || null;
      nextEarningsDate = info.nextEarningsDate || null;
      daysToNextEarnings = typeof info.daysToNextEarnings === 'number' ? info.daysToNextEarnings : null;
    } catch (e) {
      if (!period) period = "Q1-26";
      if (!price) price = "100.00";
    }
  }

  const item = batchManager.addItem(ticker, period, price, fmpSucceeded, fmpSource, portfolio, lastEarningsDate, nextEarningsDate, daysToNextEarnings);

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

  const { model } = req.body || {};
  const effectiveModel = model || state.config?.model;
  if (!effectiveModel) {
    const stagedTickers = batchManager.state.items.map(i => i.ticker).join(", ") || "Batch Queue";
    dispatchNotification(notificationConfig, {
      event: 'model_selection_required',
      title: 'Action Required: Model Selection',
      message: `Batch is staged for ${stagedTickers}, but no model was specified.\n\nPlease reply in Antigravity chat with the model to run (e.g. models/gemini-4-argon).`
    }).catch(err => console.warn("[Telegram Alert Error]", err));

    return res.status(400).json({
      error: "Explicit model selection required. Please select or specify a model to run batch execution.",
      batchState: batchManager.state
    });
  }

  if (batchManager.state.items.length === 0) {
    return res.status(400).json({ error: "Batch queue is empty." });
  }

  // Assign the explicitly chosen model to items lacking an individual override
  batchManager.state.items.forEach(item => {
    if (!item.model) {
      item.model = effectiveModel;
    }
  });

  if (!state.config) {
    state.config = {
      ticker: "",
      period: "",
      price: "",
      model: effectiveModel,
      serviceTier: (process.env.SERVICE_TIER as any) || "standard",
      pipelineMode: "single",
      executionMode: ExecutionMode.FullAuto,
      portfolio: { holdsPosition: false },
      enableCrosscheck: true
    };
  } else {
    state.config.model = effectiveModel;
  }

  batchManager.recheckAll();
  const readyItems = batchManager.state.items.filter(i => i.status === 'ready');
  if (readyItems.length === 0) {
    return res.status(422).json({
      error: "No ready items in queue. Resolve any blocked items with missing files or mismatches.",
      batchState: batchManager.state
    });
  }

  res.json({ success: true, message: `Batch execution started in background using model ${effectiveModel}.`, batchState: batchManager.state });

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
    const matched = files.filter(f => {
      const upper = f.toUpperCase();
      return (upper.startsWith(`${ticker} `) && upper.endsWith(".MD") && f.includes("_Complete Doc_")) ||
             upper.startsWith(`${ticker}_DEEP_VALUATION_DOSSIER_`);
    });
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

  const { overrideIntegrityCheck, overrideMissingFiles, overrideSubstanceFiles, allowUncachedFallback } = req.body || {};
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
  runStepProcessor(nextIndex, Boolean(allowUncachedFallback));

  res.json({ message: "Engine successfully engaged in the background.", state });
});

// Legacy cache decision endpoint retained for backwards compatibility
app.post("/api/session/cache/decision", async (req: Request, res: Response) => {
  res.json({ success: true, message: "Implicit caching active. No manual cache decision required.", state });
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
      thinkingLevel: CROSSCHECK_PROMPT.defaultThinkingLevel || 'high',
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
  if (state.history.length === 0) {
    return res.status(400).json({ error: "Cannot rewind further back. Log history is at initial state." });
  }

  console.log(`[Rewind Requested] Reverting last analyst transaction.`);
  
  let targetUserMsg: any = null;
  while (state.history.length > 0) {
    const popped = state.history.pop()!;
    if (popped.role === 'user' && (popped.type === 'master_prompt' || popped.type === 'crosscheck')) {
      targetUserMsg = popped;
      break;
    }
  }

  // Reset the status of corresponding step
  if (targetUserMsg && targetUserMsg.index !== undefined && state.steps[targetUserMsg.index]) {
    const rolledIndex = targetUserMsg.index;
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
    const modelToUse = state.config?.model || "models/gemini-4-argon";
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

      // Construct cache-optimized contents array for custom query
      const contents: any[] = [];

      // 1. Immutable Caching Prefix: heavy files attached first
      const fileParts = await prepareFileContextParts(ai, state.files);
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
    extendCacheKeepAlive();
    res.json({ success: true, state });
  } catch (err: any) {
    console.error(`[Interrogation Error]`, err);
    state.status = 'paused';
    res.status(500).json({ error: err.message || "Failed during interrogation analysis." });
  }
});

// Reset Terminal (Soft Purge)
app.post("/api/session/reset", async (req: Request, res: Response) => {
  stopCacheKeepAlive();
  state.cacheKeepAlive = null;
  const currentTicker = state.config?.ticker || "UNSPECIFIED";
  enforceCleanTickerEnvironment(currentTicker, state.config?.period, false);
  state.steps = generateSessionSteps(state.config?.enableCrosscheck !== false);

  updateTokenCounts();

  console.log(`[Terminal Reset] Session workspace conversations soft-purged. Config & valid staged files retained.`);
  res.json({ success: true, state });
});

// Extend Context Cache Keep-Alive
app.post("/api/session/cache/extend", async (req: Request, res: Response) => {
  extendCacheKeepAlive();
  res.json({ success: true, cacheKeepAlive: state.cacheKeepAlive });
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
    const pm = text.match(/(?:Current Market Valuation Price|Current Stock Price|Current Market Price).*?(?:[\$\€\¥\£]|CA\$|R\$|MX\$|CHF|USD)?\s*([0-9,]+\.?[0-9]*)/i);
    if (pm) price = pm[1];
  }

  const p11Match = text.match(/^##\s+\[?Part\s+11:/im);
  const p12Match = text.match(/^##\s+\[?Part\s+12:/im);
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
  }

  // 2. Intrinsic Value (check Part 11 verdict block first, then synthesis tables)
  const curSymbolPattern = "(?:[\\$\\€\\¥\\£]|CA\\$|R\\$|MX\\$|CHF|USD)?\\s*";
  let iv: string | null = null;
  const verdictIvMatch = verdictText ? (
    verdictText.match(new RegExp(`\\|\\s*\\*{0,2}(?:Final\\s+|Synthesized\\s+|Sovereign\\s+|Probability-Weighted\\s+|Expected\\s+)*Intrinsic\\s+Value[^\\n|]*\\*{0,2}\\s*\\|\\s*[:\\s]*\\*{0,2}${curSymbolPattern}([0-9,]+\\.?[0-9]*)`, 'i')) ||
    verdictText.match(new RegExp(`(?:\\|\\s*)?(?:\\*{0,2})?(?:Mandate\\s+|Final\\s+|Synthesized\\s+|Sovereign\\s+|Probability-Weighted\\s+|Expected\\s+)*Intrinsic\\s+Value[^\\n$|]*?[:=|\\s]\\s*\\*{0,2}${curSymbolPattern}([0-9,]+\\.?[0-9]*)`, 'i'))
  ) : null;
  if (verdictIvMatch) {
    iv = verdictIvMatch[1];
  } else {
    const synthMatch = text.match(new RegExp(`\\|\\s*\\*{0,2}(?:Final |Synthesized |Sovereign )*(?:Sovereign )?Intrinsic Value[^\\n|]*\\*{0,2}\\s*\\|\\s*[:\\s]*\\*{0,2}${curSymbolPattern}([0-9,]+\\.?[0-9]*)`, 'i')) ||
                       text.match(new RegExp(`\\*\\s*\\*{0,2}(?:Final |Synthesized |Sovereign )*(?:Sovereign )?Intrinsic Value[^\\n]*?[:=][^\\n$]*?${curSymbolPattern}([0-9,]+\\.?[0-9]*)`, 'i')) ||
                       text.match(new RegExp(`(?:synthesized sovereign intrinsic value|synthesized intrinsic value|final intrinsic value)[^\\n$]*?${curSymbolPattern}([0-9,]+\\.?[0-9]*)`, 'i'));
    if (synthMatch) {
      iv = synthMatch[1];
    } else {
      const tableMatch = text.match(new RegExp(`\\|\\s*\\*{0,2}(?:Final |Synthesized )?Intrinsic Value[^\\n|]*\\*{0,2}\\s*\\|\\s*[:\\s]*\\*{0,2}${curSymbolPattern}([0-9,]+\\.?[0-9]*)`, 'i'));
      if (tableMatch) {
        iv = tableMatch[1];
      } else {
        const bulletMatch = text.match(new RegExp(`\\*\\s*\\*{0,2}(?:Final |Synthesized )?Intrinsic Value[^\\n]*?[:=]\\s*\\*{0,2}${curSymbolPattern}([0-9,]+\\.?[0-9]*)`, 'i'));
        if (bulletMatch) {
          iv = bulletMatch[1];
        } else {
          const proseMatch = text.match(new RegExp(`(?:synthesized intrinsic value|final intrinsic value)[^\\n$]*?${curSymbolPattern}([0-9,]+\\.?[0-9]*)`, 'i'));
          if (proseMatch) {
            iv = proseMatch[1];
          } else {
            const fallback = text.match(new RegExp(`(?:Synthesized Final Intrinsic Value Per Share|Synthesized Final Intrinsic Value|Synthesized Intrinsic Value)[^$]*?${curSymbolPattern}([0-9,]+\\.?[0-9]*)`, 'i')) ||
                             text.match(new RegExp(`(?:Final Synthesized Intrinsic Value:?\\s*${curSymbolPattern}([0-9,]+\\.?[0-9]*))`, 'i')) ||
                             text.match(new RegExp(`(?:Intrinsic Value Per Share).*?${curSymbolPattern}([0-9,]+\\.?[0-9]*)`, 'i'));
            if (fallback) iv = fallback[1];
          }
        }
      }
    }
  }

  // 3. Margin of Safety (check Part 11 verdict block first, then synthesis tables)
  let mos: string | null = null;
  const verdictMosMatch = verdictText ? (
    verdictText.match(/\|\s*\*{0,2}(?:Current\s+|Standard\s+|Calculated\s+)?Margin\s+of\s+Safety[^\n|]*\*{0,2}\s*\|\s*[:\s]*\*{0,2}([+-]?[0-9,.]+\%)/i) ||
    verdictText.match(/(?:\|\s*)?(?:\*{0,2})?(?:Current\s+|Standard\s+|Calculated\s+)?Margin\s+of\s+Safety(?:\s*\(Standard\))?[^\n|%]{0,45}?(?:[:|=]\s*|\s*\|\s*)([+-]?[0-9,.]+\%)/i) ||
    verdictText.match(/(?:Current Margin of Safety|Standard Margin of Safety|Margin of Safety)[^%\n]{1,45}?([+-]?[0-9,.]+\%)/i)
  ) : null;
  const mosTableMatch = verdictMosMatch ||
                        text.match(/\|\s*\*{0,2}(?:Standard |Calculated )?Margin of Safety\*{0,2}\s*\|\s*[:\s]*\*{0,2}([+-]?[0-9,.]+\%)/i);
  if (mosTableMatch) {
    mos = mosTableMatch[1];
  } else {
    const mosMatch = text.match(/(?:Current Standard Margin of Safety at Market|Margin of Safety at Market|Standard Margin of Safety)[^%\r\n]*?([+-]?[0-9,.]+\%)/i) ||
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

  // Exact mathematical fallback/validation if price & intrinsic value are present
  if (price && iv) {
    const numP = parseFloat(price.replace(/,/g, ''));
    const numIv = parseFloat(iv.replace(/,/g, ''));
    if (!isNaN(numP) && !isNaN(numIv) && numP > 0 && numIv > 0) {
      const exactMos = ((numIv - numP) / numIv * 100);
      const parsedMosNum = mos ? parseFloat(mos.replace(/[%+]/g, '').trim()) : NaN;
      if (!mos || isNaN(parsedMosNum) || Math.abs(parsedMosNum - exactMos) > 0.5) {
        mos = exactMos.toFixed(2) + "%";
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

  const hasImminentEarnings = typeof state.config?.daysToNextEarnings === 'number' && state.config.daysToNextEarnings >= 0 && state.config.daysToNextEarnings <= 14;

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
    state.config?.lastEarningsDate ? `last_earnings_date: "${state.config.lastEarningsDate}"` : null,
    state.config?.nextEarningsDate ? `next_earnings_date: "${state.config.nextEarningsDate}"` : null,
    typeof state.config?.daysToNextEarnings === 'number' ? `days_to_next_earnings: ${state.config.daysToNextEarnings}` : null,
    hasImminentEarnings ? `earnings_horizon_status: "Pre-Earnings Horizon (Reports ${state.config?.nextEarningsDate} in ${state.config?.daysToNextEarnings}d)"` : null,
    state.config?.isAdr ? 'is_adr: true' : null,
    state.config?.country ? `country: "${state.config.country}"` : null,
    `date: ${new Date().toISOString().split('T')[0]}`,
    `ai_model: ${model}`,
    'tags:',
    '  - value-investing',
    '  - valuation-dossier',
    '---',
    ''
  ].filter(Boolean).join('\n');

  const isInterim = isInterimEarningsReleaseSession();
  if (isInterim) {
    const lines = frontmatter.split("\n");
    const closingIdx = lines.lastIndexOf("---");
    if (closingIdx !== -1) {
      lines.splice(closingIdx, 0, 'filing_status: "Interim Earnings Release (Pending SEC Form 10-Q)"', 'refresh_required: true');
      return lines.join("\n");
    }
  }

  return frontmatter;
}

/**
 * Checks whether the active session is evaluated during an interim earnings release window
 * (i.e. Form 8-K Item 2.02 is staged or Transcript is 1 quarter ahead of Form 10-Q).
 */
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

  const lastDate = state.config?.lastEarningsDate;
  const nextDate = state.config?.nextEarningsDate;
  const daysNext = state.config?.daysToNextEarnings;
  let earningsLine = "";
  if (lastDate || nextDate) {
    const nextFormatted = nextDate
      ? (daysNext === 0 ? `${nextDate} (Today)` : daysNext === 1 ? `${nextDate} (Tomorrow)` : typeof daysNext === 'number' ? `${nextDate} (in ${daysNext} days)` : nextDate)
      : "TBD";
    earningsLine = `**Last Earnings Reported:** ${lastDate || "N/A"}  |  **Next Scheduled Earnings:** ${nextFormatted}\n`;
  }

  let horizonCallout = "";
  if (typeof daysNext === 'number' && daysNext >= 0 && daysNext <= 14 && nextDate) {
    const countdownText = daysNext === 0 ? "on the day of" : daysNext === 1 ? "1 day prior to" : `${daysNext} days prior to`;
    horizonCallout = `\n> **PRE-EARNINGS HORIZON ADVISORY:** This analysis was compiled ${countdownText} the scheduled ${nextDate} earnings release. Core structural moat, Zero-Growth EPV floor, and multi-year compounding models remain foundational; review post-release filings for updated TTM figures and guidance.\n`;
  }

  let bodyMd = `# Valuation Analysis: ${tickerStr} ${periodStr}\n`;
  bodyMd += `**Date:** ${new Date().toLocaleDateString()}\n`;
  bodyMd += `**AI Model:** ${modelName}\n\n`;
  bodyMd += `**Ticker:** ${tickerStr}  |  **Period:** ${periodStr}  |  **Market price:** $${state.config?.price || "N/A"}\n`;
  if (state.config?.isAdr || (state.config?.country && state.config.country !== 'US')) {
    const struct = state.config.isAdr ? "American Depositary Receipt (ADR)" : "International Common Stock";
    bodyMd += `**Security Structure:** ${struct}  |  **Country:** ${state.config.country || "Non-US"}\n`;
  }
  if (earningsLine) bodyMd += earningsLine;
  if (horizonCallout) bodyMd += horizonCallout;
  bodyMd += `---\n\n`;

  let competitorRadarInjected = false;
  const radarDossier = state.competitorRadar || activeCompetitorRadar;

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

      const stepNum = prevMsg && prevMsg.index !== undefined ? prevMsg.index + 1 : undefined;
      const chapterTitle = stepNum ? (STEP_CHAPTER_TITLES[stepNum] || `Part ${stepNum}: Step Analysis`) : "";
      const modelContent = chapterTitle ? stripLeadingDuplicateHeader(msg.text, chapterTitle) : msg.text;

      if (isStep2 && radarDossier && !competitorRadarInjected) {
        const radarSummary = formatRadarSummary(radarDossier.markdownSummary);
        bodyMd += `${injectCompetitorRadarIntoStep2(modelContent, radarSummary)}\n\n`;
        competitorRadarInjected = true;
      } else {
        bodyMd += `${modelContent}\n\n`;
      }
    }
  });

  // Fallback: If radar exists but Step 2 was not yet reached or matched, append it
  if (radarDossier && !competitorRadarInjected) {
    const radarSummary = formatRadarSummary(radarDossier.markdownSummary);
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
        runStepProcessor(state.activeStepIndex || 0, true);
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

  return res.json({ success: true, waiting: true, watcher });
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
  const outputFilename = `${tickerStr} ${periodStr}${releaseTag}_Complete Doc_${modelName}_${formattedDate}.md`;

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
  const outputFilename = `${tickerStr} ${periodStr}${releaseTag}_Valuation_Dossier_${modelName}_${formattedDate}.html`;
  const docTitle = `${tickerStr} - ${periodStr}${isInterim ? ' (Earnings Release)' : ''} Deep Valuation Dossier (${modelName})`;
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
      const modelToUse = state.config?.model || "models/gemini-4-argon";
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
  output = output.replace(/&lt;\/?[a-z]{2,8}:[a-z0-9_-]+[\s\S]*?&gt;/gi, '');
  output = output.replace(/<\/?[a-z]{2,8}:[a-z0-9_-]+[^>]*?>/gi, '');

  // Strip head, style, script, noscript, svg, iframe
  output = output.replace(/<head[\s\S]*?<\/head>/gi, '');
  output = output.replace(/<style[\s\S]*?<\/style>/gi, '');
  output = output.replace(/<script[\s\S]*?<\/script>/gi, '');
  output = output.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  output = output.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  output = output.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  
  // Remove hidden display:none elements
  output = output.replace(/<[^>]*?style\s*=\s*['"]\s*display\s*:\s*none[\s\S]*?\/?>[\s\S]*?<\/div>/gi, '');
  
  // Map tables to markdown-like tables with delimiters (preserving both td and th headers)
  // Collapse newlines inside table cells first to prevent markdown row splitting
  output = output.replace(/<(?:td|th)\b[^>]*>[\s\S]*?<\/(?:td|th)>/gi, match => match.replace(/\r?\n/g, ' '));
  output = output.replace(/<\/tr>/gi, '\n');
  output = output.replace(/<tr[^>]*?>/gi, '| ');
  output = output.replace(/<\/(?:td|th)>/gi, ' | ');
  output = output.replace(/<(?:td|th)[^>]*?>/gi, '');

  // Strip remaining HTML tags
  output = output.replace(/<[^>]*?>/g, '');

  // Replace common HTML space entities
  output = output.replace(/&nbsp;/g, ' ');
  output = output.replace(/&#160;/g, ' ');

  // Strip raw leftovers of entity elements, namespace strings, or raw SGML tags
  output = output.replace(/^[?\s]*xml version=[\s\S]*?\?[?\s]*$/gim, '');
  output = output.replace(/^[a-z0-9]+-[0-9]{8}\s*$/gim, '');
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

  if (fType.includes("20-F") || fType.includes("40-F")) {
    const searchArea = output.slice(skipLength);
    // For Form 20-F, Item 17/18 IS the Audited Consolidated Financial Statements. Never truncate ITEM 17 or ITEM 18!
    const cutoffIndex = searchArea.search(/\n(ITEM\s*19\.|SIGNATURES\b)/gi);
    if (cutoffIndex !== -1) {
      output = output.slice(0, skipLength + cutoffIndex) + "\n\n> [... ADMINISTRATIVE EXHIBITS / SIGNATURES STRIPPED FOR TOKEN CONSERVATION ...]\n";
    }
  } else if (fType.includes("10-K") || fType.includes("10-Q")) {
    const searchArea = output.slice(skipLength);
    // Part IV contains exhibits and certifications. Item 15 contains financial statements or schedules in some 10-Ks,
    // so strictly truncate at Part IV / Item 16 if present.
    const cutoffIndex = searchArea.search(/\n(PART\s*IV|ITEM\s*16\.)\b/gi);
    if (cutoffIndex !== -1) {
      output = output.slice(0, skipLength + cutoffIndex) + "\n\n> [... PART IV / ADMINISTRATIVE EXHIBITS STRIPPED FOR TOKEN CONSERVATION ...]\n";
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
      output = output.slice(0, qaMatch) + "\n\n> [... ADMINISTRATIVE VOTING MECHANICS STRIPPED FOR TOKEN CONSERVATION ...]\n\n" + output.slice(qaEndMatch);
    }
    // Remove Auditor Ratification
    const auditStart = output.search(/\n(RATIFICATION OF.*?INDEPENDENT|REPORT OF THE AUDIT COMMITTEE)\b/gi);
    if (auditStart !== -1 && auditStart > skipLength) {
      const remaining = output.slice(auditStart + 100);
      const nextSecMatch = remaining.search(/\n(PROPOSAL \d+|EXECUTIVE COMPENSATION|SECURITY OWNERSHIP)\b/gi);
      if (nextSecMatch !== -1) {
        output = output.slice(0, auditStart) + "\n\n> [... AUDITOR RATIFICATION STRIPPED FOR TOKEN CONSERVATION ...]\n\n" + remaining.slice(nextSecMatch);
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

  // Enforce Clean Environment for the active ticker
  enforceCleanTickerEnvironment(cleanTicker, period);

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
        const rawDate = item.filingDate.replace(/-/g, '');
        const sameDayCount = candidates.filter(c => (c.category === "8-K" || c.resolvedType.includes("Event")) && c.filingDate === item.filingDate).length;
        datePart = sameDayCount > 1 ? `${rawDate}_${item.accession.slice(-4)}` : rawDate;
      } else if (item.fiscalYear) {
        datePart = String(item.fiscalYear);
      } else if (item.reportDate) {
        const fyeMonth = parseInt(fyeStr.slice(0, 2), 10) || 12;
        const rYear = parseInt(item.reportDate.slice(0, 4), 10);
        const rMonth = parseInt(item.reportDate.slice(5, 7), 10);
        const rDay = parseInt(item.reportDate.slice(8, 10), 10) || 1;
        // 52/53-week fiscal year calendar defense:
        // If report date spills 1-6 days into next month after fiscal year end (e.g. Dec 2 for a Nov 30 FYE),
        // it belongs to current fiscal year (rYear), not rYear + 1.
        const isMonthSpillover = rMonth === (fyeMonth % 12) + 1 && rDay <= 6;
        datePart = String((fyeMonth < 12 && rMonth > fyeMonth && !isMonthSpillover) ? rYear + 1 : rYear);
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
  enforceCleanTickerEnvironment(symbol, targetPeriod);

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
    const year = parseInt(r.fiscalYear || r.calendarYear || "0", 10);
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
      } else {
        // Fallback: check matching calendarYear if fiscalYear didn't match
        const calRecord = [...isSorted, ...bsSorted, ...cfSorted].find(r => {
          const calYear = parseInt(r.calendarYear || "0", 10);
          return calYear === tYear && r.period === tQuarter;
        });
        if (calRecord) {
          const fallbackKey = getQuarterKey(calRecord);
          if (allKeys.includes(fallbackKey)) {
            latestKey = fallbackKey;
            console.log(`[FMP Ingest] Targeted quarter matched via calendarYear fallback: ${fallbackKey}`);
          }
        }
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
    'weighted_average_shs_out', 'weighted_average_shs_out_dil',
    'grossProfitRatio', 'operatingIncomeRatio', 'ebitdaratio', 'ebitdaRatio', 'netIncomeRatio', 'incomeBeforeTaxRatio'
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

  const CRITICAL_FLOW_KEYS = new Set([
    'revenue', 'costOfRevenue', 'grossProfit', 'operatingIncome',
    'netIncome', 'operatingCashFlow', 'capitalExpenditure', 'freeCashFlow'
  ]);

  const calculateTtmValue = (byQuarterSet: Record<string, any>, y: number, p: string, key: string) => {
    const qSequence = getConsecutiveQuarters(y, p);
    const records = qSequence.map(k => byQuarterSet[k]);
    if (records.some(r => !r)) return null;

    const values = records.map(r => r[key]);
    if (values.every(v => v === null || v === undefined)) return null;

    // Guard against partial-null (fewer than 4 consecutive quarters) for critical flow lines
    if (CRITICAL_FLOW_KEYS.has(key) && values.some(v => v === null || v === undefined)) {
      return null;
    }

    const isRatio = key.toLowerCase().endsWith('ratio');
    let sum = 0.0;
    let validCount = 0;
    for (const v of values) {
      if (v !== null && v !== undefined) {
        const parsed = parseFloat(v);
        if (!isNaN(parsed)) {
          sum += parsed;
          validCount++;
        }
      }
    }
    if (validCount === 0) return null;
    if (isRatio) {
      return sum / validCount;
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
    appendRow(["reportedCurrency", ...outputQuarters.map(q => {
      const qKey = `${q.year}_${q.period}`;
      return isByQuarter[qKey]?.reportedCurrency || bsByQuarter[qKey]?.reportedCurrency || 'USD';
    })]);

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
): Promise<{ 
  price: string; 
  period: string; 
  fmpSucceeded: boolean; 
  source: 'fmp' | 'fallback' | 'manual';
  lastEarningsDate?: string | null;
  nextEarningsDate?: string | null;
  daysToNextEarnings?: number | null;
}> {
  const symbol = ticker.toUpperCase().trim();
  const activeFmpKey = fmpApiKey?.trim() || process.env.FMP_API_KEY || "";

  let price = "";
  let period = "";
  let fmpSucceeded = false;
  let lastEarningsDate: string | null = null;
  let nextEarningsDate: string | null = null;
  let daysToNextEarnings: number | null = null;

  // 1. Try fetching from FMP first (concurrently probe quote, income statement, and earnings calendar)
  if (activeFmpKey) {
    try {
      const quotePromise = (async () => {
        try {
          const stableQuoteUrl = `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${activeFmpKey}`;
          const res = await fetch(stableQuoteUrl);
          if (res.ok) {
            const data = await res.json() as any[];
            if (Array.isArray(data) && data.length > 0 && !data[0]['Error Message']) return data;
          }
        } catch (e) {}
        try {
          const legacyQuoteUrl = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${activeFmpKey}`;
          const res = await fetch(legacyQuoteUrl);
          if (res.ok) {
            const data = await res.json() as any[];
            if (Array.isArray(data) && data.length > 0 && !data[0]['Error Message']) return data;
          }
        } catch (e) {}
        return null;
      })();

      const isPromise = (async () => {
        try {
          const stableIsUrl = `https://financialmodelingprep.com/stable/income-statement?symbol=${symbol}&period=quarter&limit=1&apikey=${activeFmpKey}`;
          const res = await fetch(stableIsUrl);
          if (res.ok) {
            const data = await res.json() as any[];
            if (Array.isArray(data) && data.length > 0 && !data[0].Error && !data[0]['Error Message']) return data;
          }
        } catch (e) {}
        try {
          const legacyIsUrl = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=quarter&limit=1&apikey=${activeFmpKey}`;
          const res = await fetch(legacyIsUrl);
          if (res.ok) {
            const data = await res.json() as any[];
            if (Array.isArray(data) && data.length > 0 && !data[0].Error && !data[0]['Error Message']) return data;
          }
        } catch (e) {}
        return null;
      })();

      const earningsPromise = (async () => {
        try {
          const earningsUrl = `https://financialmodelingprep.com/stable/earnings?symbol=${symbol}&apikey=${activeFmpKey}`;
          const res = await fetch(earningsUrl);
          if (res.ok) {
            const data = await res.json() as any[];
            if (Array.isArray(data) && data.length > 0 && !data[0]['Error Message']) return data;
          }
        } catch (e) {}
        return null;
      })();

      const [qData, isData, earningsData] = await Promise.all([quotePromise, isPromise, earningsPromise]);

      if (qData && qData.length > 0) {
        price = String(qData[0].price || "");
        fmpSucceeded = true;
      }

      if (isData && isData.length > 0) {
        const item = isData[0];
        const rawPeriod = item.period || "Q1";
        const year = item.calendarYear || item.fiscalYear || (item.date ? item.date.slice(0, 4) : new Date().getFullYear());
        const yearShort = String(year).slice(-2);
        period = `${rawPeriod}-${yearShort}`;
        fmpSucceeded = true;
      }

      if (earningsData && earningsData.length > 0) {
        const validItems = earningsData.filter(d => typeof d?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date));
        validItems.sort((a, b) => b.date.localeCompare(a.date));

        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const todayYmd = `${y}-${m}-${d}`;

        // Find most recent reported quarter
        const pastReported = validItems.filter(item => 
          (item.epsActual !== null && item.epsActual !== undefined) ||
          (item.revenueActual !== null && item.revenueActual !== undefined) ||
          item.date < todayYmd
        );
        if (pastReported.length > 0) {
          lastEarningsDate = pastReported[0].date;
        }

        // Find nearest upcoming quarter
        const upcoming = validItems.filter(item =>
          item.epsActual === null &&
          item.revenueActual === null &&
          item.date >= todayYmd
        );
        if (upcoming.length > 0) {
          upcoming.sort((a, b) => a.date.localeCompare(b.date));
          nextEarningsDate = upcoming[0].date;

          const [y1, m1, d1] = todayYmd.split('-').map(Number);
          const [y2, m2, d2] = nextEarningsDate.split('-').map(Number);
          const utc1 = Date.UTC(y1, m1 - 1, d1);
          const utc2 = Date.UTC(y2, m2 - 1, d2);
          daysToNextEarnings = Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
        }
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

  return { price, period, fmpSucceeded, source, lastEarningsDate, nextEarningsDate, daysToNextEarnings };
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
    lastEarningsDate: info.lastEarningsDate,
    nextEarningsDate: info.nextEarningsDate,
    daysToNextEarnings: info.daysToNextEarnings,
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
  enforceCleanTickerEnvironment(symbol, requestedPeriod || undefined);

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
      server: {
        middlewareMode: true,
        allowedHosts: true,
        watch: {
          ignored: [
            '**/backups/**',
            '**/*.zip',
            '**/*.tar',
            '**/*.gz',
            '**/tmp/**',
            '**/staging/**',
            '**/dossiers/**',
            '**/.git/**',
            '**/node_modules/**',
            '**/dist/**'
          ]
        }
      },
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

```

---

# SECTION 4: FORMAT GUARD, PARSER RESILIENCE & VISUALIZERS

## Source File: `src/utils/dossierFormatGuard.ts`
```typescript
import { STEP_CHAPTER_TITLES } from "../prompts.js";

export interface FlywheelStep {
  number: number;
  title: string;
  description: string;
  isLoopback?: boolean;
}

/**
 * Robust step parser for Compounding Flywheel mechanics.
 */
export function parseFlywheelSteps(text: string): FlywheelStep[] {
  const steps: FlywheelStep[] = [];
  const lines = text.split(/\r?\n/);
  let currentStep: FlywheelStep | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Skip horizontal border lines, pipes-only, and arrow-only lines
    if (/^[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s▼v▲\^>►◄_–—]+$/.test(trimmed)) continue;

    // Skip pseudo-table title for flywheel diagram
    if (/^\|\s*(?:5-STAGE\s*COMPOUNDING\s*FLYWHEEL|COMPOUNDING\s*FLYWHEEL)\s*\|$/i.test(trimmed)) continue;

    // Strip outer box drawing chars
    const cleaned = trimmed
      .replace(/^[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s]+/, "")
      .replace(/[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s]+$/, "")
      .trim();

    if (!cleaned) continue;

    // Check for Loopback header e.g. "##### Loopback & Compounding Acceleration"
    if (/^#{1,6}\s*(?:Loopback|Compounding\s*Acceleration|The\s*Compounding\s*Return\s*Loop)/i.test(cleaned)) {
      if (currentStep) {
        currentStep.isLoopback = true;
      }
      continue;
    }

    // Check for Section Header representing a Step:
    // e.g. "##### 1. Stage 1: Traffic, Seller Selection..."
    // or "##### Stage 1: Traffic..."
    // or "#### 1. Traffic..."
    const headerStepMatch = cleaned.match(/^#{1,6}\s*(?:(?:(\d+)\.\s*(?:Stage\s*\d+[:\-]?\s*)?)|(?:Stage\s*(\d+)[:\-]\s*))(.*)$/i);
    if (headerStepMatch) {
      if (currentStep) steps.push(currentStep);
      const num = parseInt(headerStepMatch[1] || headerStepMatch[2], 10);
      let rawTitle = headerStepMatch[3].trim();
      let desc = "";

      const colonMatch = rawTitle.match(/^\*\*(.*?)\*\*[:\-]?\s*(.*)$/);
      if (colonMatch) {
        rawTitle = colonMatch[1].replace(/[:\|\-\s]+$/, "").trim();
        desc = colonMatch[2].replace(/^[:\|\-\s]+/, "").replace(/[:\|\-\s]+$/, "").trim();
      } else {
        // Strip parenthetical subtitle like "(Primary Vector)" or clean trailing punctuation
        rawTitle = rawTitle.replace(/\s*\([^)]*\)$/, "").replace(/[:\|\-\s]+$/, "").trim();
      }

      currentStep = {
        number: num,
        title: rawTitle,
        description: desc,
        isLoopback: num === 5 || /(?:loopback|compounding acceleration|re-enters|back to step|feeds back)/i.test(rawTitle)
      };
      continue;
    }

    // Skip section numbers like 9.8 or 1.7
    if (/^\d+\.\d+\b/.test(cleaned) || /^#{1,6}\s*\d+\.\d+\b/.test(cleaned)) continue;

    // Regular step match: e.g. "1. **Traffic...**" or "1. Traffic..."
    const stepMatch = cleaned.match(/^(\d+)\.\s+(.*)$/);
    if (stepMatch) {
      const num = parseInt(stepMatch[1], 10);
      let rawTitle = stepMatch[2].trim();
      let desc = "";

      const colonMatch = rawTitle.match(/^\*\*(.*?)\*\*[:\-]?\s*(.*)$/);
      if (colonMatch) {
        rawTitle = colonMatch[1].replace(/[:\|\-\s]+$/, "").trim();
        desc = colonMatch[2].replace(/^[:\|\-\s]+/, "").replace(/[:\|\-\s]+$/, "").trim();
      } else if (rawTitle.includes(":")) {
        const parts = rawTitle.split(":");
        rawTitle = parts[0].replace(/[:\|\-\s]+$/, "").trim();
        desc = parts.slice(1).join(":").replace(/^[:\|\-\s]+/, "").trim();
      } else {
        rawTitle = rawTitle.replace(/[:\|\-\s]+$/, "").trim();
      }

      // Check if this is an ASCII diagram placeholder (e.g. ALL CAPS with no desc)
      // and we might already have or will have rich steps
      const isAllCapsPlaceholder = rawTitle === rawTitle.toUpperCase() && !desc && rawTitle.length > 5;
      if (isAllCapsPlaceholder && steps.length === 0) {
        // Look ahead to see if rich "##### X. Stage X:" exists below
        const hasRichStepsBelow = lines.slice(i).some(l => /^#{1,6}\s*(?:\d+\.\s*Stage|Stage\s*\d+)/i.test(l.trim()));
        if (hasRichStepsBelow) {
          continue; // skip the ASCII diagram dummy lines!
        }
      }

      if (currentStep) steps.push(currentStep);
      currentStep = {
        number: num,
        title: rawTitle,
        description: desc,
        isLoopback: num === 5 || /(?:loopback|compounding acceleration|re-enters|back to step|feeds back)/i.test(rawTitle + " " + desc)
      };
      continue;
    }

    // Stop step description parsing if entering confidence level or section boundary
    if (/^(?:\*{0,2}Confidence\s*Level|Checklist\s*Analytical|\|\s*Status\s*\|)/i.test(cleaned) || cleaned.startsWith("---") || /^##\s+Part/i.test(cleaned)) {
      if (currentStep) {
        steps.push(currentStep);
        currentStep = null;
      }
      break;
    }

    // Skip "Back to Stage 1: Market Expansion" or "(Accelerating Velocity)"
    if (/^Back to Stage\s*\d+/i.test(cleaned) || /^\(Accelerating Velocity\)/i.test(cleaned)) {
      if (currentStep) currentStep.isLoopback = true;
      continue;
    }

    if (currentStep) {
      let descLine = cleaned.replace(/^\((.*)\)$/, "$1").replace(/^↳\s*\*?(.*?)\*?$/, "$1").replace(/[:\|\-\s]+$/, "").trim();
      if (descLine) {
        currentStep.description = currentStep.description ? `${currentStep.description} ${descLine}` : descLine;
      }
    }
  }

  if (currentStep) steps.push(currentStep);
  return steps;
}

/**
 * Formats a flywheel stage node label with clean line-wrapping for Mermaid diagrams.
 */
export function formatMermaidNode(stageNum: string, title: string, _desc?: string): string {
  const cleanTitle = title.replace(/[":\n\r]/g, " ").replace(/[:\|\-\s]+$/, "").replace(/\s+/g, " ").trim();
  return `<b>Stage ${stageNum}: ${cleanTitle}</b>`;
}

/**
 * Converts space-aligned or typewriter-style MATERIALITY & CONTINGENCY AUDIT MATRIX
 * into a clean GitHub-Flavored Markdown pipe table.
 */
export function formatMaterialityMatrix(block: string): string {
  if (block.includes("|") && block.includes("---")) return block;

  const headerRegex = /(?:#{1,4}\s*)?MATERIALITY\s*&\s*CONTINGENCY\s*AUDIT\s*MATRIX/i;
  const headerMatch = block.match(headerRegex);
  if (!headerMatch) return block;

  const title = headerMatch[0].startsWith("#") ? headerMatch[0] : `### ${headerMatch[0]}`;
  const afterHeader = block.slice(headerMatch.index! + headerMatch[0].length).trim();

  const lines = afterHeader.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return block;

  let headers = ["Audit Vector / Risk Dimension", "Filing Reference", "Identified Contingency / Exposure", "P&L / Cash Flow Impact", "Audit Status"];
  const rows: string[][] = [];

  for (const line of lines) {
    if (/^[=\-\s+]+$/.test(line)) continue;
    const parts = line.split(/\s{2,}|\t+|\|/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      rows.push(parts);
    }
  }

  if (rows.length === 0) return block;

  let mdTable = `\n${title}\n\n`;
  mdTable += "| " + headers.join(" | ") + " |\n";
  mdTable += "| :--- | :--- | :--- | :---: | :---: |\n";
  for (const row of rows) {
    while (row.length < headers.length) row.push("-");
    const formattedRow = row.slice(0, headers.length);
    mdTable += "| " + formattedRow.join(" | ") + " |\n";
  }
  mdTable += "\n";
  return mdTable;
}

/**
 * Unconditionally unwraps any non-mermaid code blocks into native Markdown.
 * Prevents LLMs from trapping analytical prose, financial tables, and segment breakdowns
 * inside typewriter monospace <pre><code> blocks.
 */
export function unwrapNonMermaidCodeBlocks(text: string): string {
  // Normalize fused backticks on a single line:
  // e.g. `````` -> ```\n```
  text = text.replace(/`{6,}/g, "```\n```");
  text = text.replace(/`{4,5}/g, "```");

  const lines = text.split(/\r?\n/);
  const resultLines: string[] = [];

  let inFence = false;
  let currentLang = "";
  let blockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimLine = rawLine.trim();

    if (trimLine.startsWith("```")) {
      if (!inFence) {
        // Opening fence
        inFence = true;
        currentLang = trimLine.replace(/^`+/, "").trim().toLowerCase();
        blockLines = [];
      } else {
        // Closing fence
        inFence = false;
        if (currentLang === "mermaid") {
          // Preserve valid Mermaid diagrams
          resultLines.push("```mermaid");
          resultLines.push(...blockLines);
          resultLines.push("```");
        } else {
          // Unwrap into native Markdown
          resultLines.push("");
          resultLines.push(...blockLines);
          resultLines.push("");
        }
        currentLang = "";
        blockLines = [];
      }
    } else {
      if (inFence) {
        // Auto-close if an unclosed code block collides with a major section header (## Part X:)
        if (/^##\s+Part\s+\d+:/i.test(trimLine)) {
          inFence = false;
          if (currentLang === "mermaid") {
            resultLines.push("```mermaid");
            resultLines.push(...blockLines);
            resultLines.push("```");
          } else {
            resultLines.push("");
            resultLines.push(...blockLines);
            resultLines.push("");
          }
          currentLang = "";
          blockLines = [];
          resultLines.push(rawLine);
        } else {
          blockLines.push(rawLine);
        }
      } else {
        resultLines.push(rawLine);
      }
    }
  }

  // Handle unclosed fence at EOF
  if (inFence) {
    if (currentLang === "mermaid") {
      resultLines.push("```mermaid");
      resultLines.push(...blockLines);
      resultLines.push("```");
    } else {
      resultLines.push("");
      resultLines.push(...blockLines);
      resultLines.push("");
    }
  }

  return resultLines.join("\n");
}

/**
 * Strips rogue ASCII flowchart diagrams, box-drawing characters, and stray arrow lines
 * from the analytical markdown text to enforce Rule 2 of the 5 Inviolable Formatting Laws.
 */
export function stripAsciiFlowcharts(text: string): string {
  const lines = text.split(/\r?\n/);
  const resultLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trim = rawLine.trim();

    // Line consisting entirely of ASCII box or flow connectors (including bulleted or bolded dividers)
    const isConnectorOnly = /^(?:[\*\-•]\s*)?(?:\*{0,2})[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s▼v▲\^>►◄–—_├┤]+(?:\*{0,2})$/.test(trim) && trim.length > 0;
    
    // Check for premature flywheel flow lines in Part 1/2 like:
    // ^
    // |  Ecosystem Flywheel & Data Loop
    // v
    const isFlywheelArrowLine = /^[\s\^v\|]*(?:Ecosystem Flywheel|Captive Customer Flywheel|[A-Za-z\s]+Flywheel)[\s\^v\|]*$/i.test(trim);

    // Check for flowchart boxes like:
    // [ Captive Logistics Infrastructure ] ➔ Low Delivery Friction & High Conversion
    const flowBoxMatch = trim.match(/^\[\s*([^\]]+)\s*\](?:\s*(?:──>|-->|->)\s*(.*))?$/);
    if (flowBoxMatch) {
      const boxTitle = flowBoxMatch[1].trim();
      const desc = flowBoxMatch[2] ? flowBoxMatch[2].trim() : '';
      if (desc) {
        resultLines.push(`* **${boxTitle}:** ${desc}`);
      } else {
        resultLines.push(`* **${boxTitle}**`);
      }
      continue;
    }

    // Check for flowchart loopback lines like:
    // └───────────────> (Reinvests into Lower Shipping & Take Rates) ───┐
    const flowLoopMatch = trim.match(/^[└├─\s>]+(?:\(\s*)?(Reinvests[^\)]+)(?:\)\s*)?[─┐\s]*$/i);
    if (flowLoopMatch) {
      resultLines.push(`* **Reinvestment Loop:** ${flowLoopMatch[1].trim()}`);
      continue;
    }

    // Check for ASCII Flywheel pseudo-header
    if (/^\|\s*(?:5-STAGE\s*COMPOUNDING\s*FLYWHEEL|COMPOUNDING\s*FLYWHEEL)\s*\|$/i.test(trim)) {
      continue;
    }

    // Check for ASCII Flywheel loopback annotations
    if (/^(?:Back to Stage\s*\d+|(?:\(\s*Accelerating\s*Velocity\s*\)))/i.test(trim)) {
      continue;
    }

    // Check for all-caps standalone ASCII flywheel stage names in typewriter diagram
    if (/^\d+\.\s*[A-Z\s,&/]{10,}$/.test(trim)) {
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const isSurroundedByConnectors = /^[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s▼v▲\^>►◄–—_]+$/.test(prevLine) || /^[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s▼v▲\^>►◄–—_]+$/.test(nextLine);
      if (isSurroundedByConnectors) {
        continue;
      }
    }

    // Strip premature ecosystem/platform ASCII diagrams in Part 1 / Part 2 / Part 10
    if (/^\|\s*(?:[A-Z0-9\s,&/]+ECOSYSTEM|[A-Z0-9\s,&/]+PLATFORM)\s*\|$/i.test(trim)) {
      continue;
    }
    if (/^\|\s*.*?(?:<--->|<─+>|<--+>).*?\|$/.test(trim)) {
      continue;
    }
    if (/^[\|\s]*(?:Ecosystem\s*Flywheel|Captive\s*Customer\s*Flywheel|[A-Za-z\s]*Flywheel\s*&\s*Data\s*Loop|[A-Za-z\s]+Flywheel)[A-Za-z0-9\s,&/\-–—]*[\|\s]*$/i.test(trim)) {
      continue;
    }
    if (/^\[\s*Pure E-Commerce Marketplace\s*\]/i.test(trim) || /3P Listing Intermediation.*Route Density/i.test(trim)) {
      continue;
    }
    if (/^\(2000-2015\)\s+\(2016-2021\)/.test(trim) || /^Fast Grower\s+Fast Grower/.test(trim)) {
      continue;
    }

    // Skip connector-only lines if preceded or followed by ASCII or if standalone
    if (isConnectorOnly || isFlywheelArrowLine) {
      continue;
    }

    resultLines.push(rawLine);
  }

  return resultLines.join('\n');
}

/**
 * Converts pseudo-reconciliation typewriter blocks into clean GFM pipe tables.
 * Transforms blocks like:
 * | TTM CASH FLOW TO NORMALIZED OWNER EARNINGS BRIDGE |
 *   Item 1 ... $Amount
 *   (-) Deduction ... ($Amount)
 *   -----------------------
 *   = Baseline ... $Amount
 */
export function formatFinancialBridgeTables(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const outLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimLine = rawLine.trim();

    // 1. Detect single-pipe blocks with arrows (e.g. Lollapalooza Matrix or Risk Vectors):
    // | THE LOLLAPALOOZA MATRIX |
    // | 1. Scale Economies Shared --> Lowers shipping costs... |
    if (trimLine.startsWith("|") && trimLine.endsWith("|") && (trimLine.includes("-->") || trimLine.includes("──>") || (lines[i+1]?.trim().startsWith("|") && (lines[i+1].includes("-->") || lines[i+1].includes("──>"))))) {
      const block: string[] = [];
      let k = i;
      while (k < lines.length && lines[k].trim().startsWith("|") && lines[k].trim().endsWith("|")) {
        block.push(lines[k].trim());
        k++;
      }

      const rows: Array<{ col1: string; col2: string }> = [];
      let tableTitle = "";

      for (const rowLine of block) {
        const inner = rowLine.replace(/^\|\s*/, "").replace(/\s*\|$/, "").trim();
        if (!inner || /^[=\-\s+]+$/.test(inner)) continue;

        if (!inner.includes("-->") && !inner.includes("──>") && !inner.includes("->") && !tableTitle) {
          tableTitle = inner.replace(/[:\|\-\s]+$/, "").trim();
          continue;
        }

        const arrowMatch = inner.match(/^(?:(?:\d+\.|\*|\-)\s*)?(.*?)\s*(?:-->|──>|->)\s*(.*)$/);
        if (arrowMatch) {
          const col1 = arrowMatch[1].trim();
          const col2 = arrowMatch[2].trim();
          rows.push({ col1: `**${col1}**`, col2 });
        } else if (/^(?:RESULT|OUTCOME|VERDICT|CONCLUSION):/i.test(inner)) {
          const parts = inner.split(/:\s*/);
          rows.push({ col1: `**${parts[0].trim()}**`, col2: `**${parts.slice(1).join(": ").trim()}**` });
        } else {
          rows.push({ col1: inner, col2: "-" });
        }
      }

      if (rows.length >= 2) {
        let tableMd = "";
        if (tableTitle) {
          tableMd += `\n### ${tableTitle}\n\n`;
        } else {
          tableMd += `\n`;
        }
        tableMd += `| Strategic Vector / Parameter | Institutional Analysis & Impact |\n`;
        tableMd += `| :--- | :--- |\n`;
        for (const r of rows) {
          tableMd += `| ${r.col1} | ${r.col2} |\n`;
        }
        tableMd += `\n`;
        outLines.push(tableMd);
        i = k;
        continue;
      }
    }

    // 2. Check for single-cell table title or header indicating a financial bridge, matrix, or architecture:
    const singleCellMatch = trimLine.match(/^\|\s*([A-Z0-9\s\(\)\-–—&/]{6,}?(?:BRIDGE|RECONCILIATION|ARCHITECTURE|INTEGRITY CHECK|SCORECARD|MATRIX|SCHEDULE|DERIVATION))\s*\|$/i);
    const standaloneMatch = !singleCellMatch ? trimLine.match(/^(?:#{1,4}\s*)?([A-Z0-9\s\(\)\-–—&/]{6,}?(?:BRIDGE|RECONCILIATION|ARCHITECTURE|INTEGRITY CHECK|SCORECARD|MOAT SCORECARD|VALUATION SCHEDULE|WEIGHTING SCHEDULE))$/i) : null;

    if ((singleCellMatch || standaloneMatch) && i + 1 < lines.length) {
      const headerTitle = (singleCellMatch ? singleCellMatch[1] : standaloneMatch![1]).trim();

      // Look ahead: does this block contain typewriter reconciliation lines?
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;

      const isNextLineAlreadyTable = j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().includes('---');

      if (!isNextLineAlreadyTable && j < lines.length) {
        const blockLines: string[] = [];
        let k = j;
        let foundFinancialMarkers = false;

        while (k < lines.length) {
          const l = lines[k].trim();
          if (l.startsWith('#') || (l.startsWith('|') && l.includes('|') && lines[k + 1]?.includes('---'))) {
            break;
          }
          if (l === '' && blockLines.length > 0 && k + 1 < lines.length && (lines[k + 1].trim().startsWith('#') || lines[k + 1].trim().startsWith('|'))) {
            break;
          }
          if (/[\(\-\+=\/]\s*[\$]?[\d,]+|-->|──>|PASS|FLAG|BREACH|\(\d+\.\d+M\)|\b\d+\.\d+x\b|\b\d+\.\d+%\b/i.test(l)) {
            foundFinancialMarkers = true;
          }
          blockLines.push(lines[k]);
          k++;
          // Break if 2 blank lines in a row
          if (l === '' && lines[k]?.trim() === '') break;
        }

        if (foundFinancialMarkers && blockLines.length >= 2) {
          const rows: string[][] = [];
          for (const bl of blockLines) {
            const trimmed = bl.trim();
            if (!trimmed || /^[=\-\s+]{4,}$/.test(trimmed)) continue; // skip divider lines

            // Check format: Item --> Value
            const arrowMatch = trimmed.match(/^(?:(?:\d+\.|\*|\-)\s*)?(.*?)\s*(?:-->|──>|->)\s*(.*)$/);
            if (arrowMatch) {
              const item = arrowMatch[1].trim();
              const val = arrowMatch[2].trim();
              const type = item.startsWith('(-)') ? '[-] Deduction' : (item.startsWith('(+)') ? '[+] Addition' : 'Asset Tier');
              const cleanItem = item.replace(/^\([-\+]\)\s*/, '').replace(/^\d+\.\s*/, '').trim();
              rows.push([cleanItem, type, val, 'Duplication / Replacement Parameter']);
              continue;
            }

            // Check format: Item ... $Amount / Value
            const finMatch = trimmed.match(/^(\([+-]\)|[=+-]|(?:\(\/\)))?\s*(.*?)(?:\s{2,}|\t+)([\($+-]?[\d,.]+(?:M|B|k|x|%|\s*per\s*share)?\)?)\s*$/i);
            if (finMatch) {
              const sign = finMatch[1] || '';
              const rawItem = finMatch[2].trim();
              const amount = finMatch[3].trim();
              let type = 'Base Anchor';
              if (sign === '(-)' || rawItem.startsWith('(-)') || amount.startsWith('(')) type = '[-] Deduction';
              else if (sign === '(+)' || rawItem.startsWith('(+)')) type = '[+] Addition';
              else if (sign === '(=)' || sign === '=' || rawItem.startsWith('=')) type = '[=] Total';
              else if (sign === '(/)' || rawItem.startsWith('(/)')) type = '[/] Divisor';

              const cleanItem = rawItem.replace(/^[-=()+/]+\s*/, '').trim();
              const isTotal = type.startsWith('[=]');
              const formattedItem = isTotal ? `**${cleanItem}**` : cleanItem;
              const formattedAmount = isTotal ? `**${amount}**` : amount;
              rows.push([formattedItem, type, formattedAmount, isTotal ? 'Final Valuation / Schedule Baseline' : 'Audited SEC Ground Truth']);
              continue;
            }

            // Space-aligned fallback
            const parts = bl.split(/\s{2,}|\t+/).map(p => p.trim()).filter(Boolean);
            if (parts.length >= 3) {
              rows.push(parts);
            }
          }

          if (rows.length >= 2) {
            let col1 = 'Financial Component / Line Item';
            let col2 = 'Valuation Adjustment';
            let col3 = 'Audited Amount';
            let col4 = 'Analytical Notes & Economic Rationale';

            let tableMd = `\n\n### ${headerTitle}\n\n`;
            tableMd += `| ${col1} | ${col2} | ${col3} | ${col4} |\n`;
            tableMd += `| :--- | :---: | :---: | :--- |\n`;
            for (const r of rows) {
              while (r.length < 4) r.push('-');
              tableMd += `| ${r.slice(0, 4).join(' | ')} |\n`;
            }
            tableMd += '\n';

            outLines.push(tableMd);
            i = k;
            continue;
          }
        }
      }
    }

    outLines.push(rawLine);
    i++;
  }

  return outLines.join('\n');
}

export function formatSchilitMatrix(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const outLines: string[] = [];
  let i = 0;

  const CANONICAL_VECTORS: Array<{ num: number; title: string }> = [
    { num: 1, title: "1. 3-Year Cumulative Cash Conversion Reality" },
    { num: 2, title: "2. Charlie Munger Zero-EBITDA & Non-GAAP Add-Back Rejection" },
    { num: 3, title: "3. Aggressive Expense Capitalization & Revenue Pull-Forward" },
    { num: 4, title: "4. Balance Sheet Asset & Working Capital Integrity" },
    { num: 5, title: "5. Unbilled Receivables vs. Deferred Revenue" },
    { num: 6, title: "6. Non-GAAP Add-Back Rejection" },
    { num: 7, title: "7. Credit Quality Check (Fintech Loan Book)" }
  ];

  while (i < lines.length) {
    const raw = lines[i];
    const trim = raw.trim();

    if (/(?:HOWARD\s*SCHILIT|FORENSIC\s*ACCOUNTING)\s*(?:RISK\s*)?MATRIX/i.test(trim)) {
      let k = i + 1;
      const blockLines: string[] = [];
      while (k < lines.length) {
        const l = lines[k].trim();
        if (l.startsWith("###") || l.startsWith("##") || l.startsWith("---") || /^#####\s+ASD-STE100/i.test(l)) {
          break;
        }
        blockLines.push(lines[k]);
        k++;
      }

      // Group lines by test number: 1., 2., 3., 4., 5., 6., 7.
      const groups: Map<number, string[]> = new Map();
      let currentNum: number | null = null;

      for (const line of blockLines) {
        const t = line.trim();
        if (!t || /^[=\-\s+]+$/.test(t) || /^(?:Test\s*Vector|Calculated\s*Metric)/i.test(t)) continue;

        const numMatch = t.match(/^(\d+)\.\s+/);
        if (numMatch) {
          currentNum = parseInt(numMatch[1], 10);
          groups.set(currentNum, [t]);
        } else if (currentNum !== null) {
          groups.get(currentNum)?.push(t);
        }
      }

      const rows: Array<{ vector: string; metric: string; threshold: string; finding: string }> = [];

      for (const [num, groupLines] of groups.entries()) {
        const canonical = CANONICAL_VECTORS.find(v => v.num === num);
        const vectorTitle = canonical ? canonical.title : `${num}. Forensic Vector`;

        const fullText = groupLines.join(" ");

        let finding = "PASS";
        if (/🔴|BREACH|FAIL|DEFICIENT/i.test(fullText)) finding = "FLAG";
        else if (/PASS|🟢|CLEAN/i.test(fullText)) finding = "PASS";

        // Clean out vector prefix, finding, emojis
        let cleaned = fullText
          .replace(/^\d+\.\s+[^:]+?(?:\s{2,}|\t+|:\s*)/, "")
          .replace(/[\uFE0F🟢🔴🟡]/g, "")
          .replace(/\b(?:PASS|FLAG|BREACH)\b/gi, "")
          .trim();

        const defaultThresholds: Record<number, string> = {
          1: "3-Yr Cumulative OCF / GAAP NI >= 0.80x",
          2: "Zero-EBITDA Doctrine; SBC <= 10% OCF (<= 5% Rev)",
          3: "Cap Software <= 15% R&D; Unbilled AR <= 1.50x Rev over 3-Yr",
          4: "Productive cash CapEx/M&A exempt; flag uncollectible asset bloat",
          5: "Unbilled > 1.50x Rev with falling Deferred Rev",
          6: "Zero-EBITDA Doctrine; Recurring non-GAAP add-backs rejected",
          7: "Reserve releases masking NPL surges; Allowance < 1.0x write-offs"
        };

        // Separate metric and threshold dynamically
        let metric = cleaned;
        let threshold = defaultThresholds[num] || "-";

        const threshMatch = cleaned.match(/(?:Trigger\s*Threshold|Threshold|Benchmark):\s*([^.]+?)(?:\.|$)/i);
        if (threshMatch) {
          threshold = threshMatch[1].trim();
          metric = cleaned.replace(threshMatch[0], "").trim();
        }

        rows.push({
          vector: vectorTitle,
          metric,
          threshold,
          finding
        });
      }

      if (rows.length >= 3) {
        let mdTable = `\n### Forensic Accounting Risk Matrix\n\n`;
        mdTable += `| Forensic Vector / Audit Test | Calculated Metric & Empirical Trend | Trigger Threshold | Forensic Audit Finding |\n`;
        mdTable += `| :--- | :--- | :---: | :---: |\n`;
        for (const r of rows) {
          mdTable += `| **${r.vector}** | ${r.metric} | ${r.threshold} | ${r.finding} |\n`;
        }
        mdTable += `\n`;
        outLines.push(mdTable);
        i = k;
        continue;
      }
    }

    outLines.push(raw);
    i++;
  }

  return outLines.join("\n");
}

/**
 * Converts typewriter space-aligned Credit Portfolio Integrity Checks into a clean GFM pipe table.
 */
export function formatIntegrityCheckMatrix(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const outLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trim = raw.trim();

    if (/(?:CREDIT\s*PORTFOLIO\s*INTEGRITY\s*CHECK|FINTECH\s*CREDIT\s*PORTFOLIO|PORTFOLIO\s*INTEGRITY\s*CHECK)/i.test(trim)) {
      const headerTitle = trim.replace(/^#{1,4}\s*/, '').trim();

      let k = i + 1;
      while (k < lines.length && !lines[k].trim()) k++;

      if (k < lines.length && /Metric\s*Description/i.test(lines[k])) {
        k++; // skip table header line
        const rows: Array<{ metric: string; val: string; threshold: string; finding: string }> = [];

        while (k < lines.length) {
          const l = lines[k].trim();
          if (!l) {
            k++;
            continue;
          }
          if (l.startsWith('#') || l.startsWith('---') || /^\d+\.\s+[A-Z]/.test(l)) {
            break;
          }

          const parts = l.split(/\s{2,}|\t+/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 3) {
            const metric = parts[0];
            const val = parts[1];
            let threshold = parts.length >= 4 ? parts[2] : '-';
            let finding = parts[parts.length - 1];

            if (/PASS/i.test(finding)) {
              const note = finding.replace(/[\uFE0F🟢🔴🟡\?]/g, '').replace(/\bPASS\b/gi, '').trim();
              finding = note ? `PASS ${note}` : 'PASS';
            } else if (/FLAG|BREACH|FAIL/i.test(finding)) {
              const note = finding.replace(/[\uFE0F🟢🔴🟡\?]/g, '').replace(/\b(?:FLAG|BREACH|FAIL)\b/gi, '').trim();
              finding = note ? `FLAG ${note}` : 'FLAG';
            }

            rows.push({ metric, val, threshold, finding });
          }
          k++;
        }

        if (rows.length >= 3) {
          let mdTable = `\n### ${headerTitle}\n\n`;
          mdTable += `| Metric Description | Calculated Value | Benchmark Threshold | Audit Finding |\n`;
          mdTable += `| :--- | :---: | :---: | :---: |\n`;
          for (const r of rows) {
            mdTable += `| **${r.metric}** | ${r.val} | ${r.threshold} | ${r.finding} |\n`;
          }
          mdTable += `\n`;
          outLines.push(mdTable);
          i = k;
          continue;
        }
      }
    }

    outLines.push(raw);
    i++;
  }

  return outLines.join('\n');
}

/**
 * Transforms typewriter ASCII hash-bars ([#####]) and progress bars into clean GFM pipe tables
 * or elegant bullet lists, completely stripping typewriter artifacts.
 */
export function formatAsciiBarCharts(markdown: string): string {
  // Convert standalone bar prefixes [████] to clean bullet points
  markdown = markdown.replace(/^(\s*)\[\s*[#█▓▒░=-]{2,}\s*[#█▓▒░=\s-]*\]\s*/gm, "$1* ");

  const lines = markdown.split(/\r?\n/);
  const outLines: string[] = [];
  let i = 0;

  const isBarToken = (s: string) => /\[\s*[#█▓▒░=-]{2,}\s*[#█▓▒░=\s-]*\]/.test(s) || /\[\s*#+\s*\]/.test(s);

  while (i < lines.length) {
    const raw = lines[i];
    const trim = raw.trim();

    const hasHashBar = isBarToken(trim);
    const hasEmptyBar = /\[\s*\]/.test(trim);

    if (hasHashBar || (hasEmptyBar && i + 1 < lines.length && isBarToken(lines[i + 1]))) {
      let title = '';
      if (outLines.length > 0) {
        const prev = outLines[outLines.length - 1].trim();
        if (prev && !prev.startsWith('|') && !prev.startsWith('#') && !prev.startsWith('*') && prev.length < 120) {
          title = outLines.pop()!.trim();
        } else if (outLines.length > 1 && !prev) {
          const prev2 = outLines[outLines.length - 2].trim();
          if (prev2 && !prev2.startsWith('|') && !prev2.startsWith('#') && !prev2.startsWith('*') && prev2.length < 120) {
            outLines.pop();
            title = outLines.pop()!.trim();
          }
        }
      }

      const blockLines: string[] = [];
      let k = i;
      while (k < lines.length) {
        const l = lines[k].trim();
        if (!l) {
          if (k + 1 < lines.length && (isBarToken(lines[k + 1]) || /\[\s*\]/.test(lines[k + 1]))) {
            k++;
            continue;
          }
          break;
        }
        if (isBarToken(l) || /\[\s*\]/.test(l) || /^[A-Za-z0-9\s\(\)\-\,\.\/]+\s*:\s*\[/.test(l)) {
          blockLines.push(l);
          k++;
        } else {
          break;
        }
      }

      // Case 1: Historical Trajectory (Q2 2017: [##] $165.6M)
      if (blockLines.some(l => /^(?:Q\d|\d{4}|TTM|FY\d{2})/i.test(l))) {
        let md = '';
        if (title) {
          const cleanTitle = title.replace(/[:\s]+$/, '');
          md += `\n##### ${cleanTitle}\n\n`;
        }
        for (const line of blockLines) {
          const m = line.match(/^([^:\[]+):?\s*\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]\s*(.*)$/);
          if (m) {
            const period = m[1].trim();
            const val = m[2].trim();
            md += `* **${period}:** ${val}\n`;
          } else {
            md += `* ${line.replace(/\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]/g, '').trim()}\n`;
          }
        }
        md += '\n';
        outLines.push(md);
        i = k;
        continue;
      }

      // Case 2: Segment Direct Contribution (Argentina [###] $1,230M (41.7% of total))
      if (blockLines.some(l => /\(\s*\d+(?:\.\d+)?%\s*(?:of\s*total)?\)/i.test(l))) {
        let md = '';
        if (title) {
          const cleanTitle = title.replace(/[:\s]+$/, '');
          md += `\n##### ${cleanTitle}\n\n`;
        }
        md += `| Operating Segment | Direct Contribution ($M) | % of Total Contribution |\n`;
        md += `| :--- | :---: | :---: |\n`;
        for (const line of blockLines) {
          const segMatch = line.match(/^([^\[]+)\s*\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]\s*\$?([0-9,]+(?:\.[0-9]+)?M?)\s*\((.*?)\)/i);
          if (segMatch) {
            const seg = segMatch[1].trim();
            const amount = segMatch[2].startsWith('$') ? segMatch[2] : `$${segMatch[2]}`;
            const pct = segMatch[3].replace(/of\s*total/i, '').trim();
            md += `| **${seg}** | ${amount} | ${pct} |\n`;
          } else {
            const fallback = line.replace(/\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]/g, '').trim();
            md += `| ${fallback} | - | - |\n`;
          }
        }
        md += '\n';
        outLines.push(md);
        i = k;
        continue;
      }

      // Case 3: Market Share Landscape (Company (...) [###] 30% - 33%)
      if (blockLines.some(l => /\d+%\s*-\s*\d+%/i.test(l) || /\d+%/i.test(l))) {
        let md = '';
        if (title) {
          const cleanTitle = title.replace(/[:\s]+$/, '');
          md += `\n##### ${cleanTitle}\n\n`;
        }
        md += `| Competitor / Retail Platform | Estimated GMV Market Share | Strategic Archetype |\n`;
        md += `| :--- | :---: | :--- |\n`;
        for (const line of blockLines) {
          const compMatch = line.match(/^([^\(\[]+)(?:\((.*?)\))?\s*\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]\s*(.*)$/);
          if (compMatch) {
            const name = compMatch[1].trim();
            const archetype = compMatch[2] ? compMatch[2].trim() : '-';
            const share = compMatch[3].trim();
            md += `| **${name}** | ${share} | ${archetype} |\n`;
          } else {
            const fallback = line.replace(/\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]/g, '').trim();
            md += `| ${fallback} | - | - |\n`;
          }
        }
        md += '\n';
        outLines.push(md);
        i = k;
        continue;
      }

      // Generic fallback
      if (title) outLines.push(title);
      for (const line of blockLines) {
        outLines.push(line.replace(/\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]/g, '').replace(/\s{2,}/g, ' ').trim());
      }
      i = k;
      continue;
    }

    outLines.push(raw);
    i++;
  }

  return outLines.join('\n').replace(/\[\s*[#█▓▒░=-]+\s*[#█▓▒░=\s-]*\]/g, '');
}

/**
 * Strips premature flywheel compounding loops generated in Part 1 or Part 2
 * before forensic and operational moat analysis is complete.
 * Converts premature flywheel loops in Section 1.1 into empirical business pillars.
 */
export function stripPrematureFlywheels(text: string): string {
  // Case 1: Premature dual-flywheel in Part 1/2 Section 1.1
  text = text.replace(
    /The core economic engine consists of two interlocking, self-funding flywheels:[\s\S]*?(?=\n\s*(?:#{1,6}\s+|(?:\d+\.|\*)\s*(?:The Value Delivery Mechanism|Value Delivery Mechanism|1\.1\.|\b1\.\s+The\b))|\n\n##\s+Part|$)/gi,
    `The core economic engine operates through interlocking operational pillars:

* **Core Platform & Logistics Network:** Infrastructure drives delivery friction lower, elevates customer conversion, and scales unit volume.
* **Proprietary Data Telemetry:** High-frequency transaction volume generates granular proprietary behavioral data for risk underwriting and resource allocation.
* **Capital Deployment & Ecosystem Financing:** Captive working capital and customer financing are embedded directly into checkout and service operations.
* **Transaction Rails & Float Management:** Retained customer deposit float and payment rails provide low-cost funding and frictionless settlement.
* **Shared Scale Economics:** Operating efficiencies are continuously reinvested into lower customer costs, automation, and expanding wallet share.\n\n`
  );

  text = text.replace(/\*\s*\*\*Widened Regional Scale Moat & Customer Lock-In\*\*[^\n]*/gi, "");

  return text;
}

/**
 * Normalizes single-pipe typewriter blocks, broken matrices, and missing table separators
 * into clean, standard GitHub-Flavored Markdown (GFM) pipe tables for Obsidian and web rendering.
 */
export function normalizeSinglePipeTables(md: string): string {
  // 1. Convert standalone RESULT lines
  md = md.replace(/^\|\s*RESULT:\s*(.*?)\s*\|\s*$/gim, "* **Strategic Result:** $1");

  // 2. Specific institutional matrices with single-column titles or collapsed headers
  // Dual-Core Engine header normalization (Generic institutional architecture)
  md = md.replace(/^\|\s*([A-Za-z0-9\s&\-\/()]+?\s+DUAL-CORE ENGINE)\s*\|\s*$/gim, (m, p1) => {
    const titleCased = p1.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()).replace(/Dual-Core Engine/i, "Dual-Core Architecture");
    return `### ${titleCased}`;
  });
  md = md.replace(/^#{1,4}\s*([A-Za-z0-9\s&\-\/()]+?\s+DUAL-CORE ENGINE)\s*$/gim, (m, p1) => {
    const titleCased = p1.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()).replace(/Dual-Core Engine/i, "Dual-Core Architecture");
    return `### ${titleCased}`;
  });

  // Contractual & Contingent Commitments table
  md = md.replace(
    /(\|\s*1\.\s*Operating Lease Liabilities[^\n]*\n)([\s\S]*?\|\s*TOTAL CONTRACTUAL & CONTINGENT ECONOMIC COMMITMENTS[^\n]*\|)/i,
    (match, p1, p2) => {
      let tbl = `| Contractual Commitment / Contingent Exposure | Economic Liability Amount ($M) |\n`;
      tbl += `| :--- | :---: |\n`;
      tbl += p1 + p2;
      return tbl;
    }
  );

  // Convert standalone single-column all-caps headers: | HEADER | -> ### Header
  md = md.replace(/^\|\s*([A-Z0-9\s\(\)\-–—&/:]{5,})\s*\|\s*$/gm, (match, title) => {
    return `\n### ${title.trim()}\n`;
  });

  // Generalized GFM table repair pass:
  // Find blocks of pipe lines that lack separator rows
  const lines = md.split(/\r?\n/);
  const outLines: string[] = [];
  let currentTable: string[] = [];

  const flushTable = () => {
    if (currentTable.length === 0) return;
    
    // Check if table has a separator row (| --- |)
    const hasSep = currentTable.some(l => /^\|[\s:\-]+(?:\|[\s:\-]+)*\|$/.test(l.trim()));
    if (!hasSep && currentTable.length >= 2) {
      // First line is header
      const headerLine = currentTable[0];
      const colCount = (headerLine.match(/\|/g) || []).length - 1;
      if (colCount >= 2) {
        const sep = `| ${Array(colCount).fill(":---").join(" | ")} |`;
        outLines.push(headerLine);
        outLines.push(sep);
        for (let j = 1; j < currentTable.length; j++) {
          outLines.push(currentTable[j]);
        }
        currentTable = [];
        return;
      }
    }
    
    // Otherwise push as-is
    for (const l of currentTable) {
      outLines.push(l);
    }
    currentTable = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trim = line.trim();
    if (trim.startsWith("|") && trim.endsWith("|")) {
      currentTable.push(line);
    } else {
      flushTable();
      outLines.push(line);
    }
  }
  flushTable();

  return outLines.join("\n");
}

/**
 * Normalizes piped bullet items (* Col 1 │ Col 2 │ Col 3) and pseudo-box divider lines
 * into clean standard GitHub-Flavored Markdown (GFM) pipe tables.
 */
export function normalizePipedBullets(text: string): string {
  // Matches 2 or more contiguous lines that start with bullet points containing pipes or box characters,
  // or are pseudo-divider lines with box / pipe characters (e.g. * **───┼───** or ───┼───)
  const blockRegex = /((?:^\s*[\*\-•]\s*[^|\n│]+[|│][^\n]+\r?\n)(?:^\s*(?:[\*\-•]\s*)?(?:[^|\n│]+[|│][^\n]+|\*{0,2}[─\-+┼│|]{3,}\*{0,2})\r?\n?)+)/gm;
  return text.replace(blockRegex, (block) => {
    const rawLines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const validDataLines = rawLines.filter(l => !/^\*{0,2}[─\-+┼│|]{3,}\*{0,2}$/.test(l.replace(/^\s*[\*\-•]\s*/, '')));
    if (validDataLines.length < 2 || /(?:Gross Margin|EV\s*\/)/i.test(block)) return block;

    const splitCols = (line: string) => {
      const clean = line.replace(/^\s*[\*\-•]\s*/, '').replace(/^[│|]\s*/, '').replace(/\s*[│|]$/, '');
      return clean.split(/[│|]/).map(c => c.trim());
    };

    const firstRowCols = splitCols(validDataLines[0]);
    if (firstRowCols.length < 2) return block;

    let gfmTable = "\n\n";
    gfmTable += `| ${firstRowCols.join(" | ")} |\n`;
    const sep = firstRowCols.map((_, idx) => (idx === 0 ? ":---" : ":---:")).join(" | ");
    gfmTable += `| ${sep} |\n`;

    for (let r = 1; r < validDataLines.length; r++) {
      const cols = splitCols(validDataLines[r]);
      if (cols.length === 1 && cols[0] === '') continue;
      while (cols.length < firstRowCols.length) cols.push("-");
      gfmTable += `| ${cols.slice(0, firstRowCols.length).join(" | ")} |\n`;
    }
    gfmTable += "\n";
    return gfmTable;
  });
}

/**
 * Normalizes space-aligned Symmetrical Balance Sheet Synthesis blocks
 * into an authoritative GitHub-Flavored Markdown table.
 */
export function formatSymmetricalBalanceSheet(text: string): string {
  if (text.includes("| Off-Balance-Sheet Vector") || text.includes("| Valuation Spread ($M)")) {
    return text;
  }

  const targetRegex = /(?:#{1,5}\s*)?([^\n]*?SYMMETRICAL\s+BALANCE\s+SHEET\s+AUDIT[^\n]*)\n([\s\S]*?)(?=\n\s*#{1,5}\s+Audit\s+Verdict|\n\s*#####|\n\s*##\s+Part|$)/i;
  return text.replace(targetRegex, (match, _rawTitle, body) => {
    const lines = body.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 4) return match;

    const rows: { vector: string; impact: string; category: string }[] = [];
    let currentCategory = "Hidden Positive Asset";

    for (const line of lines) {
      if (/^Off-Balance-Sheet\s+Positive\s+Assets/i.test(line)) {
        currentCategory = "Hidden Positive Asset";
        continue;
      }
      if (/^Off-Balance-Sheet\s+Negative\s+Liabilities/i.test(line)) {
        currentCategory = "Hidden Toxic Liability";
        continue;
      }
      if (/^Total\s+Hidden\s+Off-Balance-Sheet\s+Assets/i.test(line)) {
        const valMatch = line.match(/:\s*([+\-$0-9.,]+(?:\s*(?:to|-)\s*[+\-$0-9.,]+)?[A-Z%]*)/i);
        rows.push({
          vector: "**Total Hidden Off-Balance-Sheet Assets**",
          impact: `**${valMatch ? valMatch[1].trim() : "See Footnote Reconciliation"}**`,
          category: "**Asset Subtotal**"
        });
        continue;
      }
      if (/^Total\s+Hidden\s+Off-Balance-Sheet\s+Liabilities/i.test(line)) {
        const valMatch = line.match(/:\s*([+\-$0-9.,]+(?:\s*(?:to|-)\s*[+\-$0-9.,]+)?[A-Z%]*)/i);
        rows.push({
          vector: "**Total Hidden Off-Balance-Sheet Liabilities**",
          impact: `**${valMatch ? valMatch[1].trim() : "See Footnote Reconciliation"}**`,
          category: "**Liability Subtotal**"
        });
        continue;
      }
      if (/^NET\s+HIDDEN\s+BALANCE\s+SHEET\s+POSITION/i.test(line)) {
        const valMatch = line.match(/:\s*(.*)$/);
        rows.push({
          vector: "**NET HIDDEN BALANCE SHEET POSITION**",
          impact: `**${valMatch ? valMatch[1].trim() : "STRUCTURALLY POSITIVE"}**`,
          category: "**Audit Finding**"
        });
        continue;
      }
      if (/^Net\s+Off-Balance-Sheet\s+Economic\s+Surplus/i.test(line)) {
        const valMatch = line.match(/:\s*([+\-$0-9.,]+(?:\s*(?:to|-)\s*[+\-$0-9.,]+)?[A-Z%]*)/i);
        rows.push({
          vector: "**Net Off-Balance-Sheet Economic Surplus**",
          impact: `**${valMatch ? valMatch[1].trim() : "See Footnote Reconciliation"}**`,
          category: "**Net Economic Spread**"
        });
        continue;
      }

      // Individual item line: e.g. "Undervalued Owned Real Estate (34.2K Permitted Acres): +150.0M to +200.0M"
      const itemMatch = line.replace(/^[•\-\*]\s*/, '').match(/^(.*?):\s*([+\-$0-9.,]+(?:\s*(?:to|-)\s*[+\-$0-9.,]+)?[A-Z%]*.*)$/);
      if (itemMatch) {
        rows.push({
          vector: itemMatch[1].trim(),
          impact: itemMatch[2].trim(),
          category: currentCategory
        });
      }
    }

    if (rows.length === 0) return match;

    let table = `\n##### Symmetrical Balance Sheet Audit: Net Hidden Position\n\n`;
    table += `| Off-Balance-Sheet Vector | Valuation Spread ($M) | Balance Sheet Impact |\n`;
    table += `| :--- | :---: | :---: |\n`;
    for (const r of rows) {
      table += `| ${r.vector} | ${r.impact} | ${r.category} |\n`;
    }
    table += `\n`;
    return table;
  });
}

/**
 * Normalizes space-aligned or typewriter preamble summary cards
 * (e.g. OPERATIONAL ENGINE & MARKET POSITION SUMMARY, PROBABILISTIC VALUATION ENGINE AUDIT, etc.)
 * into clean, responsive 4-column GitHub-Flavored Markdown tables.
 */
export function formatPreambleSummaryCards(text: string): string {
  const cardRegex = /(?:^[ \t]*)(OPERATIONAL\s+ENGINE\s*&\s*MARKET\s+POSITION\s+SUMMARY|CASH\s+FLOW\s+INTEGRITY\s*&\s*OWNER\s+EARNINGS\s+AUDIT[^\n]*|PROBABILISTIC\s+VALUATION\s+ENGINE\s*&\s*REVERSE\s+DCF\s+AUDIT|SOVEREIGN\s+VALUATION\s+SYNTHESIS\s*&\s*EXPECTATIONS\s+SPREAD\s+MATRIX)\s*\n([\s\S]*?)(?=\n\s*(?:#{1,5}\s+|\bPart\s+\d+:|\bStep\s+\d+:|\b1\.1\b|\n\n\n|$))/gim;

  return text.replace(cardRegex, (match, rawTitle, body) => {
    // If it's already a table, don't touch it
    if (body.includes("|") && body.includes("---")) return match;

    const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return match;

    // Collect key-value pairs
    const pairs: { key: string; val: string }[] = [];
    for (const line of lines) {
      // Split on 2 or more spaces or tabs where a second key begins
      const tokens = line.split(/(?<=[^\s:])\s{2,}(?=[A-Za-z0-9])/);
      for (const tok of tokens) {
        const colonIdx = tok.indexOf(":");
        if (colonIdx !== -1) {
          const k = tok.slice(0, colonIdx).trim();
          const v = tok.slice(colonIdx + 1).trim();
          if (k && v) {
            pairs.push({ key: k, val: v });
          }
        } else if (tok.trim()) {
          pairs.push({ key: "Note", val: tok.trim() });
        }
      }
    }

    if (pairs.length === 0) return match;

    const cleanTitle = rawTitle.trim();
    let table = `\n##### ${cleanTitle}\n\n`;
    table += `| Strategic Parameter | Audited Economic Anchor | Strategic Parameter | Audited Economic Anchor |\n`;
    table += `| :--- | :--- | :--- | :--- |\n`;

    for (let i = 0; i < pairs.length; i += 2) {
      const p1 = pairs[i];
      const p2 = pairs[i + 1] || { key: "", val: "" };
      const k1 = p1.key ? `**${p1.key}**` : "-";
      const v1 = p1.val || "-";
      const k2 = p2.key ? `**${p2.key}**` : "-";
      const v2 = p2.val || "-";
      table += `| ${k1} | ${v1} | ${k2} | ${v2} |\n`;
    }
    table += `\n`;
    return table;
  });
}

/**
 * Authoritative Dossier Format Guard.
 * Enforces the 5 Inviolable Formatting Laws across all exports:
 * 1. Zero Raw LaTeX Math (transforms TeX into clean plain text).
 * 2. Zero Monospace Typewriter Tables/Blocks (unwraps prose/tables from code blocks).
 * 3. Canonical Chapter Hierarchy (maps Step headers to Part X: titles).
 * 4. GFM Standard Pipe Tables.
 * 5. Flywheel flowcharts & formula cards.
 */
export function cleanMarkdownForRendering(markdown: string): string {
  if (!markdown) return "";

  let frontmatter = "";
  const fmMatch = markdown.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)/);
  if (fmMatch) {
    frontmatter = fmMatch[1];
    markdown = markdown.slice(frontmatter.length);
  }

  let text = markdown;

  // Pre-flight section headers snapshot for structural regression protection
  const preflightParts = Array.from(markdown.matchAll(/^(#{1,3}\s+Part\s+\d+:?[^\r\n]*)/gim)).map(m => m[1].trim());

  // Upgrade machine step headers (e.g. ## [Step 1 Output] or ## [Step 16: Forensic Audit]) to clean chapter titles
  text = text.replace(/^#{1,4}\s*\[Step\s*(\d+)(?::\s*[^\]]+|\s*Output)\][^\n]*/gim, (_, p1) => {
    const stepNum = parseInt(p1, 10);
    const title = STEP_CHAPTER_TITLES[stepNum] || `Part ${stepNum}: Step Analysis`;
    return `## ${title}`;
  });
  text = text.replace(/^#{1,4}\s*\[(?:Step\s*(\d+)|Step(\d+))\s*Output\][^\n]*/gim, (_, p1, p2) => {
    const stepNum = parseInt(p1 || p2, 10);
    const title = STEP_CHAPTER_TITLES[stepNum] || `Part ${stepNum}: Step Analysis`;
    return `## ${title}`;
  });

  // Upgrade raw "## Step 12:", "## Step 13:", or "## Step 16:" to clean "Part X:"
  text = text.replace(/^##\s*Step\s*(12|13|16):?\s*([^\r\n]*)/gim, (_, p1, p2) => {
    const stepNum = parseInt(p1, 10);
    const title = STEP_CHAPTER_TITLES[stepNum] || `Part ${stepNum}: ${p2.trim()}`;
    return `## ${title}`;
  });

  // Demote Competitor Moat & Valuation Radar if injected as top-level H2 inside Part 2
  text = text.replace(/^##\s+Competitor Moat & Valuation Radar/gim, "### Competitor Moat & Valuation Radar");
  text = text.replace(/^###\s+([1-4]\.\s+(?:Data Lineage|Archetype Comparative|Moat Leaderboard|Moat & Valuation))/gim, "#### $1");

  // Demote any stray H2 headings that are NOT Chapter Part titles to H3
  text = text.replace(/^##\s+(?!Part\s+\d+:)([^\r\n]+)/gim, "### $1");

  // Remove duplicate H3 headings that immediately echo the H2 Chapter Title
  text = text.replace(/^(##\s+Part\s+\d+:\s+([^\r\n]+))\r?\n{1,3}\s*###\s+(?:\d+(?:\.\d+)*\.?\s+)?\2\s*$/gim, "$1");
  text = text.replace(/^(##\s+Part\s+\d+:[^\r\n]+)\r?\n{1,3}\s*###\s+\d+\.\s+(?:(?:Greenwald|Net)?\s*Valuation\s+Part\s+\d+:\s+)?(?:Earnings\s+Power\s+Value\s+\(EPV\)|Net\s+Asset\s+Reproduction\s+Floor\s+\(ARV\))\s*$/gim, "$1");
  text = text.replace(/^(##\s+Part\s+\d+:[^\r\n]+)\r?\n{1,3}\s*###\s+\d+\.\s+The Valuation Ceiling & Forward-Looking Cash Flow Models\s*$/gim, "$1");
  text = text.replace(/^(##\s+Part\s+\d+:[^\r\n]+)\r?\n{1,3}\s*###\s+\d+\.\s+Red Team Attack:\s*The Forensic Short-Seller\s*$/gim, "$1");

  // Strip stray ### prepended to financial schedules or long analytical paragraphs
  text = text.replace(/^###\s+(GAAP Operating Cash Flow[^\r\n]*)/gim, "$1");
  text = text.replace(/^###\s+(\d+\.\s+(?:Balance Sheet Protection|Current Market Price)[^\r\n]{40,})/gim, "$1");

  // Execute line-by-line code fence unwrapping (obliterates all rogue code blocks while preserving Mermaid)
  text = unwrapNonMermaidCodeBlocks(text);

  // Strip premature flywheel loops in Part 1 or Part 2 before forensic and operational analysis
  text = stripPrematureFlywheels(text);

  // Strip rogue ASCII flowcharts, box characters, and premature flow lines
  text = stripAsciiFlowcharts(text);

  // Convert typewriter pseudo-reconciliation bridges into clean GFM pipe tables
  text = formatFinancialBridgeTables(text);

  // Convert Forensic Accounting typewriter matrix into clean GFM pipe table
  text = formatSchilitMatrix(text);

  // Convert Credit Portfolio Integrity Checks into clean GFM pipe table
  text = formatIntegrityCheckMatrix(text);

  // Convert typewriter ASCII hash-bars ([#####]) and progress bars into clean GFM pipe tables or lists
  text = formatAsciiBarCharts(text);

  // Normalize single-pipe blocks, pseudo-tables, and matrix outlines into clean GFM pipe tables
  text = normalizeSinglePipeTables(text);

  // Convert typewriter preamble summary cards into clean GFM pipe tables
  text = formatPreambleSummaryCards(text);

  // Convert typewriter Symmetrical Balance Sheet Synthesis into clean GFM pipe table
  text = formatSymmetricalBalanceSheet(text);

  // Strip accidental 4+ leading spaces that trigger unintended indented code blocks
  text = text.replace(/^[ ]{4,}(?=[A-Z0-9#\*\|])/gm, "");

  // Convert Section 1.7 / 9.8 Flywheel or Linear Value Chain to Obsidian Mermaid Flowchart
  const flywheelRegex = /(#{1,6}\s*(?:(?:1\.7|9\.8)\s+[^#\n]*?(?:Flywheel|Value\s*Chain|Compounding|Architecture)|Part\s*4\b[^#\n]*?(?:Flywheel|Value\s*Chain|Compounding)|[^#\n]*?Compounding\s*(?:Flywheel|Architecture)|[^#\n]*?Flywheel\s*Mechanics)[^\n]*\n)([\s\S]*?)(?=\n\*\s*\*?Confidence|\n---\s*\n\*\s*\(Section|\n##\s*(?:\[Step|Part\b)|$)/gi;
  text = text.replace(flywheelRegex, (sectionMatch, sectionHeader, sectionBody) => {
    const steps = parseFlywheelSteps(sectionBody);
    if (steps.length < 3) return sectionMatch;

    const isLinearValueChain = /no\s+organic\s+flywheel|linear\s+value\s+chain|cyclical\s+commodity|linear\s+project|no\s+flywheel/i.test(sectionHeader + " " + sectionBody.slice(0, 400));

    let mermaidGraph = "```mermaid\nflowchart TD\n";
    if (isLinearValueChain) {
      mermaidGraph += "    classDef default fill:#0b0e14,stroke:#0284c7,stroke-width:2px,color:#f8fafc,rx:8,ry:8;\n";
      mermaidGraph += "    classDef terminal fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#94a3b8,rx:8,ry:8;\n\n";

      steps.forEach((s, idx) => {
        const stageNum = s.number < 10 ? `0${s.number}` : `${s.number}`;
        const label = formatMermaidNode(stageNum, s.title, s.description);
        mermaidGraph += `    S${idx + 1}["${label}"]\n`;
      });

      for (let i = 0; i < steps.length - 1; i++) {
        mermaidGraph += `    S${i + 1} --> S${i + 2}\n`;
      }
      // Zero loopback arrow for audited linear value chains
      mermaidGraph += `\n    class ${steps.slice(0, -1).map((_, i) => `S${i + 1}`).join(",")} default;\n`;
      mermaidGraph += `    class S${steps.length} terminal;\n`;
      mermaidGraph += "```\n\n";
    } else {
      mermaidGraph += "    classDef default fill:#0b0e14,stroke:#10B981,stroke-width:2px,color:#f8fafc,rx:8,ry:8;\n";
      mermaidGraph += "    classDef highlight fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ffffff,rx:8,ry:8;\n\n";

      steps.forEach((s, idx) => {
        const stageNum = s.number < 10 ? `0${s.number}` : `${s.number}`;
        const label = formatMermaidNode(stageNum, s.title, s.description);
        mermaidGraph += `    S${idx + 1}["${label}"]\n`;
      });

      for (let i = 0; i < steps.length - 1; i++) {
        mermaidGraph += `    S${i + 1} --> S${i + 2}\n`;
      }
      mermaidGraph += `    S${steps.length} ==>|<b>Closed-Loop Compounding Reinvestment</b>| S1\n\n`;
      mermaidGraph += `    class ${steps.map((_, i) => `S${i + 1}`).join(",")} default;\n`;
      mermaidGraph += `    class S${steps.length} highlight;\n`;
      mermaidGraph += "```\n\n";
    }

    let replacement = `${sectionHeader.trim()}\n\n`;
    const tickerMatch = text.match(/# Valuation Analysis:\s*([A-Z0-9.-]+)/i) ||
      text.match(/(?:\*{0,2}(?:Company|Ticker)[:\s]*\*{0,2})[:\-]?\s*(?:`|\*{1,2})?([A-Z0-9.-]+)/i);
    const ticker = tickerMatch ? (tickerMatch[1] || "").toUpperCase() : "COMPANY";
    
    if (isLinearValueChain) {
      replacement += `> [!NOTE] **${ticker} Linear Value Chain Architecture (Audited: No Organic Flywheel)**\n> Factual project lifecycle and discretionary capital allocation model generated dynamically from verified filings.\n\n`;
      replacement += `${mermaidGraph}\n`;
      replacement += `##### Linear Value Chain Walkthrough\n`;
    } else {
      replacement += `> [!NOTE] **${ticker} Compounding Architecture**\n> Interactive flowchart model generated dynamically from verified filings.\n\n`;
      replacement += `${mermaidGraph}\n`;
      replacement += `##### Flywheel Mechanics Walkthrough\n`;
    }

    steps.forEach(s => {
      const cleanTitle = s.title.replace(/[:\-]+$/, "").trim();
      replacement += `${s.number}. **${cleanTitle}:** ${s.description}\n`;
    });
    replacement += "\n";
    return replacement;
  });
  text = text.replace(/([^\n])\s*(#{1,6}\s+(?:\[Step|Part\b|\d+\.))/g, "$1\n\n$2");
  text = text.replace(/\\\[\s*/g, "");
  text = text.replace(/\s*\\\]/g, "");
  text = text.replace(/\\begin\{aligned\}/g, "");
  text = text.replace(/\\end\{aligned\}/g, "");
  text = text.replace(/\\begin\{matrix\}/g, "");
  text = text.replace(/\\end\{matrix\}/g, "");
  text = text.replace(/\\begin\{array\}/g, "");
  text = text.replace(/\\end\{array\}/g, "");
  text = text.replace(/\\hline/g, "");

  // Clean LaTeX thousands separator and formatting artifacts
  text = text.replace(/\{,\}/g, ",");
  text = text.replace(/\\Delta\b/g, "Δ");
  text = text.replace(/\\quad\b/g, " ");
  text = text.replace(/\\qquad\b/g, "  ");
  text = text.replace(/\\&/g, "&");
  text = text.replace(/\\%/g, "%");
  text = text.replace(/\\(\$)/g, () => "$");

  // Clean mathematical operators and font commands
  text = text.replace(/\\times/g, "×");
  text = text.replace(/\\approx/g, "≈");
  text = text.replace(/\\le\b/g, "≤");
  text = text.replace(/\\ge\b/g, "≥");
  text = text.replace(/\\pm\b/g, "±");
  text = text.replace(/\\cdot/g, "·");
  text = text.replace(/\\sqrt\{([^{}]*)\}/g, "√($1)");
  text = text.replace(/\\left\(/g, "(");
  text = text.replace(/\\right\)/g, ")");
  text = text.replace(/\\left\[/g, "[");
  text = text.replace(/\\right\]/g, "]");

  // Unwrap LaTeX font & text commands globally
  text = text.replace(/\\textbf\{([^{}]*)\}/g, (_, p) => `**${p}**`);
  text = text.replace(/\\mathbf\{([^{}]*)\}/g, (_, p) => `**${p}**`);
  text = text.replace(/\\text\{([^{}]*)\}/g, (_, p) => p);
  text = text.replace(/\\mathrm\{([^{}]*)\}/g, (_, p) => p);
  text = text.replace(/\\mathit\{([^{}]*)\}/g, (_, p) => `*${p}*`);
  text = text.replace(/\\underline\{([^{}]*)\}/g, (_, p) => p);

  // Clean subscripts like RORC_{Operating} -> RORC (Operating)
  text = text.replace(/([a-zA-Z0-9]+)_\{([^{}]*)\}/g, "$1 ($2)");
  text = text.replace(/_\{([^{}]*)\}/g, " ($1)");

  // Robust fraction solver loop with nested brace support (e.g. \frac{8,268.238M}{1.10^{10}})
  let fracIter = 0;
  while (/\\frac\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{((?:[^{}]|\{[^{}]*\})*)\}/.test(text) && fracIter < 10) {
    text = text.replace(/\\frac\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g, "($1 / $2)");
    fracIter++;
  }

  // Clean exponent braces e.g. 1.10^{10} -> 1.10^10
  text = text.replace(/\^\{([^{}]*)\}/g, "^$1");

  // Unwrap display math $$...$$ and convert into clean equation callout
  text = text.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_match, formula) => {
    let clean = formula.trim();
    clean = clean.replace(/\{,\}/g, ",");
    clean = clean.replace(/\\textbf\{([^{}]*)\}/g, (_, p) => `**${p}**`);
    clean = clean.replace(/\\mathbf\{([^{}]*)\}/g, (_, p) => `**${p}**`);
    clean = clean.replace(/\\text\{([^{}]*)\}/g, (_, p) => p);
    clean = clean.replace(/\\mathrm\{([^{}]*)\}/g, (_, p) => p);
    clean = clean.replace(/\\times/g, "×");
    clean = clean.replace(/\\cdot/g, "·");
    clean = clean.replace(/\\Delta\b/g, "Δ");
    clean = clean.replace(/\\quad\b/g, " ");
    clean = clean.replace(/\\qquad\b/g, "  ");
    clean = clean.replace(/\\&/g, "&");
    clean = clean.replace(/\\frac\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, n, d) => `(${n.trim()} / ${d.trim()})`);
    clean = clean.replace(/\^\{([^{}]*)\}/g, "^$1");
    clean = clean.replace(/\\(\$)/g, () => "$");
    clean = clean.replace(/\\(%)/g, () => "%");
    clean = clean.replace(/\$\s*$/, "");
    return `\n> **Formula / Calculation:** ${clean}\n`;
  });

  // Clean inline math variable markers ($b$) -> (b)
  text = text.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)\$/g, "$1");

  // Clean inline math blocks with operators that break KaTeX
  text = text.replace(/\$([^$\n]+)\$/g, (m, inner) => {
    if (/^\s*[\$€£]?\s*[\d,]+(\.\d+)?(M|B|k)?\s*$/i.test(inner)) {
      return `$${inner.replace(/[\$]/g, "").trim()}`;
    }
    if (inner.includes("=") || inner.includes("×") || inner.includes("/") || inner.includes("+") || inner.includes("-")) {
      return inner.trim();
    }
    return m;
  });

  // Clean +---+---+ ASCII box tables into clean standard GFM pipe tables
  text = text.replace(/(?:^|\n)\+[-+]+\r?\n([\s\S]*?)\+[-+]+\r?\n/g, (match, body) => {
    const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const tableRows: string[] = [];
    for (const line of lines) {
      if (/^\+[-+]+\+?$/.test(line)) continue;
      if (line.startsWith("|") && line.endsWith("|")) {
        tableRows.push(line);
      }
    }
    if (tableRows.length > 0) {
      return "\n" + tableRows.join("\n") + "\n\n";
    }
    return match;
  });

  // 1. Convert Competitor Radar bullet points into a clean GFM pipe table
  const radarBlockRegex = /((?:^\s*[\*\-•]\s*[^\n]*?(?:Gross Margin|EV\s*\/)[^\n]*?\|[^\n]*\r?\n?){2,})/im;
  text = text.replace(radarBlockRegex, (match) => {
    const lines = match.trim().split(/\r?\n/).filter(l => /^\s*[\*\-•]/.test(l));
    if (lines.length < 2) return match;

    let table = "\n\n| Competitor / Peer | Gross Margin | Operating Margin | ROIC | EV / True FCF | EV / Owner Earnings | Net Cash / Mkt Cap |\n";
    table += "| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n";

    for (const line of lines) {
      const metricStartIdx = line.search(/(?:Gross Margin|EV\s*\/)/i);
      if (metricStartIdx === -1) continue;

      let peerName = line.slice(0, metricStartIdx).replace(/^\s*[\*\-•]\s*/, '').replace(/[:*`]/g, '').trim();
      const metricsStr = line.slice(metricStartIdx);
      const pipeParts = metricsStr.split('|').map(p => p.trim());

      const getVal = (pattern: RegExp) => {
        const found = pipeParts.find(p => pattern.test(p));
        if (!found) return '-';
        const cIdx = found.indexOf(':');
        return cIdx !== -1 ? found.slice(cIdx + 1).replace(/\*\*/g, '').trim() : found.replace(/\*\*/g, '').trim();
      };

      const gm = getVal(/Gross Margin/i);
      const opm = getVal(/Operating Margin|Op Margin/i);
      const roic = getVal(/ROIC/i);
      const fcf = getVal(/EV\s*\/\s*True FCF/i);
      const oe = getVal(/EV\s*\/\s*Owner Earnings/i);
      const cash = getVal(/Net Cash\s*\/\s*Mkt Cap/i);

      table += `| **${peerName}** | ${gm} | ${opm} | ${roic} | ${fcf} | ${oe} | ${cash} |\n`;
    }
    table += "\n";
    return table;
  });

  // 1b. Normalize piped bullet items (* Col 1 │ Col 2 │ Col 3) into clean GFM pipe tables
  text = normalizePipedBullets(text);

  // 2. Normalize 10-Year DCF Scenario Box lines with Unicode │ into a clean GFM pipe table
  const dcfBoxRegex = /(?:^[│]\s*Conservative Case\s*:\s*\$[0-9,.]+[^\n]*?[│]\s*\r?\n^[│]\s*Base Case\s*:\s*\$[0-9,.]+[^\n]*?[│]\s*\r?\n^[│]\s*Optimistic Case\s*:\s*\$[0-9,.]+[^\n]*?[│](?:\s*\r?\n^[│]\s*Current Tape[^\n]*?[│])?)/im;
  text = text.replace(dcfBoxRegex, (match) => {
    const boxLines = match.split(/\r?\n/).map(l => l.replace(/^[│]\s*/, '').replace(/\s*[│]$/, '').trim()).filter(Boolean);
    let table = "\n\n| Valuation Scenario | Per Diluted Share Value & Market Variance |\n";
    table += "| :--- | :---: |\n";
    for (const bLine of boxLines) {
      const parts = bLine.split(/\s*:\s*/);
      const name = parts[0].trim();
      const val = parts.slice(1).join(' : ').trim();
      table += `| **${name}** | ${val} |\n`;
    }
    table += "\n";
    return table;
  });

  // 3. Normalize Peter Lynch Archetype Continuum ASCII into a clean GFM table
  const lynchBlockRegex = /(?:\*?\s*\*\*Peter Lynch Archetype Continuum\*\*\r?\n)?Slow Grower\s*[─—–\-]+\s*Stalwart[^\n]+Turnaround\r?\n(?:\s*└──>[^\n]*\r?\n)?(?:\s+[A-Za-z0-9][^\n]*\r?\n)*/i;
  text = text.replace(lynchBlockRegex, (match) => {
    const activeMatch = match.match(/\[([A-Za-z\s]+)\]/);
    if (!activeMatch) return match; // Guardrail: Must have genuine bracketed archetype; never assume default
    const activeType = activeMatch[1].trim();
    const topMatch = match.match(/Top-Line:\s*([^\n]+)/i);
    const opMatch = match.match(/Operating Margin:\s*([^\n]+)/i);
    const roicMatch = match.match(/ROIC:\s*([^\n]+)/i);
    const details = [
      topMatch ? `Top-Line: ${topMatch[1].trim()}` : '',
      opMatch ? `Operating Margin: ${opMatch[1].trim()}` : '',
      roicMatch ? `ROIC: ${roicMatch[1].trim()}` : ''
    ].filter(Boolean).join(' • ');

    let tbl = "\n\n| Peter Lynch Archetype | Classification Status | Empirical Operational Validation |\n";
    tbl += "| :--- | :---: | :--- |\n";
    tbl += `| **${activeType}** | **ACTIVE ARCHETYPE** | ${details || 'Audited against trailing financial filings'} |\n\n`;
    return tbl;
  });

  // 4. Normalize Target Buy Price Band ASCII sliders into a clean GFM table
  // Bound strictly to a single line or adjacent 2 lines (never cross blank lines, paragraphs, or section headings)
  const spectrumRegex = /(?:^[^\n]*\$[0-9,.]+\s*[─—–\-]+[^\n]*?\[\$?[0-9,.]+(?:\s*-\s*\$?[0-9,.]+)?\][^\n]*(?:\r?\n[^\n]*(?:Current Market|\(0%\s*MoS[^\)]*\)|Fair Value)[^\n]*)?)/gim;
  text = text.replace(spectrumRegex, (match) => {
    // Only proceed if match actually contains multiple bracketed prices and slider arrows/dashes
    if (!/[─—–\->]{2,}/.test(match)) return match;
    const bracketPrices = Array.from(match.matchAll(/\[\$?([0-9,.]+(?:\s*-\s*\$?[0-9,.]+)?)]/g)).map(m => m[1]);
    if (bracketPrices.length < 3) return match; // Guardrail: Must have at least 3 genuine parsed prices; never inject synthetic defaults

    const scream = bracketPrices[0];
    const target = bracketPrices[1];
    const fair = bracketPrices[2];
    const market = bracketPrices[3] || 'N/A';

    let tbl = "\n\n| Target Buy Price Band | Price Range ($) | Margin of Safety Discount | Allocation Directive |\n";
    tbl += "| :--- | :---: | :---: | :--- |\n";
    tbl += `| **Screaming Buy** | $${scream.replace(/\$/g, '')} | 35% - 50% MoS | Aggressive Tranche 2 Value Accumulation |\n`;
    tbl += `| **Target Buy** | $${target.replace(/\$/g, '')} | 15% - 25% MoS | Initial Tranche 1 Capital Entry |\n`;
    tbl += `| **Fair Value** | $${fair.replace(/\$/g, '')} | 0% MoS | Synthesized Intrinsic Value Ceiling |\n`;
    tbl += `| **Current Market Tape** | ${market === 'N/A' ? 'N/A' : '$' + market.replace(/\$/g, '')} | Speculative Premium | PASS / No Allocation |\n\n`;
    return tbl;
  });

  // 5. Normalize Definitive Verdict Plain Text Block into a clean GFM table
  const verdictRegex = /FINAL PORTFOLIO ACTION DIRECTIVE:\s*([A-Z]+)\s*\r?\n\s*TICKER:\s*([A-Z]+)\s*\r?\n\s*MARKET PRICE:\s*\$([0-9,.]+)\s*\r?\n\s*SYNTHESIZED INTRINSIC VALUE:\s*\$([0-9,.]+)\s*\r?\n\s*STANDARD MARGIN OF SAFETY:\s*([^\n]+)\s*\r?\n\s*DECISION:\s*([^\n]+)/i;
  text = text.replace(verdictRegex, (_match, _dir, tick, mp, iv, mos, dec) => {
    let tbl = "\n\n| Decision Parameter | Audited Portfolio Verdict |\n";
    tbl += "| :--- | :---: |\n";
    tbl += `| **Ticker** | \`${tick}\` |\n`;
    tbl += `| **Market Tape Price** | $${mp} |\n`;
    tbl += `| **Synthesized Intrinsic Value** | $${iv} |\n`;
    tbl += `| **Standard Margin of Safety** | ${mos.trim()} |\n`;
    tbl += `| **Final Portfolio Action Directive** | **${dec.trim()}** |\n\n`;
    return tbl;
  });

  // 6. Normalize Valuation Triad Spread Ladder with │ into a clean GFM table
  // Bound strictly to a single contiguous block (never cross markdown headers ## or multiple blank lines)
  const ladderRegex = /(?:Market Price Tape\s*:\s*\$[0-9,.]+(?:(?!\r?\n\s*\r?\n\s*\r?\n|\r?\n#{1,3}\s)[\s\S])*?(?:Asset Reproduction Floor|Zero-Growth Earnings Power Value|Earnings Power Value \(EPV\)|EPV Floor)\s*:\s*\$[0-9,.]+)/i;
  text = text.replace(ladderRegex, (match) => {
    if (!match.includes('│')) return match;
    const lLines = match.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let tbl = "\n\n| Valuation Triad Layer | Value Per Diluted Share | Valuation Spread & Margin Layer |\n";
    tbl += "| :--- | :---: | :--- |\n";
    let currentSpread = '';
    for (const lLine of lLines) {
      if (lLine.includes('│')) {
        currentSpread = lLine.replace(/^[│\s]+/, '').replace(/[│\s]+$/, '').trim();
        continue;
      }
      const parts = lLine.split(/\s*:\s*/);
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const val = parts.slice(1).join(' : ').trim();
        tbl += `| **${name}** | ${val} | ${currentSpread || '-'} |\n`;
        currentSpread = '';
      }
    }
    tbl += "\n";
    return tbl;
  });

  // 7. Normalize tree branch ASCII characters (├──, └──, ├─, └─) into clean Markdown bullet points
  text = text.replace(/^(\s*)(?:[\*\-•]\s*)?[├└][─\-]{1,2}\s*(.*?)$/gm, (_m, indent, content) => {
    let cleanContent = content.trim();
    cleanContent = cleanContent.replace(/\s*(?:──>|-->|─>)\s*/g, " ➔ ");
    if (cleanContent.includes(':')) {
      const idx = cleanContent.indexOf(':');
      const k = cleanContent.slice(0, idx).replace(/\*\*/g, '').trim();
      const v = cleanContent.slice(idx + 1).trim();
      return `${indent}  * **${k}:** ${v}`;
    }
    return `${indent}  * **${cleanContent}**`;
  });

  // 7b. Normalize sub-notes under tree branches with │ into clean sub-bullets
  text = text.replace(/^(\s*)│\s*(\([^\n]+\))/gm, '$1    * $2');

  // 8. Normalize standalone box lines (│ ... │) into clean bullet points
  text = text.replace(/^│\s*(.*?)\s*│$/gm, (_m, content) => {
    const t = content.trim();
    if (!t || /^[-=─]+$/.test(t)) return '';
    return `*   ${t}`;
  });

  // 8b. Strip isolated box/pipe pseudo-divider lines (e.g. * **───┼───** or ───┼─── or * **───────┤**)
  text = text.replace(/^\s*(?:[\*\-•]\s*)?\*{0,2}[─\-+┼│|├┤┬┴┌┐└┘║═╦╩╬]{3,}\*{0,2}\s*$/gm, "");

  // 9. Normalize Competitor Lead Metric Arrows (──> or ─>) into a clean GFM table
  const peerLeadBlockRegex = /((?:^[A-Za-z\s]+:\s*[^\n─>]+?\s*(?:──>|-->|─>)\s*[^\n]+\r?\n?){2,})/im;
  text = text.replace(peerLeadBlockRegex, (match) => {
    const arrowLines = match.trim().split(/\r?\n/).filter(Boolean);
    let tbl = "\n\n| Operating Metric | Target vs. Peer Median Benchmark | Relative Peer Standing & Lead |\n";
    tbl += "| :--- | :---: | :--- |\n";
    for (const aLine of arrowLines) {
      const arrowMatch = aLine.match(/^([^:]+):\s*(.*?)\s*(?:──>|-->|─>)\s*(.*)$/);
      if (arrowMatch) {
        tbl += `| **${arrowMatch[1].trim()}** | ${arrowMatch[2].trim()} | ${arrowMatch[3].trim()} |\n`;
      }
    }
    tbl += "\n";
    return tbl;
  });

  // 10. Scrub Academic / Creator Names into Audited Desk Terminology
  text = text
    .replace(/\bGraham-Buffett-Greenwald Framework\b/gi, 'Proprietary Valuation Triad')
    .replace(/\bGraham-Buffett-Greenwald\b/gi, 'Proprietary Valuation Triad')
    .replace(/\bBruce Greenwald Framework\b/gi, 'Audited Valuation Framework')
    .replace(/\bBruce Greenwald's reproduction asset methodology\b/gi, "our desk's audited asset reproduction methodology")
    .replace(/\bBruce Greenwald’s reproduction asset methodology\b/gi, "our desk's audited asset reproduction methodology")
    .replace(/\bUnder Bruce Greenwald’s EPV formulation\b/gi, "Under our desk's Earnings Power Value (EPV) formulation")
    .replace(/\bUnder Bruce Greenwald's EPV formulation\b/gi, "Under our desk's Earnings Power Value (EPV) formulation")
    .replace(/\bBruce Greenwald’s EPV framework\b/gi, "our audited EPV framework")
    .replace(/\bBruce Greenwald's EPV framework\b/gi, "our audited EPV framework")
    .replace(/\bIn the analytical traditions of Bruce Greenwald and Warren Buffett\b/gi, "In our desk's audited value investing tradition")
    .replace(/\bIn the analytical tradition of Bruce Greenwald and Warren Buffett\b/gi, "In our desk's audited value investing tradition")
    .replace(/\bIn the analytical traditions of Bruce Greenwald\b/gi, "In our desk's audited value investing tradition")
    .replace(/\bIn the analytical tradition of Bruce Greenwald\b/gi, "In our desk's audited value investing tradition")
    .replace(/\bIn the institutional framework of Bruce Greenwald\b/gi, "In our desk's institutional valuation framework")
    .replace(/\bFollowing the frameworks of Bruce Greenwald, Warren Buffett, and Michael Mauboussin\b/gi, "Following our desk's audited multi-stage valuation framework")
    .replace(/\bFollowing the frameworks of Bruce Greenwald and Warren Buffett\b/gi, "Following our desk's audited multi-stage valuation framework")
    .replace(/\bMauboussin\/Greenwald CAP Derivation\b/gi, "Competitive Advantage Period (CAP) Derivation")
    .replace(/\bGreenwald Growth Multiplier\b/gi, "Franchise Growth Multiplier")
    .replace(/\bGreenwald formulation\b/gi, "audited desk formulation")
    .replace(/\bGreenwald protocol\b/gi, "audited desk protocol")
    .replace(/\bGreenwald Triad\b/gi, "Proprietary Valuation Triad")
    .replace(/\bGreenwald valuation triad\b/gi, "audited Valuation Triad")
    .replace(/\bGreenwald EPV\b/gi, "Earnings Power Value (EPV)")
    .replace(/\bGreenwald\/Buffett proxy\b/gi, "audited Owner Earnings proxy")
    .replace(/\bGreenwald\/Buffett protocol\b/gi, "audited Owner Earnings protocol")
    .replace(/\bCompustat \/ Mauboussin Database\b/gi, "Historical Corporate Longevity Database")
    .replace(/\bMauboussin \/ Credit Suisse base rate archives\b/gi, "Historical Corporate Longevity Base Rate Archives")
    .replace(/\bBruce Greenwald reproduction accounting standards\b/gi, "audited asset reproduction accounting standards")
    .replace(/\bBruce Greenwald’s core insight\b/gi, "Our core valuation insight")
    .replace(/\bBruce Greenwald's core insight\b/gi, "Our core valuation insight")
    .replace(/\bBruce Greenwald’s corporate finance framework\b/gi, "Our corporate finance framework")
    .replace(/\bBruce Greenwald's corporate finance framework\b/gi, "Our corporate finance framework")
    .replace(/\bBruce Greenwald and value investing framework\b/gi, "audited value investing framework")
    .replace(/\bEmulating the Bruce Greenwald framework\b/gi, "Executing our audited valuation framework")
    .replace(/\(Bruce Greenwald Framework\)/gi, "(Audited Valuation Framework)")
    .replace(/\bBruce Greenwald\b/gi, "the Valuation Triad Framework")
    .replace(/\bGreenwald\b/gi, "audited valuation")
    .replace(/\bMessod Beneish\b/gi, "audited forensic accounting")
    .replace(/\bBeneish M-Score\b/gi, "Earnings Manipulation Risk Index")
    .replace(/\bRichard Sloan\b/gi, "audited balance sheet analysis")
    .replace(/\bSloan Accrual Ratio\b/gi, "Balance Sheet Accrual Ratio")
    .replace(/\bHoward Schilit\b/gi, "financial forensics")
    .replace(/\bSchilit Forensics\b/gi, "Financial Shenanigans Forensic Audit")
    .replace(/\bMichael Mauboussin\b/gi, "institutional base rate analysis")
    .replace(/\bMauboussin\b/gi, "empirical base rate");

  // Convert typewriter border lines (====) into clean Markdown tables or sections
  text = text.replace(/^[=\-]{8,}$/gm, "");

  // Convert ASCII box borders (+-----+-----+) into clean GFM pipe tables
  const lines = text.split("\n");
  const cleanedLines: string[] = [];
  let inAsciiTable = false;
  let asciiTableRowCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (/^\+[-=+]+\+$/.test(trimmed)) {
      if (!inAsciiTable) {
        inAsciiTable = true;
        asciiTableRowCount = 0;
      } else if (asciiTableRowCount === 1) {
        const prevLine = cleanedLines[cleanedLines.length - 1] || "";
        const colCount = (prevLine.match(/\|/g) || []).length - 1;
        if (colCount > 0) {
          const sep = "|" + Array(colCount).fill(" --- |").join("");
          cleanedLines.push(sep);
        }
      }
      continue;
    }

    if (inAsciiTable) {
      if (trimmed.startsWith("|")) {
        asciiTableRowCount++;
        cleanedLines.push(trimmed);
      } else {
        inAsciiTable = false;
        asciiTableRowCount = 0;
        cleanedLines.push(rawLine);
      }
    } else {
      cleanedLines.push(rawLine);
    }
  }

  text = cleanedLines.join("\n");
  text = text.replace(/\n{4,}/g, "\n\n\n");

  // Post-flight section preservation guardrail:
  // A format normalizer must NEVER swallow or truncate any major dossier part
  const postflightParts = Array.from(text.matchAll(/^(#{1,3}\s+Part\s+\d+:?[^\r\n]*)/gim)).map(m => m[1].trim());
  if (preflightParts.length > postflightParts.length) {
    console.error(`[Dossier Format Guard Alert] Section heading loss detected! Pre: ${preflightParts.length}, Post: ${postflightParts.length}. Aborting destructive transformation to preserve document integrity.`);
    return frontmatter ? `${frontmatter}${markdown}` : markdown;
  }

  return frontmatter ? `${frontmatter}${text}` : text;
}

export interface CrosscheckVerdict {
  gatesPassed: number;
  totalGates: number;
  hasBreach: boolean;
  breaches: string[];
}

export function parseCrosscheckVerdict(text: string): CrosscheckVerdict {
  const totalGates = 5;
  const breaches: string[] = [];

  // Check for critical thesis-breaker markers
  const criticalMatches = text.match(/🔴\s*CRITICAL THESIS-BREAKER:[^\n]+/gi);
  if (criticalMatches) {
    for (const m of criticalMatches) {
      breaches.push(m.trim());
    }
  }

  const gateNames = [
    "Gate 0 (Pipeline Completeness)",
    "Gate 1 (Entity Integrity)",
    "Gate 2 (Portfolio Mandate)",
    "Gate 3 (Valuation Consistency)",
    "Gate 4 (Arithmetic Proof)"
  ];

  let gatesPassed = 0;
  for (let g = 0; g <= 4; g++) {
    const gateRegex = new RegExp(`Gate\\s*${g}[^\\n]*?(PASS|BREACH|FAIL)`, 'i');
    const match = text.match(gateRegex);
    if (match) {
      if (match[1].toUpperCase() === 'PASS') {
        gatesPassed++;
      } else {
        const breachMsg = `${gateNames[g]} BREACH`;
        if (!breaches.some(b => b.includes(`Gate ${g}`))) {
          breaches.push(breachMsg);
        }
      }
    } else {
      // Fallback check against executive summary lines
      if (g === 0 && /Pipeline Completeness:\s*\[?PASS/i.test(text)) gatesPassed++;
      else if (g === 1 && /Entity & Ticker Integrity:\s*\[?PASS/i.test(text)) gatesPassed++;
      else if (g === 2 && /Portfolio Mandate Alignment:\s*\[?PASS/i.test(text)) gatesPassed++;
      else if (g === 3 && /Cash-Flow Valuation Consistency:\s*\[?PASS/i.test(text)) gatesPassed++;
      else if (g === 4 && /Valuation Arithmetic & Bridge Integrity:\s*\[?PASS/i.test(text)) gatesPassed++;
      else {
        const hasGateBreach = new RegExp(`Gate\\s*${g}[^\\n]*?BREACH`, 'i').test(text);
        if (hasGateBreach) {
          breaches.push(`${gateNames[g]} BREACH`);
        } else {
          gatesPassed++;
        }
      }
    }
  }

  const hasCriticalStatus = /🔴\s*Critical Thesis-Breakers Detected/i.test(text) || breaches.length > 0;
  if (hasCriticalStatus && gatesPassed === 5) {
    gatesPassed = Math.max(0, 5 - breaches.length);
  }

  return {
    gatesPassed: Math.min(gatesPassed, totalGates),
    totalGates,
    hasBreach: hasCriticalStatus || breaches.length > 0 || gatesPassed < totalGates,
    breaches
  };
}


```

---

# SECTION 5: INGESTION DEFENSES & CURRENCY HARMONIZATION

## Source File: `src/documentGuard.ts`
```typescript
import { AuditCheck, DocumentIntegrityAudit, DocumentIntegrityReport, FileSubstanceIssue, FileSubstanceReport, SessionMode } from "./types.js";

/**
 * Universal Document Integrity Guard for Value Investing Terminal.
 * Audits uploaded, staged, and auto-ingested files to verify they strictly
 * belong to the target company (ticker/CIK/name) and target reporting period
 * (e.g. STRL Q2-26).
 */

export interface ParsedPeriod {
  quarter: "Q1" | "Q2" | "Q3" | "Q4" | "FY" | null;
  year: number | null;
  raw: string;
}

/**
 * Normalizes user and document period strings (e.g. 'Q2-26', 'Q2 2026', '2026-Q2', '2Q26', 'FY2025')
 */
export function parsePeriodString(periodStr: string | null | undefined): ParsedPeriod {
  if (!periodStr || !periodStr.trim()) {
    return { quarter: null, year: null, raw: "" };
  }

  const clean = periodStr.trim();
  let quarter: "Q1" | "Q2" | "Q3" | "Q4" | "FY" | null = null;
  let year: number | null = null;

  // Check for quarter (Q1-Q4)
  const qMatch = clean.match(/(?:Q([1-4])|([1-4])Q)/i);
  if (qMatch) {
    const qNum = qMatch[1] || qMatch[2];
    quarter = `Q${qNum}` as "Q1" | "Q2" | "Q3" | "Q4";
  } else if (/annual|10-k|20-f|40-f|fiscal\s*year|fy/i.test(clean)) {
    quarter = "FY";
  }

  // Check for 4-digit year (e.g. 2026, FY2025) or 2-digit year (e.g. 26, FY25)
  const year4Match = clean.match(/(?:^|\D)(20\d{2}|19\d{2})(?:\D|$)/);
  if (year4Match) {
    year = parseInt(year4Match[1], 10);
  } else {
    // Check for 2-digit year after Q, FY, dash, slash or space, e.g. Q2-26, FY25, Q2'26, 26
    const year2Match = clean.match(/(?:[Q\-_\s/'’]|FY|^)(\d{2})(?:\D|$)/i);
    if (year2Match) {
      const y2 = parseInt(year2Match[1], 10);
      if (y2 >= 0 && y2 <= 99) {
        year = y2 < 70 ? 2000 + y2 : 1900 + y2;
      }
    }
  }

  return { quarter, year, raw: clean };
}

export function formatNormalizedPeriod(parsed: ParsedPeriod): string {
  if (!parsed.year && !parsed.quarter) return parsed.raw || "Unknown Period";
  if (parsed.quarter && parsed.year) {
    return `${parsed.quarter} ${parsed.year}`;
  }
  if (parsed.quarter) return parsed.quarter;
  return String(parsed.year);
}

/**
 * Checks whether newer is exactly 1 sequential quarter ahead of older.
 * E.g., Q2 2026 -> Q3 2026 (true), Q4 2025 -> Q1 2026 (true).
 */
/**
 * Checks whether a collection of staged files represents an interim earnings release session
 * (i.e. Form 8-K Item 2.02 is staged or Transcript is 1 sequential quarter ahead of Form 10-Q).
 */
export function isInterimEarningsRelease(files?: { name: string; auditCategory?: string; category?: string }[]): boolean {
  if (!files || files.length === 0) return false;

  const has8KEarnings = files.some(f => {
    const fn = (f.name || "").toLowerCase();
    return fn.includes("8-k") && (fn.includes("item2.02") || fn.includes("item 2.02") || fn.includes("earnings") || fn.includes("release"));
  });

  const qDoc = files.find(f => f.auditCategory === "10-Q" || f.category === "10-Q" || /10-?q/i.test(f.name));
  const trDoc = files.find(f => f.auditCategory === "Transcript" || f.category === "Transcript" || /transcript|call/i.test(f.name));

  let isTranscriptAhead = false;
  if (qDoc && trDoc) {
    const qPeriod = parsePeriodString(qDoc.name);
    const trPeriod = parsePeriodString(trDoc.name);
    if (qPeriod.quarter && trPeriod.quarter && isSequentialQuarterAhead(formatNormalizedPeriod(qPeriod), formatNormalizedPeriod(trPeriod))) {
      isTranscriptAhead = true;
    }
  }

  return has8KEarnings || isTranscriptAhead;
}

export function isSequentialQuarterAhead(olderStr?: string | null, newerStr?: string | null): boolean {
  if (!olderStr || !newerStr) return false;
  const pOlder = parsePeriodString(olderStr);
  const pNewer = parsePeriodString(newerStr);
  if (!pOlder.quarter || !pNewer.quarter || !pOlder.year || !pNewer.year) return false;
  
  const qOrder = ["Q1", "Q2", "Q3", "Q4"];
  const oldIdx = qOrder.indexOf(pOlder.quarter);
  const newIdx = qOrder.indexOf(pNewer.quarter);
  if (oldIdx === -1 || newIdx === -1) return false;

  if (oldIdx === 3 && newIdx === 0) {
    return pNewer.year === pOlder.year + 1;
  }
  return newIdx === oldIdx + 1 && pNewer.year === pOlder.year;
}

/**
 * Checks if two periods match. Handles FY comparison for annual reports.
 */
export function isPeriodMatch(
  detected: ParsedPeriod,
  target: ParsedPeriod,
  category?: string
): { isMatch: boolean; reason?: string } {
  if (!target.year && !target.quarter) {
    return { isMatch: true }; // Target unspecified
  }

  if (!detected.year && !detected.quarter) {
    return { isMatch: false, reason: "Unable to detect period from document." };
  }

  // Annual Report (10-K / 20-F) & Proxy Statement (DEF 14A) handling:
  // An annual report or proxy statement covers FY. If target is Q4 2025, the proxy may be filed in 2026 (diff = -1).
  const isProxyDoc = category === "DEF 14A" || /def[\s_\-]?14a|proxy/i.test(category || "");
  if (category === "10-K" || isProxyDoc || detected.quarter === "FY") {
    if (detected.year && target.year) {
      const diff = target.year - detected.year;
      // Valid if it's current year (0), preceding year (1), or next calendar year (-1 for off-calendar FY ends / spring proxies)
      if (diff >= -1 && diff <= 1) {
        return { isMatch: true };
      }
      return {
        isMatch: false,
        reason: `${isProxyDoc ? 'Proxy Statement' : 'Annual Report'} is for FY ${detected.year}, which is too distant from target year ${target.year}.`
      };
    }
    return { isMatch: true };
  }

  // For Quarterly documents (10-Q, Transcript, Financials TTM):
  const quarterMatches = !target.quarter || !detected.quarter || target.quarter === detected.quarter;
  const yearMatches = !target.year || !detected.year || target.year === detected.year;

  if (quarterMatches && yearMatches) {
    return { isMatch: true };
  }

  // When target is Q4 or FY, companies do not file a Form 10-Q (Form 10-K is the annual/Q4 filing).
  // Any Form 10-Q is supplemental interim context and should never be flagged as a period mismatch.
  const is10QDoc = category === "10-Q" || /10-?q/i.test(category || "");
  const isQ4OrFyTarget = target.quarter === "Q4" || target.quarter === "FY";
  if (is10QDoc && isQ4OrFyTarget) {
    return { isMatch: true };
  }

  // Form 8-K handling:
  // Form 8-K is a current event report or interim earnings release.
  // Form 8-K handling:
  // Form 8-K is an event-driven Current Report (Item 2.02 earnings releases,
  // material definitive agreements, executive changes, credit facilities). As long as ticker matches,
  // an 8-K is valid supplemental context and must never be flagged as a period mismatch.
  const is8KDoc = category === "8-K" || /8-?k/i.test(category || "");
  if (is8KDoc) {
    return { isMatch: true };
  }

  // Earnings Call Transcript ahead by 1 sequential quarter (Interim Earnings Release window):
  const isTranscriptDoc = category === "Transcript" || /transcript|call|earnings/i.test(category || "");
  if (isTranscriptDoc && isSequentialQuarterAhead(formatNormalizedPeriod(target), formatNormalizedPeriod(detected))) {
    return { isMatch: true };
  }

  const expectedStr = formatNormalizedPeriod(target);
  const detectedStr = formatNormalizedPeriod(detected);
  return {
    isMatch: false,
    reason: `Document period (${detectedStr}) does not match target period (${expectedStr}).`
  };
}

/**
 * Extracts ticker and period from CSV (Financial Statements)
 */
export function extractFromCsv(csvText: string): {
  detectedTicker: string | null;
  detectedPeriod: ParsedPeriod | null;
  latestQuarterDate: string | null;
} {
  let detectedTicker: string | null = null;
  let detectedPeriod: ParsedPeriod | null = null;
  let latestQuarterDate: string | null = null;

  if (!csvText || csvText.length < 20) {
    return { detectedTicker, detectedPeriod, latestQuarterDate };
  }

  const lines = csvText.split(/\r?\n/).slice(0, 30); // scan top metadata rows

  let calendarYearVal: string | null = null;
  let periodVal: string | null = null;
  let periodEndingVal: string | null = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = line.split(",").map(c => c.replace(/^["']|["']$/g, "").trim());
    const key = cells[0]?.toLowerCase().replace(/[\s_\-]+/g, "");

    if (key === "symbol" || key === "ticker") {
      if (cells[1] && cells[1].length > 0 && cells[1] !== "null") {
        detectedTicker = cells[1].toUpperCase();
      }
    } else if (key === "period" || key === "fiscalquarter" || key === "quarter") {
      if (cells[1] && cells[1].length > 0) {
        periodVal = cells[1];
      }
    } else if (key === "calendaryear" || key === "fiscalyear" || key === "year") {
      if (cells[1] && cells[1].length > 0) {
        calendarYearVal = cells[1];
      }
    } else if (key === "periodending" || key === "date") {
      if (cells[1] && cells[1].length > 0) {
        periodEndingVal = cells[1];
      }
    }
  }

  // Construct detected period
  if (periodVal) {
    // If periodVal is already "Q2 2026" or "Q3 2026", parse directly!
    const parsed = parsePeriodString(periodVal);
    if (parsed.quarter && parsed.year) {
      detectedPeriod = parsed;
    } else if (calendarYearVal) {
      detectedPeriod = parsePeriodString(`${periodVal} ${calendarYearVal}`);
    } else {
      detectedPeriod = parsed;
    }
  } else if (periodEndingVal) {
    latestQuarterDate = periodEndingVal;
    // Derive quarter from date e.g. 2026-06-30 or "Jun 27, 2026"
    const dMatch = periodEndingVal.match(/^(\d{4})-(\d{2})/);
    if (dMatch) {
      const y = parseInt(dMatch[1], 10);
      const m = parseInt(dMatch[2], 10);
      let q: "Q1" | "Q2" | "Q3" | "Q4" = "Q4";
      if (m >= 1 && m <= 3) q = "Q1";
      else if (m >= 4 && m <= 6) q = "Q2";
      else if (m >= 7 && m <= 9) q = "Q3";
      detectedPeriod = { quarter: q, year: y, raw: `${q} ${y}` };
    }
  }

  return { detectedTicker, detectedPeriod, latestQuarterDate };
}

/**
 * Extracts ticker and period from SEC markdown/HTML/text
 */
export function extractFromSecText(
  text: string,
  category?: string
): {
  detectedTicker: string | null;
  detectedPeriod: ParsedPeriod | null;
  companyName: string | null;
} {
  let detectedTicker: string | null = null;
  let detectedPeriod: ParsedPeriod | null = null;
  let companyName: string | null = null;

  if (!text || text.length < 50) {
    return { detectedTicker, detectedPeriod, companyName };
  }

  // Inspect first 15,000 characters for header information
  const headerChunk = text.slice(0, 15000);

  // 1. Company Name / Registrant Name
  const nameRegexes = [
    /COMPANY CONFORMED NAME:\s*([^\r\n]+)/i,
    /Exact name of registrant as specified in its charter:\s*([^\r\n]+)/i,
    /REGISTRANT NAME:\s*([^\r\n]+)/i,
    /\*\*Company:\*\*\s*([^\r\n]+)/i,
    /# .*?Report:\s*([A-Za-z0-9\s.,&\-]+)/i
  ];
  for (const reg of nameRegexes) {
    const match = headerChunk.match(reg);
    if (match && match[1]) {
      companyName = match[1].replace(/[*#]/g, "").trim();
      break;
    }
  }

  // 2. Ticker symbol
  const tickerRegexes = [
    /Trading Symbol(?:\(s\))?:\s*([A-Z]{1,5})\b/i,
    /Ticker Symbol:\s*([A-Z]{1,5})\b/i,
    /\(NASDAQ:\s*([A-Z]{1,5})\)/i,
    /\(NYSE:\s*([A-Z]{1,5})\)/i,
    /\(Ticker:\s*([A-Z]{1,5})\)/i
  ];
  for (const reg of tickerRegexes) {
    const match = headerChunk.match(reg);
    if (match && match[1]) {
      detectedTicker = match[1].toUpperCase();
      break;
    }
  }

  // 3. Period / Date
  // Check for explicit metadata Period: **Period:** Q1-27 or **Period:** Q1 2027 or **Reporting Period:** Q1 2027
  const metaExplicitPeriod = headerChunk.match(/\*\*(?:Reporting\s+)?Period(?:\s+of\s+Report)?:\*\*\s*(Q[1-4][_\-\s']*(?:20\d{2}|\d{2})|FY[_\-\s]*(?:20\d{2}|\d{2}))/i) || headerChunk.match(/\*\*Period:\*\*\s*([^\r\n]+)/i);
  if (metaExplicitPeriod) {
    const parsed = parsePeriodString(metaExplicitPeriod[1]);
    if (parsed.quarter || parsed.year) {
      detectedPeriod = parsed;
    }
  }

  // Check for metadata Filing Type: **Filing Type:** 10-Q3 or 10-Q2 or 10-Q1
  const metaFilingType = headerChunk.match(/\*\*Filing Type:\*\*\s*(?:Form\s+)?10-?Q([1-4])\b/i);
  const fyeMatch = headerChunk.match(/\*\*Fiscal Year End:\*\*\s*(\d{2})/i) || headerChunk.match(/Fiscal Year End:\s*(\d{2})/i);

  // Look for SEC quarterly ended text: "For the quarterly period ended June 30, 2026"
  if (!detectedPeriod) {
    const qEndedRegex = /For the quarterly period ended\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(20\d{2})/i;
    const qMatch = headerChunk.match(qEndedRegex);
    if (qMatch) {
      const month = qMatch[1].toLowerCase();
      let year = parseInt(qMatch[3], 10);
      const fyeMonth = fyeMatch ? parseInt(fyeMatch[1], 10) || 12 : 12;
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const reportMonth = monthNames.findIndex(m => month.startsWith(m)) + 1;
      if (reportMonth > 0 && fyeMonth < 12 && reportMonth > fyeMonth) {
        year = year + 1;
      }
      if (metaFilingType) {
        const quarter = `Q${metaFilingType[1]}` as "Q1" | "Q2" | "Q3" | "Q4";
        detectedPeriod = { quarter, year, raw: `${quarter} ${year}` };
      } else if (fyeMatch) {
        if (reportMonth > 0) {
          const diff = (reportMonth - fyeMonth + 12) % 12;
          let quarter: "Q1" | "Q2" | "Q3" | "Q4" = "Q2";
          if (diff >= 2 && diff <= 4) quarter = "Q1";
          else if (diff >= 5 && diff <= 7) quarter = "Q2";
          else if (diff >= 8 && diff <= 10) quarter = "Q3";
          else quarter = "Q4";
          detectedPeriod = { quarter, year, raw: `${quarter} ${year}` };
        }
      } else {
        let quarter: "Q1" | "Q2" | "Q3" | "Q4" = "Q2";
        if (month.includes("mar") || month.includes("apr")) quarter = "Q1";
        else if (month.includes("jun") || month.includes("jul")) quarter = "Q2";
        else if (month.includes("sep") || month.includes("oct")) quarter = "Q3";
        else if (month.includes("dec") || month.includes("jan")) quarter = "Q4";
        detectedPeriod = { quarter, year, raw: `${quarter} ${year}` };
      }
    }
  }

  // Also check if metaFilingType is present without quarterly text
  if (!detectedPeriod && metaFilingType) {
    const periodDateMatch = headerChunk.match(/\*\*Period of Report:\*\*\s*(20\d{2})-(\d{2})/i) || headerChunk.match(/\*\*Period of Report:\*\*\s*(20\d{2})/i) || headerChunk.match(/\*\*Filing Date:\*\*\s*(20\d{2})/i);
    let year = periodDateMatch ? parseInt(periodDateMatch[1], 10) : new Date().getFullYear();
    const rMonth = periodDateMatch && periodDateMatch[2] ? parseInt(periodDateMatch[2], 10) : 0;
    const fyeMonth = fyeMatch ? parseInt(fyeMatch[1], 10) || 12 : 12;
    if (rMonth > 0 && fyeMonth < 12 && rMonth > fyeMonth) {
      year = year + 1;
    }
    const quarter = `Q${metaFilingType[1]}` as "Q1" | "Q2" | "Q3" | "Q4";
    detectedPeriod = { quarter, year, raw: `${quarter} ${year}` };
  }

  // Look for SEC annual ended text: "For the fiscal year ended December 31, 2025"
  if (!detectedPeriod) {
    const fyEndedRegex = /For the fiscal year ended\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(20\d{2})/i;
    const fyMatch = headerChunk.match(fyEndedRegex);
    if (fyMatch) {
      const year = parseInt(fyMatch[3], 10);
      detectedPeriod = { quarter: "FY", year, raw: `FY ${year}` };
    }
  }

  // Look for metadata markdown header (generated by our SEC converter):
  // **Period Date:** 2026-06-30
  if (!detectedPeriod) {
    const metaPeriodMatch = headerChunk.match(/\*\*Period(?: Date)?:\*\*\s*(20\d{2})-(\d{2})/i);
    if (metaPeriodMatch) {
      const year = parseInt(metaPeriodMatch[1], 10);
      const m = parseInt(metaPeriodMatch[2], 10);
      let quarter: "Q1" | "Q2" | "Q3" | "Q4" = "Q4";
      if (m <= 3) quarter = "Q1";
      else if (m <= 6) quarter = "Q2";
      else if (m <= 9) quarter = "Q3";
      detectedPeriod = { quarter, year, raw: `${quarter} ${year}` };
    }
  }

  return { detectedTicker, detectedPeriod, companyName };
}

/**
 * Extracts ticker and period from an Earnings Call Transcript
 */
export function extractFromTranscript(text: string): {
  detectedTicker: string | null;
  detectedPeriod: ParsedPeriod | null;
} {
  let detectedTicker: string | null = null;
  let detectedPeriod: ParsedPeriod | null = null;

  if (!text || text.length < 30) {
    return { detectedTicker, detectedPeriod };
  }

  const topChunk = text.slice(0, 6000);

  // Check transcript header:
  // # Earnings Call Transcript: STRL
  // **Period:** Q2 2026
  const tickerMatch = topChunk.match(/# Earnings Call Transcript:\s*([A-Z0-9.\-]+)/i);
  if (tickerMatch) {
    detectedTicker = tickerMatch[1].toUpperCase();
  }

  const periodMatch = topChunk.match(/\*\*Period:\*\*\s*([^\r\n]+)/i);
  if (periodMatch) {
    detectedPeriod = parsePeriodString(periodMatch[1]);
  }

  // Generic transcript headline regex:
  // "Sterling Infrastructure, Inc. (NASDAQ:STRL) Q2 2026 Earnings Call Transcript"
  if (!detectedPeriod || !detectedTicker) {
    const headlineMatch = topChunk.match(
      /(?:NASDAQ|NYSE):\s*([A-Z]{1,5})[\s\S]*?(Q[1-4]|first|second|third|fourth\s+quarter)[\s\S]*?(20\d{2})/i
    );
    if (headlineMatch) {
      if (!detectedTicker) detectedTicker = headlineMatch[1].toUpperCase();
      if (!detectedPeriod) {
        let qStr = headlineMatch[2].toUpperCase();
        if (/first/i.test(qStr)) qStr = "Q1";
        else if (/second/i.test(qStr)) qStr = "Q2";
        else if (/third/i.test(qStr)) qStr = "Q3";
        else if (/fourth/i.test(qStr)) qStr = "Q4";
        const y = parseInt(headlineMatch[3], 10);
        detectedPeriod = { quarter: qStr as any, year: y, raw: `${qStr} ${y}` };
      }
    }
  }

  return { detectedTicker, detectedPeriod };
}

/**
 * Extracts ticker and period heuristics from filename
 */
export function extractFromFileName(fileName: string): {
  detectedTicker: string | null;
  detectedPeriod: ParsedPeriod | null;
} {
  let detectedTicker: string | null = null;
  let detectedPeriod: ParsedPeriod | null = null;
  const safeFileName = fileName || "";

  // 1. Ticker from prefix: e.g. STRL_10-Q_2026.md, BOUGHT - TICKER Q2-26... or STRL Q2 2026 Transcript.md
  const cleanNameForTicker = safeFileName.replace(/^(?:BOUGHT|SOLD|TRIM|WATCH|HOLD|PORTFOLIO|RESEARCH|ANALYSIS)\s*[-_–]\s*/i, "");
  const prefixMatch = cleanNameForTicker.match(/^([A-Z]{1,5})[_\-\s]/i);
  if (prefixMatch) {
    const candidate = prefixMatch[1].toUpperCase();
    const technical = ["TTM", "CSV", "PDF", "DOC", "FORM", "HELO", "THE", "SEC"];
    if (!technical.includes(candidate)) {
      detectedTicker = candidate;
    }
  }

  // 2. Period from filename
  // Check for 8-K_Item2.02_${qTag}_Earnings_Release
  const item202Match = safeFileName.match(/8-K_Item2\.02_(Q[1-4]|[1-4]Q)[_\-]?(\d{2,4})?_Earnings_Release/i);
  if (item202Match) {
    const qStr = item202Match[1].toUpperCase();
    let yStr = item202Match[2];
    if (!yStr) {
      const dateMatch = safeFileName.match(/_(\d{4})\d{4}(?:_[a-z0-9]+)?\.md$/i);
      if (dateMatch) yStr = dateMatch[1];
    }
    detectedPeriod = parsePeriodString(`${qStr} ${yStr || ''}`.trim());
  } else {
    // Check for 10-Q3_2026 or 10Q2_2025
    const qFilingMatch = safeFileName.match(/10-?Q([1-4])[_\-\s'’]?(20\d{2}|\d{2})/i);
    if (qFilingMatch) {
      const qStr = `Q${qFilingMatch[1]}`;
      const yStr = qFilingMatch[2];
      detectedPeriod = parsePeriodString(`${qStr} ${yStr}`);
    } else {
      // Check for Q1 2026, Q2-26, Q3_2025, 2026_Q2, etc.
      const fnPeriodMatch = safeFileName.match(/(?:^|[_\-\s])(Q[1-4]|[1-4]Q)[_\-\s'’]?(20\d{2}|\d{2})(?:[_\-\s.]|$)/i);
      if (fnPeriodMatch) {
        const qStr = fnPeriodMatch[1].toUpperCase();
        const yStr = fnPeriodMatch[2];
        detectedPeriod = parsePeriodString(`${qStr} ${yStr}`);
      } else {
        // Check for Annual / Year e.g. 10-K_2025
        const annualMatch = safeFileName.match(/(?:10-?k|20-?f|40-?f|def[\s_\-]?14a|proxy|annual)[_\-\s]?(20\d{2})/i);
        if (annualMatch) {
          detectedPeriod = { quarter: "FY", year: parseInt(annualMatch[1], 10), raw: `FY ${annualMatch[1]}` };
        }
      }
    }
  }

  return { detectedTicker, detectedPeriod };
}

/**
 * Audits a single file's integrity against target ticker and period
 */
export function auditFileIntegrity(
  file: {
    name: string;
    content?: string;
    category?: string;
  },
  targetTicker?: string,
  targetPeriod?: string
): DocumentIntegrityAudit {
  const normTargetTicker = targetTicker ? targetTicker.trim().toUpperCase() : "";
  const normTargetPeriod = parsePeriodString(targetPeriod);

  const fnExtract = extractFromFileName(file.name);
  let detectedTicker: string | null = fnExtract.detectedTicker;
  let detectedPeriod: ParsedPeriod | null = fnExtract.detectedPeriod;
  let detectedCompanyName: string | null = null;

  const content = file.content || "";
  const isCsv = file.name.toLowerCase().endsWith(".csv") || file.category === "Financials TTM";
  const isTranscript = file.category === "Transcript" || /transcript|call|earnings/i.test(file.name);
  const isSec = file.category === "10-K" || file.category === "10-Q" || /10-?k|10-?q|20-?f|6-?k/i.test(file.name);

  // Extract from content if available
  if (content && isCsv) {
    const csvData = extractFromCsv(content);
    if (csvData.detectedTicker) detectedTicker = csvData.detectedTicker;
    if (csvData.detectedPeriod) detectedPeriod = csvData.detectedPeriod;
  } else if (content && isTranscript) {
    const trData = extractFromTranscript(content);
    if (trData.detectedTicker) detectedTicker = trData.detectedTicker;
    if (trData.detectedPeriod) detectedPeriod = trData.detectedPeriod;
  } else if (content && isSec) {
    const secData = extractFromSecText(content, file.category);
    if (secData.detectedTicker) detectedTicker = secData.detectedTicker;
    const is8KEarnings = file.category === "8-K" || /item\s*2\.02|earnings_release/i.test(file.name);
    if (is8KEarnings && fnExtract.detectedPeriod?.quarter) {
      // Preserve target quarter parsed from filename qTag for Form 8-K Item 2.02 Earnings Release
      detectedPeriod = fnExtract.detectedPeriod;
    } else if (secData.detectedPeriod) {
      detectedPeriod = secData.detectedPeriod;
    }
    if (secData.companyName) detectedCompanyName = secData.companyName;
  } else if (content) {
    // Fallback: search first 10k chars
    const fallbackSec = extractFromSecText(content);
    if (fallbackSec.detectedTicker) detectedTicker = fallbackSec.detectedTicker;
    if (fallbackSec.detectedPeriod) detectedPeriod = fallbackSec.detectedPeriod;
    if (fallbackSec.companyName) detectedCompanyName = fallbackSec.companyName;
  }

  // Determine Company Match
  let companyMatch: "MATCH" | "MISMATCH" | "UNVERIFIED" = "UNVERIFIED";
  const details: string[] = [];

  if (normTargetTicker) {
    const hasTickerInName = new RegExp(`(^|[\\s_\\-])${normTargetTicker}([\\s_\\-]|$)`, 'i').test(file.name);

    if (detectedTicker === normTargetTicker || hasTickerInName) {
      detectedTicker = normTargetTicker;
      companyMatch = "MATCH";
      details.push(`Company verified: matches target ticker ${normTargetTicker}.`);
    } else if (detectedTicker) {
      companyMatch = "MISMATCH";
      details.push(`Ticker Mismatch: file identified as "${detectedTicker}" instead of target "${normTargetTicker}".`);
    } else if (detectedCompanyName) {
      // If company name was detected, check if it contains target ticker or similar
      const cleanTarget = normTargetTicker.toLowerCase();
      const cleanName = detectedCompanyName.toLowerCase();
      const cleanFileName = file.name.toLowerCase();
      if (cleanName.includes(cleanTarget) || (detectedTicker && cleanName.includes(detectedTicker.toLowerCase())) || (cleanTarget.length >= 3 && cleanFileName.includes(cleanTarget))) {
        companyMatch = "MATCH";
        details.push(`Company verified: name "${detectedCompanyName}" matches target.`);
      } else {
        companyMatch = "UNVERIFIED";
        details.push(`Registrant identified as "${detectedCompanyName}".`);
      }
    } else {
      details.push("Company ticker could not be explicitly confirmed from document headers.");
    }
  }

  // Determine Period Match
  let periodMatch: "MATCH" | "MISMATCH" | "UNVERIFIED" = "UNVERIFIED";
  const safePeriod = (targetPeriod || "").trim();
  const isTargetQ4OrFy = normTargetPeriod.quarter === "Q4" || normTargetPeriod.quarter === "FY" || (Boolean(safePeriod) && (safePeriod.toUpperCase().includes("Q4") || safePeriod.toUpperCase().includes("FY")));
  const is10QFile = file.category === "10-Q" || /10-?q/i.test(file.name) || /10-?q/i.test(file.category || "");
  const isCompetitorRadar = file.name.includes("_Competitor_Radar.md") || file.category === "Competitor Radar";
  const isPriorDossier = file.category === "Prior Dossier" || /prior|complete_doc|slingshot_memo|sentinel_pulse/i.test(file.name);
  const isSupplementaryFile = file.category === "Supplementary" || isCompetitorRadar || isPriorDossier || /bought|prior|thesis|supplementary|article|analysis|impact/i.test(file.name);

  if (isTargetQ4OrFy && is10QFile) {
    periodMatch = "MATCH";
    details.push("Form 10-Q is supplemental interim context for Q4/FY target (Form 10-K covers Q4 & FY).");
  } else if (normTargetPeriod.quarter || normTargetPeriod.year) {
    if (detectedPeriod && (detectedPeriod.quarter || detectedPeriod.year)) {
      const pCheck = isPeriodMatch(detectedPeriod, normTargetPeriod, file.category);
      if (pCheck.isMatch) {
        periodMatch = "MATCH";
        const is8KEarnings = file.category === "8-K" || /item\s*2\.02|earnings_release/i.test(file.name);
        const is8KDoc = file.category === "8-K" || /8-?k/i.test(file.name) || /8-?k/i.test(file.category || "");
        const isTranscriptDoc = file.category === "Transcript" || /transcript|call/i.test(file.name);
        if (is8KEarnings) {
          details.push(`Form 8-K Item 2.02 (Earnings Release) confirmed as interim reporting substitute.`);
        } else if (is8KDoc) {
          details.push(`Form 8-K (Current Report) confirmed as supplemental material event context.`);
        } else if (isTranscriptDoc && isSequentialQuarterAhead(formatNormalizedPeriod(normTargetPeriod), formatNormalizedPeriod(detectedPeriod))) {
          details.push(`Interim earnings call transcript confirmed (${formatNormalizedPeriod(detectedPeriod)} is active release ahead of Form 10-Q).`);
        } else {
          details.push(`Period verified: ${formatNormalizedPeriod(detectedPeriod)} matches target.`);
        }
      } else if (isPriorDossier) {
        periodMatch = "MATCH";
        details.push(`Prior Dossier (${formatNormalizedPeriod(detectedPeriod)}) accepted as baseline context.`);
      } else if (isSupplementaryFile) {
        periodMatch = "MATCH";
        details.push(`Supplementary/historical document (${formatNormalizedPeriod(detectedPeriod)}) accepted as background thesis context.`);
      } else {
        periodMatch = "MISMATCH";
        details.push(pCheck.reason || "Period mismatch detected.");
      }
    } else if (isPriorDossier) {
      periodMatch = "MATCH";
      details.push("Prior Dossier accepted as baseline context without strict reporting period binding.");
    } else if (isSupplementaryFile) {
      periodMatch = "MATCH";
      details.push("Supplementary article/thesis accepted without strict reporting period binding.");
    } else {
      details.push("Fiscal period could not be explicitly confirmed from document headers.");
    }
  }

  return {
    fileName: file.name,
    category: file.category || "Supplementary",
    detectedTicker,
    detectedPeriod: detectedPeriod ? formatNormalizedPeriod(detectedPeriod) : null,
    companyMatch,
    periodMatch,
    details
  };
}

/**
 * Audits full collection of staged files against target ticker and period
 */
export function auditDocumentIntegrity(
  files: Array<{
    name: string;
    content?: string;
    category?: string;
  }>,
  targetTicker?: string,
  targetPeriod?: string
): DocumentIntegrityReport {
  const normTicker = targetTicker ? targetTicker.trim().toUpperCase() : "";
  const normPeriod = targetPeriod ? targetPeriod.trim() : "";

  const fileAudits: Record<string, DocumentIntegrityAudit> = {};
  const mismatches: DocumentIntegrityReport["mismatches"] = [];
  const warnings: DocumentIntegrityReport["warnings"] = [];

  for (const file of files) {
    const audit = auditFileIntegrity(file, normTicker, normPeriod);
    fileAudits[file.name] = audit;

    if (audit.companyMatch === "MISMATCH") {
      if (audit.category !== "Supplementary" && audit.category !== "Competitor Radar") {
        mismatches.push({
          fileName: file.name,
          category: audit.category,
          issue: "Company Mismatch",
          expected: normTicker,
          actual: audit.detectedTicker || "Unknown"
        });
      } else {
        warnings.push({
          fileName: file.name,
          category: audit.category,
          issue: `Supplementary document "${file.name}" detected as "${audit.detectedTicker || 'Unknown'}" instead of target "${normTicker}".`
        });
      }
    }

    if (audit.periodMatch === "MISMATCH") {
      if (audit.category !== "Supplementary" && audit.category !== "Competitor Radar") {
        mismatches.push({
          fileName: file.name,
          category: audit.category,
          issue: "Period Mismatch",
          expected: normPeriod,
          actual: audit.detectedPeriod || "Unknown"
        });
      } else {
        warnings.push({
          fileName: file.name,
          category: audit.category,
          issue: `Supplementary document "${file.name}" has reporting period "${audit.detectedPeriod || 'Unknown'}" differing from target "${normPeriod}".`
        });
      }
    }

    if (audit.companyMatch === "UNVERIFIED" && normTicker) {
      warnings.push({
        fileName: file.name,
        category: audit.category,
        issue: `Could not verify company ticker from headers for "${file.name}".`
      });
    }

    if (audit.periodMatch === "UNVERIFIED" && normPeriod) {
      warnings.push({
        fileName: file.name,
        category: audit.category,
        issue: `Could not verify fiscal reporting period from headers for "${file.name}".`
      });
    }
  }

  // Cross-document alignment check:
  // e.g. If 10-Q detected period differs from Transcript detected period
  const qAudit = Object.values(fileAudits).find(a => a.category === "10-Q");
  const trAudit = Object.values(fileAudits).find(a => a.category === "Transcript");
  const csvAudit = Object.values(fileAudits).find(a => a.category === "Financials TTM");

  const parsedTarget = parsePeriodString(normPeriod);
  const isQ4Target = parsedTarget.quarter === "Q4" || parsedTarget.quarter === "FY" || (Boolean(normPeriod) && (normPeriod.toUpperCase().includes("Q4") || normPeriod.toUpperCase().includes("FY")));

  // In Q4/FY targets, 10-Q is not compared against Q4 transcript or CSV because 10-Q is interim
  if (!isQ4Target && qAudit && trAudit && qAudit.detectedPeriod && trAudit.detectedPeriod) {
    if (qAudit.detectedPeriod !== trAudit.detectedPeriod) {
      if (isSequentialQuarterAhead(qAudit.detectedPeriod, trAudit.detectedPeriod)) {
        warnings.push({
          fileName: `${qAudit.fileName} vs ${trAudit.fileName}`,
          category: "Cross-Document Alignment",
          issue: `Interim Earnings Release State: Staged Transcript (${trAudit.detectedPeriod}) is 1 quarter ahead of Form 10-Q (${qAudit.detectedPeriod}, pending SEC filing).`
        });
      } else {
        mismatches.push({
          fileName: `${qAudit.fileName} vs ${trAudit.fileName}`,
          category: "Cross-Document Alignment",
          issue: "10-Q & Transcript Period Discrepancy",
          expected: qAudit.detectedPeriod,
          actual: trAudit.detectedPeriod
        });
      }
    }
  }

  if (!isQ4Target && qAudit && csvAudit && qAudit.detectedPeriod && csvAudit.detectedPeriod) {
    if (qAudit.detectedPeriod !== csvAudit.detectedPeriod) {
      mismatches.push({
        fileName: `${qAudit.fileName} vs ${csvAudit.fileName}`,
        category: "Cross-Document Alignment",
        issue: "10-Q & Financials CSV Latest Period Discrepancy",
        expected: qAudit.detectedPeriod,
        actual: csvAudit.detectedPeriod
      });
    }
  }

  const hasMismatches = mismatches.length > 0;
  const hasWarnings = warnings.length > 0;
  const allMatch = !hasMismatches && files.length > 0 && Object.values(fileAudits).every(
    a => (a.companyMatch === "MATCH" || a.companyMatch === "UNVERIFIED") &&
         (a.periodMatch === "MATCH" || a.periodMatch === "UNVERIFIED")
  );

  return {
    targetTicker: normTicker,
    targetPeriod: normPeriod,
    allMatch,
    hasMismatches,
    hasWarnings,
    mismatches,
    warnings,
    fileAudits
  };
}

/**
 * Checks an individual file for potential substance issues (truncated dialogue, preview stubs, small files).
 */
export function checkFileSubstance(file: {
  name: string;
  category?: string;
  auditCategory?: string;
  tokens?: number;
  size?: number;
  lineCount?: number;
}): FileSubstanceIssue | null {
  const nameLower = file.name.toLowerCase();
  const category = file.auditCategory || file.category || "";
  const isTranscript = category === "Transcript" || (!nameLower.includes("8-k") && (nameLower.includes("transcript") || nameLower.includes("earnings_call") || (nameLower.includes("call") && !nameLower.includes("recall"))));
  const is10K = category === "10-K" || (!nameLower.includes("8-k") && (nameLower.includes("10-k") || nameLower.includes("10k") || nameLower.includes("20-f") || nameLower.includes("20f") || nameLower.includes("40-f")));
  const is10Q = category === "10-Q" || (!nameLower.includes("8-k") && (nameLower.includes("10-q") || nameLower.includes("10q") || nameLower.includes("6-k") || nameLower.includes("6k")));
  const isProxy = category === "DEF 14A" || nameLower.includes("def_14a") || nameLower.includes("def14a") || nameLower.includes("proxy");
  const isCsv = category === "Financials TTM" || nameLower.endsWith(".csv");

  const tokens = typeof file.tokens === "number" ? file.tokens : 0;
  const size = typeof file.size === "number" ? file.size : 0;

  if (isTranscript) {
    if ((tokens > 0 && tokens < 1000) || (tokens === 0 && size > 0 && size < 10000)) {
      return {
        fileName: file.name,
        category: "Transcript",
        tokens,
        size,
        expectedMinTokens: 1000,
        reason: tokens > 0 
          ? `Transcript contains only ${tokens.toLocaleString()} tokens (expected >= 1,000). Likely an incomplete summary preview or truncated dialogue.`
          : `Transcript file size is only ${Math.round(size / 1024)} KB (< 10 KB). Likely a stub or incomplete dialogue.`
      };
    }
  }

  if (is10K) {
    if ((tokens > 0 && tokens < 2000) || (tokens === 0 && size > 0 && size < 30000)) {
      return {
        fileName: file.name,
        category: "10-K",
        tokens,
        size,
        expectedMinTokens: 2000,
        reason: tokens > 0
          ? `Form 10-K / 20-F contains only ${tokens.toLocaleString()} tokens (expected >= 2,000). May only contain cover/TOC.`
          : `Form 10-K / 20-F file size is only ${Math.round(size / 1024)} KB (< 30 KB).`
      };
    }
  }

  if (is10Q) {
    if (!nameLower.includes("8-k") && !nameLower.includes("item2.02")) {
      if ((tokens > 0 && tokens < 2000) || (tokens === 0 && size > 0 && size < 20000)) {
        return {
          fileName: file.name,
          category: "10-Q",
          tokens,
          size,
          expectedMinTokens: 2000,
          reason: tokens > 0
            ? `Form 10-Q / 6-K contains only ${tokens.toLocaleString()} tokens (expected >= 2,000). May only contain cover/TOC.`
            : `Form 10-Q / 6-K file size is only ${Math.round(size / 1024)} KB (< 20 KB).`
        };
      }
    }
  }

  if (isProxy) {
    if ((tokens > 0 && tokens < 2000) || (tokens === 0 && size > 0 && size < 20000)) {
      return {
        fileName: file.name,
        category: "DEF 14A",
        tokens,
        size,
        expectedMinTokens: 2000,
        reason: tokens > 0
          ? `Proxy statement contains only ${tokens.toLocaleString()} tokens. May be a 1-page notice (DEFA14A) rather than full DEF 14A proxy.`
          : `Proxy statement size is only ${Math.round(size / 1024)} KB.`
      };
    }
  }

  if (isCsv) {
    if ((tokens > 0 && tokens < 100) || (tokens === 0 && size > 0 && size < 500)) {
      return {
        fileName: file.name,
        category: "Financials TTM",
        tokens,
        size,
        expectedMinTokens: 100,
        reason: "Financial statements CSV contains virtually no data."
      };
    }
  }

  const isPriorDossier = category === "Prior Dossier" || nameLower.includes("prior_dossier") || nameLower.includes("complete_doc") || nameLower.includes("slingshot_memo") || nameLower.includes("sentinel_pulse");
  if (isPriorDossier) {
    if ((tokens > 0 && tokens < 500) || (tokens === 0 && size > 0 && size < 2000)) {
      return {
        fileName: file.name,
        category: "Prior Dossier",
        tokens,
        size,
        expectedMinTokens: 500,
        reason: tokens > 0
          ? `Prior Dossier contains only ${tokens.toLocaleString()} tokens (expected >= 500). Incomplete or empty dossier.`
          : `Prior Dossier file size is only ${Math.round(size / 1024)} KB (< 2 KB).`
      };
    }
  }

  return null;
}

/**
 * Audits all staged files for potential substance issues (truncated dialogue, preview stubs).
 */
export function auditFilesSubstance(files: Array<{
  name: string;
  category?: string;
  auditCategory?: string;
  tokens?: number;
  size?: number;
  lineCount?: number;
}>): FileSubstanceReport {
  const issues: FileSubstanceIssue[] = [];
  for (const f of files) {
    const issue = checkFileSubstance(f);
    if (issue) {
      issues.push(issue);
    }
  }
  return {
    hasIssues: issues.length > 0,
    issues
  };
}

/**
 * Detects the standard audit category for a given file name and optional category
 */
export function detectAuditCategory(fileName: string, explicitCategory?: string): string {
  if (explicitCategory && explicitCategory !== "Supplementary") return explicitCategory;
  const fnLower = (fileName || "").toLowerCase();
  if (fnLower.endsWith(".csv") || fnLower.includes("financials") || fnLower.includes("ttm")) {
    return "Financials TTM";
  }
  if (
    fnLower.includes("prior_dossier") ||
    fnLower.includes("prior dossier") ||
    fnLower.includes("complete_doc") ||
    fnLower.includes("complete doc") ||
    fnLower.includes("slingshot_memo") ||
    fnLower.includes("slingshot memo") ||
    fnLower.includes("sentinel_pulse") ||
    fnLower.includes("sentinel pulse") ||
    (fnLower.endsWith(".md") && (fnLower.includes("dossier") || fnLower.includes("memo") || fnLower.includes("pulse")))
  ) {
    return "Prior Dossier";
  }
  if (fnLower.includes("competitor_radar") || fnLower.includes("competitor radar") || fnLower.includes("_competitor_radar")) {
    return "Competitor Radar";
  }
  if (fnLower.includes("8-k") || fnLower.includes("item2.02") || fnLower.includes("item 2.02") || (fnLower.includes("earnings") && (fnLower.includes("release") || fnLower.includes("press")))) {
    return "8-K";
  }
  if (fnLower.includes("transcript") || fnLower.includes("earnings_call") || (fnLower.includes("call") && !fnLower.includes("recall"))) {
    return "Transcript";
  }
  if (fnLower.includes("10-k") || fnLower.includes("10k") || fnLower.includes("20-f") || fnLower.includes("20f") || fnLower.includes("40-f") || fnLower.includes("40f") || fnLower.includes("annual")) {
    return "10-K";
  }
  if (fnLower.includes("10-q") || fnLower.includes("10q") || fnLower.includes("6-k") || fnLower.includes("6k") || fnLower.includes("interim")) {
    return "10-Q";
  }
  if (fnLower.includes("def_14a") || fnLower.includes("def14a") || fnLower.includes("def 14a") || fnLower.includes("proxy")) {
    return "DEF 14A";
  }
  return "Supplementary";
}

export interface RequirementRule {
  key: string;
  label: string;
  description: string;
  synonyms: string[];
  optional?: boolean;
}

export function getRequirementRules(sessionMode?: SessionMode): RequirementRule[] {
  if (sessionMode === "sentinel") {
    return [
      {
        key: "10-Q",
        label: "Quarterly Report (10-Q / 6-K or 8-K)",
        description: "Form 10-Q, Form 6-K Quarterly, or Form 8-K Item 2.02 Interim Earnings Release",
        synonyms: ["10q", "10-q", "quarterly", "interim", "6-k_quarterly", "6k_quarterly", "6-k_interim", "6k_q", "8-k", "8k", "item2.02", "item 2.02"]
      },
      {
        key: "Transcript",
        label: "Earnings Call Transcript",
        description: "Quarterly management earnings call text transcript",
        synonyms: ["transcript", "call", "earnings"]
      },
      {
        key: "Financials TTM",
        label: "Financial Statements (TTM / 40Q Refreshed CSV)",
        description: "40-Quarter historical financials CSV refreshed with latest reported quarter",
        synonyms: ["financials ttm", "ttm", "csv", "financial"]
      },
      {
        key: "Prior Dossier",
        label: "Prior Institutional Dossier",
        description: "Previous complete dossier or Slingshot memo establishing Part 11 baseline and monitoring metrics",
        synonyms: ["prior_dossier", "prior dossier", "complete doc", "complete_doc", "slingshot_memo", "sentinel_pulse", "dossier"]
      },
      {
        key: "10-K",
        label: "Annual Report (10-K / 20-F) [Optional]",
        description: "Form 10-K (Domestic) or Form 20-F (Foreign Private Issuer) - optional baseline in Mode 3 Sentinel",
        synonyms: ["10k", "10-k", "20f", "20-f", "40f", "40-f", "annual"],
        optional: true
      },
      {
        key: "Competitor Radar",
        label: "Competitor Moat & Valuation Radar [Optional]",
        description: "Peer benchmarking and relative multiples - optional in Mode 3 Sentinel",
        synonyms: ["competitor_radar", "competitor radar", "_competitor_radar"],
        optional: true
      }
    ];
  }

  return [
    {
      key: "10-K",
      label: "Annual Report (10-K / 20-F / 40-F)",
      description: "Form 10-K (Domestic) or Form 20-F / 40-F (Foreign Private Issuer)",
      synonyms: ["10k", "10-k", "20f", "20-f", "40f", "40-f", "annual"]
    },
    {
      key: "10-Q",
      label: "Quarterly Report (10-Q / 6-K)",
      description: "Form 10-Q (Domestic) or Form 6-K Quarterly / Interim (Foreign Private Issuer)",
      synonyms: ["10q", "10-q", "quarterly", "interim", "6-k_quarterly", "6k_quarterly", "6-k_interim", "6k_q"]
    },
    {
      key: "Transcript",
      label: "Earnings Call Transcript",
      description: "Quarterly management earnings call text transcript",
      synonyms: ["transcript", "call", "earnings"]
    },
    {
      key: "Financials TTM",
      label: "Financial Statements (TTM / 10-Yr)",
      description: "10-Year historical financials or quarterly statements CSV/Sheets",
      synonyms: ["financials ttm", "ttm", "csv", "financial"]
    },
    {
      key: "Competitor Radar",
      label: "Competitor Moat & Valuation Radar",
      description: "10-K Item 1 + DEF 14A Proxy + Search Grounding + FMP Verification",
      synonyms: ["competitor_radar", "competitor radar", "_competitor_radar"]
    }
  ];
}

export interface RunAuditOptions {
  ticker?: string;
  period?: string;
  sessionMode?: SessionMode;
  competitorRadarMemory?: { hasRadar: boolean; peerCount: number };
  priorDossierMemory?: { hasPrior: boolean; name?: string };
  integrityReport?: DocumentIntegrityReport;
}

export function runAudit(
  files: Array<{
    name: string;
    auditCategory?: string;
    category?: string;
    content?: string;
    tokens?: number;
    size?: number;
    lineCount?: number;
    detectedTicker?: string;
    detectedPeriod?: string;
    companyMatch?: "MATCH" | "MISMATCH" | "UNVERIFIED";
    periodMatch?: "MATCH" | "MISMATCH" | "UNVERIFIED";
    integrityDetails?: string[];
  }>,
  optionsOrTicker?: string | RunAuditOptions,
  period?: string,
  sessionMode?: SessionMode
): { passed: boolean; checklist: AuditCheck[]; integrityReport?: DocumentIntegrityReport } {
  let activeTicker: string | undefined;
  let activePeriod: string | undefined;
  let activeMode: SessionMode | undefined;
  let competitorRadarMemory: { hasRadar: boolean; peerCount: number } | undefined;
  let priorDossierMemory: { hasPrior: boolean; name?: string } | undefined;
  let externalIntegrity: DocumentIntegrityReport | undefined;

  if (typeof optionsOrTicker === "string") {
    activeTicker = optionsOrTicker;
    activePeriod = period;
    activeMode = sessionMode;
  } else if (optionsOrTicker && typeof optionsOrTicker === "object") {
    activeTicker = optionsOrTicker.ticker;
    activePeriod = optionsOrTicker.period;
    activeMode = optionsOrTicker.sessionMode;
    competitorRadarMemory = optionsOrTicker.competitorRadarMemory;
    priorDossierMemory = optionsOrTicker.priorDossierMemory;
    externalIntegrity = optionsOrTicker.integrityReport;
  }

  const normTicker = (activeTicker || "").trim().toUpperCase();
  const normPeriod = (activePeriod || "").trim();
  const parsedTargetPeriod = parsePeriodString(normPeriod);
  const isQ4Target = parsedTargetPeriod.quarter === "Q4" || parsedTargetPeriod.quarter === "FY" || normPeriod.toUpperCase().includes("Q4") || normPeriod.toUpperCase().includes("FY");

  const rules = getRequirementRules(activeMode);
  const checks: AuditCheck[] = [];

  // Generate or use integrity report
  const integrityReport = externalIntegrity || ((normTicker || normPeriod)
    ? auditDocumentIntegrity(files.map(f => ({ name: f.name, content: f.content, category: f.auditCategory || f.category })), normTicker, normPeriod)
    : undefined);

  if (integrityReport) {
    files.forEach(f => {
      const fa = integrityReport.fileAudits[f.name];
      if (fa) {
        f.detectedTicker = fa.detectedTicker || undefined;
        f.detectedPeriod = fa.detectedPeriod || undefined;
        f.companyMatch = fa.companyMatch;
        f.periodMatch = fa.periodMatch;
        f.integrityDetails = fa.details;
      }
    });
  }

  rules.forEach(rule => {
    if (rule.key === "Competitor Radar") {
      const matched = files.filter(f => {
        const fnLower = (f.name || "").toLowerCase();
        return rule.synonyms.some(syn => fnLower.includes(syn));
      });
      const hasRadar = Boolean(matched.length > 0 || competitorRadarMemory?.hasRadar);
      const isConfirmed = hasRadar || Boolean(rule.optional);
      const peerCount = competitorRadarMemory?.peerCount || 0;
      const matchedFilesList = matched.length > 0
        ? matched.map(f => f.name)
        : (competitorRadarMemory?.hasRadar ? [`${normTicker || 'Target'}_Competitor_Radar.md (in-memory)`] : []);

      checks.push({
        category: rule.key,
        label: rule.label,
        description: rule.description,
        isForeignEquivalent: false,
        status: (matched.length > 0 || competitorRadarMemory?.hasRadar) ? "CONFIRMED" : "MISSING",
        matchedFiles: matchedFilesList,
        integrityStatus: hasRadar ? "VALID" : undefined,
        integrityDetails: hasRadar
          ? [`Competitor Moat & Valuation Radar verified with ${peerCount > 0 ? `${peerCount} peers` : "staged dossier"}`]
          : ["Competitor Moat & Valuation Radar not harvested. Peer benchmarking and relative multiples will lack empirical industry grounding."],
        detectedTicker: normTicker || undefined,
        detectedPeriod: normPeriod || undefined,
        isCoveredBy8K: false,
        substanceStatus: hasRadar ? "VALID" : undefined,
        optional: rule.optional
      });
      return;
    }

    if (rule.key === "Prior Dossier") {
      const matched = files.filter(f => {
        const fnLower = (f.name || "").toLowerCase();
        const cat = f.auditCategory || f.category || detectAuditCategory(f.name);
        return cat === "Prior Dossier" || rule.synonyms.some(syn => fnLower.includes(syn));
      });
      const hasPrior = Boolean(matched.length > 0 || priorDossierMemory?.hasPrior);
      const isConfirmed = hasPrior;
      const matchedFilesList = matched.length > 0
        ? matched.map(f => f.name)
        : (priorDossierMemory?.name ? [priorDossierMemory.name] : []);

      checks.push({
        category: rule.key,
        label: rule.label,
        description: rule.description,
        isForeignEquivalent: false,
        status: isConfirmed ? "CONFIRMED" : "MISSING",
        matchedFiles: matchedFilesList,
        integrityStatus: isConfirmed ? "VALID" : undefined,
        integrityDetails: isConfirmed
          ? [`Prior Institutional Dossier baseline located and confirmed for Sentinel pulse tracking.`]
          : ["Prior Institutional Dossier missing. Sentinel mode requires prior dossier baseline to extract Part 11 monitoring metrics."],
        detectedTicker: normTicker || undefined,
        detectedPeriod: normPeriod || undefined,
        isCoveredBy8K: false,
        substanceStatus: matched.map(checkFileSubstance).find(Boolean) ? "TRUNCATED" : (isConfirmed ? "VALID" : undefined),
        substanceReason: matched.map(checkFileSubstance).find(Boolean)?.reason,
        optional: rule.optional
      });
      return;
    }

    const matched = files.filter(f => {
      const fnLower = (f.name || "").toLowerCase();
      if (rule.key === "Transcript" && (fnLower.includes("8-k") || fnLower.includes("item2.02") || (fnLower.includes("earnings") && (fnLower.includes("release") || fnLower.includes("press"))))) {
        const hasTrueTranscript = files.some(other => {
          const otherLower = (other.name || "").toLowerCase();
          return (otherLower.includes("transcript") || otherLower.includes("call")) && !otherLower.includes("8-k") && !otherLower.includes("item2.02");
        });
        if (hasTrueTranscript) return false;
      }
      return rule.synonyms.some(syn => fnLower.includes(syn));
    });

    const isExemptQ4 = rule.key === "10-Q" && isQ4Target;
    const isForeign = matched.some(f => {
      const n = (f.name || "").toLowerCase();
      return n.includes("20-f") || n.includes("20f") || n.includes("40-f") || n.includes("40f") || n.includes("6-k") || n.includes("6k");
    });

    let isCoveredBy8K = false;
    let effectiveMatched = [...matched];

    if (rule.key === "10-Q" && effectiveMatched.length === 0 && !isExemptQ4) {
      const candidate8K = files.find(f => {
        const fnLower = (f.name || "").toLowerCase();
        const is8K = fnLower.includes("8-k") || fnLower.includes("8k") || fnLower.includes("item2.02") || (fnLower.includes("earnings") && (fnLower.includes("release") || fnLower.includes("press")));
        if (!is8K) return false;
        const fa = integrityReport?.fileAudits[f.name];
        if (fa && fa.companyMatch === "MISMATCH") return false;
        return true;
      });

      if (candidate8K) {
        isCoveredBy8K = true;
        effectiveMatched.push(candidate8K);
      }
    }

    let integrityStatus: "VALID" | "WARNING" | "MISMATCH" | undefined = undefined;
    const details: string[] = [];
    let detectedTicker: string | undefined;
    let detectedPeriod: string | undefined;

    if (isExemptQ4) {
      integrityStatus = "VALID";
      details.push("Form 10-K covers Q4 & FY (Form 10-Q is not filed for Q4)");
      detectedPeriod = effectiveMatched.length > 0 ? (detectedPeriod || "Covered by 10-K") : "Covered by 10-K";
      if (effectiveMatched.length > 0 && integrityReport) {
        const matchedAudits = effectiveMatched.map(m => integrityReport.fileAudits[m.name]).filter(Boolean);
        matchedAudits.forEach(a => {
          if (a.detectedTicker) detectedTicker = a.detectedTicker;
          if (a.detectedPeriod) detectedPeriod = a.detectedPeriod;
          details.push(...a.details);
        });
      }
    } else if (isCoveredBy8K) {
      integrityStatus = "VALID";
      details.push("Form 10-Q pending SEC filing; interim quarterly results covered by Form 8-K (Item 2.02 Earnings Release)");
      if (integrityReport && effectiveMatched.length > 0) {
        const matchedAudits = effectiveMatched.map(m => integrityReport.fileAudits[m.name]).filter(Boolean);
        matchedAudits.forEach(a => {
          if (a.detectedTicker) detectedTicker = a.detectedTicker;
          if (a.detectedPeriod) detectedPeriod = a.detectedPeriod;
          details.push(...a.details);
        });
      }
    } else if (integrityReport && effectiveMatched.length > 0) {
      const matchedAudits = effectiveMatched.map(m => integrityReport.fileAudits[m.name]).filter(Boolean);
      const hasMismatch = matchedAudits.some(a => a.companyMatch === "MISMATCH" || a.periodMatch === "MISMATCH");
      const hasUnverified = matchedAudits.some(a => a.companyMatch === "UNVERIFIED" || a.periodMatch === "UNVERIFIED");

      if (hasMismatch) {
        integrityStatus = "MISMATCH";
      } else if (hasUnverified) {
        integrityStatus = "WARNING";
      } else {
        integrityStatus = "VALID";
      }

      matchedAudits.forEach(a => {
        if (a.detectedTicker) detectedTicker = a.detectedTicker;
        if (a.detectedPeriod) detectedPeriod = a.detectedPeriod;
        details.push(...a.details);
      });
    }

    const validMatches = effectiveMatched.filter(m => {
      const audit = integrityReport?.fileAudits[m.name];
      return !audit || audit.companyMatch !== "MISMATCH";
    });

    const isConfirmed = validMatches.length > 0 || isExemptQ4 || isCoveredBy8K || Boolean(rule.optional && matched.length === 0);

    const description = isExemptQ4 && effectiveMatched.length === 0
      ? "Form 10-K covers Q4 & FY (Form 10-Q is not filed for Q4)"
      : isCoveredBy8K
        ? "Form 10-Q pending filing with SEC. Current quarter covered by Form 8-K (Item 2.02 Earnings Release)."
        : rule.description;

    checks.push({
      category: rule.key,
      label: isCoveredBy8K ? "Quarterly Interim (Form 8-K)" : rule.label,
      description,
      isForeignEquivalent: isForeign,
      status: (validMatches.length > 0 || isExemptQ4 || isCoveredBy8K) ? "CONFIRMED" : "MISSING",
      matchedFiles: effectiveMatched.map(f => f.name),
      integrityStatus,
      integrityDetails: details.length > 0 ? Array.from(new Set(details)) : undefined,
      detectedTicker,
      detectedPeriod,
      isCoveredBy8K,
      substanceStatus: effectiveMatched.map(checkFileSubstance).find(Boolean) ? "TRUNCATED" : (effectiveMatched.length > 0 ? "VALID" : undefined),
      substanceReason: effectiveMatched.map(checkFileSubstance).find(Boolean)?.reason,
      optional: rule.optional
    });
  });

  const passed = checks.filter(c => !c.optional).every(c => c.status === "CONFIRMED");
  return { passed, checklist: checks, integrityReport };
}

```

## Source File: `src/currencyGuard.ts`
```typescript
import { CurrencyAuditResult, CurrencyAuditMismatch } from "./types.js";

/**
 * Universal Multi-Currency Safeguard Engine for Value Investing Terminal.
 * Supports 160+ global currencies dynamically via real-time Open Exchange rates.
 * Audits financial CSVs, preserves native Home Currency to eliminate exchange
 * rate fluctuation noise from 10-year operational metrics and audited longitudinal RORC,
 * and provides full transparency with interactive decision workflows.
 */

// Fallback rates against 1 USD in case external network is unreachable
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  CAD: 1.376,
  BRL: 5.18,
  EUR: 0.856,
  GBP: 0.733,
  JPY: 158.95,
  KRW: 1385.74,
  INR: 84.0,
  MXN: 18.0057,
  AUD: 1.40,
  CHF: 0.801,
  HKD: 7.84,
  TWD: 31.81,
  CNY: 7.15,
  SEK: 9.80,
  NOK: 9.90,
  DKK: 6.38,
  SGD: 1.28,
  ZAR: 17.50,
  ILS: 3.65,
  CLP: 930.0,
  COP: 4100.0,
  NZD: 1.65,
  TRY: 33.50,
  IDR: 16200.0,
  PLN: 3.95,
  THB: 36.50,
  MYR: 4.70,
  PHP: 58.50,
  SAR: 3.75,
  AED: 3.67
};

let cachedFxRates: Record<string, number> = { ...FALLBACK_RATES };
let lastFxFetchTimestamp = 0;
const FX_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

export async function fetchLiveFxRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (now - lastFxFetchTimestamp < FX_CACHE_TTL_MS && Object.keys(cachedFxRates).length > 25) {
    return cachedFxRates;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as any;
      if (data && data.rates && typeof data.rates === "object") {
        cachedFxRates = { ...FALLBACK_RATES, ...data.rates, USD: 1.0 };
        lastFxFetchTimestamp = now;
        console.log(`[CurrencyGuard] Successfully updated live FX rates for ${Object.keys(cachedFxRates).length} currencies.`);
        return cachedFxRates;
      }
    }
  } catch (err) {
    console.warn("[CurrencyGuard] Could not fetch live FX rates, using reliable fallbacks.", (err as any)?.message || err);
  }

  return cachedFxRates;
}

export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  const lines = csvText.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let current = "";
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
      } else if (char === "," && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

export function formatCsvRows(rows: string[][]): string {
  return rows
    .map(row =>
      row
        .map(cell => {
          const s = String(cell ?? "");
          if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(",")
    )
    .join("\r\n");
}

export async function auditFinancialCsv(
  csvContent: string,
  fileName: string,
  ticker?: string
): Promise<CurrencyAuditResult> {
  const rates = await fetchLiveFxRates();
  const safeTicker = (ticker || "").trim().toUpperCase();
  const result: CurrencyAuditResult = {
    fileName,
    ticker: safeTicker,
    hasForeignCurrency: false,
    hasMixedCurrencies: false,
    hasBsMismatch: false,
    homeCurrency: "USD",
    currenciesFound: [],
    fxRate: 1.0,
    requiresAction: false,
    mismatches: [],
    details: []
  };

  if (!csvContent || csvContent.length < 50) {
    result.details.push("CSV content is empty or insufficient.");
    return result;
  }

  const rows = parseCsvRows(csvContent);
  if (rows.length < 5) {
    result.details.push("CSV contains too few rows for statement audit.");
    return result;
  }

  // Look for reportedCurrency row(s) across all statements and segments
  const currencyRowIndices: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const firstCell = rows[i][0]?.trim().toLowerCase();
    if (firstCell === "reportedcurrency" || firstCell === "reported_currency" || firstCell === "currency") {
      currencyRowIndices.push(i);
    }
  }

  let rawCurrencies: string[] = [];
  if (currencyRowIndices.length > 0) {
    for (const idx of currencyRowIndices) {
      const rowCurs = rows[idx]
        .slice(1)
        .map(c => (c || "").trim().toUpperCase())
        .filter(c => c.length > 0 && c !== "NAN" && c !== "NULL");
      if (rawCurrencies.length === 0) {
        rawCurrencies = rowCurs;
      } else {
        for (let j = 0; j < rowCurs.length; j++) {
          if (rowCurs[j] && !rawCurrencies[j]) rawCurrencies[j] = rowCurs[j];
          else if (rowCurs[j] && rowCurs[j] !== "USD" && rawCurrencies[j] === "USD") rawCurrencies[j] = rowCurs[j];
        }
      }
    }
  } else {
    result.details.push("No explicit reportedCurrency row detected; scanning cell markers.");
  }

  result.currenciesFound = rawCurrencies;

  const nonUsd = rawCurrencies.filter(c => c !== "USD");
  result.hasForeignCurrency = nonUsd.length > 0;
  result.hasMixedCurrencies = (rawCurrencies.includes("USD") && nonUsd.length > 0) || new Set(rawCurrencies).size > 1;

  if (nonUsd.length > 0) {
    const counts: Record<string, number> = {};
    for (const cur of nonUsd) {
      counts[cur] = (counts[cur] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    result.homeCurrency = sorted[0][0];
    result.fxRate = rates[result.homeCurrency] || FALLBACK_RATES[result.homeCurrency] || 1.0;
  } else if (result.currenciesFound.length > 0) {
    result.homeCurrency = result.currenciesFound[0] || "USD";
    result.fxRate = rates[result.homeCurrency] || FALLBACK_RATES[result.homeCurrency] || 1.0;
  }

  // Detect Balance Sheet unit mismatch (e.g. Cash in local currency while Debt or Income statement is in USD)
  if (result.hasForeignCurrency && result.fxRate > 1.5) {
    for (const row of rows) {
      const key = row[0]?.trim();
      if (key === "cashAndCashEquivalents" || key === "cashAndShortTermInvestments") {
        const val1 = row[1];
        if (val1) {
          const num = parseFloat(val1);
          if (!isNaN(num) && num > 50000) {
            result.hasBsMismatch = true;
            result.mismatches.push({
              item: key,
              description: `Already reported in native ${result.homeCurrency} (${num.toLocaleString()}) while neighboring periods were translated to USD.`
            });
          }
        }
      }
    }
  }

  result.requiresAction = result.hasMixedCurrencies || result.hasBsMismatch;

  if (result.requiresAction) {
    result.details.push(
      `Detected mixed/foreign currencies (${Array.from(new Set(result.currenciesFound)).join(", ")}). Preserving native Home Currency (${result.homeCurrency}) removes multi-year FX volatility from operational analysis.`
    );
  } else {
    result.details.push("Clean single-currency financials. No harmonization required.");
  }

  return result;
}

export function harmonizeFinancialCsv(
  csvContent: string,
  audit: CurrencyAuditResult
): { harmonizedCsv: string; newFileName: string } {
  if (!audit.requiresAction || !csvContent) {
    return { harmonizedCsv: csvContent, newFileName: audit.fileName };
  }

  const rows = parseCsvRows(csvContent);
  const currencyRowIndices: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const firstCell = rows[i][0]?.trim().toLowerCase();
    if (firstCell === "reportedcurrency" || firstCell === "reported_currency" || firstCell === "currency") {
      currencyRowIndices.push(i);
    }
  }

  const currencies = audit.currenciesFound;
  const homeCur = audit.homeCurrency;
  const fxRate = audit.fxRate;

  const META_EXCLUDE = new Set([
    "period ending",
    "symbol",
    "cik",
    "filingdate",
    "accepteddate",
    "fiscalquarter",
    "fiscalyear",
    "reportedcurrency",
    "reported_currency"
  ]);

  const SHARE_KEYS = new Set([
    "weightedaverageshsout",
    "weightedaverageshsoutdil",
    "weighted_average_shs_out",
    "weighted_average_shs_out_dil",
    "shares",
    "shsout"
  ]);

  const harmonizedRows = rows.map(r => [...r]);

  for (let rIdx = 0; rIdx < harmonizedRows.length; rIdx++) {
    const row = harmonizedRows[rIdx];
    const key = (row[0] || "").trim();
    const keyLower = key.toLowerCase();

    if (key.endsWith(":") || META_EXCLUDE.has(keyLower)) {
      continue;
    }

    const isShareMetric = Array.from(SHARE_KEYS).some(k => keyLower.includes(k));
    if (isShareMetric) {
      continue;
    }

    for (let cIdx = 1; cIdx < row.length; cIdx++) {
      const cur = currencies[cIdx - 1] || "USD";
      const cellVal = row[cIdx];
      if (!cellVal || cellVal === "null" || cellVal === "undefined" || cellVal === "NaN") {
        continue;
      }

      const numVal = parseFloat(cellVal);
      if (isNaN(numVal)) continue;

      // If column was translated to USD and home currency is foreign, convert BACK to Home Currency
      if (cur === "USD" && homeCur !== "USD") {
        if (
          (key === "cashAndCashEquivalents" || key === "cashAndShortTermInvestments") &&
          numVal > 50000
        ) {
          // Already in native currency
          continue;
        }

        const converted = numVal * fxRate;
        harmonizedRows[rIdx][cIdx] = converted % 1 === 0 ? String(converted) : converted.toFixed(4);
      }
    }
  }

  // Update all reportedCurrency rows across statements and segments to declare pure Home Currency
  for (const cIdxRow of currencyRowIndices) {
    for (let cIdx = 1; cIdx < harmonizedRows[cIdxRow].length; cIdx++) {
      harmonizedRows[cIdxRow][cIdx] = `${homeCur} (Home Currency)`;
    }
  }

  const baseSymbol = audit.ticker || "COMPANY";
  const newFileName = `${baseSymbol}_Financials-TTM_${homeCur}.csv`;

  return {
    harmonizedCsv: formatCsvRows(harmonizedRows),
    newFileName
  };
}

```

---

# SECTION 6: VERIFICATION HARNESS & INVARIANCE GATES

## Source File: `scripts/test_engine_prompts.ts`
```typescript
import fs from "fs";
import path from "path";
import { MASTER_PROMPTS, CROSSCHECK_PROMPT, STEP_CHAPTER_TITLES } from "../src/prompts.js";

console.log("=== Testing Value Investing Terminal Engine Prompts ===");

// 1. Verify MASTER_PROMPTS count
console.log(`Total Master Prompts: ${MASTER_PROMPTS.length}`);
if (MASTER_PROMPTS.length !== 11) {
  console.error(`FAIL: Expected 11 master prompts, got ${MASTER_PROMPTS.length}`);
  process.exit(1);
} else {
  console.log("PASS: 11 Master Prompts verified (Steps 1-11).");
}

// 2. Verify Crosscheck Prompt
if (!CROSSCHECK_PROMPT || CROSSCHECK_PROMPT.id !== 12) {
  console.error(`FAIL: Crosscheck prompt missing or invalid id (expected 12, got ${CROSSCHECK_PROMPT?.id}).`);
  process.exit(1);
} else {
  console.log("PASS: Crosscheck Prompt verified (Step 12).");
}

// 3. Verify Step Chapter Titles Mapping
const expectedChapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
for (const ch of expectedChapters) {
  if (!STEP_CHAPTER_TITLES[ch]) {
    console.error(`FAIL: Missing STEP_CHAPTER_TITLES for chapter ${ch}`);
    process.exit(1);
  }
}
console.log("PASS: All 12 Step Chapter Titles properly mapped.");

// 4. Verify Upgrade 1: Forensics & Debt Equivalents in Step 1
const step1 = MASTER_PROMPTS.find(p => p.id === 1);
if (!step1) throw new Error("Step 1 not found");
const hasSchilit = (step1.text.includes("Forensic Accounting & Shenanigans Audit") || step1.text.includes("Howard Schilit Protocol") || step1.text.includes("Forensic Accounting & Earnings Quality Audit")) && 
                   (step1.text.includes("Buy-Side Cash Integrity Protocol") && step1.text.includes("3-Year Cumulative Cash Conversion Reality") && !step1.text.includes("DSO = (Ending Accounts Receivable")) &&
                   (step1.text.includes("CRITICAL INDUSTRY-SPECIFIC BYPASS ROUTING FOR SCHILIT FORENSICS") || step1.text.includes("CRITICAL INDUSTRY-SPECIFIC BYPASS ROUTING FOR FORENSIC ACCOUNTING AUDIT") || step1.text.includes("CRITICAL INDUSTRY-SPECIFIC BYPASS ROUTING"));
const hasDebtEquivalents = step1.text.includes("Operating Lease Obligations") &&
                           step1.text.includes("Net Unfunded Pension");
const hasBuffett1Dollar = (step1.text.includes("Capital Allocation $1 Retained Earnings Test") || step1.text.includes("Buffett's $1 Retained Earnings Test")) &&
                          step1.text.includes("Market Value Creation Ratio");
const hasThorndikeBuyback = (step1.text.includes("Share Repurchase Capital Allocation Audit") || step1.text.includes("Thorndike Share Repurchase Value Audit")) &&
                            step1.text.includes("Share Count Contraction vs. SBC Neutralization");
const hasDualSegmentTables = step1.text.includes("Table 1A: Trailing Twelve Month (TTM) Operating Business Segments") &&
                             step1.text.includes("Table 1B: Trailing Twelve Month (TTM) Geographic Territory Breakdown");

console.log(`Step 1 - Schilit Forensics: ${hasSchilit ? "PASS" : "FAIL"}`);
console.log(`Step 1 - Footnote Debt Equivalents: ${hasDebtEquivalents ? "PASS" : "FAIL"}`);
console.log(`Step 1 - Buffett $1 Retained Earnings: ${hasBuffett1Dollar ? "PASS" : "FAIL"}`);
console.log(`Step 1 - Thorndike Buyback Discipline: ${hasThorndikeBuyback ? "PASS" : "FAIL"}`);
console.log(`Step 1 - Dual Non-Overlapping Segment Tables (Option B): ${hasDualSegmentTables ? "PASS" : "FAIL"}`);

if (!hasSchilit || !hasDebtEquivalents || !hasBuffett1Dollar || !hasThorndikeBuyback || !hasDualSegmentTables) {
  console.error("FAIL: Step 1 missing expected institutional upgrades");
  process.exit(1);
}

// 5. Verify Upgrade 2: Gurley Moat Scorecard & Sector Exemption in Step 2 (and Section 5A macro table eliminated)
const step2 = MASTER_PROMPTS.find(p => p.id === 2);
if (!step2) throw new Error("Step 2 not found");
const hasGurley = (step2.text.includes("Platform Network Effects & Moat Scorecard") || step2.text.includes("Gurley 10X Platform Moat Scorecard")) &&
                  (step2.text.includes("SECTOR EXEMPTION") || step2.text.includes("SECTOR & DISTRIBUTION CHANNEL EXEMPTION"));
const eliminatedMarks5A = !step2.text.includes("Howard Marks \"Market Temperature\" Framework") &&
                          !step2.text.includes("5A. Market & Sentiment Analysis");
console.log(`Step 2 - Gurley Platform Moat & Sector Exemption: ${hasGurley ? "PASS" : "FAIL"}`);
console.log(`Step 2 - Howard Marks 5A Macro Table Eliminated: ${eliminatedMarks5A ? "PASS" : "FAIL"}`);
if (!hasGurley || !eliminatedMarks5A) {
  console.error("FAIL: Step 2 verification failed");
  process.exit(1);
}

// 6. Verify Step 3: Authoritative Owner Earnings Engine & 100% SBC Deduction + Section 1.5 Rolling Avg & Growth
const step3 = MASTER_PROMPTS.find(p => p.id === 3);
if (!step3) throw new Error("Step 3 not found");
const hasOwnerEarningsSBC = step3.text.includes("CRITICAL SBC ADJUSTMENT") &&
                            step3.text.includes("Maintenance vs. Growth CapEx Estimation") &&
                            step3.text.includes("Historical Cash Flow & Owner Earnings Trend Table") &&
                            step3.text.includes("3-Year Rolling Average Normalized Owner Earnings");
console.log(`Step 3 - Authoritative Owner Earnings & Rolling Avg/CAGR Anchor: ${hasOwnerEarningsSBC ? "PASS" : "FAIL"}`);
if (!hasOwnerEarningsSBC) {
  console.error("FAIL: Step 3 missing authoritative owner earnings mechanics or Section 1.5 rolling avg");
  process.exit(1);
}

// 7. Verify Upgrade 3: Reverse DCF & Cash-Flow Sovereign Model in Step 7 & Step 8
const step7 = MASTER_PROMPTS.find(p => p.id === 7);
if (!step7) throw new Error("Step 7 not found");
const hasReverseDcf = (step7.text.includes("Market-Implied Expectations Model") || step7.text.includes("Reverse DCF")) &&
                      step7.text.includes("Implied Organic Sales Growth") &&
                      step7.text.includes("INDUSTRY-SPECIFIC ROUTING FOR REVERSE VALUATION");
console.log(`Step 7 - Reverse DCF Expectations Protocol: ${hasReverseDcf ? "PASS" : "FAIL"}`);
if (!hasReverseDcf) {
  console.error("FAIL: Step 7 missing Reverse DCF expectations protocol");
  process.exit(1);
}

const step8 = MASTER_PROMPTS.find(p => p.id === 8);
if (!step8) throw new Error("Step 8 not found");
const hasReverseDcfSynthesis = step8.text.includes("Market-Implied Expectations") || step8.text.includes("Expected DCF");
console.log(`Step 8 - Valuation Synthesis Integration: ${hasReverseDcfSynthesis ? "PASS" : "FAIL"}`);
if (!hasReverseDcfSynthesis) {
  console.error("FAIL: Step 8 missing valuation synthesis integration");
  process.exit(1);
}

// 8. Verify Weaponized Red Team in Step 10
const step10 = MASTER_PROMPTS.find(p => p.id === 10);
if (!step10) throw new Error("Step 10 not found");
const hasRedTeamWeapon = (step10.text.includes("Forensic Accounting Red Flags") || step10.text.includes("Schilit's Shenanigans")) &&
                         (step10.text.includes("Dilutive Share Repurchases") || step10.text.includes("Thorndike Buyback Destruction")) &&
                         (step10.text.includes("Charlie Munger Operational Pre-Mortem & Killing the Moat") || step10.text.includes("Operational Pre-Mortem & Killing the Moat") || step10.text.includes("Operational Pre-Mortem & Moat Vulnerability Analysis")) &&
                         step10.text.includes("HARD STOP DIRECTIVE");
console.log(`Step 10 - Red Team Forensic Weaponization & Pre-Mortem: ${hasRedTeamWeapon ? "PASS" : "FAIL"}`);
if (!hasRedTeamWeapon) {
  console.error("FAIL: Step 10 missing Red Team forensic weaponization or Munger Pre-Mortem");
  process.exit(1);
}

// 8.5. Verify Step 9: Cyclical Compounder Disambiguation Test
const step9 = MASTER_PROMPTS.find(p => p.id === 9);
if (!step9) throw new Error("Step 9 not found");
const hasCyclicalDisambiguation = step9.text.includes("4-POINT CYCLICAL COMPOUNDER DISAMBIGUATION TEST") &&
                                  step9.text.includes("Trough-to-Trough Escalation") &&
                                  step9.text.includes("Physical Unit Volume Decoupling");
console.log(`Step 9 - Cyclical Compounder Disambiguation: ${hasCyclicalDisambiguation ? "PASS" : "FAIL"}`);
if (!hasCyclicalDisambiguation) {
  console.error("FAIL: Step 9 missing 4-Point Cyclical Compounder Disambiguation Test");
  process.exit(1);
}

// 9. Verify Definitive Resolution, Archetype Eligibility Gate & 4-Gate Isolation Matrix in Step 11
const step11 = MASTER_PROMPTS.find(p => p.id === 11);
if (!step11) throw new Error("Step 11 not found");
const hasResolutionDashboard = step11.text.includes("The Definitive Verdict") &&
                               step11.text.includes("The 5-Metric Quarterly Monitoring Dashboard") &&
                               step11.text.includes("Archetype Eligibility Gate") &&
                               step11.text.includes("Mandatory 4-Gate Isolation Diagnostic") &&
                               step11.text.includes("Gate 1 (Peer-Relative Captivity & Share") &&
                               step11.text.includes("Gate 2 (Gross Margin Pricing Power vs. Fixed-Cost Deleverage") &&
                               step11.text.includes("Gate 3 (Capital Allocation & Forensic Integrity") &&
                               step11.text.includes("Gate 4 (Zero-Base Thesis & Fade Recalibration") &&
                               step11.text.includes("STRICT PROHIBITION OF SUNK-COST BIAS") &&
                               step11.text.includes("FORTRESS BALANCE SHEET & TROUGH PROTECTION");
console.log(`Step 11 - Definitive Verdict, Archetype Gate & 4-Gate Isolation Matrix: ${hasResolutionDashboard ? "PASS" : "FAIL"}`);
if (!hasResolutionDashboard) {
  console.error("FAIL: Step 11 missing definitive verdict, Archetype Eligibility Gate, or 4-Gate Isolation Matrix");
  process.exit(1);
}

// 10. Verify Crosscheck in Step 12 & Master Prompts Text File Sync
const rawPromptsTxt = fs.readFileSync(path.join(process.cwd(), "Investment Analysis and Valuation Framework Master Prompts.txt"), "utf8");
const hasStep12Check = (CROSSCHECK_PROMPT.text.includes("Forensic Accounting & Earnings Quality") || CROSSCHECK_PROMPT.text.includes("Buy-Side Cash Integrity Protocol")) &&
                       (CROSSCHECK_PROMPT.text.includes("Market-Implied Reverse DCF expectations") || CROSSCHECK_PROMPT.text.includes("Mauboussin Reverse DCF implied expectations"));
const hasStep12Tripwires = CROSSCHECK_PROMPT.text.includes("Gate 0: Structural Pipeline Completeness & Chapter Roll Call Audit") &&
                          CROSSCHECK_PROMPT.text.includes("Gate 1: Entity & Ticker Integrity Audit") &&
                          CROSSCHECK_PROMPT.text.includes("Gate 2: Portfolio Mandate & Definitive Verdict Alignment Audit") &&
                          CROSSCHECK_PROMPT.text.includes("Archetype Eligibility Gate") &&
                          CROSSCHECK_PROMPT.text.includes("4-Gate Isolation Diagnostic") &&
                          CROSSCHECK_PROMPT.text.includes("Gate 3: Cash-Flow Valuation Consistency Crosscheck") &&
                          CROSSCHECK_PROMPT.text.includes("Gate 4: Mandatory Arithmetic Proof & Formula Recalculation Scratchpad") &&
                          rawPromptsTxt.includes("4-POINT CYCLICAL COMPOUNDER DISAMBIGUATION TEST") &&
                          rawPromptsTxt.includes("Mandatory 4-Gate Isolation Diagnostic");

console.log(`Step 12 - Crosscheck Recalculation: ${hasStep12Check ? "PASS" : "FAIL"}`);
console.log(`Step 12 - Mandatory Pre-Flight Tripwires (Gates 0-4) & Txt Sync: ${hasStep12Tripwires ? "PASS" : "FAIL"}`);
if (!hasStep12Check || !hasStep12Tripwires) {
  console.error("FAIL: Step 12 missing independent verification updates, mandatory pre-flight tripwires, or Master Prompts.txt sync");
  process.exit(1);
}

// 11. Verify Bimodal Voice Architecture (Strategic & Moat vs Forensic & Defense 80% ASD-STE100)
const step4 = MASTER_PROMPTS.find(p => p.id === 4);
const step5 = MASTER_PROMPTS.find(p => p.id === 5);

const step1Voice = step1.text.includes("VOICE & REASONING ARCHITECTURE") && step1.text.includes("Strategic & Moat Voice") && step1.text.includes("80% ASD-STE100");
const step2Voice = step2.text.includes("STRATEGIC & MOAT VOICE");
const step3Voice = step3.text.includes("FORENSIC & DEFENSE VOICE (80% ASD-STE100)") && step3.text.includes("Active voice only") && step3.text.includes("One verb per sentence");
const step4Voice = step4 ? step4.text.includes("STRATEGIC & MOAT VOICE") : false;
const step5Voice = step5 ? step5.text.includes("FORENSIC & DEFENSE VOICE (80% ASD-STE100)") : false;
const step7Voice = step7 ? step7.text.includes("STRATEGIC & MOAT VOICE") : false;
const step8Voice = step8 ? step8.text.includes("STRATEGIC & MOAT VOICE") : false;
const step10Voice = step10 ? step10.text.includes("FORENSIC & DEFENSE VOICE (80% ASD-STE100)") && step10.text.includes("Zero corporate euphemisms") : false;
const step11Voice = step11 ? step11.text.includes("STRATEGIC & MOAT VOICE") : false;
const step12Voice = CROSSCHECK_PROMPT.text.includes("FORENSIC & DEFENSE VOICE (80% ASD-STE100)") && CROSSCHECK_PROMPT.text.includes("Active voice only");

console.log(`Voice Architecture - Step 1 Bimodal Architecture: ${step1Voice ? "PASS" : "FAIL"}`);
console.log(`Voice Architecture - Step 2 Strategic & Moat: ${step2Voice ? "PASS" : "FAIL"}`);
console.log(`Voice Architecture - Step 3 Forensic & Defense (80% ASD-STE100): ${step3Voice ? "PASS" : "FAIL"}`);
console.log(`Voice Architecture - Step 4 Strategic & Moat: ${step4Voice ? "PASS" : "FAIL"}`);
console.log(`Voice Architecture - Step 5 Forensic & Defense (80% ASD-STE100): ${step5Voice ? "PASS" : "FAIL"}`);
console.log(`Voice Architecture - Step 7 Strategic & Moat: ${step7Voice ? "PASS" : "FAIL"}`);
console.log(`Voice Architecture - Step 8 Strategic & Moat: ${step8Voice ? "PASS" : "FAIL"}`);
console.log(`Voice Architecture - Step 10 Forensic & Defense (80% ASD-STE100): ${step10Voice ? "PASS" : "FAIL"}`);
console.log(`Voice Architecture - Step 11 Strategic & Moat: ${step11Voice ? "PASS" : "FAIL"}`);
console.log(`Voice Architecture - Step 12 Forensic & Defense (80% ASD-STE100): ${step12Voice ? "PASS" : "FAIL"}`);

if (!step1Voice || !step2Voice || !step3Voice || !step4Voice || !step5Voice || !step7Voice || !step8Voice || !step10Voice || !step11Voice || !step12Voice) {
  console.error("FAIL: Bimodal Voice Architecture verification failed");
  process.exit(1);
}

// 12. Verify Dossier Format Guard (The 5 Inviolable Formatting Laws & Desk Nomenclature)
import { cleanMarkdownForRendering } from "../src/utils/dossierFormatGuard.js";

const testCorruptedMd = `
## Part 2: Operational Engine
| ENTERPRISE DUAL-CORE ENGINE |
| Architectural Dimension | Commerce Core | Fintech Core |
| Scale & Volume | GMV | TPV |

#### 1.1 Core Business & Economic Engine
The core economic engine consists of two interlocking, self-funding flywheels:
* **Stage 1**: Premature Loop
* **Widened Regional Scale Moat & Customer Lock-In**

##### 1. The Value Delivery Mechanism
* Empirical Commerce Pillar

* **SNOW (Direct Peer)**: Gross Margin: 74.2% | Operating Margin: -10.5% | ROIC: 15.0% | EV / True FCF: 45.0x | EV / Owner Earnings: 50.0x | Net Cash / Mkt Cap: +10.2%
* **DDOG (Adjacent Peer)**: Gross Margin: 81.0% | Operating Margin: 12.3% | ROIC: 22.0% | EV / True FCF: 38.0x | EV / Owner Earnings: 42.0x | Net Cash / Mkt Cap: +8.5%

## Part 4: Moat
\`\`\`
* Rogue bullet item 1
* Rogue bullet item 2
\`\`\`

\`\`\`mermaid
flowchart TD
  S1["Stage 1"] --> S2["Stage 2"]
\`\`\`

\`\`\`\`\`\`
| Col 1 | Col 2 |
| :--- | :---: |
| Val A | Val B |
\`\`\`

$$
\\frac{\\mathbf{ROIC}}{\\text{WACC}} > 1.0
$$

## Part 6: Earnings Power Value
Under the Graham-Buffett-Greenwald Framework, Greenwald EPV indicates strong moat durability.
The Sloan Accrual Ratio is +2.1% and the Beneish M-Score is -2.85.

## Part 7: Valuation Engine
│ Conservative Case : $95.50 │
│ Base Case : $130.30 │
│ Optimistic Case : $175.00 │

## Part 9: Lynch Classification
Slow Grower ── Stalwart ── [Fast Grower] ── Cyclical ── Turnaround
  └──> Top-Line: 25% • Operating Margin: 28% • ROIC: 25%

## Part 11: Target Price Bands & Verdict
$10.00 ─────── [$16.70 - $21.71] ───────> [$25.05] ───────> [$33.40] ───────> [$188.75]
(0% MoS Fair Value)

FINAL PORTFOLIO ACTION DIRECTIVE: PASS
TICKER: PLTR
MARKET PRICE: $188.75
SYNTHESIZED INTRINSIC VALUE: $33.40
STANDARD MARGIN OF SAFETY: -465.1% (Overvalued)
DECISION: PASS
`;

const cleanedResult = cleanMarkdownForRendering(testCorruptedMd);
const hasMermaid = cleanedResult.includes("```mermaid\nflowchart TD") && cleanedResult.includes('S1["Stage 1"] --> S2["Stage 2"]\n```');
const unwrappedBullets = !cleanedResult.includes("```\n* Rogue bullet") && cleanedResult.includes("* Rogue bullet item 1");
const noLatex = !cleanedResult.includes("\\frac") && !cleanedResult.includes("$$") && cleanedResult.includes("(**ROIC** / WACC)");
const noPrematureFlywheel = !cleanedResult.includes("two interlocking, self-funding flywheels") && cleanedResult.includes("interlocking operational pillars");
const normalizedTable = cleanedResult.includes("### Enterprise Dual-Core Architecture") && cleanedResult.includes("| :--- | :--- | :--- |");
const normalizedRadar = cleanedResult.includes("| Competitor / Peer | Gross Margin | Operating Margin | ROIC |") && cleanedResult.includes("| **SNOW (Direct Peer)** |");
const normalizedDcfBox = cleanedResult.includes("| Valuation Scenario | Per Diluted Share Value & Market Variance |") && cleanedResult.includes("| **Base Case** | $130.30 |") && !cleanedResult.includes("│");
const normalizedLynch = cleanedResult.includes("| Peter Lynch Archetype | Classification Status |") && cleanedResult.includes("| **Fast Grower** | **ACTIVE ARCHETYPE** |");
const normalizedPriceBand = cleanedResult.includes("| Target Buy Price Band | Price Range ($) |") && cleanedResult.includes("| **Screaming Buy** |");
const normalizedVerdict = cleanedResult.includes("| Decision Parameter | Audited Portfolio Verdict |") && cleanedResult.includes("| **Final Portfolio Action Directive** | **PASS** |");
const noAcademicCreatorNames = !cleanedResult.includes("Graham-Buffett-Greenwald") &&
  !cleanedResult.includes("Greenwald EPV") &&
  !cleanedResult.includes("Sloan Accrual Ratio") &&
  !cleanedResult.includes("Beneish M-Score") &&
  cleanedResult.includes("Proprietary Valuation Triad") &&
  cleanedResult.includes("Earnings Power Value (EPV)") &&
  cleanedResult.includes("Balance Sheet Accrual Ratio") &&
  cleanedResult.includes("Earnings Manipulation Risk Index");
const fenceCount = (cleanedResult.match(/```/g) || []).length;

const formatGuardSource = fs.readFileSync(path.join(process.cwd(), "src/utils/dossierFormatGuard.ts"), "utf8");
const documentGuardSource = fs.readFileSync(path.join(process.cwd(), "src/documentGuard.ts"), "utf8");
const currencyGuardSource = fs.readFileSync(path.join(process.cwd(), "src/currencyGuard.ts"), "utf8");
const combinedGuardsSource = formatGuardSource + "\n" + documentGuardSource + "\n" + currencyGuardSource;

const sampleTickers = ["PLTR", "CALM", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "ADBE", "FMX", "KOF", "PBR", "VALE", "MELI"];
const hasHardcodedTickerLiteral = sampleTickers.some(t => 
  combinedGuardsSource.includes(`"${t}"`) || 
  combinedGuardsSource.includes(`'${t}'`) || 
  combinedGuardsSource.includes(`\`${t}\``)
);
const hasSyntheticFallbacks = formatGuardSource.includes("188.75") || 
                              formatGuardSource.includes("33.40") ||
                              /\|\s*Company\s*\|\s*Role\s*\|\s*\d+%/i.test(formatGuardSource);
const noHardcodedTickersInGuard = !hasHardcodedTickerLiteral && !hasSyntheticFallbacks;

// Verify Zero Persistent File Leaks & Clean Environment Isolation
const serverSource = fs.readFileSync(path.join(process.cwd(), "server.ts"), "utf8");
const serverCloudSource = fs.readFileSync(path.join(process.cwd(), "server.cloud.ts"), "utf8");
const typesSource = fs.readFileSync(path.join(process.cwd(), "src/types.ts"), "utf8");

const noPersistentFileLeaks = 
  !serverSource.includes(".persistent") &&
  !serverSource.includes("toggle-persistent") &&
  !serverSource.includes("purge-unpinned") &&
  !serverCloudSource.includes(".persistent") &&
  !serverCloudSource.includes("toggle-persistent") &&
  !serverCloudSource.includes("purge-unpinned") &&
  !typesSource.includes("persistent?:");

const cleanIsolationActive = 
  serverSource.includes("function enforceCleanTickerEnvironment") &&
  serverSource.includes("enforceCleanTickerEnvironment(newTicker,") &&
  serverSource.includes("delete state.crosscheckVerdict;");

// Dual Visualizer Parity Verification (Flywheel vs. Linear Value Chain)
const testOrganicFlywheel = `
# Valuation Analysis: DEMO
#### 1.7 The 5-Stage Compounding Flywheel Architecture
1. **Marketplace Scale:** Traffic expands.
2. **Merchant Monetization:** Sellers join platform.
3. **Logistics Reinforcement:** Fulfillment centers densify.
4. **Credit Underwriting:** Fintech spreads expand.
5. **Reinvestment Engine:** Cash flows re-fund customer acquisition and traffic.
`;

const testLinearChain = `
# Valuation Analysis: DEMO
#### 1.7 Compounding Architecture: LINEAR VALUE CHAIN / CYCLICAL COMMODITY (NO ORGANIC FLYWHEEL)
1. **Disciplined Project Screening:** Selective bidding on fixed-unit contracts.
2. **Fleet Mobilization:** Staging yellow iron in regional hubs.
3. **Precision Execution:** Grading site pads with GPS telematics.
4. **Milestone Cash Collection:** Releasing retainage and collecting catch-up margins.
5. **Discretionary Capital Allocation:** Reinvestment is manual via M&A and fleet replacement.
`;

const cleanedOrganicFlywheel = cleanMarkdownForRendering(testOrganicFlywheel);
const organicFlywheelValid = cleanedOrganicFlywheel.includes("S5 ==>|<b>Closed-Loop Compounding Reinvestment</b>| S1") &&
                             cleanedOrganicFlywheel.includes("##### Flywheel Mechanics Walkthrough");

const cleanedLinearChain = cleanMarkdownForRendering(testLinearChain);
const linearChainValid = cleanedLinearChain.includes("S1 --> S2") &&
                         cleanedLinearChain.includes("S4 --> S5") &&
                         !cleanedLinearChain.includes("==>|<b>Closed-Loop Compounding Reinvestment</b>| S1") &&
                         !cleanedLinearChain.includes("==> S1") &&
                         cleanedLinearChain.includes("Linear Value Chain Architecture (Audited: No Organic Flywheel)") &&
                         cleanedLinearChain.includes("##### Linear Value Chain Walkthrough");

// Static Prompt Formatting Linter: Verify all 12 Prompts enforce negative formatting directives
const allPromptsList = [...MASTER_PROMPTS, CROSSCHECK_PROMPT];
let allPromptsHaveFormattingDirectives = true;
for (const p of allPromptsList) {
  const hasFormattingDirective = 
    p.text.includes("CRITICAL FORMATTING DIRECTIVE") ||
    /strictly forbidden from outputting/i.test(p.text);
  if (!hasFormattingDirective) {
    console.error(`FAIL: Prompt Part ${p.id} missing mandatory CRITICAL FORMATTING DIRECTIVE!`);
    allPromptsHaveFormattingDirectives = false;
  }
}

console.log(`Dossier Format Guard - Static Prompt Directives (All 12 Prompts): ${allPromptsHaveFormattingDirectives ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Mermaid Preservation: ${hasMermaid ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Rogue Block Unwrapping: ${unwrappedBullets ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Zero Raw LaTeX: ${noLatex ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Zero Premature Flywheels: ${noPrematureFlywheel ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - GFM Table Normalization: ${normalizedTable ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Competitor Radar GFM Table: ${normalizedRadar ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - DCF Scenario GFM Table (Zero Box Chars): ${normalizedDcfBox ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Lynch Continuum GFM Table: ${normalizedLynch ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Target Price Band GFM Table: ${normalizedPriceBand ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Definitive Verdict GFM Table: ${normalizedVerdict ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Desk Nomenclature Scrubbing: ${noAcademicCreatorNames ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Zero Hardcoded Tickers/Prices: ${noHardcodedTickersInGuard ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Zero Persistent File Leakage: ${noPersistentFileLeaks ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Clean Ticker Isolation Active: ${cleanIsolationActive ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Dual Visualizer Parity (Organic Flywheel): ${organicFlywheelValid ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Dual Visualizer Parity (Linear Value Chain Zero-Loop): ${linearChainValid ? "PASS" : "FAIL"}`);
console.log(`Dossier Format Guard - Exact Fences (Expected 2, Got ${fenceCount}): ${fenceCount === 2 ? "PASS" : "FAIL"}`);

if (
  !allPromptsHaveFormattingDirectives ||
  !hasMermaid ||
  !unwrappedBullets ||
  !noLatex ||
  !noPrematureFlywheel ||
  !normalizedTable ||
  !normalizedRadar ||
  !normalizedDcfBox ||
  !normalizedLynch ||
  !normalizedPriceBand ||
  !normalizedVerdict ||
  !noAcademicCreatorNames ||
  !noHardcodedTickersInGuard ||
  !noPersistentFileLeaks ||
  !cleanIsolationActive ||
  !organicFlywheelValid ||
  !linearChainValid ||
  fenceCount !== 2
) {
  console.error("FAIL: Dossier Format Guard verification failed!");
  process.exit(1);
}

// 13. Verify Visualizer Chart Disambiguation & Single Cardinality Guard
console.log("\n--- Gate 13: Visualizer Chart Disambiguation & Single Cardinality Guard ---");
import { getTableChartType } from "../src/components/MarkdownView.js";
import { convertMarkdownToHtml } from "../src/utils/googleDocs.js";

const rorcHeaders = [
  "RORC Calculation Methodology (Q2 2017 – Q2 2026 Full 10-Period Horizon)",
  "Starting Owner Earnings (Q2 2017) ($M)",
  "Ending Owner Earnings (Q2 2026) ($M)",
  "Numerator: Earnings Power Variance ($M)",
  "Denominator: Cumulative Capital Retained ($M)",
  "Calculated RORC (%)",
  "Hurdle Rate (10.00%) Verdict"
];
const rorcRows = [
  ["1. Economic Normalized Basis", "$144.10", "$1,863.00", "+$1,718.91", "$6,067.89", "28.33%", "PASS (> 10.00%)"],
  ["2. Loan-Adjusted Cash Owner Earnings Basis (OCF - Loans - Maint. CapEx)", "$280.56", "$4,022.26", "+$3,741.70", "$9,474.89", "39.49%", "PASS (> 10.00%)"]
];

const cagrHeaders = [
  "Longitudinal Metric Series",
  "Q2 2017 Base ($M)",
  "Q2 2021 Base ($M)",
  "Q2 2023 Base ($M)",
  "Q2 2026 TTM ($M)",
  "3-Year CAGR (50% Wt)",
  "5-Year CAGR (30% Wt)",
  "10-Period CAGR (20% Wt, N=9 / N=10)",
  "Synthesized CSV-Weighted Growth Rate"
];
const cagrRows = [
  ["Consolidated Revenue (revenue)", "$1,040.68", "$5,524.01", "$12,463.00", "$35,182.00", "41.33%", "44.82%", "47.85%", "43.68%"],
  ["Forensic Normalized Owner Earnings (Trough Q2 26 Endpoint)", "$165.56", "$423.87", "$1,847.00", "$3,005.68", "17.62%", "47.96%", "37.98%", "30.80%"],
  ["WC-Stripped CSV Owner Earnings (OCF ex-WC - Maint. CapEx - SBC)", "$165.56", "$423.87", "$2,431.00", "$4,500.88", "22.79%", "60.40%", "44.33%", "38.38%"]
];

const trendHeaders = [
  "Metric ($ Millions, except %)",
  "Q2 2017",
  "Q2 2018",
  "Q2 2019",
  "Q2 2020",
  "Q2 2021",
  "Q2 2022",
  "Q2 2023",
  "Q2 2024",
  "Q2 2025",
  "Q2 2026 (TTM)"
];
const trendRows = [
  ["Operating Cash Flow (GAAP)", "$371.72", "$149.85", "$289.68", "$849.85", "$618.87", "$1,639.70", "$4,537.00", "$5,971.00", "$7,913.16", "$13,163.68"],
  ["Total CapEx (capitalExpenditure)", "($74.34)", "($87.07)", "($122.39)", "($160.40)", "($422.70)", "($564.17)", "($421.00)", "($636.00)", "($1,064.24)", "($1,415.69)"],
  ["Maintenance CapEx (1.0x D&A)", "($34.93)", "($44.40)", "($56.20)", "($84.55)", "($145.79)", "($303.18)", "($473.00)", "($578.00)", "($680.00)", "($985.00)"],
  ["Normalized Owner Earnings (Forensic Basis)", "$165.56", "($19.01)", "($35.22)", "$45.85", "$423.87", "$1,328.00", "$1,847.00", "$3,058.53", "$4,865.03", "$3,005.68"]
];

const rorcChartType = getTableChartType(rorcHeaders, rorcRows);
const cagrChartType = getTableChartType(cagrHeaders, cagrRows);
const trendChartType = getTableChartType(trendHeaders, trendRows);

const rorcCorrectlyRejected = rorcChartType === null;
const cagrCorrectlyRejected = cagrChartType === null;
const trendCorrectlyAccepted = trendChartType === "trend";

console.log(`RORC Table Classification (Must be null, got ${rorcChartType}): ${rorcCorrectlyRejected ? "PASS" : "FAIL"}`);
console.log(`CAGR Table Classification (Must be null, got ${cagrChartType}): ${cagrCorrectlyRejected ? "PASS" : "FAIL"}`);
console.log(`Historical Cash Flow Table Classification (Must be trend, got ${trendChartType}): ${trendCorrectlyAccepted ? "PASS" : "FAIL"}`);

if (!rorcCorrectlyRejected || !cagrCorrectlyRejected || !trendCorrectlyAccepted) {
  console.error("FAIL: getTableChartType misclassified tables!");
  process.exit(1);
}

// Test End-to-End HTML conversion with all 3 tables present in a single dossier markdown
const multiTableMd = `
# Valuation Analysis: TEST

## Part 1: Capital Allocation
| ${rorcHeaders.join(" | ")} |
| ${rorcHeaders.map(() => ":---").join(" | ")} |
${rorcRows.map(r => `| ${r.join(" | ")} |`).join("\n")}

## Part 3: Cash Flow Integrity
### 1.4 Historical Cash Flow & Owner Earnings Trend
| ${trendHeaders.join(" | ")} |
| ${trendHeaders.map(() => ":---").join(" | ")} |
${trendRows.map(r => `| ${r.join(" | ")} |`).join("\n")}

### 1.5 Longitudinal Growth Rate Calibration
| ${cagrHeaders.join(" | ")} |
| ${cagrHeaders.map(() => ":---").join(" | ")} |
${cagrRows.map(r => `| ${r.join(" | ")} |`).join("\n")}
`;

const renderedHtml = convertMarkdownToHtml(multiTableMd, "TEST_Valuation_Dossier.html", "TEST");
const trajectoryMatches = renderedHtml.match(/<span class="chart-title">\s*Cash Flow (?:&amp;|&) Owner Earnings Trajectory\s*<\/span>/gi) || [];
const exactSingleTrajectory = trajectoryMatches.length === 1;

console.log(`Single Trajectory Chart Latch (Expected exactly 1, got ${trajectoryMatches.length}): ${exactSingleTrajectory ? "PASS" : "FAIL"}`);

if (!exactSingleTrajectory) {
  console.error(`FAIL: convertMarkdownToHtml rendered ${trajectoryMatches.length} trajectory charts (Must be exactly 1)!`);
  process.exit(1);
}

// Sub-test: Revenue Segment Mix Column Disambiguation (% of Total vs YoY Growth Rate)
const segmentTableMd = `
## Part 1: Strategic & Moat Analysis
### 1.2 Business Model & Revenue Segments
| Operating Business Segment | TTM Revenue ($M) | % of Total Revenue | YoY Growth Rate (%) | Key Drivers |
| :--- | :---: | :---: | :---: | :--- |
| Core Services | $8,640 | 86.4% | +42.3% | Expanding ecosystem monetization |
| Retail Products | $1,360 | 13.6% | +75.4% | Direct sales surge |
| — Aux Sub-Segment | $300 | 3.0% | +10.0% | Internal subcomponent |
| Total Consolidated Revenue | $10,000 | 100.0% | +45.0% | Full base |
`;

const segmentHtml = convertMarkdownToHtml(segmentTableMd, "TEST_Valuation_Dossier.html", "TEST");
const servicesHas86 = segmentHtml.includes("Core Services") && segmentHtml.includes("86.4%") && !segmentHtml.includes('title="Core Services: 42.3%"');
const productsHas13 = segmentHtml.includes("Retail Products") && segmentHtml.includes("13.6%") && !segmentHtml.includes('title="Retail Products: 75.4%"');
const omittedAuxSub = !segmentHtml.includes('title="— Aux Sub-Segment');

const segmentDisambiguationPassed = servicesHas86 && productsHas13 && omittedAuxSub;

console.log(`Revenue Segment Disambiguation (Prioritize % Total over YoY Growth & Omit Sub-components): ${segmentDisambiguationPassed ? "PASS" : "FAIL"}`);

if (!segmentDisambiguationPassed) {
  console.error("FAIL: Revenue Segment chart latched onto YoY growth or included sub-components instead of % of Total Revenue!");
  process.exit(1);
}

// 14. Verify Hardcore Anti-Anchoring Firewall & Multi-Mode Prompt Integrity
console.log("\n--- Gate 14: Hardcore Anti-Anchoring Firewall & Multi-Mode Prompt Integrity ---");
import { SLINGSHOT_PROMPT, SENTINEL_PROMPT } from "../src/prompts.js";

// Check that SLINGSHOT_PROMPT and SENTINEL_PROMPT have required directives
const slingshotValid = 
  SLINGSHOT_PROMPT.text.includes("CRITICAL FORMATTING DIRECTIVE") &&
  SLINGSHOT_PROMPT.text.includes("CRITICAL VOICE DIRECTIVE") &&
  SLINGSHOT_PROMPT.text.includes("4-Vector Buy-Side Forensic Cash Integrity Audit") &&
  SLINGSHOT_PROMPT.text.includes("SUGGESTED ACTION: INVEST / PASS / ESCALATE") ||
  SLINGSHOT_PROMPT.text.includes("INVEST / PASS / ESCALATE");

const sentinelValid = 
  SENTINEL_PROMPT.text.includes("CRITICAL FORMATTING DIRECTIVE") &&
  SENTINEL_PROMPT.text.includes("CRITICAL VOICE DIRECTIVE") &&
  SENTINEL_PROMPT.text.includes("Prior Dossier Part 11 Monitoring Dashboard Audit") &&
  SENTINEL_PROMPT.text.includes("Universal Transitory vs. Structural Standard (Snowstorm Protocol)") &&
  SENTINEL_PROMPT.text.includes("HOLD / ACCUMULATE / LIQUIDATE") &&
  !SENTINEL_PROMPT.text.includes("TRIM is permitted");

console.log(`Slingshot Prompt Integrity (6 Pillars, Voice, Formats, ESCALATE directive): ${slingshotValid ? "PASS" : "FAIL"}`);
console.log(`Sentinel Prompt Integrity (Monitoring, Snowstorm, 4 Isolation Gates, Zero TRIM): ${sentinelValid ? "PASS" : "FAIL"}`);

// Check that server.ts does NOT inject pythonValuation into buildPromptRequest or prepareFileContextParts
const serverCode = fs.readFileSync(path.join(process.cwd(), "server.ts"), "utf8");
const promptBuilderCode = serverCode.slice(serverCode.indexOf("function buildPromptRequest"), serverCode.indexOf("function prepareFileContextParts") + 600);
const zeroPythonInPrompts = !promptBuilderCode.includes("pythonValuation") && !promptBuilderCode.includes("bolsa_multiple");

console.log(`Hardcore Anti-Anchoring Firewall (Zero Python in Prompt Pre-Flight Context): ${zeroPythonInPrompts ? "PASS" : "FAIL"}`);

if (!slingshotValid || !sentinelValid || !zeroPythonInPrompts) {
  console.error("FAIL: Gate 14 Anti-Anchoring Firewall or Multi-Mode prompt integrity failed!");
  process.exit(1);
}

console.log("\n=== ALL 14 VERIFICATION GATES PASSED PERFECTLY ===");



```

---
*End of Value Investing Terminal Audit Bundle.*
