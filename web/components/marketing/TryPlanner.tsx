"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import CodeBlock from "@/components/docs/CodeBlock";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import PlanVisualization from "@/components/visualization/PlanVisualization";
import { tryScenarios } from "@/lib/demo-data";

type ScenarioId = (typeof tryScenarios)[number]["id"];

const GENERATION_DELAY_MS = 650;

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

function getFieldId(scenarioId: ScenarioId, fieldLabel: string) {
  return `${scenarioId}-${fieldLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export default function TryPlanner() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>("schedule");
  const [valuesByScenario, setValuesByScenario] = useState(buildInitialValues);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApi, setShowApi] = useState(false);
  const generationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeScenario = useMemo(
    () => tryScenarios.find((scenario) => scenario.id === activeScenarioId) ?? tryScenarios[0],
    [activeScenarioId]
  );

  useEffect(() => {
    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, []);

  function resetGeneratedPlan() {
    if (generationTimeoutRef.current) {
      clearTimeout(generationTimeoutRef.current);
      generationTimeoutRef.current = null;
    }

    setIsGenerating(false);
    setHasGenerated(false);
  }

  function handleChange(fieldLabel: string, nextValue: string) {
    resetGeneratedPlan();
    setValuesByScenario((current) => ({
      ...current,
      [activeScenarioId]: {
        ...current[activeScenarioId],
        [fieldLabel]: nextValue,
      },
    }));
  }

  function handleScenarioChange(nextScenarioId: ScenarioId) {
    resetGeneratedPlan();
    setActiveScenarioId(nextScenarioId);
  }

  function handleScenarioKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    scenarioId: ScenarioId
  ) {
    const currentIndex = tryScenarios.findIndex((scenario) => scenario.id === scenarioId);
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % tryScenarios.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + tryScenarios.length) % tryScenarios.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tryScenarios.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();

    const nextScenarioId = tryScenarios[nextIndex].id;
    handleScenarioChange(nextScenarioId);
    window.requestAnimationFrame(() => {
      document.getElementById(`${nextScenarioId}-scenario-tab`)?.focus();
    });
  }

  function handleGenerate() {
    resetGeneratedPlan();
    setIsGenerating(true);
    generationTimeoutRef.current = setTimeout(() => {
      setHasGenerated(true);
      setIsGenerating(false);
      generationTimeoutRef.current = null;
    }, GENERATION_DELAY_MS);
  }

  const scenarioPanelId = `${activeScenario.id}-scenario-panel`;
  const generationStatus = isGenerating
    ? "Generating preview plan."
    : hasGenerated
      ? `${activeScenario.label} preview ready.`
      : "Plan preview hidden until you generate.";

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

        <div
          className="mt-6 flex flex-wrap gap-3"
          role="tablist"
          aria-label="Planning scenarios"
        >
          {tryScenarios.map((scenario) => {
            const active = scenario.id === activeScenarioId;
            const tabId = `${scenario.id}-scenario-tab`;
            const tabPanelId = `${scenario.id}-scenario-panel`;

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleScenarioChange(scenario.id)}
                onKeyDown={(event) => handleScenarioKeyDown(event, scenario.id)}
                role="tab"
                id={tabId}
                aria-selected={active}
                aria-controls={tabPanelId}
                tabIndex={active ? 0 : -1}
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

        <div
          className="mt-8"
          role="tabpanel"
          id={scenarioPanelId}
          aria-labelledby={`${activeScenario.id}-scenario-tab`}
        >
          <h3 className="text-xl font-semibold text-white">{activeScenario.title}</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {activeScenario.description}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {activeScenario.fields.map((field) => (
            <label
              key={`${activeScenario.id}-${field.label}`}
              className="grid gap-2"
              htmlFor={getFieldId(activeScenario.id, field.label)}
            >
              <span className="text-sm text-[var(--color-gray-300)]">{field.label}</span>
              <textarea
                id={getFieldId(activeScenario.id, field.label)}
                rows={field.value.length > 40 ? 3 : 2}
                value={valuesByScenario[activeScenario.id][field.label]}
                onChange={(event) => handleChange(field.label, event.target.value)}
                aria-describedby={`${getFieldId(activeScenario.id, field.label)}-help`}
                className="rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-[var(--color-gray-500)] focus:border-[var(--border-strong)]"
              />
              <span
                id={`${getFieldId(activeScenario.id, field.label)}-help`}
                className="text-xs leading-6 text-[var(--color-gray-500)]"
              >
                {field.help}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Plan"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowApi((current) => !current)}
          >
            {showApi ? "Hide API example" : "See API request"}
          </Button>
        </div>
        <p className="mt-3 text-sm text-[var(--color-gray-400)]" aria-live="polite">
          {generationStatus}
        </p>

        {showApi ? (
          <div className="mt-8 space-y-4">
            <CodeBlock title="Example request" code={activeScenario.apiRequest} />
            <CodeBlock title="Example response" code={activeScenario.apiResponse} />
          </div>
        ) : null}
      </Card>

      <div className="space-y-6" aria-busy={isGenerating}>
        {hasGenerated ? (
          <PlanVisualization plan={activeScenario.plan} />
        ) : (
          <Card strong className="rounded-[2rem] p-6 sm:p-8">
            <Eyebrow>{isGenerating ? "Generating" : "Plan preview"}</Eyebrow>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              {isGenerating ? "Building your preview..." : "Generate a preview plan"}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              {isGenerating
                ? "Qtangl is simulating a short planning pass so the preview feels intentional."
                : "Adjust the scenario inputs on the left, then select Generate Plan to reveal the ranked output."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
