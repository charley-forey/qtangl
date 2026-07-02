import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AssessHero from "@/components/marketing/AssessHero";
import AssessLandingMarketing from "@/components/marketing/AssessLandingMarketing";
import AssessPageShell, { AssessPageProvider } from "@/components/marketing/AssessPageShell";
import ApiPreviewSection from "@/components/marketing/ApiPreviewSection";
import CTA from "@/components/marketing/CTA";
import ContentQualityStrip from "@/components/marketing/ContentQualityStrip";
import QDayLearningStrip from "@/components/marketing/QDayLearningStrip";
import AssessPhaseRibbon from "@/components/layout/AssessPhaseRibbon";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AssessScannerLoader from "@/components/pqc/AssessScannerLoader";
import JsonLd from "@/components/seo/JsonLd";
import StateTransition from "@/components/quantum/StateTransition";
import { qtanglApiBaseUrl } from "@/lib/api";
import { assessTrustSignals } from "@/lib/copy/readiness-assess-faq";
import { assessApiPreview, assessOpsNote } from "@/lib/copy/readiness-assess-demos";
import { assessPageCopy } from "@/lib/copy/readiness-assess";
import { FALLBACK_SCENARIOS } from "@/lib/pqc-fallback";
import { getPqcInventory, getPqcScenarios } from "@/lib/pqc";
import type { CryptoAsset, Scenario } from "@/lib/pqc";
import {
  absoluteUrl,
  buildAssessPageJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
  buildPqcDemoJsonLd,
} from "@/lib/seo";
import { assessFaqItems } from "@/lib/copy/readiness-assess-faq";

const scannerDescription =
  "Live Q-Day assessment: inventory quantum-vulnerable cryptography, Mosca HNDL risk, and signed evidence exports.";

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

export default async function AssessPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  if (params.mode === "mini") {
    redirect("/assess/mini");
  }

  const { inventory, scenarios: scenarioList, backendConnected, backendMessage } = await prefetch();

  return (
    <PageShell>
      <AssessPageProvider>
        <AssessHero />

        <Section gap="tight" id="learn" className="scroll-mt-28">
          <StateTransition>
            <QDayLearningStrip />
          </StateTransition>
        </Section>

        <AssessPhaseRibbon />

        <Section gap="tight">
          <StateTransition delay={0.04}>
            <ApiPreviewSection
              eyebrow={assessApiPreview.eyebrow}
              title={assessApiPreview.title}
              description={assessApiPreview.description}
              docsHref={assessApiPreview.docsHref}
            />
          </StateTransition>
        </Section>

        <AssessPageShell
          marketingBelow={
            <>
              <AssessLandingMarketing />
              <Section gap="tight" className="pb-0">
                <CTA panel={assessPageCopy.ctaPanel} />
              </Section>
            </>
          }
        >
          <Section gap="tight" id="scanner" className="scroll-mt-28">
            <ContentQualityStrip />
            <div className="mb-6 mt-6 flex flex-wrap gap-3">
              {assessTrustSignals.map((signal) => (
                <Button key={signal.label} href={signal.href} variant="secondary" size="sm">
                  {signal.label}
                </Button>
              ))}
            </div>
            <Card tone="panel" className="mb-6 p-4">
              <p className="text-sm text-[var(--muted)]">
                <span className="font-medium text-white">{assessOpsNote.liveLabel}</span>{" "}
                {assessOpsNote.liveDetail}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                <span className="font-medium text-white">{assessOpsNote.opsLabel}</span>{" "}
                {assessOpsNote.opsDetail}{" "}
                <a href="/assess/methodology" className="text-white underline">
                  Methodology & rate limits
                </a>
                .
              </p>
              {!backendConnected && backendMessage ? (
                <p className="mt-2 text-sm text-amber-200">
                  API unreachable — scanner will use offline fixture scenarios until connection is restored.
                </p>
              ) : null}
            </Card>
            <AssessScannerLoader
              initialInventory={inventory}
              initialScenarios={scenarioList}
              backendConnected={backendConnected}
              backendMessage={backendMessage}
              apiBaseUrl={qtanglApiBaseUrl}
            />
          </Section>
        </AssessPageShell>
      </AssessPageProvider>

      <JsonLd data={buildPqcDemoJsonLd({ description: scannerDescription, url: absoluteUrl("/assess") })} />
      <JsonLd data={buildFaqJsonLd(assessFaqItems)} />
      <JsonLd data={buildAssessPageJsonLd()} />
    </PageShell>
  );
}
