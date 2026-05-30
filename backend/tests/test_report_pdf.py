from __future__ import annotations

import unittest
from unittest.mock import patch

from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.report import report_to_pdf
from app.pqc.risk import readiness_assessment
from app.pqc.scanner import _build_live_endpoints, scan_fixture, scan_live


class PqcReportPdfTest(unittest.TestCase):
    def test_pdf_starts_with_pdf_header(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        pdf_bytes = report_to_pdf(bundle.report)
        self.assertGreater(len(pdf_bytes), 500)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"), msg="Expected binary PDF output")

    def test_pdf_with_zero_assets_still_generates(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        bundle.report.assets = []
        pdf_bytes = report_to_pdf(bundle.report)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))


class PqcReportTargetTest(unittest.TestCase):
    def test_report_target_matches_live_override(self) -> None:
        dataset = load_dataset()
        with (
            patch("app.pqc.pipeline.live_scan_enabled", return_value=True),
            patch("app.pqc.pipeline.scan_live") as mock_live,
        ):
            mock_live.return_value = ([], [], [])
            bundle = run_pqc_scan(
                dataset,
                scenario_id="bank-tls-inventory",
                use_fixture=False,
                target_override="test.openquantumsafe.org",
            )
        self.assertEqual(bundle.report.target_domain, "test.openquantumsafe.org")
        self.assertEqual(bundle.details.get("effectiveTarget"), "test.openquantumsafe.org")


class PqcScannerCoverageTest(unittest.TestCase):
    def test_fixture_scan_returns_empty_coverage(self) -> None:
        dataset = load_dataset()
        scenario = next(s for s in dataset.scenarios if s.id == "bank-tls-inventory")
        assets, timeline, coverage = scan_fixture(dataset, scenario)
        self.assertGreaterEqual(len(assets), 5)
        self.assertEqual(coverage, [])

    def test_live_endpoint_builder_uses_443_only_for_override(self) -> None:
        scenario = next(s for s in load_dataset().scenarios if s.id == "bank-tls-inventory")
        endpoints = _build_live_endpoints(
            "test.openquantumsafe.org",
            [443],
            [],
            None,
        )
        kinds_ports = {(kind, port) for _, port, kind in endpoints}
        self.assertIn(("tls", 443), kinds_ports)
        self.assertNotIn(("email", 25), kinds_ports)
        self.assertNotIn(("email", 993), kinds_ports)
        self.assertNotIn(("ssh", 22), kinds_ports)

    def test_unreachable_tls_goes_to_coverage_not_assets(self) -> None:
        scenario = next(s for s in load_dataset().scenarios if s.id == "bank-tls-inventory")
        with (
            patch("app.pqc.scanner.scan_tls_endpoint") as mock_tls,
            patch("app.pqc.scanner.discover_ct_subdomains", return_value=[]),
            patch("app.pqc.scanner.scan_jwks", return_value=(None, None)),
        ):
            mock_tls.return_value = (
                None,
                {
                    "host": "test.example",
                    "port": 8443,
                    "kind": "tls",
                    "status": "unreachable",
                    "detail": "connection refused",
                },
            )
            assets, _timeline, coverage = scan_live(
                scenario,
                target_override="test.example",
            )
        self.assertEqual(len(assets), 0)
        self.assertEqual(len(coverage), 1)
        self.assertEqual(coverage[0]["status"], "unreachable")


class PqcReadinessTest(unittest.TestCase):
    def test_readiness_excludes_error_kind_and_has_band(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        assessment = readiness_assessment(bundle.assets)
        self.assertIn("band", assessment)
        self.assertGreater(assessment["classifiedCount"], 0)
        self.assertIn(bundle.report.readiness_band, assessment["band"])


if __name__ == "__main__":
    unittest.main()
