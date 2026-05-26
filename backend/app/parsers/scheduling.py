from __future__ import annotations

import re
from typing import Iterable

from app.models.api import OptimizeRequest
from app.models.canonical import CanonicalConstraint, CanonicalProblem, CanonicalTask

_BEFORE_PATTERN = re.compile(
    r"(?P<before>[\w\s-]+?)\s+must\s+(?:finish\s+)?before\s+(?P<after>[\w\s-]+)",
    re.IGNORECASE,
)
_AFTER_PATTERN = re.compile(
    r"(?P<after>[\w\s-]+?)\s+must\s+(?:happen|occur)\s+after\s+(?P<before>[\w\s-]+)",
    re.IGNORECASE,
)
_UNAVAILABLE_PATTERN = re.compile(
    r"(?P<resource>[\w\s-]+?)\s+unavailable\s+on\s+day\s+(?P<day>\d+)",
    re.IGNORECASE,
)


def parse_schedule_request(request: OptimizeRequest) -> CanonicalProblem:
    raw_payload = request.model_dump()
    raw_tasks = request.tasks or request.data.get("tasks", [])

    if not raw_tasks:
        raise ValueError("Your request is missing required tasks for a schedule job.")

    tasks = [CanonicalTask(id=_normalize_name(task.id), duration=task.duration, resource=task.crew, metadata=task.model_dump()) for task in raw_tasks]
    constraints = list(_parse_constraints(request.constraints, tasks))

    return CanonicalProblem(type="schedule", tasks=tasks, constraints=constraints, raw=raw_payload)


def _parse_constraints(
    constraints: list[str], tasks: list[CanonicalTask]
) -> Iterable[CanonicalConstraint]:
    known_task_ids = {task.id for task in tasks}

    for raw_text in constraints:
        text = raw_text.strip()
        if not text:
            continue

        before_match = _BEFORE_PATTERN.fullmatch(text)
        if before_match:
            before = _normalize_name(before_match.group("before"))
            after = _normalize_name(before_match.group("after"))
            if before in known_task_ids and after in known_task_ids:
                yield CanonicalConstraint(
                    kind="precedence",
                    text=text,
                    subject=before,
                    target=after,
                )
                continue

        after_match = _AFTER_PATTERN.fullmatch(text)
        if after_match:
            before = _normalize_name(after_match.group("before"))
            after = _normalize_name(after_match.group("after"))
            if before in known_task_ids and after in known_task_ids:
                yield CanonicalConstraint(
                    kind="precedence",
                    text=text,
                    subject=before,
                    target=after,
                )
                continue

        unavailable_match = _UNAVAILABLE_PATTERN.fullmatch(text)
        if unavailable_match:
            yield CanonicalConstraint(
                kind="resource_unavailable",
                text=text,
                subject=unavailable_match.group("resource").strip(),
                day=int(unavailable_match.group("day")),
            )
            continue

        yield CanonicalConstraint(kind="generic", text=text)


def _normalize_name(value: str) -> str:
    return re.sub(r"\s+", "-", value.strip().lower())
