import type { DemoMetric, PlanVisualization, TryScenario } from "@/lib/demo-data";
import type { OptimizeResponse } from "@/lib/optimize";

function formatMetricLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function metricsFromResponse(metrics?: Record<string, string | number>): DemoMetric[] {
  if (!metrics) return [];
  return Object.entries(metrics).map(([key, value]) => ({
    label: formatMetricLabel(key),
    value: String(value),
  }));
}

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function schedulePlanFromResponse(
  response: OptimizeResponse,
  fallback: PlanVisualization
): PlanVisualization | null {
  if (!Array.isArray(response.solution)) return null;

  const blocks = response.solution
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const task = typeof row.task === "string" ? row.task : "";
      const startDay = typeof row.startDay === "number" ? row.startDay : 0;
      const endDay = typeof row.endDay === "number" ? row.endDay : startDay + 1;
      if (!task) return null;

      return {
        id: task,
        label: titleCase(task),
        resource: titleCase(task),
        start: Math.max(0, startDay - 1),
        duration: Math.max(1, endDay - startDay),
      };
    })
    .filter((block): block is NonNullable<typeof block> => block !== null);

  if (blocks.length === 0) return null;

  if (fallback.kind !== "schedule") return null;

  return {
    kind: "schedule",
    title: fallback.title,
    summary: response.summary ?? fallback.summary,
    explanation: fallback.explanation,
    metrics: metricsFromResponse(response.metrics).length
      ? metricsFromResponse(response.metrics)
      : fallback.metrics,
    horizonLabel: fallback.horizonLabel,
    blocks,
  };
}

function routingPlanFromResponse(
  response: OptimizeResponse,
  fallback: PlanVisualization
): PlanVisualization | null {
  if (!response.solution || typeof response.solution !== "object") return null;
  const solution = response.solution as Record<string, unknown>;
  const assignments = solution.assignments;
  if (!Array.isArray(assignments) || assignments.length === 0) return null;

  const first = assignments[0] as Record<string, unknown>;
  const stopOrder = first.stopOrder;
  if (!Array.isArray(stopOrder)) return null;

  const vehicle = typeof first.vehicle === "string" ? first.vehicle : "Vehicle";

  if (fallback.kind !== "routing") return null;

  const stops = stopOrder.map((name, index) => ({
    order: index + 1,
    name: String(name),
    window: "—",
    vehicle,
  }));

  return {
    kind: "routing",
    title: fallback.title,
    summary: response.summary ?? fallback.summary,
    explanation: fallback.explanation,
    metrics: metricsFromResponse(response.metrics).length
      ? metricsFromResponse(response.metrics)
      : fallback.metrics,
    stops,
  };
}

function allocationPlanFromResponse(
  response: OptimizeResponse,
  fallback: PlanVisualization
): PlanVisualization | null {
  if (!response.solution || typeof response.solution !== "object") return null;
  const solution = response.solution as Record<string, unknown>;
  const assignments = solution.assignments;
  if (!Array.isArray(assignments)) return null;

  if (fallback.kind !== "allocation") return null;

  const parsed = assignments
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const person = typeof row.person === "string" ? row.person : "";
      const shift = typeof row.shift === "string" ? row.shift : "";
      const role = typeof row.role === "string" ? row.role : "";
      if (!person || !shift) return null;
      return { person, shift, role };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (parsed.length === 0) return null;

  const shifts = [...new Set(parsed.map((row) => row.shift))];

  return {
    kind: "allocation",
    title: fallback.title,
    summary: response.summary ?? fallback.summary,
    explanation: fallback.explanation,
    metrics: metricsFromResponse(response.metrics).length
      ? metricsFromResponse(response.metrics)
      : fallback.metrics,
    shifts,
    assignments: parsed,
  };
}

export function solutionToPlan(
  response: OptimizeResponse,
  scenario: TryScenario
): PlanVisualization {
  const fallback = scenario.plan;

  if (scenario.id === "schedule") {
    return schedulePlanFromResponse(response, fallback) ?? fallback;
  }

  if (scenario.id === "routing") {
    return routingPlanFromResponse(response, fallback) ?? fallback;
  }

  return allocationPlanFromResponse(response, fallback) ?? fallback;
}
