export type QDaySourceTag =
  | "q-day-basics"
  | "hndl"
  | "deadlines"
  | "standards"
  | "video"
  | "industry"
  | "foundations"
  | "hands-on"
  | "policy";

export type QDaySource = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  date: string;
  summary: string;
  tags: readonly QDaySourceTag[];
};

export const qDaySourcesLastVerified = "2026-06-21";

export const qDaySources: readonly QDaySource[] = [
  {
    id: "nist-pqc-overview",
    title: "What Is Post-Quantum Cryptography?",
    url: "https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography",
    publisher: "NIST",
    date: "2024",
    summary:
      "Official overview of NIST's PQC project, finalized standards, and the harvest-now-decrypt-later threat model.",
    tags: ["q-day-basics", "hndl", "standards"],
  },
  {
    id: "nist-ir-8547",
    title: "NIST IR 8547: Transition to Post-Quantum Cryptography Standards",
    url: "https://csrc.nist.gov/pubs/ir/8547/final",
    publisher: "NIST",
    date: "2024",
    summary: "Federal transition guidance with deprecation timelines for quantum-vulnerable algorithms.",
    tags: ["deadlines", "standards"],
  },
  {
    id: "fips-203",
    title: "FIPS 203 — Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM)",
    url: "https://csrc.nist.gov/publications/detail/fips/203/final",
    publisher: "NIST",
    date: "2024-08",
    summary: "Standardized post-quantum key encapsulation (formerly Kyber).",
    tags: ["standards"],
  },
  {
    id: "fips-204",
    title: "FIPS 204 — Module-Lattice-Based Digital Signature Standard (ML-DSA)",
    url: "https://csrc.nist.gov/publications/detail/fips/204/final",
    publisher: "NIST",
    date: "2024-08",
    summary: "Standardized post-quantum digital signatures (formerly Dilithium).",
    tags: ["standards"],
  },
  {
    id: "fips-205",
    title: "FIPS 205 — Stateless Hash-Based Digital Signature Standard (SLH-DSA)",
    url: "https://csrc.nist.gov/publications/detail/fips/205/final",
    publisher: "NIST",
    date: "2024-08",
    summary: "Hash-based post-quantum signatures (SPHINCS+ family).",
    tags: ["standards"],
  },
  {
    id: "palo-alto-q-day",
    title: "What Is Q-Day? Quantum Computing and Cyber Risk",
    url: "https://www.paloaltonetworks.com/cyberpedia/what-is-q-day",
    publisher: "Palo Alto Networks",
    date: "2026",
    summary:
      "CRQC definition, HNDL threat model, and migration guidance for enterprise security teams.",
    tags: ["q-day-basics", "hndl"],
  },
  {
    id: "google-2029-ars",
    title: "Google bumps up Q Day deadline to 2029",
    url: "https://arstechnica.com/security/2026/03/google-bumps-up-q-day-estimate-to-2029-far-sooner-than-previously-thought/",
    publisher: "Ars Technica",
    date: "2026-03",
    summary:
      "Coverage of Google's accelerated 2029 post-quantum readiness target and industry timeline shift.",
    tags: ["q-day-basics", "deadlines", "industry"],
  },
  {
    id: "cloudflare-pq-roadmap",
    title: "Cloudflare targets 2029 for full post-quantum security",
    url: "https://blog.cloudflare.com/post-quantum-roadmap/",
    publisher: "Cloudflare",
    date: "2026",
    summary:
      "Cloudflare's accelerated PQ roadmap including post-quantum authentication milestones.",
    tags: ["deadlines", "industry"],
  },
  {
    id: "big-tech-q-day-ars",
    title: "Recent advances push Big Tech closer to the Q-Day danger zone",
    url: "https://arstechnica.com/security/2026/04/while-some-big-tech-players-accelerate-pqc-readiness-others-stay-the-course/",
    publisher: "Ars Technica",
    date: "2026-04",
    summary:
      "How Google and Cloudflare accelerated timelines and why authentication migration is now prioritized.",
    tags: ["deadlines", "industry"],
  },
  {
    id: "gqi-q-day-summary",
    title: "Q-Day: Accelerated Timeline Across Wider Attack Surface",
    url: "https://quantumcomputingreport.com/q-day-accelerated-timeline-across-wider-attack-surface-executive-summary/",
    publisher: "Quantum Computing Report",
    date: "2026-04",
    summary:
      "Research summary on ECC-256 potentially breaking before RSA-2048 on accelerated timelines.",
    tags: ["q-day-basics", "deadlines"],
  },
  {
    id: "nsa-cnsa-2",
    title: "Commercial National Security Algorithm Suite 2.0 (CNSA 2.0)",
    url: "https://www.nsa.gov/Press-Room/News-Highlights/Article/Article/3588999/",
    publisher: "NSA",
    date: "2022",
    summary: "NSA migration tiers for national security systems through 2030–2033.",
    tags: ["deadlines", "standards"],
  },
  {
    id: "nsm-10",
    title: "National Security Memorandum on Post-Quantum Cryptography (NSM-10)",
    url: "https://www.whitehouse.gov/briefing-room/statements-releases/2022/05/04/national-security-memorandum-on-promoting-united-states-leadership-in-quantum-computing-while-mitigating-risks-to-vulnerable-cryptographic-systems/",
    publisher: "White House",
    date: "2022-05",
    summary: "Federal mandate requiring migration away from quantum-vulnerable algorithms by 2035.",
    tags: ["deadlines"],
  },
  {
    id: "video-q-day-explained",
    title: "Q-Day Explained: The Quantum Threat to Encryption",
    url: "https://www.youtube.com/watch?v=CJqJCpSxadE",
    publisher: "YouTube",
    date: "2025",
    summary: "Beginner-friendly explainer covering Shor's algorithm, HNDL, and PQC basics.",
    tags: ["video", "q-day-basics", "hndl"],
  },
  {
    id: "video-pq-algorithms",
    title: "Q-Day Is Coming: 5 Quantum-Safe Algorithms Explained",
    url: "https://www.youtube.com/watch?v=3lCLvfv-XoY",
    publisher: "YouTube",
    date: "2025",
    summary: "Overview of NIST PQC standards including ML-KEM, ML-DSA, and SLH-DSA.",
    tags: ["video", "standards"],
  },
  {
    id: "video-jeremy-allison-hndl",
    title: "Why Your Encrypted Data Is Already Being Stolen (Jeremy Allison, CIQ)",
    url: "https://www.youtube.com/watch?v=u4mVljNQnBw",
    publisher: "YouTube",
    date: "2025",
    summary:
      "Practitioner perspective on HNDL, PQC migration complexity, and FIPS certification for open source.",
    tags: ["video", "hndl"],
  },
  {
    id: "unit42-exfil-timeline",
    title: "Unit 42 Incident Response Report — exfiltration timelines",
    url: "https://www.paloaltonetworks.com/resources/research/unit-42-incident-response-report",
    publisher: "Palo Alto Networks Unit 42",
    date: "2025",
    summary:
      "Incident response data showing compressed exfiltration timelines — copying ciphertext is faster than breaking crypto today.",
    tags: ["hndl", "industry"],
  },
  {
    id: "mosca-inequality",
    title: "Quantum Threat Timeline Report (Mosca inequality)",
    url: "https://globalriskinstitute.org/publications/quantum-threat-timeline-report-2023/",
    publisher: "Global Risk Institute",
    date: "2023",
    summary:
      "Dr. Michele Mosca's X + Y > Z framework for harvest-now-decrypt-later exposure planning.",
    tags: ["hndl", "q-day-basics"],
  },
  {
    id: "video-minutephysics-shor",
    title: "How Quantum Computers Break Encryption | Shor's Algorithm Explained",
    url: "https://www.youtube.com/watch?v=lvTqbM5Dq4Q",
    publisher: "minutephysics (YouTube)",
    date: "2019",
    summary:
      "Accessible explainer on Shor's algorithm, period-finding, and why RSA breaks on a large quantum computer.",
    tags: ["video", "foundations", "q-day-basics"],
  },
  {
    id: "video-veritasium-quantum-power",
    title: "What Makes Quantum Computers SO Powerful?",
    url: "https://www.youtube.com/watch?v=-UrdExQW0cs",
    publisher: "Veritasium (YouTube)",
    date: "2023",
    summary:
      "Covers Shor's threat, harvest-now-decrypt-later, NIST PQC competition, and migration urgency.",
    tags: ["video", "foundations", "q-day-basics", "standards"],
  },
  {
    id: "video-pbs-shor",
    title: "Hacking at Quantum Speed with Shor's Algorithm",
    url: "https://www.youtube.com/watch?v=wUwZZaI5u0c",
    publisher: "PBS Infinite Series (YouTube)",
    date: "2017",
    summary: "Deeper dive into the number theory and quantum Fourier transform behind Shor's algorithm.",
    tags: ["video", "foundations"],
  },
  {
    id: "video-physics-world-shor",
    title: "What is Shor's factoring algorithm? (Peter Shor)",
    url: "https://www.youtube.com/watch?v=hOlOY7NyMfs",
    publisher: "Physics World (YouTube)",
    date: "2015",
    summary: "Peter Shor introduces his factoring algorithm and quantum computational advantage.",
    tags: ["video", "foundations"],
  },
  {
    id: "video-dustin-moody-nist",
    title: "How to Build Your 12-Month Post-Quantum Strategy (Dustin Moody, NIST)",
    url: "https://www.youtube.com/watch?v=-_QiWSTud7I",
    publisher: "PQShield / Shielded podcast (YouTube)",
    date: "2025",
    summary:
      "NIST PQC project lead on 2035 timelines, migration myths, crypto-agility, and practical next steps.",
    tags: ["video", "policy", "deadlines", "standards"],
  },
  {
    id: "video-rwpqc-nist-2026",
    title: "NIST PQC Standards Update: On-Ramp Signatures and Global Roadmaps (RWPQC 2026)",
    url: "https://www.youtube.com/watch?v=pbPoUE7MmQw",
    publisher: "RWPQC 2026 (YouTube)",
    date: "2026",
    summary:
      "Dustin Moody on FIPS 203–205 status, Falcon/HQC, on-ramp signatures, and 2035 deprecation tiers.",
    tags: ["video", "standards", "deadlines", "policy"],
  },
  {
    id: "video-mosca-public-lecture",
    title: "Michele Mosca: As We Enter a New Quantum Era",
    url: "https://www.youtube.com/watch?v=vWP4LF2hz80",
    publisher: "Perimeter Institute (YouTube)",
    date: "2015",
    summary:
      "Michele Mosca on quantum threats to cryptography, crypto-agility, and preparing cyber infrastructure.",
    tags: ["video", "foundations", "hndl", "q-day-basics"],
  },
  {
    id: "video-menezes-kyber-dilithium",
    title: "Short course on Kyber (ML-KEM) and Dilithium (ML-DSA) — Alfred Menezes",
    url: "https://www.youtube.com/watch?v=9NKm84vKALc",
    publisher: "Cryptography 101 (YouTube)",
    date: "2024",
    summary:
      "University-grade introduction to NIST-standardized lattice KEM and signature schemes.",
    tags: ["video", "standards", "foundations"],
  },
  {
    id: "video-cisa-pqc-transition",
    title: "The Post-Quantum Cryptography Transition: Tackling a Huge Challenge",
    url: "https://www.youtube.com/watch?v=z85LaInxjrg",
    publisher: "YouTube",
    date: "2024",
    summary:
      "Industry panel on NIST PQC standards, hybrid migration, HNDL, and DNS/routing roadmap implications.",
    tags: ["video", "policy", "standards"],
  },
  {
    id: "video-root-causes-moody-pqc",
    title: "Root Causes 613: Status of the NIST PQC Contests (Dustin Moody)",
    url: "https://www.sectigo.com/root-causes/root-causes-613-status-of-the-nist-pqc-contests",
    publisher: "Sectigo Root Causes Podcast",
    date: "2025",
    summary:
      "Dustin Moody on Falcon, HQC, on-ramp signatures, and ongoing NIST PQC evaluation criteria.",
    tags: ["video", "standards", "policy"],
  },
  {
    id: "postquantum-shor-article",
    title: "Shor's Algorithm: A Quantum Threat to Modern Cryptography",
    url: "https://postquantum.com/post-quantum/shors-algorithm-a-quantum-threat/",
    publisher: "PostQuantum.com",
    date: "2024",
    summary:
      "Written explainer for security professionals — RSA, ECC, Shor's steps, and PQC migration strategies.",
    tags: ["foundations", "q-day-basics"],
  },
  {
    id: "postquantum-hndl-article",
    title: "What Is Harvest Now, Decrypt Later (HNDL)?",
    url: "https://postquantum.com/quantum-security-reference/what-is-harvest-now-decrypt-later/",
    publisher: "PostQuantum.com",
    date: "2024",
    summary: "Mosca theorem, HNDL urgency, and why migration must start before Q-Day headlines.",
    tags: ["foundations", "hndl"],
  },
  {
    id: "cryptography101-kyber-dilithium",
    title: "Kyber and Dilithium — Cryptography 101 with Alfred Menezes",
    url: "https://cryptography101.ca/kyber-dilithium/",
    publisher: "Alfred Menezes / University of Waterloo",
    date: "2024",
    summary: "Full lecture series, slides, and course materials for ML-KEM and ML-DSA.",
    tags: ["foundations", "standards"],
  },
  {
    id: "cisa-pqc-initiative",
    title: "CISA Post-Quantum Cryptography Initiative",
    url: "https://www.cisa.gov/topics/risk-management/quantum",
    publisher: "CISA",
    date: "2024",
    summary: "US government guidance on quantum risk, migration planning, and PQC adoption.",
    tags: ["policy", "deadlines"],
  },
  {
    id: "cisa-quantum-readiness-factsheet",
    title: "CISA Quantum Readiness: Migration to Post-Quantum Cryptography",
    url: "https://www.cisa.gov/resources-tools/resources/quantum-readiness-migration-post-quantum-cryptography",
    publisher: "CISA",
    date: "2024",
    summary: "Executive factsheet on PQC migration steps for public and private sector organizations.",
    tags: ["policy", "deadlines"],
  },
  {
    id: "open-quantum-safe",
    title: "Open Quantum Safe Project",
    url: "https://openquantumsafe.org/",
    publisher: "Open Quantum Safe",
    date: "2024",
    summary: "liboqs reference implementations, TLS integrations, and prototype PQC demos.",
    tags: ["hands-on", "standards"],
  },
  {
    id: "ibm-quantum-safe-openssl",
    title: "Getting started with quantum-safe OpenSSL",
    url: "https://developer.ibm.com/tutorials/awb-quantum-safe-openssl",
    publisher: "IBM",
    date: "2024",
    summary: "Hands-on tutorial for quantum-safe TLS with OpenSSL and PQC algorithms.",
    tags: ["hands-on", "standards"],
  },
  {
    id: "pennylane-period-finding",
    title: "Period finding: A problem at the heart of quantum computing",
    url: "https://pennylane.ai/demos/tutorial_period_finding",
    publisher: "PennyLane",
    date: "2024",
    summary: "Interactive demo explaining period-finding — the core of Shor's algorithm.",
    tags: ["foundations", "hands-on"],
  },
  {
    id: "nist-pqc-videos",
    title: "NIST Post-Quantum Cryptography — Featured Videos",
    url: "https://www.nist.gov/pqc",
    publisher: "NIST",
    date: "2024",
    summary: "Official NIST explainers on PQC standards, migration, and the standardization journey.",
    tags: ["video", "standards", "policy"],
  },
  {
    id: "nccoe-migration-pqc",
    title: "NCCoE Migration to Post-Quantum Cryptography Project",
    url: "https://www.nccoe.nist.gov/applied-cryptography/migration-to-pqc",
    publisher: "NIST NCCoE",
    date: "2024",
    summary: "Practical migration demos, crypto discovery guidance, and industry collaboration.",
    tags: ["policy", "standards"],
  },
  {
    id: "ibm-shor-tutorial",
    title: "Shor's algorithm — IBM Quantum Documentation",
    url: "https://quantum.cloud.ibm.com/docs/en/tutorials/shors-algorithm",
    publisher: "IBM Quantum",
    date: "2024",
    summary: "Code-based tutorial on Shor's algorithm and resource requirements for breaking RSA.",
    tags: ["foundations", "hands-on"],
  },
  {
    id: "qtangl-crypto-flip-2026",
    title: "Qtangl Crypto Flip orchestration guide",
    url: "https://qtangl.com/docs/guides/crypto-flip",
    publisher: "Qtangl",
    date: "2026",
    summary: "Orchestrate CLM, KMS, and infrastructure flips with signed before/after evidence.",
    tags: ["industry"],
  },
  {
    id: "qtangl-drift-2026",
    title: "Qtangl unified crypto drift monitoring",
    url: "https://qtangl.com/blog/crypto-drift-monitoring-2026",
    publisher: "Qtangl",
    date: "2026",
    summary: "Unified snapshots across external, host, code, and CBOM discovery sources.",
    tags: ["industry"],
  },
] as const;

export function getQDaySourcesByTags(
  tags: readonly QDaySourceTag[],
  limit?: number,
): QDaySource[] {
  const filtered = qDaySources.filter((source) =>
    tags.some((tag) => source.tags.includes(tag)),
  );
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getQDaySourcesByIds(ids: readonly string[]): QDaySource[] {
  return ids
    .map((id) => qDaySources.find((source) => source.id === id))
    .filter((source): source is QDaySource => source !== undefined);
}

export function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}
