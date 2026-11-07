# Value Investing Terminal: Backup & Deployment Locations

## 1. Directory Separation & Purpose
- **Local Workstation Backups (Local Terminal):**
  - **Directory:** `G:\My Drive\Company Data\GTD_terminal\local_Value_Investing_Terminal\`
  - Contains complete backups of the local Windows workstation version (`npm run backup` / `backup_to_gdrive.bat`).
  - Includes local configuration, full source code, and local model capabilities (Ollama + Gemini).
  - Standard naming: `Value-Investing-Terminal_backup_[YYYYMMDD_HHMMSS].zip`.

- **Google AI Studio Cloud Deployments:**
  - **Directory:** `G:\My Drive\Company Data\GTD_terminal\Forti Cap Val Investing Terminal\`
  - Reserved strictly for cloud packages intended to be uploaded to Google AI Studio.
  - Standard naming: `value-investing-terminal-cloud-AiStudio-updated-[date].zip`.

## 2. Rule: Zero Ollama in AI Studio Cloud Builds
- **Strict Prohibition:** Ollama is only installed locally on the workstation and is NOT available in AI Studio.
- **Packaging for AI Studio:**
  - Whenever preparing or updating an AI Studio package in `Forti Cap Val Investing Terminal`, **NEVER** include Ollama imports, Ollama helper functions, Ollama model calls, or Ollama fallback logic.
  - `server.ts` must rely 100% on the official Gemini SDK (`@google/genai`).
  - Always verify that an automated text scan returns **0 occurrences** of `ollama` across all source code files in the cloud zip.
  - Respect the AI Studio container layout: include `metadata.json` and mirrored root files (`types.ts`, `documentGuard.ts`, `currencyGuard.ts`).
