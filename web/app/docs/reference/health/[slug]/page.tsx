import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ReferenceEndpointPage from "@/components/docs/ReferenceEndpointPage";
import { getHealthEndpoint } from "@/lib/docs/reference-utils";
import { buildPageMetadata } from "@/lib/seo";

const HEALTH_SLUGS = ["ready", "metrics"];

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return HEALTH_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const endpoint = getHealthEndpoint(slug);
  if (!endpoint) return {};
  return buildPageMetadata({
    path: `/docs/reference/health/${slug}`,
    title: endpoint.title,
    description: endpoint.summary,
  });
}

export default async function HealthReferencePage({ params }: PageProps) {
  const { slug } = await params;
  const endpoint = getHealthEndpoint(slug);
  if (!endpoint) notFound();
  return <ReferenceEndpointPage endpoint={endpoint} metadataDescription={endpoint.summary} />;
}
