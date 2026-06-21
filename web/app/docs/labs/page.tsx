import type { Metadata } from "next";
import Link from "next/link";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import FeatureCard from "@/components/marketing/FeatureCard";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/labs",
  title: "Labs — optimization demos",
  description:
    "Experimental optimization APIs and industry demo walkthroughs (hospital, airline, EV fleet). Separate from the PQC readiness product path.",
});

export default function LabsOverviewPage() {
  return (
    <GuidePageLayout
      pathname="/docs/labs"
      title="Labs / optimization"
      description="Industry demo APIs and hybrid routing experiments. Use the PQC docs for production readiness workflows."
    >
      <DocsSection>
        <DocsHeading>Core optimization API</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          <Link href="/docs/reference/optimize" className="text-white underline underline-offset-4">
            POST /optimize
          </Link>{" "}
          is the general-purpose routing endpoint. See the{" "}
          <Link href="/docs/guides/schedule" className="text-white underline underline-offset-4">
            schedule guide
          </Link>
          ,{" "}
          <Link href="/docs/guides/routing" className="text-white underline underline-offset-4">
            routing guide
          </Link>
          , and{" "}
          <Link href="/docs/guides/allocation" className="text-white underline underline-offset-4">
            allocation guide
          </Link>{" "}
          for workflow context.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Industry demos</DocsHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureCard
            title="Hospital demo"
            description="Nurse call-out re-staffing with classical and hybrid scoreboards."
            href="/docs/guides/hospital-demo"
          />
          <FeatureCard
            title="Airline demo"
            description="Disruption recovery and crew re-assignment."
            href="/docs/guides/airline-demo"
          />
          <FeatureCard
            title="EV fleet demo"
            description="Depot charging and route planning under time windows."
            href="/docs/guides/ev-fleet-demo"
          />
        </div>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Hospital API reference</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <Link href="/docs/reference/hospital/roster" className="text-white underline underline-offset-4">
              GET /hospital/roster
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/hospital/scenarios" className="text-white underline underline-offset-4">
              GET /hospital/scenarios
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/hospital/callout" className="text-white underline underline-offset-4">
              GET /hospital/callout
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/hospital/qpu-trace" className="text-white underline underline-offset-4">
              GET /hospital/qpu-trace
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/hospital/upload-roster" className="text-white underline underline-offset-4">
              POST /hospital/upload-roster
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/hospital/callout-solve" className="text-white underline underline-offset-4">
              POST /hospital/callout/solve
            </Link>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Airline API reference</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <Link href="/docs/reference/airline/network" className="text-white underline underline-offset-4">
              GET /airline/network
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/airline/scenarios" className="text-white underline underline-offset-4">
              GET /airline/scenarios
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/airline/disruption" className="text-white underline underline-offset-4">
              GET /airline/disruption
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/airline/qpu-trace" className="text-white underline underline-offset-4">
              GET /airline/qpu-trace
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/airline/upload-crew" className="text-white underline underline-offset-4">
              POST /airline/upload-crew
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/airline/recover-solve" className="text-white underline underline-offset-4">
              POST /airline/recover/solve
            </Link>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>EV fleet API reference</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <Link href="/docs/reference/ev-fleet/depot" className="text-white underline underline-offset-4">
              GET /ev-fleet/depot
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/ev-fleet/scenarios" className="text-white underline underline-offset-4">
              GET /ev-fleet/scenarios
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/ev-fleet/window" className="text-white underline underline-offset-4">
              GET /ev-fleet/window
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/ev-fleet/qpu-trace" className="text-white underline underline-offset-4">
              GET /ev-fleet/qpu-trace
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/ev-fleet/upload-fleet" className="text-white underline underline-offset-4">
              POST /ev-fleet/upload-fleet
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/ev-fleet/upload-stops" className="text-white underline underline-offset-4">
              POST /ev-fleet/upload-stops
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/ev-fleet/plan-solve" className="text-white underline underline-offset-4">
              POST /ev-fleet/plan/solve
            </Link>
          </li>
        </ul>
      </DocsSection>
    </GuidePageLayout>
  );
}
