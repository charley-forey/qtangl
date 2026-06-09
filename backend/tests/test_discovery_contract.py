from __future__ import annotations

import json
from pathlib import Path

from app.cbom.adapter import parse_cyclonedx_document

CRYPTOSCAN_FIXTURE = Path(__file__).parent / "fixtures" / "cbom" / "cryptoscan-sample.json"
THEIA_FIXTURE = Path(__file__).parent / "fixtures" / "cbom" / "theia-sample.json"


def test_cryptoscan_cbom_fixture_parses():
    doc = json.loads(CRYPTOSCAN_FIXTURE.read_text(encoding="utf-8"))
    components = parse_cyclonedx_document(
        doc,
        source_id="test-cryptoscan",
        source_type="qtangl-scan",
        source_label="CryptoScan fixture",
        source_method="qtangl:code-scan",
        verification_status="verified",
    )
    assert len(components) == 1
    assert components[0].algorithm


def test_theia_cbom_fixture_parses():
    doc = json.loads(THEIA_FIXTURE.read_text(encoding="utf-8"))
    components = parse_cyclonedx_document(
        doc,
        source_id="test-theia",
        source_type="qtangl-scan",
        source_label="theia fixture",
        source_method="qtangl:binary-scan",
        verification_status="verified",
    )
    assert len(components) == 1
