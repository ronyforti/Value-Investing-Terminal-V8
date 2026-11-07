import fs from "fs";
import path from "path";

/**
 * Line-by-line robust code-fence unwrap engine.
 * Unconditionally unwraps all non-mermaid code blocks into native Markdown.
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
          // Preserve Mermaid diagram
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

const syntheticTest = `
---
ticker: TEST
---
## Part 4: Moat

\`\`\`
* Stray bullet item 1
* Stray bullet item 2
\`\`\`

\`\`\`mermaid
flowchart TD
  S1["Stage 1"] --> S2["Stage 2"]
\`\`\`

\`\`\`\`\`\`
| Col 1 | Col 2 |
| :--- | :---: |
| Val A | Val B |
\`\`\`
`;

const cleanedSynthetic = unwrapNonMermaidCodeBlocks(syntheticTest);
console.log("=== SYNTHETIC TEST RESULT ===");
console.log(cleanedSynthetic);

const testFences = (cleanedSynthetic.match(/```/g) || []).length;
console.log("Synthetic test total code fences:", testFences);
if (testFences !== 2) {
  throw new Error(`Expected exactly 2 code fences for Mermaid block (opening and closing), found ${testFences}`);
}
if (!cleanedSynthetic.includes("```mermaid\nflowchart TD")) {
  throw new Error("Mermaid flowchart opening missing!");
}
if (!cleanedSynthetic.includes('S1["Stage 1"] --> S2["Stage 2"]\n```')) {
  throw new Error("Mermaid flowchart closing missing!");
}
if (cleanedSynthetic.includes("```\n* Stray bullet")) {
  throw new Error("Stray bullets still in code block!");
}

console.log("All synthetic test assertions PASSED PERFECTLY!");

const deckPath = path.resolve("dist/dossiers/DECK_Q1-27_Valuation_Dossier_ASD100_20261002192336.md");
if (fs.existsSync(deckPath)) {
  const rawDeck = fs.readFileSync(deckPath, "utf-8");
  const cleanedDeck = unwrapNonMermaidCodeBlocks(rawDeck);
  const deckFences = (cleanedDeck.match(/```/g) || []).length;
  console.log(`DECK file: initial fences = ${(rawDeck.match(/```/g) || []).length}, cleaned fences = ${deckFences}`);
  if (deckFences !== 0) {
    throw new Error(`Expected 0 code fences in DECK dossier (it has no mermaid diagrams), found ${deckFences}`);
  }
  console.log("DECK dossier code fence assertions PASSED PERFECTLY (0 rogue code blocks)!");
}
