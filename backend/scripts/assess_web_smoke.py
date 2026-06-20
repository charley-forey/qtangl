#!/usr/bin/env python3
"""Smoke-test the public /assess web surface (HTML + legacy redirects).

Usage:
  QTANGL_WEB_BASE=https://www.qtangl.com python scripts/assess_web_smoke.py
"""
from __future__ import annotations

import os
import sys
import urllib.error
import urllib.request


def _fetch(url: str, *, follow_redirects: bool = True) -> tuple[int, str, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "qtangl-assess-smoke/1.0"})
    if not follow_redirects:
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, req, fp, code, msg, headers, newurl):
                return None

        opener = urllib.request.build_opener(NoRedirect)
        try:
            with opener.open(req, timeout=60) as response:
                return response.status, response.geturl(), response.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            return exc.code, exc.geturl(), exc.read().decode("utf-8", errors="replace")

    with urllib.request.urlopen(req, timeout=60) as response:
        return response.status, response.geturl(), response.read().decode("utf-8", errors="replace")


def main() -> int:
    base = os.environ.get("QTANGL_WEB_BASE", "https://www.qtangl.com").rstrip("/")
    failures: list[str] = []

    print(f"Assess web smoke against {base}")

    status, final_url, body = _fetch(f"{base}/assess")
    if status != 200:
        failures.append(f"/assess HTTP {status}")
    if "assess" not in final_url:
        failures.append(f"/assess unexpected URL {final_url}")
    for marker in ("Q-Day", "Start assessment", "scanner"):
        if marker.lower() not in body.lower():
            failures.append(f"/assess missing marker: {marker}")
    print(f"  /assess OK ({status})")

    status, final_url, _ = _fetch(f"{base}/demo/pqc")
    if "/assess" not in final_url:
        failures.append(f"/demo/pqc did not land on /assess (got {final_url})")
    print(f"  /demo/pqc -> {final_url}")

    status, final_url, _ = _fetch(f"{base}/demo/pqc/methodology")
    if "/assess/methodology" not in final_url:
        failures.append(f"/demo/pqc/methodology redirect failed (got {final_url})")
    print(f"  /demo/pqc/methodology -> {final_url}")

    status, final_url, _ = _fetch(f"{base}/demo/pqc?mode=mini")
    if "/assess/mini" not in final_url:
        failures.append(f"/demo/pqc?mode=mini redirect failed (got {final_url})")
    print(f"  /demo/pqc?mode=mini -> {final_url}")

    autorun_status, _, autorun_body = _fetch(
        f"{base}/assess?scenario=bank-tls-inventory&autorun=1"
    )
    if autorun_status != 200:
        failures.append(f"autorun assess HTTP {autorun_status}")
    if "Regional bank" not in autorun_body and "bank-tls" not in autorun_body.lower():
        failures.append("autorun assess page missing bank scenario marker")
    print(f"  autorun assess OK ({autorun_status})")

    start_status, _, start_body = _fetch(f"{base}/assess/start")
    if start_status != 200:
        failures.append(f"/assess/start HTTP {start_status}")
    if "authorized baseline" not in start_body.lower() and "assess workspace" not in start_body.lower():
        failures.append("/assess/start missing signup marker")
    print(f"  /assess/start OK ({start_status})")

    verify_status, _, verify_body = _fetch(f"{base}/verify?scanId=golden-bank-tls-inventory")
    if verify_status != 200:
        failures.append(f"verify golden HTTP {verify_status}")
    if "verify" not in verify_body.lower():
        failures.append("verify golden page missing verify marker")
    print(f"  verify golden OK ({verify_status})")

    for marker in ("What do you want to do", "Three paths"):
        if marker.lower() not in body.lower():
            failures.append(f"/assess missing intent picker marker: {marker}")

    if failures:
        print("FAIL:")
        for item in failures:
            print(f"  - {item}")
        return 1

    print("OK: assess web smoke passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
