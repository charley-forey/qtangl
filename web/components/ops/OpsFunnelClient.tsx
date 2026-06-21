"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import OpsShell from "@/components/ops/OpsShell";

export default function OpsFunnelClient() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ops/funnel?days=30")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Funnel unavailable"))))
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  return (
    <OpsShell title="Golden path funnel" subtitle="30-day conversion snapshot across tenants.">
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {data ? (
        <Card tone="panel">
          <pre className="overflow-x-auto text-xs text-[var(--color-gray-300)]">{JSON.stringify(data, null, 2)}</pre>
        </Card>
      ) : (
        <p className="text-sm text-[var(--color-gray-500)]">Loading…</p>
      )}
      <Link href="/ops" className="text-sm underline">
        Back to overview
      </Link>
    </OpsShell>
  );
}
