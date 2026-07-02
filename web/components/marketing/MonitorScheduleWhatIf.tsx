"use client";

import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const CADENCE_OPTIONS = [
  { id: "weekly", label: "Weekly", hours: 168, targets: 12 },
  { id: "monthly", label: "Monthly", hours: 720, targets: 12 },
] as const;

const ALERT_OPTIONS = [
  "New quantum-vulnerable asset",
  "Readiness drop ≥5 pts",
  "Cert expiring ≤30 days",
] as const;

const QUOTA_SCANS_PER_MONTH = 100;

export default function MonitorScheduleWhatIf() {
  const [cadenceId, setCadenceId] = useState<(typeof CADENCE_OPTIONS)[number]["id"]>("weekly");
  const [alertRule, setAlertRule] = useState<string>(ALERT_OPTIONS[0]!);
  const [targetCount, setTargetCount] = useState(12);

  const cadence = CADENCE_OPTIONS.find((c) => c.id === cadenceId)!;

  const projectedScans = useMemo(() => {
    const scansPerTargetPerMonth =
      cadenceId === "weekly" ? 4 : 1;
    return targetCount * scansPerTargetPerMonth;
  }, [cadenceId, targetCount]);

  const withinQuota = projectedScans <= QUOTA_SCANS_PER_MONTH;
  const quotaPct = Math.min(100, Math.round((100 * projectedScans) / QUOTA_SCANS_PER_MONTH));

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Schedule what-if</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Estimate scan quota usage before enabling schedules on your tenant.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Cadence</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CADENCE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setCadenceId(option.id)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    cadenceId === option.id
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-[var(--border)] text-[var(--color-gray-400)]",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="monitor-target-count" className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              Targets in portfolio
            </label>
            <input
              id="monitor-target-count"
              type="range"
              min={1}
              max={25}
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--color-accent)]"
            />
            <p className="mt-1 text-sm text-white">{targetCount} targets</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Alert rule</p>
            <select
              value={alertRule}
              onChange={(e) => setAlertRule(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-black/40 px-3 py-2 text-sm text-white"
            >
              {ALERT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
            Projected usage
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">{projectedScans}</p>
          <p className="text-sm text-[var(--color-gray-400)]">scans / month</p>
          <p className="mt-4 text-xs text-[var(--color-gray-400)]">
            {cadence.label} × {targetCount} targets = {projectedScans} scans/mo
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/60">
            <div
              className={[
                "h-full rounded-full transition-all",
                withinQuota ? "bg-emerald-400/80" : "bg-red-400/80",
              ].join(" ")}
              style={{ width: `${quotaPct}%` }}
              role="progressbar"
              aria-valuenow={projectedScans}
              aria-valuemin={0}
              aria-valuemax={QUOTA_SCANS_PER_MONTH}
            />
          </div>
          <p className={`mt-2 text-xs ${withinQuota ? "text-emerald-300" : "text-red-300"}`}>
            {withinQuota
              ? `Within Monitor quota (${QUOTA_SCANS_PER_MONTH}/mo illustrative)`
              : `Exceeds illustrative quota — reduce targets or cadence`}
          </p>
          <p className="mt-3 text-xs text-[var(--color-gray-500)]">
            Alert: {alertRule}. Every {cadence.hours}h per target.
          </p>
        </div>
      </div>
    </Card>
  );
}
