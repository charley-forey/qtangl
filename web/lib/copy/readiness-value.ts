export const valueProofItems = [
  {
    title: "Signed evidence",
    description:
      "Every report ships with a content hash and signature — auditors verify at /verify without trusting Qtangl alone.",
  },
  {
    title: "Continuous drift",
    description:
      "Monitor diffs each scan against the last baseline so regressions surface before the next audit cycle.",
  },
  {
    title: "Honest scope",
    description:
      "Inventory aid and prioritization — not a formal attestation. We say what we do and do not claim.",
  },
  {
    title: "Minutes, not months",
    description:
      "Live fixture scan in under ten minutes. Compare that to spreadsheet programs that decay on first deploy.",
  },
] as const;

export const whyQtanglDifferentiators = [
  {
    title: "Evidence-first delivery",
    description:
      "Signed PDF, CycloneDX CBOM, and independent verify links — built for GRC workflows, not slide decks.",
  },
  {
    title: "Drift as the product",
    description:
      "One-time assessments satisfy this quarter's board ask. Monitor turns inventory into a living system of record.",
  },
  {
    title: "Framework-native mapping",
    description:
      "NSM-10, CNSA 2.0, NIST IR 8547, PCI-DSS 4, and CMMC crosswalks on every finding — not a generic risk score.",
  },
  {
    title: "Mid-market velocity",
    description:
      "Self-serve demo, pilot in days, and pricing that fits security teams without a six-figure consulting SOW.",
  },
] as const;

export const miniAssessmentCopy = {
  metadata: {
    title: "Free Mini-Assessment",
    description:
      "Instant readiness score and top five findings from a fixture scan — work email required. Upgrade to a live Assess for full CBOM.",
  },
  hero: {
    eyebrow: "Free mini-assessment",
    title: "Your Q-Day exposure in 60 seconds",
    description:
      "See a sample readiness score and prioritized findings from a regulated banking scenario — then run a live scan on your domains.",
  },
  gate: {
    title: "Unlock your mini-assessment",
    description:
      "Work email only. We use it to follow up if you want a live Assess — no mailing lists.",
    submitLabel: "Show my results",
    pendingLabel: "Loading results…",
  },
  results: {
    eyebrow: "Sample results — bank TLS scenario",
    readinessScore: 58,
    readinessBand: "At risk",
    coverageConfidence: 68,
    targetDomain: "api.regionalbank.example",
    honesty:
      "Fixture-only preview. Authorize a live scan for your production domains and a signed CBOM export.",
  },
  selector: {
    eyebrow: "Pick your industry",
    label: "Choose the scenario closest to your environment for a tailored sample.",
  },
  upsell: {
    primary: { label: "Start authorized workspace", href: "/assess/start" },
    secondary: {
      label: "Request a Monitor pilot",
      href: "/access?interest=Q-Day%20Monitor%20(annual)&source=mini-assessment",
    },
    tertiary: { label: "Download sample CBOM", href: "/samples/sample-cbom-bank-tls-inventory.json" },
  },
} as const;

export type MiniAssessmentFinding = {
  rank: number;
  title: string;
  severity: "critical" | "high" | "medium";
  algorithm: string;
  framework: string;
};

export const miniAssessmentFindings: MiniAssessmentFinding[] = [
  {
    rank: 1,
    title: "Release artifact code signing (RSA-4096)",
    severity: "critical",
    algorithm: "RSA",
    framework: "NSM-10 · CNSA 2.0",
  },
  {
    rank: 2,
    title: "Customer API TLS (RSA-2048 certificate)",
    severity: "high",
    algorithm: "RSA / ECDSA",
    framework: "PCI-DSS 4 · NIST IR 8547",
  },
  {
    rank: 3,
    title: "JWKS endpoint (ECDSA P-256 signing)",
    severity: "high",
    algorithm: "ECDSA",
    framework: "NIST IR 8547",
  },
  {
    rank: 4,
    title: "Internal mTLS mesh (RSA-2048)",
    severity: "medium",
    algorithm: "RSA",
    framework: "CMMC · CNSA 2.0",
  },
  {
    rank: 5,
    title: "Email STARTTLS (RSA key exchange)",
    severity: "medium",
    algorithm: "RSA",
    framework: "HIPAA · NIST IR 8547",
  },
];

export type MiniAssessmentScenario = {
  id: "bank" | "gov" | "healthcare";
  label: string;
  eyebrow: string;
  interest: string;
  monitorPitch: string;
  results: {
    readinessScore: number;
    readinessBand: string;
    coverageConfidence: number;
    targetDomain: string;
  };
  findings: MiniAssessmentFinding[];
};

export const miniAssessmentScenarios: MiniAssessmentScenario[] = [
  {
    id: "bank",
    label: "Banking",
    eyebrow: "Sample results — bank TLS scenario",
    interest: "Q-Day Assessment (one-time)",
    monitorPitch:
      "With Monitor, a new RSA-2048 endpoint or certificate downgrade surfaces before your next PCI-DSS assessment — not after.",
    results: {
      readinessScore: 58,
      readinessBand: "At risk",
      coverageConfidence: 68,
      targetDomain: "api.regionalbank.example",
    },
    findings: miniAssessmentFindings,
  },
  {
    id: "gov",
    label: "Government / defense",
    eyebrow: "Sample results — gov contractor CMMC scenario",
    interest: "Enterprise PQC program",
    monitorPitch:
      "Monitor tracks CNSA 2.0 and CMMC drift between assessment cycles, so primes see continuous evidence — not a stale snapshot.",
    results: {
      readinessScore: 51,
      readinessBand: "At risk",
      coverageConfidence: 64,
      targetDomain: "portal.defensecontractor.example",
    },
    findings: [
      {
        rank: 1,
        title: "Release artifact code signing (RSA-3072)",
        severity: "critical",
        algorithm: "RSA",
        framework: "CNSA 2.0 · CMMC",
      },
      {
        rank: 2,
        title: "CAC/PIV middleware TLS (RSA-2048)",
        severity: "high",
        algorithm: "RSA",
        framework: "NSM-10 · FIPS 140-3",
      },
      {
        rank: 3,
        title: "CUI transfer SFTP (RSA host key)",
        severity: "high",
        algorithm: "RSA",
        framework: "CMMC L2 · NIST IR 8547",
      },
      {
        rank: 4,
        title: "OIDC SSO JWKS (ECDSA P-256)",
        severity: "medium",
        algorithm: "ECDSA",
        framework: "NIST IR 8547",
      },
      {
        rank: 5,
        title: "Site-to-site VPN IKE (ECDH P-256)",
        severity: "medium",
        algorithm: "ECDH",
        framework: "CNSA 2.0",
      },
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    eyebrow: "Sample results — healthcare HNDL scenario",
    interest: "Q-Day Monitor (annual)",
    monitorPitch:
      "Long-retained PHI means harvest-now-decrypt-later risk compounds. Monitor proves your transit crypto keeps improving over time.",
    results: {
      readinessScore: 55,
      readinessBand: "At risk",
      coverageConfidence: 66,
      targetDomain: "portal.healthpayer.example",
    },
    findings: [
      {
        rank: 1,
        title: "PHI data exchange TLS (RSA-2048)",
        severity: "critical",
        algorithm: "RSA",
        framework: "HIPAA · NIST IR 8547",
      },
      {
        rank: 2,
        title: "HL7 / FHIR API TLS (ECDSA P-256)",
        severity: "high",
        algorithm: "ECDSA",
        framework: "HIPAA · HNDL",
      },
      {
        rank: 3,
        title: "Claims clearinghouse SFTP (RSA host key)",
        severity: "high",
        algorithm: "RSA",
        framework: "HIPAA",
      },
      {
        rank: 4,
        title: "Patient portal JWKS (RS256 signing)",
        severity: "medium",
        algorithm: "RSA",
        framework: "NIST IR 8547",
      },
      {
        rank: 5,
        title: "Email STARTTLS (RSA key exchange)",
        severity: "medium",
        algorithm: "RSA",
        framework: "HIPAA · NIST IR 8547",
      },
    ],
  },
];

export type ChecklistGroup = {
  title: string;
  items: string[];
};

export const cryptoAgilityChecklist: ChecklistGroup[] = [
  {
    title: "Inventory & visibility",
    items: [
      "Document all TLS endpoints exposed to the internet",
      "Inventory code-signing and artifact signing keys",
      "Map JWKS and OAuth/OIDC signing algorithms",
      "Catalog HSM and KMS key types and sizes",
      "Identify third-party SaaS with embedded legacy crypto",
    ],
  },
  {
    title: "Risk & deadlines",
    items: [
      "Apply Mosca inequality (X + Y > Z) to long-lived data",
      "Classify HNDL exposure for archived ciphertext",
      "Map findings to NSM-10 / CNSA 2.0 / NIST IR 8547 tiers",
      "Set internal migration milestones before regulatory deadlines",
      "Prioritize by data sensitivity, not alphabetically",
    ],
  },
  {
    title: "Migration & proof",
    items: [
      "Assign owners to every quantum-vulnerable finding",
      "Define hybrid TLS rollout plan (ML-KEM + legacy fallback)",
      "Require re-scan verification after each remediation sprint",
      "Export CycloneDX CBOM for CMDB and GRC ingestion",
      "Maintain signed evidence pack for each audit cycle",
    ],
  },
  {
    title: "Operations & monitoring",
    items: [
      "Schedule recurring crypto posture scans (not annual panic)",
      "Alert on new quantum-vulnerable endpoints after deploy",
      "Detect certificate and cipher suite regressions",
      "Track readiness score trend for board reporting",
      "Integrate drift alerts with Slack, email, or SIEM webhooks",
    ],
  },
];

export const checklistPageCopy = {
  metadata: {
    title: "Crypto Agility Checklist",
    description:
      "Twenty-point checklist for post-quantum readiness — inventory, deadlines, migration proof, and continuous monitoring.",
  },
  hero: {
    eyebrow: "Q-Day checklist",
    title: "20-point crypto agility checklist",
    description:
      "Use this as a self-audit worksheet — or automate each step with Qtangl Assess and Monitor.",
  },
  cta: {
    primary: { label: "Automate with Qtangl", href: "/assess" },
    secondary: { label: "Free mini-assessment", href: "/assess/mini" },
  },
} as const;

export const sampleCbomPath = "/samples/sample-cbom-bank-tls-inventory.json";
