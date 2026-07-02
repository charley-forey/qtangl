"use client";

import Image from "next/image";

import Button from "@/components/ui/Button";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import MonitorHeroVisual from "@/components/marketing/MonitorHeroVisual";
import ParticleField from "@/components/quantum/ParticleField";
import StateTransition from "@/components/quantum/StateTransition";
import { monitorPageCopy } from "@/lib/copy/readiness-monitor";
import { trackEvent } from "@/lib/analytics";

export default function MonitorHero() {
  const { hero, trustSignals } = monitorPageCopy;
  const [primary, secondary] = hero.actions;

  return (
    <StateTransition distance={20} parallax parallaxOffset={14}>
      <AnimatedBorderFrame className="relative min-h-[28rem] overflow-hidden rounded-[var(--radius-feature)] sm:min-h-[30rem] lg:min-h-[32rem]">
        <Glow className="hero-orb left-[6%] top-[8%] h-56 w-56 bg-sky-500/15" />
        <Glow className="hero-orb right-[10%] bottom-[12%] h-40 w-40 bg-emerald-400/10" />

        <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[48%]">
          <ParticleField className="opacity-40" density={7} />
          <div className="absolute inset-0 hidden opacity-30 mix-blend-screen lg:block">
            <Image
              src="/marketing/monitor-diff-alerts.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover object-right grayscale"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/80 to-transparent" />
        </div>

        <div className="relative z-10 grid min-h-[28rem] gap-8 px-6 py-10 sm:min-h-[30rem] sm:px-10 sm:py-12 lg:min-h-[32rem] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-12">
          <div className="max-w-xl">
            <Eyebrow className="text-white/88">{hero.eyebrow}</Eyebrow>
            <h1 className="heading-display heading-display--hero gradient-text mt-4 max-w-3xl tracking-tight sm:mt-5">
              {hero.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--color-gray-200)] sm:mt-5 sm:text-lg sm:leading-8">
              {hero.description}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Button
                href={primary.href}
                onClick={() => trackEvent("monitor_pilot_click", { placement: "hero_primary" })}
              >
                {primary.label}
              </Button>
              {secondary ? (
                <Button href={secondary.href} variant="secondary">
                  {secondary.label}
                </Button>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
              {trustSignals.map((signal) => (
                <Button key={signal.label} href={signal.href} variant="secondary" size="sm">
                  {signal.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md lg:max-w-none lg:justify-self-end">
            <MonitorHeroVisual />
          </div>
        </div>
      </AnimatedBorderFrame>
    </StateTransition>
  );
}
