import { notFound } from "next/navigation";

import {
  comparisonOgContentType,
  comparisonOgSize,
  renderComparisonOgImage,
} from "@/lib/comparison-og-image";
import { competitorSlugs, getCompetitor, parseCompareRouteSlug } from "@/lib/copy/competitors";

export const size = comparisonOgSize;
export const contentType = comparisonOgContentType;

type OgProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return competitorSlugs.map((slug) => ({ slug: `qtangl-vs-${slug}` }));
}

export default async function OpenGraphImage({ params }: OgProps) {
  const { slug: routeSlug } = await params;
  const competitorSlug = parseCompareRouteSlug(routeSlug);
  if (!competitorSlug) notFound();

  const entry = getCompetitor(competitorSlug);
  if (!entry) notFound();

  return renderComparisonOgImage({
    title: `Qtangl vs ${entry.name}`,
    description: entry.oneLiner,
    footer: "Qtangl Compare",
  });
}
