import Card from "@/components/ui/Card";
import AmplitudeBars from "@/components/visualization/quantum/AmplitudeBars";
import MethodBadge from "@/components/visualization/quantum/MethodBadge";
import TechnologyBlock from "@/components/technology/TechnologyBlock";
import Eyebrow from "@/components/ui/Eyebrow";
import PlanVisualization from "@/components/visualization/PlanVisualization";
import { TryScenario, tryScenarios } from "@/lib/demo-data";
import { optimizationProductPreview } from "@/lib/copy/home";
import { homeAmplitudeBars } from "@/lib/copy/visualization";

type ProductPreviewProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  scenario?: TryScenario;
  layout?: "stacked" | "combined";
};

export default function ProductPreview({
  eyebrow = optimizationProductPreview.eyebrow,
  title = optimizationProductPreview.title,
  description = optimizationProductPreview.description,
  scenario,
  layout = "stacked",
}: ProductPreviewProps) {
  const activeScenario = scenario ?? tryScenarios[0];
  const method = (activeScenario.apiResponse.method as string | undefined) ?? "hybrid";
  const bars = homeAmplitudeBars.map((item) => ({ ...item }));

  if (layout === "combined") {
    return (
      <TechnologyBlock eyebrow={eyebrow} title={title} description={description}>
        <Card
          tone="strong"
          size="lg"
          className="overflow-hidden rounded-[var(--radius-feature)] p-0"
        >
          <div className="card-size-lg border-b border-[var(--border)]">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <MethodBadge method={method} />
            </div>
          </div>

          <div className="card-size-lg border-b border-[var(--border)]">
            <AmplitudeBars variant="embedded" items={bars} />
          </div>

          <div className="card-size-lg">
            <PlanVisualization plan={activeScenario.plan} method={method} />
          </div>
        </Card>
      </TechnologyBlock>
    );
  }

  return (
    <div className="tech-stack">
      <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Eyebrow>{eyebrow}</Eyebrow>
          <MethodBadge method={method} />
        </div>
        <h2 className="heading-section mt-4">{title}</h2>
        <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">{description}</p>
      </Card>
      <AmplitudeBars items={bars} />
      <PlanVisualization plan={activeScenario.plan} method={method} />
    </div>
  );
}
