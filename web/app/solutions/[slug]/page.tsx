import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SolutionLandingPage from "@/components/marketing/SolutionLandingPage";
import PageShell from "@/components/layout/PageShell";
import { getSolutionCopy, type SolutionSlug } from "@/lib/copy/readiness-solutions";
import { buildPageMetadata } from "@/lib/seo";

type SolutionRouteProps = {
  params: Promise<{ slug: string }>;
};

const solutionSlugs: SolutionSlug[] = ["banking", "government", "healthcare"];

export function generateStaticParams() {
  return solutionSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SolutionRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const copy = getSolutionCopy(slug);
  if (!copy) {
    return {};
  }

  return buildPageMetadata({
    path: `/solutions/${slug}`,
    title: copy.metadata.title,
    description: copy.metadata.description,
  });
}

export default async function SolutionRoute({ params }: SolutionRouteProps) {
  const { slug } = await params;
  const copy = getSolutionCopy(slug);
  if (!copy) {
    notFound();
  }

  return (
    <PageShell>
      <SolutionLandingPage copy={copy} />
    </PageShell>
  );
}

export type { SolutionSlug };
