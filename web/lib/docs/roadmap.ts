import type { DocsFeatureStatus } from "@/lib/docs/types";

export type RoadmapItem = {
  title: string;
  description: string;
  status: DocsFeatureStatus;
};

export type RoadmapBand = {
  id: "now" | "next" | "later";
  label: string;
  items: RoadmapItem[];
};

export const roadmapBands: RoadmapBand[] = [
  {
    id: "now",
    label: "Now",
    items: [
      {
        title: "Q-Day readiness scanner",
        description: "Pilot /pqc/* cryptographic inventory, Mosca risk, CBOM exports, PQ handshake proof.",
        status: "pilot",
      },
      {
        title: "Schedule optimization (GA)",
        description: "CP-SAT baseline on every job; hybrid QAOA on bounded research candidates.",
        status: "ga",
      },
      {
        title: "Hospital re-staffing demo",
        description: "Pilot /hospital/* endpoints with scoreboard and audit packs.",
        status: "pilot",
      },
      {
        title: "Developer docs platform",
        description: "Search, schemas, per-endpoint reference, and operations guides.",
        status: "ga",
      },
    ],
  },
  {
    id: "next",
    label: "Next",
    items: [
      {
        title: "Routing solver",
        description: "Live POST /optimize for type routing with window-aware heuristics.",
        status: "coming-soon",
      },
      {
        title: "Allocation solver",
        description: "Staffing and shift coverage with skill and fatigue constraints.",
        status: "coming-soon",
      },
      {
        title: "Official SDKs",
        description: "TypeScript and Python client libraries with typed request/response models.",
        status: "coming-soon",
      },
      {
        title: "Local repair extraction",
        description: "QAOA on true micro-windows instead of whole-job smoke candidates.",
        status: "research",
      },
    ],
  },
  {
    id: "later",
    label: "Later",
    items: [
      {
        title: "Postman collection & OpenAPI",
        description: "Importable collection generated from the canonical contract.",
        status: "coming-soon",
      },
      {
        title: "Request tracing",
        description: "X-Request-Id headers and structured logs for enterprise observability.",
        status: "coming-soon",
      },
      {
        title: "SOC 2 readiness",
        description: "Security questionnaire pack and retention controls for production tenants.",
        status: "coming-soon",
      },
    ],
  },
];
