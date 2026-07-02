"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import ParticleField from "@/components/quantum/ParticleField";
import StateTransition from "@/components/quantum/StateTransition";
import { trackAssessLandingCta } from "@/lib/analytics/assess-landing";
import { assessPageCopy } from "@/lib/copy/readiness-assess";
import { trackEvent } from "@/lib/analytics";

function prefetchScanner() {
  void import("./../pqc/PqcDemoClient");
}

const HERO_SCENARIOS = assessPageCopy.scenarios.items;

export default function AssessHero() {
  const router = useRouter();
  const { hero } = assessPageCopy;
  const primary = hero.actions[0];
  const secondary = hero.actions[1];

  function runScenario(href: string, label: string) {
    trackEvent("assess_hero_scenario_pill", { label });
    router.push(href);
  }

  return (
    <StateTransition distance={20} parallax parallaxOffset={14}>
      <AnimatedBorderFrame className="min-h-[18rem] rounded-[var(--radius-feature)] sm:min-h-[20rem]">
        <Glow className="hero-orb right-[6%] top-[10%] h-48 w-48 bg-white/16" />

        <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[48%]">
          <ParticleField className="opacity-45" density={5} />
          <div className="absolute inset-0 hidden opacity-30 mix-blend-screen lg:block">
            <Image
              src="/marketing/assess-live-scan.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover object-right grayscale"
            />
          </div>
        </div>

        <div className="relative z-10 flex min-h-[18rem] flex-col justify-center sm:min-h-[20rem]">
          <div className="max-w-3xl px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
            <Eyebrow className="text-white/88">{hero.eyebrow}</Eyebrow>
            <h1 className="heading-display heading-display--hero gradient-text mt-4 max-w-3xl tracking-tight">
              {hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-gray-200)] sm:text-lg sm:leading-8">
              {hero.description}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="self-center text-xs text-[var(--color-gray-500)]">Try a scenario:</span>
              {HERO_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.href}
                  type="button"
                  onClick={() => runScenario(scenario.href, scenario.label)}
                  className="touch-target rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
                >
                  {scenario.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--color-gray-500)]">
              Scenarios autorun with fixture data —{" "}
              <Link href="/assess/methodology" className="underline hover:text-white">
                methodology
              </Link>
            </p>
          </div>
        </div>
      </AnimatedBorderFrame>
    </StateTransition>
  );
}
