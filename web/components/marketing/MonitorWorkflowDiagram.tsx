"use client";

import { useState } from "react";

const STEPS = [
  { id: "schedule", label: "Schedule", detail: "Weekly or monthly re-scan cadence per target" },
  { id: "scan", label: "Scan", detail: "Authorized TLS, JWKS, host, and CBOM inventory" },
  { id: "diff", label: "Diff", detail: "Compare to prior snapshot — readiness delta + new findings" },
  { id: "alert", label: "Alert", detail: "Slack, Teams, email, qtangl-webhook-v2" },
  { id: "dashboard", label: "Dashboard / SIEM", detail: "Command center trends + SIEM ingestion" },
] as const;

export default function MonitorWorkflowDiagram() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        role="img"
        aria-label="Monitor workflow: Schedule, Scan, Diff, Alert, Dashboard and SIEM"
      >
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onMouseEnter={() => setActive(step.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(step.id)}
              onBlur={() => setActive(null)}
              className={[
                "rounded-xl border px-3 py-2 text-xs font-medium transition sm:px-4 sm:py-2.5 sm:text-sm",
                active === step.id
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-[var(--border)] text-[var(--color-gray-300)] hover:border-[var(--border-strong)]",
              ].join(" ")}
            >
              {step.label}
            </button>
            {index < STEPS.length - 1 ? (
              <span className="text-[var(--color-gray-600)]" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-[var(--color-gray-400)]">
        {active
          ? STEPS.find((s) => s.id === active)?.detail
          : "Hover or focus a step to see what happens at each stage."}
      </p>
    </div>
  );
}
