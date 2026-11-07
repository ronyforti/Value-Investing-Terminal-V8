import fs from "fs";
import path from "path";
import { cleanMarkdownForRendering } from "../src/utils/dossierFormatGuard.js";
import { convertMarkdownToHtml } from "../src/utils/googleDocs.js";

console.log("=== Running Offline Format Regression Suite (Golden Snapshot) ===");

const fixturePath = path.join(process.cwd(), "tests", "fixtures", "golden_dossier_fixture.md");
if (!fs.existsSync(fixturePath)) {
  console.error(`FAIL: Golden fixture missing at ${fixturePath}`);
  process.exit(1);
}

const rawFixture = fs.readFileSync(fixturePath, "utf8");
const startTime = Date.now();

// 1. Process Raw Markdown through Dossier Format Guard
const cleanedMd = cleanMarkdownForRendering(rawFixture);

// 2. Assert Zero Raw LaTeX in Cleaned Markdown
const hasRawLatexMd = /\\frac|\\mathbf|\\begin\{aligned\}|\$\$/.test(cleanedMd);
console.log(`Markdown Audit - Zero Raw LaTeX: ${!hasRawLatexMd ? "PASS" : "FAIL"}`);
if (hasRawLatexMd) {
  console.error("FAIL: Raw LaTeX leaked in cleaned Markdown!");
  process.exit(1);
}

// 3. Assert Zero Typewriter Sliders
const hasSliders = /───────>/.test(cleanedMd);
console.log(`Markdown Audit - Zero Typewriter Sliders: ${!hasSliders ? "PASS" : "FAIL"}`);
if (hasSliders) {
  console.error("FAIL: Typewriter sliders leaked in cleaned Markdown!");
  process.exit(1);
}

// 4. Assert Rogue Code Blocks Unwrapped
const hasRogueCodeBlocks = /```\s*\n\*\s*Rogue block bullet/.test(cleanedMd);
console.log(`Markdown Audit - Rogue Code Blocks Unwrapped: ${!hasRogueCodeBlocks ? "PASS" : "FAIL"}`);
if (hasRogueCodeBlocks) {
  console.error("FAIL: Rogue monospace code fences not unwrapped!");
  process.exit(1);
}

// 5. Assert Linear Value Chain Mermaid Preservation (Zero Loopback Arrow)
const hasLinearMermaid = 
  cleanedMd.includes("```mermaid\nflowchart TD") &&
  cleanedMd.includes("S1 --> S2") &&
  cleanedMd.includes("S4 --> S5") &&
  !cleanedMd.includes("==>|<b>Closed-Loop Compounding Reinvestment</b>| S1") &&
  !cleanedMd.includes("==> S1") &&
  cleanedMd.includes("Linear Value Chain Architecture (Audited: No Organic Flywheel)");
console.log(`Markdown Audit - Linear Value Chain (Zero Loopback): ${hasLinearMermaid ? "PASS" : "FAIL"}`);
if (!hasLinearMermaid) {
  console.error("FAIL: Linear value chain Mermaid or callout corrupted!");
  process.exit(1);
}

// 6. Assert GFM Tables Preserved
const tableHeaders = [
  "| Company / Peer | Peer Role / Classification | Gross Margin |",
  "| Off-Balance-Sheet Vector | Valuation Spread ($M) | Balance Sheet Impact |",
  "| Valuation Scenario | Probability Weight | Per Diluted Share Value |",
  "| Valuation Methodology | Framework Role | Per Share Value |",
  "| Profile Category | Growth Rate / Multiples | Balance Sheet / Net Cash Buffer |",
  "| Tier / Hurdle | Price Band | Implied Margin of Safety |",
  "| Decision Field | Audit Verdict |"
];
let allTablesValid = true;
for (const th of tableHeaders) {
  if (!cleanedMd.includes(th)) {
    console.error(`FAIL: Table header missing or corrupted: ${th}`);
    allTablesValid = false;
  }
}
console.log(`Markdown Audit - All Standard GFM Tables Valid: ${allTablesValid ? "PASS" : "FAIL"}`);
if (!allTablesValid) process.exit(1);

// 7. Convert Cleaned Markdown to Standalone HTML Dossier
const htmlOutput = convertMarkdownToHtml(cleanedMd, "STRL Q2-26 Valuation Dossier", "STRL");

// 8. Assert HTML Standalone Integrity
const hasRawLatexHtml = /\\frac|\\mathbf|\\begin\{aligned\}|\$\$/.test(htmlOutput);
console.log(`HTML Audit - Zero Raw LaTeX in HTML: ${!hasRawLatexHtml ? "PASS" : "FAIL"}`);
if (hasRawLatexHtml) {
  console.error("FAIL: Raw LaTeX leaked in HTML dossier!");
  process.exit(1);
}

const hasHtmlCockpit = 
  htmlOutput.includes("STRL") &&
  htmlOutput.includes("563.69") &&
  htmlOutput.includes("371.07");
console.log(`HTML Audit - Executive Cockpit Pricing Anchored: ${hasHtmlCockpit ? "PASS" : "FAIL"}`);
if (!hasHtmlCockpit) {
  console.error("FAIL: HTML Executive Cockpit pricing missing!");
  process.exit(1);
}

const hasLinearSvgHtml = 
  htmlOutput.includes("AUDIT VERDICT: LINEAR VALUE CHAIN / DISCRETIONARY CAPITAL ALLOCATION") &&
  htmlOutput.includes("TERMINAL NODE");
console.log(`HTML Audit - Linear Value Chain Vector SVG Parity: ${hasLinearSvgHtml ? "PASS" : "FAIL"}`);
if (!hasLinearSvgHtml) {
  console.error("FAIL: HTML Linear Value Chain SVG pipeline missing!");
  process.exit(1);
}

const trendCount = (htmlOutput.match(/<span class="chart-title">\s*Cash Flow (?:&amp;|&) Owner Earnings Trajectory\s*<\/span>/gi) || []).length;
console.log(`HTML Audit - Trajectory Chart Cardinality (<= 1): ${trendCount <= 1 ? "PASS" : "FAIL"}`);
if (trendCount > 1) {
  console.error(`FAIL: HTML dossier contains ${trendCount} trajectory charts!`);
  process.exit(1);
}

// 10. Assert Revenue Mix Visualizer Binds to % of Total (Not YoY Growth)
const mockSegmentTable = `
| Operating Business Segment | TTM Revenue ($M) | % of Total Revenue | YoY Growth Rate (%) | Notes |
| :--- | :---: | :---: | :---: | :--- |
| Core Services | $8,640 | 86.4% | +42.3% | Core |
| Direct Products | $1,360 | 13.6% | +75.4% | Auxiliary |
| — Internal Aux | $200 | 2.0% | +5.0% | Sub |
`;
const mockSegmentHtml = convertMarkdownToHtml(mockSegmentTable, "MOCK", "MOCK");
const segmentMixValid = 
  mockSegmentHtml.includes('title="Core Services: 86.4%"') &&
  mockSegmentHtml.includes('title="Direct Products: 13.6%"') &&
  !mockSegmentHtml.includes('title="Core Services: 42.3%"') &&
  !mockSegmentHtml.includes('title="Direct Products: 75.4%"') &&
  !mockSegmentHtml.includes('title="— Internal Aux');

console.log(`HTML Audit - Revenue Mix Part-to-Whole Integrity: ${segmentMixValid ? "PASS" : "FAIL"}`);
if (!segmentMixValid) {
  console.error("FAIL: Revenue Mix visualizer failed part-to-whole column priority check!");
  process.exit(1);
}

const elapsedMs = Date.now() - startTime;
console.log(`Performance Benchmark: Completed offline audit in ${elapsedMs}ms`);

console.log("\n=== ALL OFFLINE FORMAT REGRESSION TESTS PASSED PERFECTLY ===");
