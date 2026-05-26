import { quantumLexicon } from "@/lib/copy/voice";

const { amplitude, collapse } = quantumLexicon;

export const tryPageCopy = {
  eyebrow: `${collapse.label} a plan`,
  title: "See the workflow before you commit to the API.",
  description:
    "Start with a familiar planning problem, review the ranked output, and decide whether the next step is a pilot integration. The demo keeps the inputs plain and the charts quantum-forward.",
  steps: [
    {
      eyebrow: "Step 1",
      description:
        "Start with the work, windows, crews, vehicles, or shifts your team already tracks.",
    },
    {
      eyebrow: "Step 2",
      description:
        "Review a ranked plan, a short summary, and the measurement that explains why the result is better than manual ordering.",
    },
    {
      eyebrow: "Step 3",
      description:
        "Expand the API example when you are ready to connect the same workflow to your own system.",
    },
  ],
} as const;

export const tryPlannerCopy = {
  eyebrow: amplitude.label,
  title: "Start with a familiar planning problem.",
  description:
    "This is a guided product demo, not a production connector. Edit the constraints, generate a plan, and see how amplitude concentrates on the strongest operational option.",
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
      "Adjust the scenario inputs on the left, then select Generate Plan to reveal the ranked output.",
    generatingDescription:
      "Qtangl is simulating a short planning pass so the preview feels intentional.",
  },
  status: {
    generating: "Generating preview plan.",
    hidden: "Plan preview hidden until you generate.",
  },
  scenarios: {
    schedule: {
      title: "Schedule under interference.",
      description:
        "A project manager needs to resequence work after a crew delay and still fit an inspection window.",
    },
    routing: {
      title: "Route through tight windows.",
      description:
        "A dispatcher needs a simple route plan after a driver change and tight customer windows.",
    },
    allocation: {
      title: "Staff a coherent shift grid.",
      description:
        "A workforce scheduler needs to cover a shift grid with the right skills and fewer overtime hours.",
    },
  },
} as const;
