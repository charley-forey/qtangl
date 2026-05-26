import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";

type FeatureCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  href?: string;
  children?: ReactNode;
  ctaLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export default function FeatureCard({
  eyebrow,
  title,
  description,
  href,
  children,
  ctaLabel,
  imageSrc,
  imageAlt,
}: FeatureCardProps) {
  const content = (
    <Card
      as="article"
      strong
      interactive={Boolean(href)}
      className="relative h-full overflow-hidden rounded-[2rem] p-6 sm:p-7"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_40%)]" />
      <div className="relative">
        {imageSrc ? (
          <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] bg-black/60">
            <Image
              src={imageSrc}
              alt={imageAlt ?? title}
              fill
              sizes="(min-width: 1280px) 24vw, (min-width: 768px) 42vw, 100vw"
              className="object-cover grayscale"
            />
          </div>
        ) : null}
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
          {description}
        </p>
        {children ? (
          <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {children}
          </div>
        ) : null}
        {ctaLabel ? (
          <p className="mt-6 text-sm font-medium text-white">{ctaLabel}</p>
        ) : null}
      </div>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
