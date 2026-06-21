import { readinessLexicon } from "@/lib/copy/readiness";
import { quantumLexicon } from "@/lib/copy/voice";

const {
  measurement,
  phase,
} = quantumLexicon;

export const conceptsPage = {
  title: "Core concepts",
  description:
    "Post-quantum readiness vocabulary — Assess, Monitor, Convert, and the signed evidence layer your auditors can verify.",
  lastUpdated: "2026-06-10",
  journey: {
    title: "Assess → Monitor → Convert",
    description:
      "Qtangl's primary product is cryptographic posture management: baseline inventory (Assess), scheduled re-scans with drift alerts (Monitor), and remediation playbooks with re-verification (Convert).",
  },
  tiers: [
    {
      label: "Assess",
      summary: "Baseline scan, Mosca HNDL scoring, CycloneDX CBOM, signed PDF evidence.",
    },
    {
      label: "Monitor",
      summary: "Scheduled re-scans, diff alerts, SIEM webhooks, remediation board.",
    },
    {
      label: "Convert",
      summary: "Prioritized playbooks, workshops, automate remediation, re-scan verification.",
    },
  ],
  sections: [
    {
      eyebrow: readinessLexicon.hndl.label,
      title: "HNDL and the Mosca timeline",
      description:
        "Harvest now, decrypt later (HNDL) means adversaries store ciphertext today to break with future quantum computers. Mosca's inequality — data shelf-life plus migration time must exceed time-to-Q-Day — is why inventory starts before algorithms break.",
    },
    {
      eyebrow: "CBOM",
      title: "Cryptographic inventory & CBOM",
      description:
        "A Cryptography Bill of Materials lists algorithms, keys, and protocols in production. Qtangl exports CycloneDX CBOM from live TLS scans so procurement, GRC, and engineering share one artifact — not a one-time spreadsheet.",
    },
    {
      eyebrow: readinessLexicon.evidence.label,
      title: "Signed evidence & verify",
      description:
        "Every assessment produces a content hash, ML-DSA-65 signature, and public verify link. Auditors recompute the hash offline — no dashboard login required. Optional transparency log inclusion adds append-only witness co-signing.",
    },
    {
      eyebrow: readinessLexicon.drift.label,
      title: "Drift & readiness index",
      description:
        "One scan is a snapshot; Monitor compares successive scans and surfaces new RSA, ECC, or weak TLS configurations. The readiness index aggregates exposure, drift velocity, and remediation progress for board and regulator reporting.",
    },
  ],
  methodHonesty:
    "Inventory aid, not formal audit. Quantum-vulnerable algorithms are not broken today — Qtangl quantifies exposure, maps standards (NSM-10, CNSA 2.0, NIST IR 8547), and exports signed evidence. We do not claim certification on your behalf.",
  glossaryTitle: "Readiness terms in product language",
  glossary: [
    readinessLexicon.exposure,
    readinessLexicon.drift,
    readinessLexicon.evidence,
    readinessLexicon.convert,
    readinessLexicon.agility,
    readinessLexicon.hndl,
    {
      label: "CBOM",
      meaning: "Cryptography Bill of Materials — CycloneDX export of algorithms and keys in scope",
    },
    {
      label: "Verify",
      meaning: "Independent signature and content-hash check at /verify or via qtangl-verify CLI",
    },
  ],
} as const;

export const docsGuideCopy = {
  quickstart: {
    title: "Quickstart",
    description:
      "Smallest useful scheduling request: work, constraints, then summary, plan, and measurements.",
    submit: {
      eyebrow: phase.label,
      title: "1. Submit a job",
      description:
        "Small scheduling payload: problem type, tasks, and rules that cannot break.",
      notes: [
        "Base URL",
        "Pilot key",
        "Request access to receive a real key for the live endpoint.",
      ],
    },
    inspect: {
      eyebrow: measurement.label,
      title: "2. Inspect the response",
      description: "Summary first, then solution, measurements, and solver details.",
    },
  },
  api: {
    title: "API guide",
    description:
      "One endpoint: `/optimize`. Problem in, ranked plan and measurements out.",
    conciseEndpoint: {
      title: "Need the concise endpoint view?",
      description:
        "The guide explains how to integrate. The standalone reference keeps the request, response, and error details together on one page.",
      cta: "Open API reference",
    },
    whatYouGetBack: {
      title: "What you get back",
      items: [
        "`summary` is the first thing humans should read. It explains what the plan accomplished in plain language.",
        "`metrics` highlight value: duration, violations, savings, or other numbers the team already tracks.",
        "`details` hold solver metadata for developers and evaluators without forcing every user to understand the optimization stack.",
      ],
    },
    pilotEndpoint: {
      title: "Pilot endpoint",
      description:
        "Point your pilot client to the configured base URL. Set `NEXT_PUBLIC_QTANGL_API_BASE_URL` when the staging backend is deployed.",
    },
    auth: {
      title: "Authentication",
      description:
        "The MVP assumes API-key based authentication. Requests include a bearer token or API key header managed by the client application.",
    },
    rateLimits: {
      title: "Rate limits",
      description:
        "MVP rate limiting is capped at 10 requests per minute per API key. This is enough for testing and pilot workflows without overcomplicating usage.",
    },
    methodHonesty: {
      title: "Method honesty",
      description:
        "Classical baseline every job. `method: hybrid` = bounded quantum research step. QAOA loses → classical plan.",
    },
    errors: {
      title: "Error handling",
    },
  },
  dataFormats: {
    title: "Data formats",
    description:
      "PQC scan payloads, CycloneDX CBOM exports, ingest shapes, and webhook fields — before you integrate Assess, Monitor, and Convert.",
    csvTitle: "Report CSV columns",
  },
} as const;

export const apiReferencePageCopy = {
  eyebrow: "API reference",
  title: "`POST /optimize`",
  description:
    "Submit a schedule, route, or staffing problem and receive a readable summary, measurements, method details, and structured plan output.",
  executionFlow: {
    title: "Execution flow",
    steps: [
      "Validate the problem type, payload shape, and hard constraints.",
      "Evaluate feasible plans with the available solver workflow.",
      "Return the ranked result with a summary and measurements first.",
    ],
  },
  errorCases: {
    title: "Error cases",
    note: "MVP rate limit: 10 requests per minute per API key.",
  },
  methodHonesty: {
    title: "Method honesty",
    description:
      "The backend runs a classical baseline on every job. Hybrid execution is a research path for bounded candidates, and classical fallback remains the default when it performs better.",
  },
} as const;
