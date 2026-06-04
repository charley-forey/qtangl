"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { requestAccess } from "@/app/access/actions";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { initialAccessFormState } from "@/lib/access/form-state";
import { trackEvent } from "@/lib/analytics";
import {
  miniAssessmentCopy,
  miniAssessmentScenarios,
  sampleCbomPath,
  type MiniAssessmentScenario,
} from "@/lib/copy/readiness-value";
import { readMiniAssessmentFunnel } from "@/lib/hndl-funnel";

const SEVERITY_CLASS: Record<string, string> = {
  critical: "text-red-300",
  high: "text-amber-300",
  medium: "text-[var(--color-gray-300)]",
};

function ScenarioPicker({
  selected,
  onSelect,
}: {
  selected: MiniAssessmentScenario;
  onSelect: (scenario: MiniAssessmentScenario) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {miniAssessmentScenarios.map((scenario) => {
        const active = scenario.id === selected.id;
        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario)}
            aria-pressed={active}
            className={`touch-target rounded-full border px-4 py-2 text-sm transition ${
              active
                ? "border-[var(--border-strong)] bg-white text-black"
                : "border-[var(--border)] bg-white/[0.02] text-[var(--color-gray-300)] hover:border-[var(--border-strong)] hover:text-white"
            }`}
          >
            {scenario.label}
          </button>
        );
      })}
    </div>
  );
}

export default function MiniAssessmentClient() {
  const searchParams = useSearchParams();
  const funnel = useMemo(() => readMiniAssessmentFunnel(searchParams), [searchParams]);
  const [state, formAction, pending] = useActionState(requestAccess, initialAccessFormState);
  const [selected, setSelected] = useState<MiniAssessmentScenario>(miniAssessmentScenarios[0]!);
  const [formStartedAt] = useState(() => Date.now());
  const unlocked = state.status === "success";
  const { gate, selector, upsell } = miniAssessmentCopy;
  const { results, findings } = selected;
  const formSource =
    funnel.source !== "mini-assessment-direct"
      ? funnel.source
      : `mini-assessment-${selected.id}`;

  useEffect(() => {
    trackEvent("mini_assessment_view", {
      source: funnel.source,
      utmSource: funnel.utmSource,
      utmMedium: funnel.utmMedium,
      utmCampaign: funnel.utmCampaign,
      utmContent: funnel.utmContent,
    });
  }, [funnel]);

  if (!unlocked) {
    return (
      <Card tone="feature" size="lg" className="mx-auto max-w-xl rounded-[var(--radius-feature)]">
        <Eyebrow>{selector.eyebrow}</Eyebrow>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">{selector.label}</p>
        <div className="mt-4">
          <ScenarioPicker selected={selected} onSelect={setSelected} />
        </div>

        <div className="mt-8 border-t border-[var(--border-subtle)] pt-8">
          <Eyebrow>{gate.title}</Eyebrow>
          <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">{gate.description}</p>
          <form action={formAction} className="mt-6 space-y-4">
            <input type="hidden" name="interest" value="Q-Day Assessment (one-time)" />
            <input type="hidden" name="source" value={formSource} />
            <input type="hidden" name="formStartedAt" value={String(formStartedAt)} />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <label className="block text-sm">
              <span className="text-[var(--color-gray-400)]">Work email</span>
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm text-white"
              />
              {state.fieldErrors.email ? (
                <span className="mt-1 block text-xs text-red-300">{state.fieldErrors.email}</span>
              ) : null}
            </label>
            <label className="block text-sm">
              <span className="text-[var(--color-gray-400)]">Primary domain (optional)</span>
              <input
                type="text"
                name="message"
                placeholder="api.example.com — we prioritize live scan requests"
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm text-white"
              />
            </label>
            {state.status === "error" ? (
              <p className="text-sm text-red-300">{state.message}</p>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? gate.pendingLabel : gate.submitLabel}
            </Button>
          </form>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Eyebrow>{results.targetDomain}</Eyebrow>
        <ScenarioPicker selected={selected} onSelect={setSelected} />
      </div>

      <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
        <Eyebrow>{selected.eyebrow}</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Readiness score</p>
            <p className="mt-2 text-3xl font-semibold text-white">{results.readinessScore}</p>
            <p className="mt-1 text-xs text-amber-300">{results.readinessBand}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Coverage confidence</p>
            <p className="mt-2 text-3xl font-semibold text-white">{results.coverageConfidence}%</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Sample target</p>
            <p className="mt-2 text-sm font-medium text-white">{results.targetDomain}</p>
          </div>
        </div>
        <p className="mt-6 text-xs leading-6 text-[var(--color-gray-500)]">
          Fixture-only preview. Authorize a live scan for your production domains and a signed CBOM export.
        </p>
      </Card>

      <div className="space-y-3">
        <Eyebrow>Top 5 findings</Eyebrow>
        {findings.map((finding) => (
          <Card key={finding.rank} tone="ghost" className="rounded-[var(--radius-xl)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  #{finding.rank} · {finding.title}
                </p>
                <p className="mt-1 text-xs text-[var(--color-gray-500)]">{finding.framework}</p>
              </div>
              <span className={`text-xs font-medium uppercase tracking-wide ${SEVERITY_CLASS[finding.severity]}`}>
                {finding.severity} · {finding.algorithm}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card tone="strong" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Keep this from drifting</Eyebrow>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{selected.monitorPitch}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={upsell.primary.href}>{upsell.primary.label}</Button>
          <Button href="/assess" variant="secondary">
            Run live scan
          </Button>
          <Button
            href={`/access?interest=${encodeURIComponent("Q-Day Monitor (annual)")}&source=${encodeURIComponent(formSource)}`}
            variant="secondary"
          >
            {upsell.secondary.label}
          </Button>
          <Button href="/verify?token=sample-token" variant="secondary">
            Verify sample report
          </Button>
          <Button href={sampleCbomPath} variant="secondary">
            {upsell.tertiary.label}
          </Button>
        </div>
      </Card>
    </div>
  );
}
