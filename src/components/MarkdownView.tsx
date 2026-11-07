import { 
  cleanMarkdownForRendering as guardCleanMarkdownForRendering, 
  unwrapNonMermaidCodeBlocks, 
  parseFlywheelSteps, 
  formatMermaidNode,
  FlywheelStep 
} from '../utils/dossierFormatGuard.js';
import React, { useState, useMemo, memo } from 'react';
import { 
  PieChart, Table, TrendingUp, DollarSign, Calendar, BarChart3, Info, RotateCw 
} from 'lucide-react';
import { STEP_CHAPTER_TITLES } from '../prompts.js';

const CHART_COLORS = ['#10B981', '#0EA5E9', '#6366F1', '#F59E0B', '#EF4444', '#14B8A6'];
const HAS_NON_ASCII = /[^\x00-\x7F]/;
const EMOJI_REGEX = /\p{Extended_Pictographic}/gu;
const FALLBACK_EMOJI_REGEX = /[\u1F600-\u1F64F]|[\u1F300-\u1F5FF]|[\u1F680-\u1F6FF]|[\u2600-\u26FF]|[\u2700-\u27BF]/g;

// Helper to strip emoji characters to ensure highest tier professionalism for HNW workstation
const stripEmojis = (text: string): string => {
  if (!text || !HAS_NON_ASCII.test(text)) return text;
  try {
    return text.replace(EMOJI_REGEX, ' ').replace(/\s+/g, ' ').trim();
  } catch (e) {
    return text.replace(FALLBACK_EMOJI_REGEX, ' ').replace(/\s+/g, ' ').trim();
  }
};

// Helper to clean clean string values into floats (e.g. "$4,537 million", "11.05%", "(450)")
function parseNumericValue(val: string): number {
  if (!val) return 0;
  
  const sanitized = val.replace(/[\*\_\#`]/g, '').trim();
  const isNegative = /^\s*\(.*\)\s*$/.test(sanitized) || sanitized.startsWith('-');
  const clean = sanitized.replace(/[\$%,\s\(\)]/g, '');
  let multiplier = 1;
  if (/million/i.test(val)) {
    multiplier = 1;
  } else if (/billion/i.test(val)) {
    multiplier = 1000;
  }
  let num = parseFloat(clean);
  if (isNaN(num)) num = 0;
  
  return (isNegative ? -Math.abs(num) : Math.abs(num)) * multiplier;
}

export { parseFlywheelSteps };
export type { FlywheelStep };

/**
 * Converts space-aligned or typewriter-style MATERIALITY & CONTINGENCY AUDIT MATRIX
 * into a clean GitHub-Flavored Markdown pipe table.
 */
export function formatMaterialityMatrix(block: string): string {
  if (block.includes('|') && block.includes('---')) return block;

  const headerRegex = /(?:#{1,4}\s*)?MATERIALITY\s*&\s*CONTINGENCY\s*AUDIT\s*MATRIX/i;
  const headerMatch = block.match(headerRegex);
  if (!headerMatch) return block;

  const title = headerMatch[0].startsWith('#') ? headerMatch[0] : `### ${headerMatch[0]}`;
  const afterHeader = block.slice(headerMatch.index! + headerMatch[0].length).trim();

  const itemMatches = [...afterHeader.matchAll(/(?:^|\n)(\d+\.\s+[\s\S]*?)(?=(?:\n\d+\.\s+)|\n#{1,4}|\n---|$)/g)];
  if (itemMatches.length === 0) return block;

  const tableRows: string[] = [];
  for (const m of itemMatches) {
    const itemText = m[1].trim();
    const lines = itemText.split('\n');
    const col1: string[] = [];
    const col2: string[] = [];
    const col3: string[] = [];

    for (const l of lines) {
      if (!l.trim()) continue;
      const c1 = l.slice(0, 21).trim();
      const c2 = l.slice(21, 62).trim();
      const c3 = l.slice(62).trim();
      if (c1) col1.push(c1);
      if (c2) col2.push(c2);
      if (c3) col3.push(c3);
    }

    const vector = col1.join(' ').replace(/^(\d+\.\s*)(.*)$/, '**$1$2**');
    const evidence = col2.join(' ');
    let impact = col3.join(' ').replace(/\s*•\s*/g, '<br>• ');
    impact = impact.replace(/^([A-Z\s\/\-]+?)(<br>|$)/, '**$1**$2');

    tableRows.push(`| ${vector} | ${evidence} | ${impact} |`);
  }

  if (tableRows.length === 0) return block;

  return [
    title,
    '',
    '| Audit Vector | Filing / Source Evidence | Materiality & Thesis Impact |',
    '| :--- | :--- | :--- |',
    ...tableRows,
    ''
  ].join('\n');
}

/**
 * Sanitizes and normalizes markdown content before parsing/rendering.
 * Handles Gemini 3.6 Flash quirks like raw LaTeX math syntax, ASCII box art tables (+----+----+),
 * code-fenced tables, and leftover TeX environment tags.
 */
export function cleanMarkdownForRendering(markdown: string): string {
  return guardCleanMarkdownForRendering(markdown);
}

export { unwrapNonMermaidCodeBlocks };

// Simple bold / italic inline parser
const parseInlineMarkdown = (text: string): string => {
  let html = stripEmojis(text);
  // Clean lingering LaTeX symbols if any
  html = html.replace(/\\([#$%&__{}])\b/g, '$1');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="text-white font-semibold">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-100">$1</em>');
  html = html.replace(/`(.*?)`/g, '<code class="bg-[#1e293b]/70 border border-slate-700/50 px-1.5 py-0.5 rounded text-xs font-mono text-[#10B981]">$1</code>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-[#10B981] underline hover:text-[#34d399]">$1</a>');
  return html;
};

interface ListBlockItem {
  text: string;
  indent: number;
}

type Block =
  | { type: 'header'; level: number; text: string }
  | { type: 'hr' }
  | { type: 'paragraph'; text: string }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'list'; items: ListBlockItem[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'codeblock'; language: string; code: string };

// Block line-grouping logic
export function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  // Skip YAML frontmatter if present at the start of the file
  if (i < lines.length && lines[i].trim() === '---') {
    i++;
    while (i < lines.length && lines[i].trim() !== '---') {
      i++;
    }
    if (i < lines.length && lines[i].trim() === '---') {
      i++;
    }
  }

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line === '') {
      i++;
      continue;
    }

    if (line === '---' || line === '***') {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '');
      blocks.push({ type: 'header', level, text });
      i++;
      continue;
    }

    // Handle code blocks (```)
    if (line.startsWith('```')) {
      const lang = line.replace(/^```/, '').trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```') && !lines[i].trim().startsWith('## Part ')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++; // skip closing ```
      }
      blocks.push({ type: 'codeblock', language: lang, code: codeLines.join('\n') });
      continue;
    }

    // Group consecutive blockquotes
    if (line.startsWith('>')) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        bqLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', lines: bqLines });
      continue;
    }

    // Group consecutive table rows
    if (line.startsWith('|')) {
      const tLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tLines.push(lines[i].trim());
        i++;
      }
      
      let headers: string[] = [];
      const rows: string[][] = [];
      
      for (let t = 0; t < tLines.length; t++) {
        const cells = tLines[t].split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const isSeparator = cells.every(c => /^:?-+:?$/.test(c));
        if (isSeparator) continue;

        if (headers.length === 0) {
          headers = cells;
        } else {
          rows.push(cells);
        }
      }
      
      if (headers.length > 0) {
        blocks.push({ type: 'table', headers, rows });
      }
      continue;
    }

    // Group consecutive list items
    const listMatch = rawLine.match(/^(\s*)([\*\-\+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const listItems: ListBlockItem[] = [];
      while (i < lines.length) {
        const itemMatch = lines[i].match(/^(\s*)([\*\-\+]|\d+\.)\s+(.*)$/);
        if (itemMatch) {
          listItems.push({
            indent: itemMatch[1].length,
            text: itemMatch[3]
          });
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'list', items: listItems });
      continue;
    }

    blocks.push({ type: 'paragraph', text: rawLine });
    i++;
  }

  return blocks;
}

// Chart Classification Utility
export type ChartType = 'val' | 'debt' | 'trend' | 'leaderboard' | 'segment' | null;

export function isAscendingChronological(headers: string[]): boolean {
  if (headers.length <= 1) return true;

  const parseSeq = (str: string): number => {
    const s = str.toUpperCase().trim();
    if (s.includes('TTM') || s.includes('LTM') || s.includes('CURRENT')) return 999999;
    const match4 = s.match(/\b(19\d{2}|20\d{2})\b/);
    if (match4) {
      let val = parseInt(match4[1], 10) * 10;
      if (s.includes('Q1')) val += 1;
      else if (s.includes('Q2')) val += 2;
      else if (s.includes('Q3')) val += 3;
      else if (s.includes('Q4')) val += 4;
      return val;
    }
    const match2 = s.match(/[FQ](\d)[-_]?(\d{2})/);
    if (match2) {
      return (2000 + parseInt(match2[2], 10)) * 10 + parseInt(match2[1], 10);
    }
    return 0;
  };

  const firstSeq = parseSeq(headers[0]);
  const lastSeq = parseSeq(headers[headers.length - 1]);

  if (firstSeq > 0 && lastSeq > 0) {
    return firstSeq <= lastSeq;
  }
  return true;
}

export function getTableChartType(headers: string[], rows: string[][]): ChartType {
  const headerStr = headers.join(' ').toLowerCase();
  
  // 1. Peer & Moat Leaderboard
  const isMoatLeaderboard = (
    headerStr.includes('moat dimension') ||
    headerStr.includes('moat verdict') ||
    headerStr.includes('competitive moat') ||
    (headerStr.includes('target anchor') && (headerStr.includes('standing') || headerStr.includes('peer') || headerStr.includes('median') || headerStr.includes('leader'))) ||
    (headerStr.includes('standing (rank)') && headerStr.includes('leader'))
  );
  if (isMoatLeaderboard) {
    return 'leaderboard';
  }

  // 2. Monitoring Dashboard (keep as table)
  if (headerStr.includes('thesis metric') || headerStr.includes('breaker') || headerStr.includes('status')) {
    return null;
  }
  
  // 3. Valuation Spectrum (Graham-Buffett-Greenwald Triad)
  if ((headerStr.includes('methodology') || headerStr.includes('valuation tier')) && (headerStr.includes('share') || headerStr.includes('value'))) {
    return 'val';
  }

  // 4. Revenue Segment & Geographic Distribution
  const isSegmentTable = (
    (headerStr.includes('segment') || headerStr.includes('division') || headerStr.includes('geographic') || headerStr.includes('product line')) &&
    (headerStr.includes('% of total') || headerStr.includes('share %') || headerStr.includes('% of net sales') || headerStr.includes('revenue share'))
  );
  if (isSegmentTable && rows.length >= 2 && rows.length <= 15) {
    return 'segment';
  }

  // 4. Debt Maturities
  if (headerStr.includes('instrument') || (headerStr.includes('maturity') && (headerStr.includes('interest') || headerStr.includes('amount') || headerStr.includes('rate')))) {
    return 'debt';
  }

  // Negative Guards: Explicitly exclude RORC / Retained Capital / Hurdle Rate tables
  const isRorcTable = (
    headerStr.includes('rorc') ||
    headerStr.includes('retained capital') ||
    headerStr.includes('hurdle rate') ||
    headerStr.includes('earnings power variance') ||
    (headerStr.includes('retained') && headerStr.includes('variance'))
  );
  if (isRorcTable) {
    return null;
  }

  // Negative Guards: Explicitly exclude CAGR / Growth Rate Calibration tables
  const isCagrCalibrationTable = (
    headerStr.includes('cagr') ||
    headerStr.includes('growth rate') ||
    headerStr.includes('longitudinal metric') ||
    headerStr.includes('synthesized') ||
    (headerStr.includes('base ($m)') && (headerStr.includes('wt') || headerStr.includes('weight') || headerStr.includes('cagr')))
  );
  if (isCagrCalibrationTable) {
    return null;
  }

  // Negative Guards: Explicitly exclude Double-Blind, Dual-Valuation, and Forensic OKR tables
  const isDoubleBlindOrOkrTable = (
    headerStr.includes('double-blind') ||
    headerStr.includes('dual-valuation') ||
    headerStr.includes('dual engine') ||
    headerStr.includes('quantitative okr') ||
    headerStr.includes('forensic vector') ||
    headerStr.includes('audit vector') ||
    headerStr.includes('bolsa 6.0') ||
    headerStr.includes('10-year cash multiple')
  );
  if (isDoubleBlindOrOkrTable) {
    return null;
  }

  // 5. Cash Flow & Owner Earnings Trend (Strict Temporal Validation)
  // A table is ONLY a trend chart if it has at least 3 data columns and >= 80% of data columns represent pure chronological periods
  const dataCols = headers.slice(1);
  if (
    dataCols.length >= 3 &&
    !headerStr.includes('audited value') &&
    !headerStr.includes('citation') &&
    !headerStr.includes('verification') &&
    !headerStr.includes('reconciliation') &&
    !headerStr.includes('off-balance-sheet')
  ) {
    const isPureTimeCol = (colHeader: string) => {
      const s = colHeader.toLowerCase().trim();
      if (/cagr|rorc|variance|hurdle|weight|base|multiple|ratio|margin|delta|verdict|finding/i.test(s)) {
        return false;
      }
      return /\b(19\d{2}|20\d{2})\b/.test(s) || s.includes('ttm') || s.includes('ltm') || /q[1-4]/.test(s) || /fy\d{2}/.test(s) || /^period\s*\d+/i.test(s);
    };

    const timeCols = dataCols.filter(isPureTimeCol);
    const timeRatio = timeCols.length / dataCols.length;

    // Must have at least 3 valid chronological periods and at least 80% temporal column density
    if (timeCols.length >= 3 && timeRatio >= 0.8) {
      // Must find distinct OCF and OE metric rows (not descriptive methodology rows)
      const ocfRowIdx = rows.findIndex(r => {
        const name = (r[0] || '').toLowerCase().replace(/[\*\_\#`]/g, '').trim();
        if (name.includes('margin') || name.includes('growth') || name.includes('ratio') || name.includes('retained')) return false;
        return name.includes('operating cash flow') || /^gaap\s+operating\s+cash/i.test(name) || /^\s*ocf\b/i.test(name);
      });

      const oeRowIdx = rows.findIndex(r => {
        const name = (r[0] || '').toLowerCase().replace(/[\*\_\#`]/g, '').trim();
        if (name.includes('margin') || name.includes('growth') || name.includes('yield') || name.includes('ratio')) return false;
        return name.includes('owner earnings') || name.includes('free cash flow');
      });

      if (ocfRowIdx !== -1 && oeRowIdx !== -1 && ocfRowIdx !== oeRowIdx) {
        return 'trend';
      }
    }
  }

  return null;
}

// 2. Debt Maturities List - Interactive horizontal progress gauges
function DebtMaturityChart({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const chartData = rows.map(r => {
    const type = (r[0] || '').replace(/[\*\_\#]/g, '').trim();
    const amount = parseNumericValue(r[1] || '');
    const date = (r[2] || 'TBD').trim();
    const rate = (r[3] || '0%').trim();
    return { name: `${type} (${date})`, amount, date, rate };
  }).filter(d => d.amount > 0);

  const maxVal = Math.max(...chartData.map(d => d.amount), 100);

  return (
    <div className="bg-[#0b0e14]/50 border border-slate-800/80 rounded-xl p-4 my-2.5 font-mono text-xs text-slate-400">
      <div className="space-y-3.5">
        {chartData.map((d, idx) => (
          <div key={idx} className="space-y-1 hover:bg-slate-900/10 p-1 rounded transition-all">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span className="font-sans font-semibold text-slate-200">{d.name}</span>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Yield: <span className="text-[#FF9100] font-semibold">{d.rate}</span></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded bg-slate-950/80 border border-slate-900 overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-[#10B981] rounded-r" 
                  style={{ width: `${(d.amount / maxVal) * 100}%` }}
                />
              </div>
              <span className="text-[#10B981] font-semibold tracking-wide w-16 text-right">${d.amount}M</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. OCF vs Owner Earnings Trend Visualizer - Polyline vector chart
function CashFlowTrendChart({ headers, rows }: { headers: string[]; rows: string[][] }) {
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

  const rawTimeHeaders = validColIndices.map(idx => headers[idx].replace(/[\*\_\s]/g, '').trim());
  let ocfRow: string[] = [];
  let oeRow: string[] = [];

  rows.forEach(r => {
    const rawName = (r[0] || '').toLowerCase().replace(/[\*\_\#`]/g, '').trim();
    if (rawName.includes('margin') || rawName.includes('growth') || rawName.includes('yield') || rawName.includes('ratio')) return;

    if (rawName.includes('operating cash flow') || /^gaap\s+operating\s+cash/i.test(rawName) || /^\s*ocf\b/i.test(rawName)) {
      if (ocfRow.length === 0) ocfRow = r;
    } else if (rawName.includes('owner earnings') || rawName.includes('free cash flow')) {
      if (rawName.includes('normalized owner earnings') || oeRow.length === 0) {
        oeRow = r;
      }
    }
  });

  if (ocfRow.length === 0) ocfRow = rows[0] || [];
  if (oeRow.length === 0) oeRow = rows[rows.length - 1] || [];

  const isAscending = isAscendingChronological(rawTimeHeaders);
  const labels = isAscending ? rawTimeHeaders : [...rawTimeHeaders].reverse();
  const rawOcf = validColIndices.map(colIdx => parseNumericValue(ocfRow[colIdx] || '0'));
  const rawOe = validColIndices.map(colIdx => parseNumericValue(oeRow[colIdx] || '0'));

  const ocfVals = isAscending ? rawOcf : [...rawOcf].reverse();
  const oeVals = isAscending ? rawOe : [...rawOe].reverse();

  const max = Math.max(...ocfVals, ...oeVals, 100);
  const min = Math.min(0, ...ocfVals, ...oeVals);
  const range = max - min;

  const w = 480;
  const h = 140;
  const padLeft = 36;
  const padRight = 36;
  const padTop = 20;
  const padBottom = 28;

  const denom = (labels.length - 1) > 0 ? (labels.length - 1) : 1;
  const safeRange = range > 0 ? range : 1;

  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  const pointsOCF = ocfVals.map((v, i) => `${padLeft + (i * chartW / denom)},${h - padBottom - ((v - min) / safeRange * chartH)}`).join(' ');
  const pointsOE = oeVals.map((v, i) => `${padLeft + (i * chartW / denom)},${h - padBottom - ((v - min) / safeRange * chartH)}`).join(' ');

  return (
    <div className="bg-[#0b0e14]/50 border border-slate-800/80 rounded-xl p-4 my-2.5">
      <div className="h-36 w-full select-none">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
          {/* Grid reference vectors */}
          <line x1={padLeft} y1={h - padBottom} x2={w - padRight} y2={h - padBottom} stroke="#1f2937" strokeLinecap="round" />
          <line x1={padLeft} y1={padTop} x2={w - padRight} y2={padTop} stroke="#1f2937" strokeDasharray="3 3" />
          
          {/* Vectors */}
          <polyline points={pointsOCF} fill="none" stroke="#00B0FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={pointsOE} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots on data points */}
          {ocfVals.map((v, i) => {
            const cx = padLeft + (i * chartW / denom);
            const cy = h - padBottom - ((v - min) / safeRange * chartH);
            return <circle key={`ocf-${i}`} cx={cx} cy={cy} r="3.5" fill="#00B0FF" stroke="#0b0e14" strokeWidth="1.5" />;
          })}
          {oeVals.map((v, i) => {
            const cx = padLeft + (i * chartW / denom);
            const cy = h - padBottom - ((v - min) / safeRange * chartH);
            return <circle key={`oe-${i}`} cx={cx} cy={cy} r="3.5" fill="#10B981" stroke="#0b0e14" strokeWidth="1.5" />;
          })}

          {/* Labels & Anchors - Chronological Left to Right */}
          {labels.map((lbl, idx) => {
            const x = padLeft + (idx * chartW / denom);
            return (
              <text key={idx} x={x} y={h - 6} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">{lbl}</text>
            );
          })}
        </svg>
      </div>
      <div className="flex gap-6 mt-2 justify-center text-[11px] font-mono">
        <div className="flex items-center gap-2"><span className="w-3 h-1.5 bg-[#00B0FF] rounded-sm" /><span className="text-slate-300 font-medium">Operating Cash Flow (OCF)</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-1.5 bg-[#10B981] rounded-sm" /><span className="text-slate-300 font-medium">Owner Earnings (Buffett)</span></div>
      </div>
    </div>
  );
}

// 4. Revenue Segment & Geographic Mix Visualizer - Horizontal segmented breakdown bar
function SegmentMixChart({ headers, rows }: { headers: string[]; rows: string[][] }) {
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

  const segments: Array<{ name: string; share: number; valStr?: string }> = [];
  rows.forEach(r => {
    const rawName = (r[0] || '').replace(/[\*\_\#`]/g, '').trim();
    if (!rawName || rawName.toLowerCase().includes('total') || rawName.startsWith('—') || rawName.startsWith('–') || rawName.startsWith('-')) return;

    const rawValStr = r[pctColIdx] || '';
    const cellVal = rawValStr.includes('->') || rawValStr.includes('→') ? rawValStr.split(/->|→/).pop()! : rawValStr;
    let pctVal = pctColIdx !== -1 ? parseNumericValue(cellVal) : 0;
    let valStr = r[1] ? r[1].replace(/[\*\_\#`]/g, '').trim() : '';

    if (pctVal > 0) {
      segments.push({ name: rawName, share: pctVal, valStr });
    } else {
      const numVal = parseNumericValue(valStr);
      if (numVal > 0) {
        segments.push({ name: rawName, share: numVal, valStr });
      }
    }
  });

  if (segments.length === 0) return null;

  // Defensive partition against legacy un-split tables:
  let accumulatedShare = 0;
  const filteredSegments: Array<{ name: string; share: number; valStr?: string }> = [];
  for (const s of segments) {
    if (accumulatedShare >= 95 && (accumulatedShare + s.share) > 110) {
      break;
    }
    filteredSegments.push(s);
    accumulatedShare += s.share;
  }

  const total = filteredSegments.reduce((sum, s) => sum + s.share, 0);
  const colors = ['#10B981', '#00B0FF', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6'];

  return (
    <div className="bg-[#0b0e14]/50 border border-slate-800/80 rounded-xl p-4 my-2.5 font-mono text-xs">
      <div className="h-4 w-full flex rounded-lg overflow-hidden bg-slate-950 border border-slate-900 mb-4">
        {filteredSegments.map((s, idx) => {
          const widthPct = total > 0 ? (s.share / total) * 100 : 0;
          const color = colors[idx % colors.length];
          return (
            <div
              key={idx}
              style={{ width: `${widthPct}%`, backgroundColor: color }}
              title={`${s.name}: ${widthPct.toFixed(1)}%`}
              className="h-full transition-all duration-300 hover:opacity-90"
            />
          );
        })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
        {filteredSegments.map((s, idx) => {
          const widthPct = total > 0 ? (s.share / total) * 100 : 0;
          const color = colors[idx % colors.length];
          return (
            <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-slate-950/60 border border-slate-900">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
              <div className="flex justify-between items-center w-full min-w-0 pr-1">
                <span className="truncate text-slate-300 font-sans">{s.name}</span>
                <span className="text-[#10B981] font-bold ml-1.5 shrink-0">{widthPct.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 4. Valuation Spectrum Chart - Overlapping horizontal limits compared to Price
function ValuationSpectrumChart({ headers, rows, price }: { headers: string[]; rows: string[][]; price?: number }) {
  const displayRows = rows.map(r => ({
    name: (r[0] || '').replace(/[\*\_\#]/g, '').replace('Greenwald', '').trim().slice(0, 24),
    label: (r[1] || '').replace(/[\*\_\#]/g, '').trim(),
    value: parseNumericValue(r[1] || '')
  })).filter(d => d.value > 0);

  const currentPriceRaw = typeof window !== 'undefined' ? localStorage.getItem("invest_terminal_last_price") : null;
  const currentPrice = price ?? (currentPriceRaw ? parseFloat(currentPriceRaw) : Math.max(...displayRows.map(d => d.value)) * 0.8);
  const max = Math.max(...displayRows.map(d => d.value), currentPrice * 1.15);

  return (
    <div className="bg-[#0b0e14]/50 border border-slate-800/80 rounded-xl p-4 my-2.5 space-y-3.5">
      <div className="space-y-3">
        {displayRows.map((d, idx) => {
          const itemColor = d.name.toLowerCase().includes('asset') 
            ? '#64748b' 
            : d.name.toLowerCase().includes('power') || d.name.toLowerCase().includes('epv')
              ? '#00B0FF' 
              : d.name.toLowerCase().includes('adjusted') 
                ? '#D500F9' 
                : '#10B981';

          return (
            <div key={idx} className="space-y-1 text-slate-300">
              <div className="flex justify-between text-[11px]">
                <span className="font-sans font-semibold text-slate-200">{d.name}</span>
                <span className="font-mono text-slate-400 font-medium">${d.value.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded bg-slate-950 overflow-hidden border border-slate-900 relative">
                  <div className="h-full rounded-r transition-all duration-300" style={{ width: `${(d.value / max) * 100}%`, backgroundColor: itemColor }} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-[#FF5252] shadow-[0_0_4px_#FF5252]" style={{ left: `${(currentPrice / max) * 100}%` }} title={`Current price: $${currentPrice}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pt-2.5 border-t border-slate-900 flex items-center justify-between text-[9px] md:text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5"><span className="w-0.5 h-3.5 bg-[#FF5252]" /><span className="text-slate-400">Current Market Quote (${currentPrice.toFixed(2)})</span></div>
        <span className="text-[#10B981] bg-[#10B981]/5 px-2 py-0.5 rounded border border-[#10B981]/10">Green indicates margin buffer</span>
      </div>
    </div>
  );
}

// Standard table fallback component
const StandardTable = memo(function StandardTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm font-sans">
        <thead className="bg-[#101524]">
          <tr>
            {headers.map((head, idx) => (
              <th
                key={idx}
                className="px-4 py-2.5 text-left font-semibold text-[#10B981] bg-[#141b2e] border-b border-slate-850 text-xs md:text-sm"
                dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(head) }}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 bg-[#070b13]">
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-slate-900/40 transition-colors">
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-4 py-2 text-gray-300 font-normal border-r border-[#0f1524] last:border-0 text-xs md:text-sm"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cell) }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Parent dashboard container wrapping the tabular metrics
const InteractiveChartBlock = memo(function InteractiveChartBlock({ headers, rows, price }: { headers: string[]; rows: string[][]; price?: number }) {
  const chartType = getTableChartType(headers, rows);
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>(chartType ? 'chart' : 'table');

  if (!chartType || chartType === 'leaderboard') {
    return <StandardTable headers={headers} rows={rows} />;
  }

  return (
    <div className="my-5 bg-[#0e131f]/90 border border-slate-800/85 rounded-xl overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#131a2b] border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-white">
          <span className="uppercase font-mono tracking-wider text-[10px] md:text-xs">
            {chartType === 'segment' && (
              headers.join(' ').toLowerCase().includes('geographic') || 
              headers.join(' ').toLowerCase().includes('territory') || 
              headers.join(' ').toLowerCase().includes('region') || 
              headers.join(' ').toLowerCase().includes('country') 
                ? 'Revenue Mix: Geographic Distribution' 
                : 'Revenue Mix: Operating Business Segments'
            )}
            {chartType === 'debt' && 'Debt Repayment Ledger'}
            {chartType === 'trend' && 'Cash Flow & Owner Earnings Trend'}
            {chartType === 'val' && 'Intrinsic Value Spectrum'}
          </span>
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-slate-950/80 border border-slate-800/60 rounded-md">
          <button
            onClick={() => setActiveTab('chart')}
            type="button"
            className={`text-[9px] md:text-xs font-mono px-2.5 py-0.5 rounded cursor-pointer ${
              activeTab === 'chart' ? 'bg-[#10B981]/20 text-[#10B981] font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chart
          </button>
          <button
            onClick={() => setActiveTab('table')}
            type="button"
            className={`text-[9px] md:text-xs font-mono px-2.5 py-0.5 rounded cursor-pointer ${
              activeTab === 'table' ? 'bg-slate-800/40 text-slate-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Table
          </button>
        </div>
      </div>
      <div className="p-3 md:p-4">
        {activeTab === 'chart' ? (
          <div>
            {chartType === 'segment' && <SegmentMixChart headers={headers} rows={rows} />}
            {chartType === 'debt' && <DebtMaturityChart headers={headers} rows={rows} />}
            {chartType === 'trend' && <CashFlowTrendChart headers={headers} rows={rows} />}
            {chartType === 'val' && <ValuationSpectrumChart headers={headers} rows={rows} price={price} />}
          </div>
        ) : (
          <StandardTable headers={headers} rows={rows} />
        )}
      </div>
    </div>
  );
});

// Clean lists rendering
const RenderList = memo(function RenderList({ items }: { items: ListBlockItem[] }) {
  return (
    <ul className="list-none my-3 space-y-1.5 select-text">
      {items.map((item, idx) => {
        const isNested = item.indent > 0;
        return (
          <li 
            key={idx} 
            className={`flex items-start text-sm leading-relaxed ${isNested ? 'pl-6 text-slate-400 mt-0.5' : 'text-slate-200 mt-2'}`}
          >
            <span className={`inline-block mr-2 select-none shrink-0 ${isNested ? 'text-[#00B0FF] text-[8px] mt-1' : 'text-[#10B981] text-[10px] mt-1.5'}`}>
              {isNested ? '◦' : '•'}
            </span>
            <div 
              className="flex-1 min-w-0" 
              dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item.text) }} 
            />
          </li>
        );
      })}
    </ul>
  );
});

export const FlywheelViewer = memo(function FlywheelViewer({ steps, isLinear = false }: { steps: FlywheelStep[]; isLinear?: boolean }) {
  if (!steps || steps.length < 2) return null;

  const firstStage = steps[0];
  const terminalStage = steps[steps.length - 1];
  const accentText = isLinear ? 'text-amber-400' : 'text-[#10B981]';
  const accentBg = isLinear ? 'bg-amber-500/10' : 'bg-[#10B981]/10';
  const accentBorder = isLinear ? 'border-amber-500/25' : 'border-[#10B981]/25';

  return (
    <div className="my-5 bg-[#0e131f]/90 border border-slate-800/85 rounded-xl overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#131a2b] border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-white">
          <RotateCw className={`w-3.5 h-3.5 ${accentText}`} />
          <span className={`uppercase font-mono tracking-wider text-[10px] md:text-xs ${accentText}`}>
            {isLinear ? 'Linear Value Chain Architecture' : 'Business Compounding Flywheel'}
          </span>
        </div>
        <span className={`text-[9px] md:text-[10px] font-mono ${accentBg} ${accentText} border ${accentBorder} px-2 py-0.5 rounded-full font-medium`}>
          {isLinear ? 'Audited: Linear Operating Pipeline (No Organic Loop)' : 'Self-Reinforcing Operating Pipeline'}
        </span>
      </div>

      <div className="p-4 md:p-5 space-y-4">
        {/* Desktop & Tablet Conveyor Pipeline */}
        <div className="hidden md:flex flex-row items-stretch gap-2.5 overflow-x-auto pb-2">
          {steps.map((s, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === steps.length - 1;
            const stageNum = s.number < 10 ? `0${s.number}` : `${s.number}`;

            return (
              <React.Fragment key={idx}>
                <div 
                  className={`flex-1 min-w-[190px] bg-[#0b0e14]/70 border rounded-xl p-3.5 flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    isLast 
                      ? (isLinear ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-400' : 'border-[#10B981]/50 bg-[#10B981]/5 hover:border-[#10B981]')
                      : isFirst 
                        ? 'border-slate-800 hover:border-[#10B981]/40 border-l-2 border-l-[#10B981]'
                        : 'border-slate-800 hover:border-[#10B981]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-mono text-[9.5px] font-bold ${accentText} ${accentBg} border ${accentBorder} px-2 py-0.5 rounded`}>
                        STAGE {stageNum}
                      </span>
                      {isLast && (
                        <span className={`text-[9px] font-mono ${accentText} font-semibold`}>
                          {isLinear ? 'Capital Allocation' : 'Terminal Hub'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-sans font-bold text-slate-100 mb-1.5 leading-snug">
                      {s.title}
                    </h4>
                    {s.description && (
                      <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div className={`flex items-center justify-center ${accentText} font-bold px-0.5 select-none opacity-80`} title={`Propels Stage ${steps[idx + 1].number}`}>
                    <span className="text-base">➔</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Vertical Connected Timeline */}
        <div className="md:hidden space-y-3 relative pl-4 border-l-2 border-[#10B981]/30 ml-2">
          {steps.map((s, idx) => {
            const isLast = idx === steps.length - 1;
            const stageNum = s.number < 10 ? `0${s.number}` : `${s.number}`;

            return (
              <div 
                key={idx}
                className={`bg-[#0b0e14]/80 border rounded-lg p-3 relative ${
                  isLast ? (isLinear ? 'border-amber-500/40 bg-amber-500/5' : 'border-[#10B981]/40 bg-[#10B981]/5') : 'border-slate-800'
                }`}
              >
                {/* Timeline node bullet */}
                <div className={`absolute -left-[23px] top-3.5 w-3 h-3 rounded-full ${isLinear ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-[#10B981] shadow-[0_0_6px_#10B981]'} border-2 border-[#0b0e14]`} />
                
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-mono text-[9px] font-bold ${accentText} ${accentBg} px-1.5 py-0.5 rounded border ${accentBorder}`}>
                    STAGE {stageNum}
                  </span>
                  {isLast && (
                    <span className={`text-[9px] font-mono ${accentText}`}>
                      {isLinear ? 'Capital Allocation' : 'Terminal Hub'}
                    </span>
                  )}
                </div>
                <h4 className="text-slate-100 text-xs font-semibold mb-1">
                  {s.title}
                </h4>
                {s.description && (
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {s.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* The Compounding Loopback or Linear Falsification Super-Banner */}
        {isLinear ? (
          <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <span>⚠️ AUDIT VERDICT: LINEAR VALUE CHAIN / DISCRETIONARY CAPITAL ALLOCATION</span>
            </div>
            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              <strong className="text-white">Empirical Moat Falsification:</strong> This business operates on a discrete project or cyclical transaction lifecycle. Operating cash flows at <span className="text-amber-400 font-medium">Stage 0{terminalStage.number} ({terminalStage.title})</span> do <strong className="text-white">NOT</strong> automatically loop back to re-accelerate Stage 01. Sustainable compounding depends on management&apos;s deliberate capital allocation across cycles.
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#10B981] uppercase tracking-wider">
              <RotateCw className="w-3.5 h-3.5 shrink-0 animate-spin-slow" />
              <span>The Compounding Return Loop</span>
            </div>
            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              <strong className="text-white">Continuous Moat Expansion:</strong> Scale advantages and operating cash flows generated at <span className="text-[#10B981] font-medium">Stage 0{terminalStage.number} ({terminalStage.title})</span> are systematically reinvested into unit-cost compression, fulfillment speed, and platform enhancements—injecting fresh compounding momentum directly back into <span className="text-[#10B981] font-medium">Stage 0{firstStage.number} ({firstStage.title})</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// Recursive blocks renderer
function RenderBlocks({ blocks, price }: { blocks: Block[]; price?: number }) {
  return (
    <>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'header': {
            const level = block.level;
            const text = block.text;
            const classes = 
              level === 1 ? 'text-xl md:text-2xl font-bold font-sans text-white mt-6 mb-3 tracking-tight' :
              level === 2 ? 'text-lg md:text-xl font-bold font-sans text-gray-100 mt-5 mb-2.5 border-b border-slate-800 pb-1.5' :
              level === 3 ? 'text-md md:text-lg font-semibold font-sans text-gray-200 mt-4 mb-2' :
              'text-sm md:text-base font-semibold font-sans text-[#10B981] mt-3 mb-1.5';
            
            return React.createElement(`h${Math.min(level, 6)}`, {
              key: idx,
              className: classes,
              dangerouslySetInnerHTML: { __html: parseInlineMarkdown(text) }
            });
          }
          case 'hr':
            return <hr key={idx} className="my-6 border-slate-800" />;
          case 'paragraph': {
            const flywheelSteps = parseFlywheelSteps(block.text);
            if (flywheelSteps.length >= 3) {
              const isLinear = /LINEAR\s+VALUE\s+CHAIN|NO\s+ORGANIC\s+FLYWHEEL|DISCRETIONARY\s+CAPITAL\s+ALLOCATION/i.test(block.text);
              return <FlywheelViewer key={idx} steps={flywheelSteps} isLinear={isLinear} />;
            }
            return (
              <p
                key={idx}
                className="text-gray-300 font-sans leading-relaxed my-2 text-sm md:text-base select-text"
                dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(block.text) }}
              />
            );
          }
          case 'blockquote': {
            const firstLine = block.lines[0] || '';
            const alertMatch = firstLine.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i);
            if (alertMatch) {
              const alertType = alertMatch[1].toUpperCase();
              const inlineTitle = alertMatch[2];
              const remainingLines = [inlineTitle, ...block.lines.slice(1)].filter(l => l.trim().length > 0);
              const subBlocks = parseBlocks(remainingLines);
              const isWarn = alertType === 'WARNING' || alertType === 'CAUTION';
              const isInfo = alertType === 'IMPORTANT';
              const borderColor = isWarn ? 'border-amber-500' : isInfo ? 'border-blue-500' : 'border-[#10B981]';
              const textColor = isWarn ? 'text-amber-400' : isInfo ? 'text-blue-400' : 'text-[#10B981]';
              const icon = isWarn ? '⚠️' : isInfo ? '⚡' : '📌';

              return (
                <div key={idx} className={`my-4 pl-4 border-l-4 ${borderColor} bg-slate-900/30 py-3 px-4 rounded-r border border-slate-800/40`}>
                  <div className={`flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider ${textColor} mb-1.5`}>
                    <span>{icon}</span> {alertType}
                  </div>
                  <RenderBlocks blocks={subBlocks} price={price} />
                </div>
              );
            }

            // Recursive blockquote parsing - fixes nesting and asterisks!
            const subBlocks = parseBlocks(block.lines);
            return (
              <blockquote key={idx} className="pl-4 border-l-4 border-[#10B981] my-4 text-slate-300 bg-slate-900/20 py-2.5 px-3.5 rounded-r border border-slate-800/30">
                <RenderBlocks blocks={subBlocks} price={price} />
              </blockquote>
            );
          }
          case 'list': {
            const listText = block.items.map(it => it.text).join('\n');
            if (
              (listText.toLowerCase().includes('flywheel') || listText.toLowerCase().includes('loopback') || listText.toLowerCase().includes('primary vector') || listText.toLowerCase().includes('linear value chain')) &&
              block.items.length >= 3
            ) {
              const flywheelSteps = parseFlywheelSteps(listText);
              if (flywheelSteps.length >= 3) {
                const isLinear = /LINEAR\s+VALUE\s+CHAIN|NO\s+ORGANIC\s+FLYWHEEL|DISCRETIONARY\s+CAPITAL\s+ALLOCATION/i.test(listText);
                return <FlywheelViewer key={idx} steps={flywheelSteps} isLinear={isLinear} />;
              }
            }
            return <div key={idx}><RenderList items={block.items} /></div>;
          }
          case 'table':
            return <div key={idx}><InteractiveChartBlock headers={block.headers} rows={block.rows} price={price} /></div>;
          case 'codeblock': {
            // Detect if code block contains a flywheel or linear value chain
            const flywheelSteps = parseFlywheelSteps(block.code);
            if (flywheelSteps.length >= 3) {
              const isLinear = /LINEAR\s+VALUE\s+CHAIN|NO\s+ORGANIC\s+FLYWHEEL|S4\s*-->\s*S5(?![\s\S]*==>)/i.test(block.code);
              return <FlywheelViewer key={idx} steps={flywheelSteps} isLinear={isLinear} />;
            }

            // Detect financial calculations, valuation formulas, and balance sheet schedules
            const isFinancial = /equation|schedule|breakdown|formula|margin of safety|intrinsic value|target buy price|owner earnings|reproduction cost|balance sheet|baseline extraction|claims|fcf|free cash flow|growth multiplier/i.test(block.code) ||
                                (block.code.includes('=') && (block.code.includes('$') || block.code.includes('%') || block.code.includes('*') || block.code.includes('/')));
            if (isFinancial) {
              const lines = block.code.trim().split('\n');
              const firstLine = lines[0].replace(/[:#]+$/, '').trim();
              const hasTitle = firstLine.length < 55 && !firstLine.includes('=') && !firstLine.startsWith('$');
              const badgeText = hasTitle ? firstLine : 'Financial Valuation Schedule';
              const content = hasTitle ? lines.slice(1).join('\n').trim() : block.code.trim();

              return (
                <div key={idx} className="my-4 rounded-xl bg-[#0b0e14]/70 border border-slate-800 border-l-4 border-l-[#10B981] p-4 font-mono text-xs overflow-x-auto shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                      {badgeText}
                    </span>
                  </div>
                  <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed"><code>{content}</code></pre>
                </div>
              );
            }

            return (
              <div key={idx} className="my-4 rounded-lg bg-[#0d1117] border border-slate-800/80 p-4 font-mono text-xs overflow-x-auto text-slate-300">
                <pre><code>{block.code}</code></pre>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </>
  );
}

const MarkdownView = memo(function MarkdownView({ content, price }: { content: string; price?: number }) {
  if (!content) return null;

  const blocks = useMemo(() => {
    const cleanedContent = cleanMarkdownForRendering(content);
    const lines = cleanedContent.split('\n');
    return parseBlocks(lines);
  }, [content]);

  return (
    <div className="space-y-1 font-sans selection:bg-[#10B981]/30 select-text">
      <RenderBlocks blocks={blocks} price={price} />
    </div>
  );
});

export default MarkdownView;

