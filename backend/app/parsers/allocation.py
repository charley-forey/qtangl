from __future__ import annotations

from app.models.api import OptimizeRequest
from app.models.canonical import CanonicalProblem


def parse_allocation_request(request: OptimizeRequest) -> CanonicalProblem:
    return CanonicalProblem(type="allocation", raw=request.model_dump())
