"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { DriftArea } from "@/components/dashboard/charts/CommandCenterCharts";
import { fetchDashboardJson } from "@/lib/dashboard-bff";

export default function CommandCenterMonitorInsights() {
  const [points, setPoints] = useState<Array<{ date: string; changes: number }>>([]);

  useEffect(() => {
    void fetchDashboardJson<{ snapshots?: Array<{ capturedAt?: string; changeCount?: number }> }>(
      "/tenant/drift/history?limit=20"
    )
      .then((payload) => {
        const rows = (payload.snapshots ?? []).map((s) => ({
          date: s.capturedAt
            ? new Date(s.capturedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
            : "—",
          changes: Number(s.changeCount ?? 0),
        }));
        setPoints(rows.reverse());
      })
      .catch(() => setPoints([]));
  }, []);

  if (!points.length) return null;

  return (
    <Card tone="panel" className="p-4">
      <Eyebrow>Drift over time</Eyebrow>
      <p className="mt-1 text-xs text-[var(--color-gray-500)]">
        Inventory changes detected between scheduled assessments — not a formal audit.
      </p>
      <div className="mt-3">
        <DriftArea data={points} />
      </div>
    </Card>
  );
}
