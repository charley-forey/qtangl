The exact hospital re-staffing demo — fully specified
5.1 The named persona and pain story (this is what 0:00–0:30 of the recording opens with)
"It's 04:11 on a Tuesday at a 420-bed regional hospital in the U.S. Sarah K., a charge-eligible RN with ACLS, PALS, and 7 years of cath-lab experience, calls in sick. She was scheduled 06:30–18:30 in Cath Lab 2. The charge nurse, Marcus, has 49 minutes to (a) cover Sarah's slot, (b) keep two other ORs staffed, (c) honor the union CBA's 10-hour rest rule, (d) avoid pushing anyone over 60 hr/week, (e) not breach the hospital's 1:1 ACLS coverage rule in cath lab. Last quarter the hospital spent $1.41M on agency RN coverage triggered by these call-out cascades. Marcus has a magnetic-name-tag board, a paper master roster, and Excel."

That's the story. It's specific, it's audited, it's a known $-line item.

5.2 The constraints we will encode (these are real)
Constraint family	Specific rule	Source
Skill / certification
ACLS / PALS / NRP / CCRN match to ward minimums
The Joint Commission HR standards
Acuity coverage
Cath lab 1:1 ACLS, ICU 1:2, Med-surg 1:5, OR 1 circulating + 1 scrub
AACN, AORN standards
Fatigue / safety
No 16 hr+ continuous duty, 10 hr rest between shifts, max 60 hr/wk
Common CBA + ANA position
Seniority bumping
Senior staff can refuse mandation; junior bumped first
Typical CBA
Float pool eligibility
Cath lab requires explicit cross-training credential
Hospital policy
Cost ladder
Internal swap < voluntary OT < mandatory OT < agency
Hospital comp policy
5.3 The technical solve (what pipeline.py becomes)
The high-level architecture in backend/app/pipeline.py (lines 29–49) is right. Concretely:

Global classical pass — CP-SAT over the entire roster (e.g., 180 RNs, 14-day grid, 6 wards). Solves in <2s typically. Produces an objective: 0.2·overtime_$ + 0.3·agency_$ + 0.3·fatigue_score + 0.2·fairness_deviation.
Local repair window detection — given the call-out, identify the 6–12 staff whose shifts are coupled to the gap through skill/ward/CBA constraints. This is the missing piece in pipeline.py today (line 105 currently returns "not_implemented"). The detection is a graph reachability over the constraint hyper-graph centered on the missing slot.
Hybrid micro-solve — that 6–12 person window with ~30–80 binary variables is in the sweet spot of QAOA on a simulator and of D-Wave hybrid / Fujitsu DA on real hardware. Run QAOA via your existing solve_schedule_with_qaoa, but also expose a "swap to D-Wave hybrid" toggle that posts to Leap.
Diversity selection — instead of returning just argmin objective, return the top-K (e.g., 3) structurally different feasible swaps (different bumped nurses, different OT incidence). This is where hybrid earns its keep — multi-sampling from the QAOA distribution naturally surfaces diversity that CP-SAT's branch-and-bound buries.
Audit pack — for each returned plan, attach: QUBO snapshot, constraint trace, $ delta vs baseline, fatigue score delta, fairness Gini delta, and which CBA rule was binding.
5.4 Honest scoreboard in the demo
The recording must show this — it's what makes it credible:

                       Classical (CP-SAT)     Hybrid (CP-SAT + QAOA repair)
Solve wall time:       1.18 s                 6.34 s  (slower — and we say so)
Objective:             142.6                  142.6   (tied — and we say so)
# distinct feasible
   plans surfaced:     1                      3       (the actual value-add)
Audit pack:            yes                    yes + QUBO trace
The pitch line is: "We will not pretend quantum is faster. We will show you three provably-feasible swaps your CP-SAT solver would have picked one of and discarded the rest, with the constraint trace for each. That's the auditable second opinion your compliance officer wants."

5.5 Reference repos to pull from for this exact build
Qiskit__qiskit-optimization/applications/__init__.py — you're already using this; the bin_packing.py and set_packing.py patterns are closest to nurse-shift assignment.
dwavesystems__dwave-ocean-sdk/dwave-hybrid — read this. Their KerberosSampler and HybridSampler patterns are exactly the "classical full + QPU subproblem" architecture you need, and the API is dead simple.
dwavesystems__dwave-system — for the actual D-Wave Leap toggle.
entropicalabs__openqaoa — their warm-start QAOA is more sample-efficient than the vanilla Qiskit path you have today; matters because the demo's 6-second pause is currently SPSA iterations.
unitaryfund__mitiq — if you want a "we apply ZNE error mitigation when running on real hardware" flourish in the audit pack.
5.6 Data source for the "real anonymized" requirement you picked
For believable nurse-roster data, three honest options:

NRC Health publishes nurse staffing benchmark distributions (skill mix %, OT %, agency %) by hospital size; use those to generate a fully synthetic 180-RN roster whose marginal statistics match a real US hospital.
CMS Hospital Compare / Payroll-Based Journal (PBJ) — the PBJ dataset is publicly available and contains real RN/LPN/CNA hours by hospital by day. Excellent grounding source. We pick one anonymized facility, regenerate names, keep distributions.
Synthea — open-source synthetic patient data — can drive the acuity side of the model.
I'd do PBJ + Synthea. Both are free, both are real-data-shaped, neither carries PHI.

5.7 What changes in your existing files (no edits made — just the diff sketch)
backend/app/parsers/allocation.py — replace the generic "shifts/staff" schema with a nurse-specific one: ward, certifications[], CBA group, seniority date, max_hours_week, last_shift_end.
backend/app/qubo/scheduling.py — add a nurse_repair_qubo() builder that emits the micro-window QUBO with skill-match penalty, OT-cost linear term, fatigue penalty, and seniority bumping soft constraint.
backend/app/pipeline.py lines 65–118 — implement detect_local_repair_window for real (the docstring on line 109 admits it's not done yet) by walking the constraint hyper-graph from the gap node outward to a fixed neighborhood radius.
backend/app/solvers/ — add dwave_hybrid.py solver alongside qaoa.py, gated by QTANGL_ENABLE_DWAVE=true, so the demo can show the same micro-window solved two ways (QAOA on Aer, hybrid on Leap).
web/lib/demo-data.ts — replace the three current scenarios with one rich nurseRosterScenario containing real-shape PBJ-derived data, plus the call-out event + the recorded backend trace.
web/app/try/ — rebuild the demo UI as a single "OR command center" view: roster heatmap, call-out fire button, side-by-side candidate plans, audit drawer.
That's ~3 weeks of focused build for a recordable, credible demo.

When you want me to start, switch out of Ask mode and tell me which slice to land first. I'd recommend in this order:

Real nurse-roster data ingestion (parsers + sample PBJ-shaped dataset) — 3 days.
detect_local_repair_window actually working over a real constraint hyper-graph — 3 days.
Diversity sampling from the QAOA path + audit pack assembly — 2 days.
D-Wave hybrid solver toggle — 2 days.
The /try page rebuild into the OR command center view — 4 days.
Polish + record the 3.5-minute demo video — 2 days.
Anything in this plan you want to challenge, swap, or push back on before we start cutting code?