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
    "Qtangl keeps the model simple for developers while preserving the constraint-heavy nature of operational planning with an honest quantum-forward vocabulary.",
  sections: [
    {
      eyebrow: superposition.label,
      title: "Optimization problems",
      description:
        "Qtangl focuses on three families of problems: scheduling, routing, and allocation. Each job combines entities, constraints, and objectives to produce a plan that can be executed in the real world.",
    },
    {
      eyebrow: amplitude.label,
      title: "QUBO, lightly explained",
      description:
        "Many optimization workflows can be reformulated as a quadratic unconstrained binary optimization model. In practice, that means Qtangl can express hard planning decisions in a form that solver backends can evaluate systematically.",
    },
    {
      eyebrow: phase.label,
      title: "Hybrid execution",
      description:
        "The platform uses classical preprocessing, bounded quantum-assisted search, and classical post-processing as one workflow. That hybrid approach matters more than any single backend because it keeps the system practical for enterprise optimization use cases.",
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
      "This quickstart shows the smallest useful scheduling request: send the work, the constraints, and then inspect the returned summary, plan, and measurements.",
    submit: {
      eyebrow: phase.label,
      title: "1. Submit a job",
      description:
        "Start with a small scheduling payload. Include a problem type, the tasks that must happen, and the rules that cannot break in the final plan.",
      notes: [
        "Base URL",
        "Pilot key",
        "Request access to receive a real key for the live endpoint.",
      ],
    },
    inspect: {
      eyebrow: measurement.label,
      title: "2. Inspect the response",
      description:
        "Qtangl returns a short summary first, then the structured solution, then the measurements and solver details developers may need for deeper inspection.",
    },
  },
  api: {
    title: "API guide",
    description:
      "The MVP centers on one endpoint: `/optimize`. Developers submit a planning problem, Qtangl evaluates feasible options, and the service returns a summary, measurements, and structured result.",
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
        "The backend is classical-dominant today. A classical baseline runs on every job. `method: hybrid` means the workflow includes a bounded quantum research step. If QAOA fails or does not beat the classical result, Qtangl returns the classical plan.",
    },
    errors: {
      title: "Error handling",
    },
  },
  dataFormats: {
    title: "Data formats",
    description:
      "Start with the fields your team already knows. These guides show what to send for schedules, routes, and staffing jobs before you touch the live API.",
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
