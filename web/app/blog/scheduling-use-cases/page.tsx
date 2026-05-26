import type { Metadata } from "next";

import ArticleLayout from "@/components/docs/ArticleLayout";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Scheduling Use Cases",
  description:
    "Why construction and workforce scheduling remain hard and where API-driven optimization helps.",
};

export default function SchedulingUseCasesPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <ArticleLayout
        eyebrow="Scheduling use cases"
        title="Construction and workforce scheduling are still wide-open problems"
        intro="Scheduling stays difficult because the real world does not respect clean textbook assumptions. Dependencies, labor limits, inspections, and changing priorities all interact at once."
        coverImage="/qtangl-usecase-scheduling.svg"
        coverAlt="Black and white scheduling illustration showing crews, planning boards, and task sequencing."
      >
        <section>
          <h2>Construction schedules are dependency graphs in disguise</h2>
          <p>
            Trade sequencing, inspection windows, crew availability, and equipment
            access all create constraints that can push a project off course. When a
            single dependency slips, managers often rebuild the plan manually.
          </p>
        </section>

        <section>
          <h2>Workforce allocation is not just filling empty slots</h2>
          <p>
            Skill fit, overtime rules, availability, and service-level targets mean
            staffing decisions are connected. A viable solution has to account for all
            of them at once instead of optimizing one metric in isolation.
          </p>
        </section>

        <section>
          <h2>Why an API-first solver matters</h2>
          <p>
            Qtangl packages these planning decisions as an optimization workflow that
            existing systems can call. That turns scheduling from a manual exercise
            into a repeatable service that can be rerun as conditions change.
          </p>
        </section>
      </ArticleLayout>
    </div>
  );
}
