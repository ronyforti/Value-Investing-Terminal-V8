---
name: terminal-regression-guard
description: Use this skill whenever modifying, refactoring, fixing bugs, or adding features to the Value Investing Terminal codebase. Enforces surgical minimal blast-radius edits, pre/post-flight verification gates (tsc --noEmit and npm run build), git diff reviews, contract preservation, and an uncompromising 2-strike anti-thrashing circuit breaker to prevent cascading fix-break loops.
---

# Terminal Regression Guard Skill: Codebase Integrity & Anti-Thrashing Protocol

This skill governs **all software modifications, bug fixes, refactorings, and feature additions** across the **Value Investing Terminal** (`c:\Users\Ronald\antigravity\Value-Investing-Terminal`).

Its prime directive is simple: **First, do no harm.** Changes must be surgical, strictly bounded in scope, mathematically verified, and guaranteed never to destabilize working components or degenerate into recursive fix-break-fix death spirals.

---

## 1. Core Principles of Terminal Integrity

1. **Surgical Precision over Broad Rewrites:**
   - Always prefer targeted, local edits (`replace_file_content`) modifying only the necessary lines.
   - **Strict Prohibition:** Never overwrite entire files (`write_to_file` with complete replacement) or rewrite working modules when a localized edit suffices.
   - Do not reformat untouched code, reorder imports arbitrarily, or introduce sweeping stylistic churn that obscures git diffs.

2. **Root-Cause First (Zero Blind Patching):**
   - Never slap band-aids on error messages or paper over unexpected behavior without identifying the exact underlying cause.
   - If an error occurs, inspect the stack trace, examine input arguments, and trace execution flow before writing a single line of code.

3. **Contract & Interface Invariance:**
   - Existing TypeScript interfaces ([`src/types.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/types.ts)), backend API routes ([`server.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/server.ts)), and React component prop boundaries must maintain backward compatibility.
   - Never remove or rename exported functions, route parameters, or database/file schemas without explicit, pre-approved migration paths.

4. **Zero Company-Specific Hardcoding & Cross-Contamination Ban:**
   - Production code, parsers, format guards, regex expressions, and fallback templates must be 100% agnostic to any individual company or stock symbol.
   - **Strict Prohibition:** Never embed company tickers (e.g. `PLTR`, `CALM`, `AAPL`), stock quotes, or test case values into codebase logic or regex fallbacks.
   - Unit tests and synthetic test suites must use clearly isolated mock data that cannot contaminate production parsing pipelines.

5. **Downstream Extractor & Regex Shadowing Audit:**
   - Whenever modifying or expanding master prompt taxonomies, category names, or enum directives (e.g., adding `Cyclical Compounder` or `Pure Commodity Cyclical` in Part 9, or updating action directives in Part 11), you MUST audit all downstream regex extractors across `server.ts`, `server.cloud.ts`, and `src/utils/googleDocs.ts`.
   - **Regex Ordering Law:** Ensure multi-word composite labels precede single-word prefixes in regex alternations (e.g., `(Cyclical Compounder|Cyclical)` instead of `(Cyclical|Cyclical Compounder)`) to prevent premature token truncation.
   - **Table Extraction Law:** Ensure extractors parse directly from canonical GFM table rows (e.g. `| **[Archetype Name]** | **ACTIVE ARCHETYPE** |`) before falling back to unstructured prose regexes.
   - **Scale Guard & Table-First Extractor Law:** All per-share metric extractors (Intrinsic Value, EPV Floor) across `server.ts`, `server.cloud.ts`, `valuationBridge.ts`, and `googleDocs.ts` must strictly enforce negative lookaheads against Millions/Billions (`(?![0-9.,]*[MB]\b)`) and parse from canonical GFM table rows before loose prose, preventing balance-sheet aggregate figures (e.g. historical Net Debt, CapEx, or Revenue) mentioned in prose comparisons from corrupting per-share frontmatter and double-blind tables.

6. **Zero Sticky Input Trapping, Clean Reset Contract & HUD Invariance:**
   - Temporary setup inputs (`ticker`, `period`, `price`, `selectedModel`) must never be held in persistent `localStorage`.
   - Hard reset operations must unconditionally restore client inputs to blank defaults (`ticker: ""`, `period: "----"`, `price: "----"`, `selectedModel: ""`) and wipe all server files, queues, and history.
   - Crosscheck forensic gate badge (`CROSSCHECK: X/5 GATES PASSED`) and prefix cache badge must render strictly when an active ticker session is configured (`Boolean(session.config?.ticker)`) and Step 12 has actually completed (`session.steps?.some(s => s.isCrosscheck && s.status === 'completed')`). Residual crosscheck verdicts or token counts must be unconditionally deleted from server state upon reset (`enforceCleanTickerEnvironment`, `hardResetSessionState`, `/api/session/reset`).

7. **Vite Development Watcher Scoping & Zero-Flicker Mandate:**
   - Vite watch configuration (`server.watch.ignored` in `vite.config.ts`) must strictly ignore all markdown files (`**/*.md`), skills (`**/.agents/**`, `**/.gemini/**`), manuals (`**/public/**`, `**/dist/**`), backend scripts (`**/scripts/**`, `**/server*.ts`), and staged filings (`**/*.txt`, `**/*.pdf`, `**/*.csv`).
   - Background file edits or test executions must never trigger full browser reloads (`(client) page reload ...`), protecting user typing flow and active analytical sessions.

8. **Activity-Gated Polling Discipline:**
   - Client polling loops must be strictly inactive when the terminal is idle (`if (!isBusy) return;`), eliminating unnecessary React re-renders and network chatter while the user is configuring sessions.

9. **CRLF-Safe Programmatic Edits & Match Assertions:**
   - On Windows, workspace files may contain either LF (`\n`) or CRLF (`\r\n`) line endings. Whenever executing multi-line programmatic replacements via Node scripts, normalize `\r\n` to `\n` before matching, explicitly assert that the target substring exists (fail fast if not found rather than silently no-oping), and restore the file's original line-ending convention on write.

10. **Pre-Flight Requirement Registration & UI Row Deduplication Contract:**
   - Whenever adding or modifying a pre-flight requirement category in `REQUIREMENT_RULES` (`server.ts` and `runAuditLocally` in `src/App.tsx`):
     1. Exempt non-periodic categories (e.g., `Competitor Radar`, `Supplementary`) from quarterly/annual period-mismatch flags in `src/documentGuard.ts`.
     2. Provide a 1-click retrieval/harvest action handler in `src/components/MissingDocumentsModal.tsx`.
     3. If Card 3 (`Mandatory Pre-Flight Audit`) renders a dedicated custom visualizer row for that category, filter the category out of Card 3's upper generic `auditChecklist.map()` loop (`c.category !== "..."`) to prevent duplicate row rendering.


11. **Backend Server Hot-Reload Boundary & Mandatory Restart Protocol:**
    - The terminal development server executes in a persistent Node process (`tsx server.ts`). It does NOT hot-reload backend routes, document ingestion cleaners (`cleanSecHtmlToMarkdown`), or prompt builders when TypeScript files change on disk.
    - **Mandatory Action:** Whenever modifying backend routes, document parsers, or server logic:
      1. Either cleanly terminate and restart the backend process directly, OR explicitly prompt the user to restart the terminal console.
      2. Never test document ingestion or run valuations against a stale in-memory server process. Stale backend execution leads to false regression alarms and deceptive error reports.

12. **Context Cache Keep-Alive & Unprompted Idle Auto-Reset Contract:**
    - The terminal preserves Gemini's implicit prefix cache warm via a 4-minute background ping (`KEEP_ALIVE_INTERVAL_MS = 4m`).
    - Every human interrogation question extends the session by resetting the 45-minute countdown clock to 45:00.
    - Between minutes 40 and 45, an amber warning modal displays an active 1-second countdown initialized immediately at `05:00` (computed dynamically from `keepAlive.expiresAt - Date.now()`, never uninitialized `00:00`).
    - Upon countdown expiration (`remainingSec <= 0`) or clicking "Reset Now", the client must execute `executeAppReset()` directly, purging `localStorage`, hitting `POST /api/session/hard-reset`, and reloading via `window.location.reload()`. Automated resets must NEVER invoke blocking browser `confirm()` dialogs, ensuring unattended sessions cleanly auto-reset and refresh. Manual clicks on the header/footer trash can reset buttons strictly preserve the safety `confirm()` dialog via `handleHardReset()`.

---

## 2. Phase 1: Pre-Flight Baseline & Blast Radius Scoping

Before modifying any source file:

1. **Verify Baseline Cleanliness:**
   - Execute `git status` to confirm the working tree state is understood and clean.
2. **Map the Call Graph & Dependencies:**
   - Grep for all callers and importers of the function, component, or route being modified.
   - Know every file that depends on the contract *before* you touch it.
3. **Bound the Blast Radius:**
   - Define upfront the exact list of files and functions authorized to change.
   - Any file outside this list is strictly off-limits during the operation.

---

## 3. Phase 2: The 4-Tier Verification Gate

Every code change must pass all four verification gates before being declared complete or committed to Git:

```
[ Step 1: Visual Diff Inspection ]    --> git diff (Verify zero unintended line changes)
                 │
[ Step 2: Static Typecheck Gate ]     --> npm run lint (tsc --noEmit: 0 errors allowed)
                 │
[ Step 3: Production Bundler Gate ]   --> npm run build (vite build + esbuild server.ts)
                 │
[ Step 4: Runtime / Route Sanity ]    --> Verify touched endpoint or component behavior
```

### Gate 1: Visual Diff Inspection (`git diff`)
- Run `git diff` and review every single added, removed, or modified line.
- Confirm:
  - Did any unintended lines change?
  - Were any existing error handlers, comments, or edge-case checks accidentally deleted?
  - Is the diff minimal and strictly confined to the requested objective?

### Gate 2: Static Compiler & Typecheck Gate (`npm run lint`)
- Run `npm run lint` (`tsc --noEmit`).
- **Requirement:** 0 TypeScript compiler errors.
- Never use `@ts-ignore` or `any` casts to suppress compiler errors caused by your change.

### Gate 3: Production Bundler & Build Gate (`npm run build`)
- Run `npm run build`.
- This executes:
  1. `vite build` (validates client-side React code, Tailwind styling, and asset bundling).
  2. `esbuild server.ts` (validates Node.js server bundle and external dependency resolution).
- Both builds must exit with status `0`.

### Gate 3.5: Engine Verification & Offline Format Regression Suite
- Run `npm run test:engine` (`npx tsx scripts/test_engine_prompts.ts`).
  - Must pass all 14 verification gates, including:
    - Gate 11: Bimodal Voice Architecture across all parts.
    - Gate 12: Dossier Format Guard (Static Prompt Directives, Zero LaTeX, Zero Unicode box characters `│`, Zero typewriter sliders, Zero piped bullets, GFM table normalization, and Buy-Side Desk Nomenclature scrubbing).
    - Gate 13: Visualizer Chart Disambiguation & Single Cardinality Guard.
    - Gate 14: Hardcore Anti-Anchoring Firewall & Multi-Mode Prompt Integrity.
- Run `npm run test:format` (`npx tsx scripts/test_format_regression.ts`).
  - Must pass all offline Golden Snapshot assertions in < 50ms (Zero LaTeX, Zero typewriter sliders, rogue code fence unwrap, GFM table schemas, HTML standalone integrity).

### Gate 4: Runtime & Route Sanity Check
- If modifying an API route in [`server.ts`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/server.ts) or a client component in [`src/`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/src/), verify that request/response schemas, JSON payloads, and UI renders remain fully intact.
- Standalone HTML export must extract share price from Line-1 YAML frontmatter (`market_price:`).
- **Live Server Background Process & RAM Invalidation Mandate:** `npm run dev` (`tsx server.ts`) does not automatically hot-reload backend Express routes or module imports when files are modified on disk. Whenever diagnosing runtime server errors or delivering backend patches, inspect whether a running Node.js / `tsx` background process is holding stale code in RAM on port 3000 (`Get-NetTCPConnection -LocalPort 3000`). If a stale process exists, terminate it (`Stop-Process`) and verify the patch against the restarted live server to guarantee browser requests execute updated code.
- **Defensive Route Parameter & Payload Propagation:** Route handlers accepting optional query or body parameters (e.g. `period`, `ticker`, `fmpApiKey`) must provide safe default fallbacks and pass them explicitly down the call graph. Never invoke guard functions or data scrapers with unvalidated, missing parameters that can trigger runtime `TypeError: undefined` crashes.
- **Export Endpoint Parity:** Verify that both `/api/session/export` (Obsidian Markdown) and `/api/session/export-html` (Standalone HTML) dynamically reflect interim earnings release tags (`_Earnings_Release`) and frontmatter banners.
- **Strict Model Retention:** Verify that frontier model payloads (`gemini-4-argon`, `pro`) never downgrade in-flight to Flash during cluster saturation, routing transient delays to the 45-minute Auto-Resume cooldown queue.

---

## 4. Phase 3: The 2-Strike Anti-Thrashing Circuit Breaker

The classic LLM failure mode is the **"Fix-Break-Fix Death Spiral"**:
*Fix A causes Error B -> Fix B causes Error C -> Fix C causes Error D -> entire module breaks.*

This skill enforces a hard **2-Strike Circuit Breaker** to terminate this loop permanently:

```
                  [ Code Modification Applied ]
                               │
                      Does it pass Gates?
                     ┌─────────┴─────────┐
                    YES                  NO
                     │                   │
                 [ SUCCESS ]      [ STRIKE 1 ]
                                         │
                         Diagnose Root Cause & Apply
                         ONE Targeted Corrective Fix
                                         │
                               Does it pass Gates?
                              ┌──────────┴──────────┐
                             YES                    NO
                              │                     │
                          [ SUCCESS ]          [ STRIKE 2 ]
                                                    │
                                           ╔═════════════════════╗
                                           ║   CIRCUIT BREAKER   ║
                                           ║       TRIPPED       ║
                                           ╚═════════════════════╝
                                                    │
                                            1. Revert to git baseline
                                            2. Prohibit 3rd fix
                                            3. Report conflict to user
```

### Circuit Breaker Rules:
1. **Strike 1 (Single Corrective Attempt):**
   - If an applied change triggers a compiler, build, or runtime failure, analyze the root cause calmly.
   - You are permitted **ONE** targeted, corrective fix — and *only* if the exact failure mechanism is understood.
2. **Strike 2 (Circuit Breaker Tripped - Immediate Halt):**
   - If the first corrective fix fails or produces a secondary error:
     - **STOP IMMEDIATELY.** Do NOT attempt a 3rd speculative patch.
     - **Revert the Working Tree:** Execute `git restore .` (or `git checkout .`) to immediately return the codebase to the last known healthy git commit.
     - **Stop and Report:** Inform the user with complete transparency:
       - What change was attempted.
       - What exact failure was encountered.
       - Why the initial assumption or implementation path was flawed.
       - The recommended architectural alternative.
     - **Await human guidance** before attempting any further code modifications.

---

## 5. Phase 4: Git Synchronization Protocol (GEMINI.md)

In strict compliance with the **Core Terminal Directive** in [`GEMINI.md`](file:///c:/Users/Ronald/antigravity/Value-Investing-Terminal/GEMINI.md):

1. **Verification Prerequisite:**
   - Under no circumstances may code be committed or pushed if any tier of the Verification Gate fails.
2. **Atomic Git Commit:**
   - Stage only the verified, relevant files: `git add <files>`.
   - Commit with a clear, conventional commit message detailing the exact purpose of the change:
     `git commit -m "fix(module): surgical fix for [description]"`
3. **Synchronize to Remote:**
   - Execute `git push origin main`.
   - Confirm that the remote repository is fully up to date and synchronized.

---

## 6. Phase 5: Gemini 4 Argon & Long-Context Preview Model Protocol

When running high-capacity preview reasoning models (e.g., `models/gemini-4-argon`, `models/gemini-2.5-pro`) across heavy 150k+ token SEC filing contexts:

### 6.1 HTTP/2 Streaming Heartbeat Keep-Alive
- **The Undici 300s Timeout Trap:** Node.js native `fetch` / Undici enforces a strict 300-second (5-minute) HTTP/2 idle stream socket timeout (`UND_ERR_INFO: stream timeout after 300000`).
- **Mandatory Streaming:** The engine must invoke `ai.models.generateContentStream` with `thinkingConfig: { includeThoughts: true }`.
- **Heartbeat Mechanism:** Emitting thought chunks during extended multi-minute reasoning traces transmits HTTP/2 frames continuously, preventing socket abandonment while processing large filing payloads.
- **Thought Separation:** Chunks where `(part as any).thought === true` must NOT be appended to final dossier text; only non-thought content text is concatenated into `responseText`.

### 6.2 Two-Stage Ingestion Protocol & Tool-Free Closed-Universe Pipeline
- **Two-Stage Protocol:** `googleSearch` is strictly isolated to Pre-Flight Competitor Radar Harvesting (`/api/competitors/generate` on `gemini-3.8-flash`).
- **Tool-Free Pipeline Invariance:** All 12 main sequential pipeline steps run completely tool-free (`toolsConfig = undefined`) against staged filings, transcript, financials CSV, and pre-harvested `[TICKER]_Competitor_Radar.md`.
- **Cache Invariance Rationale:** Eliminating tool declarations guarantees the 300K+ token filing prefix hash remains 100% byte-for-byte invariant across all turns, securing the 80% cache discount and preventing socket close timeouts.

### 6.3 Adaptive Retry Degradation & Strict Model Retention
- If an `argon` or `pro` preview model encounters a transient error (`UND_ERR_INFO`, stream timeout, or `503 UNAVAILABLE`):
  - **Attempt 1:** Automatically step down `thinkingLevel` from `high` to `medium` and strip optional tools for in-flight recovery.
  - **Attempt 2+ (Strict Model Retention - Zero Flash Downgrade):** Under zero-compromise institutional execution, strictly prohibit falling back to `models/gemini-3.8-flash`. Escalate transient cluster saturation to the outer Auto-Resume cooldown queue (45s pacing for up to 45 minutes).
  - **Pre-Cache-Eviction Cutoff (45 Minutes):** If the cluster remains saturated for 45 minutes, halt execution before server-side context cache eviction and dispatch immediate multi-channel Telegram + Email alerts.

---

## 7. Native Implicit Prefix Caching & Model-Agnostic Execution Protocol
- **Implicit Cache Hit Optimization:** Structure all SEC filings, transcripts, and CSV datasets as an immutable prefix at the head of the request. All Gemini 2.5+ models automatically cache prefixes >= 4,096 tokens.
- **Prohibition on Forced Explicit Caching:** Never call `ai.caches.create` or block the pipeline awaiting cache confirmation. Preview models like `gemini-4-argon` reject explicit caching with HTTP 400.
- **Telemetry Invariance:** Track `usageMetadata.cachedContentTokenCount` to display verified implicit cache hits in terminal telemetry.
- **Weekly Documentation Currency:** Execute `npm run check:gemini-docs` weekly to audit live Gemini API model capabilities, supported actions, and caching policies.
- **Deterministic Source Document Manifest (`prepareFileContextParts`):** Because `fileData: { fileUri, mimeType }` parts do not expose local filenames (`f.name`) to the LLM, `prepareFileContextParts` prepends a deterministic `### Source Documents` manifest at index 0 listing exact staged filenames and categories so Step 1 Roll Calls never hallucinate filenames while keeping the prefix 100% invariant across all 12 steps. Verify `attachedFilesCount === expectedFiles.length` for the Zero-Drop Context Invariant.
- **Template Literal Backtick Escaping (`src/prompts.ts`):** Because `src/prompts.ts` stores master prompt text inside TypeScript template literals (`` text: `...` ``), never insert unescaped backticks (` `) inside prompt strings in `src/prompts.ts` (use single quotes `'...'` or escaped backticks `\`...\` `), as unescaped backticks prematurely terminate the template literal and break `tsc --noEmit` / `esbuild`.

---

## 8. Gemini Flex Tier Canary Probe & Automated Gatekeeper Architecture

When implementing or modifying features interacting with Google Gemini Flex Tier (`serviceTier: "flex"`):

1. **Micro-Token Cost & Pacing Law:**
   - Probes must strictly be 1 input token (`"ping"`) and 1 output token (`maxOutputTokens: 1`) on the target model, costing `<$0.000001`.
   - Never send large prompts or multi-token context payloads for health/readiness checks.

2. **12-Second Timeout Circuit Breaker:**
   - All canary probes must enforce a strict 12-second timeout (`Promise.race` with an unref'd timer).
   - If Google holds the connection in queue beyond 12s, the circuit breaker safely trips and categorizes the cluster as `saturated` (503 High Demand), preventing client hangs or UI freezes.

3. **RAM Caching Invariant (20s TTL):**
   - Live probe results must be cached in server RAM for at least 20 seconds (`PROBE_CACHE_TTL_MS = 20000`).
   - Back-to-back requests, re-renders, and component pollers must read directly from memory (`0ms`), permanently eliminating API rate limit exhaustion.

4. **Automated Background Gatekeeper (`startFlexWatcher`):**
   - When Google returns HTTP 503 (High Demand), the terminal does not abort; it transitions to the background watcher with 45-second pacing (up to 4 hours max wait).
   - The moment HTTP 200 clearance is verified on the target model, the Gatekeeper automatically dispatches execution (`runStepProcessor` for single-company or `batchManager.start()` for autonomous batch queue).
   - Dispatches instant multi-channel alerts (`flex_gatekeeper_launched`) to Telegram and Email upon clearance.

5. **Strict Model Retention Invariant (Zero Flash Downgrades):**
   - Never downgrade from `gemini-4-argon` to Flash or lower preview models during canary probes or execution retries.
   - The target model configured by the user must be strictly preserved across all probe attempts and pipeline steps.

6. **Non-Blocking Watcher Startup & Async Canary Probe:**
   - Registration endpoints (`/api/flex/wait-and-launch`) must respond immediately to the browser (`< 5ms`).
   - Probe #1 must be initiated asynchronously in the background (`setTimeout(runProbe, 50)`). Never await the 12-second probe synchronously inside the HTTP request handler, which causes client UI freezing.

7. **Frontend Instant Feedback & Lockout:**
   - Engagement buttons immediately enter disabled/loading states upon click (`flexEngaging`, `runStarting`) with animated spinners and dynamic status text, preventing double-clicks.
   - The Gemini Flex Gatekeeper Active Monitoring HUD mounts on click (`(flexWatcher?.isWaiting || flexEngaging)`).

8. **Universal Dual-Polling Loop & Auto-Transition Hook:**
   - Frontend enforces a dual-interval polling loop (2s active/waiting/engaging, 5s heartbeat).
   - Detects the watcher transition from `isWaiting: true` to `false` and immediately fetches session state, seamlessly switching the UI into the running console without requiring a page reload.

9. **Re-Entrancy Cooldown Shield & Global Process Crash Guards:**
   - Step execution routes (`/api/session/step/run`) return safe 200 OK no-ops when already running or retrying, preserving Auto-Resume cooldown timers against accidental clicks.
   - Server runtimes (`server.ts`, `server.cloud.ts`) register `process.on('unhandledRejection')` and `process.on('uncaughtException')` shields to prevent process termination on transient socket aborts.

10. **Flex Tier Sovereignty & User-Authorized Escalation Invariant:**
    - The terminal must NEVER unilaterally upgrade or step up an active analysis from `flex` to `standard` tier.
    - If transient cluster saturation (`503 UNAVAILABLE`) or stream disconnects occur, the engine strictly maintains `serviceTier: "flex"` and enters the 45-minute Auto-Resume cooldown queue (`60 retries × 45s = 45m`) prior to context cache eviction.
    - Escalation to Standard tier is strictly gated behind explicit user authorization via the UI's "Switch to Standard" button (`POST /api/session/retry-standard`).
    - Dispatches an instant Telegram cooldown alert (`⏳ Flex Tier Cooldown`) on Attempt 1 with the exact error cause, followed by an instant recovery alert (`✅ Valuation Back on Track`) upon step completion.

