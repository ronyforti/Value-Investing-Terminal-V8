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

// 13. Verify Terminal FCOM Manual Synchronization & Automated HUD
console.log("\n--- Gate 13: Terminal FCOM Manual Synchronization & Automated HUD ---");
const manualPath = path.join(process.cwd(), "public", "terminal_v7_manual.html");
const manualExists = fs.existsSync(manualPath);
console.log(`Manual File Existence: ${manualExists ? "PASS" : "FAIL"}`);
if (!manualExists) {
  console.error("FAIL: public/terminal_v7_manual.html does not exist!");
  process.exit(1);
}

const manualContent = fs.readFileSync(manualPath, "utf8");
let allPromptsInManual = true;
const allEnginePrompts = [...MASTER_PROMPTS, CROSSCHECK_PROMPT];
for (const p of allEnginePrompts) {
  if (!manualContent.includes(`id="prompt-part-${p.id}"`)) {
    console.error(`FAIL: Part ${p.id} accordion missing in manual!`);
    allPromptsInManual = false;
  }
}
console.log(`Manual Prompts Completeness (All 12 Prompts): ${allPromptsInManual ? "PASS" : "FAIL"}`);

const hudHasRevision = manualContent.includes("REVISION 7.");
const hudHasPipeline = manualContent.includes("PIPELINE: 11+1 FULL-AUTO");
const hudHasGates = manualContent.includes("GATES: 5 ACTIVE");
const hudHasPort = manualContent.includes("PORT: 3001 LAB") || manualContent.includes("PORT: 3000 PROD") || manualContent.includes("PORT: 8080 PROD");
const hudHasBimodal = manualContent.includes("VOICE: BIMODAL");
const hudValid = hudHasRevision && hudHasPipeline && hudHasGates && hudHasPort && hudHasBimodal;

console.log(`HUD Automated Badges (Revision, Pipeline, Gates, Port, Voice): ${hudValid ? "PASS" : "FAIL"}`);

if (!allPromptsInManual || !hudValid) {
  console.error("FAIL: Terminal FCOM Manual is out of sync with engine! Run 'npm run build:manual'.");
  process.exit(1);
}

// 14. Verify Visualizer Chart Disambiguation & Single Cardinality Guard
console.log("\n--- Gate 14: Visualizer Chart Disambiguation & Single Cardinality Guard ---");
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

console.log("\n=== ALL 14 VERIFICATION GATES PASSED PERFECTLY ===");

