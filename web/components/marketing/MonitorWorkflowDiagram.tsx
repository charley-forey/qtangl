"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import CoverImage from "@/components/marketing/CoverImage";
import MarketingIcon, { type MarketingIconName } from "@/components/marketing/MarketingIcon";
import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type StepId = "schedule" | "scan" | "diff" | "alert" | "dashboard";

type WorkflowStep = {
  id: StepId;
  step: number;
  label: string;
  icon: MarketingIconName;
  headline: string;
  bullets: string[];
  note: string;
  image: string;
  imageAlt: string;
  docHref: string;
  color: string;
};

const STEPS: WorkflowStep[] = [
  {
    id: "schedule",
    step: 1,
    label: "Schedule",
    icon: "monitor",
    headline: "Set cadence per target",
    bullets: [
      "Weekly or monthly re-scans across your portfolio",
      "Quota-aware job queue with next-run visibility",
      "Worker + scheduler required on deploy",
    ],
    note: "Illustrative — configure cadence in your Monitor deployment.",
    image: "/marketing/monitor-scheduled-scans.webp",
    imageAlt: "Calendar grid with scan pulses across a domain portfolio.",
    docHref: "/docs/guides/monitor-setup",
    color: "border-sky-500/40 bg-sky-950/15",
  },
  {
    id: "scan",
    step: 2,
    label: "Scan",
    icon: "assess",
    headline: "Re-inventory authorized targets",
    bullets: [
      "TLS, JWKS, host, and CycloneDX CBOM surfaces",
      "Same methodology as Assess — comparable snapshots",
      "Signed artifacts stored for verify and export",
    ],
    note: "Inventory aid — quantifies exposure; algorithms are not broken today.",
    image: "/marketing/platform-tier-monitor.webp",
    imageAlt: "Monitor tier illustration with scheduled scan pulses.",
    docHref: "/docs/reference/pqc/scenarios",
    color: "border-violet-500/40 bg-violet-950/15",
  },
  {
    id: "diff",
    step: 3,
    label: "Diff",
    icon: "drift",
    headline: "Compare snapshot to snapshot",
    bullets: [
      "Readiness delta and new quantum-vulnerable findings",
      "Cert expiry, cipher downgrades, and source-level drift",
      "Diff payload attaches to alerts and dashboard trends",
    ],
    note: "Scenario preview below uses illustrative fixture data.",
    image: "/marketing/monitor-diff-alerts.webp",
    imageAlt: "Before-and-after TLS bars highlighting a downgrade delta.",
    docHref: "/docs/guides/drift-monitoring",
    color: "border-amber-500/40 bg-amber-950/15",
  },
  {
    id: "alert",
    step: 4,
    label: "Alert",
    icon: "briefing",
    headline: "Route drift to your channels",
    bullets: [
      "Slack, Microsoft Teams, and email digests",
      "qtangl-webhook-v2 for Splunk and SIEM ingestion",
      "Thresholds for readiness drop and new Q-vuln assets",
    ],
    note: "Preview alert payloads in the Alerts section below.",
    image: "/marketing/docs-monitor-workflow.webp",
    imageAlt: "Workflow diagram connecting scan output to notification channels.",
    docHref: "/docs/integrations/siem-webhook-v2",
    color: "border-rose-500/40 bg-rose-950/15",
  },
  {
    id: "dashboard",
    step: 5,
    label: "Dashboard / SIEM",
    icon: "evidence",
    headline: "Trends leadership and auditors expect",
    bullets: [
      "Command center readiness chart and executive digest",
      "Board PDF and QBR exports with signed evidence",
      "SIEM correlation via webhook v2 JSON schema",
    ],
    note: "Verification confirms signing — not complete estate coverage.",
    image: "/marketing/monitor-standards-tracking.webp",
    imageAlt: "Checklist grid mapped to compliance deadline tiers.",
    docHref: "/docs/guides/monitor-workflow",
    color: "border-emerald-500/40 bg-emerald-950/15",
  },
];

const PERSONAS = [
  { role: "Platform", action: "Owns cadence and scan targets" },
  { role: "SecOps", action: "Triage drift diffs and alerts" },
  { role: "GRC", action: "Export QBR trends and evidence" },
] as const;

const STEP_INTERVAL_MS = 4200;

function WorkflowLiveSnippet({ stepId }: { stepId: StepId }) {
  const { scenario } = useMonitorScenario();

  if (stepId === "schedule") {
    return (
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-black/40 px-3 py-2">
          <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">Cadence</dt>
          <dd className="mt-1 font-medium text-white">{scenario.cadence}</dd>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-black/40 px-3 py-2">
          <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">Next run</dt>
          <dd className="mt-1 font-medium text-white">{scenario.nextRun}</dd>
        </div>
      </dl>
    );
  }

  if (stepId === "scan") {
    return (
      <p className="rounded-lg border border-[var(--border-subtle)] bg-black/40 px-3 py-2 font-mono text-xs text-emerald-200/90">
        POST /pqc/scan · target={scenario.target}
      </p>
    );
  }

  if (stepId === "diff") {
    const delta =
      scenario.readinessDelta > 0
        ? `+${scenario.readinessDelta.toFixed(1)}`
        : scenario.readinessDelta.toFixed(1);
    return (
      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-black/40 px-2 py-2">
          <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">Score</dt>
          <dd className="mt-1 font-semibold tabular-nums text-white">{scenario.readinessScore.toFixed(1)}</dd>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-black/40 px-2 py-2">
          <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">Delta</dt>
          <dd
            className={[
              "mt-1 font-semibold tabular-nums",
              scenario.readinessDelta < 0 ? "text-red-300" : "text-emerald-300",
            ].join(" ")}
          >
            {delta}
          </dd>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-black/40 px-2 py-2">
          <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">New QV</dt>
          <dd className="mt-1 font-semibold tabular-nums text-white">{scenario.newQuantumVulnerableCount}</dd>
        </div>
      </dl>
    );
  }

  if (stepId === "alert") {
    return (
      <p className="rounded-lg border border-[var(--border-subtle)] bg-black/40 px-3 py-2 font-mono text-[0.65rem] leading-5 text-[var(--color-gray-300)]">
        {`{ "event": "drift.detected", "readinessDelta": ${scenario.readinessDelta}, "channel": "slack" }`}
      </p>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      <div className="rounded-lg border border-[var(--border-subtle)] bg-black/40 px-3 py-2">
        <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">Last signed</dt>
        <dd className="mt-1 text-xs font-medium text-white">{scenario.evidenceFreshness.lastSignedReport}</dd>
      </div>
      <div className="rounded-lg border border-[var(--border-subtle)] bg-black/40 px-3 py-2">
        <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">Unread alerts</dt>
        <dd className="mt-1 font-medium text-white">{scenario.livePulse.unreadAlerts}</dd>
      </div>
    </dl>
  );
}

export default function MonitorWorkflowDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scenario } = useMonitorScenario();
  const [activeIndex, setActiveIndex] = useState(0);
  const [manual, setManual] = useState(false);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(true);

  const active = STEPS[activeIndex];

  const selectStep = useCallback((index: number) => {
    setManual(true);
    setPlaying(false);
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25, rootMargin: "-5% 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || manual || !playing) return;

    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % STEPS.length);
    }, STEP_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [visible, manual, playing]);

  const progress = STEPS.length > 1 ? (activeIndex / (STEPS.length - 1)) * 100 : 0;

  return (
    <div ref={containerRef}>
      <AnimatedBorderFrame className="overflow-hidden rounded-[var(--radius-feature)]">
        <Card
          tone="feature"
          size="lg"
          className="rounded-[var(--radius-feature)] border-0 bg-transparent"
          role="group"
          aria-label="Monitor workflow: schedule, scan, diff, alert, dashboard and SIEM"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Eyebrow>Five-step loop</Eyebrow>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-gray-400)]">
                Click a step or let the tour advance — each stage shows what Monitor does with illustrative
                fixture data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setManual(false);
                setPlaying((p) => !p);
              }}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--color-gray-400)] transition hover:border-[var(--border-strong)] hover:text-white"
            >
              {playing && !manual ? "Pause tour" : "Play tour"}
            </button>
          </div>

          <div className="relative mt-8 hidden sm:block">
            <div className="absolute left-6 right-6 top-5 h-px bg-[var(--border-subtle)]" aria-hidden />
            <div
              className="absolute left-6 top-5 h-px bg-gradient-to-r from-sky-400/80 to-emerald-400/80 motion-safe:transition-all motion-safe:duration-700"
              style={{ width: `calc((100% - 3rem) * ${progress / 100})` }}
              aria-hidden
            />
            <ol className="relative flex justify-between gap-2">
              {STEPS.map((step, index) => {
                const isActive = index === activeIndex;
                return (
                  <li key={step.id} className="flex flex-1 flex-col items-center">
                    <button
                      type="button"
                      onClick={() => selectStep(index)}
                      aria-current={isActive ? "step" : undefined}
                      className={[
                        "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition motion-safe:duration-300",
                        isActive
                          ? "border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.2)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--color-gray-400)] hover:border-[var(--border-strong)] hover:text-white",
                      ].join(" ")}
                    >
                      {step.step}
                    </button>
                    <span
                      className={[
                        "mt-3 hidden text-center text-xs font-medium lg:block",
                        isActive ? "text-white" : "text-[var(--color-gray-500)]",
                      ].join(" ")}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 sm:hidden">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => selectStep(index)}
                aria-current={index === activeIndex ? "step" : undefined}
                className={[
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  index === activeIndex
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-[var(--border)] text-[var(--color-gray-400)]",
                ].join(" ")}
              >
                {step.step}. {step.label}
              </button>
            ))}
          </div>

          <div
            className={[
              "mt-8 grid overflow-hidden rounded-[var(--radius-xl)] border-2 motion-safe:transition-colors motion-safe:duration-500 lg:grid-cols-[1.05fr_0.95fr]",
              active.color,
            ].join(" ")}
          >
            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30">
                    <MarketingIcon name={active.icon} className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-400)]">
                      Step {active.step} · {active.label}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white sm:text-xl">{active.headline}</h3>
                  </div>
                </div>

                <ul className="mt-6 space-y-2.5">
                  {active.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-sm leading-6 text-[var(--color-gray-200)]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" aria-hidden />
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
                    Live preview · {scenario.label} scenario
                  </p>
                  <div className="mt-2">
                    <WorkflowLiveSnippet stepId={active.id} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={active.docHref}
                  className="text-sm font-medium text-white underline underline-offset-4 hover:text-[var(--color-gray-200)]"
                >
                  Read the guide →
                </Link>
                <p className="text-xs leading-5 text-[var(--color-gray-500)]">{active.note}</p>
              </div>
            </div>

            <div className="relative min-h-[14rem] border-t border-white/10 lg:min-h-[20rem] lg:border-l lg:border-t-0">
              <CoverImage
                src={active.image}
                alt={active.imageAlt}
                className="object-cover opacity-90 grayscale motion-safe:transition-opacity motion-safe:duration-500"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent lg:bg-gradient-to-l lg:from-black/60 lg:via-transparent lg:to-transparent" />
              {playing && !manual && visible ? (
                <span className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-white/80 motion-safe:animate-pulse">
                  Auto-advancing
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {PERSONAS.map((persona) => (
              <div
                key={persona.role}
                className="rounded-lg border border-[var(--border-subtle)] bg-black/30 px-4 py-3 text-center"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gray-500)]">
                  {persona.role}
                </p>
                <p className="mt-1 text-sm text-white">{persona.action}</p>
              </div>
            ))}
          </div>
        </Card>
      </AnimatedBorderFrame>
    </div>
  );
}
