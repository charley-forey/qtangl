from __future__ import annotations

import unittest

import httpx
from fastapi.testclient import TestClient

from app.main import app
from qtangl import QtanglClient, new_idempotency_key
from qtangl._transport import Transport
from qtangl.errors import QtanglApiError
from qtangl.testing import StarletteTestTransport


def _client(api_key: str = "qtangl-demo-key") -> tuple[QtanglClient, httpx.Client]:
    starlette = TestClient(app)
    transport = StarletteTestTransport(starlette)
    http = httpx.Client(transport=transport, base_url="http://testserver")
    sdk = QtanglClient(
        base_url="http://testserver",
        api_key=api_key,
        transport=Transport(
            base_url="http://testserver",
            api_key=api_key,
            client=http,
            max_retries=0,
        ),
    )
    return sdk, http


class SdkClientDogfoodTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client, self.http = _client()

    def tearDown(self) -> None:
        self.client.close()
        self.http.close()

    def test_scan_fixture_and_verify(self) -> None:
        scan = self.client.scan_fixture(idempotency_key=new_idempotency_key())
        self.assertEqual(scan["status"], "success")
        scan_id = scan["scanId"]
        self.assertTrue(scan_id)

        verify = self.client.verify_scan(str(scan_id))
        self.assertTrue(verify.get("verification", {}).get("valid"))

    def test_transparency_root_public(self) -> None:
        payload = self.client.transparency_root()
        self.assertIn("log", payload)

    def test_idempotency_replays_fixture_scan(self) -> None:
        key = new_idempotency_key()
        first = self.client.scan_fixture(idempotency_key=key)
        second = self.client.scan_fixture(idempotency_key=key)
        self.assertEqual(first["scanId"], second["scanId"])

    def test_unauthorized_raises_typed_error(self) -> None:
        bad, bad_http = _client(api_key="invalid-key")
        try:
            with self.assertRaises(QtanglApiError) as ctx:
                bad.scan_fixture()
            self.assertEqual(ctx.exception.status_code, 401)
        finally:
            bad.close()
            bad_http.close()


class LegacyImportTest(unittest.TestCase):
    def test_legacy_module_import(self) -> None:
        from qtangl_client import QtanglClient as LegacyClient

        self.assertIs(LegacyClient, QtanglClient)


class FastApiParityTest(unittest.TestCase):
    def test_sdk_matches_test_client_scan(self) -> None:
        sdk, http = _client()
        starlette = TestClient(app)
        headers = {"Authorization": "Bearer qtangl-demo-key"}
        direct = starlette.post(
            "/pqc/scan",
            headers=headers,
            json={"scenarioId": "bank-tls-inventory", "useFixture": True},
        )
        payload = sdk.scan_fixture()
        sdk.close()
        http.close()
        self.assertEqual(direct.status_code, 200)
        self.assertEqual(direct.json()["status"], payload["status"])
        self.assertIn("scanId", payload)
