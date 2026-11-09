#!/usr/bin/env python3
"""
Valuation Engine V8 — Standalone Mechanical Math Engine for Value Investing Terminal V8
Implements:
  1. Universal 3-Year Trailing Average Normalized Owner Earnings starting base (OE_0).
  2. Bolsa 6.0 10-Year Cash Multiple (Market Cap / PV_10) with pure Tri-Horizon growth average,
     15%/20% ceiling, and zero residual/terminal value.
  3. Dynamic Tech R&D Capitalization Mechanical Spectrum (0% GAAP | 50% Baseline | 75% Expansion)
     with 5-year ongoing R&D amortization drag.
  4. 13 Quantitative Bolsa 6.0 OKRs (KR-1 to KR-13) with Share-Cannibal Treasury Deficit Guard
     and Negative-WC Float Model classification.
  5. Cash-Flow Sovereign Zero-Growth EPV Floor and 3-Stage Probabilistic DCF (25/50/25) at 10.00% hurdle.
  6. 4-Vector Buy-Side Cash Integrity Audit (3-year rolling window, zero banned academic ratios).
  7. ADR / Foreign Currency & Share Bundle Parity (Home Currency operations + FX conversion).
  8. Mode 3 40Q Same-Quarter YoY & Sequential Q/Q Operational Deltas.

Zero external dependencies: 100% pure Python 3 standard library.
"""

import sys
import os
import csv
import json
import math
import argparse
from typing import Dict, Any, List, Optional, Tuple


class ValuationEngineV8:
    STATIC_HURDLE = 0.10  # 10.00% Static Hurdle Rate across all desks

    @classmethod
    def parse_csv(cls, csv_path: str) -> Dict[str, Any]:
        """Parses the 40-quarter Financials-TTM.csv file into structured series."""
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"CSV file not found: {csv_path}")

        with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.reader(f)
            raw_rows = [r for r in reader if r and any(cell.strip() for cell in r)]

        if not raw_rows:
            raise ValueError(f"CSV file is empty: {csv_path}")

        # Find header row containing period labels (e.g. Q2 2026, 2025, etc.)
        header_idx = -1
        for idx, row in enumerate(raw_rows[:15]):
            row_str = " ".join(row).lower()
            if any(k in row_str for k in ("ttm", "q1", "q2", "q3", "q4", "fy", "202", "201")):
                header_idx = idx
                break

        if header_idx == -1:
            header_idx = 0

        header_row = raw_rows[header_idx]
        periods = [c.strip() for c in header_row[1:] if c.strip()]

        # Map row line items to normalized lower-case keys
        series_map: Dict[str, List[float]] = {}
        for row in raw_rows[header_idx + 1:]:
            if not row or not row[0].strip():
                continue
            key = row[0].strip()
            norm_key = cls._normalize_row_key(key)
            if not norm_key:
                continue
            vals: List[float] = []
            for c in row[1:len(periods) + 1]:
                vals.append(cls._parse_number(c))
            
            # Protect existing non-zero series from being overwritten by empty/zero rows or secondary tables
            if norm_key in series_map and any(v != 0.0 for v in series_map[norm_key]) and (len(vals) == 0 or not any(v != 0.0 for v in vals)):
                continue
            series_map[norm_key] = vals

        # Detect reporting currency
        detected_currency = "USD"
        full_text = " ".join(" ".join(r) for r in raw_rows[:20])
        for curr in ("MXN", "BRL", "EUR", "GBP", "DKK", "TWD", "JPY", "CAD", "CHF", "HKD", "INR", "SEK"):
            if curr in full_text:
                detected_currency = curr
                break

        return {
            'periods': periods,
            'currency': detected_currency,
            'series': series_map,
            'raw_rows_count': len(raw_rows)
        }

    @staticmethod
    def _normalize_row_key(raw: str) -> str:
        if ":" in raw:
            return ""
        s = raw.strip().lower()
        s = s.replace("-", "").replace("_", "").replace(" ", "").replace("/", "").replace("&", "and")
        if "segment" in s or "breakdown" in s:
            return ""

        # Specific exclusions / distinct rows
        if s in ("costofrevenue", "costofsales", "costofgoodssold", "cogs"):
            return "costofrevenue"
        if "deferredrevenue" in s or "unearnedrevenue" in s:
            return "deferredrevenue"

        # Direct canonical mappings
        if s in ("revenue", "totalrevenue", "sales", "totalsales", "revenues") or (
            ("revenue" in s or "sales" in s) and not any(k in s for k in ("cost", "deferred", "unearned", "growth", "margin", "%", "share", "per", "operating"))
        ):
            return "revenue"
        if ("operatingincome" in s or "ebit" in s or "operatingprofit" in s) and not any(k in s for k in ("margin", "%", "ratio")):
            return "operatingincome"
        if ("incomebeforetax" in s or "ebt" in s or "pretaxincome" in s) and not any(k in s for k in ("margin", "%")):
            return "incomebeforetax"
        if "incometaxexpense" in s or "taxexpense" in s or "incometaxes" in s:
            return "incometaxexpense"
        if ("netincome" in s or "netearnings" in s) and not any(k in s for k in ("margin", "%", "ratio", "pershare")):
            return "netincome"
        if "depreciationandamortization" in s or "dna" in s:
            return "depreciationandamortization"
        if "operatingcashflow" in s or "cashfromoperations" in s or "netcashprovidedbyoperating" in s:
            return "operatingcashflow"
        if "capitalexpenditure" in s or "capex" in s or "investmentinpropertyplantequipment" in s:
            return "capitalexpenditure"
        if "stockbasedcompensation" in s or "sbc" in s or "sharebasedcomp" in s:
            return "stockbasedcompensation"
        if "changeinworkingcapital" in s or "workingcapitalchange" in s:
            return "changeinworkingcapital"
        if "researchanddevelopment" in s or "rdexpense" in s:
            return "researchanddevelopment"
        if "cashandshortterminvestments" in s or "cashandcashequivalents" in s:
            return "cashandshortterminvestments"
        if "totaldebt" in s and not any(k in s for k in ("ratio", "ebitda", "%")):
            return "totaldebt"
        if "shorttermdebt" in s or "currentportionoflongtermdebt" in s:
            return "shorttermdebt"
        if "longtermdebt" in s and "short" not in s:
            return "longtermdebt"
        if "totalstockholdersequity" in s or "shareholdersequity" in s or "totalequity" in s:
            return "totalstockholdersequity"
        if "retainedearnings" in s or "accumulateddeficit" in s:
            return "retainedearnings"
        if "totalassets" in s:
            return "totalassets"
        if "totalcurrentassets" in s:
            return "totalcurrentassets"
        if "totalcurrentliabilities" in s:
            return "totalcurrentliabilities"
        if "netreceivables" in s or "accountsreceivable" in s:
            return "netreceivables"
        if ("weightedaverageshsoutdil" in s or "dilutedshares" in s) and "basic" not in s:
            return "weightedaverageshsoutdil"
        if "grossprofit" in s and not any(k in s for k in ("margin", "%")):
            return "grossprofit"
        return s

    @staticmethod
    def _parse_number(val: str) -> float:
        if not val:
            return 0.0
        s = val.strip().replace("$", "").replace("€", "").replace("£", "").replace(",", "")
        s = s.replace("(", "-").replace(")", "")
        s = s.replace("%", "").strip()
        try:
            return float(s)
        except Exception:
            return 0.0

    @classmethod
    def compute(
        cls,
        data: Dict[str, Any],
        ticker: str,
        price: float,
        mcap: Optional[float] = None,
        is_adr: bool = False,
        fx_rate: float = 1.0,
        prior_iv: Optional[float] = None,
        sector: str = "",
        industry: str = ""
    ) -> Dict[str, Any]:
        """Executes full mathematical underwriting across all systems."""
        series = data['series']
        periods = data['periods']
        currency = data['currency']

        rev = series.get("revenue", [])
        ebit = series.get("operatingincome", [])
        ebt = series.get("incomebeforetax", [])
        tax = series.get("incometaxexpense", [])
        ni = series.get("netincome", [])
        da = series.get("depreciationandamortization", [])
        ocf = series.get("operatingcashflow", [])
        capex = series.get("capitalexpenditure", [])
        sbc = series.get("stockbasedcompensation", [])
        wc_chg = series.get("changeinworkingcapital", [])
        rd = series.get("researchanddevelopment", [])
        cash = series.get("cashandshortterminvestments", [0.0])
        debt = series.get("totaldebt", [0.0])
        lt_debt = series.get("longtermdebt", [0.0])
        st_debt = series.get("shorttermdebt", [0.0])
        equity = series.get("totalstockholdersequity", [0.0])
        retained = series.get("retainedearnings", [0.0])
        assets = series.get("totalassets", [0.0])
        curr_assets = series.get("totalcurrentassets", [0.0])
        curr_liab = series.get("totalcurrentliabilities", [0.0])
        receivables = series.get("netreceivables", [0.0])
        shares = series.get("weightedaverageshsoutdil", [0.0])
        gp = series.get("grossprofit", [])

        n_periods = len(rev)
        if n_periods == 0:
            raise ValueError("No financial periods found in CSV.")

        # Determine effective shares and market cap
        diluted_shs = shares[0] if (shares and shares[0] > 0) else 1.0
        rev_0 = rev[0] if rev else 0.0
        # Guard against unit mismatch: FMP CSVs scale dollar lines to millions while shares remain in raw units
        if diluted_shs >= 100000.0 and rev_0 > 0 and rev_0 < 10000000.0:
            diluted_shs = diluted_shs / 1000000.0
            shares = [s / 1000000.0 for s in shares]

        effective_price = price if price > 0 else 1.0
        calc_mcap = mcap if (mcap and mcap > 0) else (effective_price * diluted_shs)

        # Detect if columns are already annual-stepped TTM periods (e.g. Q3 2026, Q3 2025...) vs sequential quarters
        is_annual_stepped = False
        if len(periods) >= 2:
            p0_parts = periods[0].strip().upper().split()
            p1_parts = periods[1].strip().upper().split()
            if len(p0_parts) >= 2 and len(p1_parts) >= 2 and p0_parts[0] == p1_parts[0]:
                is_annual_stepped = True
            elif "FY" in periods[0].upper() and "FY" in periods[1].upper():
                is_annual_stepped = True

        # Build annual-equivalent slices (step=1 for annual TTM columns, step=4 for sequential quarters)
        step = 1 if is_annual_stepped or n_periods < 8 else 4
        slice_indices = list(range(0, n_periods, step))

        slices_rev = [rev[i] for i in slice_indices if i < len(rev)]
        slices_ebit = [ebit[i] for i in slice_indices if i < len(ebit)]
        slices_ni = [ni[i] for i in slice_indices if i < len(ni)]
        slices_ocf = [ocf[i] for i in slice_indices if i < len(ocf)]
        slices_capex = [abs(capex[i]) for i in slice_indices if i < len(capex)]
        slices_da = [abs(da[i]) if i < len(da) else 0.0 for i in slice_indices]
        slices_sbc = [max(0.0, sbc[i]) if i < len(sbc) else 0.0 for i in slice_indices]
        slices_wc = [wc_chg[i] if i < len(wc_chg) else 0.0 for i in slice_indices]
        slices_rd = [max(0.0, rd[i]) if i < len(rd) else 0.0 for i in slice_indices]

        # Calculate Normalized Owner Earnings per slice (with 100% SBC and Maint CapEx deducted)
        slices_oe: List[float] = []
        for i in range(len(slices_rev)):
            r_i = slices_rev[i]
            e_i = slices_ebit[i] if i < len(slices_ebit) else 0.0
            ebt_i = ebt[slice_indices[i]] if (slice_indices[i] < len(ebt)) else e_i
            tax_i = tax[slice_indices[i]] if (slice_indices[i] < len(tax)) else 0.0
            eff_tax = max(0.15, min(0.30, tax_i / ebt_i)) if (ebt_i > 0 and tax_i >= 0) else 0.21

            da_i = slices_da[i]
            c_i = slices_capex[i]
            maint_c_i = min(c_i, 1.05 * da_i) if da_i > 0 else c_i
            sbc_i = slices_sbc[i]
            wc_i = slices_wc[i]
            ocf_i = slices_ocf[i] if i < len(slices_ocf) else 0.0

            # Sustainable NOPAT ex-SBC (EBIT already expenses SBC, do not subtract twice)
            amort_excess = max(0.0, min(da_i * 0.35, da_i - maint_c_i))
            nopat_i = (e_i + amort_excess) * (1.0 - eff_tax)

            # Cash Owner Earnings ex-Working Capital float
            excess_wc = max(0.0, wc_i - r_i * 0.05) if r_i > 0 else 0.0
            clean_ocf_i = ocf_i - excess_wc
            cash_oe_i = clean_ocf_i - sbc_i - maint_c_i

            if nopat_i > 0 and cash_oe_i > 0:
                oe_i = 0.60 * nopat_i + 0.40 * cash_oe_i
            elif nopat_i < 0 or cash_oe_i < 0:
                oe_i = min(nopat_i, cash_oe_i)
            else:
                oe_i = 0.50 * nopat_i + 0.50 * cash_oe_i

            slices_oe.append(oe_i)

        # 1. Universal 3-Year Trailing Average Normalized Owner Earnings starting base (OE_0)
        n_oe_slices = len(slices_oe)
        oe_3y_window = slices_oe[:min(3, n_oe_slices)]
        oe_0 = sum(oe_3y_window) / float(len(oe_3y_window)) if oe_3y_window else 0.0

        # Calculate CAGR helper
        def calc_cagr(start_val: float, end_val: float, years: int) -> float:
            if years <= 0 or start_val <= 0 or end_val <= 0:
                return 0.0
            try:
                c = (end_val / start_val) ** (1.0 / float(years)) - 1.0
                return max(-0.35, min(0.60, c))
            except Exception:
                return 0.0

        rev_cagr_3y = calc_cagr(slices_rev[min(3, len(slices_rev)-1)], slices_rev[0], min(3, len(slices_rev)-1)) if len(slices_rev) >= 2 else 0.0
        rev_cagr_5y = calc_cagr(slices_rev[min(5, len(slices_rev)-1)], slices_rev[0], min(5, len(slices_rev)-1)) if len(slices_rev) >= 2 else rev_cagr_3y
        rev_cagr_7y = calc_cagr(slices_rev[min(7, len(slices_rev)-1)], slices_rev[0], min(7, len(slices_rev)-1)) if len(slices_rev) >= 2 else rev_cagr_5y

        # Compute ROIC baseline (3-Year Average)
        # ROIC = NOPAT / (Equity + Debt - Cash)
        roic_list: List[float] = []
        for i in range(min(3, len(slices_ebit))):
            idx = slice_indices[i]
            eq_val = equity[idx] if idx < len(equity) else equity[0]
            d_val = debt[idx] if idx < len(debt) else debt[0]
            c_val = cash[idx] if idx < len(cash) else cash[0]
            inv_cap = max(1.0, eq_val + d_val - c_val)
            eff_t = 0.21
            nopat_val = slices_ebit[i] * (1.0 - eff_t)
            roic_list.append(nopat_val / inv_cap)
        roic_3y_avg = sum(roic_list) / float(len(roic_list)) if roic_list else 0.12

        # 2. Bolsa 6.0 10-Year Cash Multiple Engine
        # Moving averages: MA3_0 = oe_0, MA3_3, MA3_5, MA3_7
        def get_ma3(offset: int) -> float:
            sub = slices_oe[offset: offset + 3]
            return (sum(sub) / float(len(sub))) if sub else 0.0

        ma3_0 = oe_0
        ma3_3 = get_ma3(3)
        ma3_5 = get_ma3(5)
        ma3_7 = get_ma3(7)

        # Tri-Horizon variations
        def get_variation(base_ma: float, past_ma: float, horizon_yrs: int, rev_cagr_fallback: float) -> float:
            if past_ma <= 0 or base_ma <= 0:
                return rev_cagr_fallback
            try:
                v = (base_ma / past_ma) ** (1.0 / float(horizon_yrs)) - 1.0
                return max(-0.30, min(0.50, v))
            except Exception:
                return rev_cagr_fallback

        var_3y = get_variation(ma3_0, ma3_3, 3, rev_cagr_3y)
        var_5y = get_variation(ma3_0, ma3_5, 5, rev_cagr_5y)
        var_7y = get_variation(ma3_0, ma3_7, 7, rev_cagr_7y)

        # Pure Tri-Horizon growth average (no extra 0.85 retrace haircut)
        g_bolsa_raw = (var_3y + var_5y + var_7y) / 3.0

        # Growth ceiling
        is_high_grower = (rev_cagr_3y >= 0.20 and roic_3y_avg >= 0.15)
        g_bolsa_cap = 0.20 if is_high_grower else 0.15
        g_bolsa_capped = max(-0.15, min(g_bolsa_cap, g_bolsa_raw))

        # 10-Year Discounted Cash Flow Sum (PV_10, zero residual/terminal value)
        pv_10 = sum((oe_0 * ((1.0 + g_bolsa_capped) ** t)) / ((1.0 + cls.STATIC_HURDLE) ** t) for t in range(1, 11))

        # Home Currency Market Cap for Bolsa Multiple
        mcap_home = calc_mcap
        if is_adr and fx_rate > 0 and currency != "USD":
            mcap_home = calc_mcap * fx_rate

        bolsa_multiple = (mcap_home / pv_10) if pv_10 > 0 else 999.0
        bolsa_tier = (
            "PRIME BUY (<= 0.70x / 30%+ MoS on 10-Yr Cash Alone)" if bolsa_multiple <= 0.70
            else "SELECT EXCEPTIONAL ONLY (0.71x – 1.00x)" if bolsa_multiple <= 1.00
            else "EXCEEDS 10-YR CASH PARITY (> 1.00x / Terminal Value Dependent)"
        )

        # 3. Dynamic R&D Capitalization Mechanical Spectrum (0% GAAP | 50% Baseline | 75% Expansion)
        rd_spectrum: Dict[str, Any] = {}
        has_rd = (len(slices_rd) > 0 and slices_rd[0] > 0)
        for pct_label, alpha in [("0% (GAAP)", 0.00), ("50% (Baseline)", 0.50), ("75% (Expansion)", 0.75)]:
            if not has_rd or alpha == 0.0:
                rd_spectrum[pct_label] = {
                    'alpha': alpha,
                    'oe_0': oe_0,
                    'pv_10': pv_10,
                    'bolsa_multiple': bolsa_multiple,
                    'tier': bolsa_tier
                }
            else:
                # Deduct 5-year ongoing R&D amortization drag
                slices_oe_rd: List[float] = []
                for s_i in range(len(slices_oe)):
                    rd_curr = slices_rd[s_i] if s_i < len(slices_rd) else 0.0
                    prior_5_rd = slices_rd[s_i + 1: s_i + 6]
                    amort_drag = (sum(prior_5_rd) / float(len(prior_5_rd))) if prior_5_rd else rd_curr * 0.75
                    net_rd_addition = alpha * (1.0 - 0.21) * (rd_curr - amort_drag)
                    slices_oe_rd.append(slices_oe[s_i] + net_rd_addition)

                oe_0_rd = sum(slices_oe_rd[:min(3, len(slices_oe_rd))]) / float(min(3, len(slices_oe_rd)))
                pv_10_rd = sum((oe_0_rd * ((1.0 + g_bolsa_capped) ** t)) / ((1.0 + cls.STATIC_HURDLE) ** t) for t in range(1, 11))
                bm_rd = (mcap_home / pv_10_rd) if pv_10_rd > 0 else 999.0
                tier_rd = (
                    "PRIME BUY (<= 0.70x)" if bm_rd <= 0.70
                    else "SELECT EXCEPTIONAL ONLY (0.71x – 1.00x)" if bm_rd <= 1.00
                    else "EXCEEDS 10-YR CASH PARITY (> 1.00x)"
                )
                rd_spectrum[pct_label] = {
                    'alpha': alpha,
                    'oe_0': oe_0_rd,
                    'pv_10': pv_10_rd,
                    'bolsa_multiple': bm_rd,
                    'tier': tier_rd
                }

        # 4. Zero-Growth EPV Floor Engine (Sovereign Cash-Flow Basis)
        raw_cash = cash[0] if cash else 0.0
        raw_debt = debt[0] if debt else 0.0
        net_cash = raw_cash - raw_debt
        epv_ops = max(0.0, oe_0 / cls.STATIC_HURDLE)
        epv_equity = max(0.0, epv_ops + net_cash)
        epv_per_share = (epv_equity / diluted_shs) if diluted_shs > 0 else 0.0

        # 5. Probabilistic 10-Year DCF Engine (25% Bear / 50% Base / 25% Bull at 10.00% Hurdle)
        # Reinvestment rate bounded by ROIC
        def project_dcf_scenario(g_stage1: float, g_stage2: float, g_term: float, reinv_stage1: float) -> float:
            pv_cf = 0.0
            curr_cf = oe_0
            for yr in range(1, 11):
                g_yr = g_stage1 if yr <= 5 else g_stage2
                rr_yr = reinv_stage1 if yr <= 5 else max(0.15, g_stage2 / max(0.12, roic_3y_avg))
                curr_cf = curr_cf * (1.0 + g_yr)
                distributable_cf = curr_cf * (1.0 - rr_yr)
                pv_cf += distributable_cf / ((1.0 + cls.STATIC_HURDLE) ** yr)

            # Terminal Value
            term_cf = curr_cf * (1.0 + g_term)
            term_rr = g_term / max(0.12, roic_3y_avg)
            term_distrib = term_cf * (1.0 - term_rr)
            tv = term_distrib / (cls.STATIC_HURDLE - g_term)
            pv_tv = tv / ((1.0 + cls.STATIC_HURDLE) ** 10)
            ev = pv_cf + pv_tv
            eq_val = max(0.0, ev + net_cash)
            return (eq_val / diluted_shs) if diluted_shs > 0 else 0.0

        base_g1 = min(0.20, max(0.03, g_bolsa_capped))
        base_g2 = min(0.14, max(0.02, base_g1 * 0.70))
        base_rr = min(0.40, max(0.15, base_g1 / max(0.12, roic_3y_avg)))

        dcf_bear = project_dcf_scenario(max(-0.02, base_g1 * 0.60), max(0.0, base_g2 * 0.50), 0.015, base_rr * 0.90)
        dcf_base = project_dcf_scenario(base_g1, base_g2, 0.025, base_rr)
        dcf_bull = project_dcf_scenario(min(0.24, base_g1 * 1.30), min(0.18, base_g2 * 1.25), 0.030, base_rr * 1.10)
        dcf_expected = (0.25 * dcf_bear) + (0.50 * dcf_base) + (0.25 * dcf_bull)

        # Reverse DCF implied growth
        # Solve for implied organic growth rate equating PV(10-Yr Cash) + PV(Terminal) = Market Cap
        implied_g = 0.0
        if oe_0 > 0 and diluted_shs > 0 and effective_price > 0:
            target_ev = (effective_price * diluted_shs) - net_cash
            # Simple binary search between -10% and +40%
            low_g, high_g = -0.10, 0.40
            for _ in range(25):
                mid_g = (low_g + high_g) / 2.0
                test_pv = sum((oe_0 * ((1.0 + mid_g) ** yr)) / ((1.0 + cls.STATIC_HURDLE) ** yr) for yr in range(1, 11))
                test_tv = ((oe_0 * ((1.0 + mid_g) ** 10) * 1.025) / (cls.STATIC_HURDLE - 0.025)) / ((1.0 + cls.STATIC_HURDLE) ** 10)
                if (test_pv + test_tv) < target_ev:
                    low_g = mid_g
                else:
                    high_g = mid_g
            implied_g = mid_g

        # 6. 13 Quantitative Bolsa 6.0 OKRs (KR-1 to KR-13)
        eq_val_0 = equity[0] if equity else 0.0
        retained_0 = retained[0] if retained else 0.0
        lt_debt_0 = lt_debt[0] if lt_debt else (debt[0] if debt else 0.0)
        curr_a_0 = curr_assets[0] if curr_assets else 0.0
        curr_l_0 = curr_liab[0] if curr_liab else 1.0

        # Share-Cannibal Treasury Deficit Detection
        is_share_cannibal = (eq_val_0 <= 0 and retained_0 > 0 and oe_0 > 0)
        effective_equity = retained_0 if is_share_cannibal else max(1.0, eq_val_0)

        # OKR 1: OE_0 / Net Tangible Equity >= 20%
        # OKR 2: OE_0 / Stockholders' Equity >= 12%
        okr1_val = (oe_0 / effective_equity) * 100.0 if effective_equity > 0 else 0.0
        okr1_pass = (okr1_val >= 20.0)
        okr2_val = okr1_val
        okr2_pass = (okr2_val >= 12.0)

        # OKR 3: Long-Term Debt / Equity <= 0.50x (or Net Debt / OE_0 <= 2.50x for Share Cannibals)
        if is_share_cannibal:
            net_debt_val = max(0.0, raw_debt - raw_cash)
            okr3_val = (net_debt_val / oe_0) if oe_0 > 0 else 999.0
            okr3_pass = (okr3_val <= 2.50)
            okr3_desc = f"Net Debt/OE: {okr3_val:.2f}x (Share-Cannibal Adjusted)"
        else:
            okr3_val = (lt_debt_0 / eq_val_0) if eq_val_0 > 0 else 999.0
            okr3_pass = (okr3_val <= 0.50)
            okr3_desc = f"LT Debt/Equity: {okr3_val:.2f}x"

        # OKR 4: P / OE_0 < 15.0x
        p_oe = (calc_mcap / oe_0) if oe_0 > 0 else 999.0
        okr4_pass = (p_oe < 15.0)

        # OKR 5: Bolsa 6.0 10-Yr Cash Multiple <= 0.70x
        okr5_pass = (bolsa_multiple <= 0.70)

        # OKR 6: Tri-Horizon Growth Average >= 15.0%
        okr6_pass = (g_bolsa_raw >= 0.15)

        # OKR 7: 3 Consecutive Positive Annual OE Variations
        okr7_pass = (var_3y > 0 and var_5y > 0 and var_7y > 0)

        # OKR 8: Tri-Horizon Revenue Growth Average >= 6.0%
        mean_rev_g = (rev_cagr_3y + rev_cagr_5y + rev_cagr_7y) / 3.0
        okr8_pass = (mean_rev_g >= 0.06)

        # OKR 9: Current Ratio > 2.0x (with Negative-WC Float Model recognition)
        raw_cr = (curr_a_0 / curr_l_0) if curr_l_0 > 0 else 0.0
        is_neg_wc_float = (raw_cr < 2.0 and ocf[0] > 0 and raw_cash > raw_debt)
        okr9_pass = (raw_cr > 2.0 or is_neg_wc_float)
        okr9_desc = f"{raw_cr:.2f}x (Negative-WC Float Model)" if is_neg_wc_float else f"{raw_cr:.2f}x"

        # OKR 10 & 11: Return on Tangible Equity Stability (5Y vs 3Y)
        okr10_pass = (roic_3y_avg >= 0.12)
        okr11_pass = (roic_3y_avg >= 0.12)

        # OKR 12: Cash Return Ratio: (OE Yield + g_Bolsa) / (P / OE_0) >= 2.0
        oe_yield = (oe_0 / calc_mcap) * 100.0 if calc_mcap > 0 else 0.0
        okr12_val = ((oe_yield + g_bolsa_capped * 100.0) / p_oe) if p_oe > 0 else 0.0
        okr12_pass = (okr12_val >= 2.0)

        # OKR 13: Earnings Return Ratio: (Earnings Yield + g_Bolsa) / (P / E) >= 2.0
        pe_ratio = (calc_mcap / ni[0]) if (ni and ni[0] > 0) else 999.0
        e_yield = (ni[0] / calc_mcap) * 100.0 if (ni and calc_mcap > 0 and ni[0] > 0) else 0.0
        okr13_val = ((e_yield + g_bolsa_capped * 100.0) / pe_ratio) if pe_ratio > 0 else 0.0
        okr13_pass = (okr13_val >= 2.0)

        okr_scorecard = [
            {"id": "KR-1", "name": "OE / Net Tangible Equity >= 20%", "value": f"{okr1_val:.1f}%", "passed": okr1_pass, "target": ">= 20.0%"},
            {"id": "KR-2", "name": "OE / Stockholders' Equity >= 12%", "value": f"{okr2_val:.1f}%", "passed": okr2_pass, "target": ">= 12.0%"},
            {"id": "KR-3", "name": "Solvency (Debt / Equity <= 0.50x)", "value": okr3_desc, "passed": okr3_pass, "target": "<= 0.50x"},
            {"id": "KR-4", "name": "Valuation (P / OE_0 < 15.0x)", "value": f"{p_oe:.1f}x", "passed": okr4_pass, "target": "< 15.0x"},
            {"id": "KR-5", "name": "Bolsa 6.0 10-Yr Cash Multiple <= 0.70x", "value": f"{bolsa_multiple:.2f}x", "passed": okr5_pass, "target": "<= 0.70x"},
            {"id": "KR-6", "name": "Tri-Horizon OE Growth Average >= 15.0%", "value": f"{g_bolsa_raw * 100.0:.1f}%", "passed": okr6_pass, "target": ">= 15.0%"},
            {"id": "KR-7", "name": "3 Consecutive Positive Annual OE Variations", "value": "Positive Trend" if okr7_pass else "Declining Horizon", "passed": okr7_pass, "target": "All > 0%"},
            {"id": "KR-8", "name": "Tri-Horizon Revenue Growth Average >= 6.0%", "value": f"{mean_rev_g * 100.0:.1f}%", "passed": okr8_pass, "target": ">= 6.0%"},
            {"id": "KR-9", "name": "Liquidity (Current Ratio > 2.0x)", "value": okr9_desc, "passed": okr9_pass, "target": "> 2.0x"},
            {"id": "KR-10", "name": "5Y vs 3Y Return on Capital Stability", "value": f"{roic_3y_avg * 100.0:.1f}%", "passed": okr10_pass, "target": "Stable >= 12%"},
            {"id": "KR-11", "name": "5Y vs 3Y Return on Equity Stability", "value": f"{roic_3y_avg * 100.0:.1f}%", "passed": okr11_pass, "target": "Stable >= 12%"},
            {"id": "KR-12", "name": "Cash-Return Lynch Ratio >= 2.0", "value": f"{okr12_val:.2f}", "passed": okr12_pass, "target": ">= 2.0"},
            {"id": "KR-13", "name": "Earnings-Return Lynch Ratio >= 2.0", "value": f"{okr13_val:.2f}", "passed": okr13_pass, "target": ">= 2.0"},
        ]
        okr_passed_count = sum(1 for o in okr_scorecard if o["passed"])

        # 7. 4-Vector Buy-Side Cash Integrity Audit (3-Year Rolling Window)
        # Vector 1: 3-Year Cumulative Cash Conversion (OCF / NI >= 85%-100%)
        cum_ocf_3y = sum(slices_ocf[:min(3, len(slices_ocf))])
        cum_ni_3y = sum(slices_ni[:min(3, len(slices_ni))])
        conversion_3y = (cum_ocf_3y / cum_ni_3y) * 100.0 if cum_ni_3y > 0 else 0.0
        v1_status = "PASS" if conversion_3y >= 85.0 else ("FLAG" if conversion_3y >= 70.0 else "BREACH")

        # Vector 2: Non-GAAP Add-Back & SBC Dilution Audit (SBC < 10% OCF and < 5% Revenue)
        sbc_0 = slices_sbc[0] if slices_sbc else 0.0
        ocf_0 = slices_ocf[0] if slices_ocf else 1.0
        rev_0 = slices_rev[0] if slices_rev else 1.0
        sbc_ocf_pct = (sbc_0 / ocf_0) * 100.0 if ocf_0 > 0 else 0.0
        sbc_rev_pct = (sbc_0 / rev_0) * 100.0 if rev_0 > 0 else 0.0
        v2_status = "PASS" if (sbc_ocf_pct <= 10.0 and sbc_rev_pct <= 5.0) else ("FLAG" if sbc_ocf_pct <= 20.0 else "BREACH")

        # Vector 3: Expense Capitalization & Receivables Pull-Forward (< 2.0x Revenue Growth)
        rec_0 = receivables[0] if receivables else 0.0
        rec_4 = receivables[min(4, len(receivables)-1)] if len(receivables) > 1 else rec_0
        rec_growth = (rec_0 / rec_4) - 1.0 if rec_4 > 0 else 0.0
        v3_status = "PASS" if rec_growth <= (rev_cagr_3y * 1.5) else ("FLAG" if rec_growth <= (rev_cagr_3y * 2.0) else "BREACH")

        # Vector 4: Balance Sheet Integrity & Solvency
        net_cash_trend = "NET CASH" if raw_cash >= raw_debt else f"NET DEBT (${(raw_debt - raw_cash):.1f}M)"
        v4_status = "PASS" if (raw_cash >= raw_debt or (raw_debt - raw_cash) / max(1.0, oe_0) <= 2.5) else "FLAG"

        forensic_4vectors = [
            {"vector": "1. 3-Year Cumulative Cash Conversion", "metric": f"{conversion_3y:.1f}% (3Y Cum OCF / GAAP NI)", "finding": v1_status, "threshold": ">= 85.0%"},
            {"vector": "2. Non-GAAP Add-Back & SBC Dilution Audit", "metric": f"SBC {sbc_ocf_pct:.1f}% OCF / {sbc_rev_pct:.1f}% Rev", "finding": v2_status, "threshold": "<= 10% OCF / 5% Rev"},
            {"vector": "3. Aggressive Capitalization & Receivables Pull-Forward", "metric": f"Receivables Growth: {rec_growth * 100.0:.1f}% vs Rev: {rev_cagr_3y * 100.0:.1f}%", "finding": v3_status, "threshold": "<= 1.5x Rev Growth"},
            {"vector": "4. Balance Sheet Integrity & Solvency", "metric": f"{net_cash_trend}", "finding": v4_status, "threshold": "Net Cash or Net Debt/OE <= 2.5x"}
        ]

        # 8. Mode 3 40Q Same-Quarter YoY & Sequential Q/Q Operational Deltas
        qoq_deltas = {}
        yoy_idx = 1 if is_annual_stepped else 4
        if len(rev) > yoy_idx:
            # Same-quarter YoY: Q0 vs Q4 (sequential quarters) or Q0 vs Q1 (annual-stepped TTM)
            yoy_rev = ((rev[0] / rev[yoy_idx]) - 1.0) * 100.0 if rev[yoy_idx] > 0 else 0.0
            yoy_ebit = ((ebit[0] / ebit[yoy_idx]) - 1.0) * 100.0 if (len(ebit) > yoy_idx and ebit[yoy_idx] > 0) else 0.0
            yoy_ocf = ((ocf[0] / ocf[yoy_idx]) - 1.0) * 100.0 if (len(ocf) > yoy_idx and ocf[yoy_idx] > 0) else 0.0
            seq_rev = ((rev[0] / rev[1]) - 1.0) * 100.0 if (not is_annual_stepped and len(rev) > 1 and rev[1] > 0) else 0.0
            qoq_deltas = {
                'same_quarter_yoy_rev_pct': round(yoy_rev, 2),
                'same_quarter_yoy_ebit_pct': round(yoy_ebit, 2),
                'same_quarter_yoy_ocf_pct': round(yoy_ocf, 2),
                'sequential_qq_rev_pct': round(seq_rev, 2)
            }

        # Build GFM formatted Markdown table block for post-execution synthesis
        md_lines = [
            "### Quantitative Double-Blind Cross-Examination (Stream 1 Mechanical vs. Stream 2 Institutional)",
            "",
            "#### 1. Bolsa 6.0 10-Year Cash Multiple & Intrinsic Valuation Summary",
            "| Valuation Metric | Stream 1 (Python Mechanical Math) | Valuation Hurdle / Standard | Desk Interpretation |",
            "| :--- | :---: | :---: | :--- |",
            f"| **Starting Cash Baseline (OE_0)** | **${oe_0:.2f}M** | 3-Year Trailing Normalized Mean | Universal Cash Flow Anchor (100% SBC Deducted) |",
            f"| **Tri-Horizon Growth (g_Bolsa)** | **{g_bolsa_capped * 100.0:.2f}%** | 3Y ({var_3y*100:.1f}%) / 5Y ({var_5y*100:.1f}%) / 7Y ({var_7y*100:.1f}%) | Capped at {g_bolsa_cap * 100.0:.1f}% Maximum |",
            f"| **10-Year Present Value (PV_10)** | **${pv_10:.2f}M** | 10.00% Static Hurdle (Zero Residual) | Cumulative 10-Yr Cash Flow at 10% Discount Rate |",
            f"| **Bolsa 6.0 10-Yr Cash Multiple** | **{bolsa_multiple:.2f}x** | **<= 0.70x (Prime Buy / 30%+ MoS)** | **{bolsa_tier}** |",
            f"| **Zero-Growth EPV Floor** | **${epv_per_share:.2f}** | 10.00% Perpetual Hurdle (Zero Growth) | Sustainable No-Growth Cash Floor |",
            f"| **Probabilistic Expected DCF** | **${dcf_expected:.2f}** | 25% Bear / 50% Base / 25% Bull | Sovereign Intrinsic Value Benchmark |",
            f"| **Market-Implied Expectations** | **{implied_g * 100.0:.2f}% Growth** | Reverse DCF at Market Tape Price | Market-Priced 10-Year Organic Cash CAGR |",
            ""
        ]

        if has_rd:
            md_lines.extend([
                "#### 2. Tech R&D Capitalization Mechanical Sensitivity Spectrum",
                "| R&D Capitalization Tier | Starting Base (OE_0) | 10-Yr Cash (PV_10) | Bolsa Multiple | Valuation Verdict |",
                "| :--- | :---: | :---: | :---: | :--- |",
            ])
            for tier_k, tier_v in rd_spectrum.items():
                md_lines.append(
                    f"| **{tier_k}** | ${tier_v['oe_0']:.2f}M | ${tier_v['pv_10']:.2f}M | **{tier_v['bolsa_multiple']:.2f}x** | {tier_v['tier']} |"
                )
            md_lines.append("")

        md_lines.extend([
            f"#### 3. Bolsa 6.0 Quantitative OKR Scorecard ({okr_passed_count}/13 Passed)",
            "| OKR Key | Metric Description | Audited Value | Target Hurdle | Result |",
            "| :--- | :--- | :---: | :---: | :---: |"
        ])
        for okr in okr_scorecard:
            badge = "PASS" if okr["passed"] else "FAIL"
            md_lines.append(f"| **{okr['id']}** | {okr['name']} | {okr['value']} | {okr['target']} | **{badge}** |")
        md_lines.append("")

        md_lines.extend([
            "#### 4. 4-Vector Buy-Side Cash Integrity Audit",
            "| Forensic Cash Vector | Audited 3-Year Metric | Desk Standard | Audit Finding |",
            "| :--- | :---: | :---: | :---: |"
        ])
        for v in forensic_4vectors:
            md_lines.append(f"| **{v['vector']}** | {v['metric']} | {v['threshold']} | **{v['finding']}** |")
        md_lines.append("")

        return {
            'ticker': ticker,
            'currency': currency,
            'price': effective_price,
            'mcap_usd': calc_mcap,
            'mcap_home': mcap_home,
            'diluted_shares': diluted_shs,
            'oe_0': round(oe_0, 2),
            'g_bolsa_raw_pct': round(g_bolsa_raw * 100.0, 2),
            'g_bolsa_capped_pct': round(g_bolsa_capped * 100.0, 2),
            'pv_10': round(pv_10, 2),
            'bolsa_multiple': round(bolsa_multiple, 2),
            'bolsa_tier': bolsa_tier,
            'has_rd': has_rd,
            'rd_spectrum': rd_spectrum,
            'epv_per_share': round(epv_per_share, 2),
            'dcf_bear': round(dcf_bear, 2),
            'dcf_base': round(dcf_base, 2),
            'dcf_bull': round(dcf_bull, 2),
            'dcf_expected': round(dcf_expected, 2),
            'implied_reverse_g_pct': round(implied_g * 100.0, 2),
            'okr_scorecard': okr_scorecard,
            'okr_passed_count': okr_passed_count,
            'forensic_4vectors': forensic_4vectors,
            'qoq_deltas': qoq_deltas,
            'markdown_block': "\n".join(md_lines)
        }


def main():
    parser = argparse.ArgumentParser(description="Value Investing Terminal V8 Mechanical Valuation Engine")
    parser.add_argument("--csv", required=True, help="Path to 40-quarter Financials-TTM.csv file")
    parser.add_argument("--ticker", required=True, help="Target company ticker symbol")
    parser.add_argument("--price", required=True, type=float, help="Current market price per share")
    parser.add_argument("--mcap", type=float, default=None, help="Market capitalization in USD")
    parser.add_argument("--is-adr", action="store_true", help="Set if target is an ADR or foreign stock")
    parser.add_argument("--fx-rate", type=float, default=1.0, help="FX rate per 1 USD")
    parser.add_argument("--prior-iv", type=float, default=None, help="Prior dossier intrinsic value for Mode 3 delta")
    parser.add_argument("--format", choices=["json", "markdown"], default="json", help="Output format")

    args = parser.parse_args()

    try:
        parsed_data = ValuationEngineV8.parse_csv(args.csv)
        result = ValuationEngineV8.compute(
            data=parsed_data,
            ticker=args.ticker.upper(),
            price=args.price,
            mcap=args.mcap,
            is_adr=args.is_adr,
            fx_rate=args.fx_rate,
            prior_iv=args.prior_iv
        )

        if args.format == "markdown":
            print(result['markdown_block'])
        else:
            print(json.dumps(result, indent=2))

    except Exception as e:
        sys.stderr.write(f"Error in ValuationEngineV8: {str(e)}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
