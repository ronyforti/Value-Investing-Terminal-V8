<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Value Investing Terminal

A high-performance equity research and fundamental valuation terminal powered by Google Gemini AI, SEC EDGAR real-time filings, Financial Modeling Prep (FMP), and automated earnings transcripts.

---

## Quick Start for Collaborators

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ or v26+ recommended)
- **Git**

### 2. Installation
Clone this repository and install project dependencies:
```bash
git clone <repository-url>
cd Value-Investing-Terminal
npm install
```

### 3. Configure Environment Variables
Copy the template configuration file:
```bash
cp .env.example .env
```
Open `.env` and fill in your keys:
- `GEMINI_API_KEY`: Your personal Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey)).
- `FMP_API_KEY`: (Optional) Your Financial Modeling Prep key for automatic balance sheets, income statements, and cash flows.
- `STOCK_ANALYSIS_EMAIL` & `STOCK_ANALYSIS_PASSWORD`: (Optional) For automated transcript retrieval.

> **Note**: API keys can also be entered directly into the terminal UI inside the browser and will be stored securely in your browser's `localStorage`.

### 4. Start the Terminal
Run the local development server:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`**.

---

## Available Scripts

- **`npm run dev`**: Starts the development server with Vite hot-module replacement and the Express backend.
- **`npm run lint`**: Runs TypeScript static typechecking (`tsc --noEmit`) to verify 0 compiler errors.
- **`npm run build`**: Compiles the production frontend bundle and bundles the backend server into `dist/server.cjs`.
- **`npm start`**: Runs the compiled production server (`node dist/server.cjs`).
- **`npm run package:cloud`**: Packages a ready-to-run zip archive for deployment to Google AI Studio.

---

## Security & Privacy Notice
- **Zero Credential Commits**: Never commit `.env` or `.env.local` files to Git. All secret files are strictly ignored by `.gitignore`.
- **Local Staging**: Staged documents (10-Ks, 10-Qs, transcripts) and compiled dossiers are stored locally or in your private Google Drive and are never committed to version control.