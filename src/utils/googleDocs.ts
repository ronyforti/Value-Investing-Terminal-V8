import { 
  parseBlocks, 
  cleanMarkdownForRendering, 
  getTableChartType, 
  isAscendingChronological, 
  parseFlywheelSteps, 
  FlywheelStep 
} from '../components/MarkdownView';

export { cleanMarkdownForRendering };

// Helper to remove emojis
const removeEmojis = (text: string): string => {
  return text.replace(/\p{Extended_Pictographic}/gu, '').replace(/\p{Emoji_Presentation}/gu, '').replace(/[\uFE0F]/g, '').trim();
};

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Helper to clean and parse float numbers from financial cells
function parseNumeric(val: string): number {
  if (!val) return 0;
  const sanitized = val.replace(/[\*\_\#`]/g, '').trim();
  const isNegative = /^\s*[-–—]/.test(sanitized) || 
                     /^\s*\(.*\)\s*$/.test(sanitized) || 
                     /^\s*(?:[\$\€\¥\£]|R\$|MX\$|CA\$|CHF|USD)?\s*\(.*\)\s*$/i.test(sanitized) ||
                     /^\s*\(\s*(?:[\$\€\¥\£]|R\$|MX\$|CA\$|CHF|USD)?[^\)]+\)\s*$/i.test(sanitized);
  const clean = sanitized
    .replace(/(?:R\$|MX\$|CA\$|CHF|USD|EUR|GBP|BRL|JPY)/gi, '')
    .replace(/[\$\€\¥\£%,\s\(\)]/g, '');
  let multiplier = 1;
  if (/billion/i.test(val)) multiplier = 1000;
  let num = parseFloat(clean);
  if (isNaN(num)) num = 0;
  return (isNegative ? -Math.abs(num) : Math.abs(num)) * multiplier;
}

// Helper to translate simple markdown inline formatting to HTML
const parseInline = (text: string): string => {
  let html = removeEmojis(text);
  // Clean residual LaTeX if any passed through
  html = html.replace(/\{,\}/g, ',');
  html = html.replace(/\\Delta\b/g, 'Δ');
  html = html.replace(/\\quad\b/g, ' ');
  html = html.replace(/\\qquad\b/g, '  ');
  html = html.replace(/\\&/g, '&');
  html = html.replace(/\\times/g, '×');
  html = html.replace(/\\approx/g, '≈');
  html = html.replace(/\\le\b/g, '≤');
  html = html.replace(/\\ge\b/g, '≥');
  html = html.replace(/\\pm\b/g, '±');
  html = html.replace(/\\cdot/g, '·');
  html = html.replace(/\\textbf\{([^{}]*)\}/g, '<strong class="text-strong">$1</strong>');
  html = html.replace(/\\mathbf\{([^{}]*)\}/g, '<strong class="text-strong">$1</strong>');
  html = html.replace(/\\text\{([^{}]*)\}/g, '$1');
  html = html.replace(/\\mathrm\{([^{}]*)\}/g, '$1');
  html = html.replace(/\\mathit\{([^{}]*)\}/g, '<em class="text-em">$1</em>');
  html = html.replace(/\\underline\{([^{}]*)\}/g, '$1');
  html = html.replace(/([a-zA-Z0-9]+)_\{([^{}]*)\}/g, '$1 ($2)');
  html = html.replace(/_\{([^{}]*)\}/g, ' ($1)');

  let fracIter = 0;
  while (/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/.test(html) && fracIter < 10) {
    html = html.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1 / $2)');
    fracIter++;
  }

  // Bold **text** and __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-strong">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="text-strong">$1</strong>');
  // Italic *text* and _text_
  html = html.replace(/\*(.*?)\*/g, '<em class="text-em">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="text-em">$1</em>');
  // Inline code `code`
  html = html.replace(/`(.*?)`/g, '<code class="dossier-code">$1</code>');
  // Markdown links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="dossier-link">$1</a>');

  // Forensic Audit Findings Badges
  html = html.replace(/\[\s*(?:Audit Finding:\s*)?(?:🟢|🟡|🔴|⚠️|✔️|❌)?\s*(PASS(?:ED)?|CLEAN|CORROBORATED)\s*\]/gi, '<span class="audit-badge badge-pass">$1</span>');
  html = html.replace(/\[\s*(?:Audit Finding:\s*)?(?:🟢|🟡|🔴|⚠️|✔️|❌)?\s*(FLAG|CAUTION|MONITOR)\s*\]/gi, '<span class="audit-badge badge-flag">$1</span>');
  html = html.replace(/\[\s*(?:Audit Finding:\s*)?(?:🟢|🟡|🔴|⚠️|✔️|❌)?\s*(BREACH|FAIL|DEFICIENT)\s*\]/gi, '<span class="audit-badge badge-breach">$1</span>');
  html = html.replace(/\[\s*(?:Audit Finding:\s*)?(?:🟢|🟡|🔴|⚠️|✔️|❌)?\s*(VERIFIED|CONFIRMED)\s*\]/gi, '<span class="audit-badge badge-pass">$1</span>');
  html = html.replace(/(?:^|\s)(?:🟢|🟡|🔴|⚠️|✔️|❌)?\s*\*\*(PASS(?:ED)?|CLEAN|CORROBORATED)(?!\s+if\b)((?:\s+[A-Za-z0-9\/\-]{1,15}){0,2})?\*\*/gi, ' <span class="audit-badge badge-pass">$1$2</span>');
  html = html.replace(/(?:^|\s)(?:🟢|🟡|🔴|⚠️|✔️|❌)?\s*\*\*(FLAG|CAUTION|MONITOR)(?!\s+if\b)((?:\s+[A-Za-z0-9\/\-]{1,15}){0,2})?\*\*/gi, ' <span class="audit-badge badge-flag">$1$2</span>');
  html = html.replace(/(?:^|\s)(?:🟢|🟡|🔴|⚠️|✔️|❌)?\s*\*\*(BREACH|FAIL|DEFICIENT)(?!\s+if\b)((?:\s+[A-Za-z0-9\/\-]{1,15}){0,2})?\*\*/gi, ' <span class="audit-badge badge-breach">$1$2</span>');
  return html;
};

const cleanMarkdownSymbols = (text: string): string => {
  return text.replace(/[\*\_\#`]/g, '').trim();
};

function renderSvgFlywheelDiagram(steps: FlywheelStep[]): string {
  if (!steps || steps.length < 2) return '';
  const N = Math.min(steps.length, 6);
  const cx = 320;
  const cy = 215;
  const R = 145;

  const nodes = steps.slice(0, N).map((s, i) => {
    const angle = -Math.PI / 2 + i * (2 * Math.PI / N);
    const nx = cx + R * Math.cos(angle);
    const ny = cy + R * Math.sin(angle);
    const stageNum = s.number < 10 ? `0${s.number}` : `${s.number}`;
    const cleanTitle = s.title.replace(/[:\|\-\s]+$/, '').trim();
    return { step: s, idx: i, stageNum, title: cleanTitle, angle, nx, ny };
  });

  const paths: string[] = [];
  for (let i = 0; i < N; i++) {
    const curr = nodes[i];
    const next = nodes[(i + 1) % N];
    const isLoopback = i === N - 1;

    const midAngle = curr.angle + (next.angle > curr.angle ? (next.angle - curr.angle) / 2 : (next.angle + 2 * Math.PI - curr.angle) / 2);
    const arcRadius = R * (isLoopback ? 1.18 : 1.05);
    const mx = cx + arcRadius * Math.cos(midAngle);
    const my = cy + arcRadius * Math.sin(midAngle);

    const strokeColor = isLoopback ? 'var(--accent-emerald)' : 'var(--border-card)';
    const strokeWidth = isLoopback ? 2.5 : 2;
    const dash = isLoopback ? 'stroke-dasharray="6,4"' : '';
    const marker = isLoopback ? 'url(#arrow-emerald)' : 'url(#arrow-gray)';

    paths.push(`
      <path d="M ${curr.nx.toFixed(1)} ${curr.ny.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${next.nx.toFixed(1)} ${next.ny.toFixed(1)}" 
            fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${dash} marker-end="${marker}" />
    `);
  }

  const nodeElements = nodes.map(n => {
    const isTerminal = n.idx === N - 1;
    const isFirst = n.idx === 0;
    const nodeBg = isTerminal ? 'var(--accent-emerald-light)' : (isFirst ? 'var(--bg-card)' : 'var(--bg-card)');
    const nodeStroke = isTerminal ? 'var(--accent-emerald)' : (isFirst ? 'var(--accent-emerald)' : 'var(--border-card)');
    const textColor = isTerminal ? 'var(--accent-emerald)' : 'var(--text-primary)';
    const shortTitle = n.title.length > 22 ? n.title.slice(0, 20) + '…' : n.title;

    return `
    <g class="flywheel-node-group" transform="translate(${(n.nx - 65).toFixed(1)}, ${(n.ny - 26).toFixed(1)})">
      <rect width="130" height="52" rx="10" ry="10" fill="${nodeBg}" stroke="${nodeStroke}" stroke-width="${isTerminal || isFirst ? 2 : 1.5}" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
      <text x="65" y="20" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" font-weight="700" fill="var(--accent-emerald)">STAGE ${n.stageNum}</text>
      <text x="65" y="38" text-anchor="middle" font-family="var(--font-sans)" font-size="11" font-weight="600" fill="${textColor}">${escapeHtml(shortTitle)}</text>
    </g>`;
  }).join('');

  return `
  <div class="flywheel-svg-wrap">
    <svg viewBox="0 0 640 430" class="flywheel-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrow-gray" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--text-muted)" />
        </marker>
        <marker id="arrow-emerald" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent-emerald)" />
        </marker>
      </defs>

      <!-- Center Compounding Core -->
      <circle cx="${cx}" cy="${cy}" r="58" fill="var(--bg-card)" stroke="var(--accent-emerald)" stroke-width="2" stroke-dasharray="5,3" filter="drop-shadow(0 4px 8px rgba(16,185,129,0.12))" />
      <text x="${cx}" y="${cy - 12}" text-anchor="middle" font-family="var(--font-sans)" font-size="11" font-weight="800" fill="var(--accent-emerald)" letter-spacing="1">COMPOUNDING</text>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="var(--font-mono)" font-size="9.5" font-weight="700" fill="var(--text-muted)">ACCELERATION CORE</text>
      <text x="${cx}" y="${cy + 22}" text-anchor="middle" font-family="var(--font-sans)" font-size="9" fill="var(--accent-emerald)">↺ Self-Funding Loop</text>

      <!-- Connection Arrows -->
      ${paths.join('')}

      <!-- Orbital Nodes -->
      ${nodeElements}
    </svg>
  </div>`;
}

function renderFlywheelHtml(steps: FlywheelStep[], _ticker?: string): string {
  if (!steps || steps.length < 2) return '';

  const firstStage = steps[0];
  const terminalStage = steps[steps.length - 1];

  const cardsHtml = steps.map((s, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === steps.length - 1;
    const stageNum = s.number < 10 ? `0${s.number}` : `${s.number}`;
    const cleanStageTitle = s.title.replace(/[:\|\-\s]+$/, '').trim();
    const cleanDesc = (s.description || '').replace(/^[\*_\s:\|\-]+/, '').replace(/[\*_\s:\|\-]+$/, '').trim();

    return `
    <div class="flywheel-step-card ${isFirst ? 'card-first' : ''} ${isLast ? 'card-last' : ''}">
      <div class="flywheel-card-header">
        <span class="pipeline-stage-pill">STAGE ${stageNum}</span>
        ${isLast ? '<span class="pipeline-loop-tag">Loopback Terminal</span>' : ''}
      </div>
      <div class="flywheel-card-title">${escapeHtml(cleanStageTitle)}</div>
      ${cleanDesc ? `<div class="flywheel-card-desc">${escapeHtml(cleanDesc)}</div>` : ''}
    </div>`;
  }).join('');

  return `
  <div class="chart-box pipeline-box flywheel-container-box">
    <div class="chart-header">
      <div class="pipeline-header-left">
        <span class="pipeline-icon">↻</span>
        <span class="chart-title">5-Stage Compounding Flywheel Architecture</span>
      </div>
      <span class="pipeline-badge">Closed-Loop Compounding Engine</span>
    </div>

    <!-- Responsive SVG Radial Flywheel Diagram -->
    ${renderSvgFlywheelDiagram(steps)}

    <!-- Responsive Multi-Column Stage Walkthrough Cards -->
    <div class="flywheel-cards-grid">
      ${cardsHtml}
    </div>

    <!-- Closed-Loop Reinvestment Engine Banner -->
    <div class="pipeline-loopback-banner">
      <div class="pipeline-loopback-badge">
        <span class="pipeline-loop-icon">↺</span>
        <span>THE COMPOUNDING RETURN LOOP</span>
      </div>
      <div class="pipeline-loopback-text">
        <strong>Continuous Moat Expansion:</strong> Scale advantages and operating cash flows generated at <em>Stage 0${terminalStage.number} (${escapeHtml(terminalStage.title.replace(/[:\|\-\s]+$/, '').trim())})</em> are systematically reinvested into unit-cost compression, fulfillment speed, and platform enhancements—injecting fresh compounding momentum directly back into <em>Stage 0${firstStage.number} (${escapeHtml(firstStage.title.replace(/[:\|\-\s]+$/, '').trim())})</em>.
      </div>
    </div>
  </div>`;
}

function renderSvgLinearValueChainDiagram(steps: FlywheelStep[]): string {
  if (!steps || steps.length < 2) return '';
  const N = Math.min(steps.length, 5);
  const totalW = 760;
  const totalH = 140;
  const startX = 22;
  const cardW = 124;
  const cardH = 56;
  const gap = N > 1 ? (totalW - (startX * 2) - (N * cardW)) / (N - 1) : 20;

  const nodes = steps.slice(0, N).map((s, i) => {
    const x = startX + i * (cardW + gap);
    const y = 42;
    const stageNum = s.number < 10 ? `0${s.number}` : `${s.number}`;
    const cleanTitle = s.title.replace(/[:\|\-\s]+$/, '').trim();
    return { step: s, idx: i, stageNum, title: cleanTitle, x, y };
  });

  const arrows = nodes.slice(0, N - 1).map((curr, i) => {
    const next = nodes[i + 1];
    const x1 = curr.x + cardW + 4;
    const x2 = next.x - 4;
    const yMid = curr.y + cardH / 2;
    return `
      <line x1="${x1.toFixed(1)}" y1="${yMid.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${yMid.toFixed(1)}" 
            stroke="var(--accent-emerald)" stroke-width="2.5" marker-end="url(#arrow-linear-emerald)" />
    `;
  }).join('');

  const nodeElements = nodes.map(n => {
    const isTerminal = n.idx === N - 1;
    const isFirst = n.idx === 0;
    const nodeBg = isTerminal ? 'var(--table-row-alt)' : 'var(--bg-card)';
    const nodeStroke = isTerminal ? 'var(--text-muted)' : (isFirst ? 'var(--accent-emerald)' : 'var(--border-card)');
    const strokeWidth = isTerminal ? 1.5 : (isFirst ? 2 : 1.5);
    const stageColor = isTerminal ? 'var(--text-muted)' : 'var(--accent-emerald)';
    const textColor = isTerminal ? 'var(--text-secondary)' : 'var(--text-primary)';
    const shortTitle = n.title.length > 20 ? n.title.slice(0, 18) + '…' : n.title;

    return `
    <g class="linear-node-group" transform="translate(${n.x.toFixed(1)}, ${n.y.toFixed(1)})">
      <rect width="${cardW}" height="${cardH}" rx="10" ry="10" fill="${nodeBg}" stroke="${nodeStroke}" stroke-width="${strokeWidth}" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
      <text x="${cardW / 2}" y="20" text-anchor="middle" font-family="var(--font-mono)" font-size="10" font-weight="700" fill="${stageColor}">${isTerminal ? 'TERMINAL NODE' : `STAGE ${n.stageNum}`}</text>
      <text x="${cardW / 2}" y="38" text-anchor="middle" font-family="var(--font-sans)" font-size="11" font-weight="600" fill="${textColor}">${escapeHtml(shortTitle)}</text>
    </g>`;
  }).join('');

  return `
  <div class="linear-chain-svg-wrap">
    <svg viewBox="0 0 ${totalW} ${totalH}" class="linear-chain-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrow-linear-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-emerald)" />
        </marker>
      </defs>

      <!-- Sequential Linear Flow Axis -->
      <line x1="${startX}" y1="${42 + cardH / 2}" x2="${totalW - startX}" y2="${42 + cardH / 2}" stroke="var(--border-subtle)" stroke-width="1.5" stroke-dasharray="4,4" />

      <!-- Directional Flow Arrows -->
      ${arrows}

      <!-- Sequential Linear Nodes -->
      ${nodeElements}
    </svg>
  </div>`;
}

function renderLinearValueChainHtml(steps: FlywheelStep[], _ticker?: string): string {
  if (!steps || steps.length < 2) return '';

  const terminalStage = steps[steps.length - 1];

  const cardsHtml = steps.map((s, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === steps.length - 1;
    const stageNum = s.number < 10 ? `0${s.number}` : `${s.number}`;
    const cleanStageTitle = s.title.replace(/[:\|\-\s]+$/, '').trim();
    const cleanDesc = (s.description || '').replace(/^[\*_\s:\|\-]+/, '').replace(/[\*_\s:\|\-]+$/, '').trim();

    return `
    <div class="flywheel-step-card linear-step-card ${isFirst ? 'card-first' : ''} ${isLast ? 'card-linear-terminal' : ''}">
      <div class="flywheel-card-header">
        <span class="pipeline-stage-pill ${isLast ? 'pill-terminal' : ''}">${isLast ? 'DISCRETIONARY ALLOCATION' : `STAGE ${stageNum}`}</span>
        ${isLast ? '<span class="pipeline-linear-tag">No Organic Loopback</span>' : '<span class="pipeline-linear-seq">➔ Linear Step</span>'}
      </div>
      <div class="flywheel-card-title">${escapeHtml(cleanStageTitle)}</div>
      ${cleanDesc ? `<div class="flywheel-card-desc">${escapeHtml(cleanDesc)}</div>` : ''}
    </div>`;
  }).join('');

  return `
  <div class="chart-box pipeline-box linear-chain-container-box">
    <div class="chart-header">
      <div class="pipeline-header-left">
        <span class="pipeline-icon">➔</span>
        <span class="chart-title">5-Stage Linear Value Chain Architecture</span>
      </div>
      <span class="pipeline-badge badge-linear">Audited: Linear Value Chain (No Organic Flywheel)</span>
    </div>

    <!-- Responsive SVG Linear Value Chain Pipeline -->
    ${renderSvgLinearValueChainDiagram(steps)}

    <!-- Responsive Multi-Column Stage Walkthrough Cards -->
    <div class="flywheel-cards-grid linear-cards-grid">
      ${cardsHtml}
    </div>

    <!-- Linear Falsification & Capital Allocation Banner -->
    <div class="pipeline-loopback-banner linear-terminal-banner">
      <div class="pipeline-loopback-badge linear-terminal-badge">
        <span class="pipeline-loop-icon">⚖️</span>
        <span>AUDIT VERDICT: LINEAR VALUE CHAIN / DISCRETIONARY CAPITAL ALLOCATION</span>
      </div>
      <div class="pipeline-loopback-text">
        <strong>Empirical Moat Falsification:</strong> This business operates on a discrete project or cyclical transaction lifecycle. Unlike self-reinforcing compounders where scale automatically lowers customer acquisition costs or deepens network density, operating cash flows at <em>Stage 0${terminalStage.number} (${escapeHtml(terminalStage.title.replace(/[:\|\-\s]+$/, '').trim())})</em> do <strong>NOT</strong> automatically loop back to re-accelerate Stage 01. Sustainable compounding is strictly dependent on management's manual, deliberate capital allocation (selective bidding, M&A discipline, debt retirement, or share repurchases) across business cycles.
      </div>
    </div>
  </div>`;
}

function renderCompetitorRadarSvg(targetTicker: string, rows?: string[][]): string {
  const axes = [
    { label: 'Gross Margin %', angle: -Math.PI / 2 },
    { label: 'Operating Margin %', angle: -Math.PI / 2 + (2 * Math.PI / 5) },
    { label: 'ROIC Efficiency', angle: -Math.PI / 2 + 2 * (2 * Math.PI / 5) },
    { label: 'Valuation Cheapness', angle: -Math.PI / 2 + 3 * (2 * Math.PI / 5) },
    { label: 'Balance Sheet / Net Cash', angle: -Math.PI / 2 + 4 * (2 * Math.PI / 5) },
  ];

  const cx = 240;
  const cy = 175;
  const maxR = 105;

  const rings = [0.25, 0.5, 0.75, 1.0].map(level => {
    const points = axes.map(a => {
      const rx = cx + maxR * level * Math.cos(a.angle);
      const ry = cy + maxR * level * Math.sin(a.angle);
      return `${rx.toFixed(1)},${ry.toFixed(1)}`;
    }).join(' ');
    return `<polygon points="${points}" fill="none" stroke="var(--border-card)" stroke-width="${level === 1.0 ? 1.5 : 1}" stroke-dasharray="${level === 1.0 ? '' : '3,3'}" />`;
  }).join('');

  const spokes = axes.map(a => {
    const x2 = cx + maxR * Math.cos(a.angle);
    const y2 = cy + maxR * Math.sin(a.angle);
    return `<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--border-card)" stroke-width="1" />`;
  }).join('');

  const axisLabels = axes.map(a => {
    const labelR = maxR + 24;
    const lx = cx + labelR * Math.cos(a.angle);
    const ly = cy + labelR * Math.sin(a.angle);
    const anchor = Math.abs(a.angle - (-Math.PI / 2)) < 0.1 ? 'middle' : (Math.cos(a.angle) > 0.1 ? 'start' : 'end');
    return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-family="var(--font-mono)" font-size="10" font-weight="600" fill="var(--text-muted)">${a.label}</text>`;
  }).join('');

  const targetScores = [0.75, 0.70, 0.82, 0.88, 0.48];
  const peerScores = [0.72, 0.68, 0.58, 0.42, 0.62];

  if (rows && rows.length > 0) {
    for (let i = 0; i < Math.min(axes.length, rows.length); i++) {
      const r = rows[i];
      if (!r || r.length < 4) continue;
      const standingCell = r[2] || '';
      const rankMatch = standingCell.match(/#(\d+)\s+of\s+(\d+)/i);
      if (rankMatch) {
        const rank = parseInt(rankMatch[1], 10);
        const total = parseInt(rankMatch[2], 10);
        if (total > 1 && rank >= 1 && rank <= total) {
          targetScores[i] = Number((0.90 - ((rank - 1) / (total - 1)) * 0.64).toFixed(2));
          peerScores[i] = 0.58;
        }
      }
      const targetNum = parseNumeric(r[1] || '');
      const peerNum = parseNumeric(r[3] || '');
      if (!isNaN(targetNum) && !isNaN(peerNum) && Math.abs(peerNum) > 0.01) {
        const isLowerBetter = /ev\s*\/|multiple|efficiency\s+ratio|combined\s+ratio|debt/i.test(r[0] || '');
        const ratio = isLowerBetter ? (peerNum / Math.max(0.01, targetNum)) : (targetNum / peerNum);
        const clampedPeer = Math.max(0.32, Math.min(0.82, targetScores[i] / Math.max(0.5, Math.min(1.8, ratio))));
        peerScores[i] = Number(clampedPeer.toFixed(2));
      }
    }
  }

  const targetPoints = axes.map((a, i) => {
    const r = maxR * targetScores[i];
    return `${(cx + r * Math.cos(a.angle)).toFixed(1)},${(cy + r * Math.sin(a.angle)).toFixed(1)}`;
  }).join(' ');

  const peerPoints = axes.map((a, i) => {
    const r = maxR * peerScores[i];
    return `${(cx + r * Math.cos(a.angle)).toFixed(1)},${(cy + r * Math.sin(a.angle)).toFixed(1)}`;
  }).join(' ');

  return `
  <div class="chart-box radar-chart-box">
    <div class="chart-header">
      <div class="pipeline-header-left">
        <span class="pipeline-icon">🎯</span>
        <span class="chart-title">Institutional Moat & Valuation Radar (5-Axis Synthesis)</span>
      </div>
      <span class="pipeline-badge">Empirical Competitor Benchmark</span>
    </div>
    <div class="radar-chart-wrap">
      <svg viewBox="0 0 480 360" class="radar-svg" xmlns="http://www.w3.org/2000/svg">
        ${rings}
        ${spokes}
        <polygon points="${peerPoints}" fill="rgba(99, 102, 241, 0.12)" stroke="#6366f1" stroke-width="2" stroke-dasharray="4,3" />
        <polygon points="${targetPoints}" fill="rgba(16, 185, 129, 0.22)" stroke="#10b981" stroke-width="2.5" filter="drop-shadow(0 2px 6px rgba(16,185,129,0.25))" />
        ${axisLabels}
      </svg>
      <div class="radar-legend">
        <div class="radar-legend-item">
          <span class="radar-swatch swatch-target"></span>
          <span><strong>${escapeHtml(targetTicker)} (Anchor)</strong></span>
        </div>
        <div class="radar-legend-item">
          <span class="radar-swatch swatch-peer"></span>
          <span>Peer Group Median</span>
        </div>
      </div>
    </div>
  </div>`;
}

function renderOwnerEarningsWaterfall(markdown: string): string {
  // Scope search to Part 3 to prevent cross-chapter matching
  const part3Match = markdown.match(/##\s+Part\s+3:[\s\S]*?(?=##\s+Part\s+4:|$)/i);
  const scope = part3Match ? part3Match[0] : markdown;

  let ocfVal = 0;
  let floatVal = 0;
  let sbcVal = 0;
  let mCapexVal = 0;
  let oeVal = 0;

  // 1. Try extracting directly from GFM reconciliation table rows in Part 3
  const lines = scope.split(/\r?\n/);
  let inReconciliationTable = false;
  for (const line of lines) {
    if (line.includes('|') && /Reconciliation\s*Step|Cash\s*Flow\s*Component/i.test(line)) {
      inReconciliationTable = true;
      continue;
    }
    if (inReconciliationTable) {
      if (!line.trim().startsWith('|')) {
        inReconciliationTable = false;
        break; // Stop parsing as soon as the reconciliation table ends!
      }
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length < 2) continue;
      const label = parts[0].replace(/[\*_`]/g, '');
      const valStr = parts[1].replace(/[\*_`\$]/g, '').trim();
      const parsed = parseFloat(valStr.replace(/,/g, ''));

      if (/GAAP\s*Operating\s*Cash\s*Flow|TTM\s*Operating\s*Cash\s*Flow/i.test(label) && !isNaN(parsed)) {
        ocfVal = Math.abs(parsed);
      } else if (/Working\s*Capital/i.test(label) && !isNaN(parsed)) {
        floatVal = parsed;
      } else if (/(?:Stock-Based\s*Compensation|SBC)/i.test(label) && !isNaN(parsed)) {
        sbcVal = Math.abs(parsed);
      } else if (/Maintenance\s*CapEx/i.test(label) && !isNaN(parsed)) {
        mCapexVal = Math.abs(parsed);
      } else if (/(?:Normalized\s*Owner\s*Earnings|Owner\s*Earnings\s*\(Equity\))/i.test(label) && !isNaN(parsed)) {
        oeVal = Math.abs(parsed);
      }
    }
  }

  // 2. Fallback to regex matching in prose if table parsing didn't find OCF or OE
  if (ocfVal === 0) {
    const ocfMatch = scope.match(/(?:GAAP\s*Operating\s*Cash\s*Flow|TTM\s*Operating\s*Cash\s*Flow)[^\$\d\n\r]{0,40}\$?\s*([\d,]+(?:\.\d+)?)/i);
    if (ocfMatch) ocfVal = parseFloat(ocfMatch[1].replace(/,/g, '')) || 0;
  }
  if (floatVal === 0) {
    const floatMatch = scope.match(/(?:Working\s*Capital\s*Float|Float\s*Expansion|Working\s*Capital\s*Normalization)[^\$\d\n\r]{0,40}\(?\$?\s*([+\-]?[\d,]+(?:\.\d+)?)/i);
    if (floatMatch) floatVal = parseFloat(floatMatch[1].replace(/,/g, '')) || 0;
  }
  if (sbcVal === 0) {
    const sbcMatch = scope.match(/(?:Stock-Based\s*Compensation|SBC)[^\$\d\n\r]{0,40}\(?\$?\s*([\d,]+(?:\.\d+)?)/i);
    if (sbcMatch) sbcVal = parseFloat(sbcMatch[1].replace(/,/g, '')) || 0;
  }
  if (mCapexVal === 0) {
    const mCapexMatch = scope.match(/(?:Maintenance\s*Capital\s*Expenditures|Maintenance\s*CapEx)[^\$\d\n\r]{0,40}\(?\$?\s*([\d,]+(?:\.\d+)?)/i);
    if (mCapexMatch) mCapexVal = parseFloat(mCapexMatch[1].replace(/,/g, '')) || 0;
  }
  if (oeVal === 0) {
    const oeMatch = scope.match(/(?:NORMALIZED\s*OWNER\s*EARNINGS\s*BASELINE|Normalized\s*Owner\s*Earnings)[^\$\d\n\r]{0,40}\$?\s*([\d,]+(?:\.\d+)?)/i);
    if (oeMatch) oeVal = parseFloat(oeMatch[1].replace(/,/g, '')) || 0;
  }

  // Strictly guard against NaN
  if (isNaN(ocfVal) || isNaN(oeVal) || ocfVal === 0 || oeVal === 0) return '';
  if (isNaN(floatVal)) floatVal = 0;
  if (isNaN(sbcVal)) sbcVal = 0;
  if (isNaN(mCapexVal)) mCapexVal = 0;

  const maxVal = Math.max(ocfVal, oeVal, 1);

  const steps = [
    { label: 'TTM GAAP Operating Cash Flow', val: ocfVal, type: 'base', display: `$${ocfVal.toLocaleString()}M` },
    { label: 'Working Capital Float Expansion Adjustment', val: -floatVal, type: 'deduct', display: `${floatVal >= 0 ? '+' : '-'}$${Math.abs(floatVal).toLocaleString()}M` },
    { label: 'Stock-Based Compensation (100% Economic Dilution)', val: -sbcVal, type: 'deduct', display: `-$${sbcVal.toLocaleString()}M` },
    { label: 'Estimated Maintenance CapEx (100% D&A)', val: -mCapexVal, type: 'deduct', display: `-$${mCapexVal.toLocaleString()}M` },
    { label: 'NORMALIZED OWNER EARNINGS BASELINE', val: oeVal, type: 'final', display: `$${oeVal.toLocaleString()}M` }
  ];

  const rowsHtml = steps.map(s => {
    const isBase = s.type === 'base';
    const isFinal = s.type === 'final';
    const barWidth = Math.min(100, Math.max(4, (Math.abs(s.val) / maxVal) * 100));
    const barClass = isFinal ? 'bar-emerald' : (isBase ? 'bar-indigo' : 'bar-rose');
    const badgeClass = isFinal ? 'badge-final' : (isBase ? 'badge-base' : 'badge-deduct');
    const badgeText = isFinal ? 'OWNER CASH' : (isBase ? 'GAAP BASE' : '[-] DEDUCTION');

    return `
    <div class="waterfall-step-row ${isFinal ? 'waterfall-step-final' : ''}">
      <div class="waterfall-step-meta">
        <span class="waterfall-step-name">${escapeHtml(s.label)}</span>
        <span class="waterfall-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="waterfall-track-wrap">
        <div class="waterfall-track">
          <div class="waterfall-bar ${barClass}" style="width: ${barWidth.toFixed(1)}%;"></div>
        </div>
        <span class="waterfall-val ${isFinal ? 'val-emerald' : ''}">${s.display}</span>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="chart-box waterfall-box">
    <div class="chart-header">
      <div class="pipeline-header-left">
        <span class="pipeline-icon">⚖️</span>
        <span class="chart-title">Owner Earnings Reconciliation Waterfall Bridge</span>
      </div>
      <span class="pipeline-badge">Cash Flow Quality & Integrity</span>
    </div>
    <div class="waterfall-steps-list">
      ${rowsHtml}
    </div>
  </div>`;
}

interface ExecutiveCockpitData {
  kpis: { label: string; value: string; isHighlight?: boolean; isEmerald?: boolean }[];
  marketPriceNum: number | null;
  intrinsicValueNum: number | null;
  decision: string | null;
  marginOfSafety: string | null;
  lynchProfile: string | null;
  moatConviction: string | null;
  userPosition?: {
    costBasis: number;
    weight: string;
  };
}

function extractExecutiveCockpit(markdown: string): ExecutiveCockpitData {
  const kpis: { label: string; value: string; isHighlight?: boolean; isEmerald?: boolean }[] = [];

  let marketPriceNum: number | null = null;
  let intrinsicValueNum: number | null = null;
  let decision: string | null = null;
  let marginOfSafety: string | null = null;
  let lynchProfile: string | null = null;
  let moatConviction: string | null = null;

  // 0. User Position Context (Holding Context)
  let userPosition: { costBasis: number; weight: string } | undefined = undefined;
  const fmCbMatch = markdown.match(/^---\r?\n[\s\S]*?^user_cost_basis:\s*([0-9,.]+)/m);
  const fmWeightMatch = markdown.match(/^---\r?\n[\s\S]*?^user_portfolio_weight:\s*["']?([0-9,.]+%?)["']?/m);
  if (fmCbMatch && fmCbMatch[1]) {
    const cbNum = parseFloat(fmCbMatch[1].replace(/,/g, ''));
    let wStr = fmWeightMatch ? fmWeightMatch[1] : '';
    if (wStr && !wStr.endsWith('%')) wStr += '%';
    if (!isNaN(cbNum) && cbNum > 0) {
      userPosition = { costBasis: cbNum, weight: wStr };
      kpis.push({ label: 'Cost Basis', value: `$${cbNum.toFixed(2)}` });
      if (wStr) kpis.push({ label: 'Portfolio Weight', value: wStr });
    }
  }

  if (!userPosition) {
    const costMatch = markdown.match(/(?:Original Cost Basis|User(?:'s)? Current Position Cost Basis|User Cost Basis|Position Cost Basis|\bCost Basis\b|Entry Price|original price:?)[^$\n:]{0,25}[:*=]\s*\$([0-9,]+\.?[0-9]*)/i);
    const weightMatch = markdown.match(/(?:Current Portfolio Weight|User Portfolio Weight|Portfolio Weight|Position Weight|Target Weighting|Target Weight|Current Weight)[^%\n:]{0,25}[:*=]\s*([0-9,.]+%)/i) ||
                        markdown.match(/([0-9,.]+%)\s*(?:portfolio weight|position weight|target weight|target weighting)/i);
    if (costMatch && costMatch[1]) {
      const cbNum = parseFloat(costMatch[1].replace(/,/g, ''));
      const wStr = weightMatch ? weightMatch[1] : '';
      if (!isNaN(cbNum) && cbNum > 0) {
        userPosition = { costBasis: cbNum, weight: wStr };
        kpis.push({ label: 'Cost Basis', value: `$${cbNum.toFixed(2)}` });
        if (wStr) kpis.push({ label: 'Portfolio Weight', value: wStr });
      }
    }
  }

  // 1. Current Price (Frontmatter is primary ground truth)
  let priceStr: string | null = null;
  const fmMatch = markdown.match(/^---\r?\n[\s\S]*?^market_price:\s*([0-9,.]+)/m);
  if (fmMatch && fmMatch[1]) {
    priceStr = fmMatch[1];
  } else {
    // Single-line bounded fallback
    const directMatch = markdown.match(/(?:^|\n)\s*(?:MARKET PRICE|Benchmark Price|Market [Tt]ape Price|Current Tape|Market price)\s*[:|=]\s*\*{0,2}\$([0-9,]+\.?[0-9]*)/i) ||
                        markdown.match(/\|\s*(?:Current Market Price|Market Tape Price|Tape Price|Current Tape|Market Price)\s*\|\s*\*{0,2}\$([0-9,]+\.?[0-9]*)/i) ||
                        markdown.match(/\*{0,2}Market [Pp]rice:?\*{0,2}\s*\$([0-9,]+\.?[0-9]*)/i);
    if (directMatch && directMatch[1]) {
      priceStr = directMatch[1];
    }
  }

  if (priceStr) {
    kpis.push({ label: 'Market Price', value: `$${priceStr}` });
    marketPriceNum = parseFloat(priceStr.replace(/,/g, ''));
  }

  // 2. Synthesized Intrinsic Value (Frontmatter is primary ground truth, then Part 11/Part 12 verdict block, then synthesis tables)
  let ivStr: string | null = null;
  const fmIvMatch = markdown.match(/^---\r?\n[\s\S]*?^intrinsic_value:\s*([0-9,.]+)/m);
  if (fmIvMatch && fmIvMatch[1]) {
    ivStr = fmIvMatch[1];
  } else {
    const part11Idx = markdown.lastIndexOf('## Part 11:');
    const part12Idx = markdown.lastIndexOf('## Part 12:');
    let verdictText = '';
    if (part11Idx !== -1) {
      verdictText = (part12Idx !== -1 && part12Idx > part11Idx)
        ? markdown.slice(part11Idx, part12Idx)
        : markdown.slice(part11Idx);
    } else if (part12Idx !== -1) {
      const part13Idx = markdown.lastIndexOf('## Part 13:');
      verdictText = (part13Idx !== -1 && part13Idx > part12Idx)
        ? markdown.slice(part12Idx, part13Idx)
        : markdown.slice(part12Idx);
    }
    const verdictIvMatch = verdictText ? (
      verdictText.match(/\|\s*\*{0,2}(?:Final\s+|Synthesized\s+|Sovereign\s+|Probability-Weighted\s+|Expected\s+)*Intrinsic\s+Value[^\n|]*\*{0,2}\s*\|\s*[:\s]*\*{0,2}\$([0-9,]+\.?[0-9]*)(?![0-9.,]*[MB]\b)/i) ||
      verdictText.match(/(?:\|\s*)?(?:\*{0,2})?(?:Mandate\s+|Final\s+|Synthesized\s+|Sovereign\s+|Probability-Weighted\s+|Expected\s+)*Intrinsic\s+Value[^\n$|]*?[:=|]\s*\*{0,2}\$([0-9,]+\.?[0-9]*)(?![0-9.,]*[MB]\b)/i)
    ) : null;
    if (verdictIvMatch) {
      ivStr = verdictIvMatch[1];
    } else {
      const tableMatch = markdown.match(/\|\s*\*{0,2}(?:Final |Synthesized )?Intrinsic Value[^\n|]*\*{0,2}\s*\|\s*[:\s]*\*{0,2}\$([0-9,]+\.?[0-9]*)(?![0-9.,]*[MB]\b)/i);
      if (tableMatch) {
        ivStr = tableMatch[1];
      } else {
        const bulletMatch = markdown.match(/\*\s*\*{0,2}(?:Final |Synthesized )?Intrinsic Value[^\n]*?[:=]\s*\*{0,2}\$([0-9,]+\.?[0-9]*)(?![0-9.,]*[MB]\b)/i);
        if (bulletMatch) {
          ivStr = bulletMatch[1];
        } else {
          const proseIvMatch = markdown.match(/(?:Primary Synthesized Intrinsic Value|Final Synthesized Intrinsic Value|Synthesized Intrinsic Value)[^\n]*?(?:=\s*)?\$([0-9,]+\.?[0-9]*)(?![0-9.,]*[MB]\b)(?:\s*per share|\*{0,2})/i);
          if (proseIvMatch) {
            ivStr = proseIvMatch[1];
          } else {
            const fallback = markdown.match(/(?:Synthesized Final Intrinsic Value Per Share|Synthesized Final Intrinsic Value|Synthesized Intrinsic Value)[^$]*?\$([0-9,]+\.?[0-9]*)(?![0-9.,]*[MB]\b)/i) ||
                             markdown.match(/(?:Final Synthesized Intrinsic Value:?\s*\$([0-9,]+\.?[0-9]*))/i) ||
                             markdown.match(/(?:Intrinsic Value Per Share).*?\$([0-9,]+\.?[0-9]*)(?![0-9.,]*[MB]\b)/i);
            if (fallback) ivStr = fallback[1];
          }
        }
      }
    }
  }

  if (ivStr) {
    kpis.push({ label: 'Intrinsic Value', value: `$${ivStr}`, isHighlight: true });
    intrinsicValueNum = parseFloat(ivStr.replace(/,/g, ''));
  }

  // 3. Margin of Safety (Frontmatter is primary ground truth, then Part 11/Part 12 verdict block, then standard synthesis)
  const fmMosMatch = markdown.match(/^---\r?\n[\s\S]*?^margin_of_safety:\s*["']?([+-]?[0-9,.]+%?)["']?/m);
  if (fmMosMatch && fmMosMatch[1]) {
    let val = fmMosMatch[1];
    if (!val.endsWith('%')) val += '%';
    if (marketPriceNum !== null && intrinsicValueNum !== null && marketPriceNum > intrinsicValueNum && !val.startsWith('-')) {
      val = `-${val.replace(/^[+-]/, '')}`;
    }
    const isNegative = val.startsWith('-') || val.toLowerCase().includes('negative');
    const isEmerald = !isNegative && parseFloat(val.replace(/[^0-9.-]/g, '')) > 0;
    const displayVal = isNegative ? `${val} (Deficit)` : val;
    marginOfSafety = displayVal;
    kpis.push({ label: 'Margin of Safety', value: displayVal, isEmerald });
  } else {
    const part11Idx = markdown.lastIndexOf('## Part 11:');
    const part12Idx = markdown.lastIndexOf('## Part 12:');
    let verdictText = '';
    if (part11Idx !== -1) {
      verdictText = (part12Idx !== -1 && part12Idx > part11Idx)
        ? markdown.slice(part11Idx, part12Idx)
        : markdown.slice(part11Idx);
    } else if (part12Idx !== -1) {
      const part13Idx = markdown.lastIndexOf('## Part 13:');
      verdictText = (part13Idx !== -1 && part13Idx > part12Idx)
        ? markdown.slice(part12Idx, part13Idx)
        : markdown.slice(part12Idx);
    }
    const verdictMosMatch = verdictText ? (
      verdictText.match(/\|\s*\*{0,2}(?:Current\s+|Standard\s+|Calculated\s+)?Margin\s+of\s+Safety[^\n|]*\*{0,2}\s*\|\s*[:\s]*\*{0,2}([+-]?[0-9,.]+\%)/i) ||
      verdictText.match(/(?:\|\s*)?(?:\*{0,2})?(?:Current\s+|Standard\s+|Calculated\s+)?Margin\s+of\s+Safety(?:\s*\(Standard\))?[^\n|%]{0,45}?(?:[:|=]\s*|\s*\|\s*)([+-]?[0-9,.]+\%)/i) ||
      verdictText.match(/(?:Current Margin of Safety|Standard Margin of Safety|Margin of Safety)[^%\n]{1,45}?([+-]?[0-9,.]+\%)/i)
    ) : null;
    const mosMatch = verdictMosMatch ||
                     markdown.match(/(?:Current Standard Margin of Safety at Market|Margin of Safety at Market|Standard Margin of Safety)[^%\n]{1,45}?([+-]?[0-9,.]+\%)/i) ||
                     markdown.match(/Standard Margin of Safety\s*=?[^%\n]{1,30}?([+-]?[0-9,.]+\%)/i);
    if (mosMatch) {
      let val = mosMatch[1];
      const matchIdx = mosMatch.index || 0;
      const surrounding = markdown.slice(Math.max(0, matchIdx - 25), matchIdx + 65);
      if ((surrounding.toLowerCase().includes('negative') || surrounding.toLowerCase().includes('deficit')) && !val.startsWith('-')) {
        val = `-${val.replace(/^[+-]/, '')}`;
      }
      if (marketPriceNum !== null && intrinsicValueNum !== null && marketPriceNum > intrinsicValueNum && !val.startsWith('-')) {
        val = `-${val.replace(/^[+-]/, '')}`;
      }
      const isNegative = val.startsWith('-') || val.toLowerCase().includes('negative');
      const isEmerald = !isNegative && parseFloat(val.replace(/[^0-9.-]/g, '')) > 0;
      const displayVal = isNegative ? `${val} (Deficit)` : val;
      marginOfSafety = displayVal;
      kpis.push({ label: 'Margin of Safety', value: displayVal, isEmerald });
    } else if (marketPriceNum !== null && intrinsicValueNum !== null && intrinsicValueNum > 0) {
      const calcMos = ((intrinsicValueNum - marketPriceNum) / intrinsicValueNum) * 100;
      const isNegative = calcMos < 0;
      const displayVal = `${calcMos.toFixed(2)}%${isNegative ? ' (Deficit)' : ''}`;
      marginOfSafety = displayVal;
      kpis.push({ label: 'Margin of Safety', value: displayVal, isEmerald: !isNegative && calcMos > 0 });
    }
  }

  // 4. Lynch Archetype (check YAML frontmatter, Part 9 GFM table row, then prose)
  const fmLynchMatch = markdown.match(/^---\r?\n[\s\S]*?^lynch_profile:\s*["']?([^"'\r\n]+)["']?/m);
  const lynchTableMatch = markdown.match(/\|\s*\*{0,2}(Cyclical Compounder|Pure Commodity Cyclical|Wide-Moat Stalwart|Slow Grower|Stalwart|Fast Grower|Cyclical|Asset Play|Turnaround)\*{0,2}\s*\|\s*\*{0,2}ACTIVE ARCHETYPE\*{0,2}/i);
  const lynchProseMatch = markdown.match(/(?:Classification|Archetype Assignment|Lynch Archetype Classification|Lynch Archetype|Lynch Category)[^a-zA-Z\n]{1,30}\b(Cyclical Compounder|Pure Commodity Cyclical|Wide-Moat Stalwart|Slow Grower|Stalwart|Fast Grower|Cyclical|Asset Play|Turnaround)\b(?![,\/])/i);
  const resolvedLynch = (fmLynchMatch && fmLynchMatch[1]?.trim()) || (lynchTableMatch && lynchTableMatch[1]?.trim()) || (lynchProseMatch && lynchProseMatch[1]?.trim());
  if (resolvedLynch) {
    lynchProfile = resolvedLynch;
    kpis.push({ label: 'Peter Lynch Profile', value: resolvedLynch });
  }

  // 5. Conviction Level
  const convMatch = markdown.match(/Conviction Level.*?(High|Medium|Low|Wide)/i);
  if (convMatch) {
    moatConviction = convMatch[1];
    kpis.push({ label: 'Moat Conviction', value: convMatch[1], isEmerald: convMatch[1].toLowerCase() === 'high' });
  }

  // 6. Investment Decision (check Part 11/Part 12 definitive verdict first to avoid catching intermediate turns or existing frontmatter)
  const part11Idx = markdown.lastIndexOf('## Part 11:');
  const part12Idx = markdown.lastIndexOf('## Part 12:');
  let verdictText = '';
  if (part11Idx !== -1) {
    verdictText = (part12Idx !== -1 && part12Idx > part11Idx)
      ? markdown.slice(part11Idx, part12Idx)
      : markdown.slice(part11Idx);
  } else if (part12Idx !== -1) {
    const part13Idx = markdown.lastIndexOf('## Part 13:');
    verdictText = (part13Idx !== -1 && part13Idx > part12Idx)
      ? markdown.slice(part12Idx, part13Idx)
      : markdown.slice(part12Idx);
  }
  const bodyText = markdown.replace(/^---[\s\S]*?---\r?\n/, '');
  const searchSection = verdictText || bodyText;
  const cleanDecSearchText = searchSection.replace(/\|\s*\*{0,2}Final Portfolio Action Directive\*{0,2}\s*\|\s*\*{0,2}INVEST\s*\/\s*PASS[^\n]*\n/gi, '');
  const decMatch = cleanDecSearchText.match(/(?:Final Portfolio Action Directive|Portfolio Action Directive|Action Directive|Audited Portfolio Verdict|Authoritative Portfolio Verdict|Portfolio Verdict|Action on Existing (?:Holding|Shares)|Mandate Decision|Definitive Action|Definitive Verdict|EXISTING POSITION VERDICT|PORTFOLIO ALLOCATION ACTION|Allocation Action|FINAL CAPITAL ALLOCATION DECISION|Definitive Decision|Final Definitive Decision|FINAL DECISION|Investment Decision|Ultimate Verdict|Decision Classification|Final Recommendation Check|FINAL DEFINITIVE VERDICT|RECOMMENDATION|Decision)[^a-zA-Z\n]{1,50}\b(INVEST|PASS|HOLD|ACCUMULATE|MAINTAIN|TRIM|LIQUIDATE|EXIT)\b/i) ||
                   bodyText.replace(/\|\s*\*{0,2}Final Portfolio Action Directive\*{0,2}\s*\|\s*\*{0,2}INVEST\s*\/\s*PASS[^\n]*\n/gi, '').match(/(?:Final Portfolio Action Directive|Portfolio Action Directive|Action Directive|Audited Portfolio Verdict|Authoritative Portfolio Verdict|Portfolio Verdict|Action on Existing (?:Holding|Shares)|Mandate Decision|Definitive Action|Definitive Verdict|EXISTING POSITION VERDICT|PORTFOLIO ALLOCATION ACTION|Allocation Action|FINAL CAPITAL ALLOCATION DECISION|Definitive Decision|Final Definitive Decision|FINAL DECISION|Investment Decision|Ultimate Verdict|Decision Classification|Final Recommendation Check|FINAL DEFINITIVE VERDICT|RECOMMENDATION|Definitive Verdict|VERDICT|Decision)[^a-zA-Z\n]{1,50}\b(INVEST|PASS|HOLD|ACCUMULATE|MAINTAIN|TRIM|LIQUIDATE|EXIT)\b/i);
  if (decMatch) {
    decision = decMatch[1].toUpperCase();
    if (decision === 'MAINTAIN') decision = 'HOLD';
    if (decision === 'TRIM') decision = 'HOLD'; // Never-Trim Compounding Doctrine
    if (decision === 'ACCUMULATE') decision = userPosition ? 'ACCUMULATE' : 'INVEST';
    if (decision === 'EXIT') decision = 'LIQUIDATE';
  } else {
    const fmDecMatch = markdown.match(/^---\r?\n[\s\S]*?^decision:\s*([A-Za-z]+)/m);
    if (fmDecMatch && fmDecMatch[1]) {
      decision = fmDecMatch[1].toUpperCase();
      if (decision === 'MAINTAIN') decision = 'HOLD';
      if (decision === 'TRIM') decision = 'HOLD'; // Never-Trim Compounding Doctrine
      if (decision === 'ACCUMULATE') decision = userPosition ? 'ACCUMULATE' : 'INVEST';
      if (decision === 'EXIT') decision = 'LIQUIDATE';
    }
  }

  if (decision) {
    kpis.push({
      label: 'Investment Decision',
      value: decision,
      isEmerald: decision === 'INVEST' || decision === 'ACCUMULATE'
    });
  }

  return {
    kpis,
    marketPriceNum,
    intrinsicValueNum,
    decision,
    marginOfSafety,
    lynchProfile,
    moatConviction,
    userPosition
  };
}

function extractExecutiveKpis(markdown: string): { label: string; value: string; isHighlight?: boolean; isEmerald?: boolean }[] {
  return extractExecutiveCockpit(markdown).kpis;
}

// --- STANDALONE VECTOR SVG & HTML CHART GENERATORS ---

function renderSvgTrendChart(headers: string[], rows: string[][]): string {
  const headerStr = headers.join(' ').toLowerCase();
  if (
    headerStr.includes('rorc') ||
    headerStr.includes('retained capital') ||
    headerStr.includes('hurdle rate') ||
    headerStr.includes('cagr') ||
    headerStr.includes('growth rate') ||
    headerStr.includes('longitudinal metric') ||
    headerStr.includes('base ($m)')
  ) {
    return '';
  }

  const isPureTimeCol = (colHeader: string) => {
    const s = colHeader.toLowerCase().trim();
    if (/cagr|rorc|variance|hurdle|weight|base|multiple|ratio|margin|delta|verdict|finding/i.test(s)) return false;
    return /\b(19\d{2}|20\d{2})\b/.test(s) || s.includes('ttm') || s.includes('ltm') || /q[1-4]/.test(s) || /fy\d{2}/.test(s) || /^period\s*\d+/i.test(s);
  };

  const validColIndices: number[] = [];
  headers.slice(1).forEach((h, idx) => {
    if (isPureTimeCol(h)) {
      validColIndices.push(idx + 1);
    }
  });

  const totalDataCols = headers.length - 1;
  if (validColIndices.length < 3 || (totalDataCols > 0 && validColIndices.length / totalDataCols < 0.8)) {
    return '';
  }

  const rawTimeHeaders = validColIndices.map(idx => headers[idx].replace(/[\*\_\s]/g, '').trim());

  let ocfRow: string[] = [];
  let oeRow: string[] = [];

  const nonPctRows = rows.filter(r => {
    const raw = (r[0] || '').toLowerCase().replace(/[\*\_\#`]/g, '').trim();
    return !(raw.includes('%') || raw.includes('margin') || raw.includes('growth') || raw.includes('yield') || raw.includes('ratio'));
  });

  rows.forEach(r => {
    const rawName = (r[0] || '').toLowerCase().replace(/[\*\_\#`]/g, '').trim();
    if (rawName.includes('%') || rawName.includes('margin') || rawName.includes('growth') || rawName.includes('yield') || rawName.includes('ratio')) return;

    if (rawName.includes('operating cash flow') || /^gaap\s+operating\s+cash/i.test(rawName) || /^\s*ocf\b/i.test(rawName)) {
      if (ocfRow.length === 0) ocfRow = r;
    } else if (rawName.includes('owner earnings') || rawName.includes('free cash flow')) {
      if (rawName.includes('normalized owner earnings') || oeRow.length === 0) {
        oeRow = r;
      }
    }
  });

  if (ocfRow.length === 0) ocfRow = nonPctRows[0] || [];
  if (oeRow.length === 0) oeRow = nonPctRows[nonPctRows.length - 1] || [];
  if (ocfRow.length === 0 && oeRow.length === 0) return '';

  const isAscending = isAscendingChronological(rawTimeHeaders);
  const labels = isAscending ? rawTimeHeaders : [...rawTimeHeaders].reverse();
  const rawOcf = validColIndices.map(colIdx => parseNumeric(ocfRow[colIdx] || '0'));
  const rawOe = validColIndices.map(colIdx => parseNumeric(oeRow[colIdx] || '0'));

  const ocfVals = isAscending ? rawOcf : [...rawOcf].reverse();
  const oeVals = isAscending ? rawOe : [...rawOe].reverse();

  const max = Math.max(...ocfVals, ...oeVals, 100);
  const min = Math.min(0, ...ocfVals, ...oeVals);
  const range = max - min || 1;

  const w = 720;
  const h = 200;
  const padLeft = 60;
  const padRight = 40;
  const padTop = 30;
  const padBottom = 35;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;
  const denom = (labels.length - 1) > 0 ? (labels.length - 1) : 1;

  const pointsOCF = ocfVals.map((v, i) => `${padLeft + (i * chartW / denom)},${h - padBottom - ((v - min) / range * chartH)}`).join(' ');
  const pointsOE = oeVals.map((v, i) => `${padLeft + (i * chartW / denom)},${h - padBottom - ((v - min) / range * chartH)}`).join(' ');

  const ocfCircles = ocfVals.map((v, i) => {
    const cx = padLeft + (i * chartW / denom);
    const cy = h - padBottom - ((v - min) / range * chartH);
    return `<circle cx="${cx}" cy="${cy}" r="4" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
            <text x="${cx}" y="${cy - 8}" fill="#0284c7" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">$${Math.round(v)}M</text>`;
  }).join('');

  const oeCircles = oeVals.map((v, i) => {
    const cx = padLeft + (i * chartW / denom);
    const cy = h - padBottom - ((v - min) / range * chartH);
    return `<circle cx="${cx}" cy="${cy}" r="4" fill="#059669" stroke="#ffffff" stroke-width="2" />
            <text x="${cx}" y="${cy + 16}" fill="#059669" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">$${Math.round(v)}M</text>`;
  }).join('');

  const labelTexts = labels.map((lbl, i) => {
    const x = padLeft + (i * chartW / denom);
    return `<text x="${x}" y="${h - 10}" fill="#64748b" font-size="10" font-family="monospace" text-anchor="middle">${escapeHtml(lbl)}</text>`;
  }).join('');

  return `
  <div class="chart-box">
    <div class="chart-header">
      <span class="chart-title">Cash Flow & Owner Earnings Trajectory</span>
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-dot" style="background:#0284c7;"></span> Operating Cash Flow</span>
        <span class="legend-item"><span class="legend-dot" style="background:#059669;"></span> Owner Earnings</span>
      </div>
    </div>
    <div class="svg-container">
      <svg viewBox="0 0 ${w} ${h}" class="dossier-svg" style="width: 100%; height: auto; max-height: 220px;">
        <line x1="${padLeft}" y1="${h - padBottom}" x2="${w - padRight}" y2="${h - padBottom}" stroke="#cbd5e1" stroke-width="1.5" />
        <line x1="${padLeft}" y1="${padTop}" x2="${w - padRight}" y2="${padTop}" stroke="#e2e8f0" stroke-dasharray="4 4" />
        <polyline points="${pointsOCF}" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <polyline points="${pointsOE}" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${ocfCircles}
        ${oeCircles}
        ${labelTexts}
      </svg>
    </div>
  </div>`;
}

function renderLeaderboardHtml(headers: string[], rows: string[][]): string {
  const cards = rows.map((r) => {
    const dim = (r[0] || '').replace(/[\*\_\#`]/g, '').trim();
    const targetVal = (r[1] || '').replace(/[\*\_\#`]/g, '').trim();
    const standing = (r[2] || '').replace(/[\*\_\#`]/g, '').trim();
    const medianVal = (r[3] || '').replace(/[\*\_\#`]/g, '').trim();
    const leader = (r[4] || '').replace(/[\*\_\#`]/g, '').trim();
    const verdict = (r[5] || '').replace(/[\*\_\#`]/g, '').trim();

    const isLeader = standing.includes('#1') || verdict.includes('Leader');
    const badgeClass = isLeader ? 'badge-leader' : 'badge-top';

    return `
    <div class="benchmark-card">
      <div class="benchmark-top">
        <span class="benchmark-dim">${escapeHtml(dim)}</span>
        <span class="benchmark-badge ${badgeClass}">${escapeHtml(standing)}</span>
      </div>
      <div class="benchmark-stats">
        <div class="benchmark-stat">
          <span class="stat-label">Target Anchor</span>
          <span class="stat-val stat-target">${escapeHtml(targetVal)}</span>
        </div>
        <div class="benchmark-stat">
          <span class="stat-label">Peer Median</span>
          <span class="stat-val stat-median">${escapeHtml(medianVal)}</span>
        </div>
      </div>
      <div class="benchmark-bottom">
        ${leader ? `<div><span class="sub-label">Category Leader:</span> <span class="sub-val">${escapeHtml(leader)}</span></div>` : ''}
        ${verdict ? `<div><span class="sub-label">Moat Verdict:</span> <span class="sub-val">${escapeHtml(verdict)}</span></div>` : ''}
      </div>
    </div>`;
  }).join('');

  return `
  <div class="chart-box">
    <div class="chart-header">
      <span class="chart-title">Moat & Peer Leaderboard Benchmark</span>
    </div>
    <div class="benchmark-grid">
      ${cards}
    </div>
  </div>`;
}

function renderDebtMaturitiesHtml(headers: string[], rows: string[][]): string {
  const items = rows.map(r => ({
    name: (r[0] || '').replace(/[\*\_\#]/g, '').trim(),
    amount: parseNumeric(r[1] || ''),
    date: (r[2] || 'TBD').trim(),
    rate: (r[3] || '0%').trim()
  })).filter(d => d.amount > 0);

  const maxVal = Math.max(...items.map(d => d.amount), 100);

  const bars = items.map(d => `
    <div class="debt-item">
      <div class="debt-labels">
        <span class="debt-name">${escapeHtml(d.name)} (${escapeHtml(d.date)})</span>
        <span class="debt-rate">Yield: <strong>${escapeHtml(d.rate)}</strong></span>
      </div>
      <div class="debt-track-wrap">
        <div class="debt-track">
          <div class="debt-bar" style="width: ${(d.amount / maxVal) * 100}%;"></div>
        </div>
        <span class="debt-amount">$${d.amount}M</span>
      </div>
    </div>
  `).join('');

  return `
  <div class="chart-box">
    <div class="chart-header">
      <span class="chart-title">Debt Repayment Schedule & Maturity Profile</span>
    </div>
    <div class="debt-list">
      ${bars}
    </div>
  </div>`;
}

function renderStyle1ValuationSvg(parsed: Array<{ name: string; value: number; role: string }>, priceVal: number): string {
  const epvItem = parsed.find(p => p.role === 'epv' || /epv|earnings power/i.test(p.name));
  const bearItem = parsed.find(p => /bear|conservative/i.test(p.name));
  const ivItem = parsed.find(p => p.role === 'iv' || /expected|synthesized|sovereign|base/i.test(p.name));
  const bullItem = parsed.find(p => /bull|optimistic/i.test(p.name));

  const allVals = [
    epvItem?.value,
    bearItem?.value,
    ivItem?.value,
    bullItem?.value,
    priceVal > 0 ? priceVal : undefined
  ].filter((v): v is number => typeof v === 'number' && v > 0);

  if (allVals.length < 2) return '';

  const minVal = Math.min(...allVals) * 0.85;
  const maxVal = Math.max(...allVals) * 1.15;
  const valSpan = maxVal - minVal || 1;
  const getX = (val: number) => Math.min(800, Math.max(70, 70 + Math.round(((val - minVal) / valSpan) * 720)));

  const cxTape = priceVal > 0 ? getX(priceVal) : 0;
  const cxEpv = epvItem ? getX(epvItem.value) : 0;
  const cxBear = bearItem ? getX(bearItem.value) : 0;
  const cxIv = ivItem ? getX(ivItem.value) : 0;
  const cxBull = bullItem ? getX(bullItem.value) : 0;

  const rectX = Math.min(720, Math.max(10, cxTape - 65));

  const tapeTopLane = priceVal > 0 ? `
    <g class="tape-pointer">
      <rect x="${rectX}" y="6" width="130" height="26" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" />
      <circle cx="${rectX + 13}" cy="19" r="4" fill="#f59e0b" />
      <text x="${rectX + 24}" y="23" fill="#f59e0b" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">TAPE $${priceVal.toFixed(2)}</text>
      <line x1="${cxTape}" y1="32" x2="${cxTape}" y2="52" stroke="#f59e0b" stroke-width="2" />
      <polygon points="${cxTape - 4},50 ${cxTape + 4},50 ${cxTape},56" fill="#f59e0b" />
    </g>` : '';

  const fairValueZone = (cxBear > 0 && cxBull > 0) ? `
    <line x1="${cxBear}" y1="56" x2="${cxBull}" y2="56" stroke="#0369a1" stroke-width="8" stroke-linecap="round" opacity="0.35" />` : (cxEpv > 0 && cxIv > 0) ? `
    <line x1="${cxEpv}" y1="56" x2="${cxIv}" y2="56" stroke="#0369a1" stroke-width="8" stroke-linecap="round" opacity="0.35" />` : '';

  const epvMarker = epvItem ? `
    <circle cx="${cxEpv}" cy="56" r="6" fill="#64748b" />
    <line x1="${cxEpv}" y1="56" x2="${cxEpv}" y2="72" stroke="#64748b" stroke-width="1.5" />
    <text x="${cxEpv}" y="86" fill="#94a3b8" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">EPV Floor $${epvItem.value.toFixed(2)}</text>
    <text x="${cxEpv}" y="99" fill="#475569" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">Perpetual Cash Anchor</text>` : '';

  const bearMarker = bearItem ? `
    <circle cx="${cxBear}" cy="56" r="6" fill="#f43f5e" />
    <line x1="${cxBear}" y1="56" x2="${cxBear}" y2="72" stroke="#f43f5e" stroke-width="1.5" />
    <text x="${cxBear}" y="86" fill="#f43f5e" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">Bear $${bearItem.value.toFixed(2)}</text>
    <text x="${cxBear}" y="99" fill="#64748b" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">Cycle Digestion (25%)</text>` : '';

  const ivMarker = ivItem ? `
    <circle cx="${cxIv}" cy="56" r="7" fill="#38bdf8" />
    <line x1="${cxIv}" y1="56" x2="${cxIv}" y2="72" stroke="#38bdf8" stroke-width="1.5" />
    <text x="${cxIv}" y="86" fill="#38bdf8" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Expected DCF $${ivItem.value.toFixed(2)}</text>
    <text x="${cxIv}" y="99" fill="#0284c7" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">Probability-Weighted</text>` : '';

  const bullMarker = bullItem ? `
    <circle cx="${cxBull}" cy="56" r="6" fill="#10b981" />
    <line x1="${cxBull}" y1="56" x2="${cxBull}" y2="72" stroke="#10b981" stroke-width="1.5" />
    <text x="${cxBull}" y="86" fill="#10b981" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">Bull $${bullItem.value.toFixed(2)}</text>
    <text x="${cxBull}" y="99" fill="#059669" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">Expansion (25%)</text>` : '';

  return `
  <div class="spectrum-svg-wrap" style="width: 100%; overflow-x: auto; margin-bottom: 1.25rem;">
    <svg viewBox="0 0 860 110" class="spectrum-svg" style="width: 100%; min-width: 650px; height: auto;">
      ${tapeTopLane}
      <line x1="40" y1="56" x2="820" y2="56" stroke="#1e293b" stroke-width="8" stroke-linecap="round" />
      ${fairValueZone}
      ${epvMarker}
      ${bearMarker}
      ${ivMarker}
      ${bullMarker}
    </svg>
  </div>`;
}

function renderValuationSpectrumHtml(headers: string[], rows: string[][], marketPrice?: number | null): string {
  let valColIdx = -1;
  headers.forEach((h, idx) => {
    const hl = h.toLowerCase();
    if ((hl.includes('per') && hl.includes('share')) || hl.includes('value ($)') || hl.includes('per share value') || hl.includes('intrinsic value per')) {
      if (valColIdx === -1) valColIdx = idx;
    }
  });

  const parsed: Array<{ name: string; value: number; role: 'av' | 'epv' | 'dcf' | 'iv' | 'price' | 'other' }> = [];
  rows.forEach(r => {
    const rawName = (r[0] || '').replace(/[\*\_\#`]/g, '').trim();
    if (!rawName || rawName.toLowerCase().includes('total') || rawName.toLowerCase().includes('weighting') || rawName.toLowerCase().includes('basis')) return;

    let valStr = '';
    if (valColIdx !== -1 && r[valColIdx]) {
      valStr = r[valColIdx];
    } else {
      for (let i = 1; i < r.length; i++) {
        const m = (r[i] || '').match(/\$([0-9,]+\.?[0-9]*)/);
        if (m) {
          valStr = m[1];
          break;
        }
      }
    }

    const valNum = parseFloat(valStr.replace(/[\$\*,\s]/g, ''));
    if (!isNaN(valNum) && valNum > 0) {
      const nl = rawName.toLowerCase();
      let role: 'av' | 'epv' | 'dcf' | 'iv' | 'price' | 'other' = 'other';
      if (nl.includes('market price') || nl.includes('current stock price')) role = 'price';
      else if (nl.includes('asset') || nl.includes('nav') || nl.includes('reproduction')) role = 'av';
      else if (nl.includes('earnings power') || nl.includes('epv')) role = 'epv';
      else if (nl.includes('dcf') || nl.includes('growth') || nl.includes('reverse dcf')) role = 'dcf';
      else if (nl.includes('synthesized') || nl.includes('intrinsic value')) role = 'iv';

      parsed.push({ name: rawName, value: valNum, role });
    }
  });

  if (parsed.length < 2) return '';

  const priceVal = marketPrice || parsed.find(p => p.role === 'price')?.value || 0;
  const maxVal = Math.max(...parsed.map(p => p.value), (priceVal || 0) * 1.15, 100);

  const style1Svg = renderStyle1ValuationSvg(parsed, priceVal);

  const barsHtml = parsed.map(p => {
    let barColor = '#059669';
    let roleBadge = 'DCF Valuation';
    let badgeClass = 'badge-dcf';

    if (p.role === 'av') {
      barColor = '#64748b';
      roleBadge = 'Asset Floor';
      badgeClass = 'badge-av';
    } else if (p.role === 'epv') {
      barColor = '#0284c7';
      roleBadge = 'EPV No-Growth Floor';
      badgeClass = 'badge-epv';
    } else if (p.role === 'iv') {
      barColor = '#7c3aed';
      roleBadge = 'Synthesized Target';
      badgeClass = 'badge-iv';
    }

    const pctWidth = Math.min(100, Math.max(4, (p.value / maxVal) * 100));

    return `
      <div class="spectrum-row">
        <div class="spectrum-labels">
          <div class="spectrum-name-wrap">
            <span class="spectrum-name">${escapeHtml(p.name)}</span>
            <span class="spectrum-badge ${badgeClass}">${roleBadge}</span>
          </div>
          <span class="spectrum-val" style="color: ${barColor};">$${p.value.toFixed(2)}</span>
        </div>
        <div class="spectrum-track-wrap">
          <div class="spectrum-track">
            <div class="spectrum-bar" style="width: ${pctWidth}%; background-color: ${barColor};"></div>
            ${priceVal > 0 ? `
              <div class="spectrum-price-marker" style="left: ${Math.min(99, Math.max(1, (priceVal / maxVal) * 100))}%;" title="Current Market Price: $${priceVal.toFixed(2)}"></div>
            ` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  return `
  <div class="chart-box valuation-spectrum-box">
    <div class="chart-header">
      <div class="pipeline-header-left">
        <span class="pipeline-icon">⚖️</span>
        <span class="chart-title">Forensic Valuation Triad Spectrum</span>
      </div>
      <span class="pipeline-badge">Floor-to-Ceiling Valuation Architecture</span>
    </div>
    <div class="spectrum-container">
      ${style1Svg}
      ${barsHtml}
    </div>
    ${priceVal > 0 ? `
      <div class="spectrum-footer">
        <div class="spectrum-legend">
          <span class="spectrum-legend-item"><span class="spectrum-dot" style="background:#64748b;"></span> Asset Floor</span>
          <span class="spectrum-legend-item"><span class="spectrum-dot" style="background:#0284c7;"></span> EPV No-Growth Floor</span>
          <span class="spectrum-legend-item"><span class="spectrum-dot" style="background:#059669;"></span> DCF Ceiling</span>
          <span class="spectrum-legend-item"><span class="spectrum-needle-sample"></span> Current Price: <strong>$${priceVal.toFixed(2)}</strong></span>
        </div>
      </div>
    ` : ''}
  </div>`;
}

function renderSegmentBarHtml(headers: string[], rows: string[][]): string {
  // Prioritize explicit revenue share / percentage of total columns over YoY growth rate columns
  let pctColIdx = -1;
  for (let i = 1; i < headers.length; i++) {
    const hl = headers[i].toLowerCase();
    const isExcluded = hl.includes('growth') || hl.includes('yoy') || hl.includes('cagr') || hl.includes('change') || hl.includes('margin') || hl.includes('take rate') || hl.includes('rate');
    if (!isExcluded && (hl.includes('%') || hl.includes('share') || hl.includes('mix')) && (hl.includes('total') || hl.includes('rev') || hl.includes('sales') || hl.includes('share') || hl.includes('mix') || hl.includes('contribution'))) {
      pctColIdx = i;
      break;
    }
  }

  // Fallback: any column with % or share that does NOT represent growth velocity or margins
  if (pctColIdx === -1) {
    for (let i = 1; i < headers.length; i++) {
      const hl = headers[i].toLowerCase();
      const isExcluded = hl.includes('growth') || hl.includes('yoy') || hl.includes('cagr') || hl.includes('change') || hl.includes('margin');
      if (!isExcluded && (hl.includes('%') || hl.includes('share') || hl.includes('mix'))) {
        pctColIdx = i;
        break;
      }
    }
  }

  if (pctColIdx === -1) return '';

  const headerStr = headers.join(' ').toLowerCase();
  const isGeographic = headerStr.includes('geographic') || headerStr.includes('territory') || headerStr.includes('region') || headerStr.includes('country') || headerStr.includes('geography');
  const title = isGeographic ? "Revenue Mix: Geographic Distribution" : "Revenue Mix: Operating Business Segments";

  const segments: Array<{ name: string; share: number }> = [];
  rows.forEach(r => {
    const rawName = (r[0] || '').replace(/[\*\_\#`]/g, '').trim();
    if (!rawName || rawName.toLowerCase().includes('total') || rawName.startsWith('—') || rawName.startsWith('–') || rawName.startsWith('-')) return;

    const rawValStr = r[pctColIdx] || '';
    const cellVal = rawValStr.includes('->') || rawValStr.includes('→') ? rawValStr.split(/->|→/).pop()! : rawValStr;
    const pctVal = parseFloat(cellVal.replace(/[\*\_\#`]/g, '').replace(/[^0-9.-]/g, ''));
    if (!isNaN(pctVal) && pctVal > 0) {
      segments.push({ name: rawName, share: pctVal });
    }
  });

  if (segments.length === 0) return '';

  // Defensive partition against legacy un-split tables:
  let accumulatedShare = 0;
  const filteredSegments: Array<{ name: string; share: number }> = [];
  for (const s of segments) {
    if (accumulatedShare >= 95 && (accumulatedShare + s.share) > 110) {
      break;
    }
    filteredSegments.push(s);
    accumulatedShare += s.share;
  }

  if (filteredSegments.length < 2) return '';

  const total = filteredSegments.reduce((sum, s) => sum + s.share, 0);
  const colors = ['#059669', '#0284c7', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#4f46e5', '#ea580c'];

  const segmentsHtml = filteredSegments.map((s, idx) => {
    const normalizedWidth = total > 0 ? (s.share / total) * 100 : s.share;
    const color = colors[idx % colors.length];
    return `<div class="seg-bar-segment" style="width: ${normalizedWidth.toFixed(1)}%; background-color: ${color};" title="${escapeHtml(s.name)}: ${s.share.toFixed(1)}%"></div>`;
  }).join('');

  const legendHtml = filteredSegments.map((s, idx) => {
    const color = colors[idx % colors.length];
    return `
      <div class="seg-pill">
        <span class="seg-dot" style="background-color: ${color};"></span>
        <span class="seg-name">${escapeHtml(s.name)}</span>
        <span class="seg-val">${s.share.toFixed(1)}%</span>
      </div>`;
  }).join('');

  return `
  <div class="chart-box">
    <div class="chart-header">
      <span class="chart-title">${title}</span>
    </div>
    <div class="seg-bar-track">
      ${segmentsHtml}
    </div>
    <div class="seg-legend">
      ${legendHtml}
    </div>
  </div>`;
}



/**
 * Parses markdown into an elegant, styled HTML template specifically
 * configured to translate into a beautiful, formatted native Google Doc.
 */
export function convertMarkdownToHtml(markdown: string, docTitle: string, ticker?: string): string {
  const cleanedMarkdown = cleanMarkdownForRendering(markdown);
  const lines = cleanedMarkdown.split('\n');
  const blocks = parseBlocks(lines);

  const detectedTicker = (ticker || (docTitle.match(/\b([A-Z]{1,5})\b/)?.[1]) || '').toUpperCase();
  const isMeli = detectedTicker === 'MELI';
  const tickerArg = detectedTicker;
  const cockpit = extractExecutiveCockpit(cleanedMarkdown);

  // Pre-extract Flywheel or Linear Value Chain Steps from Part 4, Section 1.7, 9.8, or any Flywheel section in markdown
  const flywheelSectionMatch = cleanedMarkdown.match(/(?:#{1,6}\s*(?:9\.8|1\.7|Part\s*4\b|[^\n]*(?:Flywheel|Value\s*Chain|Compounding\s*Architecture)[^\n]*)\n)([\s\S]*?)(?=\n\*\s*\*\*Confidence|\n---\s*\n\*\s*\(Section|\n##\s*(?:\[Step|Part\b)|$)/i);
  const docFlywheelSteps = flywheelSectionMatch ? parseFlywheelSteps(flywheelSectionMatch[1]) : [];
  const isLinearValueChainDoc = flywheelSectionMatch ? /no\s+organic\s+flywheel|linear\s+value\s+chain|cyclical\s+commodity|linear\s+project|no\s+flywheel/i.test(flywheelSectionMatch[0] + " " + flywheelSectionMatch[1].slice(0, 400)) : false;

  let bodyHtml = '';
  const sectionNav: Array<{ id: string; title: string; level: number }> = [];
  const usedIds = new Set<string>();
  let headerCount = 0;

  let hasRenderedFlywheel = false;
  let hasRenderedOwnerEarningsWaterfall = false;
  let hasRenderedTrendChart = false;
  let currentSectionTitle = '';
  let skippingTopMeta = true;

  for (const block of blocks) {
    switch (block.type) {
      case 'header': {
        const level = block.level;
        const sanitizedHeaderText = block.text.replace(/^#+\s*/, '').trim();
        const text = parseInline(sanitizedHeaderText);
        const cleanTitle = cleanMarkdownSymbols(sanitizedHeaderText);

        // Suppress redundant top H1 (e.g. # Valuation Analysis: SPCX Q2-26) since header already renders it
        if (skippingTopMeta && level === 1 && (/^(?:Valuation Analysis|Executive Summary|Institutional Valuation|Dossier)/i.test(cleanTitle) || (detectedTicker && cleanTitle.includes(detectedTicker)))) {
          break;
        }
        skippingTopMeta = false;

        headerCount++;
        currentSectionTitle = cleanTitle;

        let baseId = `sec-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
        if (!baseId || baseId === 'sec') baseId = `sec-heading-${headerCount}`;
        let secId = baseId;
        let counter = 1;
        while (usedIds.has(secId)) {
          secId = `${baseId}-${counter++}`;
        }
        usedIds.add(secId);

        const isChecklist = /^(?:Step\s*Summary\s*Checklist|Verification\s*Checklist|Section\s*\d+\s*Verification\s*Checklist|Checklist)/i.test(cleanTitle);
        const lastH2 = [...sectionNav].reverse().find(s => s.level === 2);
        const isEchoOfH2 = level === 3 && lastH2 && (
          cleanTitle.toLowerCase().includes(lastH2.title.replace(/^Part\s+\d+:\s*/i, '').toLowerCase().trim()) ||
          lastH2.title.toLowerCase().includes(cleanTitle.replace(/^\d+(?:\.\d+)*\.?\s*/, '').toLowerCase().trim())
        );

        // Filter out noisy, prompt-boilerplate, financial schedule rows, or long paragraph H3 headings from TOC
        const isNoisyH3 = level === 3 && (
          cleanTitle.length > 55 ||
          /[:\$\|]/.test(cleanTitle) ||
          /\b\d+\.?\d*[MB]\b/i.test(cleanTitle) ||
          /^\d+(?:\.\d+)*\.?\s*/.test(cleanTitle) ||
          /^(?:Analytical Summary|Summary of|Per-Share Metrics|Key Analytical|Schedule|Breakdown|Map|Distribution|Comparison|Bridge|Roll Call|Ingestion Audit|Forensic Accounting|Shenanigans|Liabilities &|Balance Sheet Protection|ROIC vs|Growth Multiplier|Economic Interpretation|Scenario Definitions|Year-by-Year|Summary Table|Executive Audit|What is Accurate|Mathematical &|Material Omission|Explicit Claims|Causality &|Final Auditor|Independent Verification)/i.test(cleanTitle)
        );

        const isAllowedH3 = level === 3 && (
          /^Competitor Moat & Valuation Radar/i.test(cleanTitle) ||
          (!isNoisyH3 && !isChecklist && !isEchoOfH2 && cleanTitle.length <= 50)
        );

        if ((level === 2 || (level === 3 && isAllowedH3)) && cleanTitle.length > 2 && !isChecklist && !isEchoOfH2) {
          sectionNav.push({ id: secId, title: cleanTitle, level });
        }

        if (hasRenderedFlywheel && /(?:flywheel\s*mechanics|linear\s*value\s*chain)\s*walkthrough/i.test(cleanTitle)) {
          break;
        }

        const anchorLink = `<a href="#${secId}" class="heading-anchor" title="Direct link to section">§</a>`;
        if (level === 1) {
          bodyHtml += `<h1 id="${secId}" class="dossier-h1">${text}${anchorLink}</h1>\n`;
        } else if (level === 2) {
          bodyHtml += `<h2 id="${secId}" class="dossier-h2">${text}${anchorLink}</h2>\n`;
        } else if (level === 3) {
          if (!isEchoOfH2) {
            bodyHtml += `<h3 id="${secId}" class="dossier-h3">${text}${anchorLink}</h3>\n`;
          }
        } else {
          bodyHtml += `<h4 id="${secId}" class="dossier-h4">${text}${anchorLink}</h4>\n`;
        }

        if (!hasRenderedFlywheel && docFlywheelSteps.length >= 3 && /(?:Compounding\s*Flywheel|Flywheel\s*Mechanics|Business\s*Compounding|Linear\s*Value\s*Chain|Compounding\s*Architecture)/i.test(cleanTitle)) {
          const isLinear = isLinearValueChainDoc || /no\s+organic\s+flywheel|linear\s+value\s+chain|cyclical\s+commodity|no\s+flywheel/i.test(cleanTitle);
          bodyHtml += isLinear ? renderLinearValueChainHtml(docFlywheelSteps, tickerArg) : renderFlywheelHtml(docFlywheelSteps, tickerArg);
          hasRenderedFlywheel = true;
        }
        break;
      }
      case 'hr': {
        if (skippingTopMeta) {
          skippingTopMeta = false;
          break;
        }
        bodyHtml += `<hr class="dossier-hr" />\n`;
        break;
      }
      case 'paragraph': {
        const text = block.text.trim();
        if (text) {
          // If in top metadata preface (Date:, AI Model:, Ticker:, Last Earnings Reported: ...), skip it
          if (skippingTopMeta && (/^(?:\*\*)?(?:Date|AI Model|Ticker|Last Earnings Reported):/i.test(text))) {
            break;
          }
          skippingTopMeta = false;

          // Suppress raw ASCII flowchart / typewriter lines leaking into prose (Image 1 fix)
          if (/^[\|\s▼v▲\^>►◄–—_\(\)\+\-\.\:]{2,}$/.test(text) ||
              /^(?:Stage \d|Flywheel Stage|Closed-Loop|Compounding Reinvestment)[\s\S]*?(?:▼|──>|\|)/i.test(text) ||
              /^\s*\|?\s*(?:TRAFFIC|MONETIZATION|LOGISTICS|CREDIT|REINVESTMENT)[\s\S]*?\|?\s*$/i.test(text) ||
              /^\s*\|?\s*(?:5-STAGE COMPOUNDING FLYWHEEL|THE MERCADOLIBRE LOLLAPALOOZA MATRIX)[\s\S]*?\|?\s*$/i.test(text) ||
              /^\s*Back to Stage 1:\s*Market Expansion\s*$/i.test(text)) {
            break;
          }

          // Detect financial calculations, valuation formulas, and schedules formatted in plain-text markdown
          const isScheduleFormula = /^\*\*(?:Formula \/ Calculation|Calculation \/ Formula|Equation|Valuation Schedule|Synthesized Intrinsic Value Weighting Bridge|Valuation Range Visualization|Target Buy Price Band Architecture|Balance Sheet Protection Schedule):\*\*/i.test(text);
          if (isScheduleFormula) {
            const badgeMatch = text.match(/^\*\*(.*?):\*\*\s*([\s\S]*)$/);
            const badge = badgeMatch ? badgeMatch[1] : 'Valuation Schedule';
            const rest = badgeMatch ? badgeMatch[2] : text;
            bodyHtml += `
<div class="formula-card">
  <span class="formula-badge">${escapeHtml(badge)}</span>
  <div class="formula-body">${parseInline(rest)}</div>
</div>\n`;
            break;
          }

          // Handle Obsidian Flywheel or Linear Value Chain image embed in Section 9.8 (render exactly once)
          if (!hasRenderedFlywheel && (/!\[\[.*?(?:Flywheel|Value\s*Chain).*?\]\]/i.test(text) || /!\[.*?(?:Flywheel|Value\s*Chain).*?\]\(.*?\)/i.test(text))) {
            if (docFlywheelSteps.length >= 3) {
              const isLinear = isLinearValueChainDoc || /no\s+organic\s+flywheel|linear\s+value\s+chain|cyclical\s+commodity|no\s+flywheel/i.test(text);
              bodyHtml += isLinear ? renderLinearValueChainHtml(docFlywheelSteps, tickerArg) : renderFlywheelHtml(docFlywheelSteps, tickerArg);
              hasRenderedFlywheel = true;
            }
            break;
          }

          const isFlywheelSection = currentSectionTitle.includes('9.8') ||
            currentSectionTitle.includes('1.7') ||
            (currentSectionTitle.toLowerCase().includes('flywheel') && !currentSectionTitle.toLowerCase().includes('lollapalooza')) ||
            currentSectionTitle.toLowerCase().includes('linear value chain') ||
            (currentSectionTitle.toLowerCase().includes('part 4') && currentSectionTitle.toLowerCase().includes('moat'));

          if (!hasRenderedFlywheel && isFlywheelSection) {
            const flywheelSteps = parseFlywheelSteps(text);
            const stepsToUse = flywheelSteps.length >= 3 ? flywheelSteps : (docFlywheelSteps.length >= 3 ? docFlywheelSteps : []);
            if (stepsToUse.length >= 3) {
              const isLinear = isLinearValueChainDoc || /no\s+organic\s+flywheel|linear\s+value\s+chain|cyclical\s+commodity|no\s+flywheel/i.test(currentSectionTitle);
              bodyHtml += isLinear ? renderLinearValueChainHtml(stepsToUse, tickerArg) : renderFlywheelHtml(stepsToUse, tickerArg);
              hasRenderedFlywheel = true;
              break;
            }
          }
          bodyHtml += `<p class="dossier-p">${parseInline(text)}</p>\n`;
        }
        break;
      }
      case 'blockquote': {
        const firstLine = block.lines[0] || '';
        if (skippingTopMeta && /PRE-EARNINGS HORIZON ADVISORY/i.test(firstLine)) {
          break;
        }
        skippingTopMeta = false;
        const alertMatch = firstLine.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i);
        if (alertMatch) {
          const alertType = alertMatch[1].toUpperCase();
          const inlineHeader = alertMatch[2];
          const remaining = [inlineHeader, ...block.lines.slice(1)].filter(l => l.trim().length > 0);
          const iconMap: Record<string, string> = {
            NOTE: '📌',
            TIP: '💡',
            IMPORTANT: '⚡',
            WARNING: '⚠️',
            CAUTION: '🛑'
          };
          const icon = iconMap[alertType] || '📌';
          bodyHtml += `
<div class="callout-card callout-${alertType.toLowerCase()}">
  <div class="callout-title"><span class="callout-icon">${icon}</span> ${alertType}</div>
  <div class="callout-body">${remaining.map(l => parseInline(l)).join('<br />')}</div>
</div>\n`;
          break;
        }

        const fullQuote = block.lines.join(' ');
        if (fullQuote.includes('Formula / Calculation:') || fullQuote.includes('Calculation / Formula:') || fullQuote.includes('Equation:')) {
          const cleanFormula = fullQuote
            .replace(/\*\*(?:Formula \/ Calculation|Calculation \/ Formula|Equation):\*\*/g, '')
            .trim();
          bodyHtml += `
<div class="formula-card">
  <span class="formula-badge">Valuation Formula</span>
  <div class="formula-body">${parseInline(cleanFormula)}</div>
</div>\n`;
        } else {
          const quoteContent = block.lines.map(l => parseInline(l)).join('<br />');
          bodyHtml += `<blockquote class="dossier-quote">${quoteContent}</blockquote>\n`;
        }
        break;
      }
      case 'list': {
        const reconstructedList = block.items.map((it, idx) => `${idx + 1}. ${it.text}`).join('\n');
        const listText = block.items.map(it => it.text).join('\n');
        const isFlywheelSection = currentSectionTitle.includes('9.8') ||
          currentSectionTitle.includes('1.7') ||
          listText.toLowerCase().includes('flywheel mechanics') ||
          listText.toLowerCase().includes('linear value chain') ||
          (currentSectionTitle.toLowerCase().includes('flywheel') && !currentSectionTitle.toLowerCase().includes('lollapalooza')) ||
          currentSectionTitle.toLowerCase().includes('linear value chain');

        if (
          !hasRenderedFlywheel &&
          isFlywheelSection &&
          block.items.length >= 3
        ) {
          const flywheelSteps = parseFlywheelSteps(reconstructedList);
          const stepsToUse = flywheelSteps.length >= 3 ? flywheelSteps : (docFlywheelSteps.length >= 3 ? docFlywheelSteps : []);
          if (stepsToUse.length >= 3) {
            const isLinear = isLinearValueChainDoc || /no\s+organic\s+flywheel|linear\s+value\s+chain|cyclical\s+commodity|no\s+flywheel/i.test(currentSectionTitle + " " + listText);
            bodyHtml += isLinear ? renderLinearValueChainHtml(stepsToUse, tickerArg) : renderFlywheelHtml(stepsToUse, tickerArg);
            hasRenderedFlywheel = true;
            break;
          }
        }

        // Suppress duplicate flywheel or linear value chain walkthrough list when cards have already been rendered
        if (hasRenderedFlywheel && (isFlywheelSection || block.items.some(it => /Stage\s*\d+|Production Scale|Margin Capture|Bidding Discipline|Fleet Mobilization|Infrastructure Project/i.test(it.text)))) {
          break;
        }

        bodyHtml += `<ul class="dossier-list">\n`;
        for (const item of block.items) {
          const indentClass = item.indent > 0 ? ` class="list-indent-${Math.min(item.indent, 3)}"` : '';
          bodyHtml += `  <li${indentClass}>${parseInline(item.text)}</li>\n`;
        }
        bodyHtml += `</ul>\n`;
        break;
      }
      case 'table': {
        const chartType = getTableChartType(block.headers, block.rows);
        let chartHtml = '';

        if (chartType === 'trend' && !hasRenderedTrendChart) {
          const trendSvg = renderSvgTrendChart(block.headers, block.rows);
          if (trendSvg) {
            chartHtml = trendSvg;
            hasRenderedTrendChart = true;
          }
        } else if (chartType === 'leaderboard') {
          chartHtml = renderCompetitorRadarSvg(tickerArg, block.rows);
        } else if (chartType === 'debt') {
          chartHtml = renderDebtMaturitiesHtml(block.headers, block.rows);
        } else if (chartType === 'val') {
          chartHtml = renderValuationSpectrumHtml(block.headers, block.rows, cockpit.marketPriceNum);
        } else if (chartType === 'segment') {
          chartHtml = renderSegmentBarHtml(block.headers, block.rows);
        }

        // Check if this table represents the Owner Earnings Reconciliation Bridge in Part 3
        const hasOcfRow = block.rows.some(r => r.some(c => /Operating Cash Flow|GAAP Operating Cash/i.test(c)));
        const hasOeRow = block.rows.some(r => r.some(c => /Normalized Owner Earnings|Levered Normalized Owner Earnings|Owner Earnings Baseline/i.test(c)));
        const is10YearTable = block.headers.length > 5;
        const isOwnerEarningsTable = !is10YearTable && hasOcfRow && hasOeRow;

        if (!hasRenderedOwnerEarningsWaterfall && isOwnerEarningsTable) {
          const wf = renderOwnerEarningsWaterfall(cleanedMarkdown);
          if (wf) {
            chartHtml = wf + chartHtml;
            hasRenderedOwnerEarningsWaterfall = true;
          }
        }

        bodyHtml += chartHtml;
        const is2Col = block.headers.length === 2;
        bodyHtml += `
<div class="table-container">
<table class="dossier-table">
  <thead>
    <tr>
      ${block.headers.map((h, cIdx) => {
        const isNumeric = !is2Col && cIdx > 0 && /^[\$€£\-\(]?\s*\d/.test(h.trim());
        const cellClass = isNumeric ? ' class="cell-numeric"' : (is2Col && cIdx === 1 ? ' class="cell-verdict-val"' : '');
        return `<th${cellClass}>${parseInline(cleanMarkdownSymbols(h))}</th>`;
      }).join('')}
    </tr>
  </thead>
  <tbody>
    ${block.rows.map((row) => `
      <tr>
        ${row.map((cell, cIdx) => {
          const trimmed = cell.trim();
          const cleanCell = removeEmojis(trimmed).replace(/[\*\_\`]/g, '').trim();
          const isNarrative = cleanCell.length > 15 && /\b(?:share|shares|loss|gain|weight|position|discount|deficit|value|verdict|holding|basis|pts?)\b/i.test(cleanCell);
          const isNumeric = !is2Col && !isNarrative && cIdx > 0 && /^[\$€£\-\(]?\s*\d/.test(trimmed);
          const cellClass = isNumeric ? ' class="cell-numeric"' : (is2Col && cIdx === 1 ? ' class="cell-verdict-val"' : '');
          let cellContent = parseInline(cell);

          // Financial Valuation Bridge Tagging
          if (trimmed.startsWith('[-]') || /^\s*\[\-\]\s*(?:Deduction)?/i.test(trimmed)) {
            cellContent = `<span class="bridge-tag tag-deduct">${parseInline(trimmed)}</span>`;
          } else if (trimmed.startsWith('[+]') || /^\s*\[\+\]\s*(?:Addition)?/i.test(trimmed)) {
            cellContent = `<span class="bridge-tag tag-add">${parseInline(trimmed)}</span>`;
          } else if (trimmed.startsWith('[=]') || /^\s*\[\=\]\s*(?:Total|Baseline)?/i.test(trimmed)) {
            cellContent = `<span class="bridge-tag tag-subtotal">${parseInline(trimmed)}</span>`;
          } else if (/^\s*(?:Base\s*Anchor|GAAP\s*Base)\b/i.test(trimmed)) {
            cellContent = `<span class="bridge-tag tag-base">${parseInline(trimmed)}</span>`;
          } else if (cleanCell.length <= 30 && !/\bif\b/i.test(cleanCell)) {
            if (/^(?:PASS(?:ED)?|CLEAN|CORROBORATED|VERIFIED|CONFIRMED)\b/i.test(cleanCell) && !cellContent.includes('audit-badge')) {
              cellContent = `<span class="audit-badge badge-pass">${escapeHtml(cleanCell)}</span>`;
            } else if (/^(?:FLAG|CAUTION|MONITOR)\b/i.test(cleanCell) && !cellContent.includes('audit-badge')) {
              cellContent = `<span class="audit-badge badge-flag">${escapeHtml(cleanCell)}</span>`;
            } else if (/^(?:BREACH|FAIL|DEFICIENT)\b/i.test(cleanCell) && !cellContent.includes('audit-badge')) {
              cellContent = `<span class="audit-badge badge-breach">${escapeHtml(cleanCell)}</span>`;
            }
          }
          return `<td${cellClass}>${cellContent}</td>`;
        }).join('')}
      </tr>
    `).join('')}
  </tbody>
</table>
</div>\n`;
        break;
      }
      case 'codeblock': {
        if (!block.code || !block.code.trim()) {
          break;
        }

        // Skip raw mermaid flowchart if it represents the flywheel or linear value chain (already styled or rendered)
        const isFlywheelOrLinearMermaid = block.code.includes('Closed-Loop Compounding Reinvestment') || 
                                          (block.code.includes('flowchart') && (block.code.includes('Stage 01') || block.code.includes('Stage 1')) && (block.code.includes('Stage 02') || block.code.includes('Stage 2')));
        if (isFlywheelOrLinearMermaid) {
          if (!hasRenderedFlywheel) {
            const stepsToUse = docFlywheelSteps.length >= 3 ? docFlywheelSteps : parseFlywheelSteps(block.code);
            if (stepsToUse.length >= 3) {
              const isLinear = isLinearValueChainDoc || !block.code.includes('Closed-Loop Compounding Reinvestment');
              bodyHtml += isLinear ? renderLinearValueChainHtml(stepsToUse, tickerArg) : renderFlywheelHtml(stepsToUse, tickerArg);
              hasRenderedFlywheel = true;
            }
          }
          break;
        }
        const flywheelSteps = parseFlywheelSteps(block.code);
        if (!hasRenderedFlywheel && flywheelSteps.length >= 3 && !currentSectionTitle.toLowerCase().includes('lollapalooza')) {
          const isLinear = isLinearValueChainDoc || /no\s+organic\s+flywheel|linear\s+value\s+chain|cyclical\s+commodity|no\s+flywheel/i.test(currentSectionTitle);
          bodyHtml += isLinear ? renderLinearValueChainHtml(flywheelSteps, tickerArg) : renderFlywheelHtml(flywheelSteps, tickerArg);
          hasRenderedFlywheel = true;
          break;
        }

        // Detect financial calculations, valuation formulas, schedules, diagrams, and bridges
        const isFinancial = /equation|schedule|breakdown|formula|margin of safety|intrinsic value|target buy price|owner earnings|reproduction cost|balance sheet|baseline extraction|claims|fcf|free cash flow|growth multiplier|valuation range|visualization|leaderboard|confluence|pipeline|sourcing|verification|bridge|discount factor|discount factors|hurdle rate|static hurdle|verdict/i.test(block.code) ||
                            (block.code.includes('=') && (block.code.includes('$') || block.code.includes('%') || block.code.includes('*') || block.code.includes('/'))) ||
                            (/[0-9]/.test(block.code) && (block.code.includes('$') || block.code.includes('%') || block.code.includes(':') || block.code.includes('/'))) ||
                            block.code.includes('▼') || block.code.includes('➔');
        if (isFinancial) {
          const lines = block.code.trim().split('\n');
          const firstLine = lines[0].replace(/[:#]+$/, '').trim();
          const hasTitle = firstLine.length < 55 && !firstLine.includes('=') && !firstLine.startsWith('$');
          const badgeText = hasTitle ? firstLine : 'Financial Valuation Schedule';
          const content = hasTitle ? lines.slice(1).join('\n').trim() : block.code.trim();

          bodyHtml += `
<div class="formula-card">
  <span class="formula-badge">${escapeHtml(badgeText)}</span>
  <div class="formula-body">
    <pre class="formula-pre">${escapeHtml(content)}</pre>
  </div>
</div>\n`;
          break;
        }

        bodyHtml += `<pre class="dossier-pre"><code>${escapeHtml(block.code)}</code></pre>\n`;
        break;
      }
    }
  }

  const kpis = cockpit.kpis;
  let cockpitHtml = '';
  if (cockpit.decision || cockpit.marginOfSafety || kpis.length >= 2) {
    const isInvest = cockpit.decision === 'INVEST' || cockpit.decision === 'ACCUMULATE';
    const isPass = cockpit.decision === 'PASS';
    const isHold = cockpit.decision === 'HOLD';
    const isLiquidate = cockpit.decision === 'LIQUIDATE';
    const isEscalate = cockpit.decision === 'ESCALATE' || Boolean(cockpit.decision?.includes('ESCALATE'));
    const decisionClass = isInvest ? 'hero-invest' : (isPass || isLiquidate) ? 'hero-pass' : isEscalate ? 'hero-escalate' : isHold ? 'hero-hold' : 'hero-neutral';
    const hasPriceAndIv = cockpit.marketPriceNum !== null && cockpit.intrinsicValueNum !== null;
    const mosNum = cockpit.marginOfSafety ? parseFloat(cockpit.marginOfSafety.replace(/[^0-9.-]/g, '')) : null;
    const isPositiveMos = mosNum !== null && mosNum > 0 && !cockpit.marginOfSafety?.includes('Deficit') && !cockpit.marginOfSafety?.startsWith('-');

    cockpitHtml = `
    <div class="executive-cockpit">
      <div class="cockpit-top-row">
        ${cockpit.decision ? `
          <div class="cockpit-hero-card ${decisionClass}">
            <div class="hero-top-tag">CAPITAL ALLOCATION VERDICT</div>
            <div class="hero-decision-badge">${escapeHtml(cockpit.decision)}</div>
            <div class="hero-subtext">${cockpit.decision === 'ACCUMULATE' ? `Accumulate Position / High-Conviction Value (${cockpit.userPosition?.weight || 'Active Holding'})` : isInvest ? 'High-Conviction Investment Grade' : isPass ? 'Hurdle Fails / Margin of Safety Deficit' : isLiquidate ? 'Thesis Broken / Impairment Risk (Liquidate)' : isEscalate ? 'Triage Candidate: High Moat / Inflection — Escalate to Mode 2' : isHold ? (cockpit.userPosition ? `Maintain Core Position (${cockpit.userPosition.weight || 'Active'}) / Never Trim Compounder` : 'Maintain Core Position (Hold)') : 'Hold / Neutral Stance'}</div>
          </div>
        ` : ''}

        <div class="cockpit-valuation-card">
          <div class="cockpit-card-title">VALUATION & MARGIN OF SAFETY COCKPIT</div>
          <div class="cockpit-stats-grid">
            <div class="cockpit-stat-col">
              <span class="cockpit-stat-label">Market Price</span>
              <span class="cockpit-stat-val">${cockpit.marketPriceNum !== null ? `$${cockpit.marketPriceNum.toFixed(2)}` : 'N/A'}</span>
            </div>
            ${cockpit.userPosition ? `
              <div class="cockpit-stat-divider"></div>
              <div class="cockpit-stat-col">
                <span class="cockpit-stat-label">Cost Basis</span>
                <span class="cockpit-stat-val" title="User Portfolio Entry Price">$${cockpit.userPosition.costBasis.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="cockpit-stat-divider"></div>
            <div class="cockpit-stat-col">
              <span class="cockpit-stat-label">Intrinsic Value</span>
              <span class="cockpit-stat-val val-highlight">${cockpit.intrinsicValueNum !== null ? `$${cockpit.intrinsicValueNum.toFixed(2)}` : 'N/A'}</span>
            </div>
            <div class="cockpit-stat-divider"></div>
            <div class="cockpit-stat-col">
              <span class="cockpit-stat-label">Margin of Safety</span>
              <span class="cockpit-stat-val ${isPositiveMos ? 'val-emerald' : 'val-def'}" title="Hurdle: 10% Static Hurdle Rate">${cockpit.marginOfSafety || 'N/A'}</span>
            </div>
          </div>
          ${hasPriceAndIv ? `
            <div class="cockpit-spread-bar-wrap">
              <div class="cockpit-spread-labels">
                <span>Entry Anchor ($${(cockpit.userPosition?.costBasis || cockpit.marketPriceNum)!.toFixed(2)})${cockpit.userPosition ? ' [User Basis]' : ''}</span>
                <span>Intrinsic Value ($${cockpit.intrinsicValueNum!.toFixed(2)})</span>
              </div>
              <div class="cockpit-spread-track">
                <div class="cockpit-spread-fill ${isPositiveMos ? 'fill-emerald' : 'fill-def'}" style="width: ${Math.min(100, Math.max(8, (cockpit.marketPriceNum! / Math.max(cockpit.intrinsicValueNum!, cockpit.marketPriceNum!)) * 100))}%;"></div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="cockpit-meta-row">
        ${cockpit.userPosition ? `
          <div class="cockpit-pill-card user-position-card">
            <span class="pill-card-label">User Position & Return</span>
            <span class="pill-card-val ${cockpit.marketPriceNum && cockpit.marketPriceNum >= cockpit.userPosition.costBasis ? 'val-emerald' : 'val-def'}">${escapeHtml(cockpit.userPosition.weight || 'Active')} (${cockpit.marketPriceNum ? ((cockpit.marketPriceNum - cockpit.userPosition.costBasis) / cockpit.userPosition.costBasis * 100).toFixed(1) + '%' : 'Holding'})</span>
          </div>
        ` : ''}
        <div class="cockpit-pill-card">
          <span class="pill-card-label">Peter Lynch Profile</span>
          <span class="pill-card-val">${escapeHtml(cockpit.lynchProfile || 'Audited Profile')}</span>
        </div>
        <div class="cockpit-pill-card">
          <span class="pill-card-label">Moat Conviction</span>
          <span class="pill-card-val ${cockpit.moatConviction?.toLowerCase() === 'high' ? 'val-emerald' : ''}">${escapeHtml(cockpit.moatConviction || 'Evaluated')}</span>
        </div>
        <div class="cockpit-pill-card">
          <span class="pill-card-label">Static Hurdle Rate</span>
          <span class="pill-card-val">10.0% Static</span>
        </div>
        <div class="cockpit-pill-card">
          <span class="pill-card-label">Forensic Audit Status</span>
          <span class="pill-card-val val-emerald">Corroborated</span>
        </div>
      </div>
    </div>`;
  }

  let kpiGridHtml = '';
  if (kpis.length >= 2) {
    kpiGridHtml = `
    <div class="kpi-grid">
      ${kpis.map(k => `
        <div class="kpi-card ${k.isHighlight ? 'kpi-highlight' : ''}">
          <span class="kpi-label">${escapeHtml(k.label)}</span>
          <span class="kpi-val ${k.isEmerald ? 'kpi-emerald' : ''}">${escapeHtml(k.value)}</span>
        </div>
      `).join('')}
    </div>`;
  }

  const isInterimRelease = markdown.includes('filing_status: "Interim Earnings Release') || docTitle.includes('_Earnings_Release') || docTitle.includes('(Earnings Release)') || /earnings[\s_]*release/i.test(docTitle);
  const lastEarningsMatch = markdown.match(/^---\r?\n[\s\S]*?^last_earnings_date:\s*["']?([0-9\-]+)["']?/m);
  const nextEarningsMatch = markdown.match(/^---\r?\n[\s\S]*?^next_earnings_date:\s*["']?([0-9\-]+)["']?/m);
  const daysNextMatch = markdown.match(/^---\r?\n[\s\S]*?^days_to_next_earnings:\s*(-?[0-9]+)/m);

  const lastEarningsDate = lastEarningsMatch ? lastEarningsMatch[1] : null;
  const nextEarningsDate = nextEarningsMatch ? nextEarningsMatch[1] : null;
  const daysToNextEarnings = daysNextMatch ? parseInt(daysNextMatch[1], 10) : null;
  const isPreEarningsHorizon = daysToNextEarnings !== null && daysToNextEarnings >= 0 && daysToNextEarnings <= 14;
  let cleanDocTitle = docTitle;
  if (cleanDocTitle.includes('_Complete Doc_')) {
    cleanDocTitle = cleanDocTitle.replace(/_Complete Doc_.*$/, '').replace(/_/g, ' ') + ' Institutional Valuation Dossier';
  } else if (cleanDocTitle.includes('_Slingshot_Memo_')) {
    cleanDocTitle = cleanDocTitle.replace(/_Slingshot_Memo_.*$/, '').replace(/_/g, ' ') + ' Slingshot Triage Memo';
  } else if (cleanDocTitle.includes('_Sentinel_Pulse_')) {
    cleanDocTitle = cleanDocTitle.replace(/_Sentinel_Pulse_.*$/, '').replace(/_/g, ' ') + ' Quarterly Sentinel Pulse';
  }

  const generationDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(removeEmojis(cleanDocTitle))}</title>
  <style>
    :root {
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --border-card: #e2e8f0;
      --border-subtle: #f1f5f9;
      --text-primary: #0f172a;
      --text-secondary: #334155;
      --text-muted: #64748b;
      --accent-emerald: #059669;
      --accent-emerald-light: #ecfdf5;
      --accent-emerald-border: #a7f3d0;
      --table-header-bg: #f8fafc;
      --table-row-alt: #fcfcfd;
      --code-bg: #f1f5f9;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", Helvetica, Arial, sans-serif;
      --font-mono: "SF Mono", "Fira Code", Monaco, Consolas, monospace;
    }

    body[data-theme="dark"] {
      --bg-page: #0b0f17;
      --bg-card: #111827;
      --border-card: #1e293b;
      --border-subtle: #1e293b;
      --text-primary: #f8fafc;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;
      --accent-emerald: #10b981;
      --accent-emerald-light: #064e3b30;
      --accent-emerald-border: #05966960;
      --table-header-bg: #1a2234;
      --table-row-alt: #131b2c;
      --code-bg: #1a2335;
    }

    html {
      scroll-behavior: smooth;
      overflow-x: hidden;
      max-width: 100vw;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    h1[id], h2[id], h3[id], h4[id] {
      scroll-margin-top: 80px;
    }

    body {
      background-color: var(--bg-page);
      color: var(--text-secondary);
      font-family: var(--font-sans);
      font-size: 15px;
      line-height: 1.7;
      padding: 2.5rem 1.5rem;
      -webkit-font-smoothing: antialiased;
      transition: background-color 0.2s ease, color 0.2s ease;
      overflow-x: hidden;
      max-width: 100vw;
      width: 100%;
    }

    .toolbar-bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 1.5rem;
      max-width: 980px;
      margin-left: auto;
      margin-right: auto;
      gap: 0.75rem;
    }

    .btn-action {
      background-color: var(--bg-card);
      color: var(--text-secondary);
      border: 1px solid var(--border-card);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-family: var(--font-sans);
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .btn-action:hover {
      border-color: var(--accent-emerald);
      color: var(--text-primary);
    }

    .btn-primary {
      background-color: var(--accent-emerald);
      color: #ffffff !important;
      border-color: var(--accent-emerald);
    }

    .btn-primary:hover {
      filter: brightness(1.1);
    }

    .dossier-wrapper {
      max-width: 980px;
      width: 100%;
      margin: 0 auto;
      background-color: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 16px;
      padding: 3.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      box-sizing: border-box;
      overflow-x: hidden;
    }

    .dossier-header {
      border-bottom: 2px solid var(--accent-emerald);
      padding-bottom: 1.5rem;
      margin-bottom: 2.5rem;
      width: 100%;
      box-sizing: border-box;
      overflow-x: hidden;
    }

    .dossier-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.025em;
      line-height: 1.25;
      margin-bottom: 0.5rem;
    }

    .dossier-meta {
      font-size: 0.82rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: var(--font-mono);
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }

    .dossier-h1 {
      color: var(--text-primary);
      border-bottom: 2px solid var(--border-card);
      padding-bottom: 8px;
      margin-top: 36px;
      margin-bottom: 16px;
      font-size: 1.55rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .dossier-h2 {
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-subtle);
      border-left: 4px solid var(--accent-emerald);
      padding-left: 12px;
      padding-bottom: 6px;
      margin-top: 32px;
      margin-bottom: 14px;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .dossier-h3 {
      color: var(--text-primary);
      margin-top: 22px;
      margin-bottom: 8px;
      font-size: 1.05rem;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .dossier-h4 {
      color: var(--text-primary);
      margin-top: 18px;
      margin-bottom: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .heading-anchor {
      font-size: 0.75em;
      color: var(--text-muted);
      text-decoration: none;
      opacity: 0;
      margin-left: 0.45rem;
      transition: opacity 0.15s ease, color 0.15s ease;
      user-select: none;
      font-weight: normal;
    }

    .dossier-h1:hover .heading-anchor,
    .dossier-h2:hover .heading-anchor,
    .dossier-h3:hover .heading-anchor,
    .dossier-h4:hover .heading-anchor {
      opacity: 0.6;
    }

    .heading-anchor:hover {
      opacity: 1 !important;
      color: var(--accent-emerald) !important;
    }

    .dossier-p {
      font-size: 14.5px;
      line-height: 1.68;
      color: var(--text-secondary);
      margin-top: 0;
      margin-bottom: 14px;
    }

    .text-strong {
      color: var(--text-primary);
      font-weight: 700;
    }

    .text-em {
      color: var(--text-primary);
      font-style: italic;
    }

    .dossier-code {
      font-family: var(--font-mono);
      background-color: var(--code-bg);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.85em;
      color: var(--accent-emerald);
    }

    .dossier-link {
      color: var(--accent-emerald);
      text-decoration: underline;
    }

    .dossier-hr {
      border: 0;
      border-top: 1px solid var(--border-card);
      margin: 28px 0;
    }

    .dossier-quote {
      border-left: 4px solid var(--accent-emerald);
      background-color: var(--accent-emerald-light);
      border-top: 1px solid var(--accent-emerald-border);
      border-right: 1px solid var(--accent-emerald-border);
      border-bottom: 1px solid var(--accent-emerald-border);
      padding: 14px 18px;
      margin: 18px 0;
      color: var(--text-primary);
      font-style: italic;
      font-size: 14px;
      line-height: 1.6;
      border-radius: 0 8px 8px 0;
    }

    .dossier-list {
      margin: 0 0 16px 24px;
      color: var(--text-secondary);
      font-size: 14.5px;
      line-height: 1.65;
    }

    .dossier-list li {
      margin-bottom: 6px;
    }

    .list-indent-1 { margin-left: 16px; list-style-type: circle; }
    .list-indent-2 { margin-left: 32px; list-style-type: square; }
    .list-indent-3 { margin-left: 48px; list-style-type: disc; }

    .table-container {
      overflow-x: auto;
      margin: 20px 0;
      border-radius: 8px;
      border: 1px solid var(--border-card);
    }

    .dossier-table {
      border-collapse: collapse;
      width: 100%;
      font-size: 13.5px;
      background: var(--bg-card);
    }

    .dossier-table th {
      background-color: var(--table-header-bg);
      border-bottom: 2px solid var(--border-card);
      padding: 10px 14px;
      text-align: left;
      font-weight: 700;
      color: var(--text-primary);
      font-size: 12.5px;
      letter-spacing: 0.02em;
      position: sticky;
      top: 0;
      z-index: 1;
      overflow-wrap: break-word;
      word-break: normal;
    }

    .dossier-table td {
      border-bottom: 1px solid var(--border-card);
      padding: 9px 14px;
      color: var(--text-secondary);
      line-height: 1.5;
      overflow-wrap: break-word;
      word-break: normal;
    }

    .dossier-table tr:nth-child(even) td {
      background-color: var(--table-row-alt);
    }

    .dossier-table tbody tr:hover td {
      background-color: var(--accent-emerald-light);
    }

    .dossier-pre {
      background-color: var(--code-bg);
      border: 1px solid var(--border-card);
      padding: 14px 18px;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 12.5px;
      color: var(--text-primary);
      overflow-x: auto;
      margin: 18px 0;
      line-height: 1.5;
    }

    /* Embedded Chart Boxes */
    .chart-box {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin: 1.75rem 0;
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.03);
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .chart-title {
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: var(--font-mono);
      color: var(--accent-emerald);
    }

    .chart-legend {
      display: flex;
      gap: 1.25rem;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      display: inline-block;
    }

    /* Moat Leaderboard Benchmark Grid */
    .benchmark-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .benchmark-card {
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
      border-radius: 10px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .benchmark-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .benchmark-dim {
      font-weight: 700;
      font-size: 13px;
      color: var(--text-primary);
    }

    .benchmark-badge {
      font-size: 10px;
      font-family: var(--font-mono);
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      font-weight: 600;
    }

    .badge-leader {
      background-color: var(--accent-emerald-light);
      color: var(--accent-emerald);
      border: 1px solid var(--accent-emerald-border);
    }

    .badge-top {
      background-color: #0284c715;
      color: #0284c7;
      border: 1px solid #0284c740;
    }

    .benchmark-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding: 0.6rem 0.8rem;
      background: var(--bg-card);
      border-radius: 6px;
      border: 1px solid var(--border-card);
      margin-bottom: 0.75rem;
    }

    .stat-label {
      font-size: 9.5px;
      text-transform: uppercase;
      font-family: var(--font-mono);
      color: var(--text-muted);
      display: block;
    }

    .stat-val {
      font-family: var(--font-mono);
      font-size: 13.5px;
      font-weight: 700;
    }

    .stat-target { color: var(--accent-emerald); }
    .stat-median { color: var(--text-secondary); }

    .benchmark-bottom {
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      border-top: 1px solid var(--border-card);
      padding-top: 0.5rem;
    }

    .sub-label { color: var(--text-muted); }
    .sub-val { color: var(--text-primary); font-weight: 600; font-family: var(--font-mono); }

    /* Debt schedule bars */
    .debt-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .debt-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .debt-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-primary);
      font-weight: 600;
    }

    .debt-rate {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-muted);
    }

    .debt-track-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .debt-track {
      flex: 1;
      height: 10px;
      background: var(--border-card);
      border-radius: 5px;
      overflow: hidden;
    }

    .debt-bar {
      height: 100%;
      background: linear-gradient(90deg, #0d9488, var(--accent-emerald));
      border-radius: 5px;
    }

    .debt-amount {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
      color: var(--accent-emerald);
      width: 70px;
      text-align: right;
    }

    /* Segments */
    .seg-bar-track {
      height: 18px;
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      background: var(--border-card);
      margin-bottom: 1rem;
    }

    .seg-bar-segment {
      height: 100%;
      transition: width 0.3s ease;
    }

    .seg-legend {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.6rem;
    }

    .seg-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4rem 0.75rem;
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
      border-radius: 6px;
      font-size: 12px;
    }

    .seg-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 0.5rem;
    }

    .seg-name {
      color: var(--text-secondary);
      font-weight: 500;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .seg-val {
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--accent-emerald);
      margin-left: 0.5rem;
    }


    /* Tabular numeric alignment */
    .cell-numeric {
      text-align: right !important;
      font-variant-numeric: tabular-nums;
      font-family: var(--font-mono);
    }

    /* 2-Column Key-Value & Verdict Table Alignment */
    .cell-verdict-val {
      text-align: left !important;
      padding-left: 1.5rem !important;
    }

    /* Executive Summary KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.85rem;
      margin: 1.5rem 0 0.5rem 0;
    }

    .kpi-card {
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }

    .kpi-highlight {
      border-color: var(--accent-emerald);
      background: var(--accent-emerald-light);
    }

    .kpi-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }

    .kpi-val {
      font-size: 1.25rem;
      font-weight: 700;
      font-family: var(--font-mono);
      color: var(--text-primary);
    }

    .kpi-emerald {
      color: var(--accent-emerald);
    }

    /* Compounding Operating Pipeline (Flywheel) */
    .pipeline-box {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin: 1.75rem 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .pipeline-header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pipeline-icon {
      color: var(--accent-emerald);
      font-size: 15px;
      font-weight: bold;
    }

    .pipeline-badge {
      font-size: 10px;
      font-family: var(--font-mono);
      background: var(--accent-emerald-light);
      color: var(--accent-emerald);
      border: 1px solid var(--accent-emerald-border);
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 600;
    }

    .flywheel-visual-card {
      margin: 1.25rem 0 1.5rem 0;
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .flywheel-img {
      width: 100%;
      max-width: 820px;
      height: auto;
      border-radius: 12px;
      border: 1px solid var(--border-card);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      display: block;
    }

    .pipeline-conveyor {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 0.5rem;
      margin-top: 1rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .pipeline-step-wrap {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex: 1 1 0px;
      min-width: 170px;
    }

    .pipeline-card {
      flex: 1;
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
      border-radius: 10px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      height: 100%;
      min-height: 140px;
      transition: all 0.2s ease;
    }

    .pipeline-card:hover {
      border-color: var(--accent-emerald);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
      transform: translateY(-2px);
    }

    .pipeline-card-first {
      border-left: 3px solid var(--accent-emerald);
    }

    .pipeline-card-last {
      border-right: 3px solid var(--accent-emerald);
      background: var(--accent-emerald-light);
    }

    .pipeline-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.15rem;
    }

    .pipeline-stage-pill {
      font-size: 9.5px;
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--accent-emerald);
      background: var(--accent-emerald-light);
      border: 1px solid var(--accent-emerald-border);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .pipeline-loop-tag {
      font-size: 9px;
      font-family: var(--font-mono);
      color: var(--accent-emerald);
      font-weight: 600;
      letter-spacing: 0.03em;
    }

    .pipeline-card-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.35;
    }

    .pipeline-card-desc {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .pipeline-connector {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 0.4rem;
      color: var(--accent-emerald);
      font-weight: bold;
      opacity: 0.8;
      user-select: none;
    }

    .pipeline-arrow {
      font-size: 16px;
    }

    .pipeline-loopback-banner {
      margin-top: 1rem;
      padding: 0.9rem 1.15rem;
      background: var(--accent-emerald-light);
      border: 1px solid var(--accent-emerald-border);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .pipeline-loopback-badge {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 700;
      color: var(--accent-emerald);
      letter-spacing: 0.05em;
    }

    .pipeline-loop-icon {
      font-size: 14px;
      font-weight: bold;
    }

    .pipeline-loopback-text {
      font-size: 11.5px;
      color: var(--text-primary);
      line-height: 1.55;
    }

    @media (max-width: 860px), print {
      .pipeline-conveyor {
        flex-direction: column;
      }
      .pipeline-step-wrap {
        flex-direction: column;
        width: 100%;
      }
      .pipeline-connector {
        padding: 0.3rem 0;
        transform: rotate(90deg);
      }
    }

    /* Floating Quick Jump Navigator */
    .toc-floating-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--bg-card);
      color: var(--text-primary);
      border: 1px solid var(--border-card);
      padding: 0.6rem 1.15rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 600;
      font-family: var(--font-sans);
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.14);
      z-index: 100;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      user-select: none;
    }

    .toc-floating-btn:hover {
      border-color: var(--accent-emerald);
      color: var(--accent-emerald);
      transform: translateY(-1px);
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18);
    }

    .toc-menu {
      display: none;
      position: fixed;
      bottom: 72px;
      right: 24px;
      width: 320px;
      max-height: 440px;
      overflow-y: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 0.75rem 0.5rem;
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.22);
      z-index: 100;
      backdrop-filter: blur(8px);
    }

    .toc-menu.open {
      display: block;
    }

    .toc-menu-header {
      font-size: 10px;
      text-transform: uppercase;
      font-family: var(--font-mono);
      color: var(--text-muted);
      padding: 0.25rem 0.6rem 0.5rem 0.6rem;
      border-bottom: 1px solid var(--border-card);
      margin-bottom: 0.4rem;
      letter-spacing: 0.05em;
    }

    .toc-menu-link {
      display: block;
      padding: 0.42rem 0.65rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 12px;
      border-radius: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: background 0.12s ease, color 0.12s ease;
      cursor: pointer;
    }

    .toc-menu-link.toc-indent-3 {
      padding-left: 1.35rem;
      font-size: 11px;
      color: var(--text-muted);
    }

    .toc-menu-link:hover {
      background: var(--table-row-alt);
      color: var(--accent-emerald);
    }

    .toc-menu-link.active {
      background: var(--accent-emerald-light);
      color: var(--accent-emerald);
      font-weight: 700;
      border-left: 3px solid var(--accent-emerald);
    }

    /* Professional Financial Formula Cards */
    .formula-card {
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
      border-left: 3px solid var(--accent-emerald);
      border-radius: 8px;
      padding: 0.85rem 1.1rem;
      margin: 1.25rem 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .formula-badge {
      display: inline-block;
      font-size: 9.5px;
      font-family: var(--font-mono);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent-emerald);
      background: var(--accent-emerald-light);
      border: 1px solid var(--accent-emerald-border);
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 0.4rem;
    }

    .formula-body {
      font-family: var(--font-mono);
      font-size: 13.5px;
      color: var(--text-primary);
      line-height: 1.6;
      word-break: break-word;
    }

    .formula-pre {
      font-family: var(--font-mono);
      font-size: 12.5px;
      color: var(--text-primary);
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
    }

    /* Callout & Alert Boxes */
    .callout-card {
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
      border-left: 4px solid var(--accent-emerald);
      border-radius: 8px;
      padding: 0.85rem 1.15rem;
      margin: 1.25rem 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }

    .callout-warning, .callout-caution {
      border-left-color: #f59e0b;
    }

    .callout-important {
      border-left-color: #3b82f6;
    }

    .callout-title {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent-emerald);
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .callout-warning .callout-title, .callout-caution .callout-title {
      color: #d97706;
    }

    .callout-important .callout-title {
      color: #2563eb;
    }

    .callout-body {
      font-size: 14px;
      line-height: 1.65;
      color: var(--text-secondary);
    }

    /* Reading Progress Indicator */
    #reading-progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-emerald), #0284c7);
      width: 0%;
      z-index: 9999;
      transition: width 0.1s ease-out;
      pointer-events: none;
    }

    /* Forensic Audit Micro-Badges */
    .audit-badge {
      display: inline-flex;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
      vertical-align: middle;
      margin: 0 2px;
      line-height: 1.4;
    }

    .audit-badge.badge-pass {
      background-color: var(--accent-emerald-light);
      color: var(--accent-emerald);
      border: 1px solid var(--accent-emerald-border);
    }

    .audit-badge.badge-flag {
      background-color: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    body[data-theme="dark"] .audit-badge.badge-flag {
      background-color: #78350f35;
      color: #fbbf24;
      border: 1px solid #b4530980;
    }

    .audit-badge.badge-breach {
      background-color: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
    }

    body[data-theme="dark"] .audit-badge.badge-breach {
      background-color: #7f1d1d35;
      color: #f87171;
      border: 1px solid #ef444480;
    }

    /* Institutional Header Branding */
    .dossier-top-badge-bar {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.65rem;
    }

    .company-ticker-pill {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--accent-emerald);
      background: var(--accent-emerald-light);
      border: 1px solid var(--accent-emerald-border);
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .dossier-system-tag {
      font-family: var(--font-mono);
      font-size: 10.5px;
      color: var(--text-muted);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* Executive Cockpit */
    .executive-cockpit {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cockpit-top-row {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 1rem;
    }

    .cockpit-hero-card {
      border-radius: 12px;
      padding: 1.25rem 1.1rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 2px solid transparent;
    }

    .cockpit-hero-card.hero-invest {
      background: linear-gradient(145deg, var(--accent-emerald-light), rgba(16, 185, 129, 0.05));
      border-color: var(--accent-emerald);
      color: var(--accent-emerald);
    }

    .cockpit-hero-card.hero-pass {
      background: linear-gradient(145deg, #fef2f2, #fff1f2);
      border-color: #ef4444;
      color: #b91c1c;
    }

    body[data-theme="dark"] .cockpit-hero-card.hero-pass {
      background: linear-gradient(145deg, #450a0a30, #7f1d1d20);
      border-color: #ef444480;
      color: #f87171;
    }

    .cockpit-hero-card.hero-hold {
      background: linear-gradient(145deg, #f0f9ff, #e0f2fe);
      border-color: #0284c7;
      color: #0369a1;
    }

    body[data-theme="dark"] .cockpit-hero-card.hero-hold {
      background: linear-gradient(145deg, #0c4a6e30, #0369a120);
      border-color: #0284c780;
      color: #38bdf8;
    }

    .cockpit-hero-card.hero-escalate {
      background: linear-gradient(145deg, #fffbeb, #fef3c7);
      border-color: #f59e0b;
      color: #b45309;
    }

    body[data-theme="dark"] .cockpit-hero-card.hero-escalate {
      background: linear-gradient(145deg, #78350f30, #b4530920);
      border-color: #f59e0b80;
      color: #fbbf24;
    }

    .cockpit-hero-card.hero-neutral {
      background: var(--table-row-alt);
      border-color: var(--border-card);
      color: var(--text-primary);
    }

    .hero-top-tag {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.85;
      margin-bottom: 0.35rem;
    }

    .hero-decision-badge {
      font-family: var(--font-sans);
      font-size: 1.75rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.1;
      margin-bottom: 0.35rem;
    }

    .hero-subtext {
      font-size: 11px;
      font-weight: 500;
      line-height: 1.35;
      opacity: 0.9;
    }

    .cockpit-valuation-card {
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 1.1rem 1.35rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }

    .cockpit-card-title {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }

    .cockpit-stats-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .cockpit-stat-col {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex: 1;
    }

    .cockpit-stat-label {
      font-size: 10.5px;
      color: var(--text-muted);
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .cockpit-stat-val {
      font-family: var(--font-mono);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.1;
    }

    .cockpit-stat-val.val-highlight {
      color: #0284c7;
    }

    .cockpit-stat-val.val-emerald {
      color: var(--accent-emerald);
    }

    .cockpit-stat-val.val-def {
      color: #dc2626;
    }

    .cockpit-stat-divider {
      width: 1px;
      height: 38px;
      background: var(--border-card);
    }

    .cockpit-spread-bar-wrap {
      margin-top: 0.9rem;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--border-card);
    }

    .cockpit-spread-labels {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      font-family: var(--font-mono);
      color: var(--text-muted);
      margin-bottom: 0.35rem;
    }

    .cockpit-spread-track {
      height: 7px;
      background: var(--border-card);
      border-radius: 4px;
      overflow: hidden;
    }

    .cockpit-spread-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;
    }

    .cockpit-spread-fill.fill-emerald {
      background: linear-gradient(90deg, #059669, #10b981);
    }

    .cockpit-spread-fill.fill-def {
      background: linear-gradient(90deg, #dc2626, #ef4444);
    }

    .cockpit-meta-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.65rem;
    }

    .cockpit-pill-card {
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
      border-radius: 8px;
      padding: 0.6rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .pill-card-label {
      font-size: 9.5px;
      color: var(--text-muted);
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .pill-card-val {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-primary);
      font-family: var(--font-mono);
    }

    /* Valuation Triad Spectrum Box */
    .valuation-spectrum-box {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
    }

    .spectrum-container {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-top: 0.5rem;
    }

    .spectrum-row {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .spectrum-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .spectrum-name-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .spectrum-name {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .spectrum-badge {
      font-size: 9.5px;
      font-family: var(--font-mono);
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-av {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    body[data-theme="dark"] .badge-av {
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
    }

    .badge-epv {
      background: #e0f2fe;
      color: #0284c7;
      border: 1px solid #bae6fd;
    }

    body[data-theme="dark"] .badge-epv {
      background: #0369a130;
      color: #38bdf8;
      border: 1px solid #0284c780;
    }

    .badge-dcf {
      background: var(--accent-emerald-light);
      color: var(--accent-emerald);
      border: 1px solid var(--accent-emerald-border);
    }

    .badge-iv {
      background: #f5f3ff;
      color: #7c3aed;
      border: 1px solid #ddd6fe;
    }

    body[data-theme="dark"] .badge-iv {
      background: #5b21b630;
      color: #a78bfa;
      border: 1px solid #7c3aed80;
    }

    .spectrum-val {
      font-family: var(--font-mono);
      font-size: 13.5px;
      font-weight: 700;
    }

    .spectrum-track-wrap {
      width: 100%;
    }

    .spectrum-track {
      position: relative;
      height: 12px;
      background: var(--border-card);
      border-radius: 6px;
      overflow: visible;
    }

    .spectrum-bar {
      height: 100%;
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .spectrum-price-marker {
      position: absolute;
      top: -4px;
      bottom: -4px;
      width: 3px;
      background-color: #ef4444;
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(239, 68, 68, 0.7);
      z-index: 2;
    }

    .spectrum-footer {
      margin-top: 1.15rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-subtle);
    }

    .spectrum-legend {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1.25rem;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }

    .spectrum-legend-item {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .spectrum-dot {
      width: 8px;
      height: 8px;
      border-radius: 2px;
      display: inline-block;
    }

    .spectrum-needle-sample {
      width: 3px;
      height: 12px;
      background-color: #ef4444;
      display: inline-block;
      border-radius: 1px;
      box-shadow: 0 0 4px rgba(239, 68, 68, 0.6);
    }

    .toc-list {
      max-height: 380px;
      overflow-y: auto;
    }

    /* Responsive SVG Compounding Flywheel Loop */
    .flywheel-container-box {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.75rem 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    .flywheel-svg-wrap {
      width: 100%;
      max-width: 640px;
      margin: 0.5rem auto 1.5rem auto;
      display: flex;
      justify-content: center;
    }

    .flywheel-svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .flywheel-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
      margin-top: 1.25rem;
    }

    .flywheel-step-card {
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
      border-radius: 10px;
      padding: 1rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      transition: all 0.2s ease;
    }

    .flywheel-step-card:hover {
      border-color: var(--accent-emerald);
      transform: translateY(-1px);
    }

    .card-last {
      border-color: var(--accent-emerald-border);
      background: var(--accent-emerald-light);
    }

    .flywheel-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .flywheel-card-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .flywheel-card-desc {
      font-size: 11.5px;
      line-height: 1.5;
      color: var(--text-secondary);
    }

    /* Responsive SVG Linear Value Chain Pipeline */
    .linear-chain-container-box {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.75rem 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    .badge-linear {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    body[data-theme="dark"] .badge-linear {
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
    }

    .linear-chain-svg-wrap {
      width: 100%;
      max-width: 760px;
      margin: 0.5rem auto 1.5rem auto;
      display: flex;
      justify-content: center;
    }

    .linear-chain-svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .linear-step-card {
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
    }

    .card-linear-terminal {
      border-color: #64748b;
      background: var(--table-row-alt);
    }

    body[data-theme="dark"] .card-linear-terminal {
      border-color: #475569;
      background: #0f172a80;
    }

    .pill-terminal {
      color: #94a3b8 !important;
      background: #1e293b !important;
      border-color: #334155 !important;
    }

    .pipeline-linear-tag {
      font-size: 9px;
      font-family: var(--font-mono);
      font-weight: 700;
      color: #94a3b8;
      background: #1e293b;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #334155;
      text-transform: uppercase;
    }

    .pipeline-linear-seq {
      font-size: 9px;
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--text-muted);
    }

    .linear-terminal-banner {
      background: var(--table-row-alt);
      border: 1px solid var(--border-card);
      border-left: 4px solid #64748b;
    }

    .linear-terminal-badge {
      color: var(--text-secondary);
      border-color: var(--border-card);
      background: var(--bg-card);
    }

    /* Competitor Radar SVG Chart */
    .radar-chart-box {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.75rem 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .radar-chart-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 0.5rem;
    }

    .radar-svg {
      width: 100%;
      max-width: 480px;
      height: auto;
      display: block;
    }

    .radar-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 1rem;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-secondary);
    }

    .radar-legend-item {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .radar-swatch {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      display: inline-block;
    }

    .swatch-target {
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
    }

    .swatch-peer {
      background: #6366f1;
    }

    /* Owner Earnings Reconciliation Waterfall Bridge */
    .waterfall-box {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.75rem 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .waterfall-steps-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin-top: 1rem;
    }

    .waterfall-step-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 0.55rem 0.75rem;
      border-radius: 8px;
      background: var(--table-row-alt);
      border: 1px solid var(--border-subtle);
    }

    .waterfall-step-final {
      background: var(--accent-emerald-light);
      border: 1px solid var(--accent-emerald-border);
    }

    .waterfall-step-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
    }

    .waterfall-step-name {
      color: var(--text-primary);
    }

    .waterfall-badge {
      font-size: 10px;
      font-family: var(--font-mono);
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
    }

    .badge-base {
      background: #e0e7ff;
      color: #4338ca;
      border: 1px solid #c7d2fe;
    }

    body[data-theme="dark"] .badge-base {
      background: #3730a340;
      color: #818cf8;
      border: 1px solid #4338ca80;
    }

    .badge-deduct {
      background: #ffe4e6;
      color: #be123c;
      border: 1px solid #fecdd3;
    }

    body[data-theme="dark"] .badge-deduct {
      background: #9f123940;
      color: #fb7185;
      border: 1px solid #be123c80;
    }

    .badge-final {
      background: var(--accent-emerald-light);
      color: var(--accent-emerald);
      border: 1px solid var(--accent-emerald-border);
    }

    .waterfall-track-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
    }

    .waterfall-track {
      flex: 1;
      height: 10px;
      background: var(--border-card);
      border-radius: 5px;
      overflow: hidden;
    }

    .waterfall-bar {
      height: 100%;
      border-radius: 5px;
      transition: width 0.3s ease;
    }

    .bar-emerald {
      background: var(--accent-emerald);
    }

    .bar-indigo {
      background: #6366f1;
    }

    .bar-rose {
      background: #ef4444;
    }

    .waterfall-val {
      font-family: var(--font-mono);
      font-size: 12.5px;
      font-weight: 700;
      width: 110px;
      text-align: right;
      color: var(--text-primary);
    }

    /* Financial Bridge Table Tags */
    .bridge-tag {
      font-size: 9.5px;
      font-family: var(--font-mono);
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }

    .tag-deduct {
      background: #ffe4e6;
      color: #be123c;
      border: 1px solid #fecdd3;
    }

    body[data-theme="dark"] .tag-deduct {
      background: #9f123940;
      color: #fb7185;
      border: 1px solid #be123c80;
    }

    .tag-add {
      background: #e0e7ff;
      color: #4338ca;
      border: 1px solid #c7d2fe;
    }

    body[data-theme="dark"] .tag-add {
      background: #3730a340;
      color: #818cf8;
      border: 1px solid #4338ca80;
    }

    .tag-base {
      background: var(--border-card);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }

    .tag-subtotal {
      background: var(--accent-emerald-light);
      color: var(--accent-emerald);
      border: 1px solid var(--accent-emerald-border);
    }

    /* RESPONSIVE DESIGN FOR MOBILE, TABLET & SCREENS */
    @media screen and (max-width: 768px) {
      body {
        padding: 1rem 0.5rem;
        font-size: 14px;
        line-height: 1.6;
      }
      .toolbar-bar {
        justify-content: stretch;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .btn-action {
        flex: 1;
        justify-content: center;
        padding: 0.5rem 0.75rem;
        font-size: 0.78rem;
      }
      .dossier-wrapper {
        padding: 1.75rem 1.25rem;
        border-radius: 12px;
      }
      .dossier-title {
        font-size: 1.6rem;
      }
      .dossier-h1 {
        font-size: 1.35rem;
        margin-top: 28px;
        margin-bottom: 12px;
      }
      .dossier-h2 {
        font-size: 1.15rem;
        margin-top: 22px;
        margin-bottom: 10px;
      }
      .benchmark-grid {
        grid-template-columns: 1fr;
      }
      .chart-box {
        padding: 1rem;
        margin: 1.25rem 0;
      }
      .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.4rem;
      }
      .chart-legend {
        flex-wrap: wrap;
        gap: 0.75rem;
      }
      .dossier-table th, .dossier-table td {
        padding: 8px 10px;
        font-size: 12px;
      }
      /* Sticky metric column on horizontal scroll (mobile & tablets) */
      .dossier-table td:first-child,
      .dossier-table th:first-child {
        position: sticky;
        left: 0;
        background-color: var(--bg-card);
        z-index: 2;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.06);
      }
      .dossier-table tr:nth-child(even) td:first-child {
        background-color: var(--table-row-alt);
      }
      .flywheel-grid {
        grid-template-columns: 1fr;
        position: relative;
        padding-left: 1.5rem;
        border-left: 2px solid var(--accent-emerald-border);
        margin-left: 0.5rem;
      }
      .flywheel-card {
        position: relative;
      }
      .flywheel-card::before {
        content: '';
        position: absolute;
        left: -1.85rem;
        top: 1.1rem;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--accent-emerald);
        border: 2px solid var(--bg-card);
      }
      .flywheel-arrow {
        display: none;
      }
      .flywheel-loopback-banner {
        font-size: 11px;
      }
      /* Executive Summary & Cockpit Mobile Responsive Fix */
      .executive-cockpit {
        margin-top: 1.25rem;
        gap: 0.75rem;
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
      }
      .cockpit-top-row {
        grid-template-columns: 1fr;
        gap: 0.75rem;
        width: 100%;
      }
      .cockpit-hero-card {
        padding: 1.1rem 0.9rem;
        width: 100%;
        box-sizing: border-box;
      }
      .hero-decision-badge {
        font-size: 1.5rem;
      }
      .hero-subtext {
        font-size: 11px;
      }
      .cockpit-valuation-card {
        padding: 1rem;
        width: 100%;
        box-sizing: border-box;
      }
      .cockpit-stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem 0.5rem;
        width: 100%;
      }
      .cockpit-stat-divider {
        display: none;
      }
      .cockpit-stat-col {
        min-width: 0;
        width: 100%;
      }
      .cockpit-stat-label {
        font-size: 9.5px;
      }
      .cockpit-stat-val {
        font-size: 1.2rem;
        word-break: break-word;
      }
      .cockpit-spread-bar-wrap {
        margin-top: 0.75rem;
        padding-top: 0.5rem;
      }
      .cockpit-spread-labels {
        font-size: 8.5px;
        flex-direction: column;
        gap: 0.2rem;
      }
      .cockpit-meta-row {
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        width: 100%;
      }
      .cockpit-pill-card {
        padding: 0.5rem 0.65rem;
        min-width: 0;
        width: 100%;
        box-sizing: border-box;
      }
      .pill-card-label {
        font-size: 8.5px;
      }
      .pill-card-val {
        font-size: 11px;
        word-break: break-word;
      }
      .kpi-grid {
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        width: 100%;
      }
      .toc-floating-btn {
        bottom: 16px;
        right: 16px;
        padding: 0.5rem 0.85rem;
        font-size: 0.75rem;
      }
      .toc-menu {
        bottom: 60px;
        right: 16px;
        width: calc(100vw - 32px);
        max-width: 320px;
      }
    }

    @media screen and (max-width: 480px) {
      body {
        padding: 0.75rem 0.25rem;
      }
      .dossier-wrapper {
        padding: 1rem 0.65rem;
        border-radius: 8px;
        width: 100%;
        overflow-x: hidden;
      }
      .dossier-header {
        overflow-x: hidden;
      }
      .dossier-title {
        font-size: 1.35rem;
        word-break: break-word;
      }
      .dossier-meta {
        font-size: 0.72rem;
        gap: 0.4rem;
      }
      .dossier-top-badge-bar {
        flex-wrap: wrap;
        gap: 0.35rem;
      }
      .company-ticker-pill {
        font-size: 9px;
        padding: 2px 6px;
      }
      .dossier-system-tag {
        font-size: 9.5px;
      }
      .executive-cockpit {
        margin-top: 1rem;
        gap: 0.6rem;
        overflow-x: hidden;
      }
      .cockpit-hero-card {
        padding: 0.85rem 0.75rem;
      }
      .hero-decision-badge {
        font-size: 1.35rem;
      }
      .cockpit-valuation-card {
        padding: 0.85rem 0.75rem;
      }
      .cockpit-stats-grid {
        grid-template-columns: 1fr 1fr;
        gap: 0.65rem 0.35rem;
      }
      .cockpit-stat-label {
        font-size: 9px;
      }
      .cockpit-stat-val {
        font-size: 1.05rem;
      }
      .cockpit-meta-row {
        grid-template-columns: 1fr;
        gap: 0.4rem;
      }
      .kpi-grid {
        grid-template-columns: 1fr;
        gap: 0.45rem;
      }
      .benchmark-stats {
        grid-template-columns: 1fr;
        gap: 0.4rem;
      }
      .seg-legend {
        grid-template-columns: 1fr;
      }
    }

    @media screen and (orientation: landscape) and (max-height: 550px) {
      body {
        padding: 1rem 1.5rem;
      }
      .dossier-wrapper {
        padding: 1.75rem 2.25rem;
      }
    }

    /* PRINT-TO-PDF RULES (LANDSCAPE & PORTRAIT READY) */
    @media print {
      @page {
        margin: 1.2cm;
        size: auto;
      }
      body {
        background-color: #ffffff !important;
        color: #0f172a !important;
        padding: 0 !important;
        font-size: 9.5pt !important;
        line-height: 1.5 !important;
      }
      .toolbar-bar, .toc-floating-btn, .toc-menu, #reading-progress-bar, .heading-anchor {
        display: none !important;
      }
      .dossier-wrapper {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
        background-color: #ffffff !important;
      }
      .dossier-title {
        color: #0f172a !important;
        font-size: 16pt !important;
      }
      .dossier-header {
        border-bottom: 2px solid #059669 !important;
        padding-bottom: 1rem !important;
        margin-bottom: 1.5rem !important;
      }
      .dossier-h1, .dossier-h2, .dossier-h3, .dossier-h4 {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      .chart-box, table, tr, .dossier-table, .benchmark-card, .flywheel-card, .kpi-card, .formula-card, .callout-card, .executive-cockpit, .cockpit-hero-card, .cockpit-valuation-card, .valuation-spectrum-box, .pipeline-box, .audit-badge {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .dossier-table th {
        background-color: #f1f5f9 !important;
        color: #0f172a !important;
      }
      .dossier-table td {
        color: #1e293b !important;
      }
      .chart-box {
        border: 1px solid #e2e8f0 !important;
        box-shadow: none !important;
      }
      p, li {
        orphans: 3;
        widows: 3;
      }
    }
  </style>
</head>
<body>
  <div id="reading-progress-bar"></div>
  <div class="toolbar-bar">
    <button class="btn-action" id="theme-btn" onclick="toggleTheme()">
      <span id="theme-icon">🌙</span> Dark Mode
    </button>
    <button class="btn-action btn-primary" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Print / Save to PDF
    </button>
  </div>

  <div class="dossier-wrapper">
    <header class="dossier-header">
      <div class="dossier-top-badge-bar">
        <div class="company-ticker-pill">${detectedTicker ? escapeHtml(detectedTicker) + ' • ' : ''}SEC EDGAR AUDITED</div>
        <span class="dossier-system-tag">Terminal 12+1 Pipeline</span>
      </div>
      <h1 class="dossier-title">${escapeHtml(removeEmojis(cleanDocTitle))}</h1>
      <div class="dossier-meta">
        <span>Value Investing Terminal</span>
        <span>•</span>
        <span>${generationDate}</span>
        <span>•</span>
        <span>Executive Institutional Dossier</span>
        ${nextEarningsDate ? `<span>•</span><span>Next Earnings: ${escapeHtml(nextEarningsDate)}${daysToNextEarnings !== null ? ` (${daysToNextEarnings === 0 ? "Today" : daysToNextEarnings === 1 ? "Tomorrow" : `in ${daysToNextEarnings}d`})` : ''}</span>` : ''}
      </div>
      ${isInterimRelease ? `
      <div style="margin-top: 1rem; padding: 0.75rem 1rem; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 8px; color: #d97706; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
        <span>⚠️</span>
        <span>INTERIM VALUATION: Anchored to quarterly Earnings Release &amp; Transcript. Re-run required upon SEC Form 10-Q filing.</span>
      </div>` : (isPreEarningsHorizon ? `
      <div style="margin-top: 1rem; padding: 0.75rem 1rem; background: rgba(245, 158, 11, 0.10); border: 1px solid rgba(245, 158, 11, 0.38); border-radius: 8px; color: #b45309; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
        <span>📅</span>
        <span>PRE-EARNINGS HORIZON ADVISORY: Compiled ${daysToNextEarnings === 0 ? "on the day of" : daysToNextEarnings === 1 ? "1 day prior to" : `${daysToNextEarnings} days prior to`} scheduled earnings release (${escapeHtml(nextEarningsDate || "")}). Core structural moat, Zero-Growth EPV floor, and multi-year compounding models remain foundational; review post-release filings for updated TTM figures and guidance.</span>
      </div>` : '')}
      ${cockpitHtml || kpiGridHtml}
    </header>

    <main class="dossier-content">
${bodyHtml}
    </main>
  </div>

  ${sectionNav.length > 3 ? `
  <div class="toc-floating-btn" id="toc-btn" onclick="toggleTocMenu()">
    📑 Jump to Section ▾
  </div>
  <div class="toc-menu" id="toc-menu">
    <div class="toc-menu-header">Quick Jump Navigator</div>
    <div class="toc-list" id="toc-list">
      ${sectionNav.map(s => `
        <a href="#${s.id}" data-sec="${s.id}" class="toc-menu-link ${s.level === 3 ? 'toc-indent-3' : ''}" onclick="jumpToSection(event, '${s.id}')">
          ${escapeHtml(s.title)}
        </a>
      `).join('')}
    </div>
  </div>` : ''}

  <script>
    function toggleTheme() {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      const nextTheme = isDark ? 'light' : 'dark';
      document.body.setAttribute('data-theme', nextTheme);
      try { localStorage.setItem('invest_dossier_theme', nextTheme); } catch(e) {}
      updateThemeBtn(nextTheme);
    }

    function updateThemeBtn(theme) {
      const btn = document.getElementById('theme-btn');
      if (!btn) return;
      if (theme === 'dark') {
        btn.innerHTML = '☀️ Light Mode';
      } else {
        btn.innerHTML = '🌙 Dark Mode';
      }
    }

    function toggleTocMenu() {
      const menu = document.getElementById('toc-menu');
      if (menu) {
        menu.classList.toggle('open');
      }
    }

    function closeTocMenu() {
      const menu = document.getElementById('toc-menu');
      if (menu) menu.classList.remove('open');
    }

    function jumpToSection(event, id) {
      if (event) event.preventDefault();
      closeTocMenu();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        try {
          history.pushState(null, '', '#' + id);
        } catch(e) {}
      }
    }

    function updateProgressBar() {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      const bar = document.getElementById('reading-progress-bar');
      if (bar) bar.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
    }

    window.addEventListener('scroll', updateProgressBar, { passive: true });
    window.addEventListener('load', () => setTimeout(updateProgressBar, 150));

    document.addEventListener('click', (e) => {
      const btn = document.getElementById('toc-btn');
      const menu = document.getElementById('toc-menu');
      if (btn && menu && !btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
      }
    });

    try {
      const saved = localStorage.getItem('invest_dossier_theme');
      if (saved === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        updateThemeBtn('dark');
      }
    } catch(e) {}

    // Dynamic Section Scrollspy: updates #toc-btn with current section title and highlights active link
    function updateActiveHeading() {
      const headings = Array.from(document.querySelectorAll('.dossier-content h1[id], .dossier-content h2[id], .dossier-content h3[id]'));
      if (headings.length === 0) return;

      let currentActive = headings[0];
      for (let i = 0; i < headings.length; i++) {
        const h = headings[i];
        const rect = h.getBoundingClientRect();
        if (rect.top <= 140) {
          currentActive = h;
        } else {
          break;
        }
      }

      if (currentActive && currentActive.id) {
        const activeId = currentActive.id;
        const tocLinks = Array.from(document.querySelectorAll('.toc-menu-link'));
        const tocBtn = document.getElementById('toc-btn');

        let activeLink = null;
        tocLinks.forEach(l => {
          if (l.getAttribute('data-sec') === activeId || l.getAttribute('href') === '#' + activeId) {
            l.classList.add('active');
            activeLink = l;
          } else {
            l.classList.remove('active');
          }
        });

        if (activeLink && tocBtn) {
          const title = activeLink.textContent.trim();
          const cleanTitle = title.length > 28 ? title.slice(0, 26) + '…' : title;
          tocBtn.innerHTML = '📑 ' + cleanTitle + ' ▾';
        }
      }
    }

    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    window.addEventListener('load', () => setTimeout(updateActiveHeading, 150));
    setTimeout(updateActiveHeading, 300);
  </script>
</body>
</html>`;
}

/**
 * Triggers a direct client-side browser download of the standalone HTML dossier.
 */
export function downloadStandaloneHtml(markdown: string, docTitle: string, filename?: string) {
  if (typeof window === 'undefined') return;

  const html = convertMarkdownToHtml(markdown, docTitle);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  let safeFilename = filename || `${docTitle.replace(/[^a-zA-Z0-9_\-]/g, '_')}.html`;
  if ((markdown.includes('filing_status: "Interim Earnings Release') || docTitle.includes('_Earnings_Release')) && !safeFilename.includes('Earnings_Release')) {
    safeFilename = safeFilename.replace(/\.html$/i, '_Earnings_Release.html');
  }
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
