export const assessFaqItems = [
  {
    question: "Is this a formal attestation or audit?",
    answer:
      "No. Assess is an inventory aid that maps quantum-vulnerable cryptography to frameworks your auditors cite. Export signed PDF and CBOM evidence — auditors verify independently at /verify.",
  },
  {
    question: "What domains can I scan?",
    answer:
      "Fixture scenarios run without outbound network access. Live scans require your authorization and target domains you own or have written permission to test.",
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
] as const;

export const assessHowItWorks = [
  { step: 1, title: "Pick scenario", detail: "Bank, government CMMC, or healthcare HNDL fixture." },
  { step: 2, title: "Set target", detail: "Use scenario domain or authorize a live external scan." },
  { step: 3, title: "Run baseline", detail: "External TLS, JWKS, SSH, and email discovery." },
  { step: 4, title: "Export evidence", detail: "PDF, CycloneDX CBOM, and public verify link." },
] as const;

export const assessTrustSignals = [
  { label: "PQ-signed reports", href: "/trust" },
  { label: "Transparency log", href: "/trust" },
  { label: "Offline verify", href: "/verify" },
  { label: "Methodology", href: "/assess/methodology" },
] as const;
