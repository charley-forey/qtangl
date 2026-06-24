"use client";

import { useSearchParams } from "next/navigation";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const PARTNER_COPY: Record<string, { label: string; detail: string }> = {
  mssp: {
    label: "MSSP partner mode",
    detail: "Portfolio command center, co-branded reports, and child-tenant rollups are available on Monitor tier.",
  },
  partner: {
    label: "Partner workspace",
    detail: "Manage customer baselines from your portfolio tab in the dashboard.",
  },
};

export default function AssessMsspBanner() {
  const params = useSearchParams();
  const slug = (params.get("partner") ?? "").toLowerCase().trim();
  const partnerName = (params.get("partnerName") ?? "").trim();
  const copy = PARTNER_COPY[slug] ?? (slug ? { label: `${slug} partner`, detail: "Authorized partner assess workspace." } : null);

  if (!copy) return null;

  const label = partnerName ? `${partnerName} partner mode` : copy.label;
  const detail = partnerName
    ? `Assess workspace prepared by ${partnerName}. Portfolio rollups and co-branded reports live in the dashboard.`
    : copy.detail;

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)] border-sky-500/30 bg-sky-950/20">
      <Eyebrow>{label}</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-300)]">{detail}</p>
      <a href="/partners" className="mt-3 inline-block text-sm text-white underline">
        Partner program
      </a>
    </Card>
  );
}
