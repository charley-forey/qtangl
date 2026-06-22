export type QuantumCryptoLearningLayer = {
  id: string;
  title: string;
  checkpoint: string;
  sourceIds: readonly string[];
  videoIds: readonly string[];
  blogSlugs: readonly string[];
  diagramId?: string;
};

export const quantumCryptoLearningPathIntro =
  "A five-layer curriculum from Shor's algorithm through post-quantum migration — with embedded videos, NIST references, and Qtangl-ready action steps.";

export const quantumCryptoLearningLayers: readonly QuantumCryptoLearningLayer[] = [
  {
    id: "threat",
    title: "Layer 1 — Why quantum breaks RSA and ECC",
    checkpoint:
      "Can you explain in two minutes why Shor's algorithm breaks RSA but AES mostly survives?",
    sourceIds: [
      "video-minutephysics-shor",
      "video-veritasium-quantum-power",
      "postquantum-shor-article",
      "nist-pqc-overview",
      "pennylane-period-finding",
    ],
    videoIds: ["lvTqbM5Dq4Q", "-UrdExQW0cs", "wUwZZaI5u0c"],
    blogSlugs: [
      "video-companion-shors-algorithm-minutephysics",
      "video-companion-quantum-power-veritasium",
      "video-companion-pbs-shor-period-finding",
      "video-companion-physics-world-shor",
      "shors-algorithm-explained-for-cisos",
      "grovers-algorithm-and-aes",
    ],
    diagramId: "threat-map",
  },
  {
    id: "hndl",
    title: "Layer 2 — Harvest now, decrypt later",
    checkpoint:
      "Can you apply Mosca's X + Y > Z to a dataset with a 20-year confidentiality requirement?",
    sourceIds: [
      "mosca-inequality",
      "postquantum-hndl-article",
      "video-jeremy-allison-hndl",
      "video-mosca-public-lecture",
      "unit42-exfil-timeline",
    ],
    videoIds: ["u4mVljNQnBw", "vWP4LF2hz80"],
    blogSlugs: [
      "video-companion-hndl-jeremy-allison",
      "video-companion-mosca-intel-quantum-security",
      "mosca-inequality-worked-examples",
      "hndl-collection-vectors-deep-dive",
    ],
    diagramId: "hndl-timeline",
  },
  {
    id: "standards",
    title: "Layer 3 — NIST PQC standards",
    checkpoint:
      "Can you name FIPS 203, 204, and 205 and what each replaces in today's PKI?",
    sourceIds: [
      "fips-203",
      "fips-204",
      "fips-205",
      "video-pq-algorithms",
      "video-menezes-kyber-dilithium",
      "cryptography101-kyber-dilithium",
    ],
    videoIds: ["3lCLvfv-XoY", "9NKm84vKALc", "pbPoUE7MmQw"],
    blogSlugs: [
      "video-companion-pq-algorithms-nist",
      "video-companion-nist-pqc-update-rwpqc-2026",
      "video-companion-kyber-dilithium-menezes",
      "nist-fips-203-204-205-primer",
    ],
    diagramId: "nist-algorithm-tree",
  },
  {
    id: "migration",
    title: "Layer 4 — Migration in real systems",
    checkpoint:
      "Can you describe hybrid TLS and why signature migration is harder than KEM?",
    sourceIds: [
      "nist-ir-8547",
      "cloudflare-pq-roadmap",
      "video-dustin-moody-nist",
      "cisa-pqc-initiative",
      "open-quantum-safe",
    ],
    videoIds: ["-_QiWSTud7I", "z85LaInxjrg"],
    blogSlugs: [
      "video-companion-dustin-moody-nist-strategy",
      "video-companion-cloudflare-pq-roadmap",
      "video-companion-cisa-quantum-readiness",
      "video-companion-open-quantum-safe-liboqs",
      "hybrid-tls-migration-guide",
      "pqc-migration-phases-explained",
    ],
    diagramId: "hybrid-tls-handshake",
  },
  {
    id: "evidence",
    title: "Layer 5 — Crypto agility and evidence",
    checkpoint:
      "Can you explain what a CBOM is and why re-scan proof matters for auditors?",
    sourceIds: [
      "nist-ir-8547",
      "nsm-10",
      "nsa-cnsa-2",
      "nccoe-migration-pqc",
      "cisa-quantum-readiness-factsheet",
    ],
    videoIds: [],
    blogSlugs: [
      "crypto-attack-surface-map",
      "qkd-vs-post-quantum-cryptography",
      "learning-quantum-crypto-4-week-path",
    ],
    diagramId: "migration-stack",
  },
] as const;

export const quantumCryptoVideoCompanionSlugs = [
  "video-companion-q-day-explained",
  "video-companion-hndl-jeremy-allison",
  "video-companion-pq-algorithms-nist",
  "video-companion-shors-algorithm-minutephysics",
  "video-companion-quantum-power-veritasium",
  "video-companion-pbs-shor-period-finding",
  "video-companion-physics-world-shor",
  "video-companion-dustin-moody-nist-strategy",
  "video-companion-nist-pqc-update-rwpqc-2026",
  "video-companion-mosca-intel-quantum-security",
  "video-companion-root-causes-moody-pqc",
  "video-companion-cloudflare-pq-roadmap",
  "video-companion-cisa-quantum-readiness",
  "video-companion-kyber-dilithium-menezes",
  "video-companion-open-quantum-safe-liboqs",
] as const;
