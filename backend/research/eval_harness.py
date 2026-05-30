"""Research evaluation harness — compare solvers on the same benchmark instance."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from time import perf_counter

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

INSTANCES_DIR = BACKEND_ROOT / "benchmarks" / "instances"
RESULTS_DIR = BACKEND_ROOT / "benchmarks" / "results" / "research"


def load_instance(instance_id: str) -> dict:
    matches = sorted(INSTANCES_DIR.glob(f"{instance_id.upper()}*.json"))
    if not matches:
        raise FileNotFoundError(f"No instance for {instance_id}")
    return json.loads(matches[0].read_text(encoding="utf-8"))


def run_cp_sat(instance: dict) -> dict:
    from app.models.api import OptimizeRequest
    from app.parsers.scheduling import parse_schedule_request
    from app.solvers.classical import solve_schedule_classically

    request = OptimizeRequest.model_validate(instance["request"])
    problem = parse_schedule_request(request)
    started = perf_counter()
    result = solve_schedule_classically(problem)
    elapsed = perf_counter() - started
    return {
        "solver": "cp-sat",
        "feasible": result.feasible,
        "objective": result.score,
        "wallTimeSeconds": round(elapsed, 4),
        "distinctAlternates": 1,
    }


def run_qaoa_aer(instance: dict) -> dict:
    from app.models.api import OptimizeRequest
    from app.parsers.scheduling import parse_schedule_request
    from app.solvers.qaoa import solve_schedule_with_qaoa

    request = OptimizeRequest.model_validate(instance["request"])
    problem = parse_schedule_request(request)
    started = perf_counter()
    try:
        result = solve_schedule_with_qaoa(problem)
        error = None
    except Exception as exc:  # noqa: BLE001
        return {
            "solver": "qaoa-aer",
            "feasible": False,
            "error": str(exc),
            "wallTimeSeconds": round(perf_counter() - started, 4),
            "distinctAlternates": 0,
        }
    elapsed = perf_counter() - started
    return {
        "solver": "qaoa-aer",
        "feasible": result.feasible,
        "objective": result.score,
        "wallTimeSeconds": round(elapsed, 4),
        "distinctAlternates": int(result.metrics.get("distinctFeasiblePlans", 1)),
        "error": error,
    }


SOLVERS = {
    "cp-sat": run_cp_sat,
    "qaoa-aer": run_qaoa_aer,
}


def evaluate(instance_id: str, solvers: list[str]) -> dict:
    instance = load_instance(instance_id)
    classical = run_cp_sat(instance)
    runs = [classical]
    for solver in solvers:
        if solver == "cp-sat":
            continue
        runner = SOLVERS.get(solver)
        if runner is None:
            raise ValueError(f"Unknown solver: {solver}")
        payload = runner(instance)
        payload["classicalObjective"] = classical.get("objective")
        runs.append(payload)
    return {
        "instance": instance_id.upper(),
        "benchmarkId": instance.get("benchmarkId"),
        "runs": runs,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Qtangl solver research eval harness")
    parser.add_argument("--instance", required=True, help="e.g. BM-001")
    parser.add_argument(
        "--solver",
        default="all",
        help="cp-sat | qaoa-aer | all",
    )
    parser.add_argument("--write", action="store_true", help="Write JSON to results/research/")
    args = parser.parse_args()

    if args.solver == "all":
        solvers = list(SOLVERS.keys())
    else:
        solvers = [item.strip() for item in args.solver.split(",") if item.strip()]

    report = evaluate(args.instance, solvers)
    if args.write:
        RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        out_path = RESULTS_DIR / f"{args.instance.upper()}-eval.json"
        out_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {out_path}", file=sys.stderr)

    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
