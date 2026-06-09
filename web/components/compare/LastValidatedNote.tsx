import Link from "next/link";

type LastValidatedNoteProps = {
  lastValidated: string;
  sources?: { label: string; url: string }[];
};

export default function LastValidatedNote({ lastValidated, sources }: LastValidatedNoteProps) {
  return (
    <aside className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/30 p-5 text-sm leading-7 text-[var(--color-gray-400)]">
      <p>
        Comparison based on public vendor positioning as of{" "}
        <time dateTime={lastValidated}>{lastValidated}</time>. Confirm capabilities in your own
        evaluation — we reflect shipped reality, not roadmap promises.
      </p>
      <p className="mt-3">
        <Link href="/compare#methodology" className="text-white underline underline-offset-4">
          Methodology
        </Link>
        {" · "}
        <Link href="/resources/faq" className="text-white underline underline-offset-4">
          FAQ
        </Link>
      </p>
      {sources && sources.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
          {sources.slice(0, 3).map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
