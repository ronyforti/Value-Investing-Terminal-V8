# Authoritative Valuation Formulas (Cash-Flow Sovereign Architecture)

> **CRITICAL FORMATTING LAW:** When outputting any of these formulas into a valuation dossier, you MUST use clean plain-text markdown equations or bullet points. Raw LaTeX (`\begin{aligned}`, `$$`, `\frac`, `\mathbf`) is strictly forbidden.

---

## 1. Zero-Growth Earnings Power Value (EPV) (The Sustainable No-Growth Floor)

- **Sustainable NOPAT (Unlevered Operating Cash Power):**
  > **Formula / Calculation:** Sustainable NOPAT = Normalized Operating Income (EBIT) * (1 - Normalized Tax Rate) + Depreciation & Amortization - Audited Maintenance CapEx
  *(Anchored to the 50% 3-Year / 30% 5-Year / 20% 10-Year Recency-Weighted baseline or 3-Year Rolling Average; 100% of Stock-Based Compensation is deducted inside EBIT)*.
- **Operating EPV:**
  > **Formula / Calculation:** Operating EPV = Sustainable NOPAT / Static Hurdle Rate (0.10)
- **Net Cash & Footnote Debt Bridge:**
  > **Formula / Calculation:** Net Cash = (Cash & Cash Equivalents + Short-Term Marketable Securities - Restricted Customer Deposits) - (Short-Term Debt + Long-Term Debt)
  > **Formula / Calculation:** Audited Footnote Debt = Present Value of Operating Leases (if not expensed in EBIT) + Net Unfunded Pension Liabilities * (1 - Tax Rate) + Confirmed Legal Judgments / Probable Reserves (ASC 450)
  *(Speculative uncertified class-action lawsuits, ongoing cloud/freight operational commitments, unvested executive compensation, and SaaS deferred revenue are strictly excluded from funded debt)*.
- **Equity EPV & EPV Per Share:**
  > **Formula / Calculation:** Equity EPV = Operating EPV + Net Cash - Audited Footnote Debt
  > **Formula / Calculation:** EPV Per Share = Equity EPV / Total Diluted Shares Outstanding
- **Banks, Insurers & REITs Direct Equity EPV Floor:**
  - *Banks & Financials:* `Operating EPV = Normalized Through-the-Cycle Net Income / 0.10` (direct equity capitalization; customer deposits are operating financing).
  - *Insurers:* `Operating EPV = [(Underwriting Profit + Normalized Net Investment Income - Statutory Taxes) / 0.10] + Tangible Capital Surplus`.
  - *REITs:* `Operating EPV = AFFO / 0.10` (or `Net Operating Income / Market Cap Rate - Gross Debt`).

---

## 2. Normalized Owner Earnings & 2-Step Empirical Maintenance CapEx (Part 3)

- **Normalized Owner Earnings:**
  > **Formula / Calculation:** Normalized Owner Earnings = TTM Operating Cash Flow - 100% Stock-Based Compensation (SBC) - Audited Maintenance CapEx +/- Working Capital & Tax Normalizations
- **2-Step Empirical Maintenance CapEx Carve-Out Protocol (Replaces Academic Revenue-Delta Formula):**
  1. **Step A (Discrete Growth CapEx Carve-Out):** Inspect 10-K/10-Q MD&A disclosures for explicit capacity expansion projects (greenfield facilities, new production lines, new store openings) and carve them out directly as Growth CapEx.
  2. **Step B (3-Year Rolling D&A Replacement Baseline):** Benchmark remaining Maintenance CapEx against the 3-Year Rolling Average of tangible Depreciation & Amortization (`0.85x – 1.10x D&A`, defaulting to `1.0x–1.1x D&A` when management does not disclose a split).
- **Tech / R&D Compounder Owner Earnings (Red Queen Gate Passed):**
  > **Formula / Calculation:** Growth R&D-Adjusted Owner Earnings = Standard Normalized Owner Earnings + [Audited Growth R&D * (1 - Normalized Effective Tax Rate)]

---

## 3. Recency-Weighted RORC & 5-Year Rolling $1 Shareholder Value Test (Part 1, Sec 2.9)

- **Annual Capital Retained:**
  > **Formula / Calculation:** Annual Capital Retained = Normalized Owner Earnings - Common Cash Dividends Paid - Net Share Repurchases
- **Recency-Weighted Return on Retained Capital (RORC):**
  > **Formula / Calculation:** Window RORC = (Ending Normalized Owner Earnings - Beginning Normalized Owner Earnings) / Cumulative Capital Retained
  > **Formula / Calculation:** Synthesized Recency-Weighted RORC = (0.50 * 3-Yr RORC) + (0.30 * 5-Yr RORC) + (0.20 * 10-Yr RORC)
  - **Threshold:** `>= 10.00%` (Static Hurdle Rate).
  - **Endpoint & Negative-Denominator Guardrail:** Measure strictly between normalized mid-cycle operational periods. If cumulative Capital Retained is zero or negative (because dividends + buybacks exceeded Owner Earnings), evaluate via Return on Incremental Invested Capital (ROIIC) or operating ROIC.
- **5-Year Rolling $1 Total Shareholder Value Test (Including Dividends):**
  > **Formula / Calculation:** Total Shareholder Value Created per $1 Retained = (5-Year Market Cap Change + 5-Year Cumulative Cash Dividends Paid) / 5-Year Cumulative Retained Earnings
  - **Threshold:** `>= $1.00` per `$1.00` retained (supplemented by the 10-year window for full-cycle context).

---

## 4. Probabilistic 10-Year Owner Earnings DCF & Synthesis (Part 7 & Part 8)

- **Synthesized CSV-Weighted Longitudinal Growth Rate:**
  > **Formula / Calculation:** Weighted Growth Rate = (0.50 * 3-Yr CAGR) + (0.30 * 5-Yr CAGR) + (0.20 * 10-Yr CAGR)
- **Probability-Weighted Expected DCF:**
  > **Formula / Calculation:** Expected DCF Per Share = (0.25 * Bear Case) + (0.50 * Base Case) + (0.25 * Bull Case)
- **Authoritative Synthesized Intrinsic Value:**
  - *Standard / Physical / Industrial Companies:* `Synthesized Intrinsic Value = Probability-Weighted Expected DCF Per Share` (Part 7, Sec 2).
  - *Verified Tech / R&D Compounders (Red Queen Gate Passed):* `Synthesized Intrinsic Value = R&D-Capitalized Expected DCF Per Share` (Part 7, Sec 3).

---

## 5. Quality-Tiered Margin of Safety & Target Buy Price Bands (Part 8 & Part 9)

- **Signed Standard Margin of Safety:**
  > **Formula / Calculation:** Standard Margin of Safety (%) = ((Synthesized Intrinsic Value - Current Market Price) / Synthesized Intrinsic Value) * 100%
  *(Output strictly with explicit sign: `+XX.XX%` for discount, `-XX.XX%` for premium/deficit)*.
- **Cash-Adjusted Margin of Safety (Net Cash Companies):**
  > **Formula / Calculation:** Cash-Adjusted Margin of Safety (%) = (((Intrinsic Value - Net Cash Per Share) - (Market Price - Net Cash Per Share)) / (Intrinsic Value - Net Cash Per Share)) * 100%
- **Quality-Tiered Target Buy Price Bands:**
  - **Fair Value (0% MoS):** `1.00 * Intrinsic Value`
  - **Target Buy (15%–25% MoS):** `0.75 * Intrinsic Value` to `0.85 * Intrinsic Value` (`0.75x–0.85x IV` for Wide-Moat Compounders; `0.75x IV` / 25% MoS standard)
  - **Screaming Buy (35%–50% MoS):** `0.50 * Intrinsic Value` to `0.65 * Intrinsic Value`
