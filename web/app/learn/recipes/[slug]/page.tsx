import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import LibraryResourceCard from "@/components/learn/LibraryResourceCard";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { getRecipeBySlug, libraryRecipes } from "@/lib/copy/library-recipes";
import { getLibraryEntriesBySlugs } from "@/lib/library";
import { buildPageMetadata } from "@/lib/seo";

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return libraryRecipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) {
    return {};
  }
  return buildPageMetadata({
    path: `/learn/recipes/${slug}`,
    title: recipe.title,
    description: recipe.description,
  });
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) {
    notFound();
  }

  const resources = await getLibraryEntriesBySlugs(recipe.resourceSlugs);

  return (
    <PageShell>
      <Section gap="tight" className="pt-8 sm:pt-10">
        <Eyebrow>Stack recipe</Eyebrow>
        <h1 className="heading-display gradient-text mt-4">{recipe.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-gray-300)]">
          {recipe.description}
        </p>
      </Section>

      <Section gap="tight">
        <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>Workflow</Eyebrow>
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-8 text-[var(--color-gray-300)]">
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Card>
      </Section>

      <Section gap="tight" className="pb-0">
        <div className="content-reading">
          <Eyebrow>Resources in this stack</Eyebrow>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((entry) => (
            <LibraryResourceCard key={entry.slug} entry={entry} />
          ))}
        </div>
        <div className="mt-8">
          <Link href="/learn" className="text-sm text-white hover:underline">
            Back to Learn
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
