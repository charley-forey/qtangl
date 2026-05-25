import type { Metadata } from "next";

import DocsShell from "@/components/docs/DocsShell";
import FeatureCard from "@/components/marketing/FeatureCard";
import Card from "@/components/ui/Card";
import { docsCards } from "@/lib/constants";
import { siteMetadata } from "@/lib/copy/product";

export const metadata: Metadata = {
  title: "Docs",
  description: "Developer onboarding and conceptual guides for the Qtangl API.",
};

export default function DocsPage() {
  return (
    <DocsShell
      title="Documentation for the Qtangl optimization workflow"
      description="Start with the API model, understand the problem categories, and inspect the request and response surfaces that define the current interface."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {docsCards.map((card) => (
          <FeatureCard
            key={card.href}
            title={card.title}
            description={card.description}
            href={card.href}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">What Qtangl is</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            Qtangl is an API-first optimization platform focused on scheduling,
            routing, and resource allocation workflows for operations-heavy teams.
            It is designed to translate business constraints into optimization jobs
            rather than forcing teams to reason in academic quantum terms.
          </p>
        </Card>

        <Card strong className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">When to use it</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Use Qtangl when schedules break because dependencies and capacity collide.</li>
            <li>Use it when route planning needs to respect windows, capacity, and cost.</li>
            <li>Use it when staffing or resource assignment depends on multiple hard constraints.</li>
          </ul>
          <p className="mt-5 text-sm leading-7 text-[var(--color-gray-400)]">
            {siteMetadata.oneLiner}
          </p>
        </Card>
      </div>
    </DocsShell>
  );
}
