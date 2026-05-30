"""Run a committed benchmark instance and optionally write JSON results."""

from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import date
from pathlib import Path
from time import perf_counter

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

INSTANCES_DIR = Path(__file__).resolve().parent / "instances"
RESULTS_DIR = Path(__file__).resolve().parent / "results"


def load_instance(benchmark_id: str) -> dict:
    matches = sorted(INSTANCES_DIR.glob(f"{benchmark_id}*.json"))
    if not matches:
        raise FileNotFoundError(f"No instance file for {benchmark_id} in {INSTANCES_DIR}")
    return json.loads(matches[0].read_text(encoding="utf-8"))


def run_schedule(instance: dict) -> dict:
    from app.models.api import OptimizeRequest
    from app.parsers.scheduling import parse_schedule_request
    from app.solvers.classical import solve_schedule_classically
    from app.solvers.qaoa import solve_schedule_with_qaoa

    request = OptimizeRequest.model_validate(instance["request"])
    problem = parse_schedule_request(request)

    classical_start = perf_counter()
    classical_result = solve_schedule_classically(problem)
    classical_elapsed = perf_counter() - classical_start

    qaoa_start = perf_counter()
    try:
        qaoa_result = solve_schedule_with_qaoa(problem)
        qaoa_error = None
    except Exception as exc:  # noqa: BLE001 — benchmark captures failure mode
        qaoa_result = None
        qaoa_error = f"{type(exc).__name__}: {exc}"
    qaoa_elapsed = perf_counter() - qaoa_start

    payload: dict = {
        "benchmarkId": instance["benchmarkId"],
        "name": instance["name"],
        "capturedAt": date.today().isoformat(),
        "classical": {
            "elapsedSeconds": round(classical_elapsed, 4),
            "summary": classical_result.summary,
            "metrics": classical_result.metrics,
            "score": classical_result.score,
            "feasible": classical_result.feasible,
        },
    }
    if qaoa_result is not None:
        payload["qaoa"] = {
            "elapsedSeconds": round(qaoa_elapsed, 4),
            "summary": qaoa_result.summary,
            "metrics": qaoa_result.metrics,
            "score": qaoa_result.score,
            "feasible": qaoa_result.feasible,
            "diagnostics": qaoa_result.diagnostics,
        }
    else:
        payload["qaoa"] = {
            "elapsedSeconds": round(qaoa_elapsed, 4),
            "feasible": False,
            "error": qaoa_error,
        }
    return payload


def run_hospital(instance: dict) -> dict:
    from benchmarks.hospital_harness import run_harness

    sample_count = int(instance.get("sampleCount", 10))
    rows = run_harness(sample_count=sample_count)
    scenario_ids = sorted({row["scenario_id"] for row in rows})
    success_runs = sum(1 for row in rows if row.get("success_metric") == "true")
    return {
        "benchmarkId": instance["benchmarkId"],
        "scenarioId": instance.get("scenarioId"),
        "sampleCount": sample_count,
        "scenarioIds": scenario_ids,
        "capturedAt": date.today().isoformat(),
        "aggregates": {
            "avgObjectiveGap": round(
                sum(float(row["objective_gap"]) for row in rows) / len(rows), 4
            ),
            "avgHybridCandidates": round(
                sum(float(row["feasible_hybrid_candidates"]) for row in rows) / len(rows), 1
            ),
            "avgClassicalWallSeconds": round(
                sum(float(row["classical_wall_time_seconds"]) for row in rows) / len(rows), 4
            ),
            "avgDiversityScore": round(
                sum(float(row["diversity_score"]) for row in rows) / len(rows), 3
            ),
            "successMetricRate": round(success_runs / len(rows), 2),
        },
        "sampleRows": rows[:3],
    }


def run_airline(instance: dict) -> dict:
    from benchmarks.airline_harness import run_harness

    sample_count = int(instance.get("sampleCount", 10))
    rows = run_harness(sample_count=sample_count)
    target_rows = [row for row in rows if row["scenario_id"] == instance["scenarioId"]]
    if not target_rows:
        target_rows = rows
    distinct_plans = [
        float(row["feasible_hybrid_plans"]) for row in target_rows
    ]
    return {
        "benchmarkId": instance["benchmarkId"],
        "scenarioId": instance["scenarioId"],
        "sampleCount": len(target_rows),
        "capturedAt": date.today().isoformat(),
        "aggregates": {
            "avgObjectiveGap": round(
                sum(float(row["objective_gap"]) for row in target_rows) / len(target_rows), 4
            ),
            "avgHybridPlans": round(sum(distinct_plans) / len(distinct_plans), 1),
            "avgClassicalWallSeconds": round(
                sum(float(row["classical_wall_time_seconds"]) for row in target_rows)
                / len(target_rows),
                4,
            ),
            "avgClassicalObjective": round(
                sum(float(row["classical_objective"]) for row in target_rows) / len(target_rows),
                4,
            ),
        },
        "sampleRows": target_rows[:3],
    }


def run_ev_fleet(instance: dict) -> dict:
    from app.ev_fleet.data import load_dataset
    from app.ev_fleet.pipeline import run_ev_fleet_solve

    dataset = load_dataset()
    started = perf_counter()
    bundle = run_ev_fleet_solve(
        dataset,
        scenario_id=instance["scenarioId"],
        use_fixture=bool(instance.get("useFixture", True)),
    )
    elapsed = perf_counter() - started
    return {
        "benchmarkId": instance["benchmarkId"],
        "scenarioId": instance["scenarioId"],
        "useFixture": bool(instance.get("useFixture", True)),
        "capturedAt": date.today().isoformat(),
        "wallTimeSeconds": round(elapsed, 4),
        "manualDailyCost": bundle.scoreboard.manual.daily_cost,
        "classicalDailyCost": bundle.scoreboard.classical.daily_cost,
        "hybridDailyCost": bundle.scoreboard.hybrid.daily_cost,
        "peakKwManual": bundle.scoreboard.manual.peak_kw,
        "peakKwClassical": bundle.scoreboard.classical.peak_kw,
        "peakKwHybrid": bundle.scoreboard.hybrid.peak_kw,
        "onTimeProbability": bundle.scoreboard.hybrid.on_time_probability,
    }


def run_pqc(instance: dict) -> dict:
    from app.pqc.data import load_dataset
    from app.pqc.pipeline import run_pqc_scan

    dataset = load_dataset()
    started = perf_counter()
    bundle = run_pqc_scan(
        dataset,
        scenario_id=instance["scenarioId"],
        use_fixture=bool(instance.get("useFixture", True)),
    )
    elapsed = perf_counter() - started
    return {
        "benchmarkId": instance["benchmarkId"],
        "scenarioId": instance["scenarioId"],
        "useFixture": bool(instance.get("useFixture", True)),
        "scanId": bundle.scan_id,
        "assetCount": len(bundle.assets),
        "remediationBacklogCount": len(bundle.remediation_backlog),
        "wallTimeSeconds": round(elapsed, 4),
        "capturedAt": date.today().isoformat(),
    }


RUNNERS = {
    "schedule": run_schedule,
    "hospital": run_hospital,
    "airline": run_airline,
    "ev_fleet": run_ev_fleet,
    "pqc": run_pqc,
}


def result_filename(instance: dict) -> str:
    mapping = {
        "BM-001": "BM-001-tiny-schedule.json",
        "BM-002": "BM-002-five-task-precedence.json",
        "BM-003": "BM-003-hospital-summary.json",
        "BM-004": "BM-004-airline-summary.json",
        "BM-005": "BM-005-ev-tou-peak-ca.json",
        "BM-006": "BM-006-pqc-scan.json",
    }
    return mapping[instance["benchmarkId"]]


def run_instance(instance: dict) -> dict:
    runner = RUNNERS.get(instance["type"])
    if runner is None:
        raise ValueError(f"Unknown benchmark type: {instance['type']}")
    return runner(instance)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Qtangl benchmark instances")
    parser.add_argument("benchmark_id", help="e.g. BM-001 or BM-003")
    parser.add_argument(
        "--write",
        action="store_true",
        help="Write JSON to backend/benchmarks/results/",
    )
    args = parser.parse_args()

    instance = load_instance(args.benchmark_id.upper())
    result = run_instance(instance)

    if args.write:
        RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        out_path = RESULTS_DIR / result_filename(instance)
        out_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {out_path}", file=sys.stderr)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
