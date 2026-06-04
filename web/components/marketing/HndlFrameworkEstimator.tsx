"use client";

import dynamic from "next/dynamic";

import Section from "@/components/layout/Section";
import type { HndlVerticalId } from "@/lib/copy/hndl-data";

const HndlExposureEstimator = dynamic(
  () => import("@/components/marketing/HndlExposureEstimator"),
  {
    loading: () => (
      <div className="h-64 animate-pulse rounded-[var(--radius-feature)] bg-white/5" />
    ),
  },
);

type HndlFrameworkEstimatorProps = {
  defaultVertical: HndlVerticalId;
  frameworkSlug: string;
};

export default function HndlFrameworkEstimator({
  defaultVertical,
  frameworkSlug,
}: HndlFrameworkEstimatorProps) {
  return (
    <Section gap="tight">
      <HndlExposureEstimator
        defaultVertical={defaultVertical}
        source={`framework-${frameworkSlug}`}
      />
    </Section>
  );
}
