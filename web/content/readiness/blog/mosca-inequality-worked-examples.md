---
title: "Mosca inequality worked examples by industry"
description: "Apply X + Y > Z to healthcare, banking, and government data — when HNDL exposure opens before migration finishes."
keyword: "Mosca inequality examples"
journeyStage: assess
hubLink: "/q-day/mosca-inequality"
hubLabel: "Mosca inequality guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Education"
intro: "Mosca's inequality turns harvest-now-decrypt-later into arithmetic. These industry examples show when the risk window is already open."
sourceIds: [mosca-inequality, postquantum-hndl-article, gqi-q-day-summary, nist-pqc-overview, video-mosca-public-lecture]
videoId: "vWP4LF2hz80"
videoTitle: "Michele Mosca Public Lecture: As We Enter a New Quantum Era"
---

## The formula

**X + Y > Z** means exposure when:

- **X** = years data must remain confidential
- **Y** = years to complete cryptographic migration
- **Z** = years until a CRQC breaks your algorithms

Source: [Global Risk Institute quantum threat timeline report](https://globalriskinstitute.org/publications/quantum-threat-timeline-report-2023/). See also [PostQuantum.com on HNDL](https://postquantum.com/quantum-security-reference/what-is-harvest-now-decrypt-later/).

Use the [interactive Mosca calculator](/q-day/mosca-inequality) with your assumptions.

## Worked examples

### Healthcare payer (25-year retention)

| Variable | Value | Rationale |
|----------|-------|-----------|
| X | 25 | Member records, claims archives |
| Y | 7 | Multi-vendor TLS, legacy EDI, partner BAA scope |
| Z | 12 | Mid-range planning estimate |
| **X + Y** | **32 > 12** | **Exposure now** |

### Regional bank (15-year transaction archives)

| Variable | Value | Rationale |
|----------|-------|-----------|
| X | 15 | Wire transfer and audit logs |
| Y | 5 | Core banking + vendor API dependencies |
| Z | 10 | Accelerated industry planning |
| **X + Y** | **20 > 10** | **Exposure now** |

### SaaS vendor (3-year contract data)

| Variable | Value | Rationale |
|----------|-------|-----------|
| X | 3 | Typical customer agreement horizon |
| Y | 4 | Full stack + customer-managed keys |
| Z | 10 | Conservative CRQC estimate |
| **X + Y** | **7 < 10** | Lower HNDL urgency — still migrate early |

Even when inequality "passes," migration takes years — [NIST](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography) recommends starting now.

## This quarter

1. Assign X per data class from legal retention schedules.
2. Estimate Y honestly — include third-party dependencies.
3. Document Z as a planning range, not a prediction ([GQI summary](https://quantumcomputingreport.com/q-day-accelerated-timeline-across-wider-attack-surface-executive-summary/)).
