import os
import sys
import glob
import json
import time
import argparse
import requests
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def get_env_var(var_name: str) -> str:
    val = os.getenv(var_name)
    if val:
        return val
    search_paths = [
        r"G:\My Drive\Company Data\GTD_terminal\.env",
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        os.path.join(os.getcwd(), ".env")
    ]
    for p in search_paths:
        if os.path.exists(p):
            load_dotenv(p)
            val = os.getenv(var_name)
            if val:
                return val
    return ""

FMP_API_KEY = get_env_var("FMP_API_KEY")
GEMINI_API_KEY = get_env_var("GEMINI_API_KEY")

class MoatTriageEngine:
    """
    Stage 2: AI Moat & Red Flag Triage Engine.
    Supports either local Gemma 4 (via Ollama) or Gemini 3.8 Flash (via Google GenAI SDK).
    """

    def __init__(self, engine: str = "gemini", model: str = None,
                 ollama_url: str = "http://localhost:11434",
                 cache_dir: str = r"C:\Users\Ronald\Downloads\Cache\TTM_Output_20260821"):
        self.engine = engine.lower()
        self.ollama_url = ollama_url
        self.cache_dir = cache_dir
        self.fmp_key = FMP_API_KEY
        self.gemini_key = GEMINI_API_KEY
        self.profile_cache = {}

        if self.engine == "gemini":
            self.model = model if model else "gemini-3.8-flash"
            from google import genai
            from google.genai import types
            self.types = types
            if not self.gemini_key:
                raise ValueError("GEMINI_API_KEY is required to run with the Gemini engine.")
            self.client = genai.Client(api_key=self.gemini_key)
        else:
            self.model = model if model else "gemma4:e4b"
            self.client = None

    def fetch_company_description(self, symbol: str) -> dict:
        """
        Retrieves company profile, description, and business model summary via FMP or local cache.
        """
        if symbol in self.profile_cache:
            return self.profile_cache[symbol]

        profile = {
            "name": symbol,
            "description": "Business profile not available.",
            "sector": "Unknown",
            "industry": "Unknown"
        }

        if self.fmp_key:
            url = f"https://financialmodelingprep.com/stable/profile?symbol={symbol}&apikey={self.fmp_key}"
            try:
                r = requests.get(url, timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    if isinstance(data, list) and len(data) > 0:
                        p = data[0]
                        profile["name"] = p.get("companyName", symbol)
                        profile["description"] = p.get("description", "No description provided.")
                        profile["sector"] = p.get("sector", "Unknown")
                        profile["industry"] = p.get("industry", "Unknown")
            except Exception:
                pass

        self.profile_cache[symbol] = profile
        return profile

    def extract_financial_context(self, file_path: str) -> dict:
        """
        Extracts multi-year revenue, gross margin, and cash flow trends from the 40Q TTM CSV.
        """
        try:
            df = pd.read_csv(file_path, header=None, dtype=str)
            rev_row = []
            gp_row = []
            fcf_row = []
            net_inc_row = []

            curr_section = None
            for idx, row in df.iterrows():
                val0 = str(row[0]).strip()
                if 'Statement:' in val0:
                    curr_section = val0.replace(':', '').strip()
                elif val0 == 'revenue':
                    rev_row = [float(x) for x in row[1:5] if pd.notna(x) and str(x).replace('-','').replace('.','').isdigit()]
                elif val0 == 'grossProfit':
                    gp_row = [float(x) for x in row[1:5] if pd.notna(x) and str(x).replace('-','').replace('.','').isdigit()]
                elif val0 == 'netIncome':
                    net_inc_row = [float(x) for x in row[1:5] if pd.notna(x) and str(x).replace('-','').replace('.','').isdigit()]

            # Gross margins
            gm_trend = []
            for r, g in zip(rev_row, gp_row):
                if r > 0:
                    gm_trend.append(round((g / r) * 100.0, 1))

            return {
                "recent_revenues": rev_row,
                "gross_margin_trend": gm_trend,
                "recent_net_income": net_inc_row
            }
        except Exception:
            return {"recent_revenues": [], "gross_margin_trend": [], "recent_net_income": []}

    def query_llm(self, prompt: str) -> str:
        """
        Routes prompt to either Gemini Cloud SDK or local Ollama.
        """
        if self.engine == "gemini":
            return self._query_gemini(prompt)
        else:
            return self._query_ollama(prompt)

    def _query_gemini(self, prompt: str) -> str:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=self.types.GenerateContentConfig(
                        thinking_config=self.types.ThinkingConfig(thinking_level="high"),
                    )
                )
                if response and response.text:
                    return response.text.strip()
                return "Error: Empty response from Gemini API"
            except Exception as e:
                if attempt < max_retries - 1:
                    time.sleep(2 * (attempt + 1))
                else:
                    return f"Gemini API Error: {str(e)}"

    def _query_ollama(self, prompt: str) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_predict": 2048
            }
        }
        try:
            r = requests.post(f"{self.ollama_url}/api/generate", json=payload, timeout=180)
            if r.status_code == 200:
                return r.json().get("response", "").strip()
            else:
                return f"Error from Ollama API: HTTP {r.status_code}"
        except Exception as e:
            return f"Failed to connect to local Ollama: {str(e)}"

    def triage_candidate(self, candidate_data: dict) -> dict:
        """
        Evaluates a single screened candidate with Gemma 4 or Gemini 3.8 Flash.
        """
        symbol = candidate_data.get("Ticker") or candidate_data.get("symbol")
        fpath = candidate_data.get("File Path") or candidate_data.get("file_path")
        price = candidate_data.get("Market Price", 0.0)
        mcap = candidate_data.get("Market Cap ($M)", 0.0)
        epv = candidate_data.get("Zero-Growth EPV ($)", 0.0)
        dcf = candidate_data.get("Owner Earnings DCF ($)", 0.0)
        roic = candidate_data.get("5-Yr ROIC %") or candidate_data.get("ROIC TTM %", 0.0)
        rorc = candidate_data.get("RORC %") or candidate_data.get("3-Yr RORC %", 0.0)
        fcf_yield = candidate_data.get("OE Yield %") or candidate_data.get("FCF Yield %", 0.0)
        archetype = candidate_data.get("Hunting Ground") or candidate_data.get("Archetype", "Unknown")
        verdict = candidate_data.get("Status") or candidate_data.get("Action Verdict", "")

        if (not fpath or not os.path.exists(str(fpath))) and symbol:
            cands = glob.glob(os.path.join(self.cache_dir, f"{symbol.upper()} *Financials-TTM.csv"))
            if not cands:
                cands = glob.glob(os.path.join(self.cache_dir, f"{symbol.upper()}.csv"))
            if cands:
                fpath = cands[0]

        profile = self.fetch_company_description(symbol)
        fin_context = {}
        if fpath and os.path.exists(fpath):
            fin_context = self.extract_financial_context(fpath)

        prompt = f"""You are Charlie Munger and Warren Buffett performing a strict qualitative triage on a company that passed a quantitative value screen.

Company: {symbol} - {profile['name']}
Sector: {profile['sector']} | Industry: {profile['industry']} | Archetype: {archetype}
Market Cap: ${mcap}M | Current Price: ${price}
Quantitative Metrics:
- Zero-Growth EPV: ${epv}
- Owner Earnings DCF: ${dcf}
- FCF Yield: {fcf_yield}%
- ROIC TTM: {roic}%
- 3-Year RORC: {rorc}%
- Gross Margin History: {fin_context.get('gross_margin_trend', 'N/A')}%
- Quantitative Screener Verdict: {verdict}

Business Description:
{profile['description'][:1500]}

MANDATORY TRIAGE ASSESSMENT:
1. Moat & Pricing Power: Does this company have a durable moat (network effects, patents/licenses, high switching costs, low-cost advantage) or is it a commoditized price-taker?
2. Red Flag / Value-Trap Vulnerability: Is this business facing secular decline, technological obsolescence, customer concentration, or peak cyclical risk?
3. Capital Allocation & Reinvestment: Does it generate real free cash flow that management reinvests intelligently, or is this a cash-trap?

FINAL DECISION (You MUST output either [APPROVED: PROMOTE TO TERMINAL] or [REJECTED: DISQUALIFIED] on its own line at the end):
- Output [APPROVED: PROMOTE TO TERMINAL] ONLY if it has a durable moat, pricing power, and high probability of business durability.
- Output [REJECTED: DISQUALIFIED] if it lacks competitive advantages, is a cyclical commodity, or faces secular disruption.

Provide 3 concise bullet points explaining your rationale, followed by your final decision."""

        triage_text = self.query_llm(prompt)

        promoted = "APPROVED" in triage_text.upper() or "PROMOTE TO TERMINAL" in triage_text.upper()
        decision_label = "APPROVED: PROMOTE TO TERMINAL" if promoted else "REJECTED: DISQUALIFIED"

        return {
            "Ticker": symbol,
            "Company Name": profile['name'],
            "Industry": profile['industry'],
            "Archetype": archetype,
            "Price": price,
            "Market Cap ($M)": mcap,
            "EPV ($)": epv,
            "DCF ($)": dcf,
            "ROIC %": roic,
            "FCF Yield %": fcf_yield,
            "Triage Decision": decision_label,
            "Rationale": triage_text,
            "File Path": fpath
        }

    def run_triage_batch(self, screener_csv_path: str, output_dir: str = None, top_n: int = 20,
                         group_filter: str = None, min_roic: float = None, sort_by: str = None,
                         include_tickers: list = None) -> tuple:
        """
        Reads screener results and triages top candidates using selected LLM engine.
        """
        if not os.path.exists(screener_csv_path):
            print(f"Error: Screener CSV not found at {screener_csv_path}")
            return [], ""

        df = pd.read_csv(screener_csv_path)
        if include_tickers:
            match_df = df[df['Ticker'].isin(include_tickers)].copy()
            if not match_df.empty:
                match_df['order_key'] = match_df['Ticker'].apply(lambda x: include_tickers.index(x) if x in include_tickers else 999)
                actionable_df = match_df.sort_values(by='order_key').drop(columns=['order_key'])
            else:
                actionable_df = df.copy()
        elif group_filter:
            if 'Verdict Group' in df.columns:
                actionable_df = df[df['Verdict Group'] == group_filter].copy()
            elif 'Status' in df.columns:
                actionable_df = df[df['Status'].str.contains(group_filter, na=False)].copy()
            else:
                actionable_df = df.copy()
        elif 'Verdict Group' in df.columns:
            actionable_mask = df['Verdict Group'].isin(["Dual Green Light", "EPV Green Light", "DCF Green Light", "Watchlist"])
            actionable_df = df[actionable_mask].copy()
        elif 'Status' in df.columns:
            actionable_mask = df['Status'].str.contains("BUY ZONE", na=False)
            actionable_df = df[actionable_mask].copy()
        else:
            actionable_df = df.copy()

        if min_roic is not None:
            roic_col = '5-Yr ROIC %' if '5-Yr ROIC %' in actionable_df.columns else 'ROIC TTM %'
            if roic_col in actionable_df.columns:
                actionable_df[roic_col] = pd.to_numeric(actionable_df[roic_col], errors='coerce')
                actionable_df = actionable_df[actionable_df[roic_col] >= min_roic].copy()

        if sort_by and sort_by in actionable_df.columns:
            actionable_df[sort_by] = pd.to_numeric(actionable_df[sort_by], errors='coerce')
            actionable_df = actionable_df.sort_values(by=sort_by, ascending=False).copy()

        if actionable_df.empty:
            print("No actionable candidates found in screener output.")
            return [], ""

        candidates = actionable_df.to_dict('records')[:top_n]

        engine_display = f"Gemini Cloud ({self.model})" if self.engine == "gemini" else f"Local Ollama ({self.model})"
        print(f"\n[Moat Triage Engine] Triaging {len(candidates)} candidates via {engine_display}...")

        triage_results = []
        promoted_list = []

        start_time = time.time()
        for idx, cand in enumerate(candidates, 1):
            sym = cand.get('Ticker', 'Unknown')
            print(f"[{idx}/{len(candidates)}] Evaluating {sym}...")
            res = self.triage_candidate(cand)
            triage_results.append(res)
            if "APPROVED" in res["Triage Decision"]:
                promoted_list.append(res)
                print(f"  >>> 🟢 APPROVED: {sym} promoted to Full Terminal Due Diligence")
            else:
                print(f"  >>> 🔴 REJECTED: {sym} disqualified by triage")

            if self.engine == "gemini":
                time.sleep(0.5)

        elapsed = round(time.time() - start_time, 2)
        print(f"\nTriage Complete in {elapsed}s. Promoted {len(promoted_list)} / {len(candidates)} candidates.")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if not output_dir:
            output_dir = r"G:\My Drive\Company Data\GTD_Investing_Journal\GTD_Investment_Latticework_Organized\02 AI_Terminal\Screens"
        os.makedirs(output_dir, exist_ok=True)

        prefix = "Gemini_3_8_Flash" if "gemini" in self.engine else "Gemma4"
        tag_name = "gemini38flash" if "gemini" in self.engine else "gemma4"
        md_path = os.path.join(output_dir, f"{prefix}_Moat_Triage_Shortlist_{timestamp}.md")
        csv_path = os.path.join(output_dir, f"{prefix}_Moat_Triage_Shortlist_{timestamp}.csv")

        df_out = pd.DataFrame(triage_results)
        df_out.to_csv(csv_path, index=False, encoding='utf-8')

        md = []
        md.append("---")
        md.append(f"tags: [{tag_name}, triage, moat_screen, terminal_pipeline]")
        md.append(f"run_date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        md.append(f"engine: {engine_display}")
        md.append(f"total_candidates_triaged: {len(candidates)}")
        md.append(f"promoted_for_terminal: {len(promoted_list)}")
        md.append("---\n")
        md.append(f"# 🧠 {prefix.replace('_', ' ')} Moat & Red-Flag Triage Dossier")
        md.append(f"> **Engine:** {engine_display}")
        md.append(f"> **Objective:** Qualitative moat and secular-risk triage on quantitative screener finalists.\n")

        md.append("## 🏆 Finalists Promoted for Full Terminal Audit\n")
        if promoted_list:
            md.append("| Ticker | Company | Industry | Archetype | Market Price | EPV ($) | DCF ($) | ROIC % | FCF Yield % |")
            md.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
            for p in promoted_list:
                md.append(f"| **{p['Ticker']}** | {p['Company Name']} | <i>{p['Industry']}</i> | `{p['Archetype']}` | **${p['Price']:.2f}** | ${p['EPV ($)']:.2f} | ${p['DCF ($)']:.2f} | {p['ROIC %']:.1f}% | {p['FCF Yield %']:.1f}% |")
        else:
            md.append("*No candidates passed the qualitative hurdle in this batch.*\n")

        md.append("\n---\n## 📝 Detailed Qualitative Triage Breakdown\n")
        for r in triage_results:
            icon = "🟢" if "APPROVED" in r["Triage Decision"] else "🔴"
            md.append(f"### {icon} {r['Ticker']} ({r['Company Name']}) - {r['Triage Decision']}")
            md.append(f"**Industry:** {r['Industry']} | **Archetype:** {r['Archetype']} | **Price:** ${r['Price']:.2f} | **FCF Yield:** {r['FCF Yield %']:.1f}%\n")
            md.append(f"{r['Rationale']}\n\n---\n")

        with open(md_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(md))

        print(f"[Report] Saved Triage Shortlist to: {md_path}")
        print(f"[CSV] Saved Shortlist Data to: {csv_path}")
        return promoted_list, csv_path

def generate_comparison_report(gemma_csv: str, gemini_csv: str, output_dir: str = None) -> str:
    """
    Compares Gemma 4 and Gemini 3.8 Flash triage outputs side-by-side.
    """
    if not os.path.exists(gemma_csv) or not os.path.exists(gemini_csv):
        print(f"[Error] One or both CSVs not found: {gemma_csv}, {gemini_csv}")
        return ""

    df_gemma = pd.read_csv(gemma_csv)
    df_gemini = pd.read_csv(gemini_csv)

    merged = pd.merge(df_gemma, df_gemini, on="Ticker", suffixes=("_Gemma", "_Gemini"))

    total = len(merged)
    agreements = sum(merged['Triage Decision_Gemma'] == merged['Triage Decision_Gemini'])
    agreement_rate = round((agreements / total) * 100.0, 1) if total > 0 else 0.0

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if not output_dir:
        output_dir = r"G:\My Drive\Company Data\GTD_Investing_Journal\GTD_Investment_Latticework_Organized\02 AI_Terminal\Screens"
    os.makedirs(output_dir, exist_ok=True)

    report_path = os.path.join(output_dir, f"Triage_Comparison_Gemma4_vs_Gemini38Flash_{timestamp}.md")

    md = []
    md.append("---")
    md.append("tags: [comparison, gemma4, gemini38flash, moat_triage, benchmark]")
    md.append(f"run_date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    md.append(f"total_candidates: {total}")
    md.append(f"agreement_rate: {agreement_rate}%")
    md.append("---\n")
    md.append("# ⚖️ AI Triage Benchmark: Local Gemma 4 vs Cloud Gemini 3.8 Flash")
    md.append(f"> **Evaluated Universe:** Top {total} quantitative screener candidates.")
    md.append(f"> **Baseline 1:** Local `gemma4:e4b` (Ollama) | Cost: $0.00.")
    md.append(f"> **Baseline 2:** Google Cloud `gemini-3.8-flash` | Speed: ~0.5s/call.")
    md.append(f"> **Overall Decision Agreement Rate:** **{agreement_rate}%** ({agreements}/{total} identical verdicts)\n")

    md.append("## 📊 Side-by-Side Verdict Comparison Table\n")
    def clean_verdict(v):
        v_str = str(v).upper()
        if "PROMOTE" in v_str or "APPROVED" in v_str:
            return "APPROVED: PROMOTE TO TERMINAL", "🟢"
        return "REJECTED: DISQUALIFIED", "🔴"

    md.append("| Ticker | Company Name | Industry | Price | Gemma 4 Verdict | Gemini 3.8 Flash Verdict | Consensus? |")
    md.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |")

    for _, row in merged.iterrows():
        gemma_dec = row['Triage Decision_Gemma']
        gemini_dec = row['Triage Decision_Gemini']
        
        gemma_clean, gemma_icon = clean_verdict(gemma_dec)
        gemini_clean, gemini_icon = clean_verdict(gemini_dec)
        consensus = "✅ Agree" if (("PROMOTE" in str(gemma_dec).upper() or "APPROVED" in str(gemma_dec).upper()) == ("PROMOTE" in str(gemini_dec).upper() or "APPROVED" in str(gemini_dec).upper())) else "⚠️ Split Verdict"

        md.append(f"| **{row['Ticker']}** | {row['Company Name_Gemma']} | {row['Industry_Gemma']} | ${row['Price_Gemma']:.2f} | {gemma_icon} {gemma_clean} | {gemini_icon} {gemini_clean} | {consensus} |")

    md.append("\n---\n## 🔍 Deep-Dive: Rationales & Disagreements\n")
    for _, row in merged.iterrows():
        sym = row['Ticker']
        comp = row['Company Name_Gemma']
        gemma_dec = row['Triage Decision_Gemma']
        gemini_dec = row['Triage Decision_Gemini']
        gemma_clean, _ = clean_verdict(gemma_dec)
        gemini_clean, _ = clean_verdict(gemini_dec)

        consensus_label = "Agreement" if gemma_clean == gemini_clean else "DISAGREEMENT / SPLIT"
        icon = "🟢" if "APPROVED" in gemma_clean or "APPROVED" in gemini_clean else "🔴"
        md.append(f"### {icon} {sym} ({comp}) — {consensus_label}")
        md.append(f"- **Gemma 4 Decision:** `{gemma_clean}`")
        md.append(f"- **Gemini 3.8 Flash Decision:** `{gemini_clean}`\n")
        md.append("#### 🧠 Local Gemma 4 Rationale:")
        gemma_quote = "> " + str(row['Rationale_Gemma']).replace("\n", "\n> ")
        md.append(f"{gemma_quote}\n")
        md.append("#### ⚡ Cloud Gemini 3.8 Flash Rationale:")
        gemini_quote = "> " + str(row['Rationale_Gemini']).replace("\n", "\n> ")
        md.append(f"{gemini_quote}\n")
        md.append("---\n")

    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(md))

    print(f"\n[Comparison Report] Saved side-by-side benchmark to: {report_path}")
    return report_path

def main():
    parser = argparse.ArgumentParser(description="Qualitative Moat & Red Flag Triage Engine")
    parser.add_argument("--csv", type=str, default=None, help="Path to screener results CSV file.")
    parser.add_argument("--tickers", type=str, default=None, help="Comma-separated list of tickers to triage (e.g. SIG,TTD,EVR)")
    parser.add_argument("--top-n", type=int, default=25, help="Number of top actionable candidates to triage.")
    parser.add_argument("--engine", type=str, default="ollama", choices=["gemini", "ollama"], help="LLM Engine: gemini or ollama (default: ollama)")
    parser.add_argument("--model", type=str, default=None, help="Specific model name (e.g. gemini-3.8-flash or gemma4:e4b)")
    parser.add_argument("--group", type=str, default=None, help="Filter by specific Verdict Group (e.g. 'DCF Green Light')")
    parser.add_argument("--min-roic", type=float, default=None, help="Minimum ROIC TTM pct filter (e.g. 15.0)")
    parser.add_argument("--sort-by", type=str, default=None, help="Sort candidates by column (e.g. 'DCF MoS %%')")
    parser.add_argument("--include", type=str, default=None, help="Comma-separated list of specific tickers to guarantee in batch (e.g. 'FMX')")
    parser.add_argument("--compare-with", type=str, default=None, help="Path to a previous triage CSV to automatically generate a side-by-side comparison report.")
    args = parser.parse_args()

    csv_path = args.csv
    if not csv_path or not os.path.exists(csv_path):
        default_tier1 = r"G:\My Drive\Company Data\Tier1_Quality_Franchises_Master_20260907_170105.csv"
        if os.path.exists(default_tier1):
            csv_path = default_tier1
        else:
            raise FileNotFoundError("Please provide a valid --csv path or ensure Tier1 Master CSV exists.")

    include_list = None
    if args.tickers:
        include_list = [t.strip().upper() for t in args.tickers.split(",") if t.strip()]
    elif args.include:
        include_list = [t.strip().upper() for t in args.include.split(",") if t.strip()]

    engine = MoatTriageEngine(engine=args.engine, model=args.model)
    promoted, csv_out = engine.run_triage_batch(
        csv_path,
        top_n=args.top_n,
        group_filter=args.group,
        min_roic=args.min_roic,
        sort_by=args.sort_by,
        include_tickers=include_list
    )

    if args.compare_with and os.path.exists(args.compare_with):
        generate_comparison_report(args.compare_with, csv_out)

if __name__ == "__main__":
    main()
