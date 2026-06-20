import type { Metadata } from "next";
import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import TrustDogfoodSelfScan from "@/components/trust/TrustDogfoodSelfScan";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/trust/dogfood",
  title: "Qtangl scans itself",
  description: "Live post-quantum readiness self-assessment of qtangl.com production domains with signed verification.",
});

export default function TrustDogfoodPage() {
  return (
    <PageShell>
      <Section>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gray-500)]">Trust center</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">We eat our own cooking</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-gray-300)]">
          Qtangl runs scheduled live PQC scans against our production domains. Reports are signed, anchored in our
          transparency log, and publicly verifiable — the same evidence workflow we deliver to customers.
        </p>
        <div className="mt-8">
          <TrustDogfoodSelfScan showTargetsTable />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--border-subtle)] p-4 text-sm">
            <p className="font-medium text-white">Platform CBOM</p>
            <p className="mt-2 text-[var(--color-gray-400)]">
              We dogfood CycloneDX inventory for our own platform components.
            </p>
            <Link href="/docs/trust/product-sbom" className="mt-3 inline-block text-sky-300 underline">
              Product SBOM
            </Link>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] p-4 text-sm">
            <p className="font-medium text-white">Evidence chain</p>
            <p className="mt-2 text-[var(--color-gray-400)]">
              Scan hashes are anchored in our append-only transparency log. Dogfood CI scans auto-retain in the
              evidence vault.
            </p>
            <a
              href={`${process.env.NEXT_PUBLIC_QTANGL_API_BASE_URL ?? "https://api.qtangl.com"}/pqc/transparency/root`}
              className="mt-3 inline-block text-sky-300 underline"
              target="_blank"
              rel="noreferrer"
            >
              Transparency root
            </a>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] p-4 text-sm">
            <p className="font-medium text-white">Auditor package</p>
            <p className="mt-2 text-[var(--color-gray-400)]">
              Machine-readable bundle with verify URLs and transparency log root.
            </p>
            <a
              href={`${process.env.NEXT_PUBLIC_QTANGL_API_BASE_URL ?? "https://api.qtangl.com"}/pqc/dogfood/auditor-bundle`}
              className="mt-3 inline-block text-sky-300 underline"
              target="_blank"
              rel="noreferrer"
            >
              Download JSON metadata
            </a>
          </div>
        </div>
        <div className="mt-10 rounded-xl border border-sky-500/30 bg-sky-500/10 p-6 text-center">
          <p className="text-lg font-medium text-white">Run the same workflow on your domains</p>
          <p className="mt-2 text-sm text-[var(--color-gray-300)]">
            Signed scans, verify links, and CBOM exports — the evidence chain your auditors expect.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
            >
              Start free workspace
            </Link>
            <Link href="/assess" className="text-sm text-sky-300 underline">
              Try Assess demo
            </Link>
          </div>
        </div>
        <p className="mt-8 text-sm text-[var(--color-gray-500)]">
          <Link href="/trust" className="underline">
            ← Back to trust center
          </Link>
        </p>
      </Section>
    </PageShell>
  );
}
