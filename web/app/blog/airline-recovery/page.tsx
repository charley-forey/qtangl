import type { Metadata } from "next";
import Link from "next/link";

import ArticleLayout from "@/components/docs/ArticleLayout";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import JsonLd from "@/components/seo/JsonLd";
import { buildBlogPostingJsonLd, buildPageMetadata } from "@/lib/seo";

const title = "OCC crew recovery: multi-leg rebid with auditable hybrid alternates";
const description =
  "How tail routing repair, CP-SAT crew assignment, and a bounded hybrid micro-solve help OCC controllers compare defensible recovery plans.";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog/airline-recovery",
  title,
  description,
  type: "article",
  absoluteTitle: true,
});

const sections = [
  {
    title: "The 06:12 problem at KORD",
    body: [
      "When a tail goes on maintenance hold, the cascade is never one flight. Three downstream legs, twelve crew members, and a shrinking decision window are normal. OCC needs a plan that reassigns tails, re-bids crew across open legs, and stays inside FAR 117—not a single swap picked by gut feel.",
      "The Qtangl airline demo models that cascade: N812JB unavailable at KORD, three legs at risk, and a recovery window measured in tens of minutes, not hours.",
    ],
  },
  {
    title: "Classical first: routing + assignment",
    body: [
      "The pipeline starts with aircraft routing repair—reassigning affected legs to available tails—then a CP-SAT crew assignment over every open leg simultaneously. That is the right source of truth: deterministic, fast, and auditable.",
      "Reserve call-up stays in the model as a high-cost feasible fallback so the solver never returns empty-handed.",
    ],
  },
  {
    title: "Hybrid for diverse full plans",
    body: [
      "The hybrid pass operates on a bounded crew×leg micro-window. It does not claim to beat CP-SAT on speed. It surfaces up to three distinct full recovery plans with QUBO snapshots and QPU trace replay for compliance review.",
      "When classical and hybrid tie on cost, the value is alternate crew mixes and FAR 117 evidence—not hype.",
    ],
  },
];

export default function AirlineRecoveryBlogPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <ArticleLayout
        eyebrow="Aviation operations"
        title={title}
        intro={description}
        coverImage="/use-case-workforce.png"
        coverAlt="Operations control illustration with flight boards and crew recovery overlays."
      >
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        <section>
          <h2>Continue the walkthrough</h2>
          <p>
            Open the <Link href="/demo/airline">airline OCC demo</Link>, review the{" "}
            <Link href="/demo/airline/methodology">methodology page</Link>, or{" "}
            <Link href="/access?source=blog-airline-recovery">request pilot access</Link>.
          </p>
        </section>
      </ArticleLayout>
      <JsonLd
        data={buildBlogPostingJsonLd({
          path: "/blog/airline-recovery",
          headline: title,
          description,
        })}
      />
    </div>
  );
}
