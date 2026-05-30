from __future__ import annotations

import copy
from dataclasses import dataclass
from typing import Any

from app.models.canonical import CanonicalProblem
from app.models.results import SolverRunResult
from app.solvers.routing import _coordinates, _distance


@dataclass(slots=True)
class RoutingRepairWindow:
    vehicle_id: str
    stop_ids: list[str]
    route_index: int
    strategy: str
    summary: str


def extract_routing_repair_window(classical_result: SolverRunResult) -> RoutingRepairWindow | None:
    routes = classical_result.solution or []
    if not routes:
        return None
    longest_index = max(range(len(routes)), key=lambda index: float(routes[index].get("totalKm", 0)))
    longest = routes[longest_index]
    stop_ids = list(longest.get("stopIds", []))
    if len(stop_ids) < 2:
        return None
    return RoutingRepairWindow(
        vehicle_id=str(longest.get("vehicleId", "vehicle")),
        stop_ids=stop_ids,
        route_index=longest_index,
        strategy="longest_route_local_search",
        summary=(
            f"Local repair window targets route {longest.get('vehicleId')} "
            f"({len(stop_ids)} stops, {longest.get('totalKm', 0)} km)."
        ),
    )


def _route_distance(
    stop_ids: list[str],
    *,
    depot_coord: tuple[float, float],
    coords: dict[str, tuple[float, float]],
) -> float:
    if not stop_ids:
        return 0.0
    total = 0.0
    previous = depot_coord
    for stop_id in stop_ids:
        current = coords.get(stop_id, depot_coord)
        total += _distance(previous, current)
        previous = current
    total += _distance(previous, depot_coord)
    return round(total, 2)


def _window_alternate_orderings(stop_ids: list[str]) -> list[list[str]]:
    alternates: list[list[str]] = []
    seen: set[tuple[str, ...]] = {tuple(stop_ids)}
    for index in range(len(stop_ids) - 1):
        swapped = list(stop_ids)
        swapped[index], swapped[index + 1] = swapped[index + 1], swapped[index]
        key = tuple(swapped)
        if key not in seen:
            seen.add(key)
            alternates.append(swapped)
    if len(stop_ids) >= 3:
        reversed_window = list(reversed(stop_ids))
        key = tuple(reversed_window)
        if key not in seen:
            seen.add(key)
            alternates.append(reversed_window)
    return alternates


def apply_routing_repair_window(
    problem: CanonicalProblem,
    classical_result: SolverRunResult,
) -> SolverRunResult:
    repair_window = extract_routing_repair_window(classical_result)
    if repair_window is None:
        return classical_result

    raw = problem.raw
    depot_id = str(raw.get("depot", {}).get("id", "depot"))
    coords = _coordinates(problem)
    depot_coord = coords.get(depot_id, (0.0, 0.0))
    routes = copy.deepcopy(classical_result.solution or [])
    base_route = routes[repair_window.route_index]
    base_km = float(base_route.get("totalKm", 0))

    alternate_signatures: list[tuple[str, ...]] = [tuple(repair_window.stop_ids)]
    best_ordering = list(repair_window.stop_ids)
    best_km = base_km

    for ordering in _window_alternate_orderings(repair_window.stop_ids):
        km = _route_distance(ordering, depot_coord=depot_coord, coords=coords)
        alternate_signatures.append(tuple(ordering))
        if km < best_km:
            best_km = km
            best_ordering = ordering

    distinct_plans = len({signature for signature in alternate_signatures})
    improved = best_km < base_km
    if improved:
        routes[repair_window.route_index] = {
            **base_route,
            "stopIds": best_ordering,
            "totalKm": best_km,
        }
        total_km = round(sum(float(route.get("totalKm", 0)) for route in routes), 2)
        summary = (
            f"Hybrid routing improved the longest route from {base_km} km to {best_km} km "
            f"via local repair-window reordering."
        )
        return SolverRunResult(
            feasible=classical_result.feasible,
            method="hybrid",
            solver="greedy-vrp+local-repair",
            backend="local",
            summary=summary,
            solution=routes,
            metrics={
                **classical_result.metrics,
                "totalKm": total_km,
                "localRepairWindowStopCount": len(repair_window.stop_ids),
                "distinctFeasiblePlans": distinct_plans,
            },
            visualization={
                **classical_result.visualization,
                "title": "Hybrid vehicle routes",
                "summary": summary,
                "routes": routes,
            },
            score=total_km,
            diagnostics={
                **classical_result.diagnostics,
                "orchestration": {
                    "path": "full_job_upload",
                    "localRepairWindow": "applied",
                    "strategy": repair_window.strategy,
                    "summary": repair_window.summary,
                    "vehicleId": repair_window.vehicle_id,
                    "stopIds": repair_window.stop_ids,
                    "alternatePlansEvaluated": distinct_plans,
                },
            },
        )

    return SolverRunResult(
        feasible=classical_result.feasible,
        method=classical_result.method,
        solver=classical_result.solver,
        backend=classical_result.backend,
        summary=classical_result.summary,
        solution=classical_result.solution,
        metrics={
            **classical_result.metrics,
            "localRepairWindowStopCount": len(repair_window.stop_ids),
            "distinctFeasiblePlans": distinct_plans,
        },
        visualization=classical_result.visualization,
        score=classical_result.score,
        diagnostics={
            **classical_result.diagnostics,
            "orchestration": {
                "path": "full_job_upload",
                "localRepairWindow": "evaluated_no_improvement",
                "strategy": repair_window.strategy,
                "summary": repair_window.summary,
                "alternatePlansEvaluated": distinct_plans,
            },
        },
    )
