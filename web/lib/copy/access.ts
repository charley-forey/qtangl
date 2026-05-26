export const accessPanel = {
  eyebrow: "Access",
  title: "Tell us which planning workflow needs to improve next.",
  description:
    "Share the schedule, route, or staffing workflow that is slowing your team down. Qtangl is focused on pilot teams with a clear planning bottleneck and a realistic path to deployment.",
  formHint:
    "Best fit for operations leaders, product teams, and technical partners preparing a pilot or API evaluation.",
} as const;

export const accessPageCopy = {
  metadataDescription:
    "Request pilot access to improve scheduling, routing, or staffing decisions with Qtangl.",
  audienceEyebrow: "Who this is for",
  audienceItems: [
    "Operations teams dealing with scheduling, routing, or staffing bottlenecks.",
    "Platform teams embedding optimization into internal or customer-facing tools.",
    "Technical partners preparing for an API evaluation or pilot deployment.",
  ],
  includeEyebrow: "What to include",
  includeDescription:
    "Share the workflow you want to improve, the constraints that matter most, and the tools your team already relies on today.",
} as const;

export const accessFormCopy = {
  eyebrow: "Pilot access",
  title: "Request pilot access",
  description:
    "Tell us what you need to plan better and which systems are already in the loop.",
  helpfulNotes: [
    "Strong requests explain the planning problem, the systems involved, and the operational constraints that matter most.",
    "We currently prioritize design partners, API evaluation teams, and operations-heavy organizations preparing for a pilot.",
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
        "Describe the workflow, the constraints that matter, and what a better result would look like.",
    },
  },
  submitLabel: "Request access",
  pendingLabel: "Sending request...",
} as const;

export const accessFormMessages = {
  initial:
    "Priority access is open for teams evaluating a real scheduling, routing, or staffing workflow.",
  missingFields:
    "Please add your name, work email, company, and workflow focus so we can review the request.",
  invalidEmail:
    "Enter a valid work email so we know where to follow up.",
  deliveryFailed:
    "We couldn't submit your request just yet. Please try again in a moment or email founders@qtangl.com.",
  success:
    "Thanks. We received your request and will follow up when the next pilot review window opens.",
  capturedForReview:
    "Thanks. Your request was captured for review. If your pilot timeline is immediate, email founders@qtangl.com so we can follow up directly.",
} as const;

export const accessCtas = {
  primary: { label: "Request access", href: "/access" },
  secondary: { label: "Read docs", href: "/docs" },
} as const;
