"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { formatUtcDateTime } from "@/lib/format";
import { useCommandCenterV2 } from "@/hooks/useCommandCenterV2";
import VerifyStatusPill from "@/components/dashboard/ui/VerifyStatusPill";

type VaultSummary = {
  active?: number;
  total?: number;
  objects?: Array<{ scanId: string; retainedUntil?: string | null; createdAt?: string | null }>;
};

type PassportSummary = {
  links?: Array<{ viewCount?: number; scope?: string; createdAt?: string | null }>;
};

type Props = {
  bffMode?: boolean;
  apiKey?: string;
  latestScanId?: string | null;
};

export default function EvidenceFreshnessCard({ bffMode = true, latestScanId }: Props) {
  const ccV2 = useCommandCenterV2();
  const [vault, setVault] = useState<VaultSummary | null>(null);
  const [passports, setPassports] = useState<PassportSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bffMode) return;
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      fetchDashboardJson<VaultSummary>("/tenant/evidence").catch(() => null),
      fetchDashboardJson<PassportSummary>(
        latestScanId
          ? `/tenant/passports?scanId=${encodeURIComponent(latestScanId)}`
          : "/tenant/passports"
      ).catch(() => null),
    ])
      .then(([vaultPayload, passportPayload]) => {
        if (cancelled) return;
        setVault(vaultPayload);
        setPassports(passportPayload);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bffMode, latestScanId]);

  const lastRetain = vault?.objects?.[0];
  const passportViews = (passports?.links ?? []).reduce(
    (sum, link) => sum + Number(link.viewCount ?? 0),
    0
  );
  const verifyStatus = latestScanId ? "Signed bundle available" : "Run a baseline scan first";

  return (
    <Card tone="panel">
      <Eyebrow>Evidence freshness</Eyebrow>
      {loading ? (
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">Loading vault status…</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-gray-300)]">
          <li className="flex justify-between gap-2">
            <span>Vault retention</span>
            <span className="text-white">
              {vault?.active != null ? `${vault.active} active` : "Not loaded"}
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span>Last retain</span>
            <span className="text-right text-[var(--color-gray-400)]">
              {lastRetain?.retainedUntil
                ? formatUtcDateTime(lastRetain.retainedUntil)
                : lastRetain?.createdAt
                  ? formatUtcDateTime(lastRetain.createdAt)
                  : "—"}
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span>Passport views</span>
            <span className="text-white">{passportViews}</span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span>Verify chain</span>
            {ccV2 ? (
              <VerifyStatusPill
                status={latestScanId ? "verified" : "unknown"}
                result={latestScanId ? { verified: true, verifyScanId: latestScanId } : undefined}
              />
            ) : (
              <span className="text-[var(--color-gray-400)]">{verifyStatus}</span>
            )}
          </li>
        </ul>
      )}
    </Card>
  );
}
