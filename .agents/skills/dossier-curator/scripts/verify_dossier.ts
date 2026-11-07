import fs from 'fs';
import path from 'path';

function auditDossier(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath).toLowerCase();
  const isHtml = ext === '.html' || ext === '.htm';
  const isMd = ext === '.md' || ext === '.markdown';

  console.log(`\n================================================================`);
  console.log(` AUDITING DOSSIER: ${path.basename(filePath)}`);
  console.log(` Type: ${isHtml ? 'Standalone HTML Dossier' : isMd ? 'Obsidian Markdown Report' : 'Unknown'}`);
  console.log(` Size: ${(content.length / 1024).toFixed(1)} KB`);
  console.log(`================================================================\n`);

  let allPassed = true;
  const checks: Array<{ name: string; passed: boolean; detail: string }> = [];

  if (isMd) {
    // 1. YAML Frontmatter
    const hasFrontmatter = content.startsWith('---');
    const hasTicker = /^ticker:\s*[A-Z0-9.-]+/m.test(content);
    const fmPassed = hasFrontmatter && hasTicker;
    checks.push({
      name: 'YAML Frontmatter Block',
      passed: fmPassed,
      detail: fmPassed ? 'Valid YAML frontmatter with ticker at Line 1' : 'Missing frontmatter or ticker definition'
    });

    // 2. Machine Step Markers
    const stepMarkers = content.match(/\[Step\s*\d+\s*Output\]/gi) || [];
    const noStepMarkers = stepMarkers.length === 0;
    checks.push({
      name: 'Zero Machine Step Markers',
      passed: noStepMarkers,
      detail: noStepMarkers ? 'All steps cleanly mapped to Part X titles' : `Found ${stepMarkers.length} raw [Step X Output] markers`
    });

    // 3. Chapter Coverage (supports canonical 11+1 pipeline ending in Part 12, as well as legacy Part 13/16)
    const hasPart1 = /##\s*Part 1:/i.test(content);
    const hasAuditFinal = /##\s*Part (?:12|13|16):/i.test(content);
    const chapterPassed = hasPart1 && hasAuditFinal;
    checks.push({
      name: 'Institutional Chapter Coverage',
      passed: chapterPassed,
      detail: chapterPassed ? 'Verified Part 1 through final Forensic Audit chapter' : 'Missing Part 1 or final audit chapter header'
    });

    // 4. Zero Typewriter Tables & Zero LaTeX Math Residuals
    const hasAsciiBox = /\+[-=]{4,}\+/.test(content);
    const hasEqualBorders = /^[=]{8,}$/m.test(content);
    const hasTeX = /\\begin\{aligned\}|\\frac\b|\\Delta\b|\\quad\b|\\mathbf\b|\$\$/.test(content);
    const typewriterClean = !hasAsciiBox && !hasEqualBorders && !hasTeX;
    checks.push({
      name: 'Zero-Typewriter / No TeX Residuals',
      passed: typewriterClean,
      detail: typewriterClean ? 'Clean GFM pipe tables and plain formulas only' : 'Detected typewriter ASCII boxes or raw TeX math'
    });

    // 5. Zero Premature Flywheels (Part 1 and Part 2)
    const part1And2 = (content.split(/##\s*Part\s*(?:3|4)\b/i)[0]) || "";
    const hasPrematureFlywheel = /two interlocking, self-funding flywheels|interlocking, self-funding flywheels/i.test(part1And2);
    checks.push({
      name: 'Zero Premature Flywheels (Part 1/2)',
      passed: !hasPrematureFlywheel,
      detail: !hasPrematureFlywheel ? 'Part 1 & 2 describe empirical business pillars only; flywheel strictly in Part 4' : 'Found premature compounding flywheel early in document'
    });

    // 6. Obsidian GFM Pipe Table Integrity
    const lines = content.split(/\r?\n/);
    let malformedTableCount = 0;
    let curTableLines: string[] = [];
    for (let idx = 0; idx < lines.length; idx++) {
      const trim = lines[idx].trim();
      if (trim.startsWith("|") && trim.endsWith("|")) {
        curTableLines.push(trim);
      } else {
        if (curTableLines.length > 0) {
          const hasSep = curTableLines.some(t => /^\|[\s:\-]+(?:\|[\s:\-]+)*\|$/.test(t));
          if (!hasSep) {
            malformedTableCount++;
          }
          curTableLines = [];
        }
      }
    }
    const tablesValid = malformedTableCount === 0;
    checks.push({
      name: 'Obsidian GFM Pipe Table Integrity',
      passed: tablesValid,
      detail: tablesValid ? 'All tables contain valid GFM header separators and syntax' : `Found ${malformedTableCount} malformed table(s) without separator rows`
    });

    // 7. Zero Text Progress Bars / Hash Bars
    const hasHashBars = /\[\s*#{3,}\s*\]/.test(content);
    checks.push({
      name: 'Zero Text Progress Bars / Hash Bars',
      passed: !hasHashBars,
      detail: !hasHashBars ? 'Zero raw [#####] hash bars detected' : 'Detected text progress bars [#####]'
    });

    // 8. Zero Banned TRIM Directives & Academic Creator Citations in Headers
    const hasBannedTrim = /\|\s*(?:Final\s+Portfolio\s+Directive|Recommended\s+Action|Allocation\s+Directive)\s*\|\s*\*{0,2}TRIM\*{0,2}\s*\|/i.test(content) || /^decision:\s*["']?TRIM["']?/im.test(content);
    const hasCreatorHeader = /^#{2,4}\s+.*\b(?:Greenwald|Sloan|Beneish|Mauboussin|Schilit|Thorndike|Gurley|Helmer|O'glove|Rappaport)\b/im.test(content);
    const doctrineClean = !hasBannedTrim && !hasCreatorHeader;
    checks.push({
      name: 'Zero Banned TRIM & Zero Creator Headers',
      passed: doctrineClean,
      detail: doctrineClean ? 'Enforces Never-Trim Compounding & Buy-Side Desk Nomenclature' : 'Detected banned TRIM directive or academic creator name in section headers'
    });
  }

  if (isHtml) {
    // 1. High-Contrast Typography (No Green Flood)
    const emeraldBold = /\.text-strong\s*\{[^}]*color:\s*var\(--accent-emerald\)/i.test(content);
    const primaryBold = /\.text-strong\s*\{[^}]*color:\s*var\(--text-primary\)/i.test(content);
    const boldPassed = !emeraldBold && primaryBold;
    checks.push({
      name: 'High-Contrast Typography (Zero Green Flood)',
      passed: boldPassed,
      detail: boldPassed ? '.text-strong correctly uses neutral var(--text-primary)' : 'Detected neon emerald styling on .text-strong'
    });

    // 2. Heading Accents
    const h2Accent = /\.dossier-h2\s*\{[^}]*border-left:\s*4px solid var\(--accent-emerald\)/i.test(content);
    checks.push({
      name: 'H2 Section Emerald Indicator Accent',
      passed: h2Accent,
      detail: h2Accent ? '.dossier-h2 features vertical emerald border indicator' : 'Missing left accent border on .dossier-h2'
    });

    // 3. H3 Primary Hierarchy
    const h3Primary = /\.dossier-h3\s*\{[^}]*color:\s*var\(--text-primary\)/i.test(content);
    checks.push({
      name: 'H3 Hierarchy Normalization',
      passed: h3Primary,
      detail: h3Primary ? '.dossier-h3 correctly reset to neutral text-primary' : '.dossier-h3 still has colored accent'
    });

    // 4. Quick Jump TOC De-Cluttering
    const hasChecklistInNav = /value="#sec-(?:step-summary-checklist|verification-checklist|section-\d+-verification-checklist)"/i.test(content);
    checks.push({
      name: 'TOC Navigator Signal-to-Noise Ratio',
      passed: !hasChecklistInNav,
      detail: !hasChecklistInNav ? 'Checklist subheadings successfully filtered from TOC' : 'Found repetitive checklist items in TOC'
    });

    // 5. Ticker-Specific Asset Guard
    const isMeli = /# Valuation Analysis:\s*MELI\b/i.test(content) || /"ticker":\s*"MELI"/i.test(content);
    const hasMeliAsset = /meli_flywheel|data:image\/webp;base64,UklGR/i.test(content);
    const assetClean = isMeli ? true : !hasMeliAsset;
    checks.push({
      name: 'Ticker-Aware Image Guard',
      passed: assetClean,
      detail: assetClean ? 'No unrelated company graphics found' : 'Warning: Mercado Libre graphic leaked into non-MELI dossier'
    });

    // 6. Clean Institutional Document Title
    const titleMatch = content.match(/<title>(.*?)<\/title>/i)?.[1] || '';
    const titleClean = !titleMatch.includes('_Complete Doc_') && !titleMatch.endsWith('.md');
    checks.push({
      name: 'Institutional Dossier Title',
      passed: titleClean,
      detail: titleClean ? `Clean title: "${titleMatch}"` : `Leaked raw filename in <title>: "${titleMatch}"`
    });

    // 7. Margin of Safety Valuation Sanity
    const priceVal = parseFloat(content.match(/<span class=\"kpi-label\">Market Price<\/span>\s*<span class=\"[^\"]*\">\$([0-9,.]+)/i)?.[1]?.replace(/,/g, '') || '0');
    const ivVal = parseFloat(content.match(/<span class=\"kpi-label\">Intrinsic Value<\/span>\s*<span class=\"[^\"]*\">\$([0-9,.]+)/i)?.[1]?.replace(/,/g, '') || '0');
    const mosEmerald = /<span class=\"kpi-label\">Margin of Safety<\/span>\s*<span class=\"[^\"]*kpi-emerald[^\"]*\">/i.test(content);
    const mosSane = (priceVal > ivVal && ivVal > 0) ? !mosEmerald : true;
    checks.push({
      name: 'Margin of Safety Valuation Sanity',
      passed: mosSane,
      detail: mosSane ? 'MOS styling accurately reflects discount/premium balance' : 'Overvalued stock erroneously styled with glowing green kpi-emerald!'
    });

    // 8. Zero Unrendered GitHub Alerts
    const rawAlerts = content.match(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gi) || [];
    checks.push({
      name: 'Zero Unrendered Alert Markers',
      passed: rawAlerts.length === 0,
      detail: rawAlerts.length === 0 ? 'All alert markers converted into clean callout cards' : `Found ${rawAlerts.length} unrendered [!NOTE] alert markers`
    });

    // 9. Visualizer Chart Cardinality (Single Cash Flow Trajectory)
    const trendChartMatches = content.match(/<span class="chart-title">\s*Cash Flow (?:&amp;|&) Owner Earnings Trajectory\s*<\/span>/gi) || [];
    const trendChartPassed = trendChartMatches.length <= 1;
    checks.push({
      name: 'Visualizer Chart Cardinality (Single Cash Flow Trajectory)',
      passed: trendChartPassed,
      detail: trendChartPassed 
        ? `Trajectory chart count: ${trendChartMatches.length} (Max 1 allowed)` 
        : `FAIL: Detected ${trendChartMatches.length} duplicate/misclassified Cash Flow Trajectory charts (Max 1 allowed)`
    });

    // 9. Financial Schedule Cards (Zero Raw Terminal Pre)
    const rawFinancialPre = content.match(/<pre class=\"dossier-pre\"><code>[\s\S]*?(?:equation|schedule|breakdown|margin of safety|intrinsic value)[\s\S]*?<\/code><\/pre>/gi) || [];
    checks.push({
      name: 'Financial Formula & Schedule Cards',
      passed: rawFinancialPre.length === 0,
      detail: rawFinancialPre.length === 0 ? 'All valuation calculations elevated to styled .formula-card components' : `Found ${rawFinancialPre.length} raw monospace <pre> calculation blocks`
    });

    // 10. Zero Raw TeX Math in HTML
    const htmlTeX = /\\frac\b|\\Delta\b|\\quad\b|\\mathbf\b|\$\$/.test(content);
    checks.push({
      name: 'Zero Raw TeX Math in HTML',
      passed: !htmlTeX,
      detail: !htmlTeX ? 'All mathematical formulas rendered in plain text typography' : 'Detected raw LaTeX math remnants in HTML output'
    });
  }

  // Print results
  for (const c of checks) {
    if (!c.passed) allPassed = false;
    const badge = c.passed ? '🟢 PASS' : '🔴 FAIL';
    console.log(` ${badge} | ${c.name.padEnd(42)} | ${c.detail}`);
  }

  console.log(`\n----------------------------------------------------------------`);
  if (allPassed) {
    console.log(` ✅ ALL AUDIT CHECKS PASSED: Dossier adheres 100% to DOSSIER_FORMAT_SPEC.md\n`);
  } else {
    console.error(` ❌ AUDIT FAILED: One or more formatting standards were violated.\n`);
    process.exit(1);
  }
}

const target = process.argv[2];
if (!target) {
  console.log('Usage: npx tsx verify_dossier.ts "<path-to-file.md|path-to-file.html>"');
  process.exit(0);
}

auditDossier(target);
