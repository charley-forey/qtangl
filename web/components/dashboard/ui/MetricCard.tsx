"use client";

import type { ReactNode } from "react";

import InfoTip from "@/components/pqc/InfoTip";
import DrillLink from "@/components/dashboard/ui/DrillLink";

export default function MetricCard({
  label,
  value,
  delta,
  deltaDirection,
  hint,
  glossaryTermId,
  drillHref,
  drillTab,
  drillMetric,
  sparkline,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  delta?: string | null;
  deltaDirection?: "up" | "down" | "neutral";
  hint?: string;
  glossaryTermId?: string;
  drillHref?: string;
  drillTab?: string;
  drillMetric?: string;
  sparkline?: ReactNode;
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

  const deltaClass =
    deltaDirection === "up"
      ? "text-emerald-400"
      : deltaDirection === "down"
        ? "text-red-400"
        : "text-[var(--color-gray-400)]";

  const inner = (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-black/30 px-4 py-4 transition hover:border-[var(--border-strong)]">
      <p className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
        {label}
        {glossaryTermId ? <InfoTip termId={glossaryTermId} /> : null}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
      {delta ? <p className={`mt-1 text-xs ${deltaClass}`}>{delta}</p> : null}
      {sparkline ? <div className="mt-2 h-8">{sparkline}</div> : null}
      {hint ? <p className="mt-2 text-xs text-[var(--color-gray-500)]">{hint}</p> : null}
    </div>
  );

  if (drillHref) {
    return (
      <DrillLink href={drillHref} tab={drillTab} metric={drillMetric ?? label}>
        {inner}
      </DrillLink>
    );
  }
  return inner;
}
