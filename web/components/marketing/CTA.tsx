import Link from "next/link";

import Button from "@/components/ui/Button";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import { readinessCtaPanel } from "@/lib/copy/readiness-home";

export default function CTA() {
  return (
    <AnimatedBorderFrame className="overflow-hidden rounded-[var(--radius-feature)]">
      <Glow className="hero-orb right-[-3rem] top-[-4rem] h-36 w-36 bg-white/18" />
      <div className="relative px-6 py-10 sm:px-10 sm:py-12">
        <div className="max-w-2xl">
          <Eyebrow>{readinessCtaPanel.eyebrow}</Eyebrow>
          <h2 className="heading-section gradient-text mt-4 sm:!text-4xl">
            {readinessCtaPanel.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            {readinessCtaPanel.description}
          </p>
        </div>
        <div className="mt-8 flex flex-col items-start gap-4">
          <div className="flex flex-wrap gap-3">
            <Button href={readinessCtaPanel.primaryCta.href}>
              {readinessCtaPanel.primaryCta.label}
            </Button>
            <Button href={readinessCtaPanel.secondaryCta.href} variant="secondary">
              {readinessCtaPanel.secondaryCta.label}
            </Button>
          </div>
          <Link
            href={readinessCtaPanel.docsLink.href}
            className="text-sm text-[var(--color-gray-400)] underline-offset-4 transition hover:text-white hover:underline"
          >
            {readinessCtaPanel.docsLink.label}
          </Link>
        </div>
      </div>
    </AnimatedBorderFrame>
  );
}
