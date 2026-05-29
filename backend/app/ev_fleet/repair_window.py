from __future__ import annotations

from collections import deque

from app.ev_fleet.models import EvFleetDataset, RepairWindow, ScenarioDefinition, Vehicle
from app.ev_fleet.solver_classical import ClassicalSolveResult


def detect_repair_window(
    dataset: EvFleetDataset,
    scenario: ScenarioDefinition,
    classical_result: ClassicalSolveResult,
    *,
    max_vehicles: int = 8,
) -> RepairWindow:
    eligible_vehicle_ids = {triple.vehicle.id for triple in classical_result.eligible_triples}
    vehicles_by_id = {
        vehicle.id: vehicle
        for vehicle in dataset.vehicles
        if vehicle.id in eligible_vehicle_ids
    }
    peak_slots = sorted(
        {triple.slot_id for triple in classical_result.eligible_triples},
        key=lambda slot_id: slot_id,
    )[:6]

    if not vehicles_by_id:
        return RepairWindow(
            vehicle_ids=[],
            charger_ids=[charger.id for charger in dataset.chargers[:6]],
            peak_slot_ids=peak_slots,
            reasons=["No eligible vehicles in the charging window."],
            edge_count=0,
        )

    adjacency: dict[str, set[str]] = {vehicle_id: set() for vehicle_id in vehicles_by_id}
    edge_count = 0
    vehicle_list = list(vehicles_by_id.values())
    for index, vehicle in enumerate(vehicle_list):
        for other in vehicle_list[index + 1 :]:
            if _is_linked(vehicle, other):
                adjacency[vehicle.id].add(other.id)
                adjacency[other.id].add(vehicle.id)
                edge_count += 1

    seeds = _seed_ids(scenario, classical_result, vehicles_by_id)
    queue = deque(seeds)
    seen = set(seeds)
    selected: list[str] = []
    reasons = [
        "Repair window seeded from preferred scenario vans and the classical top picks.",
        "Neighbors added when they share depot, connector type, or similar SOC band.",
    ]

    while queue and len(selected) < max_vehicles:
        vehicle_id = queue.popleft()
        if vehicle_id not in vehicles_by_id:
            continue
        selected.append(vehicle_id)
        for neighbor_id in sorted(adjacency.get(vehicle_id, set())):
            if neighbor_id in seen:
                continue
            seen.add(neighbor_id)
            queue.append(neighbor_id)

    charger_ids = sorted(
        {triple.charger.id for triple in classical_result.eligible_triples if triple.vehicle.id in selected}
    )[:8]

    return RepairWindow(
        vehicle_ids=selected,
        charger_ids=charger_ids,
        peak_slot_ids=peak_slots,
        reasons=reasons,
        edge_count=edge_count,
    )


def _seed_ids(
    scenario: ScenarioDefinition,
    classical_result: ClassicalSolveResult,
    vehicles_by_id: dict[str, Vehicle],
) -> list[str]:
    seeds: list[str] = []
    for slot in classical_result.selected_plan.slots:
        if slot.vehicle_id in vehicles_by_id and slot.vehicle_id not in seeds:
            seeds.append(slot.vehicle_id)

    for candidate_id in scenario.preferred_candidates:
        if candidate_id in vehicles_by_id and candidate_id not in seeds:
            seeds.append(candidate_id)

    for vehicle_id in vehicles_by_id:
        if vehicle_id not in seeds:
            seeds.append(vehicle_id)
    return seeds


def _is_linked(vehicle: Vehicle, other: Vehicle) -> bool:
    if vehicle.depot == other.depot:
        return True
    if vehicle.connector_type == other.connector_type:
        return True
    if abs(vehicle.start_soc_kwh - other.start_soc_kwh) <= 6:
        return True
    return False
