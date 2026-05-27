import Card from "@/components/ui/Card";
import AmplitudeBars from "@/components/visualization/quantum/AmplitudeBars";
import MethodBadge from "@/components/visualization/quantum/MethodBadge";
import Eyebrow from "@/components/ui/Eyebrow";
import PlanVisualization from "@/components/visualization/PlanVisualization";
import { TryScenario, tryScenarios } from "@/lib/demo-data";
import { homeProductPreview } from "@/lib/copy/home";
import { homeAmplitudeBars } from "@/lib/copy/visualization";

type ProductPreviewProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  scenario?: TryScenario;
};

export default function ProductPreview({
  eyebrow = homeProductPreview.eyebrow,
  title = homeProductPreview.title,
  description = homeProductPreview.description,
  scenario,
}: ProductPreviewProps) {
  const activeScenario = scenario ?? tryScenarios[0];

  return (
    <div className="grid gap-6">
      <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Eyebrow>{eyebrow}</Eyebrow>
          <MethodBadge method={(activeScenario.apiResponse.method as string | undefined) ?? "hybrid"} />
        </div>
        <h2 className="heading-section mt-4">{title}</h2>
        <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">{description}</p>
      </Card>
      <AmplitudeBars items={homeAmplitudeBars.map((item) => ({ ...item }))} />
      <PlanVisualization
        plan={activeScenario.plan}
        method={(activeScenario.apiResponse.method as string | undefined) ?? "hybrid"}
      />
    </div>
  );
}
