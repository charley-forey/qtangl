import Link from "next/link";

import FeatureCard from "@/components/marketing/FeatureCard";
import PageHero from "@/components/layout/PageHero";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  getQDayArticle,
  getRelatedQDayResources,
  qDayHubCopy,
} from "@/lib/copy/readiness-qday-hub";

type QDayArticlePageProps = {
  slug: string;
};

export default function QDayArticlePage({ slug }: QDayArticlePageProps) {
  const article = getQDayArticle(slug);
  if (!article) {
    return null;
  }

  const related = getRelatedQDayResources(article.related);

  return (
    <>
      <PageHero
        eyebrow={article.eyebrow}
        title={article.title}
        description={article.description}
        actions={[
          { href: "/assess", label: "Run Q-Day scan" },
          { href: "/q-day", label: "Back to hub", variant: "secondary" },
        ]}
      />

      {article.sections.map((section) => (
        <Section key={section.heading} gap="tight">
          <div className="content-reading">
            <h2 className="heading-section">{section.heading}</h2>
            <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">{section.body}</p>
          </div>
        </Section>
      ))}

      {related.length ? (
        <Section gap="tight">
          <Eyebrow>Related</Eyebrow>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <FeatureCard
                key={item.slug}
                title={item.title}
                description={item.description}
                href={item.href}
                ctaLabel="Read guide →"
              />
            ))}
          </div>
        </Section>
      ) : null}

      <Section gap="tight" className="pb-0">
        <div className="flex flex-wrap gap-3">
          <Button href="/assess">Run Q-Day scan</Button>
          <Link
            href="/q-day"
            className="inline-flex items-center text-sm text-[var(--color-gray-400)] underline-offset-4 hover:text-white hover:underline"
          >
            ← Q-Day hub
          </Link>
        </div>
      </Section>
    </>
  );
}

export function QDayHubExtras() {
  return (
    <>
      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{qDayHubCopy.deadlines.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{qDayHubCopy.deadlines.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {qDayHubCopy.deadlines.description}
          </p>
        </div>
      </Section>
    </>
  );
}
