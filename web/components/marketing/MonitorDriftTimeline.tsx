"use client";

import { useCallback } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import ScanDiffPanel from "@/components/pqc/ScanDiffPanel";
import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";
import { trackEvent } from "@/lib/analytics";

export default function MonitorDriftTimeline() {
  const { scenario, weekIndex, setWeekIndex } = useMonitorScenario();
  const weeks = scenario.weeks;
  const current = weeks[weekIndex] ?? weeks[weeks.length - 1]!;
  const trendSlice = weeks.slice(0, weekIndex + 1).map((w) => w.trendPoint);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setWeekIndex(Math.max(0, weekIndex - 1));
        trackEvent("monitor_timeline_scrubbed", { week: weekIndex - 1 });
      } else if (event.key === "ArrowRight") {
        setWeekIndex(Math.min(weeks.length - 1, weekIndex + 1));
        trackEvent("monitor_timeline_scrubbed", { week: weekIndex + 1 });
      }
    },
    [weekIndex, weeks.length, setWeekIndex]
  );

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]" id="drift-timeline">
      <Eyebrow>Drift timeline — scrub weekly scans</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Use the slider or arrow keys to walk through {weeks.length} weeks of scheduled re-scans.
      </p>

      <div className="mt-6" onKeyDown={onKeyDown}>
        <input
          type="range"
          min={0}
          max={weeks.length - 1}
          value={weekIndex}
          onChange={(e) => {
            const next = Number(e.target.value);
            setWeekIndex(next);
            trackEvent("monitor_timeline_scrubbed", { week: next });
          }}
          className="w-full accent-[var(--color-accent)]"
          aria-valuemin={0}
          aria-valuemax={weeks.length - 1}
          aria-valuenow={weekIndex}
          aria-label="Drift timeline week"
        />
        <div className="mt-2 flex justify-between text-xs text-[var(--color-gray-500)]">
          <span>{weeks[0]?.weekLabel}</span>
          <span className="font-medium text-white">
            {current.weekLabel} · Score {current.trendPoint.readinessScore}
          </span>
          <span>{weeks[weeks.length - 1]?.weekLabel}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ScanDiffPanel diff={current.diff} />
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
            Trend through {current.weekLabel}
          </p>
          <ul className="mt-3 space-y-2">
            {trendSlice.map((point) => (
              <li
                key={point.scanId}
                className="flex justify-between text-sm text-[var(--color-gray-300)]"
              >
                <span>
                  {new Date(point.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="font-mono">{point.readinessScore}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
