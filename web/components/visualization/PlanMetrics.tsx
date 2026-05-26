import Card from "@/components/ui/Card";
import type { DemoMetric } from "@/lib/demo-data";

type PlanMetricsProps = {
  metrics: DemoMetric[];
};

export default function PlanMetrics({ metrics }: PlanMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className="rounded-2xl p-5">
          <p className="text-label">{metric.label}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {metric.value}
          </p>
          {metric.note ? (
            <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
              {metric.note}
            </p>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
