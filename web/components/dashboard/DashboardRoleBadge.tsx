"use client";

import { roleLabel } from "@/lib/dashboard-persona";

/** Read-only badge showing the user's assigned workspace role. */
export default function DashboardRoleBadge({ role }: { role: string | undefined | null }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-white/5 px-3 py-1 text-xs font-medium text-[var(--color-gray-300)]">
      {roleLabel(role)}
    </span>
  );
}
