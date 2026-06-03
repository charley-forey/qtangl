---
title: "CNSA 2.0 migration guide"
description: "NSA Commercial National Security Algorithm Suite 2.0 deadlines and Qtangl readiness mapping."
keyword: "CNSA 2.0 PQC"
journeyStage: assess
hubLink: "/q-day/frameworks/nsm-10"
hubLabel: "NSM-10 guide"
ctaPrimary: "/assess?scenario=gov-contractor-cmmc"
datePublished: "2026-06-03"
eyebrow: "NSA suite"
intro: "CNSA 2.0 defines approved algorithms and tiered deadlines for national security systems — 2030–2033 for most transitions."
sourceIds: [nsa-cnsa-2, nsm-10]
---

## Executive summary

The NSA Commercial National Security Algorithm Suite 2.0 (CNSA 2.0) replaces Suite B with quantum-resistant algorithm requirements for national security systems. ISSOs and defense contractors must map current algorithms to CNSA tiers and demonstrate migration progress.

## Deadline tiers

CNSA 2.0 sets phased deadlines through **2030–2033** depending on system classification and algorithm usage. Align inventory prioritization to earliest applicable tier — not NSM-10's 2035 horizon alone.

## Approved algorithms

CNSA 2.0 approves ML-KEM, ML-DSA, and SLH-DSA for applicable use cases. Inventory must identify systems still on RSA, ECDSA, or legacy DH.

## Authorization reviews

Systems seeking authorization to operate (ATO) or CMMC certification need evidence of crypto inventory and migration planning. Signed Qtangl reports with `/verify` support ISSO packages — inventory aid, not authorization decision.

## Qtangl mapping

Algorithm classification against CNSA tiers, deadline-tier backlog prioritization, re-scan verification after each migration phase.
