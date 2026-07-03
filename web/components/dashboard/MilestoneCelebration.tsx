"use client";

import { useEffect, useState } from "react";

import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

const BANDS: Array<{ id: string; min: number; label: string; note: string }> = [
  { id: "foundational", min: 0, label: "Foundational", note: "Baseline inventory captured." },
  { id: "developing", min: 40, label: "Developing", note: "Exposure is being reduced." },
  { id: "advanced", min: 70, label: "Advanced", note: "Most high-risk assets addressed." },
  { id: "leading", min: 85, label: "Leading", note: "Strong PQC posture across inventory." },
];

function bandFor(score: number) {
  return [...BANDS].reverse().find((band) => score >= band.min) ?? BANDS[0];
}

const STORAGE_KEY = "qtangl_cc_milestone_band";

export default function MilestoneCelebration({
  readinessScore,
  tenantId,
}: {
  readinessScore?: number | null;
  tenantId?: string | null;
}) {
  const [milestone, setMilestone] = useState<{ label: string; note: string } | null>(null);

  useEffect(() => {
    if (readinessScore == null || typeof window === "undefined") return;
    const band = bandFor(readinessScore);
    const key = tenantId ? `${STORAGE_KEY}:${tenantId}` : STORAGE_KEY;
    const prev = window.localStorage.getItem(key);
    if (prev === band.id) return;
    const prevMin = prev ? (BANDS.find((b) => b.id === prev)?.min ?? -1) : -1;
    window.localStorage.setItem(key, band.id);
    // Only celebrate upward movement, and skip the very first sighting.
    if (prev != null && band.min > prevMin) {
      setMilestone({ label: band.label, note: band.note });
      trackDashboardEvent({ event: "cc_milestone_celebrated", properties: { milestone: band.id } });
      const timer = window.setTimeout(() => setMilestone(null), 9000);
      return () => window.clearTimeout(timer);
    }
  }, [readinessScore, tenantId]);

  if (!milestone) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 shadow-xl"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-emerald-200">Milestone: {milestone.label} band</p>
          <p className="mt-1 text-xs text-emerald-100/80">{milestone.note}</p>
          <p className="mt-2 text-[10px] text-emerald-100/60">
            Readiness reflects inventory coverage — it is an aid, not a formal audit or certification.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="text-emerald-200/70 hover:text-white"
          onClick={() => setMilestone(null)}
        >
          ×
        </button>
      </div>
    </div>
  );
}
