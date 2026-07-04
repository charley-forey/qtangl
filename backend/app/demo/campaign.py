from __future__ import annotations

import threading
import time
from typing import Any

from app.demo.scenes import apply_scene
from app.demo.store import get_campaign, save_campaign

_PLAYBACK_THREADS: dict[str, threading.Thread] = {}
_PLAYBACK_STOP: dict[str, threading.Event] = {}


def save_campaign_definition(*, name: str, steps: list[dict[str, Any]]) -> dict[str, Any]:
    return save_campaign({"name": name, "steps": steps, "playbackState": {"status": "idle", "stepIndex": 0}})


def get_campaign_state(campaign_id: str) -> dict[str, Any]:
    campaign = get_campaign(campaign_id)
    if campaign is None:
        raise ValueError("Campaign not found")
    return campaign


def play_campaign(campaign_id: str) -> dict[str, Any]:
    campaign = get_campaign(campaign_id)
    if campaign is None:
        raise ValueError("Campaign not found")
    stop = _PLAYBACK_STOP.setdefault(campaign_id, threading.Event())
    stop.clear()
    state = dict(campaign.get("playbackState") or {})
    state["status"] = "playing"
    campaign["playbackState"] = state
    save_campaign(campaign)
    if campaign_id not in _PLAYBACK_THREADS or not _PLAYBACK_THREADS[campaign_id].is_alive():
        thread = threading.Thread(target=_playback_loop, args=(campaign_id,), daemon=True)
        _PLAYBACK_THREADS[campaign_id] = thread
        thread.start()
    return campaign


def pause_campaign(campaign_id: str) -> dict[str, Any]:
    stop = _PLAYBACK_STOP.get(campaign_id)
    if stop:
        stop.set()
    campaign = get_campaign(campaign_id)
    if campaign is None:
        raise ValueError("Campaign not found")
    state = dict(campaign.get("playbackState") or {})
    state["status"] = "paused"
    campaign["playbackState"] = state
    return save_campaign(campaign)


def scrub_campaign(campaign_id: str, *, step_index: int) -> dict[str, Any]:
    campaign = get_campaign(campaign_id)
    if campaign is None:
        raise ValueError("Campaign not found")
    steps = campaign.get("steps") or []
    if step_index < 0 or step_index >= len(steps):
        raise ValueError("Step index out of range")
    from app.demo.service import reassess_demo

    for idx in range(step_index + 1):
        _apply_step(steps[idx])
    snapshot = reassess_demo(campaign_id=campaign_id)
    state = dict(campaign.get("playbackState") or {})
    state.update({"status": "scrubbed", "stepIndex": step_index})
    campaign["playbackState"] = state
    save_campaign(campaign)
    return {"campaign": campaign, "snapshot": snapshot}


def _playback_loop(campaign_id: str) -> None:
    from app.demo.service import reassess_demo

    campaign = get_campaign(campaign_id)
    if campaign is None:
        return
    steps = campaign.get("steps") or []
    stop = _PLAYBACK_STOP.setdefault(campaign_id, threading.Event())
    last_offset = 0.0
    for idx, step in enumerate(steps):
        if stop.is_set():
            break
        offset = float(step.get("offsetSec") or 0)
        wait = max(0.0, offset - last_offset)
        if wait > 0:
            if stop.wait(timeout=wait):
                break
        last_offset = offset
        _apply_step(step)
        reassess_demo(campaign_id=campaign_id)
        state = dict(campaign.get("playbackState") or {})
        state.update({"status": "playing", "stepIndex": idx})
        campaign["playbackState"] = state
        save_campaign(campaign)
        campaign = get_campaign(campaign_id) or campaign
    state = dict(campaign.get("playbackState") or {})
    state["status"] = "completed" if not stop.is_set() else "paused"
    campaign["playbackState"] = state
    save_campaign(campaign)


def _apply_step(step: dict[str, Any]) -> None:
    action = str(step.get("action") or "")
    if action == "scene":
        apply_scene(str(step.get("sceneId") or ""))
        return
    if action == "inject":
        from app.demo.adversary import inject_event

        inject_event(event_type=str(step.get("eventType") or ""), resource_id=step.get("resourceId"))
        return
    if action == "posture":
        from app.demo.store import get_resource, upsert_resource

        resource = get_resource(str(step.get("resourceId") or ""))
        if resource is None:
            return
        if step.get("posture"):
            resource.posture = step["posture"]
        if step.get("complianceTarget"):
            resource.compliance_target = step["complianceTarget"]
        upsert_resource(resource)
