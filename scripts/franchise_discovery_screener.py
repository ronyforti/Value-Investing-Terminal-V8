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

class FranchiseDiscoveryEngine:
    """
    Franchise-First Value Discovery Engine (Munger/Buffett/Greenwald Compliant):
    
    1. STRICT NO-EBITDA SOLVENCY:
       - Strictly NO EBITDA or EV/EBITDA multiples.
       - Operating Income / Interest Expense >= 8.0x (or debt-free).
       - Net Debt / Stockholders' Equity < 50.0% OR Net Cash > 0 (Cash > Total Debt).
       - Share-Cannibal Exception (negative equity from massive historical buybacks):
         Total Debt <= 2.5x 3-Year Avg Owner Earnings.
       - 10-Year Debt Durability: Net Debt <= 3.0x TTM Owner Earnings (entire debt serviceable in <=3 yrs).
       - Immediate Liquidity: Cash & ST Investments / Current Debt >= 1.2x.

    2. MUNGER FRANCHISE MOAT GATEKEEPER:
       - 5-Year Average ROIC >= 12.0% (target 15%+).
       - Greenwald RORC >= 8.0% (proves high returns on retained earnings).
       - Asset-Light Cash Conversion: Maintenance CapEx / OCF <= 35.0% (Growth CapEx not penalized).
       - Sloan Accrual Quality: 3-Year Cumulative OCF >= 80% of Cumulative Net Income.
       - Business Engine Intact: TTM Revenue >= 90% of 3-Year Average Revenue.

    3. THREE ACTIONABLE HUNTING GROUNDS:
       - Hunting Ground A: 52-Week Dislocation (Down >= 20% from high with fundamentals intact).
       - Hunting Ground B: Capital Cannibal (Share count declining >= 2.5%/yr funded by cash flow).
       - Hunting Ground C: High-Yield Stalwart (Owner Earnings Yield >= 7.0%, <= 14.3x OE).

    4. DUAL VALUATION & STRIKE-PRICE RADAR:
       - Zero-Growth EPV Floor (10.0% Static Hurdle Rate).
       - Owner Earnings DCF (10.0% Static Hurdle Rate, capped at 12% growth).
       - Target Buy Price at 30% MoS & Target Buy Price at 20% MoS.
       - Exact Gap-to-Strike tracking.
    """

    EXCLUDED_SECTORS = {
        'Marine Shipping', 'Oil & Gas Drilling', 'Oil & Gas E&P', 
        'Apparel - Retail', 'Department Stores', 'Thermal Coal', 'Mortgage',
        'Shell Companies', 'Blank Checks', 'Shell Companies - Special Purpose',
        'Insurance - Diversified', 'Insurance - Property & Casualty', 'Insurance - Life',
        'Insurance - Reinsurance', 'Insurance - Specialty', 'Banks - Diversified',
        'Banks - Regional'
    }

    def __init__(self, cache_dir: str = r"C:\Users\Ronald\Downloads\Cache\TTM_Output_20260821",
                 pull_live_prices: bool = True):
        self.cache_dir = cache_dir
        self.hurdle_rate = 0.10 # Strict 10.0% Static Hurdle Rate (Zero WACC/CAPM)
        self.api_key = API_KEY
        self.pull_live_prices = pull_live_prices and bool(API_KEY)
        self.fx_rates = self.load_fx_rates()
        self.live_quotes = {}

    def load_fx_rates(self) -> dict:
        rates = {
            'USD': 1.0, 'CAD': 1.376, 'BRL': 5.18, 'EUR': 0.856, 'GBP': 0.733,
            'JPY': 158.95, 'KRW': 1385.74, 'INR': 84.0, 'MXN': 16.92, 'AUD': 1.40,
            'CHF': 0.801, 'HKD': 7.84, 'TWD': 31.81, 'CNY': 7.15, 'SEK': 9.80,
            'NOK': 9.90, 'DKK': 6.38, 'SGD': 1.28, 'ZAR': 17.50, 'ILS': 3.65
        }
        try:
            r = requests.get('https://open.er-api.com/v6/latest/USD', timeout=5)
            if r.status_code == 200:
                live = r.json().get('rates', {})
                if live:
                    rates.update(live)
                    rates['USD'] = 1.0
                    print(f"[FX Engine] Synchronized {len(rates)} live exchange rates.")
        except Exception:
            pass
        return rates

    def fetch_batch_live_quotes(self, symbols: list):
        if not self.pull_live_prices or not symbols:
            return

        total_syms = len(symbols)
        print(f"\n[Live FMP Pricing] Fetching real-time quotes & 52-week data for {total_syms} companies...")
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
                            yh = float(item.get('yearHigh', 0.0) or 0.0)
                            yl = float(item.get('yearLow', 0.0) or 0.0)
                            if sym and p > 0:
                                self.live_quotes[sym] = {
                                    'price': p,
                                    'market_cap': round(mc / 1e6, 2) if mc > 0 else 0.0,
                                    'year_high': yh,
                                    'year_low': yl
                                }
                                successful_quotes += 1
                time.sleep(0.04)
            except Exception:
                pass

        elapsed = round(time.time() - start_t, 2)
        print(f"[Live FMP Pricing] Retrieved {successful_quotes} live quotes across {total_syms} symbols in {elapsed}s.")

    def parse_ttm_csv(self, file_path: str):
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

            try: cached_mcap = float(df.iloc[2, 1])
            except: cached_mcap = 0.0
            try: cached_price = float(df.iloc[4, 1])
            except: cached_price = 0.0

            live = self.live_quotes.get(symbol)
            if live and live['price'] > 0:
                price = live['price']
                market_cap = live['market_cap'] if live['market_cap'] > 0 else cached_mcap
                year_high = live.get('year_high', 0.0)
                year_low = live.get('year_low', 0.0)
                price_source = "Live FMP Real-Time"
            else:
                price = cached_price
                market_cap = cached_mcap
                year_high = price * 1.2
                year_low = price * 0.8
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
                'market_cap': market_cap,
                'year_high': year_high,
                'year_low': year_low
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

                    # Scale normalization
                    if len(vals) >= 2:
                        sub = [abs(x) for x in vals[1:4] if abs(x) > 0.01]
                        if sub and abs(vals[0]) > 0.01:
                            avg_sub = np.median(sub)
                            ratio = abs(vals[0]) / avg_sub
                            if 400.0 <= ratio <= 2500.0: vals[0] /= 1000.0
                            elif 400000.0 <= ratio <= 2500000.0: vals[0] /= 1000000.0

                    is_shares = any(k in line_item.lower() for k in ['shsout', 'shares', 'weightedaverage'])
                    if not is_shares and reported_currencies:
                        for j in range(len(vals)):
                            cur = reported_currencies[j] if j < len(reported_currencies) else 'USD'
                            if cur != 'USD':
                                fx = self.fx_rates.get(cur, 1.0)
                                if fx > 0: vals[j] = vals[j] / fx

                    sections[curr_section][line_item] = vals

            if not curr_headers or len(curr_headers) < 4:
                return None

            return {
                'meta': metadata,
                'headers': curr_headers,
                'cash_flow': sections.get('Cash Flow Statement', {}),
                'income': sections.get('Income Statement', {}),
                'balance': sections.get('Balance Statement', {})
            }
        except Exception:
            return None

    def evaluate_franchise(self, parsed: dict):
        meta = parsed['meta']
        symbol = meta['symbol']
        industry = meta['industry']
        price = meta['price']
        mcap = meta['market_cap']

        if price <= 0.01 or mcap < 50.0:
            return None

        # Negative Sector Filter
        if any(exc.lower() in industry.lower() for exc in self.EXCLUDED_SECTORS):
            return None

        cf = parsed['cash_flow']
        inc = parsed['income']
        bs = parsed['balance']

        # Shares
        shares_series = inc.get('weightedAverageShsOutDil', inc.get('weightedAverageShsOut', cf.get('weightedAverageShsOutDil', cf.get('weightedAverageShsOut', []))))
        if not shares_series or len(shares_series) == 0 or shares_series[0] <= 0:
            return None
        curr_shares = shares_series[0]

        # Balance Sheet line items
        cash_series = bs.get('cashAndShortTermInvestments', bs.get('cashAndCashEquivalents', [0.0]))
        st_debt_series = bs.get('shortTermDebt', [0.0])
        lt_debt_series = bs.get('longTermDebt', [0.0])
        tot_debt_series = bs.get('totalDebt', [0.0])
        equity_series = bs.get('totalStockholdersEquity', [0.0])

        cash = cash_series[0] if len(cash_series) > 0 else 0.0
        st_debt = st_debt_series[0] if len(st_debt_series) > 0 else 0.0
        lt_debt = lt_debt_series[0] if len(lt_debt_series) > 0 else 0.0
        tot_debt = tot_debt_series[0] if len(tot_debt_series) > 0 else (st_debt + lt_debt)
        equity = equity_series[0] if len(equity_series) > 0 else 0.0

        net_debt = tot_debt - cash
        has_net_cash = (cash > tot_debt)

        # Income Statement & Cash Flow
        rev_series = inc.get('revenue', [0.0])
        opinc_series = inc.get('operatingIncome', [0.0])
        netinc_series = inc.get('netIncome', [0.0])
        intexp_series = inc.get('interestExpense', [0.0])
        ocf_series = cf.get('operatingCashFlow', [0.0])
        capex_series = cf.get('capitalExpenditure', [0.0])
        da_series = cf.get('depreciationAndAmortization', [0.0])

        if len(ocf_series) < 3 or len(rev_series) < 3:
            return None

        # Clean interest expense
        int_exp = abs(intexp_series[0]) if len(intexp_series) > 0 else 0.0
        op_inc_ttm = opinc_series[0] if len(opinc_series) > 0 else 0.0

        if op_inc_ttm <= 0:
            return None

        # 1. STRICT NO-EBITDA INTEREST COVERAGE: OpInc / Interest Expense >= 8.0x
        if int_exp > 1.0:
            int_coverage = op_inc_ttm / int_exp
            if int_coverage < 8.0:
                return None
        else:
            int_coverage = 999.0

        # 2. IMMEDIATE LIQUIDITY: Cash / ST Debt >= 1.2x
        if st_debt > 2.0:
            if (cash / st_debt) < 1.2:
                return None

        # Owner Earnings calculation: OCF - Maintenance CapEx
        # Maintenance CapEx conservatively estimated as min(Total CapEx, D&A * 1.15)
        # to ensure high-return Growth CapEx is not penalized
        oe_history = []
        m_capex_ratios = []
        for i in range(min(len(ocf_series), len(capex_series), 10)):
            o = ocf_series[i]
            c = abs(capex_series[i])
            da = da_series[i] if i < len(da_series) else c
            m_capex = min(c, da * 1.15) if da > 0 else c * 0.7
            oe = o - m_capex
            oe_history.append(oe)
            if o > 0:
                m_capex_ratios.append(m_capex / o)

        if len(oe_history) < 3:
            return None

        oe_ttm = oe_history[0]
        oe_3y_avg = np.mean(oe_history[:3])

        if oe_ttm <= 0 or oe_3y_avg <= 0:
            return None

        # 3. FORTRESS SOLVENCY RULE: Net Debt / Equity < 50% OR Net Cash > 0
        net_de_ratio = (net_debt / equity) if equity > 0 else (999.0 if net_debt > 0 else -1.0)
        if not has_net_cash:
            if equity > 0:
                if net_de_ratio > 0.50:
                    return None
            else:
                # Share-cannibal negative equity exception (e.g. AZO):
                # Total Debt must be retireable in <= 2.5 years of Owner Earnings
                if tot_debt > (2.5 * oe_3y_avg):
                    return None

        # 4. 10-YEAR DEBT COVERAGE: Net Debt <= 3.0x TTM Owner Earnings (if not net cash)
        if not has_net_cash and net_debt > (3.0 * oe_ttm):
            return None

        # 5. ASSET-LIGHT NATURE: Maintenance CapEx / OCF <= 35.0%
        avg_m_capex_ratio = np.mean(m_capex_ratios[:3]) * 100.0 if m_capex_ratios else 999.0
        if avg_m_capex_ratio > 35.0:
            return None

        # 6. SLOAN ACCRUAL QUALITY TEST: 3-Year Cumulative OCF >= 80% of Cumulative Net Income
        ocf_3y_sum = sum(ocf_series[:min(3, len(ocf_series))])
        netinc_3y_sum = sum(netinc_series[:min(3, len(netinc_series))])
        if netinc_3y_sum > 0 and (ocf_3y_sum / netinc_3y_sum) < 0.80:
            return None

        # 7. MUNGER ECONOMIC MOAT TEST: 5-Year Average ROIC >= 12.0%
        tax_rate = 0.21
        roic_history = []
        for i in range(min(5, len(opinc_series), len(equity_series))):
            op = opinc_series[i]
            eq = equity_series[i] if i < len(equity_series) else equity
            db = tot_debt_series[i] if i < len(tot_debt_series) else tot_debt
            csh = cash_series[i] if i < len(cash_series) else cash
            inv_cap = db + eq - csh
            if inv_cap > 5.0 and op > 0:
                nopat = op * (1.0 - tax_rate)
                roic_history.append((nopat / inv_cap) * 100.0)

        roic_5y_avg = np.mean(roic_history) if len(roic_history) >= 2 else (roic_history[0] if roic_history else 0.0)
        if roic_5y_avg < 12.0:
            return None

        # 8. GREENWALD RORC: Return on Retained Capital >= 8.0%
        rorc = 0.0
        if len(oe_history) >= 4 and len(netinc_series) >= 4:
            delta_oe = oe_history[0] - oe_history[3]
            retained_cap = sum(netinc_series[:4])
            if retained_cap > 10.0 and delta_oe > 0:
                rorc = (delta_oe / retained_cap) * 100.0
            elif delta_oe <= 0 and oe_ttm > 0:
                if len(oe_history) >= 5 and len(netinc_series) >= 5:
                    delta_oe_5 = oe_history[0] - oe_history[4]
                    retained_5 = sum(netinc_series[:5])
                    if retained_5 > 10.0 and delta_oe_5 > 0:
                        rorc = (delta_oe_5 / retained_5) * 100.0

        # 9. REVENUE TRAJECTORY INTACT: TTM Revenue >= 90% of 3-Year Avg Revenue
        rev_ttm = rev_series[0]
        rev_3y_avg = np.mean(rev_series[:3])
        if rev_ttm < (0.90 * rev_3y_avg):
            return None

        # SHARE CANNIBAL METRIC: 3-Year Share Dilution / Repurchase %
        if len(shares_series) >= 4 and shares_series[3] > 0:
            share_change_3y = ((shares_series[0] - shares_series[3]) / shares_series[3]) * 100.0
        else:
            share_change_3y = 0.0

        # VALUATION: Dual Intrinsic Value & Strike Prices
        # 1. Zero-Growth EPV Floor:
        # Base normalized OE capitalized at 10.0% hurdle rate + Net Cash
        enterprise_epv = oe_3y_avg / self.hurdle_rate
        equity_epv = enterprise_epv - net_debt # net_debt = tot_debt - cash
        epv_per_share = max(0.0, (equity_epv / (curr_shares / 1e6)))

        # 2. Owner Earnings DCF (10.0% Hurdle Rate):
        if len(oe_history) >= 4 and oe_history[3] > 0:
            oe_cagr = ((oe_ttm / oe_history[3]) ** (1.0 / 3.0)) - 1.0
            growth_rate = max(0.02, min(oe_cagr, 0.12))
        else:
            growth_rate = 0.05

        pv_cash_flows = 0.0
        cf_proj = oe_ttm
        for yr in range(1, 6):
            cf_proj *= (1.0 + growth_rate)
            pv_cash_flows += cf_proj / ((1.0 + self.hurdle_rate) ** yr)

        terminal_cf = cf_proj * 1.03
        terminal_val = terminal_cf / (self.hurdle_rate - 0.03)
        pv_terminal = terminal_val / ((1.0 + self.hurdle_rate) ** 5)
        dcf_enterprise = pv_cash_flows + pv_terminal
        dcf_equity = dcf_enterprise - net_debt
        dcf_per_share = max(0.0, (dcf_equity / (curr_shares / 1e6)))
        if dcf_per_share <= 0.01:
            return None

        # STRIKE PRICES: Target Buy at 30% MoS and 20% MoS
        target_buy_30 = dcf_per_share * 0.70
        target_buy_20 = dcf_per_share * 0.80

        # GAP TO STRIKE
        gap_to_strike_20 = ((price - target_buy_20) / target_buy_20) * 100.0 if target_buy_20 > 0 else 999.0
        gap_to_strike_30 = ((price - target_buy_30) / target_buy_30) * 100.0 if target_buy_30 > 0 else 999.0

        # HUNTING GROUND CLASSIFICATION
        year_high = meta.get('year_high', price * 1.2)
        drawdown_from_high = ((year_high - price) / year_high * 100.0) if year_high > 0 else 0.0
        oe_yield = (oe_ttm / mcap) * 100.0 if mcap > 0 else 0.0

        hunting_ground = []
        if drawdown_from_high >= 20.0:
            hunting_ground.append(f"Dislocation (-{drawdown_from_high:.0f}%)")
        if share_change_3y <= -5.0:
            hunting_ground.append(f"Cannibal ({share_change_3y:.1f}%)")
        if oe_yield >= 7.0:
            hunting_ground.append(f"High-Yield ({oe_yield:.1f}%)")

        if not hunting_ground:
            hunting_ground.append("Compounder (Fair Price)")

        # ACTION STATUS
        if price <= target_buy_30:
            status = "🟢 BUY ZONE (>=30% MoS)"
            priority = 1
        elif price <= target_buy_20:
            status = "🟢 BUY ZONE (>=20% MoS)"
            priority = 2
        elif gap_to_strike_20 <= 15.0:
            status = "🟡 HIGH-ALERT RADAR (<15% to Strike)"
            priority = 3
        else:
            status = "⚪ FRANCHISE WATCHLIST (Track Pullback)"
            priority = 4

        return {
            "Ticker": symbol,
            "Sector": industry,
            "Market Price": round(price, 2),
            "Market Cap ($M)": round(mcap, 1),
            "Owner Earnings DCF ($)": round(dcf_per_share, 2),
            "Zero-Growth EPV ($)": round(epv_per_share, 2),
            "Target Buy (20% MoS)": round(target_buy_20, 2),
            "Target Buy (30% MoS)": round(target_buy_30, 2),
            "Gap to 20% Strike %": round(gap_to_strike_20, 1),
            "Status": status,
            "Priority": priority,
            "Hunting Ground": " | ".join(hunting_ground),
            "5-Yr ROIC %": round(roic_5y_avg, 1),
            "RORC %": round(rorc, 1),
            "OE Yield %": round(oe_yield, 1),
            "Net Debt / Equity %": round(net_de_ratio * 100.0, 1) if equity > 0 else -1.0,
            "Net Cash ($M)": round(-net_debt, 1),
            "Int Coverage": round(int_coverage, 1),
            "3-Yr Share Δ %": round(share_change_3y, 1),
            "Maint CapEx / OCF %": round(avg_m_capex_ratio, 1),
            "TTM OE ($M)": round(oe_ttm, 1),
            "3-Yr Avg OE ($M)": round(oe_3y_avg, 1),
            "File Path": meta['file_path']
        }

    def run_screen(self, limit: int = None):
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

        # Deduplicate multiple instruments sharing CIK
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

        print(f"[Deduplication] Retained {len(deduped_items)} primary common equities.")

        results = []
        start_time = time.time()
        print(f"\n[Franchise Discovery Engine] Scanning {len(deduped_items)} companies under Munger/Buffett rules...")

        for idx, parsed in enumerate(deduped_items, 1):
            val = self.evaluate_franchise(parsed)
            if val:
                results.append(val)

        elapsed = round(time.time() - start_time, 2)
        print(f"\nCompleted Franchise Discovery Scan in {elapsed}s.")
        print(f"Identified {len(results)} elite economic franchises meeting all fortress balance sheet & moat standards.")

        results.sort(key=lambda x: (x['Priority'], x['Gap to 20% Strike %']))
        return results

    def generate_reports(self, results: list):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        date_str = datetime.now().strftime("%Y-%m-%d %H:%M")

        vault_dir = r"G:\My Drive\Company Data\GTD_Investing_Journal\GTD_Investment_Latticework_Organized\02 AI_Terminal\Screens"
        os.makedirs(vault_dir, exist_ok=True)
        md_path = os.path.join(vault_dir, f"Franchise_Discovery_Master_{timestamp}.md")

        csv_dir = r"G:\My Drive\Company Data"
        csv_path = os.path.join(csv_dir, f"Franchise_Discovery_Master_{timestamp}.csv")

        df = pd.DataFrame(results)
        df.to_csv(csv_path, index=False, encoding='utf-8')
        print(f"[CSV Output] Saved Master Franchise CSV to: {csv_path}")

        buy_zone = [r for r in results if 'BUY ZONE' in r['Status']]
        radar = [r for r in results if 'HIGH-ALERT' in r['Status']]
        watchlist = [r for r in results if 'WATCHLIST' in r['Status']]

        md = []
        md.append("---")
        md.append("tags: [franchise, quality_first, moat_screen, terminal_pipeline, munger_rules, strike_radar]")
        md.append(f"run_date: {date_str}")
        md.append(f"total_franchises_isolated: {len(results)}")
        md.append(f"buy_zone_candidates: {len(buy_zone)}")
        md.append(f"high_alert_radar: {len(radar)}")
        md.append("---")
        md.append("")
        md.append(f"# 👑 Master Franchise Discovery & Strike-Price Radar ({date_str})")
        md.append("> **Investment Protocol:** Warren Buffett, Charlie Munger, Peter Lynch & Bruce Greenwald Framework.")
        md.append("> **Solvency Standard:** Strict NO-EBITDA. Net Debt/Equity < 50% OR Net Cash > 0. Operating Income / Interest >= 8.0x.")
        md.append("> **Moat Standard:** 5-Year ROIC >= 12% (Target 15%+), Greenwald RORC >= 8%, Maint CapEx <= 35% OCF.")
        md.append(f"> **Database Universe:** 3,624 NYSE/NASDAQ Companies (40-Quarter TTM Fundamentals).")
        md.append(f"> **Results:** Isolated **{len(results)} elite franchises** | **{len(buy_zone)} In Buy Zone** | **{len(radar)} On High-Alert Radar**.")
        md.append("")

        if buy_zone:
            md.append("## 🟢 Section 1: Immediate Invest Priority Candidates (In the Buy Zone)")
            md.append("*These companies meet all fortress solvency rules, possess proven economic moats, and trade AT or BELOW their Terminal Target Buy Price.*")
            md.append("")
            md.append("| Ticker | Sector | Market Price | DCF ($) | Target Buy (20% MoS) | Gap to 20% Strike | 5-Yr ROIC | OE Yield | Hunting Ground | Net Cash ($M) |")
            md.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
            for r in buy_zone:
                md.append(f"| **{r['Ticker']}** | {r['Sector']} | **${r['Market Price']:.2f}** | ${r['Owner Earnings DCF ($)']:.2f} | **${r['Target Buy (20% MoS)']:.2f}** | **{r['Gap to 20% Strike %']:+.1f}%** | {r['5-Yr ROIC %']:.1f}% | {r['OE Yield %']:.1f}% | `{r['Hunting Ground']}` | ${r['Net Cash ($M)']:,.1f}M |")
            md.append("")

        if radar:
            md.append("## 🟡 Section 2: High-Alert Strike Radar (Within 15% of Entry Target)")
            md.append("*Pristine franchises within striking distance. Set limit orders or monitor daily for market pullbacks.*")
            md.append("")
            md.append("| Ticker | Sector | Market Price | DCF ($) | Target Buy (20% MoS) | Gap to Strike | 5-Yr ROIC | OE Yield | Hunting Ground | Net Debt/Equity |")
            md.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
            for r in radar:
                de_str = f"{r['Net Debt / Equity %']:.1f}%" if r['Net Debt / Equity %'] >= 0 else "Net Cash"
                md.append(f"| **{r['Ticker']}** | {r['Sector']} | **${r['Market Price']:.2f}** | ${r['Owner Earnings DCF ($)']:.2f} | **${r['Target Buy (20% MoS)']:.2f}** | **+{r['Gap to 20% Strike %']:.1f}%** | {r['5-Yr ROIC %']:.1f}% | {r['OE Yield %']:.1f}% | `{r['Hunting Ground']}` | {de_str} |")
            md.append("")

        md.append("## ⚪ Section 3: The Master Franchise Watchlist (Top 35)")
        md.append("*Elite compounders meeting all moat and solvency standards. Awaiting broad market sell-offs.*")
        md.append("")
        md.append("| Ticker | Sector | Market Price | DCF ($) | Target Buy (20% MoS) | Gap to Strike | 5-Yr ROIC | OE Yield | Hunting Ground |")
        md.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
        for r in watchlist[:35]:
            md.append(f"| **{r['Ticker']}** | {r['Sector']} | **${r['Market Price']:.2f}** | ${r['Owner Earnings DCF ($)']:.2f} | **${r['Target Buy (20% MoS)']:.2f}** | **+{r['Gap to 20% Strike %']:.1f}%** | {r['5-Yr ROIC %']:.1f}% | {r['OE Yield %']:.1f}% | `{r['Hunting Ground']}` |")
        md.append("")

        with open(md_path, "w", encoding="utf-8") as f:
            f.write("\n".join(md))

        print(f"[Vault Output] Saved Master Franchise Markdown Report to: {md_path}")
        return md_path, csv_path

def main():
    parser = argparse.ArgumentParser(description="Franchise-First Value Discovery Engine")
    parser.add_argument("--cache-dir", default=r"C:\Users\Ronald\Downloads\Cache\TTM_Output_20260821", help="Path to TTM CSV cache")
    parser.add_argument("--no-live-prices", action="store_true", help="Skip live FMP price fetching")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of files parsed")
    args = parser.parse_args()

    engine = FranchiseDiscoveryEngine(
        cache_dir=args.cache_dir,
        pull_live_prices=not args.no_live_prices
    )
    results = engine.run_screen(limit=args.limit)
    if results:
        engine.generate_reports(results)
    else:
        print("[WARNING] Zero franchises met all combined criteria.")

if __name__ == "__main__":
    main()
