"use client";

import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";

export default function MonitorLivePulse() {
  const { scenario } = useMonitorScenario();
  const { livePulse } = scenario;
  const healthy = livePulse.schedulerStatus === "healthy";

  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-gray-400)]"
      aria-live="polite"
    >
      <span className="flex items-center gap-2">
        <span
          className={[
            "inline-block h-2 w-2 rounded-full",
            healthy ? "bg-emerald-400 motion-safe:animate-pulse" : "bg-amber-400",
          ].join(" ")}
          aria-hidden
        />
        Scheduler {healthy ? "healthy" : "offline"}
      </span>
      <span>Last scan {livePulse.lastScanAgo}</span>
      <span>
        {livePulse.unreadAlerts} unread alert{livePulse.unreadAlerts === 1 ? "" : "s"}
      </span>
      <span className="text-[var(--color-gray-500)]">Simulated — illustrative preview</span>
    </div>
  );
}
