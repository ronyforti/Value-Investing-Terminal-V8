import os
import sys
import csv
import json
import requests
import pandas as pd
import numpy as np

class CurrencyGuard:
    """
    Universal Multi-Currency Safeguard for Value Investing Terminal.
    Supports 160+ global currencies dynamically via real-time exchange rates.
    Audits financial CSVs, preserves native Home Currency to eliminate exchange
    rate fluctuation noise from 10-year operational history, and provides full
    transparency with an interactive decision prompt before proceeding.
    """

    FALLBACK_RATES = {
        'USD': 1.0, 'CAD': 1.376, 'BRL': 5.18, 'EUR': 0.856, 'GBP': 0.733,
        'JPY': 158.95, 'KRW': 1385.74, 'INR': 84.0, 'MXN': 18.0057, 'AUD': 1.40,
        'CHF': 0.801, 'HKD': 7.84, 'TWD': 31.81, 'CNY': 7.15, 'SEK': 9.80,
        'NOK': 9.90, 'DKK': 6.38, 'SGD': 1.28, 'ZAR': 17.50, 'ILS': 3.65,
        'CLP': 930.0, 'COP': 4100.0, 'NZD': 1.65, 'TRY': 33.50, 'IDR': 16200.0
    }

    def __init__(self):
        self.fx_rates = self.fetch_live_fx_rates()

    def fetch_live_fx_rates(self) -> dict:
        rates = dict(self.FALLBACK_RATES)
        try:
            r = requests.get('https://open.er-api.com/v6/latest/USD', timeout=5)
            if r.status_code == 200:
                live = r.json().get('rates', {})
                if live:
                    rates.update(live)
                    rates['USD'] = 1.0
        except Exception:
            pass
        return rates

    def audit_csv(self, csv_path: str, ticker: str = "") -> dict:
        """
        Scans financial CSV and determines currency structure, anomalies, and adjustments.
        Identifies the native Home Currency as the primary standard.
        """
        result = {
            "csv_path": csv_path,
            "ticker": ticker.upper(),
            "has_foreign_currency": False,
            "has_mixed_currencies": False,
            "has_bs_mismatch": False,
            "home_currency": "USD",
            "currencies_found": [],
            "fx_rate": 1.0,
            "mismatches": [],
            "requires_action": False,
            "details": []
        }

        if not csv_path or not os.path.exists(csv_path):
            return result

        try:
            df = pd.read_csv(csv_path, header=None, dtype=str)
            if df.empty or df.shape[0] < 15 or df.shape[1] < 2:
                return result

            # Locate reportedCurrency row
            currency_row_idx = None
            for idx, row in df.iterrows():
                if str(row[0]).strip() == 'reportedCurrency':
                    currency_row_idx = idx
                    break

            if currency_row_idx is None:
                return result

            currencies = [str(x).strip().upper() for x in df.iloc[currency_row_idx, 1:] if pd.notna(x)]
            result["currencies_found"] = currencies

            non_usd = [c for c in currencies if c != 'USD']
            result["has_foreign_currency"] = bool(non_usd)
            result["has_mixed_currencies"] = ('USD' in currencies and bool(non_usd)) or len(set(currencies)) > 1

            if non_usd:
                from collections import Counter
                counts = Counter(non_usd)
                result["home_currency"] = counts.most_common(1)[0][0]
                result["fx_rate"] = self.fx_rates.get(result["home_currency"], 1.0)

            # Check for Balance Sheet unit mismatch (e.g. Cash in local currency while Debt in USD)
            if result["has_foreign_currency"] and result["fx_rate"] > 1.5:
                fx = result["fx_rate"]
                for idx, row in df.iterrows():
                    val0 = str(row[0]).strip()
                    if val0 in ['cashAndCashEquivalents', 'cashAndShortTermInvestments']:
                        col1_val = row[1]
                        if pd.notna(col1_val):
                            try:
                                num = float(col1_val)
                                if num > 50000:
                                    result["has_bs_mismatch"] = True
                                    result["mismatches"].append({
                                        "item": val0,
                                        "description": f"Already in native {result['home_currency']} ({num:,.0f})"
                                    })
                            except Exception:
                                pass

            result["requires_action"] = result["has_mixed_currencies"] or result["has_bs_mismatch"]
        except Exception as e:
            result["details"].append(f"Audit error: {e}")

        return result

    def print_audit_box(self, audit: dict):
        """
        Renders an institutional notification box showing what the Terminal found
        and how Home Currency will be preserved to eliminate FX fluctuation noise.
        """
        box_width = 76
        def p(line: str):
            print(f"| {line:<{box_width-2}} |")

        print("\n+" + "-" * box_width + "+")
        p(f"GLOBAL CURRENCY & ADR AUDIT: {audit['ticker']}")
        print("+" + "-" * box_width + "+")

        if not audit["requires_action"]:
            p("Status: CLEAN SINGLE CURRENCY")
            p(f"Currency: {audit['currencies_found'][0] if audit['currencies_found'] else 'USD'}")
            p("No currency harmonization required. Standard pipeline will proceed.")
            print("+" + "-" * box_width + "+\n")
            return

        p("Status: [!] FOREIGN ISSUER / MIXED DATA FEED DETECTED")
        p(f"Target Symbol:           {audit['ticker']}")
        p(f"Company Home Currency:   {audit['home_currency']} (Native Operating Currency)")
        p(f"Current Spot FX Rate:    1 USD = {audit['fx_rate']:.2f} {audit['home_currency']}")
        p(f"Currencies in CSV:       {', '.join(set(audit['currencies_found']))}")

        if audit["has_mixed_currencies"]:
            p("Anomaly: Data provider mixed USD (recent) with native Home Currency (past).")

        if audit["has_bs_mismatch"]:
            p("Anomaly: Balance sheet contains line items already in native Home Currency.")

        print("+" + "-" * box_width + "+")
        p(f"PROPOSED ACTION: PRESERVE HOME CURRENCY ({audit['home_currency']}) TO ELIMINATE FX NOISE:")
        p(f"1. Convert USD-translated quarters back to native {audit['home_currency']} using FX.")
        p(f"2. Align all 10 historical years into pure {audit['home_currency']} (matches Form 20-F).")
        p(f"3. Calculate 10-year RORC, sales growth & margins in native {audit['home_currency']} (0% FX noise).")
        p(f"4. Convert final Intrinsic Value to USD at Spot FX (1 USD = {audit['fx_rate']:.2f} {audit['home_currency']})")
        p("   to compare directly against the US ADR market price.")
        print("+" + "-" * box_width + "+\n")

    def prompt_user_decision(self, audit: dict, auto_confirm: bool = False) -> str:
        """
        Prompts the user to decide whether to proceed with Home Currency harmonization,
        use the raw original file, or abort.
        """
        self.print_audit_box(audit)

        if not audit["requires_action"]:
            return "clean"

        if auto_confirm:
            print(f"[Currency Safeguard] Auto-confirm active. Harmonizing to Home Currency ({audit['home_currency']}).\n")
            return "harmonize"

        while True:
            try:
                choice = input(f"CURRENCY ACTION: (Y) Harmonize to Home Currency ({audit['home_currency']}) / (O) Use Raw File / (A) Abort: ").strip().lower()
            except (EOFError, KeyboardInterrupt):
                return "abort"

            if choice in ['y', 'yes', '']:
                return "harmonize"
            elif choice in ['o', 'original']:
                print("[Currency Safeguard] Proceeding with unmodified original file.")
                return "original"
            elif choice in ['a', 'abort', 'n', 'no']:
                print("[Currency Safeguard] Execution aborted by user.")
                return "abort"
            else:
                print("Invalid choice. Please enter Y, O, or A.")

    def harmonize_csv(self, audit: dict, output_dir: str = None) -> str:
        """
        Harmonizes the CSV by converting any USD-translated periods back to the native
        Home Currency, producing a 100% pure Home Currency dataset across all 10 years.
        """
        csv_path = audit["csv_path"]
        if not audit["requires_action"]:
            return csv_path

        df = pd.read_csv(csv_path, header=None, dtype=str)
        currency_row_idx = None
        for idx, row in df.iterrows():
            if str(row[0]).strip() == 'reportedCurrency':
                currency_row_idx = idx
                break

        if currency_row_idx is None:
            return csv_path

        currencies = audit["currencies_found"]
        home_currency = audit["home_currency"]
        fx_rate = audit["fx_rate"]
        meta_exclude = ['nan', 'Period Ending', 'symbol', 'cik', 'filingDate', 'acceptedDate', 'reportedCurrency', 'Fiscal Quarter']

        new_df = df.copy()

        for idx, row in df.iterrows():
            val0 = str(row[0]).strip()
            if 'Statement:' in val0 or val0 in meta_exclude:
                continue

            is_shares = any(k in val0.lower() for k in ['shsout', 'shares', 'weightedaverage'])
            if is_shares:
                continue

            for col_idx in range(1, min(len(currencies) + 1, df.shape[1])):
                cur = currencies[col_idx - 1] if col_idx - 1 < len(currencies) else 'USD'
                cell_val = row[col_idx]
                if pd.isna(cell_val) or not str(cell_val).strip():
                    continue
                try:
                    num_val = float(cell_val)
                except Exception:
                    continue

                # If this column was prematurely translated to USD, convert BACK to Home Currency
                if cur == 'USD' and home_currency != 'USD':
                    # Check if this cell was ALREADY in local currency (e.g. Cash = 104,960 MXN)
                    if val0 in ['cashAndCashEquivalents', 'cashAndShortTermInvestments'] and num_val > 50000:
                        # Already in native Home Currency, keep as-is
                        pass
                    else:
                        # Convert USD back to Home Currency
                        new_num = num_val * fx_rate
                        new_df.iloc[idx, col_idx] = f"{new_num:.4f}"

                # If column is in another non-USD foreign currency different from home_currency
                elif cur != 'USD' and cur != home_currency and cur in self.fx_rates:
                    col_fx = self.fx_rates.get(cur, 1.0)
                    usd_val = num_val / col_fx
                    home_val = usd_val * fx_rate
                    new_df.iloc[idx, col_idx] = f"{home_val:.4f}"

        # Relabel all columns to Home Currency
        for col_idx in range(1, min(len(currencies) + 1, df.shape[1])):
            new_df.iloc[currency_row_idx, col_idx] = f"{home_currency} (Home Currency)"

        out_dir = output_dir or os.path.dirname(csv_path)
        os.makedirs(out_dir, exist_ok=True)
        symbol = audit["ticker"] or "HOME_CURRENCY"
        out_path = os.path.join(out_dir, f"{symbol}_Financials-TTM_{home_currency}.csv")
        new_df.to_csv(out_path, index=False, header=False)
        return out_path
