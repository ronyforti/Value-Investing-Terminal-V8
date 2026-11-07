import fs from 'fs';
import path from 'path';
import { cleanMarkdownForRendering } from '../src/utils/dossierFormatGuard.js';
import { convertMarkdownToHtml } from '../src/utils/googleDocs.js';

const TERMINAL_OUTPUT_DIR = 'G:/My Drive/Company Data/GTD_Investing_Journal/GTD_Investment_Latticework_Organized/02 AI_Terminal';
const DIST_DIR = path.resolve('dist/dossiers');

const mdFileName = 'CALM Q1-27_Complete Doc_gemini-4-argon_10-19-26.md';
const htmlFileName = 'CALM Q1-27_Valuation_Dossier_gemini-4-argon_10-19-26.html';

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

let srcMdPath = path.join(TERMINAL_OUTPUT_DIR, mdFileName);
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
let frontmatter = '';
if (rawMd.startsWith('---')) {
  const endFmIdx = rawMd.indexOf('---', 3);
  if (endFmIdx !== -1) {
    frontmatter = rawMd.slice(0, endFmIdx + 3);
    rawMd = rawMd.slice(endFmIdx + 3).replace(/^\r?\n/, '');
  }
}

// Clean frontmatter double %% if present
if (frontmatter.includes('5.78%%')) {
  frontmatter = frontmatter.replace('5.78%%', '5.78%');
}

// Run format guard cleanMarkdownForRendering on the body
console.log('Running cleanMarkdownForRendering...');
const cleanedBody = cleanMarkdownForRendering(rawMd);
const fullMd = frontmatter ? `${frontmatter}\n${cleanedBody}` : cleanedBody;

console.log('Generating Standalone HTML Dossier...');
const docTitle = `CALM - Q1-27 Deep Valuation Dossier (gemini-4-argon)`;
const htmlContent = convertMarkdownToHtml(fullMd, docTitle, 'CALM');

// Write local dist files
const distMdPath = path.join(DIST_DIR, mdFileName);
const distHtmlPath = path.join(DIST_DIR, htmlFileName);
fs.writeFileSync(distMdPath, fullMd, 'utf-8');
fs.writeFileSync(distHtmlPath, htmlContent, 'utf-8');

console.log(`Saved local Markdown: ${distMdPath} (${(fullMd.length / 1024).toFixed(1)} KB)`);
console.log(`Saved local HTML:     ${distHtmlPath} (${(htmlContent.length / 1024).toFixed(1)} KB)`);

// Sync to Google Drive directories
if (fs.existsSync(TERMINAL_OUTPUT_DIR)) {
  const termMdPath = path.join(TERMINAL_OUTPUT_DIR, mdFileName);
  const termHtmlPath = path.join(TERMINAL_OUTPUT_DIR, htmlFileName);
  fs.writeFileSync(termMdPath, fullMd, 'utf-8');
  fs.writeFileSync(termHtmlPath, htmlContent, 'utf-8');
  console.log(`Synced to Terminal Output Directory:\n  - ${termMdPath}\n  - ${termHtmlPath}`);
}


console.log('\nReprocessing completed successfully!');
