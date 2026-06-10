import { quantumLexicon } from "@/lib/copy/voice";

const { amplitude } = quantumLexicon;

/** Labels for optimization visual chrome (/technology, Labs). Not used on the readiness homepage. */
export const optimizationVisualLabels = [
  quantumLexicon.superposition.label,
  quantumLexicon.interference.label,
  quantumLexicon.collapse.label,
] as const;

/** @deprecated Use optimizationVisualLabels */
export const homeHero = {
  visualLabels: optimizationVisualLabels,
} as const;

export const optimizationProductPreview = {
  eyebrow: amplitude.label,
  title: "See the ranked plan before you wire the API.",
  description:
    "Readable plan, one-line why, and the measurement that proves the win — demo data today, live API tomorrow.",
} as const;

/** @deprecated Use optimizationProductPreview */
export const homeProductPreview = optimizationProductPreview;
