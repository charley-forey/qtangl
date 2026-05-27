import Link from "next/link";

import Button from "@/components/ui/Button";
import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Eyebrow from "@/components/ui/Eyebrow";
import Glow from "@/components/ui/Glow";
import { accessCtas, accessPanel } from "@/lib/copy/access";

export default function CTA() {
  return (
    <AnimatedBorderFrame className="overflow-hidden rounded-[var(--radius-feature)]">
      <Glow className="hero-orb right-[-3rem] top-[-4rem] h-36 w-36 bg-white/18" />
      <div className="relative px-6 py-10 sm:px-10 sm:py-12">
        <div className="max-w-2xl">
          <Eyebrow>{accessPanel.eyebrow}</Eyebrow>
          <h2 className="heading-section gradient-text mt-4 sm:!text-4xl">
            {accessPanel.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            {accessPanel.description}
          </p>
        </div>
        <div className="mt-8 flex flex-col items-start gap-4">
          <Button href={accessCtas.primary.href}>{accessCtas.primary.label}</Button>
          <Link
            href={accessPanel.docsLink.href}
            className="text-sm text-[var(--color-gray-400)] underline-offset-4 transition hover:text-white hover:underline"
          >
            {accessPanel.docsLink.label}
          </Link>
        </div>
      </div>
    </AnimatedBorderFrame>
  );
}
