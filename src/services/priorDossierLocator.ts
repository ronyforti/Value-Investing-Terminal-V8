import fs from "fs";
import path from "path";

export interface PriorDossierMeta {
  ticker: string;
  period?: string;
  intrinsicValue?: string;
  marginOfSafety?: string;
  decision?: string;
  marketPrice?: string;
  model?: string;
  date?: string;
}

export interface PriorDossierLookupResult {
  found: boolean;
  filePath?: string;
  fileName?: string;
  content?: string;
  source?: 'obsidian_dossiers' | 'obsidian_vault' | 'local_archive' | 'manual_upload';
  meta?: PriorDossierMeta;
}

/**
 * 4-Way Prior Dossier Ingestion Triad:
 * 1. OBSIDIAN_DOSSIERS_DIR (e.g. G:\My Drive\...\02 AI_Terminal\Dossiers)
 * 2. OBSIDIAN_VAULT_DIR (e.g. G:\My Drive\...\GTD_Investment_Latticework_Organized\{TICKER}.md)
 * 3. LOCAL_ARCHIVE_DIR (dist/dossiers/)
 * 4. Staged manual upload in state.files (handled in server.ts / documentGuard.ts)
 */
export function locatePriorDossier(ticker: string, extraDirs?: string[]): PriorDossierLookupResult {
  if (!ticker || !ticker.trim()) {
    return { found: false };
  }

  const cleanTicker = ticker.trim().toUpperCase();

  // Candidate search directories
  const candidateDirs: Array<{ dir: string; source: 'obsidian_dossiers' | 'obsidian_vault' | 'local_archive' }> = [];

  if (Array.isArray(extraDirs)) {
    for (const d of extraDirs) {
      if (d && fs.existsSync(d) && !candidateDirs.some(c => c.dir === d)) {
        candidateDirs.push({ dir: d, source: 'local_archive' });
      }
    }
  }

  const terminalDir = process.env.OBSIDIAN_TERMINAL_DIR ||
    (process.platform === 'win32'
      ? "G:\\My Drive\\Company Data\\GTD_Investing_Journal\\GTD_Investment_Latticework_Organized\\02 AI_Terminal"
      : "/home/antigravity/dossiers");
  if (fs.existsSync(terminalDir) && !candidateDirs.some(c => c.dir === terminalDir)) {
    candidateDirs.push({ dir: terminalDir, source: 'obsidian_dossiers' });
  }

  const dossiersDir = process.env.OBSIDIAN_DOSSIERS_DIR || 
    (process.platform === 'win32' 
      ? "G:\\My Drive\\Company Data\\GTD_Investing_Journal\\GTD_Investment_Latticework_Organized\\02 AI_Terminal\\Dossiers"
      : path.join(terminalDir, "Dossiers"));
  if (fs.existsSync(dossiersDir) && !candidateDirs.some(c => c.dir === dossiersDir)) {
    candidateDirs.push({ dir: dossiersDir, source: 'obsidian_dossiers' });
  }

  const vaultDir = process.env.OBSIDIAN_VAULT_DIR || 
    (process.platform === 'win32'
      ? "G:\\My Drive\\Company Data\\GTD_Investing_Journal\\GTD_Investment_Latticework_Organized"
      : "/home/antigravity/vault");
  if (fs.existsSync(vaultDir)) {
    candidateDirs.push({ dir: vaultDir, source: 'obsidian_vault' });
  }

  const localDistDir = path.resolve(process.cwd(), "dist", "dossiers");
  if (fs.existsSync(localDistDir)) {
    candidateDirs.push({ dir: localDistDir, source: 'local_archive' });
  }

  const stagingDir = path.resolve(process.cwd(), "staging");
  if (fs.existsSync(stagingDir)) {
    candidateDirs.push({ dir: stagingDir, source: 'local_archive' });
  }

  const matchedFiles: Array<{ filePath: string; fileName: string; mtime: number; source: 'obsidian_dossiers' | 'obsidian_vault' | 'local_archive' }> = [];

  for (const item of candidateDirs) {
    try {
      const files = fs.readdirSync(item.dir);
      for (const f of files) {
        if (!f.toLowerCase().endsWith(".md")) continue;
        const upper = f.toUpperCase();
        // Check if file starts with TICKER followed by space, underscore, or dot
        const startsWithTicker = upper.startsWith(`${cleanTicker} `) || 
                                 upper.startsWith(`${cleanTicker}_`) || 
                                 upper.startsWith(`${cleanTicker}-`) ||
                                 upper === `${cleanTicker}.MD`;
        if (startsWithTicker) {
          const fullPath = path.join(item.dir, f);
          const stat = fs.statSync(fullPath);
          matchedFiles.push({
            filePath: fullPath,
            fileName: f,
            mtime: stat.mtimeMs,
            source: item.source
          });
        }
      }
    } catch {
      // Ignore directory read errors
    }
  }

  if (matchedFiles.length === 0) {
    return { found: false };
  }

  // Sort by priority: Complete Doc > other md, then newest by mtime
  matchedFiles.sort((a, b) => {
    const aComplete = a.fileName.includes("_Complete Doc_") ? 1 : 0;
    const bComplete = b.fileName.includes("_Complete Doc_") ? 1 : 0;
    if (aComplete !== bComplete) return bComplete - aComplete;
    return b.mtime - a.mtime;
  });

  const bestMatch = matchedFiles[0];
  try {
    const content = fs.readFileSync(bestMatch.filePath, "utf-8");
    const meta = parsePriorDossierMeta(content, cleanTicker);
    return {
      found: true,
      filePath: bestMatch.filePath,
      fileName: bestMatch.fileName,
      content,
      source: bestMatch.source,
      meta
    };
  } catch (err: any) {
    console.warn(`[PriorDossierLocator] Could not read file ${bestMatch.filePath}:`, err.message);
    return { found: false };
  }
}

/**
 * Extracts YAML frontmatter and key verdict parameters from a prior dossier markdown.
 */
export function parsePriorDossierMeta(markdown: string, defaultTicker: string): PriorDossierMeta {
  const meta: PriorDossierMeta = {
    ticker: defaultTicker
  };

  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (frontmatterMatch) {
    const fmLines = frontmatterMatch[1].split("\n");
    for (const line of fmLines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim().toLowerCase();
      const val = line.slice(colonIdx + 1).replace(/^["'\s]+|["'\s]+$/g, "");

      if (key === "ticker") meta.ticker = val.toUpperCase();
      if (key === "period") meta.period = val;
      if (key === "intrinsic_value") meta.intrinsicValue = `$${val.replace(/^\$/, "")}`;
      if (key === "margin_of_safety") meta.marginOfSafety = val;
      if (key === "decision") meta.decision = val.toUpperCase();
      if (key === "market_price") meta.marketPrice = `$${val.replace(/^\$/, "")}`;
      if (key === "ai_model") meta.model = val;
      if (key === "date") meta.date = val;
    }
  }

  // Fallbacks if not present in frontmatter
  if (!meta.intrinsicValue) {
    const ivM = markdown.match(/(?:Synthesized Intrinsic Value|Expected DCF|Intrinsic Value)[^$\d]{0,30}\$([0-9,]+\.?[0-9]*)/i);
    if (ivM) meta.intrinsicValue = `$${ivM[1]}`;
  }
  if (!meta.decision) {
    const decM = markdown.match(/(?:Final Portfolio Action Directive|Audited Portfolio Verdict|Suggested Action)[^a-zA-Z\n]{1,40}\b(INVEST|PASS|ESCALATE|HOLD|ACCUMULATE|LIQUIDATE)\b/i);
    if (decM) meta.decision = decM[1].toUpperCase();
  }

  return meta;
}
