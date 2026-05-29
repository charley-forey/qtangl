import type { Metadata } from "next";

import { EvFleetSection, EvFleetSectionHeader } from "@/components/ev-fleet/ui";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { evFleetMethodologyCopy } from "@/lib/copy/methodology";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo/ev-fleet/methodology",
  title: "EV fleet demo methodology",
  description: "Sources, solver settings, and evidence behind the depot charging demo.",
});

export default function EvFleetMethodologyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={evFleetMethodologyCopy.eyebrow}
        title={evFleetMethodologyCopy.title}
        description={evFleetMethodologyCopy.description}
        actions={[
          { href: "/demo/ev-fleet", label: "Open demo" },
          {
            href: "/access?source=methodology-ev-fleet",
            label: "Request briefing",
            variant: "secondary",
          },
        ]}
      />
      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 lg:grid-cols-3">
          <EvFleetSection>
            <EvFleetSectionHeader label="Evidence" title="Sources" />
            <ul className="mt-6 space-y-2 text-sm leading-6 text-[var(--color-gray-400)]">
              {evFleetMethodologyCopy.sources.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </EvFleetSection>
          <EvFleetSection>
            <EvFleetSectionHeader
              label="Pipeline"
              title={evFleetMethodologyCopy.solver.title}
            />
            <ul className="mt-6 space-y-2 text-sm leading-6 text-[var(--color-gray-400)]">
              {evFleetMethodologyCopy.solver.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </EvFleetSection>
          <EvFleetSection>
            <EvFleetSectionHeader
              label="Repository"
              title={evFleetMethodologyCopy.evidence.title}
            />
            <ul className="mt-6 space-y-2 font-mono text-xs leading-6 text-[var(--color-gray-500)]">
              {evFleetMethodologyCopy.evidence.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </EvFleetSection>
        </div>
        <div className="mt-10">
          <Button href="/docs/guides/ev-fleet-demo" variant="secondary">
            Read API guide
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
