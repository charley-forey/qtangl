export type AssessPersona = "ciso" | "engineer" | "grc";

export const ASSESS_PERSONAS: { id: AssessPersona; label: string; description: string; defaultTab: string }[] = [
  {
    id: "ciso",
    label: "CISO / Board",
    description: "Executive summary, readiness score, verify link",
    defaultTab: "executive",
  },
  {
    id: "engineer",
    label: "Engineer",
    description: "API, CBOM, technical handshake proof",
    defaultTab: "technical",
  },
  {
    id: "grc",
    label: "GRC / Auditor",
    description: "Framework mapping, compliance, evidence exports",
    defaultTab: "compliance",
  },
];

export function isAssessPersona(value: string | null): value is AssessPersona {
  return value === "ciso" || value === "engineer" || value === "grc";
}

export function personaDefaultTab(persona: AssessPersona): "executive" | "technical" | "compliance" {
  const match = ASSESS_PERSONAS.find((p) => p.id === persona);
  return (match?.defaultTab ?? "executive") as "executive" | "technical" | "compliance";
}
