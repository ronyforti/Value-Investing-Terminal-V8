---
name: competitor-radar-curator
description: Use this skill to harvest, benchmark, and format competitor intelligence, valuation multiples, and moat radar dossiers. Governs SEC EDGAR proxy surgical scraping, transcript peer mention scanning, and radar placement in Part 2 (Operational Engine & Market Analysis) of the analysis.
---

# Competitor Radar Curator Skill: Moat Benchmarking & Peer Harvester

This skill governs the automated extraction, comparative benchmarking, and visual dossier injection of peer intelligence in the **Value Investing Terminal**.

## Core System Architecture
- **Transcript & Proxy Parser:** [`src/services/competitorParser.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/services/competitorParser.ts)
- **Multi-Peer Harvester:** [`src/services/competitorHarvester.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/services/competitorHarvester.ts)
- **Modal Component:** [`src/components/CompetitorRadarModal.tsx`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/components/CompetitorRadarModal.tsx)

---

## 1. Uniform Peer Comparison Scorecard

All competitor benchmarking must follow this uniform 7-column comparative table format:

| Competitor / Peer | Gross Margin | Operating Margin | ROIC | EV / True FCF | EV / Owner Earnings | Net Cash / Mkt Cap |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **TARGET (Target Anchor)** | 52.8% | 24.1% | 16.5% | 10.20x | 9.58x | +12.7% |
| **PEER_1 (Direct)** | 63.4% | 28.5% | 22.1% | 26.10x | 24.50x | -8.3% |
| **PEER_2 (Adjacent)** | 58.2% | 18.2% | 14.8% | 19.40x | 18.20x | +3.1% |

*Note: All peer operational margins, cash flows, and valuation multiples reflect the trailing twelve months (TTM) aggregated across 4 reported quarterly statements (or audited annual baseline for semi-annual foreign filers), ensuring 1-to-1 temporal parity with the target company.*

### Core Evaluation Metrics:
1. **Gross Margin:** Measures structural pricing power and manufacturing/IP moat.
2. **Operating Margin:** Measures operating leverage, SG&A cost discipline, and conversion of gross revenue to EBIT.
3. **ROIC:** Measures efficiency of capital allocation across economic cycles.
4. **EV / True FCF:** Measures enterprise valuation relative to accounting Free Cash Flow less Stock-Based Compensation (`OCF - Total CapEx - SBC`).
5. **EV / Owner Earnings:** The primary cash-flow multiple used to compare valuation against the target company (`EV / Normalized Owner Earnings`).
6. **Net Cash / Market Cap:** Tests balance sheet resilience; positive represents a cash rebate, negative indicates net indebtedness.

---

## 2. Surgical Proxy Extraction (DEF 14A)

When identifying authoritative competitors:
- Avoid generic sector classifications (which lump disparate businesses together).
- **Target Source:** Extract the **Compensation Peer Group** from the target company's latest SEC Form DEF 14A (Proxy Statement).
- Management and board compensation committees spend significant resources benchmarking against exact business rivals with similar operational complexity and talent competition.

---

## 3. Transcript Peer Mention Scanning

The transcript parser scans earnings conference calls for competitor mentions:
- Identify every instance where analysts or management cite competitors by name.
- Classify mentions into:
  - *Pricing Pressure:* Competitor discounting or aggressive pricing.
  - *Socket / Customer Win:* Target replacing competitor or vice versa.
  - *Technology Transition:* Competitor advancing or stumbling on a product architecture.

---

## 4. Strict Placement & Heading Hierarchy Directive

The Competitor Moat & Valuation Radar must be embedded seamlessly into the cumulative analysis:
- **Location:** Injected directly into **Part 2 (Operational Engine & Market Analysis)** under Section 1.4.
- **Boundary Guard:** Strictly **BEFORE Section 1.5 (Structural Moat Verification)** and TAM breakdown.
- **Heading Hierarchy:** Must be formatted as an **H3 subheading (`### Competitor Moat & Valuation Radar`)** with nested sub-sections at **H4 (`####`)**. It must NEVER be injected as a top-level H2 (`##`), which would create an unnumbered rogue chapter in the Table of Contents.
- **Format:** Clean GitHub-Flavored Markdown table and dense comparative takeaways, never wrapped in monospace code fences or ASCII boxes.

---

## 5. Deduplication Directive (Zero Redundant Visualizer Cards)

- **Direct Radar-to-Table Transition:** In both HTML export and Markdown viewing, the SVG Competitor Radar polygon transitions directly into the authoritative GFM comparative table (`Table 2: Archetype Comparative Valuation & Moat Scorecard`).
- **Prohibition of Duplicate Leaderboard Cards:** Redundant visualizer card grids (`renderLeaderboardHtml` / "Moat & Peer Leaderboard Benchmark") that mirror table rows (Moat Dimension, Target Anchor, Standing, Peer Median, Group Leader, Moat Verdict) are strictly forbidden. The table serves as the single source of truth.
- **Strict GFM Pipe Table Contract (Zero Piped Bullets):** Section 1.4 peer comparisons MUST be formatted as standard GitHub-Flavored Markdown pipe tables with explicit header and separator rows. Formatting peer data as bullet points with pipe delimiters (e.g. `* **PEER_1** | Direct | 60% | ...`) is strictly forbidden.
- **Section 1.5 Moat Benchmark Scorecard Integration:** Evaluated in a single concise 4-column GFM Markdown table (`| Moat Criterion | Standard Threshold | Company Metric | Audit Verdict |`) with zero typewriter ASCII boxes, duplicate summaries, or redundant evaluation text blocks.
- **Buy-Side Desk Nomenclature Mandate:** Adhere strictly to institutional desk nomenclature. Drop all textbook/creator names (e.g. use "Network Effects / High Switching Cost Moat Scorecard", not academic professor citations).

---

## 6. Pre-Flight Competitor Radar Harvesting, Tool-Free Pipeline & 503 Spike Defense

- **Pre-Flight Surgical Extraction & Staging:** Before Step 1 begins, competitor intelligence is harvested and staged into `state.files` as `${cleanTicker}_Competitor_Radar.md` during document ingestion or via the Pre-Flight Checklist:
  - **10-K Item 1 Competition Extraction:** `extract10KCompetitionSection` extracts the true operational competitors explicitly named by management in Item 1 (e.g., Kinsale naming *AIG, Berkshire Hathaway, Chubb, Fairfax, Lloyd's, Markel, RLI, W. R. Berkley*).
  - **Hardened DEF 14A Proxy Extraction:** `extractSurgicalProxy` skips SEC Pay-Versus-Performance tables (`Compensation Actually Paid`, `Summary Compensation Table Total for PEO`) and blacklists compensation/role acronyms (`PEO`, `NEO`, `CAP`, `SCT`, `LTIP`, `STIP`, `PSU`, `RSU`, `TSR`, `US`, `USA`).
  - **Standard-Tier 1-Attempt Cap:** Runs on Standard On-Demand Tier (`gemini-3.8-flash`, ~$0.0004 cost) to avoid the congested Flex 503 queue. If Google Search fails or times out, it immediately falls back on Attempt 2 to synthesize peers directly from the 10-K and DEF 14A documents without looping retries.
  - **Rolling 4-Quarter TTM Statement Pull & Semi-Annual Fallback:** Queries FMP /stable/income-statement and /stable/cash-flow-statement with period=quarter&limit=4 and /stable/balance-sheet-statement with period=quarter&limit=1. Automatically sums 4 quarters for Revenue, Gross Profit, Operating Income, OCF, CapEx, SBC, and D&A. If fewer than 4 quarters are returned (e.g. foreign semi-annual filers), it automatically falls back to period=annual&limit=1 with explicit provenance tagging.
- **Deterministic FMP Resolution & Verification:** `verifyAndResolvePeerWithFmp` checks each candidate against FMP `/stable/profile` (rejecting closed-end funds like `PEO`, ETFs, and non-trading symbols) and `/stable/search-name` with legal suffix cleaning to resolve corporate names to active tickers.
- **Closed-Universe Tool-Free Pipeline (100% Cache Invariance):** The main 12-step sequential generation pipeline runs completely tool-free (`toolsConfig = undefined`), eliminating tool declarations from the system payload. This guarantees that the 300,000+ token filing context prefix hash remains 100% byte-for-byte invariant across all pipeline steps, permanently locking in the **80% cache discount** + **50% Flex discount** and eliminating 503 retry storms or socket close timeouts.
- **UI Ingest & Pre-Flight Safeguard Integration:** Enforced as a formal pre-flight audit requirement in `REQUIREMENT_RULES` and `MissingDocumentsModal`. Available via the high-contrast Pre-Flight Checklist Matrix row (showing verified peer badge pills, Eye preview, `MISSING` alert badge, and prominent `[Harvest Competitor Radar]` CTA button), a highlighted `4. Harvest Competitor Radar` button in the Document Ingest cockpit, and integrated as Step 4/4 in 1-Click "Retrieve All Documents".

