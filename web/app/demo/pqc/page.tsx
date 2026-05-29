import type { Metadata } from "next";
import { Suspense } from "react";

import PqcDemoClient from "@/components/pqc/PqcDemoClient";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import JsonLd from "@/components/seo/JsonLd";
import { qtanglApiBaseUrl } from "@/lib/api";
import { FALLBACK_SCENARIOS } from "@/lib/pqc-fallback";
import { getPqcInventory, getPqcScenarios } from "@/lib/pqc";
import type { CryptoAsset, Scenario } from "@/lib/pqc";
import { absoluteUrl, buildPageMetadata, buildPqcDemoJsonLd } from "@/lib/seo";

const description =
  "Q-Day readiness scanner: inventory quantum-vulnerable cryptography, Mosca HNDL risk, and live post-quantum TLS handshake proof.";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo/pqc",
  title: "Q-Day readiness scanner",
  description,
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

export default async function PqcDemoPage() {
  const { inventory, scenarios, backendConnected, backendMessage } = await prefetch();

  return (
    <PageShell>
      <PageHero
        eyebrow="Post-quantum security"
        title="Q-Day readiness scanner"
        description="Inventory RSA/ECDSA exposure, quantify harvest-now-decrypt-later risk with Mosca's inequality, and prove hybrid ML-KEM TLS — the defense side of Q-Day."
        actions={[
          { href: "/demo/pqc/methodology", label: "Methodology", variant: "secondary" },
          { href: "/access?source=demo-pqc", label: "Request executive briefing" },
        ]}
      />
      <Section gap="tight" className="pb-0">
        <Suspense
          fallback={
            <Card tone="strong" className="rounded-[var(--radius-xl)]">
              <p className="text-sm text-[var(--color-gray-300)]">Loading command center…</p>
            </Card>
          }
        >
          <PqcDemoClient
            initialInventory={inventory}
            initialScenarios={scenarios}
            backendConnected={backendConnected}
            backendMessage={backendMessage}
            apiBaseUrl={qtanglApiBaseUrl}
          />
        </Suspense>
      </Section>
      <JsonLd data={buildPqcDemoJsonLd({ description })} />
    </PageShell>
  );
}
