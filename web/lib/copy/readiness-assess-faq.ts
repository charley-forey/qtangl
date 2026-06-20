import { OQS_DEMO_HOST } from "@/lib/assess-config";

export const assessFaqItems = [
  {
    question: "Is this a formal attestation or audit?",
    answer:
      "No. Assess is an inventory aid that maps quantum-vulnerable cryptography to frameworks your auditors cite. Export signed PDF and CBOM evidence — auditors verify independently at /verify.",
  },
  {
    question: "What domains can I scan?",
    answer:
      "Sample scenarios run offline with fictional domains — no URL needed. Public live demos may only target approved hosts like test.openquantumsafe.org. Your production domains require an authorized workspace at /assess/start or a pilot at /access.",
  },
  {
    question: "How is evidence verified?",
    answer:
      "Every report is signed (PQ-capable). Share the verify link or use the offline qtangl-verify CLI. Transparency log receipts are listed on /trust.",
  },
  {
    question: "What is the difference between Assess and Monitor?",
    answer:
      "Assess is a one-session baseline. Monitor schedules re-scans, detects drift, and tracks remediation until Q-Day.",
  },
  {
    question: "How long are PEM uploads retained?",
    answer:
      "Certificate bundle and cloud inventory uploads are deleted within 24 hours per our data retention policy. See /trust and Terms for full retention schedules.",
  },
  {
    question: "Are there signup or scan rate limits?",
    answer:
      "Self-serve Assess signup is rate-limited per email domain to prevent abuse. Production scan endpoints enforce per-tenant quotas documented in /docs/guides/assess.",
  },
  {
    question: "Where can I learn more about Q-Day risk?",
    answer:
      "Start with the Q-Day education hub at /q-day — Mosca inequality, HNDL exposure, and framework guides for banking, healthcare, and government.",
  },
] as const;

export const assessHowItWorks = [
  { step: 1, title: "Choose your path", detail: "Sample report (no setup), OQS live demo, or authorized workspace for your domain." },
  { step: 2, title: "Run baseline", detail: `Fixture scenarios offline, or live TLS/JWKS/SSH discovery on ${OQS_DEMO_HOST} or your allowlisted domain.` },
  { step: 3, title: "Review findings", detail: "Readiness score, Mosca HNDL timeline, framework mapping, and remediation backlog." },
  { step: 4, title: "Export evidence", detail: "PDF, CycloneDX CBOM, and public verify link for auditors and the board." },
] as const;

export const assessTrustSignals = [
  { label: "PQ-signed reports", href: "/trust" },
  { label: "Transparency log", href: "/trust" },
  { label: "Offline verify", href: "/verify" },
  { label: "Methodology", href: "/assess/methodology" },
  { label: "Q-Day hub", href: "/q-day" },
] as const;
