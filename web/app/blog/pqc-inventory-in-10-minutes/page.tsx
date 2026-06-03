import type { Metadata } from "next";

import ReadinessBlogArticle from "@/components/marketing/ReadinessBlogArticle";
import { readinessArticles } from "@/lib/copy/articles";
import { buildPageMetadata } from "@/lib/seo";

const path = "/blog/pqc-inventory-in-10-minutes";
const article = readinessArticles.pqcInventoryIn10Minutes;

export const metadata: Metadata = buildPageMetadata({
  path,
  title: article.title,
  description:
    "Walk through a live PQC inventory scan: TLS endpoints, algorithm tags, CycloneDX CBOM export, and signed verify evidence.",
  type: "article",
  absoluteTitle: true,
});

export default function PqcInventoryIn10MinutesPage() {
  return (
    <ReadinessBlogArticle
      slug="pqcInventoryIn10Minutes"
      path={path}
      hubHref="/q-day/cbom"
      hubLabel="CycloneDX CBOM guide"
    />
  );
}
