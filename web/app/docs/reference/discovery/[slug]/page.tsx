import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ReferenceEndpointPage from "@/components/docs/ReferenceEndpointPage";
import { getDiscoveryEndpoint, listDiscoverySlugs } from "@/lib/docs/reference-utils";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listDiscoverySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const endpoint = getDiscoveryEndpoint(slug);
  if (!endpoint) return {};
  return buildPageMetadata({
    path: `/docs/reference/discovery/${slug}`,
    title: endpoint.title,
    description: endpoint.summary,
  });
}

export default async function DiscoveryReferencePage({ params }: PageProps) {
  const { slug } = await params;
  const endpoint = getDiscoveryEndpoint(slug);
  if (!endpoint) notFound();
  return <ReferenceEndpointPage endpoint={endpoint} metadataDescription={endpoint.summary} />;
}
