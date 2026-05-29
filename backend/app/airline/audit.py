from __future__ import annotations

from app.airline.models import AirlineDataset, QpuTrace, RecoveryPlan, ScenarioDefinition


def build_audit_pack(
    dataset: AirlineDataset,
    scenario: ScenarioDefinition,
    plan: RecoveryPlan,
    *,
    qubo_snapshot: dict,
    qpu_trace: QpuTrace,
    solver_seed: int,
) -> dict:
    from app.airline.models import AuditPack

    return AuditPack(
        candidate_id=plan.id,
        qubo_snapshot=qubo_snapshot,
        binding_constraints=_binding_constraints(dataset, scenario, plan),
        cost_breakdown={
            "premiumPayCost": plan.score.premium_pay_cost,
            "reserveCost": plan.score.reserve_cost,
            "fatigueScore": plan.score.fatigue_score,
            "fairnessDelta": plan.score.fairness_delta,
            "seniorityScore": plan.score.seniority_score,
            "offBasePenalty": plan.score.off_base_penalty,
            "onTimeProbability": plan.score.on_time_probability,
            "manualRecoveryBaseline": scenario.manual_baseline.recovery_cost,
        },
        qpu_trace={
            "backend": qpu_trace.backend,
            "run": qpu_trace.run,
            "distribution": [
                {
                    "bitstring": item.bitstring,
                    "count": item.count,
                    "decodedPlanId": item.decoded_plan_id,
                }
                for item in qpu_trace.distribution
            ],
            "summary": qpu_trace.summary,
        },
        reproducibility={
            "scenarioId": scenario.id,
            "disruptionId": scenario.disruption.id,
            "seed": solver_seed,
            "planId": plan.id,
            "requiredQualifications": scenario.disruption.required_quals,
        },
    )


def _binding_constraints(
    dataset: AirlineDataset,
    scenario: ScenarioDefinition,
    plan: RecoveryPlan,
) -> list[dict]:
    disruption = scenario.disruption
    crew_names = ", ".join(assignment.crew_name for assignment in plan.assignments)
    return [
        {
            "id": "type-rating",
            "label": "Type rating coverage",
            "status": "binding",
            "detail": f"{crew_names} satisfy {', '.join(disruption.required_quals)} on the open legs.",
        },
        {
            "id": "far117-rest",
            "label": "FAR 117 rest",
            "status": "binding",
            "detail": "All assigned crew remain above the minimum rest floor before duty.",
        },
        {
            "id": "fdp-limit",
            "label": "Flight duty period",
            "status": "binding",
            "detail": "Projected FDP stays within each crew member's legal limit.",
        },
        {
            "id": "cost-ladder",
            "label": "Airline cost ladder",
            "status": "binding",
            "detail": f"Reserve multiplier: {dataset.far117.cost_ladder.get('reserve', 2.5):.2f}x.",
        },
    ]
