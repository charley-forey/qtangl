"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchTenantJson } from "@/lib/tenant-api";

export default function AssessAiBriefCard({ apiKey, scanId }: { apiKey?: string; scanId?: string }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const payload = await fetchTenantJson<{ explanation?: string; summary?: string }>(
          scanId ? "/tenant/ai/explain-scan" : "/tenant/ai/explain-portfolio",
          apiKey!,
          {
            method: "POST",
            body: JSON.stringify(scanId ? { scanId, persona: "executive" } : { persona: "executive" }),
          }
        );
        if (!cancelled) setText(payload.explanation ?? payload.summary ?? null);
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
  }, [apiKey, scanId]);

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>AI executive brief</Eyebrow>
      {loading ? (
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">Generating narrative…</p>
      ) : text ? (
        <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">{text}</p>
      ) : (
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">
          Run a baseline scan to unlock AI-generated board talking points.
        </p>
      )}
    </Card>
  );
}
