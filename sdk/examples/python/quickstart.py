#!/usr/bin/env python3
"""Minimal Qtangl Python SDK quickstart."""

from qtangl import QtanglClient, new_idempotency_key

client = QtanglClient(
    base_url="https://api.qtangl.com",
    api_key="your-api-key",
)

scan = client.scan_fixture(idempotency_key=new_idempotency_key())
print("scanId", scan["scanId"])

verify = client.verify_scan(str(scan["scanId"]))
print("valid", verify.get("verification", {}).get("valid"))

print("schedules", client.list_schedules().get("schedules", []))
print("settings", client.monitor.get_settings().get("settings", {}))
