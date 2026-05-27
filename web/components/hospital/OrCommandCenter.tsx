"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import type {
  AuditPack,
  HospitalRosterNurse,
  HospitalSolveResponse,
  Scenario,
} from "@/lib/hospital";
import {
  getHospitalRoster,
  getHospitalScenarios,
  solveHospitalCallout,
} from "@/lib/hospital";
import { FALLBACK_SCENARIOS } from "@/lib/hospital-fallback";

import AuditDrawer from "./AuditDrawer";
import CallOutEvent from "./CallOutEvent";
import DemoGuideStrip from "./DemoGuideStrip";
import CandidatePlans from "./CandidatePlans";
import RoiCalculator from "./RoiCalculator";
import RosterHeatmap from "./RosterHeatmap";
import RosterUploader from "./RosterUploader";
import ScenarioPicker from "./ScenarioPicker";
import ScoreboardCard from "./ScoreboardCard";
import SolveInsightBanner from "./SolveInsightBanner";
import SolveLog from "./SolveLog";
import VideoEmbed from "./VideoEmbed";
import { HospitalChip, HospitalSection } from "./ui";

type OrCommandCenterProps = {
  initialRoster: HospitalRosterNurse[];
  initialScenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
};

export default function OrCommandCenter({
  initialRoster,
  initialScenarios,
  backendConnected: initialBackendConnected,
  backendMessage: initialBackendMessage,
  apiBaseUrl,
}: OrCommandCenterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [scenarios, setScenarios] = useState(initialScenarios);
  const [roster, setRoster] = useState(initialRoster);
  const [backendConnected, setBackendConnected] = useState(initialBackendConnected);
  const [backendMessage, setBackendMessage] = useState(initialBackendMessage);

  const [activeScenarioId, setActiveScenarioId] = useState(
    searchParams.get("case") ?? scenarios[0]?.id ?? FALLBACK_SCENARIOS[0].id
  );
  const [seed] = useState(Number(searchParams.get("seed") ?? "1234"));
  const [useFixture, setUseFixture] = useState(searchParams.get("useFixture") !== "false");
  const [rosterSessionId, setRosterSessionId] = useState<string | null>(
    searchParams.get("session") ?? null
  );
  const [solveResponse, setSolveResponse] = useState<HospitalSolveResponse | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [activeAuditCandidateId, setActiveAuditCandidateId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeScenario = useMemo(
    () =>
      scenarios.find((scenario) => scenario.id === activeScenarioId) ??
      FALLBACK_SCENARIOS[0],
    [activeScenarioId, scenarios]
  );

  useEffect(() => {
    trackEvent("demo_viewed", { demo: "hospital" });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (backendConnected && roster.length > 0 && scenarios.length > 0) {
      return;
    }

    let cancelled = false;

    async function connectBackend() {
      try {
        const [rosterResponse, scenariosResponse] = await Promise.all([
          getHospitalRoster(),
          getHospitalScenarios(),
        ]);
        if (cancelled) {
          return;
        }
        setRoster(rosterResponse.roster);
        setScenarios(scenariosResponse.scenarios);
        setBackendConnected(true);
        setBackendMessage(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setBackendMessage(
          error instanceof Error ? error.message : "Unable to reach the Qtangl hospital API."
        );
      }
    }

    void connectBackend();

    return () => {
      cancelled = true;
    };
  }, [backendConnected, roster.length, scenarios.length]);

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
    const sessionId = next.sessionId ?? rosterSessionId;
    if (sessionId) {
      params.set("session", sessionId);
    } else {
      params.delete("session");
    }
    router.replace(`/demo/hospital?${params.toString()}`, { scroll: false });
  }

  async function handleSolve() {
    setIsSolving(true);
    setError(null);
    trackEvent("callout_fired", { scenarioId: activeScenarioId, useFixture });
    try {
      const response = await solveHospitalCallout({
        scenarioId: activeScenarioId,
        useFixture,
        seed,
        rosterSessionId: rosterSessionId ?? undefined,
      });
      setSolveResponse(response);
      setActiveAuditCandidateId(
        response.hybridCandidates[0]?.id ?? response.classicalCandidate.id
      );
      syncUrl({});
    } catch (solveError) {
      setError(solveError instanceof Error ? solveError.message : "Solve failed.");
    } finally {
      setIsSolving(false);
    }
  }

  function handleOpenAudit(candidateId: string) {
    setActiveAuditCandidateId(candidateId);
    setAuditOpen(true);
    trackEvent("audit_drawer_opened", { candidateId });
  }

  async function handleShare() {
    const params = new URLSearchParams();
    params.set("case", activeScenarioId);
    params.set("seed", String(seed));
    params.set("useFixture", String(useFixture));
    if (rosterSessionId) {
      params.set("session", rosterSessionId);
    }
    const url = `${window.location.origin}/demo/hospital?${params.toString()}`;
    await navigator.clipboard.writeText(url);
    setToast("Share link copied to clipboard");
    trackEvent("share_link_copied", { scenarioId: activeScenarioId });
  }

  const highlightedNurseIds = useMemo(() => {
    const ids = [activeScenario.callout.nurse_id];
    if (solveResponse?.classicalCandidate) {
      ids.push(solveResponse.classicalCandidate.nurse_id);
    }
    for (const candidate of solveResponse?.hybridCandidates ?? []) {
      ids.push(candidate.nurse_id);
    }
    return ids;
  }, [activeScenario.callout.nurse_id, solveResponse]);

  return (
    <div className="space-y-8 pb-16">
      <VideoEmbed src="/demos/hospital/walkthrough.mp4" />
      <DemoGuideStrip />

      {!backendConnected ? (
        <HospitalSection className="border-amber-400/25">
          <HospitalChip tone="alert">API offline</HospitalChip>
          <p className="mt-4 text-sm leading-6 text-[var(--color-gray-300)]">
            Live solve requires the hospital API. Scenario copy is available offline; results
            will populate once the backend is reachable.
          </p>
          {backendMessage ? (
            <p className="mt-2 text-xs text-[var(--color-gray-500)]">{backendMessage}</p>
          ) : null}
          <p className="mt-2 font-mono text-xs text-[var(--color-gray-600)]">{apiBaseUrl}</p>
        </HospitalSection>
      ) : (
        <div className="flex justify-end">
          <HospitalChip tone="success">Live API connected</HospitalChip>
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

      <div className="hospital-command-bar">
        <HospitalSection tone="feature">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-label">Command center</p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                Regional Medical Center
              </h2>
              <p className="mt-1 text-sm text-[var(--color-gray-400)]">
                420 beds · {activeScenario.callout.urgency_minutes} min decision window
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
              <Button
                type="button"
                onClick={handleSolve}
                disabled={isSolving || !backendConnected}
                aria-busy={isSolving}
              >
                {isSolving ? "Running…" : "Run solve"}
              </Button>
            </div>
          </div>
        </HospitalSection>
      </div>

      <CallOutEvent scenario={activeScenario} callout={activeScenario.callout} />

      {error ? (
        <HospitalSection className="border-red-400/30">
          <HospitalChip tone="alert">Error</HospitalChip>
          <p className="mt-3 text-sm leading-6 text-red-100">{error}</p>
        </HospitalSection>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch">
        <RosterHeatmap
          roster={roster}
          highlightedNurseIds={highlightedNurseIds}
          calloutNurseId={activeScenario.callout.nurse_id}
        />
        <SolveLog items={solveResponse?.timeline ?? []} isSolving={isSolving} />
      </div>

      {solveResponse ? <SolveInsightBanner response={solveResponse} /> : null}

      <CandidatePlans
        classicalCandidate={solveResponse?.classicalCandidate ?? null}
        hybridCandidates={solveResponse?.hybridCandidates ?? []}
        scoreboard={solveResponse?.scoreboard ?? null}
        onOpenAudit={handleOpenAudit}
      />

      <ScoreboardCard scoreboard={solveResponse?.scoreboard ?? null} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RoiCalculator />
        <RosterUploader
          onUploaded={(sessionId) => {
            setRosterSessionId(sessionId);
            syncUrl({ sessionId });
          }}
        />
      </div>

      <AuditDrawer
        auditPacks={(solveResponse?.auditPacks ?? []) as AuditPack[]}
        candidateId={activeAuditCandidateId}
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
      />

      {toast ? <div className="hospital-toast" role="status">{toast}</div> : null}
    </div>
  );
}
