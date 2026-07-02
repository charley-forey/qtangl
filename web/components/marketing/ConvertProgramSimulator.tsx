"use client";

import Link from "next/link";

import { useConvertDemo } from "@/components/marketing/convert-demo-context";
import MigrationGantt from "@/components/pqc/MigrationGantt";
import ReadinessTrend from "@/components/pqc/ReadinessTrend";
import RemediationVelocityChart from "@/components/pqc/RemediationVelocityChart";
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

const STATUS_LABELS: Record<ConvertPreviewItem["status"], string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
  accepted_risk: "Accepted risk",
};

const COLUMNS: Array<{ key: ConvertPreviewItem["status"]; label: string }> = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

const WAVE_FILTERS = [
  ["all", "All"],
  [1, "Wave 1"],
  [2, "Wave 2"],
  [3, "Wave 3"],
] as const;

function PeerBenchmarkStrip() {
  const b = convertPreviewPeerBenchmark;
  const max = b.p75 + 5;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Peer benchmark</p>
      <div className="relative mt-4 h-3 rounded-full bg-white/5">
        <div
          className="absolute top-0 h-3 rounded-full bg-white/20"
          style={{ left: `${(b.p25 / max) * 100}%`, width: `${((b.p75 - b.p25) / max) * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded bg-[var(--color-accent)]"
          style={{ left: `${(b.median / max) * 100}%` }}
          title={`Median ${b.median}`}
        />
        <div
          className="absolute top-1/2 h-5 w-1.5 -translate-y-1/2 rounded bg-white"
          style={{ left: `${(b.yourScore / max) * 100}%` }}
          title={`Your score ${b.yourScore}`}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-gray-400)]">
        <span>P25 {b.p25}</span>
        <span>Median {b.median}</span>
        <span className="text-white">You {b.yourScore}</span>
        <span>P75 {b.p75}</span>
      </div>
      <p className="mt-2 text-[0.65rem] text-[var(--color-gray-500)]">{b.label}</p>
    </div>
  );
}

function KanbanCard({ item }: { item: ConvertPreviewItem }) {
  const { selected, toggle } = useConvertDemo();
  const isSelected = selected.has(item.id);

  return (
    <Card tone={isSelected ? "feature" : "ghost"} className="rounded-[var(--radius-lg)] p-3">
      <div className="flex gap-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggle(item.id)}
          className="mt-0.5 h-4 w-4 rounded border-[var(--border-strong)]"
          aria-label={`Include ${item.title} in what-if projection`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[0.6rem] font-medium text-sky-300">
              W{item.wave}
            </span>
            <span className="text-[0.65rem] text-[var(--color-gray-500)]">{STATUS_LABELS[item.status]}</span>
          </div>
          <p className="mt-1 text-xs font-medium text-white">{item.title}</p>
          <p className="mt-1 text-[0.65rem] text-[var(--color-gray-500)]">
            {item.owner} · +{item.impactPoints} pts
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function ConvertProgramSimulator() {
  const { waveFilter, setWaveFilter, projectedScore, scoreFlash } = useConvertDemo();

  const filtered =
    waveFilter === "all" ? convertPreviewItems : convertPreviewItems.filter((i) => i.wave === waveFilter);

  const doneCount = convertPreviewItems.filter(
    (item) => item.status === "done" || item.status === "accepted_risk"
  ).length;
  const completionPct = Math.round((100 * doneCount) / convertPreviewItems.length);

  return (
    <div className="space-y-6">
      <Card tone="panel" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Live preview — Convert tier</Eyebrow>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
          Prioritized backlog with what-if projection. Full workflow on the{" "}
          <Link href="/dashboard" className="text-white underline underline-offset-4">
            tenant dashboard
          </Link>{" "}
          with your API key.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Current score</p>
            <p className="mt-2 text-2xl font-semibold text-white">{convertPreviewBaseline.currentScore}</p>
          </div>
          <div
            className={[
              "rounded-xl border border-[var(--border)] bg-black/40 p-4 transition",
              scoreFlash ? "border-emerald-500/50 bg-emerald-950/20" : "",
            ].join(" ")}
          >
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Projected (what-if)</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{projectedScore.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Completion</p>
            <p className="mt-2 text-2xl font-semibold text-white">{completionPct}%</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Velocity</p>
            <p className="mt-2 text-2xl font-semibold text-white">{convertPreviewBaseline.itemsPerWeek}/wk</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {WAVE_FILTERS.map(([id, label]) => (
            <button
              key={String(id)}
              type="button"
              onClick={() => setWaveFilter(id as "all" | 1 | 2 | 3)}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                waveFilter === id
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-[var(--border)] text-[var(--color-gray-400)] hover:text-white",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--color-gray-500)]">
          Select items to simulate projected readiness after remediation. Estimate only — assumes successful
          re-scan verification.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.key}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
                  {col.label}
                </p>
                <div className="space-y-2">
                  {filtered
                    .filter((item) =>
                      col.key === "done"
                        ? item.status === "done" || item.status === "accepted_risk"
                        : item.status === col.key
                    )
                    .map((item) => (
                      <KanbanCard key={item.id} item={item} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card tone="panel" className="rounded-[var(--radius-xl)]">
            <Eyebrow>Readiness trend</Eyebrow>
            <div className="mt-4">
              <ReadinessTrend points={[...convertPreviewTrend]} />
            </div>
          </Card>
          <Card tone="panel" className="rounded-[var(--radius-xl)]">
            <Eyebrow>Framework deadlines</Eyebrow>
            <div className="mt-4">
              <MigrationGantt />
            </div>
          </Card>
          <Card tone="panel" className="rounded-[var(--radius-xl)]">
            <Eyebrow>Program velocity</Eyebrow>
            <div className="mt-4">
              <RemediationVelocityChart points={convertPreviewVelocity} />
            </div>
          </Card>
          <PeerBenchmarkStrip />
        </div>
      </div>
    </div>
  );
}
