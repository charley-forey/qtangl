# Loom storyboard — Hero Q-Day assessment demo (~6 min)

Shot-by-shot guide for recording the primary sales video. Aligns with [script.md](./script.md), [assess-sales-demo-script.md](./assess-sales-demo-script.md), and [pilot-playbook.md](./pilot-playbook.md) §3–4.

**Primary URL (open before recording):**

`https://www.qtangl.com/assess?scenario=bank-tls-inventory&autorun=1`

**Live proof URL (second act):** `test.openquantumsafe.org` via Assess intent **Try a real live scan**

---

## Pre-flight (10 min before Loom)

| Step | Action |
|------|--------|
| Browser | Clean profile, 1920×1080, hide bookmarks bar, zoom 100% |
| Mic | Test levels; close Slack/email |
| Warm-up | Open autorun link once; wait for **Executive** tab — discard that tab or use fresh tab for recording |
| Verify tab | Logged-out window ready: `https://www.qtangl.com/verify` |
| Live scan | Confirm Railway has `QTANGL_PQC_ENABLE_LIVE_SCAN=true` and `test.openquantumsafe.org` on allowlist (see pilot-playbook §4). If not, skip Act 2 or record fixture-only |
| Never say | “Demo site,” `/demo/pqc` (legacy redirect only) |

**E1 checklist row:** mark “Sales demo (bank autorun)” recorded when this video ships.

---

## Act 1 — Fixture baseline (0:00–4:30)

### Shot 1 — Hook (0:00–0:20)

| | |
|---|---|
| **Screen** | Optional: homepage hero for 3s, or straight to Assess |
| **Click** | Nav **Run Q-Day scan** → `/assess`, or paste autorun URL |
| **Say** | “Your board wants a PQC migration plan before NSM-10 and NIST IR 8547 deadlines. Spreadsheets won’t cut it. Qtangl baselines quantum-vulnerable cryptography in one session — inventory, Mosca harvest-now-decrypt-later risk, signed PDF, and a verify link auditors can check without logging in.” |

### Shot 2 — Autorun loads (0:20–0:45)

| | |
|---|---|
| **URL** | `https://www.qtangl.com/assess?scenario=bank-tls-inventory&autorun=1` |
| **Click** | None — wait for progress banner **Running demo scan…** |
| **Wait for** | Tab **Executive** visible (target &lt;15s) |
| **Say** | “Regional bank TLS inventory — fictional scenario, runs offline for a predictable board readout. Same pipeline your authorized domains use in production.” |

### Shot 3 — Executive readout (0:45–1:45)

| | |
|---|---|
| **Tab** | **Executive** (default) |
| **Scroll** | Q-Day readiness score + band |
| **Point at** | Industry peer band (or cohort fallback) |
| **Point at** | Top vulnerability / executive priorities card |
| **Scroll down** | **Drift since last scan** upsell block (sample drift preview) |
| **Say** | “Readiness score in the 30s band — seven quantum-vulnerable assets in this scenario. Peer context for your industry. This is the one-slide board answer. Below: what changed since a weekly re-scan — that’s the Monitor story.” |

### Shot 4 — Mosca HNDL (1:45–2:15)

| | |
|---|---|
| **Tab** | Stay on **Executive** — scroll to **Mosca timeline** |
| **Say** | “Mosca’s inequality: X years your data must stay confidential, plus Y years to migrate, versus Z years until a quantum computer breaks today’s crypto. When X plus Y exceeds Z, harvest-now-decrypt-later is a today problem — not ‘when quantum ships.’” |

### Shot 5 — Compliance mapping (2:15–2:45)

| | |
|---|---|
| **Tab** | Click **Compliance** |
| **Scroll** | Framework rails — NSM-10, PCI-DSS 4.0, NIST CSF as shown |
| **Say** | “Every finding maps to the frameworks driving your program — control themes and migration deadlines for GRC, not a generic CVE dump.” |

### Shot 6 — Inventory “aha” (2:45–3:15)

| | |
|---|---|
| **Tab** | Click **Inventory** |
| **Scroll** | Table — RSA-2048 / ECDSA concentration |
| **Optional click** | **Export CSV** (show export exists; don’t need to download) |
| **Say** | “This is what spreadsheets miss — JWKS, email STARTTLS, shadow APIs. Inventory aid, not formal attestation — but it’s machine-readable and signed.” |

### Shot 7 — Remediation + what-if (3:15–3:45)

| | |
|---|---|
| **Tab** | Click **Remediation** |
| **Click** | Checkbox on top backlog item (e.g. RSA API gateway → hybrid TLS) |
| **Wait for** | **Projected** readiness line |
| **Say** | “Prioritized backlog with effort and target algorithms — ML-KEM hybrid TLS on the API gateway. What-if shows score movement when you close the top items.” |

### Shot 8 — Technical / handshake (3:45–4:00)

| | |
|---|---|
| **Tab** | Click **Technical** |
| **Scroll** | Handshake proof panel — hybrid KEX (e.g. X25519MLKEM768), ClientHello excerpt |
| **Say** | “We capture PQ TLS handshake proof — what hybrid migration actually looks like on the wire.” |

### Shot 9 — Evidence + verify (4:00–4:30)

| | |
|---|---|
| **Tab** | Click **Evidence** |
| **Point at** | Links **PDF**, **CBOM**, **Board** |
| **Click** | **Copy share link** (or open verify link with `scanId`) |
| **Switch window** | Logged-out tab → paste `/verify?scanId=…` |
| **Say** | “Executive PDF for the board, CycloneDX CBOM for ServiceNow or Archer, signed report hash. Auditors verify independently — no Qtangl account. Inventory aid, not a penetration test or formal CMMC attestation.” |

---

## Act 2 — Live scan proof (4:30–5:30)

Skip if live scan disabled in production.

### Shot 10 — Reset to live intent (4:30–4:50)

| | |
|---|---|
| **Scroll** | Top of scanner — click **New assessment** if wizard is collapsed |
| **Click** | Intent card **Try a real live scan** |
| **Click** | Button **Scan test.openquantumsafe.org** |
| **Say** | “That was a fixture for a clean story. Now the same engine on a real endpoint — the Open Quantum Safe public test server. Your pilot scans your authorized domains; this proves live TLS inventory.” |

### Shot 11 — Live wizard (4:50–5:15)

| | |
|---|---|
| **Wizard** | Step **1. Live target** — confirm `test.openquantumsafe.org` |
| **Click** | **Next: Scope** → **Next: Run** |
| **Check** | Authorization checkbox |
| **Click** | **Run Q-Day scan** |
| **Wait for** | **Executive** tab (live scan may take 30–90s) |
| **Say** | “Real network scan — same report pack, same verify path.” |

### Shot 12 — Live technical beat (5:15–5:30)

| | |
|---|---|
| **Tab** | **Technical** — handshake proof if populated |
| **Say** | “OQS maintains this host for post-quantum TLS experimentation — credible technical audience.” |

---

## Act 3 — Close + Monitor (5:30–6:00)

### Shot 13 — Monitor upsell (5:30–5:50)

| | |
|---|---|
| **Scroll** | Below results: **Drift since last scan**, **Readiness trend** |
| **Click** | **Run comparison scan** (optional — only if time) |
| **Click** | **Request Monitor pilot** |
| **Say** | “One scan is a snapshot. Crypto drifts monthly — new services, cert rotations, vendor changes. Monitor adds scheduled re-scans, drift alerts, and remediation tracking.” |

### Shot 14 — CTA (5:50–6:00)

| | |
|---|---|
| **Click** | **Request Monitor pilot** → `/access` (or mention `/assess/start` for self-serve baseline) |
| **Say** | “Start an authorized baseline at assess/start, or request a pilot for your domains. This is the product — qtangl.com/assess.” |

---

## Cut-down variants (edit from same session)

| Asset | Length | Keep shots |
|-------|--------|------------|
| **Email teaser** | 90s | 1, 2, 3 (score only), 9 (verify), 14 |
| **LinkedIn** | 60s | Hook + autorun score + verify link |
| **Gov CMMC** | 3 min | Replace URL with `?scenario=gov-contractor-cmmc&autorun=1`; shots 3–5, 9 |
| **Healthcare HNDL** | 3 min | `?scenario=healthcare-insurer-hndl&autorun=1`; emphasize Mosca shot 4 |
| **Auditor-only** | 2 min | Shot 9 only — Evidence + `/verify` logged out |
| **Monitor upsell** | 4 min | Two autoruns or dashboard diff + shot 13 |

---

## Tab & button cheat sheet

| UI label | Location |
|----------|----------|
| **Executive** / **Compliance** / **Inventory** / **Remediation** / **Technical** / **Evidence** | Results tab bar |
| **Run bank sample now** | Intent picker, sample intent |
| **Scan test.openquantumsafe.org** | Intent picker, live-demo intent |
| **Next: Scope** / **Next: Run** | Wizard steps |
| **Run Q-Day scan** | Final wizard step |
| **Export CSV** | Inventory tab |
| **PDF** / **CBOM** / **Board** | Evidence tab |
| **Copy share link** | Evidence tab |
| **Request Monitor pilot** | Upsell block |
| **New assessment** | Collapsed wizard bar |

---

## Follow-up email (paste after send)

- Video link (Loom)
- Autorun link: `https://www.qtangl.com/assess?scenario=bank-tls-inventory&autorun=1`
- Sample CBOM: `https://www.qtangl.com/samples/sample-cbom-bank-tls-inventory.json`
- Mini-assessment: `https://www.qtangl.com/assess/mini`
- Pilot: `https://www.qtangl.com/access?interest=Q-Day%20Monitor%20(annual)&source=loom-hero`

---

## Related docs

- [ciso-readout-guide.md](./ciso-readout-guide.md) — 45 min live call agenda
- [e1-launch-checklist.md](./e1-launch-checklist.md) — persona script validation table
- [outreach/README.md](./outreach/README.md) — vertical autorun URLs for cut-downs
