from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timedelta
from statistics import mean

from app.airline.models import (
    CandidateScore,
    CrewMember,
    DisruptionEvent,
    OpenLeg,
    ScenarioDefinition,
)

TIME_FORMAT = "%Y-%m-%dT%H:%M:%S"
MIN_REST_HOURS = 10.0


def parse_dt(value: str) -> datetime:
    return datetime.fromisoformat(value)


def block_hours(leg: OpenLeg) -> float:
    return (parse_dt(leg.sched_arr) - parse_dt(leg.sched_dep)).total_seconds() / 3600


def hours_between(end_value: str, start_value: str) -> float:
    return (parse_dt(start_value) - parse_dt(end_value)).total_seconds() / 3600


def hours_of_overlap(start_a: str, end_a: str, start_b: str, end_b: str) -> float:
    start = max(parse_dt(start_a), parse_dt(start_b))
    end = min(parse_dt(end_a), parse_dt(end_b))
    overlap = (end - start).total_seconds() / 3600
    return max(0.0, overlap)


def effective_last_duty_end(crew: CrewMember, leg: OpenLeg) -> str:
    leg_start = parse_dt(leg.sched_dep)
    prior_ends = [
        parse_dt(assignment.sched_arr)
        for assignment in crew.assignments
        if parse_dt(assignment.sched_arr) <= leg_start
    ]
    if prior_ends:
        return max(prior_ends).strftime(TIME_FORMAT)

    recorded_end = parse_dt(crew.last_duty_end)
    if recorded_end <= leg_start:
        return crew.last_duty_end

    return (leg_start - timedelta(hours=12)).strftime(TIME_FORMAT)


def projected_fdp_hours(crew: CrewMember, leg: OpenLeg) -> float:
    duty_start = min(parse_dt(crew.duty_start), parse_dt(leg.sched_dep))
    return (parse_dt(leg.sched_arr) - duty_start).total_seconds() / 3600


def crew_is_eligible(
    crew: CrewMember,
    leg: OpenLeg,
    *,
    fleet_type: str | None = None,
) -> tuple[bool, list[str]]:
    reasons: list[str] = []
    required = set(leg.required_quals)
    if fleet_type and fleet_type not in crew.qualified_fleets:
        reasons.append("missing fleet type rating")
    if not required.issubset(set(crew.qualifications)):
        reasons.append("missing required qualification")
    if hours_between(effective_last_duty_end(crew, leg), leg.sched_dep) < MIN_REST_HOURS:
        reasons.append("rest window below FAR 117 minimum")
    if projected_fdp_hours(crew, leg) > crew.max_fdp_hours:
        reasons.append("projected FDP exceeds limit")
    for assignment in crew.assignments:
        if hours_of_overlap(
            assignment.sched_dep,
            assignment.sched_arr,
            leg.sched_dep,
            leg.sched_arr,
        ) > 0:
            reasons.append("already assigned during this leg")
            break
    return not reasons, reasons


def on_time_probability(leg: OpenLeg, *, slack_minutes: float = 45.0) -> float:
    block = block_hours(leg)
    scheduled = (parse_dt(leg.sched_arr) - parse_dt(leg.sched_dep)).total_seconds() / 60
    if scheduled <= 0:
        return 0.85
    ratio = min(1.0, (slack_minutes + scheduled) / (scheduled + slack_minutes))
    return round(0.72 + 0.26 * ratio, 3)


def score_assignment(
    crew: CrewMember,
    leg: OpenLeg,
    scenario: ScenarioDefinition | None,
    *,
    cost_ladder: dict[str, float],
    soft_weights: dict[str, float],
    crew_average_hours: float,
) -> CandidateScore:
    duration_hours = block_hours(leg)
    projected_hours = crew.block_hours_week + duration_hours
    duty_overage = max(0.0, projected_fdp_hours(crew, leg) - crew.max_fdp_hours)
    premium_pay = duty_overage * crew.hourly_rate * cost_ladder.get("premiumPay", 1.35)
    reserve_cost = 0.0

    rest_gap = hours_between(effective_last_duty_end(crew, leg), leg.sched_dep)
    fatigue_score = max(0.0, MIN_REST_HOURS + 2 - rest_gap)
    fairness_delta = abs(projected_hours - crew_average_hours) / max(crew_average_hours, 1.0)

    seniority_years = max(
        0.0, (parse_dt(leg.sched_dep) - parse_dt(crew.seniority_date)).days / 365.25
    )
    seniority_score = 0.0 if seniority_years >= 5 else (5 - seniority_years) / 5
    off_base_penalty = 0.0 if crew.base == leg.origin or leg.dest == crew.base else 1.0

    objective = (
        0.2 * premium_pay
        + 0.3 * reserve_cost
        + 0.3 * soft_weights.get("fatigueRisk", 1.0) * fatigue_score
        + 0.2 * soft_weights.get("fairnessDelta", 1.0) * fairness_delta
        + soft_weights.get("seniorityPreference", 0.5) * seniority_score
        + soft_weights.get("offBasePenalty", 1.0) * off_base_penalty
    )

    if scenario and crew.id in scenario.preferred_candidates:
        objective *= 0.94

    otp = on_time_probability(leg)

    return CandidateScore(
        objective=round(objective, 4),
        premium_pay_cost=round(premium_pay, 2),
        reserve_cost=round(reserve_cost, 2),
        fatigue_score=round(fatigue_score, 2),
        fairness_delta=round(fairness_delta, 4),
        seniority_score=round(seniority_score, 4),
        off_base_penalty=round(off_base_penalty, 2),
        duty_overage_hours=round(duty_overage, 2),
        on_time_probability=otp,
    )


def aggregate_plan_score(scores: list[CandidateScore]) -> CandidateScore:
    if not scores:
        return CandidateScore(
            objective=9999.0,
            premium_pay_cost=0.0,
            reserve_cost=0.0,
            fatigue_score=0.0,
            fairness_delta=0.0,
            seniority_score=0.0,
            off_base_penalty=0.0,
            duty_overage_hours=0.0,
            on_time_probability=0.0,
        )
    return CandidateScore(
        objective=round(sum(s.objective for s in scores), 4),
        premium_pay_cost=round(sum(s.premium_pay_cost for s in scores), 2),
        reserve_cost=round(sum(s.reserve_cost for s in scores), 2),
        fatigue_score=round(sum(s.fatigue_score for s in scores) / len(scores), 2),
        fairness_delta=round(sum(s.fairness_delta for s in scores) / len(scores), 4),
        seniority_score=round(sum(s.seniority_score for s in scores) / len(scores), 4),
        off_base_penalty=round(sum(s.off_base_penalty for s in scores) / len(scores), 2),
        duty_overage_hours=round(sum(s.duty_overage_hours for s in scores), 2),
        on_time_probability=round(
            sum(s.on_time_probability for s in scores) / len(scores), 3
        ),
    )


def reserve_leg_score(leg: OpenLeg, *, reserve_cost: float) -> CandidateScore:
    return CandidateScore(
        objective=round(0.35 * reserve_cost, 4),
        premium_pay_cost=0.0,
        reserve_cost=round(reserve_cost, 2),
        fatigue_score=0.0,
        fairness_delta=0.0,
        seniority_score=0.0,
        off_base_penalty=0.0,
        duty_overage_hours=block_hours(leg),
        on_time_probability=on_time_probability(leg, slack_minutes=20.0),
    )


def crew_average_hours(crew_list: list[CrewMember]) -> float:
    return mean(member.block_hours_week for member in crew_list) if crew_list else 0.0


def assignment_explanation(crew: CrewMember, leg: OpenLeg, score: CandidateScore) -> list[str]:
    explanation = [
        f"{crew.name} ({crew.role}) covers {leg.flight_no} {leg.origin}->{leg.dest} "
        f"with {', '.join(leg.required_quals)} coverage.",
    ]
    if crew.base not in {leg.origin, leg.dest}:
        explanation.append(
            f"{crew.name} deadheads from {crew.base}; off-base penalty applied but still FAR 117 legal."
        )
    if score.duty_overage_hours > 0:
        explanation.append(
            f"Projected FDP adds {score.duty_overage_hours:.1f} hours of premium exposure."
        )
    else:
        explanation.append("FAR 117 rest and FDP limits remain satisfied.")
    return explanation


def score_as_dict(score: CandidateScore) -> dict[str, float]:
    return asdict(score)
