"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import type {
  AuditPack,
  EvFleetCharger,
  EvFleetSolveResponse,
  EvFleetStop,
  EvFleetVehicle,
  Scenario,
} from "@/lib/ev-fleet";
import { getEvFleetDepot, getEvFleetScenarios, solveEvFleetPlan } from "@/lib/ev-fleet";
import { FALLBACK_SCENARIOS } from "@/lib/ev-fleet-fallback";

import AuditDrawer from "./AuditDrawer";
import ChargePlans from "./ChargePlans";
import ChargerGantt from "./ChargerGantt";
import ChargingWindowEvent from "./ChargingWindowEvent";
import DemoGuideStrip from "./DemoGuideStrip";
import DemandCurve from "./DemandCurve";
import FleetUploader from "./FleetUploader";
import RoiCalculator from "./RoiCalculator";
import RouteMap from "./RouteMap";
import ScenarioPicker from "./ScenarioPicker";
import ScoreboardCard from "./ScoreboardCard";
import SolveInsightBanner from "./SolveInsightBanner";
import SolveLog from "./SolveLog";
import StopsUploader from "./StopsUploader";
import TouTariffStrip from "./TouTariffStrip";
import VideoEmbed from "./VideoEmbed";
import { EvFleetChip, EvFleetSection } from "./ui";

type DepotCommandCenterProps = {
  initialVehicles: EvFleetVehicle[];
  initialStops: EvFleetStop[];
  initialChargers: EvFleetCharger[];
  initialScenarios: Scenario[];
  sitePowerCapKw: number;
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
};

export default function DepotCommandCenter({
  initialVehicles,
  initialStops,
  initialChargers,
  initialScenarios,
  sitePowerCapKw,
  backendConnected: initialBackendConnected,
  backendMessage: initialBackendMessage,
  apiBaseUrl,
}: DepotCommandCenterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [scenarios, setScenarios] = useState(initialScenarios);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [stops, setStops] = useState(initialStops);
  const [chargers] = useState(initialChargers);
  const [backendConnected, setBackendConnected] = useState(initialBackendConnected);
  const [backendMessage, setBackendMessage] = useState(initialBackendMessage);

  const [activeScenarioId, setActiveScenarioId] = useState(
    searchParams.get("case") ?? scenarios[0]?.id ?? FALLBACK_SCENARIOS[0].id
  );
  const [seed] = useState(Number(searchParams.get("seed") ?? "1234"));
  const [useFixture, setUseFixture] = useState(searchParams.get("useFixture") !== "false");
  const [fleetSessionId, setFleetSessionId] = useState<string | null>(
    searchParams.get("fleet") ?? null
  );
  const [stopsSessionId, setStopsSessionId] = useState<string | null>(
    searchParams.get("stops") ?? null
  );
  const [solveResponse, setSolveResponse] = useState<EvFleetSolveResponse | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [activeAuditPlanId, setActiveAuditPlanId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === activeScenarioId) ?? FALLBACK_SCENARIOS[0],
    [activeScenarioId, scenarios]
  );

  const displayPlan =
    solveResponse?.hybridPlans[0] ?? solveResponse?.classicalPlan ?? null;

  useEffect(() => {
    trackEvent("demo_viewed", { demo: "ev-fleet" });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (backendConnected && vehicles.length > 0) return;
    let cancelled = false;
    async function connect() {
      try {
        const [depot, scenarioList] = await Promise.all([
          getEvFleetDepot(),
          getEvFleetScenarios(),
        ]);
        if (cancelled) return;
        setVehicles(depot.vehicles);
        setStops(depot.stops);
        setScenarios(scenarioList.scenarios);
        setBackendConnected(true);
        setBackendMessage(null);
      } catch (err) {
        if (!cancelled) {
          setBackendMessage(err instanceof Error ? err.message : "API unreachable.");
        }
      }
    }
    void connect();
    return () => {
      cancelled = true;
    };
  }, [backendConnected, vehicles.length]);

  function syncUrl(next: Partial<{
    caseId: string;
    useFixtureValue: boolean;
    fleet: string | null;
    stops: string | null;
  }>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("case", next.caseId ?? activeScenarioId);
    params.set("seed", String(seed));
    params.set("useFixture", String(next.useFixtureValue ?? useFixture));
    const fleet = next.fleet ?? fleetSessionId;
    const stopsId = next.stops ?? stopsSessionId;
    if (fleet) params.set("fleet", fleet);
    else params.delete("fleet");
    if (stopsId) params.set("stops", stopsId);
    else params.delete("stops");
    router.replace(`/demo/ev-fleet?${params.toString()}`, { scroll: false });
  }

  async function handleSolve() {
    setIsSolving(true);
    setError(null);
    trackEvent("ev_fleet_solve_started", { scenarioId: activeScenarioId, useFixture });
    try {
      const response = await solveEvFleetPlan({
        scenarioId: activeScenarioId,
        useFixture,
        seed,
        fleetSessionId: fleetSessionId ?? undefined,
        stopsSessionId: stopsSessionId ?? undefined,
      });
      setSolveResponse(response);
      setActiveAuditPlanId(response.hybridPlans[0]?.id ?? response.classicalPlan.id);
      setToast("Plan complete — routes and charge schedules below");
      trackEvent("ev_fleet_solve_succeeded", { scenarioId: activeScenarioId });
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Solve failed.");
    } finally {
      setIsSolving(false);
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <VideoEmbed src="/demos/ev-fleet/walkthrough.mp4" />
      <DemoGuideStrip />
      <TouTariffStrip />

      {!backendConnected ? (
        <EvFleetSection className="border-amber-400/25">
          <EvFleetChip tone="alert">API offline</EvFleetChip>
          <p className="mt-4 text-sm text-[var(--color-gray-300)]">
            Live solve requires the EV fleet API. Scenarios work offline; results need the backend.
          </p>
          {backendMessage ? <p className="mt-2 text-xs text-[var(--color-gray-500)]">{backendMessage}</p> : null}
          <p className="mt-2 font-mono text-xs text-[var(--color-gray-600)]">{apiBaseUrl}</p>
        </EvFleetSection>
      ) : (
        <div className="flex justify-end">
          <EvFleetChip tone="success">Live API connected</EvFleetChip>
        </div>
      )}

      <ScenarioPicker
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onChange={(id) => {
          setActiveScenarioId(id);
          setSolveResponse(null);
          syncUrl({ caseId: id });
        }}
      />

      <EvFleetSection tone="feature">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-label">Depot command center</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Oakland last-mile depot</h2>
            <p className="mt-1 text-sm text-[var(--color-gray-400)]">
              {chargers.length} L2 chargers · {vehicles.length || activeScenario.window.fleet_size} vans
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-[var(--color-gray-300)]">
              <input
                type="checkbox"
                checked={useFixture}
                onChange={(e) => {
                  setUseFixture(e.target.checked);
                  syncUrl({ useFixtureValue: e.target.checked });
                }}
              />
              Cached QPU trace
            </label>
            <Button type="button" onClick={handleSolve} disabled={isSolving || !backendConnected}>
              {isSolving ? "Solving…" : "Plan routes + charge"}
            </Button>
          </div>
        </div>
      </EvFleetSection>

      <ChargingWindowEvent scenario={activeScenario} />
      {error ? (
        <EvFleetSection className="border-red-400/30">
          <p className="text-sm text-red-100">{error}</p>
        </EvFleetSection>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <RouteMap stops={stops} solveResponse={solveResponse} />
        <SolveLog items={solveResponse?.timeline ?? []} isSolving={isSolving} />
      </div>

      <div ref={resultsRef} className="scroll-mt-28 space-y-8">
        {solveResponse ? <SolveInsightBanner response={solveResponse} /> : null}
        <ChargePlans
          classicalPlan={solveResponse?.classicalPlan ?? null}
          hybridPlans={solveResponse?.hybridPlans ?? []}
          scoreboard={solveResponse?.scoreboard ?? null}
          onOpenAudit={(id) => {
            setActiveAuditPlanId(id);
            setAuditOpen(true);
          }}
        />
        <ScoreboardCard scoreboard={solveResponse?.scoreboard ?? null} />
        <ChargerGantt plan={displayPlan} />
        <DemandCurve plan={displayPlan} siteCapKw={sitePowerCapKw} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RoiCalculator />
        <div className="space-y-6">
          <FleetUploader
            onUploaded={(id) => {
              setFleetSessionId(id);
              syncUrl({ fleet: id });
            }}
          />
          <StopsUploader
            onUploaded={(id) => {
              setStopsSessionId(id);
              syncUrl({ stops: id });
            }}
          />
        </div>
      </div>

      <AuditDrawer
        auditPacks={(solveResponse?.auditPacks ?? []) as AuditPack[]}
        candidateId={activeAuditPlanId}
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
      />

      {toast ? (
        <div className="ev-fleet-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
