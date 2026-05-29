import type { Metadata } from "next";
import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog/q-day-readiness",
  title: "Q-Day readiness: inventory before the deadline",
  description:
    "Why CISOs need cryptographic inventory, Mosca HNDL framing, and hybrid ML-KEM proofs in 2026.",
});

export default function QDayBlogPage() {
  return (
    <PageShell>
      <Section>
        <article className="mx-auto max-w-3xl space-y-4 text-[var(--color-gray-300)]">
          <h1 className="text-3xl font-semibold text-white">Q-Day readiness: inventory before the deadline</h1>
          <p>
            Boards are asking for RSA/ECDSA exposure counts, not slide decks. Qtangl&apos;s scanner turns that
            mandate into a prioritized remediation backlog with compliance crosswalks and a live post-quantum
            TLS handshake proof.
          </p>
          <p>
            <Link href="/demo/pqc" className="text-white underline">
              Try the Q-Day readiness demo
            </Link>
          </p>
        </article>
      </Section>
    </PageShell>
  );
}
