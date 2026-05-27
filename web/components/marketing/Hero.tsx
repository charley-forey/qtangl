import Button from "@/components/ui/Button";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import ParticleField from "@/components/quantum/ParticleField";
import StateTransition from "@/components/quantum/StateTransition";
import { homeHero } from "@/lib/copy/home";

export default function Hero() {
  return (
    <StateTransition distance={20} parallax parallaxOffset={18}>
      <AnimatedBorderFrame className="min-h-[28rem] rounded-[var(--radius-feature)] sm:min-h-[30rem]">
        <Glow className="hero-orb right-[8%] top-[12%] h-72 w-72 bg-white/18" />

        <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[58%]">
          <ParticleField className="opacity-70" density={10} />
        </div>

        <div className="relative z-10 flex min-h-[28rem] flex-col justify-center sm:min-h-[30rem]">
          <div className="max-w-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
            <Eyebrow className="text-white/88">{homeHero.eyebrow}</Eyebrow>
            <h1 className="heading-display heading-display--hero gradient-text mt-6 max-w-4xl tracking-tight">
              {homeHero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--color-gray-200)] sm:text-xl">
              {homeHero.subhead}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href={homeHero.primaryCta.href}>{homeHero.primaryCta.label}</Button>
              <Button href={homeHero.secondaryCta.href} variant="secondary">
                {homeHero.secondaryCta.label}
              </Button>
            </div>
          </div>
        </div>
      </AnimatedBorderFrame>
    </StateTransition>
  );
}
