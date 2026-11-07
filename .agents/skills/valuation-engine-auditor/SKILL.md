---
name: valuation-engine-auditor
description: Use this skill to execute, verify, and audit the institutional buy-side valuation engine. Enforces the Buffett-Munger-Lynch Cash-Flow Sovereign Model (100% Probability-Weighted Expected DCF, Zero-Growth EPV Floor benchmark, ARV eliminated), 10% static hurdle rate, Owner Earnings adjustments, RORC mechanics, and Step 12 forensic audit crosschecks.
---

# Valuation Engine Auditor Skill: Forensic Valuation Framework

This skill governs the execution, sanity-checking, and forensic auditing of all intrinsic value calculations and risk underwriting in the **Value Investing Terminal**.

## Canonical Architecture Reference
- **Prompts & Directives:** [`src/prompts.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/prompts.ts) (Parts 6–12)
- **Methodology Snapshot:** [`terminal_methodology_snapshot.md`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/terminal_methodology_snapshot.md)
- **Mathematical Reference:** [`references/greenwald_valuation_formulas.md`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/.agents/skills/valuation-engine-auditor/references/greenwald_valuation_formulas.md)

---

## 1. The Cash-Flow Sovereign Valuation Framework (Buffett-Munger-Lynch)

Under the classical cash-flow sovereign doctrine (Warren Buffett, Charlie Munger, Peter Lynch), the intrinsic value of any business is unequivocally the discounted present value of all distributable cash flows owners can withdraw over its remaining life:

```
[ Probabilistic 10-Yr Expected DCF ]  --------> 100% Sovereign Intrinsic Value Anchor (Bear 25% / Base 50% / Bull 25%)
                                                ▲
[ Zero-Growth EPV Floor Benchmark ]   --------> Capitalized Earning Power (Normalized Owner Earnings / 10% Hurdle)
                                                (Net Asset Reproduction Floor ARV Permanently Eliminated)
```

### Tier 1: Zero-Growth Earnings Power Value (EPV) (The Sustainable No-Growth Floor)
- **Definition:** The capitalized value of the business operating in perpetuity with **zero growth**, assuming current competitive advantages hold.
- **Plain-Text Formulas (Zero Raw LaTeX):**
  > **Formula / Calculation:** Operating EPV = Sustainable Unlevered NOPAT / Hurdle Rate (10.00%)
  > **Formula / Calculation:** Equity EPV = Operating EPV + Net Cash - Audited Footnote Debt Equivalents
  *(Where Hurdle Rate = 10.00% static discount rate, Sustainable NOPAT = Normalized Operating Income * (1 - Effective Tax Rate) + D&A - Audited Maintenance CapEx, and Net Cash = (Cash + Marketable Securities - Restricted Customer Deposits) - (Short-Term Debt + Long-Term Debt))*.
- **Operating Lease Guardrail:** If operating lease expenses are already deducted within EBIT, do NOT deduct capitalized lease obligations in the equity bridge unless EBIT was adjusted to add back the lease interest/amortization portion.
- **Industry-Specific EPV Floor Routing:**
  - *Non-Financials:* Capitalize Sustainable NOPAT at 10.00%, bridge to equity value via Net Cash.
  - *Banks & Financials:* `Operating EPV = Normalized Net Income / 0.10` (direct equity capitalization; customer deposits are operating financing).
  - *Insurers:* `Operating EPV = [(Underwriting Profit + Net Investment Yield - Taxes) / 0.10] + Tangible Capital Surplus`.
  - *REITs:* `Operating EPV = AFFO / 0.10` (or `Net Operating Income / Market Cap Rate - Gross Debt`).
- **Benchmark Role:** Serves as the conservative sanity-check floor benchmark to show how much of the stock price is supported by current operations with zero future growth.

### Tier 2: Probabilistic 10-Year Owner Earnings DCF (Sovereign Intrinsic Value)
- **The Lifetime Cash Flow Principle:**
  - The intrinsic value of any business is the discounted present value of all cash that can be distributed to owners over its remaining operating life:
    > **Formula / Calculation:** Value of an Asset = Sum from t=1 to Infinity of [(Cash Inflows_t - Cash Outflows_t) / (1 + Hurdle Rate)^t]
- **Initial Cash Flow Anchor:** Start from the 3-Year Rolling Average Normalized Owner Earnings from Part 3 Section 1.5 to eliminate cyclical peak/trough distortions.
- **Longitudinal Growth Anchor:** Anchor base-case projections to the Synthesized CSV-Weighted Longitudinal Growth Rate (50% 3-Yr, 30% 5-Yr, 20% 10-Yr CAGR).
- **The Free-Growth Trap Elimination & Reinvestment Drag:**
  - Distributable Free Cash Flow must deduct the capital investment required to achieve projected growth:
    > **Formula / Calculation:** Reinvestment Rate_t = Projected Growth Rate_t / Marginal ROIIC
    > **Formula / Calculation:** Distributable FCF_t = Sustainable NOPAT_t * (1 - Reinvestment Rate_t)
  - Growth without reinvestment is strictly forbidden. In the terminal year (Year 10), taper growth to 2.0%–2.5% and set `Terminal Reinvestment Rate = Terminal Growth Rate / Long-Run ROIC`.
- **Probability-Weighted Expected DCF (Part 7 & Part 8):**
  - Bear Case (25% Probability): Low growth, margin compression, high maintenance capex.
  - Base Case (50% Probability): Historical trend continuation, steady normalized margins.
  - Bull Case (25% Probability): Secular TAM expansion, operating leverage, pricing power execution.
  > **Formula / Calculation:** Expected DCF = (0.25 * Bear Case) + (0.50 * Base Case) + (0.25 * Bull Case)
- **Specialized Financial Institution Models:**
  - *Banks & Financials:* 10-Year Excess Return on Equity (ROE) / Residual Income Model:
    > **Formula / Calculation:** Annual Excess Return = Net Income - (10.00% Hurdle Rate * Beginning Tangible Common Equity)
    > **Formula / Calculation:** Equity Value = Current TCE + Sum from t=1 to 10 of [Excess Return_t / (1.10)^t] + PV of Terminal Excess Return
  - *REITs:* 10-Year AFFO Discount Model using per-share AFFO growth and a terminal multiple anchored to Net Asset Value.
- **Synthesis Weighting Directive (Part 8):**
  - **100% Probability-Weighted Expected DCF (or R&D-Capitalized Expected DCF for verified Tech Compounders passing the Red Queen Gate):** Authoritative Intrinsic Value per share. Quality-Tiered Margin of Safety: 15%–25% for Wide-Moat Compounders, 25%–35% for Cyclicals, 35%–50% for Turnarounds.
  - Net Asset Reproduction Cost (ARV) is completely eliminated from intrinsic value weighting.

### Tier 3: Market-Implied Reverse DCF (Price-Implied Expectations / PIE)
Before establishing final forward DCF models, invert current Market Enterprise Value (or Market Price):
1. **Implied Organic Sales Growth (`g_implied`):** Solve for the 10-year revenue CAGR implied by the current market price at the 10.00% Static Hurdle Rate.
2. **Implied Operating Profit Margin (`OPM_implied`):** Solve for the steady-state operating profit margin implied by current valuation.
3. **Market-Implied Competitive Advantage Period (CAP):** How many continuous years of excess ROIC does the stock price assume?
4. **Base Rate Calibration:** Compare implied parameters against empirical 10-year industry base rate distributions. Flag overvaluation if expectations require statistically rare top-decile sustained compounding.
5. **[Sector-Specific Inversion Routing]:**
   - Non-Financials: Invert EV for `g_implied` and `OPM_implied`.
   - Banks: Invert Price-to-Tangible Book (`P/TBV`) to solve for implied through-the-cycle sustainable ROTCE.
   - Insurers: Invert `P/TBV` to solve for implied sustainable Combined Ratio and investment yield.
   - REITs: Invert `Price/AFFO` to solve for implied Net Property Capitalization Rate.

---

## 2. Normalized Owner Earnings Adjustments

Standard accounting Free Cash Flow (`OCF - Total CapEx`) is often distorted. Calculate **Normalized Owner Earnings**:

> **Formula / Calculation:** Owner Earnings = Operating Cash Flow - Maintenance CapEx - Stock-Based Compensation +/- Working Capital Normalization + Excess Day-1 Fintech CECL Reserve Add-Back

### Critical Adjustments:
1. **Maintenance vs. Growth CapEx Formulation (2-Step Empirical Protocol):**
   - Step A: Discrete Growth CapEx Carve-Out — Inspect 10-K/10-Q Item 7 MD&A disclosures for explicit growth investments (greenfield facilities, capacity additions, cloud buildouts) and carve them out directly from Total CapEx. Never classify disclosed capacity additions as maintenance simply because single-quarter cyclical revenue dipped.
   - Step B: 3-Year Rolling D&A Baseline — Benchmark remaining Maintenance CapEx against 0.85x–1.10x 3-Year Rolling Average tangible Depreciation & Amortization (D&A). Exclude discrete greenfield growth capex.
2. **Stock-Based Compensation (SBC) as Hard Cash Expense:**
   - SBC is NOT free money. Deduct 100% of SBC as a direct operating cash outflow to protect against ongoing shareholder dilution.
3. **Working Capital Normalization:**
   - Strip out temporary, lumpy quarter-end working capital swings (e.g., timing of customer prepayments or receivables runoff).
4. **The "Bad Year" & Cyclical Trough Normalization Protocol:**
   - *TTM Operational Anchor:* Use TTM cash flow to capture current scale, but add back non-repeatable working capital spikes, discrete litigation charges, or discretionary inventory accumulation.
   - *Through-the-Cycle Operating Margin Override:* If TTM was crushed by a temporary industry trough or commodity spike, apply the normalized margin formula:
     > **Formula / Calculation:** Sustainable Normalized NOPAT = Current Scale (Revenue) * 5-to-10 Year Median Operating Margin * (1 - Effective Tax Rate)
     This preserves current productive scale while repairing temporary margin compression.
5. **Levered vs. Unlevered Owner Earnings Reconciliation:**
   - *Levered Owner Earnings (Equity cash flow):* `OCF - Maintenance CapEx - SBC`
   - *Unlevered Owner Earnings (Firm cash flow):* `Levered Owner Earnings + [Net Interest Expense * (1 - Effective Tax Rate)]`
6. **Red Queen Test & Tech R&D Capitalization:**
   - For verified tech/software compounders passing the Red Queen Gate, Growth R&D is capitalized and after-tax Growth R&D-Adjusted Owner Earnings carries into Part 7 (Adjusted DCF) and serves as an active valuation input for Part 8 Sovereign Intrinsic Value:
     > **Formula / Calculation:** Growth R&D-Adjusted Owner Earnings = Normalized Owner Earnings + After-Tax Growth R&D - Amortization of Prior Capitalized R&D.

---

## 2.1 Symmetrical Balance Sheet Synthesis & Off-Balance-Sheet Audit (Part 5)

Under institutional balance-sheet defense, the analyst must independently verify assets and liabilities beyond stated GAAP book value:
> **Formula / Calculation:** Symmetrical Adjusted Net Economic Value = Base Stated Book Value + Hidden Off-Balance-Sheet Assets - Audited Unrecorded Liabilities

- **Mandatory Table Schema:** Must strictly output as a 3-column GFM pipe table (`| Off-Balance-Sheet Vector | Valuation Spread ($M) | Balance Sheet Impact |`).
- **Assets Audited:** Real estate replacement values, inventory LIFO reserves, under-recognized intellectual property/royalties, and overfunded pension assets.
- **Liabilities Audited:** Operating leases under ASC 842, unfunded pension PBO deficits, environmental/legal contingencies, asset retirement obligations, and confirmed legal claims (enforcing the Confirmed Legal Contingency Boundary: deduct strictly confirmed court judgments, posted appeal bonds, signed settlements, or GAAP-probable ASC 450 reserves; strictly excluding speculative class-action complaint prayers and ongoing operational purchase contracts).

---

## 2.2 Business Architecture & Flywheel Falsification Audit (Part 4)

- **Empirical Moat Isolation:** Distinguish between genuine network/reinvestment flywheels and linear supply-chain processors.
- **Mandatory Falsification Directive:** For cyclical commodity processors or linear manufacturers without an organic compounding loopback, the terminal **strictly forbids inventing artificial flywheels**.
- **Audited Declaration:** Must explicitly declare `#### 1.7 Compounding Architecture: LINEAR VALUE CHAIN / CYCLICAL COMMODITY (NO ORGANIC FLYWHEEL)` and detail the linear operating constraints.
- **HTML Deduplication:** In standalone HTML dossiers, redundant stage text lists ("Flywheel Mechanics Walkthrough") are suppressed when the interactive SVG radial diagram and conveyor cards render.

---

## 3. Executive Capital Allocation & Governance Discipline

### 3.1 Retained Earnings Test (5-Year Rolling Window & Total Wealth Basis)
Verify that every dollar retained by management created at least one dollar of total shareholder wealth:
> **Formula / Calculation:** Market Value Creation Ratio = (5-Year Market Capitalization Change + 5-Year Cumulative Cash Dividends Paid) / 5-Year Cumulative Retained Earnings
- **Benchmark:** Pass if Ratio >= 1.0. Flag if < 1.0 (destroying economic capital).
- **Sector Routing:** Bypass for REITs (must distribute >= 90% of income; evaluate incremental ROIC on development pipeline); measure mid-cycle to mid-cycle for Cyclicals.

### 3.2 Share Repurchase Value Audit
- **Price Discipline:** Repurchases must occur at opportunistically depressed multiples (below historical median Price-to-Normalized-FCF / Owner Earnings). In Step 1 (Section 2.9), evaluate historical buybacks against empirical historical valuation multiples and share count contraction without forward-referencing Step 7's not-yet-computed Expected DCF (exact Expected DCF comparison is cross-checked in Parts 8–12).
- **Share Count Contraction:** Verify that 5-year Diluted Share Count contracted (`Share Change < 0`). Flag if buybacks merely neutralized executive SBC dilution at elevated multiples while share count expanded.

### 3.3 Return on Retained Capital (RORC — Recency-Weighted 50/30/20)
To verify management's capital allocation skill while eliminating the 10-year scale drag:
> **Formula / Calculation:** RORC = (50% * 3-Yr RORC) + (30% * 5-Yr RORC) + (20% * 10-Yr RORC)
- **Benchmark:** RORC must comfortably exceed **10.00%**.

---

## 4. 4-Vector Buy-Side Cash Integrity Protocol (3-Year Rolling Window)

Audit earnings quality and cash flow integrity using empirical buy-side tests evaluated over a 3-year rolling window:
* **Elimination of Brittle Academic Ratios:** Brittle single-period academic ratios (DSO, AR Divergence, DPO, Sloan NOA Accruals, Beneish M-Score) are permanently eliminated. They mechanically generate false fraud alarms during commodity price drops, inventory cycles, or cash-funded M&A.
* **Charlie Munger Zero-EBITDA Doctrine:** EBITDA and Adjusted EBITDA are permanently rejected as valid measures of cash flow, operating earnings, or leverage across the entire terminal.
1. **Vector 1 (3-Year Cumulative Cash Conversion Reality):** Cumulative 3-year Operating Cash Flow must equal >= 85%–100% of cumulative GAAP Net Income. Exclude single-quarter working capital timing swings.
2. **Vector 2 (Charlie Munger Zero-EBITDA & Non-GAAP Add-Back Rejection):** Strip out recurring add-backs for Stock-Based Compensation, restructuring, acquisition integration, and litigation. Flag if SBC exceeds 10% of OCF (or > 5% of Revenue) without executive deduction.
3. **Vector 3 (Aggressive Expense Capitalization & Revenue Pull-Forward):** Audit capitalized software and unbilled contract assets growing at > 2.0x revenue growth over a multi-year period.
4. **Vector 4 (Balance Sheet Asset & Working Capital Integrity):** Productive capital deployment (cash-funded M&A PP&E, factory buildouts, IRS tax refund receivables) is strictly recognized as productive capital deployment and NOT penalized as accrual manipulation.
5. **Confirmed Legal Contingency Boundary:** Deduct strictly confirmed judicial judgments, posted appeal bonds, signed settlements, or GAAP-probable ASC 450 reserves. Speculative class-action complaint prayers are strictly excluded from balance-sheet debt deductions.
6. **Sector Routing:** For Banks, audit Provision for Credit Losses vs. Net Charge-Offs; for Insurers, audit Loss Reserve development notes; for REITs, audit tenant credit and Net Debt to AFFO (or NOI).

---

## 5. Net Cash Cushion & Category Archetype

1. **The Net Cash Test (Hardened Balance Sheet Formula):**
   > **Formula / Calculation:** Net Cash = (Cash & Equivalents + Short-Term Marketable Securities - Restricted Customer Deposits) - (Short-Term Debt + Long-Term Debt)
   > **Formula / Calculation:** Net Cash % of Market Cap = Net Cash / Market Capitalization
   - If `>= 10%`: Grants a tangible financial rebate / safety cushion.
2. **Dual-Margin of Safety Formulation:**
   - **Standard Margin of Safety:**
     > **Formula / Calculation:** Standard MOS = (Intrinsic Value - Market Price) / Intrinsic Value
   - **Cash-Adjusted Margin of Safety (Enterprise Value Discount):**
     > **Formula / Calculation:** Cash-Adjusted MOS = [(Intrinsic Value - Net Cash/sh) - (Market Price - Net Cash/sh)] / (Intrinsic Value - Net Cash/sh)
3. **Category Archetype Classification:** Categorize into one of the 7 disambiguated operational profiles:
   - *Fast Grower* (>= 20% sustainable organic top-line / volume CAGR)
   - *Wide-Moat Stalwart* (10-14% steady compounder with pricing power)
   - *Cyclical Compounder* (higher cycle trough-to-trough EPS/BVPS, rolling ROIC > 10.0%)
   - *Pure Commodity Cyclical* (undifferentiated spot price taker, mean-reverting ROIC)
   - *Slow Grower* (mature/utility, single-digit growth)
   - *Asset Play* (hidden real estate or liquid book surplus)
   - *Turnaround* (depressed margins with operational catalyst)

---

## 6. Step 12 Forensic Audit & Fact-Check Crosscheck Gate

Every completed valuation must pass the independent **Step 12 Forensic Fact-Check Crosscheck**:
1. **Pre-Flight Gates 0–4:** Roll Call of all 11 prior chapters (Gate 0), Zero Alien Contamination (Gate 1), Portfolio Mandate Alignment (Gate 2), Cash-Flow Valuation Consistency (Gate 3), and Mandatory Arithmetic Proof Scratchpad (Gate 4).
2. **Independent Mathematical Verification:** Recalculate Net Cash, FCF, Owner Earnings, Margins, Recency-Weighted RORC (50/30/20), 5-Year Rolling $1 Total Shareholder Value Test (including dividends), 4-Vector Buy-Side Cash Integrity Protocol (3-year rolling window; zero EBITDA), and Reverse DCF expectations against raw CSV and filings.
3. **Material Omission Audit:** Verify no unreserved contingencies, covenant triggers, debt maturity cliffs, or executive departures were overlooked.
4. **Explicit Claim Verification:** Cross-check market share, unit economics, and peer multiples against competitor filings.
5. **Causality & Narrative Check:** Verify that management explanations in transcripts match the economic facts of the business.

---

## 7. Buy-Side Desk Nomenclature & Zero-Academic-Citation Mandate

- **Institutional Voice Only:** All outputs represent an audited valuation deliverable from a senior buy-side desk. Textbooks, professors, and creator names are strictly omitted.
- **Nomenclature Mapping:**
  - *Greenwald EPV* ➔ **Earnings Power Value (EPV)** or **Zero-Growth EPV Floor**
  - *Greenwald Asset Value Reproduction* ➔ **Net Asset Reproduction Floor (ARV)** (Permanently eliminated under Cash-Flow Sovereign Model)
  - *Sloan Accrual Ratio* ➔ **Balance Sheet Accrual Ratio** or **Earnings Quality Spread**
  - *Beneish M-Score* ➔ **Earnings Manipulation Risk Index**
  - *Graham-Buffett-Greenwald Framework* ➔ **Cash-Flow Sovereign Valuation Framework** or **Proprietary Valuation Triad**
  - *Mauboussin / Rappaport Reverse DCF* ➔ **Market-Implied Expectations Reverse DCF**
  - *Schilit / O'glove Forensic Shenanigans* ➔ **Forensic Accounting & Earnings Quality Audit**
  - *Thorndike Capital Allocation / Buybacks* ➔ **Capital Allocation & Share Repurchase Discipline**
  - *Bill Gurley / Hamilton Helmer Moat Scorecard* ➔ **Platform Network Effects & Structural Moat Scorecard**

---

## 8. Portfolio Allocation Directives (Never-Trim Compounding Doctrine & 4-Gate Isolation Matrix)

- **Zero TRIM Mandate:** In accordance with institutional "Coffee-Can Compounding" (Thomas Phelps, Christopher Mayer, Philip Fisher, Charlie Munger, Warren Buffett), `TRIM` is permanently eliminated across all evaluation phases.
- **8.1 The Archetype Eligibility Gate (Never-Trim Compounding Scope):**
  - **Eligible Compounders:** The Never-Trim Compounding Doctrine applies strictly to:
    1. **Fast Growers**
    2. **Wide-Moat Stalwarts**
    3. **Verified Cyclical Compounders** (maintaining a normalized through-cycle ROIC > 10.0% static hurdle rate).
    - For these compounders, multiple expansion, high portfolio weighting (even past 20%–30%+ of portfolio equity), or cyclical margin troughs NEVER justify trimming.
  - **Category-Specific Exit Discipline:** Pure Commodity Cyclicals, Turnarounds, Slow Growers, and Asset Plays follow Peter Lynch & Charlie Munger's category-specific exit discipline (cycle peaks, inventory pileups, CapEx surges, or fair-value EPV convergence).
- **8.2 Mandatory 4-Gate Peer-Relative Isolation Diagnostic (3-Year Rolling Window):**
  Whenever an existing holding experiences revenue deceleration, margin compression, or a >20% price drawdown, the auditor must enforce:
  1. *Gate 1 (Peer-Relative Captivity & Share):* Contraction must be industry-wide (company market share stable/rising, customer captivity intact), verified via the Part 2 Radar against direct peers over a 3-year window.
  2. *Gate 2 (Gross Margin Pricing Power vs. Fixed-Cost Deleverage):* Gross Margin must hold firm over a 3-year rolling window (proving pricing power while Operating Margin temporarily deleverages on lower cyclical volume). Structural Gross Margin collapse triggers `LIQUIDATE`.
  3. *Gate 3 (Capital Allocation & Forensic Integrity):* Incremental through-cycle ROIC >= 10.0%, Buffett $1 Retained Earnings Test >= $1.00 on total wealth basis, and 3-year CFO >= 80% Net Income. Immediate breach on out-of-moat M&A diworseification, severe cash conversion deficits, or fraudulent accounting manipulation. Single-quarter working capital swings or cash M&A do not trip breaches.
  4. *Gate 4 (Zero-Base Thesis & Fade Recalibration):* Zero-base underwriting stripping MD&A excuses; recalculating EPV and Expected DCF with franchise fade.
     - **STRICT PROHIBITION OF SUNK-COST BIAS:** Gate 4 evaluates forward intrinsic value EXCLUSIVELY against CURRENT MARKET PRICE. Comparing forward intrinsic value against the user's historical purchase price (`user_cost_basis`) to justify `LIQUIDATE` is strictly forbidden. A price drawdown below historical purchase cost is an unrecoverable sunk cost and never constitutes thesis invalidation.
- **Permissible Directives for Existing Holdings (`holdsPosition: true`):**
  - **`HOLD`:** Default directive when Gates 1, 2, 3, and 4 PASS and market price trades above accumulation buy bands. Compounding moat, unit economics, and owner-operator integrity remain intact.
    - *Fortress Balance Sheet & Trough Protection:* If an existing holding holds Net Cash (or zero funded debt), passes Gates 1 and 2 over a 3-year cycle, and trades at or below its Zero-Growth EPV Floor or within its Target Buy Band, the Senior Value Investor has full authority to issue `HOLD` (or `ACCUMULATE`), recognizing cyclical trough earnings. Never liquidate a net-cash cyclical compounder at the trough of its commodity cycle.
  - **`ACCUMULATE`:** Permitted ONLY if Gates 1, 2, 3, and 4 PASS and market price trades at a >= 15%–20% Margin of Safety discount for Wide-Moat Compounders (>= 20%–25% for Cyclicals).
  - **`LIQUIDATE`:** Mandatory if the holding fails ANY of Gates 1, 2, 3, or 4 (structural moat decay, capital destruction/forensic breach, or thesis invalidation/category drift).
- **Permissible Directives for New Coverage (`holdsPosition: false`):**
  - **`INVEST`:** Stock trades at or below the required Margin of Safety hurdle rate.
  - **`PASS`:** Stock fails the Margin of Safety hurdle or possesses unquantifiable structural risks.
- **Crosscheck Tripwire:** Step 12 Crosscheck Gate 2 must verify that Step 11 enforced the Archetype Eligibility Gate and evaluated the 4-Gate Isolation Diagnostic for existing holdings. Any `TRIM` recommendation triggers an immediate, unrecoverable audit failure.

---

## 9. Mathematical & Verdict Continuity Mandate

To guarantee 100% mathematical consistency across Parts 3, 6, 7, 8, 11, and Step 12:

### 9.1 Part 6: EPV Adjusted NOPAT Alignment with Part 3 Maintenance CapEx
In Step 1 (Levered-to-Unlevered NOPAT Reconciliation), the NOPAT calculation must explicitly incorporate the audited Maintenance CapEx vs. D&A spread established in Part 3 Section 1.1:
> **Formula / Calculation:** NOPAT = Normalized Operating Income (EBIT) * (1 - Effective Tax Rate) + D&A - Audited Maintenance CapEx (from Part 3 Sec 1.1)
- **Dilution Rule:** 100% of Stock-Based Compensation must remain expensed inside Operating Income and NEVER added back.

### 9.2 Part 7: Unlevered Owner Earnings Parity for Enterprise-to-Equity Bridge
In Part 1 & Part 2 (DCF Projections & Bridge):
- Because the Enterprise-to-Equity Bridge adds Cash & Short-Term Investments and subtracts Gross Debt & Debt Equivalents, the cash flow stream discounted in Part 2 must be **Unlevered Normalized Owner Earnings**.
- If starting from Part 3's OCF-based Normalized Owner Earnings, add back After-Tax Interest Expense:
  > **Formula / Calculation:** Unlevered Owner Earnings = Normalized Owner Earnings + [Interest Expense * (1 - Effective Tax Rate)]
  This guarantees that debt obligations are not double-counted (once in the cash flow stream and again in the Gross Debt deduction).

### 9.3 Part 11: Intrinsic Value Invariance with Part 8 & Step 12 Gate 3
In Step 3 & Step 4 (Verdict & Actionable Decision Matrix):
- **Absolute Invariance:** Maintain strict Intrinsic Value invariance with Part 8. Keep the Synthesized Intrinsic Value ($XX.XX) and Standard Margin of Safety (XX.XX%) in Step 4 identical to Part 8 (satisfying Step 12 Gate 3).
- **Risk Underwriting Mechanism:** If the Part 10 Red Team audit uncovers elevated structural, cyclical, or governance risks, adjust the *required entry tier* (e.g., demanding the 35%–50% Screaming Buy Margin of Safety band rather than the 25% Target Buy band) rather than arbitrarily altering the Part 8 Intrinsic Value figure.

### 9.4 Signed Margin of Safety Contract
- In Part 11 Step 4 and the executive YAML frontmatter, the Standard Margin of Safety must strictly output as a signed percentage:
  - `+XX.XX% (Discount)` when Market Tape < Intrinsic Value.
  - `-XX.XX% (Deficit)` when Market Tape > Intrinsic Value.
- This contract guarantees deterministic programmatic parsing in downstream screeners and eliminates ambiguity between discounts and speculative premiums.

### 9.5 Operating Contract & Debt Bridge Boundary (Zero Double-Counting)
- **The Operational Expense Boundary:** Unconditional operational purchase obligations (e.g., AWS/Google Cloud hosting compute, software subscriptions, dedicated air/cargo freight charters) and unvested multi-year executive retention compensation (LTRP) represent ongoing operational costs funded by future revenues.
- **The Double-Count Prohibition:** If operating margins and COGS already expense ongoing technology, shipping, and personnel costs, deducting future commitments as lump-sum debt in the Equity Bridge (Parts 5, 6, 7) constitutes a textbook double-count.
- **SaaS Deferred Revenue:** Never deduct SaaS Deferred / Unearned Revenue as funded debt; it represents cash already collected for future high-margin delivery, not a financial creditor claim.

### 9.6 Fintech CECL Normalization & Loan Asset Parity
- **Day-1 Accounting Reserves vs. Real Cash Burn:** Under US GAAP (ASC 326 / CECL), expanding loan originations requires booking upfront lifetime expected losses on Day 1 before collecting interest income over the 12–24 month life of the loans. In a growing fintech/lending operation, upfront reserve builds are non-cash accounting accruals tied to portfolio expansion, NOT permanent operational cash burns.
- **Cash Flow Normalization:** Steady-state credit losses must equal actual trailing cash charge-offs plus a normalized net delinquency formation buffer, adding back 100% of excess upfront Day-1 CECL growth reserves to starting NOPAT/Owner Earnings.
- **Debt Bridge Parity:** When deducting fintech funding debt (SPEs, financial bills) in the Equity Bridge, the analyst must credit the performing net loan portfolio asset it finances, or isolate corporate debt from fintech asset-backed funding debt whose interest is already expensed inside COGS/EBIT.

### 9.7 Margin-Recovery Reinvestment Rate Defense & Cross-Industry Life-Cycle Rules
- **The Operating Leverage Principle:** When projected near-term NOPAT growth is driven by operating margin recovery from an operational, price-investment, or cyclical trough (operating leverage), cap the explicit reinvestment rate (20%–35%) rather than mechanically applying `Reinvestment Rate = g / ROIIC`. Profit expansion from margin normalization requires minimal incremental physical capital; forcing a rigid 60%+ reinvestment rate forces the company to re-purchase capacity it already owns.
- **Cross-Industry Life-Cycle Rules:**
  - *SaaS / Digital Platforms:* Base reinvestment on net capitalized software and incremental working capital, not gross revenue growth.
  - *Pharma & Biotech:* When blockbuster patents expire within the 10-year forecast window, enforce a Patent Cliff decay model (reducing post-patent revenues by 70%–85%) rather than extrapolating perpetual compound growth.
  - *Asset-Heavy Semis & Manufacturers:* Normalize peak fab/facility CapEx to through-cycle maintenance requirements so multi-year factory construction is not treated as permanent annual maintenance drag.

### 9.8 Secular Compounder vs. Cyclical Classification & 4-Point Disambiguation Standard (Part 9)
- **Multi-Year Volume Anchor:** Ground Peter Lynch classification strictly in 5-to-10 year multi-year top-line, GMV, and unit volume trends.
- **Deliberate Reinvestment Protection:** Prohibit tagging a company as "Cyclical" (in prose, tables, or YAML metadata) if its 5-to-10 year revenue and volume compound at >= 20% CAGR and near-term margin compression is driven by deliberate, moat-widening scale reinvestment (e.g. logistics/shipping subsidies or R&D offensives). True cyclicals experience contracting revenues and falling unit volumes during macro downturns. Fast growers and stalwarts experiencing deliberate reinvestment phases remain Fast Growers or Stalwarts.
- **4-Point Cyclical Compounder Disambiguation Test (The STLD Standard):**
  To prevent false cyclical classification of disguised secular compounders in capital-intensive sectors (e.g. Steel Dynamics - STLD, Nucor, Cal-Maine - CALM, semiconductor capital equipment leaders), the auditor must verify 4 empirical criteria across a 3-to-10 year recency-weighted window (50% 3-Yr / 30% 5-Yr / 20% 10-Yr):
  1. *Trough-to-Trough Escalation:* Positive operating cash flow at cycle bottoms with "higher lows" in EPS and Book Value per share across successive cycles (`EPS_Trough_N > EPS_Trough_N-1`).
  2. *Physical Volume Decoupling:* 5-to-10 year physical shipped volume (tons, shipments, capacity) compounds independent of volatile spot commodity price swings, driven by systematic market share gains against legacy high-cost peers.
  3. *Through-Cycle ROIC Superiority:* 3-to-10 year recency-weighted average ROIC (50% 3-Yr / 30% 5-Yr / 20% 10-Yr) comfortably exceeds the 10.0% static hurdle rate (typically 15%–25%+), driven by flexible, lowest-quartile variable cost structures.
  4. *Countercyclical Capital Allocation:* Maintains a fortress balance sheet (net cash or low leverage) and deploys cash countercyclically (repurchasing shares or acquiring distressed capacity during industry downturns).
  - *Audit Routing:* Companies passing these criteria MUST be classified as **`Cyclical Compounder`** and granted full Never-Trim Compounding protection in Part 11. Pure Commodity Cyclicals (flat multi-year volume, negative trough margins, sub-10% through-cycle ROIC) are routed to peak-cycle exits.

### 9.9 Gate 4 Mandatory Arithmetic Proof Scratchpad & Mathematical Proof Vectors (Step 12)
To eliminate autoregressive token smoothing and hallucinated math certifications across smaller and frontier models, Step 12 enforces **Gate 4 Pre-Flight Tripwires** requiring an explicit 6-row mathematical proof table before declaring any verification clean:
1. **Scenario Weighting Summation (Part 7, Sec 2):**
   > **Formula / Calculation:** Verified IV = (0.25 * Bear) + (0.50 * Base) + (0.25 * Bull)
   Compare against reported Synthesized Intrinsic Value (Standard Expected DCF or R&D-Capitalized Expected DCF for verified Tech Compounders). Any material variance > 1.0% (or > $0.25 per share) triggers an automatic calculation breach.
2. **Diluted Share Count Division (Parts 6, 7 & 8):**
   > **Formula / Calculation:** Verified Per-Share IV = [Audited Equity Value ($M) * 1,000,000] / Diluted Shares Outstanding
   Verifies that Common Diluted Shares from Form 10-Q/10-K (including options/RSUs) were used rather than basic shares. Any delta > $0.10 triggers an audit breach.
3. **Target Buy Price Band Math (Part 9, Sec 1.4 & Part 11):**
   - Quality-Tiered Target Buy Band (15%–25% MoS): `Reported Intrinsic Value * 0.75` to `Reported Intrinsic Value * 0.85` (`0.75x–0.85x IV` for Wide-Moat Compounders; `0.75x IV` / 25% MoS standard)
   - 35% Screaming Buy Band: `Reported Intrinsic Value * 0.65`
   - 50% Deep Value Band: `Reported Intrinsic Value * 0.50`
   Eliminates hallucinated round numbers. Any arbitrary drift > 1.0% triggers an audit breach.
4. **Signed Margin of Safety Contract (Part 11, Step 4 & YAML):**
   > **Formula / Calculation:** Verified MoS % = [(Reported Intrinsic Value - Market Tape Price) / Reported Intrinsic Value] * 100%
   Enforces signed contract (`+XX.XX%` discount, `-XX.XX%` deficit) and prevents denominator inversion (`(Tape - IV) / Tape`).
5. **Equity Bridge Summation & Operational Boundary Audit (Parts 5, 6 & 7):**
   > **Formula / Calculation:** Verified Equity Value = Enterprise Value + Cash - Funded Debt - Audited Off-Balance-Sheet Liabilities
   Verifies that line items sum to reported Equity Value within 1.0% rounding tolerance (for Banks, Insurers, and REITs evaluated via Direct Equity / Excess Return / AFFO models, operating deposits and float are not deducted as enterprise debt). Enforces the Confirmed Legal Contingency & Operating Contract Boundaries: deducting speculative uncertified class-action lawsuits, executory operating contracts (cloud compute, dedicated freight, unvested multi-year executive cash compensation), or SaaS unearned revenue triggers an immediate double-count breach.
6. **Distributable Cash Flow Reinvestment Consistency (Part 7 DCF) & Red Queen Continuity (Part 8):**
   When Part 7 Part 3 (`Adjusted DCF - R&D Capitalized`) is skipped under the Red Queen Effect gate (where R&D is defensive maintenance rather than durable growth expansion), Part 8 synthesis tables (`Step 1` & `Step 2`) must explicitly output `N/A` (`or N/A if skipped in Part 7`) rather than inventing uncalculated per-share figures. For active DCF models:
   > **Formula / Calculation:** Distributable FCFF = Sustainable NOPAT * (1 - Reinvestment Rate)
   Verifies that cash flows projected in the DCF table mathematically reflect the stated reinvestment rate.
