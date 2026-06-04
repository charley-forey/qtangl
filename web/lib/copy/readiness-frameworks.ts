export type FrameworkGuide = {
  slug: string;
  metadata: { title: string; description: string };
  eyebrow: string;
  title: string;
  description: string;
  deadline: string;
  summary: string;
  whyItMatters: string;
  qtanglMapping: readonly string[];
  relatedScenarios: readonly { label: string; href: string }[];
  relatedArticles: readonly { label: string; href: string }[];
};

export const frameworkGuides: Record<string, FrameworkGuide> = {
  "nsm-10": {
    slug: "nsm-10",
    metadata: {
      title: "NSM-10 PQC Migration Guide",
      description:
        "National Security Memorandum 10 post-quantum cryptography requirements and how Qtangl maps inventory evidence.",
    },
    eyebrow: "Federal mandate",
    title: "NSM-10 compliance guide",
    description:
      "NSM-10 directs federal agencies and contractors to migrate away from quantum-vulnerable cryptography by 2035.",
    deadline: "2035",
    summary: "National Security Memorandum on post-quantum cryptography",
    whyItMatters:
      "Defense contractors and federal-adjacent SaaS must inventory crypto, plan migration, and evidence progress to primes and auditors.",
    qtanglMapping: [
      "Live TLS scan inventories RSA, ECDSA, and ECDH exposure",
      "Framework-mapped signed PDF with verify link",
      "Monitor tier tracks drift between audit cycles",
    ],
    relatedScenarios: [
      { label: "Gov contractor CMMC", href: "/assess?scenario=gov-contractor-cmmc" },
    ],
    relatedArticles: [
      { label: "Compliance deadlines", href: "/q-day/deadlines" },
      { label: "Government solutions", href: "/solutions/government" },
    ],
  },
  "cnsa-2.0": {
    slug: "cnsa-2.0",
    metadata: {
      title: "CNSA 2.0 Migration Guide",
      description: "NSA Commercial National Security Algorithm Suite 2.0 deadlines and Qtangl readiness mapping.",
    },
    eyebrow: "NSA suite",
    title: "CNSA 2.0 guide",
    description:
      "CNSA 2.0 defines approved algorithms and deadline tiers for national-security systems — 2030–2033 for most transitions.",
    deadline: "2030–2033",
    summary: "Commercial National Security Algorithm Suite 2.0",
    whyItMatters:
      "ISSOs must map current algorithms to CNSA tiers and prove migration progress before authorization reviews.",
    qtanglMapping: [
      "Algorithm classification against CNSA 2.0 tiers",
      "Deadline-tier prioritization in remediation backlog",
      "Re-scan verification after each migration phase",
    ],
    relatedScenarios: [
      { label: "Gov contractor CMMC", href: "/assess?scenario=gov-contractor-cmmc" },
    ],
    relatedArticles: [
      { label: "Compliance deadlines", href: "/q-day/deadlines" },
    ],
  },
  "nist-ir-8547": {
    slug: "nist-ir-8547",
    metadata: {
      title: "NIST IR 8547 Transition Guide",
      description: "NIST guidance for transitioning to post-quantum cryptography standards.",
    },
    eyebrow: "NIST transition",
    title: "NIST IR 8547 primer",
    description:
      "NIST IR 8547 provides transition guidance for migrating to FIPS 203/204/205 — target 2030 for most organizations.",
    deadline: "2030",
    summary: "Transitioning to post-quantum cryptography standards",
    whyItMatters:
      "The de facto North American transition roadmap — referenced by federal, healthcare, and financial frameworks.",
    qtanglMapping: [
      "Maps findings to NIST IR 8547 transition categories",
      "CBOM export for GRC toolchain integration",
      "Readiness score tracks transition progress over time",
    ],
    relatedScenarios: [
      { label: "Healthcare HNDL", href: "/assess?scenario=healthcare-insurer-hndl" },
      { label: "Bank TLS inventory", href: "/assess?scenario=bank-tls-inventory" },
    ],
    relatedArticles: [
      { label: "CycloneDX CBOM", href: "/q-day/cbom" },
    ],
  },
  "pci-dss-4": {
    slug: "pci-dss-4",
    metadata: {
      title: "PCI-DSS 4.0 Crypto Agility Guide",
      description: "PCI-DSS 4.0 cryptographic inventory and agility requirements for payment environments.",
    },
    eyebrow: "Payments",
    title: "PCI-DSS 4.0 crypto agility",
    description:
      "PCI-DSS 4.0 emphasizes crypto agility — knowing what algorithms you use and planning migration before assessors ask.",
    deadline: "2025–ongoing",
    summary: "Cryptographic agility and key management requirements",
    whyItMatters:
      "Regional banks and payment processors need inventory evidence for QSAs — not verbal assurance.",
    qtanglMapping: [
      "TLS + JWKS + email STARTTLS inventory",
      "PCI-DSS 4.0 control mapping in compliance pack",
      "Signed report for assessor review via /verify",
    ],
    relatedScenarios: [
      { label: "Bank TLS inventory", href: "/assess?scenario=bank-tls-inventory" },
    ],
    relatedArticles: [
      { label: "Banking solutions", href: "/solutions/banking" },
      { label: "Why spreadsheets fail", href: "/q-day/vs-spreadsheet" },
    ],
  },
  cmmc: {
    slug: "cmmc",
    metadata: {
      title: "CMMC Crypto Inventory Guide",
      description: "CMMC Level 2 cryptographic inventory evidence for defense contractors.",
    },
    eyebrow: "Defense",
    title: "CMMC crypto inventory",
    description:
      "CMMC 2.0 Level 2 requires evidence of cryptographic inventory and migration planning — enforcement 2026–2030.",
    deadline: "2026–2030",
    summary: "Federal contractor cryptographic inventory expectations",
    whyItMatters:
      "DIB contractors need CMMC-ready evidence for primes — inventory aid, not formal attestation.",
    qtanglMapping: [
      "CMMC control mapping in signed compliance pack",
      "Code signing exposure via SP 800-208 alignment",
      "Monitor drift alerts between assessment cycles",
    ],
    relatedScenarios: [
      { label: "Gov contractor CMMC", href: "/assess?scenario=gov-contractor-cmmc" },
    ],
    relatedArticles: [
      { label: "Government solutions", href: "/solutions/government" },
    ],
  },
  "ml-kem": {
    slug: "ml-kem",
    metadata: {
      title: "ML-KEM Migration Guide",
      description: "FIPS 203 ML-KEM hybrid TLS migration guide with Qtangl handshake proof.",
    },
    eyebrow: "FIPS 203",
    title: "ML-KEM migration guide",
    description:
      "FIPS 203 (ML-KEM) is the NIST-standardized key encapsulation mechanism for post-quantum TLS — available now.",
    deadline: "Available 2024",
    summary: "Module-Lattice-Based Key-Encapsulation Mechanism standard",
    whyItMatters:
      "Hybrid TLS (classical + ML-KEM) is the near-term migration path — teams need proof it works in production.",
    qtanglMapping: [
      "Hybrid ML-KEM handshake proof in demo and reports",
      "Per-asset playbook for load balancer rollout",
      "Re-scan verification after hybrid KEX deployment",
    ],
    relatedScenarios: [
      { label: "Run Q-Day scanner", href: "/assess" },
    ],
    relatedArticles: [
      { label: "Hybrid TLS proof", href: "/q-day/hybrid-tls" },
      { label: "PQ algorithms video companion", href: "/blog/video-companion-pq-algorithms-nist" },
    ],
  },
  "hipaa-hndl": {
    slug: "hipaa-hndl",
    metadata: {
      title: "HIPAA & HNDL for Healthcare Payers",
      description: "HIPAA quantum risk, long-lived PHI, and PQC inventory evidence for healthcare.",
    },
    eyebrow: "Healthcare",
    title: "HIPAA & harvest-now-decrypt-later",
    description:
      "Healthcare records with decades-long confidentiality requirements face HNDL exposure today — inventory under HIPAA security rule obligations.",
    deadline: "Risk analysis ongoing",
    summary: "HIPAA Security Rule and long data shelf-life",
    whyItMatters:
      "Payers and providers must identify threats to ePHI confidentiality — including future cryptanalytic advances — in risk analysis.",
    qtanglMapping: [
      "Healthcare scenario with Mosca HNDL scoring",
      "TLS inventory for member portals and BAA-covered APIs",
      "Monitor drift between compliance cycles",
    ],
    relatedScenarios: [
      { label: "Healthcare HNDL scenario", href: "/assess?scenario=healthcare-insurer-hndl" },
    ],
    relatedArticles: [
      { label: "Healthcare solutions", href: "/solutions/healthcare" },
      { label: "HNDL guide", href: "/q-day/hndl" },
    ],
  },
  "banking-hndl": {
    slug: "banking-hndl",
    metadata: {
      title: "Banking HNDL Guide",
      description: "Harvest-now-decrypt-later for regional banks — transaction archives, PCI-DSS agility, and Mosca scoring.",
    },
    eyebrow: "Banking",
    title: "Banking & harvest-now-decrypt-later",
    description:
      "Transaction archives and wire audit logs with 7–25 year shelf-life create present-day HNDL exposure when migration takes years.",
    deadline: "PCI-DSS 4.0 ongoing",
    summary: "Financial data shelf-life and crypto agility",
    whyItMatters:
      "Regional banks need inventory evidence for QSAs and boards — Mosca inequality often holds for transaction retention policies.",
    qtanglMapping: [
      "Bank TLS inventory scenario with HNDL scoring",
      "PCI-DSS 4.0 control mapping in compliance pack",
      "CBOM export for GRC integration",
    ],
    relatedScenarios: [
      { label: "Bank TLS inventory", href: "/assess?scenario=bank-tls-inventory" },
    ],
    relatedArticles: [
      { label: "Banking solutions", href: "/solutions/banking" },
      { label: "HNDL hub", href: "/q-day/hndl" },
      { label: "Banking HNDL blog", href: "/blog/hndl-banking-shelf-life" },
    ],
  },
  "gov-hndl": {
    slug: "gov-hndl",
    metadata: {
      title: "Government Contractor HNDL Guide",
      description: "HNDL for defense contractors — NSM-10, CMMC, and long-retention deliverable archives.",
    },
    eyebrow: "Defense",
    title: "Gov contractor & harvest-now-decrypt-later",
    description:
      "Contract deliverables and personnel records with 15–50 year confidentiality requirements face HNDL exposure under NSM-10 timelines.",
    deadline: "2035 (NSM-10)",
    summary: "CMMC inventory and federal HNDL exposure",
    whyItMatters:
      "DIB contractors need CMMC-ready crypto inventory — assessors expect artifacts, not attestation claims.",
    qtanglMapping: [
      "Gov contractor CMMC scenario scan",
      "NSM-10 and CNSA 2.0 framework mapping",
      "Signed verify links for prime audit cycles",
    ],
    relatedScenarios: [
      { label: "Gov contractor CMMC", href: "/assess?scenario=gov-contractor-cmmc" },
    ],
    relatedArticles: [
      { label: "Government solutions", href: "/solutions/government" },
      { label: "HNDL hub", href: "/q-day/hndl" },
      { label: "Gov HNDL blog", href: "/blog/hndl-gov-contractor-archives" },
    ],
  },
  "eu-cra": {
    slug: "eu-cra",
    metadata: {
      title: "EU CRA Crypto Requirements",
      description: "EU Cyber Resilience Act crypto agility expectations for software vendors.",
    },
    eyebrow: "Enterprise",
    title: "EU CRA & post-quantum readiness",
    description:
      "The EU Cyber Resilience Act introduces security requirements for products with digital elements — including crypto agility.",
    deadline: "Phased enforcement",
    summary: "EU Cyber Resilience Act product security",
    whyItMatters:
      "Vendors serving EU markets need documented cryptographic dependencies and update paths — PQC migration is a crypto agility exercise.",
    qtanglMapping: [
      "CBOM export for product crypto dependencies",
      "Code signing inventory for update mechanisms",
      "Monitor cadence for drift documentation",
    ],
    relatedScenarios: [
      { label: "Run Q-Day scanner", href: "/assess" },
    ],
    relatedArticles: [
      { label: "Platform overview", href: "/platform" },
      { label: "NIST IR 8547 guide", href: "/q-day/frameworks/nist-ir-8547" },
    ],
  },
};

export const frameworkGuideList = Object.values(frameworkGuides);

export function getFrameworkGuide(slug: string): FrameworkGuide | null {
  return frameworkGuides[slug] ?? null;
}
