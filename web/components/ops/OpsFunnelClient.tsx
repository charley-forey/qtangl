"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { isQtanglOpsEmail } from "@/lib/ops-gate";

export default function OpsFunnelClient() {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/me")
      .then((r) => r.json())
      .then((me) => {
        const email = String(me?.session?.email ?? me?.email ?? "");
        if (!isQtanglOpsEmail(email)) {
          router.replace("/dashboard/login");
          return;
        }
        return fetch("/api/ops/funnel?days=30")
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Funnel unavailable"))))
          .then(setData)
          .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
      })
      .catch(() => router.replace("/dashboard/login"));
  }, [router]);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-16 text-white">
      <Eyebrow>Internal ops</Eyebrow>
      <h1 className="text-2xl font-semibold">Golden path funnel (30d)</h1>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {data ? (
        <Card tone="panel">
          <pre className="overflow-x-auto text-xs text-[var(--color-gray-300)]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </Card>
      ) : (
        <p className="text-sm text-[var(--color-gray-500)]">Loading…</p>
      )}
      <Link href="/ops/dogfood" className="text-sm underline">
        ← Dogfood ops
      </Link>
    </main>
  );
}
