import Card from "@/components/ui/Card";
import type { DemoMetric } from "@/lib/demo-data";

type PlanMetricsProps = {
  metrics: DemoMetric[];
};

export default function PlanMetrics({ metrics }: PlanMetricsProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label} as="div" tone="strong" size="md" className="rounded-[var(--radius-xl)]">
          <dt className="text-label">{metric.label}</dt>
          <dd className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {metric.value}
          </dd>
          {metric.note ? (
            <dd className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
              {metric.note}
            </dd>
          ) : null}
        </Card>
      ))}
    </dl>
  );
}
