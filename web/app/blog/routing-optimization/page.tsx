import type { Metadata } from "next";
import Link from "next/link";

import ArticleLayout from "@/components/docs/ArticleLayout";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { articles, blogClosingCta } from "@/lib/copy/articles";
import JsonLd from "@/components/seo/JsonLd";
import { buildBlogPostingJsonLd, buildPageMetadata } from "@/lib/seo";

const article = articles.routing;
const description =
  "Learn how to build route plans teams can actually execute when windows and capacity matter.";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog/routing-optimization",
  title: article.title,
  description,
  type: "article",
  absoluteTitle: true,
});

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
      <JsonLd
        data={buildBlogPostingJsonLd({
          path: "/blog/routing-optimization",
          headline: article.title,
          description,
        })}
      />
    </div>
  );
}
