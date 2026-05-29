import type { Scenario } from "@/lib/airline";

export const FALLBACK_SCENARIOS: Scenario[] = [
  {
    id: "mx-hold-ord-0612",
    title: "KORD MX hold — tail N812JB",
    summary:
      "06:12 at KORD — N812JB unavailable for a 3-hour maintenance hold. Three downstream legs need tail swap and crew rebid.",
    disruption: {
      id: "disruption-mx-ord",
      aircraft_id: "N812JB",
      station: "KORD",
      start: "2026-05-28T06:12:00",
      mx_hold_hours: 3,
      affected_leg_ids: ["leg-001", "leg-002", "leg-003"],
      crew_affected: 12,
      urgency_minutes: 48,
      channel: "acars",
      reason: "Hydraulic leak — 3 hr MX hold",
      required_quals: ["A320", "ETOPS"],
    },
    manual_baseline: {
      decision_minutes: 35,
      recovery_cost: 185000,
      summary: "OCC cancels the third leg and calls reserve at premium cost to protect the bank.",
    },
    preferred_candidates: ["crew-003", "crew-007", "crew-011"],
    counts: [
      { bitstring: "100000000000", weight: 24 },
      { bitstring: "010000000000", weight: 31 },
      { bitstring: "001000000000", weight: 45 },
    ],
    classical_search_scope: "local",
  },
  {
    id: "crew-illegal-dca",
    title: "FAR 117 bust at DCA",
    summary:
      "Inbound delay pushes a connecting crew over FDP at KDCA; two afternoon departures need reassignment.",
    disruption: {
      id: "disruption-fdp-dca",
      aircraft_id: "N903DL",
      station: "KDCA",
      start: "2026-05-28T07:00:00",
      mx_hold_hours: 0,
      affected_leg_ids: ["leg-004", "leg-005"],
      crew_affected: 8,
      urgency_minutes: 55,
      channel: "phone",
      reason: "Inbound delay — crew illegal on FDP",
      required_quals: ["A320", "ETOPS"],
    },
    manual_baseline: {
      decision_minutes: 28,
      recovery_cost: 92000,
      summary: "Controllers deadhead reserve from BOS and accept a 45-minute delay on the ORD departure.",
    },
    preferred_candidates: ["crew-015", "crew-021"],
    counts: [
      { bitstring: "100000", weight: 28 },
      { bitstring: "010000", weight: 36 },
      { bitstring: "001000", weight: 36 },
    ],
    classical_search_scope: "global",
  },
  {
    id: "wx-groundstop-dfw",
    title: "DFW ground stop cascade",
    summary:
      "Weather ground stop at DFW ripples through the evening bank; legs need tail and crew recovery.",
    disruption: {
      id: "disruption-wx-dfw",
      aircraft_id: "N445BZ",
      station: "KDFW",
      start: "2026-05-28T10:00:00",
      mx_hold_hours: 1.5,
      affected_leg_ids: ["leg-005", "leg-006"],
      crew_affected: 10,
      urgency_minutes: 70,
      channel: "email",
      reason: "Ground stop — convective weather",
      required_quals: ["A320"],
    },
    manual_baseline: {
      decision_minutes: 42,
      recovery_cost: 210000,
      summary: "Manual plan cancels one leg and hotels 140 passengers before calling reserve.",
    },
    preferred_candidates: ["crew-005", "crew-009"],
    counts: [
      { bitstring: "10000", weight: 30 },
      { bitstring: "01000", weight: 35 },
      { bitstring: "00100", weight: 35 },
    ],
    classical_search_scope: "global",
  },
];
