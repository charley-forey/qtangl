"use client";

import type { RemediationItem } from "@/lib/pqc";

export default function RemediationBacklog({ items }: { items: RemediationItem[] }) {
  return (
    <ol className="space-y-2">
      {items.slice(0, 8).map((item) => (
        <li key={item.id} className="rounded-lg border border-[var(--color-border)] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">
              #{item.priority} {item.title}
            </p>
            <span className="text-xs text-[var(--color-gray-500)]">{item.deadline}</span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-gray-400)]">{item.action}</p>
        </li>
      ))}
    </ol>
  );
}
