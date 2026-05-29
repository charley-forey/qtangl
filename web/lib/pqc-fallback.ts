import type { Scenario } from "@/lib/pqc";

export const FALLBACK_SCENARIOS: Scenario[] = [
  {
    id: "bank-tls-inventory",
    title: "Regional bank TLS inventory",
    summary:
      "Board mandate to inventory RSA/ECDSA exposure across customer-facing TLS before 2030 NIST deadlines.",
    target: {
      domain: "api.regionalbank.example",
      ports: [443, 8443],
      persona: "CISO, regional bank",
      organization: "Regional Bank Holdings",
      mandate: "NSM-10 / NIST IR 8547 PQC migration program",
    },
    manual_baseline: {
      inventory_weeks: 8,
      assets_found: 42,
      quantum_vulnerable: 38,
      readiness_score: 18,
      summary: "Spreadsheet inventory from Q1 is already stale; shadow APIs were missed.",
    },
    fixture_asset_ids: [],
  },
  {
    id: "gov-contractor-cmmc",
    title: "Gov contractor CMMC readiness",
    summary: "FedRAMP/CMMC assessor requires cryptographic inventory with remediation backlog.",
    target: {
      domain: "portal.defense-prime.example",
      ports: [443, 22],
      persona: "Compliance lead, defense contractor",
      organization: "Defense Prime Integrator",
      mandate: "CMMC Level 2 / CNSA 2.0 alignment",
    },
    manual_baseline: {
      inventory_weeks: 6,
      assets_found: 28,
      quantum_vulnerable: 24,
      readiness_score: 22,
      summary: "Manual SSP spreadsheet; no JWKS or SSH host key coverage.",
    },
    fixture_asset_ids: [],
  },
  {
    id: "healthcare-insurer-hndl",
    title: "Healthcare insurer HNDL exposure",
    summary: "Stress-test harvest-now-decrypt-later risk on long-retained PHI transport encryption.",
    target: {
      domain: "member.healthshield.example",
      ports: [443, 25, 993],
      persona: "CISO, healthcare insurer",
      organization: "HealthShield Mutual",
      mandate: "HIPAA + board Q-Day readiness",
    },
    manual_baseline: {
      inventory_weeks: 10,
      assets_found: 55,
      quantum_vulnerable: 51,
      readiness_score: 15,
      summary: "Third-party email and legacy signing keys not in last inventory cycle.",
    },
    fixture_asset_ids: [],
  },
];
