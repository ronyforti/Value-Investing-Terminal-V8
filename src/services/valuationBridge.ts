import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { PythonValuationResult, SessionConfig, SessionMode } from "../types.js";

/**
 * Executes the Python mechanical valuation engine out-of-band and in parallel.
 * HARDCORE ANTI-ANCHORING FIREWALL:
 * This result is held strictly in session memory (state.pythonValuation).
 * It is NEVER added to state.files or passed to Gemini LLM prompts.
 */
export async function runPythonValuation(
  csvPath: string,
  config: SessionConfig,
  fxRate: number = 1.0
): Promise<PythonValuationResult> {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Financial CSV not found for Python valuation: ${csvPath}`);
  }

  const scriptPath = path.resolve(process.cwd(), "scripts", "valuation_engine.py");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Valuation engine script not found at ${scriptPath}`);
  }

  const pythonCmd = process.platform === "win32" ? "python" : "python3";
  const numPrice = parseFloat(String(config.price || "0").replace(/,/g, "")) || 1.0;

  const args = [
    scriptPath,
    "--csv", csvPath,
    "--ticker", config.ticker.toUpperCase(),
    "--price", String(numPrice),
    "--format", "json"
  ];

  if (config.isAdr) {
    args.push("--is-adr");
  }
  if (fxRate && fxRate > 0) {
    args.push("--fx-rate", String(fxRate));
  }

  return new Promise((resolve, reject) => {
    const child = spawn(pythonCmd, args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", chunk => {
      stdout += chunk.toString("utf-8");
    });

    child.stderr.on("data", chunk => {
      stderr += chunk.toString("utf-8");
    });

    child.on("close", code => {
      if (code !== 0) {
        return reject(new Error(`Valuation engine process exited with code ${code}: ${stderr || stdout}`));
      }

      try {
        const parsed = JSON.parse(stdout) as PythonValuationResult;
        parsed.computedAt = new Date().toISOString();
        resolve(parsed);
      } catch (err: any) {
        reject(new Error(`Failed to parse valuation engine JSON output: ${err.message}. Raw output:\n${stdout.slice(0, 500)}`));
      }
    });

    child.on("error", err => {
      reject(new Error(`Failed to launch ${pythonCmd}: ${err.message}`));
    });
  });
}

/**
 * Synthesizes the Double-Blind Valuation block by juxtaposing
 * Stream 1 (Python Mechanical Math) against Stream 2 (Gemini 4 Argon Qualitative Underwriting).
 * Appended strictly post-execution in server.ts so neither stream anchors or biases the other.
 */
export function synthesizeDoubleBlindSection(
  pythonVal: PythonValuationResult | null | undefined,
  argonDossierMd: string,
  sessionMode: SessionMode = "full",
  config?: SessionConfig | null
): string {
  if (!pythonVal) {
    return "";
  }

  // Extract authoritative verdict block first to avoid matching intermediate sensitivity tables (e.g. Part 7 terminal growth caps)
  const p11Match = argonDossierMd.match(/^##?\s+\[?Part\s+11:/im);
  const p12Match = argonDossierMd.match(/^##?\s+\[?Part\s+12:/im);
  const m1Match = argonDossierMd.match(/^###?\s+\[?(?:(?:Pillar\s+)?6\.?\s+)?Decision-Support\s+Triage\s+Directive/im);
  const m3Match = argonDossierMd.match(/^###?\s+\[?(?:(?:Part\s+)?(?:5\.?\s+)?)(?:The\s+4\s+)?Isolation\s+Gates/im);

  let verdictText = "";
  if (p11Match && p11Match.index !== undefined) {
    const p11Idx = p11Match.index;
    if (p12Match && p12Match.index !== undefined && p12Match.index > p11Idx) {
      verdictText = argonDossierMd.slice(p11Idx, p12Match.index);
    } else {
      verdictText = argonDossierMd.slice(p11Idx);
    }
  } else if (p12Match && p12Match.index !== undefined) {
    verdictText = argonDossierMd.slice(p12Match.index);
  } else if (m1Match && m1Match.index !== undefined) {
    verdictText = argonDossierMd.slice(m1Match.index);
  } else if (m3Match && m3Match.index !== undefined) {
    verdictText = argonDossierMd.slice(m3Match.index);
  }

  const dbMatch = verdictText.match(/^##\s+Quantitative Double-Blind/im);
  if (dbMatch && dbMatch.index !== undefined) {
    verdictText = verdictText.slice(0, dbMatch.index);
  }

  const searchTarget = verdictText || argonDossierMd;
  const curSymbolPattern = "(?:[\\$\\€\\¥\\£]|CA\\$|R\\$|MX\\$|CHF|USD)?\\s*";
  const curSymbolPatternStrict = "(?:[\\$\\€\\¥\\£]|CA\\$|R\\$|MX\\$|CHF|USD)\\s*";

  // Extract Argon Intrinsic Value from verdict block first, then fallback to full text
  const ivMatch = searchTarget.match(new RegExp(`(?:\\|\\s*)?[\\\`*]{0,3}(?:Refreshed\\s+|Mandate\\s+|Final\\s+|Synthesized\\s+|Sovereign\\s+|Probability-Weighted\\s+|Expected\\s+)*Intrinsic\\s+Value[^$\\d\\n|]{0,50}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?!%)`, "i")) ||
                  searchTarget.match(new RegExp(`\\|\\s*[\\\`*]{0,3}(?:Refreshed\\s+|Final\\s+|Synthesized\\s+|Sovereign\\s+|Probability-Weighted\\s+|Expected\\s+)*Intrinsic\\s+Value[^\\n|]*[\\\`*]{0,3}\\s*\\|\\s*[:\\s]*[\\\`*]{0,3}${curSymbolPattern}([0-9,]+\\.?[0-9]*)(?!%)`, "i")) ||
                  argonDossierMd.match(new RegExp(`(?:Synthesized Final Intrinsic Value Per Share|Synthesized Final Intrinsic Value|Synthesized Intrinsic Value|Authoritative Intrinsic Value)[^$\\d\\n]{0,40}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?!%)`, "i"));
  const argonIv = ivMatch ? parseFloat(ivMatch[1].replace(/,/g, "")) : null;

  // Extract Argon EPV Floor: check verdict table first, then Gate 3 crosscheck, then authoritative table, guarding against enterprise [MB]
  let argonEpv: number | null = null;
  const tableEpvMatch = verdictText ? verdictText.match(new RegExp(`\\|\\s*[\\\`*]{0,3}(?:Authoritative\\s+|Primary\\s+|Baseline\\s+|Zero-Growth\\s+)*EPV(?:\\s+Floor)?(?:\\s+Benchmark)?[^\\n|]*[\\\`*]{0,3}\\s*\\|\\s*[:\\s]*[\\\`*]{0,3}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?![0-9.,]*[MB]\\b)`, "i")) : null;
  if (tableEpvMatch) {
    argonEpv = parseFloat(tableEpvMatch[1].replace(/,/g, ""));
  } else {
    const gate3Match = argonDossierMd.match(new RegExp(`Gate\\s+3[^\\n]*?${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)\\s+(?:Zero-Growth\\s+)?EPV\\s+Floor`, "i"));
    if (gate3Match) {
      argonEpv = parseFloat(gate3Match[1].replace(/,/g, ""));
    } else {
      const authEpvMatch = argonDossierMd.match(new RegExp(`(?:Authoritative Primary EPV Floor|Authoritative Zero-Growth EPV Floor(?: Per Diluted Share)?|Primary Authoritative EPV Floor)[^$\\d\\n|]{0,60}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?![0-9.,]*[MB]\\b)`, "i"));
      if (authEpvMatch) {
        argonEpv = parseFloat(authEpvMatch[1].replace(/,/g, ""));
      } else {
        const epvMatch = searchTarget.match(new RegExp(`(?:Zero-Growth\\s+EPV\\s+Floor(?:\\s+of)?|EPV\\s+Floor(?:\\s+of)?)[^$\\d\\n|]{0,25}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?![0-9.,]*[MB]\\b)`, "i")) ||
                         argonDossierMd.match(new RegExp(`(?:Zero-Growth EPV Floor Benchmark Per Share|Zero-Growth EPV Floor Per Share|EPV Floor Benchmark Per Share|EPV Floor Per Share)[^$\\d\\n]{0,50}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?![0-9.,]*[MB]\\b)`, "i")) ||
                         argonDossierMd.match(new RegExp(`(?:Zero-Growth EPV Floor|EPV Floor|Earnings Power Value)[^$\\d\\n]{0,50}${curSymbolPatternStrict}([0-9,]+\\.?[0-9]*)(?![0-9.,]*[MB]\\b)`, "i"));
        argonEpv = epvMatch ? parseFloat(epvMatch[1].replace(/,/g, "")) : null;
      }
    }
  }

  const mosMatch = searchTarget.match(/\|\s*[`*]{0,3}(?:Refreshed\s+|Current\s+|Standard\s+|Calculated\s+)?Margin\s+of\s+Safety[^\n|]*[`*]{0,3}\s*\|\s*[:\s]*[`*]{0,3}([+-]?[0-9,.]+\%)/i) ||
                   searchTarget.match(/(?:\|\s*)?[`*]{0,3}(?:Refreshed\s+|Current\s+|Standard\s+|Calculated\s+)?Margin\s+of\s+Safety(?:\s*\(Standard\))?[^\n|%]{0,45}?(?:[:|=]\s*|\s*\|\s*)([+-]?[0-9,.]+\%)/i) ||
                   argonDossierMd.match(/\|\s*[`*]{0,3}(?:Refreshed\s+|Standard\s+|Calculated\s+)?Margin\s+of\s+Safety[`*]{0,3}\s*\|\s*[:\s]*[`*]{0,3}([+-]?[0-9,.]+\%)/i) ||
                   argonDossierMd.match(/(?:Standard Margin of Safety|Margin of Safety|Implied MoS)[^%\-\+\d]{0,30}([-+]?[0-9,]+\.?[0-9]*%)/i);
  const argonMos = mosMatch ? mosMatch[1] : "N/A";

  const decMatch = searchTarget.match(/(?:Final Portfolio Action Directive|Audited Portfolio Verdict|Suggested Action|Action Directive)[^a-zA-Z\n]{1,40}\b(INVEST|PASS|ESCALATE|HOLD|ACCUMULATE|LIQUIDATE)\b/i) ||
                   argonDossierMd.match(/(?:Final Portfolio Action Directive|Audited Portfolio Verdict|Suggested Action|Action Directive)[^a-zA-Z\n]{1,40}\b(INVEST|PASS|ESCALATE|HOLD|ACCUMULATE|LIQUIDATE)\b/i);
  const argonVerdict = decMatch ? decMatch[1].toUpperCase() : "EVALUATED";

  // Calculate divergence between Stream 1 (Python Expected DCF) and Stream 2 (Argon Synthesized IV)
  let divergenceStatus = "N/A";
  let divergenceSpreadPct = "N/A";
  if (argonIv && argonIv > 0 && pythonVal.dcf_expected > 0) {
    const diff = Math.abs(argonIv - pythonVal.dcf_expected);
    const spread = (diff / argonIv) * 100.0;
    divergenceSpreadPct = `${spread.toFixed(1)}%`;
    if (spread <= 15.0) {
      divergenceStatus = `🟢 CONVERGENT (${divergenceSpreadPct} spread — High cross-model consensus)`;
    } else if (spread <= 25.0) {
      divergenceStatus = `🟡 MODERATE SPREAD (${divergenceSpreadPct} spread — Review qualitative growth vs. mechanical trailing run rate)`;
    } else {
      divergenceStatus = `🔶 HIGH DIVERGENCE (${divergenceSpreadPct} spread — Qualitative footnote/transcript reality diverges from historical trailing financials)`;
    }
  }

  const lines: string[] = [
    "---",
    "",
    "## Quantitative Double-Blind Cross-Examination (Stream 1 Mechanical vs. Stream 2 Institutional)",
    "",
    "> [!NOTE]",
    "> **Double-Blind Architecture Safeguard:** Stream 1 (Python 40Q mechanical engine) and Stream 2 (Gemini 4 Argon deep filings underwriting) were executed completely independently. Neither stream had access to the other's valuation numbers or recommendations, ensuring zero anchoring bias.",
    "",
    "### 1. Dual-Stream Valuation Synthesis & Divergence Matrix",
    "| Valuation Parameter | Stream 1: Python Mechanical Engine | Stream 2: Gemini 4 Argon Underwriting | Desk Cross-Examination |",
    "| :--- | :---: | :---: | :--- |",
    `| **Authoritative Intrinsic Value** | **$${pythonVal.dcf_expected.toFixed(2)}** | **${argonIv ? `$${argonIv.toFixed(2)}` : "Evaluated"}** | **${divergenceStatus}** |`,
    `| **Zero-Growth EPV Floor** | $${pythonVal.epv_per_share.toFixed(2)} | ${argonEpv ? `$${argonEpv.toFixed(2)}` : "Evaluated"} | Sustainable no-growth balance sheet & cash flow floor |`,
    `| **Bolsa 6.0 10-Yr Cash Multiple** | **${pythonVal.bolsa_multiple.toFixed(2)}x** | — | **${pythonVal.bolsa_tier}** |`,
    `| **10-Year Cash Sum (PV_10)** | $${pythonVal.pv_10.toFixed(2)}M | — | Sum of PV of 10-Yr Owner Earnings at 10.00% hurdle (0 residual) |`,
    `| **Tri-Horizon Growth (g_Bolsa)** | ${pythonVal.g_bolsa_capped_pct.toFixed(2)}% | — | Pure 3Y/5Y/7Y average capped at ${pythonVal.g_bolsa_capped_pct > 15 ? "20.0%" : "15.0%"} |`,
    `| **Portfolio Action Directive** | Quantitative Hurdle Check | **${argonVerdict}** | Institutional Underwriting Synthesis |`,
    ""
  ];

  if (pythonVal.has_rd && pythonVal.rd_spectrum) {
    lines.push("### 2. Tech R&D Capitalization Mechanical Sensitivity Spectrum");
    lines.push("| R&D Capitalization Tier | Starting Base (OE_0) | 10-Yr Cash (PV_10) | Bolsa Multiple | Valuation Verdict |");
    lines.push("| :--- | :---: | :---: | :---: | :--- |");
    for (const [tierLabel, tierVal] of Object.entries(pythonVal.rd_spectrum)) {
      lines.push(
        `| **${tierLabel}** | $${tierVal.oe_0.toFixed(2)}M | $${tierVal.pv_10.toFixed(2)}M | **${tierVal.bolsa_multiple.toFixed(2)}x** | ${tierVal.tier} |`
      );
    }
    lines.push("");
  }

  lines.push(`### 3. Bolsa 6.0 Quantitative OKR Scorecard (${pythonVal.okr_passed_count}/13 Passed)`);
  lines.push("| OKR Key | Metric Description | Audited Value | Target Hurdle | Result |");
  lines.push("| :--- | :--- | :---: | :---: | :---: |");
  for (const okr of pythonVal.okr_scorecard) {
    const badge = okr.passed ? "PASS" : "FAIL";
    lines.push(`| **${okr.id}** | ${okr.name} | ${okr.value} | ${okr.target} | **${badge}** |`);
  }
  lines.push("");

  lines.push("### 4. 4-Vector Buy-Side Cash Integrity Audit");
  lines.push("| Forensic Cash Vector | Audited 3-Year Metric | Desk Standard | Audit Finding |");
  lines.push("| :--- | :---: | :---: | :---: |");
  for (const v of pythonVal.forensic_4vectors) {
    lines.push(`| **${v.vector}** | ${v.metric} | ${v.threshold} | **${v.finding}** |`);
  }
  lines.push("");

  if (sessionMode === "sentinel" && Object.keys(pythonVal.qoq_deltas).length > 0) {
    lines.push("### 5. Mode 3 Quarterly Operational Momentum Deltas (40Q Extracted)");
    lines.push("| Metric Operational Vector | Same-Quarter YoY Delta (Q0 vs Q4) | Sequential Q/Q Delta (Q0 vs Q1) |");
    lines.push("| :--- | :---: | :---: |");
    lines.push(`| **Consolidated Revenue** | **${pythonVal.qoq_deltas.same_quarter_yoy_rev_pct ?? 0}%** | ${pythonVal.qoq_deltas.sequential_qq_rev_pct ?? 0}% |`);
    lines.push(`| **Operating Income (EBIT)** | **${pythonVal.qoq_deltas.same_quarter_yoy_ebit_pct ?? 0}%** | — |`);
    lines.push(`| **Operating Cash Flow (OCF)** | **${pythonVal.qoq_deltas.same_quarter_yoy_ocf_pct ?? 0}%** | — |`);
    lines.push("");
  }

  return lines.join("\n");
}
