from __future__ import annotations

import unittest
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from benchmarks.airline_harness import run_harness, write_csv


class AirlineBenchmarkTest(unittest.TestCase):
    def test_harness_generates_rows(self) -> None:
        rows = run_harness(sample_count=3)
        self.assertEqual(len(rows), 3)
        write_csv(rows)
        self.assertTrue((ROOT / "benchmarks" / "airline_results.csv").exists())


if __name__ == "__main__":
    unittest.main()
