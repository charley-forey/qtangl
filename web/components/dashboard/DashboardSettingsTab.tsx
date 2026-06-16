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
const ApiKeysPanel = dynamic(() => import("@/components/dashboard/ApiKeysPanel"));

type Props = {
  bundle: SettingsTabBundle | null;
  savedKey: string;
  bffMode: boolean;
  canAdmin: boolean;
  canManageKeys: boolean;
  sessionRole: string;
  persona: DashboardPersona;
  apiKey: string;
  loading: boolean;
  onMessage: (message: string) => void;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  onApiKeyChange: (key: string) => void;
  onConnect: () => void;
};

export default function DashboardSettingsTab({
  bundle,
  savedKey,
  bffMode,
  canAdmin,
  canManageKeys,
  sessionRole,
  persona,
  apiKey,
  loading,
  onMessage,
  onSettingsChange,
  onApiKeyChange,
  onConnect,
}: Props) {
  const settings = bundle?.settings ?? {};
  const [ssoPortalUrl, setSsoPortalUrl] = useState<string | null>(null);
  const boardSchedule = (settings.boardExportSchedule as Record<string, unknown>) ?? {};

  return (
    <DashboardSection title="Settings" id="dashboard-settings">
      {canManageKeys && bffMode ? <ApiKeysPanel role={sessionRole} /> : null}

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
          <TeamSettingsPanel role={sessionRole} />
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
              <AuditLogPanel apiKey={savedKey} />
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
