"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import DashboardAdvancedKeyPanel from "@/components/dashboard/DashboardAdvancedKeyPanel";
import DashboardWidgetPreferences from "@/components/dashboard/DashboardWidgetPreferences";
import { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { SettingsTabBundle } from "@/lib/dashboard-state";
import { postDashboardJson, putDashboardJson } from "@/lib/dashboard-bff";

const AlertSettings = dynamic(() => import("@/components/dashboard/AlertSettings"));
const AuditLogPanel = dynamic(() => import("@/components/dashboard/AuditLogPanel"));
const TeamSettingsPanel = dynamic(() => import("@/components/dashboard/TeamSettingsPanel"));
const MsspPortfolioSettings = dynamic(() => import("@/components/dashboard/MsspPortfolioSettings"));
const WorkspaceSettingsPanel = dynamic(() => import("@/components/dashboard/WorkspaceSettingsPanel"));
const ApiKeysPanel = dynamic(() => import("@/components/dashboard/ApiKeysPanel"));
const AuthorizedDomainsPanel = dynamic(() => import("@/components/dashboard/AuthorizedDomainsPanel"));
const BillingHubPanel = dynamic(() => import("@/components/dashboard/BillingHubPanel"));
const LegalCompliancePanel = dynamic(() => import("@/components/dashboard/LegalCompliancePanel"));
const ReportBrandingPanel = dynamic(() => import("@/components/dashboard/ReportBrandingPanel"));
const EvidenceVaultPanel = dynamic(() => import("@/components/pqc/EvidenceVaultPanel"));

type Props = {
  bundle: SettingsTabBundle | null;
  savedKey: string;
  bffMode: boolean;
  canAdmin: boolean;
  canManageKeys: boolean;
  canInvite?: boolean;
  sessionRole: string;
  tenantName?: string;
  tier?: string;
  persona: DashboardPersona;
  apiKey: string;
  loading: boolean;
  recentScanIds?: string[];
  tenantSettings?: Record<string, unknown> | null;
  scansThisMonth?: number;
  onMessage: (message: string) => void;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  onApiKeyChange: (key: string) => void;
  onConnect: () => void;
  onOpenUpgrade?: (product: "assess" | "monitor" | "convert") => void;
};

export default function DashboardSettingsTab({
  bundle,
  savedKey,
  bffMode,
  canAdmin,
  canManageKeys,
  canInvite,
  sessionRole,
  tenantName,
  tier,
  persona,
  apiKey,
  loading,
  recentScanIds = [],
  tenantSettings,
  scansThisMonth = 0,
  onMessage,
  onSettingsChange,
  onApiKeyChange,
  onConnect,
  onOpenUpgrade,
}: Props) {
  const settings = bundle?.settings ?? {};
  const [ssoPortalUrl, setSsoPortalUrl] = useState<string | null>(null);
  const boardSchedule = (settings.boardExportSchedule as Record<string, unknown>) ?? {};

  return (
    <DashboardSection title="Settings" id="dashboard-settings">
      {canManageKeys && bffMode ? <ApiKeysPanel role={sessionRole} /> : null}

      {canAdmin && bffMode ? (
        <>
          <BillingHubPanel
            tier={tier}
            scansThisMonth={scansThisMonth}
            onOpenUpgrade={onOpenUpgrade}
            onMessage={onMessage}
          />
          <LegalCompliancePanel
            tenantSettings={tenantSettings ?? settings}
            onAccepted={(billing) =>
              onSettingsChange({ ...(tenantSettings ?? settings), billing })
            }
          />
          <ReportBrandingPanel onMessage={onMessage} onSettingsChange={onSettingsChange} />
          <AuthorizedDomainsPanel
            canAdmin={canAdmin}
            onMessage={onMessage}
            onDomainsChange={(domains) =>
              onSettingsChange({ ...(tenantSettings ?? settings), scanAllowlist: domains })
            }
          />
          <Card tone="panel">
            <Eyebrow>Data export</Eyebrow>
            <p className="mt-2 text-sm text-[var(--color-gray-400)]">
              Download a JSON bundle of tenant scans, settings, and audit metadata for procurement or GDPR requests.
            </p>
            <button
              type="button"
              className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
              onClick={async () => {
                try {
                  const response = await fetch("/api/dashboard/tenant/export");
                  if (!response.ok) throw new Error("Export failed.");
                  const blob = await response.blob();
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = "qtangl-tenant-export.json";
                  anchor.click();
                  URL.revokeObjectURL(url);
                  onMessage("Tenant export downloaded.");
                } catch (exc) {
                  onMessage(exc instanceof Error ? exc.message : "Export failed.");
                }
              }}
            >
              Download tenant export
            </button>
          </Card>
        </>
      ) : null}

      <Card tone="panel">
        <Eyebrow>Evidence vault</Eyebrow>
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">
          Retention policy: {String(settings.evidenceRetentionMonths ?? 12)} months
          {settings.autoRetainScans ? " · auto-retain enabled" : ""}
        </p>
        <div className="mt-4">
          <EvidenceVaultPanel
            apiKey={savedKey}
            useBff={bffMode}
            scanIds={recentScanIds}
            onMessage={onMessage}
          />
        </div>
      </Card>

      <Card tone="panel">
        <Eyebrow>Alert settings</Eyebrow>
        <div className="mt-4">
          <AlertSettings apiKey={savedKey} onMessage={onMessage} bffMode={bffMode} />
        </div>
      </Card>

      {canAdmin ? (
        <Card tone="panel">
          <Eyebrow>Scheduled board exports</Eyebrow>
          <label className="mt-3 flex items-center gap-2 text-sm text-[var(--color-gray-300)]">
            <input
              type="checkbox"
              checked={Boolean(boardSchedule.enabled)}
              onChange={async (event) => {
                const next = {
                  ...settings,
                  boardExportSchedule: { ...boardSchedule, enabled: event.target.checked },
                };
                await putDashboardJson("/tenant/settings", { settings: next });
                onSettingsChange(next);
              }}
            />
            Email board pack on schedule
          </label>
        </Card>
      ) : null}

      {canAdmin && bffMode ? (
        <>
          <WorkspaceSettingsPanel
            tenantName={tenantName}
            tier={tier}
            timezone={String(bundle?.settings?.timezone ?? "UTC")}
            canInvite={canInvite}
            onMessage={onMessage}
          />
          <div data-tour="settings-team">
          <TeamSettingsPanel
            role={sessionRole}
            canInvite={canInvite}
            tier={tier}
            maxTeamInvites={3}
          />
          </div>
          <MsspPortfolioSettings canAdmin={canAdmin} />
          <Card tone="panel">
            <Eyebrow>Enterprise SSO</Eyebrow>
            <button
              type="button"
              className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
              onClick={async () => {
                try {
                  const payload = await postDashboardJson<{ portalUrl: string }>("/tenant/sso/portal-link", {
                    returnUrl: `${window.location.origin}/dashboard`,
                  });
                  setSsoPortalUrl(payload.portalUrl);
                  window.open(payload.portalUrl, "_blank", "noopener,noreferrer");
                } catch (exc) {
                  onMessage(exc instanceof Error ? exc.message : "SSO portal unavailable.");
                }
              }}
            >
              Configure SSO
            </button>
            {ssoPortalUrl ? <p className="mt-2 text-xs text-[var(--color-gray-500)]">Portal opened.</p> : null}
          </Card>
          <Card tone="panel">
            <Eyebrow>Audit log</Eyebrow>
            <div className="mt-4">
              <AuditLogPanel apiKey={savedKey} bffMode={bffMode} />
            </div>
          </Card>
        </>
      ) : null}

      <DashboardAdvancedKeyPanel
        apiKey={apiKey}
        loading={loading}
        hidden={bffMode}
        onChange={onApiKeyChange}
        onConnect={onConnect}
      />

      <DashboardWidgetPreferences
        layout={settings.dashboardLayout as { pinned?: string[]; hidden?: string[] } | undefined}
        onSave={async (pinned, hidden) => {
          const nextSettings = {
            ...settings,
            dashboardLayout: { pinned, hidden, persona },
          };
          await putDashboardJson("/tenant/settings", { settings: nextSettings });
          onSettingsChange(nextSettings);
        }}
      />
    </DashboardSection>
  );
}
