export const assessPageCopy = {
  metadata: {
    title: "Q-Day Assessment",
    description:
      "Baseline quantum-vulnerable cryptography with live scans, Mosca HNDL risk, and CBOM exports — mapped to NSM-10, CNSA 2.0, NIST IR 8547, PCI-DSS 4.0, and CMMC, with signed PDF reports your auditors can verify.",
  },
  hero: {
    eyebrow: "Assess",
    title: "Baseline your crypto in one session",
    description:
      "Scan external-facing TLS, map algorithms to NSM-10 and NIST IR 8547, and export evidence your board can review.",
    actions: [
      { href: "#scanner", label: "Start assessment" },
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
    description: "Pre-loaded targets for banking, government, and healthcare readiness workflows.",
    items: [
      { label: "Bank TLS inventory", href: "/assess?scenario=bank-tls-inventory" },
      { label: "Gov contractor CMMC", href: "/assess?scenario=gov-contractor-cmmc" },
      { label: "Healthcare HNDL", href: "/assess?scenario=healthcare-insurer-hndl" },
    ],
  },
  cta: {
    title: "Start with a live scan",
    description: "No account required for the public scanner. Request pilot access for production domains.",
    primary: { label: "Run Q-Day scan", href: "#scanner" },
    secondary: { label: "Request pilot", href: "/access" },
  },
} as const;
