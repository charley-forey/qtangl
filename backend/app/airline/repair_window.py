from __future__ import annotations

from collections import deque

from app.airline.models import AirlineDataset, CrewMember, RepairWindow, ScenarioDefinition
from app.airline.solver_classical import ClassicalSolveResult


def detect_repair_window(
    dataset: AirlineDataset,
    scenario: ScenarioDefinition,
    classical_result: ClassicalSolveResult,
    *,
    max_crew: int = 8,
) -> RepairWindow:
    eligible_crew_ids = {pair.crew.id for pair in classical_result.eligible_pairs}
    crew_by_id = {member.id: member for member in dataset.crew if member.id in eligible_crew_ids}
    open_leg_ids = list({pair.leg.leg_id for pair in classical_result.eligible_pairs})

    if not crew_by_id:
        return RepairWindow(
            crew_ids=[],
            base_ids=[scenario.disruption.station],
            leg_ids=open_leg_ids,
            reasons=["No eligible internal crew; reserve call-up is the feasible fallback."],
            edge_count=0,
        )

    adjacency: dict[str, set[str]] = {crew_id: set() for crew_id in crew_by_id}
    edge_count = 0
    crew_list = list(crew_by_id.values())
    for index, crew in enumerate(crew_list):
        for other in crew_list[index + 1 :]:
            if _is_linked(crew, other, scenario.disruption.station):
                adjacency[crew.id].add(other.id)
                adjacency[other.id].add(crew.id)
                edge_count += 1

    seeds = _seed_ids(scenario, classical_result, crew_by_id)
    queue = deque(seeds)
    seen = set(seeds)
    selected: list[str] = []
    reasons = [
        "Repair window seeded from the disruption station, preferred scenario crew, and the classical top picks.",
        "Neighbors added when they share a base, fleet type rating, qualification, or CBA group.",
    ]

    while queue and len(selected) < max_crew:
        crew_id = queue.popleft()
        if crew_id not in crew_by_id:
            continue
        selected.append(crew_id)
        for neighbor_id in sorted(adjacency.get(crew_id, set())):
            if neighbor_id in seen:
                continue
            seen.add(neighbor_id)
            queue.append(neighbor_id)

    base_ids = sorted({crew_by_id[crew_id].base for crew_id in selected})
    return RepairWindow(
        crew_ids=selected,
        base_ids=base_ids,
        leg_ids=open_leg_ids[:6],
        reasons=reasons,
        edge_count=edge_count,
    )


def _seed_ids(
    scenario: ScenarioDefinition,
    classical_result: ClassicalSolveResult,
    crew_by_id: dict[str, CrewMember],
) -> list[str]:
    seeds: list[str] = []
    for assignment in classical_result.selected_plan.assignments:
        if assignment.crew_id in crew_by_id and assignment.crew_id not in seeds:
            seeds.append(assignment.crew_id)

    for candidate_id in scenario.preferred_candidates:
        if candidate_id in crew_by_id and candidate_id not in seeds:
            seeds.append(candidate_id)

    for crew_id, crew in crew_by_id.items():
        if (
            crew.base == scenario.disruption.station
            or scenario.disruption.station in crew.qualified_fleets
        ) and crew_id not in seeds:
            seeds.append(crew_id)

    return seeds


def _is_linked(crew: CrewMember, other: CrewMember, station: str) -> bool:
    if crew.base == other.base:
        return True
    if set(crew.qualified_fleets) & set(other.qualified_fleets):
        return True
    if set(crew.qualifications) & set(other.qualifications):
        return True
    if crew.cba_group == other.cba_group:
        return True
    if station in {crew.base, other.base}:
        return True
    return False
