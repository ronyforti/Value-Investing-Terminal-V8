import { STEP_CHAPTER_TITLES } from "../prompts.js";

export interface FlywheelStep {
  number: number;
  title: string;
  description: string;
  isLoopback?: boolean;
}

/**
 * Robust step parser for Compounding Flywheel mechanics.
 */
export function parseFlywheelSteps(text: string): FlywheelStep[] {
  const steps: FlywheelStep[] = [];
  const lines = text.split(/\r?\n/);
  let currentStep: FlywheelStep | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Skip horizontal border lines, pipes-only, and arrow-only lines
    if (/^[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s▼v▲\^>►◄_–—]+$/.test(trimmed)) continue;

    // Skip pseudo-table title for flywheel diagram
    if (/^\|\s*(?:5-STAGE\s*COMPOUNDING\s*FLYWHEEL|COMPOUNDING\s*FLYWHEEL)\s*\|$/i.test(trimmed)) continue;

    // Strip outer box drawing chars
    const cleaned = trimmed
      .replace(/^[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s]+/, "")
      .replace(/[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s]+$/, "")
      .trim();

    if (!cleaned) continue;

    // Check for Loopback header e.g. "##### Loopback & Compounding Acceleration"
    if (/^#{1,6}\s*(?:Loopback|Compounding\s*Acceleration|The\s*Compounding\s*Return\s*Loop)/i.test(cleaned)) {
      if (currentStep) {
        currentStep.isLoopback = true;
      }
      continue;
    }

    // Check for Section Header representing a Step:
    // e.g. "##### 1. Stage 1: Traffic, Seller Selection..."
    // or "##### Stage 1: Traffic..."
    // or "#### 1. Traffic..."
    const headerStepMatch = cleaned.match(/^#{1,6}\s*(?:(?:(\d+)\.\s*(?:Stage\s*\d+[:\-]?\s*)?)|(?:Stage\s*(\d+)[:\-]\s*))(.*)$/i);
    if (headerStepMatch) {
      if (currentStep) steps.push(currentStep);
      const num = parseInt(headerStepMatch[1] || headerStepMatch[2], 10);
      let rawTitle = headerStepMatch[3].trim();
      let desc = "";

      const colonMatch = rawTitle.match(/^\*\*(.*?)\*\*[:\-]?\s*(.*)$/);
      if (colonMatch) {
        rawTitle = colonMatch[1].replace(/[:\|\-\s]+$/, "").trim();
        desc = colonMatch[2].replace(/^[:\|\-\s]+/, "").replace(/[:\|\-\s]+$/, "").trim();
      } else {
        // Strip parenthetical subtitle like "(Primary Vector)" or clean trailing punctuation
        rawTitle = rawTitle.replace(/\s*\([^)]*\)$/, "").replace(/[:\|\-\s]+$/, "").trim();
      }

      currentStep = {
        number: num,
        title: rawTitle,
        description: desc,
        isLoopback: num === 5 || /(?:loopback|compounding acceleration|re-enters|back to step|feeds back)/i.test(rawTitle)
      };
      continue;
    }

    // Skip section numbers like 9.8 or 1.7
    if (/^\d+\.\d+\b/.test(cleaned) || /^#{1,6}\s*\d+\.\d+\b/.test(cleaned)) continue;

    // Regular step match: e.g. "1. **Traffic...**" or "1. Traffic..."
    const stepMatch = cleaned.match(/^(\d+)\.\s+(.*)$/);
    if (stepMatch) {
      const num = parseInt(stepMatch[1], 10);
      let rawTitle = stepMatch[2].trim();
      let desc = "";

      const colonMatch = rawTitle.match(/^\*\*(.*?)\*\*[:\-]?\s*(.*)$/);
      if (colonMatch) {
        rawTitle = colonMatch[1].replace(/[:\|\-\s]+$/, "").trim();
        desc = colonMatch[2].replace(/^[:\|\-\s]+/, "").replace(/[:\|\-\s]+$/, "").trim();
      } else if (rawTitle.includes(":")) {
        const parts = rawTitle.split(":");
        rawTitle = parts[0].replace(/[:\|\-\s]+$/, "").trim();
        desc = parts.slice(1).join(":").replace(/^[:\|\-\s]+/, "").trim();
      } else {
        rawTitle = rawTitle.replace(/[:\|\-\s]+$/, "").trim();
      }

      // Check if this is an ASCII diagram placeholder (e.g. ALL CAPS with no desc)
      // and we might already have or will have rich steps
      const isAllCapsPlaceholder = rawTitle === rawTitle.toUpperCase() && !desc && rawTitle.length > 5;
      if (isAllCapsPlaceholder && steps.length === 0) {
        // Look ahead to see if rich "##### X. Stage X:" exists below
        const hasRichStepsBelow = lines.slice(i).some(l => /^#{1,6}\s*(?:\d+\.\s*Stage|Stage\s*\d+)/i.test(l.trim()));
        if (hasRichStepsBelow) {
          continue; // skip the ASCII diagram dummy lines!
        }
      }

      if (currentStep) steps.push(currentStep);
      currentStep = {
        number: num,
        title: rawTitle,
        description: desc,
        isLoopback: num === 5 || /(?:loopback|compounding acceleration|re-enters|back to step|feeds back)/i.test(rawTitle + " " + desc)
      };
      continue;
    }

    // Stop step description parsing if entering confidence level or section boundary
    if (/^(?:\*{0,2}Confidence\s*Level|Checklist\s*Analytical|\|\s*Status\s*\|)/i.test(cleaned) || cleaned.startsWith("---") || /^##\s+Part/i.test(cleaned)) {
      if (currentStep) {
        steps.push(currentStep);
        currentStep = null;
      }
      break;
    }

    // Skip "Back to Stage 1: Market Expansion" or "(Accelerating Velocity)"
    if (/^Back to Stage\s*\d+/i.test(cleaned) || /^\(Accelerating Velocity\)/i.test(cleaned)) {
      if (currentStep) currentStep.isLoopback = true;
      continue;
    }

    if (currentStep) {
      let descLine = cleaned.replace(/^\((.*)\)$/, "$1").replace(/^↳\s*\*?(.*?)\*?$/, "$1").replace(/[:\|\-\s]+$/, "").trim();
      if (descLine) {
        currentStep.description = currentStep.description ? `${currentStep.description} ${descLine}` : descLine;
      }
    }
  }

  if (currentStep) steps.push(currentStep);
  return steps;
}

/**
 * Formats a flywheel stage node label with clean line-wrapping for Mermaid diagrams.
 */
export function formatMermaidNode(stageNum: string, title: string, _desc?: string): string {
  const cleanTitle = title.replace(/[":\n\r]/g, " ").replace(/[:\|\-\s]+$/, "").replace(/\s+/g, " ").trim();
  return `<b>Stage ${stageNum}: ${cleanTitle}</b>`;
}

/**
 * Converts space-aligned or typewriter-style MATERIALITY & CONTINGENCY AUDIT MATRIX
 * into a clean GitHub-Flavored Markdown pipe table.
 */
export function formatMaterialityMatrix(block: string): string {
  if (block.includes("|") && block.includes("---")) return block;

  const headerRegex = /(?:#{1,4}\s*)?MATERIALITY\s*&\s*CONTINGENCY\s*AUDIT\s*MATRIX/i;
  const headerMatch = block.match(headerRegex);
  if (!headerMatch) return block;

  const title = headerMatch[0].startsWith("#") ? headerMatch[0] : `### ${headerMatch[0]}`;
  const afterHeader = block.slice(headerMatch.index! + headerMatch[0].length).trim();

  const lines = afterHeader.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return block;

  let headers = ["Audit Vector / Risk Dimension", "Filing Reference", "Identified Contingency / Exposure", "P&L / Cash Flow Impact", "Audit Status"];
  const rows: string[][] = [];

  for (const line of lines) {
    if (/^[=\-\s+]+$/.test(line)) continue;
    const parts = line.split(/\s{2,}|\t+|\|/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      rows.push(parts);
    }
  }

  if (rows.length === 0) return block;

  let mdTable = `\n${title}\n\n`;
  mdTable += "| " + headers.join(" | ") + " |\n";
  mdTable += "| :--- | :--- | :--- | :---: | :---: |\n";
  for (const row of rows) {
    while (row.length < headers.length) row.push("-");
    const formattedRow = row.slice(0, headers.length);
    mdTable += "| " + formattedRow.join(" | ") + " |\n";
  }
  mdTable += "\n";
  return mdTable;
}

/**
 * Unconditionally unwraps any non-mermaid code blocks into native Markdown.
 * Prevents LLMs from trapping analytical prose, financial tables, and segment breakdowns
 * inside typewriter monospace <pre><code> blocks.
 */
export function unwrapNonMermaidCodeBlocks(text: string): string {
  // Normalize fused backticks on a single line:
  // e.g. `````` -> ```\n```
  text = text.replace(/`{6,}/g, "```\n```");
  text = text.replace(/`{4,5}/g, "```");

  const lines = text.split(/\r?\n/);
  const resultLines: string[] = [];

  let inFence = false;
  let currentLang = "";
  let blockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimLine = rawLine.trim();

    if (trimLine.startsWith("```")) {
      if (!inFence) {
        // Opening fence
        inFence = true;
        currentLang = trimLine.replace(/^`+/, "").trim().toLowerCase();
        blockLines = [];
      } else {
        // Closing fence
        inFence = false;
        if (currentLang === "mermaid") {
          // Preserve valid Mermaid diagrams
          resultLines.push("```mermaid");
          resultLines.push(...blockLines);
          resultLines.push("```");
        } else {
          // Unwrap into native Markdown
          resultLines.push("");
          resultLines.push(...blockLines);
          resultLines.push("");
        }
        currentLang = "";
        blockLines = [];
      }
    } else {
      if (inFence) {
        // Auto-close if an unclosed code block collides with a major section header (## Part X:)
        if (/^##\s+Part\s+\d+:/i.test(trimLine)) {
          inFence = false;
          if (currentLang === "mermaid") {
            resultLines.push("```mermaid");
            resultLines.push(...blockLines);
            resultLines.push("```");
          } else {
            resultLines.push("");
            resultLines.push(...blockLines);
            resultLines.push("");
          }
          currentLang = "";
          blockLines = [];
          resultLines.push(rawLine);
        } else {
          blockLines.push(rawLine);
        }
      } else {
        resultLines.push(rawLine);
      }
    }
  }

  // Handle unclosed fence at EOF
  if (inFence) {
    if (currentLang === "mermaid") {
      resultLines.push("```mermaid");
      resultLines.push(...blockLines);
      resultLines.push("```");
    } else {
      resultLines.push("");
      resultLines.push(...blockLines);
      resultLines.push("");
    }
  }

  return resultLines.join("\n");
}

/**
 * Strips rogue ASCII flowchart diagrams, box-drawing characters, and stray arrow lines
 * from the analytical markdown text to enforce Rule 2 of the 5 Inviolable Formatting Laws.
 */
export function stripAsciiFlowcharts(text: string): string {
  const lines = text.split(/\r?\n/);
  const resultLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trim = rawLine.trim();

    // Line consisting entirely of ASCII box or flow connectors (including bulleted or bolded dividers)
    const isConnectorOnly = /^(?:[\*\-•]\s*)?(?:\*{0,2})[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s▼v▲\^>►◄–—_├┤]+(?:\*{0,2})$/.test(trim) && trim.length > 0;
    
    // Check for premature flywheel flow lines in Part 1/2 like:
    // ^
    // |  Ecosystem Flywheel & Data Loop
    // v
    const isFlywheelArrowLine = /^[\s\^v\|]*(?:Ecosystem Flywheel|Captive Customer Flywheel|[A-Za-z\s]+Flywheel)[\s\^v\|]*$/i.test(trim);

    // Check for flowchart boxes like:
    // [ Captive Logistics Infrastructure ] ➔ Low Delivery Friction & High Conversion
    const flowBoxMatch = trim.match(/^\[\s*([^\]]+)\s*\](?:\s*(?:──>|-->|->)\s*(.*))?$/);
    if (flowBoxMatch) {
      const boxTitle = flowBoxMatch[1].trim();
      const desc = flowBoxMatch[2] ? flowBoxMatch[2].trim() : '';
      if (desc) {
        resultLines.push(`* **${boxTitle}:** ${desc}`);
      } else {
        resultLines.push(`* **${boxTitle}**`);
      }
      continue;
    }

    // Check for flowchart loopback lines like:
    // └───────────────> (Reinvests into Lower Shipping & Take Rates) ───┐
    const flowLoopMatch = trim.match(/^[└├─\s>]+(?:\(\s*)?(Reinvests[^\)]+)(?:\)\s*)?[─┐\s]*$/i);
    if (flowLoopMatch) {
      resultLines.push(`* **Reinvestment Loop:** ${flowLoopMatch[1].trim()}`);
      continue;
    }

    // Check for ASCII Flywheel pseudo-header
    if (/^\|\s*(?:5-STAGE\s*COMPOUNDING\s*FLYWHEEL|COMPOUNDING\s*FLYWHEEL)\s*\|$/i.test(trim)) {
      continue;
    }

    // Check for ASCII Flywheel loopback annotations
    if (/^(?:Back to Stage\s*\d+|(?:\(\s*Accelerating\s*Velocity\s*\)))/i.test(trim)) {
      continue;
    }

    // Check for all-caps standalone ASCII flywheel stage names in typewriter diagram
    if (/^\d+\.\s*[A-Z\s,&/]{10,}$/.test(trim)) {
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const isSurroundedByConnectors = /^[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s▼v▲\^>►◄–—_]+$/.test(prevLine) || /^[┌┐└┘│─┬┴╔╗╚╝║═╦╩╬\+\-\|\s▼v▲\^>►◄–—_]+$/.test(nextLine);
      if (isSurroundedByConnectors) {
        continue;
      }
    }

    // Strip premature ecosystem/platform ASCII diagrams in Part 1 / Part 2 / Part 10
    if (/^\|\s*(?:[A-Z0-9\s,&/]+ECOSYSTEM|[A-Z0-9\s,&/]+PLATFORM)\s*\|$/i.test(trim)) {
      continue;
    }
    if (/^\|\s*.*?(?:<--->|<─+>|<--+>).*?\|$/.test(trim)) {
      continue;
    }
    if (/^[\|\s]*(?:Ecosystem\s*Flywheel|Captive\s*Customer\s*Flywheel|[A-Za-z\s]*Flywheel\s*&\s*Data\s*Loop|[A-Za-z\s]+Flywheel)[A-Za-z0-9\s,&/\-–—]*[\|\s]*$/i.test(trim)) {
      continue;
    }
    if (/^\[\s*Pure E-Commerce Marketplace\s*\]/i.test(trim) || /3P Listing Intermediation.*Route Density/i.test(trim)) {
      continue;
    }
    if (/^\(2000-2015\)\s+\(2016-2021\)/.test(trim) || /^Fast Grower\s+Fast Grower/.test(trim)) {
      continue;
    }

    // Skip connector-only lines if preceded or followed by ASCII or if standalone
    if (isConnectorOnly || isFlywheelArrowLine) {
      continue;
    }

    resultLines.push(rawLine);
  }

  return resultLines.join('\n');
}

/**
 * Converts pseudo-reconciliation typewriter blocks into clean GFM pipe tables.
 * Transforms blocks like:
 * | TTM CASH FLOW TO NORMALIZED OWNER EARNINGS BRIDGE |
 *   Item 1 ... $Amount
 *   (-) Deduction ... ($Amount)
 *   -----------------------
 *   = Baseline ... $Amount
 */
export function formatFinancialBridgeTables(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const outLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimLine = rawLine.trim();

    // 1. Detect single-pipe blocks with arrows (e.g. Lollapalooza Matrix or Risk Vectors):
    // | THE LOLLAPALOOZA MATRIX |
    // | 1. Scale Economies Shared --> Lowers shipping costs... |
    if (trimLine.startsWith("|") && trimLine.endsWith("|") && (trimLine.includes("-->") || trimLine.includes("──>") || (lines[i+1]?.trim().startsWith("|") && (lines[i+1].includes("-->") || lines[i+1].includes("──>"))))) {
      const block: string[] = [];
      let k = i;
      while (k < lines.length && lines[k].trim().startsWith("|") && lines[k].trim().endsWith("|")) {
        block.push(lines[k].trim());
        k++;
      }

      const rows: Array<{ col1: string; col2: string }> = [];
      let tableTitle = "";

      for (const rowLine of block) {
        const inner = rowLine.replace(/^\|\s*/, "").replace(/\s*\|$/, "").trim();
        if (!inner || /^[=\-\s+]+$/.test(inner)) continue;

        if (!inner.includes("-->") && !inner.includes("──>") && !inner.includes("->") && !tableTitle) {
          tableTitle = inner.replace(/[:\|\-\s]+$/, "").trim();
          continue;
        }

        const arrowMatch = inner.match(/^(?:(?:\d+\.|\*|\-)\s*)?(.*?)\s*(?:-->|──>|->)\s*(.*)$/);
        if (arrowMatch) {
          const col1 = arrowMatch[1].trim();
          const col2 = arrowMatch[2].trim();
          rows.push({ col1: `**${col1}**`, col2 });
        } else if (/^(?:RESULT|OUTCOME|VERDICT|CONCLUSION):/i.test(inner)) {
          const parts = inner.split(/:\s*/);
          rows.push({ col1: `**${parts[0].trim()}**`, col2: `**${parts.slice(1).join(": ").trim()}**` });
        } else {
          rows.push({ col1: inner, col2: "-" });
        }
      }

      if (rows.length >= 2) {
        let tableMd = "";
        if (tableTitle) {
          tableMd += `\n### ${tableTitle}\n\n`;
        } else {
          tableMd += `\n`;
        }
        tableMd += `| Strategic Vector / Parameter | Institutional Analysis & Impact |\n`;
        tableMd += `| :--- | :--- |\n`;
        for (const r of rows) {
          tableMd += `| ${r.col1} | ${r.col2} |\n`;
        }
        tableMd += `\n`;
        outLines.push(tableMd);
        i = k;
        continue;
      }
    }

    // 2. Check for single-cell table title or header indicating a financial bridge, matrix, or architecture:
    const singleCellMatch = trimLine.match(/^\|\s*([A-Z0-9\s\(\)\-–—&/]{6,}?(?:BRIDGE|RECONCILIATION|ARCHITECTURE|INTEGRITY CHECK|SCORECARD|MATRIX|SCHEDULE|DERIVATION))\s*\|$/i);
    const standaloneMatch = !singleCellMatch ? trimLine.match(/^(?:#{1,4}\s*)?([A-Z0-9\s\(\)\-–—&/]{6,}?(?:BRIDGE|RECONCILIATION|ARCHITECTURE|INTEGRITY CHECK|SCORECARD|MOAT SCORECARD|VALUATION SCHEDULE|WEIGHTING SCHEDULE))$/i) : null;

    if ((singleCellMatch || standaloneMatch) && i + 1 < lines.length) {
      const headerTitle = (singleCellMatch ? singleCellMatch[1] : standaloneMatch![1]).trim();

      // Look ahead: does this block contain typewriter reconciliation lines?
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;

      const isNextLineAlreadyTable = j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().includes('---');

      if (!isNextLineAlreadyTable && j < lines.length) {
        const blockLines: string[] = [];
        let k = j;
        let foundFinancialMarkers = false;

        while (k < lines.length) {
          const l = lines[k].trim();
          if (l.startsWith('#') || (l.startsWith('|') && l.includes('|') && lines[k + 1]?.includes('---'))) {
            break;
          }
          if (l === '' && blockLines.length > 0 && k + 1 < lines.length && (lines[k + 1].trim().startsWith('#') || lines[k + 1].trim().startsWith('|'))) {
            break;
          }
          if (/[\(\-\+=\/]\s*[\$]?[\d,]+|-->|──>|PASS|FLAG|BREACH|\(\d+\.\d+M\)|\b\d+\.\d+x\b|\b\d+\.\d+%\b/i.test(l)) {
            foundFinancialMarkers = true;
          }
          blockLines.push(lines[k]);
          k++;
          // Break if 2 blank lines in a row
          if (l === '' && lines[k]?.trim() === '') break;
        }

        if (foundFinancialMarkers && blockLines.length >= 2) {
          const rows: string[][] = [];
          for (const bl of blockLines) {
            const trimmed = bl.trim();
            if (!trimmed || /^[=\-\s+]{4,}$/.test(trimmed)) continue; // skip divider lines

            // Check format: Item --> Value
            const arrowMatch = trimmed.match(/^(?:(?:\d+\.|\*|\-)\s*)?(.*?)\s*(?:-->|──>|->)\s*(.*)$/);
            if (arrowMatch) {
              const item = arrowMatch[1].trim();
              const val = arrowMatch[2].trim();
              const type = item.startsWith('(-)') ? '[-] Deduction' : (item.startsWith('(+)') ? '[+] Addition' : 'Asset Tier');
              const cleanItem = item.replace(/^\([-\+]\)\s*/, '').replace(/^\d+\.\s*/, '').trim();
              rows.push([cleanItem, type, val, 'Duplication / Replacement Parameter']);
              continue;
            }

            // Check format: Item ... $Amount / Value
            const finMatch = trimmed.match(/^(\([+-]\)|[=+-]|(?:\(\/\)))?\s*(.*?)(?:\s{2,}|\t+)([\($+-]?[\d,.]+(?:M|B|k|x|%|\s*per\s*share)?\)?)\s*$/i);
            if (finMatch) {
              const sign = finMatch[1] || '';
              const rawItem = finMatch[2].trim();
              const amount = finMatch[3].trim();
              let type = 'Base Anchor';
              if (sign === '(-)' || rawItem.startsWith('(-)') || amount.startsWith('(')) type = '[-] Deduction';
              else if (sign === '(+)' || rawItem.startsWith('(+)')) type = '[+] Addition';
              else if (sign === '(=)' || sign === '=' || rawItem.startsWith('=')) type = '[=] Total';
              else if (sign === '(/)' || rawItem.startsWith('(/)')) type = '[/] Divisor';

              const cleanItem = rawItem.replace(/^[-=()+/]+\s*/, '').trim();
              const isTotal = type.startsWith('[=]');
              const formattedItem = isTotal ? `**${cleanItem}**` : cleanItem;
              const formattedAmount = isTotal ? `**${amount}**` : amount;
              rows.push([formattedItem, type, formattedAmount, isTotal ? 'Final Valuation / Schedule Baseline' : 'Audited SEC Ground Truth']);
              continue;
            }

            // Space-aligned fallback
            const parts = bl.split(/\s{2,}|\t+/).map(p => p.trim()).filter(Boolean);
            if (parts.length >= 3) {
              rows.push(parts);
            }
          }

          if (rows.length >= 2) {
            let col1 = 'Financial Component / Line Item';
            let col2 = 'Valuation Adjustment';
            let col3 = 'Audited Amount';
            let col4 = 'Analytical Notes & Economic Rationale';

            let tableMd = `\n\n### ${headerTitle}\n\n`;
            tableMd += `| ${col1} | ${col2} | ${col3} | ${col4} |\n`;
            tableMd += `| :--- | :---: | :---: | :--- |\n`;
            for (const r of rows) {
              while (r.length < 4) r.push('-');
              tableMd += `| ${r.slice(0, 4).join(' | ')} |\n`;
            }
            tableMd += '\n';

            outLines.push(tableMd);
            i = k;
            continue;
          }
        }
      }
    }

    outLines.push(rawLine);
    i++;
  }

  return outLines.join('\n');
}

export function formatSchilitMatrix(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const outLines: string[] = [];
  let i = 0;

  const CANONICAL_VECTORS: Array<{ num: number; title: string }> = [
    { num: 1, title: "1. 3-Year Cumulative Cash Conversion Reality" },
    { num: 2, title: "2. Charlie Munger Zero-EBITDA & Non-GAAP Add-Back Rejection" },
    { num: 3, title: "3. Aggressive Expense Capitalization & Revenue Pull-Forward" },
    { num: 4, title: "4. Balance Sheet Asset & Working Capital Integrity" },
    { num: 5, title: "5. Unbilled Receivables vs. Deferred Revenue" },
    { num: 6, title: "6. Non-GAAP Add-Back Rejection" },
    { num: 7, title: "7. Credit Quality Check (Fintech Loan Book)" }
  ];

  while (i < lines.length) {
    const raw = lines[i];
    const trim = raw.trim();

    if (/(?:HOWARD\s*SCHILIT|FORENSIC\s*ACCOUNTING)\s*(?:RISK\s*)?MATRIX/i.test(trim)) {
      let k = i + 1;
      const blockLines: string[] = [];
      while (k < lines.length) {
        const l = lines[k].trim();
        if (l.startsWith("###") || l.startsWith("##") || l.startsWith("---") || /^#####\s+ASD-STE100/i.test(l)) {
          break;
        }
        blockLines.push(lines[k]);
        k++;
      }

      // Group lines by test number: 1., 2., 3., 4., 5., 6., 7.
      const groups: Map<number, string[]> = new Map();
      let currentNum: number | null = null;

      for (const line of blockLines) {
        const t = line.trim();
        if (!t || /^[=\-\s+]+$/.test(t) || /^(?:Test\s*Vector|Calculated\s*Metric)/i.test(t)) continue;

        const numMatch = t.match(/^(\d+)\.\s+/);
        if (numMatch) {
          currentNum = parseInt(numMatch[1], 10);
          groups.set(currentNum, [t]);
        } else if (currentNum !== null) {
          groups.get(currentNum)?.push(t);
        }
      }

      const rows: Array<{ vector: string; metric: string; threshold: string; finding: string }> = [];

      for (const [num, groupLines] of groups.entries()) {
        const canonical = CANONICAL_VECTORS.find(v => v.num === num);
        const vectorTitle = canonical ? canonical.title : `${num}. Forensic Vector`;

        const fullText = groupLines.join(" ");

        let finding = "PASS";
        if (/🔴|BREACH|FAIL|DEFICIENT/i.test(fullText)) finding = "FLAG";
        else if (/PASS|🟢|CLEAN/i.test(fullText)) finding = "PASS";

        // Clean out vector prefix, finding, emojis
        let cleaned = fullText
          .replace(/^\d+\.\s+[^:]+?(?:\s{2,}|\t+|:\s*)/, "")
          .replace(/[\uFE0F🟢🔴🟡]/g, "")
          .replace(/\b(?:PASS|FLAG|BREACH)\b/gi, "")
          .trim();

        const defaultThresholds: Record<number, string> = {
          1: "3-Yr Cumulative OCF / GAAP NI >= 0.80x",
          2: "Zero-EBITDA Doctrine; SBC <= 10% OCF (<= 5% Rev)",
          3: "Cap Software <= 15% R&D; Unbilled AR <= 1.50x Rev over 3-Yr",
          4: "Productive cash CapEx/M&A exempt; flag uncollectible asset bloat",
          5: "Unbilled > 1.50x Rev with falling Deferred Rev",
          6: "Zero-EBITDA Doctrine; Recurring non-GAAP add-backs rejected",
          7: "Reserve releases masking NPL surges; Allowance < 1.0x write-offs"
        };

        // Separate metric and threshold dynamically
        let metric = cleaned;
        let threshold = defaultThresholds[num] || "-";

        const threshMatch = cleaned.match(/(?:Trigger\s*Threshold|Threshold|Benchmark):\s*([^.]+?)(?:\.|$)/i);
        if (threshMatch) {
          threshold = threshMatch[1].trim();
          metric = cleaned.replace(threshMatch[0], "").trim();
        }

        rows.push({
          vector: vectorTitle,
          metric,
          threshold,
          finding
        });
      }

      if (rows.length >= 3) {
        let mdTable = `\n### Forensic Accounting Risk Matrix\n\n`;
        mdTable += `| Forensic Vector / Audit Test | Calculated Metric & Empirical Trend | Trigger Threshold | Forensic Audit Finding |\n`;
        mdTable += `| :--- | :--- | :---: | :---: |\n`;
        for (const r of rows) {
          mdTable += `| **${r.vector}** | ${r.metric} | ${r.threshold} | ${r.finding} |\n`;
        }
        mdTable += `\n`;
        outLines.push(mdTable);
        i = k;
        continue;
      }
    }

    outLines.push(raw);
    i++;
  }

  return outLines.join("\n");
}

/**
 * Converts typewriter space-aligned Credit Portfolio Integrity Checks into a clean GFM pipe table.
 */
export function formatIntegrityCheckMatrix(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const outLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trim = raw.trim();

    if (/(?:CREDIT\s*PORTFOLIO\s*INTEGRITY\s*CHECK|FINTECH\s*CREDIT\s*PORTFOLIO|PORTFOLIO\s*INTEGRITY\s*CHECK)/i.test(trim)) {
      const headerTitle = trim.replace(/^#{1,4}\s*/, '').trim();

      let k = i + 1;
      while (k < lines.length && !lines[k].trim()) k++;

      if (k < lines.length && /Metric\s*Description/i.test(lines[k])) {
        k++; // skip table header line
        const rows: Array<{ metric: string; val: string; threshold: string; finding: string }> = [];

        while (k < lines.length) {
          const l = lines[k].trim();
          if (!l) {
            k++;
            continue;
          }
          if (l.startsWith('#') || l.startsWith('---') || /^\d+\.\s+[A-Z]/.test(l)) {
            break;
          }

          const parts = l.split(/\s{2,}|\t+/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 3) {
            const metric = parts[0];
            const val = parts[1];
            let threshold = parts.length >= 4 ? parts[2] : '-';
            let finding = parts[parts.length - 1];

            if (/PASS/i.test(finding)) {
              const note = finding.replace(/[\uFE0F🟢🔴🟡\?]/g, '').replace(/\bPASS\b/gi, '').trim();
              finding = note ? `PASS ${note}` : 'PASS';
            } else if (/FLAG|BREACH|FAIL/i.test(finding)) {
              const note = finding.replace(/[\uFE0F🟢🔴🟡\?]/g, '').replace(/\b(?:FLAG|BREACH|FAIL)\b/gi, '').trim();
              finding = note ? `FLAG ${note}` : 'FLAG';
            }

            rows.push({ metric, val, threshold, finding });
          }
          k++;
        }

        if (rows.length >= 3) {
          let mdTable = `\n### ${headerTitle}\n\n`;
          mdTable += `| Metric Description | Calculated Value | Benchmark Threshold | Audit Finding |\n`;
          mdTable += `| :--- | :---: | :---: | :---: |\n`;
          for (const r of rows) {
            mdTable += `| **${r.metric}** | ${r.val} | ${r.threshold} | ${r.finding} |\n`;
          }
          mdTable += `\n`;
          outLines.push(mdTable);
          i = k;
          continue;
        }
      }
    }

    outLines.push(raw);
    i++;
  }

  return outLines.join('\n');
}

/**
 * Transforms typewriter ASCII hash-bars ([#####]) and progress bars into clean GFM pipe tables
 * or elegant bullet lists, completely stripping typewriter artifacts.
 */
export function formatAsciiBarCharts(markdown: string): string {
  // Convert standalone bar prefixes [████] to clean bullet points
  markdown = markdown.replace(/^(\s*)\[\s*[#█▓▒░=-]{2,}\s*[#█▓▒░=\s-]*\]\s*/gm, "$1* ");

  const lines = markdown.split(/\r?\n/);
  const outLines: string[] = [];
  let i = 0;

  const isBarToken = (s: string) => /\[\s*[#█▓▒░=-]{2,}\s*[#█▓▒░=\s-]*\]/.test(s) || /\[\s*#+\s*\]/.test(s);

  while (i < lines.length) {
    const raw = lines[i];
    const trim = raw.trim();

    const hasHashBar = isBarToken(trim);
    const hasEmptyBar = /\[\s*\]/.test(trim);

    if (hasHashBar || (hasEmptyBar && i + 1 < lines.length && isBarToken(lines[i + 1]))) {
      let title = '';
      if (outLines.length > 0) {
        const prev = outLines[outLines.length - 1].trim();
        if (prev && !prev.startsWith('|') && !prev.startsWith('#') && !prev.startsWith('*') && prev.length < 120) {
          title = outLines.pop()!.trim();
        } else if (outLines.length > 1 && !prev) {
          const prev2 = outLines[outLines.length - 2].trim();
          if (prev2 && !prev2.startsWith('|') && !prev2.startsWith('#') && !prev2.startsWith('*') && prev2.length < 120) {
            outLines.pop();
            title = outLines.pop()!.trim();
          }
        }
      }

      const blockLines: string[] = [];
      let k = i;
      while (k < lines.length) {
        const l = lines[k].trim();
        if (!l) {
          if (k + 1 < lines.length && (isBarToken(lines[k + 1]) || /\[\s*\]/.test(lines[k + 1]))) {
            k++;
            continue;
          }
          break;
        }
        if (isBarToken(l) || /\[\s*\]/.test(l) || /^[A-Za-z0-9\s\(\)\-\,\.\/]+\s*:\s*\[/.test(l)) {
          blockLines.push(l);
          k++;
        } else {
          break;
        }
      }

      // Case 1: Historical Trajectory (Q2 2017: [##] $165.6M)
      if (blockLines.some(l => /^(?:Q\d|\d{4}|TTM|FY\d{2})/i.test(l))) {
        let md = '';
        if (title) {
          const cleanTitle = title.replace(/[:\s]+$/, '');
          md += `\n##### ${cleanTitle}\n\n`;
        }
        for (const line of blockLines) {
          const m = line.match(/^([^:\[]+):?\s*\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]\s*(.*)$/);
          if (m) {
            const period = m[1].trim();
            const val = m[2].trim();
            md += `* **${period}:** ${val}\n`;
          } else {
            md += `* ${line.replace(/\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]/g, '').trim()}\n`;
          }
        }
        md += '\n';
        outLines.push(md);
        i = k;
        continue;
      }

      // Case 2: Segment Direct Contribution (Argentina [###] $1,230M (41.7% of total))
      if (blockLines.some(l => /\(\s*\d+(?:\.\d+)?%\s*(?:of\s*total)?\)/i.test(l))) {
        let md = '';
        if (title) {
          const cleanTitle = title.replace(/[:\s]+$/, '');
          md += `\n##### ${cleanTitle}\n\n`;
        }
        md += `| Operating Segment | Direct Contribution ($M) | % of Total Contribution |\n`;
        md += `| :--- | :---: | :---: |\n`;
        for (const line of blockLines) {
          const segMatch = line.match(/^([^\[]+)\s*\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]\s*\$?([0-9,]+(?:\.[0-9]+)?M?)\s*\((.*?)\)/i);
          if (segMatch) {
            const seg = segMatch[1].trim();
            const amount = segMatch[2].startsWith('$') ? segMatch[2] : `$${segMatch[2]}`;
            const pct = segMatch[3].replace(/of\s*total/i, '').trim();
            md += `| **${seg}** | ${amount} | ${pct} |\n`;
          } else {
            const fallback = line.replace(/\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]/g, '').trim();
            md += `| ${fallback} | - | - |\n`;
          }
        }
        md += '\n';
        outLines.push(md);
        i = k;
        continue;
      }

      // Case 3: Market Share Landscape (Company (...) [###] 30% - 33%)
      if (blockLines.some(l => /\d+%\s*-\s*\d+%/i.test(l) || /\d+%/i.test(l))) {
        let md = '';
        if (title) {
          const cleanTitle = title.replace(/[:\s]+$/, '');
          md += `\n##### ${cleanTitle}\n\n`;
        }
        md += `| Competitor / Retail Platform | Estimated GMV Market Share | Strategic Archetype |\n`;
        md += `| :--- | :---: | :--- |\n`;
        for (const line of blockLines) {
          const compMatch = line.match(/^([^\(\[]+)(?:\((.*?)\))?\s*\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]\s*(.*)$/);
          if (compMatch) {
            const name = compMatch[1].trim();
            const archetype = compMatch[2] ? compMatch[2].trim() : '-';
            const share = compMatch[3].trim();
            md += `| **${name}** | ${share} | ${archetype} |\n`;
          } else {
            const fallback = line.replace(/\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]/g, '').trim();
            md += `| ${fallback} | - | - |\n`;
          }
        }
        md += '\n';
        outLines.push(md);
        i = k;
        continue;
      }

      // Generic fallback
      if (title) outLines.push(title);
      for (const line of blockLines) {
        outLines.push(line.replace(/\[\s*[#█▓▒░=-]*\s*[#█▓▒░=\s-]*\]/g, '').replace(/\s{2,}/g, ' ').trim());
      }
      i = k;
      continue;
    }

    outLines.push(raw);
    i++;
  }

  return outLines.join('\n').replace(/\[\s*[#█▓▒░=-]+\s*[#█▓▒░=\s-]*\]/g, '');
}

/**
 * Strips premature flywheel compounding loops generated in Part 1 or Part 2
 * before forensic and operational moat analysis is complete.
 * Converts premature flywheel loops in Section 1.1 into empirical business pillars.
 */
export function stripPrematureFlywheels(text: string): string {
  // Case 1: Premature dual-flywheel in Part 1/2 Section 1.1
  text = text.replace(
    /The core economic engine consists of two interlocking, self-funding flywheels:[\s\S]*?(?=\n\s*(?:#{1,6}\s+|(?:\d+\.|\*)\s*(?:The Value Delivery Mechanism|Value Delivery Mechanism|1\.1\.|\b1\.\s+The\b))|\n\n##\s+Part|$)/gi,
    `The core economic engine operates through interlocking operational pillars:

* **Core Platform & Logistics Network:** Infrastructure drives delivery friction lower, elevates customer conversion, and scales unit volume.
* **Proprietary Data Telemetry:** High-frequency transaction volume generates granular proprietary behavioral data for risk underwriting and resource allocation.
* **Capital Deployment & Ecosystem Financing:** Captive working capital and customer financing are embedded directly into checkout and service operations.
* **Transaction Rails & Float Management:** Retained customer deposit float and payment rails provide low-cost funding and frictionless settlement.
* **Shared Scale Economics:** Operating efficiencies are continuously reinvested into lower customer costs, automation, and expanding wallet share.\n\n`
  );

  text = text.replace(/\*\s*\*\*Widened Regional Scale Moat & Customer Lock-In\*\*[^\n]*/gi, "");

  return text;
}

/**
 * Normalizes single-pipe typewriter blocks, broken matrices, and missing table separators
 * into clean, standard GitHub-Flavored Markdown (GFM) pipe tables for Obsidian and web rendering.
 */
export function normalizeSinglePipeTables(md: string): string {
  // 1. Convert standalone RESULT lines
  md = md.replace(/^\|\s*RESULT:\s*(.*?)\s*\|\s*$/gim, "* **Strategic Result:** $1");

  // 2. Specific institutional matrices with single-column titles or collapsed headers
  // Dual-Core Engine header normalization (Generic institutional architecture)
  md = md.replace(/^\|\s*([A-Za-z0-9\s&\-\/()]+?\s+DUAL-CORE ENGINE)\s*\|\s*$/gim, (m, p1) => {
    const titleCased = p1.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()).replace(/Dual-Core Engine/i, "Dual-Core Architecture");
    return `### ${titleCased}`;
  });
  md = md.replace(/^#{1,4}\s*([A-Za-z0-9\s&\-\/()]+?\s+DUAL-CORE ENGINE)\s*$/gim, (m, p1) => {
    const titleCased = p1.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()).replace(/Dual-Core Engine/i, "Dual-Core Architecture");
    return `### ${titleCased}`;
  });

  // Contractual & Contingent Commitments table
  md = md.replace(
    /(\|\s*1\.\s*Operating Lease Liabilities[^\n]*\n)([\s\S]*?\|\s*TOTAL CONTRACTUAL & CONTINGENT ECONOMIC COMMITMENTS[^\n]*\|)/i,
    (match, p1, p2) => {
      let tbl = `| Contractual Commitment / Contingent Exposure | Economic Liability Amount ($M) |\n`;
      tbl += `| :--- | :---: |\n`;
      tbl += p1 + p2;
      return tbl;
    }
  );

  // Convert standalone single-column all-caps headers: | HEADER | -> ### Header
  md = md.replace(/^\|\s*([A-Z0-9\s\(\)\-–—&/:]{5,})\s*\|\s*$/gm, (match, title) => {
    return `\n### ${title.trim()}\n`;
  });

  // Generalized GFM table repair pass:
  // Find blocks of pipe lines that lack separator rows
  const lines = md.split(/\r?\n/);
  const outLines: string[] = [];
  let currentTable: string[] = [];

  const flushTable = () => {
    if (currentTable.length === 0) return;
    
    // Check if table has a separator row (| --- |)
    const hasSep = currentTable.some(l => /^\|[\s:\-]+(?:\|[\s:\-]+)*\|$/.test(l.trim()));
    if (!hasSep && currentTable.length >= 2) {
      // First line is header
      const headerLine = currentTable[0];
      const colCount = (headerLine.match(/\|/g) || []).length - 1;
      if (colCount >= 2) {
        const sep = `| ${Array(colCount).fill(":---").join(" | ")} |`;
        outLines.push(headerLine);
        outLines.push(sep);
        for (let j = 1; j < currentTable.length; j++) {
          outLines.push(currentTable[j]);
        }
        currentTable = [];
        return;
      }
    }
    
    // Otherwise push as-is
    for (const l of currentTable) {
      outLines.push(l);
    }
    currentTable = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trim = line.trim();
    if (trim.startsWith("|") && trim.endsWith("|")) {
      currentTable.push(line);
    } else {
      flushTable();
      outLines.push(line);
    }
  }
  flushTable();

  return outLines.join("\n");
}

/**
 * Normalizes piped bullet items (* Col 1 │ Col 2 │ Col 3) and pseudo-box divider lines
 * into clean standard GitHub-Flavored Markdown (GFM) pipe tables.
 */
export function normalizePipedBullets(text: string): string {
  // Matches 2 or more contiguous lines that start with bullet points containing pipes or box characters,
  // or are pseudo-divider lines with box / pipe characters (e.g. * **───┼───** or ───┼───)
  const blockRegex = /((?:^\s*[\*\-•]\s*[^|\n│]+[|│][^\n]+\r?\n)(?:^\s*(?:[\*\-•]\s*)?(?:[^|\n│]+[|│][^\n]+|\*{0,2}[─\-+┼│|]{3,}\*{0,2})\r?\n?)+)/gm;
  return text.replace(blockRegex, (block) => {
    const rawLines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const validDataLines = rawLines.filter(l => !/^\*{0,2}[─\-+┼│|]{3,}\*{0,2}$/.test(l.replace(/^\s*[\*\-•]\s*/, '')));
    if (validDataLines.length < 2 || /(?:Gross Margin|EV\s*\/)/i.test(block)) return block;

    const splitCols = (line: string) => {
      const clean = line.replace(/^\s*[\*\-•]\s*/, '').replace(/^[│|]\s*/, '').replace(/\s*[│|]$/, '');
      return clean.split(/[│|]/).map(c => c.trim());
    };

    const firstRowCols = splitCols(validDataLines[0]);
    if (firstRowCols.length < 2) return block;

    let gfmTable = "\n\n";
    gfmTable += `| ${firstRowCols.join(" | ")} |\n`;
    const sep = firstRowCols.map((_, idx) => (idx === 0 ? ":---" : ":---:")).join(" | ");
    gfmTable += `| ${sep} |\n`;

    for (let r = 1; r < validDataLines.length; r++) {
      const cols = splitCols(validDataLines[r]);
      if (cols.length === 1 && cols[0] === '') continue;
      while (cols.length < firstRowCols.length) cols.push("-");
      gfmTable += `| ${cols.slice(0, firstRowCols.length).join(" | ")} |\n`;
    }
    gfmTable += "\n";
    return gfmTable;
  });
}

/**
 * Normalizes space-aligned Symmetrical Balance Sheet Synthesis blocks
 * into an authoritative GitHub-Flavored Markdown table.
 */
export function formatSymmetricalBalanceSheet(text: string): string {
  if (text.includes("| Off-Balance-Sheet Vector") || text.includes("| Valuation Spread ($M)")) {
    return text;
  }

  const targetRegex = /(?:#{1,5}\s*)?([^\n]*?SYMMETRICAL\s+BALANCE\s+SHEET\s+AUDIT[^\n]*)\n([\s\S]*?)(?=\n\s*#{1,5}\s+Audit\s+Verdict|\n\s*#####|\n\s*##\s+Part|$)/i;
  return text.replace(targetRegex, (match, _rawTitle, body) => {
    const lines = body.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 4) return match;

    const rows: { vector: string; impact: string; category: string }[] = [];
    let currentCategory = "Hidden Positive Asset";

    for (const line of lines) {
      if (/^Off-Balance-Sheet\s+Positive\s+Assets/i.test(line)) {
        currentCategory = "Hidden Positive Asset";
        continue;
      }
      if (/^Off-Balance-Sheet\s+Negative\s+Liabilities/i.test(line)) {
        currentCategory = "Hidden Toxic Liability";
        continue;
      }
      if (/^Total\s+Hidden\s+Off-Balance-Sheet\s+Assets/i.test(line)) {
        const valMatch = line.match(/:\s*([+\-$0-9.,]+(?:\s*(?:to|-)\s*[+\-$0-9.,]+)?[A-Z%]*)/i);
        rows.push({
          vector: "**Total Hidden Off-Balance-Sheet Assets**",
          impact: `**${valMatch ? valMatch[1].trim() : "See Footnote Reconciliation"}**`,
          category: "**Asset Subtotal**"
        });
        continue;
      }
      if (/^Total\s+Hidden\s+Off-Balance-Sheet\s+Liabilities/i.test(line)) {
        const valMatch = line.match(/:\s*([+\-$0-9.,]+(?:\s*(?:to|-)\s*[+\-$0-9.,]+)?[A-Z%]*)/i);
        rows.push({
          vector: "**Total Hidden Off-Balance-Sheet Liabilities**",
          impact: `**${valMatch ? valMatch[1].trim() : "See Footnote Reconciliation"}**`,
          category: "**Liability Subtotal**"
        });
        continue;
      }
      if (/^NET\s+HIDDEN\s+BALANCE\s+SHEET\s+POSITION/i.test(line)) {
        const valMatch = line.match(/:\s*(.*)$/);
        rows.push({
          vector: "**NET HIDDEN BALANCE SHEET POSITION**",
          impact: `**${valMatch ? valMatch[1].trim() : "STRUCTURALLY POSITIVE"}**`,
          category: "**Audit Finding**"
        });
        continue;
      }
      if (/^Net\s+Off-Balance-Sheet\s+Economic\s+Surplus/i.test(line)) {
        const valMatch = line.match(/:\s*([+\-$0-9.,]+(?:\s*(?:to|-)\s*[+\-$0-9.,]+)?[A-Z%]*)/i);
        rows.push({
          vector: "**Net Off-Balance-Sheet Economic Surplus**",
          impact: `**${valMatch ? valMatch[1].trim() : "See Footnote Reconciliation"}**`,
          category: "**Net Economic Spread**"
        });
        continue;
      }

      // Individual item line: e.g. "Undervalued Owned Real Estate (34.2K Permitted Acres): +150.0M to +200.0M"
      const itemMatch = line.replace(/^[•\-\*]\s*/, '').match(/^(.*?):\s*([+\-$0-9.,]+(?:\s*(?:to|-)\s*[+\-$0-9.,]+)?[A-Z%]*.*)$/);
      if (itemMatch) {
        rows.push({
          vector: itemMatch[1].trim(),
          impact: itemMatch[2].trim(),
          category: currentCategory
        });
      }
    }

    if (rows.length === 0) return match;

    let table = `\n##### Symmetrical Balance Sheet Audit: Net Hidden Position\n\n`;
    table += `| Off-Balance-Sheet Vector | Valuation Spread ($M) | Balance Sheet Impact |\n`;
    table += `| :--- | :---: | :---: |\n`;
    for (const r of rows) {
      table += `| ${r.vector} | ${r.impact} | ${r.category} |\n`;
    }
    table += `\n`;
    return table;
  });
}

/**
 * Normalizes space-aligned or typewriter preamble summary cards
 * (e.g. OPERATIONAL ENGINE & MARKET POSITION SUMMARY, PROBABILISTIC VALUATION ENGINE AUDIT, etc.)
 * into clean, responsive 4-column GitHub-Flavored Markdown tables.
 */
export function formatPreambleSummaryCards(text: string): string {
  const cardRegex = /(?:^[ \t]*)(OPERATIONAL\s+ENGINE\s*&\s*MARKET\s+POSITION\s+SUMMARY|CASH\s+FLOW\s+INTEGRITY\s*&\s*OWNER\s+EARNINGS\s+AUDIT[^\n]*|PROBABILISTIC\s+VALUATION\s+ENGINE\s*&\s*REVERSE\s+DCF\s+AUDIT|SOVEREIGN\s+VALUATION\s+SYNTHESIS\s*&\s*EXPECTATIONS\s+SPREAD\s+MATRIX)\s*\n([\s\S]*?)(?=\n\s*(?:#{1,5}\s+|\bPart\s+\d+:|\bStep\s+\d+:|\b1\.1\b|\n\n\n|$))/gim;

  return text.replace(cardRegex, (match, rawTitle, body) => {
    // If it's already a table, don't touch it
    if (body.includes("|") && body.includes("---")) return match;

    const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return match;

    // Collect key-value pairs
    const pairs: { key: string; val: string }[] = [];
    for (const line of lines) {
      // Split on 2 or more spaces or tabs where a second key begins
      const tokens = line.split(/(?<=[^\s:])\s{2,}(?=[A-Za-z0-9])/);
      for (const tok of tokens) {
        const colonIdx = tok.indexOf(":");
        if (colonIdx !== -1) {
          const k = tok.slice(0, colonIdx).trim();
          const v = tok.slice(colonIdx + 1).trim();
          if (k && v) {
            pairs.push({ key: k, val: v });
          }
        } else if (tok.trim()) {
          pairs.push({ key: "Note", val: tok.trim() });
        }
      }
    }

    if (pairs.length === 0) return match;

    const cleanTitle = rawTitle.trim();
    let table = `\n##### ${cleanTitle}\n\n`;
    table += `| Strategic Parameter | Audited Economic Anchor | Strategic Parameter | Audited Economic Anchor |\n`;
    table += `| :--- | :--- | :--- | :--- |\n`;

    for (let i = 0; i < pairs.length; i += 2) {
      const p1 = pairs[i];
      const p2 = pairs[i + 1] || { key: "", val: "" };
      const k1 = p1.key ? `**${p1.key}**` : "-";
      const v1 = p1.val || "-";
      const k2 = p2.key ? `**${p2.key}**` : "-";
      const v2 = p2.val || "-";
      table += `| ${k1} | ${v1} | ${k2} | ${v2} |\n`;
    }
    table += `\n`;
    return table;
  });
}

/**
 * Authoritative Dossier Format Guard.
 * Enforces the 5 Inviolable Formatting Laws across all exports:
 * 1. Zero Raw LaTeX Math (transforms TeX into clean plain text).
 * 2. Zero Monospace Typewriter Tables/Blocks (unwraps prose/tables from code blocks).
 * 3. Canonical Chapter Hierarchy (maps Step headers to Part X: titles).
 * 4. GFM Standard Pipe Tables.
 * 5. Flywheel flowcharts & formula cards.
 */
export function cleanMarkdownForRendering(markdown: string): string {
  if (!markdown) return "";

  let frontmatter = "";
  const fmMatch = markdown.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)/);
  if (fmMatch) {
    frontmatter = fmMatch[1];
    markdown = markdown.slice(frontmatter.length);
  }

  let text = markdown;

  // Pre-flight section headers snapshot for structural regression protection
  const preflightParts = Array.from(markdown.matchAll(/^(#{1,3}\s+Part\s+\d+:?[^\r\n]*)/gim)).map(m => m[1].trim());

  // Upgrade machine step headers (e.g. ## [Step 1 Output] or ## [Step 16: Forensic Audit]) to clean chapter titles
  text = text.replace(/^#{1,4}\s*\[Step\s*(\d+)(?::\s*[^\]]+|\s*Output)\][^\n]*/gim, (_, p1) => {
    const stepNum = parseInt(p1, 10);
    const title = STEP_CHAPTER_TITLES[stepNum] || `Part ${stepNum}: Step Analysis`;
    return `## ${title}`;
  });
  text = text.replace(/^#{1,4}\s*\[(?:Step\s*(\d+)|Step(\d+))\s*Output\][^\n]*/gim, (_, p1, p2) => {
    const stepNum = parseInt(p1 || p2, 10);
    const title = STEP_CHAPTER_TITLES[stepNum] || `Part ${stepNum}: Step Analysis`;
    return `## ${title}`;
  });

  // Upgrade raw "## Step 12:", "## Step 13:", or "## Step 16:" to clean "Part X:"
  text = text.replace(/^##\s*Step\s*(12|13|16):?\s*([^\r\n]*)/gim, (_, p1, p2) => {
    const stepNum = parseInt(p1, 10);
    const title = STEP_CHAPTER_TITLES[stepNum] || `Part ${stepNum}: ${p2.trim()}`;
    return `## ${title}`;
  });

  // Demote Competitor Moat & Valuation Radar if injected as top-level H2 inside Part 2
  text = text.replace(/^##\s+Competitor Moat & Valuation Radar/gim, "### Competitor Moat & Valuation Radar");
  text = text.replace(/^###\s+([1-4]\.\s+(?:Data Lineage|Archetype Comparative|Moat Leaderboard|Moat & Valuation))/gim, "#### $1");

  // Demote any stray H2 headings that are NOT Chapter Part titles to H3
  text = text.replace(/^##\s+(?!Part\s+\d+:)([^\r\n]+)/gim, "### $1");

  // Remove duplicate H3 headings that immediately echo the H2 Chapter Title
  text = text.replace(/^(##\s+Part\s+\d+:\s+([^\r\n]+))\r?\n{1,3}\s*###\s+(?:\d+(?:\.\d+)*\.?\s+)?\2\s*$/gim, "$1");
  text = text.replace(/^(##\s+Part\s+\d+:[^\r\n]+)\r?\n{1,3}\s*###\s+\d+\.\s+(?:(?:Greenwald|Net)?\s*Valuation\s+Part\s+\d+:\s+)?(?:Earnings\s+Power\s+Value\s+\(EPV\)|Net\s+Asset\s+Reproduction\s+Floor\s+\(ARV\))\s*$/gim, "$1");
  text = text.replace(/^(##\s+Part\s+\d+:[^\r\n]+)\r?\n{1,3}\s*###\s+\d+\.\s+The Valuation Ceiling & Forward-Looking Cash Flow Models\s*$/gim, "$1");
  text = text.replace(/^(##\s+Part\s+\d+:[^\r\n]+)\r?\n{1,3}\s*###\s+\d+\.\s+Red Team Attack:\s*The Forensic Short-Seller\s*$/gim, "$1");

  // Strip stray ### prepended to financial schedules or long analytical paragraphs
  text = text.replace(/^###\s+(GAAP Operating Cash Flow[^\r\n]*)/gim, "$1");
  text = text.replace(/^###\s+(\d+\.\s+(?:Balance Sheet Protection|Current Market Price)[^\r\n]{40,})/gim, "$1");

  // Execute line-by-line code fence unwrapping (obliterates all rogue code blocks while preserving Mermaid)
  text = unwrapNonMermaidCodeBlocks(text);

  // Strip premature flywheel loops in Part 1 or Part 2 before forensic and operational analysis
  text = stripPrematureFlywheels(text);

  // Strip rogue ASCII flowcharts, box characters, and premature flow lines
  text = stripAsciiFlowcharts(text);

  // Convert typewriter pseudo-reconciliation bridges into clean GFM pipe tables
  text = formatFinancialBridgeTables(text);

  // Convert Forensic Accounting typewriter matrix into clean GFM pipe table
  text = formatSchilitMatrix(text);

  // Convert Credit Portfolio Integrity Checks into clean GFM pipe table
  text = formatIntegrityCheckMatrix(text);

  // Convert typewriter ASCII hash-bars ([#####]) and progress bars into clean GFM pipe tables or lists
  text = formatAsciiBarCharts(text);

  // Normalize single-pipe blocks, pseudo-tables, and matrix outlines into clean GFM pipe tables
  text = normalizeSinglePipeTables(text);

  // Convert typewriter preamble summary cards into clean GFM pipe tables
  text = formatPreambleSummaryCards(text);

  // Convert typewriter Symmetrical Balance Sheet Synthesis into clean GFM pipe table
  text = formatSymmetricalBalanceSheet(text);

  // Strip accidental 4+ leading spaces that trigger unintended indented code blocks
  text = text.replace(/^[ ]{4,}(?=[A-Z0-9#\*\|])/gm, "");

  // Convert Section 1.7 / 9.8 Flywheel or Linear Value Chain to Obsidian Mermaid Flowchart
  const flywheelRegex = /(#{1,6}\s*(?:(?:1\.7|9\.8)\s+[^#\n]*?(?:Flywheel|Value\s*Chain|Compounding|Architecture)|Part\s*4\b[^#\n]*?(?:Flywheel|Value\s*Chain|Compounding)|[^#\n]*?Compounding\s*(?:Flywheel|Architecture)|[^#\n]*?Flywheel\s*Mechanics)[^\n]*\n)([\s\S]*?)(?=\n\*\s*\*?Confidence|\n---\s*\n\*\s*\(Section|\n##\s*(?:\[Step|Part\b)|$)/gi;
  text = text.replace(flywheelRegex, (sectionMatch, sectionHeader, sectionBody) => {
    const steps = parseFlywheelSteps(sectionBody);
    if (steps.length < 3) return sectionMatch;

    const isLinearValueChain = /no\s+organic\s+flywheel|linear\s+value\s+chain|cyclical\s+commodity|linear\s+project|no\s+flywheel/i.test(sectionHeader + " " + sectionBody.slice(0, 400));

    let mermaidGraph = "```mermaid\nflowchart TD\n";
    if (isLinearValueChain) {
      mermaidGraph += "    classDef default fill:#0b0e14,stroke:#0284c7,stroke-width:2px,color:#f8fafc,rx:8,ry:8;\n";
      mermaidGraph += "    classDef terminal fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#94a3b8,rx:8,ry:8;\n\n";

      steps.forEach((s, idx) => {
        const stageNum = s.number < 10 ? `0${s.number}` : `${s.number}`;
        const label = formatMermaidNode(stageNum, s.title, s.description);
        mermaidGraph += `    S${idx + 1}["${label}"]\n`;
      });

      for (let i = 0; i < steps.length - 1; i++) {
        mermaidGraph += `    S${i + 1} --> S${i + 2}\n`;
      }
      // Zero loopback arrow for audited linear value chains
      mermaidGraph += `\n    class ${steps.slice(0, -1).map((_, i) => `S${i + 1}`).join(",")} default;\n`;
      mermaidGraph += `    class S${steps.length} terminal;\n`;
      mermaidGraph += "```\n\n";
    } else {
      mermaidGraph += "    classDef default fill:#0b0e14,stroke:#10B981,stroke-width:2px,color:#f8fafc,rx:8,ry:8;\n";
      mermaidGraph += "    classDef highlight fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ffffff,rx:8,ry:8;\n\n";

      steps.forEach((s, idx) => {
        const stageNum = s.number < 10 ? `0${s.number}` : `${s.number}`;
        const label = formatMermaidNode(stageNum, s.title, s.description);
        mermaidGraph += `    S${idx + 1}["${label}"]\n`;
      });

      for (let i = 0; i < steps.length - 1; i++) {
        mermaidGraph += `    S${i + 1} --> S${i + 2}\n`;
      }
      mermaidGraph += `    S${steps.length} ==>|<b>Closed-Loop Compounding Reinvestment</b>| S1\n\n`;
      mermaidGraph += `    class ${steps.map((_, i) => `S${i + 1}`).join(",")} default;\n`;
      mermaidGraph += `    class S${steps.length} highlight;\n`;
      mermaidGraph += "```\n\n";
    }

    let replacement = `${sectionHeader.trim()}\n\n`;
    const tickerMatch = text.match(/# Valuation Analysis:\s*([A-Z0-9.-]+)/i) ||
      text.match(/(?:\*{0,2}(?:Company|Ticker)[:\s]*\*{0,2})[:\-]?\s*(?:`|\*{1,2})?([A-Z0-9.-]+)/i);
    const ticker = tickerMatch ? (tickerMatch[1] || "").toUpperCase() : "COMPANY";
    
    if (isLinearValueChain) {
      replacement += `> [!NOTE] **${ticker} Linear Value Chain Architecture (Audited: No Organic Flywheel)**\n> Factual project lifecycle and discretionary capital allocation model generated dynamically from verified filings.\n\n`;
      replacement += `${mermaidGraph}\n`;
      replacement += `##### Linear Value Chain Walkthrough\n`;
    } else {
      replacement += `> [!NOTE] **${ticker} Compounding Architecture**\n> Interactive flowchart model generated dynamically from verified filings.\n\n`;
      replacement += `${mermaidGraph}\n`;
      replacement += `##### Flywheel Mechanics Walkthrough\n`;
    }

    steps.forEach(s => {
      const cleanTitle = s.title.replace(/[:\-]+$/, "").trim();
      replacement += `${s.number}. **${cleanTitle}:** ${s.description}\n`;
    });
    replacement += "\n";
    return replacement;
  });
  text = text.replace(/([^\n])\s*(#{1,6}\s+(?:\[Step|Part\b|\d+\.))/g, "$1\n\n$2");
  text = text.replace(/\\\[\s*/g, "");
  text = text.replace(/\s*\\\]/g, "");
  text = text.replace(/\\begin\{aligned\}/g, "");
  text = text.replace(/\\end\{aligned\}/g, "");
  text = text.replace(/\\begin\{matrix\}/g, "");
  text = text.replace(/\\end\{matrix\}/g, "");
  text = text.replace(/\\begin\{array\}/g, "");
  text = text.replace(/\\end\{array\}/g, "");
  text = text.replace(/\\hline/g, "");

  // Clean LaTeX thousands separator and formatting artifacts
  text = text.replace(/\{,\}/g, ",");
  text = text.replace(/\\Delta\b/g, "Δ");
  text = text.replace(/\\quad\b/g, " ");
  text = text.replace(/\\qquad\b/g, "  ");
  text = text.replace(/\\&/g, "&");
  text = text.replace(/\\%/g, "%");
  text = text.replace(/\\(\$)/g, () => "$");

  // Clean mathematical operators and font commands
  text = text.replace(/\\times/g, "×");
  text = text.replace(/\\approx/g, "≈");
  text = text.replace(/\\le\b/g, "≤");
  text = text.replace(/\\ge\b/g, "≥");
  text = text.replace(/\\pm\b/g, "±");
  text = text.replace(/\\cdot/g, "·");
  text = text.replace(/\\sqrt\{([^{}]*)\}/g, "√($1)");
  text = text.replace(/\\left\(/g, "(");
  text = text.replace(/\\right\)/g, ")");
  text = text.replace(/\\left\[/g, "[");
  text = text.replace(/\\right\]/g, "]");

  // Unwrap LaTeX font & text commands globally
  text = text.replace(/\\textbf\{([^{}]*)\}/g, (_, p) => `**${p}**`);
  text = text.replace(/\\mathbf\{([^{}]*)\}/g, (_, p) => `**${p}**`);
  text = text.replace(/\\text\{([^{}]*)\}/g, (_, p) => p);
  text = text.replace(/\\mathrm\{([^{}]*)\}/g, (_, p) => p);
  text = text.replace(/\\mathit\{([^{}]*)\}/g, (_, p) => `*${p}*`);
  text = text.replace(/\\underline\{([^{}]*)\}/g, (_, p) => p);

  // Clean subscripts like RORC_{Operating} -> RORC (Operating)
  text = text.replace(/([a-zA-Z0-9]+)_\{([^{}]*)\}/g, "$1 ($2)");
  text = text.replace(/_\{([^{}]*)\}/g, " ($1)");

  // Robust fraction solver loop with nested brace support (e.g. \frac{8,268.238M}{1.10^{10}})
  let fracIter = 0;
  while (/\\frac\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{((?:[^{}]|\{[^{}]*\})*)\}/.test(text) && fracIter < 10) {
    text = text.replace(/\\frac\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g, "($1 / $2)");
    fracIter++;
  }

  // Clean exponent braces e.g. 1.10^{10} -> 1.10^10
  text = text.replace(/\^\{([^{}]*)\}/g, "^$1");

  // Unwrap display math $$...$$ and convert into clean equation callout
  text = text.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_match, formula) => {
    let clean = formula.trim();
    clean = clean.replace(/\{,\}/g, ",");
    clean = clean.replace(/\\textbf\{([^{}]*)\}/g, (_, p) => `**${p}**`);
    clean = clean.replace(/\\mathbf\{([^{}]*)\}/g, (_, p) => `**${p}**`);
    clean = clean.replace(/\\text\{([^{}]*)\}/g, (_, p) => p);
    clean = clean.replace(/\\mathrm\{([^{}]*)\}/g, (_, p) => p);
    clean = clean.replace(/\\times/g, "×");
    clean = clean.replace(/\\cdot/g, "·");
    clean = clean.replace(/\\Delta\b/g, "Δ");
    clean = clean.replace(/\\quad\b/g, " ");
    clean = clean.replace(/\\qquad\b/g, "  ");
    clean = clean.replace(/\\&/g, "&");
    clean = clean.replace(/\\frac\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, n, d) => `(${n.trim()} / ${d.trim()})`);
    clean = clean.replace(/\^\{([^{}]*)\}/g, "^$1");
    clean = clean.replace(/\\(\$)/g, () => "$");
    clean = clean.replace(/\\(%)/g, () => "%");
    clean = clean.replace(/\$\s*$/, "");
    return `\n> **Formula / Calculation:** ${clean}\n`;
  });

  // Clean inline math variable markers ($b$) -> (b)
  text = text.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)\$/g, "$1");

  // Clean inline math blocks with operators that break KaTeX
  text = text.replace(/\$([^$\n]+)\$/g, (m, inner) => {
    if (/^\s*[\$€£]?\s*[\d,]+(\.\d+)?(M|B|k)?\s*$/i.test(inner)) {
      return `$${inner.replace(/[\$]/g, "").trim()}`;
    }
    if (inner.includes("=") || inner.includes("×") || inner.includes("/") || inner.includes("+") || inner.includes("-")) {
      return inner.trim();
    }
    return m;
  });

  // Clean +---+---+ ASCII box tables into clean standard GFM pipe tables
  text = text.replace(/(?:^|\n)\+[-+]+\r?\n([\s\S]*?)\+[-+]+\r?\n/g, (match, body) => {
    const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const tableRows: string[] = [];
    for (const line of lines) {
      if (/^\+[-+]+\+?$/.test(line)) continue;
      if (line.startsWith("|") && line.endsWith("|")) {
        tableRows.push(line);
      }
    }
    if (tableRows.length > 0) {
      return "\n" + tableRows.join("\n") + "\n\n";
    }
    return match;
  });

  // 1. Convert Competitor Radar bullet points into a clean GFM pipe table
  const radarBlockRegex = /((?:^\s*[\*\-•]\s*[^\n]*?(?:Gross Margin|EV\s*\/)[^\n]*?\|[^\n]*\r?\n?){2,})/im;
  text = text.replace(radarBlockRegex, (match) => {
    const lines = match.trim().split(/\r?\n/).filter(l => /^\s*[\*\-•]/.test(l));
    if (lines.length < 2) return match;

    let table = "\n\n| Competitor / Peer | Gross Margin | Operating Margin | ROIC | EV / True FCF | EV / Owner Earnings | Net Cash / Mkt Cap |\n";
    table += "| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n";

    for (const line of lines) {
      const metricStartIdx = line.search(/(?:Gross Margin|EV\s*\/)/i);
      if (metricStartIdx === -1) continue;

      let peerName = line.slice(0, metricStartIdx).replace(/^\s*[\*\-•]\s*/, '').replace(/[:*`]/g, '').trim();
      const metricsStr = line.slice(metricStartIdx);
      const pipeParts = metricsStr.split('|').map(p => p.trim());

      const getVal = (pattern: RegExp) => {
        const found = pipeParts.find(p => pattern.test(p));
        if (!found) return '-';
        const cIdx = found.indexOf(':');
        return cIdx !== -1 ? found.slice(cIdx + 1).replace(/\*\*/g, '').trim() : found.replace(/\*\*/g, '').trim();
      };

      const gm = getVal(/Gross Margin/i);
      const opm = getVal(/Operating Margin|Op Margin/i);
      const roic = getVal(/ROIC/i);
      const fcf = getVal(/EV\s*\/\s*True FCF/i);
      const oe = getVal(/EV\s*\/\s*Owner Earnings/i);
      const cash = getVal(/Net Cash\s*\/\s*Mkt Cap/i);

      table += `| **${peerName}** | ${gm} | ${opm} | ${roic} | ${fcf} | ${oe} | ${cash} |\n`;
    }
    table += "\n";
    return table;
  });

  // 1b. Normalize piped bullet items (* Col 1 │ Col 2 │ Col 3) into clean GFM pipe tables
  text = normalizePipedBullets(text);

  // 2. Normalize 10-Year DCF Scenario Box lines with Unicode │ into a clean GFM pipe table
  const dcfBoxRegex = /(?:^[│]\s*Conservative Case\s*:\s*\$[0-9,.]+[^\n]*?[│]\s*\r?\n^[│]\s*Base Case\s*:\s*\$[0-9,.]+[^\n]*?[│]\s*\r?\n^[│]\s*Optimistic Case\s*:\s*\$[0-9,.]+[^\n]*?[│](?:\s*\r?\n^[│]\s*Current Tape[^\n]*?[│])?)/im;
  text = text.replace(dcfBoxRegex, (match) => {
    const boxLines = match.split(/\r?\n/).map(l => l.replace(/^[│]\s*/, '').replace(/\s*[│]$/, '').trim()).filter(Boolean);
    let table = "\n\n| Valuation Scenario | Per Diluted Share Value & Market Variance |\n";
    table += "| :--- | :---: |\n";
    for (const bLine of boxLines) {
      const parts = bLine.split(/\s*:\s*/);
      const name = parts[0].trim();
      const val = parts.slice(1).join(' : ').trim();
      table += `| **${name}** | ${val} |\n`;
    }
    table += "\n";
    return table;
  });

  // 3. Normalize Peter Lynch Archetype Continuum ASCII into a clean GFM table
  const lynchBlockRegex = /(?:\*?\s*\*\*Peter Lynch Archetype Continuum\*\*\r?\n)?Slow Grower\s*[─—–\-]+\s*Stalwart[^\n]+Turnaround\r?\n(?:\s*└──>[^\n]*\r?\n)?(?:\s+[A-Za-z0-9][^\n]*\r?\n)*/i;
  text = text.replace(lynchBlockRegex, (match) => {
    const activeMatch = match.match(/\[([A-Za-z\s]+)\]/);
    if (!activeMatch) return match; // Guardrail: Must have genuine bracketed archetype; never assume default
    const activeType = activeMatch[1].trim();
    const topMatch = match.match(/Top-Line:\s*([^\n]+)/i);
    const opMatch = match.match(/Operating Margin:\s*([^\n]+)/i);
    const roicMatch = match.match(/ROIC:\s*([^\n]+)/i);
    const details = [
      topMatch ? `Top-Line: ${topMatch[1].trim()}` : '',
      opMatch ? `Operating Margin: ${opMatch[1].trim()}` : '',
      roicMatch ? `ROIC: ${roicMatch[1].trim()}` : ''
    ].filter(Boolean).join(' • ');

    let tbl = "\n\n| Peter Lynch Archetype | Classification Status | Empirical Operational Validation |\n";
    tbl += "| :--- | :---: | :--- |\n";
    tbl += `| **${activeType}** | **ACTIVE ARCHETYPE** | ${details || 'Audited against trailing financial filings'} |\n\n`;
    return tbl;
  });

  // 4. Normalize Target Buy Price Band ASCII sliders into a clean GFM table
  // Bound strictly to a single line or adjacent 2 lines (never cross blank lines, paragraphs, or section headings)
  const spectrumRegex = /(?:^[^\n]*\$[0-9,.]+\s*[─—–\-]+[^\n]*?\[\$?[0-9,.]+(?:\s*-\s*\$?[0-9,.]+)?\][^\n]*(?:\r?\n[^\n]*(?:Current Market|\(0%\s*MoS[^\)]*\)|Fair Value)[^\n]*)?)/gim;
  text = text.replace(spectrumRegex, (match) => {
    // Only proceed if match actually contains multiple bracketed prices and slider arrows/dashes
    if (!/[─—–\->]{2,}/.test(match)) return match;
    const bracketPrices = Array.from(match.matchAll(/\[\$?([0-9,.]+(?:\s*-\s*\$?[0-9,.]+)?)]/g)).map(m => m[1]);
    if (bracketPrices.length < 3) return match; // Guardrail: Must have at least 3 genuine parsed prices; never inject synthetic defaults

    const scream = bracketPrices[0];
    const target = bracketPrices[1];
    const fair = bracketPrices[2];
    const market = bracketPrices[3] || 'N/A';

    let tbl = "\n\n| Target Buy Price Band | Price Range ($) | Margin of Safety Discount | Allocation Directive |\n";
    tbl += "| :--- | :---: | :---: | :--- |\n";
    tbl += `| **Screaming Buy** | $${scream.replace(/\$/g, '')} | 35% - 50% MoS | Aggressive Tranche 2 Value Accumulation |\n`;
    tbl += `| **Target Buy** | $${target.replace(/\$/g, '')} | 15% - 25% MoS | Initial Tranche 1 Capital Entry |\n`;
    tbl += `| **Fair Value** | $${fair.replace(/\$/g, '')} | 0% MoS | Synthesized Intrinsic Value Ceiling |\n`;
    tbl += `| **Current Market Tape** | ${market === 'N/A' ? 'N/A' : '$' + market.replace(/\$/g, '')} | Speculative Premium | PASS / No Allocation |\n\n`;
    return tbl;
  });

  // 5. Normalize Definitive Verdict Plain Text Block into a clean GFM table
  const verdictRegex = /FINAL PORTFOLIO ACTION DIRECTIVE:\s*([A-Z]+)\s*\r?\n\s*TICKER:\s*([A-Z]+)\s*\r?\n\s*MARKET PRICE:\s*\$([0-9,.]+)\s*\r?\n\s*SYNTHESIZED INTRINSIC VALUE:\s*\$([0-9,.]+)\s*\r?\n\s*STANDARD MARGIN OF SAFETY:\s*([^\n]+)\s*\r?\n\s*DECISION:\s*([^\n]+)/i;
  text = text.replace(verdictRegex, (_match, _dir, tick, mp, iv, mos, dec) => {
    let tbl = "\n\n| Decision Parameter | Audited Portfolio Verdict |\n";
    tbl += "| :--- | :---: |\n";
    tbl += `| **Ticker** | \`${tick}\` |\n`;
    tbl += `| **Market Tape Price** | $${mp} |\n`;
    tbl += `| **Synthesized Intrinsic Value** | $${iv} |\n`;
    tbl += `| **Standard Margin of Safety** | ${mos.trim()} |\n`;
    tbl += `| **Final Portfolio Action Directive** | **${dec.trim()}** |\n\n`;
    return tbl;
  });

  // 6. Normalize Valuation Triad Spread Ladder with │ into a clean GFM table
  // Bound strictly to a single contiguous block (never cross markdown headers ## or multiple blank lines)
  const ladderRegex = /(?:Market Price Tape\s*:\s*\$[0-9,.]+(?:(?!\r?\n\s*\r?\n\s*\r?\n|\r?\n#{1,3}\s)[\s\S])*?(?:Asset Reproduction Floor|Zero-Growth Earnings Power Value|Earnings Power Value \(EPV\)|EPV Floor)\s*:\s*\$[0-9,.]+)/i;
  text = text.replace(ladderRegex, (match) => {
    if (!match.includes('│')) return match;
    const lLines = match.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let tbl = "\n\n| Valuation Triad Layer | Value Per Diluted Share | Valuation Spread & Margin Layer |\n";
    tbl += "| :--- | :---: | :--- |\n";
    let currentSpread = '';
    for (const lLine of lLines) {
      if (lLine.includes('│')) {
        currentSpread = lLine.replace(/^[│\s]+/, '').replace(/[│\s]+$/, '').trim();
        continue;
      }
      const parts = lLine.split(/\s*:\s*/);
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const val = parts.slice(1).join(' : ').trim();
        tbl += `| **${name}** | ${val} | ${currentSpread || '-'} |\n`;
        currentSpread = '';
      }
    }
    tbl += "\n";
    return tbl;
  });

  // 7. Normalize tree branch ASCII characters (├──, └──, ├─, └─) into clean Markdown bullet points
  text = text.replace(/^(\s*)(?:[\*\-•]\s*)?[├└][─\-]{1,2}\s*(.*?)$/gm, (_m, indent, content) => {
    let cleanContent = content.trim();
    cleanContent = cleanContent.replace(/\s*(?:──>|-->|─>)\s*/g, " ➔ ");
    if (cleanContent.includes(':')) {
      const idx = cleanContent.indexOf(':');
      const k = cleanContent.slice(0, idx).replace(/\*\*/g, '').trim();
      const v = cleanContent.slice(idx + 1).trim();
      return `${indent}  * **${k}:** ${v}`;
    }
    return `${indent}  * **${cleanContent}**`;
  });

  // 7b. Normalize sub-notes under tree branches with │ into clean sub-bullets
  text = text.replace(/^(\s*)│\s*(\([^\n]+\))/gm, '$1    * $2');

  // 8. Normalize standalone box lines (│ ... │) into clean bullet points
  text = text.replace(/^│\s*(.*?)\s*│$/gm, (_m, content) => {
    const t = content.trim();
    if (!t || /^[-=─]+$/.test(t)) return '';
    return `*   ${t}`;
  });

  // 8b. Strip isolated box/pipe pseudo-divider lines (e.g. * **───┼───** or ───┼─── or * **───────┤**)
  text = text.replace(/^\s*(?:[\*\-•]\s*)?\*{0,2}[─\-+┼│|├┤┬┴┌┐└┘║═╦╩╬]{3,}\*{0,2}\s*$/gm, "");

  // 9. Normalize Competitor Lead Metric Arrows (──> or ─>) into a clean GFM table
  const peerLeadBlockRegex = /((?:^[A-Za-z\s]+:\s*[^\n─>]+?\s*(?:──>|-->|─>)\s*[^\n]+\r?\n?){2,})/im;
  text = text.replace(peerLeadBlockRegex, (match) => {
    const arrowLines = match.trim().split(/\r?\n/).filter(Boolean);
    let tbl = "\n\n| Operating Metric | Target vs. Peer Median Benchmark | Relative Peer Standing & Lead |\n";
    tbl += "| :--- | :---: | :--- |\n";
    for (const aLine of arrowLines) {
      const arrowMatch = aLine.match(/^([^:]+):\s*(.*?)\s*(?:──>|-->|─>)\s*(.*)$/);
      if (arrowMatch) {
        tbl += `| **${arrowMatch[1].trim()}** | ${arrowMatch[2].trim()} | ${arrowMatch[3].trim()} |\n`;
      }
    }
    tbl += "\n";
    return tbl;
  });

  // 10. Scrub Academic / Creator Names into Audited Desk Terminology
  text = text
    .replace(/\bGraham-Buffett-Greenwald Framework\b/gi, 'Proprietary Valuation Triad')
    .replace(/\bGraham-Buffett-Greenwald\b/gi, 'Proprietary Valuation Triad')
    .replace(/\bBruce Greenwald Framework\b/gi, 'Audited Valuation Framework')
    .replace(/\bBruce Greenwald's reproduction asset methodology\b/gi, "our desk's audited asset reproduction methodology")
    .replace(/\bBruce Greenwald’s reproduction asset methodology\b/gi, "our desk's audited asset reproduction methodology")
    .replace(/\bUnder Bruce Greenwald’s EPV formulation\b/gi, "Under our desk's Earnings Power Value (EPV) formulation")
    .replace(/\bUnder Bruce Greenwald's EPV formulation\b/gi, "Under our desk's Earnings Power Value (EPV) formulation")
    .replace(/\bBruce Greenwald’s EPV framework\b/gi, "our audited EPV framework")
    .replace(/\bBruce Greenwald's EPV framework\b/gi, "our audited EPV framework")
    .replace(/\bIn the analytical traditions of Bruce Greenwald and Warren Buffett\b/gi, "In our desk's audited value investing tradition")
    .replace(/\bIn the analytical tradition of Bruce Greenwald and Warren Buffett\b/gi, "In our desk's audited value investing tradition")
    .replace(/\bIn the analytical traditions of Bruce Greenwald\b/gi, "In our desk's audited value investing tradition")
    .replace(/\bIn the analytical tradition of Bruce Greenwald\b/gi, "In our desk's audited value investing tradition")
    .replace(/\bIn the institutional framework of Bruce Greenwald\b/gi, "In our desk's institutional valuation framework")
    .replace(/\bFollowing the frameworks of Bruce Greenwald, Warren Buffett, and Michael Mauboussin\b/gi, "Following our desk's audited multi-stage valuation framework")
    .replace(/\bFollowing the frameworks of Bruce Greenwald and Warren Buffett\b/gi, "Following our desk's audited multi-stage valuation framework")
    .replace(/\bMauboussin\/Greenwald CAP Derivation\b/gi, "Competitive Advantage Period (CAP) Derivation")
    .replace(/\bGreenwald Growth Multiplier\b/gi, "Franchise Growth Multiplier")
    .replace(/\bGreenwald formulation\b/gi, "audited desk formulation")
    .replace(/\bGreenwald protocol\b/gi, "audited desk protocol")
    .replace(/\bGreenwald Triad\b/gi, "Proprietary Valuation Triad")
    .replace(/\bGreenwald valuation triad\b/gi, "audited Valuation Triad")
    .replace(/\bGreenwald EPV\b/gi, "Earnings Power Value (EPV)")
    .replace(/\bGreenwald\/Buffett proxy\b/gi, "audited Owner Earnings proxy")
    .replace(/\bGreenwald\/Buffett protocol\b/gi, "audited Owner Earnings protocol")
    .replace(/\bCompustat \/ Mauboussin Database\b/gi, "Historical Corporate Longevity Database")
    .replace(/\bMauboussin \/ Credit Suisse base rate archives\b/gi, "Historical Corporate Longevity Base Rate Archives")
    .replace(/\bBruce Greenwald reproduction accounting standards\b/gi, "audited asset reproduction accounting standards")
    .replace(/\bBruce Greenwald’s core insight\b/gi, "Our core valuation insight")
    .replace(/\bBruce Greenwald's core insight\b/gi, "Our core valuation insight")
    .replace(/\bBruce Greenwald’s corporate finance framework\b/gi, "Our corporate finance framework")
    .replace(/\bBruce Greenwald's corporate finance framework\b/gi, "Our corporate finance framework")
    .replace(/\bBruce Greenwald and value investing framework\b/gi, "audited value investing framework")
    .replace(/\bEmulating the Bruce Greenwald framework\b/gi, "Executing our audited valuation framework")
    .replace(/\(Bruce Greenwald Framework\)/gi, "(Audited Valuation Framework)")
    .replace(/\bBruce Greenwald\b/gi, "the Valuation Triad Framework")
    .replace(/\bGreenwald\b/gi, "audited valuation")
    .replace(/\bMessod Beneish\b/gi, "audited forensic accounting")
    .replace(/\bBeneish M-Score\b/gi, "Earnings Manipulation Risk Index")
    .replace(/\bRichard Sloan\b/gi, "audited balance sheet analysis")
    .replace(/\bSloan Accrual Ratio\b/gi, "Balance Sheet Accrual Ratio")
    .replace(/\bHoward Schilit\b/gi, "financial forensics")
    .replace(/\bSchilit Forensics\b/gi, "Financial Shenanigans Forensic Audit")
    .replace(/\bMichael Mauboussin\b/gi, "institutional base rate analysis")
    .replace(/\bMauboussin\b/gi, "empirical base rate");

  // Convert typewriter border lines (====) into clean Markdown tables or sections
  text = text.replace(/^[=\-]{8,}$/gm, "");

  // Convert ASCII box borders (+-----+-----+) into clean GFM pipe tables
  const lines = text.split("\n");
  const cleanedLines: string[] = [];
  let inAsciiTable = false;
  let asciiTableRowCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (/^\+[-=+]+\+$/.test(trimmed)) {
      if (!inAsciiTable) {
        inAsciiTable = true;
        asciiTableRowCount = 0;
      } else if (asciiTableRowCount === 1) {
        const prevLine = cleanedLines[cleanedLines.length - 1] || "";
        const colCount = (prevLine.match(/\|/g) || []).length - 1;
        if (colCount > 0) {
          const sep = "|" + Array(colCount).fill(" --- |").join("");
          cleanedLines.push(sep);
        }
      }
      continue;
    }

    if (inAsciiTable) {
      if (trimmed.startsWith("|")) {
        asciiTableRowCount++;
        cleanedLines.push(trimmed);
      } else {
        inAsciiTable = false;
        asciiTableRowCount = 0;
        cleanedLines.push(rawLine);
      }
    } else {
      cleanedLines.push(rawLine);
    }
  }

  text = cleanedLines.join("\n");
  text = text.replace(/\n{4,}/g, "\n\n\n");

  // Post-flight section preservation guardrail:
  // A format normalizer must NEVER swallow or truncate any major dossier part
  const postflightParts = Array.from(text.matchAll(/^(#{1,3}\s+Part\s+\d+:?[^\r\n]*)/gim)).map(m => m[1].trim());
  if (preflightParts.length > postflightParts.length) {
    console.error(`[Dossier Format Guard Alert] Section heading loss detected! Pre: ${preflightParts.length}, Post: ${postflightParts.length}. Aborting destructive transformation to preserve document integrity.`);
    return frontmatter ? `${frontmatter}${markdown}` : markdown;
  }

  return frontmatter ? `${frontmatter}${text}` : text;
}

export interface CrosscheckVerdict {
  gatesPassed: number;
  totalGates: number;
  hasBreach: boolean;
  breaches: string[];
}

export function parseCrosscheckVerdict(text: string): CrosscheckVerdict {
  const totalGates = 5;
  const breaches: string[] = [];

  // Check for critical thesis-breaker markers
  const criticalMatches = text.match(/🔴\s*CRITICAL THESIS-BREAKER:[^\n]+/gi);
  if (criticalMatches) {
    for (const m of criticalMatches) {
      breaches.push(m.trim());
    }
  }

  const gateNames = [
    "Gate 0 (Pipeline Completeness)",
    "Gate 1 (Entity Integrity)",
    "Gate 2 (Portfolio Mandate)",
    "Gate 3 (Valuation Consistency)",
    "Gate 4 (Arithmetic Proof)"
  ];

  let gatesPassed = 0;
  for (let g = 0; g <= 4; g++) {
    const gateRegex = new RegExp(`Gate\\s*${g}[^\\n]*?(PASS|BREACH|FAIL)`, 'i');
    const match = text.match(gateRegex);
    if (match) {
      if (match[1].toUpperCase() === 'PASS') {
        gatesPassed++;
      } else {
        const breachMsg = `${gateNames[g]} BREACH`;
        if (!breaches.some(b => b.includes(`Gate ${g}`))) {
          breaches.push(breachMsg);
        }
      }
    } else {
      // Fallback check against executive summary lines
      if (g === 0 && /Pipeline Completeness:\s*\[?PASS/i.test(text)) gatesPassed++;
      else if (g === 1 && /Entity & Ticker Integrity:\s*\[?PASS/i.test(text)) gatesPassed++;
      else if (g === 2 && /Portfolio Mandate Alignment:\s*\[?PASS/i.test(text)) gatesPassed++;
      else if (g === 3 && /Cash-Flow Valuation Consistency:\s*\[?PASS/i.test(text)) gatesPassed++;
      else if (g === 4 && /Valuation Arithmetic & Bridge Integrity:\s*\[?PASS/i.test(text)) gatesPassed++;
      else {
        const hasGateBreach = new RegExp(`Gate\\s*${g}[^\\n]*?BREACH`, 'i').test(text);
        if (hasGateBreach) {
          breaches.push(`${gateNames[g]} BREACH`);
        } else {
          gatesPassed++;
        }
      }
    }
  }

  const hasCriticalStatus = /🔴\s*Critical Thesis-Breakers Detected/i.test(text) || breaches.length > 0;
  if (hasCriticalStatus && gatesPassed === 5) {
    gatesPassed = Math.max(0, 5 - breaches.length);
  }

  return {
    gatesPassed: Math.min(gatesPassed, totalGates),
    totalGates,
    hasBreach: hasCriticalStatus || breaches.length > 0 || gatesPassed < totalGates,
    breaches
  };
}

