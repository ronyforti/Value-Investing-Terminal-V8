// CSS stylesheet module for Terminal V7 Interactive FCOM
module.exports = `
:root {
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --border-card: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;
  --accent-emerald: #059669;
  --accent-blue: #2563eb;
  --accent-amber: #d97706;
  --accent-rose: #e11d48;
  --table-header-bg: #f8fafc;
  --table-row-alt: #f1f5f9;
  --code-bg: #f1f5f9;
  --sidebar-w: 320px;
}

[data-theme="dark"] {
  --bg-page: #0b0f17;
  --bg-card: #111827;
  --border-card: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --accent-emerald: #10b981;
  --accent-blue: #3b82f6;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  --table-header-bg: #1a2234;
  --table-row-alt: #131b2c;
  --code-bg: #0d131f;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: var(--bg-page);
  color: var(--text-primary);
  line-height: 1.6;
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Header & HUD */
.cockpit-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-card);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
}
.cockpit-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.cockpit-title h1 {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.hud-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.72rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: var(--code-bg);
  color: var(--accent-emerald);
  border: 1px solid var(--border-card);
  font-weight: 600;
}
.cockpit-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid var(--border-card);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s;
}
.btn:hover {
  border-color: var(--accent-emerald);
  color: var(--accent-emerald);
}
.btn-primary {
  background: var(--accent-emerald);
  color: #fff !important;
  border-color: var(--accent-emerald);
}
.btn-primary:hover {
  filter: brightness(1.1);
}

/* Layout */
.app-container {
  display: flex;
  min-height: calc(100vh - 58px);
}
.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  position: sticky;
  top: 58px;
  height: calc(100vh - 58px);
  overflow-y: auto;
  border-right: 1px solid var(--border-card);
  background: var(--bg-card);
  padding: 1.25rem 1rem;
}
.search-box {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-card);
  background: var(--code-bg);
  color: var(--text-primary);
  font-size: 0.82rem;
  margin-bottom: 1rem;
}
.nav-group-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin: 1.2rem 0 0.4rem 0.5rem;
}
.nav-link {
  display: block;
  padding: 0.4rem 0.6rem;
  font-size: 0.83rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 4px;
  border-left: 2px solid transparent;
  transition: all 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-link:hover {
  color: var(--text-primary);
  background: var(--code-bg);
}
.nav-link.active {
  color: var(--accent-emerald);
  font-weight: 600;
  background: var(--code-bg);
  border-left-color: var(--accent-emerald);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2.5rem 3.5rem;
  max-width: 1100px;
}
section {
  margin-bottom: 4rem;
  scroll-margin-top: 80px;
}
h2 {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-card);
  padding-bottom: 0.5rem;
}
h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 1.75rem 0 0.75rem 0;
  color: var(--text-primary);
}
p {
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

/* Cards & Alerts */
.callout {
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border-left: 4px solid var(--accent-emerald);
  background: var(--code-bg);
  margin: 1.25rem 0;
}
.callout-warning {
  border-left-color: var(--accent-amber);
}
.callout-critical {
  border-left-color: var(--accent-rose);
}
.callout h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

/* Accordions for Prompts */
details.prompt-accordion {
  border: 1px solid var(--border-card);
  border-radius: 8px;
  margin-bottom: 1rem;
  background: var(--bg-card);
  overflow: hidden;
}
details.prompt-accordion summary {
  padding: 0.9rem 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 0.95rem;
  background: var(--bg-card);
  user-select: none;
}
details.prompt-accordion summary:hover {
  background: var(--code-bg);
}
.accordion-body {
  padding: 1.25rem;
  border-top: 1px solid var(--border-card);
  background: var(--bg-card);
}
.voice-tag {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}
.voice-strategic {
  background: rgba(37, 99, 235, 0.12);
  color: var(--accent-blue);
  border: 1px solid rgba(37, 99, 235, 0.3);
}
.voice-forensic {
  background: rgba(225, 29, 72, 0.12);
  color: var(--accent-rose);
  border: 1px solid rgba(225, 29, 72, 0.3);
}

/* Code Blocks & Raw Prompts */
pre {
  background: var(--code-bg);
  border: 1px solid var(--border-card);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85rem;
  color: var(--text-primary);
  position: relative;
  margin: 1rem 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.72rem;
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  color: var(--text-secondary);
  cursor: pointer;
}
.copy-btn:hover {
  color: var(--accent-emerald);
  border-color: var(--accent-emerald);
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.25rem 0;
  font-size: 0.875rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 6px;
  overflow: hidden;
}
th {
  background: var(--table-header-bg);
  text-align: left;
  padding: 0.65rem 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-card);
}
td {
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid var(--border-card);
  color: var(--text-secondary);
}
tr:nth-child(even) td {
  background: var(--table-row-alt);
}

/* Toast */
#toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--accent-emerald);
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 200;
}
#toast.show { opacity: 1; }

/* Architectural Pipeline Cards & Flow */
.upgrade-pipeline {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.upgrade-pipeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-card);
}
.upgrade-pipeline-title {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.upgrade-flow-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.upgrade-card {
  background: var(--code-bg);
  border: 1px solid var(--border-card);
  border-left: 4px solid var(--accent-emerald);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  transition: transform 0.15s, border-color 0.15s;
}
.upgrade-card:hover {
  border-color: var(--accent-emerald);
}
.upgrade-card.card-blue {
  border-left-color: var(--accent-blue);
}
.upgrade-card.card-amber {
  border-left-color: var(--accent-amber);
}
.upgrade-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.upgrade-card-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}
.upgrade-pill-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.flow-node {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.flow-arrow {
  color: var(--accent-emerald);
  font-weight: 800;
  font-size: 0.9rem;
}
.pipeline-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 14px;
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: -0.2rem 0;
}

@media (max-width: 900px) {
  .app-container { flex-direction: column; }
  .sidebar { width: 100%; height: auto; position: relative; top: 0; }
  .main-content { padding: 1.5rem 1rem; }
}

@media print {
  .cockpit-header, .sidebar, .copy-btn, #toast { display: none !important; }
  .main-content { max-width: 100%; padding: 0; }
  body { background: #fff !important; color: #000 !important; }
  details.prompt-accordion { border: 1px solid #ccc; break-inside: avoid; }
  details.prompt-accordion[open] .accordion-body { display: block; }
}
`;
