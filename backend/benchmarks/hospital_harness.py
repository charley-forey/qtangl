from __future__ import annotations

import csv
import random
from pathlib import Path
import sys

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.hospital.data import load_dataset
from app.hospital.pipeline import run_hospital_solve
from app.metrics.success_metric import compute_success_metric


ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "benchmarks"
OUTPUT_PATH = OUTPUT_DIR / "hospital_results.csv"


def run_harness(sample_count: int = 50) -> list[dict[str, str]]:
    dataset = load_dataset()
    scenario_ids = [scenario.id for scenario in dataset.scenarios]
    rng = random.Random(42)
    rows: list[dict[str, str]] = []

    for index in range(sample_count):
        scenario_id = scenario_ids[index % len(scenario_ids)]
        seed = rng.randint(1000, 9999)
        bundle = run_hospital_solve(
            dataset,
            scenario_id=scenario_id,
            use_fixture=True,
            seed=seed,
        )
        hybrid_candidates = bundle.hybrid_candidates
        success = compute_success_metric(
            hybrid_distinct=bundle.scoreboard.hybrid.distinct_plans,
            classical_distinct=bundle.scoreboard.classical.distinct_plans,
            hybrid_objective=bundle.scoreboard.hybrid.objective,
            classical_objective=bundle.scoreboard.classical.objective,
        )
        rows.append(
            {
                "run_index": str(index + 1),
                "scenario_id": scenario_id,
                "seed": str(seed),
                "classical_objective": f"{bundle.scoreboard.classical.objective:.4f}",
                "hybrid_objective": f"{bundle.scoreboard.hybrid.objective:.4f}",
                "objective_gap": f"{bundle.scoreboard.hybrid.objective - bundle.scoreboard.classical.objective:.4f}",
                "classical_wall_time_seconds": f"{bundle.scoreboard.classical.solve_wall_time_seconds:.4f}",
                "hybrid_wall_time_seconds": f"{bundle.scoreboard.hybrid.solve_wall_time_seconds:.4f}",
                "repair_window_size": str(len(bundle.repair_window.nurse_ids)),
                "feasible_hybrid_candidates": str(len(hybrid_candidates)),
                "distinct_candidate_names": str(len({candidate.nurse_id for candidate in hybrid_candidates})),
                "diversity_score": f"{bundle.scoreboard.hybrid.diversity_score:.3f}",
                "success_metric": str(success["successMetric"]).lower(),
                "top_quantum_weight": f"{(hybrid_candidates[0].quantum_weight or 0):.1f}" if hybrid_candidates else "0.0",
                "fairness_delta": f"{sum(candidate.score.fairness_delta for candidate in hybrid_candidates) / max(len(hybrid_candidates), 1):.4f}",
            }
        )
    return rows


def write_csv(rows: list[dict[str, str]]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    rows = run_harness()
    write_csv(rows)
    print(f"Wrote {len(rows)} benchmark rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
