"use client";

import { useId, useState } from "react";

import { glossaryById, type GlossaryEntry } from "@/lib/pqc-glossary";

type InfoTipProps = {
  termId: string;
  label?: string;
  entry?: GlossaryEntry;
};

export default function InfoTip({ termId, label, entry }: InfoTipProps) {
  const resolved = entry ?? glossaryById(termId);
  const [open, setOpen] = useState(false);
  const tipId = useId();
  if (!resolved) {
    return null;
  }

  return (
    <span className="relative inline-flex items-center gap-1">
      {label ? <span>{label}</span> : null}
      <button
        type="button"
        aria-label={`About ${resolved.term}`}
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--border-strong)] text-[10px] text-[var(--color-gray-400)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        i
      </button>
      {open ? (
        <span
          id={tipId}
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-[var(--border-strong)] bg-[var(--color-gray-900)] p-3 text-left text-xs leading-5 text-[var(--color-gray-300)] shadow-lg"
        >
          <span className="block font-medium text-white">{resolved.term}</span>
          {resolved.plain}
          {resolved.url ? (
            <a
              href={resolved.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-white underline underline-offset-2"
            >
              Authoritative reference
            </a>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
