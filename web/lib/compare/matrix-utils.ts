import type { CapabilityRow, MatrixCell } from "@/lib/competitors-types";
import { CAPABILITY_LABELS } from "@/lib/competitors-types";

export function matrixCellLabel(cell: MatrixCell): string {
  switch (cell) {
    case "yes":
      return "Yes";
    case "partial":
      return "Partial";
    case "no":
      return "No";
    case "unknown":
      return "Unknown";
  }
}

export function matrixCellTone(cell: MatrixCell): "strong" | "default" | "muted" {
  if (cell === "yes") return "strong";
  if (cell === "partial") return "default";
  return "muted";
}

export function isQtanglOnlyWin(
  qtangl: CapabilityRow,
  competitor: CapabilityRow,
  key: keyof CapabilityRow,
): boolean {
  return qtangl[key] === "yes" && competitor[key] !== "yes";
}

export const capabilityRows = CAPABILITY_LABELS;
