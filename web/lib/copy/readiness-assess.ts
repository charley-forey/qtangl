export const assessPageCopy = {
  metadata: {
    title: "Q-Day Assessment",
    description:
      "Baseline quantum-vulnerable cryptography with live scans, Mosca HNDL risk, CBOM exports, and signed PDF reports.",
  },
  hero: {
    eyebrow: "Assess",
    title: "Baseline your crypto in one session",
    description:
      "Scan external-facing TLS, map algorithms to NSM-10 and NIST IR 8547, and export evidence your board can review.",
    actions: [
      { href: "/demo/pqc", label: "Run live scan" },
      { href: "/docs/guides/pqc-demo", label: "API guide", variant: "secondary" as const },
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
    description: "Pre-loaded demo targets for banking, government, and healthcare readiness workflows.",
    items: [
      { label: "Bank TLS inventory", href: "/demo/pqc?scenario=bank-tls-inventory" },
      { label: "Gov contractor CMMC", href: "/demo/pqc?scenario=gov-contractor-cmmc" },
      { label: "Healthcare HNDL", href: "/demo/pqc?scenario=healthcare-insurer-hndl" },
    ],
  },
  cta: {
    title: "Start with a live scan",
    description: "No account required for the demo. Request pilot access for your production domains.",
    primary: { label: "Run Q-Day scan", href: "/demo/pqc" },
    secondary: { label: "Request pilot", href: "/access" },
  },
} as const;
