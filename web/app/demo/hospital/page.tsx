import type { Metadata } from "next";

import { Suspense } from "react";

import HospitalDemoClient from "@/components/hospital/HospitalDemoClient";
import PageHero from "@/components/layout/PageHero";
import Card from "@/components/ui/Card";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { qtanglApiBaseUrl } from "@/lib/api";
import { FALLBACK_SCENARIOS } from "@/lib/hospital-fallback";
import { getHospitalRoster, getHospitalScenarios } from "@/lib/hospital";
import type { HospitalRosterNurse, Scenario } from "@/lib/hospital";

export const metadata: Metadata = {
  title: "Hospital re-staffing demo",
  description:
    "See the 04:11 cath-lab call-out solved with a live CP-SAT pass, a replayed hybrid micro-solve, and an audit-ready scoreboard.",
};

type PrefetchResult = {
  roster: HospitalRosterNurse[];
  scenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
};

async function prefetchHospitalData(): Promise<PrefetchResult> {
  try {
    const [rosterResponse, scenariosResponse] = await Promise.all([
      getHospitalRoster(),
      getHospitalScenarios(),
    ]);
    return {
      roster: rosterResponse.roster,
      scenarios: scenariosResponse.scenarios,
      backendConnected: true,
      backendMessage: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach the Qtangl hospital API.";
    return {
      roster: [],
      scenarios: FALLBACK_SCENARIOS,
      backendConnected: false,
      backendMessage: message,
    };
  }
}

export default async function HospitalDemoPage() {
  const { roster, scenarios, backendConnected, backendMessage } =
    await prefetchHospitalData();

  return (
    <PageShell>
      <PageHero
        eyebrow="Headline demo"
        title="Hospital re-staffing at 04:11"
        description="A nurse calls out 49 minutes before the day shift. The command center has to preserve acuity, union rules, fatigue limits, and cost discipline without defaulting to agency."
        actions={[
          { href: "/demo/hospital/methodology", label: "Read methodology", variant: "secondary" },
          { href: "/access?source=demo-hospital", label: "Request pilot access" },
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
          <HospitalDemoClient
            initialRoster={roster}
            initialScenarios={scenarios}
            backendConnected={backendConnected}
            backendMessage={backendMessage}
            apiBaseUrl={qtanglApiBaseUrl}
          />
        </Suspense>
      </Section>
    </PageShell>
  );
}
