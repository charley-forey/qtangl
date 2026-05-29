import type { Metadata } from "next";

import { AirlineSection, AirlineSectionHeader } from "@/components/airline/ui";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { airlineMethodologyCopy } from "@/lib/copy/methodology";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo/airline/methodology",
  title: "Airline demo methodology",
  description:
    "Sources, solver settings, and evidence files behind the OCC crew recovery executive demo.",
});

export default function AirlineMethodologyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={airlineMethodologyCopy.eyebrow}
        title={airlineMethodologyCopy.title}
        description={airlineMethodologyCopy.description}
        actions={[
          { href: "/demo/airline", label: "Open demo" },
          { href: "/access?source=methodology-airline", label: "Request briefing", variant: "secondary" },
        ]}
      />
      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 lg:grid-cols-3">
          <AirlineSection>
            <AirlineSectionHeader label="Evidence" title="Regulatory sources" />
            <ul className="mt-6 space-y-2 text-sm leading-6 text-[var(--color-gray-400)]">
              {airlineMethodologyCopy.sources.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </AirlineSection>
          <AirlineSection>
            <AirlineSectionHeader label="Solvers" title={airlineMethodologyCopy.solver.title} />
            <ul className="mt-6 space-y-2 text-sm leading-6 text-[var(--color-gray-400)]">
              {airlineMethodologyCopy.solver.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </AirlineSection>
          <AirlineSection>
            <AirlineSectionHeader label="Artifacts" title={airlineMethodologyCopy.evidence.title} />
            <ul className="mt-6 space-y-2 font-mono text-xs leading-6 text-[var(--color-gray-400)]">
              {airlineMethodologyCopy.evidence.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </AirlineSection>
        </div>
        <AirlineSection tone="feature" className="mt-6">
          <AirlineSectionHeader
            label="Hardware"
            title="Cached QPU trace"
            description="Production demo replays a recorded IBM Quantum run. Live QAOA remains available when the micro-window QUBO is small enough."
          />
          <div className="mt-6">
            <Button href="/demo/airline" variant="secondary">
              Back to demo
            </Button>
          </div>
        </AirlineSection>
      </Section>
    </PageShell>
  );
}
