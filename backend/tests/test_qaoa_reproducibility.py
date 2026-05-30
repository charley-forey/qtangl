from __future__ import annotations

import json
import os
import unittest
from pathlib import Path

from app.models.api import OptimizeRequest
from app.parsers.scheduling import parse_schedule_request
from app.solvers.qaoa import solve_schedule_with_qaoa

BM001 = Path(__file__).resolve().parents[1] / "benchmarks" / "instances" / "BM-001-tiny-schedule.json"


def _qaoa_enabled() -> bool:
    return os.getenv("QTANGL_ENABLE_QAOA", "true").lower() in {"1", "true", "yes", "on"}


class QaoaReproducibilityTest(unittest.TestCase):
    @unittest.skipUnless(_qaoa_enabled(), "QAOA disabled in environment")
    def test_bm001_ten_runs_identical_assignment(self) -> None:
        os.environ["QTANGL_QAOA_SEED"] = "1234"
        instance = json.loads(BM001.read_text(encoding="utf-8"))
        request = OptimizeRequest.model_validate(instance["request"])
        problem = parse_schedule_request(request)

        signatures: list[str] = []
        for _ in range(10):
            result = solve_schedule_with_qaoa(problem)
            signature = "|".join(
                f"{item.task}:{item.start_day}-{item.end_day}@{item.resource or ''}"
                for item in sorted(result.assignments, key=lambda row: row.task)
            )
            signatures.append(signature)

        self.assertTrue(all(signature == signatures[0] for signature in signatures))


if __name__ == "__main__":
    unittest.main()
