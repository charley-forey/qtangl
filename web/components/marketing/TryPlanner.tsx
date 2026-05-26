"use client";

import { useMemo, useState } from "react";

import CodeBlock from "@/components/docs/CodeBlock";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import PlanVisualization from "@/components/visualization/PlanVisualization";
import { tryScenarios } from "@/lib/demo-data";

function buildInitialValues() {
  return Object.fromEntries(
    tryScenarios.map((scenario) => [
      scenario.id,
      Object.fromEntries(
        scenario.fields.map((field) => [field.label, field.value])
      ),
    ])
  ) as Record<string, Record<string, string>>;
}

export default function TryPlanner() {
  const [activeScenarioId, setActiveScenarioId] = useState<(typeof tryScenarios)[number]["id"]>("schedule");
  const [valuesByScenario, setValuesByScenario] = useState(buildInitialValues);
  const [hasGenerated, setHasGenerated] = useState(true);
  const [showApi, setShowApi] = useState(false);

  const activeScenario = useMemo(
    () => tryScenarios.find((scenario) => scenario.id === activeScenarioId) ?? tryScenarios[0],
    [activeScenarioId]
  );

  function handleChange(fieldLabel: string, nextValue: string) {
    setValuesByScenario((current) => ({
      ...current,
      [activeScenarioId]: {
        ...current[activeScenarioId],
        [fieldLabel]: nextValue,
      },
    }));
  }

  function handleScenarioChange(nextScenarioId: (typeof tryScenarios)[number]["id"]) {
    setActiveScenarioId(nextScenarioId);
    setHasGenerated(true);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
      <Card strong className="rounded-[2rem] p-6 sm:p-8">
        <Eyebrow>Try it</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Start with a familiar planning problem.
        </h2>
        <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
          This is a guided product demo, not a production connector. Edit the fields,
          click generate, and see the kind of plan Qtangl is designed to return.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {tryScenarios.map((scenario) => {
            const active = scenario.id === activeScenarioId;

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleScenarioChange(scenario.id)}
                className={[
                  "rounded-full border px-4 py-2 text-sm transition",
                  active
                    ? "border-[var(--border-strong)] bg-white/[0.08] text-white"
                    : "border-[var(--border)] text-[var(--color-gray-300)] hover:border-[var(--border-strong)] hover:text-white",
                ].join(" ")}
              >
                {scenario.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white">{activeScenario.title}</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {activeScenario.description}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {activeScenario.fields.map((field) => (
            <label key={`${activeScenario.id}-${field.label}`} className="grid gap-2">
              <span className="text-sm text-[var(--color-gray-300)]">{field.label}</span>
              <textarea
                rows={field.value.length > 40 ? 3 : 2}
                value={valuesByScenario[activeScenario.id][field.label]}
                onChange={(event) => handleChange(field.label, event.target.value)}
                className="rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-[var(--color-gray-500)] focus:border-[var(--border-strong)]"
              />
              <span className="text-xs leading-6 text-[var(--color-gray-500)]">
                {field.help}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => setHasGenerated(true)}>
            Generate Plan
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowApi((current) => !current)}
          >
            {showApi ? "Hide API example" : "See API request"}
          </Button>
        </div>

        {showApi ? (
          <div className="mt-8 space-y-4">
            <CodeBlock title="Example request" code={activeScenario.apiRequest} />
            <CodeBlock title="Example response" code={activeScenario.apiResponse} />
          </div>
        ) : null}
      </Card>

      <div className="space-y-6">
        {hasGenerated ? <PlanVisualization plan={activeScenario.plan} /> : null}
      </div>
    </div>
  );
}
