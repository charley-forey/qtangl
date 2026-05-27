import type { Metadata } from "next";
import Link from "next/link";

import ArticleLayout from "@/components/docs/ArticleLayout";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Auditable nurse re-staffing: how hybrid optimization surfaces alternates that CP-SAT hides",
  description:
    "A concrete look at hospital re-staffing, why classical solvers still matter, and where a hybrid micro-solve adds value through diversity and auditability.",
};

const sections = [
  {
    title: "The 04:11 problem is real",
    body: [
      "A hospital staffing platform does not win because it says the word quantum. It wins because a charge nurse has 49 minutes to cover a shift, preserve specialty coverage, avoid an unsafe fatigue pattern, and do it without defaulting to the most expensive agency option. That is the setting for the Qtangl hospital demo.",
      "The scenario is concrete: Sarah K., a cath-lab nurse with ACLS and PALS, calls out before the day shift. Marcus, the charge nurse, now has to decide which internal nurse to move, whether the move forces a downstream backfill, and how much overtime or agency cost the hospital absorbs. Those are not toy variables. They map directly to staffing spend, patient throughput, and compliance risk.",
      "Hospital executives already understand the cost side of this. Quarterly agency labor can easily move into seven figures for a 300 to 600 bed hospital. The operational issue is not a lack of dashboards. It is the lack of fast, auditable alternatives when multiple safe answers exist.",
    ],
  },
  {
    title: "What classical solvers already do well",
    body: [
      "Qtangl does not pretend CP-SAT is obsolete. In the demo, the live backend still starts with a classical pass because that is the right thing to do. Constraint solvers are excellent at returning a best feasible plan quickly when the model is bounded and the inputs are clean.",
      "For hospital re-staffing, the classical model can account for certification coverage, shift overlap, minimum rest windows, weekly hour caps, and simple cost ladders in a deterministic way. It produces a single best answer and it does so fast enough to matter in an operations setting.",
      "That is why the demo keeps the classical plan visible instead of hiding it. If the classical plan is already the best answer, the product should say so. The credibility comes from method honesty, not from trying to force a hybrid path to look dominant when it is not.",
    ],
  },
  {
    title: "Where the hybrid micro-solve earns its keep",
    body: [
      "The hybrid layer matters when a planner does not just need one answer. They need a small set of distinct, explainable, near-equivalent alternatives. A classical branch-and-bound search often collapses to a single optimum. That is useful, but it discards other feasible swaps that may be nearly as good on cost while being better on fairness, hand-off continuity, or future staffing flexibility.",
      "In the hospital demo, the hybrid path only touches a small repair window. It does not try to solve the entire roster on a QPU. Instead it isolates the 6 to 12 nurses whose credentials, wards, and labor rules are entangled with the call-out. That subproblem becomes a bounded QUBO, and the demo replays a cached QPU trace against that smaller window.",
      "The result is not a miracle speedup. The result is three feasible alternates surfaced from the same micro-window, with a score, a bitstring weight, and a constraint trace. That is the product value: not ‘quantum wins the race,’ but ‘the team sees more viable moves before they commit to one.’",
    ],
  },
  {
    title: "Why auditability matters in healthcare",
    body: [
      "Healthcare buyers are rightly skeptical of optimization systems that cannot explain themselves. If a platform recommends moving a nurse from ICU to cath lab, the operator has to know which certification rule was binding, how the rest window was evaluated, and whether the system preferred a junior internal nurse before an agency call-up because of policy or because of a hidden model artifact.",
      "That is why the demo includes an audit drawer. Each candidate can be opened to show a QUBO snapshot, the binding constraints, the cost breakdown, the cached QPU trace, and the exact scenario metadata used to reproduce the run. The point is not to teach the end user quantum mechanics. The point is to show that the recommendation stayed inside explicit operational boundaries.",
      "In practice, this changes the conversation with a COO or Director of Nursing. Instead of asking them to trust a black box, you can show the exact evidence trail behind every candidate the system returned.",
    ],
  },
  {
    title: "The honest scoreboard is the sales asset",
    body: [
      "The most important part of the page is the honest scoreboard. It compares manual handling, the live classical solve, and the hybrid path side by side. Manual is familiar. Classical is fast. Hybrid is slower, but it returns more than one useful answer and attaches a richer audit trace.",
      "That framing matters because hospital buyers have already seen too many demos that over-claim. A credible pitch says: the hybrid pass is not the fastest step in the pipeline, but it gives the operations team something the baseline run does not: alternate swaps that can be reviewed before the staffing office locks in overtime or agency labor.",
      "That is also why the demo includes a built-in ROI calculator and an upload path for a PHI-free CSV roster. A prospect should be able to move from ‘interesting’ to ‘what would this mean for my hospital?’ without leaving the page.",
    ],
  },
  {
    title: "What to look at next",
    body: [
      "If you want to see the full workflow, start with the live demo and fire the cath-lab scenario. Then open the methodology page to inspect the data sources, solver settings, and evidence files behind it. If the workflow matches a real staffing pain point, the fastest next step is to request access and bring an anonymized roster CSV for a pilot-shaped review.",
      "That is the real promise of a quantum-aware healthcare demo in 2026. Not hype. Not magical hardware claims. A useful, auditable decision surface built around a specific problem operations teams already have today.",
    ],
  },
];

export default function HospitalRestaffingBlogPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <ArticleLayout
        eyebrow="Healthcare operations"
        title="Auditable nurse re-staffing: how hybrid optimization surfaces alternates that CP-SAT hides"
        intro="Hospitals do not need another abstract quantum story. They need a better way to resolve the 04:11 staffing call that still fits coverage, rest, and cost rules."
        coverImage="/use-case-workforce.png"
        coverAlt="Black and white workforce planning illustration showing staffing boards, skill coverage, and optimization overlays."
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
            Open the <Link href="/demo/hospital">hospital demo</Link>, review the{" "}
            <Link href="/demo/hospital/methodology">methodology page</Link>, or{" "}
            <Link href="/access?source=blog-hospital-restaffing">request pilot access</Link> if
            this looks like a real fit for your staffing workflow.
          </p>
        </section>
      </ArticleLayout>
    </div>
  );
}
