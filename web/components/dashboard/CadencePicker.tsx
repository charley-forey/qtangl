"use client";

import { useMemo, useState } from "react";

const PRESETS = [
  { id: "daily", label: "Daily", hours: 24 },
  { id: "weekly", label: "Weekly", hours: 168 },
  { id: "biweekly", label: "Bi-weekly", hours: 336 },
  { id: "monthly", label: "Monthly", hours: 720 },
] as const;

type Props = {
  value: number;
  onChange: (hours: number) => void;
  maxScansPerMonth?: number | null;
  scansThisMonth?: number;
  targetCount?: number;
};

function presetForHours(hours: number): string {
  const match = PRESETS.find((preset) => preset.hours === hours);
  return match?.id ?? "custom";
}

export default function CadencePicker({
  value,
  onChange,
  maxScansPerMonth,
  scansThisMonth = 0,
  targetCount = 1,
}: Props) {
  const [mode, setMode] = useState(() => presetForHours(value));
  const [customHours, setCustomHours] = useState(value);

  const estimatedScans = useMemo(() => {
    if (!value || value <= 0) return 0;
    return Math.ceil(720 / value) * Math.max(1, targetCount);
  }, [targetCount, value]);

  const projectedTotal = estimatedScans + scansThisMonth;
  const overQuota =
    maxScansPerMonth != null && maxScansPerMonth > 0 && projectedTotal > maxScansPerMonth;

  function selectPreset(presetId: string, hours: number) {
    setMode(presetId);
    onChange(hours);
  }

  const domainLabel =
    targetCount === 1 ? "1 domain" : `${targetCount} domains`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => selectPreset(preset.id, preset.hours)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              mode === preset.id
                ? "border-white bg-white text-black"
                : "border-[var(--border-strong)] text-[var(--color-gray-300)] hover:text-white",
            ].join(" ")}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={[
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            mode === "custom"
              ? "border-white bg-white text-black"
              : "border-[var(--border-strong)] text-[var(--color-gray-300)] hover:text-white",
          ].join(" ")}
        >
          Custom
        </button>
      </div>
      {mode === "custom" ? (
        <input
          type="number"
          min={1}
          max={8760}
          value={customHours}
          onChange={(e) => {
            const hours = Number(e.target.value);
            setCustomHours(hours);
            if (hours > 0) onChange(hours);
          }}
          className="w-full rounded-full border border-[var(--border-strong)] bg-black px-3 py-1.5 text-sm text-white sm:max-w-[10rem]"
          aria-label="Custom cadence in hours"
        />
      ) : (
        <p className="text-xs text-[var(--color-gray-500)]">Every {value}h</p>
      )}
      <p className={`text-xs ${overQuota ? "text-amber-300" : "text-[var(--color-gray-500)]"}`}>
        If scheduled: ~{estimatedScans} run{estimatedScans === 1 ? "" : "s"}/month for {domainLabel}
        {maxScansPerMonth != null && maxScansPerMonth > 0
          ? ` · Your plan: ${scansThisMonth}/${maxScansPerMonth} scans used this month`
          : ""}
        {overQuota ? " · projected total exceeds monthly quota" : ""}
      </p>
    </div>
  );
}
