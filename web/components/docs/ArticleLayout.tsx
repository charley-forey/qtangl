import Image from "next/image";
import { ReactNode } from "react";

import ProbabilityGrid from "@/components/quantum/ProbabilityGrid";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { articleOutcomeStrip } from "@/lib/copy/articles";

type ArticleLayoutProps = {
  eyebrow: string;
  title: string;
  intro: string;
  coverImage?: string;
  coverAlt?: string;
  children: ReactNode;
};

export default function ArticleLayout({
  eyebrow,
  title,
  intro,
  coverImage,
  coverAlt,
  children,
}: ArticleLayoutProps) {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[var(--container-reading)] px-6 py-16 sm:px-8 sm:py-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="heading-display gradient-text mt-4">{title}</h1>
        <p className="text-body-lg mt-6 max-w-3xl text-[var(--color-gray-300)]">
          {intro}
        </p>

        {coverImage ? (
          <Card tone="feature" size="sm" className="relative mt-10 overflow-hidden rounded-[var(--radius-feature)] p-0">
            <div className="relative aspect-[16/9]">
              <Image
                src={coverImage}
                alt={coverAlt ?? ""}
                fill
                sizes="(min-width: 1024px) 768px, 100vw"
                className="object-cover grayscale"
              />
            </div>
          </Card>
        ) : null}

        <Card tone="strong" size="sm" className="relative mt-10 overflow-hidden rounded-[var(--radius-feature)] p-0">
          <ProbabilityGrid />
          <div className="relative grid gap-6 px-8 py-10 sm:grid-cols-3">
            {articleOutcomeStrip.map((item) => (
              <div key={item.label}>
                <p className="text-label">{item.label}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <article className="article-copy mt-12 text-[1.0625rem]">{children}</article>
      </div>
    </main>
  );
}
