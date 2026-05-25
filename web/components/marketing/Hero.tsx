import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import GridBackground from "@/components/ui/GridBackground";
import EntanglementField from "@/components/quantum/EntanglementField";
import ProbabilityGrid from "@/components/quantum/ProbabilityGrid";
import StateTransition from "@/components/quantum/StateTransition";
import { homeHero } from "@/lib/copy/home";

export default function Hero() {
  return (
    <div className="grid items-center gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:gap-10">
      <StateTransition>
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] px-5 py-7 sm:px-7 sm:py-9 lg:px-8 lg:py-10">
          <GridBackground className="opacity-60" />
          <ProbabilityGrid className="opacity-70" />
          <div className="relative z-10">
            <Eyebrow>{homeHero.eyebrow}</Eyebrow>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {homeHero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-gray-200)]">
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

            <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {homeHero.valueProps.map((item, index) => (
                <StateTransition key={item} delay={0.05 * index}>
                  <Card className="h-full rounded-2xl p-4">
                    <p className="text-sm leading-7 text-[var(--color-gray-300)]">
                      {item}
                    </p>
                  </Card>
                </StateTransition>
              ))}
            </div>
          </div>
        </div>
      </StateTransition>

      <StateTransition delay={0.08}>
        <EntanglementField />
      </StateTransition>
    </div>
  );
}
