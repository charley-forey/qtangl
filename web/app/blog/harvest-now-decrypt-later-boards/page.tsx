import type { Metadata } from "next";

import ReadinessBlogArticle from "@/components/marketing/ReadinessBlogArticle";
import { readinessArticles } from "@/lib/copy/articles";
import { buildPageMetadata } from "@/lib/seo";

const path = "/blog/harvest-now-decrypt-later-boards";
const article = readinessArticles.harvestNowDecryptLaterBoards;

export const metadata: Metadata = buildPageMetadata({
  path,
  title: article.title,
  description:
    "What boards miss about harvest-now-decrypt-later: HNDL exposure, Mosca inequality, and why quantum-vulnerable crypto needs inventory now.",
  type: "article",
  absoluteTitle: true,
});

export default function HarvestNowDecryptLaterBoardsPage() {
  return (
    <ReadinessBlogArticle
      slug="harvestNowDecryptLaterBoards"
      path={path}
      hubHref="/q-day/hndl"
      hubLabel="Harvest now, decrypt later guide"
      faq={article.faq}
    />
  );
}
