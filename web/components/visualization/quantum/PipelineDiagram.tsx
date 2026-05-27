"use client";

import Image from "next/image";

import ParticleField from "@/components/quantum/ParticleField";
import { pipelineDiagramCopy } from "@/lib/copy/visualization";
import { pipelineStages } from "@/lib/copy/technology-deep";

type PipelineDiagramProps = {
  className?: string;
};

export default function PipelineDiagram({ className = "" }: PipelineDiagramProps) {
  return (
    <section
      aria-label={pipelineDiagramCopy.title}
      className={[
        "rounded-[var(--radius-feature)] border border-[var(--border)] bg-black/35 p-5 lg:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{pipelineDiagramCopy.eyebrow}</p>
      <h2 className="heading-section mt-4 !text-2xl">{pipelineDiagramCopy.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-gray-300)]">
        {pipelineDiagramCopy.description}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/60">
          <ParticleField density={12} />
          <noscript>
            <Image
              src="/qtangl-technology-solver-grid.svg"
              alt="Solver workflow diagram fallback"
              fill
              className="object-cover grayscale"
            />
          </noscript>
        </div>

        <ol className="flex flex-col gap-3">
          {pipelineStages.map((stage, index) => (
            <li
              key={stage.id}
              className="relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4 transition-colors hover:border-[var(--border-strong)] focus-within:border-[var(--border-strong)]"
            >
              {index < pipelineStages.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute -bottom-3 left-6 hidden h-3 w-px bg-white/20 lg:block"
                />
              ) : null}
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-label">{stage.eyebrow}</p>
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-2 text-base font-semibold text-white">{stage.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
                {stage.operation}
              </p>
              <p className="mt-2 font-mono text-xs text-[var(--color-gray-500)]">
                {stage.algorithm}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
