import { hybridStackDiagramCopy } from "@/lib/copy/visualization";

type HybridStackDiagramProps = {
  className?: string;
};

export default function HybridStackDiagram({
  className = "",
}: HybridStackDiagramProps) {
  return (
    <section
      aria-label={hybridStackDiagramCopy.title}
      className={[
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{hybridStackDiagramCopy.eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold text-white">{hybridStackDiagramCopy.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        {hybridStackDiagramCopy.description}
      </p>

      <div className="mt-6 flex overflow-hidden rounded-full border border-[var(--border)]">
        {hybridStackDiagramCopy.bands.map((band, index) => (
          <div
            key={band.label}
            className={[
              "flex min-h-24 items-end px-4 py-4 text-sm leading-6 text-white",
              index === 1 ? "bg-white/[0.18]" : "bg-white/[0.08]",
            ].join(" ")}
            style={{ width: `${band.width}%` }}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-200)]">
                {band.width}%
              </p>
              <p className="mt-2 font-medium">{band.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {hybridStackDiagramCopy.bands.map((band) => (
          <div
            key={band.label}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4"
          >
            <p className="text-sm font-medium text-white">{band.label}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
              {band.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
