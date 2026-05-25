import Image from "next/image";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type ProductPreviewProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

const rankedResults = [
  { label: "Feasible plans evaluated", value: "18,240" },
  { label: "Best score delta", value: "-12.4%" },
  { label: "Solver turnaround", value: "3.2s" },
] as const;

const outputRows = [
  "Crew A -> foundation | start 07:00 | feasible",
  "Crew B -> framing | start 07:30 | ranked #1",
  "Vehicle 03 -> Route West | window matched",
  "Inspector -> Site B | dependency cleared",
] as const;

export default function ProductPreview({
  eyebrow = "Product proof",
  title = "A credible product surface, not just a brand layer.",
  description = "Qtangl should feel like software teams can buy, integrate, and trust. The interface below shows the kind of ranked operational output the platform is designed to return.",
}: ProductPreviewProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card strong className="overflow-hidden rounded-[1.75rem] p-0">
        <div className="relative aspect-[16/10]">
          <Image
            src="/qtangl-technology-solver-grid.png"
            alt="Black and white technology illustration showing solver workflow panels and network geometry."
            fill
            sizes="(min-width: 1280px) 48vw, 100vw"
            className="object-cover grayscale"
          />
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="rounded-2xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            {description}
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          {rankedResults.map((item) => (
            <Card key={item.label} className="rounded-2xl">
              <p className="text-label">{item.label}</p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {item.value}
              </p>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl">
          <p className="text-label">Ranked output sample</p>
          <div className="mt-4 space-y-3 font-mono text-sm leading-7 text-[var(--color-gray-300)]">
            {outputRows.map((row) => (
              <div
                key={row}
                className="rounded-xl border border-[var(--border)] bg-black/50 px-4 py-3"
              >
                {row}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
