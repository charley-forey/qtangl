# Trust & visibility persona playbooks

Stage-specific acceptance scripts per buyer. Use during sales demos and weekly scorecard rotation.

## CISO (executive trust)

**Goal:** Board-ready proof in one session.

| Stage | Done when |
|-------|-----------|
| Trust | Valid verify link for qtangl.com (`/trust/dogfood`) |
| Product | Own tenant readiness score + executive digest |
| Convert | Board PDF export without manual assembly |

**Script:** `/trust/dogfood` → verify → `/dashboard` Overview → export board PDF.

## GRC / compliance (evidence chain)

**Goal:** Auditor-acceptable evidence package.

| Stage | Done when |
|-------|-----------|
| Trust | Transparency log inclusion on dogfood scan |
| Product | Customer scan `verification.valid` + CBOM download |
| Convert | Verify-fix closes critical finding with audit trail |

**Script:** `/trust/disclosure` → transparency root → tenant verify → CBOM export.  
Proof pack: [`customer-proof-pack.md`](../runbooks/customer-proof-pack.md).

## Platform engineer (continuous operations)

**Goal:** Scheduled scans run without babysitting.

| Stage | Done when |
|-------|-----------|
| Trust | Understands dogfood CI = same engine as tenant scans |
| Product | Schedule last-run visible; drift alert received |
| Convert | Program board verify-fix on critical TLS item |

**Script:** [`monitor-pilot-template.md`](../runbooks/monitor-pilot-template.md).

## Weekly rotation

Monday scorecard: alternate persona walkthrough (CISO → GRC → Platform).
