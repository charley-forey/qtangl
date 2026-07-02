import type { ReactNode } from "react";

export function PqcSection({
  title,
  children,
  action,
  id,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
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

export function PqcTabs<T extends string>({
  tabs,
  active,
  onChange,
  className = "",
}: {
  tabs: readonly { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="tablist" aria-label="Assessment results">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          aria-controls={`assess-panel-${tab.id}`}
          id={`assess-tab-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={[
            "touch-target rounded-full border px-4 py-2 text-sm font-medium transition",
            active === tab.id
              ? "border-[var(--border-strong)] bg-white text-black"
              : "border-[var(--border)] bg-transparent text-[var(--color-gray-300)] hover:border-[var(--border-strong)] hover:text-white",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function PqcCollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="rounded-lg border border-[var(--color-border)] bg-black/20" open={defaultOpen}>
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-[var(--color-gray-300)]">
        {title}
      </summary>
      <div className="border-t border-[var(--color-border)] px-4 py-4">{children}</div>
    </details>
  );
}

export function PqcTabPanel({
  id,
  active,
  tabId,
  children,
  className = "",
}: {
  id: string;
  active: boolean;
  tabId: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={`assess-tab-${tabId}`}
      hidden={!active}
      className={`space-y-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
