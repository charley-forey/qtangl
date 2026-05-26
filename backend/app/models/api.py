from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class ScheduleTaskInput(BaseModel):
    id: str
    duration: int = Field(gt=0)
    crew: str | None = None
    title: str | None = None


class RoutingStopInput(BaseModel):
    id: str
    serviceWindow: str | None = None


class VehicleInput(BaseModel):
    id: str
    capacity: int | None = None


class ShiftInput(BaseModel):
    id: str
    requiredSkill: str | None = None


class StaffInput(BaseModel):
    name: str
    skills: list[str] = Field(default_factory=list)
    maxHours: int | None = None


class OptimizeRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    type: Literal["schedule", "scheduling", "routing", "allocation"]
    data: dict[str, Any] = Field(default_factory=dict)
    constraints: list[str] = Field(default_factory=list)
    tasks: list[ScheduleTaskInput] = Field(default_factory=list)
    stops: list[RoutingStopInput] = Field(default_factory=list)
    vehicles: list[VehicleInput] = Field(default_factory=list)
    shifts: list[ShiftInput] = Field(default_factory=list)
    staff: list[StaffInput] = Field(default_factory=list)


class OptimizeResponse(BaseModel):
    status: Literal["success"]
    summary: str
    solution: Any
    metrics: dict[str, Any]
    method: Literal["classical", "hybrid"]
    details: dict[str, Any]
    visualization: dict[str, Any] | None = None


class ErrorResponse(BaseModel):
    status: Literal["error"]
    message: str
