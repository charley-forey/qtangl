import type { ReactNode } from "react";

export function PqcSection({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-gray-300)]">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PqcChip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "danger" | "warn" | "ok";
}) {
  const tones = {
    neutral: "bg-white/5 text-[var(--color-gray-200)]",
    danger: "bg-red-500/15 text-red-200",
    warn: "bg-amber-500/15 text-amber-200",
    ok: "bg-emerald-500/15 text-emerald-200",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
