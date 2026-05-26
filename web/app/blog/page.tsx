import type { Metadata } from "next";

import FeatureCard from "@/components/marketing/FeatureCard";
import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import { blogPosts } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Learn practical ways to improve scheduling, routing, and staffing decisions.",
};

export default function BlogPage() {
  return (
    <main className="flex-1">
      <Section className="pt-12 sm:pt-16">
        <div className="max-w-3xl">
          <Eyebrow>Blog</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Operational optimization, explained clearly.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--color-gray-300)]">
            The Qtangl blog focuses on practical optimization problems, hybrid
            systems thinking, and the business cases behind better planning tools.
          </p>
        </div>
      </Section>

      <Section className="pt-0 pb-20 sm:pb-24">
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
    </main>
  );
}
