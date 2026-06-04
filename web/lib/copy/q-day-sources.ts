export type QDaySourceTag =
  | "q-day-basics"
  | "hndl"
  | "deadlines"
  | "standards"
  | "video"
  | "industry";

export type QDaySource = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  date: string;
  summary: string;
  tags: readonly QDaySourceTag[];
};

export const qDaySourcesLastVerified = "2026-06-04";

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
