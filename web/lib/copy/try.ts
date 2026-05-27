import { quantumLexicon } from "@/lib/copy/voice";

const { amplitude } = quantumLexicon;

export const sandboxPageCopy = {
  eyebrow: "API sandbox",
  title: "Test /optimize in the browser.",
  description:
    "Send a real /optimize request and get back the same ranked JSON your app will receive.",
  intro:
    "Sandbox the API: send a real /optimize request, see a real ranked plan. Falls back to a static response if the pilot endpoint is offline.",
  fallbackCallout:
    "If the live pilot endpoint is offline, you will still see a representative sandbox response so you can explore the response shape.",
  liveLabel: "Live response",
  fallbackLabel: "Live API unavailable — showing sandbox response",
  previewLabel: "Sample response — press Send to /optimize to call the live API",
  docsLink: { label: "Read API docs", href: "/docs/api" },
  heroActions: {
    quickstart: { label: "Quickstart", href: "/docs/quickstart" },
    api: { label: "API reference", href: "/docs/api" },
  },
  methodExplainer: "Hybrid = classical solve with quantum-aware ranking.",
} as const;

export const sandboxHowItWorksCopy = {
  steps: [
    {
      title: "Pick a planning shape",
      description:
        "Choose construction schedule, delivery routing, or shift staffing — each maps to a real /optimize request body.",
    },
    {
      title: "Send to the live pilot",
      description:
        "Press Send to call POST /optimize on the pilot endpoint. If it is offline, you still see a representative fallback response.",
    },
    {
      title: "Copy and integrate",
      description:
        "Review the ranked plan, metrics, and JSON. Copy the response or cURL, then wire the same call into your app.",
    },
  ],
} as const;

export const sandboxIntegrationCopy = {
  eyebrow: "Go deeper",
  title: "Wire it into your stack",
  links: [
    {
      label: "Quickstart",
      description: "First authenticated call with curl and response expectations.",
      href: "/docs/quickstart",
      cta: "Start integrating",
    },
    {
      label: "API reference",
      description: "Endpoints, auth headers, and response fields for /optimize.",
      href: "/docs/api",
      cta: "Read API docs",
    },
    {
      label: "Data formats",
      description: "How to structure schedule, routing, and staffing inputs.",
      href: "/docs/data-formats",
      cta: "View formats",
    },
    {
      label: "Access",
      description: "Request a pilot API key for your own environment.",
      href: "/access",
      cta: "Get API key",
    },
  ],
} as const;

export const sandboxStatusCopy = {
  endpoint: "POST /optimize",
  accessLink: { label: "Get your API key", href: "/access" },
  statuses: {
    preview: "Preview",
    live: "Live",
    fallback: "Fallback",
  },
} as const;

export const tryPlannerCopy = {
  eyebrow: amplitude.label,
  title: "Pick a planning shape.",
  description:
    "Choose a scenario, review the request shape, then call the live pilot endpoint.",
  tabLabel: "Planning scenarios",
  fieldsNote:
    "Example constraints (illustrative). The live request uses the scenario template below.",
  buttons: {
    generate: "Send to /optimize",
    generating: "Calling /optimize…",
    showApi: "Hide API request",
    hideApi: "Show API request",
    copyCurl: "Copy as cURL",
    copiedCurl: "cURL copied",
  },
  requestBlockTitle: "Request that will be sent",
  requestPanelTitle: "API request",
  keyboardHint: "Tip: press Ctrl+Enter or ⌘+Enter to send.",
  requestPanelHint: "This is the JSON body sent on Send. Field edits above are illustrative for now.",
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
