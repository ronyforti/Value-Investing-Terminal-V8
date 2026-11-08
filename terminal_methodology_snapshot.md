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
