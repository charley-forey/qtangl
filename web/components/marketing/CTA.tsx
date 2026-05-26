import Button from "@/components/ui/Button";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import { accessCtas, accessPanel } from "@/lib/copy/access";

export default function CTA() {
  return (
    <AnimatedBorderFrame className="overflow-hidden rounded-[var(--radius-feature)]">
      <Glow className="hero-orb right-[-3rem] top-[-4rem] h-36 w-36 bg-white/18" />
      <div className="relative grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10 lg:py-10">
        <div className="max-w-2xl">
          <Eyebrow>{accessPanel.eyebrow}</Eyebrow>
          <h2 className="heading-section gradient-text mt-4 sm:!text-4xl">
            {accessPanel.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            {accessPanel.description}
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--color-gray-400)]">
            {accessPanel.formHint}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button href={accessCtas.primary.href}>{accessCtas.primary.label}</Button>
          <Button href={accessCtas.secondary.href} variant="secondary">
            {accessCtas.secondary.label}
          </Button>
        </div>
      </div>
    </AnimatedBorderFrame>
  );
}
