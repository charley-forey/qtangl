import type { Scenario } from "@/lib/hospital";

/** Used when the backend is unreachable or not yet deployed (e.g. Railway still on old build). */
export const FALLBACK_SCENARIOS: Scenario[] = [
  {
    id: "callout-cath-acls",
    title: "Cath lab ACLS call-out",
    summary:
      "Sarah K. calls out 49 minutes before the day shift in Cath Lab 2, leaving an ACLS-required procedural slot uncovered.",
    callout: {
      id: "callout-sarah-k",
      nurse_id: "nurse-sarah-k",
      nurse_name: "Sarah Keller",
      ward: "Cath Lab 2",
      shift_id: "cath-lab-2-1-day",
      start: "2026-05-26T06:30:00",
      end: "2026-05-26T18:30:00",
      urgency_minutes: 49,
      required_certifications: ["ACLS", "PALS"],
      channel: "phone",
      reason: "Sick call",
    },
    manual_baseline: {
      decision_minutes: 22,
      agency_cost: 4800,
      summary: "Charge nurse defaults to the safest agency backfill to preserve acuity coverage.",
    },
    preferred_candidates: ["nurse-priya-n", "nurse-devin-r", "nurse-olivia-t"],
    counts: [
      { bitstring: "001", weight: 27 },
      { bitstring: "010", weight: 33 },
      { bitstring: "100", weight: 40 },
    ],
  },
  {
    id: "callout-icu-mass",
    title: "ICU cascade call-out",
    summary:
      "Three ICU nurses call out on the same morning, forcing a rebalance across ICU, cath lab, and float coverage.",
    callout: {
      id: "callout-icu-mass",
      nurse_id: "nurse-devin-r",
      nurse_name: "Devin Reyes",
      ward: "ICU",
      shift_id: "icu-1-day",
      start: "2026-05-26T06:30:00",
      end: "2026-05-26T18:30:00",
      urgency_minutes: 41,
      required_certifications: ["ACLS", "CCRN"],
      channel: "text",
      reason: "Multi-call outage",
    },
    manual_baseline: {
      decision_minutes: 31,
      agency_cost: 9100,
      summary:
        "Manual balancing forces two agency nurses because the scheduler cannot see the best float chain fast enough.",
    },
    preferred_candidates: ["nurse-priya-n", "nurse-018", "nurse-035"],
    counts: [
      { bitstring: "001", weight: 21 },
      { bitstring: "010", weight: 32 },
      { bitstring: "100", weight: 47 },
    ],
  },
  {
    id: "callout-or-late-add",
    title: "OR late add-on case",
    summary:
      "An urgent OR case is added after 06:30 and the command center needs a scrub-certified RN without breaching fatigue rules.",
    callout: {
      id: "callout-or-late-add",
      nurse_id: "nurse-amara-j",
      nurse_name: "Amara James",
      ward: "OR-A",
      shift_id: "or-a-1-day",
      start: "2026-05-26T09:00:00",
      end: "2026-05-26T21:00:00",
      urgency_minutes: 63,
      required_certifications: ["Scrub", "Circulating"],
      channel: "pager",
      reason: "Late add-on case",
    },
    manual_baseline: {
      decision_minutes: 18,
      agency_cost: 3900,
      summary: "The manual plan pulls the nearest scrub-certified traveler, increasing cost and hand-off risk.",
    },
    preferred_candidates: ["nurse-042", "nurse-051", "nurse-078"],
    counts: [
      { bitstring: "001", weight: 24 },
      { bitstring: "010", weight: 34 },
      { bitstring: "100", weight: 42 },
    ],
  },
];
