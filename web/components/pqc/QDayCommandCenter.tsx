"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { FALLBACK_SCENARIOS } from "@/lib/pqc-fallback";
import type { CryptoAsset, PqcScanResponse, Scenario } from "@/lib/pqc";
import {
  getPqcInventory,
  getPqcScenarios,
  pqcReportDownloadUrl,
  scanPqc,
  waitForPqcScan,
} from "@/lib/pqc";

import BundleUploader from "./BundleUploader";
import DemoGuideStrip from "./DemoGuideStrip";
import HandshakeProofPanel from "./HandshakeProofPanel";
import InventoryHeatmap from "./InventoryHeatmap";
import MigrationGantt from "./MigrationGantt";
import MoscaTimeline from "./MoscaTimeline";
import ReadinessGauge from "./ReadinessGauge";
import RemediationBacklog from "./RemediationBacklog";
import ReportDrawer from "./ReportDrawer";
import RiskScoreboardCard from "./RiskScoreboardCard";
import RoiCalculator from "./RoiCalculator";
import ScanCoverage from "./ScanCoverage";
import ScanLog from "./ScanLog";
import ScanTargetCard from "./ScanTargetCard";
import ScenarioPicker from "./ScenarioPicker";
import SeverityDonut from "./SeverityDonut";
import VideoEmbed from "./VideoEmbed";
import VulnerabilityCard from "./VulnerabilityCard";
import { PqcSection } from "./ui";

type Props = {
  initialInventory: CryptoAsset[];
  initialScenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
};

export default function QDayCommandCenter({
  initialInventory,
  initialScenarios,
  backendConnected: initialBackendConnected,
  backendMessage: initialBackendMessage,
  apiBaseUrl,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inventory, setInventory] = useState(initialInventory);
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [backendConnected, setBackendConnected] = useState(initialBackendConnected);
  const [backendMessage, setBackendMessage] = useState(initialBackendMessage);
  const [activeScenarioId, setActiveScenarioId] = useState(
    searchParams.get("case") ?? scenarios[0]?.id ?? FALLBACK_SCENARIOS[0].id
  );
  const [useFixture, setUseFixture] = useState(searchParams.get("useFixture") !== "false");
  const [authorized, setAuthorized] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [bundleSessionId, setBundleSessionId] = useState<string | null>(
    searchParams.get("session") ?? null
  );
  const [scanResponse, setScanResponse] = useState<PqcScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === activeScenarioId) ?? FALLBACK_SCENARIOS[0],
    [activeScenarioId, scenarios]
  );

  const bootstrapAttempted = useRef(false);

  useEffect(() => {
    trackEvent("demo_viewed", { demo: "pqc" });
  }, []);

  useEffect(() => {
    if (bootstrapAttempted.current) {
      return;
    }
    if (initialBackendConnected && initialInventory.length > 0) {
      bootstrapAttempted.current = true;
      return;
    }
    bootstrapAttempted.current = true;
    let cancelled = false;
    async function connect() {
      try {
        const [inv, sc] = await Promise.all([getPqcInventory(), getPqcScenarios()]);
        if (cancelled) return;
        setInventory(inv.inventory);
        setScenarios(sc.scenarios);
        setBackendConnected(true);
        setBackendMessage(null);
      } catch (err) {
        if (cancelled) return;
        setBackendMessage(err instanceof Error ? err.message : "Unable to reach Qtangl PQC API.");
      }
    }
    connect();
    return () => {
      cancelled = true;
    };
  }, [initialBackendConnected, initialInventory.length]);

  function syncUrl() {
    const params = new URLSearchParams();
    params.set("case", activeScenarioId);
    params.set("useFixture", String(useFixture));
    if (bundleSessionId) params.set("session", bundleSessionId);
    router.replace(`/demo/pqc?${params.toString()}`, { scroll: false });
  }

  async function handleScan() {
    if (!useFixture && !authorized) {
      setError("Confirm you are authorized to scan this domain before live mode.");
      return;
    }
    setIsScanning(true);
    setError(null);
    setScanProgress(null);
    trackEvent("pqc_scan_started", { scenarioId: activeScenarioId, useFixture });
    try {
      const result = await scanPqc({
        scenarioId: activeScenarioId,
        useFixture,
        target: customDomain || undefined,
        bundleSessionId: bundleSessionId ?? undefined,
      });
      let completed: PqcScanResponse;
      if (result.status === "running") {
        setScanProgress("Starting live scan…");
        completed = await waitForPqcScan(result.scanId, (timeline) => {
          if (!timeline?.length) return;
          const latest = timeline[timeline.length - 1];
          if (latest?.label) {
            setScanProgress(latest.label);
          }
        });
        setScanResponse(completed);
      } else {
        completed = result;
        setScanResponse(result);
      }
      trackEvent("pqc_scan_completed", { scenarioId: activeScenarioId });
      trackEvent("pqc_handshake_proved", { mode: completed.handshakeProof.mode });
      syncUrl();
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  }

  const topAsset = scanResponse?.assets[0];

  return (
    <div className="space-y-6">
      <DemoGuideStrip />
      {!backendConnected && backendMessage && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          Offline fallback: {backendMessage}
        </p>
      )}
      <PqcSection title="Scenario">
        <ScenarioPicker
          scenarios={scenarios}
          activeId={activeScenarioId}
          onSelect={(id) => {
            setActiveScenarioId(id);
            setCustomDomain("");
          }}
        />
      </PqcSection>
      <PqcSection title="Scan target">
        <ScanTargetCard
          target={activeScenario.target}
          authorized={authorized}
          onAuthorizedChange={setAuthorized}
          customDomain={customDomain}
          onCustomDomainChange={setCustomDomain}
        />
      </PqcSection>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
          <input
            type="checkbox"
            checked={useFixture}
            onChange={(e) => {
              const fixture = e.target.checked;
              setUseFixture(fixture);
              if (fixture) {
                setAuthorized(false);
              }
            }}
          />
          Fixture mode (recommended — no outbound network)
        </label>
        {!useFixture && (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-100">
            Live scan enabled
          </span>
        )}
        <BundleUploader
          onUploaded={(sessionId, summary) => {
            setBundleSessionId(sessionId);
            setError(null);
            trackEvent("pqc_bundle_uploaded", { sessionId });
          }}
        />
        <Button onClick={handleScan} disabled={isScanning || (!useFixture && !authorized)}>
          {isScanning ? (scanProgress ?? "Scanning…") : "Run Q-Day scan"}
        </Button>
        {scanResponse && (
          <Button variant="secondary" onClick={() => setReportOpen(true)}>
            Migration report
          </Button>
        )}
      </div>
      {!useFixture && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
          Live scan connects to real TLS, SSH, and email endpoints on the target you specify.
          Production requires <code className="font-mono">QTANGL_PQC_ENABLE_LIVE_SCAN=true</code> on
          the backend plus your authorization checkbox above.
        </p>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
      <p className="text-[10px] text-[var(--color-gray-600)]">API: {apiBaseUrl}</p>

      {scanResponse && (
        <div ref={resultsRef} className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">Executive report pack</p>
              <p className="text-xs text-[var(--color-gray-400)]">
                {scanResponse.readinessBand ?? scanResponse.scoreboard.qtangl.readiness_band ?? "Q-Day readiness"}{" "}
                · scan {scanResponse.scanId}
              </p>
            </div>
            <a
              href={pqcReportDownloadUrl(scanResponse.scanId, "pdf")}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackEvent("pqc_report_downloaded", { format: "pdf", scanId: scanResponse.scanId })
              }
              className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black hover:bg-neutral-100"
            >
              Download PDF report
            </a>
            {(["cbom", "json", "csv"] as const).map((format) => (
              <a
                key={format}
                href={pqcReportDownloadUrl(scanResponse.scanId, format)}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackEvent("pqc_report_downloaded", { format, scanId: scanResponse.scanId })
                }
                className="text-xs uppercase tracking-wide text-[var(--color-gray-300)] underline underline-offset-4 hover:text-white"
              >
                {format}
              </a>
            ))}
            <Button variant="secondary" onClick={() => setReportOpen(true)}>
              All formats
            </Button>
          </div>
          <PqcSection title="Risk scoreboard">
            <RiskScoreboardCard scoreboard={scanResponse.scoreboard} />
          </PqcSection>
          <div className="grid gap-4 lg:grid-cols-3">
            <PqcSection title="Readiness">
              <ReadinessGauge score={scanResponse.scoreboard.qtangl.readiness_score} />
              {(scanResponse.readinessBand ?? scanResponse.scoreboard.qtangl.readiness_band) && (
                <p className="mt-2 text-center text-xs text-[var(--color-gray-400)]">
                  {scanResponse.readinessBand ?? scanResponse.scoreboard.qtangl.readiness_band}
                </p>
              )}
            </PqcSection>
            <PqcSection title="Mosca timeline">
              <MoscaTimeline mosca={scanResponse.mosca} />
            </PqcSection>
            <PqcSection title="Severity mix">
              <SeverityDonut assets={scanResponse.assets} />
            </PqcSection>
          </div>
          <PqcSection title="Scan log">
            <ScanLog events={scanResponse.timeline} isRunning={isScanning} />
          </PqcSection>
          <PqcSection title="Crypto inventory">
            <InventoryHeatmap assets={scanResponse.assets} />
          </PqcSection>
          {scanResponse.scanCoverage && scanResponse.scanCoverage.length > 0 && (
            <PqcSection title="Scan coverage (unreachable / errored)">
              <ScanCoverage entries={scanResponse.scanCoverage} />
            </PqcSection>
          )}
          {topAsset && (
            <PqcSection title="Top vulnerability">
              <VulnerabilityCard asset={topAsset} />
            </PqcSection>
          )}
          <PqcSection title="Remediation backlog">
            <RemediationBacklog items={scanResponse.remediationBacklog} />
          </PqcSection>
          <PqcSection title="Migration roadmap">
            <MigrationGantt />
          </PqcSection>
          <PqcSection title="Post-quantum handshake proof">
            <HandshakeProofPanel proof={scanResponse.handshakeProof} />
          </PqcSection>
          <RoiCalculator quantumVulnerable={scanResponse.scoreboard.qtangl.quantum_vulnerable} />
        </div>
      )}

      {!scanResponse && inventory.length > 0 && (
        <PqcSection title="Fixture inventory preview">
          <InventoryHeatmap assets={inventory.slice(0, 4)} />
        </PqcSection>
      )}

      <VideoEmbed />
      <ReportDrawer open={reportOpen} onClose={() => setReportOpen(false)} scan={scanResponse} />
    </div>
  );
}
