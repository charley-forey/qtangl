import Image from "next/image";

import Button from "@/components/ui/Button";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import ParticleField from "@/components/quantum/ParticleField";
import StateTransition from "@/components/quantum/StateTransition";
import { readinessHero } from "@/lib/copy/readiness-home";

type HeroCopy = {
  eyebrow: string;
  title: string;
  subhead: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

type HeroProps = {
  copy?: HeroCopy;
};

export default function Hero({ copy = readinessHero }: HeroProps) {
  return (
    <StateTransition distance={20} parallax parallaxOffset={18}>
      <AnimatedBorderFrame className="min-h-[28rem] rounded-[var(--radius-feature)] sm:min-h-[30rem]">
        <Glow className="hero-orb right-[8%] top-[12%] h-72 w-72 bg-white/18" />

        <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[58%]">
          <ParticleField className="opacity-70" density={10} />
          <div className="absolute inset-0 hidden opacity-40 mix-blend-screen lg:block">
            <Image
              src="/marketing/home-hero-crypto-network.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover object-right grayscale"
            />
          </div>
        </div>

        <div className="relative z-10 flex min-h-[28rem] flex-col justify-center sm:min-h-[30rem]">
          <div className="max-w-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
            <Eyebrow className="text-white/88">{copy.eyebrow}</Eyebrow>
            <h1 className="heading-display heading-display--hero gradient-text mt-6 max-w-4xl tracking-tight">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--color-gray-200)] sm:text-xl">
              {copy.subhead}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href={copy.primaryCta.href}>{copy.primaryCta.label}</Button>
              <Button href={copy.secondaryCta.href} variant="secondary">
                {copy.secondaryCta.label}
              </Button>
            </div>
          </div>
        </div>
      </AnimatedBorderFrame>
    </StateTransition>
  );
}
