"use client";

type ChartTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number; name?: string; payload?: Record<string, unknown> }>;
  label?: string;
  valueLabel?: string;
  extra?: (payload: Record<string, unknown>) => string | null;
};

export default function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = "Value",
  extra,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  const value = row?.value;
  const meta = extra?.(row?.payload ?? {}) ?? null;

  return (
    <div className="rounded-lg border border-white/10 bg-black/95 px-3 py-2 text-xs shadow-xl">
      {label ? <p className="mb-1 font-medium text-white">{label}</p> : null}
      <p className="tabular-nums text-[var(--color-gray-300)]">
        {valueLabel}: <span className="font-semibold text-white">{value}</span>
      </p>
      {meta ? <p className="mt-1 text-[var(--color-gray-500)]">{meta}</p> : null}
    </div>
  );
}
