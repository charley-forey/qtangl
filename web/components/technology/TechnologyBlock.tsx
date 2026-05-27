import { ReactNode } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type TechnologyBlockProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: "panel" | "embedded";
  id?: string;
};

export default function TechnologyBlock({
  eyebrow,
  title,
  description,
  children,
  className = "",
  contentClassName = "",
  variant = "panel",
  id,
}: TechnologyBlockProps) {
  const header = (
    <>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="heading-section mt-4 !text-2xl">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-gray-300)]">
          {description}
        </p>
      ) : null}
    </>
  );

  const body = (
    <div className={["tech-stack", contentClassName].filter(Boolean).join(" ")}>
      {children}
    </div>
  );

  if (variant === "embedded") {
    return (
      <section id={id} aria-label={title} className={className}>
        {header}
        <div className="mt-6">{body}</div>
      </section>
    );
  }

  return (
    <Card
      id={id}
      as="section"
      tone="strong"
      size="lg"
      aria-label={title}
      className={["rounded-[var(--radius-feature)]", className].filter(Boolean).join(" ")}
    >
      {header}
      <div className="mt-6">{body}</div>
    </Card>
  );
}
