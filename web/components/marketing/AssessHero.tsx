"use client";

import Image from "next/image";

import Button from "@/components/ui/Button";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import ParticleField from "@/components/quantum/ParticleField";
import StateTransition from "@/components/quantum/StateTransition";
import { trackAssessLandingCta } from "@/lib/analytics/assess-landing";
import { assessPageCopy } from "@/lib/copy/readiness-assess";

function prefetchScanner() {
  void import("./../pqc/PqcDemoClient");
}

export default function AssessHero() {
  const { hero } = assessPageCopy;
  const primary = hero.actions[0];
  const secondary = hero.actions[1];

  return (
    <StateTransition distance={20} parallax parallaxOffset={14}>
      <AnimatedBorderFrame className="min-h-[24rem] rounded-[var(--radius-feature)] sm:min-h-[26rem]">
        <Glow className="hero-orb right-[6%] top-[10%] h-56 w-56 bg-white/16" />

        <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[52%]">
          <ParticleField className="opacity-50" density={6} />
          <div className="absolute inset-0 hidden opacity-35 mix-blend-screen lg:block">
            <Image
              src="/marketing/assess-live-scan.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover object-right grayscale"
            />
          </div>
        </div>

        <div className="relative z-10 flex min-h-[24rem] flex-col justify-center sm:min-h-[26rem]">
          <div className="max-w-3xl px-6 py-10 sm:px-10 sm:py-14 lg:px-12">
            <Eyebrow className="text-white/88">{hero.eyebrow}</Eyebrow>
            <h1 className="heading-display heading-display--hero gradient-text mt-5 max-w-3xl tracking-tight">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--color-gray-200)]">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                href={primary.href}
                onMouseEnter={prefetchScanner}
                onFocus={prefetchScanner}
                onClick={() => trackAssessLandingCta("hero_primary", primary.href)}
              >
                {primary.label}
              </Button>
              <Button
                href={secondary.href}
                variant="secondary"
                onClick={() => trackAssessLandingCta("hero_secondary", secondary.href)}
              >
                {secondary.label}
              </Button>
            </div>
          </div>
        </div>
      </AnimatedBorderFrame>
    </StateTransition>
  );
}
