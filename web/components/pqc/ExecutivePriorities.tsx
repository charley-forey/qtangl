"use client";

type Priority = {
  title: string;
  action: string;
  severity?: string;
};

type ExecutiveSummary = {
  verdict?: string;
  readinessBand?: string;
  nearestDeadline?: string;
  exposureRangeUsd?: { low: number; high: number };
  topPriorities?: Priority[];
};

export default function ExecutivePriorities({ summary }: { summary: ExecutiveSummary | undefined }) {
  if (!summary) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-black/30 p-4 text-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-gray-500)]">Executive TL;DR</p>
      {summary.readinessBand ? (
        <p className="mt-2 text-lg font-semibold text-white">{summary.readinessBand}</p>
      ) : null}
      {summary.verdict ? <p className="mt-2 text-[var(--color-gray-300)]">{summary.verdict}</p> : null}
      {summary.exposureRangeUsd ? (
        <p className="mt-2 text-xs text-[var(--color-gray-400)]">
          Estimated migration exposure: ${summary.exposureRangeUsd.low.toLocaleString()}–$
          {summary.exposureRangeUsd.high.toLocaleString()} (order-of-magnitude)
        </p>
      ) : null}
      {summary.nearestDeadline ? (
        <p className="mt-1 text-xs text-[var(--color-gray-500)]">
          Nearest binding deadline: {summary.nearestDeadline}
        </p>
      ) : null}
      {summary.topPriorities && summary.topPriorities.length > 0 ? (
        <ol className="mt-4 list-decimal space-y-2 pl-4 text-xs text-[var(--color-gray-300)]">
          {summary.topPriorities.map((item) => (
            <li key={item.title}>
              <span className="font-medium text-white">{item.title}</span>
              <span className="block text-[var(--color-gray-500)]">{item.action.slice(0, 200)}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
