import { interferenceHeatmapCopy } from "@/lib/copy/visualization";

type InterferenceHeatmapProps = {
  xLabels: string[];
  yLabels: string[];
  values: number[][];
  className?: string;
};

export default function InterferenceHeatmap({
  xLabels,
  yLabels,
  values,
  className = "",
}: InterferenceHeatmapProps) {
  return (
    <section
      aria-label={interferenceHeatmapCopy.title}
      className={[
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{interferenceHeatmapCopy.eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold text-white">{interferenceHeatmapCopy.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        {interferenceHeatmapCopy.description}
      </p>

      <div className="mt-6 overflow-x-auto">
        <div
          className="grid min-w-[28rem] gap-2"
          style={{ gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(0, 1fr))` }}
        >
          <div />
          {xLabels.map((label) => (
            <div
              key={label}
              className="px-2 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--color-gray-500)]"
            >
              {label}
            </div>
          ))}

          {yLabels.map((rowLabel, rowIndex) => (
            <div
              key={rowLabel}
              className="contents"
            >
              <div className="flex items-center pr-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
                {rowLabel}
              </div>
              {values[rowIndex].map((value, cellIndex) => (
                <div
                  key={`${rowLabel}-${xLabels[cellIndex]}`}
                  className="aspect-square rounded-lg border border-white/8"
                  style={{
                    background: `rgba(255,255,255,${0.08 + Math.max(0, Math.min(value, 1)) * 0.72})`,
                  }}
                  title={`${rowLabel} x ${xLabels[cellIndex]}: ${Math.round(value * 100)}% pressure`}
                  aria-label={`${rowLabel} x ${xLabels[cellIndex]}: ${Math.round(value * 100)}% pressure`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
