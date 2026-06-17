"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { calculatePqcRoi } from "@/lib/pqc-roi";

type Props = {
  readinessScore?: number | null;
  openCritical?: number;
  industry?: string;
  onOpenUpgrade?: () => void;
};

export default function RoiCalculatorCard({
  readinessScore,
  openCritical = 0,
  industry = "financial",
  onOpenUpgrade,
}: Props) {
  const [quantumVulnerable, setQuantumVulnerable] = useState(Math.max(openCritical, 12));

  const roi = useMemo(
    () =>
      calculatePqcRoi({
        quantumVulnerableAssets: quantumVulnerable,
        migrationBudgetMillions: industry === "government" ? 8 : undefined,
        contractRiskMillions: industry === "healthcare" ? 6 : undefined,
      }),
    [industry, quantumVulnerable]
  );

  if (readinessScore != null && readinessScore >= 70) {
    return null;
  }

  return (
    <Card tone="feature" className="border border-[var(--border-strong)]">
      <Eyebrow>ROI framing</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-300)]">
        Estimate breach exposure avoided vs. a structured PQC migration program for your {industry}{" "}
        footprint.
      </p>
      <label className="mt-4 block text-xs text-[var(--color-gray-500)]">
        Quantum-vulnerable assets
        <input
          type="range"
          min={1}
          max={80}
          value={quantumVulnerable}
          onChange={(event) => setQuantumVulnerable(Number(event.target.value))}
          className="mt-2 w-full"
        />
      </label>
      <p className="mt-3 text-lg font-semibold text-white">{roi.headline}</p>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">{roi.hndlRiskLabel}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {onOpenUpgrade ? (
          <Button type="button" size="sm" onClick={onOpenUpgrade}>
            Upgrade to Assess
          </Button>
        ) : null}
        <Link
          href="/trust/procurement-pack"
          className="inline-flex items-center rounded-full border border-[var(--border-strong)] px-4 py-2 text-xs font-medium text-white"
        >
          Procurement pack
        </Link>
      </div>
    </Card>
  );
}
