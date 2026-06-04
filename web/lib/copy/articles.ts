import { quantumLexicon } from "@/lib/copy/voice";

const { amplitude, collapse, interference, measurement, phase, superposition } =
  quantumLexicon;

export const articleOutcomeStrip = [
  {
    label: superposition.label,
    description: "Compare feasible plans before you collapse to one.",
  },
  {
    label: phase.label,
    description: "Feasibility first, then rank against the operational objective.",
  },
  {
    label: measurement.label,
    description: "Ranked plan, short why, and the metric behind the call.",
  },
] as const;

export const blogIndexCopy = {
  eyebrow: "Blog",
  title: "Q-Day readiness and hybrid optimization.",
  description:
    "PQC inventory, crypto drift, and signed evidence — plus scheduling, routing, and staffing field notes.",
} as const;

export const blogClosingCta = {
  title: "Try it on a real planning problem",
  description:
    "Send a sample schedule, route, or staffing job. Inspect the ranked plan before you integrate.",
  href: "/sandbox",
  label: "Open API sandbox",
} as const;

export const readinessBlogCta = {
  title: "See your exposure with evidence",
  description:
    "Run a live PQC inventory scan, export a CBOM, and verify signed reports independently.",
  primaryHref: "/demo/pqc",
  primaryLabel: "Try the PQC demo",
  secondaryHref: "/assess",
  secondaryLabel: "Explore Assess tier",
} as const;

export const readinessArticles = {
  pqcDeadlines2029: {
    eyebrow: "Compliance & timelines",
    title: "PQC deadlines in 2029 and beyond: what CISOs should track",
    intro:
      "Google and Cloudflare moved internal post-quantum readiness targets to 2029 — roughly five years sooner than prior plans. Federal and industry frameworks already set migration clocks. Your inventory must map to the deadlines auditors track.",
    coverImage: "/qtangl-technology-solver-grid.svg",
    coverAlt: "Compliance deadline timeline for post-quantum cryptography migration.",
    datePublished: "2026-06-03",
    sourceIds: [
      "google-2029-ars",
      "cloudflare-pq-roadmap",
      "nist-ir-8547",
      "gqi-q-day-summary",
      "nsa-cnsa-2",
      "nsm-10",
    ],
    sections: [
      {
        title: "Why industry timelines accelerated",
        body: [
          "In early 2026, Google and Cloudflare announced 2029 targets for full post-quantum security — including authentication, not just hybrid key exchange. The shift reflects new research suggesting ECC-256 may fall before RSA-2048 on accelerated hardware timelines.",
          "Most experts still doubt a CRQC arrives by 2029. Treat the acceleration as a planning signal: migration is multi-year work across TLS, code signing, VPNs, and vendor dependencies. Waiting for certainty means starting too late.",
        ],
      },
      {
        title: "Framework deadline matrix",
        body: [
          "FIPS 203/204/205 (ML-KEM, ML-DSA, SLH-DSA) are available now — migration can start immediately. PCI-DSS 4.0 emphasizes crypto agility for payment environments. CMMC 2.0 drives defense contractors toward inventory evidence by 2026–2030.",
          "NIST IR 8547 sets 2030 transition guidance. CNSA 2.0 tiers national security systems through 2030–2033. NSM-10 mandates federal migration away from quantum-vulnerable algorithms by 2035. HIPAA and EU CRA add sector-specific pressure.",
        ],
      },
      {
        title: "ECC may break before RSA",
        body: [
          "For years, RSA-2048 was the headline benchmark for Q-Day planning. Recent research from Google, Oratomic, and Alice & Bob suggests ECC-256 — widely used in TLS, VPNs, and cryptocurrencies — may be vulnerable on an earlier timeline for offline retrospective attacks.",
          "That changes prioritization: authentication and certificate infrastructure may need attention before bulk RSA migration. Inventory must tag both algorithm families, not assume RSA is always first.",
        ],
      },
      {
        title: "A 90-day action checklist",
        body: [
          "Days 1–30: Run baseline cryptographic inventory on external TLS and critical SaaS dependencies. Export a CycloneDX CBOM and map findings to your active frameworks.",
          "Days 31–60: Prioritize by deadline tier and data shelf-life. Identify owners for top findings. Schedule re-scans aligned to your change cadence.",
          "Days 61–90: Pilot hybrid TLS on non-production paths. Attach re-scan proof to remediation items. Pitch Monitor before the next board cycle — one scan satisfies this quarter's slide; it does not catch drift.",
        ],
      },
    ],
  },
  pqcInventoryIn10Minutes: {
    eyebrow: "Product walkthrough",
    title: "PQC inventory in 10 minutes: what a live scan actually shows",
    intro:
      "Most enterprises cannot answer three basic questions: which systems still depend on RSA or ECDSA, which third-party libraries embed legacy crypto, and which teams own remediation. A live Qtangl scan answers them in one session.",
    coverImage: "/qtangl-technology-solver-grid.svg",
    coverAlt: "PQC scanner dashboard showing TLS endpoints, algorithms, and readiness score.",
    datePublished: "2026-06-03",
    sourceIds: ["nist-pqc-overview", "fips-203", "palo-alto-q-day"],
    sections: [
      {
        title: "Three questions enterprises fail",
        body: [
          "Security teams know post-quantum migration is coming. They struggle to prove what they have. Spreadsheets decay within weeks as new deployments ship, partner APIs change ciphers, and certificate rotations go untracked.",
          "A PQC inventory scan enumerates external TLS endpoints, tags algorithms (RSA, ECDSA, hybrid ML-KEM), and classifies quantum vulnerability — the baseline artifact every migration program needs.",
        ],
      },
      {
        title: "Step 1: Run the scanner",
        body: [
          "Open the Qtangl PQC demo at /demo/pqc or authorize a live domain scan through Assess. The scanner probes TLS handshakes, certificate chains, and cipher suites — mapping each endpoint to algorithm families and key sizes.",
          "Results appear in minutes: endpoint list, severity-ranked findings, framework crosswalks (NSM-10, CNSA 2.0, NIST IR 8547), and a readiness score combining exposure, coverage, and deadline pressure.",
        ],
      },
      {
        title: "Step 2: Export the CBOM",
        body: [
          "Export a CycloneDX Crypto Bill of Materials (CBOM) JSON — machine-readable inventory for ServiceNow, Archer, or custom GRC tools. Sample CBOM files are available for download before you run your own scan.",
          "CBOM beats spreadsheets: it captures JWKS endpoints, STARTTLS configurations, and algorithm tags in a format your CMDB can ingest — not a one-time audit snapshot.",
        ],
      },
      {
        title: "Step 3: Signed evidence and verify",
        body: [
          "Assess tier exports a signed PDF report with an independent verify link at /verify. Auditors check signatures without trusting Qtangl alone — evidence your board can reference, not a attestation claim.",
          "Monitor tier schedules re-scans and diffs each baseline against the prior scan: new findings, resolved items, and readiness score trends. That is how you move from annual panic to operational crypto hygiene.",
        ],
      },
    ],
  },
  qDayReadinessInventory: {
    eyebrow: "Post-quantum readiness",
    title: "Q-Day readiness: inventory before the deadline",
    intro:
      "Boards are asking for RSA/ECDSA exposure counts, not slide decks. The question is no longer whether post-quantum migration matters — it is whether you can prove what you have, what changed, and who owns the fix.",
    coverImage: "/qtangl-pqc-deadlines-cover.svg",
    coverAlt: "Compliance deadline timeline for post-quantum cryptography migration.",
    datePublished: "2026-03-01",
    sourceIds: ["nist-pqc-overview", "nsm-10", "nist-ir-8547", "gqi-q-day-summary"],
    sections: [
      {
        title: "The Mosca clock is already ticking",
        body: [
          "Michele Mosca's inequality — X + Y > Z (data lifetime + migration time exceeds adversary capability) — turns abstract quantum risk into a planning deadline. For long-lived secrets, TLS certificates, and archived ciphertext, harvest-now-decrypt-later (HNDL) means exposure today is liability tomorrow.",
          "Use the Mosca inequality guide and HNDL primer on our Q-Day hub to quantify shelf-life against migration runway — an inventory aid, not a formal attestation.",
        ],
      },
      {
        title: "Inventory is the unblocker",
        body: [
          "Most enterprises cannot answer three basic questions: which systems still depend on RSA or ECDSA, which third-party libraries embed legacy crypto, and which teams own remediation. A one-time spreadsheet exercise decays within weeks as new deployments ship.",
          "Qtangl's Assess tier produces a prioritized backlog with algorithm tags, compliance crosswalks (NSM-10, CNSA 2.0, NIST IR 8547), and signed scan artifacts suitable for audit evidence.",
        ],
      },
      {
        title: "Monitor beats annual panic",
        body: [
          "A single assessment satisfies this quarter's board slide. It does not catch the microservice that shipped last Tuesday with an outdated OpenSSL pin, or the partner API that rolled back a hybrid TLS experiment.",
          "Continuous Monitor diffs each scan against the prior baseline: new findings, resolved items, readiness score trends, and scheduled re-scan windows aligned to your change cadence.",
        ],
      },
      {
        title: "Convert with evidence, not hope",
        body: [
          "Migration planning fails when backlog items lack owners, effort estimates, and dependency ordering. Convert ties remediation items to what-if projections: if you clear the top N findings this quarter, what does your readiness curve look like at the next audit?",
          "Hybrid ML-KEM TLS handshakes — live in our demo — prove the target state is reachable without ripping out every legacy endpoint on day one.",
        ],
      },
      {
        title: "Where to start",
        body: [
          "Run a Q-Day readiness demo against a representative environment. Map your current stage on the maturity model. Estimate status-quo cost vs Monitor with the ROI calculator.",
        ],
      },
    ],
  },
} as const;

export const articles = {
  quantumOptimization: {
    eyebrow: "Quantum-forward planning",
    title: "Why operations teams need a quantum lens on planning",
    intro:
      "Qtangl is not asking operations teams to become physicists. It is using quantum language to describe a real planning truth: many feasible plans can coexist before one plan is chosen.",
    coverImage: "/qtangl-technology-solver-grid.svg",
    coverAlt:
      "Black and white technology illustration showing a hybrid stack with the classical bands dominating a smaller quantum research band.",
    sections: [
      {
        title: "Why operations needs a quantum lens",
        body: [
          "Scheduling, routing, and staffing problems get hard when decisions stop being independent. A crew change can move an inspection; a delivery window can reshape the whole route; a staffing rule can ripple across the entire shift grid.",
          `That is why ${superposition.label.toLowerCase()} is a useful story for planning. Before the system chooses a plan, there are many feasible candidates worth comparing instead of one obvious answer.`,
        ],
      },
      {
        title: `What ${superposition.label.toLowerCase()} means in product language`,
        body: [
          "For Qtangl, superposition is not mystical. It is simply the ranked set of feasible plans that exist before the system collapses to one operational recommendation.",
          `The brand can use ${superposition.label.toLowerCase()} and ${amplitude.label.toLowerCase()} to explain the chart. The interface still shows the business outcome first.`,
        ],
      },
      {
        title: "QAOA is one tool inside a hybrid pipeline",
        body: [
          "QUBO and QAOA matter because they offer one way to express and explore hard planning problems. They do not replace the rest of the stack.",
          "Qtangl still needs classical preprocessing to shape the problem, bounded quantum-assisted search for research candidates, and classical post-processing to return a usable plan.",
        ],
      },
      {
        title: "The honest stack today",
        body: [
          "Today, the backend is classical-dominant. A classical baseline runs on every job. QAOA is only attempted on tiny research-sized scheduling candidates.",
          "If QAOA fails or does not beat the classical result, Qtangl returns the classical plan. That honesty is part of the product story, not a footnote.",
        ],
      },
    ],
  },
  routing: {
    eyebrow: "Routing observables",
    title: "Routing breaks when real-world constraints are treated like noise",
    intro:
      "The fastest route on paper often fails in production because delivery windows, capacity, service times, and changing conditions shape what is actually feasible.",
    coverImage: "/qtangl-usecase-routing.svg",
    coverAlt:
      "Black and white routing illustration showing route paths with amplitude concentrated on one viable delivery sequence.",
    sections: [
      {
        title: "The shortest path is rarely the best plan",
        body: [
          "Logistics teams do not optimize for distance alone. They balance customer commitments, vehicle capacity, driver availability, and changing route conditions that can invalidate a naive plan almost immediately.",
        ],
      },
      {
        title: `When constraints ${interference.label.toLowerCase()}`,
        body: [
          "Once time windows, stop order rules, and handoff requirements appear, the search space grows quickly. That is why routing remains an optimization problem instead of a simple mapping problem.",
          "The product needs to keep those observables in view rather than hiding them behind a black-box score.",
        ],
      },
      {
        title: `How Qtangl ${collapse.label.toLowerCase()}s to an executable route`,
        body: [
          "Qtangl submits the route problem, evaluates feasible plans through the solver workflow, and returns the best operational route package for the team to execute.",
          "The chart can feel quantum-forward. The returned route still needs to be readable by dispatch in seconds.",
        ],
      },
    ],
  },
  scheduling: {
    eyebrow: "Scheduling interference",
    title: "Scheduling is still an interference problem hiding in plain sight",
    intro:
      "Scheduling stays difficult because the real world does not respect clean textbook assumptions. Dependencies, labor limits, inspections, and changing priorities all interact at once.",
    coverImage: "/qtangl-usecase-scheduling.svg",
    coverAlt:
      "Black and white scheduling illustration showing crews and entangled dependency chains across a constrained timeline.",
    sections: [
      {
        title: "Schedules are entangled dependency graphs",
        body: [
          "Trade sequencing, inspection windows, crew availability, and equipment access all create constraints that can push a project off course. When a single dependency slips, managers often rebuild the plan manually.",
        ],
      },
      {
        title: `Why scheduling ${interference.label.toLowerCase()} matters`,
        body: [
          "Skill fit, overtime rules, availability, and service-level targets mean staffing decisions are connected. A viable solution has to account for all of them at once instead of optimizing one metric in isolation.",
        ],
      },
      {
        title: "Why an API-first solver matters",
        body: [
          "Qtangl packages these planning decisions as an optimization workflow that existing systems can call. That turns scheduling from a manual exercise into a repeatable service that can be rerun as conditions change.",
          "The brand story can talk about entanglement and collapse, while the API still returns a plan the field team can act on.",
        ],
      },
    ],
  },
} as const;
