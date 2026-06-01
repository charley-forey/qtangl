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
  { name: "Railway / hosting", purpose: "Application hosting", data: "Scan metadata, configs", region: "US" },
  { name: "Postgres provider", purpose: "Database", data: "Tenant scans, remediation", region: "Contractual" },
  { name: "Redis", purpose: "Job queue", data: "Job payloads", region: "Contractual" },
  { name: "Stripe", purpose: "Billing", data: "Billing contact", region: "Global" },
  { name: "Email provider", purpose: "Transactional email", data: "Alert addresses", region: "Contractual" },
  { name: "OpenAI (optional)", purpose: "Copilot explanations", data: "Finding text only if enabled", region: "US" },
];

export default function TrustSubprocessorsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Trust Center"
        title="Sub-processors"
        description="Current list for enterprise review. Contact sales for DPA."
      />

      <Section gap="tight">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="pb-3 pr-4">Provider</th>
                <th className="pb-3 pr-4">Purpose</th>
                <th className="pb-3 pr-4">Data</th>
                <th className="pb-3">Region</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-gray-300)]">
              {subprocessors.map((row) => (
                <tr key={row.name} className="border-t border-[var(--border-subtle)]">
                  <td className="py-3 pr-4 text-white">{row.name}</td>
                  <td className="py-3 pr-4">{row.purpose}</td>
                  <td className="py-3 pr-4">{row.data}</td>
                  <td className="py-3">{row.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm text-[var(--muted)]">
          Request a DPA via{" "}
          <Link href="/access" className="text-white underline">
            Contact sales
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
