import type { Metadata } from "next";

import FeatureCard from "@/components/FeatureCard";
import Section from "@/components/Section";
import { blogPosts } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog",
  description: "Qtangl thought leadership and use-case articles for optimization teams.",
};

export default function BlogPage() {
  return (
    <main className="flex-1">
      <Section className="pt-12 sm:pt-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
            Blog
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Operational optimization, explained clearly.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            The Qtangl blog focuses on practical optimization problems, hybrid
            systems thinking, and the business cases behind better planning tools.
          </p>
        </div>
      </Section>

      <Section className="pt-0 pb-20 sm:pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <FeatureCard
              key={post.slug}
              eyebrow={post.category}
              title={post.title}
              description={post.excerpt}
              href={post.href}
            >
              <p className="font-medium text-cyan-200">Read article →</p>
            </FeatureCard>
          ))}
        </div>
      </Section>
    </main>
  );
}
