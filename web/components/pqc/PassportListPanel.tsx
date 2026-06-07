"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { deleteTenantJson, fetchTenantJson } from "@/lib/tenant-api";

type PassportLink = {
  id: string;
  scanId: string;
  label: string;
  scope: string;
  viewCount: number;
  expiresAt: string | null;
  revokedAt: string | null;
};

export default function PassportListPanel({
  apiKey,
  onMessage,
}: {
  apiKey: string;
  onMessage?: (message: string) => void;
}) {
  const [links, setLinks] = useState<PassportLink[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchTenantJson<{ links: PassportLink[] }>("/tenant/passports", apiKey);
      setLinks(payload.links.filter((link) => !link.revokedAt));
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Failed to load passports.");
    } finally {
      setLoading(false);
    }
  }, [apiKey, onMessage]);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  async function revoke(linkId: string) {
    try {
      await deleteTenantJson(`/tenant/share/${linkId}`, apiKey);
      onMessage?.("Passport link revoked.");
      await loadLinks();
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Revoke failed.");
    }
  }

  if (loading && !links.length) {
    return <p className="text-sm text-[var(--color-gray-400)]">Loading passports…</p>;
  }

  if (!links.length) {
    return (
      <p className="text-sm text-[var(--color-gray-400)]">
        No active passport links. Create one from a scan row.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Eyebrow>Active passports</Eyebrow>
      {links.map((link) => (
        <div
          key={link.id}
          className="rounded-xl border border-[var(--border-subtle)] p-3 text-sm text-[var(--color-gray-300)]"
        >
          <p className="font-medium text-white">{link.label || link.scanId}</p>
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">
            {link.scope} · {link.viewCount} view(s)
            {link.expiresAt ? ` · expires ${new Date(link.expiresAt).toLocaleString()}` : ""}
          </p>
          <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={() => void revoke(link.id)}>
            Revoke
          </Button>
        </div>
      ))}
    </div>
  );
}
