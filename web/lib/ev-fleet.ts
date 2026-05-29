import { fetchQtanglJson } from "@/lib/api";

export type EvFleetScore = {
  objective: number;
  energy_cost: number;
  demand_charge_cost: number;
  total_cost: number;
  peak_kw: number;
  offpeak_kwh_fraction: number;
  on_time_probability: number;
  fairness_delta: number;
  readiness_slack_minutes: number;
};

export type ChargeSlot = {
  vehicle_id: string;
  charger_id: string;
  start: string;
  end: string;
  kwh_delivered: number;
  period: "peak" | "shoulder" | "offpeak";
  cost: number;
};

export type ChargePlan = {
  id: string;
  label: string;
  slots: ChargeSlot[];
  score: EvFleetScore;
  source: "classical" | "hybrid" | "fixture" | "naive" | "manual";
  distinctness: number;
  all_ready_by_deadline: boolean;
  summary: string;
  explanation: string[];
  quantum_weight?: number | null;
  bitstring?: string | null;
  metadata: Record<string, unknown>;
};

export type ScoreboardColumn = {
  label: string;
  solve_wall_time_seconds: number;
  objective: number;
  distinct_plans: number;
  audit_pack_available: boolean;
  summary: string;
  daily_cost?: number | null;
  peak_kw?: number | null;
  on_time_probability?: number | null;
  hybrid_beats_classical_objective?: boolean;
  hybrid_beats_classical_cost?: boolean;
};

export type Scoreboard = {
  manual: ScoreboardColumn;
  classical: ScoreboardColumn;
  hybrid: ScoreboardColumn;
};

export type ChargingWindow = {
  id: string;
  plan_date: string;
  tariff_id: string;
  depot_id: string;
  fleet_size: number;
  charger_count: number;
  peak_window_start: string;
  peak_window_end: string;
  urgency_minutes: number;
  channel: string;
  reason: string;
};

export type Scenario = {
  id: string;
  title: string;
  summary: string;
  window: ChargingWindow;
  manual_baseline: {
    decision_minutes: number;
    naive_daily_cost: number;
    summary: string;
  };
  preferred_candidates: string[];
  counts: { bitstring: string; weight: number }[];
  classical_search_scope?: "global" | "local";
  dropped_vehicle_id?: string | null;
};

export type RepairWindow = {
  vehicle_ids: string[];
  charger_ids: string[];
  peak_slot_ids: string[];
  reasons: string[];
  edge_count: number;
};

export type EvFleetVehicle = {
  id: string;
  name: string;
  battery_kwh: number;
  usable_kwh: number;
  efficiency_kwh_per_km: number;
  start_soc_kwh: number;
  connector_type: string;
  max_charge_kw: number;
  depot: string;
  status: string;
  dispatch_deadline: string;
};

export type EvFleetStop = {
  id: string;
  label: string;
  zone: string;
  demand_parcels: number;
  service_minutes: number;
  window_start: string;
  window_end: string;
  priority: string;
};

export type EvFleetCharger = {
  id: string;
  name: string;
  level: string;
  power_kw: number;
  connector_type: string;
  status: string;
};

export type RoutingResult = {
  assignments: {
    vehicle_id: string;
    stop_ids: string[];
    total_km: number;
    energy_needed_kwh: number;
    return_soc_kwh: number;
    depot_return_time: string;
  }[];
  unserved_stop_ids: string[];
  wall_time_seconds: number;
  diagnostics: Record<string, unknown>;
};

export type AuditPack = {
  candidate_id: string;
  qubo_snapshot: {
    variableCount?: number;
    vehicleIds?: string[];
    chargerIds?: string[];
    slotIds?: string[];
    assignmentCosts?: Record<string, number>;
    quadraticTerms?: { variables: string[]; value: number }[];
    penalties?: Record<string, unknown>;
    runtimeNote?: string;
  };
  binding_constraints: { id: string; label: string; status: string; detail: string }[];
  cost_breakdown: Record<string, number>;
  qpu_trace: {
    backend: Record<string, unknown>;
    run: Record<string, unknown>;
    distribution: { bitstring: string; count: number; decodedPlanId: string }[];
    summary: string;
  };
  reproducibility: Record<string, unknown>;
};

export type TimelineEvent = {
  key: string;
  label: string;
  duration_ms: number;
  status: "done" | "replayed" | "skipped";
};

export type EvFleetSolveResponse = {
  status: "success";
  scenario: Scenario;
  routing: RoutingResult;
  repairWindow: RepairWindow;
  classicalPlan: ChargePlan;
  hybridPlans: ChargePlan[];
  scoreboard: Scoreboard;
  auditPacks: AuditPack[];
  timeline: TimelineEvent[];
  details: Record<string, unknown>;
};

export async function getEvFleetDepot() {
  return fetchQtanglJson<{
    status: "success";
    summary: string;
    vehicles: EvFleetVehicle[];
    stops: EvFleetStop[];
    chargers: EvFleetCharger[];
    depot: { id: string; name: string; site_power_cap_kw: number };
    tariff: { id: string; source: string; demand_charge_per_kw: number };
  }>("/ev-fleet/depot");
}

export async function getEvFleetScenarios() {
  return fetchQtanglJson<{ status: "success"; scenarios: Scenario[] }>("/ev-fleet/scenarios");
}

export async function getEvFleetWindow(scenarioId: string) {
  return fetchQtanglJson<{ status: "success"; window: ChargingWindow; scenario: Scenario }>(
    `/ev-fleet/window?scenarioId=${encodeURIComponent(scenarioId)}`
  );
}

export async function getEvFleetQpuTrace() {
  return fetchQtanglJson<{ status: "success"; trace: AuditPack["qpu_trace"] }>(
    "/ev-fleet/qpu-trace"
  );
}

export async function solveEvFleetPlan(input: {
  scenarioId: string;
  useFixture?: boolean;
  seed?: number;
  fleetSessionId?: string;
  stopsSessionId?: string;
}) {
  return fetchQtanglJson<EvFleetSolveResponse>("/ev-fleet/plan/solve", {
    method: "POST",
    body: JSON.stringify({
      scenarioId: input.scenarioId,
      useFixture: input.useFixture ?? true,
      seed: input.seed ?? 1234,
      fleetSessionId: input.fleetSessionId ?? null,
      stopsSessionId: input.stopsSessionId ?? null,
    }),
  });
}

export async function uploadEvFleetFleet(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetchQtanglJson<{ status: "success"; sessionId: string; summary: string }>(
    "/ev-fleet/upload-fleet",
    { method: "POST", body: formData, skipJsonContentType: true }
  );
}

export async function uploadEvFleetStops(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetchQtanglJson<{ status: "success"; sessionId: string; summary: string }>(
    "/ev-fleet/upload-stops",
    { method: "POST", body: formData, skipJsonContentType: true }
  );
}
