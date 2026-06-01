import { siteMetadata } from "@/lib/copy/product";

const contactEmail = siteMetadata.contactEmail;

export const accessPanel = {
  eyebrow: "Pilot access",
  title: "Request pilot access",
  description:
    "Tell us which Q-Day readiness tier fits — assessment, Monitor, Convert, or enterprise program.",
  docsLink: { label: "Read the PQC demo guide", href: "/docs/guides/pqc-demo" },
} as const;

export const accessPageCopy = {
  metadataDescription:
    "Request pilot access for Q-Day assessment, Monitor, Convert, or enterprise post-quantum readiness programs.",
  audienceEyebrow: "Good fit for",
  audienceItems: [
    "CISO and GRC teams with a board mandate for PQC by 2027/2030.",
    "Engineering leads inventorying TLS, code signing, and HSM crypto.",
    "MSSPs and audit partners evaluating white-label Monitor programs.",
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
      description: "A short call to map domains, compliance drivers, and success metrics.",
    },
    {
      step: "3",
      title: "Pilot slot",
      description: "Qualified teams receive demo credentials and a pilot plan.",
    },
  ],
  trustNote:
    "Signed evidence on every assessment — CBOM exports and verify links your auditors can check independently.",
} as const;

export const accessFormCopy = {
  eyebrow: "Get started",
  title: "Request access",
  description: "Work email and interest area are enough to start. Add context if you want us to prioritize faster.",
  optionalSectionLabel: "Add context — helps us prioritize",
  optionalSectionHint: "Name, company, domains, and compliance drivers (optional)",
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
      label: "Interest area",
      placeholder: "Select an area",
      options: [
        "Q-Day Assessment (one-time)",
        "Q-Day Monitor (annual)",
        "Enterprise PQC program",
        "MSSP / partner inquiry",
        "Optimization pilot",
      ],
    },
    currentTools: {
      label: "Current tools",
      placeholder: "Qualys, Venafi, ServiceNow, spreadsheets...",
    },
    message: {
      label: "Readiness context",
      placeholder:
        "Domains to scan, compliance drivers (CMMC, NSM-10, HIPAA), and your target timeline.",
    },
  },
  submitLabel: "Request access",
  pendingLabel: "Sending request...",
  privacyNote: "We use this only to evaluate pilot fit. No mailing lists.",
  mailtoPrefix: "Prefer email?",
  urgentNote: "Urgent timeline?",
} as const;

export const accessFormMessages = {
  initial: "Priority access for teams evaluating a real Q-Day readiness program.",
  missingFields: "Enter your work email and select an interest area.",
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
    { label: "Run Q-Day scanner", href: "/demo/pqc" },
    { label: "Free mini-assessment", href: "/assess/mini" },
    { label: "Download sample CBOM", href: "/samples/sample-cbom-bank-tls-inventory.json" },
    { label: "Verify a report", href: "/verify" },
  ],
  nextStepsByInterest: {
    "Q-Day Assessment (one-time)": [
      { label: "Run Q-Day scanner", href: "/demo/pqc" },
      { label: "Free mini-assessment", href: "/assess/mini" },
      { label: "Download sample CBOM", href: "/samples/sample-cbom-bank-tls-inventory.json" },
      { label: "See Assess tier", href: "/assess" },
    ],
    "Q-Day Monitor (annual)": [
      { label: "Open dashboard", href: "/dashboard" },
      { label: "See Monitor tier", href: "/monitor" },
      { label: "See pricing", href: "/pricing" },
    ],
    "Enterprise PQC program": [
      { label: "See Convert tier", href: "/convert" },
      { label: "Trust center", href: "/trust" },
      { label: "See pricing", href: "/pricing" },
    ],
    "MSSP / partner inquiry": [
      { label: "Platform overview", href: "/platform" },
      { label: "Trust center", href: "/trust" },
      { label: "Read the docs", href: "/docs" },
    ],
    "Optimization pilot": [
      { label: "Hospital re-staffing demo", href: "/demo/hospital" },
      { label: "Technology overview", href: "/technology" },
      { label: "Try the sandbox", href: "/sandbox" },
    ],
  } as Record<string, { label: string; href: string }[]>,
} as const;

export const accessCtas = {
  primary: { label: "Run Q-Day scan", href: "/demo/pqc" },
  secondary: { label: "Read docs", href: "/docs/guides/pqc-demo" },
} as const;

export function getAccessNextSteps(interest: string) {
  return (
    accessSuccessCopy.nextStepsByInterest[interest] ?? accessSuccessCopy.defaultNextSteps
  );
}

export function accessMailtoHref(subject = "Qtangl Q-Day readiness pilot request") {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;
}
