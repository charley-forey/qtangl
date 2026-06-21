"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import OpsShell from "@/components/ops/OpsShell";
import { formatUtcDateTime } from "@/lib/format";

type TenantDetail = {
  tenantId: string;
  name: string;
  authMode?: string;
  createdAt?: string;
  subscription?: { tier?: string };
  billing?: Record<string, unknown>;
  settings?: { scanAllowlist?: string[]; orgType?: string; msspParentTenantId?: string };
  memberships?: Array<{ email: string; role: string; lastLoginAt?: string | null }>;
  pendingInvites?: Array<{ email: string; role: string }>;
  apiKeys?: Array<{ keyId: string; label: string; keyPrefix?: string; revoked?: boolean; lastUsedAt?: string | null; scansThisMonth?: number }>;
  recentScans?: Array<{ scanId: string; status: string; readinessScore?: number | null; createdAt?: string }>;
  scansThisMonth?: number;
  scheduleCount?: number;
};

export default function OpsTenantDetailClient({ tenantId }: { tenantId: string }) {
  const [detail, setDetail] = useState<TenantDetail | null>(null);
  const [tier, setTier] = useState("monitor");
  const [domainsDraft, setDomainsDraft] = useState("");
  const [keyLabel, setKeyLabel] = useState("automation");
  const [msspParentId, setMsspParentId] = useState("");
  const [settingsJson, setSettingsJson] = useState("{}");
  const [message, setMessage] = useState<string | null>(null);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/ops/tenants/${encodeURIComponent(tenantId)}`);
    if (!response.ok) {
      setError("Tenant not found.");
      return;
    }
    const payload = (await response.json()) as TenantDetail;
    setDetail(payload);
    setTier(String(payload.subscription?.tier ?? "monitor"));
    setDomainsDraft((payload.settings?.scanAllowlist ?? []).join("\n"));
    setMsspParentId(String(payload.settings?.msspParentTenantId ?? ""));
    setSettingsJson(JSON.stringify({ orgType: payload.settings?.orgType ?? undefined }, null, 2));
    setError(null);
  }, [tenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveTier() {
    const response = await fetch(`/api/ops/tenants/${encodeURIComponent(tenantId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    setMessage(response.ok ? "Tier updated." : "Tier update failed.");
    if (response.ok) void load();
  }

  async function saveDomains() {
    const domains = domainsDraft
      .split(/[\n,]+/)
      .map((d) => d.trim())
      .filter(Boolean);
    const response = await fetch(`/api/ops/tenants/${encodeURIComponent(tenantId)}/authorized-domains`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domains, attestation: "Ops console update" }),
    });
    setMessage(response.ok ? "Domains updated." : "Domain update failed.");
    if (response.ok) void load();
  }

  async function saveMsspParent() {
    if (!msspParentId.trim()) {
      setMessage("Parent tenant ID is required.");
      return;
    }
    const response = await fetch(`/api/ops/tenants/${encodeURIComponent(tenantId)}/mssp-parent`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentTenantId: msspParentId.trim() }),
    });
    setMessage(response.ok ? "MSSP parent linked." : "MSSP link failed.");
    if (response.ok) void load();
  }

  async function saveSettingsMerge() {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(settingsJson) as Record<string, unknown>;
    } catch {
      setMessage("Settings must be valid JSON.");
      return;
    }
    const response = await fetch(`/api/ops/tenants/${encodeURIComponent(tenantId)}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: parsed }),
    });
    setMessage(response.ok ? "Settings merged." : "Settings update failed.");
    if (response.ok) void load();
  }

  async function issueKey() {
    const response = await fetch(`/api/ops/tenants/${encodeURIComponent(tenantId)}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: keyLabel }),
    });
    const payload = await response.json();
    if (response.ok) {
      setIssuedKey(String(payload.apiKey ?? ""));
      setMessage("Key issued.");
      void load();
    } else {
      setMessage("Key issue failed.");
    }
  }

  async function revokeKey(keyId: string) {
    if (!window.confirm("Revoke this API key?")) return;
    const response = await fetch(`/api/ops/keys/${encodeURIComponent(keyId)}`, { method: "DELETE" });
    setMessage(response.ok ? "Key revoked." : "Revoke failed.");
    if (response.ok) void load();
  }

  if (error) {
    return (
      <OpsShell title="Tenant" subtitle={tenantId}>
        <p className="text-sm text-red-300">{error}</p>
      </OpsShell>
    );
  }

  if (!detail) {
    return (
      <OpsShell title="Tenant" subtitle={tenantId}>
        <p className="text-sm text-[var(--color-gray-500)]">Loading…</p>
      </OpsShell>
    );
  }

  return (
    <OpsShell title={detail.name} subtitle={detail.tenantId}>
      {message ? <p className="text-sm text-[var(--color-gray-400)]">{message}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card tone="panel">
          <Eyebrow>Subscription</Eyebrow>
          <p className="mt-2 text-sm">Tier: {detail.subscription?.tier ?? "—"}</p>
          <p className="text-sm">Scans this month: {detail.scansThisMonth ?? 0}</p>
          <p className="text-sm">Schedules: {detail.scheduleCount ?? 0}</p>
          <div className="mt-3 flex gap-2">
            <select
              className="rounded border border-[var(--border-subtle)] bg-transparent px-2 py-1 text-sm text-white"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            >
              <option value="free">free</option>
              <option value="monitor">monitor</option>
              <option value="convert">convert</option>
              <option value="enterprise">enterprise</option>
            </select>
            <Button type="button" size="sm" onClick={() => void saveTier()}>
              Update tier
            </Button>
          </div>
        </Card>

        <Card tone="panel">
          <Eyebrow>Authorized domains</Eyebrow>
          <textarea
            className="mt-2 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
            rows={4}
            value={domainsDraft}
            onChange={(e) => setDomainsDraft(e.target.value)}
          />
          <Button type="button" size="sm" className="mt-3" onClick={() => void saveDomains()}>
            Save domains
          </Button>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card tone="panel">
          <Eyebrow>MSSP portfolio parent</Eyebrow>
          <p className="mt-2 text-xs text-[var(--color-gray-500)]">
            Link this tenant as a child under an enterprise/MSSP parent for portfolio views.
          </p>
          <input
            className="mt-3 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
            value={msspParentId}
            onChange={(e) => setMsspParentId(e.target.value)}
            placeholder="parent-tenant-id"
          />
          <Button type="button" size="sm" className="mt-3" onClick={() => void saveMsspParent()}>
            Link parent tenant
          </Button>
        </Card>

        <Card tone="panel">
          <Eyebrow>Settings merge</Eyebrow>
          <p className="mt-2 text-xs text-[var(--color-gray-500)]">
            Merge tenant settings JSON (e.g. orgType, salesLed, remediationProgramEnabled).
          </p>
          <textarea
            className="mt-3 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 font-mono text-xs text-white"
            rows={6}
            value={settingsJson}
            onChange={(e) => setSettingsJson(e.target.value)}
          />
          <Button type="button" size="sm" className="mt-3" onClick={() => void saveSettingsMerge()}>
            Merge settings
          </Button>
        </Card>
      </div>

      <Card tone="panel">
        <Eyebrow>Members</Eyebrow>
        <ul className="mt-3 space-y-2 text-sm">
          {(detail.memberships ?? []).map((member) => (
            <li key={member.email} className="flex justify-between gap-2">
              <span>
                {member.email} · {member.role}
              </span>
              <span className="text-xs text-[var(--color-gray-500)]">
                {member.lastLoginAt ? formatUtcDateTime(member.lastLoginAt) : "—"}
              </span>
            </li>
          ))}
          {(detail.pendingInvites ?? []).map((invite) => (
            <li key={invite.email} className="text-amber-200">
              {invite.email} · invite pending ({invite.role})
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="panel">
        <Eyebrow>API keys</Eyebrow>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
            value={keyLabel}
            onChange={(e) => setKeyLabel(e.target.value)}
            placeholder="Label"
          />
          <Button type="button" size="sm" onClick={() => void issueKey()}>
            Issue key
          </Button>
        </div>
        {issuedKey ? (
          <p className="mt-2 break-all text-xs text-amber-200">
            New key: <code>{issuedKey}</code>
          </p>
        ) : null}
        <ul className="mt-4 space-y-2 text-sm">
          {(detail.apiKeys ?? []).map((key) => (
            <li key={key.keyId} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                {key.label} · {key.keyPrefix}
                {key.revoked ? " (revoked)" : ""}
                {typeof key.scansThisMonth === "number" ? ` · ${key.scansThisMonth} scans/mo` : ""}
              </span>
              {!key.revoked ? (
                <button type="button" className="text-xs underline" onClick={() => void revokeKey(key.keyId)}>
                  Revoke
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="panel">
        <Eyebrow>Recent scans</Eyebrow>
        <ul className="mt-3 space-y-2 text-sm">
          {(detail.recentScans ?? []).map((scan) => (
            <li key={scan.scanId} className="flex justify-between gap-2 font-mono text-xs">
              <span>{scan.scanId}</span>
              <span>
                {scan.status}
                {scan.readinessScore != null ? ` · ${scan.readinessScore}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </OpsShell>
  );
}
