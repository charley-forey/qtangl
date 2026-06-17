"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import type { MaturityStage } from "@/lib/dashboard-state";

export default function MaturityStageCard({
  maturity,
  onAction,
}: {
  maturity: MaturityStage | null | undefined;
  onAction?: (tab: string) => void;
}) {
  if (!maturity) return null;

  return (
    <Card tone="panel">
      <Eyebrow>Crypto-agility maturity</Eyebrow>
      <p className="mt-2 text-lg font-semibold text-white">
        Stage {maturity.stage}: {maturity.name}
      </p>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">Qtangl tier: {maturity.tier}</p>
      {maturity.nextStageName ? (
        <p className="mt-3 text-sm text-[var(--color-gray-300)]">
          Next: <span className="text-white">{maturity.nextStageName}</span> ({maturity.nextStageTier})
        </p>
      ) : null}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-sky-500"
          style={{ width: `${maturity.progressPct ?? 0}%` }}
        />
      </div>
      {maturity.nextStageName ? (
        <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={() => onAction?.("overview")}>
          View journey
        </Button>
      ) : null}
    </Card>
  );
}
