import { ReactNode } from "react";

type ArticleLayoutProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export default function ArticleLayout({
  eyebrow,
  title,
  intro,
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
        <article className="article-copy mt-12">
          {children}
        </article>
      </div>
    </main>
  );
}
