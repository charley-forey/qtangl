import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import LibraryResourceCard from "@/components/learn/LibraryResourceCard";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { libraryEditorial } from "@/lib/copy/library-editorial";
import { buildPageMetadata } from "@/lib/seo";
import {
  getLibraryEntryOrNull,
  getLibraryEntriesBySlugs,
  getLibraryIndex,
} from "@/lib/library";

type ResourcePageProps = {
  params: Promise<{ slug: string }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export async function generateStaticParams() {
  const entries = await getLibraryIndex();
  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getLibraryEntryOrNull(slug);

  if (!entry) {
    return {};
  }

  const editorial = libraryEditorial[entry.slug];
  const title = `${entry.title} | ${entry.category.title} library guide`;
  const description =
    editorial?.description || editorial?.summary || entry.description || entry.summary;

  return buildPageMetadata({
    path: `/learn/library/${entry.slug}`,
    title,
    description,
    type: "article",
    image: `/learn/library/${entry.slug}/opengraph-image`,
  });
}

export default async function LibraryResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const entry = await getLibraryEntryOrNull(slug);

  if (!entry) {
    notFound();
  }

  const relatedEntries = await getLibraryEntriesBySlugs(entry.relatedSlugs);
  const lastUpdated = formatDate(entry.lastPushedAt);
  const editorial = libraryEditorial[entry.slug];
  const summary = editorial?.summary ?? entry.summary;
  const whatItIs = editorial?.whatItIs ?? entry.whatItIs;
  const whoItsFor = editorial?.whoItsFor ?? entry.whoItsFor;
  const whatYouCanBuild = editorial?.whatYouCanBuild ?? entry.whatYouCanBuild;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        name: entry.title,
        codeRepository: entry.repoUrl,
        url: entry.repoUrl,
        description: summary,
        programmingLanguage: entry.primaryLanguage,
        license: entry.license,
        author: {
          "@type": "Organization",
          name: entry.owner,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Learn",
            item: "/learn",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Library",
            item: "/learn/library",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: entry.category.title,
            item: `/learn/category/${entry.category.slug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: entry.title,
            item: `/learn/library/${entry.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <Section gap="tight" className="pt-8 sm:pt-10">
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-[var(--color-gray-400)]"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/learn" className="hover:text-white">
              Learn
            </Link>
            <span>/</span>
            <Link href="/learn/library" className="hover:text-white">
              Library
            </Link>
            <span>/</span>
            <Link
              href={`/learn/category/${entry.category.slug}`}
              className="hover:text-white"
            >
              {entry.category.title}
            </Link>
            <span>/</span>
            <span className="text-white">{entry.title}</span>
          </div>
        </nav>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="content-reading">
            <Eyebrow>{entry.category.title}</Eyebrow>
            <h1 className="heading-display gradient-text mt-4">{entry.title}</h1>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
              Maintained by {entry.owner}
            </p>
            <p className="mt-6 text-lg leading-8 text-[var(--color-gray-300)]">
              {summary}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-gray-300)]">
                {entry.primaryLanguage}
              </span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-gray-300)]">
                {entry.license}
              </span>
              {entry.flagship ? (
                <span className="rounded-full border border-[var(--border-strong)] bg-white/[0.06] px-3 py-1 text-xs text-white">
                  Flagship
                </span>
              ) : null}
              {entry.qtanglRelevant ? (
                <span className="rounded-full border border-[var(--border-strong)] bg-white/[0.06] px-3 py-1 text-xs text-white">
                  Qtangl relevant
                </span>
              ) : null}
              {entry.archived ? (
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-gray-400)]">
                  Archive
                </span>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={entry.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                View on GitHub
              </a>
              {entry.homepageUrl ? (
                <a
                  href={entry.homepageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
                >
                  Open project site
                </a>
              ) : null}
            </div>
          </div>

          <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
            {entry.imagePath ? (
              <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/60">
                <Image
                  src={entry.imagePath}
                  alt={`${entry.title} illustration`}
                  fill
                  priority
                  sizes="(min-width: 1280px) 36vw, 100vw"
                  className="object-cover grayscale"
                />
              </div>
            ) : null}
            <Eyebrow>Resource snapshot</Eyebrow>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40 p-4">
                <p className="text-label">Category</p>
                <p className="mt-3 text-base text-white">{entry.category.title}</p>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40 p-4">
                <p className="text-label">Stars</p>
                <p className="mt-3 text-base text-white">{formatNumber(entry.stars)}</p>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40 p-4">
                <p className="text-label">Topics</p>
                <p className="mt-3 text-base text-white">{entry.topics.length}</p>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40 p-4">
                <p className="text-label">Last pushed</p>
                <p className="mt-3 text-base text-white">{lastUpdated ?? "Unavailable"}</p>
              </div>
            </div>

            {entry.topics.length ? (
              <div className="mt-6">
                <p className="text-label">Appears in</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.topics.map((topic) => (
                    <Link
                      key={topic.slug}
                      href={`/learn/topics/${topic.slug}`}
                      className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
                    >
                      {topic.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </Section>

      <Section gap="tight">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
            <Eyebrow>What it is</Eyebrow>
            <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {whatItIs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Card>

          <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
            <Eyebrow>Who it&apos;s for</Eyebrow>
            <p className="mt-5 text-sm leading-8 text-[var(--color-gray-300)]">
              {whoItsFor}
            </p>

            <h2 className="mt-8 text-xl font-semibold text-white">
              What you can build or learn
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              {whatYouCanBuild.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {editorial?.qtanglRelevance ? (
        <Section gap="tight">
          <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
            <Eyebrow>How this relates to Qtangl</Eyebrow>
            <p className="mt-5 text-sm leading-8 text-[var(--color-gray-300)]">
              {editorial.qtanglRelevance}
            </p>
          </Card>
        </Section>
      ) : null}

      <Section gap="tight">
        <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>README excerpt</Eyebrow>
          <details className="mt-5">
            <summary className="cursor-pointer text-sm font-medium text-white">
              Expand the source excerpt
            </summary>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {entry.readmeExcerpt || "No README excerpt was available for this resource."}
            </p>
            {entry.readmePath ? (
              <p className="mt-4 text-sm text-[var(--color-gray-400)]">
                Source: <span className="font-mono">{entry.readmePath}</span>
              </p>
            ) : null}
          </details>
        </Card>
      </Section>

      <Section gap="tight" className="pb-0">
        <div className="content-reading">
          <Eyebrow>Related resources</Eyebrow>
          <h2 className="heading-section mt-4">Keep exploring nearby tools.</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {relatedEntries.map((relatedEntry) => (
            <LibraryResourceCard
              key={relatedEntry.slug}
              entry={relatedEntry}
              showCategory={false}
            />
          ))}
        </div>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </PageShell>
  );
}
