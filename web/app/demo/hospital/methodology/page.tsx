import type { Metadata } from "next";

import {
  HospitalSection,
  HospitalSectionHeader,
} from "@/components/hospital/ui";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { hospitalMethodologyCopy } from "@/lib/copy/methodology";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo/hospital/methodology",
  title: "Hospital demo methodology",
  description:
    "Sources, solver settings, and evidence files behind the hospital re-staffing executive demo.",
});

export default function HospitalMethodologyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={hospitalMethodologyCopy.eyebrow}
        title={hospitalMethodologyCopy.title}
        description={hospitalMethodologyCopy.description}
        actions={[
          { href: "/demo/hospital", label: "Open demo" },
          { href: "/access?source=methodology", label: "Request briefing", variant: "secondary" },
        ]}
      />
      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 lg:grid-cols-3">
          <HospitalSection>
            <HospitalSectionHeader label="Evidence" title="Regulatory sources" />
            <ul className="mt-6 space-y-2 text-sm leading-6 text-[var(--color-gray-400)]">
              {hospitalMethodologyCopy.sources.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </HospitalSection>
          <HospitalSection>
            <HospitalSectionHeader
              label="Solvers"
              title={hospitalMethodologyCopy.solver.title}
            />
            <ul className="mt-6 space-y-2 text-sm leading-6 text-[var(--color-gray-400)]">
              {hospitalMethodologyCopy.solver.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </HospitalSection>
          <HospitalSection>
            <HospitalSectionHeader
              label="Artifacts"
              title={hospitalMethodologyCopy.evidence.title}
            />
            <ul className="mt-6 space-y-2 font-mono text-xs leading-6 text-[var(--color-gray-400)]">
              {hospitalMethodologyCopy.evidence.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </HospitalSection>
        </div>
        <HospitalSection tone="feature" className="mt-6">
          <HospitalSectionHeader
            label="Hardware"
            title="Cached QPU trace"
            description="Production demo replays a recorded IBM Quantum run for recording-safe deployments. Live QAOA remains available for research environments."
          />
          <div className="mt-6">
            <Button href="/demo/hospital" variant="secondary">
              Back to demo
            </Button>
          </div>
        </HospitalSection>
      </Section>
    </PageShell>
  );
}
