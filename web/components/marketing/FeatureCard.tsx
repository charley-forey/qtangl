import Link from "next/link";
import { ReactNode, useId } from "react";

import CoverImage from "@/components/marketing/CoverImage";
import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";
import { isSvgCover } from "@/lib/cover-image";

type FeatureCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  children?: ReactNode;
  ctaLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
  onLinkClick?: () => void;
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
  onLinkClick,
}: FeatureCardProps) {
  const titleId = useId();
  const resolvedImageAlt = imageSrc ? imageAlt?.trim() || `${title} illustration` : undefined;
  const svgCover = imageSrc ? isSvgCover(imageSrc) : false;

  return (
    <Card
      as="article"
      tone="feature"
      size="lg"
      interactive={Boolean(href)}
      className="group relative h-full rounded-[var(--radius-feature)]"
      aria-labelledby={titleId}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_40%)]" />
      <div className="relative">
        {imageSrc ? (
          <div className="mb-6 aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[#141414]">
            <CoverImage
              src={imageSrc}
              alt={resolvedImageAlt ?? title}
              className={
                svgCover
                  ? "object-contain p-1 transition duration-500 group-hover:scale-[1.01]"
                  : "object-cover grayscale transition duration-500 group-hover:scale-[1.02]"
              }
            />
          </div>
        ) : null}
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h3 id={titleId} className="mt-3 text-xl font-semibold tracking-tight text-white">
          {href ? (
            <Link
              href={href}
              onClick={onLinkClick}
              className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {description ? (
          <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{description}</p>
        ) : null}
        {children ? (
          <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {children}
          </div>
        ) : null}
        {ctaLabel ? (
          <p
            className={`mt-6 text-sm font-medium ${
              href ? "text-white" : "text-[var(--color-gray-500)]"
            }`}
          >
            {ctaLabel}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
