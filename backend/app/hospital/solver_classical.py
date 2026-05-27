from __future__ import annotations

from dataclasses import dataclass
from time import perf_counter
from typing import Any

from ortools.sat.python import cp_model

from app.hospital.models import HospitalDataset, Nurse, ScenarioDefinition, SwapCandidate
from app.hospital.objective import (
    agency_candidate_score,
    candidate_explanation,
    nurse_is_eligible,
    roster_average_hours,
    score_candidate,
)


@dataclass(slots=True)
class ClassicalSolveResult:
    selected_candidate: SwapCandidate
    eligible_candidates: list[SwapCandidate]
    ineligible_reasons: dict[str, list[str]]
    wall_time_seconds: float
    solver_status: str
    objective_value: float
    diagnostics: dict[str, Any]


def solve_callout_classically(
    dataset: HospitalDataset,
    scenario: ScenarioDefinition,
    *,
    roster_override: list[Nurse] | None = None,
) -> ClassicalSolveResult:
    roster = roster_override or dataset.roster
    callout = scenario.callout
    average_hours = roster_average_hours(roster)
    soft_weights = dataset.penalty_weights["softWeights"]
    cost_ladder = dataset.cba.cost_ladder

    start_time = perf_counter()
    eligible_candidates: list[SwapCandidate] = []
    ineligible_reasons: dict[str, list[str]] = {}

    for nurse in roster:
        if nurse.id == callout.nurse_id:
            continue
        if scenario.classical_search_scope == "local" and nurse.home_ward != callout.ward:
            continue
        eligible, reasons = nurse_is_eligible(nurse, callout)
        if not eligible:
            ineligible_reasons[nurse.id] = reasons
            continue

        score = score_candidate(
            nurse,
            callout,
            scenario,
            cost_ladder=cost_ladder,
            soft_weights=soft_weights,
            roster_average_hours=average_hours,
        )
        eligible_candidates.append(
            SwapCandidate(
                id=f"classical-{nurse.id}",
                label=nurse.name,
                nurse_id=nurse.id,
                nurse_name=nurse.name,
                home_ward=nurse.home_ward,
                target_ward=callout.ward,
                shift_id=callout.shift_id,
                start=callout.start,
                end=callout.end,
                score=score,
                source="classical",
                explanation=candidate_explanation(nurse, callout, score),
                summary=(
                    f"{nurse.name} covers {callout.ward} from the {nurse.home_ward} board "
                    "without breaking the 10-hour rest rule."
                    if scenario.classical_search_scope == "local"
                    else f"{nurse.name} covers {callout.ward} without breaking the 10-hour rest rule."
                ),
                distinctness=0.0,
                seniority_preserved=_seniority_preserved(nurse, scenario),
                requires_backfill=nurse.home_ward != callout.ward,
                metadata={"requiredCertifications": callout.required_certifications},
            )
        )

    agency_score = agency_candidate_score(
        callout, agency_cost=scenario.manual_baseline.agency_cost * 0.92
    )
    agency_candidate = SwapCandidate(
        id="classical-agency",
        label="Agency fallback",
        nurse_id="agency-backfill",
        nurse_name="Traveler RN",
        home_ward="Agency",
        target_ward=callout.ward,
        shift_id=callout.shift_id,
        start=callout.start,
        end=callout.end,
        score=agency_score,
        source="agency",
        explanation=[
            "Agency backfill preserves coverage but is the highest-cost option in the ladder.",
            "This option is kept as a feasible fallback when no internal swap is safer.",
        ],
        summary="Agency backfill covers the shift immediately but at the highest unit cost.",
        distinctness=0.0,
        seniority_preserved=True,
        requires_backfill=False,
        metadata={"requiredCertifications": callout.required_certifications},
    )

    model = cp_model.CpModel()
    decision_vars = {
        candidate.id: model.new_bool_var(candidate.id)
        for candidate in [*eligible_candidates, agency_candidate]
    }
    model.add(sum(decision_vars.values()) == 1)
    scale = 1000
    model.minimize(
        sum(
            int(round(candidate.score.objective * scale)) * decision_vars[candidate.id]
            for candidate in [*eligible_candidates, agency_candidate]
        )
    )

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 2.0
    solver.parameters.num_search_workers = 8
    status = solver.solve(model)

    selected = agency_candidate
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for candidate in eligible_candidates:
            if solver.boolean_value(decision_vars[candidate.id]):
                selected = candidate
                break
        else:
            if solver.boolean_value(decision_vars[agency_candidate.id]):
                selected = agency_candidate

    wall_time_seconds = round(perf_counter() - start_time, 4)
    objective_value = round(selected.score.objective, 4)

    ranked_candidates = sorted(
        eligible_candidates,
        key=lambda candidate: (candidate.score.objective, candidate.score.fatigue_score),
    )

    return ClassicalSolveResult(
        selected_candidate=selected,
        eligible_candidates=ranked_candidates,
        ineligible_reasons=ineligible_reasons,
        wall_time_seconds=wall_time_seconds,
        solver_status=solver.status_name(status),
        objective_value=objective_value,
        diagnostics={
            "eligibleCandidateCount": len(eligible_candidates),
            "ineligibleCandidateCount": len(ineligible_reasons),
            "selectedCandidateId": selected.nurse_id,
            "selectedCandidateLabel": selected.nurse_name,
        },
    )


def _seniority_preserved(nurse: Nurse, scenario: ScenarioDefinition) -> bool:
    preferred = set(scenario.preferred_candidates)
    return nurse.id in preferred or nurse.home_ward == scenario.callout.ward
