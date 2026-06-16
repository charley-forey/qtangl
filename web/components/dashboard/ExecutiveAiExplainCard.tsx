"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson } from "@/lib/dashboard-bff";

export default function ExecutiveAiExplainCard({ scanId }: { scanId: string | null }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const payload = await fetchDashboardJson<{ explanation?: string; summary?: string }>(
          "/tenant/ai/explain",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scanId, topics: ["readiness", "drift", "board"] }),
          }
        );
        if (!cancelled) {
          setText(payload.explanation ?? payload.summary ?? null);
        }
      } catch {
        if (!cancelled) setText(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [scanId]);

  if (!scanId) return null;

  return (
    <Card tone="panel">
      <Eyebrow>AI executive brief</Eyebrow>
      {loading ? (
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">Generating talking points…</p>
      ) : text ? (
        <p className="mt-2 text-sm text-[var(--color-gray-300)]">{text}</p>
      ) : (
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">AI explain unavailable for this scan.</p>
      )}
    </Card>
  );
}
