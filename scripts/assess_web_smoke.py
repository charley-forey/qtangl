#!/usr/bin/env python3
"""Smoke-test the public /assess web surface (HTML + legacy redirects).

Usage:
  QTANGL_WEB_BASE=https://www.qtangl.com python scripts/assess_web_smoke.py
"""
from __future__ import annotations

import os
import sys

# Reuse backend implementation when run from repo root.
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_BACKEND_SCRIPT = os.path.join(_ROOT, "backend", "scripts", "assess_web_smoke.py")

if os.path.isfile(_BACKEND_SCRIPT):
    import runpy

    sys.argv[0] = _BACKEND_SCRIPT
    runpy.run_path(_BACKEND_SCRIPT, run_name="__main__")
else:
    print(f"Missing backend script: {_BACKEND_SCRIPT}")
    sys.exit(1)
