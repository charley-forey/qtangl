import Button from "@/components/ui/Button";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import GridBackground from "@/components/ui/GridBackground";
import ParticleField from "@/components/quantum/ParticleField";
import ProbabilityGrid from "@/components/quantum/ProbabilityGrid";
import StateTransition from "@/components/quantum/StateTransition";
import MethodBadge from "@/components/visualization/quantum/MethodBadge";
import { homeHero } from "@/lib/copy/home";

export default function Hero() {
  const marqueeItems = [
    ...homeHero.valueProps,
    homeHero.signal,
    ...homeHero.visualLabels,
  ];

  return (
    <StateTransition distance={20} parallax parallaxOffset={18}>
      <AnimatedBorderFrame className="min-h-[36rem] rounded-[var(--radius-feature)]">
        <GridBackground className="hero-grid-mask opacity-55" />
        <ProbabilityGrid className="opacity-45 [mask-image:radial-gradient(circle_at_70%_42%,black_18%,transparent_72%)]" />
        <Glow className="hero-orb left-[-5rem] top-[-5rem] h-44 w-44" />
        <Glow className="hero-orb right-[8%] top-[12%] h-72 w-72 bg-white/18" />

        <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[68%]">
          <ParticleField className="opacity-90" density={16} />
        </div>

        <div className="relative z-10 flex min-h-[36rem] flex-col justify-between">
          <div className="max-w-3xl px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <Eyebrow className="text-white/88">{homeHero.eyebrow}</Eyebrow>
            <h1 className="heading-display heading-display--hero gradient-text mt-6 max-w-4xl">
              {homeHero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-gray-200)] sm:text-xl">
              {homeHero.bridge}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-gray-300)] sm:text-lg">
              {homeHero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 md:flex-row">
              <Button href={homeHero.primaryCta.href}>{homeHero.primaryCta.label}</Button>
              <Button href={homeHero.secondaryCta.href} variant="secondary">
                {homeHero.secondaryCta.label}
              </Button>
            </div>

            <div className="mt-10 max-w-xl rounded-[var(--radius-xl)] border border-white/10 bg-black/35 px-5 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:px-6 sm:py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-label text-white/72">Signal</p>
                <MethodBadge method="hybrid" />
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-200)] sm:text-base">
                {homeHero.signal}
              </p>
            </div>
          </div>

          <div className="hero-marquee">
            <div className="hero-marquee-track">
              {[...marqueeItems, ...marqueeItems].map((item, index) => (
                <span key={`${item}-${index}`} className="hero-marquee-chip text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </AnimatedBorderFrame>
    </StateTransition>
  );
}
