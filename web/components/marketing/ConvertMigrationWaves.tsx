"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { convertMigrationWaves } from "@/lib/copy/readiness-demos";

export default function ConvertMigrationWaves() {
  const [expanded, setExpanded] = useState<number | null>(1);

  return (
    <div className="space-y-4">
      <div className="relative hidden h-2 rounded-full bg-white/5 md:block">
        <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-sky-500/40 via-amber-500/40 to-emerald-500/40" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {convertMigrationWaves.map((wave) => (
          <Card
            key={wave.wave}
            tone={expanded === wave.wave ? "feature" : "ghost"}
            className="rounded-[var(--radius-xl)]"
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setExpanded(expanded === wave.wave ? null : wave.wave)}
              aria-expanded={expanded === wave.wave}
            >
              <Eyebrow>
                {wave.quarter} · Wave {wave.wave}
              </Eyebrow>
              <p className="mt-2 text-sm font-semibold text-white">{wave.title}</p>
              <p className="mt-1 text-xs text-[var(--color-gray-500)]">Owner: {wave.owner}</p>
            </button>
            {expanded === wave.wave ? (
              <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                <ol className="space-y-2">
                  {wave.steps.map((step, i) => (
                    <li key={step} className="text-xs text-[var(--color-gray-400)]">
                      {i + 1}. {step}
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-emerald-300">Checkpoint: {wave.checkpoint}</p>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
