"use client";

import CoverImage from "@/components/marketing/CoverImage";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import { convertPageCopy } from "@/lib/copy/readiness-convert";

export default function ConvertHeroSection() {
  const { hero } = convertPageCopy;

  return (
    <AnimatedBorderFrame className="overflow-hidden rounded-[var(--radius-feature)]">
      <Glow className="hero-orb right-[-3rem] top-[-4rem] h-36 w-36 bg-white/12" />
      <Card tone="feature" size="lg" className="relative rounded-[var(--radius-feature)] border-0 bg-transparent">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(260px,380px)] lg:items-center">
          <div>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
            <h1 className="heading-display gradient-text mt-4">{hero.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-gray-300)]">
              {hero.description}
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-8 sm:max-w-lg">
              <div>
                <dt className="text-label text-[var(--color-gray-500)]">{hero.kpis[0].label}</dt>
                <dd className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  {hero.kpis[0].value}
                </dd>
              </div>
              <div>
                <dt className="text-label text-[var(--color-gray-500)]">{hero.kpis[1].label}</dt>
                <dd className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  {hero.kpis[1].value}
                </dd>
              </div>
              <div>
                <dt className="text-label text-[var(--color-gray-500)]">{hero.kpis[2].label}</dt>
                <dd className="mt-2 text-2xl font-semibold tracking-tight text-emerald-300">
                  {hero.kpis[2].value}
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              {hero.actions.map((action) => (
                <Button
                  key={action.href}
                  href={action.href}
                  variant={"variant" in action && action.variant === "secondary" ? "secondary" : "primary"}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="group relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[#141414]">
              <CoverImage
                src={hero.screenshot}
                alt={hero.screenshotAlt}
                className="object-cover grayscale transition duration-500 group-hover:scale-[1.02]"
                priority
              />
              <span className="absolute left-3 top-3 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-emerald-200">
                {hero.liveBadge}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </AnimatedBorderFrame>
  );
}
