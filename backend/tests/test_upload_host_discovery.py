"""Tests for upload host discovery and batch scan helpers."""

from __future__ import annotations

import unittest

from app.pqc.data import discover_hosts_from_upload_rows


class DiscoverHostsFromUploadTest(unittest.TestCase):
    def test_extracts_real_domains_and_skips_placeholders(self) -> None:
        rows = [
            {"host": "qtangl.com"},
            {"host": "www.qtangl.com"},
            {"host": "uploaded-cert-3"},
            {"host": "api.qtangl.com"},
        ]
        self.assertEqual(
            discover_hosts_from_upload_rows(rows),
            ["qtangl.com", "www.qtangl.com", "api.qtangl.com"],
        )


if __name__ == "__main__":
    unittest.main()
