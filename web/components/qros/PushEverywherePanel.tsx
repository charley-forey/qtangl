"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { configurePushBriefing } from "@/lib/qros-api";

const CHANNELS = ["email", "slack", "teams"];

export default function PushEverywherePanel() {
  const [selected, setSelected] = useState<string[]>(["email"]);
  const [saved, setSaved] = useState(false);
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

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Push everywhere</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        Deliver the adaptive morning briefing via email, Slack, or Teams.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CHANNELS.map((c) => (
          <button
            key={c}
            type="button"
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
      <Button type="button" variant="secondary" className="mt-3" disabled={loading} onClick={() => void save()}>
        Save delivery preferences
      </Button>
      {saved ? <p className="mt-2 text-xs text-emerald-300">Briefing delivery configured.</p> : null}
    </Card>
  );
}
