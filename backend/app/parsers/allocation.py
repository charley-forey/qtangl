from __future__ import annotations

from app.models.api import OptimizeRequest
from app.models.canonical import CanonicalProblem


def parse_allocation_request(request: OptimizeRequest) -> CanonicalProblem:
    staff = [member.model_dump() for member in request.staff]
    shifts = [shift.model_dump() for shift in request.shifts]
    data = dict(request.data)
    if staff and "staff" not in data:
        data["staff"] = staff
    if shifts and "shifts" not in data:
        data["shifts"] = shifts
    data.setdefault("shiftHours", 8)
    data.setdefault("maxHoursPerStaff", 40)
    return CanonicalProblem(type="allocation", raw=data)
