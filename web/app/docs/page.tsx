import type { Metadata } from "next";

import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import FeatureCard from "@/components/marketing/FeatureCard";
import Card from "@/components/ui/Card";
import { docsCards } from "@/lib/constants";
import { siteMetadata } from "@/lib/copy/product";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Learn how to send planning inputs and read ranked outputs from the Qtangl API.",
};

export default function DocsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsShell
        title="Documentation for the Qtangl planning API"
        description="Start with the fields you need to send, review the summary and metrics Qtangl returns, and then wire the same workflow into your own system."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
              Qtangl is a planning API for scheduling, routing, and staffing
              workflows. It turns the rules operations teams already track into a job
              that returns a ranked plan, a short explanation, and decision-ready
              metrics.
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
    </div>
  );
}
