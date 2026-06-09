import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ReferenceEndpointPage from "@/components/docs/ReferenceEndpointPage";
import { getAdminEndpoint, listEndpointSlugs } from "@/lib/docs/reference-utils";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listEndpointSlugs("admin").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const endpoint = getAdminEndpoint(slug);
  if (!endpoint) return {};
  return buildPageMetadata({
    path: `/docs/reference/admin/${slug}`,
    title: endpoint.title,
    description: endpoint.summary,
  });
}

export default async function AdminReferencePage({ params }: PageProps) {
  const { slug } = await params;
  const endpoint = getAdminEndpoint(slug);
  if (!endpoint) notFound();
  return <ReferenceEndpointPage endpoint={endpoint} metadataDescription={endpoint.summary} />;
}
