export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const faqCategories: FaqCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    items: [
      {
        id: "what-is-qtangl",
        question: "What is Qtangl?",
        answer:
          "Qtangl is a planning API for scheduling, routing, and staffing. You send constraints and resources; it returns a feasible plan, plain-English summary, and measurements your team can run.",
      },
      {
        id: "first-request",
        question: "How do I send my first request?",
        answer:
          "Follow the Quickstart: obtain a pilot API key, POST to /optimize with type schedule and a small task list, then read summary and metrics in the response.",
      },
    ],
  },
  {
    id: "pqc",
    title: "Q-Day / PQC scanner",
    items: [
      {
        id: "pqc-live-scan",
        question: "Does live scanning attack my infrastructure?",
        answer:
          "Live mode only connects to hosts you authorize, blocks private/metadata IPs, and is gated by QTANGL_PQC_ENABLE_LIVE_SCAN. Use fixture mode for recordings.",
      },
      {
        id: "pqc-cbom",
        question: "What is a CBOM export?",
        answer:
          "A CycloneDX Cryptography Bill of Materials JSON file listing discovered algorithms and remediation metadata for procurement and compliance workflows.",
      },
    ],
  },
  {
    id: "auth",
    title: "Auth & keys",
    items: [
      {
        id: "auth-headers",
        question: "Which auth headers are supported?",
        answer:
          "Send Authorization: Bearer <key> or x-api-key: <key>. Missing or invalid keys return 401.",
      },
      {
        id: "production-keys",
        question: "How do I get a production key?",
        answer:
          "Request access at /access. Pilot keys are suitable for sandbox and integration testing only.",
      },
    ],
  },
  {
    id: "method-honesty",
    title: "Method honesty",
    items: [
      {
        id: "hybrid-vs-classical",
        question: 'When does method return "hybrid"?',
        answer:
          "Only when a bounded QAOA candidate beats or matches the classical baseline on objective. Otherwise you receive method: classical even if QAOA was attempted.",
      },
      {
        id: "routing-live",
        question: "Can I use routing or allocation today?",
        answer:
          "Payload shapes are documented and accepted at the edge, but the live solver returns 501 for routing and allocation until those pipelines ship. See the Roadmap.",
      },
    ],
  },
  {
    id: "limits",
    title: "Limits & reliability",
    items: [
      {
        id: "rate-limit",
        question: "What is the default rate limit?",
        answer:
          "300 requests per minute per API key unless QTANGL_RATE_LIMIT_PER_MINUTE overrides it on the server.",
      },
      {
        id: "infeasible",
        question: "What happens when no plan is feasible?",
        answer:
          "The API returns 422 with a detail message explaining which constraints could not be satisfied. Adjust inputs and retry.",
      },
    ],
  },
];
