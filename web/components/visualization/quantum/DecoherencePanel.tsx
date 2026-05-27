import { decoherencePanelCopy } from "@/lib/copy/visualization";
import { decoherenceModes } from "@/lib/copy/technology-deep";

type DecoherencePanelProps = {
  className?: string;
};

export default function DecoherencePanel({ className = "" }: DecoherencePanelProps) {
  return (
    <section
      aria-label={decoherencePanelCopy.title}
      className={[
        "rounded-[var(--radius-feature)] border border-[var(--border)] bg-black/35 p-5 lg:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{decoherencePanelCopy.eyebrow}</p>
      <h2 className="heading-section mt-4 !text-2xl">{decoherencePanelCopy.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-gray-300)]">
        {decoherencePanelCopy.description}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {decoherenceModes.map((mode) => (
          <article
            key={mode.title}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4"
          >
            <h3 className="text-sm font-semibold text-white">{mode.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{mode.symptom}</p>
            <p className="mt-4 font-mono text-xs leading-6 text-[var(--color-gray-500)]">
              {mode.response}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
