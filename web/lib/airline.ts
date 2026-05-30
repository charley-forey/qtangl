import { fetchQtanglJson } from "@/lib/api";

export type AirlineScore = {
  objective: number;
  premium_pay_cost: number;
  reserve_cost: number;
  fatigue_score: number;
  fairness_delta: number;
  seniority_score: number;
  off_base_penalty: number;
  duty_overage_hours: number;
  on_time_probability: number;
};

export type LegAssignment = {
  leg_id: string;
  crew_id: string;
  crew_name: string;
  role: string;
  home_base: string;
  source: "internal" | "reserve" | "deadhead";
  explanation: string[];
};

export type RecoveryPlan = {
  id: string;
  label: string;
  assignments: LegAssignment[];
  score: AirlineScore;
  source: "classical" | "hybrid" | "fixture" | "reserve" | "manual";
  distinctness: number;
  seniority_preserved: boolean;
  far117_compliant: boolean;
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
  on_time_probability?: number | null;
  recovery_cost?: number | null;
  far117_compliant?: boolean;
  hybrid_beats_classical_objective?: boolean;
  hybrid_beats_classical_fairness?: boolean;
  diversity_score?: number;
};

export type Scoreboard = {
  manual: ScoreboardColumn;
  classical: ScoreboardColumn;
  hybrid: ScoreboardColumn;
};

export type Disruption = {
  id: string;
  aircraft_id: string;
  station: string;
  start: string;
  mx_hold_hours: number;
  affected_leg_ids: string[];
  crew_affected: number;
  urgency_minutes: number;
  channel: string;
  reason: string;
  required_quals: string[];
};

export type Scenario = {
  id: string;
  title: string;
  summary: string;
  disruption: Disruption;
  manual_baseline: {
    decision_minutes: number;
    recovery_cost: number;
    summary: string;
  };
  preferred_candidates: string[];
  counts: { bitstring: string; weight: number }[];
  classical_search_scope?: "global" | "local";
};

export type RepairWindow = {
  crew_ids: string[];
  base_ids: string[];
  leg_ids: string[];
  reasons: string[];
  edge_count: number;
};

export type RoutingResult = {
  tail_assignments: { leg_id: string; tail_id: string; fleet_type: string }[];
  open_legs: {
    leg_id: string;
    flight_no: string;
    origin: string;
    dest: string;
    sched_dep: string;
    sched_arr: string;
    required_quals: string[];
    tail_id: string;
  }[];
  wall_time_seconds: number;
  diagnostics: Record<string, unknown>;
};

export type AuditPack = {
  candidate_id: string;
  qubo_snapshot: {
    variableCount?: number;
    crewIds?: string[];
    legIds?: string[];
    pairCosts?: Record<string, number>;
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

export type AirlineCrewMember = {
  id: string;
  name: string;
  role: string;
  base: string;
  qualifications: string[];
  qualified_fleets: string[];
  block_hours_week: number;
  max_fdp_hours: number;
  assignments: {
    leg_id: string;
    flight_no: string;
    origin: string;
    dest: string;
    sched_dep: string;
    sched_arr: string;
  }[];
};

export type AirlineFlight = {
  id: string;
  flight_no: string;
  origin: string;
  dest: string;
  sched_dep: string;
  sched_arr: string;
  tail_id: string;
  fleet_type: string;
};

export type AirlineSolveResponse = {
  status: "success";
  scenario: Scenario;
  routing: RoutingResult;
  repairWindow: RepairWindow;
  classicalPlan: RecoveryPlan;
  hybridPlans: RecoveryPlan[];
  scoreboard: Scoreboard;
  auditPacks: AuditPack[];
  timeline: TimelineEvent[];
  details: Record<string, unknown>;
};

export async function getAirlineNetwork() {
  return fetchQtanglJson<{
    status: "success";
    summary: string;
    crew: AirlineCrewMember[];
    flights: AirlineFlight[];
    aircraft: Record<string, unknown>[];
  }>("/airline/network");
}

export async function getAirlineScenarios() {
  return fetchQtanglJson<{ status: "success"; scenarios: Scenario[] }>("/airline/scenarios");
}

export async function getAirlineDisruption(scenarioId: string) {
  return fetchQtanglJson<{ status: "success"; disruption: Disruption; scenario: Scenario }>(
    `/airline/disruption?scenarioId=${encodeURIComponent(scenarioId)}`
  );
}

export async function getAirlineQpuTrace() {
  return fetchQtanglJson<{ status: "success"; trace: AuditPack["qpu_trace"] }>(
    "/airline/qpu-trace"
  );
}

export async function solveAirlineRecovery(input: {
  scenarioId: string;
  useFixture?: boolean;
  seed?: number;
  crewSessionId?: string;
}) {
  return fetchQtanglJson<AirlineSolveResponse>("/airline/recover/solve", {
    method: "POST",
    body: JSON.stringify({
      scenarioId: input.scenarioId,
      useFixture: input.useFixture ?? true,
      seed: input.seed ?? 1234,
      crewSessionId: input.crewSessionId ?? null,
    }),
  });
}

export async function uploadAirlineCrew(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetchQtanglJson<{ status: "success"; sessionId: string; summary: string }>(
    "/airline/upload-crew",
    {
      method: "POST",
      body: formData,
      skipJsonContentType: true,
    }
  );
}
