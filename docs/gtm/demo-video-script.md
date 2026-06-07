# Demo Video Script — Qtangl Q-Day Readiness (5 minutes)

**Audience:** CISO, security architect, GRC lead  
**Goal:** Show scan → signed report → independent verify → passport share  
**Recording:** 1920×1080, dark theme dashboard, no customer data

---

## 0:00 — Hook (15s)

**VO:** "Regulators want a cryptographic inventory. Spreadsheets won't survive audit. Here's Qtangl in five minutes."

**Visual:** Trust center transparency root hash (live from `/trust`)

---

## 0:15 — Assess (60s)

**VO:** "Start with a target domain or upload a cert bundle."

**Visual:**
1. `/assess` or dashboard — run scan on demo domain
2. Show readiness band and asset heatmap
3. Highlight Mosca timeline / HNDL exposure in report summary

**On-screen text:** "Inventory aid — validate in your environment"

---

## 1:15 — Evidence & verify (75s)

**VO:** "Every report is hashed and signed. Verify without trusting our dashboard."

**Visual:**
1. Download PDF + JSON from scan actions
2. Open `/verify` — paste content hash or upload JSON
3. Show green verify + transparency inclusion snippet

**On-screen text:** "ML-DSA-65 when available · Ed25519 fallback"

---

## 2:30 — Drift & remediation (60s)

**VO:** "Run a second scan to see drift. Prioritize remediation in the board."

**Visual:**
1. Dashboard Scan diff panel (prominent)
2. Remediation board — mark item in progress, optional Jira push

---

## 3:30 — Passport & vault (45s)

**VO:** "Share a Readiness Passport with auditors. Retain bundles in the evidence vault."

**Visual:**
1. Passport panel — label "Q2 board review", scope passport
2. Copy `/r/{token}` link
3. Evidence vault — retain scan, show retention date

---

## 4:15 — Cloud & CBOM (30s)

**VO:** "Pull AWS ACM or Azure Key Vault read-only. Merge with vendor CBOM exports."

**Visual:** Cloud integration panel → test → pull CBOM

---

## 4:45 — Close (15s)

**VO:** "Start free at qtangl.com/assess. Book a pilot for Monitor and enterprise retention."

**Visual:** Logo + CTAs: `/assess/mini` · `/access` · `/trust`

---

## Production notes

- Use sandbox API key; blur tenant ID if shown
- B-roll: transparency CLI curl from TrustTransparencyLive
- Captions required; link verify-spec in description
