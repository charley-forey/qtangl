"use client";

import type { RemediationItem } from "@/lib/pqc";

export default function RemediationBacklog({
  items,
  limit,
}: {
  items: RemediationItem[];
  limit?: number;
}) {
  if (!items.length) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        No remediation generated. Assets may already be safe, scan depth may be lite, or coverage may be
        partial.
      </p>
    );
  }
  const visible = limit != null ? items.slice(0, limit) : items;
  return (
    <ol className="space-y-2">
      {visible.map((item) => (
        <li key={item.id} className="rounded-lg border border-[var(--color-border)] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">
              #{item.priority} {item.title}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--color-gray-500)]">
              <span>{item.deadline}</span>
              {item.effort_days ? <span>{item.effort_days}d effort</span> : null}
              {item.pqc_algorithm ? <span>→ {item.pqc_algorithm}</span> : null}
            </div>
          </div>
          <p className="mt-1 text-xs text-[var(--color-gray-400)]">{item.action}</p>
        </li>
      ))}
    </ol>
  );
}
