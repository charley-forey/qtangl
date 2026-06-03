import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import CodeBlock from "@/components/learn/CodeBlock";
import LibraryReadme from "@/components/learn/LibraryReadme";
import LibraryResourceCard from "@/components/learn/LibraryResourceCard";
import ResourceChips from "@/components/learn/ResourceChips";
import LearnNewsletterSignup from "@/components/learn/LearnNewsletterSignup";
import SaveResourceButton from "@/components/learn/SaveResourceButton";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { libraryEditorialDrafts } from "@/lib/copy/library-editorial-drafts";
import { libraryEditorial } from "@/lib/copy/library-editorial";
import { buildPageMetadata } from "@/lib/seo";
import {
  formatRelativeDate,
  getLibraryEntriesBySlugs,
  getLibraryEntryOrNull,
  getLibraryIndex,
  getLibraryReadmeMarkdown,
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

  const editorial = libraryEditorial[entry.slug] ?? libraryEditorialDrafts[entry.slug];
  const title = `${entry.title} | ${entry.category.title} library guide`;
  const description =
    editorial?.description || editorial?.summary || entry.description || entry.summary;

  return buildPageMetadata({
    path: `/learn/library/${entry.slug}`,
    title,
    description,
    type: "article",
    image: entry.imagePath ?? `/learn/library/${entry.slug}/opengraph-image`,
  });
}

export default async function LibraryResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const entry = await getLibraryEntryOrNull(slug);

  if (!entry) {
    notFound();
  }

  const [relatedEntries, readmeMarkdown, backendEntries] = await Promise.all([
    getLibraryEntriesBySlugs(entry.relatedSlugs),
    getLibraryReadmeMarkdown(slug),
    getLibraryEntriesBySlugs(entry.supportedBackendSlugs),
  ]);

  const lastUpdated = formatDate(entry.lastPushedAt);
  const relativeUpdated = formatRelativeDate(entry.lastPushedAt);
  const editorial = libraryEditorial[entry.slug] ?? libraryEditorialDrafts[entry.slug];
  const summary = editorial?.summary ?? entry.summary;
  const whatItIs = editorial?.whatItIs ?? entry.whatItIs;
  const whoItsFor = editorial?.whoItsFor ?? entry.whoItsFor;
  const whatYouCanBuild = editorial?.whatYouCanBuild ?? entry.whatYouCanBuild;
  const verifiedAt = editorial?.lastVerifiedAt;
  const verifiedBy = editorial?.verifiedBy;

  const chips = [
    entry.primaryLanguage
      ? {
          label: entry.primaryLanguage,
          title: entry.primaryLanguages.join(", "),
        }
      : null,
    entry.license ? { label: entry.license } : null,
    entry.packageMeta.version ? { label: `v${entry.packageMeta.version}` } : null,
    entry.flagship ? { label: "Flagship", tone: "strong" as const } : null,
    entry.qtanglRelevant ? { label: "Qtangl relevant", tone: "strong" as const } : null,
    entry.archived ? { label: "Archive", tone: "muted" as const } : null,
  ].filter(Boolean) as Parameters<typeof ResourceChips>[0]["chips"];

  const externalLinkEntries = [
    ...(entry.externalLinks.docs ?? []).map((url) => ({ label: "Docs", url })),
    ...(entry.externalLinks.paper ?? []).map((url) => ({ label: "Paper", url })),
    ...(entry.externalLinks.community ?? []).map((url) => ({ label: "Community", url })),
    ...(entry.externalLinks.pypi ?? []).map((url) => ({ label: "PyPI", url })),
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        name: entry.title,
        codeRepository: entry.repoUrl,
        url: entry.repoUrl,
        description: summary,
        programmingLanguage: entry.primaryLanguage ?? undefined,
        license: entry.license ?? undefined,
        author: {
          "@type": "Organization",
          name: entry.owner,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Learn", item: "/learn" },
          { "@type": "ListItem", position: 2, name: "Library", item: "/learn/library" },
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
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-gray-400)]">
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
              Maintained by{" "}
              {entry.ownerUrl ? (
                <a href={entry.ownerUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                  {entry.owner}
                </a>
              ) : (
                entry.owner
              )}
            </p>
            <p className="mt-6 text-lg leading-8 text-[var(--color-gray-300)]">{summary}</p>

            <div className="mt-6">
              <ResourceChips chips={chips} />
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
              <SaveResourceButton slug={entry.slug} title={entry.title} />
              <Link
                href={`/learn/compare?ids=${entry.slug}`}
                className="inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
              >
                Compare
              </Link>
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
                  className="object-cover"
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
                <p className="mt-3 text-base text-white">
                  {entry.stars > 0 ? formatNumber(entry.stars) : "—"}
                </p>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40 p-4">
                <p className="text-label">Last pushed</p>
                <p className="mt-3 text-base text-white">
                  {lastUpdated ?? "Unavailable"}
                  {relativeUpdated ? (
                    <span className="block text-xs text-[var(--color-gray-400)]">
                      {relativeUpdated}
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40 p-4">
                <p className="text-label">Open issues</p>
                <p className="mt-3 text-base text-white">
                  {entry.openIssuesCount ?? "—"}
                </p>
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

      {entry.quickstart ? (
        <Section gap="tight">
          <div className="content-reading">
            <Eyebrow>Quickstart</Eyebrow>
            <h2 className="heading-section mt-4">Get running in a few lines.</h2>
          </div>
          <div className="mt-8">
            <CodeBlock
              source={entry.quickstart.source}
              language={entry.quickstart.language}
              title="Quickstart"
            />
          </div>
        </Section>
      ) : null}

      <Section gap="tight">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
            <Eyebrow>What it is</Eyebrow>
            <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {whatItIs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {verifiedAt ? (
              <p className="mt-6 text-xs text-[var(--color-gray-500)]">
                Last verified by {verifiedBy ?? "Qtangl"} on {formatDate(verifiedAt)}
              </p>
            ) : null}
          </Card>

          <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
            <Eyebrow>Who it&apos;s for</Eyebrow>
            <p className="mt-5 text-sm leading-8 text-[var(--color-gray-300)]">{whoItsFor}</p>

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

      {entry.codeSamples.length ? (
        <Section gap="tight">
          <div className="content-reading">
            <Eyebrow>Code samples</Eyebrow>
            <h2 className="heading-section mt-4">Examples from the repository.</h2>
          </div>
          <div className="mt-8 space-y-6">
            {entry.codeSamples.map((sample) => (
              <CodeBlock
                key={sample.path}
                source={sample.source}
                language={sample.language}
                title={`${sample.title} (${sample.path})`}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {backendEntries.length ? (
        <Section gap="tight">
          <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
            <Eyebrow>Plays well with</Eyebrow>
            <div className="mt-5 flex flex-wrap gap-2">
              {backendEntries.map((backend) => (
                <Link
                  key={backend.slug}
                  href={`/learn/library/${backend.slug}`}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
                >
                  {backend.title}
                </Link>
              ))}
            </div>
          </Card>
        </Section>
      ) : null}

      {entry.citationBibtex || entry.license ? (
        <Section gap="tight">
          <div className="grid gap-6 xl:grid-cols-2">
            {entry.citationBibtex ? (
              <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
                <Eyebrow>Citation</Eyebrow>
                <CodeBlock source={entry.citationBibtex} language="bibtex" title="BibTeX" />
              </Card>
            ) : null}
            {entry.license ? (
              <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
                <Eyebrow>License</Eyebrow>
                <p className="mt-5 text-2xl font-semibold text-white">{entry.license}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                  SPDX identifier detected from the repository metadata or license files.
                </p>
              </Card>
            ) : null}
          </div>
        </Section>
      ) : null}

      {entry.category.slug === "post-quantum-crypto" ? (
        <Section gap="tight">
          <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
            <Eyebrow>Q-Day readiness</Eyebrow>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              Open-source PQC libraries support the technical migration. Qtangl supports the operational
              workflow — inventory, CBOM export, and framework-mapped evidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/assess"
                className="inline-flex rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                Run Q-Day scan
              </Link>
              <Link
                href="/q-day/frameworks/ml-kem"
                className="inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
              >
                ML-KEM framework guide
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
      ) : null}

      {readmeMarkdown ? (
        <Section gap="tight">
          <div className="content-reading min-w-0">
            <Eyebrow>Repository README</Eyebrow>
            <h2 className="heading-section mt-4">Preview from the project README.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              Rendered as Markdown inside a scrollable preview. Long READMEs stay contained;
              expand or open on GitHub for the full document.
            </p>
          </div>
          <div className="mt-8 min-w-0">
            <LibraryReadme
              markdown={readmeMarkdown}
              owner={entry.owner}
              name={entry.name}
              branch={entry.defaultBranch}
              repoUrl={entry.repoUrl}
            />
          </div>
        </Section>
      ) : null}

      <Section gap="tight">
        <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>Activity</Eyebrow>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-label">Latest release</p>
              <p className="mt-2 text-white">{entry.latestRelease ?? "—"}</p>
            </div>
            <div>
              <p className="text-label">Watchers</p>
              <p className="mt-2 text-white">{entry.subscribersCount ?? "—"}</p>
            </div>
            <div>
              <p className="text-label">Python support</p>
              <p className="mt-2 text-white">{entry.packageMeta.requiresPython ?? "—"}</p>
            </div>
          </div>
          {entry.packageMeta.dependencies?.length ? (
            <div className="mt-6">
              <p className="text-label">Key dependencies</p>
              <p className="mt-2 text-sm text-[var(--color-gray-300)]">
                {entry.packageMeta.dependencies.join(", ")}
              </p>
            </div>
          ) : null}
        </Card>
      </Section>

      {externalLinkEntries.length ? (
        <Section gap="tight">
          <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
            <Eyebrow>External links</Eyebrow>
            <ul className="mt-5 space-y-3 text-sm">
              {externalLinkEntries.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-gray-300)] underline-offset-4 hover:text-white hover:underline"
                  >
                    {link.label}: {link.url}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      ) : null}

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
        <Card tone="strong" size="lg" className="learn-print-hide rounded-[var(--radius-feature)]">
          <Eyebrow>Learn digest</Eyebrow>
          <p className="mt-4 text-sm text-[var(--color-gray-300)]">
            Get monthly updates when library entries change.
          </p>
          <div className="mt-4">
            <LearnNewsletterSignup />
          </div>
        </Card>
      </Section>

      <Section gap="tight" className="pb-0 learn-print-area">
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
