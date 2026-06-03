import type { Metadata } from "next";

import ReadinessBlogArticle from "@/components/marketing/ReadinessBlogArticle";
import { readinessArticles } from "@/lib/copy/articles";
import { buildPageMetadata } from "@/lib/seo";

const path = "/blog/pqc-deadlines-2029";
const article = readinessArticles.pqcDeadlines2029;

export const metadata: Metadata = buildPageMetadata({
  path,
  title: article.title,
  description:
    "Google and Cloudflare moved PQC readiness to 2029. Map NSM-10, CNSA 2.0, NIST IR 8547, and CMMC deadlines to your crypto inventory tiers.",
  type: "article",
  absoluteTitle: true,
});

export default function PqcDeadlines2029Page() {
  return (
    <ReadinessBlogArticle
      slug="pqcDeadlines2029"
      path={path}
      hubHref="/q-day/deadlines"
      hubLabel="Compliance deadlines guide"
    />
  );
}
