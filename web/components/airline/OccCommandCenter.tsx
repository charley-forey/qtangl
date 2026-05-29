"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import type {
  AirlineCrewMember,
  AirlineFlight,
  AirlineSolveResponse,
  AuditPack,
  Scenario,
} from "@/lib/airline";
import {
  getAirlineNetwork,
  getAirlineScenarios,
  solveAirlineRecovery,
} from "@/lib/airline";
import { FALLBACK_SCENARIOS } from "@/lib/airline-fallback";

import AuditDrawer from "./AuditDrawer";
import CascadeMap from "./CascadeMap";
import CrewUploader from "./CrewUploader";
import DemoGuideStrip from "./DemoGuideStrip";
import DisruptionEvent from "./DisruptionEvent";
import RecoveryPlans from "./RecoveryPlans";
import RoiCalculator from "./RoiCalculator";
import ScenarioPicker from "./ScenarioPicker";
import ScoreboardCard from "./ScoreboardCard";
import SolveInsightBanner from "./SolveInsightBanner";
import SolveLog from "./SolveLog";
import VideoEmbed from "./VideoEmbed";
import { AirlineChip, AirlineSection } from "./ui";

type OccCommandCenterProps = {
  initialCrew: AirlineCrewMember[];
  initialFlights: AirlineFlight[];
  initialScenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
};

export default function OccCommandCenter({
  initialCrew,
  initialFlights,
  initialScenarios,
  backendConnected: initialBackendConnected,
  backendMessage: initialBackendMessage,
  apiBaseUrl,
}: OccCommandCenterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [scenarios, setScenarios] = useState(initialScenarios);
  const [crew, setCrew] = useState(initialCrew);
  const [flights, setFlights] = useState(initialFlights);
  const [backendConnected, setBackendConnected] = useState(initialBackendConnected);
  const [backendMessage, setBackendMessage] = useState(initialBackendMessage);

  const [activeScenarioId, setActiveScenarioId] = useState(
    searchParams.get("case") ?? scenarios[0]?.id ?? FALLBACK_SCENARIOS[0].id
  );
  const [seed] = useState(Number(searchParams.get("seed") ?? "1234"));
  const [useFixture, setUseFixture] = useState(searchParams.get("useFixture") !== "false");
  const [crewSessionId, setCrewSessionId] = useState<string | null>(
    searchParams.get("session") ?? null
  );
  const [solveResponse, setSolveResponse] = useState<AirlineSolveResponse | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [activeAuditPlanId, setActiveAuditPlanId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [highlightResults, setHighlightResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const activeScenario = useMemo(
    () =>
      scenarios.find((scenario) => scenario.id === activeScenarioId) ?? FALLBACK_SCENARIOS[0],
    [activeScenarioId, scenarios]
  );

  useEffect(() => {
    trackEvent("demo_viewed", { demo: "airline" });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (backendConnected && crew.length > 0 && scenarios.length > 0) {
      return;
    }
    let cancelled = false;
    async function connectBackend() {
      try {
        const [networkResponse, scenariosResponse] = await Promise.all([
          getAirlineNetwork(),
          getAirlineScenarios(),
        ]);
        if (cancelled) {
          return;
        }
        setCrew(networkResponse.crew);
        setFlights(networkResponse.flights);
        setScenarios(scenariosResponse.scenarios);
        setBackendConnected(true);
        setBackendMessage(null);
      } catch (connectError) {
        if (cancelled) {
          return;
        }
        setBackendMessage(
          connectError instanceof Error
            ? connectError.message
            : "Unable to reach the Qtangl airline API."
        );
      }
    }
    void connectBackend();
    return () => {
      cancelled = true;
    };
  }, [backendConnected, crew.length, scenarios.length]);

  function syncUrl(next: {
    caseId?: string;
    seedValue?: number;
    useFixtureValue?: boolean;
    sessionId?: string | null;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("case", next.caseId ?? activeScenarioId);
    params.set("seed", String(next.seedValue ?? seed));
    params.set("useFixture", String(next.useFixtureValue ?? useFixture));
    const sessionId = next.sessionId ?? crewSessionId;
    if (sessionId) {
      params.set("session", sessionId);
    } else {
      params.delete("session");
    }
    router.replace(`/demo/airline?${params.toString()}`, { scroll: false });
  }

  async function handleRecover() {
    setIsSolving(true);
    setError(null);
    trackEvent("recover_fired", { scenarioId: activeScenarioId, useFixture });
    try {
      const response = await solveAirlineRecovery({
        scenarioId: activeScenarioId,
        useFixture,
        seed,
        crewSessionId: crewSessionId ?? undefined,
      });
      setSolveResponse(response);
      setActiveAuditPlanId(response.hybridPlans[0]?.id ?? response.classicalPlan.id);
      const planCount = 1 + response.hybridPlans.length;
      setToast(
        `Recovery complete — ${planCount} plan${planCount === 1 ? "" : "s"} ready below`
      );
      setHighlightResults(true);
      window.setTimeout(() => setHighlightResults(false), 1400);
      syncUrl({});
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (recoverError) {
      setError(recoverError instanceof Error ? recoverError.message : "Recovery failed.");
    } finally {
      setIsSolving(false);
    }
  }

  function handleOpenAudit(planId: string) {
    setActiveAuditPlanId(planId);
    setAuditOpen(true);
    trackEvent("audit_drawer_opened", { planId });
  }

  async function handleShare() {
    const params = new URLSearchParams();
    params.set("case", activeScenarioId);
    params.set("seed", String(seed));
    params.set("useFixture", String(useFixture));
    if (crewSessionId) {
      params.set("session", crewSessionId);
    }
    const url = `${window.location.origin}/demo/airline?${params.toString()}`;
    await navigator.clipboard.writeText(url);
    setToast("Share link copied to clipboard");
    trackEvent("share_link_copied", { scenarioId: activeScenarioId });
  }

  return (
    <div className="space-y-8 pb-16">
      <VideoEmbed src="/demos/airline/walkthrough.mp4" />
      <DemoGuideStrip />

      {!backendConnected ? (
        <AirlineSection className="border-amber-400/25">
          <AirlineChip tone="alert">API offline</AirlineChip>
          <p className="mt-4 text-sm leading-6 text-[var(--color-gray-300)]">
            Live recovery requires the airline API. Scenario copy is available offline; results
            populate once the backend is reachable.
          </p>
          {backendMessage ? (
            <p className="mt-2 text-xs text-[var(--color-gray-500)]">{backendMessage}</p>
          ) : null}
          <p className="mt-2 font-mono text-xs text-[var(--color-gray-600)]">{apiBaseUrl}</p>
        </AirlineSection>
      ) : (
        <div className="flex justify-end">
          <AirlineChip tone="success">Live API connected</AirlineChip>
        </div>
      )}

      <ScenarioPicker
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onChange={(scenarioId) => {
          setActiveScenarioId(scenarioId);
          setSolveResponse(null);
          syncUrl({ caseId: scenarioId });
          trackEvent("scenario_changed", { scenarioId });
        }}
      />

      <div className="airline-command-bar">
        <AirlineSection tone="feature">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-label">OCC command center</p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                Regional carrier network
              </h2>
              <p className="mt-1 text-sm text-[var(--color-gray-400)]">
                {activeScenario.disruption.station} · {activeScenario.disruption.urgency_minutes}{" "}
                min recovery window
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--color-gray-300)]">
                <input
                  type="checkbox"
                  className="accent-white"
                  checked={useFixture}
                  onChange={(event) => {
                    setUseFixture(event.target.checked);
                    syncUrl({ useFixtureValue: event.target.checked });
                  }}
                />
                Cached QPU trace
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={handleShare}>
                Share
              </Button>
              {isSolving ? <AirlineChip tone="neutral">Recovering…</AirlineChip> : null}
              {!isSolving && solveResponse ? (
                <AirlineChip tone="success">Results ready</AirlineChip>
              ) : null}
              <Button
                type="button"
                onClick={handleRecover}
                disabled={isSolving || !backendConnected}
                aria-busy={isSolving}
              >
                {isSolving ? "Running…" : solveResponse ? "Re-run recover" : "Recover"}
              </Button>
            </div>
          </div>
        </AirlineSection>
      </div>

      <DisruptionEvent scenario={activeScenario} disruption={activeScenario.disruption} />

      {error ? (
        <AirlineSection className="border-red-400/30">
          <AirlineChip tone="alert">Error</AirlineChip>
          <p className="mt-3 text-sm leading-6 text-red-100">{error}</p>
        </AirlineSection>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch">
        <CascadeMap
          flights={flights}
          solveResponse={solveResponse}
          affectedLegIds={activeScenario.disruption.affected_leg_ids}
        />
        <SolveLog items={solveResponse?.timeline ?? []} isSolving={isSolving} />
      </div>

      <div
        ref={resultsRef}
        className={[
          "scroll-mt-28 space-y-8",
          highlightResults ? "airline-results-highlight rounded-[var(--radius-xl)]" : "",
        ].join(" ")}
      >
        {solveResponse ? <SolveInsightBanner response={solveResponse} /> : null}

        <RecoveryPlans
          classicalPlan={solveResponse?.classicalPlan ?? null}
          hybridPlans={solveResponse?.hybridPlans ?? []}
          scoreboard={solveResponse?.scoreboard ?? null}
          onOpenAudit={handleOpenAudit}
        />

        <ScoreboardCard scoreboard={solveResponse?.scoreboard ?? null} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RoiCalculator />
        <CrewUploader
          onUploaded={(sessionId) => {
            setCrewSessionId(sessionId);
            syncUrl({ sessionId });
          }}
        />
      </div>

      <AuditDrawer
        auditPacks={(solveResponse?.auditPacks ?? []) as AuditPack[]}
        candidateId={activeAuditPlanId}
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
      />

      {toast ? (
        <div className="airline-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
