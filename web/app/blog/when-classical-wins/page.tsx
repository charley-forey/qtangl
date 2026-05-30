import type { Metadata } from "next";
import Link from "next/link";

import ArticleLayout from "@/components/docs/ArticleLayout";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import JsonLd from "@/components/seo/JsonLd";
import { buildBlogPostingJsonLd, buildPageMetadata } from "@/lib/seo";

const title = "When classical wins: honest benchmark results from Qtangl";
const description =
  "Our committed BM-001–BM-006 benchmarks include failures. Here is when CP-SAT beats QAOA, and why we publish both.";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog/when-classical-wins",
  title,
  description,
  type: "article",
  absoluteTitle: true,
});

const sections = [
  {
    title: "We publish the full table",
    body: [
      "Qtangl's backend README benchmark table is not marketing filler. BM-001 through BM-006 have committed JSON results in backend/benchmarks/results/, and CI re-runs BM-001, BM-003, and BM-006 on every pull request.",
      "The five-task precedence instance (BM-002) is the clearest example: classical CP-SAT finishes in milliseconds with a feasible plan; QAOA on the same instance takes seconds and fails on the simulator at current qubit limits.",
      "That is not embarrassing — it is the honest baseline buyers and investors should see before anyone claims quantum speedup.",
    ],
  },
  {
    title: "What hybrid is for",
    body: [
      "Hybrid value on BM-003 (hospital call-out) is not wall-clock time. Classical CP-SAT solves the ward board in ~0.02s. Hybrid fixture replay takes ~6s but surfaces three distinct feasible nurse alternates within the repair window, with audit packs attached.",
      "Track C2 defines success as: at least one more distinct feasible plan than classical, while staying within 2% of the classical objective. BM-003 meets that bar on fixture replay — that is the product claim we can defend.",
    ],
  },
  {
    title: "How to read the scoreboard",
    body: [
      "Every vertical demo exposes distinctFeasiblePlans and diversityScore on the hybrid column. When hybrid ties classical on objective — which is common — the scoreboard says so.",
      "We lead with alternates and auditability, not latency. If your buyer only cares about milliseconds, classical already wins and we tell them that on the first slide.",
    ],
  },
];

export default function WhenClassicalWinsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <ArticleLayout
        eyebrow="Validation"
        title={title}
        intro={description}
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
          <h2>Continue reading</h2>
          <p>
            Review the <Link href="/technology">benchmark scoreboard</Link>, open the{" "}
            <Link href="/demo/hospital">hospital demo</Link>, or read the{" "}
            <Link href="/blog/hospital-restaffing">hospital restaffing deep dive</Link>.
          </p>
        </section>
      </ArticleLayout>
      <JsonLd
        data={buildBlogPostingJsonLd({
          path: "/blog/when-classical-wins",
          headline: title,
          description,
        })}
      />
    </div>
  );
}
