import type { Metadata } from "next";
import dynamic from "next/dynamic";

import FeatureCard from "@/components/marketing/FeatureCard";
import FrameworkCoverageStrip from "@/components/marketing/FrameworkCoverageStrip";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import JsonLd from "@/components/seo/JsonLd";
import { qtanglApiBaseUrl } from "@/lib/api";
import { assessPageCopy } from "@/lib/copy/readiness-assess";
import { sampleCbomPath } from "@/lib/copy/readiness-value";
import { FALLBACK_SCENARIOS } from "@/lib/pqc-fallback";
import { getPqcInventory, getPqcScenarios } from "@/lib/pqc";
import type { CryptoAsset, Scenario } from "@/lib/pqc";
import { absoluteUrl, buildPageMetadata, buildPqcDemoJsonLd } from "@/lib/seo";

const scannerDescription =
  "Live Q-Day assessment: inventory quantum-vulnerable cryptography, Mosca HNDL risk, and signed evidence exports.";

/** Client-only: uses useSearchParams — SSR would mismatch Suspense fallback (React #418). */
const PqcDemoClient = dynamic(() => import("@/components/pqc/PqcDemoClient"), {
  ssr: false,
  loading: () => (
    <Card tone="strong" className="rounded-[var(--radius-xl)]">
      <p className="text-sm text-[var(--color-gray-300)]">Loading assessment scanner…</p>
    </Card>
  ),
});

export const metadata: Metadata = buildPageMetadata({
  path: "/assess",
  title: assessPageCopy.metadata.title,
  description: assessPageCopy.metadata.description,
});

async function prefetch() {
  try {
    const [inventoryResponse, scenariosResponse] = await Promise.all([
      getPqcInventory(),
      getPqcScenarios(),
    ]);
    return {
      inventory: inventoryResponse.inventory,
      scenarios: scenariosResponse.scenarios,
      backendConnected: true,
      backendMessage: null as string | null,
    };
  } catch (error) {
    return {
      inventory: [] as CryptoAsset[],
      scenarios: FALLBACK_SCENARIOS as Scenario[],
      backendConnected: false,
      backendMessage:
        error instanceof Error ? error.message : "Unable to reach the Qtangl PQC API.",
    };
  }
}

export default async function AssessPage() {
  const { hero, features, scenarios, cta } = assessPageCopy;
  const { inventory, scenarios: scenarioList, backendConnected, backendMessage } = await prefetch();

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={[
          { href: "#scanner", label: "Start assessment" },
          { href: "/access", label: "Request pilot", variant: "secondary" },
        ]}
      />

      <Section gap="tight" id="scanner" className="scroll-mt-28">
        <ProductModeBanner mode="live" />
        <PqcDemoClient
          initialInventory={inventory}
          initialScenarios={scenarioList}
          backendConnected={backendConnected}
          backendMessage={backendMessage}
          apiBaseUrl={qtanglApiBaseUrl}
        />
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{features.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{features.title}</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {features.items.map((item) => (
            <FeatureCard key={item.title} title={item.title}>
              <p>{item.description}</p>
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{scenarios.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{scenarios.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {scenarios.description}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {scenarios.items.map((item) => (
            <Button key={item.href} href={item.href} variant="secondary">
              {item.label}
            </Button>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <FrameworkCoverageStrip intro="Every assessment maps your quantum-vulnerable findings to the frameworks driving your program — NSM-10, CNSA 2.0, NIST IR 8547, PCI-DSS 4.0, and CMMC — with control themes, deadlines, and a signed report your auditors can verify independently." />
      </Section>

      <Section gap="tight">
        <Eyebrow>Sample artifact</Eyebrow>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-gray-400)]">
          Download a sample CycloneDX CBOM from a banking TLS scenario, verify a signed report, or run a
          live scan above to export your own.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={sampleCbomPath} variant="secondary">
            Download sample CBOM
          </Button>
          <Button href="/verify?token=sample-token" variant="secondary">
            See a signed report
          </Button>
          <Button href="/assess/mini" variant="secondary">
            Free mini-assessment
          </Button>
          <Button href="/q-day/cbom" variant="secondary">
            CBOM guide
          </Button>
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
          <h2 className="heading-section">{cta.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-gray-300)]">
            {cta.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={cta.primary.href}>{cta.primary.label}</Button>
            <Button href={cta.secondary.href} variant="secondary">
              {cta.secondary.label}
            </Button>
          </div>
        </Card>
      </Section>
      <JsonLd data={buildPqcDemoJsonLd({ description: scannerDescription, url: absoluteUrl("/assess") })} />
    </PageShell>
  );
}
