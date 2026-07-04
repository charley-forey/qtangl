"use client";

import { useQrosLens } from "@/lib/qros-lens-context";

const FRAMEWORKS = ["CMMC", "NIST", "PCI", "SOC2"];
const SEVERITIES = ["critical", "high", "medium", "low"];

export default function GlobalLensBar() {
  const { lens, setLens, resetLens } = useQrosLens();

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
          onChange={(e) => setLens({ businessUnit: e.target.value || null })}
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
          onChange={(e) => setLens({ framework: e.target.value || null })}
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
          onChange={(e) => setLens({ severity: e.target.value || null })}
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
          onChange={(e) => setLens({ environment: e.target.value || null })}
          placeholder="prod"
          className="mt-1 block w-full min-w-[8rem] rounded-lg border border-[var(--border-subtle)] bg-black px-3 py-1.5 text-sm text-white"
        />
      </div>
      <button
        type="button"
        onClick={resetLens}
        className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--color-gray-300)] hover:text-white"
      >
        Reset lens
      </button>
    </section>
  );
}
