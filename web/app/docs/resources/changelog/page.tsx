import type { Metadata } from "next";
import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { changelog } from "@/lib/docs/changelog";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import type { DocsFeatureStatus } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/resources/changelog",
  title: "Changelog",
  description: "Version history for the Qtangl API and documentation.",
});

const tagToStatus: Record<string, DocsFeatureStatus> = {
  ga: "ga",
  pilot: "pilot",
  fix: "ga",
  docs: "coming-soon",
};

export default function ChangelogPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/resources/changelog" title="Changelog" description="Release notes." />
      <DocsShell
        title="Changelog"
        description="What shipped, what is pilot-only, and what changed in the docs."
        pathname="/docs/resources/changelog"
        searchIndex={docsSearchIndex}
      >
        <p className="text-sm text-[var(--color-gray-500)]">
          <Link href="/docs/resources/changelog/rss.xml" className="underline underline-offset-4 hover:text-white">
            RSS feed
          </Link>
        </p>
        <div className="space-y-8 border-l border-[var(--border)] pl-6">
          {changelog.map((entry) => (
            <DocsSection key={`${entry.version}-${entry.date}`}>
              <div className="flex flex-wrap items-center gap-3">
                <DocsHeading id={entry.version.replace(/\./g, "-")}>
                  {entry.version} — {entry.title}
                </DocsHeading>
                <time className="text-xs text-[var(--color-gray-500)]">{entry.date}</time>
              </div>
              {entry.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <DocsBadge key={tag} status={tagToStatus[tag] ?? "ga"} />
                  ))}
                </div>
              ) : null}
              <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DocsSection>
          ))}
        </div>
      </DocsShell>
    </div>
  );
}
