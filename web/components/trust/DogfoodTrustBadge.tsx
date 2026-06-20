"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchDogfoodSummary, formatDogfoodDate } from "@/lib/dogfood";

export default function DogfoodTrustBadge() {
  const [band, setBand] = useState<string | null>(null);
  const [scannedAt, setScannedAt] = useState<string | null>(null);

  useEffect(() => {
    void fetchDogfoodSummary().then((summary) => {
      const latest = summary?.latest;
      if (!latest) return;
      setBand(latest.readinessBand ?? (latest.readinessScore != null ? String(latest.readinessScore) : null));
      setScannedAt(formatDogfoodDate(latest.scannedAt));
    });
  }, []);

  if (!band) return null;

  return (
    <Link
      href="/trust/dogfood"
      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100 transition hover:border-emerald-400/50"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      Crypto posture verified · {band}
      {scannedAt ? <span className="text-emerald-200/70">· {scannedAt}</span> : null}
    </Link>
  );
}
