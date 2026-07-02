"use client";

import { useEffect, useState } from "react";

import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export default function MonitorHeroVisual() {
  const { scenario } = useMonitorScenario();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const trend = scenario.weeks.slice(-5).map((w) => w.trendPoint.readinessScore);
  const max = Math.max(...trend, 100);
  const delta = scenario.readinessDelta;
  const deltaLabel = delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);

  function scrollToCommandCenter() {
    const el = document.getElementById("command-center");
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <Card
      tone="feature"
      className="relative overflow-hidden rounded-[var(--radius-xl)] border border-white/10 p-5 sm:p-6"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-400/20 blur-3xl motion-safe:animate-pulse"
        aria-hidden
      />
      <Eyebrow>Live preview pulse</Eyebrow>
      <p className="mt-2 text-xs text-[var(--color-gray-500)]">{scenario.label} scenario · illustrative</p>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Readiness</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums text-white sm:text-5xl">
            {scenario.readinessScore.toFixed(1)}
          </p>
          <p
            className={[
              "mt-1 text-sm font-medium tabular-nums",
              delta < 0 ? "text-red-300" : delta > 0 ? "text-emerald-300" : "text-[var(--color-gray-400)]",
            ].join(" ")}
          >
            {deltaLabel} vs prior scan
          </p>
        </div>
        <div className="flex h-20 items-end gap-1.5" role="img" aria-label="Recent readiness trend">
          {trend.map((score, index) => (
            <div
              key={`${score}-${index}`}
              className={[
                "w-3 rounded-t bg-[var(--color-accent)]/80 sm:w-4",
                mounted ? "motion-safe:animate-[monitorBarRise_0.6s_ease-out_both]" : "h-0",
              ].join(" ")}
              style={{
                height: mounted ? `${Math.max(12, (score / max) * 100)}%` : "0%",
                animationDelay: `${index * 80}ms`,
              }}
            />
          ))}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-black/30 px-2 py-2">
          <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">New QV</dt>
          <dd className="mt-1 text-sm font-semibold text-white">{scenario.newQuantumVulnerableCount}</dd>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-black/30 px-2 py-2">
          <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">Certs</dt>
          <dd className="mt-1 text-sm font-semibold text-white">{scenario.certExpiringCount}</dd>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-black/30 px-2 py-2">
          <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">Cadence</dt>
          <dd className="mt-1 text-xs font-semibold text-white">{scenario.cadence}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={scrollToCommandCenter}
        className="mt-6 w-full rounded-full border border-[var(--border-strong)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
      >
        Explore command center ↓
      </button>
    </Card>
  );
}
