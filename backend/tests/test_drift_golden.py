import json
from pathlib import Path

from app.monitoring.unified_diff import diff_snapshot_payloads

FIXTURE = Path(__file__).resolve().parents[1] / "drift-golden-fixtures" / "external_pair.json"


def test_golden_external_pair():
    data = json.loads(FIXTURE.read_text(encoding="utf-8"))
    delta = diff_snapshot_payloads(data["previous"], data["current"])
    assert delta["addedCount"] == data["expected"]["addedCount"]
    assert delta["removedCount"] == data["expected"]["removedCount"]
