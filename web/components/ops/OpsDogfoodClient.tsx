"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import DogfoodPostureCard from "@/components/dashboard/DogfoodPostureCard";
import TrustDogfoodSelfScan from "@/components/trust/TrustDogfoodSelfScan";
import OpsShell from "@/components/ops/OpsShell";

const CI_LINKS = [
  { label: "PQC dogfood workflow", href: "https://github.com/charley-forey/qtangl/actions/workflows/pqc-dogfood.yml" },
  {
    label: "Dogfood freshness monitor",
    href: "https://github.com/charley-forey/qtangl/actions/workflows/dogfood-freshness.yml",
  },
];

const ENV_CHECKLIST = [
  "QTANGL_DOGFOOD_TENANT_ID=dogfood",
  "QTANGL_PQC_ENABLE_LIVE_SCAN=true",
  "QTANGL_PQC_SCAN_ALLOWLIST=qtangl.com,www.qtangl.com,api.qtangl.com",
  "QTANGL_ENABLE_TRANSPARENCY_LOG=true",
  "GitHub secret QTANGL_DOGFOOD_API_KEY set",
];

export default function OpsDogfoodClient() {
  const [allFresh, setAllFresh] = useState<boolean | null>(null);

  useEffect(() => {
    void fetch(`${process.env.NEXT_PUBLIC_QTANGL_API_BASE_URL ?? "https://api.qtangl.com"}/pqc/dogfood/summary`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => setAllFresh(s?.freshness?.allFresh ?? null));
  }, []);

  return (
    <OpsShell title="Dogfood status" subtitle="Live self-scan pipeline for trust center and sales proof.">
      <Card tone="panel">
        <p className="text-sm">
          Freshness:{" "}
          <span className={allFresh ? "text-emerald-300" : "text-amber-300"}>
            {allFresh === null ? "Loading…" : allFresh ? "All targets fresh" : "Stale or missing targets"}
          </span>
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {CI_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sky-300 underline" target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="panel">
        <Eyebrow>Environment checklist</Eyebrow>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[var(--color-gray-300)]">
          {ENV_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <DogfoodPostureCard />
      <TrustDogfoodSelfScan showTargetsTable />

      <p className="text-sm text-[var(--color-gray-500)]">
        <Link href="/trust/dogfood" className="underline">
          Public dogfood page
        </Link>
      </p>
    </OpsShell>
  );
}
