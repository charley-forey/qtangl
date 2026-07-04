"use client";

import { useState } from "react";

import { pauseDemoCampaign, playDemoCampaign, saveDemoCampaign } from "@/lib/demo";

export default function CampaignScrubber({
  onRefresh,
}: {
  onRefresh: () => void | Promise<void>;
}) {
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function recordSampleCampaign() {
    setBusy(true);
    setMessage(null);
    try {
      const response = (await saveDemoCampaign("Live range sample", [
        { offsetSec: 0, action: "scene", sceneId: "downgrade-attack" },
        { offsetSec: 8, action: "scene", sceneId: "cert-expiry-crisis" },
        { offsetSec: 16, action: "scene", sceneId: "rollout-pqc-fleet" },
      ])) as { campaign?: { id?: string } };
      const id = response.campaign?.id || null;
      setCampaignId(id);
      setMessage(id ? `Saved campaign ${id}` : "Campaign saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save campaign.");
    } finally {
      setBusy(false);
    }
  }

  async function play() {
    if (!campaignId) return;
    setBusy(true);
    try {
      await playDemoCampaign(campaignId);
      setMessage(`Playing ${campaignId}`);
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function pause() {
    if (!campaignId) return;
    setBusy(true);
    try {
      await pauseDemoCampaign(campaignId);
      setMessage(`Paused ${campaignId}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/20 p-4">
      <p className="text-sm font-semibold text-white">Campaign recorder</p>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        Save a scripted scene sequence, then play or pause it for repeatable recordings.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void recordSampleCampaign()}
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50"
        >
          Save sample campaign
        </button>
        <button
          type="button"
          disabled={busy || !campaignId}
          onClick={() => void play()}
          className="rounded-full border border-cyan-400/30 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-50"
        >
          Play
        </button>
        <button
          type="button"
          disabled={busy || !campaignId}
          onClick={() => void pause()}
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50"
        >
          Pause
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-[var(--color-gray-400)]">{message}</p> : null}
    </div>
  );
}
