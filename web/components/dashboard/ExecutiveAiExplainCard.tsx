"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson } from "@/lib/dashboard-bff";

export default function ExecutiveAiExplainCard({ scanId }: { scanId: string | null }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const endpoint = scanId ? "/tenant/ai/explain-scan" : "/tenant/ai/explain-portfolio";
        const body = scanId
          ? { scanId, persona: "executive" }
          : { persona: "executive" };
        const payload = await fetchDashboardJson<{ explanation?: string; summary?: string }>(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
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

  return (
    <Card tone="panel">
      <Eyebrow>{scanId ? "AI executive brief" : "AI portfolio brief"}</Eyebrow>
      {loading ? (
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">Generating talking points…</p>
      ) : text ? (
        <p className="mt-2 text-sm text-[var(--color-gray-300)]">{text}</p>
      ) : (
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">
          {scanId ? "AI explain unavailable for this scan." : "Run a baseline scan to unlock portfolio insights."}
        </p>
      )}
    </Card>
  );
}
