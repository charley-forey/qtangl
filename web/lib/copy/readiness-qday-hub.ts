export type QDayResource = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

export type DeadlineTier = {
  framework: string;
  deadline: string;
  urgency: "immediate" | "near" | "mid" | "long";
  summary: string;
};

export const qDayHubCopy = {
  metadata: {
    title: "Q-Day Readiness Hub",
    description:
      "Education on post-quantum cryptography, harvest-now-decrypt-later, Mosca inequality, compliance deadlines, and crypto inventory.",
  },
  hero: {
    eyebrow: "Q-Day readiness",
    title: "Everything you need before Q-Day",
    description:
      "Understand the threat, map your deadlines, and run a live inventory — with evidence your board and auditors can verify.",
    actions: [
      { href: "/assess", label: "Run Q-Day scan" },
      { href: "/assess", label: "Explore Assess", variant: "secondary" as const },
    ],
  },
  resources: {
    eyebrow: "Resources",
    title: "Start with the fundamentals",
    items: [
      {
        slug: "what-is-q-day",
        title: "What is Q-Day?",
        description: "When cryptographically relevant quantum computers break today's public-key crypto.",
        href: "/q-day/what-is-q-day",
      },
      {
        slug: "hndl",
        title: "Harvest now, decrypt later",
        description: "Why data encrypted today is already at risk — even before Q-Day arrives.",
        href: "/q-day/hndl",
      },
      {
        slug: "mosca-inequality",
        title: "Mosca inequality",
        description: "The X + Y > Z rule CISOs use to quantify HNDL exposure.",
        href: "/q-day/mosca-inequality",
      },
      {
        slug: "deadlines",
        title: "Compliance deadlines",
        description: "NSM-10, CNSA 2.0, NIST IR 8547, CMMC, and PCI-DSS timelines.",
        href: "/q-day/deadlines",
      },
      {
        slug: "cbom",
        title: "CycloneDX CBOM",
        description: "Machine-readable crypto bill of materials for your GRC toolchain.",
        href: "/q-day/cbom",
      },
      {
        slug: "hybrid-tls",
        title: "Hybrid TLS proof",
        description: "What the PQ handshake appendix means for migration evidence.",
        href: "/q-day/hybrid-tls",
      },
      {
        slug: "readiness-score",
        title: "Readiness score",
        description: "How Qtangl scores exposure, coverage, and deadline pressure.",
        href: "/q-day/readiness-score",
      },
      {
        slug: "vs-spreadsheet",
        title: "Why spreadsheets fail",
        description: "Manual crypto inventories miss drift, JWKS, and STARTTLS.",
        href: "/q-day/vs-spreadsheet",
      },
      {
        slug: "checklist",
        title: "Crypto agility checklist",
        description: "Twenty-point self-audit worksheet for inventory, deadlines, and monitoring.",
        href: "/q-day/checklist",
      },
    ] satisfies QDayResource[],
  },
  deadlines: {
    eyebrow: "Deadlines",
    title: "Framework timeline",
    description: "Regulated teams track multiple clocks. Inventory now — migrate on your tier.",
    tiers: [
      {
        framework: "FIPS 203 / 204 / 205",
        deadline: "Available now (2024)",
        urgency: "immediate",
        summary: "ML-KEM, ML-DSA, and SLH-DSA standards published — migration can start.",
      },
      {
        framework: "PCI-DSS 4.0",
        deadline: "2025–ongoing",
        urgency: "near",
        summary: "Crypto agility and inventory expectations for payment environments.",
      },
      {
        framework: "CMMC 2.0",
        deadline: "2026–2030",
        urgency: "near",
        summary: "Defense contractors need crypto inventory evidence for Level 2 audits.",
      },
      {
        framework: "NIST IR 8547",
        deadline: "2030",
        urgency: "mid",
        summary: "Transition guidance for federal and regulated-adjacent organizations.",
      },
      {
        framework: "CNSA 2.0",
        deadline: "2030–2033",
        urgency: "mid",
        summary: "NSA suite migration tiers for national-security systems.",
      },
      {
        framework: "NSM-10",
        deadline: "2035",
        urgency: "long",
        summary: "Federal mandate to migrate away from quantum-vulnerable algorithms.",
      },
    ] satisfies DeadlineTier[],
  },
  artifacts: {
    eyebrow: "Try it",
    title: "Sample artifacts",
    description: "See what a Qtangl assessment exports before you run your own scan.",
    items: [
      { label: "Run live scanner", href: "/assess" },
      { label: "Free mini-assessment", href: "/assess/mini" },
      { label: "Verify a report", href: "/verify" },
      { label: "Download sample CBOM", href: "/samples/sample-cbom-bank-tls-inventory.json" },
      { label: "Crypto agility checklist", href: "/q-day/checklist" },
      { label: "Executive briefing (PDF)", href: "/q-day/briefing" },
    ],
  },
  solutions: {
    eyebrow: "By industry",
    title: "Vertical readiness playbooks",
    items: [
      { label: "Banking & financial services", href: "/solutions/banking" },
      { label: "Government & defense", href: "/solutions/government" },
      { label: "Healthcare payers", href: "/solutions/healthcare" },
    ],
  },
} as const;

export const qDayArticles = {
  "what-is-q-day": {
    metadata: {
      title: "What is Q-Day?",
      description:
        "Q-Day is when cryptographically relevant quantum computers break today's public-key cryptography — and why readiness starts now.",
    },
    eyebrow: "Fundamentals",
    title: "What is Q-Day?",
    description:
      "The day a cryptographically relevant quantum computer breaks RSA, ECC, and other public-key algorithms your stack depends on today.",
    sections: [
      {
        heading: "Why it matters",
        body: "TLS, code signing, VPNs, and email encryption rely on math quantum computers will eventually break. Q-Day is not a single calendar date — it's the point where your current algorithms are no longer safe.",
      },
      {
        heading: "What to do now",
        body: "Inventory quantum-vulnerable crypto, quantify harvest-now-decrypt-later exposure, and build a migration program with evidence auditors can verify — not a slide deck.",
      },
    ],
    related: ["hndl", "deadlines", "readiness-score"],
  },
  hndl: {
    metadata: {
      title: "Harvest Now, Decrypt Later",
      description:
        "HNDL means adversaries capture encrypted data today and decrypt it after Q-Day. Long data shelf-life drives urgency.",
    },
    eyebrow: "Urgency",
    title: "Harvest now, decrypt later",
    description:
      "Adversaries don't need to break your crypto today. They can store ciphertext now and decrypt it once quantum computers arrive.",
    sections: [
      {
        heading: "The threat model",
        body: "Nation-state and sophisticated actors harvest TLS sessions, backups, and archives knowing future quantum computers will read them. Financial, healthcare, and government data with decades of shelf-life is highest risk.",
      },
      {
        heading: "How Qtangl quantifies it",
        body: "Every Qtangl assessment includes Mosca HNDL scoring — mapping your data retention horizon against estimated quantum timeline and migration runway.",
      },
    ],
    related: ["mosca-inequality", "what-is-q-day", "readiness-score"],
  },
  "mosca-inequality": {
    metadata: {
      title: "Mosca Inequality Explained",
      description:
        "Mosca's X + Y > Z inequality helps CISOs decide if harvest-now-decrypt-later exposure requires action now.",
    },
    eyebrow: "Risk math",
    title: "Mosca inequality",
    description:
      "If the time your data must stay confidential (X) plus the time to migrate (Y) exceeds the time until quantum breaks crypto (Z), you have HNDL exposure today.",
    sections: [
      {
        heading: "The formula",
        body: "X = data shelf-life in years. Y = migration runway in years. Z = years until cryptographically relevant quantum computers. When X + Y > Z, encrypted data captured today may be readable before you finish migrating.",
      },
      {
        heading: "Why boards care",
        body: "Mosca turns abstract quantum risk into a inequality your board and regulators understand — especially in banking and healthcare where data lives for decades.",
      },
    ],
    related: ["hndl", "deadlines", "readiness-score"],
  },
  deadlines: {
    metadata: {
      title: "PQC Compliance Deadlines",
      description:
        "NSM-10, CNSA 2.0, NIST IR 8547, CMMC, and PCI-DSS timelines for post-quantum migration.",
    },
    eyebrow: "Compliance",
    title: "Compliance deadlines",
    description:
      "Multiple frameworks set migration clocks. Your inventory must map findings to the deadlines your auditors already track.",
    sections: [
      {
        heading: "Federal and defense",
        body: "NSM-10 (2035), CNSA 2.0 (2030–2033), and CMMC 2.0 (2026–2030) drive defense contractors and federal-adjacent SaaS to inventory now and migrate in tiers.",
      },
      {
        heading: "Industry frameworks",
        body: "PCI-DSS 4.0 emphasizes crypto agility. NIST IR 8547 sets 2030 transition guidance. HIPAA and EU CRA add sector-specific pressure for healthcare and med-tech.",
      },
    ],
    related: ["what-is-q-day", "cbom", "readiness-score"],
  },
  cbom: {
    metadata: {
      title: "CycloneDX CBOM Guide",
      description:
        "Export machine-readable crypto bills of materials from Qtangl scans for CMDB and GRC integration.",
    },
    eyebrow: "Artifacts",
    title: "CycloneDX CBOM",
    description:
      "A Crypto Bill of Materials (CBOM) lists algorithms, keys, and certificates in machine-readable form — the inventory artifact GRC tools expect.",
    sections: [
      {
        heading: "What you export",
        body: "Qtangl scans export CycloneDX CBOM JSON mapping TLS endpoints, algorithms, key sizes, and vulnerability classifications to your remediation backlog.",
      },
      {
        heading: "Why it beats spreadsheets",
        body: "CBOM integrates with ServiceNow, Archer, and custom CMDBs. Spreadsheets miss JWKS rotation, STARTTLS, and drift between audit cycles.",
      },
    ],
    related: ["vs-spreadsheet", "readiness-score", "hybrid-tls"],
  },
  "hybrid-tls": {
    metadata: {
      title: "Hybrid TLS Proof",
      description:
        "How Qtangl demonstrates post-quantum TLS handshake migration with auditable trace evidence.",
    },
    eyebrow: "Technical",
    title: "Hybrid TLS proof",
    description:
      "Migration isn't complete until you prove PQ algorithms work in production TLS — not just in a lab slide.",
    sections: [
      {
        heading: "What we prove",
        body: "The Qtangl demo includes hybrid ML-KEM handshake traces — showing classical and post-quantum key exchange in a verifiable audit pack.",
      },
      {
        heading: "Evidence for auditors",
        body: "Handshake traces attach to signed reports with verify links. Auditors check signatures independently — Qtangl doesn't ask you to trust us alone.",
      },
    ],
    related: ["cbom", "readiness-score", "hndl"],
  },
  "readiness-score": {
    metadata: {
      title: "Qtangl Readiness Score",
      description:
        "How Qtangl combines exposure, coverage confidence, and deadline pressure into a readiness score.",
    },
    eyebrow: "Method",
    title: "Readiness score",
    description:
      "A single score your board can track — built from quantum-vulnerable findings, scan coverage, and framework deadline tiers.",
    sections: [
      {
        heading: "What drives the score",
        body: "Exposure: count and severity of quantum-vulnerable algorithms. Coverage: confidence that your scan saw the full external TLS footprint. Pressure: proximity to NSM-10, CNSA 2.0, and sector deadlines.",
      },
      {
        heading: "Track it over time",
        body: "One score at assessment is a baseline. Monitor tier tracks drift — new endpoints, cert changes, and algorithm downgrades move the score so you catch regression before auditors do.",
      },
    ],
    related: ["hndl", "deadlines", "vs-spreadsheet"],
  },
  "vs-spreadsheet": {
    metadata: {
      title: "Why Spreadsheet Crypto Inventories Fail",
      description:
        "Manual TLS inventories miss drift, JWKS, STARTTLS, and re-scan verification — why teams upgrade to Qtangl Monitor.",
    },
    eyebrow: "Sales enablement",
    title: "Why spreadsheets fail",
    description:
      "Spreadsheets are a snapshot. Crypto is dynamic — new services, cert rotations, and cipher downgrades appear between audit cycles.",
    sections: [
      {
        heading: "What spreadsheets miss",
        body: "JWKS endpoints, email STARTTLS, shadow IT APIs, and third-party dependencies. Manual inventories go stale the week after the audit.",
      },
      {
        heading: "What continuous inventory gives you",
        body: "Scheduled scans, diff alerts, signed evidence, and re-scan verification after remediation — the system of record for your Q-Day program.",
      },
    ],
    related: ["cbom", "readiness-score", "hndl"],
  },
} as const;

export type QDayArticleSlug = keyof typeof qDayArticles;

export function getQDayArticle(slug: string) {
  return qDayArticles[slug as QDayArticleSlug] ?? null;
}

export function getRelatedQDayResources(slugs: readonly string[]) {
  return qDayHubCopy.resources.items.filter((item) => slugs.includes(item.slug));
}
