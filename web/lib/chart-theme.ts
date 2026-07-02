/** Shared Recharts styling for marketing and product previews. */

export const chartAxisTick = { fill: "#9ca3af", fontSize: 10 } as const;

export const chartTooltipStyle = {
  background: "rgba(10,10,10,0.94)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
} as const;

export const chartGridStroke = "rgba(255,255,255,0.06)";

export const readinessBandAreas = [
  { y1: 0, y2: 60, fill: "#ef4444", opacity: 0.07 },
  { y1: 60, y2: 80, fill: "#f59e0b", opacity: 0.07 },
  { y1: 80, y2: 100, fill: "#22c55e", opacity: 0.07 },
] as const;

export const readinessBandLegend = [
  { label: "At risk", color: "#ef4444" },
  { label: "Improving", color: "#f59e0b" },
  { label: "On track", color: "#22c55e" },
] as const;

export function readinessBandForScore(score: number): string {
  if (score >= 80) return "On track";
  if (score >= 60) return "Improving";
  return "At risk";
}

export function urgencyColorForYear(deadlineYear: number, nowYear = new Date().getFullYear()): string {
  const yearsLeft = deadlineYear - nowYear;
  if (yearsLeft <= 4) return "bg-red-500/70";
  if (yearsLeft <= 8) return "bg-amber-500/65";
  return "bg-emerald-500/55";
}

export function progressToDeadline(deadlineYear: number, startYear = 2024, nowYear = new Date().getFullYear()): number {
  const total = Math.max(1, deadlineYear - startYear);
  const elapsed = Math.min(total, Math.max(0, nowYear - startYear));
  return Math.round((elapsed / total) * 100);
}
