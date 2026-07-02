"use client";

import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  calculateReadinessRoi,
  defaultReadinessRoiInput,
  formatUsd,
  type ReadinessRoiInput,
} from "@/lib/readiness-roi";

export default function MonitorRoiMini() {
  const defaults = defaultReadinessRoiInput();
  const [inventoryHours, setInventoryHours] = useState(defaults.inventoryHours);
  const [auditCycles, setAuditCycles] = useState(defaults.auditCyclesPerYear);
  const [monitorCost, setMonitorCost] = useState(defaults.monitorAnnualCost);

  const result = useMemo(() => {
    const input: ReadinessRoiInput = {
      ...defaults,
      inventoryHours,
      auditCyclesPerYear: auditCycles,
      monitorAnnualCost: monitorCost,
    };
    return calculateReadinessRoi(input);
  }, [inventoryHours, auditCycles, monitorCost]);

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Monitor ROI estimate</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Illustrative savings vs manual inventory refresh — adjust inputs for your program.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="text-xs text-[var(--color-gray-500)]">Inventory hours / refresh</span>
          <input
            type="number"
            min={0}
            max={500}
            value={inventoryHours}
            onChange={(e) => setInventoryHours(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-black/40 px-3 py-2 text-white"
          />
        </label>
        <label className="text-sm">
          <span className="text-xs text-[var(--color-gray-500)]">Audit cycles / year</span>
          <input
            type="number"
            min={0}
            max={4}
            value={auditCycles}
            onChange={(e) => setAuditCycles(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-black/40 px-3 py-2 text-white"
          />
        </label>
        <label className="text-sm">
          <span className="text-xs text-[var(--color-gray-500)]">Monitor annual ($)</span>
          <input
            type="number"
            min={0}
            step={5000}
            value={monitorCost}
            onChange={(e) => setMonitorCost(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-black/40 px-3 py-2 text-white"
          />
        </label>
      </div>
      <p className="mt-6 text-2xl font-semibold text-emerald-300">
        {formatUsd(result.grossSavings)} / yr estimated gross savings
      </p>
      <p className="mt-2 text-xs text-[var(--color-gray-500)]">
        Estimate only — see /roi for full model.
      </p>
    </Card>
  );
}
