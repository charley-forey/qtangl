import { quantumLexicon } from "@/lib/copy/voice";

const { entanglement, interference, measurement } = quantumLexicon;

export const accessPanel = {
  eyebrow: "Entangle with us",
  title: "Which planning workflow should improve next?",
  description:
    "Tell us the schedule, route, or staffing bottleneck. We prioritize pilots with a clear constraint and a path to production.",
  formHint: "Ops leaders, product teams, and partners evaluating the API.",
} as const;

export const accessPageCopy = {
  metadataDescription:
    "Request pilot access for scheduling, routing, or staffing with Qtangl's quantum-aware planning API.",
  audienceEyebrow: entanglement.label,
  audienceItems: [
    "Ops teams with entangled scheduling, routing, or staffing decisions.",
    "Platform teams embedding optimization into internal or customer tools.",
    "Partners running an API evaluation or pilot.",
  ],
  includeEyebrow: interference.label,
  includeDescription:
    "Workflow, top constraints, and tools in the loop today.",
} as const;

export const accessFormCopy = {
  eyebrow: measurement.label,
  title: "Request pilot access",
  description:
    "What you need to plan better, which systems are involved, and which metric proves it's working.",
  helpfulNotes: [
    "Strong requests name the problem, systems, and hard constraints.",
    "We prioritize design partners, API evaluations, and ops-heavy pilots.",
  ],
  fields: {
    name: {
      label: "Name",
      placeholder: "Ada Lovelace",
    },
    email: {
      label: "Work email",
      placeholder: "ada@company.com",
    },
    company: {
      label: "Company",
      placeholder: "Example Systems",
    },
    interest: {
      label: "Planning workflow",
      placeholder: "Select a workflow",
      options: [
        "Scheduling optimization",
        "Routing optimization",
        "Resource allocation",
        "Developer platform",
        "Research collaboration",
      ],
    },
    currentTools: {
      label: "Current tools",
      placeholder: "Procore, spreadsheets, Samsara, Smartsheet...",
    },
    message: {
      label: "Planning context",
      placeholder:
        "Workflow, constraints that matter, and what a better result looks like.",
    },
  },
  submitLabel: "Request access",
  pendingLabel: "Sending request...",
} as const;

export const accessFormMessages = {
  initial:
    "Priority access for teams evaluating a real scheduling, routing, or staffing workflow.",
  missingFields:
    "Add your name, work email, company, and workflow focus.",
  invalidEmail: "Enter a valid work email so we can follow up.",
  deliveryFailed:
    "Couldn't submit yet. Try again or email founders@qtangl.com.",
  success:
    "Request received. We'll follow up at the next pilot review window.",
  capturedForReview:
    "Request captured. Urgent timeline? Email founders@qtangl.com directly.",
} as const;

export const accessCtas = {
  primary: { label: "Request access", href: "/access" },
  secondary: { label: "Read docs", href: "/docs" },
} as const;
