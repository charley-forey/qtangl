"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { roiPageCopy } from "@/lib/copy/readiness-resources";
import {
  calculateReadinessRoi,
  defaultReadinessRoiInput,
  formatUsd,
  type ReadinessRoiInput,
} from "@/lib/readiness-roi";

type FieldKey = keyof ReadinessRoiInput;

const fields: { key: FieldKey; label: string; min?: number; max?: number; step?: number }[] = [
  { key: "inventoryHours", label: "Hours per manual inventory", min: 0, max: 2000 },
  { key: "loadedHourlyRate", label: "Loaded hourly cost ($)", min: 0, max: 500 },
  { key: "refreshPerYear", label: "Inventory refreshes per year", min: 1, max: 12 },
  { key: "auditCyclesPerYear", label: "Audit cycles per year", min: 0, max: 4 },
  { key: "auditHoursPerCycle", label: "Hours per audit on crypto evidence", min: 0, max: 200 },
  { key: "consultingBaseline", label: "Consulting baseline quote ($)", min: 0, max: 1_000_000, step: 5000 },
  { key: "consultingAmortizeYears", label: "Amortize consulting over (years)", min: 1, max: 5 },
  { key: "monitorAnnualCost", label: "Qtangl Monitor annual ($)", min: 0, max: 500_000, step: 5000 },
  { key: "oversightHoursPerYear", label: "Internal oversight hours per year", min: 0, max: 500 },
];

export default function ReadinessRoiCalculator() {
  const [input, setInput] = useState<ReadinessRoiInput>(defaultReadinessRoiInput);
  const result = useMemo(() => calculateReadinessRoi(input), [input]);

  function update(key: FieldKey, value: number) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <Card tone="panel" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Your inputs</Eyebrow>
        <div className="mt-6 space-y-4">
          {fields.map((field) => (
            <label key={field.key} className="block text-sm">
              <span className="text-[var(--color-gray-400)]">{field.label}</span>
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                value={input[field.key]}
                onChange={(event) => update(field.key, Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-white"
              />
            </label>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>Annual comparison</Eyebrow>
          <dl className="mt-6 space-y-4">
            <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-4">
              <dt className="text-sm text-[var(--color-gray-400)]">Status quo</dt>
              <dd className="text-2xl font-semibold text-white">{formatUsd(result.statusQuoAnnual)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-4">
              <dt className="text-sm text-[var(--color-gray-400)]">With Qtangl Monitor</dt>
              <dd className="text-2xl font-semibold text-emerald-300">{formatUsd(result.qtanglAnnual)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-[var(--color-gray-400)]">Difference</dt>
              <dd
                className={`text-xl font-semibold ${
                  result.grossSavings >= 0 ? "text-emerald-300" : "text-[var(--color-gray-300)]"
                }`}
              >
                {result.grossSavings >= 0 ? "−" : "+"}
                {formatUsd(Math.abs(result.grossSavings))}
                {result.grossSavings >= 0 ? " saved" : " incremental"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card tone="ghost" className="rounded-[var(--radius-xl)]">
          <Eyebrow>Status quo breakdown</Eyebrow>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-gray-300)]">
            <li>Manual inventory: {formatUsd(result.statusQuoBreakdown.manualInventory)}</li>
            <li>Audit evidence prep: {formatUsd(result.statusQuoBreakdown.auditPrep)}</li>
            <li>Consulting (amortized): {formatUsd(result.statusQuoBreakdown.consultingAmortized)}</li>
          </ul>
        </Card>

        <Card tone="ghost" className="rounded-[var(--radius-xl)]">
          <Eyebrow>Qtangl breakdown</Eyebrow>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-gray-300)]">
            <li>Monitor subscription: {formatUsd(result.qtanglBreakdown.monitor)}</li>
            <li>Internal oversight: {formatUsd(result.qtanglBreakdown.oversight)}</li>
          </ul>
        </Card>

        <p className="text-sm leading-7 text-[var(--color-gray-400)]">{result.narrative}</p>
        <p className="text-xs leading-6 text-[var(--color-gray-500)]">{roiPageCopy.honesty}</p>

        <div className="flex flex-wrap gap-3">
          <Button href={roiPageCopy.cta.primary.href}>{roiPageCopy.cta.primary.label}</Button>
          <Button href={roiPageCopy.cta.secondary.href} variant="secondary">
            {roiPageCopy.cta.secondary.label}
          </Button>
        </div>
        <Link
          href="/resources/faq"
          className="inline-block text-sm text-[var(--color-gray-400)] underline-offset-4 hover:text-white hover:underline"
        >
          Common objections & FAQ →
        </Link>
      </div>
    </div>
  );
}
