import type { Metadata } from "next";

import { Suspense } from "react";

import EvFleetDemoClient from "@/components/ev-fleet/EvFleetDemoClient";
import PageHero from "@/components/layout/PageHero";
import Card from "@/components/ui/Card";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import JsonLd from "@/components/seo/JsonLd";
import { qtanglApiBaseUrl } from "@/lib/api";
import { FALLBACK_SCENARIOS } from "@/lib/ev-fleet-fallback";
import { getEvFleetDepot, getEvFleetScenarios } from "@/lib/ev-fleet";
import type { EvFleetCharger, EvFleetStop, EvFleetVehicle, Scenario } from "@/lib/ev-fleet";
import { absoluteUrl, buildEvFleetDemoJsonLd, buildPageMetadata } from "@/lib/seo";

const description =
  "EV depot charging + routing: VRP route assignment, TOU-aware charger queue, hybrid stagger, and audit-ready QUBO trace.";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo/ev-fleet",
  title: "EV fleet depot charging demo",
  description,
});

async function prefetchEvFleetData() {
  try {
    const [depot, scenarios] = await Promise.all([getEvFleetDepot(), getEvFleetScenarios()]);
    return {
      vehicles: depot.vehicles,
      stops: depot.stops,
      chargers: depot.chargers,
      scenarios: scenarios.scenarios,
      sitePowerCapKw: depot.depot.site_power_cap_kw,
      backendConnected: true,
      backendMessage: null as string | null,
    };
  } catch (error) {
    return {
      vehicles: [] as EvFleetVehicle[],
      stops: [] as EvFleetStop[],
      chargers: [] as EvFleetCharger[],
      scenarios: FALLBACK_SCENARIOS as Scenario[],
      sitePowerCapKw: 86.4,
      backendConnected: false,
      backendMessage: error instanceof Error ? error.message : "Unable to reach the EV fleet API.",
    };
  }
}

export default async function EvFleetDemoPage() {
  const data = await prefetchEvFleetData();

  return (
    <PageShell>
      <PageHero
        eyebrow="Logistics / Last-mile"
        title="EV depot charging + routing"
        description="Upload fleet and stops, run classical VRP + TOU charger scheduling, then hybrid peak staggering—with $/day and peak kW on the scoreboard."
        actions={[
          { href: "/demo/ev-fleet/methodology", label: "Methodology", variant: "secondary" },
          { href: "/access?source=demo-ev-fleet", label: "Request executive briefing" },
        ]}
      />
      <Section gap="tight" className="pb-0">
        <Suspense
          fallback={
            <Card tone="strong" className="rounded-[var(--radius-xl)]">
              <p className="text-sm text-[var(--color-gray-300)]">Loading depot command center…</p>
            </Card>
          }
        >
          <EvFleetDemoClient
            initialVehicles={data.vehicles}
            initialStops={data.stops}
            initialChargers={data.chargers}
            initialScenarios={data.scenarios}
            sitePowerCapKw={data.sitePowerCapKw}
            backendConnected={data.backendConnected}
            backendMessage={data.backendMessage}
            apiBaseUrl={qtanglApiBaseUrl}
          />
        </Suspense>
      </Section>
      <JsonLd
        data={buildEvFleetDemoJsonLd({
          description,
          videoUrl: absoluteUrl("/demos/ev-fleet/walkthrough.mp4"),
        })}
      />
    </PageShell>
  );
}
