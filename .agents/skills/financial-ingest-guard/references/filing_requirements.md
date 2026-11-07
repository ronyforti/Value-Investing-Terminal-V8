# Filing Ingestion Requirements & Section Breakdown

This reference outlines the required sections and citations to extract from primary SEC filings.

---

## 1. Form 10-K (Annual Report)

| Item | Title | Key Extraction Focus |
| :--- | :--- | :--- |
| **Item 1** | Business | Business model, operating segments, customer concentration (% of revenue). |
| **Item 1A** | Risk Factors | Structural risks: single-customer dependence, supply-chain single points of failure, regulatory scrutiny. |
| **Item 7** | MD&A | Capital expenditures (split between Maintenance and Growth CapEx), liquidity, credit facility terms, R&D tax treatment. |
| **Item 8** | Financial Statements | Note 2: Segment info & customer receivables; Note 8: Debt maturities table; Note 10: Income taxes & contingencies. |

---

## 2. Form 10-Q (Quarterly Report)

| Item | Title | Key Extraction Focus |
| :--- | :--- | :--- |
| **Cover Page** | Basic Data | Exact shares outstanding as of the latest practicable date. |
| **Part I, Item 1** | Balance Sheet | Cash and cash equivalents, short-term and long-term marketable securities, drawn credit balance. |
| **Notes** | Significant Events | Credit facility amendments, recent share repurchases, new purchase/supply commitments. |
| **Part I, Item 2** | MD&A | Current-quarter gross margin bridges, revenue product-line mix changes, updated guidance commentary. |

---

## 3. Earnings Call Transcript

| Component | Key Extraction Focus |
| :--- | :--- |
| **Prepared Remarks (CEO)** | Product cycle momentum, market share shifts, strategic pivot explanations. |
| **Prepared Remarks (CFO)** | CapEx breakdown (ATE equipment, fab tooling, facility expansion), working capital drivers. |
| **Analyst Q&A** | Pricing power pushback, customer inventory adjustments, margin trajectory defense. |

---

## 4. Supplementary Financial CSV

| Statement | Metric Group | Usage |
| :--- | :--- | :--- |
| **Income Statement** | 10-Period Revenue & Gross Margin | Long-term margin compounding and operating leverage evaluation. |
| **Cash Flow Statement** | TTM OCF, CapEx, SBC | Ground-truth TTM figures for Owner Earnings calculation. |
| **Balance Sheet** | 10-Period Retained Earnings | Cumulative unadjusted retained capital for RORC calculation. |
