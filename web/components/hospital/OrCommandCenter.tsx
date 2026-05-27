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
import { solveHospitalCallout } from "@/lib/hospital";

import AuditDrawer from "./AuditDrawer";
import CallOutEvent from "./CallOutEvent";
import CandidatePlans from "./CandidatePlans";
import RoiCalculator from "./RoiCalculator";
import RosterHeatmap from "./RosterHeatmap";
import RosterUploader from "./RosterUploader";
import ScenarioPicker from "./ScenarioPicker";
import ScoreboardCard from "./ScoreboardCard";
import SolveLog from "./SolveLog";
import VideoEmbed from "./VideoEmbed";

type OrCommandCenterProps = {
  initialRoster: HospitalRosterNurse[];
  initialScenarios: Scenario[];
};

export default function OrCommandCenter({
  initialRoster,
  initialScenarios,
}: OrCommandCenterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeScenarioId, setActiveScenarioId] = useState(
    searchParams.get("case") ?? initialScenarios[0]?.id ?? "callout-cath-acls"
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
      initialScenarios.find((scenario) => scenario.id === activeScenarioId) ?? initialScenarios[0],
    [activeScenarioId, initialScenarios]
  );

  useEffect(() => {
    trackEvent("demo_viewed", { demo: "hospital" });
  }, []);

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

      <ScenarioPicker
        scenarios={initialScenarios}
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
          roster={initialRoster}
          highlightedNurseIds={highlightedNurseIds}
          calloutNurseId={activeScenario.callout.nurse_id}
        />
        <SolveLog items={solveResponse?.timeline ?? []} isSolving={isSolving} />
      </div>

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
