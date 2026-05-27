import { methodComparisonCopy } from "@/lib/copy/visualization";
import { methodComparisonRows } from "@/lib/copy/technology-deep";

type MethodComparisonProps = {
  className?: string;
};

export default function MethodComparison({ className = "" }: MethodComparisonProps) {
  return (
    <section
      aria-label={methodComparisonCopy.title}
      className={[
        "rounded-[var(--radius-feature)] border border-[var(--border)] bg-black/35 p-5 lg:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{methodComparisonCopy.eyebrow}</p>
      <h2 className="heading-section mt-4 !text-2xl">{methodComparisonCopy.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-gray-300)]">
        {methodComparisonCopy.description}
      </p>

      <div className="mt-6 space-y-4">
        {methodComparisonRows.map((row) => (
          <div
            key={row.dimension}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4"
          >
            <p className="text-sm font-semibold text-white">{row.dimension}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-black/40 p-3">
                <p className="text-label">Classical</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
                  {row.classical}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/[0.06] p-3">
                <p className="text-label">Hybrid</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">{row.hybrid}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
