"""Benchmark EV fleet scenarios — writes benchmarks/ev_fleet_results.csv at repo root."""

from __future__ import annotations

import csv
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.ev_fleet.data import load_dataset
from app.ev_fleet.pipeline import run_ev_fleet_solve

REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT = REPO_ROOT / "benchmarks" / "ev_fleet_results.csv"


def main() -> None:
    dataset = load_dataset()
    rows = []
    for scenario in dataset.scenarios:
        bundle = run_ev_fleet_solve(dataset, scenario_id=scenario.id, use_fixture=True)
        rows.append(
            {
                "scenario": scenario.id,
                "manual_cost": bundle.scoreboard.manual.daily_cost,
                "classical_cost": bundle.scoreboard.classical.daily_cost,
                "hybrid_cost": bundle.scoreboard.hybrid.daily_cost,
                "peak_kw_manual": bundle.scoreboard.manual.peak_kw,
                "peak_kw_classical": bundle.scoreboard.classical.peak_kw,
                "peak_kw_hybrid": bundle.scoreboard.hybrid.peak_kw,
                "on_time_pct": bundle.scoreboard.hybrid.on_time_probability,
                "wall_time": bundle.details.get("totalWallTimeSeconds"),
            }
        )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
