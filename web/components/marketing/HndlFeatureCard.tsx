"use client";

import FeatureCard from "@/components/marketing/FeatureCard";
import { trackEvent } from "@/lib/analytics";

type HndlFeatureCardProps = {
  title: string;
  description?: string;
  href: string;
  ctaLabel?: string;
  placement: string;
};

export default function HndlFeatureCard({
  title,
  description,
  href,
  ctaLabel,
  placement,
}: HndlFeatureCardProps) {
  return (
    <FeatureCard
      title={title}
      description={description}
      href={href}
      ctaLabel={ctaLabel}
      onLinkClick={() =>
        trackEvent("hndl_cta_click", {
          destination: href,
          placement,
        })
      }
    />
  );
}
