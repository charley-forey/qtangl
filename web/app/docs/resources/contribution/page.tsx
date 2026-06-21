import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/resources/contribution",
  title: "Documentation contribution guide",
  description: "Ownership model, review expectations, and publishing checklist for Qtangl docs updates.",
});

export default function DocsContributionPage() {
  return (
    <GuidePageLayout
      pathname="/docs/resources/contribution"
      title="Documentation contribution guide"
      description="How product, engineering, and security teams collaborate to keep docs current and trustworthy."
    >
      <DocsSection>
        <DocsHeading>Ownership model</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Product owns information architecture and release-level messaging.</li>
          <li>Engineering owns API accuracy, examples, and operational guidance.</li>
          <li>Security/compliance reviewers own trust and assurance statements before publication.</li>
          <li>Support owns triage of docs gaps discovered from customer tickets.</li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>When a docs update is required</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>New endpoint, parameter, or behavior changes in existing contracts.</li>
          <li>Operational policy updates (versioning, rate limits, incident process, residency).</li>
          <li>Trust claims that affect procurement, legal, or security review outcomes.</li>
          <li>Any customer-facing workflow change that would alter runbooks or onboarding.</li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Review checklist</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Technical accuracy validated against current implementation and tests.</li>
          <li>Examples use valid request and response shapes with realistic values.</li>
          <li>Role/permission statements match the RBAC reference matrix.</li>
          <li>Security and compliance claims are factual, dated, and non-promissory.</li>
          <li>Internal-only terms, secrets, and customer identifiers are removed.</li>
          <li>Cross-links to related docs pages are present and not broken.</li>
        </ul>
        <DocsCallout variant="warning" title="No speculative claims">
          Do not publish future-state compliance or certification statements as if already complete. Use explicit
          phrasing like &quot;planned&quot;, &quot;in progress&quot;, or &quot;available by agreement&quot; where needed.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Engineer runbook</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Use this checklist when changing product behavior that customers see in docs.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <strong className="font-medium text-white">Narrative guide</strong> — add{" "}
            <code className="font-mono text-white">web/app/docs/guides/&lt;slug&gt;/page.tsx</code> using{" "}
            <code className="font-mono text-white">GuidePageLayout</code>; register in{" "}
            <code className="font-mono text-white">web/lib/docs/nav.ts</code>.
          </li>
          <li>
            <strong className="font-medium text-white">API reference</strong> — add{" "}
            <code className="font-mono text-white">defineEndpoint(...)</code> in{" "}
            <code className="font-mono text-white">web/lib/docs/endpoints/*.ts</code>. Tenant/admin/public routes
            auto-render via <code className="font-mono text-white">[slug]/page.tsx</code>; core PQC routes may need a
            static page under <code className="font-mono text-white">web/app/docs/reference/pqc/</code>.
          </li>
          <li>
            Run <code className="font-mono text-white">npm run check:docs</code>, then{" "}
            <code className="font-mono text-white">npm run generate:docs-index</code> and{" "}
            <code className="font-mono text-white">npm run generate:docs-export</code> when nav or endpoints change.
          </li>
          <li>
            <strong className="font-medium text-white">Status policy</strong> — do not use{" "}
            <code className="font-mono text-white">pilot</code> in nav or endpoint registries. Omit{" "}
            <code className="font-mono text-white">status</code> or set <code className="font-mono text-white">ga</code>.
            Use <code className="font-mono text-white">deprecated</code> only when sunsetting an endpoint.
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Publish and maintenance cadence</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Merge docs updates with product changes whenever possible. For delayed updates, create a tracked follow-up
          task and target publication within one business day for operationally significant changes.
        </p>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Related pages:{" "}
          <Link href="/docs/resources/changelog" className="text-white underline underline-offset-4">
            changelog
          </Link>{" "}
          and{" "}
          <Link href="/docs/reference/rbac" className="text-white underline underline-offset-4">
            RBAC reference
          </Link>
          .
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
