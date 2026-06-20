"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import DogfoodPostureCard from "@/components/dashboard/DogfoodPostureCard";
import TrustDogfoodSelfScan from "@/components/trust/TrustDogfoodSelfScan";
import { isQtanglOpsEmail } from "@/lib/ops-gate";

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
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [allFresh, setAllFresh] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/me")
      .then((r) => r.json())
      .then((me) => {
        const email = String(me?.session?.email ?? me?.email ?? "");
        const ok = isQtanglOpsEmail(email);
        setAllowed(ok);
        if (!ok) router.replace("/dashboard/login");
      })
      .catch(() => {
        setAllowed(false);
        router.replace("/dashboard/login");
      });
    void fetch(`${process.env.NEXT_PUBLIC_QTANGL_API_BASE_URL ?? "https://api.qtangl.com"}/pqc/dogfood/summary`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => setAllFresh(s?.freshness?.allFresh ?? null));
  }, [router]);

  if (allowed === null) {
    return <main className="mx-auto max-w-3xl px-6 py-16 text-white">Checking access…</main>;
  }
  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-16 text-white">
      <div>
        <Eyebrow>Internal ops</Eyebrow>
        <h1 className="mt-2 text-2xl font-semibold">Dogfood status</h1>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">
          Live self-scan pipeline for trust center and sales proof.{" "}
          <Link href="/ops/funnel" className="underline">
            Funnel metrics
          </Link>
        </p>
      </div>

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
        <p className="mt-4 text-xs text-[var(--color-gray-500)]">
          Manual trigger: GitHub Actions → PQC dogfood scan → Run workflow → enable live.
        </p>
      </Card>

      <Card tone="panel">
        <Eyebrow>Environment checklist</Eyebrow>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[var(--color-gray-300)]">
          {ENV_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--color-gray-500)]">
          Provision: <code className="text-white">python backend/scripts/provision_dogfood.py</code>
        </p>
      </Card>

      <DogfoodPostureCard />
      <TrustDogfoodSelfScan showTargetsTable />

      <p className="text-sm text-[var(--color-gray-500)]">
        <Link href="/trust/dogfood" className="underline">
          Public dogfood page
        </Link>
        {" · "}
        <Link href="/dashboard" className="underline">
          Dashboard
        </Link>
      </p>
    </main>
  );
}
