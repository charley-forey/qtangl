import { quantumLexicon } from "@/lib/copy/voice";

const { amplitude, collapse } = quantumLexicon;

export const tryPageCopy = {
  eyebrow: `${collapse.label} a plan`,
  title: "See the workflow before you commit to the API.",
  description:
    "Pick a familiar scenario, review the ranked output, then open the API example when you're ready to integrate.",
  steps: [
    {
      eyebrow: "Step 1",
      description: "Use the crews, windows, vehicles, or shifts you already track.",
    },
    {
      eyebrow: "Step 2",
      description: "Review the ranked plan, summary, and the measurement behind the win.",
    },
    {
      eyebrow: "Step 3",
      description: "Copy the API shape into your own system.",
    },
  ],
} as const;

export const tryPlannerCopy = {
  eyebrow: amplitude.label,
  title: "Pick a planning scenario.",
  description:
    "Edit constraints, generate a plan, and watch amplitude concentrate on the strongest option.",
  tabLabel: "Planning scenarios",
  buttons: {
    generate: "Generate Plan",
    generating: "Generating...",
    showApi: "See API request",
    hideApi: "Hide API example",
  },
  preview: {
    idleEyebrow: "Plan preview",
    generatingEyebrow: "Generating",
    idleTitle: "Generate a preview plan",
    generatingTitle: "Building your preview...",
    idleDescription:
      "Adjust inputs on the left, then Generate Plan.",
    generatingDescription: "Running a short planning pass for the preview.",
  },
  status: {
    generating: "Generating preview plan.",
    hidden: "Plan preview hidden until you generate.",
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
