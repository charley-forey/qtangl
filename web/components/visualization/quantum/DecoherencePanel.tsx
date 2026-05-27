import TechnologyBlock from "@/components/technology/TechnologyBlock";
import { decoherencePanelCopy } from "@/lib/copy/visualization";
import { decoherenceModes } from "@/lib/copy/technology-deep";

type DecoherencePanelProps = {
  className?: string;
};

export default function DecoherencePanel({ className = "" }: DecoherencePanelProps) {
  return (
    <TechnologyBlock
      eyebrow={decoherencePanelCopy.eyebrow}
      title={decoherencePanelCopy.title}
      description={decoherencePanelCopy.description}
      className={className}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {decoherenceModes.map((mode) => (
          <article
            key={mode.title}
            className="flex min-h-[10rem] flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4 sm:p-5"
          >
            <h3 className="text-sm font-semibold text-white">{mode.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-7 text-[var(--color-gray-300)]">
              {mode.symptom}
            </p>
            <p className="mt-4 break-all font-mono text-xs leading-6 text-[var(--color-gray-500)]">
              {mode.response}
            </p>
          </article>
        ))}
      </div>
    </TechnologyBlock>
  );
}
