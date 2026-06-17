"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import { frameworkGuideList } from "@/lib/copy/readiness-frameworks";
import type { DashboardSummary } from "@/lib/dashboard-state";
import { putDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

function deadlineSortKey(deadline: string): number {
  const match = deadline.match(/\d{4}/);
  return match ? Number(match[0]) : 9999;
}

const FRAMEWORKS = [...frameworkGuideList]
  .sort((a, b) => deadlineSortKey(a.deadline) - deadlineSortKey(b.deadline))
  .slice(0, 6);

export default function FrameworkDeadlineRoadmap({
  readinessScore,
  trend = [],
}: {
  readinessScore?: number | null;
  trend?: DashboardSummary["trend"];
}) {
  const trendDelta =
    trend.length >= 2 ? trend[trend.length - 1]!.score - trend[trend.length - 2]!.score : null;

  return (
    <Card tone="panel">
      <Eyebrow>Framework deadline roadmap</Eyebrow>
      <ul className="mt-3 space-y-2 text-xs">
        {FRAMEWORKS.map((fw) => (
          <li
            key={fw.slug}
            className="flex items-start justify-between gap-2 rounded border border-[var(--border-subtle)] px-3 py-2"
          >
            <div>
              <p className="font-medium text-white">{fw.title}</p>
              <p className="text-[var(--color-gray-500)]">{fw.whyItMatters}</p>
            </div>
            <span className="shrink-0 text-[var(--color-gray-400)]">{fw.deadline}</span>
          </li>
        ))}
      </ul>
      {readinessScore != null ? (
        <p className="mt-3 text-xs text-[var(--color-gray-400)]">
          Current readiness {readinessScore}
          {trendDelta != null ? ` (${trendDelta > 0 ? "+" : ""}${trendDelta.toFixed(1)} vs prior scan)` : ""}{" "}
          — prioritize findings mapped to nearest deadline.
        </p>
      ) : null}
    </Card>
  );
}

export function BoardMeetingMode({
  summary,
  reportUrlForScan,
  tenantSettings,
  onSettingsChange,
}: {
  summary: DashboardSummary;
  reportUrlForScan: (scanId: string, format?: "board") => string;
  tenantSettings?: Record<string, unknown> | null;
  onSettingsChange?: (settings: Record<string, unknown>) => void;
}) {
  const latest = summary.recentScans.find((s) => s.status === "done");
  const digest = summary.digest;
  const lastBoardMeetingAt = tenantSettings?.lastBoardMeetingAt as string | undefined;
  const daysSinceBoard =
    lastBoardMeetingAt != null
      ? Math.floor((Date.now() - new Date(lastBoardMeetingAt).getTime()) / 86400000)
      : null;

  async function exportBoardPack() {
    if (!latest) return;
    window.open(reportUrlForScan(latest.scanId, "board"), "_blank", "noopener,noreferrer");
    trackDashboardEvent("board_export", { scanId: latest.scanId, format: "board" });
    const next = {
      ...(tenantSettings ?? {}),
      lastBoardMeetingAt: new Date().toISOString(),
      lastBoardExportAt: new Date().toISOString(),
    };
    await putDashboardJson("/tenant/settings", { settings: next });
    onSettingsChange?.(next);
  }

  return (
    <Card tone="feature" className="border border-[var(--border-strong)]">
      <Eyebrow>Board meeting mode</Eyebrow>
      <p className="mt-2 text-lg font-semibold text-white">{digest?.headline ?? "Portfolio readiness"}</p>
      <p className="mt-2 text-sm text-[var(--color-gray-300)]">
        {lastBoardMeetingAt
          ? `Since last board meeting (${daysSinceBoard ?? 0} days ago): ${digest?.narrative ?? "Review readiness trend and top crypto risks."}`
          : (digest?.narrative ?? "Export a one-page board pack with signed evidence.")}
      </p>
      {daysSinceBoard != null && daysSinceBoard > 90 ? (
        <p className="mt-2 text-xs text-amber-200">
          Quarterly board review is overdue — schedule a readiness QBR with your stakeholders.
        </p>
      ) : null}
      {digest?.topCryptoRisks?.length ? (
        <ul className="mt-4 list-disc space-y-1 pl-4 text-xs text-[var(--color-gray-400)]">
          {digest.topCryptoRisks.slice(0, 5).map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      ) : null}
      {latest ? (
        <Button type="button" size="sm" className="mt-4" onClick={() => void exportBoardPack()}>
          Export board pack
        </Button>
      ) : null}
    </Card>
  );
}
