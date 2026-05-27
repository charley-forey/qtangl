The five most defensible, demoable use cases — ranked
I'll give each one: buyer persona, the specific pain in dollars, what the demo recording shows on screen, the honest quantum value-add, reference repos to lean on, and how it fits your current codebase.

Rank 1 — Hospital OR / nurse re-staffing on a call-out (recommended)
Persona. Nurse manager / OR charge nurse at a 300–600 bed US hospital. They get called at 04:00 because a nurse on the day shift in the cath lab called out sick. They have 45 minutes to find a swap that satisfies: skill mix (ACLS, scrub vs circulating, charge), union rules (no 16+ hr stretches, mandatory 10 hr rest), seniority bumping rules, patient acuity coverage minimums, and minimal overtime cost.

Pain in $. A single mis-staffed OR shift is ~$5k–$12k in overtime + agency staffing. Sub-optimal swap = real cascading patient delays. A typical 400-bed hospital does this 30–60 times/month. Becker's Hospital Review pegs U.S. hospital overtime spend related to schedule volatility at $14–22B/year.

What the demo recording shows.

A clean dashboard. "04:11 — Sarah K. (Day shift, Cath Lab, RN-ACLS) called out."
One-click "Find a swap." A 6–10 second progress bar narrates: "Solving full roster classically (CP-SAT)... 1.2s. Detecting local repair window... 0.3s. Running QAOA micro-repair on 8-nurse window... 4.1s. Comparing candidates..."
The UI shows two candidate plans side by side: classical-only and hybrid, both feasible, with a constraint-violation count, overtime cost delta, fatigue-risk score, and a "why this swap" explanation pulled from the diagnostics block.
Diagnostics drawer shows the actual QUBO size, the constraints relaxed in the micro-window, and a one-line note "Hybrid candidate matched classical optimum within 1.2% objective; CP-SAT plan selected" — i.e., you are honest about who won, and that's the point.
Honest quantum value-add. Not speed. Not "quantum optimum." Two things:

Audit & explainability: the hybrid trace shows why a swap is locally optimal — a hospital compliance officer can save the QUBO snapshot as evidence the decision was bounded by rules, not "the AI just picked her."
Second-opinion: when CP-SAT returns a tied set of optima with very different staff-fairness profiles, the hybrid pass surfaces alternates the greedy CP-SAT path drops.
Reference repos to leverage. Qiskit__qiskit-optimization/applications (you already use this), dwavesystems__dwave-ocean-sdk/dwave-hybrid (their hybrid workflow framework is the gold standard for "classical + small QPU subproblem" — read dwave-hybrid patterns for solver decomposition).

Fits your codebase. Almost zero rewrite. Replace web/lib/demo-data.ts "shift staffing" with a real nurse-scheduling instance (10–20 staff, 3 wards, 7-day grid). Extend backend/app/parsers/allocation.py to ingest skill/union/fatigue rules. The LocalRepairWindow plumbing already in pipeline.py (lines 13–18) is exactly the right abstraction for "a 6–8 person swap window inside a 200-person roster."

Why it wins. Hospital scheduling has the strongest "real pain, real $, board-level attention, willing to talk on a case study" profile of any optimization vertical in 2026, and you've already implemented 60% of it.

Rank 2 — Airline crew/flight disruption recovery (the "OCC repair" demo)
Persona. Operations Control Center (OCC) controller at a regional or low-cost carrier (think Breeze, Avelo, Spirit, JetBlue regional). When a 06:00 maintenance hold makes one aircraft unavailable, they need to swap aircraft and crew across 3–5 downstream flights in the next 90 minutes, respecting: FAA crew duty/rest (FAR 117), aircraft type ratings, base-return constraints, gate availability, slot times, passenger MCT (minimum connect time).

Pain in $. A single mis-recovered cascade = $0.5–2M (rebooking, hotels, EU261/DOT compensation, brand damage). DOT-tracked controllable cancellations at top 10 US carriers cost the industry ~$8B in 2024.

Demo recording.

Load KORD 0612 — N812JB unavailable, 3 hr MX hold.
The dashboard shows the cascade: 3 downstream flights at risk, 12 crew members affected.
Hit "Recover." The system runs classical aircraft routing repair first (~2s), identifies a 6-flight crew rebid as the constrained subproblem, runs a hybrid pass on the rebid window, and returns a single plan with: cost delta vs do-nothing, on-time arrival probability, FAR 117 compliance proof.
Side panel: "Classical-only plan" vs "Hybrid plan" — for the demo you'll often show them tied, with hybrid finding one or two more diverse alternates (different crew swaps with same cost) that the greedy classical missed.
Honest value-add. Same as #1 — diversity of feasible alternates + auditable diagnostics, not speed.

Reference repos. Qiskit__qiskit-optimization (your stack), entropicalabs__openqaoa (their warm-start QAOA implementation handles disruption-recovery initial guesses well).

Fits your codebase. Bigger lift than #1. Need a real flight/crew data model in parsers/scheduling.py. ~2 weeks of work.

Rank 3 — EV fleet depot charging + routing (last-mile delivery)
Persona. Ops manager at a regional last-mile delivery operator with 20–80 electric vans (DHL eXpress regional, Amazon DSP, REEF, regional USPS pilots). They have a depot with 6–20 Level 2 chargers, time-of-use electricity tariffs (3:1 peak/off-peak in CA, NY), customer windows, and vehicle range constraints.

Pain in $. A 50-EV fleet leaves $400–900/day on the table by charging during peaks. That's $150k–$330k/yr per depot. Plus demand-charge spikes ($15–30/kW) when too many chargers are pulling at once.

Demo recording.

Upload a fleet roster (fleet.csv) + a stop list (stops.csv) + the depot's TOU tariff.
Two-stage solve: (a) classical VRP on the routes, (b) hybrid solve on the charger-queue assignment + arrival-time staggering, because that's the small bilevel coupling that's a genuine QUBO sweet spot.
Output: daily plan with $/day saved vs naive plan, peak demand kW, on-time delivery %.
Honest value-add. The charger-queue subproblem is small (15–30 binary vars typical) and has a real QUBO structure that can benefit from quantum-inspired solvers (D-Wave hybrid, Fujitsu DA, even QAOA at warm start). And the dollar number is concrete and provable.

Reference repos. dwavesystems__dwave-ocean-sdk/dwave-optimization, Qiskit__qiskit-optimization/applications/vehicle_routing.py.

Fits your codebase. Reuse parsers/routing.py for the VRP. Add a charger-queue QUBO model alongside app/qubo/scheduling.py. ~2–3 weeks.

Rank 4 — PQC migration / "Q-Day readiness" scanner (orthogonal product, very real urgency)
Persona. CISO, compliance lead, or FedRAMP/CMMC officer at a bank, gov contractor, healthcare insurer, or SaaS company. They have a board-level mandate to inventory all RSA/ECDSA/DH cryptographic exposure and produce a PQC migration plan before 2027/2030 NIST/NSM deadlines.

Pain in $. Compliance failure = lost contracts. "Harvest now, decrypt later" = adversaries are storing encrypted traffic today to break with future QCs. Even mid-size banks budget $5–25M for PQC migration programs in 2026.

Demo recording.

Enter a domain or paste cert bundle.
Tool crawls: TLS endpoints, SSH host keys, code-signing certs, JWT signing keys, document signing.
Classifies each by quantum vulnerability (RSA-2048 → broken by Shor at ~4000 logical qubits, ECDSA-P256 → broken at ~2330, etc.) and SLA risk window.
Live "proof of post-quantum handshake": opens a TLS 1.3 connection to a demo server using ML-KEM-768 hybrid key exchange via oqs-provider for OpenSSL 3. Shows the captured ClientHello with the post-quantum group.
Outputs a migration report (PDF) with prioritized remediation backlog.
Honest value-add. This is the only one of the five where you don't have to caveat "quantum doesn't win yet." Here quantum is the threat, not the engine, and you are selling the defense. The market is huge and time-pressured.

Reference repos. open-quantum-safe__liboqs (already in your reference/, see their ALGORITHMS.md), open-quantum-safe__openssl, open-quantum-safe__openssh-portable, PQClean__PQClean. Real, deployable, NIST-aligned code.

Fits your codebase. This is a new pillar — separate from your hybrid optimizer. You'd add a backend/app/pqc/ module (scanner + OQS handshake prover) and a new /pqc-scan endpoint. Marketing pitch: "Qtangl helps you on both sides of Q-Day — extract value from hybrid optimization today, and prove your stack survives Q-Day tomorrow." Cohesive story.

Effort. ~3–4 weeks for an MVP scanner that does TLS endpoint inventory + one live PQC handshake demo. The OQS provider does the heavy lifting.

Rank 5 — QRNG-as-a-Service for compliance entropy
Persona. Lottery/gaming operator (regulated by state lottery commissions, MGA, UKGC), HSM vendor, fintech that needs NIST SP 800-90B certified physical entropy for key generation.

Pain in $. Regulated gaming auditors are starting to require physical entropy sources for shuffle/draw RNGs. Software PRNGs from /dev/urandom are not always defensible under audit. ID Quantique sells QRNG appliances at $5k–25k each.

Demo recording.

Hit POST /entropy/quantum?bytes=4096.
Backend calls IBM Quantum / AWS Braket / IonQ Cloud, prepares 4096 |+⟩ states, measures, hashes the raw bitstream with NIST SP 800-90B conditioner.
Returns the bytes + a JSON certificate including: backend, calibration timestamp, NIST STS results (live), the device's reported T1/T2/error rate.
Side-by-side comparison page: live /dev/urandom bitstream vs cloud-QPU bitstream both running the STS suite — purely educational, but the visual is killer.
Honest value-add. QRNG is the only quantum capability that already has a clear, defensible commercial advantage over classical at the small-scale "I need 100 KB/s of entropy" use case, because it's based on physics (single-photon measurement, qubit superposition) rather than algorithm performance.

Reference repos. aws/amazon-braket-sdk-python (Braket has direct QRNG primitives), QISKit/qiskit, Quandela/Perceval (photonic QRNG is the gold standard).

Fits your codebase. Smallest scope of any item here. New /entropy route. ~1 week.

Why only #5. The market is real but small — most teams settle for an Intel RDRAND or /dev/urandom. Hard to drive expansion beyond a few niches. Great secondary demo card, not the lead.