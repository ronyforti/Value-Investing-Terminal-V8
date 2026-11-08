---
name: format-upgrade-guard
description: Use this skill to manage, test, and synchronize formatting upgrades between the Lab Sandbox and the Main Valuation Terminal. Enforces the 5 Inviolable Formatting Laws via src/utils/dossierFormatGuard.ts, runs Gate 12 verification, and reminds the user to port approved format upgrades from Lab to Production with zero code drift.
---

# Format Upgrade Guard: Lab-to-Production Formatting & Sync Protocol

This skill governs the evolution, testing, and synchronization of formatting rules between the **Lab Sandbox** (`Value-Investing-Terminal-Lab`) and the **Main Production Terminal** (`Value-Investing-Terminal`).

---

## 1. Core Architecture & Single Source of Truth

All formatting, sanitization, and output layout logic is centralized in:
* **Canonical Guard Module:** [`src/utils/dossierFormatGuard.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/utils/dossierFormatGuard.ts)
* **Client-Side Delegate:** [`src/components/MarkdownView.tsx`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/components/MarkdownView.tsx)
* **HTML Generator:** [`src/utils/googleDocs.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/utils/googleDocs.ts)
* **Server Pipeline:** [`server.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/server.ts) (`updateCompiledReportFile()`)
* **Verification Test Suite:** [`scripts/test_engine_prompts.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/scripts/test_engine_prompts.ts) (Gate 12) & [`scripts/test_format_regression.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/scripts/test_format_regression.ts)
* **Format Sync Checker:** [`check_format_sync.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/.agents/skills/format-upgrade-guard/scripts/check_format_sync.ts)

---

## 2. The Proactive Reminder Protocol (Mandatory Agent Directive)

Whenever formatting rules, parsers, or visual components are upgraded and approved in the Lab Sandbox:
1. **Run Sync Verification:**
   ```powershell
   npx tsx .agents/skills/format-upgrade-guard/scripts/check_format_sync.ts
   ```
2. **Proactive Reminder Trigger:**
   If format drift is detected between the Lab and Main terminals, the agent MUST proactively remind the user:
   > 💡 **Format Upgrade Ready:** The latest formatting rules in `src/utils/dossierFormatGuard.ts` passed Gate 12 and build verification in the Lab Sandbox. Would you like to port these upgrades to the Main Production Terminal now?

---

## 3. The 6-Step Format Upgrade & Porting Lifecycle

When implementing or testing a new output format (e.g., Google Stitch UI components, new chart types, table variations):

### Step 1: Design & Implement in Lab Sandbox
Modify [`src/utils/dossierFormatGuard.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal-Lab/src/utils/dossierFormatGuard.ts) to register the new visual component or pattern. Ensure all 5 Inviolable Formatting Laws are preserved.

### Step 2: Automated Verification Gate (Gate 12)
Execute the terminal test suite:
```powershell
npx tsx scripts/test_engine_prompts.ts
```
* **Gate 12 Verification Requirements:**
  - `Dossier Format Guard - Static Prompt Directives (All 12 Prompts): PASS`
  - `Dossier Format Guard - Mermaid Preservation: PASS`
  - `Dossier Format Guard - Rogue Block Unwrapping: PASS`
  - `Dossier Format Guard - Zero Raw LaTeX: PASS`
  - `Dossier Format Guard - Zero Premature Flywheels: PASS`
  - `Dossier Format Guard - GFM Table Normalization: PASS`
  - `Dossier Format Guard - Zero Unicode Box Characters: PASS`
  - `Dossier Format Guard - Zero Typewriter Sliders: PASS`
  - `Dossier Format Guard - Piped Bullet Normalization: PASS`
  - `Dossier Format Guard - Desk Nomenclature Scrubbing: PASS`
  - `Dossier Format Guard - Zero Hardcoded Tickers/Prices: PASS`
  - `Dossier Format Guard - Zero Persistent File Leakage: PASS`
  - `Dossier Format Guard - Clean Ticker Isolation Active: PASS`
  - `Dossier Format Guard - Dual Visualizer Parity (Organic Flywheel): PASS`
  - `Dossier Format Guard - Dual Visualizer Parity (Linear Value Chain Zero-Loop): PASS`
  - `Dossier Format Guard - Exact Fences: PASS`
  - `Gate 13: Visualizer Chart Disambiguation & Single Cardinality Guard: PASS`

### Step 3: Empirical Dossier Validation (Offline Golden Snapshot Suite)
Run the automated offline regression test against the golden fixture (`tests/fixtures/golden_dossier_fixture.md`):
```powershell
npm run test:format
```
* **Execution Contract:** Runs offline in under 50ms with zero Gemini API calls.
* **Assertions Verified:**
  - Zero raw LaTeX math (`$$`, `\frac`, `\mathbf`, `\begin{aligned}`).
  - Zero typewriter sliders (`─── [$X] ───>`).
  - Zero ASCII tree characters (`├─`, `└─`) or rogue divider lines (`─────┤`).
  - Owner Earnings Waterfall Bridge rendered strictly in Part 3 with zero `NaN` values.
  - Cash Flow & Owner Earnings Trajectory rendered strictly in Part 3 Section 1.4 with single-instance latch (zero RORC/CAGR false positives).
  - Rogue non-mermaid code blocks unwrapped.
  - Linear Value Chain Mermaid pipeline preserved (zero loopback arrow).
  - All standard GFM table schemas preserved.
  - HTML Standalone Dossier contains zero LaTeX leaks.
  - Executive Cockpit share price extracted from Line-1 YAML frontmatter.
  - HTML Linear Value Chain SVG vector pipeline parity verified.
* Exactly 0 academic creator citations (all converted to buy-side desk nomenclature).
* Executive cockpit in `.html` extracts `market_price` directly from Line-1 YAML frontmatter.

### Step 4: Pre-Flight Production Build
Ensure zero TypeScript or bundling regressions:
```powershell
npx tsc --noEmit
npm run build
```

### Step 5: Port to Main Production Terminal
Once the user approves the upgrade, copy the unified guard and delegated view to the Main Terminal:
```powershell
Copy-Item "c:\Users\Ronald\antigravity\Value-Investing-Terminal-Lab\src\utils\dossierFormatGuard.ts" "c:\Users\Ronald\antigravity\Value-Investing-Terminal\src\utils\dossierFormatGuard.ts" -Force
Copy-Item "c:\Users\Ronald\antigravity\Value-Investing-Terminal-Lab\src\components\MarkdownView.tsx" "c:\Users\Ronald\antigravity\Value-Investing-Terminal\src\components\MarkdownView.tsx" -Force
Copy-Item "c:\Users\Ronald\antigravity\Value-Investing-Terminal-Lab\src\utils\googleDocs.ts" "c:\Users\Ronald\antigravity\Value-Investing-Terminal\src\utils\googleDocs.ts" -Force
```

### Step 6: Post-Port Verification Gate in Main Terminal
Verify that the Main Terminal builds cleanly:
```powershell
cd c:\Users\Ronald\antigravity\Value-Investing-Terminal
npx tsc --noEmit
npm run build
cd c:\Users\Ronald\antigravity\Value-Investing-Terminal-Lab
```

---

## 4. The 5 Inviolable Formatting Laws Reference

1. **Zero Raw LaTeX Math:** All formulas must be plain-text markdown or blockquotes (`> **Formula / Calculation:** ...`). Never output `\frac`, `\mathbf`, `$$...$$`, or `\begin{aligned}`.
2. **Zero ASCII / Monospace Typewriter Tables / Code-Fenced Prose / Text Progress Bars / Sliders / Box Characters:**
   - Non-mermaid code blocks (` ``` `), typewriter space-aligned matrix text, Unicode box lines (`│`), typewriter sliders (`$0.00 ─── [$X] ───>`), ASCII arrows (`──>`), and text-based progress bars / hash bars (`[#####]`, `[###]`) are strictly forbidden.
   - ALL tables, segment breakdowns, market shares, credit portfolio integrity audits, and trajectory series MUST be standard GitHub-Flavored Markdown (GFM) pipe tables (`| Header | Header |` followed by `| :--- | :---: |`) or clean markdown bullet points.
   - Piped bullet items (`* **PEER** | Col | ...`) are strictly forbidden and normalized to standard GFM pipe tables.
   - Mandatory standard schemas & aesthetic layouts:
     - **Competitor Moat & Valuation Radar (Part 2, Sec 1.4):** 7-column table (`| Competitor / Peer | Gross Margin | Operating Margin | ROIC | EV / True FCF | EV / Owner Earnings | Net Cash / Mkt Cap |`).
     - **DCF Scenarios & Projections (Part 7, Sec 2):** 4-column table (`| Valuation Scenario | Probability Weight | Per Diluted Share Value | Implied MoS vs. Market Tape |`).
     - **Lynch Archetype Continuum (Part 9, Sec 1.1):** 3-column table (`| Peter Lynch Archetype | Classification Status | Empirical Operational Validation |`).
     - **Target Buy Price Bands (Part 9, Sec 1.4):** 4-column table (`| Target Buy Price Band | Price Range ($) | Margin of Safety Discount | Allocation Directive |`).
     - **Definitive Investment Verdict (Part 11, Step 4):** 2-column table (`| Decision Parameter | Audited Portfolio Verdict |`).
     - **Symmetrical Balance Sheet Synthesis (Part 5, Sec 2):** 3-column table (`| Off-Balance-Sheet Vector | Valuation Spread ($M) | Balance Sheet Impact |`).
     - **Chapter Preamble Summaries (Parts 2, 3, 7, 8):** 4-column table (`| Strategic Parameter | Audited Economic Anchor | Strategic Parameter | Audited Economic Anchor |`).
   - **Obsidian Code Block Elimination:** Accidental 4+ leading spaces on non-code lines are stripped to prevent dark monospace `<pre><code>` blocks.
   - **Table Cell Alignment & Layout Contract:** 2-column key-value and verdict tables assign `.cell-verdict-val` (`text-align: left !important; padding-left: 1.5rem !important;`), preventing jagged zig-zag margins.
   - **Tree Branch & Divider Invariance:** Programmatic format guards (`dossierFormatGuard.ts`) unconditionally normalize bullet-prefixed tree characters (`* ├─`, `* ├──`, `* └─`, `* └──`) into clean indented sub-bullet lists (`  * **Key:** Value`), convert inline directional arrows (`──>`) into clean Unicode arrows (`➔`), and unconditionally strip all box-drawing divider lines (including `┤`, `├`, `┬`, `┴`, `┼`).
   - **Owner Earnings Waterfall Scoping Contract:** The interactive Owner Earnings Waterfall Bridge is strictly bound to Part 3 (Owner Earnings Reconciliation Table). It is strictly forbidden from triggering on Competitor Radar tables in Part 2 (e.g. matching `EV / Owner Earnings`). Detection requires row-level presence of both GAAP Operating Cash Flow and Normalized Owner Earnings, excludes 10-year longitudinal tables, scopes parsing to Part 3, and enforces strict `!isNaN()` defensive checks to permanently eliminate `-$NaNM` dilution bugs.
3. **Numbered Compounding Architecture, Zero Premature Flywheels, Dual Visualizer Parity & Mandatory Falsification Audit:** Numbered stages 1 to 5 with bold titles (`1. **[Stage Name]**: ...`) and explicit Stage 5 description. Compounding loops/flywheels are strictly forbidden in Part 1 or Part 2 (e.g. Section 1.1 Core Business & Economic Engine must detail empirical operational pillars, never a premature compounding loop). Flywheels are synthesized exclusively in Part 4 Section 1.7.
   - **Mandatory Flywheel Falsification:** For linear commodity processors or cyclical manufacturers lacking an organic flywheel, Section 1.7 must explicitly state `#### 1.7 Compounding Architecture: LINEAR VALUE CHAIN / CYCLICAL COMMODITY (NO ORGANIC FLYWHEEL)` and detail its constraints.
   - **Dual Visualizer Parity (Flywheel vs. Linear Value Chain):**
     - *Organic Flywheel:* Radial circular SVG (`viewBox="0 0 640 430"`) with `THE COMPOUNDING RETURN LOOP` banner, and Mermaid `S5 ==> S1` closed loop.
     - *Linear Value Chain:* Horizontal vector SVG pipeline (`viewBox="0 0 760 140"`) with chevron cards, glowing rightward gradient arrows (`➔`), Stage 5 terminal node (`TERMINAL NODE`), bottom `AUDIT VERDICT: LINEAR VALUE CHAIN / DISCRETIONARY CAPITAL ALLOCATION` banner, and linear Mermaid pipeline (`S1 --> S2 --> S3 --> S4 --> S5` with zero loopback arrow).
   - **HTML Duplicate Walkthrough Suppression:** In standalone HTML dossiers, redundant stage text lists ("Flywheel Mechanics Walkthrough" or "Linear Value Chain Walkthrough") are suppressed when the interactive SVG diagram and cards render, ensuring zero visual repetition.
4. **Dual-Format Delivery Contract & Desk Nomenclature:**
   - `.md`: Structured YAML frontmatter at line 1 (11-13 canonical keys). Headings must map to institutional chapter titles via `STEP_CHAPTER_TITLES` using Buy-Side Desk Nomenclature (e.g., `Part 6: Valuation Floor: Zero-Growth Earnings Power Value (EPV)`, `Part 7: Valuation Engine: Probabilistic Owner Earnings DCF & Reverse DCF`, `Part 8: Valuation Synthesis & Sensitivity Matrix`). ARV asset reproduction floor is permanently eliminated under the Buffett-Munger-Lynch Cash-Flow Sovereign Model.
   - `.html`: High-contrast institutional typography; zero CDN scripts; sticky first column on tables. Executive cockpit market price MUST be extracted directly from line-1 YAML frontmatter (`market_price:`).
   - **Desk Nomenclature Mandate:** Strictly drop textbook/professor/creator names (e.g., Greenwald EPV -> Earnings Power Value (EPV) or Zero-Growth EPV Floor; Sloan Ratio -> Balance Sheet Accrual Ratio; Beneish M-Score -> Earnings Manipulation Risk Index; Graham-Buffett-Greenwald -> Forensic Valuation Triad).
5. **Verification Gate Before Testing:** Every format change must pass `npx tsx scripts/test_engine_prompts.ts` (all 13 gates) and `npm run build`.
