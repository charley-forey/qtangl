import TechnologyBlock from "@/components/technology/TechnologyBlock";
import { lexiconGlossaryCopy } from "@/lib/copy/visualization";
import { glossaryEntries } from "@/lib/copy/technology-deep";

type LexiconGlossaryProps = {
  className?: string;
};

export default function LexiconGlossary({ className = "" }: LexiconGlossaryProps) {
  return (
    <TechnologyBlock
      eyebrow={lexiconGlossaryCopy.eyebrow}
      title={lexiconGlossaryCopy.title}
      description={lexiconGlossaryCopy.description}
      className={className}
    >
      <div className="divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)]">
        {glossaryEntries.map((entry, index) => (
          <div
            key={entry.quantum}
            className={[
              "grid gap-4 p-4 sm:p-5 md:grid-cols-2 md:gap-8",
              index === glossaryEntries.length - 1 ? "rounded-b-[var(--radius-lg)]" : "",
            ].join(" ")}
          >
            <div>
              <p className="text-sm font-semibold text-white">{entry.quantum}</p>
              <p className="mt-1 text-xs leading-6 text-[var(--color-gray-500)]">
                {entry.quantumMeaning}
              </p>
            </div>
            <div className="md:border-l md:border-[var(--border)] md:pl-8">
              <p className="text-sm font-semibold text-white">{entry.engineering}</p>
              <p className="mt-1 text-sm leading-7 text-[var(--color-gray-300)]">
                {entry.engineeringMeaning}
              </p>
            </div>
          </div>
        ))}
      </div>
    </TechnologyBlock>
  );
}
