import { glossaryEntries } from "@/lib/copy/technology-deep";
import { quantumLexicon } from "@/lib/copy/voice";

export type GlossaryEntry = {
  id: string;
  quantum: string;
  quantumMeaning: string;
  engineering: string;
  engineeringMeaning: string;
};

function slugify(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

const lexiconEntries: GlossaryEntry[] = Object.values(quantumLexicon).map((term) => ({
  id: slugify(term.label),
  quantum: term.label,
  quantumMeaning: term.meaning,
  engineering: term.label,
  engineeringMeaning: term.meaning,
}));

const deepEntries: GlossaryEntry[] = glossaryEntries.map((entry) => ({
  id: slugify(entry.quantum),
  quantum: entry.quantum,
  quantumMeaning: entry.quantumMeaning,
  engineering: entry.engineering,
  engineeringMeaning: entry.engineeringMeaning,
}));

const merged = new Map<string, GlossaryEntry>();
for (const entry of [...lexiconEntries, ...deepEntries]) {
  merged.set(entry.id, entry);
}

const pqcEntries: GlossaryEntry[] = [
  {
    id: "q-day",
    quantum: "Q-Day",
    quantumMeaning: "The day cryptographically relevant quantum computers break widely deployed public-key crypto.",
    engineering: "Q-Day",
    engineeringMeaning: "Planning horizon for PQC migration programs and board-level readiness reporting.",
  },
  {
    id: "hndl",
    quantum: "HNDL",
    quantumMeaning: "Harvest now, decrypt later — adversaries store ciphertext today to break with future quantum computers.",
    engineering: "HNDL",
    engineeringMeaning: "Risk framing tied to Mosca inequality X + Y > Z for data shelf-life vs migration time.",
  },
  {
    id: "ml-kem",
    quantum: "ML-KEM",
    quantumMeaning: "NIST FIPS 203 module-lattice key encapsulation mechanism (formerly Kyber).",
    engineering: "ML-KEM",
    engineeringMeaning: "Preferred PQ key exchange for hybrid TLS 1.3 deployments.",
  },
  {
    id: "cbom",
    quantum: "CBOM",
    quantumMeaning: "Cryptography Bill of Materials — inventory of algorithms and keys in a system.",
    engineering: "CBOM",
    engineeringMeaning: "CycloneDX export format for procurement and compliance evidence.",
  },
];

for (const entry of pqcEntries) {
  merged.set(entry.id, entry);
}

const diversityEntries: GlossaryEntry[] = [
  {
    id: "distinct-feasible-plans",
    quantum: "Distinct feasible plans",
    quantumMeaning: "Count of structurally different assignments that still satisfy hard constraints.",
    engineering: "distinctFeasiblePlans",
    engineeringMeaning: "Headline hybrid metric — how many auditable alternates the repair window surfaced.",
  },
  {
    id: "diversity-score",
    quantum: "Diversity score",
    quantumMeaning: "Pairwise distance between feasible plans (0–1). Higher means more meaningfully different alternates.",
    engineering: "diversityScore",
    engineeringMeaning: "Normalized plan distance used on scoreboards and in Track C2 success metric.",
  },
  {
    id: "success-metric",
    quantum: "Hybrid success metric",
    quantumMeaning: "Hybrid must beat classical on alternate count while staying within ε of optimum.",
    engineering: "successMetric",
    engineeringMeaning: "Falsifiable C2 check: hybrid_distinct ≥ classical_distinct + 1 and objective within 2%.",
  },
];

for (const entry of diversityEntries) {
  merged.set(entry.id, entry);
}

export const glossary: GlossaryEntry[] = Array.from(merged.values()).sort((a, b) =>
  a.quantum.localeCompare(b.quantum),
);
