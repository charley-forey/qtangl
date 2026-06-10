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
  path: "/docs/guides/code-scan-ci",
  title: "Code scan CI integration",
  description: "Run cryptographic discovery in CI with GitHub Actions, SARIF upload, and policy gates.",
});

export default function CodeScanCiGuidePage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/code-scan-ci"
        title="Code scan CI integration"
        description="GitHub Action, async API, SARIF, and policy gates for code and binary discovery."
      />
      <DocsShell
        title="Code scan CI"
        description="Run CryptoScan + CryptoDeps (code) and CBOMkit-theia (binary) via Qtangl orchestration in your pipeline."
        pathname="/docs/guides/code-scan-ci"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="pilot" />
        <DocsSection>
          <DocsHeading>GitHub Action</DocsHeading>
          <pre className="overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`- uses: qtangl/qtangl-scan@v1
  with:
    api-key: \${{ secrets.QTANGL_API_KEY }}
    mode: code
    github-owner: \${{ github.repository_owner }}
    github-repo: \${{ github.event.repository.name }}
    sarif-output: qtangl-results.sarif
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: qtangl-results.sarif`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Async API</DocsHeading>
          <pre className="overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`curl -X POST https://api.qtangl.com/tenant/coverage/code-scan \\
  -H "Authorization: Bearer $QTANGL_API_KEY" \\
  -d '{"githubOwner":"org","githubRepo":"app","async":true}'

# Poll job status
GET /tenant/discovery/jobs/{jobId}`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Binary / container scan</DocsHeading>
          <pre className="overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`POST /tenant/discovery/binary-scan
{"imageRef": "registry.example.com/app:1.2.3", "integrationId": "int_ecr_prod"}`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Policy gates</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-8 text-[var(--color-gray-300)]">
            <li>
              <code className="font-mono text-white">fail-on-new-quantum-vulnerable: true</code> — block merge on new
              findings
            </li>
            <li>SARIF upload to GitHub Advanced Security when scan completes</li>
            <li>GitHub App install for webhook-driven scans on push/PR</li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Feature flags</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Requires <code className="font-mono text-white">discovery.codeScan</code> and/or{" "}
            <code className="font-mono text-white">discovery.binaryScan</code> on the tenant (default off).
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Related</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            <Link href="/docs/integrations/ci-cd" className="text-white underline underline-offset-4">
              CI/CD integration
            </Link>{" "}
            ·{" "}
            <Link href="/docs/reference/discovery/code-scan" className="text-white underline underline-offset-4">
              Code scan API
            </Link>{" "}
            ·{" "}
            <Link href="/docs/guides/host-sensor-deploy" className="text-white underline underline-offset-4">
              Host sensor deploy
            </Link>
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
