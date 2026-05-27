from __future__ import annotations

from app.hospital.models import (
    AuditPack,
    HospitalDataset,
    QpuTrace,
    ScenarioDefinition,
    SwapCandidate,
)


def build_audit_pack(
    dataset: HospitalDataset,
    scenario: ScenarioDefinition,
    candidate: SwapCandidate,
    *,
    qubo_snapshot: dict,
    qpu_trace: QpuTrace,
    solver_seed: int,
) -> AuditPack:
    return AuditPack(
        candidate_id=candidate.id,
        qubo_snapshot=qubo_snapshot,
        binding_constraints=_binding_constraints(dataset, scenario, candidate),
        cost_breakdown={
            "overtimeCost": candidate.score.overtime_cost,
            "agencyCost": candidate.score.agency_cost,
            "fatigueScore": candidate.score.fatigue_score,
            "fairnessDelta": candidate.score.fairness_delta,
            "seniorityScore": candidate.score.seniority_score,
            "crossWardPenalty": candidate.score.cross_ward_penalty,
            "manualAgencyBaseline": scenario.manual_baseline.agency_cost,
        },
        qpu_trace={
            "backend": qpu_trace.backend,
            "run": qpu_trace.run,
            "distribution": [
                {
                    "bitstring": item.bitstring,
                    "count": item.count,
                    "decodedCandidateId": item.decoded_candidate_id,
                }
                for item in qpu_trace.distribution
            ],
            "summary": qpu_trace.summary,
        },
        reproducibility={
            "scenarioId": scenario.id,
            "callOutId": scenario.callout.id,
            "seed": solver_seed,
            "candidateId": candidate.nurse_id,
            "requiredCertifications": scenario.callout.required_certifications,
        },
    )


def _binding_constraints(
    dataset: HospitalDataset,
    scenario: ScenarioDefinition,
    candidate: SwapCandidate,
) -> list[dict]:
    callout = scenario.callout
    return [
        {
            "id": "skill-cover",
            "label": "Skill coverage",
            "status": "binding",
            "detail": f"{candidate.nurse_name} satisfies {', '.join(callout.required_certifications)} for {callout.ward}.",
        },
        {
            "id": "rest-10h",
            "label": "Mandatory rest",
            "status": "binding",
            "detail": f"{candidate.nurse_name} remains above the 10-hour rest floor before the shift starts.",
        },
        {
            "id": "seniority-bump",
            "label": "Seniority bumping",
            "status": "soft",
            "detail": (
                "The candidate preserves seniority ordering."
                if candidate.seniority_preserved
                else "A junior nurse is being considered before an agency call-up."
            ),
        },
        {
            "id": "cost-ladder",
            "label": "Hospital cost ladder",
            "status": "binding",
            "detail": f"Internal swap vs agency multiplier: {dataset.cba.cost_ladder['agency']:.2f}x.",
        },
    ]
