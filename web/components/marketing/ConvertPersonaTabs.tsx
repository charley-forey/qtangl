"use client";

import Link from "next/link";
import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { convertPersonaCopy } from "@/lib/copy/readiness-convert";

export default function ConvertPersonaTabs() {
  const [active, setActive] = useState<string>(convertPersonaCopy[0].id);
  const persona = convertPersonaCopy.find((p) => p.id === active) ?? convertPersonaCopy[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Persona views">
        {convertPersonaCopy.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={active === p.id}
            onClick={() => setActive(p.id)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              active === p.id
                ? "border-white/30 bg-white/10 text-white"
                : "border-[var(--border)] text-[var(--color-gray-400)] hover:text-white",
            ].join(" ")}
          >
            {p.title}
          </button>
        ))}
      </div>

      <Card tone="feature" className="rounded-[var(--radius-xl)]">
        <p className="text-sm font-semibold text-white">{persona.title}</p>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">Trigger: {persona.trigger}</p>
        <ul className="mt-6 space-y-3">
          {persona.outcomes.map((outcome) => (
            <li key={outcome} className="flex gap-2 text-sm text-[var(--color-gray-300)]">
              <span className="text-emerald-400" aria-hidden>
                →
              </span>
              {outcome}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={persona.cta.href}>{persona.cta.label}</Button>
          <Link
            href={persona.anchor}
            className="inline-flex items-center text-sm text-[var(--color-gray-400)] underline-offset-4 hover:text-white hover:underline"
          >
            Jump to section →
          </Link>
        </div>
      </Card>
    </div>
  );
}
