import fs from 'fs';
import path from 'path';
import { cleanMarkdownForRendering } from '../src/components/MarkdownView.js';
import { convertMarkdownToHtml } from '../src/utils/googleDocs.js';

const DIST_DIR = path.resolve('dist/dossiers');
const TERMINAL_OUTPUT_DIR = 'G:/My Drive/Company Data/GTD_Investing_Journal/GTD_Investment_Latticework_Organized/02 AI_Terminal';

const mdFileName = 'CALM Q1-27_Complete Doc_gemini-3.8-flash_10-04-26.md';
const htmlFileName = 'CALM_Q1-27_Valuation_Dossier_10-04-26.html';

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

let srcMdPath = path.join(DIST_DIR, mdFileName);
if (!fs.existsSync(srcMdPath)) {
  srcMdPath = path.join(TERMINAL_OUTPUT_DIR, mdFileName);
}

if (!fs.existsSync(srcMdPath)) {
  console.error(`Source markdown file not found: ${srcMdPath}`);
  process.exit(1);
}

console.log(`Reading source markdown from ${srcMdPath}...`);
let rawMd = fs.readFileSync(srcMdPath, 'utf-8');

// Strip old frontmatter if present
if (rawMd.startsWith('---')) {
  const endFmIdx = rawMd.indexOf('---', 3);
  if (endFmIdx !== -1) {
    rawMd = rawMd.slice(endFmIdx + 3).replace(/^\r?\n/, '');
  }
}

// Build authoritative frontmatter matching Part 11 and Part 8 findings
const frontmatter = [
  '---',
  'ticker: CALM',
  'company: "Cal-Maine Foods, Inc."',
  'period: Q1-27',
  'market_price: 66.67',
  'intrinsic_value: 68.60',
  'margin_of_safety: "+2.81%"',
  'decision: HOLD',
  'lynch_profile: "Cyclical Compounder"',
  'date: 2026-10-05',
  'ai_model: gemini-3.8-flash',
  'tags:',
  '  - value-investing',
  '  - valuation-dossier',
  '---'
].join('\n');

const cleanedBody = cleanMarkdownForRendering(rawMd);
const fullMd = `${frontmatter}\n${cleanedBody}`;

console.log('Generating Standalone HTML Dossier...');
const docTitle = `CALM - Q1-27 Deep Valuation Dossier (gemini-3.8-flash)`;
const htmlContent = convertMarkdownToHtml(fullMd, docTitle, 'CALM');

// Write local dist files
const distMdPath = path.join(DIST_DIR, mdFileName);
const distHtmlPath = path.join(DIST_DIR, htmlFileName);
fs.writeFileSync(distMdPath, fullMd, 'utf-8');
fs.writeFileSync(distHtmlPath, htmlContent, 'utf-8');

console.log(`Saved local Markdown: ${distMdPath} (${(fullMd.length / 1024).toFixed(1)} KB)`);
console.log(`Saved local HTML:     ${distHtmlPath} (${(htmlContent.length / 1024).toFixed(1)} KB)`);

// Sync to Google Drive directories if accessible
if (fs.existsSync(TERMINAL_OUTPUT_DIR)) {
  const termMdPath = path.join(TERMINAL_OUTPUT_DIR, mdFileName);
  const termHtmlPath = path.join(TERMINAL_OUTPUT_DIR, htmlFileName);
  fs.writeFileSync(termMdPath, fullMd, 'utf-8');
  fs.writeFileSync(termHtmlPath, htmlContent, 'utf-8');
  console.log(`Synced to Terminal Output Directory:\n  - ${termMdPath}\n  - ${termHtmlPath}`);
}


console.log('Reprocessing completed successfully!');
