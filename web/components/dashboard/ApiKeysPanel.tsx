"use client";

import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  deleteDashboardJson,
  fetchDashboardJson,
  postDashboardJson,
} from "@/lib/dashboard-bff";

type ApiKeyRow = {
  keyId: string;
  label: string;
  role: string;
  keyPrefix?: string;
  createdAt: string;
  lastUsedAt?: string | null;
  revoked: boolean;
};

export default function ApiKeysPanel({ role }: { role?: string }) {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [label, setLabel] = useState("ci-automation");
  const [keyRole, setKeyRole] = useState("operator");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadKeys = useCallback(async () => {
    const payload = await fetchDashboardJson<{ keys: ApiKeyRow[] }>("/tenant/api-keys");
    setKeys(payload.keys.filter((k) => !k.revoked));
  }, []);

  useEffect(() => {
    if (role === "admin") {
      loadKeys().catch(() => setKeys([]));
    }
  }, [loadKeys, role]);

  if (role !== "admin") {
    return (
      <Card tone="ghost">
        <Eyebrow>API keys</Eyebrow>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">Admin role required to manage automation keys.</p>
      </Card>
    );
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Automation API keys</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        For CI, Terraform, and integrations — not for sharing with teammates. Use sign-in for humans.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
        />
        <select
          className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
          value={keyRole}
          onChange={(e) => setKeyRole(e.target.value)}
        >
          <option value="operator">operator</option>
          <option value="viewer">viewer</option>
          <option value="admin">admin</option>
        </select>
        <button
          type="button"
          disabled={loading}
          className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const payload = await postDashboardJson<{ apiKey: string }>("/tenant/api-keys", {
                label,
                role: keyRole,
              });
              setCreatedSecret(payload.apiKey);
              await loadKeys();
            } catch (exc) {
              setError(exc instanceof Error ? exc.message : "Unable to create key.");
            } finally {
              setLoading(false);
            }
          }}
        >
          Create key
        </button>
      </div>
      {createdSecret ? (
        <div className="mt-4 rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <p className="font-medium text-amber-200">Copy now — shown once</p>
          <code className="mt-2 block break-all text-xs text-white">{createdSecret}</code>
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      <ul className="mt-4 space-y-2 text-sm">
        {keys.map((key) => (
          <li key={key.keyId} className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-2">
            <span>
              {key.label} · {key.role} · {key.keyPrefix ?? "qtangl_…"}
            </span>
            <button
              type="button"
              className="text-xs text-red-300 underline"
              onClick={async () => {
                if (!window.confirm(`Revoke key "${key.label}"?`)) return;
                await deleteDashboardJson(`/tenant/api-keys/${key.keyId}`);
                await loadKeys();
              }}
            >
              Revoke
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
