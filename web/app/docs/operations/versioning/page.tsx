import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import type { DocsFieldRow } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/operations/versioning",
  title: "Versioning and deprecation",
  description: "Qtangl API compatibility model, version boundaries, and deprecation policy.",
});

const compatibilityRules: DocsFieldRow[] = [
  {
    name: "Additive response fields",
    type: "non-breaking",
    required: true,
    description: "New optional fields may be added at any time. Clients should ignore unknown keys.",
  },
  {
    name: "Required request field changes",
    type: "breaking",
    required: true,
    description: "Any new required request parameter requires a new major API version.",
  },
  {
    name: "Enum value expansion",
    type: "non-breaking",
    required: true,
    description: "Additional enum values can appear; client parsers must avoid strict closed-set assumptions.",
  },
  {
    name: "Path or semantic contract changes",
    type: "breaking",
    required: true,
    description: "Behavioral changes that alter endpoint meaning require a new version and migration guide.",
  },
];

const deprecationStages: DocsFieldRow[] = [
  {
    name: "Announcement",
    type: "T-90 days target",
    required: true,
    description: "Deprecation notice posted to docs changelog and account contacts with migration guidance.",
  },
  {
    name: "Deprecation headers",
    type: "active period",
    required: true,
    description: "Responses include deprecation metadata and target sunset date where supported.",
  },
  {
    name: "Sunset",
    type: "retirement date",
    required: true,
    description: "Deprecated endpoint or field is removed or disabled after the published sunset window.",
  },
];

export default function VersioningAndDeprecationPage() {
  return (
    <GuidePageLayout
      pathname="/docs/operations/versioning"
      title="Versioning and deprecation"
      description="Compatibility guarantees and retirement policy for reliable long-lived integrations."
    >
      <DocsSection>
        <DocsHeading>Version strategy</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Qtangl publishes stable HTTP contracts under versioned paths. Integrations should pin to a documented major
          version and tolerate additive fields. This preserves forward compatibility while allowing feature growth.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>What is considered breaking</DocsHeading>
        <DocsFieldTable fields={compatibilityRules} />
      </DocsSection>

      <DocsSection>
        <DocsHeading>Deprecation policy</DocsHeading>
        <DocsFieldTable fields={deprecationStages} />
        <DocsCallout variant="warning" title="Enterprise planning guidance">
          Treat deprecation notices as change windows for your integration team. Plan, test, and deploy migration
          updates before the published sunset date to avoid production impact.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Communication channels</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Documentation changelog entries for all externally visible API contract changes.</li>
          <li>Direct outreach to tenant admins for major deprecations and security-sensitive updates.</li>
          <li>Migration examples and replacement endpoint references when behavior changes.</li>
        </ul>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Track upcoming changes on{" "}
          <Link href="/docs/resources/changelog" className="text-white underline underline-offset-4">
            docs changelog
          </Link>
          .
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
