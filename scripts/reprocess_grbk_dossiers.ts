import fs from 'fs';
import path from 'path';
import { cleanMarkdownForRendering } from '../src/components/MarkdownView.js';
import { convertMarkdownToHtml } from '../src/utils/googleDocs.js';

const DIST_DIR = path.resolve('dist/dossiers');
const VAULT_DIR = 'G:/My Drive/Company Data/GTD_Investing_Journal/GTD_Investment_Latticework_Organized/02 AI_Terminal';

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

let srcMdPath = path.join(VAULT_DIR, 'GRBK_Q2-26_Valuation_Dossier.md');
if (!fs.existsSync(srcMdPath)) {
  srcMdPath = path.join(DIST_DIR, 'GRBK_Q2-26_Valuation_Dossier.md');
}

if (!fs.existsSync(srcMdPath)) {
  console.error(`File not found in dist or vault: ${srcMdPath}`);
  process.exit(1);
}

console.log('Reading existing dossier from:', srcMdPath);
const rawMd = fs.readFileSync(srcMdPath, 'utf8');

const mdPath = path.join(DIST_DIR, 'GRBK_Q2-26_Valuation_Dossier.md');
const htmlPath = path.join(DIST_DIR, 'GRBK_Q2-26_Valuation_Dossier.html');

// 1. Separate existing frontmatter if any
let body = rawMd;
const fmMatch = rawMd.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
if (fmMatch) {
  body = rawMd.slice(fmMatch[0].length);
}

// 2. Clean the markdown body with our upgraded sanitizer
let cleanedBody = cleanMarkdownForRendering(body);

// 3. Clean up the Lollapalooza diagram specifically if still showing loose pipe lines
cleanedBody = cleanedBody.replace(/\|\s*THE LOLLAPALOOZA CONFLUENCE\s*\|\s*\r?\n(?:\|\s*.*?\s*\|\s*\r?\n)+/gi, (match) => {
  const lines = match.split('\n')
    .map(l => l.replace(/^\|\s*/, '').replace(/\s*\|$/, '').trim())
    .filter(Boolean);
  return `\n> [!NOTE] THE LOLLAPALOOZA CONFLUENCE\n> **${lines[1]}**\n> ➔ ${lines[3]}\n> ➔ ${lines[5]}\n\n`;
});

// Also clean any isolated single-column pipe lines with arrows
cleanedBody = cleanedBody.replace(/\|\s*▼\s*\|\r?\n/g, '');

// 4. Build correct YAML frontmatter
const frontmatter = `---
ticker: GRBK
company: "Green Brick Partners, Inc."
period: Q2-26
market_price: 68.79
intrinsic_value: 75.60
margin_of_safety: "9.01% (Deficient)"
decision: PASS
lynch_profile: "Fast Grower"
date: 2026-09-28
ai_model: gemini-3.8-flash
tags:
  - value-investing
  - valuation-dossier
---
`;

const finalMd = `${frontmatter}\n${cleanedBody.trim()}\n`;

// 5. Write Markdown dossier
fs.writeFileSync(mdPath, finalMd, 'utf8');
console.log(`Saved clean Markdown dossier to ${mdPath} (${(finalMd.length / 1024).toFixed(1)} KB)`);

// 6. Generate Standalone HTML
const docTitle = 'GRBK - Q2-26 Deep Valuation Dossier (gemini-3.8-flash)';
const htmlContent = convertMarkdownToHtml(finalMd, docTitle, 'GRBK');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log(`Saved clean HTML dossier to ${htmlPath} (${(htmlContent.length / 1024).toFixed(1)} KB)`);

// 7. Sync to Obsidian Vault if directory exists
if (fs.existsSync(VAULT_DIR)) {
  const vaultMdPath = path.join(VAULT_DIR, 'GRBK_Q2-26_Valuation_Dossier.md');
  const vaultHtmlPath = path.join(VAULT_DIR, 'GRBK_Q2-26_Valuation_Dossier.html');
  fs.writeFileSync(vaultMdPath, finalMd, 'utf8');
  fs.writeFileSync(vaultHtmlPath, htmlContent, 'utf8');
  console.log(`Successfully synced both dossiers to Obsidian Vault at: ${VAULT_DIR}`);
} else {
  console.warn(`Obsidian Vault directory not found at: ${VAULT_DIR}`);
}
