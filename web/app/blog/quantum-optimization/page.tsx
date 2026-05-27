import type { Metadata } from "next";
import Link from "next/link";

import ArticleLayout from "@/components/docs/ArticleLayout";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import HybridStackDiagram from "@/components/visualization/quantum/HybridStackDiagram";
import MethodBadge from "@/components/visualization/quantum/MethodBadge";
import { articles, blogClosingCta } from "@/lib/copy/articles";
import JsonLd from "@/components/seo/JsonLd";
import { buildBlogPostingJsonLd, buildPageMetadata } from "@/lib/seo";

const article = articles.quantumOptimization;
const description =
  "Learn where quantum-assisted search can help teams evaluate harder planning problems without overstating the current stack.";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog/quantum-optimization",
  title: article.title,
  description,
  type: "article",
  absoluteTitle: true,
});

export default function QuantumOptimizationPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <ArticleLayout
        eyebrow={article.eyebrow}
        title={article.title}
        intro={article.intro}
        coverImage={article.coverImage}
        coverAlt={article.coverAlt}
      >
        {article.sections.slice(0, 2).map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <section>
          <h2>How the honest stack is weighted</h2>
          <p>
            The brand can be quantum-forward without pretending the system is quantum-first.
            The chart below shows where the runtime and orchestration weight lives today.
          </p>
          <div className="mt-6">
            <HybridStackDiagram />
          </div>
          <div className="mt-5">
            <MethodBadge method="hybrid" />
          </div>
        </section>

        {article.sections.slice(2).map((section) => (
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
          path: "/blog/quantum-optimization",
          headline: article.title,
          description,
        })}
      />
    </div>
  );
}
