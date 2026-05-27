import TechnologyBlock from "@/components/technology/TechnologyBlock";
import { methodComparisonCopy } from "@/lib/copy/visualization";
import { methodComparisonRows } from "@/lib/copy/technology-deep";

type MethodComparisonProps = {
  className?: string;
};

export default function MethodComparison({ className = "" }: MethodComparisonProps) {
  return (
    <TechnologyBlock
      eyebrow={methodComparisonCopy.eyebrow}
      title={methodComparisonCopy.title}
      description={methodComparisonCopy.description}
      className={className}
    >
      <div className="space-y-4">
        {methodComparisonRows.map((row) => (
          <div
            key={row.dimension}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4 sm:p-5"
          >
            <p className="text-sm font-semibold text-white">{row.dimension}</p>
            <div className="mt-4 grid divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="pb-4 sm:pb-0 sm:pr-4">
                <p className="text-label">Classical</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
                  {row.classical}
                </p>
              </div>
              <div className="pt-4 sm:pl-4 sm:pt-0">
                <p className="text-label">Hybrid</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">{row.hybrid}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TechnologyBlock>
  );
}
