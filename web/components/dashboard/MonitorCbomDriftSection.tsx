"use client";

import { useEffect, useState } from "react";

import CbomDriftWidget from "@/components/pqc/CbomDriftWidget";
import { fetchDashboardJson } from "@/lib/dashboard-bff";

export default function MonitorCbomDriftSection() {
  const [drift, setDrift] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboardJson<Record<string, unknown>>("/tenant/drift/summary?since_days=7")
      .then((payload) => {
        if (cancelled) return;
        const totalAdded = Number(payload.totalAdded ?? 0);
        const totalRemoved = Number(payload.totalRemoved ?? 0);
        setDrift({
          available: true,
          changedCount: totalAdded + totalRemoved,
          addedCount: totalAdded,
          removedCount: totalRemoved,
          summary: payload,
        });
      })
      .catch(() => {
        if (!cancelled) setDrift(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <CbomDriftWidget drift={drift} />;
}

