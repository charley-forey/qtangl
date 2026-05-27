"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
  }, [backendConnected]);

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
      setActiveAuditCandidateId(response.hybridCandidates[0]?.id ?? response.classicalCandidate.id);
      syncUrl({});
    } catch (solveError) {
      setError(solveError instanceof Error ? solveError.message : "Call-out solve failed.");
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
    <div className="space-y-6">
      <VideoEmbed src="/demos/hospital/walkthrough.mp4" />

      <DemoGuideStrip />

      {!backendConnected ? (
        <Card tone="strong" className="rounded-[var(--radius-xl)] border-amber-300/30">
          <p className="text-label text-amber-100">Backend not connected</p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-gray-200)]">
            The page loaded, but the hospital API is not available yet. This usually means the Railway
            backend has not deployed the latest code from <code>main</code>, or the API key does not
            match.
          </p>
          <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">
            API base URL: <code className="text-white">{apiBaseUrl}</code>
          </p>
          {backendMessage ? (
            <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">
              Detail: {backendMessage}
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
            After Railway redeploys with the hospital routes, reload this page. Scenario copy below is
            offline until then. &quot;Fire the call-out&quot; will fail until the backend is live.
          </p>
        </Card>
      ) : null}

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

      <Card tone="feature" className="rounded-[var(--radius-feature)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-label">Regional Medical Center, 420 beds</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">OR command center</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
              It is Tue 04:11. Marcus has 49 minutes to cover the open shift without breaking acuity,
              rest, or seniority rules.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--color-gray-300)]">
              <input
                type="checkbox"
                checked={useFixture}
                onChange={(event) => {
                  setUseFixture(event.target.checked);
                  syncUrl({ useFixtureValue: event.target.checked });
                }}
              />
              Replay cached QPU trace
            </label>
            <Button type="button" variant="secondary" onClick={handleShare}>
              Copy share link
            </Button>
            <Button type="button" onClick={handleSolve} disabled={isSolving}>
              {isSolving ? "Solving..." : "Fire the call-out"}
            </Button>
          </div>
        </div>
      </Card>

      <CallOutEvent scenario={activeScenario} callout={activeScenario.callout} />

      {error ? (
        <Card tone="strong" className="rounded-[var(--radius-xl)] border-red-300/30">
          <p className="text-sm leading-7 text-red-100">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
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
        onOpenAudit={handleOpenAudit}
      />

      <ScoreboardCard scoreboard={solveResponse?.scoreboard ?? null} />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
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
    </div>
  );
}
