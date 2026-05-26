import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleLayout from "@/components/docs/ArticleLayout";
import LibraryResourceCard from "@/components/learn/LibraryResourceCard";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { libraryTopics } from "@/lib/copy/library-topics";
import { siteMetadata } from "@/lib/copy/product";
import { getLibraryEntriesBySlugs } from "@/lib/library";

type TopicPageProps = {
  params: Promise<{ topic: string }>;
};

function getTopicBySlug(slug: string) {
  return libraryTopics.find((topic) => topic.slug === slug) ?? null;
}

export async function generateStaticParams() {
  return libraryTopics.map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { topic: topicSlug } = await params;
  const topic = getTopicBySlug(topicSlug);

  if (!topic) {
    return {};
  }

  const url = `${siteMetadata.url}/learn/topics/${topic.slug}`;

  return {
    title: topic.title,
    description: topic.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: topic.title,
      description: topic.description,
      url,
      type: "article",
      images: ["/opengraph-image"],
    },
  };
}

export default async function LibraryTopicPage({ params }: TopicPageProps) {
  const { topic: topicSlug } = await params;
  const topic = getTopicBySlug(topicSlug);

  if (!topic) {
    notFound();
  }

  const relatedResources = await getLibraryEntriesBySlugs(topic.relatedResourceSlugs);

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <ArticleLayout
        eyebrow={topic.eyebrow}
        title={topic.title}
        intro={topic.intro}
        coverImage={topic.heroImagePath}
        coverAlt={`${topic.title} illustration`}
      >
        {topic.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <section>
          <h2>Resources to open next</h2>
          <p>
            The goal of this guide is to help you navigate toward the right tools,
            not stop at the overview. The resources below are the strongest next
            clicks for this topic.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedResources.map((resource) => (
              <LibraryResourceCard key={resource.slug} entry={resource} showImage />
            ))}
          </div>
        </section>

        <section>
          <h2>Next step</h2>
          <p>
            <Link href={topic.cta.href}>{topic.cta.label}</Link>.
          </p>
        </section>
      </ArticleLayout>
    </div>
  );
}
