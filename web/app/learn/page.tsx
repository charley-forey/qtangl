import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import LibraryResourceCard from "@/components/learn/LibraryResourceCard";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { libraryHubCopy } from "@/lib/copy/library";
import { libraryTopicTeasers } from "@/lib/copy/library-topics";
import {
  getFeaturedLibraryEntries,
  getLibraryCategories,
  getLibraryMeta,
  getQtanglRelevantEntries,
} from "@/lib/library";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Explore Qtangl's educational map of the open-source quantum software ecosystem.",
};

export default async function LearnPage() {
  const [categories, featuredEntries, qtanglRelevantEntries, meta] = await Promise.all([
    getLibraryCategories(),
    getFeaturedLibraryEntries(6),
    getQtanglRelevantEntries(6),
    getLibraryMeta(),
  ]);

  return (
    <PageShell>
      <PageHero
        eyebrow={libraryHubCopy.eyebrow}
        title={libraryHubCopy.title}
        description={libraryHubCopy.description}
        actions={libraryHubCopy.actions}
        contentClassName="max-w-4xl"
      />

      <Section gap="tight">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
            <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/60">
              <Image
                src="/learn/hero.png"
                alt="Abstract ecosystem map illustration for Qtangl Learn."
                fill
                priority
                sizes="(min-width: 1280px) 42vw, 100vw"
                className="object-cover grayscale"
              />
            </div>
            <Eyebrow>Library snapshot</Eyebrow>
            <h2 className="heading-section mt-4 !text-2xl">
              A readable map of the ecosystem, not just a dump of links.
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              The learn section turns a large reference corpus into category pages,
              resource explainers, and topic guides so people can understand what
              is out there before deciding where to go deeper.
            </p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
              <p className="text-label">Resources</p>
              <p className="mt-4 text-4xl font-semibold text-white">{meta.repoCount}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                Indexable resource pages generated from the local reference corpus.
              </p>
            </Card>
            <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
              <p className="text-label">Categories</p>
              <p className="mt-4 text-4xl font-semibold text-white">{categories.length}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                Distinct ways to navigate the ecosystem by problem type and workflow.
              </p>
            </Card>
            <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
              <p className="text-label">Topic guides</p>
              <p className="mt-4 text-4xl font-semibold text-white">
                {libraryTopicTeasers.length}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                Editorial paths that tie library pages together around real questions.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{libraryHubCopy.categorySection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{libraryHubCopy.categorySection.title}</h2>
          <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
            {libraryHubCopy.categorySection.description}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Card
              key={category.slug}
              as="article"
              tone="feature"
              size="lg"
              interactive
              className="group relative rounded-[var(--radius-feature)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_42%)]" />
              <div className="relative">
                <p className="text-label">{category.title}</p>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  <Link
                    href={`/learn/category/${category.slug}`}
                    className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                  >
                    {category.resourceCount} resources
                  </Link>
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                  {category.description}
                </p>
                <p className="mt-6 text-sm font-medium text-white">Open category</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{libraryHubCopy.featuredSection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{libraryHubCopy.featuredSection.title}</h2>
          <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
            {libraryHubCopy.featuredSection.description}
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredEntries.map((entry) => (
            <LibraryResourceCard key={entry.slug} entry={entry} showImage />
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{libraryHubCopy.relevantSection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{libraryHubCopy.relevantSection.title}</h2>
          <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
            {libraryHubCopy.relevantSection.description}
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {qtanglRelevantEntries.map((entry) => (
            <LibraryResourceCard key={entry.slug} entry={entry} showImage />
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>Topic guides</Eyebrow>
          <h2 className="heading-section mt-4">
            Start with the question you are actually trying to answer.
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
            Topic guides help people who do not yet know project names. They answer the
            broader question first, then route readers into the most relevant resources.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {libraryTopicTeasers.map((topic) => (
            <Card
              key={topic.slug}
              as="article"
              tone="strong"
              size="lg"
              interactive
              className="group relative rounded-[var(--radius-feature)]"
            >
              <div className="relative">
                <p className="text-label">Guide</p>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  <Link
                    href={`/learn/topics/${topic.slug}`}
                    className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                  >
                    {topic.title}
                  </Link>
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                  {topic.description}
                </p>
                <p className="mt-6 text-sm font-medium text-white">Read guide</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>{libraryHubCopy.catalogSection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{libraryHubCopy.catalogSection.title}</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {libraryHubCopy.catalogSection.description}
          </p>
          <div className="mt-8">
            <Link
              href="/learn/library"
              className="inline-flex rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.12]"
            >
              Browse the catalog
            </Link>
          </div>
        </Card>
      </Section>
    </PageShell>
  );
}
