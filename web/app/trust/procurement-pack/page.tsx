import type { Metadata } from "next";
import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Procurement pack | Qtangl Trust",
  description: "Security questionnaire FAQ, subprocessors, and contract templates for enterprise procurement.",
};

const PACK_ITEMS = [
  {
    title: "Security questionnaire FAQ",
    href: "/docs/trust/compliance-program",
    description: "Pre-filled answers for vendor security reviews.",
  },
  {
    title: "Sub-processors",
    href: "/trust/subprocessors",
    description: "Infrastructure providers and DPA availability.",
  },
  {
    title: "Terms & Privacy",
    href: "/terms",
    description: "Self-serve click-wrap terms; MSA/DPA available on request.",
  },
  {
    title: "Trust center",
    href: "/trust",
    description: "Security posture, incident response, and data residency.",
  },
  {
    title: "Live dogfood proof",
    href: "/trust/dogfood",
    description: "Qtangl scans its own production domains — signed, verifiable reports.",
  },
  {
    title: "Verify latest self-scan",
    href: "https://api.qtangl.com/pqc/dogfood/latest",
    description: "Machine-readable latest scan JSON with verification block (refresh weekly for questionnaires).",
  },
  {
    title: "Customer proof pack",
    href: "/docs/guides/evidence-retention",
    description: "Verify URL, CBOM, board PDF, and schedule statement for auditor handoff.",
  },
  {
    title: "Request access / NDA",
    href: "/access?interest=Q-Day%20Assessment%20(one-time)",
    description: "Sales-led pilots with optional mutual NDA before deep technical review.",
  },
] as const;

export default function ProcurementPackPage() {
  return (
    <PageShell>
      <Section gap="tight">
        <Eyebrow>Trust</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold text-white">Enterprise procurement pack</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-gray-300)]">
          Everything security and procurement teams typically request before a pilot or annual agreement. Self-serve
          accounts accept Terms at signup; contracts above $25K use MSA + Order Form + DPA.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PACK_ITEMS.map((item) => (
            <Card key={item.href} tone="ghost" className="border border-[var(--border-subtle)]">
              {item.href.startsWith("http") ? (
                <a href={item.href} className="block" target="_blank" rel="noreferrer">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-[var(--color-gray-400)]">{item.description}</p>
                </a>
              ) : (
                <Link href={item.href} className="block">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-[var(--color-gray-400)]">{item.description}</p>
                </Link>
              )}
            </Card>
          ))}
        </div>
        <p className="mt-8 text-sm text-[var(--color-gray-500)]">
          <strong className="text-[var(--color-gray-400)]">Does Qtangl scan itself?</strong> Yes — see{" "}
          <Link href="/trust/dogfood" className="underline hover:text-white">
            /trust/dogfood
          </Link>{" "}
          for live multi-domain posture, CI freshness monitor, and auditor bundle metadata.
        </p>
        <p className="mt-8 text-sm text-[var(--color-gray-500)]">
          Need a signed MNDA or custom Order Form?{" "}
          <Link href="/access" className="underline hover:text-white">
            Contact sales
          </Link>
          .
        </p>
      </Section>
    </PageShell>
  );
}
