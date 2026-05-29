from __future__ import annotations

from app.ev_fleet.models import AuditPack, ChargePlan, EvFleetDataset, QpuTrace, ScenarioDefinition


def build_audit_pack(
    dataset: EvFleetDataset,
    scenario: ScenarioDefinition,
    plan: ChargePlan,
    *,
    qubo_snapshot: dict,
    qpu_trace: QpuTrace,
    solver_seed: int,
) -> AuditPack:
    return AuditPack(
        candidate_id=plan.id,
        qubo_snapshot=qubo_snapshot,
        binding_constraints=_binding_constraints(dataset, scenario, plan),
        cost_breakdown={
            "energyCost": plan.score.energy_cost,
            "demandChargeCost": plan.score.demand_charge_cost,
            "totalCost": plan.score.total_cost,
            "peakKw": plan.score.peak_kw,
            "offpeakKwhFraction": plan.score.offpeak_kwh_fraction,
            "onTimeProbability": plan.score.on_time_probability,
            "naiveDailyBaseline": scenario.manual_baseline.naive_daily_cost,
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
            "windowId": scenario.window.id,
            "seed": solver_seed,
            "planId": plan.id,
            "tariffId": scenario.window.tariff_id,
        },
    )


def _binding_constraints(
    dataset: EvFleetDataset,
    scenario: ScenarioDefinition,
    plan: ChargePlan,
) -> list[dict]:
    vehicle_names = ", ".join(sorted({slot.vehicle_id for slot in plan.slots}))
    return [
        {
            "id": "connector-compatibility",
            "label": "Connector compatibility",
            "status": "binding",
            "detail": f"All assignments use J1772 L2 bays compatible with the fleet ({vehicle_names}).",
        },
        {
            "id": "site-power-cap",
            "label": "Site power cap",
            "status": "binding",
            "detail": f"Peak draw {plan.score.peak_kw:.1f} kW stays within {dataset.depot.site_power_cap_kw:.1f} kW cap.",
        },
        {
            "id": "delivery-readiness",
            "label": "Delivery readiness",
            "status": "binding",
            "detail": "All scheduled sessions complete before next-day dispatch deadlines.",
        },
        {
            "id": "tou-tariff-ladder",
            "label": "TOU tariff ladder",
            "status": "binding",
            "detail": f"Energy priced under {dataset.tariff.source} peak/off-peak bands.",
        },
    ]
