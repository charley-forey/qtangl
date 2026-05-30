from __future__ import annotations

import math
from typing import Any

from app.models.canonical import CanonicalProblem
from app.models.results import SolverRunResult


def _coordinates(problem: CanonicalProblem) -> dict[str, tuple[float, float]]:
    raw = problem.raw
    coords = dict(raw.get("coordinates", {}))
    depot = raw.get("depot", {"id": "depot", "x": 0, "y": 0})
    coords.setdefault(depot.get("id", "depot"), {"x": depot.get("x", 0), "y": depot.get("y", 0)})
    for stop in raw.get("stops", []):
        stop_id = stop["id"] if isinstance(stop, dict) else stop.id
        if stop_id not in coords:
            coords[stop_id] = {"x": float(len(coords)), "y": float(len(coords))}
    parsed: dict[str, tuple[float, float]] = {}
    for key, value in coords.items():
        if isinstance(value, dict):
            parsed[key] = (float(value.get("x", 0)), float(value.get("y", 0)))
    return parsed


def _distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    return math.hypot(a[0] - b[0], a[1] - b[1])


def solve_routing_classically(problem: CanonicalProblem) -> SolverRunResult:
    raw = problem.raw
    depot_id = str(raw.get("depot", {}).get("id", "depot"))
    vehicles = list(raw.get("vehicles", []))
    stops = [stop["id"] if isinstance(stop, dict) else stop.id for stop in raw.get("stops", [])]
    if not vehicles:
        vehicles = [{"id": "vehicle-1", "capacity": max(len(stops), 1)}]

    coords = _coordinates(problem)
    depot_coord = coords.get(depot_id, (0.0, 0.0))
    routes: list[dict[str, Any]] = []
    unserved: list[str] = []
    remaining = list(stops)

    for vehicle in vehicles:
        if not remaining:
            break
        capacity = int(vehicle.get("capacity", len(stops) or 1))
        vehicle_id = str(vehicle.get("id", "vehicle"))
        current = depot_coord
        route_stops: list[str] = []
        load = 0
        while remaining and load < capacity:
            next_stop = min(remaining, key=lambda stop_id: _distance(current, coords.get(stop_id, depot_coord)))
            route_stops.append(next_stop)
            current = coords.get(next_stop, depot_coord)
            remaining.remove(next_stop)
            load += 1
        if route_stops:
            total_km = round(
                sum(
                    _distance(
                        coords.get(route_stops[index - 1], depot_coord) if index else depot_coord,
                        coords.get(stop_id, depot_coord),
                    )
                    for index, stop_id in enumerate(route_stops)
                )
                + _distance(coords.get(route_stops[-1], depot_coord), depot_coord),
                2,
            )
            routes.append(
                {
                    "vehicleId": vehicle_id,
                    "stopIds": route_stops,
                    "totalKm": total_km,
                    "returnToDepot": depot_id,
                }
            )

    unserved = remaining
    if not routes and stops:
        return SolverRunResult(
            feasible=False,
            method="classical",
            solver="greedy-vrp",
            backend="local",
            summary="No routes could be built from the supplied stops and vehicles.",
            metrics={"unservedStops": len(stops)},
            diagnostics={"unserved": stops},
        )

    summary = (
        f"Built {len(routes)} greedy route(s) serving {sum(len(route['stopIds']) for route in routes)} stop(s)."
    )
    if unserved:
        summary += f" {len(unserved)} stop(s) remain unserved."

    return SolverRunResult(
        feasible=len(unserved) == 0,
        method="classical",
        solver="greedy-vrp",
        backend="local",
        summary=summary,
        solution=routes,
        metrics={
            "routeCount": len(routes),
            "servedStops": sum(len(route["stopIds"]) for route in routes),
            "unservedStops": len(unserved),
            "totalKm": round(sum(route["totalKm"] for route in routes), 2),
        },
        visualization={
            "kind": "routing",
            "title": "Greedy vehicle routes",
            "summary": summary,
            "routes": routes,
        },
        score=round(sum(route["totalKm"] for route in routes), 2),
        diagnostics={"unserved": unserved, "depotId": depot_id},
    )
