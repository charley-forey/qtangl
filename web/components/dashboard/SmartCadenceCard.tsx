"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export type CadenceRecommendation = {
  currentCadenceHours?: number | null;
  recommendedCadenceHours: number;
  volatilityScore: number;
  rationale: string;
  assumptions?: string[];
};

function formatCadence(hours: number): string {
  if (hours % 168 === 0) return `${hours / 168} week${hours / 168 > 1 ? "s" : ""}`;
  if (hours % 24 === 0) return `${hours / 24} day${hours / 24 > 1 ? "s" : ""}`;
  return `${hours} hours`;
}

export default function SmartCadenceCard({
  onApply,
}: {
  onApply?: (cadenceHours: number) => void;
}) {
  const [rec, setRec] = useState<CadenceRecommendation | null>(null);

  useEffect(() => {
    void fetchDashboardJson<CadenceRecommendation>("/tenant/cadence/recommendation")
      .then((result) => {
        setRec(result);
        trackDashboardEvent({
          event: "cc_cadence_recommended",
          properties: { recommendedCadenceHours: result.recommendedCadenceHours },
        });
      })
      .catch(() => setRec(null));
  }, []);

  if (!rec) return null;

  const isDifferent = rec.currentCadenceHours == null || rec.currentCadenceHours !== rec.recommendedCadenceHours;

  return (
    <Card tone="panel" className="space-y-3">
      <Eyebrow>Smart re-scan cadence</Eyebrow>
      <p className="text-sm text-white">
        Recommended: <strong>every {formatCadence(rec.recommendedCadenceHours)}</strong>
        {rec.currentCadenceHours != null ? (
          <span className="text-[var(--color-gray-400)]"> · currently every {formatCadence(rec.currentCadenceHours)}</span>
        ) : null}
      </p>
      <p className="text-xs text-[var(--color-gray-400)]">{rec.rationale}</p>
      <p className="text-[10px] text-[var(--color-gray-500)]">
        Volatility score {rec.volatilityScore.toFixed(2)} — based on observed drift between recent scans.
      </p>
      {isDifferent && onApply ? (
        <Button
          type="button"
          size="sm"
          onClick={() => {
            onApply(rec.recommendedCadenceHours);
            trackDashboardEvent({
              event: "cc_cadence_applied",
              properties: { cadenceHours: rec.recommendedCadenceHours },
            });
          }}
        >
          Apply recommended cadence
        </Button>
      ) : null}
      {(rec.assumptions ?? []).length > 0 ? (
        <ul className="list-disc space-y-1 pl-4 text-[10px] text-[var(--color-gray-500)]">
          {rec.assumptions?.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
