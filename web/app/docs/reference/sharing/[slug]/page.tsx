import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ReferenceEndpointPage from "@/components/docs/ReferenceEndpointPage";
import { getSharingEndpoint } from "@/lib/docs/reference-utils";
import { buildPageMetadata } from "@/lib/seo";

const SHARING_SLUGS = ["read", "report"];

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SHARING_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const endpoint = getSharingEndpoint(slug);
  if (!endpoint) return {};
  return buildPageMetadata({
    path: `/docs/reference/sharing/${slug}`,
    title: endpoint.title,
    description: endpoint.summary,
  });
}

export default async function SharingReferencePage({ params }: PageProps) {
  const { slug } = await params;
  const endpoint = getSharingEndpoint(slug);
  if (!endpoint) notFound();
  return <ReferenceEndpointPage endpoint={endpoint} metadataDescription={endpoint.summary} />;
}
