import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/trust/subprocessors",
  title: "Sub-processors | Qtangl Trust",
  description: "Third parties that may process Qtangl customer data.",
});

const subprocessors = [
  {
    name: "Railway",
    purpose: "Application hosting",
    data: "Scan metadata, configs",
    region: "US",
    dpa: "SOC 2 Type II (NDA); HIPAA BAA (Enterprise); DPA",
  },
  { name: "Vercel", purpose: "Web frontend CDN", data: "Static assets, analytics cookies", region: "Global", dpa: "DPA available" },
  { name: "Postgres (managed)", purpose: "Primary database", data: "Tenant scans, remediation, audit", region: "US (EU by agreement)", dpa: "DPA available" },
  { name: "Redis (managed)", purpose: "Job queue", data: "Job payloads (ephemeral)", region: "Contractual", dpa: "DPA available" },
  { name: "Stripe", purpose: "Billing", data: "Billing contact, subscription metadata", region: "Global", dpa: "Stripe DPA" },
  { name: "Resend", purpose: "Transactional email", data: "Alert addresses, report delivery", region: "US", dpa: "DPA available" },
  { name: "PostHog (optional)", purpose: "Product analytics", data: "Anonymized usage events if enabled", region: "US/EU", dpa: "DPA available" },
  { name: "OpenAI (optional)", purpose: "Copilot explanations", data: "Finding text only if tenant enables", region: "US", dpa: "Enterprise DPA" },
];

export default function TrustSubprocessorsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Trust Center"
        title="Sub-processors"
        description="Current register for enterprise review. Last updated 2026-06-10. We notify customers 30 days before adding a new sub-processor."
      />

      <Section gap="tight">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="pb-3 pr-4">Provider</th>
                <th className="pb-3 pr-4">Purpose</th>
                <th className="pb-3 pr-4">Data</th>
                <th className="pb-3 pr-4">Region</th>
                <th className="pb-3">DPA</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-gray-300)]">
              {subprocessors.map((row) => (
                <tr key={row.name} className="border-t border-[var(--border-subtle)]">
                  <td className="py-3 pr-4 text-white">{row.name}</td>
                  <td className="py-3 pr-4">{row.purpose}</td>
                  <td className="py-3 pr-4">{row.data}</td>
                  <td className="py-3 pr-4">{row.region}</td>
                  <td className="py-3">{row.dpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm text-[var(--muted)]">
          Primary hosting provider maintains SOC 2 Type II; report available under NDA on document request. Request
          artifacts via{" "}
          <Link href="/access" className="text-white underline">
            Contact sales
          </Link>
          . See also{" "}
          <Link href="/docs/trust/data-residency" className="text-white underline">
            Data residency
          </Link>
          .{" "}
          <Link href="/trust" className="text-white underline">
            ← Trust Center
          </Link>
        </p>
      </Section>
    </PageShell>
  );
}
