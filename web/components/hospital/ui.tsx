import { ReactNode } from "react";

import Card from "@/components/ui/Card";

/* ——— Section chrome ——— */

type HospitalSectionProps = {
  children: ReactNode;
  className?: string;
  tone?: "panel" | "strong" | "feature";
};

export function HospitalSection({
  children,
  className = "",
  tone = "strong",
}: HospitalSectionProps) {
  return (
    <Card tone={tone} className={`hospital-section ${className}`.trim()}>
      {children}
    </Card>
  );
}

type HospitalSectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function HospitalSectionHeader({
  label,
  title,
  description,
  action,
}: HospitalSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-label">{label}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-gray-400)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type HospitalMetricProps = {
  label: string;
  value: string;
  hint?: string;
};

export function HospitalMetric({ label, value, hint }: HospitalMetricProps) {
  return (
    <div className="hospital-metric">
      <p className="hospital-metric-label">{label}</p>
      <p className="hospital-metric-value">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--color-gray-500)]">{hint}</p> : null}
    </div>
  );
}

type HospitalChipProps = {
  children: ReactNode;
  tone?: "neutral" | "success" | "alert";
};

export function HospitalChip({ children, tone = "neutral" }: HospitalChipProps) {
  return (
    <span className={`hospital-chip hospital-chip-${tone}`}>
      {children}
    </span>
  );
}

type HospitalEmptyStateProps = {
  title: string;
  description: string;
};

export function HospitalEmptyState({ title, description }: HospitalEmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-black/20 px-5 py-8 text-center">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-gray-400)]">
        {description}
      </p>
    </div>
  );
}

export function HospitalInputLabel({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
      <span className="flex items-baseline justify-between gap-2">
        <span>{label}</span>
        {hint ? <span className="text-xs text-[var(--color-gray-500)]">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export const hospitalInputClass =
  "hospital-input w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-white transition focus:border-[var(--input-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]";

/* ——— Tabs ——— */

type HospitalTab<T extends string> = { id: T; label: string };

type HospitalTabsProps<T extends string> = {
  tabs: readonly HospitalTab<T>[];
  active: T;
  onChange: (id: T) => void;
};

export function HospitalTabs<T extends string>({
  tabs,
  active,
  onChange,
}: HospitalTabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            "rounded-full border px-4 py-2 text-sm font-medium transition",
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
