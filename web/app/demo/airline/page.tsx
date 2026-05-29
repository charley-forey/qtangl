import type { Metadata } from "next";

import { Suspense } from "react";

import AirlineDemoClient from "@/components/airline/AirlineDemoClient";
import PageHero from "@/components/layout/PageHero";
import Card from "@/components/ui/Card";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { qtanglApiBaseUrl } from "@/lib/api";
import { FALLBACK_SCENARIOS } from "@/lib/airline-fallback";
import { getAirlineNetwork, getAirlineScenarios } from "@/lib/airline";
import type { AirlineCrewMember, AirlineFlight, Scenario } from "@/lib/airline";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, buildAirlineDemoJsonLd, buildPageMetadata } from "@/lib/seo";

const airlineDemoDescription =
  "OCC disruption recovery: tail routing repair, multi-leg crew rebid, hybrid alternates, and FAR 117 audit packs.";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo/airline",
  title: "Airline crew recovery demo",
  description: airlineDemoDescription,
});

type PrefetchResult = {
  crew: AirlineCrewMember[];
  flights: AirlineFlight[];
  scenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
};

async function prefetchAirlineData(): Promise<PrefetchResult> {
  try {
    const [networkResponse, scenariosResponse] = await Promise.all([
      getAirlineNetwork(),
      getAirlineScenarios(),
    ]);
    return {
      crew: networkResponse.crew,
      flights: networkResponse.flights,
      scenarios: scenariosResponse.scenarios,
      backendConnected: true,
      backendMessage: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach the Qtangl airline API.";
    return {
      crew: [],
      flights: [],
      scenarios: FALLBACK_SCENARIOS,
      backendConnected: false,
      backendMessage: message,
    };
  }
}

export default async function AirlineDemoPage() {
  const { crew, flights, scenarios, backendConnected, backendMessage } =
    await prefetchAirlineData();

  return (
    <PageShell>
      <PageHero
        eyebrow="Aviation operations"
        title="Auditable crew & flight disruption recovery"
        description="When a tail goes MX or FAR 117 bites, OCC needs a defensible recovery in minutes—not a cascade of cancels. See routing repair, multi-leg crew assignment, hybrid alternates, and compliance-ready audit trails."
        actions={[
          { href: "/demo/airline/methodology", label: "Methodology", variant: "secondary" },
          { href: "/access?source=demo-airline", label: "Request executive briefing" },
        ]}
      />
      <Section gap="tight" className="pb-0">
        <Suspense
          fallback={
            <Card tone="strong" className="rounded-[var(--radius-xl)]">
              <p className="text-sm text-[var(--color-gray-300)]">Loading OCC command center…</p>
            </Card>
          }
        >
          <AirlineDemoClient
            initialCrew={crew}
            initialFlights={flights}
            initialScenarios={scenarios}
            backendConnected={backendConnected}
            backendMessage={backendMessage}
            apiBaseUrl={qtanglApiBaseUrl}
          />
        </Suspense>
      </Section>
      <JsonLd
        data={buildAirlineDemoJsonLd({
          description: airlineDemoDescription,
          videoUrl: absoluteUrl("/demos/airline/walkthrough.mp4"),
        })}
      />
    </PageShell>
  );
}
