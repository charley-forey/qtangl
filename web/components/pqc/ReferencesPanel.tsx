import Link from "next/link";

import { PQC_FRAMEWORKS, PQC_GLOSSARY } from "@/lib/pqc-glossary";

export default function ReferencesPanel() {
  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/40 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">References &amp; standards</p>
        <p className="mt-2 text-sm text-[var(--color-gray-300)]">
          Authoritative primary sources cited in this report.{" "}
          <Link href="/demo/pqc/methodology" className="text-white underline underline-offset-4">
            Full methodology
          </Link>
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {[...PQC_GLOSSARY.slice(0, 4), ...PQC_FRAMEWORKS].map((entry) => (
          <li key={entry.id} className="text-sm">
            {entry.url ? (
              <a href={entry.url} target="_blank" rel="noreferrer" className="text-white underline underline-offset-4">
                {entry.term}
              </a>
            ) : (
              <span className="text-white">{entry.term}</span>
            )}
            <span className="mt-1 block text-xs text-[var(--color-gray-500)]">{entry.plain}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
