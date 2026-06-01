export const executiveBriefingCopy = {
  metadata: {
    title: "Q-Day Executive Briefing",
    description:
      "Four-page board briefing on post-quantum readiness — Mosca inequality, deadlines, and what Qtangl delivers.",
  },
  hero: {
    eyebrow: "Executive briefing",
    title: "Q-Day readiness for boards and CISOs",
    description:
      "Mosca framing, compliance deadlines, exposure ranges, and the Assess → Monitor → Convert motion — with honest scope.",
  },
  gate: {
    title: "Download the briefing",
    description:
      "Name, title, and work email unlock the printable briefing and markdown download. No mailing lists.",
    submitLabel: "Unlock briefing",
    pendingLabel: "Unlocking…",
  },
  downloadPath: "/downloads/q-day-executive-briefing.md",
  sections: [
    {
      title: "The board question has changed",
      body: "Directors want RSA/ECDSA exposure counts, HNDL quantification, and proof that remediation is tracked — not a one-time spreadsheet that decays on first deploy.",
    },
    {
      title: "Mosca's inequality",
      body: "X + Y > Z: data lifetime plus migration time exceeds adversary capability. Long-lived secrets and archived ciphertext mean exposure today is liability tomorrow.",
    },
    {
      title: "Regulatory clocks",
      body: "PCI-DSS 4.0, CMMC 2.0, NIST IR 8547, and CNSA 2.0/NSM-10 create overlapping deadlines from 2025 through 2035. Inventory now; migrate on your tier.",
    },
    {
      title: "What Qtangl delivers",
      body: "Assess: baseline scan, CBOM, signed PDF. Monitor: scheduled re-scans, drift alerts, remediation board. Convert: playbooks, what-if projections, re-scan proof. Inventory aid — not formal attestation.",
    },
  ],
  upsell: {
    primary: { label: "Run Q-Day scan", href: "/demo/pqc" },
    secondary: { label: "Free mini-assessment", href: "/assess/mini" },
    tertiary: { label: "Request pilot access", href: "/access?interest=Enterprise%20PQC%20program&source=executive-briefing" },
  },
} as const;
