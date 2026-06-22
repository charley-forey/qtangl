import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";

const GUIDE_PATH = path.join(process.cwd(), "public", "downloads", "quantum-crypto-learning-guide.md");

export const quantumCryptoGuideCopy = {
  eyebrow: "Downloadable guide",
  title: "Quantum cryptography learning guide",
  intro:
    "A four-week curriculum from Shor's algorithm through post-quantum migration — with on-site video companions, NIST references, and action checkpoints.",
  downloadHref: "/downloads/quantum-crypto-learning-guide.md",
} as const;

export const loadQuantumCryptoGuideMarkdown = cache(async (): Promise<string> => {
  const raw = await fs.readFile(GUIDE_PATH, "utf-8");
  const weekStart = raw.indexOf("## Week 1");
  return weekStart >= 0 ? raw.slice(weekStart).trim() : raw.trim();
});
