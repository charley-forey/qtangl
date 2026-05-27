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

export const glossary: GlossaryEntry[] = Array.from(merged.values()).sort((a, b) =>
  a.quantum.localeCompare(b.quantum),
);
