from __future__ import annotations

from dataclasses import asdict
from datetime import datetime
from statistics import mean

from app.hospital.models import CallOutEvent, CandidateScore, Nurse, ScenarioDefinition


TIME_FORMAT = "%Y-%m-%dT%H:%M:%S"


def parse_dt(value: str) -> datetime:
    return datetime.fromisoformat(value)


def shift_hours(callout: CallOutEvent) -> float:
    return (parse_dt(callout.end) - parse_dt(callout.start)).total_seconds() / 3600


def hours_between(end_value: str, start_value: str) -> float:
    return (parse_dt(start_value) - parse_dt(end_value)).total_seconds() / 3600


def hours_of_overlap(start_a: str, end_a: str, start_b: str, end_b: str) -> float:
    start = max(parse_dt(start_a), parse_dt(start_b))
    end = min(parse_dt(end_a), parse_dt(end_b))
    overlap = (end - start).total_seconds() / 3600
    return max(0.0, overlap)


def nurse_is_eligible(nurse: Nurse, callout: CallOutEvent) -> tuple[bool, list[str]]:
    reasons: list[str] = []
    if not set(callout.required_certifications).issubset(set(nurse.certifications)):
        reasons.append("missing required certification")
    if callout.ward not in set([nurse.home_ward, *nurse.cross_trained_wards]):
        reasons.append("not cross-trained for target ward")
    if hours_between(nurse.last_shift_end, callout.start) < 10:
        reasons.append("rest window below 10 hours")
    for assignment in nurse.assignments:
        if hours_of_overlap(assignment.start, assignment.end, callout.start, callout.end) > 0:
            reasons.append("already scheduled during the call-out shift")
            break
    return not reasons, reasons


def score_candidate(
    nurse: Nurse,
    callout: CallOutEvent,
    scenario: ScenarioDefinition | None = None,
    *,
    cost_ladder: dict[str, float],
    soft_weights: dict[str, float],
    roster_average_hours: float,
) -> CandidateScore:
    duration_hours = shift_hours(callout)
    projected_hours = nurse.weekly_hours + duration_hours
    overtime_hours = max(0.0, projected_hours - nurse.max_hours_week)
    overtime_cost = overtime_hours * nurse.base_hourly_rate * cost_ladder["voluntaryOvertime"]
    agency_cost = 0.0

    rest_gap_hours = hours_between(nurse.last_shift_end, callout.start)
    fatigue_score = max(0.0, 12.0 - rest_gap_hours)
    fairness_delta = abs(projected_hours - roster_average_hours) / max(roster_average_hours, 1.0)

    seniority_years = max(0.0, (parse_dt(callout.start) - parse_dt(nurse.seniority_date)).days / 365.25)
    seniority_score = 0.0 if seniority_years >= 5 else (5 - seniority_years) / 5
    cross_ward_penalty = 0.0 if nurse.home_ward == callout.ward else 1.0

    objective = (
        0.2 * overtime_cost
        + 0.3 * agency_cost
        + 0.3 * soft_weights["fatigueRisk"] * fatigue_score
        + 0.2 * soft_weights["fairnessDelta"] * fairness_delta
        + soft_weights["seniorityPreference"] * seniority_score
        + soft_weights["crossWardPenalty"] * cross_ward_penalty
    )

    if scenario and nurse.id in scenario.preferred_candidates:
        objective *= 0.94

    return CandidateScore(
        objective=round(objective, 4),
        overtime_cost=round(overtime_cost, 2),
        agency_cost=round(agency_cost, 2),
        fatigue_score=round(fatigue_score, 2),
        fairness_delta=round(fairness_delta, 4),
        seniority_score=round(seniority_score, 4),
        cross_ward_penalty=round(cross_ward_penalty, 2),
        overtime_hours=round(overtime_hours, 2),
    )


def agency_candidate_score(callout: CallOutEvent, *, agency_cost: float) -> CandidateScore:
    duration_hours = shift_hours(callout)
    return CandidateScore(
        objective=round(0.3 * agency_cost, 4),
        overtime_cost=0.0,
        agency_cost=round(agency_cost, 2),
        fatigue_score=0.0,
        fairness_delta=0.0,
        seniority_score=0.0,
        cross_ward_penalty=0.0,
        overtime_hours=duration_hours,
    )


def roster_average_hours(nurses: list[Nurse]) -> float:
    return mean(nurse.weekly_hours for nurse in nurses) if nurses else 0.0


def candidate_explanation(nurse: Nurse, callout: CallOutEvent, score: CandidateScore) -> list[str]:
    explanation = [
        f"{nurse.name} carries {', '.join(callout.required_certifications)} coverage for {callout.ward}.",
    ]
    if nurse.home_ward != callout.ward:
        explanation.append(
            f"{nurse.name} is cross-trained from {nurse.home_ward}, so the move preserves specialty coverage without agency."
        )
    if score.overtime_hours > 0:
        explanation.append(
            f"The swap adds {score.overtime_hours:.1f} overtime hours, which is still cheaper than an agency backfill."
        )
    if score.fatigue_score == 0:
        explanation.append("The nurse still clears the 10-hour rest rule with zero fatigue penalty.")
    else:
        explanation.append(
            f"The rest window is tighter, so the candidate carries a fatigue score of {score.fatigue_score:.1f}."
        )
    return explanation


def score_as_dict(score: CandidateScore) -> dict[str, float]:
    return asdict(score)
