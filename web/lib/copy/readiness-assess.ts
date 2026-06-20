export const assessPageCopy = {
  metadata: {
    title: "Q-Day Assessment",
    description:
      "Baseline quantum-vulnerable cryptography with live scans, Mosca HNDL risk, and CBOM exports — mapped to NSM-10, CNSA 2.0, NIST IR 8547, PCI-DSS 4.0, and CMMC, with signed PDF reports your auditors can verify.",
  },
  hero: {
    eyebrow: "Q-Day readiness",
    title: "Baseline your crypto in one session",
    description:
      "See a sample report in one click, try a live scan on the Open Quantum Safe test server, or authorize your own domains for a production baseline.",
    actions: [
      { href: "/assess?scenario=bank-tls-inventory&autorun=1", label: "See sample bank report" },
      { href: "/assess/start", label: "Scan my domain", variant: "secondary" as const },
    ],
  },
  features: {
    eyebrow: "What you get",
    title: "Assessment deliverables",
    items: [
      {
        title: "Live domain scan",
        description: "TLS handshake inventory with algorithm and key-size classification.",
      },
      {
        title: "Mosca HNDL timeline",
        description: "Harvest-now-decrypt-later exposure scored against your data retention horizon.",
      },
      {
        title: "CycloneDX CBOM",
        description: "Machine-readable crypto bill of materials for your CMDB and GRC tools.",
      },
      {
        title: "Signed executive PDF",
        description: "Board-ready summary with an independent verify link.",
      },
    ],
  },
  scenarios: {
    eyebrow: "Scenarios",
    title: "Try a regulated scenario",
    description: "Pre-loaded fixture targets for banking, government, and healthcare readiness workflows — no domain required.",
    items: [
      { label: "Bank TLS inventory", href: "/assess?scenario=bank-tls-inventory&autorun=1" },
      { label: "Gov contractor CMMC", href: "/assess?scenario=gov-contractor-cmmc&autorun=1" },
      { label: "Healthcare HNDL", href: "/assess?scenario=healthcare-insurer-hndl&autorun=1" },
    ],
  },
  cta: {
    title: "Ready for your own domains?",
    description:
      "Self-serve Assess workspace includes 5 scans per month and domain allowlisting. Sales-led pilots cover multi-domain estates and Monitor onboarding.",
    primary: { label: "Start authorized workspace", href: "/assess/start" },
    secondary: { label: "Request pilot", href: "/access" },
  },
} as const;
