import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import SandboxHowItWorks from "@/components/marketing/SandboxHowItWorks";
import SandboxIntegrationLinks from "@/components/marketing/SandboxIntegrationLinks";
import TryPlanner from "@/components/marketing/TryPlanner";
import { sandboxPageCopy } from "@/lib/copy/try";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/sandbox",
  title: "API Sandbox",
  description:
    "Send a real POST /optimize request in the browser and get back the same ranked JSON your application will receive.",
});

export default function SandboxPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={sandboxPageCopy.eyebrow}
        title={sandboxPageCopy.title}
        description={sandboxPageCopy.description}
        actions={[
          {
            href: sandboxPageCopy.heroActions.quickstart.href,
            label: sandboxPageCopy.heroActions.quickstart.label,
          },
          {
            href: sandboxPageCopy.heroActions.api.href,
            label: sandboxPageCopy.heroActions.api.label,
            variant: "secondary",
          },
        ]}
      />

      <Section gap="tight">
        <SandboxHowItWorks />
      </Section>

      <Section gap="tight">
        <div
          className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/[0.03] px-5 py-4"
          role="note"
        >
          <p className="text-sm leading-7 text-[var(--color-gray-300)]">
            {sandboxPageCopy.fallbackCallout}
          </p>
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <TryPlanner layout="page" />
      </Section>

      <Section>
        <SandboxIntegrationLinks />
      </Section>
    </PageShell>
  );
}
