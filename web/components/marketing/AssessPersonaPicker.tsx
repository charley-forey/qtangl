"use client";

import { useRouter, useSearchParams } from "next/navigation";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { trackEvent } from "@/lib/analytics";
import { ASSESS_PERSONAS, isAssessPersona, type AssessPersona } from "@/lib/assess-persona";

export default function AssessPersonaPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personaParam = searchParams.get("persona");
  const active = isAssessPersona(personaParam) ? personaParam : null;

  function select(persona: AssessPersona) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("persona", persona);
    router.replace(`/assess?${params.toString()}`, { scroll: false });
    trackEvent("assess_persona_selected", { persona });
  }

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Your path</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
        Pick a role — we&apos;ll open the results tab that matches your workflow after your first scan.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {ASSESS_PERSONAS.map((persona) => {
          const selected = active === persona.id;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => select(persona.id)}
              className={[
                "touch-target rounded-xl border px-4 py-4 text-left transition",
                selected
                  ? "border-[var(--border-strong)] bg-white/[0.08]"
                  : "border-[var(--border-subtle)] bg-black/20 hover:border-[var(--border-strong)]",
              ].join(" ")}
              aria-pressed={selected}
            >
              <p className="text-sm font-semibold text-white">{persona.label}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-gray-400)]">{persona.description}</p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
