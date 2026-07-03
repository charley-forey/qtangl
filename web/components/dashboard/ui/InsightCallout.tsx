import type { ReactNode } from "react";

type InsightTone = "info" | "warning" | "success" | "neutral";

const toneClasses: Record<InsightTone, string> = {
  info: "border-sky-500/30 bg-sky-500/10 text-sky-100",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  neutral: "border-[var(--border-subtle)] bg-white/5 text-[var(--color-gray-300)]",
};

export default function InsightCallout({
  title,
  children,
  tone = "info",
  action,
}: {
  title?: string;
  children: ReactNode;
  tone?: InsightTone;
  action?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed ${toneClasses[tone]}`}
    >
      <div>
        {title ? <p className="mb-1 font-medium text-white">{title}</p> : null}
        <div>{children}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
