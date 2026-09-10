"use client";

import { useCallback, useEffect, useState } from "react";

import AlertFeed from "@/components/demo/AlertFeed";
import ComplianceScorecard from "@/components/demo/ComplianceScorecard";
import DemoHonestyBanner from "@/components/demo/DemoHonestyBanner";
import NarrationTicker from "@/components/demo/NarrationTicker";
import PortfolioRollup from "@/components/demo/PortfolioRollup";
import SeverityCountsDonut from "@/components/demo/SeverityCountsDonut";
import TopologyWall from "@/components/demo/TopologyWall";
import VerifyBadge from "@/components/demo/VerifyBadge";
import ReadinessTrend from "@/components/pqc/ReadinessTrend";
import { useDemoEvents } from "@/lib/demo-events";
import {
  fetchDemoCompliance,
  fetchDemoGraph,
  fetchDemoNarration,
  fetchDemoPortfolio,
  fetchDemoStatus,
  fetchDemoTrend,
  trendToReadinessPoints,
  type DemoGraphResponse,
  type DemoSnapshot,
  type DemoStatusResponse,
} from "@/lib/demo";

export default function LiveStatusWall() {
  const [status, setStatus] = useState<DemoStatusResponse | null>(null);
  const [trend, setTrend] = useState<ReturnType<typeof trendToReadinessPoints>>([]);
  const [graph, setGraph] = useState<DemoGraphResponse | null>(null);
  const [compliance, setCompliance] = useState<Awaited<ReturnType<typeof fetchDemoCompliance>> | null>(null);
  const [portfolio, setPortfolio] = useState<Awaited<ReturnType<typeof fetchDemoPortfolio>> | null>(null);
  const [narration, setNarration] = useState("");
  const [sceneTitle, setSceneTitle] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [refreshError, setRefreshError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [nextStatus, nextTrend, nextGraph, nextCompliance, nextPortfolio, nextNarration] = await Promise.all([
        fetchDemoStatus(),
        fetchDemoTrend(30),
        fetchDemoGraph(),
        fetchDemoCompliance(),
        fetchDemoPortfolio(),
        fetchDemoNarration(),
      ]);
      setStatus(nextStatus);
      setTrend(trendToReadinessPoints(nextTrend.points));
      setGraph(nextGraph);
      setCompliance(nextCompliance);
      setPortfolio(nextPortfolio);
      setNarration(nextNarration.narration);
      setRefreshError(false);
    } catch {
      setRefreshError(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const { connected: sseConnected } = useDemoEvents({
    enabled: true,
    onPoll: refresh,
    onEvent: (event) => {
      if (event.type === "snapshot") {
        void refresh();
      }
      if (event.type === "narration" && event.data?.text) {
        setNarration(String(event.data.text));
      }
      if (event.type === "scene") {
        setSceneTitle(String(event.data?.title || event.data?.sceneId || "Scene applied"));
        window.setTimeout(() => setSceneTitle(null), 4000);
      }
    },
  });

  useEffect(() => {
    setConnected(sseConnected);
  }, [sseConnected]);

  const snapshot: DemoSnapshot | null = status?.latestSnapshot ?? null;

  return (
    <div className="min-h-screen bg-[#05070d] px-4 py-6 text-white lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DemoHonestyBanner />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
              Qtangl Live Crypto Range
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Live status wall</h1>
            <p className="mt-2 text-sm text-[var(--color-gray-400)]">
              Shareable SOC-style view for recordings. Updates via SSE with poll fallback.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--color-gray-400)]">
            <span className={`inline-flex h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`} />
            {connected ? "Live" : "Polling"}
            <a href="/demo/live" className="rounded-full border border-white/10 px-3 py-1.5 hover:bg-white/5">
              Control panel
            </a>
          </div>
        </div>

        {refreshError ? (
          <div role="alert" className="rounded-[var(--radius-lg)] border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm">
            <p>
              Unable to refresh live status. {status ? "Showing the last available data." : "Live data is currently unavailable."}
            </p>
            <button type="button" className="mt-2 underline underline-offset-4" onClick={() => void refresh()}>
              Retry refresh
            </button>
          </div>
        ) : null}

        {sceneTitle ? (
          <div className="rounded-[var(--radius-lg)] border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-3 text-sm">
            Scene: {sceneTitle}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4 lg:col-span-2">
            <p className="text-sm font-semibold">Full report readiness trend</p>
            <div className="mt-3">
              <ReadinessTrend points={trend} showBands forceChart height={240} />
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4">
            <p className="text-sm font-semibold">Full report severity mix</p>
            <p className="mt-1 text-xs text-[var(--color-gray-400)]">
              Includes baseline scenario assets plus enabled demo resources.
            </p>
            <div className="mt-3">
              <SeverityCountsDonut counts={snapshot?.severityCounts ?? {}} />
            </div>
            {snapshot ? (
              <div className="mt-4 text-sm">
                <p className="text-xs text-[var(--color-gray-400)]">Full report readiness</p>
                <p className="text-3xl font-semibold">{snapshot.readinessScore}</p>
                <p className="text-[var(--color-gray-400)]">{snapshot.readinessBand}</p>
              </div>
            ) : null}
          </div>
        </div>

        <NarrationTicker text={narration} />

        <div className="grid gap-4 lg:grid-cols-2">
          <TopologyWall graph={graph} />
          <div className="space-y-4">
            <ComplianceScorecard frameworks={compliance?.frameworks ?? []} />
            <PortfolioRollup
              units={portfolio?.units ?? []}
              overallReadiness={portfolio?.overallReadiness ?? null}
              overallBand={portfolio?.overallBand ?? null}
            />
            <VerifyBadge snapshotId={snapshot?.id} signature={snapshot?.signature} />
          </div>
        </div>

        <AlertFeed alerts={snapshot?.alerts ?? []} chaosEnabled={status?.chaosEnabled} />

        <section className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4">
          <p className="text-sm font-semibold">Per-resource status</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {(snapshot?.perResourceStatus ?? []).map((row) => (
              <div key={String(row.resourceId)} className="rounded-md border border-white/5 bg-white/5 px-3 py-2 text-xs">
                <p className="font-medium text-white">{String(row.label)}</p>
                <p className="text-[var(--color-gray-400)]">
                  {String(row.posture)} · {String(row.status)} · {String(row.severity)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
