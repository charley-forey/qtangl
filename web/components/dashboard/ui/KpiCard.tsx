import type { ReactNode } from "react";

export default function KpiCard({
  label,
  value,
  hint,
  delta,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  delta?: string | null;
  tone?: "default" | "critical" | "warning" | "success";
}) {
  const toneClass =
    tone === "critical"
      ? "text-red-300"
      : tone === "warning"
        ? "text-amber-200"
        : tone === "success"
          ? "text-emerald-300"
          : "text-white";

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-black/30 px-4 py-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
      {delta ? <p className="mt-1 text-xs text-[var(--color-gray-400)]">{delta}</p> : null}
      {hint ? <p className="mt-2 text-xs text-[var(--color-gray-500)]">{hint}</p> : null}
    </div>
  );
}
