import { quantumLexicon } from "@/lib/copy/voice";

const {
  amplitude,
  measurement,
  phase,
  superposition,
} = quantumLexicon;

export const conceptsPage = {
  title: "Core concepts",
  description:
    "Scheduling, routing, and allocation — with quantum vocabulary on the surface and honest hybrid execution underneath.",
  sections: [
    {
      eyebrow: superposition.label,
      title: "Three problem families",
      description:
        "Scheduling, routing, allocation. Entities, constraints, and objectives in — executable plan out.",
    },
    {
      eyebrow: amplitude.label,
      title: "QUBO, lightly",
      description:
        "Hard planning decisions expressed as QUBO so solver backends can rank candidates systematically.",
    },
    {
      eyebrow: phase.label,
      title: "Hybrid execution",
      description:
        "Classical preprocess → bounded quantum search → classical postprocess. Practical beats theoretical.",
    },
  ],
  glossaryTitle: "Quantum terms in product language",
  glossary: [
    quantumLexicon.superposition,
    quantumLexicon.interference,
    quantumLexicon.coherence,
    quantumLexicon.collapse,
    quantumLexicon.measurement,
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
      "Fields for schedules, routes, and staffing — before you hit the live API.",
    csvTitle: `${measurement.label} template columns`,
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
