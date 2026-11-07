const fs = require('fs');
const path = require('path');

const mdPath = path.join('test_output', 'ADBE_Q3-26_Dossier.md');
const htmlPath = path.join('test_output', 'ADBE_Q3-26_Dossier.html');

const md = fs.readFileSync(mdPath, 'utf-8');
const html = fs.readFileSync(htmlPath, 'utf-8');

console.log('=== ADBE COMPREHENSIVE OUTPUT REVIEW ===');

// Check Frontmatter
const frontmatterMatch = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
console.log('\n--- 1. YAML FRONTMATTER ---');
if (frontmatterMatch) {
  console.log(frontmatterMatch[1]);
} else {
  console.log('NO YAML FRONTMATTER FOUND');
}

// Check Cockpit HTML
console.log('\n--- 2. HTML EXECUTIVE COCKPIT CARDS ---');
const heroBadge = html.match(/<div class="hero-decision-badge">([^<]+)<\/div>/i);
const heroSubtext = html.match(/<div class="hero-subtext">([^<]+)<\/div>/i);
if (heroBadge) console.log(`Decision Hero: ${heroBadge[1].trim()} (${heroSubtext ? heroSubtext[1].trim() : ''})`);

const statCols = html.match(/<div class="cockpit-stat-col">[\s\S]*?<\/div>/gi);
if (statCols) {
  statCols.forEach((col, idx) => {
    const label = col.match(/<span class="cockpit-stat-label">([^<]+)<\/span>/i);
    const val = col.match(/<span class="cockpit-stat-val[^>]*>([^<]+)<\/span>/i);
    if (label && val) {
      console.log(`Cockpit Metric ${idx + 1}: ${label[1].trim()} = ${val[1].trim()}`);
    }
  });
}

// Check Chapter Titles in Markdown
console.log('\n--- 3. STEP CHAPTER HEADINGS ---');
const h2s = md.match(/^##\s+[^\r\n]+/gm);
if (h2s) {
  h2s.forEach(h => console.log(' - ' + h));
}

// Check Table Counts and Quality
console.log('\n--- 4. TABLES SUMMARY ---');
const gfmTables = md.match(/\|[^\r\n]+\|\r?\n\|[\s:|-]+\|\r?\n(?:\|[^\r\n]+\|\r?\n?)+/g);
console.log(`Total GFM Pipe Tables found in Markdown: ${gfmTables ? gfmTables.length : 0}`);

// Check LaTeX
const latex = md.match(/(\$\$|\\begin\{|\\frac\{|\\text\{)/g);
console.log(`LaTeX Artifacts in MD: ${latex ? latex.length : 0} (Goal: 0)`);

// Check HTML LaTeX
const htmlLatex = html.match(/(\$\$|\\begin\{|\\frac\{)/g);
console.log(`LaTeX Artifacts in HTML: ${htmlLatex ? htmlLatex.length : 0} (Goal: 0)`);

// Check Disruption Analysis Grounding
console.log('\n--- 5. GROUNDING IN EXTRA SAAS DISRUPTION FILE ---');
const terms = ['Firefly', 'Canva', 'SaaSpocalypse', 'Leonardo.ai', 'Semrush', 'Topaz', 'GenStudio', 'Jevons', 'seat'];
terms.forEach(t => {
  const count = (md.match(new RegExp(t, 'gi')) || []).length;
  console.log(` - Term "${t}": ${count} mentions`);
});

// Check Verdict & Pricing
console.log('\n--- 6. VALUATION & VERDICT SUMMARY ---');
const verdictTable = md.match(/\|\s*Decision\s*Parameter\s*\|\s*Audited\s*Portfolio\s*Verdict\s*\|[\s\S]*?(?=\n\n|\n#|$)/i);
if (verdictTable) {
  console.log(verdictTable[0]);
}

// Check Step 12 Crosscheck Gates
console.log('\n--- 7. STEP 12 CROSSCHECK AUDIT GATES ---');
const gates = md.match(/Gate\s*[0-3][\s\S]*?(?=\n\s*Gate|\n\s*###|\n\s*##|$)/gi);
if (gates) {
  gates.forEach(g => {
    const firstLine = g.split('\n')[0].trim();
    console.log(' - ' + firstLine);
  });
}
