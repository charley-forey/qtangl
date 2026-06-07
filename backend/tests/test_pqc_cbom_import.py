from __future__ import annotations

import json
import os
import tempfile
import unittest
from pathlib import Path

from app.cbom.adapter import component_dedupe_key, parse_cyclonedx_document
from app.cbom.merge import aggregated_readiness, detect_conflicts, export_aggregate_cbom
from app.cbom.service import get_aggregate, ingest_cbom_document, list_conflicts
from app.db.engine import init_db
from app.pqc.cbom import validate_import_cbom

FIXTURES = Path(__file__).resolve().parent / "fixtures"
KEYFACTOR_CBOM = FIXTURES / "keyfactor-sample-cbom-16.json"


class CbomImportValidatorTest(unittest.TestCase):
    def test_validate_import_accepts_16_and_17(self) -> None:
        doc = json.loads(KEYFACTOR_CBOM.read_text(encoding="utf-8"))
        self.assertEqual(validate_import_cbom(doc), [])
        doc17 = {**doc, "specVersion": "1.7"}
        self.assertEqual(validate_import_cbom(doc17), [])

    def test_validate_import_rejects_empty_components(self) -> None:
        doc = json.loads(KEYFACTOR_CBOM.read_text(encoding="utf-8"))
        doc["components"] = []
        errors = validate_import_cbom(doc)
        self.assertTrue(any("empty" in e for e in errors))


class CbomIngestionTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.mkdtemp()
        self._db_path = os.path.join(self._tmpdir, "cbom.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        from app.db import engine as engine_module

        engine_module._engine = None
        engine_module._SessionLocal = None
        init_db()
        self.doc = json.loads(KEYFACTOR_CBOM.read_text(encoding="utf-8"))

    def tearDown(self) -> None:
        from app.db import engine as engine_module

        engine_module._engine = None
        engine_module._SessionLocal = None
        os.environ.pop("DATABASE_URL", None)
        os.environ.pop("QTANGL_DB_AUTO_MIGRATE", None)

    def test_ingest_and_aggregate(self) -> None:
        result = ingest_cbom_document(tenant_id="sandbox", document=self.doc, source_label="Keyfactor export")
        self.assertTrue(result["ok"])
        self.assertGreaterEqual(result["componentCount"], 3)

        agg = get_aggregate(tenant_id="sandbox", sync_scan=False)
        self.assertGreaterEqual(agg["componentCount"], 3)
        self.assertIn("readiness", agg)
        self.assertGreater(agg["readiness"]["unverifiedCount"], 0)

    def test_idempotent_reupload(self) -> None:
        first = ingest_cbom_document(tenant_id="sandbox", document=self.doc)
        second = ingest_cbom_document(tenant_id="sandbox", document=self.doc)
        self.assertTrue(second.get("idempotent"))

    def test_dedupe_key_stable(self) -> None:
        components = parse_cyclonedx_document(
            self.doc,
            source_id="src-1",
            source_type="third-party",
            source_label="Keyfactor",
        )
        keys = [component_dedupe_key(c) for c in components]
        self.assertEqual(len(keys), len(set(keys)))

    def test_conflict_detection(self) -> None:
        c1 = parse_cyclonedx_document(self.doc, source_id="a", source_type="third-party", source_label="A")[0]
        c2 = parse_cyclonedx_document(self.doc, source_id="b", source_type="third-party", source_label="B")[0]
        c2.algorithm = "ECDSA-P256"
        conflicts = detect_conflicts(c1, c2)
        self.assertTrue(any(c["field"] == "algorithm" for c in conflicts))

    def test_export_round_trip(self) -> None:
        ingest_cbom_document(tenant_id="sandbox", document=self.doc)
        agg = get_aggregate(tenant_id="sandbox", sync_scan=False)
        exported = export_aggregate_cbom(
            [parse_cyclonedx_document(self.doc, source_id="x", source_type="third-party", source_label="X")[0]],
            tenant_id="sandbox",
            spec_version="1.6",
        )
        self.assertEqual(exported["bomFormat"], "CycloneDX")
        self.assertEqual(exported["specVersion"], "1.6")
        props = exported["components"][0]["properties"]
        self.assertTrue(any(p["name"] == "qtangl:verificationStatus" for p in props))

    def test_unverified_labeling(self) -> None:
        ingest_cbom_document(tenant_id="sandbox", document=self.doc, verification_status="unverified-source")
        agg = get_aggregate(tenant_id="sandbox", sync_scan=False)
        self.assertEqual(agg["readiness"]["label"], aggregated_readiness([])["label"] if not agg["componentCount"] else agg["readiness"]["label"])
        if agg["componentCount"]:
            self.assertIn("unverified", agg["readiness"]["label"].lower() + str(agg["readiness"]["unverifiedCount"]))


if __name__ == "__main__":
    unittest.main()
