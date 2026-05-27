import { quantumLexicon } from "@/lib/copy/voice";

const { amplitude } = quantumLexicon;

export const sandboxPageCopy = {
  eyebrow: "API sandbox",
  title: "Three planning shapes. One request.",
  description:
    "Edit constraints, send a real /optimize call, get back the same JSON your app will see.",
  intro:
    "Sandbox the API: send a real /optimize request, see a real ranked plan. Falls back to a static response if the pilot endpoint is offline.",
  liveLabel: "Live response",
  fallbackLabel: "Live API unavailable — showing sandbox response",
  previewLabel: "Sample response — press Send to /optimize to call the live API",
  docsLink: { label: "Read API docs", href: "/docs/api" },
} as const;

export const tryPlannerCopy = {
  eyebrow: amplitude.label,
  title: "Pick a planning shape.",
  description:
    "Choose a scenario, review the request shape, then call the live pilot endpoint.",
  tabLabel: "Planning scenarios",
  buttons: {
    generate: "Send to /optimize",
    generating: "Calling /optimize…",
    showApi: "See API request",
    hideApi: "Hide API request",
  },
  requestBlockTitle: "Request that will be sent",
  status: {
    generating: "Calling the live API…",
    liveReady: "Live response received.",
    fallbackReady: "Showing sandbox response (live API unavailable).",
  },
  scenarios: {
    schedule: {
      title: "Resequence after a crew delay.",
      description: "Keep the inspection window without manual reshuffle.",
    },
    routing: {
      title: "Re-route through tight windows.",
      description: "Simple stop order after a driver change.",
    },
    allocation: {
      title: "Staff a shift grid.",
      description: "Right skills, coverage held, less overtime.",
    },
  },
} as const;
