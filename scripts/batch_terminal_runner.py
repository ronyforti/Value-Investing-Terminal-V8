import os
import sys
import glob
import json
import time
import argparse
import datetime
from dotenv import load_dotenv

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(REPO_ROOT, ".env"))
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")

from google import genai
from google.genai import types

class AutomatedBatchTerminalRunner:
    """
    Stage 3: Automated Batch Execution Runner for Value Investing Terminal.
    Runs unattended, end-to-end multi-tier master prompt audits on high-conviction
    candidates vetted by Stage 1 (Enhanced Screener) and Stage 2 (Local Gemma 4 Triage).
    """

    def __init__(self, staging_dir: str = r"G:\My Drive\Company Data\_STAGING",
                 cache_dir: str = r"C:\Users\Ronald\Downloads\Cache\TTM_Output_20260821",
                 vault_dossier_dir: str = r"G:\My Drive\Company Data\GTD_Investing_Journal\GTD_Investment_Latticework_Organized\02 AI_Terminal",
                 prompts_path: str = None,
                 system_instruction_path: str = None,
                 model_name: str = "gemini-3.8-flash"):
        self.repo_root = REPO_ROOT
        self.staging_dir = staging_dir
        self.cache_dir = cache_dir
        self.vault_dossier_dir = vault_dossier_dir
        self.prompts_path = prompts_path or os.path.join(self.repo_root, "prompts.json")
        self.system_instruction_path = system_instruction_path or os.path.join(self.repo_root, "system_instructions.txt")
        self.model_name = model_name
        self.client = genai.Client(api_key=api_key, http_options={'timeout': 600000})
        self.prompts = self.load_prompts()
        self.system_instruction = self.load_system_instruction()
        os.makedirs(self.vault_dossier_dir, exist_ok=True)

    def load_system_instruction(self) -> str:
        if os.path.exists(self.system_instruction_path):
            with open(self.system_instruction_path, 'r', encoding='utf-8') as f:
                return f.read().strip()
        return ""

    def load_prompts(self) -> list:
        if os.path.exists(self.prompts_path):
            with open(self.prompts_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            raise FileNotFoundError(f"Prompts file not found at: {self.prompts_path}")

    def get_dynamic_temp(self, prompt_index: int) -> float:
        if 0 <= prompt_index <= 6:
            return 0.2
        elif 7 <= prompt_index <= 11:
            return 0.0
        elif 12 <= prompt_index <= 15:
            return 0.5
        return 0.2

    def sanitize_terminal_csv(self, csv_path: str, symbol: str, currency_action: str = "harmonize") -> str:
        """
        Audits CSV via CurrencyGuard, displays the notification box, and applies
        harmonization across 160+ world currencies.
        """
        try:
            from currency_guard import CurrencyGuard
            cg = CurrencyGuard()
            audit = cg.audit_csv(csv_path, symbol)
            if audit["requires_action"]:
                if currency_action == "ask":
                    decision = cg.prompt_user_decision(audit, auto_confirm=False)
                    if decision == "harmonize":
                        return cg.harmonize_csv(audit, output_dir=os.path.join(self.staging_dir, "sanitized_csv"))
                    elif decision == "abort":
                        raise KeyboardInterrupt("Execution aborted by user at currency audit.")
                    return csv_path
                else:
                    cg.print_audit_box(audit)
                    clean_csv = cg.harmonize_csv(audit, output_dir=os.path.join(self.staging_dir, "sanitized_csv"))
                    print(f"    [Currency Guard] Harmonized clean CSV saved to:\n    {clean_csv}\n")
                    return clean_csv
            else:
                cg.print_audit_box(audit)
        except KeyboardInterrupt as ki:
            raise ki
        except Exception as e:
            print(f"    [Currency Guard Warning] {e}")
        return csv_path

    def locate_company_documents(self, symbol: str) -> dict:
        """
        Finds 10-K, 10-Q, transcript, and TTM CSV for target symbol in _STAGING and Cache.
        """
        symbol_upper = symbol.upper()
        docs = {
            "csv": None,
            "annual": None,
            "quarterly": None,
            "transcript": None,
            "all_files": []
        }

        # 1. Locate 40Q TTM CSV in cache and harmonize currencies
        csv_candidates = glob.glob(os.path.join(self.cache_dir, f"{symbol_upper} *Financials-TTM.csv"))
        if not csv_candidates:
            csv_candidates = glob.glob(os.path.join(self.cache_dir, f"{symbol_upper}.csv"))
        if csv_candidates:
            harmonized_csv = self.sanitize_terminal_csv(csv_candidates[0], symbol_upper)
            docs["csv"] = harmonized_csv
            docs["all_files"].append(harmonized_csv)

        # 2. Locate filings in _STAGING
        staging_files = glob.glob(os.path.join(self.staging_dir, "*.*"))
        # Check for zip archives in staging (e.g. "STNG Q2-26 Docs.zip")
        zip_candidates = glob.glob(os.path.join(self.staging_dir, f"{symbol_upper}*Docs*.zip"))
        for zpath in zip_candidates:
            try:
                import zipfile
                extract_target = os.path.join(self.staging_dir, f"unzipped_{symbol_upper}")
                os.makedirs(extract_target, exist_ok=True)
                with zipfile.ZipFile(zpath, 'r') as zf:
                    zf.extractall(extract_target)
                staging_files.extend(glob.glob(os.path.join(extract_target, "*.*")))
            except Exception:
                pass

        # Also check subdirectories in _STAGING
        subdirs = [os.path.join(self.staging_dir, d) for d in os.listdir(self.staging_dir) if os.path.isdir(os.path.join(self.staging_dir, d))]
        for sd in subdirs:
            if symbol_upper in os.path.basename(sd).upper():
                staging_files.extend(glob.glob(os.path.join(sd, "*.*")))

        for fpath in staging_files:
            fn = os.path.basename(fpath).lower()
            if symbol_upper.lower() in fn:
                if any(k in fn for k in ["10-k", "10k", "20-f", "20f", "annual"]):
                    docs["annual"] = fpath
                    docs["all_files"].append(fpath)
                elif any(k in fn for k in ["10-q", "10q", "6-k", "6k", "quarterly"]):
                    docs["quarterly"] = fpath
                    docs["all_files"].append(fpath)
                elif any(k in fn for k in ["transcript", "call", "earnings"]):
                    docs["transcript"] = fpath
                    docs["all_files"].append(fpath)

        # Deduplicate files by basename
        seen_basenames = set()
        unique_files = []
        for fp in docs["all_files"]:
            bn = os.path.basename(fp).lower()
            if bn not in seen_basenames:
                seen_basenames.add(bn)
                unique_files.append(fp)
        docs["all_files"] = unique_files
        return docs

    def run_audit(self, docs: dict) -> bool:
        """
        Mandatory audit: verifies presence of minimum filings.
        """
        has_csv = bool(docs["csv"])
        has_filings = bool(docs["annual"] or docs["quarterly"] or docs["transcript"])
        return has_csv and has_filings

    def upload_files_to_gemini(self, file_paths: list) -> list:
        uploaded_handles = []
        for fp in file_paths:
            print(f"    Uploading: {os.path.basename(fp)}...")
            try:
                handle = self.client.files.upload(file=fp)
                uploaded_handles.append(handle)
            except Exception as e:
                print(f"    [Warning] Failed to upload {fp} via File API: {e}")
                # Fallback: if it's text/csv, read contents
                if fp.endswith('.csv') or fp.endswith('.txt') or fp.endswith('.md'):
                    try:
                        with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
                            uploaded_handles.append(f"[File: {os.path.basename(fp)}]\n" + f.read())
                    except Exception:
                        pass
        return uploaded_handles

    def execute_company_dossier(self, symbol: str, price: float = None) -> dict:
        """
        Executes complete multi-step Master Prompt valuation on a single company.
        """
        print(f"\n{'='*70}")
        print(f"  EXECUTING TERMINAL VALUATION AUDIT: {symbol.upper()}")
        print(f"{'='*70}")

        docs = self.locate_company_documents(symbol)
        print(f"  Found {len(docs['all_files'])} staged source files:")
        for f in docs['all_files']:
            print(f"   - {os.path.basename(f)}")

        if not docs["csv"]:
            print(f"  [Error] No 40Q TTM CSV found for {symbol}. Skipping.")
            return {"symbol": symbol, "status": "Failed: Missing TTM CSV"}

        print(f"  Uploading context files to Gemini...")
        file_contexts = self.upload_files_to_gemini(docs["all_files"])

        chat_config = types.GenerateContentConfig(system_instruction=self.system_instruction) if self.system_instruction else None
        chat = self.client.chats.create(model=self.model_name, config=chat_config)
        step_outputs = []

        start_time = time.time()
        for idx, prompt_text in enumerate(self.prompts):
            step_title = f"Step {idx+1}/{len(self.prompts)}"
            temp = self.get_dynamic_temp(idx)
            print(f"\n  [{step_title}] Generating analysis (Temp: {temp})...")

            # First prompt includes the file handles in contents
            if idx == 0:
                contents = file_contexts + [prompt_text]
            else:
                contents = [prompt_text]

            max_retries = 3
            step_resp_text = ""
            for attempt in range(max_retries):
                try:
                    response = chat.send_message(
                        message=contents,
                        config=types.GenerateContentConfig(
                            thinking_config=types.ThinkingConfig(thinking_level="high"),
                            max_output_tokens=8192
                        )
                    )
                    step_resp_text = response.text.strip()
                    break
                except Exception as e:
                    print(f"    [Retry {attempt+1}/{max_retries}] Error: {e}")
                    time.sleep(5 * (attempt + 1))

            if not step_resp_text:
                step_resp_text = "*(Execution error or empty response from model)*"

            print(f"    Done ({len(step_resp_text)} chars).")
            step_outputs.append({
                "step_index": idx + 1,
                "prompt": prompt_text[:120] + "...",
                "response": step_resp_text
            })
            time.sleep(2) # Gentle rate-limit pause

        # Clean up uploaded files in Gemini Cloud
        for h in file_contexts:
            try:
                if hasattr(h, 'name'):
                    self.client.files.delete(name=h.name)
            except Exception:
                pass

        total_time = round(time.time() - start_time, 2)
        print(f"\n  Completed full {len(self.prompts)}-step audit in {total_time}s.")

        # Save Dossier Markdown
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        dossier_filename = f"{symbol.upper()}_Deep_Valuation_Dossier_{timestamp}.md"
        dossier_path = os.path.join(self.vault_dossier_dir, dossier_filename)

        md = []
        md.append("---")
        md.append(f"tags: [terminal_dossier, deep_valuation, {symbol.lower()}, prompt_v6_2, institutional_memo]")
        md.append(f"ticker: {symbol.upper()}")
        md.append(f"audit_date: {date_str}")
        md.append(f"model_used: {self.model_name}")
        md.append(f"execution_time_seconds: {total_time}")
        md.append("---\n")
        md.append(f"# 🦁 {symbol.upper()} Comprehensive Value Investing Dossier")
        md.append(f"> **Target Company:** `{symbol.upper()}` | **Audit Date:** {date_str} | **Engine:** Value Investing Terminal ({self.model_name})")
        md.append(f"> **Ground Truth Filings Attached:** {', '.join([os.path.basename(x) for x in docs['all_files']])}\n")

        for s in step_outputs:
            md.append(f"\n## 🏛️ Step {s['step_index']}: Analytical Section Output\n")
            md.append(s['response'])
            md.append("\n---\n")

        with open(dossier_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(md))

        print(f"  [Obsidian Vault] Saved completed dossier to:\n   {dossier_path}")
        return {
            "symbol": symbol,
            "status": "Success",
            "dossier_path": dossier_path,
            "time_seconds": total_time
        }

    def run_batch_queue(self, tickers: list):
        """
        Processes a list of tickers sequentially unattended.
        """
        print(f"\n======================================================================")
        print(f"  STARTING UNATTENDED TERMINAL BATCH RUN FOR {len(tickers)} COMPANIES")
        print(f"  Queue: {', '.join(tickers)}")
        print(f"======================================================================")

        batch_results = []
        batch_start = time.time()

        for i, tkr in enumerate(tickers, 1):
            print(f"\n>>> Processing Queue Item [{i}/{len(tickers)}]: {tkr.upper()} <<<")
            res = self.execute_company_dossier(tkr)
            batch_results.append(res)

        total_batch_time = round((time.time() - batch_start) / 60.0, 2)
        print(f"\n======================================================================")
        print(f"  ALL BATCH DOSSIERS COMPLETED IN {total_batch_time} MINUTES")
        print(f"======================================================================")

        # Update Master Ledger
        ledger_path = os.path.join(self.vault_dossier_dir, "Batch_Execution_Master_Ledger.md")
        ledger_exists = os.path.exists(ledger_path)

        ledger_entry = []
        if not ledger_exists:
            ledger_entry.append("# 📋 Value Investing Terminal Master Batch Ledger\n")
            ledger_entry.append("| Date | Ticker | Status | Execution Time | Dossier Link |")
            ledger_entry.append("| :--- | :--- | :--- | :--- | :--- |")

        date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        for r in batch_results:
            dossier_link = f"[[{os.path.basename(r.get('dossier_path', ''))}]]" if r.get('status') == 'Success' else "N/A"
            ledger_entry.append(f"| {date_str} | **{r['symbol'].upper()}** | `{r['status']}` | {r.get('time_seconds', 0):.1f}s | {dossier_link} |")

        with open(ledger_path, 'a', encoding='utf-8') as f:
            f.write("\n" + "\n".join(ledger_entry))

        print(f"Master ledger updated at: {ledger_path}")
        return batch_results

def main():
    parser = argparse.ArgumentParser(description="Automated Value Investing Terminal Batch Runner")
    parser.add_argument("--tickers", type=str, help="Comma-separated list of tickers (e.g. DXC,WLKP,FMX)")
    parser.add_argument("--shortlist-csv", type=str, help="Path to Gemma 4 Triage Shortlist CSV file")
    parser.add_argument("--model", type=str, default="gemini-3.8-flash", help="Gemini model to use (default: gemini-3.8-flash)")
    args = parser.parse_args()

    ticker_list = []
    if args.tickers:
        ticker_list = [t.strip().upper() for t in args.tickers.split(",") if t.strip()]
    elif args.shortlist_csv and os.path.exists(args.shortlist_csv):
        import pandas as pd
        df = pd.read_csv(args.shortlist_csv)
        if "Triage Decision" in df.columns:
            promoted = df[df["Triage Decision"] == "PROMOTE TO TERMINAL"]
            ticker_list = promoted["Ticker"].tolist()
        else:
            ticker_list = df["Ticker"].tolist()
    else:
        print("Please provide either --tickers or --shortlist-csv")
        return

    runner = AutomatedBatchTerminalRunner(model_name=args.model)
    runner.run_batch_queue(ticker_list)

if __name__ == "__main__":
    main()
