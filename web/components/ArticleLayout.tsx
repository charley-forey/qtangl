import Image from "next/image";
import { ReactNode } from "react";

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
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">{intro}</p>
        {coverImage ? (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-[0_20px_80px_rgba(8,15,29,0.45)]">
            <Image
              src={coverImage}
              alt={coverAlt ?? ""}
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <article className="article-copy mt-12">
          {children}
        </article>
      </div>
    </main>
  );
}
