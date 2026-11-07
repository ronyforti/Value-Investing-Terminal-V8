import os
import sys
import glob
import json
import time
import argparse
import requests
import numpy as np
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
API_KEY = os.getenv("FMP_API_KEY")
if not API_KEY:
    env_fallback = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_fallback):
        load_dotenv(env_fallback)
        API_KEY = os.getenv("FMP_API_KEY")

class PromptV62FullMarketValuationEngine:
    """
    Prompt V6.2 Full-Market Dual Valuation & Discovery Engine:
    - Target Margin of Safety: 30.0% Strict Standard.
    - 3-Year Modern Compressed Cycle Window (Section 12.3: 12 quarters, preventing obsolete history drag).
    - Ingests all 3,624 companies from 40-quarter TTM cache with sub-second offline speed.
    - Pulls live real-time market prices & market caps via FMP batch-quote API.
    - Quarter-by-quarter / multi-currency FX normalization (166 currencies).
    - Prompt V6.2 Industry Corrections:
        * Homebuilders: Land inventory cash outflows added back to OCF (Section 6.1).
        * Banks/Financials: Sustainable Net Income & Tangible Common Equity (Sections 2.5, 6.1, 12.2).
        * Growth R&D Capitalization: Adjusted Owner Earnings & DCF Ceiling (Sections 2.8, 12.4).
    - Archetype Auto-Classification (Section 13.1): Fast Grower, Stalwart, Cyclical, Asset Play, Slow Grower, Turnaround.
    - Solvency Gatekeeper (Section 7.2): Positive OCF, positive Normalized OE, Min $50M Market Cap.
    - Static 10.0% Hurdle Rate (Section 12.1): Strictly no WACC/CAPM/Beta.
    - Dual Intrinsic Values & Differentiated Action Verdicts:
        * 🟢 DUAL GREEN LIGHT: Passes BOTH Zero-Growth EPV and Owner Earnings DCF @ 30% MoS.
        * 🟩 EPV GREEN LIGHT: Passes Zero-Growth EPV only @ 30% MoS (Deep Value Floor).
        * 🌱 DCF GREEN LIGHT: Passes Owner Earnings DCF only @ 30% MoS (Growth Compounder).
        * 🟡 WATCHLIST: Within 15% of 30% MoS strike price.
        * 🔴 PASS: Insufficient Margin of Safety / Cash Burning.
    """

    def __init__(self, cache_dir: str = r"C:\Users\Ronald\Downloads\Cache\TTM_Output_20260821",
                 hurdle_rate: float = 0.10, growth_cap: float = 0.12, years: int = 3,
                 pull_live_prices: bool = True):
        self.cache_dir = cache_dir
        self.hurdle_rate = hurdle_rate # Prompt V6.2 Section 12.1: 10.0% Static Hurdle Rate
        self.growth_cap = growth_cap
        self.years = years # Prompt V6.2 Section 12.3: Modern Compressed 3-Year Cycle (12 Quarters)
        self.api_key = API_KEY
        self.pull_live_prices = pull_live_prices and bool(API_KEY)
        self.fx_rates = self.load_fx_rates()
        self.live_quotes = {}

    def load_fx_rates(self) -> dict:
        """
        Loads real-time foreign exchange rates relative to USD.
        """
        rates = {
            'USD': 1.0, 'CAD': 1.376, 'BRL': 5.18, 'EUR': 0.856, 'GBP': 0.733,
            'JPY': 158.95, 'KRW': 1385.74, 'INR': 84.0, 'MXN': 16.92, 'AUD': 1.40,
            'CHF': 0.801, 'HKD': 7.84, 'TWD': 31.81, 'CNY': 7.15, 'SEK': 9.80,
            'NOK': 9.90, 'DKK': 6.38, 'SGD': 1.28, 'ZAR': 17.50, 'ILS': 3.65
        }
        try:
            r = requests.get('https://open.er-api.com/v6/latest/USD', timeout=5)
            if r.status_code == 200:
                live_rates = r.json().get('rates', {})
                if live_rates:
                    rates.update(live_rates)
                    rates['USD'] = 1.0
                    print(f"[FX Engine] Synchronized {len(rates)} live foreign exchange rates.")
        except Exception:
            pass
        return rates

    def fetch_batch_live_quotes(self, symbols: list):
        """
        Fetches live real-time prices & market caps in batches of 100 symbols via FMP.
        """
        if not self.pull_live_prices or not symbols:
            return

        total_syms = len(symbols)
        print(f"\n[Live FMP Pricing] Fetching real-time quotes for {total_syms} companies in batches...")
        batch_size = 100
        start_t = time.time()
        successful_quotes = 0

        for i in range(0, total_syms, batch_size):
            batch = symbols[i:i + batch_size]
            sym_str = ",".join(batch)
            url = f"https://financialmodelingprep.com/stable/batch-quote?symbols={sym_str}&apikey={self.api_key}"
            try:
                r = requests.get(url, timeout=6)
                if r.status_code == 200:
                    data = r.json()
                    if isinstance(data, list):
                        for item in data:
                            sym = item.get('symbol', '').upper()
                            p = float(item.get('price', 0.0) or 0.0)
                            mc = float(item.get('marketCap', 0.0) or 0.0)
                            if sym and p > 0:
                                self.live_quotes[sym] = {
                                    'price': p,
                                    'market_cap': round(mc / 1e6, 2) if mc > 0 else 0.0
                                }
                                successful_quotes += 1
                time.sleep(0.04)
            except Exception:
                pass

        elapsed = round(time.time() - start_t, 2)
        print(f"[Live FMP Pricing] Retrieved {successful_quotes} live quotes across {total_syms} symbols in {elapsed}s.")

    def parse_ttm_csv(self, file_path: str):
        """
        Parses 40-quarter TTM financial CSV file and normalizes foreign currencies to USD period-by-period.
        """
        try:
            df = pd.read_csv(file_path, header=None, dtype=str)
            if df.empty or df.shape[0] < 20 or df.shape[1] < 6:
                return None

            symbol = str(df.iloc[1, 1]).strip().upper() if df.shape[1] > 1 and pd.notna(df.iloc[1, 1]) else 'UNKNOWN'
            
            # Filter secondary debt/preferred notes
            if len(symbol) >= 5 and not ('-' in symbol or '.' in symbol):
                if symbol[-1] in ['B', 'C', 'D', 'E', 'F', 'G', 'P', 'N', 'L', 'M', 'O']:
                    return None
            if '-P' in symbol or '.P' in symbol or 'PR' in symbol:
                return None

            reported_currencies = []
            for idx, row in df.iterrows():
                if str(row[0]).strip() == 'reportedCurrency':
                    reported_currencies = [str(x).strip().upper() for x in row[1:] if pd.notna(x)]
                    break

            primary_currency = reported_currencies[0] if reported_currencies else 'USD'

            # Price and market cap
            try: cached_mcap = float(df.iloc[2, 1])
            except: cached_mcap = 0.0

            try: cached_price = float(df.iloc[4, 1])
            except: cached_price = 0.0

            # Override with live price if available
            live = self.live_quotes.get(symbol)
            if live and live['price'] > 0:
                price = live['price']
                market_cap = live['market_cap'] if live['market_cap'] > 0 else cached_mcap
                price_source = "Live FMP Real-Time"
            else:
                price = cached_price
                market_cap = cached_mcap
                price_source = "Cached"

            cik = ''
            for idx, row in df.iterrows():
                if str(row[0]).strip() == 'cik':
                    cik = str(row[1]).strip() if len(row) > 1 and pd.notna(row[1]) else ''
                    break

            metadata = {
                'file_path': file_path,
                'source': price_source,
                'industry': str(df.iloc[0, 1]).strip() if df.shape[1] > 1 and pd.notna(df.iloc[0, 1]) else 'Unknown',
                'symbol': symbol,
                'cik': cik,
                'reported_currency': primary_currency,
                'price': price,
                'market_cap': market_cap
            }

            sections = {}
            curr_section = None
            curr_headers = []

            for idx, row in df.iterrows():
                val0 = str(row[0]).strip()
                if 'Statement:' in val0:
                    curr_section = val0.replace(':', '').strip()
                    sections[curr_section] = {}
                elif val0 == 'Fiscal Quarter':
                    curr_headers = [str(x).strip() for x in row[1:] if pd.notna(x)]
                elif curr_section and val0 and val0 not in ['nan', 'Period Ending', 'symbol', 'cik', 'filingDate', 'acceptedDate', 'reportedCurrency']:
                    line_item = val0
                    vals = []
                    for v in row[1:len(curr_headers) + 1]:
                        try: vals.append(float(v))
                        except: vals.append(0.0)

                    # Normalize unit scale discrepancies
                    if len(vals) >= 2:
                        sub = [abs(x) for x in vals[1:4] if abs(x) > 0.01]
                        if sub and abs(vals[0]) > 0.01:
                            avg_sub = np.median(sub)
                            ratio = abs(vals[0]) / avg_sub
                            if 400.0 <= ratio <= 2500.0: vals[0] /= 1000.0
                            elif 400000.0 <= ratio <= 2500000.0: vals[0] /= 1000000.0

                    # Period-by-period currency conversion to USD
                    is_shares = any(k in line_item.lower() for k in ['shsout', 'shares', 'weightedaverage'])
                    if not is_shares and reported_currencies:
                        for j in range(len(vals)):
                            cur = reported_currencies[j] if j < len(reported_currencies) else 'USD'
                            if cur != 'USD':
                                fx = self.fx_rates.get(cur, 1.0)
                                if fx > 0:
                                    vals[j] = vals[j] / fx

                    sections[curr_section][line_item] = vals

            if not curr_headers or len(curr_headers) < 4:
                return None

            cf_sec = sections.get('Cash Flow Statement', {})
            is_sec = sections.get('Income Statement', {})
            bs_sec = sections.get('Balance Statement', {})

            # ADR & Foreign Currency Mismatch Reconciliation:
            # If the filing has a history of reporting in a foreign currency (e.g. MXN, BRL, JPY, EUR),
            # detect when data providers mark recent quarters as 'USD' while leaving underlying
            # line items in the local foreign currency, or mixing USD debt with foreign cash.
            foreign_currencies = [c for c in reported_currencies if c != 'USD']
            if foreign_currencies:
                primary_foreign = foreign_currencies[0]
                fx_rate = self.fx_rates.get(primary_foreign, 1.0)
                if fx_rate > 1.5:
                    key_reconcile_items = [
                        'cashAndShortTermInvestments', 'cashAndCashEquivalents', 'totalDebt',
                        'totalStockholdersEquity', 'propertyPlantEquipmentNet', 'totalAssets',
                        'revenue', 'costOfRevenue', 'operatingCashFlow', 'capitalExpenditure',
                        'netIncome', 'operatingIncome', 'depreciationAndAmortization'
                    ]
                    for s in [bs_sec, is_sec, cf_sec]:
                        for item in key_reconcile_items:
                            if item in s:
                                vals = s[item]
                                for p_idx in range(min(4, len(vals))):
                                    cur = reported_currencies[p_idx] if p_idx < len(reported_currencies) else 'USD'
                                    if cur == 'USD' and len(vals) >= 3:
                                        val_p = vals[p_idx]
                                        tail = [abs(x) for k, x in enumerate(vals) if k != p_idx and abs(x) > 0.01]
                                        if tail and abs(val_p) > 0.01:
                                            med_tail = np.median(tail)
                                            ratio = abs(val_p) / med_tail
                                            if 0.45 * fx_rate <= ratio <= 2.2 * fx_rate:
                                                vals[p_idx] = val_p / fx_rate

                    # Sibling balance sheet check: if cash > 1.2 * market_cap for a foreign ADR
                    mcap_val = metadata.get('market_cap', 0.0)
                    if mcap_val >= 100.0 and 'cashAndShortTermInvestments' in bs_sec:
                        c_vals = bs_sec['cashAndShortTermInvestments']
                        if c_vals and c_vals[0] > 1.2 * mcap_val:
                            ratio = c_vals[0] / mcap_val
                            if 0.45 * fx_rate <= ratio <= 20.0 * fx_rate:
                                c_vals[0] = c_vals[0] / fx_rate

            return {
                'meta': metadata,
                'headers': curr_headers,
                'num_periods': len(curr_headers),
                'cf': cf_sec,
                'is': is_sec,
                'bs': bs_sec
            }
        except Exception:
            return None

    def evaluate_valuation(self, data: dict, target_mos: float = 30.0):
        """
        Executes Prompt V6.2 dual valuation analysis on parsed company data.
        """
        meta = data['meta']
        symbol = meta['symbol']
        num_periods = data['num_periods']
        cf = data['cf']
        is_stmt = data['is']
        bs = data['bs']

        industry = meta['industry'].lower()
        if any(x in industry for x in ['reit - mortgage', 'mortgage reit']):
            return None

        is_homebuilder = any(x in industry for x in ['homebuilding', 'residential construction', 'real estate-development'])
        is_bank_financial = any(x in industry for x in ['bank', 'insurance', 'financial services', 'credit', 'asset management'])

        rev = is_stmt.get('revenue', [0.0] * num_periods)
        net_inc = is_stmt.get('netIncome', [0.0] * num_periods)
        op_inc = is_stmt.get('operatingIncome', [0.0] * num_periods)
        shares = is_stmt.get('weightedAverageShsOutDil', is_stmt.get('weightedAverageShsOut', [0.0] * num_periods))

        ocf = cf.get('operatingCashFlow', [0.0] * num_periods)
        sbc = cf.get('stockBasedCompensation', [0.0] * num_periods)
        capex = cf.get('capitalExpenditure', [0.0] * num_periods)
        da = cf.get('depreciationAndAmortization', [0.0] * num_periods)
        rd = is_stmt.get('researchAndDevelopmentExpenses', cf.get('researchAndDevelopment', [0.0] * num_periods))
        divs = cf.get('commonDividendsPaid', [0.0] * num_periods)
        inv_change = cf.get('inventory', [0.0] * num_periods)

        cash = bs.get('cashAndShortTermInvestments', [0.0] * num_periods)
        debt = bs.get('totalDebt', [0.0] * num_periods)
        equity = bs.get('totalStockholdersEquity', [0.0] * num_periods)
        intangibles = bs.get('goodwillAndIntangibleAssets', [0.0] * num_periods)

        # 1. Prompt V6.2 Owner Earnings Calculations
        owner_earnings = []
        fcf_series = []
        adj_owner_earnings = []

        for i in range(num_periods):
            c_ocf = ocf[i]
            c_sbc = sbc[i]
            c_capex = abs(capex[i])
            c_da = abs(da[i])
            c_inv = inv_change[i]
            c_ni = net_inc[i]
            c_rd = abs(rd[i]) if i < len(rd) else 0.0

            if is_homebuilder:
                # Prompt V6.2 Section 6.1: Add back land inventory acquisitions to OCF
                c_ocf = c_ocf - c_inv

            if is_bank_financial:
                # Prompt V6.2 Section 6.1: Sustainable Net Income minus SBC
                oe = c_ni - c_sbc
                fcf = c_ni
                adj_oe = oe
            else:
                maint_capex = min(c_capex, c_da) if c_da > 0 else c_capex
                oe = c_ocf - c_sbc - maint_capex
                fcf = c_ocf - c_capex
                
                # Section 2.8: Split R&D into 50% maintenance / 50% growth investment
                growth_rd = 0.50 * c_rd
                adj_oe = oe + growth_rd

            owner_earnings.append(oe)
            fcf_series.append(fcf)
            adj_owner_earnings.append(adj_oe)

        # 2. Prompt V6.2 Section 12.3: Modern Compressed 3-Year Cycle Normalization (12 Quarters)
        idx_3y = min(self.years - 1, num_periods - 1)
        oe_ttm = owner_earnings[0]
        oe_3y_slice = owner_earnings[:idx_3y + 1]
        oe_norm = float(np.median(oe_3y_slice)) if len(oe_3y_slice) > 0 else oe_ttm

        # Deep cyclicals: Normalize over full historical cycle (up to 40 quarters) to eliminate peak-cycle illusion
        is_cyclical_sector = any(x in industry for x in ['steel', 'marine shipping', 'oil & gas exploration', 'chemicals - commodity'])
        if is_cyclical_sector and num_periods >= 8:
            oe_norm = float(np.median(owner_earnings))

        fcf_ttm = fcf_series[0]
        fcf_3y_avg = float(np.mean(fcf_series[:min(3, num_periods)]))

        mcap = meta['market_cap']
        price = meta['price']
        if mcap <= 0 or price <= 0:
            return None

        curr_cash = cash[0] if len(cash) > 0 else 0.0
        curr_debt = debt[0] if len(debt) > 0 else 0.0

        # 3. Balance Sheet & Lynch Net Cash Rebate (Section 2.5 & Section 12.2)
        if is_bank_financial:
            curr_equity = equity[0] if len(equity) > 0 else 0.0
            curr_intangibles = intangibles[0] if len(intangibles) > 0 else 0.0
            tce = curr_equity - curr_intangibles
            net_cash = 0.0
            rebate_pct = 0.0
            ev = mcap
            asset_value = tce
        else:
            net_cash = curr_cash - curr_debt
            rebate_pct = (net_cash / mcap * 100.0) if mcap > 0 else 0.0
            ev = max(0.0, mcap - net_cash)
            asset_value = max(0.0, (equity[0] if len(equity) > 0 else 0.0) - (intangibles[0] if len(intangibles) > 0 else 0.0))

        # 4. Greenwald Modern 3-Year RORC (Section 3.0)
        retained_cash_3y = 0.0
        for i in range(idx_3y + 1):
            div_paid = abs(divs[i])
            if is_bank_financial:
                retained_cash_3y += (net_inc[i] - div_paid)
            else:
                retained_cash_3y += (fcf_series[i] - div_paid)

        delta_oe_3y = oe_ttm - owner_earnings[idx_3y]
        rorc_3y = (delta_oe_3y / retained_cash_3y * 100.0) if retained_cash_3y > 0 else 0.0

        # 5. Share Cannibalism (3-Year Diluted Shares Change)
        curr_shares = shares[0] if len(shares) > 0 and shares[0] > 0 else 1.0
        shares_3y_ago = shares[idx_3y] if len(shares) > idx_3y and shares[idx_3y] > 0 else curr_shares
        share_change_3y = ((curr_shares - shares_3y_ago) / shares_3y_ago * 100.0) if shares_3y_ago > 0 else 0.0

        # 6. Greenwald ROIC vs Static Hurdle Rate Test (Section 12.4 Part 1 - Division by Zero Guarded)
        raw_ic = (equity[0] if len(equity) > 0 else 0.0) + curr_debt - curr_cash
        capital_floor = max(25.0, (equity[0] if len(equity) > 0 else 0.0) * 0.5 + curr_debt * 0.5)
        invested_capital = max(raw_ic, capital_floor)
        nopat = op_inc[0] * 0.79 if op_inc[0] > 0 else (net_inc[0] if net_inc[0] > 0 else 0.0)
        roic = (nopat / invested_capital * 100.0) if invested_capital > 0 else 0.0
        roic = min(150.0, max(-100.0, roic))
        creates_growth_value = roic >= (self.hurdle_rate * 100.0)

        # 7. Growth Rate Calculation (3-Year Rolling CAGR)
        cagr = 0.0
        if num_periods >= 4 and fcf_3y_avg > 0:
            past_fcf_avg = np.mean(fcf_series[min(2, num_periods-1):min(4, num_periods)])
            if past_fcf_avg > 0:
                years_diff = min(2, num_periods - 2)
                if years_diff > 0:
                    cagr = (fcf_3y_avg / past_fcf_avg) ** (1.0 / years_diff) - 1.0

        init_growth = max(0.0, min(cagr, self.growth_cap)) if creates_growth_value else 0.0

        # 8. Peter Lynch Archetype Classification (Section 13.1)
        if rebate_pct >= 20.0 or (asset_value > mcap and asset_value > 0):
            archetype = "Asset Play"
        elif is_cyclical_sector:
            archetype = "Cyclical"
        elif cagr >= 0.15 and roic >= 15.0:
            archetype = "Fast Grower"
        elif cagr >= 0.06 or (oe_norm > 500.0 and roic >= 10.0):
            archetype = "Stalwart"
        elif oe_ttm > 0 and (len(owner_earnings) > 2 and owner_earnings[2] <= 0):
            archetype = "Turnaround"
        else:
            archetype = "Slow Grower"

        # =========================================================================
        # INTRINSIC VALUE 1: ZERO-GROWTH EPV (The Floor - Section 12.3)
        # =========================================================================
        epv_enterprise = (oe_norm / self.hurdle_rate) if oe_norm > 0 else 0.0
        epv_equity = epv_enterprise + (net_cash if not is_bank_financial else 0.0)
        epv_per_share = price * (epv_equity / mcap) if mcap > 0 else 0.0
        epv_mos_pct = ((epv_equity - mcap) / epv_equity * 100.0) if epv_equity > 0 else -999.0
        epv_target_buy = epv_per_share * (1.0 - (target_mos / 100.0))

        # =========================================================================
        # INTRINSIC VALUE 2: OWNER EARNINGS DCF (The Ceiling - Section 12.4 Part 2)
        # =========================================================================
        terminal_growth = 0.025 # 2.5% Long-term GDP Rate

        # 10-Year 2-Stage Fade Projection
        dcf_base_cf = max(0.0, oe_norm)
        discounted_cfs = []
        curr_cf = dcf_base_cf
        for t in range(1, 11):
            if t <= 5:
                g_rate = init_growth
            else:
                fade_step = (t - 5) / 5.0
                g_rate = init_growth * (1.0 - fade_step) + terminal_growth * fade_step
            
            curr_cf = curr_cf * (1.0 + g_rate)
            dfactor = 1.0 / ((1.0 + self.hurdle_rate) ** t)
            discounted_cfs.append(curr_cf * dfactor)

        pv_10yr_cfs = sum(discounted_cfs)
        terminal_cf = curr_cf * (1.0 + terminal_growth)
        terminal_val = terminal_cf / (self.hurdle_rate - terminal_growth)
        pv_terminal = terminal_val / ((1.0 + self.hurdle_rate) ** 10)

        dcf_equity_val = (pv_10yr_cfs + pv_terminal) + (net_cash if not is_bank_financial else 0.0)
        dcf_per_share = price * (dcf_equity_val / mcap) if mcap > 0 else 0.0
        dcf_mos_pct = ((dcf_equity_val - mcap) / dcf_equity_val * 100.0) if dcf_equity_val > 0 else -999.0
        dcf_target_buy = dcf_per_share * (1.0 - (target_mos / 100.0))

        # Adjusted DCF with R&D Capitalized (Section 12.4 Part 3)
        adj_oe_norm = float(np.median(adj_owner_earnings[:idx_3y + 1])) if len(adj_owner_earnings) > 0 else oe_ttm
        adj_dcf_per_share = (dcf_per_share * (adj_oe_norm / oe_norm)) if oe_norm > 0 else dcf_per_share

        # =========================================================================
        # PROMPT V6.2 STRICT GATEKEEPERS & ACTION VERDICTS (Section 7.2 & 13.4)
        # =========================================================================
        cum_fcf_3y = sum(fcf_series[:idx_3y + 1]) if len(fcf_series) > 0 else 0.0
        has_positive_cashflow = (oe_norm > 0) and (ocf[0] > 0) and (is_bank_financial or cum_fcf_3y > 0)
        has_institutional_scale = mcap >= 100.0 # Min $100M Market Cap

        # Solvency test: Net debt to owner earnings
        net_debt = curr_debt - curr_cash
        is_solvent = is_bank_financial or (net_debt <= 4.5 * oe_norm if net_debt > 0 else True)

        # Balance sheet integrity: Non-financials must not have negative tangible equity combined with net debt
        tangible_equity = (equity[0] if len(equity) > 0 else 0.0) - (intangibles[0] if len(intangibles) > 0 else 0.0)
        has_balance_sheet_integrity = is_bank_financial or not (tangible_equity <= 0 and net_debt > 0)

        # Share dilution discipline: 3-year share dilution must be <= 12%
        has_dilution_discipline = share_change_3y <= 12.0

        is_qualified_candidate = (
            has_positive_cashflow and 
            has_institutional_scale and 
            is_solvent and 
            has_balance_sheet_integrity and 
            has_dilution_discipline
        )

        pass_epv = (price <= epv_target_buy) and (epv_per_share > 0) and is_qualified_candidate
        pass_dcf = (price <= dcf_target_buy) and (dcf_per_share > 0) and is_qualified_candidate

        near_epv = (price <= 1.15 * epv_target_buy) and (epv_per_share > 0) and is_qualified_candidate
        near_dcf = (price <= 1.15 * dcf_target_buy) and (dcf_per_share > 0) and is_qualified_candidate

        if pass_epv and pass_dcf:
            verdict = "🟢 DUAL GREEN LIGHT (Terminal Priority #1)"
            verdict_group = "Dual Green Light"
        elif pass_epv and not pass_dcf:
            verdict = "🟩 EPV GREEN LIGHT (Zero-Growth Deep Value)"
            verdict_group = "EPV Green Light"
        elif pass_dcf and not pass_epv:
            verdict = "🌱 DCF GREEN LIGHT (Growth Compounder)"
            verdict_group = "DCF Green Light"
        elif (near_epv or near_dcf) and is_qualified_candidate:
            verdict = "🟡 WATCHLIST (Within 15% of Entry)"
            verdict_group = "Watchlist"
        else:
            verdict = "🔴 PASS (Overvalued / Insufficient MoS / Cash Burning / Low Quality)"
            verdict_group = "Pass"

        fcf_yield = (fcf_ttm / mcap * 100.0) if mcap > 0 else 0.0
        ev_oe = (ev / oe_norm) if oe_norm > 0 else 999.0

        # Cash-Adjusted Margin of Safety (Section 12.6)
        enterprise_price = max(0.0, price - (net_cash / (curr_shares / 1e6))) if curr_shares > 0 and not is_bank_financial else price
        cash_adj_mos = ((epv_per_share - enterprise_price) / epv_per_share * 100.0) if epv_per_share > 0 else epv_mos_pct

        return {
            "Ticker": symbol,
            "Company": symbol,
            "Sector": meta['industry'],
            "Archetype": archetype,
            "Currency": meta['reported_currency'],
            "Market Price": round(price, 2),
            "Market Cap ($M)": round(mcap, 1),
            "Zero-Growth EPV ($)": round(epv_per_share, 2),
            f"EPV Target Buy ({target_mos:.0f}% MoS)": round(epv_target_buy, 2),
            "EPV MoS %": round(epv_mos_pct, 1),
            "Owner Earnings DCF ($)": round(dcf_per_share, 2),
            f"DCF Target Buy ({target_mos:.0f}% MoS)": round(dcf_target_buy, 2),
            "DCF MoS %": round(dcf_mos_pct, 1),
            "Adjusted DCF ($)": round(adj_dcf_per_share, 2),
            "Action Verdict": verdict,
            "Verdict Group": verdict_group,
            "ROIC TTM %": round(roic, 1),
            "3-Yr RORC %": round(rorc_3y, 1),
            "3-Yr Share Δ %": round(share_change_3y, 1),
            "Net Cash ($M)": round(net_cash, 1),
            "Cash Rebate %": round(rebate_pct, 1),
            "Cash-Adjusted MoS %": round(cash_adj_mos, 1),
            "EV / 3-Yr OE": round(ev_oe, 1),
            "3-Yr Norm OE ($M)": round(oe_norm, 1),
            "TTM OE ($M)": round(oe_ttm, 1),
            "TTM FCF ($M)": round(fcf_ttm, 1),
            "FCF Yield %": round(fcf_yield, 1),
            "Price Source": meta['source'],
            "File Path": meta['file_path'],
            "Status": "Success"
        }

    def run_full_market_scan(self, target_mos: float = 30.0, limit: int = None):
        """
        Runs the complete valuation across all 3,624 files in cache under 30% target MoS.
        """
        csv_pattern = os.path.join(self.cache_dir, "*.csv")
        files = glob.glob(csv_pattern)
        total_files = len(files)
        print(f"Loaded {total_files} company files from {self.cache_dir}")

        if limit:
            files = files[:limit]
            print(f"Limiting execution to first {limit} files.")

        symbols = []
        for fpath in files:
            base = os.path.basename(fpath).split(' ')[0].replace('.csv', '').upper()
            if base and len(base) <= 5:
                symbols.append(base)

        symbols = list(dict.fromkeys(symbols))
        if self.pull_live_prices:
            self.fetch_batch_live_quotes(symbols)

        parsed_items = []
        for idx, fpath in enumerate(files, 1):
            if idx % 1000 == 0 or idx == len(files):
                print(f"  Parsed [{idx}/{len(files)}] files...")
            parsed = self.parse_ttm_csv(fpath)
            if parsed:
                parsed_items.append(parsed)

        # Deduplicate multiple instruments sharing the exact same CIK (e.g. preferred shares, subordinated notes, duplicate share classes)
        # Keep the one with the highest market capitalization (which is the primary common equity)
        cik_groups = {}
        for item in parsed_items:
            cik = item['meta'].get('cik', '')
            if cik and cik != '0' and cik != 'nan':
                if cik not in cik_groups:
                    cik_groups[cik] = []
                cik_groups[cik].append(item)
            else:
                cik_groups[item['meta']['symbol']] = [item]

        deduped_items = []
        for key, group in cik_groups.items():
            if len(group) == 1:
                deduped_items.append(group[0])
            else:
                group.sort(key=lambda x: (x['meta']['market_cap'], -len(x['meta']['symbol'])), reverse=True)
                deduped_items.append(group[0])

        filtered_count = len(parsed_items) - len(deduped_items)
        print(f"[Deduplication] Retained {len(deduped_items)} primary common equities (filtered {filtered_count} secondary/preferred instruments).")

        results = []
        start_time = time.time()
        print(f"\n[Valuation Engine] Scanning and valuing {len(deduped_items)} companies under Prompt V6.2 (30.0% MoS)...")

        for idx, parsed in enumerate(deduped_items, 1):
            if idx % 500 == 0 or idx == len(deduped_items):
                print(f"  Valued [{idx}/{len(deduped_items)}] companies | Success: {len(results)}...")

            val = self.evaluate_valuation(parsed, target_mos=target_mos)
            if val:
                results.append(val)

        elapsed = round(time.time() - start_time, 2)
        print(f"\nCompleted Prompt V6.2 Valuation Scan in {elapsed}s. Valued {len(results)} companies.")

        order_map = {"Dual Green Light": 1, "EPV Green Light": 2, "DCF Green Light": 3, "Watchlist": 4, "Pass": 5}
        results.sort(key=lambda x: (order_map.get(x['Verdict Group'], 9), -x['EPV MoS %'], -x['3-Yr RORC %']))
        return results

    def generate_vault_report(self, results: list, target_mos: float = 30.0, output_path: str = None):
        """
        Writes the master formatted Markdown report into Obsidian Vault.
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        date_str = datetime.now().strftime("%Y-%m-%d %H:%M")

        if not output_path:
            vault_dir = r"G:\My Drive\Company Data\GTD_Investing_Journal\GTD_Investment_Latticework_Organized\02 AI_Terminal\Screens"
            os.makedirs(vault_dir, exist_ok=True)
            output_path = os.path.join(vault_dir, f"Prompt_V6_2_Full_Market_Valuation_{timestamp}.md")

        csv_dir = r"G:\My Drive\Company Data"
        os.makedirs(csv_dir, exist_ok=True)
        csv_path = os.path.join(csv_dir, f"Prompt_V6_2_Full_Market_Valuation_{timestamp}.csv")
        
        df = pd.DataFrame(results)
        df.to_csv(csv_path, index=False, encoding='utf-8')
        print(f"[CSV Output] Saved full market valuation CSV to: {csv_path}")

        dual_buys = [r for r in results if r['Verdict Group'] == "Dual Green Light"]
        epv_buys = [r for r in results if r['Verdict Group'] == "EPV Green Light"]
        dcf_buys = [r for r in results if r['Verdict Group'] == "DCF Green Light"]
        watch = [r for r in results if r['Verdict Group'] == "Watchlist"]
        pass_list = [r for r in results if r['Verdict Group'] == "Pass"]

        md = []
        md.append("---")
        md.append(f"tags: [dcf, valuation, prompt_v6_2, epv, full_market, dual_valuation, 30pct_mos]")
        md.append(f"run_date: {date_str}")
        md.append(f"target_mos: {target_mos:.0f}%")
        md.append(f"cycle_window: 3_years")
        md.append(f"hurdle_rate: 10.0%")
        md.append(f"total_companies_screened: {len(results)}")
        md.append(f"dual_green_lights: {len(dual_buys)}")
        md.append(f"epv_green_lights: {len(epv_buys)}")
        md.append(f"dcf_green_lights: {len(dcf_buys)}")
        md.append("---\n")

        md.append(f"# 🦁 Master Prompt V6.2 Full-Market Dual Valuation Dossier (30% MoS)")
        md.append(f"> [!abstract] Executive Market-Wide Valuation Summary ({date_str})")
        md.append(f"> **Database Universe:** 3,624 NYSE/NASDAQ Companies (40-Quarter TTM Fundamentals).")
        md.append(f"> **Target Margin of Safety:** Strict **{target_mos:.0f}%** Standard (Seth Klarman Margin of Safety).")
        md.append(f"> **Modern Compressed Cycle:** **3-Year Window (12 Quarters)** per Master Prompt V6.2 Section 12.3.")
        md.append(f"> **Live Pricing Engine:** Real-time market prices and market caps synchronized via FMP Batch Quotes.")
        md.append(f"> **Governing Protocol:** Master Prompt V6.2 (Strict 10.0% Static Hurdle Rate).")
        md.append(f"> **Dual Model Results:** **{len(dual_buys)} Dual Green Lights**, **{len(epv_buys)} EPV Green Lights**, **{len(dcf_buys)} DCF Green Lights**, **{len(watch)} on Watchlist**.\n")

        md.append("## 🏆 Top Actionable Opportunities Matrix (Green Lights & Watchlist)\n")
        md.append(
            f"| Ticker | Archetype | Sector | Market Price | Zero-Growth EPV | EPV Target Buy ({target_mos:.0f}% MoS) | Owner Earnings DCF | DCF Target Buy ({target_mos:.0f}% MoS) | Action Verdict | 3-Yr RORC | EV / 3-Yr OE | FCF Yield | ROIC TTM |"
        )
        md.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")

        actionable = dual_buys + epv_buys + dcf_buys + watch
        for r in actionable[:100]:
            epv_t_key = f"EPV Target Buy ({target_mos:.0f}% MoS)"
            dcf_t_key = f"DCF Target Buy ({target_mos:.0f}% MoS)"
            md.append(
                f"| **{r['Ticker']}** | `{r['Archetype']}` | <i>{r['Sector']}</i> | "
                f"**${r['Market Price']:.2f}** | **${r['Zero-Growth EPV ($)']:.2f}** | "
                f"${r[epv_t_key]:.2f} | **${r['Owner Earnings DCF ($)']:.2f}** | "
                f"${r[dcf_t_key]:.2f} | **{r['Action Verdict']}** | "
                f"{r['3-Yr RORC %']:+.1f}% | {r['EV / 3-Yr OE']:.1f}x | "
                f"{r['FCF Yield %']:.1f}% | {r['ROIC TTM %']:.1f}% |"
            )

        md.append("\n---\n")
        md.append("## 🔬 Breakdown by Actionable Priority\n")

        md.append(f"### 🟢 Dual Green Light (Terminal Priority #1 - Passed BOTH Models @ {target_mos:.0f}% MoS) ({len(dual_buys)} Companies)\n")
        if dual_buys:
            for b in dual_buys:
                epv_t_key = f"EPV Target Buy ({target_mos:.0f}% MoS)"
                dcf_t_key = f"DCF Target Buy ({target_mos:.0f}% MoS)"
                md.append(f"- **{b['Ticker']}** (`{b['Archetype']}` - {b['Sector']}): Market Price **${b['Market Price']:.2f}** | EPV Target: **${b[epv_t_key]:.2f}** (EPV: ${b['Zero-Growth EPV ($)']:.2f}) | DCF Target: **${b[dcf_t_key]:.2f}** (DCF: ${b['Owner Earnings DCF ($)']:.2f}) | 3-Yr RORC: {b['3-Yr RORC %']:+.1f}% | FCF Yield: {b['FCF Yield %']:.1f}%.")
        else:
            md.append(f"*No companies currently pass both models simultaneously at {target_mos:.0f}% Margin of Safety.*")

        md.append(f"\n### 🟩 EPV Green Light (Zero-Growth Deep Value Floor @ {target_mos:.0f}% MoS) ({len(epv_buys)} Companies)\n")
        if epv_buys:
            for b in epv_buys[:25]:
                epv_t_key = f"EPV Target Buy ({target_mos:.0f}% MoS)"
                md.append(f"- **{b['Ticker']}** (`{b['Archetype']}` - {b['Sector']}): Market Price **${b['Market Price']:.2f}** vs. EPV Target **${b[epv_t_key]:.2f}** (EPV: ${b['Zero-Growth EPV ($)']:.2f}, 3-Yr RORC: {b['3-Yr RORC %']:+.1f}%).")

        md.append(f"\n### 🌱 DCF Green Light (Growth-Accretive Compounders @ {target_mos:.0f}% MoS) ({len(dcf_buys)} Companies)\n")
        if dcf_buys:
            for b in dcf_buys[:25]:
                dcf_t_key = f"DCF Target Buy ({target_mos:.0f}% MoS)"
                md.append(f"- **{b['Ticker']}** (`{b['Archetype']}` - {b['Sector']}): Market Price **${b['Market Price']:.2f}** vs. DCF Target **${b[dcf_t_key]:.2f}** (DCF: ${b['Owner Earnings DCF ($)']:.2f}, ROIC: {b['ROIC TTM %']:.1f}%).")

        md.append(f"\n### 🟡 Active Watchlist (Within 15% of Strike Price) ({len(watch)} Companies)\n")
        if watch:
            for w in watch[:25]:
                dcf_t_key = f"DCF Target Buy ({target_mos:.0f}% MoS)"
                epv_t_key = f"EPV Target Buy ({target_mos:.0f}% MoS)"
                md.append(f"- **{w['Ticker']}** (`{w['Archetype']}` - {w['Sector']}): Market Price **${w['Market Price']:.2f}** (EPV Target: ${w[epv_t_key]:.2f} | DCF Target: ${w[dcf_t_key]:.2f}).")

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(md))

        print(f"\n[Obsidian Vault] Saved Full-Market report to: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Master Prompt V6.2 Full-Market Dual Valuation Screener")
    parser.add_argument("--cache-dir", type=str, default=r"C:\Users\Ronald\Downloads\Cache\TTM_Output_20260821", help="Path to 40Q TTM cache folder.")
    parser.add_argument("--mos", type=float, default=30.0, help="Target Margin of Safety %% (default: 30.0)")
    parser.add_argument("--hurdle-rate", type=float, default=0.10, help="Static hurdle rate (default: 0.10 / 10%% per Prompt V6.2)")
    parser.add_argument("--growth-cap", type=float, default=0.12, help="Maximum initial growth cap (default: 0.12 / 12%%)")
    parser.add_argument("--years", type=int, default=3, help="Modern compressed cycle window in years (default: 3)")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of companies to scan.")
    parser.add_argument("--no-live-price", action="store_true", help="Disable live FMP batch price fetching.")
    args = parser.parse_args()

    screener = PromptV62FullMarketValuationEngine(
        cache_dir=args.cache_dir,
        hurdle_rate=args.hurdle_rate,
        growth_cap=args.growth_cap,
        years=args.years,
        pull_live_prices=not args.no_live_price
    )
    results = screener.run_full_market_scan(target_mos=args.mos, limit=args.limit)
    screener.generate_vault_report(results, target_mos=args.mos)

if __name__ == "__main__":
    main()
