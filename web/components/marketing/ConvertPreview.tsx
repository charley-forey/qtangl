"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  convertPreviewBaseline,
  convertPreviewItems,
  type ConvertPreviewItem,
} from "@/lib/copy/readiness-demos";

const STATUS_LABELS: Record<ConvertPreviewItem["status"], string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
  accepted_risk: "Accepted risk",
};

export default function ConvertPreview() {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(["rem_001", "rem_002"])
  );

  const projected = useMemo(() => {
    const selectedImpact = convertPreviewItems
      .filter((item) => selected.has(item.id))
      .reduce((sum, item) => sum + item.impactPoints, 0);
    return Math.min(100, convertPreviewBaseline.currentScore + selectedImpact);
  }, [selected]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

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
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Current score</p>
            <p className="mt-2 text-2xl font-semibold text-white">{convertPreviewBaseline.currentScore}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Projected (what-if)</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{projected.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Completion</p>
            <p className="mt-2 text-2xl font-semibold text-white">{completionPct}%</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--color-gray-500)]">
          Select items below to simulate projected readiness after remediation. Estimate only — assumes successful re-scan verification.
        </p>
      </Card>

      <div className="space-y-3">
        {convertPreviewItems.map((item) => (
          <Card
            key={item.id}
            tone={selected.has(item.id) ? "feature" : "ghost"}
            className="rounded-[var(--radius-xl)]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                  className="mt-1 h-4 w-4 rounded border-[var(--border-strong)]"
                  aria-label={`Include ${item.title} in what-if projection`}
                />
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--color-gray-400)]">{item.playbook}</p>
                  <p className="mt-2 text-xs text-[var(--color-gray-500)]">
                    {item.owner} · {item.severity} · +{item.impactPoints} pts
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-gray-300)]">
                {STATUS_LABELS[item.status]}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
