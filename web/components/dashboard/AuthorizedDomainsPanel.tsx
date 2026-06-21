"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";

type Props = {
  canAdmin?: boolean;
  onMessage?: (message: string) => void;
};

export default function AuthorizedDomainsPanel({ canAdmin = false, onMessage }: Props) {
  const [domains, setDomains] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [attestation, setAttestation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDomains = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchDashboardJson<{ domains?: string[] }>("/tenant/authorized-domains");
      const next = payload.domains ?? [];
      setDomains(next);
      setDraft(next.join("\n"));
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Unable to load authorized domains.");
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    void loadDomains();
  }, [loadDomains]);

  async function saveDomains() {
    const parsed = draft
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (attestation.trim().length < 10) {
      onMessage?.("Add an attestation confirming you are authorized to scan these domains.");
      return;
    }
    setSaving(true);
    try {
      const payload = await postDashboardJson<{ domains?: string[] }>("/tenant/authorized-domains", {
        domains: parsed,
        attestation: attestation.trim(),
      });
      setDomains(payload.domains ?? parsed);
      onMessage?.("Authorized domains updated.");
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Unable to save authorized domains.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Authorized scan domains</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Domains your organization has attested for production scanning.
      </p>
      {loading ? (
        <p className="mt-3 text-xs text-[var(--color-gray-500)]">Loading…</p>
      ) : (
        <>
          {domains.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {domains.map((domain) => (
                <li
                  key={domain}
                  className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-white"
                >
                  {domain}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-amber-200">No authorized domains configured yet.</p>
          )}
          {canAdmin ? (
            <div className="mt-4 space-y-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                placeholder="example.com&#10;api.example.com"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
              />
              <textarea
                value={attestation}
                onChange={(e) => setAttestation(e.target.value)}
                rows={3}
                placeholder="I am authorized to scan these domains on behalf of my organization."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
              />
              <Button type="button" size="sm" disabled={saving} onClick={() => void saveDomains()}>
                {saving ? "Saving…" : "Save authorized domains"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}
