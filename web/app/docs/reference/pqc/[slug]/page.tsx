import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ReferenceEndpointPage from "@/components/docs/ReferenceEndpointPage";
import { getPqcEndpoint, listDynamicPqcSlugs } from "@/lib/docs/reference-utils";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listDynamicPqcSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const endpoint = getPqcEndpoint(slug);
  if (!endpoint) return {};
  return buildPageMetadata({
    path: `/docs/reference/pqc/${slug}`,
    title: endpoint.title,
    description: endpoint.summary,
  });
}

export default async function PqcDynamicReferencePage({ params }: PageProps) {
  const { slug } = await params;
  const endpoint = getPqcEndpoint(slug);
  if (!endpoint) notFound();
  return <ReferenceEndpointPage endpoint={endpoint} metadataDescription={endpoint.summary} />;
}
