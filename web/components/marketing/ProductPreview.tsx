import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import PlanVisualization from "@/components/visualization/PlanVisualization";
import { TryScenario, tryScenarios } from "@/lib/demo-data";

type ProductPreviewProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  scenario?: TryScenario;
};

export default function ProductPreview({
  eyebrow = "Product proof",
  title = "A planning product people can understand before they ever read the API.",
  description = "The interface below shows the kind of ranked output Qtangl is designed to return: a readable plan, a short explanation, and the metric that makes the value obvious.",
  scenario,
}: ProductPreviewProps) {
  const activeScenario = scenario ?? tryScenarios[0];

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="rounded-[1.75rem]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            {description}
          </p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            <p>
              The right product surface starts with the business problem, not solver
              jargon. That means a user should immediately see the plan, the blocked
              window, and the measurable improvement.
            </p>
            <p>
              The same visualization layer can render demo data today and live API
              responses later without changing the mental model.
            </p>
          </div>
        </Card>
      </div>

      <PlanVisualization plan={activeScenario.plan} />
    </div>
  );
}
