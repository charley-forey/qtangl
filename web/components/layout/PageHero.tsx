import Link from "next/link";
import { ReactNode } from "react";

import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";

type PageHeroAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type PageHeroProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  actions?: PageHeroAction[];
  contentClassName?: string;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
  contentClassName = "content-reading",
}: PageHeroProps) {
  return (
    <Section className="pt-12 sm:pt-16">
      <div className={contentClassName}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-gray-300)]">
          {description}
        </p>

        {actions?.length ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={[
                  "touch-target inline-flex items-center rounded-full border px-4 py-2 text-sm transition",
                  action.variant === "secondary"
                    ? "border-[var(--border)] text-[var(--color-gray-300)] hover:border-[var(--border-strong)] hover:text-white"
                    : "border-[var(--border)] text-white hover:border-[var(--border-strong)] hover:bg-white/[0.04]",
                ].join(" ")}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
