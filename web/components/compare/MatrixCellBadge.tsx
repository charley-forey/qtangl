import type { MatrixCell } from "@/lib/competitors-types";
import { matrixCellLabel, matrixCellTone } from "@/lib/compare/matrix-utils";

type MatrixCellBadgeProps = {
  cell: MatrixCell;
  highlight?: boolean;
};

export default function MatrixCellBadge({ cell, highlight }: MatrixCellBadgeProps) {
  const tone = matrixCellTone(cell);
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        highlight
          ? "border-[#6ee7a0]/50 bg-[#6ee7a0]/15 text-[#6ee7a0]"
          : tone === "strong"
            ? "border-[var(--border-strong)] bg-white/[0.08] text-white"
            : tone === "default"
              ? "border-[var(--border)] text-[var(--color-gray-300)]"
              : "border-[var(--border)] text-[var(--color-gray-500)]",
      ].join(" ")}
    >
      {matrixCellLabel(cell)}
    </span>
  );
}
