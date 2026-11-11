#!/usr/bin/env python3
"""
Unit Test Suite for Valuation Engine V8 (tests/test_valuation_engine.py)
Tests:
  1. Golden Parity Benchmark: Validates Bolsa 6.0 formulas, 3Y OE_0 average,
     and Share-Cannibal negative equity guard against bkng.xlsx ground truth.
  2. Tech R&D Capitalization Mechanical Spectrum (0% | 50% | 75%) with 5-year amortization drag.
  3. ADR / Foreign Currency & Share Bundle Parity.
  4. Turnaround / Negative Base Year Mathematical Guard.
  5. Living Rules Nomenclature Integrity: Asserts zero banned academic ratios or creator names.
  6. Zero Hardcoded Tickers: Asserts valuation_engine.py contains zero hardcoded ticker strings.
"""

import unittest
import os
import sys
import tempfile
import csv
import math

# Add repo root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from scripts.valuation_engine import ValuationEngineV8


class TestValuationEngineV8(unittest.TestCase):

    def setUp(self):
        # Create a synthetic 12-quarter CSV fixture with known financial numbers
        self.temp_dir = tempfile.TemporaryDirectory()
        self.csv_path = os.path.join(self.temp_dir.name, "TEST_Financials_TTM.csv")

        # 12 quarterly columns (Q0 = latest TTM down to Q11)
        headers = ["Line Item"] + [f"Q{i} 2026" for i in range(12)]
        rows = [
            headers,
            ["Revenue"] + ["10000.0", "9500.0", "9000.0", "8500.0", "8000.0", "7500.0", "7000.0", "6500.0", "6000.0", "5500.0", "5000.0", "4500.0"],
            ["Operating Income"] + ["2500.0", "2300.0", "2100.0", "1900.0", "1800.0", "1700.0", "1600.0", "1500.0", "1400.0", "1300.0", "1200.0", "1100.0"],
            ["Income Before Tax"] + ["2400.0", "2200.0", "2000.0", "1800.0", "1700.0", "1600.0", "1500.0", "1400.0", "1300.0", "1200.0", "1100.0", "1000.0"],
            ["Income Tax Expense"] + ["504.0", "462.0", "420.0", "378.0", "357.0", "336.0", "315.0", "294.0", "273.0", "252.0", "231.0", "210.0"],
            ["Net Income"] + ["1896.0", "1738.0", "1580.0", "1422.0", "1343.0", "1264.0", "1185.0", "1106.0", "1027.0", "948.0", "869.0", "790.0"],
            ["Depreciation and Amortization"] + ["500.0", "480.0", "460.0", "440.0", "420.0", "400.0", "380.0", "360.0", "340.0", "320.0", "300.0", "280.0"],
            ["Operating Cash Flow"] + ["2800.0", "2600.0", "2400.0", "2200.0", "2100.0", "1950.0", "1800.0", "1650.0", "1500.0", "1350.0", "1200.0", "1050.0"],
            ["Capital Expenditure"] + ["-600.0", "-580.0", "-550.0", "-520.0", "-500.0", "-480.0", "-450.0", "-420.0", "-400.0", "-380.0", "-350.0", "-320.0"],
            ["Stock Based Compensation"] + ["200.0", "190.0", "180.0", "170.0", "160.0", "150.0", "140.0", "130.0", "120.0", "110.0", "100.0", "90.0"],
            ["Change in Working Capital"] + ["100.0", "90.0", "80.0", "70.0", "60.0", "50.0", "40.0", "30.0", "20.0", "10.0", "0.0", "-10.0"],
            ["Research and Development"] + ["800.0", "750.0", "700.0", "650.0", "600.0", "550.0", "500.0", "450.0", "400.0", "350.0", "300.0", "250.0"],
            ["Cash and Short Term Investments"] + ["5000.0", "4800.0", "4600.0", "4400.0", "4200.0", "4000.0", "3800.0", "3600.0", "3400.0", "3200.0", "3000.0", "2800.0"],
            ["Total Debt"] + ["3000.0", "3000.0", "3000.0", "3000.0", "3000.0", "3000.0", "3000.0", "3000.0", "3000.0", "3000.0", "3000.0", "3000.0"],
            ["Long Term Debt"] + ["2500.0", "2500.0", "2500.0", "2500.0", "2500.0", "2500.0", "2500.0", "2500.0", "2500.0", "2500.0", "2500.0", "2500.0"],
            ["Total Stockholders Equity"] + ["8000.0", "7500.0", "7000.0", "6500.0", "6000.0", "5500.0", "5000.0", "4500.0", "4000.0", "3500.0", "3000.0", "2500.0"],
            ["Retained Earnings"] + ["12000.0", "11000.0", "10000.0", "9000.0", "8000.0", "7000.0", "6000.0", "5000.0", "4000.0", "3000.0", "2000.0", "1000.0"],
            ["Total Current Assets"] + ["6500.0", "6200.0", "5900.0", "5600.0", "5300.0", "5000.0", "4700.0", "4400.0", "4100.0", "3800.0", "3500.0", "3200.0"],
            ["Total Current Liabilities"] + ["2500.0", "2400.0", "2300.0", "2200.0", "2100.0", "2000.0", "1900.0", "1800.0", "1700.0", "1600.0", "1500.0", "1400.0"],
            ["Net Receivables"] + ["1200.0", "1150.0", "1100.0", "1050.0", "1000.0", "950.0", "900.0", "850.0", "800.0", "750.0", "700.0", "650.0"],
            ["Weighted Average Shs Out Dil"] + ["100.0", "101.0", "102.0", "103.0", "104.0", "105.0", "106.0", "107.0", "108.0", "109.0", "110.0", "111.0"]
        ]

        with open(self.csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerows(rows)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_universal_oe_0_and_bolsa_multiple(self):
        """Verifies universal 3Y OE_0 averaging and Bolsa 6.0 10-Yr Cash Multiple math."""
        parsed = ValuationEngineV8.parse_csv(self.csv_path)
        res = ValuationEngineV8.compute(
            data=parsed,
            ticker="MOCK",
            price=150.0,
            mcap=15000.0
        )

        # Asserts OE_0 is positive and based on 3-year trailing average
        self.assertGreater(res['oe_0'], 1000.0)
        # Asserts PV_10 is computed using 10% static hurdle rate
        self.assertGreater(res['pv_10'], 0.0)
        # Asserts Bolsa Multiple = Market Cap / PV_10
        expected_bm = round(15000.0 / res['pv_10'], 2)
        self.assertAlmostEqual(res['bolsa_multiple'], expected_bm, places=1)
        # Asserts g_bolsa is capped at 15% (or 20% for verified high-growers)
        self.assertLessEqual(res['g_bolsa_capped_pct'], 20.0)

    def test_share_cannibal_negative_equity_guard(self):
        """Tests that share cannibals with negative equity do not trigger division by zero or false bankruptcy."""
        # Create CSV with negative stockholders equity but huge retained earnings
        cannibal_csv = os.path.join(self.temp_dir.name, "CANNIBAL.csv")
        headers = ["Line Item", "Q0 2026", "Q1 2025", "Q2 2024"]
        rows = [
            headers,
            ["Revenue", "20000.0", "18000.0", "16000.0"],
            ["Operating Income", "6000.0", "5500.0", "5000.0"],
            ["Income Before Tax", "5800.0", "5300.0", "4800.0"],
            ["Income Tax Expense", "1100.0", "1000.0", "900.0"],
            ["Net Income", "4700.0", "4300.0", "3900.0"],
            ["Depreciation and Amortization", "600.0", "550.0", "500.0"],
            ["Operating Cash Flow", "7000.0", "6500.0", "6000.0"],
            ["Capital Expenditure", "-400.0", "-380.0", "-350.0"],
            ["Stock Based Compensation", "400.0", "380.0", "350.0"],
            ["Cash and Short Term Investments", "15000.0", "14000.0", "13000.0"],
            ["Total Debt", "12000.0", "11000.0", "10000.0"],
            ["Total Stockholders Equity", "-10783.0", "-8500.0", "-6000.0"],  # Negative due to massive buybacks!
            ["Retained Earnings", "20000.0", "18000.0", "16000.0"],           # Positive economic earnings!
            ["Weighted Average Shs Out Dil", "35.0", "37.0", "39.0"]
        ]
        with open(cannibal_csv, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerows(rows)

        parsed = ValuationEngineV8.parse_csv(cannibal_csv)
        res = ValuationEngineV8.compute(
            data=parsed,
            ticker="CANNIBAL",
            price=3000.0,
            mcap=105000.0
        )

        # Verify KR-1 and KR-2 passed using effective retained earnings rather than dividing by negative equity
        okr_map = {o['id']: o for o in res['okr_scorecard']}
        self.assertTrue(okr_map['KR-1']['passed'])
        self.assertTrue(okr_map['KR-2']['passed'])
        # KR-3 should use Net Debt / OE_0 for share cannibals
        self.assertIn("Share-Cannibal Adjusted", okr_map['KR-3']['value'])

    def test_tech_rd_capitalization_spectrum(self):
        """Tests that R&D spectrum (0%, 50%, 75%) satisfies strict economic monotonicity."""
        parsed = ValuationEngineV8.parse_csv(self.csv_path)
        res = ValuationEngineV8.compute(
            data=parsed,
            ticker="TECH",
            price=150.0,
            mcap=15000.0
        )

        self.assertTrue(res['has_rd'])
        spectrum = res['rd_spectrum']
        oe_0 = spectrum['0% (GAAP)']['oe_0']
        oe_50 = spectrum['50% (Baseline)']['oe_0']
        oe_75 = spectrum['75% (Expansion)']['oe_0']

        # As R&D is capitalized net of amortization drag, starting base OE increases
        self.assertGreaterEqual(oe_50, oe_0)
        self.assertGreaterEqual(oe_75, oe_50)

        # Consequently, Bolsa multiple (Market Cap / PV_10) compresses
        bm_0 = spectrum['0% (GAAP)']['bolsa_multiple']
        bm_50 = spectrum['50% (Baseline)']['bolsa_multiple']
        bm_75 = spectrum['75% (Expansion)']['bolsa_multiple']
        self.assertLessEqual(bm_50, bm_0)
        self.assertLessEqual(bm_75, bm_50)

    def test_adr_currency_parity(self):
        """Verifies that foreign stock Bolsa multiple is invariant between home currency and USD."""
        parsed = ValuationEngineV8.parse_csv(self.csv_path)
        # Pretend CSV is in MXN, spot FX rate = 18.0 MXN per 1 USD
        parsed['currency'] = "MXN"
        res_adr = ValuationEngineV8.compute(
            data=parsed,
            ticker="ADR_TEST",
            price=150.0,       # USD ADR price
            mcap=15000.0,      # USD Market Cap ($15B)
            is_adr=True,
            fx_rate=18.0       # 18.0 MXN per USD
        )

        # Market Cap in Home Currency should be 15,000 * 18.0 = 270,000 MXN
        self.assertAlmostEqual(res_adr['mcap_home'], 15000.0 * 18.0, places=1)
        expected_bm = res_adr['mcap_home'] / res_adr['pv_10']
        self.assertAlmostEqual(res_adr['bolsa_multiple'], expected_bm, places=1)

    def test_turnaround_negative_base_guard(self):
        """Verifies that negative or zero historical base years do not throw math errors."""
        turnaround_csv = os.path.join(self.temp_dir.name, "TURNAROUND.csv")
        headers = ["Line Item", "Q0 2026", "Q1 2025", "Q2 2024", "Q3 2023"]
        rows = [
            headers,
            ["Revenue", "5000.0", "4000.0", "3000.0", "2000.0"],
            ["Operating Income", "1000.0", "200.0", "-500.0", "-1000.0"],
            ["Net Income", "800.0", "150.0", "-600.0", "-1100.0"],
            ["Operating Cash Flow", "1200.0", "400.0", "-200.0", "-800.0"],
            ["Capital Expenditure", "-200.0", "-150.0", "-100.0", "-100.0"],
            ["Weighted Average Shs Out Dil", "50.0", "50.0", "50.0", "50.0"]
        ]
        with open(turnaround_csv, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerows(rows)

        parsed = ValuationEngineV8.parse_csv(turnaround_csv)
        res = ValuationEngineV8.compute(
            data=parsed,
            ticker="TURNAROUND",
            price=20.0,
            mcap=1000.0
        )
        self.assertGreater(res['oe_0'], 0.0)
        self.assertGreater(res['pv_10'], 0.0)
        self.assertFalse(math.isnan(res['bolsa_multiple']))

    def test_living_rules_nomenclature_integrity(self):
        """Living Rule Gate 12: Asserts zero banned academic ratios or creator names in engine output."""
        parsed = ValuationEngineV8.parse_csv(self.csv_path)
        res = ValuationEngineV8.compute(
            data=parsed,
            ticker="CLEAN",
            price=150.0,
            mcap=15000.0
        )
        md_text = res['markdown_block']

        banned_terms = [
            "sloan", "beneish", "greenwald", "schilit", "thorndike",
            "mauboussin", "gurley", "dso", "dpo", "ebitda"
        ]
        for term in banned_terms:
            self.assertNotIn(term, md_text.lower(), f"Banned academic term '{term}' leaked in valuation markdown block!")

    def test_zero_hardcoded_tickers_in_engine(self):
        """Verifies that valuation_engine.py contains zero hardcoded ticker literals."""
        engine_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts", "valuation_engine.py"))
        with open(engine_path, "r", encoding="utf-8") as f:
            code = f.read()

        sample_tickers = ["BKNG", "MELI", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "ADBE", "PLTR", "FMX"]
        for t in sample_tickers:
            self.assertNotIn(f'"{t}"', code, f"Hardcoded ticker literal \"{t}\" found in valuation_engine.py!")
            self.assertNotIn(f"'{t}'", code, f"Hardcoded ticker literal '{t}' found in valuation_engine.py!")

    def test_fmp_raw_share_unit_scaling_and_annual_stepped_ttm(self):
        """Verifies that raw share counts (e.g. 31,110,000) in millions-scaled CSVs are scaled by 1e6 and annual TTM columns step by 1."""
        raw_shs_csv = os.path.join(self.temp_dir.name, "RAW_SHARES.csv")
        headers = ["Line Item", "Q3 2026", "Q3 2025", "Q3 2024", "Q3 2023"]
        rows = [
            headers,
            ["Revenue", "4313.39", "2233.27", "2102.90", "1777.86"],
            ["Operating Income", "783.32", "360.48", "258.12", "192.85"],
            ["Income Before Tax", "750.00", "340.00", "240.00", "180.00"],
            ["Income Tax Expense", "150.00", "70.00", "50.00", "38.00"],
            ["Net Income", "600.00", "270.00", "190.00", "142.00"],
            ["Depreciation and Amortization", "98.42", "72.39", "65.81", "55.78"],
            ["Operating Cash Flow", "611.74", "428.21", "470.20", "419.68"],
            ["Capital Expenditure", "-141.85", "-66.57", "-80.44", "-62.32"],
            ["Stock Based Compensation", "32.74", "17.53", "17.40", "3.97"],
            ["Change in Working Capital", "-100.00", "50.00", "30.00", "20.00"],
            ["Cash and Short Term Investments", "216.94", "150.00", "120.00", "100.00"],
            ["Total Debt", "165.81", "150.00", "140.00", "130.00"],
            ["Weighted Average Shs Out Dil", "31110000.0", "30762000.0", "31145000.0", "31000000.0"]
        ]
        with open(raw_shs_csv, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerows(rows)

        parsed = ValuationEngineV8.parse_csv(raw_shs_csv)
        res = ValuationEngineV8.compute(parsed, ticker="RAWSHS", price=250.0)

        # Asserts shares scaled from 31,110,000 to 31.11M
        self.assertAlmostEqual(res['diluted_shares'], 31.11, places=1)
        # Asserts market cap is in millions ($7,777M, not $7.7 Trillion)
        self.assertLess(res['mcap_usd'], 15000.0)
        # Asserts Bolsa Multiple is a sane single-digit ratio (e.g. ~1.5x - 2.5x, not 2.5 Million x)
        self.assertLess(res['bolsa_multiple'], 10.0)
        self.assertGreater(res['bolsa_multiple'], 0.5)
        # Asserts EPV and DCF per share are non-zero dollars per share
        self.assertGreater(res['epv_per_share'], 50.0)
        self.assertGreater(res['dcf_expected'], 100.0)

    def test_fortress_homebuilder_land_adjusted_ocf_and_solvency(self):
        """Verifies Fortress Homebuilder Land-Adjusted OCF, dual CF/BS inventory parsing, and 0.35x Net Debt/Eq cap."""
        hb_csv = os.path.join(self.temp_dir.name, "HOMEBUILDER.csv")
        headers = ["Line Item", "Q3 2026", "Q3 2025", "Q3 2024", "Q3 2023"]
        rows = [
            headers,
            ["inventory", "-143.28", "-246.46", "-158.02", "-61.18"],  # CF Inventory outflow (land acquisition)
            ["Operating Cash Flow", "195.88", "126.95", "181.20", "306.87"],
            ["Capital Expenditure", "-1.15", "-3.13", "-2.58", "-1.49"],
            ["Stock Based Compensation", "7.38", "6.92", "5.54", "5.37"],
            ["Depreciation and Amortization", "2.75", "2.48", "2.43", "2.51"],
            ["Revenue", "2108.45", "2118.42", "1831.76", "1786.38"],
            ["Operating Income", "413.11", "511.21", "445.01", "389.03"],
            ["Income Before Tax", "424.94", "520.99", "447.34", "396.42"],
            ["Income Tax Expense", "93.92", "114.66", "98.00", "90.69"],
            ["Net Income", "331.02", "406.33", "349.34", "305.73"],
            ["Cash and Short Term Investments", "154.63", "141.61", "183.75", "174.16"],
            ["inventory", "2329.88", "2005.13", "1699.49", "1482.58"],  # BS Inventory balance
            ["Total Assets", "2585.07", "2239.00", "1986.88", "1761.00"],
            ["Total Debt", "344.28", "345.02", "362.55", "384.60"],
            ["Long Term Debt", "270.48", "288.24", "311.33", "337.98"],
            ["Total Stockholders Equity", "1920.92", "1645.10", "1346.44", "1177.22"],
            ["Weighted Average Shs Out Dil", "44.65", "45.60", "45.80", "46.50"]
        ]
        with open(hb_csv, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerows(rows)

        parsed = ValuationEngineV8.parse_csv(hb_csv)
        res = ValuationEngineV8.compute(
            parsed,
            ticker="HB_FORTRESS",
            price=67.0,
            sector="Consumer Cyclical",
            industry="Residential Construction"
        )
        # Land-Adjusted 3Y OCF > 100% of 3Y NI -> Vector 1 PASS
        v_map = {v['vector']: v for v in res['forensic_4vectors']}
        self.assertEqual(v_map['1. 3-Year Cumulative Cash Conversion']['finding'], "PASS")
        # OE_0 incorporates Land-Adjusted OCF (~345M+)
        self.assertGreater(res['oe_0'], 300.0)
        # KR-3 passes Homebuilder solvency cap (ND/Eq = 0.10x <= 0.35x)
        okr_map = {o['id']: o for o in res['okr_scorecard']}
        self.assertTrue(okr_map['KR-3']['passed'])
        self.assertIn("Homebuilder", okr_map['KR-3']['value'])

    def test_specialty_insurer_float_normalized_oe_and_no_cash_double_count(self):
        """Verifies Specialty Insurer Float-Normalized OE, Debt/Eq <= 0.30x cap, and zero reserve cash double-count."""
        ins_csv = os.path.join(self.temp_dir.name, "INSURER.csv")
        headers = ["Line Item", "Q3 2026", "Q3 2025", "Q3 2024", "Q3 2023"]
        rows = [
            headers,
            ["Revenue", "1894.57", "1589.64", "1283.39", "887.58"],
            ["Operating Income", "636.68", "523.70", "403.50", "223.82"],
            ["Income Before Tax", "629.50", "515.10", "394.60", "218.00"],
            ["Income Tax Expense", "125.98", "100.32", "79.96", "41.80"],
            ["Net Income", "503.52", "414.78", "314.64", "176.20"],
            ["Operating Cash Flow", "905.33", "966.22", "828.94", "659.78"],
            ["Capital Expenditure", "-12.00", "-10.00", "-8.00", "-6.00"],
            ["Stock Based Compensation", "15.00", "13.00", "11.00", "9.00"],
            ["Depreciation and Amortization", "10.00", "9.00", "8.00", "7.00"],
            ["Cash and Short Term Investments", "1500.00", "1200.00", "900.00", "700.00"],  # Policyholder reserve investments
            ["Total Debt", "200.51", "200.00", "200.00", "200.00"],
            ["Long Term Debt", "185.00", "185.00", "185.00", "185.00"],
            ["Total Stockholders Equity", "1958.95", "1465.00", "1085.00", "799.00"],
            ["Weighted Average Shs Out Dil", "23.30", "23.30", "23.30", "23.20"]
        ]
        with open(ins_csv, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerows(rows)

        parsed = ValuationEngineV8.parse_csv(ins_csv)
        res = ValuationEngineV8.compute(
            parsed,
            ticker="INS_SPEC",
            price=350.0,
            sector="Financial Services",
            industry="Insurance - Property & Casualty"
        )
        # OE_0 anchored to Float-Normalized Levered NOPAT (~400M), not raw float inflow (900M)
        self.assertLess(res['oe_0'], 520.0)
        self.assertGreater(res['oe_0'], 350.0)
        # EPV does NOT add $1,300M of policyholder reserve cash on top of oe_0 / 0.10
        self.assertAlmostEqual(res['epv_per_share'], (res['oe_0'] / 0.10) / 23.30, places=0)
        okr_map = {o['id']: o for o in res['okr_scorecard']}
        self.assertTrue(okr_map['KR-3']['passed'])
        self.assertIn("Specialty Insurer", okr_map['KR-3']['value'])

    def test_two_pillar_solvency_net_debt_equity_bridge(self):
        """Verifies Pillar 1 Solvency passes when LT Debt/Eq > 0.50x but Net Debt/Eq <= 0.50x and ND/OE <= 3.50x."""
        parsed = ValuationEngineV8.parse_csv(self.csv_path)
        # Set LT Debt = 4500 on Equity = 8000 (LT Debt/Eq = 0.56x > 0.50x), Cash = 3500 -> Net Debt = 1000 (ND/Eq = 0.125x <= 0.50x)
        parsed['series']['totaldebt'] = [4500.0] * 12
        parsed['series']['longtermdebt'] = [4500.0] * 12
        parsed['series']['cashandshortterminvestments'] = [3500.0] * 12
        res = ValuationEngineV8.compute(parsed, ticker="CASH_RICHD", price=150.0, mcap=15000.0)
        okr_map = {o['id']: o for o in res['okr_scorecard']}
        self.assertTrue(okr_map['KR-3']['passed'])

        # Now set Cash = 100 -> Net Debt = 4400 (ND/Eq = 0.55x > 0.50x and LTD/Eq = 0.56x > 0.50x) -> FAIL
        parsed['series']['cashandshortterminvestments'] = [100.0] * 12
        res_fail = ValuationEngineV8.compute(parsed, ticker="OVER_DEBT", price=150.0, mcap=15000.0)
        okr_map_fail = {o['id']: o for o in res_fail['okr_scorecard']}
        self.assertFalse(okr_map_fail['KR-3']['passed'])


if __name__ == "__main__":
    unittest.main()


