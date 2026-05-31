from __future__ import annotations

import os
import socket
import time
import unittest
from unittest.mock import patch

from app.pqc.safety import ScanSafetyError, assert_scannable, live_scan_enabled, scan_timeout_seconds
from app.pqc.scanner import scan_tls_endpoint


class PqcSafetyTest(unittest.TestCase):
    def test_live_scan_disabled_by_default(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            self.assertFalse(live_scan_enabled())

    def test_live_scan_enabled_with_env_flag(self) -> None:
        with patch.dict(os.environ, {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true"}):
            self.assertTrue(live_scan_enabled())

    def test_blocks_loopback_ip(self) -> None:
        with patch.dict(os.environ, {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true"}):
            with self.assertRaises(ScanSafetyError):
                assert_scannable("127.0.0.1", port=443)

    def test_blocks_localhost_hostname(self) -> None:
        with patch.dict(os.environ, {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true"}):
            with self.assertRaises(ScanSafetyError):
                assert_scannable("localhost", port=443)

    def test_blocks_metadata_ip(self) -> None:
        with patch.dict(os.environ, {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true"}):
            with self.assertRaises(ScanSafetyError):
                assert_scannable("169.254.169.254", port=443)

    def test_blocks_metadata_hostname(self) -> None:
        with patch.dict(os.environ, {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true"}):
            with self.assertRaises(ScanSafetyError):
                assert_scannable("metadata.google.internal", port=443)

    def test_blocks_rfc1918_private_ranges(self) -> None:
        with patch.dict(os.environ, {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true"}):
            for host in ("10.0.0.1", "192.168.1.1", "172.16.0.1"):
                with self.subTest(host=host):
                    with self.assertRaises(ScanSafetyError):
                        assert_scannable(host, port=443)

    def test_blocks_when_live_scan_disabled(self) -> None:
        with patch.dict(os.environ, {"QTANGL_PQC_ENABLE_LIVE_SCAN": "false"}, clear=False):
            with self.assertRaises(ScanSafetyError):
                assert_scannable("example.com", port=443)

    def test_respects_allowlist_when_configured(self) -> None:
        env = {
            "QTANGL_PQC_ENABLE_LIVE_SCAN": "true",
            "QTANGL_PQC_SCAN_ALLOWLIST": "test.openquantumsafe.org",
        }
        with patch.dict(os.environ, env, clear=False):
            self.assertEqual(assert_scannable("test.openquantumsafe.org", port=443), "test.openquantumsafe.org")
            with self.assertRaises(ScanSafetyError):
                assert_scannable("example.com", port=443)

    def test_scan_tls_honors_timeout_budget(self) -> None:
        timeout = 2.0

        def slow_connect(*args, **kwargs):  # noqa: ANN002, ANN003
            time.sleep(timeout + 3)
            raise socket.timeout("timed out")

        env = {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true", "QTANGL_PQC_SCAN_TIMEOUT": str(int(timeout))}
        with patch.dict(os.environ, env, clear=False):
            with patch("app.pqc.scanner.assert_scannable", return_value="scan.example.com"):
                with patch("app.pqc.scanner.socket.create_connection", side_effect=slow_connect) as mock_connect:
                    started = time.perf_counter()
                    asset, coverage = scan_tls_endpoint("scan.example.com", 443)
                    elapsed = time.perf_counter() - started

        self.assertIsNone(asset)
        self.assertIsNotNone(coverage)
        self.assertEqual(coverage.get("status"), "unreachable")
        self.assertLess(elapsed, timeout + 5.0)
        mock_connect.assert_called_once()
        self.assertEqual(mock_connect.call_args.kwargs.get("timeout"), timeout)


if __name__ == "__main__":
    unittest.main()
