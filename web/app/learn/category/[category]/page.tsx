import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import LibraryResourceCard from "@/components/learn/LibraryResourceCard";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { siteMetadata } from "@/lib/copy/product";
import {
  getCategoryBySlug,
  getLibraryCategories,
  getLibraryEntriesForCategory,
} from "@/lib/library";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  const categories = await getLibraryCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return {};
  }

  const title = `${category.title} | Quantum software category`;
  const description = category.description;
  const url = `${siteMetadata.url}/learn/category/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: ["/opengraph-image"],
    },
  };
}

export default async function LibraryCategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const entries = await getLibraryEntriesForCategory(category.slug);
  const featuredEntries = entries.filter((entry) => entry.featured).slice(0, 6);

  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.title} resources`,
    description: category.description,
    url: `/learn/category/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: entries.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `/learn/library/${entry.slug}`,
        name: entry.title,
      })),
    },
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
            <span className="text-white">{category.title}</span>
          </div>
        </nav>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_0.95fr]">
          <div className="content-reading">
            <Eyebrow>Category</Eyebrow>
            <h1 className="heading-display gradient-text mt-4">{category.title}</h1>
            <p className="mt-6 text-lg leading-8 text-[var(--color-gray-300)]">
              {category.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {category.topicSlugs.map((topicSlug) => (
                <Link
                  key={topicSlug}
                  href={`/learn/topics/${topicSlug}`}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
                >
                  Related guide
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-feature)] border border-[var(--border)] bg-black/60">
              <Image
                src={category.heroImagePath}
                alt={`${category.title} category illustration`}
                fill
                priority
                sizes="(min-width: 1280px) 36vw, 100vw"
                className="object-cover grayscale"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
                <p className="text-label">Resources</p>
                <p className="mt-4 text-4xl font-semibold text-white">{entries.length}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                  Projects currently grouped into this category.
                </p>
              </Card>
              <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
                <p className="text-label">Featured</p>
                <p className="mt-4 text-4xl font-semibold text-white">
                  {featuredEntries.length}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                  Higher-signal entries worth opening first.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </Section>

      {featuredEntries.length ? (
        <Section gap="tight">
          <div className="content-reading">
            <Eyebrow>Featured in this category</Eyebrow>
            <h2 className="heading-section mt-4">Start with the tentpoles.</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredEntries.map((entry) => (
              <LibraryResourceCard
                key={entry.slug}
                entry={entry}
                showCategory={false}
                showImage
              />
            ))}
          </div>
        </Section>
      ) : null}

      <Section gap="tight" className="pb-0">
        <div className="content-reading">
          <Eyebrow>All resources</Eyebrow>
          <h2 className="heading-section mt-4">
            Browse everything grouped under {category.title.toLowerCase()}.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <LibraryResourceCard key={entry.slug} entry={entry} showCategory={false} />
          ))}
        </div>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionStructuredData) }}
      />
    </PageShell>
  );
}
