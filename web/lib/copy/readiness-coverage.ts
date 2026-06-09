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
      status: "live" as const,
      description: "Async code scan via CryptoScan/CryptoDeps orchestration — POST /tenant/coverage/code-scan.",
      href: "/docs/guides/code-scan-ci",
    },
    {
      name: "AWS ACM / Azure / GCP pull",
      status: "beta" as const,
      description: "AWS ACM live via IAM; Azure and GCP scheduled pull on roadmap.",
      href: "/docs/guides/monitor-setup",
    },
    {
      name: "Host sensor fleet",
      status: "live" as const,
      description: "Qtangl Unified Sensor — cert stores, libraries, listeners; Helm and offline upload.",
      href: "/docs/guides/host-sensor-deploy",
    },
    {
      name: "Container / binary scan",
      status: "beta" as const,
      description: "CBOMkit-theia image scan via POST /tenant/discovery/binary-scan.",
      href: "/docs/guides/code-scan-ci",
    },
  ],
};
