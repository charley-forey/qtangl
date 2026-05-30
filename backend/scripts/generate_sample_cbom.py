"""Generate demos/pqc_migration/data/sample-cbom-bank-tls-inventory.json."""

from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.pqc.cbom import validate_cbom
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.report import report_to_cbom

REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT = REPO_ROOT / "demos" / "pqc_migration" / "data" / "sample-cbom-bank-tls-inventory.json"
SAMPLE_SCAN_ID = "scan-6ba7b810-9dad-11d1-80b4-00c04fd430c8"


def main() -> None:
    dataset = load_dataset()
    bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
    cbom = report_to_cbom(bundle.report)
    cbom["serialNumber"] = "urn:uuid:6ba7b810-9dad-11d1-80b4-00c04fd430c8"
    cbom["metadata"]["timestamp"] = "2026-05-30T12:00:00+00:00"
    for prop in cbom["metadata"]["properties"]:
        if prop["name"] == "qtangl:scanId":
            prop["value"] = SAMPLE_SCAN_ID
    errors = validate_cbom(cbom)
    if errors:
        raise SystemExit("; ".join(errors))
    OUTPUT.write_text(json.dumps(cbom, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT} ({len(cbom['components'])} components)")


if __name__ == "__main__":
    main()
