"use client";

import { useEffect, useState } from "react";

import InsightCallout from "@/components/dashboard/ui/InsightCallout";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type AnomalyExplanation = {
  message: string;
  delta?: number | null;
  index?: number | null;
};

type AnomalyResponse = {
  explanations?: AnomalyExplanation[];
  assumptions?: string[];
};

export default function AnomalyInsightCallouts() {
  const [data, setData] = useState<AnomalyResponse | null>(null);

  useEffect(() => {
    void fetchDashboardJson<AnomalyResponse>("/tenant/analytics/anomaly-explanations")
      .then((result) => {
        setData(result);
        trackDashboardEvent({
          event: "cc_anomaly_viewed",
          properties: { count: result.explanations?.length ?? 0 },
        });
      })
      .catch(() => setData(null));
  }, []);

  const explanations = data?.explanations ?? [];
  if (explanations.length === 0) return null;

  return (
    <div className="space-y-2">
      {explanations.map((item, i) => {
        const tone = item.delta != null && item.delta < 0 ? "warning" : "info";
        return (
          <InsightCallout key={`${item.index ?? i}-${i}`} title="Readiness anomaly" tone={tone}>
            <p>{item.message}</p>
            {item.delta != null ? (
              <p className="mt-1 text-xs opacity-80">
                Change: {item.delta > 0 ? "+" : ""}
                {item.delta.toFixed(1)} pts
              </p>
            ) : null}
          </InsightCallout>
        );
      })}
      {(data?.assumptions ?? []).length > 0 ? (
        <p className="text-[10px] text-[var(--color-gray-500)]">{data?.assumptions?.join(" ")}</p>
      ) : null}
    </div>
  );
}
