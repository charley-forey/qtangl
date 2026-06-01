export type SolutionPageCopy = {
  slug: string;
  metadata: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    scenarioHref: string;
    scenarioLabel: string;
  };
  why: { eyebrow: string; title: string; bullets: readonly string[] };
  frameworks: { eyebrow: string; title: string; items: readonly { name: string; relevance: string }[] };
  value: { eyebrow: string; title: string; rows: readonly { pain: string; value: string }[] };
  demo: { eyebrow: string; title: string; steps: readonly string[] };
  cta: {
    title: string;
    description: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
};

export const solutionsCopy = {
  index: {
    metadata: {
      title: "Industry Solutions",
      description:
        "Post-quantum readiness playbooks for banking, government contractors, and healthcare payers.",
    },
    hero: {
      eyebrow: "Solutions",
      title: "Readiness by industry",
      description:
        "Pre-built scenarios, framework mappings, and demo workflows for regulated verticals.",
    },
    items: [
      {
        slug: "banking",
        title: "Banking & financial services",
        description: "TLS inventory, PCI-DSS 4.0 crypto agility, and HNDL on long-lived financial data.",
        href: "/solutions/banking",
      },
      {
        slug: "government",
        title: "Government & defense",
        description: "CMMC crypto controls, NSM-10, CNSA 2.0, and prime flow-down evidence.",
        href: "/solutions/government",
      },
      {
        slug: "healthcare",
        title: "Healthcare payers",
        description: "HIPAA crypto evidence, decades-long HNDL exposure, and audit-ready reports.",
        href: "/solutions/healthcare",
      },
    ],
  },
  banking: {
    slug: "banking",
    metadata: {
      title: "Banking & Financial Services",
      description:
        "Post-quantum readiness for regional banks and insurers — TLS inventory, PCI-DSS 4.0, and Mosca HNDL scoring.",
    },
    hero: {
      eyebrow: "Banking",
      title: "TLS inventory your examiners expect",
      description:
        "Map external-facing crypto across APIs, portals, and email. Quantify HNDL on long-lived financial data with signed evidence.",
      scenarioHref: "/demo/pqc?scenario=bank-tls-inventory",
      scenarioLabel: "Run bank TLS scenario",
    },
    why: {
      eyebrow: "Why banking",
      title: "Board and regulator attention is here",
      bullets: [
        "PCI-DSS 4.0 emphasizes crypto agility and inventory.",
        "Financial data shelf-life drives high HNDL exposure.",
        "No central inventory across TLS, JWKS, SSH, and email STARTTLS.",
      ],
    },
    frameworks: {
      eyebrow: "Frameworks",
      title: "What auditors map to",
      items: [
        { name: "PCI-DSS 4.0", relevance: "Crypto agility and inventory expectations" },
        { name: "NIST CSF", relevance: "Risk governance and emerging threat programs" },
        { name: "NIST IR 8547 / CNSA 2.0", relevance: "Migration timeline alignment" },
      ],
    },
    value: {
      eyebrow: "Value",
      title: "From spreadsheet to system of record",
      rows: [
        { pain: "Spreadsheet inventory misses keys", value: "Full scan: TLS, JWKS, SSH, email STARTTLS" },
        { pain: "HNDL on long-lived financial data", value: "Mosca timeline quantifies exposure" },
        { pain: "PCI/exam evidence", value: "Framework-mapped signed reports + /verify" },
        { pain: "One scan is not enough", value: "Monitor tier catches crypto drift" },
      ],
    },
    demo: {
      eyebrow: "Demo flow",
      title: "What to show a CISO",
      steps: [
        "bank-tls-inventory scenario scan",
        "Mosca HNDL on financial data shelf-life",
        "PCI-DSS 4.0 mapping in compliance pack",
        "Signed PDF → /verify for assessor",
      ],
    },
    cta: {
      title: "Start with a bank TLS assessment",
      description: "Run the pre-loaded scenario or request a pilot for your production domains.",
      primary: { label: "Run bank scenario", href: "/demo/pqc?scenario=bank-tls-inventory" },
      secondary: { label: "Request pilot", href: "/access" },
    },
  },
  government: {
    slug: "government",
    metadata: {
      title: "Government & Defense Contractors",
      description:
        "CMMC crypto inventory, NSM-10 alignment, CNSA 2.0 tiers, and signed evidence for defense contractors.",
    },
    hero: {
      eyebrow: "Government & defense",
      title: "CMMC-ready crypto evidence",
      description:
        "Inventory quantum-vulnerable algorithms, map to CMMC Level 2 controls, and prove migration progress with signed verify links.",
      scenarioHref: "/demo/pqc?scenario=gov-contractor-cmmc",
      scenarioLabel: "Run CMMC scenario",
    },
    why: {
      eyebrow: "Why defense contractors",
      title: "Contract eligibility depends on crypto posture",
      bullets: [
        "NSM-10 and CNSA 2.0 set federal migration clocks.",
        "CMMC 2.0 enforcement requires crypto inventory evidence.",
        "Prime flow-down clauses demand fast inventory and roadmap.",
      ],
    },
    frameworks: {
      eyebrow: "Frameworks",
      title: "What ISSOs track",
      items: [
        { name: "NSM-10", relevance: "Federal PQC migration mandate (2035)" },
        { name: "CNSA 2.0", relevance: "NSA suite and deadline tiers" },
        { name: "CMMC 2.0 Level 2", relevance: "Crypto inventory for DIB audits" },
        { name: "NIST SP 800-208", relevance: "Code and firmware signing (SLH-DSA)" },
      ],
    },
    value: {
      eyebrow: "Value",
      title: "Evidence, not attestation",
      rows: [
        { pain: "CMMC crypto evidence gap", value: "Framework-mapped report + signed verify" },
        { pain: "Firmware signing exposure", value: "SLH-DSA remediation guidance" },
        { pain: "Prime flow-down pressure", value: "Fast inventory + prioritized backlog" },
        { pain: "Audit cycle drift", value: "Monitor re-scans between assessments" },
      ],
    },
    demo: {
      eyebrow: "Demo flow",
      title: "What to show an ISSO",
      steps: [
        "gov-contractor-cmmc scenario scan",
        "CMMC control mapping in compliance pack",
        "CNSA 2.0 deadline tier alignment",
        "Signed PDF → /verify for assessor",
      ],
    },
    cta: {
      title: "Start with a CMMC inventory",
      description: "We provide crypto inventory evidence — not formal CMMC certification.",
      primary: { label: "Run CMMC scenario", href: "/demo/pqc?scenario=gov-contractor-cmmc" },
      secondary: { label: "Request pilot", href: "/access" },
    },
  },
  healthcare: {
    slug: "healthcare",
    metadata: {
      title: "Healthcare Payers & Providers",
      description:
        "HIPAA crypto controls, HNDL on lifetime health records, and PQC scans with no PHI processed.",
    },
    hero: {
      eyebrow: "Healthcare",
      title: "HNDL is the headline",
      description:
        "Health records live for decades — Mosca inequality almost always holds. Inventory TLS paths without processing PHI.",
      scenarioHref: "/demo/pqc?scenario=healthcare-insurer-hndl",
      scenarioLabel: "Run healthcare scenario",
    },
    why: {
      eyebrow: "Why healthcare",
      title: "Lifetime data shelf-life drives urgency",
      bullets: [
        "PHI confidentiality obligations span decades — highest HNDL exposure.",
        "Crypto sprawls across portals, APIs, EDI, and email.",
        "HIPAA audits need crypto control evidence, not verbal assurance.",
      ],
    },
    frameworks: {
      eyebrow: "Frameworks",
      title: "What privacy officers map to",
      items: [
        { name: "HIPAA Security Rule", relevance: "Encryption and crypto control evidence" },
        { name: "NIST IR 8547", relevance: "PQC transition guidance" },
        { name: "EU CRA", relevance: "Connected med-tech (if applicable)" },
      ],
    },
    value: {
      eyebrow: "Value",
      title: "Inventory without PHI in scope",
      rows: [
        { pain: "Long-lived PHI + HNDL", value: "Mosca timeline makes exposure undeniable" },
        { pain: "HIPAA crypto evidence", value: "Framework-mapped signed reports" },
        { pain: "Sprawling endpoints", value: "Full scan + cloud inventory import" },
        { pain: "Audit cycles", value: "Monitor drift + reusable evidence" },
      ],
    },
    demo: {
      eyebrow: "Demo flow",
      title: "What to show a healthcare CISO",
      steps: [
        "healthcare-insurer-hndl scenario scan",
        "HNDL/Mosca on decades-long data shelf-life",
        "HIPAA control mapping",
        "Signed evidence — no PHI in scan",
      ],
    },
    cta: {
      title: "Start with a healthcare assessment",
      description: "PQC scans are TLS/crypto inventory only — no PHI is processed. No BAA required for inventory.",
      primary: { label: "Run healthcare scenario", href: "/demo/pqc?scenario=healthcare-insurer-hndl" },
      secondary: { label: "Request pilot", href: "/access" },
    },
  },
} as const;

export type SolutionSlug = "banking" | "government" | "healthcare";

export function getSolutionCopy(slug: string): SolutionPageCopy | null {
  if (slug === "banking" || slug === "government" || slug === "healthcare") {
    return solutionsCopy[slug];
  }
  return null;
}
