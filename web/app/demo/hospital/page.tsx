import type { Metadata } from "next";

import OrCommandCenter from "@/components/hospital/OrCommandCenter";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { getHospitalRoster, getHospitalScenarios } from "@/lib/hospital";

export const metadata: Metadata = {
  title: "Hospital re-staffing demo",
  description:
    "See the 04:11 cath-lab call-out solved with a live CP-SAT pass, a replayed hybrid micro-solve, and an audit-ready scoreboard.",
};

export default async function HospitalDemoPage() {
  const [rosterResponse, scenariosResponse] = await Promise.all([
    getHospitalRoster(),
    getHospitalScenarios(),
  ]);

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
        <OrCommandCenter
          initialRoster={rosterResponse.roster}
          initialScenarios={scenariosResponse.scenarios}
        />
      </Section>
    </PageShell>
  );
}
