import type { Metadata } from "next";
import Link from "next/link";

import ArticleLayout from "@/components/docs/ArticleLayout";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { articles, blogClosingCta } from "@/lib/copy/articles";

const article = articles.routing;

export const metadata: Metadata = {
  title: article.title,
  description:
    "Learn how to build route plans teams can actually execute when windows and capacity matter.",
};

export default function RoutingOptimizationPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <ArticleLayout
        eyebrow={article.eyebrow}
        title={article.title}
        intro={article.intro}
        coverImage={article.coverImage}
        coverAlt={article.coverAlt}
      >
        {article.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <section>
          <h2>{blogClosingCta.title}</h2>
          <p>
            {blogClosingCta.description}{" "}
            <Link href={blogClosingCta.href}>{blogClosingCta.label}</Link>.
          </p>
        </section>
      </ArticleLayout>
    </div>
  );
}
