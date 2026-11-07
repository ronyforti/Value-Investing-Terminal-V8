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
