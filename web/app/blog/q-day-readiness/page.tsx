import type { Metadata } from "next";
import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
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
        <article className="mx-auto max-w-3xl space-y-8 text-[var(--color-gray-300)]">
          <header className="space-y-4">
            <p className="text-sm text-[var(--color-gray-500)]">March 2026 · Post-quantum readiness</p>
            <h1 className="text-3xl font-semibold text-white">
              Q-Day readiness: inventory before the deadline
            </h1>
            <p className="text-lg leading-8">
              Boards are asking for RSA/ECDSA exposure counts, not slide decks. The question is no longer
              whether post-quantum migration matters — it is whether you can prove what you have, what
              changed, and who owns the fix.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">The Mosca clock is already ticking</h2>
            <p>
              Mosca&apos;s inequality —{" "}
              <em>X + Y &gt; Z</em> (data lifetime + migration time exceeds adversary capability) — turns
              abstract quantum risk into a planning deadline. For long-lived secrets, TLS certificates, and
              archived ciphertext, harvest-now-decrypt-later (HNDL) means exposure today is liability
              tomorrow.
            </p>
            <p>
              <Link href="/q-day/mosca" className="text-white underline underline-offset-4">
                Explore the Mosca calculator
              </Link>{" "}
              and{" "}
              <Link href="/q-day/hndl" className="text-white underline underline-offset-4">
                HNDL primer
              </Link>{" "}
              on our Q-Day hub.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Inventory is the unblocker</h2>
            <p>
              Most enterprises cannot answer three basic questions: which systems still depend on RSA or
              ECDSA, which third-party libraries embed legacy crypto, and which teams own remediation. A
              one-time spreadsheet exercise decays within weeks as new deployments ship.
            </p>
            <p>
              Qtangl&apos;s Assess tier produces a prioritized backlog with algorithm tags, compliance
              crosswalks (NSM-10, CNSA 2.0, NIST IR 8547), and signed scan artifacts suitable for audit
              evidence — not a formal attestation, but a repeatable inventory aid.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Monitor beats annual panic</h2>
            <p>
              A single assessment satisfies this quarter&apos;s board slide. It does not catch the
              microservice that shipped last Tuesday with an outdated OpenSSL pin, or the partner API that
              rolled back a hybrid TLS experiment.
            </p>
            <p>
              Continuous Monitor diffs each scan against the prior baseline: new findings, resolved items,
              readiness score trends, and scheduled re-scan windows aligned to your change cadence. That is
              how you move from fire drills to operational crypto hygiene.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Convert with evidence, not hope</h2>
            <p>
              Migration planning fails when backlog items lack owners, effort estimates, and dependency
              ordering. Convert ties remediation items to what-if projections: if you clear the top N
              findings this quarter, what does your readiness curve look like at the next audit?
            </p>
            <p>
              Hybrid ML-KEM TLS handshakes — live in our demo — prove the target state is reachable without
              ripping out every legacy endpoint on day one.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Where to start</h2>
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                Run a{" "}
                <Link href="/demo/pqc" className="text-white underline underline-offset-4">
                  Q-Day readiness demo
                </Link>{" "}
                against a representative environment.
              </li>
              <li>
                Map your current stage on the{" "}
                <Link href="/journey" className="text-white underline underline-offset-4">
                  maturity model
                </Link>
                .
              </li>
              <li>
                Estimate status-quo cost vs Monitor with the{" "}
                <Link href="/resources/roi" className="text-white underline underline-offset-4">
                  ROI calculator
                </Link>
                .
              </li>
            </ol>
          </section>

          <footer className="flex flex-wrap gap-3 border-t border-[var(--color-gray-800)] pt-8">
            <Button href="/demo/pqc">Try the Q-Day demo</Button>
            <Button href="/access" variant="secondary">
              Request access
            </Button>
          </footer>
        </article>
      </Section>
    </PageShell>
  );
}
