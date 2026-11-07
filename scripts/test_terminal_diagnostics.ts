import "dotenv/config";

const BASE_URL = process.env.APP_URL || (process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:3001");

interface DiagnosticResult {
  suite: string;
  test: string;
  passed: boolean;
  details?: string;
}

const results: DiagnosticResult[] = [];

function record(suite: string, test: string, passed: boolean, details?: string) {
  results.push({ suite, test, passed, details });
  const statusStr = passed ? "✓ PASS" : "✗ FAIL";
  console.log(`[${suite}] ${statusStr}: ${test}${details ? ` (${details})` : ""}`);
}

async function runDiagnostics() {
  console.log("===============================================================");
  console.log("    VALUE INVESTING TERMINAL — FULL END-TO-END DIAGNOSTIC      ");
  console.log("===============================================================\n");

  // --- SUITE 1: External APIs & Network Gateways ---
  console.log("--- Suite 1: External API Connectivity & Gateways ---");
  try {
    const secRes = await fetch("https://www.sec.gov/files/company_tickers.json", {
      headers: { "User-Agent": "TerminalAnalyst (analyst@example.com)" },
      signal: AbortSignal.timeout(6000)
    });
    record("Gateways", "SEC EDGAR company_tickers.json endpoint", secRes.ok, `HTTP ${secRes.status}`);
  } catch (err: any) {
    record("Gateways", "SEC EDGAR company_tickers.json endpoint", false, err.message);
  }

  try {
    const edgarDataRes = await fetch("https://data.sec.gov/submissions/CIK0000320193.json", {
      headers: { "User-Agent": "TerminalAnalyst (analyst@example.com)" },
      signal: AbortSignal.timeout(6000)
    });
    record("Gateways", "SEC EDGAR data.sec.gov submissions endpoint", edgarDataRes.ok, `HTTP ${edgarDataRes.status}`);
  } catch (err: any) {
    record("Gateways", "SEC EDGAR data.sec.gov submissions endpoint", false, err.message);
  }

  try {
    const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      signal: AbortSignal.timeout(6000)
    });
    // 403 without API key confirms gateway reached Google's auth barrier
    const reachable = geminiRes.status === 200 || geminiRes.status === 400 || geminiRes.status === 403;
    record("Gateways", "Google Generative Language API gateway", reachable, `HTTP ${geminiRes.status}`);
  } catch (err: any) {
    record("Gateways", "Google Generative Language API gateway", false, err.message);
  }

  try {
    const fmpRes = await fetch("https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=test", {
      signal: AbortSignal.timeout(6000)
    });
    // 401 confirms gateway reached FMP API authentication layer
    const reachable = fmpRes.status === 200 || fmpRes.status === 401;
    record("Gateways", "Financial Modeling Prep (FMP) API gateway", reachable, `HTTP ${fmpRes.status}`);
  } catch (err: any) {
    record("Gateways", "Financial Modeling Prep (FMP) API gateway", false, err.message);
  }

  // --- SUITE 2: Core Server Runtime & Endpoints ---
  console.log("\n--- Suite 2: Terminal Core Server & API Endpoints ---");
  try {
    const rootRes = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(4000) });
    const isHtml = rootRes.headers.get("content-type")?.includes("text/html");
    record("Server", "Root SPA bundle delivery (GET /)", rootRes.ok && !!isHtml, `HTTP ${rootRes.status}`);
  } catch (err: any) {
    record("Server", "Root SPA bundle delivery (GET /)", false, err.message);
  }

  try {
    const sessionRes = await fetch(`${BASE_URL}/api/session`, { signal: AbortSignal.timeout(4000) });
    const sessionData = await sessionRes.json() as any;
    const valid = sessionRes.ok && sessionData.state && Array.isArray(sessionData.state.steps) && sessionData.state.steps.length === 12;
    record("Server", "Session state & 12-step hierarchy (GET /api/session)", valid, `Steps: ${sessionData.state?.steps?.length}`);
  } catch (err: any) {
    record("Server", "Session state & 12-step hierarchy (GET /api/session)", false, err.message);
  }

  try {
    const modelsRes = await fetch(`${BASE_URL}/api/session/models`, { signal: AbortSignal.timeout(4000) });
    const modelsData = await modelsRes.json() as any;
    const hasArgon = modelsData.models?.some((m: any) => m.name.includes("gemini-4-argon") || m.name.includes("argon"));
    record("Server", "Frontier model catalog with Gemini 4 Argon (GET /api/session/models)", modelsRes.ok && hasArgon, `Count: ${modelsData.models?.length}`);
  } catch (err: any) {
    record("Server", "Frontier model catalog with Gemini 4 Argon (GET /api/session/models)", false, err.message);
  }

  try {
    const flexRes = await fetch(`${BASE_URL}/api/flex/status`, { signal: AbortSignal.timeout(4000) });
    const flexData = await flexRes.json() as any;
    const validProbe = flexRes.ok && flexData.probe && typeof flexData.probe.available === "boolean";
    record("Server", "Gemini Flex Canary Probe service (GET /api/flex/status)", validProbe, `Status: ${flexData.probe?.status}, Available: ${flexData.probe?.available}`);
  } catch (err: any) {
    record("Server", "Gemini Flex Canary Probe service (GET /api/flex/status)", false, err.message);
  }

  // --- SUITE 3: Document Pulling & Parsing Pipeline ---
  console.log("\n--- Suite 3: Document Pulling & Parsing Pipeline ---");
  try {
    // Stage an SEC 10-K filing for CALM
    const ingestRes = await fetch(`${BASE_URL}/api/ingest/sec-filings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker: "CALM",
        filingTypes: ["10-K"],
        period: "FY2026"
      }),
      signal: AbortSignal.timeout(30000)
    });
    const ingestData = await ingestRes.json() as any;
    record("Ingestion", "Automated SEC EDGAR 10-K pull & Markdown conversion", ingestRes.ok && ingestData.success === true, ingestData.message);
  } catch (err: any) {
    record("Ingestion", "Automated SEC EDGAR 10-K pull & Markdown conversion", false, err.message);
  }

  try {
    // Audit the newly staged document
    const auditRes = await fetch(`${BASE_URL}/api/document/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker: "CALM",
        period: "FY2026"
      }),
      signal: AbortSignal.timeout(5000)
    });
    const auditData = await auditRes.json() as any;
    const tenKConfirmed = auditData.checklist?.some((c: any) => c.category === "10-K" && c.status === "CONFIRMED");
    record("Document Guard", "Pre-Flight substance & period validation (CONFIRMED 10-K)", auditRes.ok && tenKConfirmed, `Audit passed: ${auditData.success}`);
  } catch (err: any) {
    record("Document Guard", "Pre-Flight substance & period validation (CONFIRMED 10-K)", false, err.message);
  }

  // --- SUITE 4: Defensive Error Handling & Guardrails ---
  console.log("\n--- Suite 4: Defensive Error Handling & Fallbacks ---");
  try {
    const fmpQuoteRes = await fetch(`${BASE_URL}/api/ingest/fmp-ticker-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: "CALM" }),
      signal: AbortSignal.timeout(5000)
    });
    const fmpQuoteData = await fmpQuoteRes.json() as any;
    const handledGracefully = fmpQuoteRes.ok && fmpQuoteData.success === true && fmpQuoteData.source === "fallback";
    record("Resilience", "FMP Quote graceful fallback when API key vacant", handledGracefully, `Source: ${fmpQuoteData.source}, Price: $${fmpQuoteData.price}`);
  } catch (err: any) {
    record("Resilience", "FMP Quote graceful fallback when API key vacant", false, err.message);
  }

  try {
    const transcriptRes = await fetch(`${BASE_URL}/api/ingest/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: "CALM", period: "FY2026" }),
      signal: AbortSignal.timeout(8000)
    });
    const transcriptData = await transcriptRes.json() as any;
    record("Resilience", "Transcript readiness & manual guidance response", transcriptRes.ok && transcriptData.notReady === true, transcriptData.message?.slice(0, 60) + "...");
  } catch (err: any) {
    record("Resilience", "Transcript readiness & manual guidance response", false, err.message);
  }

  // --- SUITE 5: Clean Reset Contract ---
  console.log("\n--- Suite 5: Clean Reset Contract ---");
  try {
    const resetRes = await fetch(`${BASE_URL}/api/session/hard-reset`, {
      method: "POST",
      signal: AbortSignal.timeout(5000)
    });
    const resetData = await resetRes.json() as any;
    const filesWiped = resetData.state?.files?.length === 0;
    const configClean = resetData.state?.config === null;
    record("Reset", "Hard Reset memory & queue purge (/api/session/hard-reset)", resetRes.ok && filesWiped && configClean, `Files: ${resetData.state?.files?.length}, Config: ${resetData.state?.config}`);
  } catch (err: any) {
    record("Reset", "Hard Reset memory & queue purge (/api/session/hard-reset)", false, err.message);
  }

  // --- Summary ---
  console.log("\n===============================================================");
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`DIAGNOSTIC SUMMARY: ${passed}/${total} TESTS PASSED (${failed} failures)`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runDiagnostics().catch(err => {
  console.error("Fatal diagnostic runner error:", err);
  process.exit(1);
});
