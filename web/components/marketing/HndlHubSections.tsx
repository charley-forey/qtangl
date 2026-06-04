"use client";

import dynamic from "next/dynamic";

import Section from "@/components/layout/Section";
import HndlAudiencePaths from "@/components/marketing/HndlAudiencePaths";
import MoscaCalculator from "@/components/marketing/MoscaCalculator";

const HndlCollectionMatrix = dynamic(() => import("@/components/marketing/HndlCollectionMatrix"), {
  loading: () => <div className="h-48 animate-pulse rounded-[var(--radius-feature)] bg-white/5" />,
});
const HndlShelfLifeChart = dynamic(() => import("@/components/marketing/HndlShelfLifeChart"), {
  loading: () => <div className="h-48 animate-pulse rounded-[var(--radius-feature)] bg-white/5" />,
});
const HndlTimeline = dynamic(() => import("@/components/marketing/HndlTimeline"), {
  loading: () => <div className="h-32 animate-pulse rounded-[var(--radius-feature)] bg-white/5" />,
});
const HndlExposureEstimator = dynamic(() => import("@/components/marketing/HndlExposureEstimator"), {
  loading: () => <div className="h-64 animate-pulse rounded-[var(--radius-feature)] bg-white/5" />,
});
const HndlLeadCapture = dynamic(() => import("@/components/marketing/HndlLeadCapture"), {
  loading: () => <div className="h-32 animate-pulse rounded-[var(--radius-feature)] bg-white/5" />,
});

export default function HndlHubSections() {
  return (
    <>
      <Section gap="tight" id="how-collection-works">
        <HndlCollectionMatrix />
      </Section>
      <Section gap="tight">
        <HndlShelfLifeChart />
      </Section>
      <Section gap="tight">
        <HndlExposureEstimator />
      </Section>
      <Section gap="tight">
        <MoscaCalculator />
      </Section>
      <Section gap="tight">
        <HndlTimeline dataYears={35} migrationYears={7} quantumYears={10} />
      </Section>
      <HndlAudiencePaths />
      <Section gap="tight" className="pb-0">
        <HndlLeadCapture source="q-day-hndl" />
      </Section>
    </>
  );
}
