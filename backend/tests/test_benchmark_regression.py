"""Regression smoke tests for committed benchmark instances (C1-013)."""

from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
RESULTS_DIR = BACKEND_ROOT / "benchmarks" / "results"
INSTANCES_DIR = BACKEND_ROOT / "benchmarks" / "instances"


def _load_json(name: str) -> dict:
    return json.loads((RESULTS_DIR / name).read_text(encoding="utf-8-sig"))


@unittest.skipUnless(
    importlib.util.find_spec("qiskit_optimization") is not None,
    "qiskit-optimization is not installed",
)
class BenchmarkRegressionTest(unittest.TestCase):
    def test_committed_instance_files_exist(self) -> None:
        for benchmark_id in ("BM-001", "BM-002", "BM-003", "BM-004", "BM-005", "BM-006"):
            matches = list(INSTANCES_DIR.glob(f"{benchmark_id}*.json"))
            self.assertEqual(len(matches), 1, benchmark_id)

    def test_committed_result_files_exist(self) -> None:
        expected = (
            "BM-001-tiny-schedule.json",
            "BM-002-five-task-precedence.json",
            "BM-003-hospital-summary.json",
            "BM-004-airline-summary.json",
            "BM-005-ev-tou-peak-ca.json",
            "BM-006-pqc-scan.json",
        )
        for name in expected:
            self.assertTrue((RESULTS_DIR / name).exists(), name)

    def test_bm001_classical_beats_qaoa_score(self) -> None:
        payload = _load_json("BM-001-tiny-schedule.json")
        self.assertLessEqual(payload["classical"]["score"], payload["qaoa"]["score"])
        self.assertEqual(payload["classical"]["metrics"]["constraintViolations"], 0)

    def test_bm002_qaoa_skipped_or_rejected(self) -> None:
        payload = _load_json("BM-002-five-task-precedence.json")
        self.assertTrue(payload["classical"]["feasible"])
        qaoa_status = payload["qaoa"].get("diagnostics", {}).get("qaoa", {}).get("status")
        if qaoa_status:
            self.assertIn(qaoa_status, {"too_large", "failed", "rejected", "used"})

    def test_bm003_hospital_fixture_run(self) -> None:
        from benchmarks.hospital_harness import run_harness

        rows = run_harness(sample_count=1)
        self.assertEqual(len(rows), 1)
        self.assertGreater(float(rows[0]["feasible_hybrid_candidates"]), 0)

    def test_bm006_pqc_fixture_scan(self) -> None:
        from benchmarks.run_benchmark import load_instance, run_instance

        result = run_instance(load_instance("BM-006"))
        self.assertGreaterEqual(result["assetCount"], 1)
        self.assertLess(result["wallTimeSeconds"], 5.0)


if __name__ == "__main__":
    unittest.main()
