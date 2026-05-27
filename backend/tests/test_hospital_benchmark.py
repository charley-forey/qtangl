from __future__ import annotations

import unittest

from benchmarks.hospital_harness import run_harness


class HospitalBenchmarkHarnessTest(unittest.TestCase):
    def test_harness_generates_rows(self) -> None:
        rows = run_harness(sample_count=3)

        self.assertEqual(len(rows), 3)
        self.assertIn("scenario_id", rows[0])
        self.assertIn("feasible_hybrid_candidates", rows[0])


if __name__ == "__main__":
    unittest.main()
