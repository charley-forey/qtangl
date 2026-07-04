"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { configurePushBriefing, sendPushBriefingNow } from "@/lib/qros-api";

const CHANNELS = ["email", "slack", "teams"];

export default function PushEverywherePanel() {
  const [selected, setSelected] = useState<string[]>(["email"]);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (channel: string) => {
    setSelected((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));
  };

  const save = async () => {
    setLoading(true);
    try {
      await configurePushBriefing(selected, 24);
      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  const sendNow = async () => {
    setLoading(true);
    try {
      const result = await sendPushBriefingNow(selected);
      setSent(result.delivery?.delivered ?? 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Push everywhere</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        Deliver the adaptive morning briefing via email, Slack, or Teams webhooks.
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Delivery channels">
        {CHANNELS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={selected.includes(c)}
            onClick={() => toggle(c)}
            className={[
              "rounded-full px-3 py-1 text-xs capitalize",
              selected.includes(c)
                ? "bg-white text-black"
                : "border border-[var(--border-subtle)] text-[var(--color-gray-300)]",
            ].join(" ")}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={loading} onClick={() => void save()}>
          Save preferences
        </Button>
        <Button type="button" disabled={loading} onClick={() => void sendNow()}>
          Send briefing now
        </Button>
      </div>
      {saved ? <p className="mt-2 text-xs text-emerald-300">Briefing delivery configured.</p> : null}
      {sent != null ? (
        <p className="mt-2 text-xs text-sky-200">
          {sent > 0 ? `Delivered to ${sent} webhook(s).` : "No webhooks configured — add one in Settings."}
        </p>
      ) : null}
      {sent === 0 ? (
        <EmptyState
          title="No webhooks"
          description="Configure a Slack or generic webhook in Settings → Integrations to receive briefings."
        />
      ) : null}
    </Card>
  );
}
