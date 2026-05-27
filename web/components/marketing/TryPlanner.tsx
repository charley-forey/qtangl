"use client";

import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import CodeBlock from "@/components/docs/CodeBlock";
import SandboxResponse from "@/components/marketing/SandboxResponse";
import SandboxStatusBar from "@/components/marketing/SandboxStatusBar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchQtanglJson, qtanglApiBaseUrl, qtanglSandboxApiKey } from "@/lib/api";
import { tryScenarios } from "@/lib/demo-data";
import type { OptimizeResponse, SandboxLiveStatus } from "@/lib/optimize";
import { tryPlannerCopy } from "@/lib/copy/try";

type ScenarioId = (typeof tryScenarios)[number]["id"];

type TryPlannerProps = {
  layout?: "embedded" | "page";
};

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

function toOptimizeResponse(value: Record<string, unknown>): OptimizeResponse {
  return value as OptimizeResponse;
}

function buildCurlCommand(apiRequest: Record<string, unknown>) {
  const body = JSON.stringify(apiRequest, null, 2);
  return [
    `curl -X POST "${qtanglApiBaseUrl}/optimize" \\`,
    `  -H "Authorization: Bearer ${qtanglSandboxApiKey}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '${body.replace(/'/g, "'\\''")}'`,
  ].join("\n");
}

export default function TryPlanner({ layout = "embedded" }: TryPlannerProps) {
  const isPageLayout = layout === "page";
  const responsePanelRef = useRef<HTMLDivElement>(null);

  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>("schedule");
  const [valuesByScenario] = useState(buildInitialValues);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApi, setShowApi] = useState(isPageLayout);
  const [liveStatus, setLiveStatus] = useState<SandboxLiveStatus>("preview");
  const [liveResponse, setLiveResponse] = useState<OptimizeResponse | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [hasCalledLive, setHasCalledLive] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);

  const activeScenario = useMemo(
    () => tryScenarios.find((scenario) => scenario.id === activeScenarioId) ?? tryScenarios[0],
    [activeScenarioId]
  );
  const activeScenarioCopy = tryPlannerCopy.scenarios[activeScenario.id];

  const displayResponse = useMemo(
    () =>
      liveResponse ??
      toOptimizeResponse(activeScenario.apiResponse as Record<string, unknown>),
    [liveResponse, activeScenario.apiResponse]
  );

  const curlCommand = useMemo(
    () => buildCurlCommand(activeScenario.apiRequest),
    [activeScenario.apiRequest]
  );

  function resetToPreview() {
    setIsGenerating(false);
    setLiveStatus("preview");
    setLiveResponse(null);
    setLiveError(null);
    setHasCalledLive(false);
  }

  function handleScenarioChange(nextScenarioId: ScenarioId) {
    resetToPreview();
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

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setLiveError(null);

    try {
      const response = await fetchQtanglJson<OptimizeResponse>("/optimize", {
        method: "POST",
        body: JSON.stringify(activeScenario.apiRequest),
      });
      setLiveResponse(response);
      setLiveStatus("live");
    } catch (error) {
      setLiveResponse(
        toOptimizeResponse(activeScenario.apiResponse as Record<string, unknown>)
      );
      setLiveStatus("fallback");
      setLiveError(error instanceof Error ? error.message : "Live API unavailable");
    } finally {
      setIsGenerating(false);
      setHasCalledLive(true);
    }
  }, [activeScenario.apiRequest, activeScenario.apiResponse]);

  async function handleCopyCurl() {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCurlCopied(true);
      window.setTimeout(() => setCurlCopied(false), 1400);
    } catch {
      setCurlCopied(false);
    }
  }

  useEffect(() => {
    if (!hasCalledLive || isGenerating) return;
    responsePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [hasCalledLive, isGenerating, liveStatus]);

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        if (!isGenerating) {
          void handleGenerate();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGenerate, isGenerating]);

  const scenarioPanelId = `${activeScenario.id}-scenario-panel`;
  const generationStatus = isGenerating
    ? tryPlannerCopy.status.generating
    : hasCalledLive && liveStatus === "live"
      ? tryPlannerCopy.status.liveReady
      : hasCalledLive && liveStatus === "fallback"
        ? tryPlannerCopy.status.fallbackReady
        : null;

  return (
    <div className="grid min-w-0 gap-6">
      {isPageLayout ? (
        <SandboxStatusBar status={liveStatus} isLoading={isGenerating} />
      ) : null}

      <div className="grid min-w-0 gap-8 xl:grid-cols-[0.82fr_1.18fr]">
        <Card tone="feature" size="lg" className="min-w-0 rounded-[var(--radius-feature)]">
          <Eyebrow>{tryPlannerCopy.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4 pb-0.5">{tryPlannerCopy.title}</h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            {tryPlannerCopy.description}
          </p>

          <div
            className="mt-6 flex flex-wrap gap-3"
            role="tablist"
            aria-label={tryPlannerCopy.tabLabel}
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
            <h3 className="text-xl font-semibold text-white">{activeScenarioCopy.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
              {activeScenarioCopy.description}
            </p>
          </div>

          <p className="mt-6 text-xs leading-6 text-[var(--color-gray-500)]">
            {tryPlannerCopy.fieldsNote}
          </p>

          <div className="mt-4 space-y-4">
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
                  readOnly
                  value={valuesByScenario[activeScenario.id][field.label]}
                  aria-describedby={`${getFieldId(activeScenario.id, field.label)}-help`}
                  className="cursor-default rounded-xl border border-[var(--border)] bg-black/60 px-4 py-3 text-sm leading-7 text-[var(--color-gray-400)] outline-none"
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? tryPlannerCopy.buttons.generating : tryPlannerCopy.buttons.generate}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCopyCurl}>
              {curlCopied ? tryPlannerCopy.buttons.copiedCurl : tryPlannerCopy.buttons.copyCurl}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowApi((current) => !current)}
            >
              {showApi ? tryPlannerCopy.buttons.hideApi : tryPlannerCopy.buttons.showApi}
            </Button>
          </div>
          {generationStatus ? (
            <p className="mt-3 text-sm text-[var(--color-gray-400)]" aria-live="polite">
              {generationStatus}
            </p>
          ) : null}
          {isPageLayout ? (
            <p className="mt-2 text-xs text-[var(--color-gray-500)]">{tryPlannerCopy.keyboardHint}</p>
          ) : null}
        </Card>

        <div ref={responsePanelRef} className="min-w-0" aria-busy={isGenerating}>
          <SandboxResponse
            response={displayResponse}
            status={liveStatus}
            error={liveError}
            isLoading={isGenerating}
            scenarioId={activeScenario.id}
          />
        </div>

        {showApi ? (
          <div className="min-w-0 xl:col-span-2">
            <p className="mb-3 text-sm text-[var(--color-gray-400)]">
              {tryPlannerCopy.requestPanelHint}
            </p>
            <CodeBlock title={tryPlannerCopy.requestPanelTitle} code={activeScenario.apiRequest} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
