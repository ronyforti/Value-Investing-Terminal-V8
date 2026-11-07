const fs = require('fs');
const path = require('path');

const css = require('./manual_css.cjs');
const js = require('./manual_js.cjs');
const auditEvaluationHtml = require('./audit_evaluation_html.cjs');

// Read package.json for automated versioning
const pkgPath = path.join(__dirname, '../package.json');
const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : { version: '7.0' };
const rawVersion = pkg.version && pkg.version !== '0.0.0' ? pkg.version : '7.0';
const terminalRevision = rawVersion.startsWith('v') ? rawVersion : `REVISION ${rawVersion}`;

// Automated Environment / Port extraction
const isLab = path.basename(path.resolve(__dirname, '..')).toLowerCase().includes('lab');
const terminalPort = process.env.TERMINAL_PORT || (isLab ? '3001' : '3000');

// Read Master Prompts
const promptsFile = path.join(__dirname, '../Investment Analysis and Valuation Framework Master Prompts.txt');
const promptsRaw = fs.readFileSync(promptsFile, 'utf8');
const promptBlocks = promptsRaw.split('================================================================================')
  .map(b => b.trim())
  .filter(b => b.length > 0 && b.includes('Title:'));

const prompts = promptBlocks.map(block => {
  const lines = block.split('\n');
  let id = '';
  let title = '';
  let contentLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('id:')) {
      id = line.replace('id:', '').trim();
    } else if (line.startsWith('Title:')) {
      title = line.replace('Title:', '').trim();
    } else if (line.startsWith('----')) {
      contentLines = lines.slice(i + 1);
      break;
    }
  }
  return {
    id,
    title,
    content: contentLines.join('\n').trim()
  };
});

// Automated HUD Metadata Calculation
const masterPromptCount = prompts.length > 1 ? prompts.length - 1 : 12;
const hudPipeline = `${masterPromptCount}+1 FULL-AUTO`;
const activeGatesCount = 5; // The 5 Conditional Falsification Gates
const hudGates = `GATES: ${activeGatesCount} ACTIVE`;
const hudPort = `PORT: ${terminalPort} ${isLab ? 'LAB' : 'PROD'}`;
const hudStatus = 'SYS: ONLINE';
const hudVoice = 'VOICE: BIMODAL';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate Prompt Accordions
const promptAccordionsHtml = prompts.map(p => {
  const isForensic = p.content.includes('ASD-STE100') || ['3', '5', '10', '12'].includes(p.id);
  const voiceBadge = isForensic 
    ? '<span class="voice-tag voice-forensic">🛡️ FORENSIC &amp; DEFENSE (ASD-STE100)</span>' 
    : '<span class="voice-tag voice-strategic">🏛️ STRATEGIC &amp; MOAT VOICE</span>';

  return `
  <details class="prompt-accordion" id="prompt-part-${p.id}">
    <summary>
      <span>Part ${p.id}: ${escapeHtml(p.title.replace(`Part ${p.id}:`, '').trim())}</span>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        ${voiceBadge}
        <span style="font-size:0.75rem; color:var(--text-muted);">Step ${p.id}</span>
      </div>
    </summary>
    <div class="accordion-body">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <span style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Active Canonical Master Prompt Text</span>
        <button class="btn copy-btn" data-target="prompt-code-${p.id}" style="position:static;">📋 Copy Master Prompt</button>
      </div>
      <pre id="prompt-code-${p.id}">${escapeHtml(p.content)}</pre>
    </div>
  </details>
  `;
}).join('\n');

// Build Full HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Value Investing Terminal — Flight Crew Operating Manual (FCOM)</title>
  <style>
${css}
  </style>
</head>
<body>

  <!-- Cockpit Header / HUD (100% Automated from Config) -->
  <header class="cockpit-header">
    <div class="cockpit-title">
      <span style="font-size:1.4rem;">✈️</span>
      <div>
        <h1>Value Investing Terminal</h1>
        <div style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">FLIGHT CREW OPERATING MANUAL (FCOM) — ${terminalRevision}</div>
      </div>
      <div style="display:flex; gap:0.4rem; margin-left:1rem; flex-wrap:wrap;">
        <span class="hud-badge" id="hud-status">${hudStatus}</span>
        <span class="hud-badge" id="hud-port">${hudPort}</span>
        <span class="hud-badge" id="hud-pipeline">PIPELINE: ${hudPipeline}</span>
        <span class="hud-badge" id="hud-gates">${hudGates}</span>
        <span class="hud-badge" id="hud-voice">${hudVoice}</span>
      </div>
    </div>
    <div class="cockpit-actions">
      <button class="btn" id="expand-all-btn">Expand All</button>
      <button class="btn" onclick="window.print()">🖨️ Print / PDF</button>
      <button class="btn btn-primary" id="theme-toggle">🌙 Dark Mode</button>
    </div>
  </header>

  <div class="app-container">
    <!-- Left Navigation / Radar Sidebar -->
    <nav class="sidebar">
      <input type="text" id="manual-search" class="search-box" placeholder="🔍 Search prompts, laws, gates...">
      
      <div class="nav-group-title">Cockpit Quick Ref</div>
      <a href="#vol-0-cockpit" class="nav-link active">Vol 0: Pre-Flight Checklist</a>

      <div class="nav-group-title">Systems Architecture</div>
      <a href="#vol-1-architecture" class="nav-link">Vol 1: Systems &amp; Bimodal Voice</a>
      <a href="#sec-1-1-micro-primacy" class="nav-link" style="padding-left:1.25rem;">1.1 Micro-Primacy Directive</a>
      <a href="#sec-1-2-bimodal-voice" class="nav-link" style="padding-left:1.25rem;">1.2 Bimodal Voice Architecture</a>
      <a href="#sec-1-3-v7-changes" class="nav-link" style="padding-left:1.25rem;">1.3 V6.2 → V7 Changelog</a>

      <div class="nav-group-title">Operating Limitations</div>
      <a href="#vol-2-limitations" class="nav-link">Vol 2: The 5 Formatting Laws</a>
      <a href="#law-1" class="nav-link" style="padding-left:1.25rem;">Law 1: Zero Raw LaTeX Math</a>
      <a href="#law-2" class="nav-link" style="padding-left:1.25rem;">Law 2: Strict Markdown Tables</a>
      <a href="#law-3" class="nav-link" style="padding-left:1.25rem;">Law 3: Numbered Flywheels (Pt 4)</a>
      <a href="#law-4" class="nav-link" style="padding-left:1.25rem;">Law 4: Dual-Format Delivery</a>
      <a href="#law-5" class="nav-link" style="padding-left:1.25rem;">Law 5: Parser Invariance</a>

      <div class="nav-group-title">Normal Procedures</div>
      <a href="#vol-3-pipeline" class="nav-link">Vol 3: ${hudPipeline} Pipeline</a>
${prompts.map(p => `      <a href="#prompt-part-${p.id}" class="nav-link" style="padding-left:1.25rem;">Part ${p.id}: ${escapeHtml(p.title.replace(`Part ${p.id}:`, '').trim().slice(0, 24))}...</a>`).join('\n')}

      <div class="nav-group-title">Emergency Procedures</div>
      <a href="#vol-4-gates" class="nav-link">Vol 4: The 5 Falsification Gates</a>
      <a href="#gate-1" class="nav-link" style="padding-left:1.25rem;">Gate 1: Flywheel Falsification</a>
      <a href="#gate-2" class="nav-link" style="padding-left:1.25rem;">Gate 2: Symmetrical Discovery</a>
      <a href="#gate-3" class="nav-link" style="padding-left:1.25rem;">Gate 3: Red Queen Effect</a>
      <a href="#gate-4" class="nav-link" style="padding-left:1.25rem;">Gate 4: Earned Franchise Weighting</a>
      <a href="#gate-5" class="nav-link" style="padding-left:1.25rem;">Gate 5: Cyclical Disambiguation</a>
      <a href="#circuit-breaker" class="nav-link" style="padding-left:1.25rem;">2-Strike Circuit Breaker</a>

      <div class="nav-group-title">Codex &amp; Audit Evaluation</div>
      <a href="#vol-5-codex" class="nav-link">Vol 5: Literature &amp; Audit</a>
      <a href="#sec-27-matrix" class="nav-link" style="padding-left:1.25rem;">27-Source Literature Matrix</a>
      <a href="#sec-audit-evaluation" class="nav-link" style="padding-left:1.25rem;">⚖️ Institutional Audit (92%)</a>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content">

      <!-- Volume 0 -->
      <section id="vol-0-cockpit">
        <h2>Volume 0: Cockpit Quick Reference &amp; Pre-Flight Checklist</h2>
        <p>Before launching an institutional valuation run in Terminal V7, verify all pre-flight flight-control checks:</p>
        
        <div class="callout">
          <h4>Pre-Flight Ingestion Verification Checklist</h4>
          <p>• <strong>Document Verification Roll Call:</strong> Confirm SEC 10-K, latest 10-Q, latest earnings transcript, and 10-period CSV are loaded.<br>
          • <strong>Home Currency Preservation:</strong> For international ADRs (e.g. MXN, JPY, EUR), verify operations run in Home Currency.<br>
          • <strong>CSV as Ground Truth:</strong> Extract all 5-to-10 year historical trajectories directly from the CSV; never extrapolate manually.<br>
          • <strong>Zero Premature Flywheels:</strong> Flywheel synthesis is strictly forbidden in Part 1 or Part 2. Restricted exclusively to Part 4.</p>
        </div>
      </section>

      <!-- Volume 1 -->
      <section id="vol-1-architecture">
        <h2>Volume 1: Systems Architecture &amp; Bimodal Voice</h2>
        
        <div id="sec-1-1-micro-primacy">
          <h3>1.1 Micro-Primacy Directive</h3>
          <p>Terminal V7 operates under strict <strong>Micro-Primacy</strong>. Macroeconomic speculation and top-down market guessing are permanently decommissioned. Under the Buffett-Munger-Lynch Cash-Flow Sovereign Model, intrinsic value is built bottom-up from normalized owner cash flows, probabilistic 10-year DCF models, the Zero-Growth EPV benchmark floor, and structural competitive moats (asset reproduction cost ARV permanently eliminated).</p>
        </div>

        <div id="sec-1-2-bimodal-voice">
          <h3>1.2 Bimodal Voice Architecture</h3>
          <p>The Terminal enforces two distinct linguistic modes depending on the analytical task:</p>
          <table>
            <thead>
              <tr>
                <th>Voice Mode</th>
                <th>Active Chapters</th>
                <th>Stylistic Rules &amp; Philosophy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style="color:var(--accent-blue);">Strategic &amp; Moat Voice</strong></td>
                <td>Parts 1, 2, 4, 7, 8, 9, 11</td>
                <td>Deep, nuanced institutional economic reasoning emulating Warren Buffett, Charlie Munger, and Peter Lynch. Rich qualitative depth, customer captivity, scale economics, multi-stage compounding flywheels, and probabilistic margin of safety synthesis. Rich qualitative depth, customer captivity, scale economics, multi-stage compounding flywheels.</td>
              </tr>
              <tr>
                <td><strong style="color:var(--accent-rose);">Forensic &amp; Defense Voice (ASD-STE100)</strong></td>
                <td>Part 3 (Cash Flow Integrity), Part 5 (Qualitative &amp; Symmetrical Balance Sheet), Part 10 (Red Team Short Attack), Step 12 (Forensic Crosscheck), and Governance/Capital Allocation Audits</td>
                <td>Simplified Technical English adapted for audit-grade clarity: Active voice only; max 20-25 words per sentence; zero corporate euphemisms; strict assertions: <code>[Metric] is [Value]. [Benchmark] was [Value]. [Finding: PASS/FLAG/BREACH]</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div id="sec-1-3-v7-changes">
          <h3>1.3 Transition from V6.2 to V7 (Changelog)</h3>
          <div class="callout callout-warning">
            <h4>Decommissioned Features (Strictly Banned)</h4>
            <p>1. <strong>No Phased Execution Mode:</strong> The legacy "Tier 1 vs. Tier 2" mode is dead. Execution is unified full-auto.<br>
            2. <strong>No Generic Macro / Howard Marks Market Temperature:</strong> The 21-pair macro survey is eliminated.<br>
            3. <strong>No Legacy 15/16-Part or 12+1 Numbering:</strong> Execution strictly follows the unified <strong>11+1 canonical pipeline</strong> (11 Master Prompts + Step 12 Forensic Crosscheck). Net Asset Reproduction Floor (ARV) has been permanently eliminated under the Cash-Flow Sovereign Model.</p>
          </div>
        </div>
      </section>

      <!-- Volume 2 -->
      <section id="vol-2-limitations">
        <h2>Volume 2: Operating Limitations (The 5 Inviolable Formatting Laws)</h2>
        <p>Enforced programmatically by <code>src/utils/dossierFormatGuard.ts</code> to guarantee native Obsidian and HTML rendering:</p>

        <div id="law-1" class="callout callout-critical">
          <h4>Law 1: Zero Raw LaTeX Math</h4>
          <p>Strictly forbidden from outputting LaTeX/TeX syntax (<code>\\begin{aligned}</code>, <code>$$...$$</code>, <code>\\frac{...}{...}</code>). All valuation math and reconciliations must be clean plain-text markdown or bullet points.</p>
        </div>

        <div id="law-2" class="callout callout-critical">
          <h4>Law 2: Strict Markdown Tables &amp; Aesthetic Alignment (Zero ASCII Art)</h4>
          <p>Strictly forbidden from outputting ASCII typewriter borders (<code>====</code>, <code>----</code>), box characters (<code>+----+</code>), typewriter sliders, enclosing prose/tables in monospace code blocks, or outputting text progress bars (<code>[#####]</code>). All data arrays MUST be standard GitHub-Flavored Markdown (GFM) pipe tables.</p>
          <p style="margin-top:0.5rem; font-size:0.85rem;">• <strong>Symmetrical Balance Sheet Synthesis (Part 5):</strong> Mandates 3-column table (<code>| Off-Balance-Sheet Vector | Valuation Spread ($M) | Balance Sheet Impact |</code>).<br>
          • <strong>Chapter Preamble Summaries (Parts 2, 3, 7, 8):</strong> Mandates 4-column table (<code>| Strategic Parameter | Audited Economic Anchor | Strategic Parameter | Audited Economic Anchor |</code>).<br>
          • <strong>Obsidian Code Block Elimination:</strong> Leading 4+ spaces on non-code lines are stripped to eliminate accidental dark monospace boxes in Obsidian.<br>
          • <strong>2-Column Alignment Contract:</strong> 2-column key-value and verdict tables assign <code>.cell-verdict-val</code> (left-aligned with 1.5rem padding), preventing jagged zig-zag alignment.</p>
        </div>

        <div id="law-3" class="callout callout-critical">
          <h4>Law 3: Numbered Compounding Flywheel Structure, Zero Premature Flywheels &amp; Mandatory Falsification</h4>
          <p>Flywheels belong exclusively to Part 4, Section 1.7. Must be structured as clean numbered stages 1 to 5 with an explicit Stage 5 Loopback description for Mermaid/HTML parsers. Strictly forbidden in Part 1 or Part 2.</p>
          <p style="margin-top:0.5rem; font-size:0.85rem;">• <strong>Mandatory Flywheel Falsification Audit:</strong> If a business operates as a cyclical commodity processor or linear value chain lacking an organic closed loop, the model MUST declare <code>#### 1.7 Compounding Architecture: LINEAR VALUE CHAIN / CYCLICAL COMMODITY (NO ORGANIC FLYWHEEL)</code> rather than inventing an artificial loop.<br>
          • <strong>HTML Duplicate Walkthrough Suppression:</strong> Redundant stage text lists ("Flywheel Mechanics Walkthrough") are suppressed in HTML when interactive diagrams and conveyor cards render.</p>
        </div>

        <div id="law-4" class="callout callout-critical">
          <h4>Law 4: Dual-Format Delivery Contract</h4>
          <p>• <strong>Obsidian Markdown (<code>.md</code>):</strong> Line 1 MUST contain structured YAML frontmatter (11 canonical keys). Headings map to institutional chapter titles.<br>
          • <strong>Standalone HTML (<code>.html</code>):</strong> Fully self-contained, zero external CDN scripts, high-contrast typography, sticky first table columns, and <code>.formula-card</code> containers.</p>
        </div>

        <div id="law-5" class="callout callout-critical">
          <h4>Law 5: Parser &amp; Chart Invariance</h4>
          <p>Numeric parsers must cleanly strip markdown bolding and correctly parse accounting negatives like <code>**($19.00)**</code> without collapsing to <code>NaN -> 0</code>. Cash flow visualizers must strictly filter out margin/percentage rows when plotting absolute dollar series.</p>
        </div>
      </section>

      <!-- Volume 3 -->
      <section id="vol-3-pipeline">
        <h2>Volume 3: Normal Procedures — The ${hudPipeline} Pipeline</h2>
        <p>The authoritative ${prompts.length} Master Prompts driving the Terminal valuation engine. Click any prompt to expand and copy:</p>

${promptAccordionsHtml}
      </section>

      <!-- Volume 4 -->
      <section id="vol-4-gates">
        <h2>Volume 4: Emergency Procedures &amp; Circuit Breakers</h2>
        <p>The Lab Sandbox implements 5 dynamic conditional falsification gates that intercept flawed assumptions in real time:</p>

        <div id="gate-1" class="callout callout-warning">
          <h4>Gate 1: Flywheel Falsification Gate</h4>
          <p><strong>Trigger Condition:</strong> ROIC &lt; 10.0% static hurdle rate for 3+ consecutive years, or enterprise operates as a cyclical commodity processor / linear manufacturer.<br>
          <strong>Procedural Action:</strong> Aborts compounding flywheel generation completely. Declares <code>LINEAR VALUE CHAIN / CYCLICAL COMMODITY (NO ORGANIC FLYWHEEL)</code> and details linear operating constraints.</p>
        </div>

        <div id="gate-2" class="callout">
          <h4>Gate 2: Symmetrical Discovery Engine</h4>
          <p><strong>Trigger Condition:</strong> Detection of unquantified latent balance sheet claims or pricing power.<br>
          <strong>Procedural Action:</strong> Dynamically injects off-balance-sheet debt equivalents (leases, pensions) and hidden pricing power into the valuation bridge.</p>
        </div>

        <div id="gate-3" class="callout callout-warning">
          <h4>Gate 3: Red Queen Effect Gate</h4>
          <p><strong>Trigger Condition:</strong> High recurring SG&amp;A/R&amp;D spend required merely to defend existing market share.<br>
          <strong>Procedural Action:</strong> Upwardly revises maintenance capex assumptions and penalizes competitive advantage period (CAP) in DCF modeling.</p>
        </div>

        <div id="gate-4" class="callout callout-warning">
          <h4>Gate 4: Earned Franchise Weighting Gate</h4>
          <p><strong>Trigger Condition:</strong> EPS growth &gt; 15% driven primarily by share buybacks or multiple expansion rather than organic operational growth.<br>
          <strong>Procedural Action:</strong> Penalizes quality of earnings score and isolates underlying organic cash compounding power.</p>
        </div>

        <div id="gate-5" class="callout">
          <h4>Gate 5: 4-Point Cyclical Compounder Disambiguation &amp; 4-Gate Isolation Matrix</h4>
          <p><strong>Trigger Condition:</strong> Industrial, materials, or technology companies in cyclical sectors (Part 9) or existing holdings experiencing margin compression / drawdowns (Part 11).<br>
          <strong>Procedural Action:</strong> Separates disguised <strong>Cyclical Compounders</strong> (passing Trough-to-Trough EPS escalation, 3-to-10 Yr recency-weighted physical volume decoupling, 3-to-10 Yr recency-weighted ROIC &gt; 10.0%, and countercyclical buybacks — protected by Never-Trim) from <strong>Pure Commodity Cyclicals</strong> (routed to peak-cycle exits). Enforces the 4-Gate Peer-Relative Moat Isolation Matrix before issuing <code>HOLD</code>, <code>ACCUMULATE</code>, or <code>LIQUIDATE</code>.</p>
        </div>

        <div id="circuit-breaker" class="callout callout-critical">
          <h4>Terminal Regression Guard: 2-Strike Anti-Thrashing Circuit Breaker</h4>
          <p>Governed by <code>.agents/skills/terminal-regression-guard</code>. If an automated fix introduces a secondary break or fails verification tests twice in a row, the execution circuit breaker trips immediately. Halts execution, forces <code>git diff</code> inspection, and preserves golden baselines.</p>
        </div>
      </section>

      <!-- Volume 5 -->
      <section id="vol-5-codex">
        <h2>Volume 5: Ground-Truth Reference Codex &amp; Institutional Audit Evaluation</h2>

        <div id="sec-27-matrix">
          <h3>The 27-Source Literature Codex Matrix</h3>
          <p>All quantitative calculations and thresholds are hardwired to classical value investing literature:</p>
          <table>
            <thead>
              <tr>
                <th>Core Philosophy</th>
                <th>Valuation &amp; Forensics</th>
                <th>Moats &amp; Strategy</th>
                <th>Capital Allocation</th>
                <th>Mental Models</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><em>Security Analysis</em> (Graham &amp; Dodd)</td>
                <td><em>Value Investing</em> (Greenwald)</td>
                <td><em>Competition Demystified</em> (Greenwald)</td>
                <td><em>The Outsiders</em> (Thorndike)</td>
                <td><em>Poor Charlie's Almanack</em> (Munger)</td>
              </tr>
              <tr>
                <td><em>The Intelligent Investor</em> (Graham)</td>
                <td><em>Financial Shenanigans</em> (Schilit)</td>
                <td><em>Understanding Michael Porter</em> (Magretta)</td>
                <td><em>Dear Shareholder</em> (Cunningham)</td>
                <td><em>Thinking, Fast and Slow</em> (Kahneman)</td>
              </tr>
              <tr>
                <td><em>Margin of Safety</em> (Klarman)</td>
                <td><em>Expectations Investing</em> (Mauboussin)</td>
                <td><em>7 Powers</em> (Helmer)</td>
                <td><em>Capital Allocation</em> (Giroux)</td>
                <td><em>The Most Important Thing</em> (Marks)</td>
              </tr>
              <tr>
                <td><em>Common Stocks</em> (Fisher)</td>
                <td><em>Creative Cash Flow</em> (Mulford)</td>
                <td><em>Quality Investing</em> (Cunningham)</td>
                <td><em>Buffett Annual Letters</em></td>
                <td><em>Fooled by Randomness</em> (Taleb)</td>
              </tr>
              <tr>
                <td><em>Little Book of Value</em> (Browne)</td>
                <td><em>Valuation</em> (McKinsey)</td>
                <td><em>Economic Moats</em> (Morningstar)</td>
                <td><em>Return on Capital</em> (Mauboussin)</td>
                <td><em>Superforecasting</em> (Tetlock)</td>
              </tr>
              <tr>
                <td><em>Essays of Buffett</em> (Cunningham)</td>
                <td><em>Quality of Earnings</em> (O'glove)</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

${auditEvaluationHtml}
      </section>

    </main>
  </div>

  <div id="toast">Copied to clipboard!</div>

  <script>
${js}
  </script>
</body>
</html>
`;

// Write to public/terminal_v7_manual.html
const outPath = path.join(__dirname, '../public/terminal_v7_manual.html');
fs.writeFileSync(outPath, html, 'utf8');

console.log('Successfully generated:', outPath);
console.log('Automated HUD: Revision=' + terminalRevision + ', Port=' + terminalPort + ', Pipeline=' + hudPipeline + ', Gates=' + activeGatesCount);
console.log('File size:', (fs.statSync(outPath).size / 1024).toFixed(1), 'KB');
