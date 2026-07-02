"use client";

import { useState } from "react";
import Link from "next/link";

import {
  progressToDeadline,
  urgencyColorForYear,
} from "@/lib/chart-theme";

type Milestone = {
  label: string;
  deadline: string;
  severity?: string;
  effortDays?: number;
  href?: string;
};

const DEFAULT_MILESTONES: Milestone[] = [
  { label: "NIST IR 8547", deadline: "2030", href: "/q-day/frameworks/nist-ir-8547" },
  { label: "CNSA 2.0", deadline: "2033", href: "/q-day/frameworks/cnsa-2.0" },
  { label: "NSM-10", deadline: "2035", href: "/q-day/frameworks/nsm-10" },
];

function parseDeadlineYear(deadline: string): number {
  const match = deadline.match(/\d{4}/);
  return match ? Number(match[0]) : 2035;
}

export default function MigrationGantt({ milestones }: { milestones?: Milestone[] }) {
  const items = milestones?.length ? milestones : DEFAULT_MILESTONES;
  const [active, setActive] = useState<string | null>(null);
  const nowYear = new Date().getFullYear();
  const HORIZON_START = 2024;
  const HORIZON_END = 2036;
  const todayPct = Math.round(((nowYear - HORIZON_START) / (HORIZON_END - HORIZON_START)) * 100);

  return (
    <div className="space-y-1">
      <div className="relative mb-4 h-1.5 rounded-full bg-white/[0.06]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/25"
          style={{ width: `${Math.min(100, todayPct)}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded bg-white shadow-[0_0_6px_rgba(255,255,255,0.5)]"
          style={{ left: `${Math.min(98, todayPct)}%` }}
          title={`Today (${nowYear})`}
        />
      </div>
      <p className="mb-3 text-[0.65rem] text-[var(--color-gray-500)]">
        Timeline progress from 2024 — hover a mandate for urgency context.
      </p>
      {items.map((m) => {
        const year = parseDeadlineYear(m.deadline);
        const pct = progressToDeadline(year);
        const yearsLeft = year - nowYear;
        const key = `${m.label}-${m.deadline}`;
        const isActive = active === key;
        const urgency = urgencyColorForYear(year, nowYear);

        const row = (
          <div
            className={[
              "flex items-center gap-3 rounded-lg px-2 py-2.5 text-xs transition",
              isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
            ].join(" ")}
            onMouseEnter={() => setActive(key)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="w-28 shrink-0 truncate font-medium text-[var(--color-gray-400)]" title={m.label}>
              {m.label}
            </span>
            <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={["h-3 rounded-full transition-all duration-500", urgency].join(" ")}
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute top-0 h-3 w-0.5 bg-white/40"
                style={{ left: `${Math.min(99, todayPct)}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right tabular-nums text-[var(--color-gray-400)]">{m.deadline}</span>
          </div>
        );

        return (
          <div key={key}>
            {m.href ? (
              <Link href={m.href} className="block">
                {row}
              </Link>
            ) : (
              row
            )}
            {isActive ? (
              <p className="px-2 pb-2 text-[0.65rem] leading-5 text-[var(--color-gray-500)]">
                {yearsLeft > 0
                  ? `${yearsLeft} years to deadline · ${pct}% of planning window elapsed`
                  : "Deadline year reached — prioritize evidence of migration"}
                {m.effortDays ? ` · ~${m.effortDays} effort-days in playbook` : null}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
