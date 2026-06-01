import type { Metadata } from "next";
import Link from "next/link";

import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "CI/CD integration | Qtangl Docs",
  description: "Run Qtangl PQC scans in GitHub Actions and fail builds on new quantum-vulnerable findings.",
};

export default function CiCdIntegrationPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 py-12">
      <header>
        <Eyebrow>Integrations</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold text-white">CI/CD — GitHub Action</h1>
        <p className="mt-3 text-[var(--muted)]">
          Shift-left by scanning targets on every pipeline run. Compare against a baseline scan to fail on
          regressions.
        </p>
      </header>

      <Card tone="panel">
        <h2 className="text-lg font-medium text-white">Usage</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
{`- uses: qtangl/qtangl/.github/actions/qtangl-scan@main
  with:
    api-key: \${{ secrets.QTANGL_API_KEY }}
    target: api.example.com
    api-url: https://api.qtangl.com`}
        </pre>
      </Card>

      <Card tone="panel">
        <h2 className="text-lg font-medium text-white">Fail on regression</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Set <code className="text-white">baseline-scan-id</code> to a golden scan. The action compares new
          quantum-vulnerable findings and exits non-zero when regressions are detected (v2 action).
        </p>
      </Card>

      <p className="text-sm">
        <Link href="/docs/guides/monitor-setup" className="text-white underline">
          Monitor setup
        </Link>{" "}
        ·{" "}
        <Link href="/platform/coverage" className="text-white underline">
          Coverage matrix
        </Link>
      </p>
    </article>
  );
}
