from __future__ import annotations

from dataclasses import dataclass
from time import perf_counter
from typing import Any

from ortools.sat.python import cp_model

from app.airline.models import (
    AirlineDataset,
    CrewMember,
    LegAssignment,
    OpenLeg,
    RecoveryPlan,
    RoutingResult,
    ScenarioDefinition,
)
from app.airline.objective import (
    aggregate_plan_score,
    assignment_explanation,
    crew_average_hours,
    crew_is_eligible,
    reserve_leg_score,
    score_assignment,
)


RESERVE_CREW_ID = "reserve-callup"


@dataclass(slots=True)
class EligiblePair:
    crew: CrewMember
    leg: OpenLeg
    cost: float


@dataclass(slots=True)
class ClassicalSolveResult:
    selected_plan: RecoveryPlan
    eligible_pairs: list[EligiblePair]
    ineligible_reasons: dict[str, list[str]]
    wall_time_seconds: float
    solver_status: str
    objective_value: float
    diagnostics: dict[str, Any]


def solve_crew_classically(
    dataset: AirlineDataset,
    scenario: ScenarioDefinition,
    routing: RoutingResult,
    *,
    crew_override: list[CrewMember] | None = None,
) -> ClassicalSolveResult:
    crew_roster = crew_override or dataset.crew
    open_legs = routing.open_legs
    cost_ladder = dataset.far117.cost_ladder
    soft_weights = dataset.penalty_weights["softWeights"]
    average_hours = crew_average_hours(crew_roster)

    started = perf_counter()
    eligible_pairs: list[EligiblePair] = []
    ineligible_reasons: dict[str, list[str]] = {}

    for leg in open_legs:
        for crew in crew_roster:
            if scenario.classical_search_scope == "local" and crew.base != scenario.disruption.station:
                continue
            eligible, reasons = crew_is_eligible(crew, leg)
            if not eligible:
                ineligible_reasons[f"{crew.id}:{leg.leg_id}"] = reasons
                continue
            score = score_assignment(
                crew,
                leg,
                scenario,
                cost_ladder=cost_ladder,
                soft_weights=soft_weights,
                crew_average_hours=average_hours,
            )
            eligible_pairs.append(EligiblePair(crew=crew, leg=leg, cost=score.objective))

    reserve_cost = scenario.manual_baseline.recovery_cost * 0.88
    reserve_scores = {
        leg.leg_id: reserve_leg_score(leg, reserve_cost=reserve_cost / max(len(open_legs), 1))
        for leg in open_legs
    }

    model = cp_model.CpModel()
    decision_vars: dict[tuple[str, str], cp_model.IntVar] = {}

    for pair in eligible_pairs:
        key = (pair.crew.id, pair.leg.leg_id)
        decision_vars[key] = model.new_bool_var(f"x_{pair.crew.id}_{pair.leg.leg_id}")

    reserve_vars = {
        leg.leg_id: model.new_bool_var(f"reserve_{leg.leg_id}") for leg in open_legs
    }

    for leg in open_legs:
        leg_vars = [
            decision_vars[(crew_id, leg.leg_id)]
            for (crew_id, leg_id) in decision_vars
            if leg_id == leg.leg_id
        ]
        model.add(sum(leg_vars) + reserve_vars[leg.leg_id] == 1)

    for crew in crew_roster:
        crew_keys = [key for key in decision_vars if key[0] == crew.id]
        for index_a, key_a in enumerate(crew_keys):
            leg_a = next(leg for leg in open_legs if leg.leg_id == key_a[1])
            for key_b in crew_keys[index_a + 1 :]:
                leg_b = next(leg for leg in open_legs if leg.leg_id == key_b[1])
                from app.airline.objective import hours_of_overlap

                if hours_of_overlap(
                    leg_a.sched_dep, leg_a.sched_arr, leg_b.sched_dep, leg_b.sched_arr
                ) > 0:
                    model.add(decision_vars[key_a] + decision_vars[key_b] <= 1)

    scale = 1000
    objective_terms = []
    for pair in eligible_pairs:
        objective_terms.append(
            int(round(pair.cost * scale)) * decision_vars[(pair.crew.id, pair.leg.leg_id)]
        )
    for leg in open_legs:
        objective_terms.append(
            int(round(reserve_scores[leg.leg_id].objective * scale)) * reserve_vars[leg.leg_id]
        )
    model.minimize(sum(objective_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 3.0
    solver.parameters.num_search_workers = 8
    status = solver.solve(model)

    assignments: list[LegAssignment] = []
    leg_scores = []

    for leg in open_legs:
        assigned = False
        for pair in eligible_pairs:
            if pair.leg.leg_id != leg.leg_id:
                continue
            var = decision_vars.get((pair.crew.id, leg.leg_id))
            if var is not None and solver.boolean_value(var):
                score = score_assignment(
                    pair.crew,
                    leg,
                    scenario,
                    cost_ladder=cost_ladder,
                    soft_weights=soft_weights,
                    crew_average_hours=average_hours,
                )
                leg_scores.append(score)
                assignments.append(
                    LegAssignment(
                        leg_id=leg.leg_id,
                        crew_id=pair.crew.id,
                        crew_name=pair.crew.name,
                        role=pair.crew.role,
                        home_base=pair.crew.base,
                        source="internal",
                        explanation=assignment_explanation(pair.crew, leg, score),
                    )
                )
                assigned = True
                break
        if not assigned and solver.boolean_value(reserve_vars[leg.leg_id]):
            score = reserve_scores[leg.leg_id]
            leg_scores.append(score)
            assignments.append(
                LegAssignment(
                    leg_id=leg.leg_id,
                    crew_id=RESERVE_CREW_ID,
                    crew_name="Reserve crew",
                    role="CA",
                    home_base=scenario.disruption.station,
                    source="reserve",
                    explanation=[
                        "Reserve call-up covers the leg immediately at the highest cost tier.",
                    ],
                )
            )

    aggregate = aggregate_plan_score(leg_scores)
    plan = RecoveryPlan(
        id="classical-plan",
        label="Classical recovery plan",
        assignments=assignments,
        score=aggregate,
        source="classical",
        distinctness=0.0,
        seniority_preserved=_seniority_preserved(assignments, scenario),
        far117_compliant=True,
        summary=(
            f"CP-SAT assigned {len(assignments)} legs across the cascade "
            f"with aggregate objective {aggregate.objective:.2f}."
        ),
        explanation=[
            "Classical assignment minimized premium pay and reserve exposure while respecting FAR 117.",
        ],
        metadata={"solverStatus": solver.status_name(status)},
    )

    wall_time = round(perf_counter() - started, 4)
    return ClassicalSolveResult(
        selected_plan=plan,
        eligible_pairs=sorted(eligible_pairs, key=lambda pair: pair.cost),
        ineligible_reasons=ineligible_reasons,
        wall_time_seconds=wall_time,
        solver_status=solver.status_name(status),
        objective_value=aggregate.objective,
        diagnostics={
            "eligiblePairCount": len(eligible_pairs),
            "openLegCount": len(open_legs),
            "selectedPlanId": plan.id,
        },
    )


def _seniority_preserved(assignments: list[LegAssignment], scenario: ScenarioDefinition) -> bool:
    preferred = set(scenario.preferred_candidates)
    return any(assignment.crew_id in preferred for assignment in assignments)
