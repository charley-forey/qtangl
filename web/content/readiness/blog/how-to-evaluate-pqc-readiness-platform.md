---
title: "How to evaluate a PQC readiness platform"
description: "RFP checklist for CISOs — discovery depth, evidence, drift, CBOM, Mosca HNDL, and mid-market fit."
keyword: "evaluate PQC readiness platform"
journeyStage: assess
hubLink: "/compare"
hubLabel: "Vendor comparison hub"
ctaPrimary: "/assess"
datePublished: "2026-06-09"
eyebrow: "Buyer's guide"
intro: "Board mandates for PQC inventory create noisy vendor shortlists. Use this checklist to separate discovery theater from evidence your auditors can verify."
sourceIds: [nist-ir-8547, nsm-10, mosca-inequality]
---

## RFP checklist (copy into your evaluation)

### Discovery

- [ ] Agentless external scan (TLS, JWKS, SSH, email STARTTLS)
- [ ] Host/endpoint depth (if required for your estate)
- [ ] Source-code/binary scan (if dev-heavy portfolio)
- [ ] KMS/key-store coverage
- [ ] Honest statement of blind spots per method

### Evidence (the moat)

- [ ] CycloneDX CBOM export
- [ ] **Signed reports** with post-quantum or modern signatures
- [ ] **Public verify link** — auditors check without vendor login
- [ ] Transparency log or tamper-evident inclusion proof
- [ ] Offline verify spec or CLI

### Ongoing program

- [ ] Scheduled re-scans and **drift diff**
- [ ] Mosca HNDL / shelf-life scoring for boards
- [ ] Remediation workflow with re-scan proof
- [ ] Framework mapping (NSM-10, CNSA 2.0, CMMC, PCI-DSS 4)

### Commercial fit

- [ ] Mid-market packaging and transparent pricing band
- [ ] Self-serve or pilot path without six-month sales cycle
- [ ] Coopetition story — layers onto CLM/discovery incumbents

## Red flags

- One-time PDF with no drift story
- Dashboard-only proof auditors cannot verify independently
- Claiming full-estate coverage from a single discovery method
- No CBOM — proprietary inventory only

## Compare vendors side by side

Use the [full landscape matrix](/compare) and individual [Qtangl vs vendor](/compare) pages. Download the [comparison guide PDF](/compare#guide).
