import { ReactNode } from "react";

import Card from "@/components/ui/Card";

export function EvFleetSection({
  children,
  className = "",
  tone = "strong" as "panel" | "strong" | "feature",
}: {
  children: ReactNode;
  className?: string;
  tone?: "panel" | "strong" | "feature";
}) {
  return (
    <Card tone={tone} className={`ev-fleet-section ${className}`.trim()}>
      {children}
    </Card>
  );
}

export function EvFleetSectionHeader({
  label,
  title,
  description,
  action,
}: {
  label: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-label">{label}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
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

export function EvFleetMetric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="ev-fleet-metric">
      <p className="ev-fleet-metric-label">{label}</p>
      <p className="ev-fleet-metric-value">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--color-gray-500)]">{hint}</p> : null}
    </div>
  );
}

export function EvFleetChip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "alert";
}) {
  return <span className={`ev-fleet-chip ev-fleet-chip-${tone}`}>{children}</span>;
}

export function EvFleetEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-black/20 px-5 py-8 text-center">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-gray-400)]">
        {description}
      </p>
    </div>
  );
}

export function EvFleetInputLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const evFleetInputClass =
  "ev-fleet-input w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-white transition focus:border-[var(--input-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]";

export function EvFleetTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
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
              : "border-[var(--border)] bg-transparent text-[var(--color-gray-300)] hover:text-white",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
