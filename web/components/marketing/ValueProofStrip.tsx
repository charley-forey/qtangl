import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { valueProofItems } from "@/lib/copy/readiness-value";

type ValueProofStripProps = {
  eyebrow?: string;
  title?: string;
};

export default function ValueProofStrip({
  eyebrow = "Why teams choose Qtangl",
  title = "Evidence, drift, and honest scope",
}: ValueProofStripProps) {
  return (
    <div>
      <div className="content-reading">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="heading-section mt-4">{title}</h2>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {valueProofItems.map((item) => (
          <Card key={item.title} tone="ghost" className="rounded-[var(--radius-xl)]">
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">{item.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
