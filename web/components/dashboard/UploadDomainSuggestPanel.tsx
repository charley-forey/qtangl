"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { addAuthorizedDomainsMany } from "@/lib/authorized-domains";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";
import { useBatchLiveScan } from "@/hooks/useBatchLiveScan";

type Props = {
  discoveredHosts?: string[];
  suggestedDomains: string[];
  alreadyAuthorized?: string[];
  authorizedDomains?: string[];
  industry?: string;
  canAdmin?: boolean;
  useBff?: boolean;
  apiKey?: string;
  onMessage?: (message: string) => void;
  onDomainsChange?: (domains: string[]) => void;
  onOpenUpgrade?: (product: UpgradeProduct) => void;
  onRefresh?: () => void;
};

const DEFAULT_ATTESTATION =
  "I am authorized to scan these domains on behalf of my organization.";

export default function UploadDomainSuggestPanel({
  discoveredHosts = [],
  suggestedDomains,
  alreadyAuthorized = [],
  authorizedDomains = [],
  industry = "financial",
  canAdmin = false,
  useBff = true,
  apiKey,
  onMessage,
  onDomainsChange,
  onOpenUpgrade,
  onRefresh,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(suggestedDomains));
  const [attestation, setAttestation] = useState(DEFAULT_ATTESTATION);
  const [saving, setSaving] = useState(false);
  const { running, progressLabel, runBatch } = useBatchLiveScan({
    industry,
    useBff,
    apiKey,
    onMessage,
    onRefresh,
    onOpenUpgrade,
  });

  const hosts = discoveredHosts.length
    ? discoveredHosts
    : [...new Set([...suggestedDomains, ...alreadyAuthorized])];

  const selectedList = useMemo(() => [...selected], [selected]);

  const authorizedSet = useMemo(() => new Set(authorizedDomains), [authorizedDomains]);

  const liveReadySelected = useMemo(
    () => selectedList.filter((domain) => authorizedSet.has(domain)),
    [authorizedSet, selectedList]
  );

  const liveReadyAll = useMemo(
    () => hosts.filter((domain) => authorizedSet.has(domain)),
    [authorizedSet, hosts]
  );

  useEffect(() => {
    setSelected(new Set(suggestedDomains.length ? suggestedDomains : hosts));
  }, [hosts, suggestedDomains]);

  if (!hosts.length) {
    return null;
  }

  function toggleDomain(domain: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  async function authorizeSelected() {
    const toAuthorize = selectedList.filter((domain) => !authorizedSet.has(domain));
    if (toAuthorize.length === 0) {
      onMessage?.("Selected domains are already authorized.");
      return;
    }
    if (attestation.trim().length < 10) {
      onMessage?.("Add an attestation confirming you are authorized to scan these domains.");
      return;
    }
    setSaving(true);
    try {
      const next = await addAuthorizedDomainsMany(toAuthorize, attestation.trim(), { useBff, apiKey });
      onDomainsChange?.(next);
      onMessage?.(`Authorized ${toAuthorize.length} domain(s) from upload.`);
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Unable to authorize domains.");
    } finally {
      setSaving(false);
    }
  }

  async function authorizeAndScanLive() {
    const toAuthorize = selectedList.filter((domain) => !authorizedSet.has(domain));
    if (toAuthorize.length > 0) {
      if (attestation.trim().length < 10) {
        onMessage?.("Add an attestation confirming you are authorized to scan these domains.");
        return;
      }
      setSaving(true);
      try {
        const next = await addAuthorizedDomainsMany(toAuthorize, attestation.trim(), { useBff, apiKey });
        onDomainsChange?.(next);
      } catch (error) {
        onMessage?.(error instanceof Error ? error.message : "Unable to authorize domains.");
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    if (selectedList.length === 0) {
      onMessage?.("Select at least one domain.");
      return;
    }
    await runBatch(selectedList);
  }

  async function scanAuthorizedLive() {
    const targets = liveReadySelected.length ? liveReadySelected : liveReadyAll;
    if (!targets.length) {
      onMessage?.("Authorize domains first, then run live scans.");
      return;
    }
    await runBatch(targets);
  }

  return (
    <Card tone="ghost" className="border border-sky-500/30 bg-sky-500/5">
      <Eyebrow>Domains discovered in upload</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Hostnames extracted from your certificate bundle. Authorize for live TLS scanning, run live baselines
        across selected domains, or continue with the offline bundle scan only.
      </p>

      {alreadyAuthorized.length > 0 ? (
        <p className="mt-3 text-xs text-emerald-200">Already authorized: {alreadyAuthorized.join(", ")}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {hosts.map((domain) => {
          const isAuthorized = authorizedSet.has(domain);
          return (
            <label
              key={domain}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                selected.has(domain)
                  ? "border-white bg-white text-black"
                  : "border-[var(--border-subtle)] text-white"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(domain)}
                onChange={() => toggleDomain(domain)}
                className="sr-only"
              />
              {domain}
              {isAuthorized ? <span className="opacity-70">· authorized</span> : null}
            </label>
          );
        })}
      </div>

      {canAdmin ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={attestation}
            onChange={(event) => setAttestation(event.target.value)}
            rows={2}
            placeholder={DEFAULT_ATTESTATION}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={saving || running} onClick={() => void authorizeSelected()}>
              {saving ? "Saving…" : `Authorize selected (${selectedList.filter((d) => !authorizedSet.has(d)).length})`}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={saving || running || selectedList.length === 0}
              onClick={() => void authorizeAndScanLive()}
            >
              {running ? "Scanning…" : "Authorize & scan live"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={running || liveReadyAll.length === 0}
              onClick={() => void scanAuthorizedLive()}
            >
              Scan authorized live ({liveReadySelected.length || liveReadyAll.length})
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-amber-200">Ask a workspace admin to authorize or scan these domains.</p>
      )}

      {progressLabel ? <p className="mt-3 text-xs text-sky-200">{progressLabel}</p> : null}
    </Card>
  );
}
