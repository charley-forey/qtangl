import { lexiconGlossaryCopy } from "@/lib/copy/visualization";
import { glossaryEntries } from "@/lib/copy/technology-deep";

type LexiconGlossaryProps = {
  className?: string;
};

export default function LexiconGlossary({ className = "" }: LexiconGlossaryProps) {
  return (
    <section
      aria-label={lexiconGlossaryCopy.title}
      className={[
        "rounded-[var(--radius-feature)] border border-[var(--border)] bg-black/35 p-5 lg:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{lexiconGlossaryCopy.eyebrow}</p>
      <h2 className="heading-section mt-4 !text-2xl">{lexiconGlossaryCopy.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-gray-300)]">
        {lexiconGlossaryCopy.description}
      </p>

      <div className="mt-6 divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)]">
        {glossaryEntries.map((entry) => (
          <div
            key={entry.quantum}
            className="grid gap-4 p-4 md:grid-cols-2 md:gap-8"
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
    </section>
  );
}
