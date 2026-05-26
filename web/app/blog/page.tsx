import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import FeatureCard from "@/components/marketing/FeatureCard";
import Section from "@/components/layout/Section";
import { blogPosts } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Learn practical ways to improve scheduling, routing, and staffing decisions.",
};

export default function BlogPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Blog"
        title="Operational optimization, explained clearly."
        description={
          <>
            The Qtangl blog focuses on practical optimization problems, hybrid
            systems thinking, and the business cases behind better planning tools.
          </>
        }
        contentClassName="max-w-3xl"
      />
      <Section className="pt-0 pb-0">
        {/* WORKTREE-TODO(web/components): Add shared "Back to blog" affordance and article CTA slots in ArticleLayout when docs-owned components are in scope. */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {blogPosts.map((post) => (
            <FeatureCard
              key={post.slug}
              eyebrow={post.category}
              title={post.title}
              description={post.excerpt}
              href={post.href}
              ctaLabel="Read article"
              imageSrc={post.coverImage}
              imageAlt={post.coverAlt}
            >
              <p className="font-medium text-white">{post.description}</p>
            </FeatureCard>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
