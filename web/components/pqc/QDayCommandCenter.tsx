"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { FALLBACK_SCENARIOS } from "@/lib/pqc-fallback";
import type { CryptoAsset, PqcScanResponse, ReportAvailabilityResponse, Scenario } from "@/lib/pqc";
import {
  getReportAvailability,
  getPqcInventory,
  getPqcScenarios,
  pqcReportDownloadUrl,
  scanPqc,
  waitForPqcScan,
} from "@/lib/pqc";

import BundleUploader from "./BundleUploader";
import CompliancePanel from "./CompliancePanel";
import DemoGuideStrip from "./DemoGuideStrip";
import HandshakeProofPanel from "./HandshakeProofPanel";
import InventoryHeatmap from "./InventoryHeatmap";
import MigrationGantt from "./MigrationGantt";
import MoscaTimeline from "./MoscaTimeline";
import ReadinessGauge from "./ReadinessGauge";
import RemediationBacklog from "./RemediationBacklog";
import ReportDrawer from "./ReportDrawer";
import RiskQuadrant from "./RiskQuadrant";
import RiskScoreboardCard from "./RiskScoreboardCard";
import RoiCalculator from "./RoiCalculator";
import ExecutivePriorities from "./ExecutivePriorities";
import ReadinessTrend from "./ReadinessTrend";
import ReferencesPanel from "./ReferencesPanel";
import ScanResultsGuide from "./ScanResultsGuide";
import ScanCoverage from "./ScanCoverage";
import ScanLog from "./ScanLog";
import ScanTargetCard from "./ScanTargetCard";
import ScenarioPicker from "./ScenarioPicker";
import SeverityDonut from "./SeverityDonut";
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
  const defaultScenarioId = scenarios[0]?.id ?? FALLBACK_SCENARIOS[0].id;
  const [activeScenarioId, setActiveScenarioId] = useState(defaultScenarioId);
  const [useFixture, setUseFixture] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [bundleSessionId, setBundleSessionId] = useState<string | null>(null);
  const [scanResponse, setScanResponse] = useState<PqcScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [useLiteScan, setUseLiteScan] = useState(false);
  const [reportAvailability, setReportAvailability] = useState<ReportAvailabilityResponse | null>(null);
  const [reportStatus, setReportStatus] = useState<"ready" | "checking" | "unavailable">("checking");
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
    const caseParam = searchParams.get("case");
    if (caseParam) {
      setActiveScenarioId(caseParam);
    }
    setUseFixture(searchParams.get("useFixture") !== "false");
    const session = searchParams.get("session");
    setBundleSessionId(session);
  }, [searchParams]);

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

  useEffect(() => {
    let cancelled = false;
    async function checkReportAvailability() {
      if (!scanResponse?.scanId) {
        setReportAvailability(null);
        setReportStatus("checking");
        return;
      }
      setReportStatus("checking");
      try {
        const availability = await getReportAvailability(scanResponse.scanId);
        if (cancelled) return;
        setReportAvailability(availability);
        setReportStatus(availability.reportAvailable ? "ready" : "unavailable");
      } catch {
        if (cancelled) return;
        setReportAvailability(null);
        setReportStatus("unavailable");
      }
    }
    checkReportAvailability();
    return () => {
      cancelled = true;
    };
  }, [scanResponse?.scanId]);

  function syncUrl() {
    const params = new URLSearchParams();
    params.set("case", activeScenarioId);
    params.set("useFixture", String(useFixture));
    if (bundleSessionId) params.set("session", bundleSessionId);
    router.replace(`/assess?${params.toString()}`, { scroll: false });
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
        depth: useLiteScan ? "lite" : "standard",
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
  const qualityIssues: string[] = [];
  if (scanResponse?.assets.length === 0) qualityIssues.push("No assets discovered.");
  if ((scanResponse?.timeline?.length ?? 0) === 0) qualityIssues.push("No timeline events captured.");
  if ((scanResponse?.remediationBacklog?.length ?? 0) === 0)
    qualityIssues.push("No remediation items generated.");
  if (scanResponse && reportStatus === "unavailable")
    qualityIssues.push("Report bundle is unavailable for this scan context.");

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
      <div className="pqc-print-hide flex flex-wrap items-center gap-3">
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
        <label className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
          <input
            type="checkbox"
            checked={useLiteScan}
            onChange={(e) => setUseLiteScan(e.target.checked)}
          />
          Lite scan (subset of findings — upsell preview)
        </label>
        <BundleUploader
          onUploaded={(sessionId) => {
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
        <div ref={resultsRef} className="pqc-print-area space-y-6">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">Executive report pack</p>
              <p className="text-xs text-[var(--color-gray-400)]">
                {scanResponse.readinessBand ?? scanResponse.scoreboard.qtangl.readiness_band ?? "Q-Day readiness"}{" "}
                · scan {scanResponse.scanId}
              </p>
            </div>
            <a
              href={reportStatus === "ready" ? pqcReportDownloadUrl(scanResponse.scanId, "pdf") : "#"}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                if (reportStatus !== "ready") {
                  event.preventDefault();
                  setError(
                    `Report unavailable${reportAvailability?.missingReason ? ` (${reportAvailability.missingReason})` : ""}.`
                  );
                  return;
                }
                trackEvent("pqc_report_downloaded", { format: "pdf", scanId: scanResponse.scanId });
              }}
              className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black hover:bg-neutral-100"
            >
              Download PDF report
            </a>
            {(["cbom", "json", "csv", "bundle", "executive", "board", "auditor"] as const).map((format) => (
              <a
                key={format}
                href={reportStatus === "ready" ? pqcReportDownloadUrl(scanResponse.scanId, format) : "#"}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => {
                  if (reportStatus !== "ready") {
                    event.preventDefault();
                    setError(
                      `Format unavailable${reportAvailability?.missingReason ? ` (${reportAvailability.missingReason})` : ""}.`
                    );
                    return;
                  }
                  trackEvent("pqc_report_downloaded", { format, scanId: scanResponse.scanId });
                }}
                className="text-xs uppercase tracking-wide text-[var(--color-gray-300)] underline underline-offset-4 hover:text-white"
              >
                {format}
              </a>
            ))}
            <a
              href={`/verify?scanId=${encodeURIComponent(scanResponse.scanId)}`}
              className="text-xs uppercase tracking-wide text-[var(--color-gray-300)] underline underline-offset-4 hover:text-white"
            >
              verify
            </a>
            <Button variant="secondary" onClick={() => setReportOpen(true)}>
              All formats
            </Button>
            <span className="text-[10px] text-[var(--color-gray-500)]">
              {reportStatus === "checking"
                ? "report: checking"
                : reportStatus === "ready"
                  ? "report: ready"
                  : `report: unavailable${reportAvailability?.missingReason ? ` (${reportAvailability.missingReason})` : ""}`}
            </span>
          </div>
          <PqcSection title="Data quality">
            <p className="text-xs text-[var(--color-gray-400)]">
              Coverage confidence: {String(scanResponse.report?.coverageConfidence ?? "n/a")} · Scan depth:{" "}
              {String(scanResponse.report?.scanDepth ?? (useLiteScan ? "lite" : "standard"))}
            </p>
            <p className="mt-1 text-xs text-[var(--color-gray-500)]">
              Outcome: {scanResponse.scanOutcome ?? "unknown"} · Generated at{" "}
              {String(scanResponse.report?.generatedAt ?? "n/a")}
            </p>
            {qualityIssues.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-amber-200">
                {qualityIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-emerald-300">Quality checks passed for this scan result.</p>
            )}
          </PqcSection>
          <ScanResultsGuide scan={scanResponse} />
          {qualityIssues.length > 0 && (
            <PqcSection title="What to do next">
              <ul className="list-disc space-y-1 pl-4 text-xs text-[var(--color-gray-300)]">
                <li>Re-run scan after confirming target and scan mode.</li>
                <li>Use dashboard history to verify tenant key and scan ownership context.</li>
                <li>If report is unavailable, retry after scan completion or run a fresh fixture scan.</li>
              </ul>
            </PqcSection>
          )}
          <PqcSection title="Executive summary">
            <ExecutivePriorities summary={scanResponse.report?.executiveSummary} />
          </PqcSection>
          <PqcSection title="Compliance & frameworks">
            <CompliancePanel
              pack={scanResponse.report?.compliancePack}
              summary={scanResponse.report?.complianceSummary}
            />
          </PqcSection>
          <PqcSection title="Risk scoreboard">
            <RiskScoreboardCard scoreboard={scanResponse.scoreboard} />
          </PqcSection>
          <div className="grid gap-4 lg:grid-cols-2">
            <PqcSection title="Risk quadrant (severity × HNDL)">
              <RiskQuadrant assets={scanResponse.assets} />
            </PqcSection>
            <PqcSection title="Readiness trend">
              <ReadinessTrend
                points={[
                  {
                    scanId: scanResponse.scanId,
                    createdAt: new Date().toISOString(),
                    readinessScore: scanResponse.scoreboard.qtangl.readiness_score,
                    readinessBand:
                      scanResponse.readinessBand ?? scanResponse.scoreboard.qtangl.readiness_band,
                  },
                ]}
              />
            </PqcSection>
          </div>
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
            <InventoryHeatmap
              assets={scanResponse.assets}
              explanations={scanResponse.report?.assetExplanations as Record<string, string> | undefined}
            />
          </PqcSection>
          {scanResponse.scanCoverage && scanResponse.scanCoverage.length > 0 && (
            <PqcSection title="Scan coverage (unreachable / errored)">
              <ScanCoverage entries={scanResponse.scanCoverage} />
            </PqcSection>
          )}
          {topAsset && (
            <PqcSection title="Top vulnerability">
              <VulnerabilityCard
                asset={topAsset}
                explanation={
                  (scanResponse.report?.assetExplanations as Record<string, string> | undefined)?.[
                    topAsset.id
                  ]
                }
              />
            </PqcSection>
          )}
          <PqcSection title="Remediation backlog">
            <RemediationBacklog items={scanResponse.remediationBacklog} />
          </PqcSection>
          <PqcSection title="Migration roadmap">
            <MigrationGantt
              milestones={
                scanResponse.report?.migrationRoadmap as
                  | Array<{ label: string; deadline: string; severity?: string }>
                  | undefined
              }
            />
          </PqcSection>
          <PqcSection title="References & standards">
            <ReferencesPanel />
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

      <ReportDrawer
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        scan={scanResponse}
        reportStatus={reportStatus}
        missingReason={reportAvailability?.missingReason ?? null}
      />
    </div>
  );
}
