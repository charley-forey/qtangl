import type { Metadata } from "next";

import SubmitResourceForm from "@/components/learn/SubmitResourceForm";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/learn/submit",
  title: "Submit a resource",
  description: "Suggest an open-source quantum software project for the Qtangl library.",
});

export default function SubmitPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Submit"
        title="Suggest a project for the library."
        description="Submissions open a review issue when GitHub integration is configured, or are logged for manual triage."
        actions={[{ href: "/learn/library", label: "Back to library", variant: "secondary" }]}
        contentClassName="max-w-4xl"
      />
      <Section gap="tight" className="pb-0">
        <Card tone="strong" size="lg" className="max-w-2xl rounded-[var(--radius-feature)]">
          <SubmitResourceForm />
        </Card>
      </Section>
    </PageShell>
  );
}
