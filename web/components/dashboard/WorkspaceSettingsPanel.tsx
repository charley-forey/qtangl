"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { patchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";

type Props = {
  tenantName?: string;
  tier?: string;
  canInvite?: boolean;
  onRenamed?: (name: string) => void;
  onMessage?: (message: string) => void;
};

export default function WorkspaceSettingsPanel({
  tenantName = "",
  tier = "free",
  canInvite = false,
  onRenamed,
  onMessage,
}: Props) {
  const [name, setName] = useState(tenantName);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    setName(tenantName);
  }, [tenantName]);

  const tierLabel = tier === "free" ? "Assess (Free)" : tier === "monitor" ? "Monitor" : tier;

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Workspace</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Company name and plan for this tenant workspace.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
            Company name
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              className="min-w-[12rem] flex-1 rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Security"
            />
            <button
              type="button"
              disabled={saving || !name.trim() || name.trim() === tenantName}
              className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black disabled:opacity-40"
              onClick={async () => {
                setSaving(true);
                try {
                  const payload = await patchDashboardJson<{ tenantName: string }>("/tenant/workspace", {
                    name: name.trim(),
                  });
                  onRenamed?.(payload.tenantName);
                  onMessage?.("Workspace name updated.");
                } catch (exc) {
                  onMessage?.(exc instanceof Error ? exc.message : "Unable to update workspace name.");
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Plan</p>
          <p className="mt-1 text-sm text-white">{tierLabel}</p>
          {!canInvite && tier === "free" ? (
            <p className="mt-2 text-sm text-[var(--color-gray-400)]">
              Upgrade to <strong className="text-white">Monitor</strong> to invite teammates and unlock team
              management.
            </p>
          ) : null}
          {tier === "free" ? (
            <button
              type="button"
              disabled={portalLoading}
              className="mt-3 rounded-full border border-[var(--border-strong)] px-4 py-2 text-xs text-white hover:bg-white/5 disabled:opacity-50"
              onClick={async () => {
                setPortalLoading(true);
                try {
                  const payload = await postDashboardJson<{ portalUrl?: string }>("/tenant/billing/portal", {
                    returnUrl: `${window.location.origin}/dashboard?tab=settings`,
                  });
                  if (payload.portalUrl) {
                    window.open(payload.portalUrl, "_blank", "noopener,noreferrer");
                  } else {
                    onMessage?.("Billing portal unavailable — contact Qtangl support.");
                  }
                } catch (exc) {
                  onMessage?.(exc instanceof Error ? exc.message : "Billing portal unavailable.");
                } finally {
                  setPortalLoading(false);
                }
              }}
            >
              Upgrade plan
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
