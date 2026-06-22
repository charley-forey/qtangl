"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics";
import { notFoundCopy } from "@/lib/copy/not-found";

export default function NotFoundMoscaCompact() {
  const copy = notFoundCopy.marketing.mosca;
  const [open, setOpen] = useState(false);
  const [dataYears, setDataYears] = useState(10);
  const [migrationYears, setMigrationYears] = useState(5);
  const [quantumYears, setQuantumYears] = useState(8);

  const holds = dataYears + migrationYears > quantumYears;

  useEffect(() => {
    if (!open) {
      return;
    }
    trackEvent("not_found_mosca_calc_run", { holds });
  }, [open, dataYears, migrationYears, quantumYears, holds]);

  return (
    <Card tone="feature" className="rounded-[var(--radius-feature)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-white">{copy.toggle}</span>
        <span className="text-xs text-[var(--color-gray-500)]">{open ? "Hide" : "Show"}</span>
      </button>

      {open ? (
        <div className="mt-6 space-y-6 border-t border-[var(--border)] pt-6">
          <p className="text-sm leading-7 text-[var(--color-gray-300)]">
            If X + Y &gt; Z, harvest-now-decrypt-later exposure requires action now.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="text-label text-[var(--color-gray-500)]">X — Data shelf-life (years)</span>
              <input
                type="number"
                min={1}
                max={50}
                value={dataYears}
                onChange={(event) => setDataYears(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-white"
                aria-label="Data shelf-life in years"
              />
            </label>
            <label className="block text-sm">
              <span className="text-label text-[var(--color-gray-500)]">Y — Migration runway (years)</span>
              <input
                type="number"
                min={1}
                max={20}
                value={migrationYears}
                onChange={(event) => setMigrationYears(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-white"
                aria-label="Migration runway in years"
              />
            </label>
            <label className="block text-sm">
              <span className="text-label text-[var(--color-gray-500)]">Z — Quantum timeline (years)</span>
              <input
                type="number"
                min={1}
                max={30}
                value={quantumYears}
                onChange={(event) => setQuantumYears(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-white"
                aria-label="Quantum timeline in years"
              />
            </label>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/55 px-5 py-4" aria-live="polite">
            <p className="text-sm text-[var(--color-gray-400)]">
              {dataYears} + {migrationYears} = {dataYears + migrationYears} vs Z = {quantumYears}
            </p>
            <p className="mt-2 text-base font-semibold text-white">
              {holds
                ? "Inequality holds — HNDL exposure today."
                : "Inequality does not hold — lower immediate HNDL pressure."}
            </p>
          </div>
          <Link href={copy.linkHref} className="text-sm text-white underline underline-offset-4">
            {copy.linkLabel}
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
