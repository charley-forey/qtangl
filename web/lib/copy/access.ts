import { siteMetadata } from "@/lib/copy/product";

const contactEmail = siteMetadata.contactEmail;

export const accessPanel = {
  eyebrow: "Pilot access",
  title: "Request pilot access",
  description:
    "Tell us which scheduling, routing, or staffing workflow you want to improve. We prioritize pilots with a clear constraint and a path to production.",
  docsLink: { label: "Read docs first", href: "/docs" },
} as const;

export const accessPageCopy = {
  metadataDescription:
    "Request pilot access for scheduling, routing, or staffing with Qtangl's quantum-aware planning API.",
  audienceEyebrow: "Good fit for",
  audienceItems: [
    "Ops teams improving scheduling, routing, or staffing under real constraints.",
    "Platform teams embedding optimization into internal or customer tools.",
    "Partners running an API evaluation or design-partner pilot.",
  ],
  timelineEyebrow: "What happens next",
  timeline: [
    {
      step: "1",
      title: "Acknowledgement",
      description: "We reply within 2 business days with next steps.",
    },
    {
      step: "2",
      title: "Scoping",
      description: "A short call to map your workflow, systems, and success metric.",
    },
    {
      step: "3",
      title: "Pilot slot",
      description: "Qualified teams receive sandbox access and a pilot plan.",
    },
  ],
  trustNote:
    "Classical-first planning with quantum-aware methods — operationally honest outputs your team can run.",
} as const;

export const accessFormCopy = {
  eyebrow: "Get started",
  title: "Request access",
  description: "Work email and workflow are enough to start. Add context if you want us to prioritize faster.",
  optionalSectionLabel: "Add context — helps us prioritize",
  optionalSectionHint: "Name, company, tools, and constraints (optional)",
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
  privacyNote: "We use this only to evaluate pilot fit. No mailing lists.",
  mailtoPrefix: "Prefer email?",
  urgentNote: "Urgent timeline?",
} as const;

export const accessFormMessages = {
  initial: "Priority access for teams evaluating a real scheduling, routing, or staffing workflow.",
  missingFields: "Enter your work email and select a planning workflow.",
  invalidEmail: "Enter a valid work email so we can follow up.",
  deliveryFailed: `Couldn't submit yet. Try again or email ${contactEmail}.`,
  success:
    "Request received. We'll follow up within 2 business days at the email you provided.",
  capturedForReview: `Request captured for review. Urgent timeline? Email ${contactEmail} directly.`,
  honeypotSuccess:
    "Request received. We'll follow up within 2 business days at the email you provided.",
} as const;

export const accessSuccessCopy = {
  eyebrow: "Request received",
  title: "You're on the list",
  subtitle:
    "We'll follow up within 2 business days. Check your inbox for a confirmation email.",
  exploreEyebrow: "While you wait",
  urgentPrefix: "Need a faster response?",
  defaultNextSteps: [
    { label: "Hospital re-staffing demo", href: "/demo/hospital" },
    { label: "Airline crew recovery demo", href: "/demo/airline" },
    { label: "Read the docs", href: "/docs" },
    { label: "Try the sandbox", href: "/sandbox" },
  ],
  nextStepsByInterest: {
    "Scheduling optimization": [
      { label: "Hospital re-staffing demo", href: "/demo/hospital" },
      { label: "Scheduling guide", href: "/docs/guides/schedule" },
      { label: "Try the sandbox", href: "/sandbox" },
    ],
    "Routing optimization": [
      { label: "Routing guide", href: "/docs/guides/routing" },
      { label: "Read the docs", href: "/docs" },
      { label: "Try the sandbox", href: "/sandbox" },
    ],
    "Resource allocation": [
      { label: "Allocation guide", href: "/docs/guides/allocation" },
      { label: "Hospital re-staffing demo", href: "/demo/hospital" },
      { label: "Try the sandbox", href: "/sandbox" },
    ],
    "Developer platform": [
      { label: "API reference", href: "/docs/api" },
      { label: "Read the docs", href: "/docs" },
      { label: "Try the sandbox", href: "/sandbox" },
    ],
    "Research collaboration": [
      { label: "Technology overview", href: "/technology" },
      { label: "Learn hub", href: "/learn" },
      { label: "Read the docs", href: "/docs" },
    ],
  } as Record<string, { label: string; href: string }[]>,
} as const;

export const accessCtas = {
  primary: { label: "Request access", href: "/access" },
  secondary: { label: "Read docs", href: "/docs" },
} as const;

export function getAccessNextSteps(interest: string) {
  return (
    accessSuccessCopy.nextStepsByInterest[interest] ?? accessSuccessCopy.defaultNextSteps
  );
}

export function accessMailtoHref(subject = "Qtangl pilot access request") {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;
}
