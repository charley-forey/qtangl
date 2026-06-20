"use client";

import Link from "next/link";

import { qtanglApiBaseUrl } from "@/lib/api";
import { platformStatusCopy, type PlatformStatusSnapshot } from "@/lib/status";

export type DogfoodState = "operational" | "stale" | "unavailable";

export default function StatusPageClient({
  snapshot,
  dogfood,
}: {
  snapshot: PlatformStatusSnapshot | null;
  dogfood: DogfoodState;
}) {
  const overall =
    dogfood === "stale" && snapshot?.overall === "operational"
      ? "degraded"
      : snapshot?.overall ?? "outage";

  const overallLabel = platformStatusCopy.labels[overall];

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-white">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gray-500)]">
        {platformStatusCopy.hero.eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-semibold">{platformStatusCopy.hero.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">{platformStatusCopy.hero.description}</p>

      <div
        className={`mt-8 rounded-xl border px-4 py-3 text-sm ${
          overall === "operational"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            : overall === "degraded"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
              : "border-red-500/30 bg-red-500/10 text-red-100"
        }`}
      >
        {overallLabel}
      </div>

      {snapshot ? (
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">
          {platformStatusCopy.labels.checkedAt}: {new Date(snapshot.checkedAt).toLocaleString()}
        </p>
      ) : null}

      <dl className="mt-8 space-y-4">
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">
            {platformStatusCopy.labels.api}
          </dt>
          <dd className="text-lg capitalize">{snapshot?.basic.status ?? "unreachable"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">
            {platformStatusCopy.labels.platform}
          </dt>
          <dd className="text-lg capitalize">{snapshot?.ready.status ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">
            {platformStatusCopy.labels.database}
          </dt>
          <dd>
            {snapshot?.ready.database
              ? platformStatusCopy.labels.operationalDetail
              : platformStatusCopy.labels.degradedDetail}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">
            {platformStatusCopy.labels.scheduler}
          </dt>
          <dd>
            {snapshot?.ready.schedulerStale
              ? platformStatusCopy.labels.staleScheduler
              : snapshot?.ready.redisEnabled
                ? platformStatusCopy.labels.operationalDetail
                : platformStatusCopy.labels.notConfigured}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">
            Crypto self-assessment (dogfood)
          </dt>
          <dd
            className={
              dogfood === "operational"
                ? "text-emerald-300"
                : dogfood === "stale"
                  ? "text-amber-300"
                  : "text-[var(--color-gray-400)]"
            }
          >
            {dogfood === "operational"
              ? "Operational"
              : dogfood === "stale"
                ? "Stale (>8 days)"
                : "Unavailable"}{" "}
            <Link href="/trust/dogfood" className="underline">
              details
            </Link>
          </dd>
        </div>
      </dl>

      <p className="mt-8 text-sm text-[var(--color-gray-500)]">
        <Link href="/trust" className="underline">
          {platformStatusCopy.labels.trust}
        </Link>
        {" · "}
        <a href={`${qtanglApiBaseUrl}/health`} className="underline" target="_blank" rel="noreferrer">
          {platformStatusCopy.labels.docs}
        </a>
      </p>
    </main>
  );
}
