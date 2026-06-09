"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import RemediationBoard from "@/components/pqc/RemediationBoard";
import ReadinessTrend from "@/components/pqc/ReadinessTrend";
import ScanDiffPanel, { type ScanDiff } from "@/components/pqc/ScanDiffPanel";
import DashboardOnboarding, { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import type { MergeConflict } from "@/components/pqc/MergeConflictPanel";

function PanelFallback() {
  return (
    <div
      className="surface-panel card-size-md h-48 animate-pulse rounded-[var(--radius-xl)]"
      aria-hidden
    />
  );
}

const RemediationWhatIf = dynamic(() => import("@/components/pqc/RemediationWhatIf"), {
  loading: PanelFallback,
});
const CompliancePanel = dynamic(() => import("@/components/pqc/CompliancePanel"), {
  loading: PanelFallback,
});
const InventoryHeatmap = dynamic(() => import("@/components/pqc/InventoryHeatmap"), {
  loading: PanelFallback,
});
const CbomImportPanel = dynamic(() => import("@/components/pqc/CbomImportPanel"), {
  loading: PanelFallback,
});
const CbomDriftWidget = dynamic(() => import("@/components/pqc/CbomDriftWidget"), {
  loading: PanelFallback,
});
const CloudIntegrationPanel = dynamic(() => import("@/components/pqc/CloudIntegrationPanel"), {
  loading: PanelFallback,
});
const ClmIntegrationPanel = dynamic(() => import("@/components/pqc/ClmIntegrationPanel"), {
  loading: PanelFallback,
});
const CohortDriftPanel = dynamic(() => import("@/components/pqc/CohortDriftPanel"), {
  loading: PanelFallback,
});
const KeyfactorIntegrationPanel = dynamic(
  () => import("@/components/pqc/KeyfactorIntegrationPanel"),
  { loading: PanelFallback }
);
const K8sIntegrationPanel = dynamic(() => import("@/components/pqc/K8sIntegrationPanel"), {
  loading: PanelFallback,
});
const PeerComparisonPanel = dynamic(() => import("@/components/pqc/PeerComparisonPanel"), {
  loading: PanelFallback,
});
const ReportDrawer = dynamic(() => import("@/components/pqc/ReportDrawer"), {
  loading: () => null,
});
const EvidenceVaultPanel = dynamic(() => import("@/components/pqc/EvidenceVaultPanel"), {
  loading: PanelFallback,
});
const MergeConflictPanel = dynamic(() => import("@/components/pqc/MergeConflictPanel"), {
  loading: PanelFallback,
});
const MultiSourceInventoryWidget = dynamic(
  () => import("@/components/pqc/MultiSourceInventoryWidget"),
  { loading: PanelFallback }
);
const DiscoveryInventoryTabs = dynamic(
  () => import("@/components/discovery/DiscoveryInventoryTabs"),
  { loading: PanelFallback }
);
const PassportListPanel = dynamic(() => import("@/components/pqc/PassportListPanel"), {
  loading: PanelFallback,
});
const PassportPanel = dynamic(() => import("@/components/pqc/PassportPanel"), {
  loading: PanelFallback,
});
const AlertSettings = dynamic(() => import("@/components/dashboard/AlertSettings"), {
  loading: PanelFallback,
});
const AuditLogPanel = dynamic(() => import("@/components/dashboard/AuditLogPanel"), {
  loading: PanelFallback,
});
const IntegrationSettings = dynamic(() => import("@/components/dashboard/IntegrationSettings"), {
  loading: PanelFallback,
});
const ScheduleManager = dynamic(() => import("@/components/dashboard/ScheduleManager"), {
  loading: PanelFallback,
});
import type { CompliancePack, ComplianceSummary, CryptoAsset, PqcScanResponse } from "@/lib/pqc";
import {
  fetchTenantJson,
  getStoredTenantApiKey,
  postTenantJson,
  setStoredTenantApiKey,
  tenantReportUrl,
  type ScheduledScan,
  type TenantScanSummary,
} from "@/lib/tenant-api";
import { qtanglApiBaseUrl } from "@/lib/api";
import { formatUtcDateTime } from "@/lib/format";

type TenantMe = {
  tenantId: string;
  persistenceEnabled: boolean;
  role?: string;
  entitlements?: { tier?: string; maxScansPerMonth?: number; maxSchedules?: number };
};

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const onboardingToken = searchParams.get("onboarding") ?? "";
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [me, setMe] = useState<TenantMe | null>(null);
  const [scans, setScans] = useState<TenantScanSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailForScan, setEmailForScan] = useState("");
  const [scheduleTarget, setScheduleTarget] = useState("");
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [scheduleCloudPull, setScheduleCloudPull] = useState(false);
  const [scheduleCloudProvider, setScheduleCloudProvider] = useState<
    "aws" | "azure" | "gcp" | "kubernetes" | "keyfactor" | "clm-digicert"
  >("aws");
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);
  const [reportDrawerScan, setReportDrawerScan] = useState<PqcScanResponse | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [expandedScanId, setExpandedScanId] = useState<string | null>(null);
  const [remediationScan, setRemediationScan] = useState<{
    scanId: string;
    items: Array<{ id: string; title: string; severity: string }>;
    statuses: Array<{ remediationId: string; status: string; owner?: string | null }>;
  } | null>(null);
  const [portfolioRollup, setPortfolioRollup] = useState<{
    overallReadiness: number;
    byBusinessUnit: Record<string, number>;
  } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduledScan[]>([]);
  const [portfolioTargetInput, setPortfolioTargetInput] = useState("");
  const [portfolioUnit, setPortfolioUnit] = useState("default");
  const [scanDiff, setScanDiff] = useState<ScanDiff | null>(null);
  const [jiraConfigured, setJiraConfigured] = useState(false);
  const [remediationVelocity, setRemediationVelocity] = useState<{
    closedCount: number;
    openCount: number;
    completionRatePct: number | null;
  } | null>(null);
  const [sloMetrics, setSloMetrics] = useState<{
    scanSuccessRatePct: number;
    reportAvailabilityPct: number;
    sampleSize: number;
    targetSloPct: number;
  } | null>(null);
  const [weeklyDigest, setWeeklyDigest] = useState<{
    headline: string;
    wins: string[];
    risks: string[];
    nextWeekFocus: string[];
  } | null>(null);
  const [commandCenter, setCommandCenter] = useState<{
    businessUnits: Record<string, number>;
    businessUnitDeltas?: Record<string, number | null>;
    highRiskTargets: Array<{ target: string; readinessScore: number }>;
  } | null>(null);
  const [billingPortalUrl, setBillingPortalUrl] = useState<string | null>(null);
  const [heatmapAssets, setHeatmapAssets] = useState<CryptoAsset[]>([]);
  const [compliance, setCompliance] = useState<{
    pack?: CompliancePack;
    summary?: ComplianceSummary;
  } | null>(null);
  const [analytics, setAnalytics] = useState<{
    forecast: { projected?: number; current?: number } | null;
    anomalyAlerts: Array<{ rule: string; message: string }>;
  }>({ forecast: null, anomalyAlerts: [] });
  const [cbomAggregate, setCbomAggregate] = useState<{
    componentCount: number;
    openConflicts: number;
    readiness: {
      score?: number;
      band?: string;
      label?: string;
      coverageConfidence?: number;
      verifiedCount?: number;
      importedCount?: number;
      unverifiedCount?: number;
    } | null;
  } | null>(null);
  const [cbomConflicts, setCbomConflicts] = useState<MergeConflict[]>([]);
  const [cbomDrift, setCbomDrift] = useState<{
    available?: boolean;
    addedCount?: number;
    removedCount?: number;
    changedCount?: number;
  } | null>(null);

  useEffect(() => {
    const syncKey = () => {
      const stored = getStoredTenantApiKey();
      if (stored) {
        setApiKey(stored);
        setSavedKey(stored);
      }
    };
    syncKey();
    window.addEventListener("qtangl-api-key-updated", syncKey);
    return () => window.removeEventListener("qtangl-api-key-updated", syncKey);
  }, []);

  const loadDashboard = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const mePayload = await fetchTenantJson<{
        tenantId: string;
        persistenceEnabled: boolean;
        role?: string;
        entitlements?: TenantMe["entitlements"];
      }>("/tenant/me", key);
      const scansPayload = await fetchTenantJson<{ scans: TenantScanSummary[] }>(
        "/tenant/scans?limit=100",
        key
      );
      setMe({
        tenantId: mePayload.tenantId,
        persistenceEnabled: mePayload.persistenceEnabled,
        role: mePayload.role,
        entitlements: mePayload.entitlements,
      });
      try {
        const portal = await fetchTenantJson<{ portalUrl?: string | null }>("/tenant/billing/portal", key);
        setBillingPortalUrl(portal.portalUrl ?? null);
      } catch {
        setBillingPortalUrl(null);
      }
      setScans(scansPayload.scans);
      try {
        const aggResponse = await fetch(`${qtanglApiBaseUrl}/pqc/cbom/aggregate`, {
          headers: { Authorization: `Bearer ${key}` },
          cache: "no-store",
        });
        if (aggResponse.ok) {
          const aggPayload = await aggResponse.json();
          setCbomAggregate({
            componentCount: aggPayload.aggregate?.componentCount ?? 0,
            openConflicts: aggPayload.aggregate?.openConflicts ?? 0,
            readiness: aggPayload.aggregate?.readiness ?? null,
          });
        }
        const conflictResponse = await fetch(`${qtanglApiBaseUrl}/pqc/cbom/conflicts`, {
          headers: { Authorization: `Bearer ${key}` },
          cache: "no-store",
        });
        if (conflictResponse.ok) {
          const conflictPayload = await conflictResponse.json();
          setCbomConflicts(conflictPayload.conflicts ?? []);
        }
        const driftResponse = await fetch(`${qtanglApiBaseUrl}/pqc/cbom/diff`, {
          headers: { Authorization: `Bearer ${key}` },
          cache: "no-store",
        });
        if (driftResponse.ok) {
          const driftPayload = await driftResponse.json();
          setCbomDrift(driftPayload.drift ?? null);
        } else {
          setCbomDrift(null);
        }
      } catch {
        setCbomAggregate(null);
        setCbomConflicts([]);
        setCbomDrift(null);
      }
      setSavedKey(key);
      setStoredTenantApiKey(key);
      if (mePayload.persistenceEnabled) {
        try {
          const portfolio = await fetchTenantJson<{
            rollup: { overallReadiness: number; byBusinessUnit: Record<string, number> };
          }>("/tenant/portfolio", key);
          setPortfolioRollup(portfolio.rollup);
        } catch {
          setPortfolioRollup(null);
        }
        try {
          const schedulesPayload = await fetchTenantJson<{ schedules: ScheduledScan[] }>(
            "/tenant/schedules",
            key
          );
          setSchedules(schedulesPayload.schedules);
        } catch {
          setSchedules([]);
        }
        try {
          const exportPayload = await fetchTenantJson<{
            remediationVelocity: { closedCount: number; openCount: number; completionRatePct: number | null };
          }>("/tenant/export", key);
          setRemediationVelocity(exportPayload.remediationVelocity);
        } catch {
          setRemediationVelocity(null);
        }
        try {
          const sloPayload = await fetchTenantJson<{
            metrics: {
              scanSuccessRatePct: number;
              reportAvailabilityPct: number;
              sampleSize: number;
              targetSloPct: number;
            };
          }>("/tenant/slo", key);
          setSloMetrics(sloPayload.metrics);
        } catch {
          setSloMetrics(null);
        }
        try {
          const ccPayload = await fetchTenantJson<{
            weeklyDigest: { headline: string; wins: string[]; risks: string[]; nextWeekFocus: string[] };
            commandCenter: {
              businessUnits: Record<string, number>;
              businessUnitDeltas?: Record<string, number | null>;
              highRiskTargets: Array<{ target: string; readinessScore: number }>;
            };
          }>("/tenant/portfolio/command-center", key);
          setWeeklyDigest(ccPayload.weeklyDigest);
          const cc = ccPayload.commandCenter;
          setCommandCenter({
            businessUnits: cc.businessUnits,
            businessUnitDeltas: cc.businessUnitDeltas,
            highRiskTargets: cc.highRiskTargets ?? [],
          });
        } catch {
          setWeeklyDigest(null);
        }
        try {
          const intPayload = await fetchTenantJson<{ integrations: Array<{ provider: string; configured: boolean }> }>(
            "/tenant/integrations",
            key
          );
          setJiraConfigured(intPayload.integrations.some((row) => row.provider === "jira" && row.configured));
        } catch {
          setJiraConfigured(false);
        }
      }
      const latestDone = scansPayload.scans.find((scan) => scan.status === "done");
      if (latestDone) {
        try {
          const detail = await fetchTenantJson<{
            report?: {
              remediationBacklog?: Array<{ id: string; title: string; severity: string }>;
              scanDiff?: ScanDiff;
              compliancePack?: CompliancePack;
              complianceSummary?: ComplianceSummary;
            };
            remediationStatus?: Array<{ remediationId: string; status: string; owner?: string | null }>;
          }>(`/tenant/scans/${latestDone.scanId}`, key);
          if (detail.report?.compliancePack || detail.report?.complianceSummary) {
            setCompliance({
              pack: detail.report?.compliancePack,
              summary: detail.report?.complianceSummary,
            });
          } else {
            setCompliance(null);
          }
          const items = detail.report?.remediationBacklog ?? [];
          if (items.length) {
            setRemediationScan({
              scanId: latestDone.scanId,
              items: items.slice(0, 10).map((row) => ({
                id: row.id,
                title: row.title,
                severity: row.severity,
              })),
              statuses: detail.remediationStatus ?? [],
            });
            setExpandedScanId(latestDone.scanId);
            setScanDiff(detail.report?.scanDiff ?? null);
            const assets = (detail.report as { assets?: CryptoAsset[] })?.assets;
            if (assets?.length) {
              setHeatmapAssets(assets);
            }
          }
        } catch {
          setRemediationScan(null);
        }
        try {
          const forecast = await fetchTenantJson<{ projected?: number; current?: number }>(
            "/tenant/analytics/forecast",
            key
          );
          const anomaly = await fetchTenantJson<{ alerts: Array<{ rule: string; message: string }> }>(
            "/tenant/analytics/anomaly",
            key
          );
          setAnalytics({ forecast, anomalyAlerts: anomaly.alerts ?? [] });
        } catch {
          setAnalytics({ forecast: null, anomalyAlerts: [] });
        }
      }
    } catch (loadError) {
      setMe(null);
      setScans([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!onboardingToken) {
      return;
    }
    let cancelled = false;
    async function redeemOnboardingKey() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${qtanglApiBaseUrl}/public/onboarding-key/${encodeURIComponent(onboardingToken)}`
        );
        if (!response.ok) {
          throw new Error("Onboarding link invalid, expired, or already used.");
        }
        const payload = (await response.json()) as { apiKey?: string };
        if (cancelled || !payload.apiKey) {
          return;
        }
        setStoredTenantApiKey(payload.apiKey);
        setApiKey(payload.apiKey);
        window.dispatchEvent(new Event("qtangl-api-key-updated"));
        setActionMessage("Monitor API key retrieved. Connecting dashboard…");
        await loadDashboard(payload.apiKey);
        const url = new URL(window.location.href);
        url.searchParams.delete("onboarding");
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      } catch (redeemError) {
        if (!cancelled) {
          setError(redeemError instanceof Error ? redeemError.message : "Onboarding link failed.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void redeemOnboardingKey();
    return () => {
      cancelled = true;
    };
  }, [onboardingToken, loadDashboard]);

  const apiKeyCard = (
    <Card tone="strong" className="rounded-[var(--radius-xl)]" id="connect-key">
      <Eyebrow>Tenant API key</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        Paste the tenant key issued by Qtangl admin. It is stored in this browser session only.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="qtangl_..."
          className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <button
          type="button"
          disabled={!apiKey || loading}
          onClick={() => loadDashboard(apiKey)}
          className="rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? "Loading…" : "Connect"}
        </button>
      </div>
      <p className="mt-3 text-xs text-[var(--color-gray-500)]">API base: {qtanglApiBaseUrl}</p>
    </Card>
  );

  const trendPoints = scans
    .filter((scan) => scan.readinessScore != null)
    .map((scan) => ({
      scanId: scan.scanId,
      createdAt: scan.createdAt,
      readinessScore: scan.readinessScore ?? 0,
      readinessBand: scan.readinessBand ?? undefined,
    }));

  const latestScan = scans.find((scan) => scan.readinessScore != null);

  return (
    <div className="space-y-8">
      {!me ? <DashboardOnboarding /> : null}
      {!me ? apiKeyCard : null}

      {error ? (
        <Card tone="ghost" className="border border-red-500/40 text-red-200">
          {error}
        </Card>
      ) : null}

      {me ? (
        <>
          {latestScan ? (
            <DashboardSection title="Readiness">
              <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
                <Eyebrow>Readiness at a glance</Eyebrow>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                  {latestScan.readinessScore}
                  {latestScan.readinessBand ? (
                    <span className="ml-3 text-lg font-normal text-[var(--color-gray-400)]">
                      {latestScan.readinessBand}
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm text-[var(--color-gray-400)]">
                  Latest scan {latestScan.scanId} · {formatUtcDateTime(latestScan.createdAt)}
                </p>
              </Card>
            </DashboardSection>
          ) : null}

          <DashboardSection title="Scan drift">
            <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
              <Eyebrow>
                {latestScan ? `Scan diff — ${latestScan.scanId}` : "Scan diff"}
              </Eyebrow>
              <p className="mt-2 text-sm text-[var(--color-gray-400)]">
                Compare against the prior scan on the same target to surface cryptographic drift.
              </p>
              <div className="mt-4">
                {scanDiff ? (
                  <ScanDiffPanel diff={scanDiff} />
                ) : (
                  <p className="text-sm text-[var(--color-gray-500)]">
                    {latestScan
                      ? "No prior scan to compare. Run a second scan on the same target to see drift."
                      : "Run a scan to enable drift tracking."}
                  </p>
                )}
              </div>
            </Card>
          </DashboardSection>

          <DashboardSection title="Overview">
            <Card tone="panel">
              <Eyebrow>Tenant overview</Eyebrow>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Tenant ID</dt>
                  <dd className="mt-1 font-mono text-sm text-white">{me.tenantId}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Persistence</dt>
                  <dd className="mt-1 text-sm text-white">
                    {me.persistenceEnabled ? "Postgres enabled" : "In-memory / demo"}
                  </dd>
                </div>
                {me.entitlements?.tier ? (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Plan tier</dt>
                    <dd className="mt-1 text-sm text-white capitalize">{me.entitlements.tier}</dd>
                  </div>
                ) : null}
                {me.role ? (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">API key role</dt>
                    <dd className="mt-1 text-sm text-white">{me.role}</dd>
                  </div>
                ) : null}
              </dl>
              {billingPortalUrl ? (
                <a
                  href={billingPortalUrl}
                  className="mt-4 inline-block text-sm text-white underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  Manage billing
                </a>
              ) : (
                <a href="/pricing" className="mt-4 inline-block text-sm text-[var(--color-gray-400)] underline">
                  View plans
                </a>
              )}
            </Card>
            {apiKeyCard}
          </DashboardSection>

          <DashboardSection title="Remediation">
            {savedKey && remediationScan ? (
              <Card tone="panel">
                <Eyebrow>Top remediation priorities</Eyebrow>
                <RemediationBoard
                  apiKey={savedKey}
                  scanId={remediationScan.scanId}
                  items={remediationScan.items}
                  initialStatuses={remediationScan.statuses}
                  jiraConfigured={jiraConfigured}
                  allScans={scans.map((s) => ({ scanId: s.scanId, label: s.targetDomain ?? s.scanId }))}
                />
              </Card>
            ) : null}
            {remediationVelocity ? (
              <Card tone="panel">
                <Eyebrow>Remediation velocity</Eyebrow>
                <p className="mt-2 text-sm text-[var(--color-gray-300)]">
                  {remediationVelocity.closedCount} closed · {remediationVelocity.openCount} open
                  {remediationVelocity.completionRatePct != null
                    ? ` · ${remediationVelocity.completionRatePct}% completion rate`
                    : ""}
                </p>
              </Card>
            ) : null}
            {sloMetrics ? (
              <Card tone="panel">
                <Eyebrow>Reliability SLO</Eyebrow>
                <p className="mt-2 text-sm text-[var(--color-gray-300)]">
                  Scan success {sloMetrics.scanSuccessRatePct}% · Report availability{" "}
                  {sloMetrics.reportAvailabilityPct}% · Target {sloMetrics.targetSloPct}% (
                  {sloMetrics.sampleSize} samples)
                </p>
              </Card>
            ) : null}
            {savedKey && scans.length > 0 ? (
              <Card tone="panel">
                <Eyebrow>Recent PQC scans</Eyebrow>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="email"
                    value={emailForScan}
                    onChange={(event) => setEmailForScan(event.target.value)}
                    placeholder="Email me reports…"
                    className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white sm:max-w-xs"
                  />
                </div>
                {actionMessage ? <p className="mt-2 text-xs text-[var(--color-gray-400)]">{actionMessage}</p> : null}
                {shareUrl ? (
                  <p className="mt-2 break-all text-xs text-[var(--color-gray-400)]">
                    Share link: <span className="font-mono text-white">{shareUrl}</span>
                  </p>
                ) : null}
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
                      <tr>
                        <th className="pb-3 pr-4">Scan ID</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Scenario</th>
                        <th className="pb-3 pr-4">Created</th>
                        <th className="pb-3 pr-4">Readiness</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-gray-300)]">
                      {scans.map((scan) => (
                        <tr key={scan.scanId} className="border-t border-[var(--border-subtle)]">
                          <td className="py-3 pr-4 font-mono text-xs text-white">{scan.scanId}</td>
                          <td className="py-3 pr-4">{scan.status}</td>
                          <td className="py-3 pr-4">{scan.scenarioId ?? "—"}</td>
                          <td className="py-3 pr-4">{formatUtcDateTime(scan.createdAt)}</td>
                          <td className="py-3 pr-4">
                            {scan.readinessScore != null ? (
                              <span>
                                {scan.readinessScore}
                                {scan.readinessBand ? ` · ${scan.readinessBand}` : ""}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3">
                            {scan.status === "done" ? (
                              <div className="flex flex-wrap gap-2">
                                <a
                                  href={tenantReportUrl(scan.scanId, savedKey, "pdf")}
                                  className="text-white underline underline-offset-4"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  PDF
                                </a>
                                <a
                                  href={tenantReportUrl(scan.scanId, savedKey, "bundle")}
                                  className="text-white underline underline-offset-4"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  ZIP
                                </a>
                                <a
                                  href={tenantReportUrl(scan.scanId, savedKey, "board")}
                                  className="text-white underline underline-offset-4"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Board
                                </a>
                                <a
                                  href={tenantReportUrl(scan.scanId, savedKey, "auditor")}
                                  className="text-white underline underline-offset-4"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Auditor
                                </a>
                                <button
                                  type="button"
                                  className="text-white underline underline-offset-4"
                                  onClick={async () => {
                                    try {
                                      const detail = await fetchTenantJson<{
                                        remediationBacklog: Array<{ id: string; title: string; severity: string }>;
                                        remediationStatus: Array<{
                                          remediationId: string;
                                          status: string;
                                          owner?: string | null;
                                        }>;
                                        report?: { scanDiff?: ScanDiff };
                                      }>(`/tenant/scans/${scan.scanId}`, savedKey);
                                      setExpandedScanId(scan.scanId);
                                      setScanDiff(detail.report?.scanDiff ?? null);
                                      setRemediationScan({
                                        scanId: scan.scanId,
                                        items: detail.remediationBacklog ?? [],
                                        statuses: detail.remediationStatus ?? [],
                                      });
                                    } catch (loadError) {
                                      setActionMessage(
                                        loadError instanceof Error ? loadError.message : "Failed to load remediation."
                                      );
                                    }
                                  }}
                                >
                                  Remediation
                                </button>
                                <button
                                  type="button"
                                  className="text-white underline underline-offset-4"
                                  onClick={async () => {
                                    try {
                                      const detail = await fetchTenantJson<{ report?: { scanDiff?: ScanDiff } }>(
                                        `/tenant/scans/${scan.scanId}`,
                                        savedKey
                                      );
                                      setScanDiff(detail.report?.scanDiff ?? null);
                                      setActionMessage(
                                        detail.report?.scanDiff
                                          ? `Diff loaded for ${scan.scanId}.`
                                          : "No prior scan to compare."
                                      );
                                    } catch (loadError) {
                                      setActionMessage(
                                        loadError instanceof Error ? loadError.message : "Failed to load diff."
                                      );
                                    }
                                  }}
                                >
                                  Diff
                                </button>
                                <button
                                  type="button"
                                  className="text-white underline underline-offset-4"
                                  onClick={async () => {
                                    try {
                                      const detail = await fetchTenantJson<PqcScanResponse>(
                                        `/tenant/scans/${scan.scanId}`,
                                        savedKey
                                      );
                                      setReportDrawerScan(detail);
                                      setReportDrawerOpen(true);
                                    } catch (loadError) {
                                      setActionMessage(
                                        loadError instanceof Error ? loadError.message : "Failed to load report."
                                      );
                                    }
                                  }}
                                >
                                  Reports
                                </button>
                                <PassportPanel
                                  scanId={scan.scanId}
                                  apiKey={savedKey}
                                  onCreated={(payload) => {
                                    if (payload.url) {
                                      setShareUrl(payload.url);
                                      setActionMessage("Readiness passport created.");
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  className="text-white underline underline-offset-4"
                                  onClick={async () => {
                                    if (!emailForScan) {
                                      setActionMessage("Enter an email above to send reports.");
                                      return;
                                    }
                                    try {
                                      await postTenantJson(
                                        `/tenant/scans/${scan.scanId}/email`,
                                        savedKey,
                                        { email: emailForScan }
                                      );
                                      setActionMessage(`Email queued for ${scan.scanId}.`);
                                    } catch (sendError) {
                                      setActionMessage(
                                        sendError instanceof Error ? sendError.message : "Email failed."
                                      );
                                    }
                                  }}
                                >
                                  Email
                                </button>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {expandedScanId && remediationScan ? (
                  <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
                    <Eyebrow>Remediation — {expandedScanId}</Eyebrow>
                    <RemediationBoard
                      apiKey={savedKey}
                      scanId={remediationScan.scanId}
                      items={remediationScan.items}
                      initialStatuses={remediationScan.statuses}
                      jiraConfigured={jiraConfigured}
                      allScans={scans.map((s) => ({
                        scanId: s.scanId,
                        label: s.targetDomain ?? s.scanId,
                      }))}
                    />
                    <RemediationWhatIf
                      apiKey={savedKey}
                      scanId={remediationScan.scanId}
                      items={remediationScan.items}
                    />
                    <div className="mt-6">
                      <PeerComparisonPanel apiKey={savedKey} />
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : savedKey && !loading ? (
              <Card tone="ghost">
                <p className="text-sm text-[var(--color-gray-400)]">No scans yet for this tenant.</p>
              </Card>
            ) : null}
          </DashboardSection>

          <DashboardSection title="Trend & drift">
            {trendPoints.length >= 2 ? (
              <Card tone="panel">
                <Eyebrow>Readiness trend</Eyebrow>
                <ReadinessTrend points={trendPoints} />
              </Card>
            ) : null}
            {weeklyDigest ? (
              <Card tone="panel">
                <Eyebrow>Weekly executive digest</Eyebrow>
                <p className="mt-2 text-sm text-white">{weeklyDigest.headline}</p>
                {weeklyDigest.risks.length > 0 ? (
                  <ul className="mt-3 list-disc pl-5 text-xs text-[var(--color-gray-400)]">
                    {weeklyDigest.risks.slice(0, 3).map((risk) => (
                      <li key={risk}>{risk}</li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            ) : null}
            {commandCenter && Object.keys(commandCenter.businessUnits).length > 0 ? (
              <Card tone="panel">
                <Eyebrow>Portfolio command center</Eyebrow>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase text-[var(--color-gray-500)]">
                      <tr>
                        <th className="pb-2 pr-4">Business unit</th>
                        <th className="pb-2 pr-4">Readiness</th>
                        <th className="pb-2 pr-4">Δ vs prior</th>
                        <th className="pb-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-gray-300)]">
                      {Object.entries(commandCenter.businessUnits)
                        .sort(([, a], [, b]) => a - b)
                        .map(([unit, score]) => (
                          <tr key={unit} className="border-t border-[var(--border-subtle)]">
                            <td className="py-2 pr-4 text-white">{unit}</td>
                            <td className="py-2 pr-4">{score}</td>
                            <td className="py-2 pr-4">
                              {commandCenter.businessUnitDeltas?.[unit] != null
                                ? commandCenter.businessUnitDeltas[unit]
                                : "—"}
                            </td>
                            <td className="py-2">
                              {savedKey ? (
                                <button
                                  type="button"
                                  className="text-white underline underline-offset-4"
                                  onClick={() => {
                                    setScheduleTarget("");
                                    setPortfolioUnit(unit);
                                    setActionMessage(`Create a weekly schedule for BU "${unit}" below.`);
                                  }}
                                >
                                  Schedule monitoring
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : null}
            {heatmapAssets.length > 0 ? (
              <Card tone="panel">
                <Eyebrow>Asset heatmap</Eyebrow>
                <div className="mt-4">
                  <InventoryHeatmap assets={heatmapAssets} />
                </div>
              </Card>
            ) : null}
            {compliance ? (
              <Card tone="panel">
                <Eyebrow>Compliance &amp; frameworks</Eyebrow>
                <div className="mt-4">
                  <CompliancePanel pack={compliance.pack} summary={compliance.summary} />
                </div>
              </Card>
            ) : null}
            {analytics.forecast || analytics.anomalyAlerts.length > 0 || savedKey ? (
              <Card tone="panel">
                <Eyebrow>Intelligence</Eyebrow>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 text-sm text-[var(--color-gray-300)]">
                  {analytics.forecast?.projected != null ? (
                    <div>
                      <p className="text-xs uppercase text-[var(--color-gray-500)]">Forecast (4 scans)</p>
                      <p className="mt-1 text-white">
                        {analytics.forecast.current} → {analytics.forecast.projected}
                      </p>
                    </div>
                  ) : null}
                  {analytics.anomalyAlerts.length > 0 ? (
                    <div>
                      <p className="text-xs uppercase text-[var(--color-gray-500)]">Anomalies</p>
                      <p className="mt-1">{analytics.anomalyAlerts[0]?.message}</p>
                    </div>
                  ) : null}
                  {savedKey ? <CohortDriftPanel apiKey={savedKey} /> : null}
                </div>
              </Card>
            ) : null}
            {portfolioRollup ? (
              <Card tone="panel">
                <Eyebrow>Portfolio readiness</Eyebrow>
                <p className="mt-2 text-2xl font-semibold text-white">{portfolioRollup.overallReadiness}</p>
                <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                  {Object.entries(portfolioRollup.byBusinessUnit).map(([unit, score]) => (
                    <div key={unit}>
                      <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">{unit}</dt>
                      <dd className="text-sm text-white">{score}</dd>
                    </div>
                  ))}
                </dl>
                {savedKey ? (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={portfolioTargetInput}
                      onChange={(event) => setPortfolioTargetInput(event.target.value)}
                      placeholder="Add target domain"
                      className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
                    />
                    <input
                      type="text"
                      value={portfolioUnit}
                      onChange={(event) => setPortfolioUnit(event.target.value)}
                      placeholder="Business unit"
                      className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white sm:max-w-xs"
                    />
                    <button
                      type="button"
                      className="rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black"
                      onClick={async () => {
                        if (!portfolioTargetInput) return;
                        try {
                          await postTenantJson("/tenant/portfolio", savedKey, {
                            target: portfolioTargetInput,
                            businessUnit: portfolioUnit || "default",
                          });
                          setActionMessage("Portfolio target added.");
                          await loadDashboard(savedKey);
                        } catch (portfolioError) {
                          setActionMessage(
                            portfolioError instanceof Error ? portfolioError.message : "Portfolio update failed."
                          );
                        }
                      }}
                    >
                      Add target
                    </button>
                  </div>
                ) : null}
              </Card>
            ) : null}
          </DashboardSection>

          <DashboardSection title="Settings">
            {savedKey && me.persistenceEnabled ? (
              <Card tone="panel">
                <Eyebrow>Alert settings</Eyebrow>
                <div className="mt-4">
                  <AlertSettings apiKey={savedKey} onMessage={setActionMessage} />
                </div>
              </Card>
            ) : null}

            {savedKey && me.persistenceEnabled ? (
              <Card tone="panel">
                <Eyebrow>Evidence vault</Eyebrow>
                <div className="mt-4">
                  <EvidenceVaultPanel
                    apiKey={savedKey}
                    scanIds={scans.filter((s) => s.status === "done").map((s) => s.scanId)}
                    onMessage={setActionMessage}
                  />
                </div>
              </Card>
            ) : null}

            {savedKey && me.persistenceEnabled && me.role === "admin" ? (
              <Card tone="panel">
                <Eyebrow>Audit log (admin)</Eyebrow>
                <div className="mt-4">
                  <AuditLogPanel apiKey={savedKey} />
                </div>
              </Card>
            ) : savedKey && me.persistenceEnabled && me.role !== "admin" ? (
              <Card tone="ghost">
                <p className="text-xs text-[var(--color-gray-500)]">Audit log requires an admin API key.</p>
              </Card>
            ) : null}

            {savedKey && me.persistenceEnabled ? (
              <Card tone="panel">
                <Eyebrow>Readiness passports</Eyebrow>
                <div className="mt-4">
                  <PassportListPanel apiKey={savedKey} onMessage={setActionMessage} />
                </div>
              </Card>
            ) : null}

            {savedKey && me.persistenceEnabled ? (
              <Card tone="panel">
                <Eyebrow>Scheduled monitoring</Eyebrow>
                <p className="mt-2 text-sm text-[var(--color-gray-400)]">
                  Requires Redis worker with QTANGL_ENABLE_SCHEDULER. Gracefully unavailable on single-process
                  deploys.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={scheduleTarget}
                    onChange={(event) => setScheduleTarget(event.target.value)}
                    placeholder="Target domain (optional)"
                    className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
                  />
                  <input
                    type="email"
                    value={scheduleEmail}
                    onChange={(event) => setScheduleEmail(event.target.value)}
                    placeholder="Notify email"
                    className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white sm:max-w-xs"
                  />
                  <label className="flex items-center gap-2 text-sm text-[var(--color-gray-400)]">
                    <input
                      type="checkbox"
                      checked={scheduleCloudPull}
                      onChange={(event) => setScheduleCloudPull(event.target.checked)}
                    />
                    Also refresh cloud CBOM on schedule
                  </label>
                  {scheduleCloudPull ? (
                    <select
                      value={scheduleCloudProvider}
                      onChange={(event) =>
                        setScheduleCloudProvider(
                          event.target.value as typeof scheduleCloudProvider
                        )
                      }
                      className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
                    >
                      <option value="aws">AWS ACM</option>
                      <option value="azure">Azure Key Vault</option>
                      <option value="gcp">GCP Certificate Manager</option>
                      <option value="kubernetes">Kubernetes cert-manager</option>
                      <option value="keyfactor">Keyfactor</option>
                      <option value="clm-digicert">DigiCert CLM</option>
                    </select>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black"
                    onClick={async () => {
                      try {
                        await postTenantJson("/tenant/schedules", savedKey, {
                          scenarioId: "bank-tls-inventory",
                          target: scheduleTarget || null,
                          cadenceHours: 168,
                          notifyEmail: scheduleEmail || null,
                          jobType: scheduleCloudPull ? "cloud_pull" : "scan",
                          integrationProvider: scheduleCloudPull ? scheduleCloudProvider : null,
                        });
                        setActionMessage(
                          scheduleCloudPull ? "Cloud CBOM schedule created." : "Schedule created."
                        );
                        await loadDashboard(savedKey);
                      } catch (scheduleError) {
                        setActionMessage(
                          scheduleError instanceof Error ? scheduleError.message : "Schedule failed."
                        );
                      }
                    }}
                  >
                    Create weekly schedule
                  </button>
                </div>
                <div className="mt-4">
                  <ScheduleManager
                    apiKey={savedKey}
                    schedules={schedules}
                    onRefresh={() => loadDashboard(savedKey)}
                    onMessage={setActionMessage}
                  />
                </div>
              </Card>
            ) : null}
          </DashboardSection>

          <DashboardSection title="Integrations">
            {savedKey ? (
              <>
                {me.persistenceEnabled ? (
                  <Card tone="panel">
                    <Eyebrow>Webhook &amp; ticketing</Eyebrow>
                    <div className="mt-4">
                      <IntegrationSettings apiKey={savedKey} onMessage={setActionMessage} />
                    </div>
                  </Card>
                ) : null}
                <Card tone="panel">
                  <Eyebrow>Multi-source inventory</Eyebrow>
                  <div className="mt-3">
                    <MultiSourceInventoryWidget
                      componentCount={cbomAggregate?.componentCount ?? 0}
                      readiness={cbomAggregate?.readiness ?? null}
                      openConflicts={cbomAggregate?.openConflicts ?? 0}
                    />
                  </div>
                </Card>
                <Card tone="panel">
                  <Eyebrow>Discovery depth — hosts, code, images</Eyebrow>
                  <div className="mt-4">
                    <DiscoveryInventoryTabs
                      apiKey={savedKey}
                      externalCount={cbomAggregate?.componentCount ?? 0}
                    />
                  </div>
                </Card>
                <Card tone="panel">
                  <CbomDriftWidget drift={cbomDrift} />
                </Card>
                <Card tone="panel">
                  <Eyebrow>Cloud inventory pull</Eyebrow>
                  <div className="mt-4">
                    <CloudIntegrationPanel apiKey={savedKey} onMessage={setActionMessage} />
                  </div>
                </Card>
                <Card tone="panel">
                  <Eyebrow>Kubernetes cert-manager</Eyebrow>
                  <div className="mt-4">
                    <K8sIntegrationPanel apiKey={savedKey} onMessage={setActionMessage} />
                  </div>
                </Card>
                <Card tone="panel">
                  <Eyebrow>Keyfactor</Eyebrow>
                  <div className="mt-4">
                    <KeyfactorIntegrationPanel apiKey={savedKey} onMessage={setActionMessage} />
                  </div>
                </Card>
                <Card tone="panel">
                  <Eyebrow>Certificate lifecycle (CLM)</Eyebrow>
                  <div className="mt-4">
                    <ClmIntegrationPanel apiKey={savedKey} onMessage={setActionMessage} />
                  </div>
                </Card>
                <Card tone="panel">
                  <CbomImportPanel
                    apiKey={savedKey}
                    onImported={() => {
                      if (savedKey) {
                        void loadDashboard(savedKey);
                      }
                    }}
                  />
                </Card>
                {cbomConflicts.length > 0 ? (
                  <Card tone="panel">
                    <Eyebrow>Merge conflicts</Eyebrow>
                    <div className="mt-3">
                      <MergeConflictPanel
                        apiKey={savedKey}
                        conflicts={cbomConflicts}
                        onResolved={() => {
                          if (savedKey) {
                            void loadDashboard(savedKey);
                          }
                        }}
                      />
                    </div>
                  </Card>
                ) : null}
              </>
            ) : null}
          </DashboardSection>
        </>
      ) : null}
      <ReportDrawer
        open={reportDrawerOpen}
        onClose={() => setReportDrawerOpen(false)}
        scan={reportDrawerScan}
        reportStatus={
          reportDrawerScan?.reportAvailable === false
            ? "unavailable"
            : reportDrawerScan
              ? "ready"
              : "checking"
        }
        missingReason={reportDrawerScan?.missingReason ?? null}
      />
    </div>
  );
}
