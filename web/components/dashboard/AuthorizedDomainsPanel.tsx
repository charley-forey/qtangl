"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson, patchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";
import { DEFAULT_ATTESTATION } from "@/lib/copy/baseline";

type Props = {
  canAdmin?: boolean;
  compact?: boolean;
  scanAuthorizationRecorded?: boolean;
  onMessage?: (message: string) => void;
  onDomainsChange?: (domains: string[]) => void;
};

export default function AuthorizedDomainsPanel({
  canAdmin = false,
  compact = false,
  scanAuthorizationRecorded = false,
  onMessage,
  onDomainsChange,
}: Props) {
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [attested, setAttested] = useState(scanAuthorizationRecorded);
  const [bulkDraft, setBulkDraft] = useState("");
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const onDomainsChangeRef = useRef(onDomainsChange);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onDomainsChangeRef.current = onDomainsChange;
  }, [onDomainsChange]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (scanAuthorizationRecorded) {
      setAttested(true);
    }
  }, [scanAuthorizationRecorded]);

  const applyDomains = useCallback((next: string[]) => {
    setDomains(next);
    onDomainsChangeRef.current?.(next);
  }, []);

  const loadDomains = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchDashboardJson<{ domains?: string[] }>("/tenant/authorized-domains");
      const next = payload.domains ?? [];
      applyDomains(next);
      setBulkDraft(next.join("\n"));
    } catch (error) {
      onMessageRef.current?.(
        error instanceof Error ? error.message : "Unable to load authorized domains."
      );
      applyDomains([]);
    } finally {
      setLoading(false);
    }
  }, [applyDomains]);

  useEffect(() => {
    void loadDomains();
  }, [loadDomains]);

  async function addDomain() {
    const domain = newDomain.trim();
    if (!domain) {
      onMessage?.("Enter a domain to authorize.");
      return;
    }
    if (!attested) {
      onMessage?.("Confirm you are authorized to scan domains for your organization.");
      return;
    }
    setSaving(true);
    try {
      const payload = await patchDashboardJson<{ domains?: string[] }>("/tenant/authorized-domains", {
        action: "add",
        domain,
        attestation: DEFAULT_ATTESTATION,
      });
      const next = payload.domains ?? [...domains, domain];
      applyDomains(next);
      setBulkDraft(next.join("\n"));
      setNewDomain("");
      onMessage?.(`Added ${domain}.`);
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Unable to add domain.");
    } finally {
      setSaving(false);
    }
  }

  async function removeDomain(domain: string) {
    setSaving(true);
    try {
      const payload = await patchDashboardJson<{ domains?: string[] }>("/tenant/authorized-domains", {
        action: "remove",
        domain,
      });
      const next = payload.domains ?? domains.filter((item) => item !== domain);
      applyDomains(next);
      setBulkDraft(next.join("\n"));
      onMessage?.(`Removed ${domain}.`);
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Unable to remove domain.");
    } finally {
      setSaving(false);
    }
  }

  async function saveBulkDomains() {
    const parsed = bulkDraft
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (!attested) {
      onMessage?.("Confirm you are authorized to scan domains for your organization.");
      return;
    }
    setSaving(true);
    try {
      const payload = await postDashboardJson<{ domains?: string[] }>("/tenant/authorized-domains", {
        domains: parsed,
        attestation: DEFAULT_ATTESTATION,
      });
      const next = payload.domains ?? parsed;
      applyDomains(next);
      setBulkDraft(next.join("\n"));
      setShowBulkEdit(false);
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
        {compact
          ? "Domains approved for live production scanning. Add domains here — batch scans use this list."
          : "Add domains as you discover endpoints. Each baseline scan targets one authorized domain."}
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
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-white"
                >
                  <span>{domain}</span>
                  {canAdmin ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void removeDomain(domain)}
                      className="text-[var(--color-gray-400)] hover:text-white disabled:opacity-50"
                      aria-label={`Remove ${domain}`}
                    >
                      ×
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-amber-200">No authorized domains configured yet.</p>
          )}

          {canAdmin ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="api.example.com"
                  className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void addDomain();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={saving || !attested}
                  onClick={() => void addDomain()}
                >
                  {saving ? "Saving…" : "Add domain"}
                </Button>
              </div>
              {!scanAuthorizationRecorded ? (
                <label className="flex items-start gap-2 text-xs text-[var(--color-gray-300)]">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={attested}
                    onChange={(event) => setAttested(event.target.checked)}
                  />
                  <span>
                    I am authorized to scan domains added to this workspace on behalf of my organization.
                    <span className="text-[var(--color-gray-500)]"> *</span>
                  </span>
                </label>
              ) : null}
              <p className="text-[10px] text-[var(--color-gray-600)]">
                * Required to add domains. By using this service you agree to our{" "}
                <Link href="/terms" className="underline hover:text-white">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-white">
                  Privacy Policy
                </Link>
                .
              </p>
              <button
                type="button"
                className="text-xs text-[var(--color-gray-500)] underline"
                onClick={() => setShowBulkEdit((value) => !value)}
              >
                {showBulkEdit ? "Hide bulk edit" : "Bulk edit all domains"}
              </button>
              {showBulkEdit ? (
                <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] p-3">
                  <textarea
                    value={bulkDraft}
                    onChange={(e) => setBulkDraft(e.target.value)}
                    rows={4}
                    placeholder="example.com&#10;api.example.com"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={saving || !attested}
                    onClick={() => void saveBulkDomains()}
                  >
                    {saving ? "Saving…" : "Replace full list"}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}
