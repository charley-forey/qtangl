import { notFound } from "next/navigation";

import { getQDayArticle } from "@/lib/copy/readiness-qday-hub";
import {
  readinessOgContentType,
  readinessOgSize,
  renderReadinessOgImage,
} from "@/lib/readiness-og-image";

export const size = readinessOgSize;
export const contentType = readinessOgContentType;

type QDayOgImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: QDayOgImageProps) {
  const { slug } = await params;
  const article = getQDayArticle(slug);
  if (!article) {
    notFound();
  }

  return renderReadinessOgImage({
    eyebrow: slug === "hndl" ? "HNDL · Q-Day hub" : "Q-Day hub",
    title: article.metadata.title,
    description: article.metadata.description,
    footer: "Qtangl Q-Day",
    variant: slug === "hndl" ? "hndl" : "default",
  });
}
