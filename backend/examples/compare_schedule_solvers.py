from __future__ import annotations

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.models.api import OptimizeRequest
from app.parsers.scheduling import parse_schedule_request
from app.solvers.classical import solve_schedule_classically
from app.solvers.qaoa import solve_schedule_with_qaoa


def main() -> None:
    request = OptimizeRequest(
        type="schedule",
        tasks=[
            {"id": "foundation", "duration": 2, "crew": "Crew A"},
            {"id": "framing", "duration": 2, "crew": "Crew B"},
            {"id": "inspection", "duration": 1, "crew": "Inspector"},
            {"id": "handoff", "duration": 1, "crew": "Crew A"},
            {"id": "closeout", "duration": 1, "crew": "Crew B"},
        ],
        constraints=[
            "foundation must finish before framing",
            "inspection must happen after framing",
            "handoff must happen after inspection",
            "closeout must happen after handoff",
            "Crew B unavailable on day 2",
        ],
    )
    problem = parse_schedule_request(request)

    classical_start = time.perf_counter()
    classical_result = solve_schedule_classically(problem)
    classical_elapsed = time.perf_counter() - classical_start

    qaoa_start = time.perf_counter()
    qaoa_result = solve_schedule_with_qaoa(problem)
    qaoa_elapsed = time.perf_counter() - qaoa_start

    comparison = {
        "classical": {
            "elapsedSeconds": round(classical_elapsed, 4),
            "summary": classical_result.summary,
            "metrics": classical_result.metrics,
            "score": classical_result.score,
        },
        "qaoa": {
            "elapsedSeconds": round(qaoa_elapsed, 4),
            "summary": qaoa_result.summary,
            "metrics": qaoa_result.metrics,
            "score": qaoa_result.score,
            "diagnostics": qaoa_result.diagnostics,
        },
    }
    print(json.dumps(comparison, indent=2))


if __name__ == "__main__":
    main()
