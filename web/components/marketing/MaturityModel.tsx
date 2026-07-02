"use client";

import Link from "next/link";
import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { maturityStages } from "@/lib/copy/readiness-journey";

export default function MaturityModel({ defaultStage = 1 }: { defaultStage?: number }) {
  const [selected, setSelected] = useState(defaultStage);

  const stage = maturityStages.find((s) => s.stage === selected) ?? maturityStages[1];
  const nextStage = maturityStages.find((s) => s.stage === selected + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {maturityStages.map((s) => (
          <button
            key={s.stage}
            type="button"
            onClick={() => setSelected(s.stage)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              selected === s.stage
                ? "border-white/30 bg-white/10 text-white"
                : "border-[var(--border)] text-[var(--color-gray-400)] hover:border-[var(--border-strong)] hover:text-white",
            ].join(" ")}
          >
            {s.stage}. {s.name}
          </button>
        ))}
      </div>

      <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
        <Eyebrow>Stage {stage.stage} — {stage.name}</Eyebrow>
        <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">{stage.characteristics}</p>
        <p className="mt-4 text-sm text-white">
          Recommended tier: <span className="font-semibold">{stage.tier}</span>
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={stage.href}
            className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
          >
            {stage.cta}
          </Link>
          {nextStage && selected < 6 ? (
            <button
              type="button"
              onClick={() => setSelected(selected + 1)}
              className="inline-flex items-center rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm text-white"
            >
              Next stage: {nextStage.name} →
            </button>
          ) : null}
        </div>
      </Card>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
            <tr>
              <th className="pb-3 pr-4">Stage</th>
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Tier</th>
              <th className="pb-3">Link</th>
            </tr>
          </thead>
          <tbody className="text-[var(--color-gray-300)]">
            {maturityStages.map((s) => (
              <tr
                key={s.stage}
                className={[
                  "border-t border-[var(--border-subtle)]",
                  selected === s.stage ? "bg-white/[0.03]" : "",
                ].join(" ")}
              >
                <td className="py-3 pr-4 font-mono text-xs text-white">{s.stage}</td>
                <td className="py-3 pr-4">{s.name}</td>
                <td className="py-3 pr-4">{s.tier}</td>
                <td className="py-3">
                  <Link href={s.href} className="text-white underline underline-offset-4">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
