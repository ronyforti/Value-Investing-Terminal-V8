import fs from "fs";
import { MASTER_PROMPTS, CROSSCHECK_PROMPT } from "../src/prompts.js";

function syncExports() {
  console.log(`Syncing ${MASTER_PROMPTS.length} master prompts + 1 crosscheck prompt...`);

  // 1. prompts.json
  const allPrompts = [...MASTER_PROMPTS, CROSSCHECK_PROMPT];
  const promptTexts = allPrompts.map(p => p.text);
  fs.writeFileSync("prompts.json", JSON.stringify(promptTexts, null, 2), "utf-8");
  console.log("Updated prompts.json");

  // 2. Text exports
  let txt = "Investment Analysis and Valuation Framework Master Prompts\n\n";
  for (const p of allPrompts) {
    txt += "================================================================================\n";
    txt += `id: ${p.id}\n`;
    txt += `Title: ${p.title}\n`;
    txt += "--------------------------------------------------------------------------------\n";
    txt += `${p.text}\n\n`;
  }

  fs.writeFileSync("Investment Analysis and Valuation Framework Master Prompts.txt", txt, "utf-8");
  fs.writeFileSync("Investment Analysis and Valuation Framework Master Prompts", txt, "utf-8");
  console.log("Updated Master Prompts text files.");
}

syncExports();
