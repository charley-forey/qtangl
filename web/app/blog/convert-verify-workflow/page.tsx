import type { Metadata } from "next";
import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/seo/JsonLd";
import { buildBlogPostingJsonLd, buildPageMetadata } from "@/lib/seo";

const path = "/blog/convert-verify-workflow";
const title = "Closing the loop: verify-fix in Convert";
const description =
  "Attach re-scan proof to remediation items and export workflowStatus on board packs.";

export const metadata: Metadata = buildPageMetadata({
  path,
  title,
  description,
});

export default function ConvertVerifyBlogPage() {
  return (
    <PageShell>
      <Section>
        <article className="mx-auto max-w-3xl space-y-8 text-[var(--color-gray-300)]">
          <header className="space-y-4">
            <p className="text-sm text-[var(--color-gray-500)]">June 2026 · Convert tier</p>
            <h1 className="text-3xl font-semibold text-white">Closing the loop: verify-fix in Convert</h1>
            <p className="text-lg leading-8">
              When a remediation item moves to done, auditors ask how you know it stayed fixed. Convert ties a
              verification scan to each item and surfaces live workflow status on exports.
            </p>
          </header>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Verify fix workflow</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-7">
              <li>Run a baseline scan and prioritize remediation on the dashboard.</li>
              <li>Apply the crypto fix in your environment.</li>
              <li>Run a follow-up scan and select it as the verification scan.</li>
              <li>Click Verify fix — Qtangl compares the asset and stores verifyScanId.</li>
              <li>Export PDF or board pack — workflowStatus, owner, and target date appear in the remediation table.</li>
            </ol>
          </section>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">What auditors see</h2>
            <p className="text-sm leading-7">
              Board and auditor JSON exports merge Postgres remediation status. Signed reports remain verifiable at{" "}
              <Link href="/verify" className="text-white underline">
                /verify
              </Link>
              .
            </p>
          </section>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button href="/dashboard">Open dashboard</Button>
            <Button href="/convert" variant="secondary">
              Convert tier overview
            </Button>
          </div>
        </article>
      </Section>
      <JsonLd
        data={buildBlogPostingJsonLd({
          path,
          headline: title,
          description,
          datePublished: "2026-06-01",
        })}
      />
    </PageShell>
  );
}
