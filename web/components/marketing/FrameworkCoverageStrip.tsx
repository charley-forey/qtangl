import Link from "next/link";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { frameworkGuideList } from "@/lib/copy/readiness-frameworks";

type FrameworkCoverageStripProps = {
  heading?: string;
  intro?: string;
};

export default function FrameworkCoverageStrip({ heading, intro }: FrameworkCoverageStripProps) {
  return (
    <div>
      <div className="content-reading">
        <Eyebrow>Standards &amp; frameworks</Eyebrow>
        <h2 className="heading-section mt-4">
          {heading ?? "Mapped to the mandates your auditors cite"}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
          {intro ??
            "Every assessment maps quantum-vulnerable findings to the frameworks driving your PQC program — with deadlines, control themes, and a signed report your auditors can verify independently."}
        </p>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {frameworkGuideList.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/q-day/frameworks/${guide.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-[var(--border-subtle)] bg-black/20 px-5 py-5 transition hover:border-[var(--border-strong)] hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
                  {guide.eyebrow}
                </span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[0.65rem] font-medium text-[var(--color-gray-300)]">
                  {guide.deadline}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-white group-hover:underline">
                {guide.title}
              </p>
              <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{guide.summary}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-3xl text-xs leading-6 text-[var(--color-gray-500)]">
        Control mappings are an inventory aid to accelerate audit preparation — not a formal attestation. We
        say what we do and do not claim.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/assess">Run a framework-mapped assessment</Button>
        <Button href="/q-day" variant="secondary">
          Q-Day education hub
        </Button>
      </div>
    </div>
  );
}
