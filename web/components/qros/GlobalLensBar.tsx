"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useQrosLens } from "@/lib/qros-lens-context";
import { lensToQuery } from "@/lib/qros-api";

const FRAMEWORKS = ["CMMC", "NIST", "PCI", "SOC2"];
const SEVERITIES = ["critical", "high", "medium", "low"];

export default function GlobalLensBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lens, setLens, resetLens } = useQrosLens();

  const syncUrl = (next: typeof lens) => {
    const params = new URLSearchParams(searchParams.toString());
    const keys = ["bu", "framework", "severity", "env", "q"] as const;
    keys.forEach((k) => params.delete(k));
    const q = lensToQuery(next);
    if (q) {
      new URLSearchParams(q).forEach((v, k) => params.set(k, v));
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const patch = (partial: Partial<typeof lens>) => {
    setLens(partial);
  };

  const commitLensUrl = (next: typeof lens) => {
    syncUrl(next);
  };

  return (
    <section
      aria-label="Global lens filters"
      className="flex flex-wrap items-end gap-3 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/40 p-4"
    >
      <div>
        <label className="text-[0.65rem] uppercase tracking-wider text-[var(--color-gray-500)]" htmlFor="lens-bu">
          Business unit
        </label>
        <input
          id="lens-bu"
          value={lens.businessUnit ?? ""}
          onChange={(e) => patch({ businessUnit: e.target.value || null })}
          onBlur={(e) => commitLensUrl({ ...lens, businessUnit: e.target.value || null })}
          placeholder="All"
          className="mt-1 block w-full min-w-[8rem] rounded-lg border border-[var(--border-subtle)] bg-black px-3 py-1.5 text-sm text-white"
        />
      </div>
      <div>
        <label className="text-[0.65rem] uppercase tracking-wider text-[var(--color-gray-500)]" htmlFor="lens-fw">
          Framework
        </label>
        <select
          id="lens-fw"
          value={lens.framework ?? ""}
          onChange={(e) => {
            const next = { ...lens, framework: e.target.value || null };
            patch({ framework: e.target.value || null });
            commitLensUrl(next);
          }}
          className="mt-1 block w-full min-w-[8rem] rounded-lg border border-[var(--border-subtle)] bg-black px-3 py-1.5 text-sm text-white"
        >
          <option value="">All</option>
          {FRAMEWORKS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[0.65rem] uppercase tracking-wider text-[var(--color-gray-500)]" htmlFor="lens-sev">
          Severity
        </label>
        <select
          id="lens-sev"
          value={lens.severity ?? ""}
          onChange={(e) => {
            const next = { ...lens, severity: e.target.value || null };
            patch({ severity: e.target.value || null });
            commitLensUrl(next);
          }}
          className="mt-1 block w-full min-w-[8rem] rounded-lg border border-[var(--border-subtle)] bg-black px-3 py-1.5 text-sm text-white"
        >
          <option value="">All</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[0.65rem] uppercase tracking-wider text-[var(--color-gray-500)]" htmlFor="lens-env">
          Environment
        </label>
        <input
          id="lens-env"
          value={lens.environment ?? ""}
          onChange={(e) => patch({ environment: e.target.value || null })}
          onBlur={(e) => commitLensUrl({ ...lens, environment: e.target.value || null })}
          placeholder="prod"
          className="mt-1 block w-full min-w-[8rem] rounded-lg border border-[var(--border-subtle)] bg-black px-3 py-1.5 text-sm text-white"
        />
      </div>
      <button
        type="button"
        onClick={() => {
          resetLens();
          commitLensUrl({ businessUnit: null, framework: null, severity: null, environment: null, query: null });
        }}
        className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--color-gray-300)] hover:text-white"
      >
        Reset lens
      </button>
    </section>
  );
}
