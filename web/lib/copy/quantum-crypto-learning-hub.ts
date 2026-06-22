export const quantumCryptoLearningHubCopy = {
  metadata: {
    title: "Quantum cryptography curriculum",
    description:
      "Free five-layer learning path from Shor's algorithm through NIST PQC standards and migration — with 15 embedded video companions and authoritative citations.",
  },
  hero: {
    eyebrow: "Public curriculum",
    title: "Learn quantum cryptography — from Shor's to post-quantum migration.",
    description:
      "A structured path for CISOs, security engineers, and developers. Each layer pairs YouTube explainers with Qtangl articles, NIST references, and checkpoints you can use in planning meetings.",
  },
  actions: [
    { href: "/blog/learning-quantum-crypto-4-week-path", label: "4-week schedule" },
    { href: "/learn/quantum-crypto/guide", label: "Learning guide" },
    {
      href: "/downloads/quantum-crypto-learning-guide.md",
      label: "Download .md",
      variant: "secondary" as const,
    },
    { href: "/q-day", label: "Q-Day hub", variant: "secondary" as const },
  ],
  videoSection: {
    eyebrow: "Video companions",
    title: "Watch, then read the practitioner takeaways.",
    description:
      "Every video opens with an embedded player on the blog article — plus source citations, checkpoints, and inventory steps Qtangl customers use.",
  },
  layersSection: {
    eyebrow: "Five layers",
    title: "Progress from threat model to evidence change control.",
    description:
      "Work through the layers in order, or jump to the checkpoint that matches your next board question.",
  },
  diagramsSection: {
    eyebrow: "Diagrams",
    title: "Visual anchors for briefings and onboarding.",
  },
  cta: {
    eyebrow: "Apply what you learn",
    title: "Inventory beats slides.",
    description:
      "When you finish a layer, run a baseline scan and export a CBOM — the curriculum links to Qtangl tools, but the concepts stand alone.",
    actions: [
      { href: "/assess/mini", label: "Free mini-assessment" },
      { href: "/learn/topics/quantum-crypto-foundations", label: "Topic guide", variant: "secondary" as const },
    ],
  },
} as const;

export const quantumCryptoDiagrams = [
  { id: "threat-map", title: "Quantum threat map", alt: "Which algorithms Shor and Grover affect" },
  { id: "hndl-timeline", title: "HNDL timeline", alt: "Harvest now, decrypt later exposure window" },
  { id: "nist-algorithm-tree", title: "NIST algorithm tree", alt: "FIPS 203, 204, and 205 replacements" },
  { id: "hybrid-tls-handshake", title: "Hybrid TLS handshake", alt: "Classical plus post-quantum key exchange" },
  { id: "migration-stack", title: "Migration stack", alt: "Layers from discovery through evidence" },
  { id: "mosca-gauge", title: "Mosca inequality gauge", alt: "X plus Y greater than Z planning frame" },
  { id: "crypto-attack-surface", title: "Crypto attack surface", alt: "TLS, code, KMS, and data at rest" },
  { id: "qkd-vs-pqc", title: "QKD vs PQC", alt: "When quantum key distribution differs from post-quantum crypto" },
] as const;
