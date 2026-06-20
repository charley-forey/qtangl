"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  type DogfoodHistoryPoint,
  type DogfoodSummary,
  fetchDogfoodHistory,
  fetchDogfoodSummary,
  formatDogfoodDate,
} from "@/lib/dogfood";

export default function DogfoodPostureCard() {
  const [summary, setSummary] = useState<DogfoodSummary | null>(null);
  const [history, setHistory] = useState<DogfoodHistoryPoint[]>([]);

  useEffect(() => {
    void Promise.all([fetchDogfoodSummary(), fetchDogfoodHistory(90)]).then(([s, h]) => {
      setSummary(s);
      setHistory(h);
    });
  }, []);

  const latest = summary?.latest;
  const allFresh = summary?.freshness?.allFresh;

  return (
    <Card tone="panel">
      <Eyebrow>Qtangl public posture (dogfood)</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Live scans of our production domains — same pipeline customers use.
      </p>
      {latest ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[var(--color-gray-500)]">Latest readiness</dt>
            <dd className="text-lg text-white">
              {latest.readinessScore ?? "—"}
              {latest.readinessBand ? ` · ${latest.readinessBand}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-gray-500)]">Freshness</dt>
            <dd className={allFresh ? "text-emerald-300" : "text-amber-300"}>
              {allFresh ? "All targets fresh" : "One or more targets stale"}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-[var(--color-gray-500)]">Dogfood summary unavailable.</p>
      )}
      {summary?.targets && summary.targets.length > 0 ? (
        <ul className="mt-4 space-y-1 text-xs text-[var(--color-gray-300)]">
          {summary.targets.map((t) => (
            <li key={t.targetDomain}>
              {t.targetDomain}: {t.readinessScore ?? "—"}
              {t.stale ? " (stale)" : ""}
              {t.verifyUrl ? (
                <>
                  {" "}
                  ·{" "}
                  <a href={t.verifyUrl} className="underline" target="_blank" rel="noreferrer">
                    verify
                  </a>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {history.length > 1 ? (
        <p className="mt-3 text-xs text-[var(--color-gray-500)]">
          {history.length} scans in the last 90 days · last {formatDogfoodDate(history[history.length - 1]?.scannedAt)}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <Link href="/trust/dogfood" className="text-sky-300 underline">
          Trust dogfood page
        </Link>
        <Link href="/ops/dogfood" className="text-[var(--color-gray-400)] underline">
          Ops status
        </Link>
      </div>
    </Card>
  );
}
