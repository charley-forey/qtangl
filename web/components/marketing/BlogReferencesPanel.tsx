import type { QDaySource } from "@/lib/copy/q-day-sources";
import { qDaySourcesLastVerified } from "@/lib/copy/q-day-sources";

type BlogReferencesPanelProps = {
  sources: readonly QDaySource[];
  title?: string;
  description?: string;
};

export default function BlogReferencesPanel({
  sources,
  title = "References & further reading",
  description = "Authoritative primary sources cited in this article. Summaries are our own — follow links for full context.",
}: BlogReferencesPanelProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/40 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">{title}</p>
        <p className="mt-2 text-sm text-[var(--color-gray-300)]">{description}</p>
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">
          Last verified {qDaySourcesLastVerified}
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {sources.map((source) => (
          <li key={source.id} className="text-sm">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-4"
            >
              {source.title}
            </a>
            <span className="mt-1 block text-xs text-[var(--color-gray-500)]">
              {source.publisher} · {source.date}
            </span>
            <span className="mt-1 block text-xs leading-5 text-[var(--color-gray-400)]">
              {source.summary}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
