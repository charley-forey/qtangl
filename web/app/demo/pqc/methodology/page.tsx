import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import ReferencesPanel from "@/components/pqc/ReferencesPanel";
import { PQC_GLOSSARY } from "@/lib/pqc-glossary";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo/pqc/methodology",
  title: "Q-Day scanner methodology",
  description: "How Qtangl inventories quantum-vulnerable cryptography and scores Mosca HNDL exposure.",
});

export default function PqcMethodologyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Methodology"
        title="Q-Day readiness methodology"
        description="NIST-aligned classification, Mosca inequality for harvest-now-decrypt-later, hybrid ML-KEM proof — with honest coverage limits."
      />
      <Section>
        <div className="prose prose-invert max-w-3xl space-y-8 text-sm text-[var(--color-gray-300)]">
          <section>
            <h2 className="text-lg text-white">Discovery scope</h2>
            <p>
              The scanner discovers TLS certificates, JWKS signing keys, SSH host keys, email STARTTLS, and uploaded
              PEM/CSV bundles. Live scans probe port 443 (and scenario-defined ports); unreachable endpoints are recorded
              in scan coverage, not as false-positive assets.
            </p>
          </section>
          <section>
            <h2 className="text-lg text-white">Classification (Shor / Grover)</h2>
            <p>
              Each asset is mapped to a quantum vulnerability status: <strong>broken</strong>,{" "}
              <strong>at-risk</strong> (Shor-vulnerable RSA/ECC), <strong>safe</strong> (symmetric or PQC-ready), or{" "}
              <strong>unknown</strong>. Shor logical-qubit estimates are order-of-magnitude references only.
            </p>
          </section>
          <section>
            <h2 className="text-lg text-white">Mosca inequality</h2>
            <p>
              X (data shelf-life) + Y (migration time) versus Z (years to cryptographically relevant quantum computing).
              When X + Y &gt; Z, harvest-now-decrypt-later risk is elevated for long-lived ciphertext.
            </p>
          </section>
          <section>
            <h2 className="text-lg text-white">Readiness score formula</h2>
            <p>
              Composite 0–100 score from quantum-vulnerable asset share, HNDL exposure, PQC-ready endpoint credit, and
              remediation coverage. Bands: Critical / At Risk / Developing / Prepared.
            </p>
          </section>
          <section>
            <h2 className="text-lg text-white">Coverage confidence</h2>
            <p>
              Heuristic 0–95% based on classified asset count (40% base + 4% per asset, capped at 95%). This is not a
              guarantee — shadow APIs, HSMs, and offline keys may be missed.
            </p>
          </section>
          <section>
            <h2 className="text-lg text-white">Glossary</h2>
            <ul className="space-y-3">
              {PQC_GLOSSARY.map((entry) => (
                <li key={entry.id}>
                  <strong className="text-white">{entry.term}</strong> — {entry.plain}
                  {entry.url ? (
                    <>
                      {" "}
                      <a href={entry.url} target="_blank" rel="noreferrer" className="text-white underline">
                        Reference
                      </a>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-lg text-white">Limitations</h2>
            <ul>
              <li>Endpoint-scoped inventory aid — not a formal cryptographic audit or penetration test.</li>
              <li>RSA/ECC remain classically secure until cryptographically relevant QC exists.</li>
              <li>Fixture replays use curated data; live scans reflect point-in-time negotiation.</li>
            </ul>
          </section>
          <ReferencesPanel />
          <p>
            <Link href="/demo/pqc" className="text-white underline">
              Return to the live demo
            </Link>
          </p>
        </div>
      </Section>
    </PageShell>
  );
}
