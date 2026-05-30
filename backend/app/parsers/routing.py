from __future__ import annotations

from app.models.api import OptimizeRequest
from app.models.canonical import CanonicalProblem


def parse_routing_request(request: OptimizeRequest) -> CanonicalProblem:
    stops = [stop.model_dump() for stop in request.stops]
    vehicles = [vehicle.model_dump() for vehicle in request.vehicles]
    data = dict(request.data)
    if stops and "stops" not in data:
        data["stops"] = stops
    if vehicles and "vehicles" not in data:
        data["vehicles"] = vehicles
    if "depot" not in data:
        data["depot"] = {"id": "depot", "x": 0, "y": 0}
    if "coordinates" not in data:
        data["coordinates"] = {
            stop["id"]: {"x": float(index + 1), "y": float(index + 1)} for index, stop in enumerate(data.get("stops", []))
        }
    return CanonicalProblem(type="routing", raw=data)


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
