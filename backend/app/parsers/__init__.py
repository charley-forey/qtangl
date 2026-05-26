from __future__ import annotations

from app.models.api import OptimizeRequest
from app.models.canonical import CanonicalProblem

from .allocation import parse_allocation_request
from .routing import parse_routing_request
from .scheduling import parse_schedule_request


def parse_request(request: OptimizeRequest) -> CanonicalProblem:
    normalized_type = "schedule" if request.type == "scheduling" else request.type

    if normalized_type == "schedule":
        return parse_schedule_request(request)
    if normalized_type == "routing":
        return parse_routing_request(request)
    return parse_allocation_request(request)
