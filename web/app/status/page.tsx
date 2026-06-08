"use client";

import { useEffect, useState } from "react";

import { qtanglApiBaseUrl } from "@/lib/api";

export default function StatusPage() {
  const [health, setHealth] = useState<string>("loading");
  const [ready, setReady] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [h, r] = await Promise.all([
          fetch(`${qtanglApiBaseUrl}/health`),
          fetch(`${qtanglApiBaseUrl}/health/ready`),
        ]);
        const hp = (await h.json()) as { status?: string };
        setHealth(hp.status ?? "unknown");
        setReady((await r.json()) as Record<string, unknown>);
      } catch {
        setHealth("unreachable");
      }
    }
    void load();
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-white">
      <h1 className="text-2xl font-semibold">Qtangl Status</h1>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">Evidence endpoints and platform health</p>
      <dl className="mt-8 space-y-4">
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">API</dt>
          <dd className="text-lg capitalize">{health}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Readiness</dt>
          <dd className="text-lg capitalize">{String(ready?.status ?? "—")}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Database</dt>
          <dd>{ready?.database === true ? "OK" : "Degraded"}</dd>
        </div>
      </dl>
    </main>
  );
}
