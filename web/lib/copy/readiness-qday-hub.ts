export type QDayResource = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

export type QDayArticleSection = {
  heading: string;
  body: string;
  anchor?: string;
  keyTerms?: readonly string[];
  diagram?: string;
  diagramAlt?: string;
};

export type QDayArticle = {
  metadata: {
    title: string;
    description: string;
  };
  eyebrow: string;
  title: string;
  description: string;
  sections: readonly QDayArticleSection[];
  related: readonly string[];
  externalSourceIds?: readonly string[];
  videoId?: string;
  videoTitle?: string;
  blogCompanionHref?: string;
  blogCompanionTitle?: string;
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
        description:
          "How ciphertext is copied today, who is exposed, and what to do this quarter — with Mosca calculator and collection guide.",
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
      { label: "Sample signed report", href: "/q-day/sample-report" },
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
        heading: "Not a calendar date — a capability milestone",
        body:
          "Q-Day (sometimes called Y2Q) is when a cryptographically relevant quantum computer (CRQC) can break widely deployed public-key cryptography — RSA, elliptic-curve (ECC), and the TLS, VPN, and code-signing infrastructure built on them. It is not a fixed date on anyone's calendar. It is the point where your current algorithms are no longer safe.",
      },
      {
        heading: "Why industry timelines shifted in 2026",
        body:
          "Google and Cloudflare accelerated internal post-quantum readiness targets to 2029 — roughly five years sooner than prior plans. The move reflects new research on error correction and algorithmic advances, not a confirmed CRQC arrival date. Treat 2029 as a planning signal: migration takes years across vendors, certificates, and embedded systems.",
      },
      {
        heading: "The risk starts before Q-Day",
        body:
          "Harvest-now-decrypt-later (HNDL) means adversaries capture encrypted data today and store it until quantum computers can decrypt it. Long-lived secrets in healthcare, finance, and government face exposure now — even while today's crypto still works. NIST finalized ML-KEM, ML-DSA, and SLH-DSA standards in 2024 so migration can begin immediately.",
      },
      {
        heading: "What to do now",
        body:
          "Inventory quantum-vulnerable crypto, quantify HNDL exposure with Mosca's inequality, and build a migration program with evidence auditors can verify — not a slide deck. Qtangl Assess produces a prioritized backlog with signed scan artifacts; an inventory aid, not a formal attestation.",
      },
    ],
    externalSourceIds: [
      "nist-pqc-overview",
      "palo-alto-q-day",
      "google-2029-ars",
      "cloudflare-pq-roadmap",
    ],
    videoId: "CJqJCpSxadE",
    videoTitle: "Q-Day Explained: The Quantum Threat to Encryption",
    blogCompanionHref: "/blog/pqc-deadlines-2029",
    blogCompanionTitle: "PQC deadlines in 2029 and beyond",
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
        anchor: "threat-model",
        keyTerms: ["hndl", "crqc", "ciphertext"],
        body:
          "Nation-state and sophisticated actors harvest TLS sessions, backups, and archives knowing future quantum computers will read them. Storage is cheap; breaking RSA today is not required. NIST describes this as harvest now, decrypt later — one reason post-quantum encryption should deploy as soon as feasible.",
      },
      {
        heading: "How ciphertext gets copied today",
        anchor: "how-collection-works",
        keyTerms: ["ciphertext", "forward_secrecy"],
        diagram: "/qtangl-hndl-collection-vectors.svg",
        diagramAlt: "Diagram of HNDL collection vectors: breach exfiltration, backups, cloud misconfiguration, and bulk network capture.",
        body:
          "Adversaries do not need to break encryption today. The most common paths are breach and ransomware exfiltration (database dumps, file shares, backup appliances), long-term backups and archives (tape, S3 snapshots, email archives), cloud misconfiguration (public snapshots, open prefixes), and bulk network collection at scale. Incident response data shows exfiltration timelines compressing — copying ciphertext is faster than breaking it.",
      },
      {
        heading: "What adversaries store vs ignore",
        anchor: "what-is-stored",
        keyTerms: ["ecdh", "forward_secrecy", "key_encapsulation"],
        diagram: "/qtangl-hndl-tls-handshake-flow.svg",
        diagramAlt: "TLS handshake flow showing which parts of a session are stored for future quantum decryption.",
        body:
          "Harvesting matters when public-key cryptography wraps the secret. Adversaries store TLS handshakes plus ciphertext (not application data alone), database and backup blobs encrypted with RSA or ECIES, email and file archives, and signing keys. Modern TLS 1.3 with forward secrecy still leaves the handshake vulnerable to future discrete-log attacks — passive wire capture of application data alone is not enough without the handshake record.",
      },
      {
        heading: "Who faces the highest exposure",
        anchor: "who-is-exposed",
        keyTerms: ["mosca", "hndl_exposed"],
        diagram: "/qtangl-hndl-shelf-life-by-vertical.svg",
        diagramAlt: "Bar chart of typical data shelf-life by industry: healthcare 30-50 years, banking 7-25 years, government 15-50 years.",
        body:
          "Healthcare records, financial transaction archives, M&A diligence, and classified-adjacent research often carry 20–50 year confidentiality requirements. Regional banks, payers, and government contractors hold exactly this data profile. When migration takes five to ten years across a mid-market estate, Mosca inequality often holds today.",
      },
      {
        heading: "Common misconceptions",
        anchor: "misconceptions",
        keyTerms: ["crqc", "forward_secrecy"],
        body:
          "Quantum-vulnerable does not mean broken today — RSA and ECDSA still protect data in transit and at rest right now. AES-256 symmetric encryption is not the primary HNDL concern; public-key layers are. TLS 1.3 forward secrecy limits passive decryption but stored handshakes remain a quantum target. Waiting until 2035 to start inventory compresses your migration runway and does not un-copy ciphertext already exfiltrated.",
      },
      {
        heading: "Mosca inequality ties it together",
        anchor: "mosca",
        keyTerms: ["mosca"],
        diagram: "/qtangl-hndl-mosca-timeline.svg",
        diagramAlt: "Mosca timeline diagram showing data shelf-life X plus migration Y compared to quantum timeline Z.",
        body:
          "If data shelf-life (X) plus migration time (Y) exceeds the time until quantum breaks crypto (Z), you have HNDL exposure today. Mosca turns abstract quantum risk into a planning inequality boards and regulators understand — especially when migration takes five to ten years across a mid-market estate.",
      },
      {
        heading: "What to do this quarter",
        anchor: "this-quarter",
        keyTerms: ["pqc_ready", "crypto_agility"],
        diagram: "/qtangl-hndl-before-after-migration.svg",
        diagramAlt: "Before and after migration diagram showing inventory, hybrid TLS pilot, and re-scan proof.",
        body:
          "Run a cryptographic inventory on external TLS, JWKS, SSH, and email STARTTLS — not a spreadsheet snapshot. Tag findings by data shelf-life tier. Quantify Mosca exposure for your longest-retained data classes. Pilot hybrid TLS on a non-production path and attach re-scan proof after remediation. Export a CycloneDX CBOM for your GRC toolchain.",
      },
      {
        heading: "How Qtangl quantifies it",
        anchor: "qtangl",
        keyTerms: ["readiness_score", "hndl_exposed"],
        body:
          "Every Qtangl assessment includes Mosca HNDL scoring — mapping your data retention horizon against estimated quantum timeline and migration runway. Quantum-vulnerable does not mean broken today; it means you need inventory and a migration runway now. Inventory aid, not formal audit.",
      },
    ],
    externalSourceIds: [
      "nist-pqc-overview",
      "palo-alto-q-day",
      "video-jeremy-allison-hndl",
      "unit42-exfil-timeline",
      "mosca-inequality",
    ],
    videoId: "u4mVljNQnBw",
    videoTitle: "Why Your Encrypted Data Is Already Being Stolen",
    blogCompanionHref: "/blog/harvest-now-decrypt-later-boards",
    blogCompanionTitle: "Harvest-now-decrypt-later: what boards miss",
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
        heading: "Industry acceleration: 2029 planning signal",
        body:
          "Google and Cloudflare moved internal full post-quantum readiness — including authentication — to 2029. Federal mandates (NSM-10 by 2035, CNSA 2.0 tiers through 2030–2033) and NIST IR 8547 (2030 guidance) already set clocks. Mid-market teams must map inventory findings to whichever frameworks their auditors enforce.",
      },
      {
        heading: "Federal and defense",
        body:
          "NSM-10 mandates federal migration away from quantum-vulnerable algorithms by 2035. CNSA 2.0 sets tiered deadlines for national security systems through 2030–2033. CMMC 2.0 (2026–2030) drives defense contractors and FedRAMP-path SaaS toward crypto inventory evidence for Level 2 audits.",
      },
      {
        heading: "Industry frameworks",
        body:
          "PCI-DSS 4.0 emphasizes crypto agility for payment environments. NIST IR 8547 provides transition guidance for federal and regulated-adjacent organizations. HIPAA and EU CRA add sector-specific pressure for healthcare payers and med-tech vendors.",
      },
      {
        heading: "ECC may break before RSA",
        body:
          "Recent research suggests ECC-256 — widely used in TLS and VPNs — may fall on an earlier timeline than RSA-2048 for offline retrospective attacks. Inventory must tag both algorithm families and prioritize authentication infrastructure, not assume RSA migration comes first.",
      },
    ],
    externalSourceIds: [
      "nist-ir-8547",
      "nsa-cnsa-2",
      "nsm-10",
      "gqi-q-day-summary",
      "cloudflare-pq-roadmap",
    ],
    blogCompanionHref: "/blog/pqc-deadlines-2029",
    blogCompanionTitle: "PQC deadlines in 2029 and beyond",
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
    blogCompanionHref: "/blog/pqc-inventory-in-10-minutes",
    blogCompanionTitle: "PQC inventory in 10 minutes",
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

export function getQDayArticle(slug: string): QDayArticle | null {
  return (qDayArticles[slug as QDayArticleSlug] as QDayArticle | undefined) ?? null;
}

export function getRelatedQDayResources(slugs: readonly string[]) {
  return qDayHubCopy.resources.items.filter((item) => slugs.includes(item.slug));
}
