"use client";

import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import RemediationBoard from "@/components/pqc/RemediationBoard";
import ReadinessTrend from "@/components/pqc/ReadinessTrend";
import ScanDiffPanel, { type ScanDiff } from "@/components/pqc/ScanDiffPanel";
import IntegrationSettings from "@/components/dashboard/IntegrationSettings";
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
};

export default function DashboardClient() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [me, setMe] = useState<TenantMe | null>(null);
  const [scans, setScans] = useState<TenantScanSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailForScan, setEmailForScan] = useState("");
  const [scheduleTarget, setScheduleTarget] = useState("");
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [expandedScanId, setExpandedScanId] = useState<string | null>(null);
  const [remediationScan, setRemediationScan] = useState<{
    scanId: string;
    items: Array<{ id: string; title: string; severity: string }>;
    statuses: Array<{ remediationId: string; status: string }>;
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

  useEffect(() => {
    const stored = getStoredTenantApiKey();
    if (stored) {
      setApiKey(stored);
      setSavedKey(stored);
    }
  }, []);

  const loadDashboard = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const mePayload = await fetchTenantJson<{ tenantId: string; persistenceEnabled: boolean }>(
        "/tenant/me",
        key
      );
      const scansPayload = await fetchTenantJson<{ scans: TenantScanSummary[] }>("/tenant/scans", key);
      setMe({ tenantId: mePayload.tenantId, persistenceEnabled: mePayload.persistenceEnabled });
      setScans(scansPayload.scans);
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
          }>("/tenant/portfolio/command-center", key);
          setWeeklyDigest(ccPayload.weeklyDigest);
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
    } catch (loadError) {
      setMe(null);
      setScans([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card tone="strong" className="rounded-[var(--radius-xl)]">
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
        <p className="mt-3 text-xs text-[var(--color-gray-500)]">
          API base: {qtanglApiBaseUrl}
        </p>
      </Card>

      {error ? (
        <Card tone="ghost" className="border border-red-500/40 text-red-200">
          {error}
        </Card>
      ) : null}

      {me && remediationVelocity ? (
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
      {me && sloMetrics ? (
        <Card tone="panel">
          <Eyebrow>Reliability SLO</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-300)]">
            Scan success {sloMetrics.scanSuccessRatePct}% · Report availability {sloMetrics.reportAvailabilityPct}% ·
            Target {sloMetrics.targetSloPct}% ({sloMetrics.sampleSize} samples)
          </p>
        </Card>
      ) : null}
      {weeklyDigest ? (
        <Card tone="panel">
          <Eyebrow>Weekly executive digest</Eyebrow>
          <p className="mt-2 text-sm text-white">{weeklyDigest.headline}</p>
        </Card>
      ) : null}

      {scanDiff ? (
        <Card tone="panel">
          <Eyebrow>Changes since last scan</Eyebrow>
          <div className="mt-4">
            <ScanDiffPanel diff={scanDiff} />
          </div>
        </Card>
      ) : null}

      {me && portfolioRollup ? (
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

      {scans.filter((scan) => scan.readinessScore != null).length >= 2 ? (
        <Card tone="panel">
          <Eyebrow>Readiness trend</Eyebrow>
          <ReadinessTrend
            points={scans
              .filter((scan) => scan.readinessScore != null)
              .map((scan) => ({
                scanId: scan.scanId,
                createdAt: scan.createdAt,
                readinessScore: scan.readinessScore ?? 0,
                readinessBand: scan.readinessBand ?? undefined,
              }))}
          />
        </Card>
      ) : null}

      {me ? (
        <Card tone="panel">
          <Eyebrow>Tenant overview</Eyebrow>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Tenant ID</dt>
              <dd className="mt-1 font-mono text-sm text-white">{me.tenantId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Persistence</dt>
              <dd className="mt-1 text-sm text-white">{me.persistenceEnabled ? "Postgres enabled" : "In-memory / demo"}</dd>
            </div>
          </dl>
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
                                  remediationStatus: Array<{ remediationId: string; status: string }>;
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
                                const payload = await postTenantJson<{ url: string }>(
                                  `/tenant/scans/${scan.scanId}/share`,
                                  savedKey,
                                  { expiresHours: 168 }
                                );
                                setShareUrl(payload.url);
                                setActionMessage("Share link created (7 days).");
                              } catch (shareError) {
                                setActionMessage(
                                  shareError instanceof Error ? shareError.message : "Share link failed."
                                );
                              }
                            }}
                          >
                            Share
                          </button>
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
              />
            </div>
          ) : null}
        </Card>
      ) : savedKey && !loading ? (
        <Card tone="ghost">
          <p className="text-sm text-[var(--color-gray-400)]">No scans yet for this tenant.</p>
        </Card>
      ) : null}

      {savedKey && me?.persistenceEnabled ? (
        <Card tone="panel">
          <Eyebrow>Integrations</Eyebrow>
          <div className="mt-4">
            <IntegrationSettings apiKey={savedKey} onMessage={setActionMessage} />
          </div>
        </Card>
      ) : null}

      {savedKey && me?.persistenceEnabled ? (
        <Card tone="panel">
          <Eyebrow>Scheduled monitoring</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">
            Requires Redis worker with QTANGL_ENABLE_SCHEDULER. Gracefully unavailable on single-process deploys.
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
                  });
                  setActionMessage("Schedule created.");
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
          {schedules.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-gray-300)]">
              {schedules.map((schedule) => (
                <li
                  key={schedule.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] p-3"
                >
                  <div>
                    <p className="font-mono text-xs text-white">{schedule.id}</p>
                    <p className="text-xs text-[var(--color-gray-500)]">
                      {schedule.scenarioId} · every {schedule.cadenceHours}h · next{" "}
                      {schedule.nextRunAt ? formatUtcDateTime(schedule.nextRunAt) : "—"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-red-300 underline"
                    onClick={async () => {
                      if (!savedKey) return;
                      await fetchTenantJson(`/tenant/schedules/${schedule.id}`, savedKey, {
                        method: "DELETE",
                      });
                      setSchedules((prev) => prev.filter((row) => row.id !== schedule.id));
                      setActionMessage("Schedule deleted.");
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
