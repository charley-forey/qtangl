import type { Metadata } from "next";

import ReadinessBlogArticle from "@/components/marketing/ReadinessBlogArticle";
import { readinessArticles } from "@/lib/copy/articles";
import { buildPageMetadata } from "@/lib/seo";

const path = "/blog/q-day-readiness";
const article = readinessArticles.qDayReadinessInventory;

export const metadata: Metadata = buildPageMetadata({
  path,
  title: article.title,
  description:
    "Why CISOs need cryptographic inventory, Mosca HNDL framing, and hybrid ML-KEM proofs in 2026.",
  type: "article",
  absoluteTitle: true,
});

export default function QDayBlogPage() {
  return (
    <ReadinessBlogArticle
      slug="qDayReadinessInventory"
      path={path}
      hubHref="/q-day/what-is-q-day"
      hubLabel="What is Q-Day?"
    />
  );
}
