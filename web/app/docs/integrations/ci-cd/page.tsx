import type { Metadata } from "next";
import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/integrations/ci-cd",
  title: "CI/CD integration",
  description: "Run Qtangl PQC scans in GitHub Actions and fail builds on new quantum-vulnerable findings.",
});

export default function CiCdIntegrationPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/integrations/ci-cd"
        title="CI/CD integration"
        description="GitHub Actions workflow for PQC scan and signed report verification."
      />
      <DocsShell
        title="CI/CD — GitHub Action"
        description="Shift-left by scanning targets on every pipeline run. Compare against a baseline scan to fail on regressions."
        pathname="/docs/integrations/ci-cd"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="ga" />
        <DocsSection>
          <DocsHeading>Scan on every run</DocsHeading>
          <pre className="overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`- uses: qtangl/qtangl/.github/actions/qtangl-scan@main
  with:
    api-key: \${{ secrets.QTANGL_API_KEY }}
    target: api.example.com
    api-url: https://api.qtangl.com`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Verify signed reports in CI</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            After a scan exports a signed JSON report, verify integrity with the published{" "}
            <code className="font-mono text-white">qtangl-verify</code> package or the composite action.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`- uses: qtangl/qtangl/.github/actions/verify@main
  with:
    report-path: artifacts/report.json
    api-base: https://api.qtangl.com

# Or install directly:
# pip install qtangl-verify
# qtangl-verify artifacts/report.json --api-base https://api.qtangl.com --json`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Fail on regression</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Set <code className="font-mono text-white">baseline-scan-id</code> to a golden scan. The action
            compares new quantum-vulnerable findings and exits non-zero when regressions are detected (v2
            action).
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Related</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            <Link href="/docs/guides/monitor-setup" className="text-white underline underline-offset-4">
              Monitor setup
            </Link>{" "}
            ·{" "}
            <Link href="/docs/verify-spec" className="text-white underline underline-offset-4">
              Verify specification
            </Link>{" "}
            ·{" "}
            <Link href="/platform/coverage" className="text-white underline underline-offset-4">
              Coverage matrix
            </Link>
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
