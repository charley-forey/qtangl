import { fetchQtanglJson } from "@/lib/api";

export type HospitalScore = {
  objective: number;
  overtime_cost: number;
  agency_cost: number;
  fatigue_score: number;
  fairness_delta: number;
  seniority_score: number;
  cross_ward_penalty: number;
  overtime_hours: number;
};

export type HospitalCandidate = {
  id: string;
  label: string;
  nurse_id: string;
  nurse_name: string;
  home_ward: string;
  target_ward: string;
  shift_id: string;
  start: string;
  end: string;
  score: HospitalScore;
  source: "classical" | "hybrid" | "fixture" | "agency" | "manual";
  explanation: string[];
  summary: string;
  distinctness: number;
  seniority_preserved: boolean;
  requires_backfill: boolean;
  quantum_weight?: number | null;
  metadata: Record<string, unknown>;
};

export type ScoreboardColumn = {
  label: string;
  solve_wall_time_seconds: number;
  objective: number;
  distinct_plans: number;
  audit_pack_available: boolean;
  summary: string;
  fairness_delta?: number | null;
  agency_cost?: number | null;
  hybrid_beats_classical_objective?: boolean;
  hybrid_beats_classical_fairness?: boolean;
  diversity_score?: number;
};

export type Scoreboard = {
  manual: ScoreboardColumn;
  classical: ScoreboardColumn;
  hybrid: ScoreboardColumn;
};

export type CallOut = {
  id: string;
  nurse_id: string;
  nurse_name: string;
  ward: string;
  shift_id: string;
  start: string;
  end: string;
  urgency_minutes: number;
  required_certifications: string[];
  channel: string;
  reason: string;
};

export type Scenario = {
  id: string;
  title: string;
  summary: string;
  callout: CallOut;
  manual_baseline: {
    decision_minutes: number;
    agency_cost: number;
    summary: string;
  };
  preferred_candidates: string[];
  counts: { bitstring: string; weight: number }[];
};

export type RepairWindow = {
  nurse_ids: string[];
  ward_ids: string[];
  reasons: string[];
  edge_count: number;
};

export type AuditPack = {
  candidate_id: string;
  qubo_snapshot: {
    variableCount?: number;
    candidateIds?: string[];
    candidateScores?: Record<string, number>;
    quadraticTerms?: { variables: string[]; value: number }[];
    penalties?: { hardConstraintLambda: number; softWeights: Record<string, number> };
    runtimeNote?: string;
  };
  binding_constraints: { id: string; label: string; status: string; detail: string }[];
  cost_breakdown: Record<string, number>;
  qpu_trace: {
    backend: Record<string, unknown>;
    run: Record<string, unknown>;
    distribution: { bitstring: string; count: number; decodedCandidateId: string }[];
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

export type HospitalRosterNurse = {
  id: string;
  name: string;
  home_ward: string;
  certifications: string[];
  cross_trained_wards: string[];
  weekly_hours: number;
  max_hours_week: number;
  role: string;
  assignments: {
    shift_id: string;
    ward: string;
    shift_name: string;
    start: string;
    end: string;
  }[];
};

export type HospitalSolveResponse = {
  status: "success";
  scenario: Scenario;
  repairWindow: RepairWindow;
  classicalCandidate: HospitalCandidate;
  hybridCandidates: HospitalCandidate[];
  scoreboard: Scoreboard;
  auditPacks: AuditPack[];
  timeline: TimelineEvent[];
  details: Record<string, unknown>;
};

export async function getHospitalRoster() {
  return fetchQtanglJson<{ status: "success"; summary: string; roster: HospitalRosterNurse[] }>(
    "/hospital/roster"
  );
}

export async function getHospitalScenarios() {
  return fetchQtanglJson<{ status: "success"; scenarios: Scenario[] }>("/hospital/scenarios");
}

export async function getHospitalCallout(scenarioId: string) {
  return fetchQtanglJson<{ status: "success"; callOut: CallOut; scenario: Scenario }>(
    `/hospital/callout?scenarioId=${encodeURIComponent(scenarioId)}`
  );
}

export async function getHospitalQpuTrace() {
  return fetchQtanglJson<{ status: "success"; trace: AuditPack["qpu_trace"] }>("/hospital/qpu-trace");
}

export async function solveHospitalCallout(input: {
  scenarioId: string;
  useFixture?: boolean;
  seed?: number;
  rosterSessionId?: string;
}) {
  return fetchQtanglJson<HospitalSolveResponse>("/hospital/callout/solve", {
    method: "POST",
    body: JSON.stringify({
      scenarioId: input.scenarioId,
      useFixture: input.useFixture ?? true,
      seed: input.seed ?? 1234,
      rosterSessionId: input.rosterSessionId ?? null,
    }),
  });
}

export async function uploadHospitalRoster(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetchQtanglJson<{ status: "success"; sessionId: string; summary: string }>(
    "/hospital/upload-roster",
    {
      method: "POST",
      body: formData,
      skipJsonContentType: true,
    }
  );
}
