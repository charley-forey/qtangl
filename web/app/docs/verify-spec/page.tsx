import type { Metadata } from "next";
import Link from "next/link";

import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Verify specification | Qtangl Docs",
  description: "Qtangl signed report verification spec v1.1.0 — content hash, signatures, Merkle inclusion.",
};

export default function VerifySpecPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 py-12">
      <header>
        <Eyebrow>Trust</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold text-white">Verify specification v1.1.0</h1>
        <p className="mt-3 text-[var(--muted)]">
          Canonical rules for offline verification of Qtangl migration reports: SHA-256 content hash, dual
          signatures (ML-DSA-65 + Ed25519), and optional transparency log Merkle inclusion.
        </p>
      </header>

      <Card tone="panel">
        <h2 className="text-lg font-medium text-white">Quick verify</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
{`pip install qtangl-verify
qtangl-verify report.json --api-base https://api.qtangl.com --json`}
        </pre>
      </Card>

      <Card tone="panel">
        <h2 className="text-lg font-medium text-white">Full specification</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Source document maintained in the repository:{" "}
          <Link
            href="https://github.com/qtangl/qtangl/blob/main/docs/verify-spec.md"
            className="text-white underline"
            target="_blank"
            rel="noreferrer"
          >
            docs/verify-spec.md
          </Link>
          . Public endpoints:{" "}
          <code className="text-white">GET /pqc/transparency/root</code>,{" "}
          <code className="text-white">GET /pqc/transparency/keys</code>,{" "}
          <code className="text-white">GET /pqc/verify/&#123;scanId&#125;</code>.
        </p>
      </Card>

      <p className="text-sm">
        <Link href="/trust" className="text-white underline">
          Trust center
        </Link>{" "}
        ·{" "}
        <Link href="/verify" className="text-white underline">
          Verify a report
        </Link>
      </p>
    </article>
  );
}
