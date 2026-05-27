import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { faqCategories } from "@/lib/docs/faq";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/resources/faq",
  title: "FAQ",
  description: "Frequently asked questions about Qtangl API integration.",
});

export default function FaqPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/resources/faq" title="FAQ" description="Common questions." />
      <DocsShell
        title="FAQ"
        description="Quick answers for integrators, operators, and evaluators."
        pathname="/docs/resources/faq"
        searchIndex={docsSearchIndex}
      >
        {faqCategories.map((category) => (
          <DocsSection key={category.id}>
            <DocsHeading id={category.id}>{category.title}</DocsHeading>
            <div className="space-y-6">
              {category.items.map((item) => (
                <div key={item.id} id={item.id} className="scroll-mt-28">
                  <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </DocsSection>
        ))}
      </DocsShell>
    </div>
  );
}
