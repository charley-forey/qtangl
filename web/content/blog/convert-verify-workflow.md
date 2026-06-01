---
title: "Closing the loop: verify-fix in Convert"
description: "How security teams attach re-scan proof to remediation items."
date: "2026-06-01"
---

When a remediation item moves to **done**, auditors ask: *how do you know it stayed fixed?*

Qtangl Convert adds a **Verify fix** workflow: run a follow-up scan, compare the asset on baseline vs verification scan, and attach `verifyScanId` to the remediation record. Board and auditor exports include live `workflowStatus` from Postgres.

**Try it:** connect your tenant key on [Dashboard](/dashboard), select a verification scan, and click **Verify fix** on a remediation row.
