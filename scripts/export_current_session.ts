import fs from "fs";
import path from "path";

async function exportDossiers() {
  const modelName = "gemini-4-argon";
  const ticker = "CALM";
  const period = "Q1-27";

  console.log(`Fetching export for ${ticker} ${period} (${modelName})...`);
  const mdRes = await fetch(`http://localhost:3000/api/session/export?ticker=${ticker}&period=${period}&model=${modelName}`);
  const mdText = await mdRes.text();

  const htmlRes = await fetch(`http://localhost:3000/api/session/export-html?ticker=${ticker}&period=${period}&model=${modelName}`);
  const htmlText = await htmlRes.text();

  const formattedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
  const mdFilename = `${ticker} ${period}_Complete Doc_${modelName}_${formattedDate}.md`;
  const htmlFilename = `${ticker} ${period}_Valuation_Dossier_${modelName}_${formattedDate}.html`;

  const distDir = path.resolve("dist/dossiers");
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  const distMdPath = path.join(distDir, mdFilename);
  const distHtmlPath = path.join(distDir, htmlFilename);
  fs.writeFileSync(distMdPath, mdText, "utf-8");
  fs.writeFileSync(distHtmlPath, htmlText, "utf-8");
  console.log(`Saved local files:\n  - ${distMdPath} (${(mdText.length / 1024).toFixed(1)} KB)\n  - ${distHtmlPath} (${(htmlText.length / 1024).toFixed(1)} KB)`);

  const gDriveDir = "G:/My Drive/Company Data/GTD_Investing_Journal/GTD_Investment_Latticework_Organized/02 AI_Terminal";
  if (fs.existsSync(gDriveDir)) {
    const gDriveMdPath = path.join(gDriveDir, mdFilename);
    const gDriveHtmlPath = path.join(gDriveDir, htmlFilename);
    fs.writeFileSync(gDriveMdPath, mdText, "utf-8");
    fs.writeFileSync(gDriveHtmlPath, htmlText, "utf-8");
    console.log(`Synced to Vault Dossiers:\n  - ${gDriveMdPath}\n  - ${gDriveHtmlPath}`);
  }
}

exportDossiers().catch(err => {
  console.error("Export failed:", err);
  process.exit(1);
});
