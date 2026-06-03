import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import DecisionRouter from "@/components/learn/DecisionRouter";
import HubSearch from "@/components/learn/HubSearch";
import LearnHubToc from "@/components/learn/LearnHubToc";
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
  getRecentlyUpdatedEntries,
} from "@/lib/library";
import LearnNewsletterSignup from "@/components/learn/LearnNewsletterSignup";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/learn",
  title: "Learn",
  description:
    "Explore Qtangl's educational map of the open-source quantum software ecosystem.",
});

const CLUSTER_LABELS: Record<string, string> = {
  build: "Build",
  simulate: "Simulate",
  optimize: "Optimize",
  secure: "Secure",
  learn: "Learn",
};

export default async function LearnPage() {
  const [categories, featuredEntries, qtanglRelevantEntries, recentEntries, meta] =
    await Promise.all([
      getLibraryCategories(),
      getFeaturedLibraryEntries(6),
      getQtanglRelevantEntries(6),
      getRecentlyUpdatedEntries(6),
      getLibraryMeta(),
    ]);

  const clustered = Object.entries(CLUSTER_LABELS).map(([cluster, label]) => ({
    cluster,
    label,
    categories: categories.filter((category) => category.cluster === cluster),
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Qtangl Learn",
        description: libraryHubCopy.description,
        url: "/learn",
      },
      {
        "@type": "ItemList",
        name: "Flagship quantum software resources",
        itemListElement: featuredEntries.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: entry.title,
          url: `/learn/library/${entry.slug}`,
        })),
      },
    ],
  };

  return (
    <PageShell>
      <PageHero
        eyebrow={libraryHubCopy.eyebrow}
        title={libraryHubCopy.title}
        description={libraryHubCopy.description}
        actions={[
          { href: "/learn/library", label: "Open the full library" },
          {
            href: "/learn/compare?ids=entropicalabs-openqaoa,dwavesystems-dwave-ocean-sdk,aws-amazon-braket-sdk-python,qiskit-qiskit-optimization",
            label: "Compare optimization tools",
            variant: "secondary" as const,
          },
        ]}
        contentClassName="max-w-4xl"
      />

      <Section gap="tight">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-10">
            <div>
              <Eyebrow>Start here</Eyebrow>
              <h2 className="heading-section mt-4">What are you trying to do?</h2>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-gray-300)]">
                Route into the ecosystem by job-to-be-done instead of memorizing project names.
              </p>
              <div className="mt-8">
                <DecisionRouter />
              </div>
            </div>

            <HubSearch />

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
                  resource explainers, and topic guides so people can understand what is out
                  there before deciding where to go deeper.
                </p>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
                  <p className="text-label">Resources</p>
                  <p className="mt-4 text-4xl font-semibold text-white">{meta.repoCount}</p>
                </Card>
                <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
                  <p className="text-label">Categories</p>
                  <p className="mt-4 text-4xl font-semibold text-white">{categories.length}</p>
                </Card>
                <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
                  <p className="text-label">Topic guides</p>
                  <p className="mt-4 text-4xl font-semibold text-white">
                    {libraryTopicTeasers.length}
                  </p>
                </Card>
              </div>
            </div>
          </div>
          <LearnHubToc />
        </div>
      </Section>

      <Section gap="tight" id="learn-categories">
        <div className="content-reading">
          <Eyebrow>{libraryHubCopy.categorySection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{libraryHubCopy.categorySection.title}</h2>
          <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
            {libraryHubCopy.categorySection.description}
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {clustered.map((group) =>
            group.categories.length ? (
              <div key={group.cluster}>
                <h3 className="text-xl font-semibold text-white">{group.label}</h3>
                <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {group.categories.map((category) => (
                    <Card
                      key={category.slug}
                      as="article"
                      tone="feature"
                      size="lg"
                      interactive
                      className="group relative rounded-[var(--radius-feature)]"
                    >
                      <div className="relative">
                        <p className="text-label">{category.title}</p>
                        <h4 className="mt-4 text-2xl font-semibold text-white">
                          <Link
                            href={`/learn/category/${category.slug}`}
                            className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                          >
                            {category.resourceCount} resources
                          </Link>
                        </h4>
                        <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                          {category.description}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      </Section>

      <Section gap="tight" id="learn-flagships">
        <div className="content-reading">
          <Eyebrow>{libraryHubCopy.featuredSection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{libraryHubCopy.featuredSection.title}</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredEntries.map((entry) => (
            <LibraryResourceCard key={entry.slug} entry={entry} showImage />
          ))}
        </div>
      </Section>

      <Section gap="tight" id="learn-recent">
        <div className="content-reading">
          <Eyebrow>Recently updated</Eyebrow>
          <h2 className="heading-section mt-4">Projects with recent activity.</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recentEntries.map((entry) => (
            <LibraryResourceCard key={entry.slug} entry={entry} />
          ))}
        </div>
        <div className="mt-6">
          <Link href="/learn/whats-new" className="text-sm text-white hover:underline">
            See full update feed
          </Link>
        </div>
      </Section>

      <Section gap="tight" id="learn-qtangl">
        <div className="content-reading">
          <Eyebrow>{libraryHubCopy.relevantSection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{libraryHubCopy.relevantSection.title}</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {qtanglRelevantEntries.map((entry) => (
            <LibraryResourceCard key={entry.slug} entry={entry} showImage />
          ))}
        </div>
      </Section>

      <Section gap="tight" id="learn-topics">
        <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>Post-quantum readiness</Eyebrow>
          <h2 className="heading-section mt-4 !text-2xl">
            Libraries explain algorithms. Qtangl proves what you deploy.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-gray-300)]">
            Learn covers open-source PQC tooling. For operational inventory, CBOM export, and
            framework-mapped evidence, start on the Q-Day hub — secondary to this library, not a
            replacement for it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/q-day"
              className="inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
            >
              Q-Day hub
            </Link>
            <Link
              href="/assess/mini"
              className="inline-flex rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.12]"
            >
              Free mini-assessment
            </Link>
            <Link
              href="/learn/topics/pqc-readiness"
              className="inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
            >
              PQC readiness topic
            </Link>
          </div>
        </Card>
      </Section>

      <Section gap="tight" id="learn-topic-guides">
        <div className="content-reading">
          <Eyebrow>Topic guides</Eyebrow>
          <h2 className="heading-section mt-4">
            Start with the question you are actually trying to answer.
          </h2>
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
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>Stay current</Eyebrow>
          <h2 className="heading-section mt-4">Learn digest</h2>
          <div className="mt-6">
            <LearnNewsletterSignup />
          </div>
        </Card>
      </Section>

      <Section gap="tight" className="pb-0" id="learn-catalog">
        <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>{libraryHubCopy.catalogSection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{libraryHubCopy.catalogSection.title}</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {libraryHubCopy.catalogSection.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/learn/library"
              className="inline-flex rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.12]"
            >
              Browse the catalog
            </Link>
            <Link
              href="/learn/map"
              className="inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
            >
              Ecosystem map
            </Link>
            <Link
              href="/learn/saved"
              className="inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
            >
              Saved resources
            </Link>
          </div>
        </Card>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </PageShell>
  );
}
