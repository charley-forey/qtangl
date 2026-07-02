"use client";

import Button from "@/components/ui/Button";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import StateTransition from "@/components/quantum/StateTransition";
import { monitorPageCopy } from "@/lib/copy/readiness-monitor";
import { trackEvent } from "@/lib/analytics";

export default function MonitorHero() {
  const { hero, trustSignals } = monitorPageCopy;
  const [primary, secondary] = hero.actions;

  return (
    <StateTransition distance={16} parallax parallaxOffset={10}>
      <AnimatedBorderFrame className="min-h-[20rem] rounded-[var(--radius-feature)] sm:min-h-[22rem]">
        <Glow className="hero-orb right-[8%] top-[12%] h-48 w-48 bg-sky-400/12" />
        <div className="relative z-10 flex min-h-[20rem] flex-col justify-center px-6 py-10 sm:min-h-[22rem] sm:px-10 sm:py-12 lg:px-12">
          <Eyebrow className="text-white/88">{hero.eyebrow}</Eyebrow>
          <h1 className="heading-display heading-display--hero gradient-text mt-4 max-w-3xl tracking-tight sm:mt-5">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-gray-200)] sm:mt-5 sm:text-lg sm:leading-8">
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
      </AnimatedBorderFrame>
    </StateTransition>
  );
}
