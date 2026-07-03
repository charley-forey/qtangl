"use client";

import { useState } from "react";
import Link from "next/link";

import ConvertChartFrame from "@/components/marketing/ConvertChartFrame";
import { useConvertDemo } from "@/components/marketing/convert-demo-context";
import MigrationGantt from "@/components/pqc/MigrationGantt";
import ReadinessTrend from "@/components/pqc/ReadinessTrend";
import RemediationVelocityChart from "@/components/pqc/RemediationVelocityChart";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  convertPreviewBaseline,
  convertPreviewItems,
  convertPreviewPeerBenchmark,
  convertPreviewTrend,
  convertPreviewVelocity,
  type ConvertPreviewItem,
} from "@/lib/copy/readiness-demos";

const COLUMNS: Array<{
  key: ConvertPreviewItem["status"];
  label: string;
  accent: string;
  headerBg: string;
  dot: string;
  bar: string;
}> = [
  {
    key: "open",
    label: "Open",
    accent: "border-amber-500/40",
    headerBg: "bg-amber-950/25",
    dot: "bg-amber-400",
    bar: "bg-amber-400/70",
  },
  {
    key: "in_progress",
    label: "In progress",
    accent: "border-sky-500/40",
    headerBg: "bg-sky-950/25",
    dot: "bg-sky-400",
    bar: "bg-sky-400/70",
  },
  {
    key: "done",
    label: "Done",
    accent: "border-emerald-500/40",
    headerBg: "bg-emerald-950/25",
    dot: "bg-emerald-400",
    bar: "bg-emerald-400/70",
  },
];

const SEVERITY_STYLES: Record<
  string,
  { label: string; chip: string; stripe: string }
> = {
  high: {
    label: "High",
    chip: "bg-red-500/15 text-red-200 ring-red-500/30",
    stripe: "bg-red-500/70",
  },
  medium: {
    label: "Medium",
    chip: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
    stripe: "bg-amber-500/70",
  },
  low: {
    label: "Low",
    chip: "bg-sky-500/15 text-sky-200 ring-sky-500/30",
    stripe: "bg-sky-500/60",
  },
};

function severityStyle(severity: string) {
  return SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.medium;
}

function columnItems(items: ConvertPreviewItem[], key: ConvertPreviewItem["status"]) {
  return items.filter((item) =>
    key === "done"
      ? item.status === "done" || item.status === "accepted_risk"
      : item.status === key
  );
}

const WAVE_FILTERS = [
  ["all", "All waves"],
  [1, "Wave 1"],
  [2, "Wave 2"],
  [3, "Wave 3"],
] as const;

const WAVE_COLORS: Record<number, string> = {
  1: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30",
  2: "bg-sky-500/15 text-sky-200 ring-sky-500/30",
  3: "bg-violet-500/15 text-violet-200 ring-violet-500/30",
};

const ANALYTICS_TABS = [
  { id: "trend" as const, label: "Trend" },
  { id: "velocity" as const, label: "Velocity" },
  { id: "deadlines" as const, label: "Deadlines" },
];

function ownerInitial(owner: string) {
  return owner.trim().charAt(0).toUpperCase();
}

function CompletionRing({ pct }: { pct: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90" aria-hidden>
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="4"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}

function PeerBenchmarkCard() {
  const b = convertPreviewPeerBenchmark;
  const min = Math.max(0, b.p25 - 8);
  const max = b.p75 + 5;
  const span = max - min;
  const pos = (v: number) => `${((v - min) / span) * 100}%`;

  const aboveMedian = b.yourScore >= b.median;
  const deltaMedian = Math.abs(b.yourScore - b.median).toFixed(1);

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-gradient-to-br from-black/50 to-black/30 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-label">Peer benchmark</p>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.65rem] text-[var(--color-gray-400)]">
          Opt-in cohort
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--color-gray-300)]">
        You&apos;re{" "}
        <span className={aboveMedian ? "font-semibold text-emerald-300" : "font-semibold text-amber-300"}>
          {deltaMedian} pts {aboveMedian ? "above" : "below"} median
        </span>{" "}
        for your cohort.
      </p>

      <div className="relative mt-5 h-4 rounded-full bg-white/[0.06]">
        <div
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-white/10 to-white/20"
          style={{ left: pos(b.p25), width: `${((b.p75 - b.p25) / span) * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-5 w-1 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          style={{ left: pos(b.median) }}
          title={`Median ${b.median}`}
        />
        <div
          className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black shadow-[0_0_12px_rgba(255,255,255,0.35)] transition-all duration-500"
          style={{ left: pos(b.yourScore) }}
          title={`Your score ${b.yourScore}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </div>
      </div>

      <div className="relative mt-2 h-4">
        {[
          { label: "P25", value: b.p25 },
          { label: "Med", value: b.median },
          { label: "P75", value: b.p75 },
        ].map((tick) => (
          <span
            key={tick.label}
            className="absolute -translate-x-1/2 text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-600)]"
            style={{ left: pos(tick.value) }}
          >
            {tick.label}
          </span>
        ))}
      </div>

      <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
        {[
          { label: "P25", value: b.p25 },
          { label: "Median", value: b.median },
          { label: "You", value: b.yourScore, highlight: true },
          { label: "P75", value: b.p75 },
        ].map((item) => (
          <div
            key={item.label}
            className={[
              "rounded-lg border px-1 py-1.5",
              item.highlight
                ? "border-white/20 bg-white/[0.06]"
                : "border-transparent",
            ].join(" ")}
          >
            <dt className="text-[0.6rem] uppercase tracking-wider text-[var(--color-gray-500)]">
              {item.label}
            </dt>
            <dd
              className={[
                "mt-0.5 text-sm font-semibold tabular-nums",
                item.highlight ? "text-white" : "text-[var(--color-gray-400)]",
              ].join(" ")}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs leading-5 text-[var(--color-gray-500)]">{b.label}</p>
    </div>
  );
}

function KanbanCard({ item }: { item: ConvertPreviewItem }) {
  const { selected, toggle } = useConvertDemo();
  const isSelected = selected.has(item.id);
  const wave = item.wave ?? 1;
  const sev = severityStyle(item.severity);

  return (
    <button
      type="button"
      onClick={() => toggle(item.id)}
      className={[
        "group relative w-full overflow-hidden rounded-[var(--radius-lg)] border pl-5 pr-4 py-4 text-left transition duration-300",
        isSelected
          ? "border-emerald-500/45 bg-emerald-950/20 shadow-[0_0_0_1px_rgba(52,211,153,0.15),inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "border-[var(--border)] bg-black/35 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-black/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
      ].join(" ")}
      aria-label={`Include ${item.title} in what-if projection`}
      aria-pressed={isSelected}
    >
      <span
        className={["absolute inset-y-0 left-0 w-1", sev.stripe].join(" ")}
        aria-hidden
      />
      <div className="flex items-start gap-3">
        <span
          className={[
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[0.7rem] transition",
            isSelected
              ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200"
              : "border-[var(--border-strong)] bg-black/40 text-transparent group-hover:border-white/30 group-hover:text-white/40",
          ].join(" ")}
          aria-hidden
        >
          ✓
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ring-1 ring-inset",
                WAVE_COLORS[wave] ?? WAVE_COLORS[1],
              ].join(" ")}
            >
              Wave {wave}
            </span>
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ring-1 ring-inset",
                sev.chip,
              ].join(" ")}
            >
              {sev.label}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium leading-snug text-white">{item.title}</p>
          <p className="mt-1.5 line-clamp-2 text-[0.7rem] leading-5 text-[var(--color-gray-500)] transition group-hover:text-[var(--color-gray-400)]">
            {item.playbook}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
            <span className="flex min-w-0 items-center gap-2 text-xs text-[var(--color-gray-400)]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.65rem] font-semibold text-white">
                {ownerInitial(item.owner)}
              </span>
              <span className="truncate">{item.owner}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
              +{item.impactPoints}
              <span className="text-[0.6rem] font-normal text-emerald-400/70">pts</span>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function DesktopKanban({ filtered }: { filtered: ConvertPreviewItem[] }) {
  const { selected } = useConvertDemo();

  return (
    <div className="hidden gap-4 md:grid md:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = columnItems(filtered, col.key);
        const selectedInCol = items.filter((i) => selected.has(i.id)).length;
        const selectedPct = items.length ? (selectedInCol / items.length) * 100 : 0;
        return (
          <div
            key={col.key}
            className={[
              "flex min-h-[16rem] flex-col rounded-[var(--radius-xl)] border bg-black/25",
              col.accent,
            ].join(" ")}
          >
            <div
              className={[
                "rounded-t-[var(--radius-xl)] border-b border-[var(--border-subtle)] px-4 pt-3 pb-3",
                col.headerBg,
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                  <span className={["h-2 w-2 rounded-full", col.dot].join(" ")} aria-hidden />
                  {col.label}
                </p>
                <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs tabular-nums text-[var(--color-gray-300)]">
                  {items.length}
                </span>
              </div>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-black/40">
                <div
                  className={["h-full rounded-full transition-[width] duration-500", col.bar].join(" ")}
                  style={{ width: `${selectedPct}%` }}
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 p-3">
              {items.length ? (
                items.map((item) => <KanbanCard key={item.id} item={item} />)
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-1 py-8 text-center">
                  <span className="text-xs text-[var(--color-gray-600)]">No items in this stage</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MobileKanbanAccordion({ filtered }: { filtered: ConvertPreviewItem[] }) {
  const [openColumn, setOpenColumn] = useState<ConvertPreviewItem["status"] | "done" | null>("open");

  return (
    <div className="space-y-2.5 md:hidden">
      {COLUMNS.map((col) => {
        const items = columnItems(filtered, col.key);
        const open = openColumn === col.key;
        return (
          <div
            key={col.key}
            className={["overflow-hidden rounded-[var(--radius-xl)] border", col.accent, "bg-black/30"].join(
              " "
            )}
          >
            <button
              type="button"
              className={["flex w-full items-center justify-between px-4 py-3.5 text-left", col.headerBg].join(
                " "
              )}
              onClick={() => setOpenColumn(open ? null : col.key)}
              aria-expanded={open}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className={["h-2 w-2 rounded-full", col.dot].join(" ")} aria-hidden />
                {col.label}
              </span>
              <span className="text-xs text-[var(--color-gray-400)]">
                {items.length} · {open ? "−" : "+"}
              </span>
            </button>
            {open ? (
              <div className="space-y-2.5 border-t border-[var(--border-subtle)] p-3">
                {items.map((item) => (
                  <KanbanCard key={item.id} item={item} />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function BoardSummary({ filtered }: { filtered: ConvertPreviewItem[] }) {
  const { selected, projectedScore } = useConvertDemo();
  const selectedItems = filtered.filter((i) => selected.has(i.id));
  const selectedPts = selectedItems.reduce((sum, i) => sum + i.impactPoints, 0);
  const lift = projectedScore - convertPreviewBaseline.currentScore;

  const waveCounts = [1, 2, 3].map((w) => ({
    wave: w,
    count: selectedItems.filter((i) => (i.wave ?? 1) === w).length,
  }));

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-gray-500)]">In what-if</p>
          <p className="mt-0.5 text-sm font-semibold text-white">
            {selectedItems.length} {selectedItems.length === 1 ? "item" : "items"}
            <span className="ml-1.5 text-[var(--color-gray-500)]">· +{selectedPts} pts</span>
          </p>
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">
          {waveCounts.map(({ wave, count }) => (
            <span
              key={wave}
              className={[
                "rounded-full px-2 py-0.5 text-[0.65rem] font-medium ring-1 ring-inset transition",
                count > 0
                  ? WAVE_COLORS[wave]
                  : "bg-transparent text-[var(--color-gray-600)] ring-[var(--border)]",
              ].join(" ")}
            >
              W{wave} · {count}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-950/20 px-3 py-1.5">
        <span className="text-[0.65rem] uppercase tracking-wider text-emerald-300/80">Projected lift</span>
        <span className="text-sm font-semibold tabular-nums text-emerald-300">
          {lift > 0 ? `+${lift.toFixed(1)}` : lift.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  const [tab, setTab] = useState<(typeof ANALYTICS_TABS)[number]["id"]>("trend");
  const { projectedScore } = useConvertDemo();

  return (
    <div className="flex h-full flex-col gap-4">
      <Card tone="panel" className="flex flex-1 flex-col rounded-[var(--radius-xl)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Eyebrow>Program analytics</Eyebrow>
          <div
            className="inline-flex rounded-full border border-[var(--border)] bg-black/40 p-0.5"
            role="tablist"
            aria-label="Analytics views"
          >
            {ANALYTICS_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  tab === t.id
                    ? "bg-white/10 text-white"
                    : "text-[var(--color-gray-500)] hover:text-white",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 min-h-[12rem] flex-1">
          {tab === "trend" ? (
            <ConvertChartFrame heightClass="h-48">
              <ReadinessTrend
                points={[...convertPreviewTrend]}
                forceChart
                showBands
                showLegend
                forecast={{
                  current: convertPreviewBaseline.currentScore,
                  projected: projectedScore,
                }}
              />
            </ConvertChartFrame>
          ) : null}
          {tab === "velocity" ? (
            <ConvertChartFrame heightClass="h-48">
              <RemediationVelocityChart points={convertPreviewVelocity} forceChart />
            </ConvertChartFrame>
          ) : null}
          {tab === "deadlines" ? (
            <div className="py-1">
              <MigrationGantt />
            </div>
          ) : null}
        </div>
      </Card>
      <PeerBenchmarkCard />
    </div>
  );
}

export default function ConvertProgramSimulator() {
  const {
    waveFilter,
    setWaveFilter,
    projectedScore,
    scoreFlash,
    resetDemo,
    applyWave1Preset,
    demoNotice,
    clearDemoNotice,
    selected,
  } = useConvertDemo();

  const filtered =
    waveFilter === "all" ? convertPreviewItems : convertPreviewItems.filter((i) => i.wave === waveFilter);

  const doneCount = convertPreviewItems.filter(
    (item) => item.status === "done" || item.status === "accepted_risk"
  ).length;
  const completionPct = Math.round((100 * doneCount) / convertPreviewItems.length);
  const scoreDelta = projectedScore - convertPreviewBaseline.currentScore;
  const selectedCount = selected.size;

  return (
    <div className="space-y-6 lg:space-y-8">
      <AnimatedBorderFrame className="overflow-hidden rounded-[var(--radius-feature)]">
        <Card
          tone="feature"
          size="lg"
          className="rounded-[var(--radius-feature)] border-0 bg-transparent p-5 sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Eyebrow>Live preview — Convert tier</Eyebrow>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-emerald-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Interactive
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-gray-300)] sm:text-base">
                Prioritized backlog with what-if projection. Toggle items to model readiness lift — full
                workflow on the{" "}
                <Link href="/command-center" className="text-white underline underline-offset-4">
                  tenant dashboard
                </Link>{" "}
                with your API key.
              </p>
            </div>
            <p className="shrink-0 text-sm text-[var(--color-gray-500)]">
              <span className="font-medium text-white">{selectedCount}</span> of{" "}
              {convertPreviewItems.length} in what-if
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40 p-5 sm:p-6">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
                Current score
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white sm:text-4xl">
                {convertPreviewBaseline.currentScore}
              </p>
            </div>

            <div
              className={[
                "relative overflow-hidden rounded-[var(--radius-xl)] border p-5 sm:p-6 transition duration-500",
                scoreFlash
                  ? "border-emerald-500/50 bg-emerald-950/25"
                  : "border-emerald-500/25 bg-gradient-to-br from-emerald-950/30 to-black/40",
              ].join(" ")}
            >
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-emerald-300/80">
                Projected (what-if)
              </p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-emerald-300 sm:text-4xl">
                  {projectedScore.toFixed(1)}
                </p>
                {scoreDelta > 0 ? (
                  <span className="mb-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium tabular-nums text-emerald-200">
                    +{scoreDelta.toFixed(1)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40 p-5 sm:p-6">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
                Completion
              </p>
              <div className="mt-2 flex items-center gap-4">
                <CompletionRing pct={completionPct} />
                <p className="text-3xl font-semibold tabular-nums text-white sm:text-4xl">{completionPct}%</p>
              </div>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40 p-5 sm:p-6">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
                Velocity
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-white sm:text-4xl">
                {convertPreviewBaseline.itemsPerWeek}
                <span className="ml-1 text-lg font-normal text-[var(--color-gray-500)]">/wk</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div
              className="inline-flex flex-wrap gap-1 rounded-full border border-[var(--border)] bg-black/50 p-1"
              role="group"
              aria-label="Filter by migration wave"
            >
              {WAVE_FILTERS.map(([id, label]) => (
                <button
                  key={String(id)}
                  type="button"
                  onClick={() => setWaveFilter(id as "all" | 1 | 2 | 3)}
                  className={[
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                    waveFilter === id
                      ? "bg-white text-black shadow-sm"
                      : "text-[var(--color-gray-400)] hover:text-white",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={applyWave1Preset}>
                Apply Wave 1 preset
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={resetDemo}>
                Reset demo
              </Button>
            </div>
          </div>

          {demoNotice ? (
            <div className="mt-4 flex items-start justify-between gap-3 rounded-[var(--radius-xl)] border border-sky-500/30 bg-sky-950/20 px-4 py-3 text-sm text-sky-100">
              <span>{demoNotice}</span>
              <button
                type="button"
                className="shrink-0 text-xs text-sky-300 underline"
                onClick={clearDemoNotice}
              >
                Dismiss
              </button>
            </div>
          ) : null}

          <p className="mt-4 text-xs leading-6 text-[var(--color-gray-500)] sm:text-sm">
            Select backlog items to simulate projected readiness after remediation. Estimate only — assumes
            successful re-scan verification.
          </p>
        </Card>
      </AnimatedBorderFrame>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Eyebrow>Remediation board</Eyebrow>
            <span className="hidden text-xs text-[var(--color-gray-500)] sm:inline">
              Click cards to include in projection
            </span>
          </div>
          <BoardSummary filtered={filtered} />
          <MobileKanbanAccordion filtered={filtered} />
          <DesktopKanban filtered={filtered} />
        </div>
        <div className="lg:col-span-5">
          <AnalyticsPanel />
        </div>
      </div>
    </div>
  );
}
