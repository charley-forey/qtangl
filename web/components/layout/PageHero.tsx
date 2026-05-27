import { ReactNode } from "react";

import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
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
  actions?: readonly PageHeroAction[];
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
    <Section gap="tight" className="pt-8 sm:pt-10">
      <div className={contentClassName}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="heading-display gradient-text mt-4 overflow-visible pb-[0.1em]">
          {title}
        </h1>
        <p className="text-body-lg mt-6 max-w-3xl text-[var(--color-gray-300)]">
          {description}
        </p>

        {actions?.length ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Button
                key={action.href}
                href={action.href}
                variant={action.variant === "secondary" ? "secondary" : "primary"}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
