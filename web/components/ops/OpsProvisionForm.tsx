"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type Props = {
  onCreated?: (tenantId: string) => void;
};

export default function OpsProvisionForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [tier, setTier] = useState("monitor");
  const [domains, setDomains] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) {
      setMessage("Tenant name is required.");
      return;
    }
    setBusy(true);
    setMessage(null);
    setIssuedKey(null);
    try {
      const createRes = await fetch("/api/ops/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tenantId: tenantId.trim() || undefined,
          tier,
        }),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.detail ?? created.error ?? "Create failed");

      const id = String(created.tenantId);
      const domainList = domains
        .split(/[\n,]+/)
        .map((d) => d.trim())
        .filter(Boolean);
      if (domainList.length) {
        await fetch(`/api/ops/tenants/${encodeURIComponent(id)}/authorized-domains`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domains: domainList,
            attestation: "Ops console provisioning",
          }),
        });
      }

      const keyRes = await fetch(`/api/ops/tenants/${encodeURIComponent(id)}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "initial" }),
      });
      const keyPayload = await keyRes.json();
      if (keyRes.ok && keyPayload.apiKey) {
        setIssuedKey(String(keyPayload.apiKey));
      }

      setMessage(`Tenant ${id} created.`);
      onCreated?.(id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Provision failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card tone="panel">
      <Eyebrow>Provision tenant</Eyebrow>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-[var(--color-gray-400)]">
          Name
          <input
            className="mt-1 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="text-xs text-[var(--color-gray-400)]">
          Tenant ID (optional)
          <input
            className="mt-1 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="acme-bank"
          />
        </label>
        <label className="text-xs text-[var(--color-gray-400)]">
          Tier
          <select
            className="mt-1 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
          >
            <option value="free">free</option>
            <option value="monitor">monitor</option>
            <option value="convert">convert</option>
            <option value="enterprise">enterprise</option>
          </select>
        </label>
        <label className="text-xs text-[var(--color-gray-400)] sm:col-span-2">
          Authorized domains (optional)
          <textarea
            className="mt-1 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
            rows={3}
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            placeholder="example.com"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" disabled={busy} onClick={() => void submit()}>
          {busy ? "Creating…" : "Create tenant"}
        </Button>
        {message ? <p className="text-xs text-[var(--color-gray-400)]">{message}</p> : null}
      </div>
      {issuedKey ? (
        <p className="mt-3 break-all text-xs text-amber-200">
          Initial API key (copy now): <code>{issuedKey}</code>
        </p>
      ) : null}
    </Card>
  );
}
