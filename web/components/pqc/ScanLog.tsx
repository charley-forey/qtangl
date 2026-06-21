"use client";

import type { TimelineEvent } from "@/lib/pqc";

export default function ScanLog({ events, isRunning }: { events: TimelineEvent[]; isRunning?: boolean }) {
  const timeline = events ?? [];
  if (!timeline.length && !isRunning) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        No timeline captured yet. Re-run the scan to generate step-by-step diagnostics.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {timeline.map((event, index) => (
        <li key={`${event.key}-${index}`} className="flex items-start gap-2 text-xs">
          <span
            className={`mt-1 h-2 w-2 rounded-full ${
              event.status === "error"
                ? "bg-red-400"
                : event.status === "running"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-400"
            }`}
          />
          <span className="text-[var(--color-gray-300)]">{event.label}</span>
        </li>
      ))}
      {isRunning && (
        <li className="text-xs text-[var(--color-gray-500)]">Scan in progress…</li>
      )}
    </ul>
  );
}
