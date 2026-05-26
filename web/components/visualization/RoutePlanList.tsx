import Card from "@/components/ui/Card";
import type { RouteVisualization } from "@/lib/demo-data";

type RoutePlanListProps = {
  plan: RouteVisualization;
};

export default function RoutePlanList({ plan }: RoutePlanListProps) {
  return (
    <Card tone="feature" size="lg" className="h-full rounded-[var(--radius-feature)]">
      <p className="text-label">Visual plan</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{plan.title}</h3>

      <ol className="mt-6 space-y-3" aria-label={`${plan.title} stops`}>
        {plan.stops.map((stop) => (
          <li
            key={`${stop.vehicle}-${stop.order}-${stop.name}`}
            className="grid gap-3 rounded-2xl border border-[var(--border)] bg-black/40 px-4 py-4 md:grid-cols-[auto_1fr_auto]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.06] text-sm font-semibold text-white">
              {stop.order}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{stop.name}</p>
              <p className="mt-1 text-xs text-[var(--color-gray-400)]">
                Window: {stop.window}
              </p>
              {stop.note ? (
                <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
                  {stop.note}
                </p>
              ) : null}
            </div>
            <p className="text-sm text-[var(--color-gray-300)]">{stop.vehicle}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
