"""Signed sensor auto-update channel — staged rollout rings."""

from __future__ import annotations

from typing import Any

SENSOR_VERSIONS = {
    "stable": {"version": "0.1.0", "sha256": "", "ring": "stable"},
    "canary": {"version": "0.1.1-rc1", "sha256": "", "ring": "canary"},
}


def check_for_update(*, current_version: str, ring: str = "stable") -> dict[str, Any]:
    channel = SENSOR_VERSIONS.get(ring, SENSOR_VERSIONS["stable"])
    if channel["version"] == current_version:
        return {"updateAvailable": False, "version": current_version}
    return {
        "updateAvailable": True,
        "version": channel["version"],
        "sha256": channel["sha256"],
        "downloadUrl": f"https://releases.qtangl.com/sensor/{channel['version']}/qtangl-sensor",
        "ring": ring,
    }
