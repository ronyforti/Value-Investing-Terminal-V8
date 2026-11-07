const fs = require('fs');
const path = require('path');
const os = require('os');

const BASE_URL = 'http://localhost:3000';
const tempDir = path.join(os.tmpdir(), 'invest_terminal_downloads');

const filesToUpload = [
  { name: 'ADBE_10-K_2025.md', filePath: path.join(tempDir, 'file-1791939004282-618'), mimeType: 'text/markdown' },
  { name: 'ADBE_10-Q3_2026.md', filePath: path.join(tempDir, 'file-1791939007294-391'), mimeType: 'text/markdown' },
  { name: 'ADBE_DEF 14A_2026.md', filePath: path.join(tempDir, 'file-1791939010214-256'), mimeType: 'text/markdown' },
  { name: 'ADBE Q3-26 - Financials-TTM.csv', filePath: path.join(tempDir, 'file-1791939013657-439'), mimeType: 'text/csv' },
  { name: 'ADBE_Q3-26_Transcript.md', filePath: path.join(tempDir, 'file-1791939016387-434'), mimeType: 'text/markdown' },
  { name: 'ADBE  Q3-26 SaaS Disruption Analysis.md', filePath: 'G:\\My Drive\\Company Data\\GTD_Investing_Journal\\GTD_Investment_Latticework_Organized\\17 ARCHIVE\\ADBE\\ADBE  Q3-26 SaaS Disruption Analysis.md', mimeType: 'text/markdown' }
];

async function main() {
  console.log('=== ADBE Autonomous End-to-End Terminal Test ===');

  // 1. Initialize session with Gemini 4 Argon
  console.log('[1/5] Initializing ADBE session on port 3000 with Gemini 4 Argon...');
  const initRes = await fetch(`${BASE_URL}/api/session/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticker: 'ADBE',
      period: 'Q3-26',
      price: '236.28',
      model: 'models/gemini-4-argon',
      executionMode: 0, // FullAuto
      portfolio: { holdsPosition: false },
      notes: 'Testing end-to-end institutional refactoring with ADBE Q3-26, SaaS disruption thesis, and Gemini 4 Argon.',
      enableCrosscheck: true,
      crosscheckModel: 'default',
      clearFiles: false
    })
  });

  if (!initRes.ok) {
    throw new Error(`Session init failed: ${initRes.status} ${await initRes.text()}`);
  }
  const initData = await initRes.json();
  console.log(`Session initialized with model: ${initData.state.config.model}. Steps count: ${initData.state.steps.length}`);
  const existingFiles = initData.state?.files || [];
  console.log(`Current session files staged: ${existingFiles.length}`);

  // 2. Upload missing files
  console.log('[2/5] Uploading staged source documents...');
  for (const f of filesToUpload) {
    if (existingFiles.some(ef => ef.name === f.name)) {
      console.log(` -> Already staged: ${f.name}`);
      continue;
    }
    console.log(` -> Staging: ${f.name} (${fs.statSync(f.filePath).size} bytes)`);
    const buffer = fs.readFileSync(f.filePath);
    const base64Data = buffer.toString('base64');

    const upRes = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: f.name,
        data: base64Data,
        mimeType: f.mimeType,
        bypassCurrencyCheck: true
      })
    });

    if (!upRes.ok) {
      throw new Error(`Upload failed for ${f.name}: ${upRes.status} ${await upRes.text()}`);
    }
    const upData = await upRes.json();
    console.log(`    Uploaded successfully. Category: ${upData.file?.auditCategory || 'OK'}, Tokens: ${upData.file?.tokens}`);
  }

  // 3. Verify session & audit checklist
  console.log('[3/5] Verifying staged document audit checklist...');
  const sessionRes = await fetch(`${BASE_URL}/api/session`);
  const sessionData = await sessionRes.json();
  const st = sessionData.state;
  console.log(`Staged files in state: ${st.files.length}`);
  for (const check of sessionData.auditChecklist || []) {
    console.log(` - ${check.category} [${check.status}]: ${check.matchedFiles || 'None'}`);
  }

  // 4. Start pipeline
  console.log('[4/5] Triggering automated pipeline execution (/api/session/step/run)...');
  const runRes = await fetch(`${BASE_URL}/api/session/step/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ overrideMissingFiles: true, overrideIntegrityCheck: true })
  });

  if (!runRes.ok) {
    throw new Error(`Pipeline start failed: ${runRes.status} ${await runRes.text()}`);
  }
  console.log('Pipeline started! Monitoring step progress...');

  // 5. Polling until all 12 steps complete
  let lastReportedStep = -1;
  let lastCompletedCount = 0;
  let lastStatus = '';
  const startTime = Date.now();

  while (true) {
    await new Promise(r => setTimeout(r, 6000));
    const pollRes = await fetch(`${BASE_URL}/api/session`);
    if (!pollRes.ok) {
      console.warn(`Polling error: ${pollRes.status}`);
      continue;
    }
    const pollData = await pollRes.json();
    const state = pollData.state;
    const { status, activeStepIndex, steps } = state;

    const completedCount = steps.filter(s => s.status === 'completed').length;
    const currentStep = steps[activeStepIndex] || steps[completedCount] || {};

    if (completedCount > lastCompletedCount) {
      const justCompleted = steps[lastCompletedCount];
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`[T+${elapsed}s] ✅ COMPLETED Step ${lastCompletedCount + 1}/${steps.length}: "${justCompleted?.title || 'Step'}" (Chars: ${justCompleted?.response?.length || 0})`);
      lastCompletedCount = completedCount;
    }

    if (activeStepIndex !== lastReportedStep || status !== lastStatus) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`[T+${elapsed}s] Status: ${status.toUpperCase()} | Step ${activeStepIndex + 1}/${steps.length}: "${currentStep.title || 'N/A'}" | Progress: ${completedCount}/${steps.length}`);
      lastReportedStep = activeStepIndex;
      lastStatus = status;
    }

    if (status === 'error') {
      throw new Error(`Pipeline encountered an error on step ${activeStepIndex + 1}`);
    }

    if (completedCount === steps.length || (status === 'completed' && completedCount >= 12)) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n🎉 ALL 12 STEPS COMPLETED in ${elapsed}s!`);
      break;
    }
  }

  // 6. Export outputs
  console.log('[5/5] Exporting final Markdown and Standalone HTML dossiers...');
  const outDir = path.join(process.cwd(), 'test_output');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const exportMdRes = await fetch(`${BASE_URL}/api/session/export`);
  const mdContent = await exportMdRes.text();
  const mdPath = path.join(outDir, 'ADBE_Q3-26_Dossier.md');
  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log(`Markdown saved to: ${mdPath} (${Buffer.byteLength(mdContent, 'utf-8')} bytes)`);

  const exportHtmlRes = await fetch(`${BASE_URL}/api/session/export-html`);
  const htmlContent = await exportHtmlRes.text();
  const htmlPath = path.join(outDir, 'ADBE_Q3-26_Dossier.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log(`HTML saved to: ${htmlPath} (${Buffer.byteLength(htmlContent, 'utf-8')} bytes)`);

  console.log('\n=== Autonomous Test Finished Successfully! ===');
}

main().catch(err => {
  console.error('\n❌ Execution Failed:', err);
  process.exit(1);
});
