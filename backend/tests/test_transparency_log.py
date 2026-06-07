from __future__ import annotations

import os
import tempfile
import unittest

from app.db.engine import init_db
from app.pqc.signing import sign_report_payload, verify_report_signature
from app.pqc.transparency import (
    append_entry,
    current_root,
    inclusion_proof,
    transparency_log_enabled,
)


class TransparencyLogTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.mkdtemp()
        self._db_path = os.path.join(self._tmpdir, "test.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        os.environ["QTANGL_ENABLE_TRANSPARENCY_LOG"] = "true"
        from app.db import engine as engine_module

        engine_module._engine = None
        engine_module._SessionLocal = None
        init_db()

    def tearDown(self) -> None:
        from app.db import engine as engine_module

        engine_module._engine = None
        engine_module._SessionLocal = None
        for key in ("DATABASE_URL", "QTANGL_DB_AUTO_MIGRATE", "QTANGL_ENABLE_TRANSPARENCY_LOG"):
            os.environ.pop(key, None)

    def test_flag_default_off(self) -> None:
        os.environ.pop("QTANGL_ENABLE_TRANSPARENCY_LOG", None)
        self.assertFalse(transparency_log_enabled())

    def test_append_and_chain_integrity(self) -> None:
        payload = {"scanId": "scan-a", "readinessScore": 10}
        sig = sign_report_payload(payload)
        r1 = append_entry(sig["contentHash"], sig)
        self.assertIsNotNone(r1)
        assert r1 is not None
        self.assertEqual(r1["seq"], 1)
        self.assertEqual(len(r1["entryHash"]), 64)

        sig2 = sign_report_payload({"scanId": "scan-b", "readinessScore": 20})
        r2 = append_entry(sig2["contentHash"], sig2)
        assert r2 is not None
        self.assertEqual(r2["seq"], 2)
        self.assertEqual(r2["prevEntryHash"], r1["entryHash"])

        root = current_root()
        self.assertEqual(root["seq"], 2)
        self.assertEqual(root["rootHash"], r2["entryHash"])

    def test_idempotent_append(self) -> None:
        payload = {"scanId": "scan-dup", "readinessScore": 33}
        sig = sign_report_payload(payload)
        first = append_entry(sig["contentHash"], sig)
        second = append_entry(sig["contentHash"], sig)
        self.assertEqual(first["seq"], second["seq"])
        self.assertEqual(first["contentHash"], second["contentHash"])
        self.assertEqual(current_root()["seq"], 1)

    def test_inclusion_proof(self) -> None:
        payload = {"scanId": "scan-inc", "readinessScore": 44}
        sig = sign_report_payload(payload)
        append_entry(sig["contentHash"], sig)
        proof = inclusion_proof(sig["contentHash"])
        self.assertIsNotNone(proof)
        assert proof is not None
        self.assertEqual(proof["contentHash"], sig["contentHash"])
        self.assertIn("rootHash", proof)

    def test_tamper_detection_on_verify(self) -> None:
        payload = {"scanId": "scan-tamper", "readinessScore": 50}
        sig = sign_report_payload(payload)
        tampered = dict(payload)
        tampered["readinessScore"] = 99
        result = verify_report_signature(tampered, sig)
        self.assertFalse(result["valid"])


if __name__ == "__main__":
    unittest.main()
