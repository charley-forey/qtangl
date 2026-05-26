import type { Metadata } from "next";
import Link from "next/link";

import ArticleLayout from "@/components/docs/ArticleLayout";
import { blogClosingCta } from "@/lib/copy/articles";

export const metadata: Metadata = {
  title: "Routing Optimization",
  description:
    "Learn how to build route plans teams can actually execute when windows and capacity matter.",
};

export default function RoutingOptimizationPage() {
  return (
    <ArticleLayout
      eyebrow="Routing optimization"
      title="Routing optimization breaks when real-world constraints are ignored"
      intro="The fastest route on paper often fails in production because delivery windows, capacity, service times, and changing conditions all shape what is actually feasible."
      coverImage="/qtangl-usecase-routing.svg"
      coverAlt="Black and white routing illustration showing dispatching, route maps, and network overlays."
    >
      <section>
        <h2>The shortest path is rarely the best plan</h2>
        <p>
          Logistics teams do not optimize for distance alone. They balance customer
          commitments, vehicle capacity, driver availability, and changing route
          conditions that can invalidate a naive plan almost immediately.
        </p>
      </section>

      <section>
        <h2>Constraints create the real problem</h2>
        <p>
          Once time windows, stop order rules, and handoff requirements appear, the
          search space grows quickly. That is why routing remains an optimization
          problem instead of a simple mapping problem.
        </p>
      </section>

      <section>
        <h2>Qtangl focuses on actionable route outputs</h2>
        <p>
          The product story is straightforward: submit the route problem, evaluate
          feasible plans through the solver workflow, and return the best operational
          route package for the team to execute.
        </p>
      </section>

      <section>
        <h2>{blogClosingCta.title}</h2>
        <p>
          {blogClosingCta.description}{" "}
          <Link href={blogClosingCta.href}>{blogClosingCta.label}</Link>.
        </p>
      </section>
    </ArticleLayout>
  );
}
