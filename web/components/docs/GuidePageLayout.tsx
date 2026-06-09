import type { ReactNode } from "react";

import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsSearchIndex } from "@/lib/docs/search-index-export";

type GuidePageLayoutProps = {
  pathname: string;
  title: string;
  description: string;
  lastUpdated?: string;
  children: ReactNode;
};

export default function GuidePageLayout({
  pathname,
  title,
  description,
  lastUpdated = "2026-06-09",
  children,
}: GuidePageLayoutProps) {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname={pathname} title={title} description={description} />
      <DocsShell title={title} description={description} pathname={pathname} searchIndex={docsSearchIndex}>
        {lastUpdated ? (
          <p className="text-xs text-[var(--color-gray-500)]">Last updated: {lastUpdated}</p>
        ) : null}
        {children}
      </DocsShell>
    </div>
  );
}
