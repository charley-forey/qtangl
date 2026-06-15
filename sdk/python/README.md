# qtangl (Python SDK)

Official Python client for the Qtangl PQC Readiness API.

## Install

```bash
pip install qtangl
```

Monorepo development:

```bash
pip install -e backend/verifier
pip install -e sdk/python
```

## Quickstart

```python
from qtangl import QtanglClient, new_idempotency_key

client = QtanglClient(base_url="https://api.qtangl.com", api_key="your-key")

scan = client.scan_fixture(idempotency_key=new_idempotency_key())
print(scan["scanId"])

verify = client.verify_scan(scan["scanId"])
print(verify["verification"]["valid"])

schedules = client.list_schedules()
me = client.me()
```

## Offline verify

Reuses the `qtangl-verify` package:

```python
from qtangl.verify import verify_report_offline

result = verify_report_offline(report_json, signature, api_base="https://api.qtangl.com")
```

## Generic requests

For endpoints not yet wrapped with typed helpers:

```python
payload = client.request("PATCH", "/tenant/settings", json={"benchmarkOptIn": True})
```
