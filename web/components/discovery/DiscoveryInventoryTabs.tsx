"use client";

import { useCallback, useEffect, useState } from "react";

import AgentFleetTable from "@/components/discovery/AgentFleetTable";
import CmdbCoverageWidget from "@/components/discovery/CmdbCoverageWidget";
import CodeScanPanel from "@/components/discovery/CodeScanPanel";
import FleetEnrollmentPanel from "@/components/discovery/FleetEnrollmentPanel";
import HostInventoryHeatmap from "@/components/discovery/HostInventoryHeatmap";
import ImageScanPanel from "@/components/discovery/ImageScanPanel";
import OfflineUploadPanel from "@/components/discovery/OfflineUploadPanel";
import { getDiscoverySummary, listAgents } from "@/lib/discovery";

type Tab = "external" | "hosts" | "code" | "images";

type DiscoveryInventoryTabsProps = {
  apiKey: string;
  externalCount?: number;
};

export default function DiscoveryInventoryTabs({ apiKey, externalCount = 0 }: DiscoveryInventoryTabsProps) {
  const [tab, setTab] = useState<Tab>("hosts");
  const [counts, setCounts] = useState({ external: externalCount, hosts: 0, code: 0, images: 0 });
  const [agents, setAgents] = useState<
    { agentId: string; hostname: string; findingsCount: number; status: string }[]
  >([]);
  const [selectedHost, setSelectedHost] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [summary, agentRes] = await Promise.all([getDiscoverySummary(apiKey), listAgents(apiKey)]);
      const c = summary.counts ?? {};
      setCounts({
        external: externalCount || c.external || 0,
        hosts: c.hosts ?? c.hostFindings ?? 0,
        code: c.code ?? 0,
        images: c.images ?? 0,
      });
      setAgents(agentRes.agents ?? []);
    } catch {
      setAgents([]);
    }
  }, [apiKey, externalCount]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "external", label: "External", count: counts.external },
    { id: "hosts", label: "Hosts", count: counts.hosts },
    { id: "code", label: "Code", count: counts.code },
    { id: "images", label: "Images", count: counts.images },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-[var(--border)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              tab === t.id ? "border-b-2 border-[var(--accent)] text-[var(--foreground)]" : "text-[var(--muted)]"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-2 rounded-full bg-[var(--accent)]/20 px-1.5 text-xs">{t.count}</span>
            )}
          </button>
        ))}
      </div>
      {tab === "external" && (
        <p className="text-sm text-[var(--muted)]">
          External TLS/JWKS/SSH discovery runs from{" "}
          <a href="/assess" className="text-[var(--accent)] hover:underline">
            Assess
          </a>
          . Aggregate external asset count: <strong>{counts.external || "—"}</strong>
        </p>
      )}
      {tab === "hosts" && (
        <>
          <CmdbCoverageWidget apiKey={apiKey} />
          <FleetEnrollmentPanel apiKey={apiKey} />
          <OfflineUploadPanel apiKey={apiKey} />
          <HostInventoryHeatmap agents={agents} onSelectHost={setSelectedHost} />
          {selectedHost && (
            <p className="text-xs text-[var(--muted)]">
              Selected host <strong>{selectedHost}</strong> —{" "}
              <a href="/assess" className="text-[var(--accent)] hover:underline">
                open remediation in Assess
              </a>
            </p>
          )}
          <AgentFleetTable apiKey={apiKey} />
        </>
      )}
      {tab === "code" && <CodeScanPanel apiKey={apiKey} />}
      {tab === "images" && <ImageScanPanel apiKey={apiKey} />}
    </div>
  );
}
