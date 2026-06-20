import { OQS_DEMO_HOST } from "@/lib/assess-config";

export const assessIntentCopy = {
  heading: "What do you want to do?",
  subheading: "No account required for samples and the public live demo. Production domains need an authorized workspace.",
  sample: {
    title: "See a sample report",
    detail: "Pre-built bank, government, or healthcare scenario. No domain, no network — full CBOM and signed report in under five minutes.",
    badge: "Recommended",
    quickLabel: "Run bank sample now",
    customizeLabel: "Pick another scenario",
  },
  liveDemo: {
    title: "Try a real live scan",
    detail: `Scan the Open Quantum Safe public test server (${OQS_DEMO_HOST}) — a maintained PQC TLS endpoint, safe for demos.`,
    badge: "Live TLS",
    quickLabel: `Scan ${OQS_DEMO_HOST}`,
    customizeLabel: "Configure live demo",
  },
  myDomain: {
    title: "Scan my organization",
    detail: "Authorize your production or staging domains. Self-serve workspace (5 scans/month) or sales-led pilot.",
    badge: "Authorized",
    quickLabel: "Start authorized workspace",
    quickHref: "/assess/start",
    pilotLabel: "Request a pilot",
    pilotHref: "/access",
  },
  sampleBanner:
    "No domain needed — fixture mode uses fictional targets and runs entirely offline. Perfect for board demos and first-time visitors.",
  liveDemoBanner: `Live demo scans are limited to approved public targets (${OQS_DEMO_HOST}, qtangl.com). This is an inventory aid, not a penetration test.`,
  myDomainChecklist: [
    "Work email at the organization you represent",
    "Written authorization to scan the target domain(s)",
    "Domain added to your tenant allowlist (auto-matched from email on self-serve signup)",
  ],
} as const;
