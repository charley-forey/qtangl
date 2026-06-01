export const coveragePageCopy = {
  metadata: {
    title: "Coverage matrix",
    description: "Qtangl inventory sources — external, code, cloud, and agent.",
  },
  hero: {
    eyebrow: "Coverage",
    title: "What Qtangl can inventory today",
    description:
      "Honest view of discovery sources. Live means production-ready in the product; Beta and Roadmap are labeled accordingly.",
  },
  sources: [
    {
      name: "External TLS / JWKS / SSH / email",
      status: "live" as const,
      description: "Live domain and endpoint scanning with signed reports.",
      href: "/assess",
    },
    {
      name: "Upload bundle / cloud JSON import",
      status: "live" as const,
      description: "CSV/JSON inventory upload and scheduled import payloads.",
      href: "/docs/guides/monitor-setup",
    },
    {
      name: "Scheduled Monitor + drift",
      status: "live" as const,
      description: "Redis worker, diff alerts, webhook v2, DLQ replay.",
      href: "/monitor",
    },
    {
      name: "GitHub code & dependencies",
      status: "beta" as const,
      description: "Snippet upload or PAT repository tree scan via POST /tenant/coverage/code-scan.",
      href: "/docs/integrations/ci-cd",
    },
    {
      name: "AWS ACM / Azure / GCP pull",
      status: "beta" as const,
      description: "AWS ACM live via IAM; Azure and GCP scheduled pull on roadmap.",
      href: "/docs/guides/monitor-setup",
    },
    {
      name: "Kubernetes / internal agent",
      status: "roadmap" as const,
      description: "In-cluster and behind-firewall discovery.",
      href: "/access",
    },
  ],
};
