import type {
  CapabilityRow,
  CompetitorEntry,
  CompetitorFaqItem,
  CompetitorSource,
  DiscoveryCoverage,
  QtanglBaseline,
  RadarScores,
} from "@/lib/competitors-types";

const LAST_VALIDATED = "2026-06-06";

const DEFAULT_SOURCES: CompetitorSource[] = [
  { label: "Qtangl competitive intelligence (internal)", url: "https://www.qtangl.com/compare" },
  { label: "NIST NCCoE PQC migration", url: "https://www.nccoe.nist.gov/projects/building-blocks/post-quantum-cryptography" },
];

export const qtanglBaseline: QtanglBaseline = {
  name: "Qtangl",
  product: "Post-Quantum Readiness Platform",
  capabilities: {
    agentlessExternalScan: "yes",
    hostEndpointDiscovery: "no",
    sourceCodeBinaryScan: "no",
    moscaHndlScoring: "yes",
    cycloneDxCbom: "yes",
    signedPublicVerify: "yes",
    driftRescanDiff: "partial",
    remediationWorkflow: "partial",
    flipsCrypto: "no",
    midMarketSelfServe: "yes",
    transparentPricing: "yes",
  },
  radar: {
    speed: 5,
    evidence: 5,
    discoveryDepth: 2,
    breadth: 4,
    affordability: 4,
    selfServe: 5,
  },
  quadrant: { x: 0.62, y: 0.82 },
  discoveryCoverage: {
    agentless: "yes",
    host: "no",
    code: "no",
    kms: "partial",
    certClm: "partial",
  },
};

function faq(
  name: string,
  whenThem: string,
  whenUs: string,
): CompetitorFaqItem[] {
  return [
    {
      question: `When should we choose ${name} over Qtangl?`,
      answer: whenThem,
    },
    {
      question: `When should we choose Qtangl over ${name}?`,
      answer: whenUs,
    },
    {
      question: "Can we use both together?",
      answer:
        "Often yes. Many regulated teams keep a discovery incumbent for depth and layer Qtangl as the neutral evidence system of record — signed reports, transparency log, and Readiness Passport auditors verify independently.",
    },
  ];
}

function entry(partial: CompetitorEntry): CompetitorEntry {
  return {
    ...partial,
    sources: partial.sources.length ? partial.sources : DEFAULT_SOURCES,
    lastValidated: partial.lastValidated || LAST_VALIDATED,
  };
}

export const competitorRegistry: readonly CompetitorEntry[] = [
  entry({
    slug: "sandboxaq",
    name: "SandboxAQ",
    product: "AQtive Guard",
    tier: "direct-platform",
    oneLiner: "Enterprise CPM + AI-SPM from an Alphabet spin-out — deep agent-based discovery at enterprise price.",
    theirPitch:
      "Cryptographic Posture Management and AI Security Posture Management powered by Large Quantitative Models, with deep multi-source discovery and CBOM.",
    discoveryMethod: "Host agents and sensors — filesystem scanner, Java tracer, network analyzer.",
    discoveryCoverage: {
      agentless: "partial",
      host: "yes",
      code: "partial",
      kms: "partial",
      certClm: "partial",
    },
    strengths: [
      "Alphabet spin-out brand and capital",
      "Deep multi-source discovery with CBOM",
      "Enterprise sales motion and analyst presence",
    ],
    whereWeWin: [
      "Minutes-to-inventory without agent rollout",
      "Signed public verify links auditors check offline",
      "Transparent mid-market pricing vs ~$250K enterprise listings",
      "Self-serve assessment path",
    ],
    whereTheyWin: [
      "Fortune 100 multi-year enterprise programs",
      "Brand-led RFPs and deep host-level visibility",
      "Broader platform including AI-SPM",
    ],
    whenToChooseThem:
      "You need a multi-year enterprise program with deep host and code discovery, have budget for six-figure ACV, and brand credibility drives the RFP.",
    whenToChooseQtangl:
      "You need a fast, verifiable baseline this quarter at mid-market price — with continuous drift and evidence your auditors can verify without our dashboard.",
    coopetitionNote:
      "If SandboxAQ owns discovery depth, import their CBOM — Qtangl signs the merged posture and produces verifiable proof.",
    landThePoint:
      "If you want a fast, verifiable baseline this quarter without an enterprise program, that's us.",
    capabilities: {
      agentlessExternalScan: "partial",
      hostEndpointDiscovery: "yes",
      sourceCodeBinaryScan: "partial",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "yes",
      signedPublicVerify: "no",
      driftRescanDiff: "partial",
      remediationWorkflow: "yes",
      flipsCrypto: "yes",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 2, evidence: 2, discoveryDepth: 5, breadth: 5, affordability: 1, selfServe: 1 },
    quadrant: { x: 0.88, y: 0.2 },
    faq: faq(
      "SandboxAQ",
      "Fortune 100 programs where brand, capital, and deep agent-based discovery justify six-figure ACV and long sales cycles.",
      "Mid-market teams that need inventory in minutes, transparent pricing, and signed evidence auditors verify independently.",
    ),
    seo: {
      title: "Qtangl vs SandboxAQ — PQC Readiness Comparison (2026)",
      description:
        "Compare Qtangl and SandboxAQ AQtive Guard for post-quantum readiness: discovery depth, verifiable evidence, pricing, and mid-market fit.",
      keywords: ["qtangl vs sandboxaq", "sandboxaq alternative", "aqtive guard comparison", "pqc readiness vendors"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "keyfactor",
    name: "Keyfactor",
    product: "Command + AgileSec + CipherInsights",
    tier: "direct-platform",
    oneLiner: "CLM leader that consolidated crypto-discovery startups — deep host-agent visibility with NIST NCCoE validation.",
    theirPitch:
      "Consolidated CLM, InfoSec Global (AgileSec), and CipherInsights into one discovery + remediation platform with host agents and CrowdStrike/Tanium integration.",
    discoveryMethod: "Host agents plus network (CipherInsights) plus CLM certificate inventory.",
    discoveryCoverage: {
      agentless: "partial",
      host: "yes",
      code: "partial",
      kms: "partial",
      certClm: "yes",
    },
    strengths: [
      "Installed CLM base and enterprise trust",
      "Deep host visibility (filesystems, registries, memory)",
      "NIST NCCoE-validated discovery stack",
    ],
    whereWeWin: [
      "Agentless external start — no sensor rollout",
      "Signed public verify and Mosca HNDL framing",
      "Mid-market self-serve and demo-in-minutes",
    ],
    whereTheyWin: [
      "Accounts standardized on Keyfactor CLM",
      "Fleet-wide endpoint-agent discovery requirements",
    ],
    whenToChooseThem:
      "You already run Keyfactor CLM and need deep endpoint-agent discovery across a large fleet with policy enforcement.",
    whenToChooseQtangl:
      "You want a fast external baseline with verifiable evidence — no agents to deploy first — at mid-market price.",
    coopetitionNote:
      "Keep Keyfactor for CLM and host depth; Qtangl gives you agentless assessment plus evidence auditors verify independently.",
    landThePoint:
      "Keep Keyfactor for CLM; we give you a fast external baseline with evidence auditors can verify.",
    capabilities: {
      agentlessExternalScan: "partial",
      hostEndpointDiscovery: "yes",
      sourceCodeBinaryScan: "partial",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "yes",
      signedPublicVerify: "no",
      driftRescanDiff: "yes",
      remediationWorkflow: "yes",
      flipsCrypto: "yes",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 2, evidence: 2, discoveryDepth: 5, breadth: 4, affordability: 2, selfServe: 1 },
    quadrant: { x: 0.8, y: 0.38 },
    faq: faq(
      "Keyfactor",
      "Enterprise accounts with Keyfactor CLM installed and a mandate for host-agent depth across the fleet.",
      "Teams that want agentless external inventory first, with signed evidence and mid-market packaging.",
    ),
    seo: {
      title: "Qtangl vs Keyfactor — PQC Readiness Comparison (2026)",
      description:
        "Qtangl vs Keyfactor for post-quantum crypto inventory: agentless vs host-agent discovery, verifiable evidence, and mid-market fit.",
      keywords: ["qtangl vs keyfactor", "keyfactor pqc alternative", "crypto discovery comparison"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "qusecure",
    name: "QuSecure",
    product: "QuProtect R3",
    tier: "direct-platform",
    oneLiner: "PQ overlay with R3 Reconnaissance discovery — gov traction and active mitigation in one platform.",
    theirPitch:
      "Crypto-agility overlay with Reconnaissance inventory, Resilience active mitigation, and government channel partnerships.",
    discoveryMethod: "Network overlay plus Reconnaissance module for live cryptographic debt inventory.",
    discoveryCoverage: {
      agentless: "yes",
      host: "partial",
      code: "no",
      kms: "partial",
      certClm: "partial",
    },
    strengths: [
      "Government traction (MDA SHIELD contract)",
      "Accenture/Dell/Cisco/Carahsoft channel",
      "Discovery and active mitigation in one product",
    ],
    whereWeWin: [
      "Assessment and verifiable evidence first",
      "Lighter to start; mid-market transparent pricing",
      "Honest baseline framing before overlay commitment",
    ],
    whereTheyWin: [
      "Buyers ready for full PQ overlay network deployment",
      "Active mitigation requirements today",
    ],
    whenToChooseThem:
      "You are ready to deploy a full PQ overlay with active mitigation and have enterprise/gov budget and channel relationships.",
    whenToChooseQtangl:
      "You want an independently verifiable baseline before committing to a full overlay and mitigation rollout.",
    landThePoint:
      "Get a verifiable baseline before committing to a full overlay rollout.",
    capabilities: {
      agentlessExternalScan: "yes",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "no",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "partial",
      signedPublicVerify: "no",
      driftRescanDiff: "yes",
      remediationWorkflow: "yes",
      flipsCrypto: "yes",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 3, evidence: 2, discoveryDepth: 4, breadth: 4, affordability: 2, selfServe: 1 },
    quadrant: { x: 0.62, y: 0.34 },
    faq: faq(
      "QuSecure",
      "Programs that need active PQ mitigation overlay today with government-grade channel support.",
      "Teams that need assessment-first inventory with signed evidence before overlay investment.",
    ),
    seo: {
      title: "Qtangl vs QuSecure — PQC Readiness Comparison (2026)",
      description:
        "Compare Qtangl and QuSecure QuProtect R3: assessment vs overlay, verifiable evidence, and mid-market packaging.",
      keywords: ["qtangl vs qusecure", "qusecure alternative", "quprotect comparison"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "ibm-quantum-safe",
    name: "IBM",
    product: "Quantum Safe (Explorer / Advisor / Remediator)",
    tier: "direct-platform",
    oneLiner: "CBOM standard author with code-first discovery — IBM scale, services, and Guardium integration.",
    theirPitch:
      "End-to-end Discover → Observe → Remediate: Explorer static code scan, Advisor runtime posture, Remediator migration patterns, Guardium Quantum Safe.",
    discoveryMethod: "Static source/object-code analysis plus runtime TLS/cert/key observation.",
    discoveryCoverage: {
      agentless: "no",
      host: "partial",
      code: "yes",
      kms: "partial",
      certClm: "partial",
    },
    strengths: [
      "Authored the CycloneDX CBOM standard (CBOMkit)",
      "Deep code-level visibility",
      "IBM scale, services, and z16 quantum-safe systems",
    ],
    whereWeWin: [
      "Mid-market price and speed",
      "Agentless external coverage (TLS, JWKS, SSH, email)",
      "Self-serve path and signed public verify",
    ],
    whereTheyWin: [
      "Large IBM accounts and code-heavy portfolios",
      "CBOM standard credibility in RFPs",
    ],
    whenToChooseThem:
      "You are an IBM shop scanning source code at enterprise scale and need Guardium-integrated remediation patterns.",
    whenToChooseQtangl:
      "You need a fast external baseline this week — CBOM-compatible, not CBOM-owner — with verifiable evidence at mid-market price.",
    coopetitionNote:
      "IBM owns CBOM; Qtangl exports the same standard and wins on external baseline packaging plus verifiable proof.",
    landThePoint:
      "IBM is great at code scale. We give you a fast, verifiable external baseline — same CBOM standard.",
    capabilities: {
      agentlessExternalScan: "no",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "yes",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "yes",
      signedPublicVerify: "no",
      driftRescanDiff: "partial",
      remediationWorkflow: "yes",
      flipsCrypto: "yes",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 2, evidence: 2, discoveryDepth: 5, breadth: 5, affordability: 1, selfServe: 1 },
    quadrant: { x: 0.92, y: 0.12 },
    faq: faq(
      "IBM Quantum Safe",
      "IBM-centric enterprises with code-heavy portfolios and multi-year services-led migration programs.",
      "Mid-market teams needing agentless external inventory, Mosca HNDL, and signed evidence this quarter.",
    ),
    seo: {
      title: "Qtangl vs IBM Quantum Safe — PQC Comparison (2026)",
      description:
        "Qtangl vs IBM Quantum Safe: CBOM-compatible external baseline vs code-first enterprise discovery and remediation.",
      keywords: ["qtangl vs ibm", "ibm quantum safe alternative", "cbom comparison"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "fortanix",
    name: "Fortanix",
    product: "Key Insight / PQC Central",
    tier: "direct-platform",
    oneLiner: "KMS/HSM-centric discovery with quantum readiness score — closest to our low-friction read-only pitch on keys.",
    theirPitch:
      "Read-only scan of encryption keys and data services across multicloud KMS/HSM with PQC Central readiness scoring.",
    discoveryMethod: "Read-only KMS, HSM, and secret-store scanning across AWS, Azure, GCP, Vault, CyberArk.",
    discoveryCoverage: {
      agentless: "partial",
      host: "partial",
      code: "no",
      kms: "yes",
      certClm: "partial",
    },
    strengths: [
      "Fast, low-friction read-only key discovery",
      "Quantum readiness score and ServiceNow/Jira export",
      "Confidential Computing protection",
    ],
    whereWeWin: [
      "Endpoint/protocol inventory (TLS, JWKS, SSH, email)",
      "Mosca HNDL and signed public verify",
      "Not tied to Fortanix key-management stack",
    ],
    whereTheyWin: [
      "Buyers framing the problem as where are my keys",
      "Already in Fortanix/KMS ecosystem",
    ],
    whenToChooseThem:
      "Your primary question is key and KMS inventory across multicloud and you plan Fortanix for key transition.",
    whenToChooseQtangl:
      "You need wire-exposed crypto posture, HNDL risk framing, and verifiable remediation proof — not just key locations.",
    landThePoint:
      "Fortanix answers where are my keys. We answer where is exposed crypto on the wire and can I prove I fixed it.",
    capabilities: {
      agentlessExternalScan: "partial",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "no",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "partial",
      signedPublicVerify: "no",
      driftRescanDiff: "yes",
      remediationWorkflow: "yes",
      flipsCrypto: "yes",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 4, evidence: 2, discoveryDepth: 3, breadth: 3, affordability: 3, selfServe: 2 },
    quadrant: { x: 0.5, y: 0.46 },
    faq: faq(
      "Fortanix",
      "Multicloud KMS-centric programs where key inventory and Fortanix DSM transition are the primary scope.",
      "Security teams prioritizing TLS/JWKS/SSH/email exposure, Mosca HNDL, and auditor-verifiable evidence.",
    ),
    seo: {
      title: "Qtangl vs Fortanix — PQC Readiness Comparison (2026)",
      description:
        "Qtangl vs Fortanix Key Insight: protocol inventory and verifiable evidence vs KMS-centric key discovery.",
      keywords: ["qtangl vs fortanix", "fortanix pqc alternative", "kms crypto discovery"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "palo-alto",
    name: "Palo Alto Networks",
    product: "Quantum-Safe Security",
    tier: "direct-platform",
    oneLiner: "Agentless CBOM from NGFW/Prisma telemetry — they own the sensors where deployed.",
    theirPitch:
      "Quantum-Safe Security app in Strata Cloud Manager building live CBOM from firewall and Prisma Access session inspection.",
    discoveryMethod: "NGFW and Prisma Access as distributed agentless sensors on SSL/TLS, VPN, SSH traffic.",
    discoveryCoverage: {
      agentless: "yes",
      host: "partial",
      code: "no",
      kms: "no",
      certClm: "partial",
    },
    strengths: [
      "Agentless discovery via installed firewall base",
      "Real-time inventory and risk categorization",
      "Philosophically aligned with network-telemetry discovery",
    ],
    whereWeWin: [
      "No PAN platform commitment required",
      "Signed public verify and portable evidence",
      "Mid-market accounts without pervasive PAN",
    ],
    whereTheyWin: [
      "Existing Palo Alto platform accounts",
      "Traffic that already traverses PAN devices",
    ],
    whenToChooseThem:
      "Every byte already flows through Palo Alto NGFW or Prisma and you want an in-platform CBOM add-on.",
    whenToChooseQtangl:
      "You need standalone verifiable evidence, cloud cert import beyond PAN telemetry, and mid-market packaging without platform lock-in.",
    landThePoint:
      "If traffic flows through Palo Alto, use their app. If not — or you need portable evidence — start with us.",
    capabilities: {
      agentlessExternalScan: "yes",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "no",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "yes",
      signedPublicVerify: "no",
      driftRescanDiff: "yes",
      remediationWorkflow: "partial",
      flipsCrypto: "partial",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 4, evidence: 2, discoveryDepth: 4, breadth: 4, affordability: 2, selfServe: 1 },
    quadrant: { x: 0.86, y: 0.45 },
    faq: faq(
      "Palo Alto Networks",
      "Organizations with pervasive PAN deployment wanting in-platform quantum-safe inventory.",
      "Teams without full PAN coverage or needing signed evidence auditors verify without platform login.",
    ),
    seo: {
      title: "Qtangl vs Palo Alto — Quantum-Safe Security Comparison (2026)",
      description:
        "Qtangl vs Palo Alto Quantum-Safe Security: standalone verifiable evidence vs firewall-telemetry CBOM.",
      keywords: ["qtangl vs palo alto", "palo alto quantum safe alternative", "ngfw cbom"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "qinsight",
    name: "Qinsight",
    product: "Qinsight Platform",
    tier: "pure-play",
    oneLiner: "Agentless signal collection with live CBOM — closest pure-play twin to Qtangl's scan-and-report model.",
    theirPitch:
      "Authorized signal collection without heavy rollout, live CBOM, framework mapping, risk scoring, and CMDB/ticketing sync.",
    discoveryMethod: "Agentless authorized signal collection across external crypto surfaces.",
    discoveryCoverage: {
      agentless: "yes",
      host: "partial",
      code: "no",
      kms: "partial",
      certClm: "partial",
    },
    strengths: [
      "Agentless collection with live CBOM",
      "CNSA 2.0 / PCI / FIPS mapping and risk scoring",
      "CMDB and ticketing integration",
    ],
    whereWeWin: [
      "Signed public verify links — independent verification",
      "Mosca HNDL timeline framing for boards",
      "Sharper mid-market packaging and transparent pricing",
    ],
    whereTheyWin: [
      "Mature CMDB/ticketing sync if already integrated",
      "Broader drift monitoring maturity in some deployments",
    ],
    whenToChooseThem:
      "You prioritize CMDB-native workflows and their existing integration footprint over public verify evidence.",
    whenToChooseQtangl:
      "You need evidence auditors verify without trusting a vendor dashboard — signed reports and transparency log inclusion.",
    landThePoint:
      "Similar approach — our difference is evidence your auditor can verify without our dashboard.",
    capabilities: {
      agentlessExternalScan: "yes",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "no",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "yes",
      signedPublicVerify: "no",
      driftRescanDiff: "yes",
      remediationWorkflow: "partial",
      flipsCrypto: "no",
      midMarketSelfServe: "partial",
      transparentPricing: "unknown",
    },
    radar: { speed: 4, evidence: 2, discoveryDepth: 3, breadth: 3, affordability: 3, selfServe: 3 },
    quadrant: { x: 0.52, y: 0.7 },
    faq: faq(
      "Qinsight",
      "Teams already integrated with Qinsight CMDB workflows who do not prioritize public verify evidence.",
      "Teams where auditor-verifiable signed evidence and Mosca HNDL board framing are decision criteria.",
    ),
    seo: {
      title: "Qtangl vs Qinsight — PQC Readiness Comparison (2026)",
      description:
        "Qtangl vs Qinsight: two agentless CBOM approaches — compare verifiable evidence, Mosca HNDL, and packaging.",
      keywords: ["qtangl vs qinsight", "qinsight alternative", "agentless pqc inventory"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "exequantum",
    name: "ExeQuantum",
    product: "ExeQuantum Platform",
    tier: "pure-play",
    oneLiner: "Broad surface discovery across 10 vectors including JWT and OT — also ships formally-verified PQC.",
    theirPitch:
      "Discovery across TLS, certs, email, SSH, JWT fleets, cloud KMS, source code, and OT → CycloneDX 1.7 CBOM plus drift monitoring.",
    discoveryMethod: "Multi-surface external and internal discovery with formally-verified PQC components.",
    discoveryCoverage: {
      agentless: "yes",
      host: "partial",
      code: "partial",
      kms: "partial",
      certClm: "partial",
    },
    strengths: [
      "Ten discovery surfaces including JWT and OT",
      "CycloneDX 1.7 CBOM and drift monitoring",
      "Formally-verified PQC cryptography",
    ],
    whereWeWin: [
      "Publicly verifiable signed evidence",
      "Honest assessment-first framing without selling crypto flip",
      "Transparent mid-market packaging",
    ],
    whereTheyWin: [
      "Broader surface coverage including OT and JWT at depth",
      "Buyers wanting verified PQC primitives from same vendor",
    ],
    whenToChooseThem:
      "You need OT and JWT fleet coverage plus formally-verified PQC from a single vendor.",
    whenToChooseQtangl:
      "You want verifiable evidence and an honest baseline assessment lane — not bundled crypto migration products.",
    landThePoint:
      "Comparable discovery — we lead with verifiable evidence and honest baseline, not by also selling you the crypto.",
    capabilities: {
      agentlessExternalScan: "yes",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "partial",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "yes",
      signedPublicVerify: "no",
      driftRescanDiff: "yes",
      remediationWorkflow: "partial",
      flipsCrypto: "partial",
      midMarketSelfServe: "partial",
      transparentPricing: "unknown",
    },
    radar: { speed: 4, evidence: 2, discoveryDepth: 4, breadth: 4, affordability: 3, selfServe: 3 },
    quadrant: { x: 0.57, y: 0.62 },
    faq: faq(
      "ExeQuantum",
      "Programs needing OT/JWT depth and formally-verified PQC from one vendor.",
      "Teams prioritizing signed public verify, Mosca HNDL, and assessment-first honesty over bundled crypto products.",
    ),
    seo: {
      title: "Qtangl vs ExeQuantum — PQC Readiness Comparison (2026)",
      description:
        "Qtangl vs ExeQuantum: compare discovery breadth, verifiable evidence, and assessment vs migration bundling.",
      keywords: ["qtangl vs exequantum", "exequantum alternative", "pqc cbom comparison"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "encryption-consulting",
    name: "Encryption Consulting",
    product: "CBOM Secure",
    tier: "pure-play",
    oneLiner: "Consulting-led CBOM system of record across cloud, on-prem, HSM, vaults, and code.",
    theirPitch:
      "System of record plus continuous intelligence CBOM across cloud/on-prem/HSM/DB/vaults/code with PQC roadmap services.",
    discoveryMethod: "Hybrid consulting-led discovery across infrastructure, vaults, and code.",
    discoveryCoverage: {
      agentless: "partial",
      host: "partial",
      code: "partial",
      kms: "partial",
      certClm: "partial",
    },
    strengths: [
      "Broad estate coverage with consulting expertise",
      "Continuous intelligence CBOM narrative",
      "PQC roadmap and migration services",
    ],
    whereWeWin: [
      "Self-serve product-first path",
      "Signed public verify links",
      "Minutes-to-inventory vs consulting-led timelines",
    ],
    whereTheyWin: [
      "Buyers wanting a body-shop to run the whole program",
      "Complex estates needing hands-on consulting labor",
    ],
    whenToChooseThem:
      "You want consultants to run discovery and migration labor across a complex hybrid estate.",
    whenToChooseQtangl:
      "You want a living product with continuous drift and verifiable evidence — not a consulting deliverable that ages on delivery.",
    landThePoint:
      "They deliver labor and decks. We deliver a living system of record with signed evidence.",
    capabilities: {
      agentlessExternalScan: "partial",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "partial",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "yes",
      signedPublicVerify: "no",
      driftRescanDiff: "partial",
      remediationWorkflow: "partial",
      flipsCrypto: "partial",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 2, evidence: 2, discoveryDepth: 4, breadth: 3, affordability: 2, selfServe: 1 },
    quadrant: { x: 0.45, y: 0.55 },
    faq: faq(
      "Encryption Consulting",
      "Complex estates where consulting labor and bespoke roadmaps are the primary deliverable.",
      "Mid-market teams wanting productized inventory, drift monitoring, and auditor-verifiable evidence.",
    ),
    seo: {
      title: "Qtangl vs Encryption Consulting — PQC Comparison (2026)",
      description:
        "Qtangl vs Encryption Consulting CBOM Secure: productized evidence vs consulting-led crypto inventory.",
      keywords: ["qtangl vs encryption consulting", "cbom secure alternative", "pqc consulting comparison"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "digicert",
    name: "DigiCert",
    product: "Trust Lifecycle Manager",
    tier: "clm-pki",
    oneLiner: "CLM and PKI leader with PQC issuance — cert discovery as CBOM foundation.",
    theirPitch:
      "Trust Lifecycle Manager for cert discovery, Device Trust Manager, PKILINT, and private CA with ML-DSA/SLH-DSA issuance.",
    discoveryMethod: "Certificate lifecycle inventory and issuance-centric discovery.",
    discoveryCoverage: {
      agentless: "partial",
      host: "partial",
      code: "no",
      kms: "partial",
      certClm: "yes",
    },
    strengths: ["Installed PKI/CLM base", "PQC-ready issuance (ML-DSA/SLH-DSA)", "Enterprise cert trust"],
    whereWeWin: [
      "Full crypto inventory beyond certs (JWKS, SSH, email)",
      "Mosca HNDL and signed public verify",
      "Agentless external breadth",
    ],
    whereTheyWin: ["Cert issuance and CLM at enterprise scale", "Organizations standardizing on DigiCert PKI"],
    whenToChooseThem: "Cert issuance, CLM, and PKI operations are the primary scope.",
    whenToChooseQtangl:
      "You need PQC posture across TLS, JWKS, SSH, and email — plus verifiable evidence, not just managed certificates.",
    coopetitionNote: "Partner on Convert for cert issuance; Qtangl is the assessment and evidence layer.",
    landThePoint: "Keep DigiCert for issuance; we inventory the full crypto surface and prove migration.",
    capabilities: {
      agentlessExternalScan: "partial",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "no",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "partial",
      signedPublicVerify: "no",
      driftRescanDiff: "partial",
      remediationWorkflow: "yes",
      flipsCrypto: "yes",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 3, evidence: 2, discoveryDepth: 3, breadth: 4, affordability: 2, selfServe: 1 },
    quadrant: { x: 0.74, y: 0.27 },
    faq: faq(
      "DigiCert",
      "PKI-centric programs where certificate issuance and CLM are the core investment.",
      "Security teams needing full-surface PQC inventory, Mosca HNDL, and signed auditor-verifiable evidence.",
    ),
    seo: {
      title: "Qtangl vs DigiCert — PQC Readiness Comparison (2026)",
      description:
        "Qtangl vs DigiCert: full crypto inventory and verifiable evidence vs certificate lifecycle management.",
      keywords: ["qtangl vs digicert", "digicert pqc alternative", "clm pqc comparison"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "appviewx",
    name: "AppViewX",
    product: "AVX ONE + PQC Assessment",
    tier: "clm-pki",
    oneLiner: "CLM automation with PQC Assessment Tool producing CBOM and PQC-ready PKIaaS.",
    theirPitch: "CLM automation, PQC Assessment Tool → CBOM, and PQC-ready PKIaaS with ML-DSA/SLH-DSA hybrid support.",
    discoveryMethod: "Certificate and CLM-centric assessment with PQC readiness tooling.",
    discoveryCoverage: {
      agentless: "partial",
      host: "partial",
      code: "no",
      kms: "partial",
      certClm: "yes",
    },
    strengths: ["CLM automation at scale", "PQC assessment producing CBOM", "PQC-ready PKIaaS"],
    whereWeWin: [
      "Agentless breadth beyond managed certs",
      "Signed public verify evidence",
      "Mosca HNDL and mid-market packaging",
    ],
    whereTheyWin: ["Installed AppViewX CLM automation", "Issuance-heavy migration programs"],
    whenToChooseThem: "AppViewX CLM is your system of record and issuance automation is the priority.",
    whenToChooseQtangl:
      "You need external crypto posture inventory with verifiable evidence independent of CLM dashboards.",
    coopetitionNote: "Partner on issuance; Qtangl provides assessment plus verifiable evidence layer.",
    landThePoint: "Keep AppViewX for CLM; we give you PQC posture plus verifiable evidence across the wire.",
    capabilities: {
      agentlessExternalScan: "partial",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "no",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "partial",
      signedPublicVerify: "no",
      driftRescanDiff: "partial",
      remediationWorkflow: "yes",
      flipsCrypto: "yes",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 3, evidence: 2, discoveryDepth: 3, breadth: 4, affordability: 2, selfServe: 1 },
    quadrant: { x: 0.72, y: 0.3 },
    faq: faq(
      "AppViewX",
      "Organizations with AppViewX CLM as the automation backbone for cert issuance.",
      "Teams needing wire-exposed crypto inventory and auditor-verifiable signed evidence.",
    ),
    seo: {
      title: "Qtangl vs AppViewX — PQC Readiness Comparison (2026)",
      description: "Qtangl vs AppViewX: verifiable PQC evidence vs CLM automation and PQC assessment.",
      keywords: ["qtangl vs appviewx", "appviewx pqc alternative"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "entrust",
    name: "Entrust",
    product: "Cryptographic Security Platform",
    tier: "clm-pki",
    oneLiner: "PKI, key lifecycle, nShield HSM, and crypto-agility for enterprise identity programs.",
    theirPitch:
      "Cryptographic Security Platform spanning PKI, key and cert lifecycle, nShield HSM, and crypto-agility features.",
    discoveryMethod: "Key and certificate lifecycle with HSM-centric posture.",
    discoveryCoverage: {
      agentless: "partial",
      host: "partial",
      code: "no",
      kms: "yes",
      certClm: "yes",
    },
    strengths: ["nShield HSM and enterprise PKI", "Key/cert lifecycle at scale", "Crypto-agility narrative"],
    whereWeWin: [
      "Agentless external inventory and Mosca HNDL",
      "Signed public verify",
      "Mid-market assessment packaging",
    ],
    whereTheyWin: ["HSM and PKI programs at enterprise scale", "Key material governance requirements"],
    whenToChooseThem: "HSM, PKI, and key governance are the center of your crypto program.",
    whenToChooseQtangl:
      "You need protocol-level exposure inventory and verifiable migration proof — orchestrate with Entrust for Convert.",
    coopetitionNote: "Partner for HSM/key Convert handoff; Qtangl competes on inventory breadth and evidence.",
    landThePoint: "Entrust for HSM and keys; Qtangl for exposure inventory and verifiable proof.",
    capabilities: {
      agentlessExternalScan: "partial",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "no",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "partial",
      signedPublicVerify: "no",
      driftRescanDiff: "partial",
      remediationWorkflow: "yes",
      flipsCrypto: "yes",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 2, evidence: 2, discoveryDepth: 4, breadth: 4, affordability: 2, selfServe: 1 },
    quadrant: { x: 0.84, y: 0.3 },
    faq: faq(
      "Entrust",
      "Enterprise PKI and HSM programs where key governance is the primary investment.",
      "Teams needing external crypto exposure, Mosca HNDL scoring, and signed evidence for auditors.",
    ),
    seo: {
      title: "Qtangl vs Entrust — PQC Readiness Comparison (2026)",
      description: "Qtangl vs Entrust: protocol inventory and verifiable evidence vs PKI/HSM lifecycle platform.",
      keywords: ["qtangl vs entrust", "entrust pqc alternative"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "cyberark-venafi",
    name: "CyberArk",
    product: "CyberArk Certificate Manager (ex-Venafi)",
    tier: "clm-pki",
    oneLiner: "Machine-identity and CLM leader adding PQC — assessment layer opportunity for Qtangl.",
    theirPitch:
      "CyberArk Certificate Manager (formerly Venafi) for machine-identity and certificate lifecycle with emerging PQC features.",
    discoveryMethod: "Certificate and machine-identity CLM inventory.",
    discoveryCoverage: {
      agentless: "partial",
      host: "partial",
      code: "no",
      kms: "partial",
      certClm: "yes",
    },
    strengths: [
      "Machine-identity CLM market leadership",
      "Installed enterprise base",
      "CyberArk identity security ecosystem",
    ],
    whereWeWin: [
      "PQC-first narrative with Mosca HNDL",
      "Agentless external breadth beyond managed certs",
      "Signed public verify evidence",
    ],
    whereTheyWin: ["Machine-identity programs at enterprise scale", "CyberArk-standardized environments"],
    whenToChooseThem: "Machine-identity and certificate automation via CyberArk is already standardized.",
    whenToChooseQtangl:
      "You need a verifiable assessment and evidence layer on top of CLM — full-surface inventory plus signed proof.",
    coopetitionNote:
      "Be the assessment and verifiable-evidence layer on top of CyberArk Certificate Manager.",
    landThePoint:
      "Keep CyberArk for machine identities; we give you PQC posture plus verifiable evidence across the wire.",
    capabilities: {
      agentlessExternalScan: "partial",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "no",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "partial",
      signedPublicVerify: "no",
      driftRescanDiff: "partial",
      remediationWorkflow: "yes",
      flipsCrypto: "yes",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 3, evidence: 2, discoveryDepth: 3, breadth: 4, affordability: 2, selfServe: 1 },
    quadrant: { x: 0.78, y: 0.28 },
    faq: faq(
      "CyberArk / Venafi",
      "Enterprise machine-identity programs standardized on CyberArk Certificate Manager.",
      "Teams needing PQC assessment, Mosca HNDL, and signed evidence independent of CLM dashboards.",
    ),
    seo: {
      title: "Qtangl vs CyberArk (Venafi) — PQC Comparison (2026)",
      description:
        "Qtangl vs CyberArk Certificate Manager: verifiable PQC evidence layer vs machine-identity CLM.",
      keywords: ["qtangl vs cyberark", "venafi pqc alternative", "cyberark certificate manager comparison"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "consulting",
    name: "Big 4 / boutique consulting",
    product: "PQC advisory services",
    tier: "consulting",
    oneLiner: "Trust, relationships, and migration labor — spreadsheets and decks, not living evidence.",
    theirPitch:
      "Board-trusted advisory firms delivering PQC assessments, roadmaps, and migration programs with people and relationships.",
    discoveryMethod: "Manual interviews, spreadsheet inventories, and bespoke assessment methodologies.",
    discoveryCoverage: {
      agentless: "partial",
      host: "partial",
      code: "partial",
      kms: "partial",
      certClm: "partial",
    },
    strengths: [
      "Trust, relationships, and board access",
      "Full-service migration labor",
      "Custom methodology for complex estates",
    ],
    whereWeWin: [
      "Inventory in minutes vs 6–12 week projects",
      "Living tool with continuous drift monitoring",
      "Reusable signed evidence at ~10x lower baseline cost",
    ],
    whereTheyWin: [
      "Buyers wanting a body-shop to run the whole program",
      "Board relationships that mandate a Big 4 name",
    ],
    whenToChooseThem:
      "You need a trusted advisor to staff the entire migration program with people and board-facing relationships.",
    whenToChooseQtangl:
      "You need a living system of record with continuous evidence — consultants can partner on labor while Qtangl is the platform.",
    coopetitionNote: "Partner motion: consulting delivers labor, Qtangl is the platform and evidence layer.",
    landThePoint: "Don't pay for a spreadsheet that's stale on delivery. Get a living system of record.",
    capabilities: {
      agentlessExternalScan: "partial",
      hostEndpointDiscovery: "partial",
      sourceCodeBinaryScan: "partial",
      moscaHndlScoring: "partial",
      cycloneDxCbom: "partial",
      signedPublicVerify: "no",
      driftRescanDiff: "no",
      remediationWorkflow: "partial",
      flipsCrypto: "partial",
      midMarketSelfServe: "no",
      transparentPricing: "no",
    },
    radar: { speed: 1, evidence: 1, discoveryDepth: 3, breadth: 2, affordability: 1, selfServe: 1 },
    quadrant: { x: 0.35, y: 0.15 },
    faq: faq(
      "Big 4 consulting",
      "Board-mandated advisory relationships where the firm name and staffed labor are non-negotiable.",
      "Teams needing inventory this quarter, continuous drift, and signed evidence at mid-market cost — with consultants optional for labor.",
    ),
    seo: {
      title: "Qtangl vs Big 4 Consulting — PQC Readiness Comparison (2026)",
      description:
        "Qtangl vs Deloitte, PwC, and boutique PQC consulting: living evidence platform vs spreadsheet assessments.",
      keywords: ["qtangl vs consulting", "pqc consulting alternative", "big 4 pqc assessment"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "open-source",
    name: "Open source / DIY",
    product: "liboqs, CBOMkit, QRAMM / CryptoScan",
    tier: "open-source",
    oneLiner: "Free NIST-aligned primitives and scanners — assemble your own program.",
    theirPitch:
      "Open-source tooling: OQS/liboqs primitives, IBM CBOMkit, QRAMM/CryptoScan for code scanning and CBOM generation.",
    discoveryMethod: "Point scanners and libraries assembled by internal engineering teams.",
    discoveryCoverage: {
      agentless: "partial",
      host: "no",
      code: "partial",
      kms: "no",
      certClm: "no",
    },
    strengths: [
      "Free and NIST-aligned primitives",
      "Code scanning and CBOM tooling (CryptoScan, CBOMkit)",
      "No vendor lock-in",
    ],
    whereWeWin: [
      "Productized workflow: orchestration, report, drift, compliance crosswalk",
      "Signed verifiable evidence and Readiness Passport",
      "Total cost of engineer time plus audit prep",
    ],
    whereTheyWin: [
      "Teams with spare engineering capacity to assemble tooling",
      "Research and primitive validation use cases",
    ],
    whenToChooseThem:
      "You have engineering capacity to assemble scanners and maintain tooling indefinitely.",
    whenToChooseQtangl:
      "You need an assembled, auditable program — not a parts bin. Qtangl builds on OQS; we don't replace it.",
    landThePoint: "OQS gives you parts; we give you the assembled, auditable program.",
    capabilities: {
      agentlessExternalScan: "partial",
      hostEndpointDiscovery: "no",
      sourceCodeBinaryScan: "partial",
      moscaHndlScoring: "no",
      cycloneDxCbom: "partial",
      signedPublicVerify: "no",
      driftRescanDiff: "no",
      remediationWorkflow: "no",
      flipsCrypto: "no",
      midMarketSelfServe: "partial",
      transparentPricing: "yes",
    },
    radar: { speed: 2, evidence: 1, discoveryDepth: 2, breadth: 1, affordability: 5, selfServe: 2 },
    quadrant: { x: 0.24, y: 0.72 },
    faq: faq(
      "open source / DIY",
      "Engineering teams with capacity to build and maintain custom scanner pipelines indefinitely.",
      "Security programs needing productized inventory, drift, compliance mapping, and signed auditor-verifiable evidence.",
    ),
    seo: {
      title: "Qtangl vs Open Source PQC Tools — Comparison (2026)",
      description:
        "Qtangl vs liboqs, CBOMkit, and CryptoScan: productized PQC readiness vs assemble-your-own tooling.",
      keywords: ["qtangl vs open source", "liboqs alternative", "pqc scanner comparison", "cbomkit vs qtangl"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),

  entry({
    slug: "status-quo",
    name: "Spreadsheet / status quo",
    product: "Manual crypto inventory",
    tier: "status-quo",
    oneLiner: "The real #1 competitor — most orgs have no central crypto inventory at all.",
    theirPitch:
      "Manual TLS spreadsheets, one-time consultant decks, and ad-hoc cert audits that decay the day after delivery.",
    discoveryMethod: "Manual audits and spreadsheets — misses JWKS, SSH, email STARTTLS, and drift.",
    discoveryCoverage: {
      agentless: "no",
      host: "no",
      code: "no",
      kms: "no",
      certClm: "partial",
    },
    strengths: ["Zero incremental software cost", "Familiar process for small estates", "No procurement cycle"],
    whereWeWin: [
      "Speed and completeness (JWKS, SSH, email missed by spreadsheets)",
      "HNDL urgency via Mosca inequality",
      "Continuous drift vs one-time static inventory",
      "Signed evidence auditors verify",
    ],
    whereTheyWin: [
      "Organizations with zero external TLS exposure",
      "Teams deferring any PQC investment indefinitely",
    ],
    whenToChooseThem:
      "Never as a long-term strategy — only as a temporary gap before board mandate forces action.",
    whenToChooseQtangl:
      "Board asks for RSA/ECDSA exposure before 2030 and you need inventory in minutes, not another stale spreadsheet.",
    landThePoint:
      "A spreadsheet misses JWKS, SSH, and email STARTTLS — and it's stale the day after. Try a free mini-scan.",
    capabilities: {
      agentlessExternalScan: "no",
      hostEndpointDiscovery: "no",
      sourceCodeBinaryScan: "no",
      moscaHndlScoring: "no",
      cycloneDxCbom: "no",
      signedPublicVerify: "no",
      driftRescanDiff: "no",
      remediationWorkflow: "no",
      flipsCrypto: "no",
      midMarketSelfServe: "no",
      transparentPricing: "yes",
    },
    radar: { speed: 1, evidence: 0, discoveryDepth: 1, breadth: 0, affordability: 5, selfServe: 0 },
    quadrant: { x: 0.15, y: 0.85 },
    faq: faq(
      "spreadsheet / status quo",
      "There is no strategic case for spreadsheets — only inertia before a board mandate.",
      "Any regulated team facing a 2027/2030 PQC deadline that needs living inventory and verifiable evidence.",
    ),
    seo: {
      title: "Qtangl vs Spreadsheet Crypto Inventory — Comparison (2026)",
      description:
        "Why manual TLS spreadsheets fail for PQC readiness — and how Qtangl replaces stale inventories with living evidence.",
      keywords: ["spreadsheet crypto inventory", "pqc inventory tool", "qtangl vs manual assessment"],
    },
    sources: DEFAULT_SOURCES,
    lastValidated: LAST_VALIDATED,
    status: "published",
  }),
] as const;

export const competitorSlugs = competitorRegistry.map((c) => c.slug);

export function getCompetitor(slug: string): CompetitorEntry | undefined {
  return competitorRegistry.find((c) => c.slug === slug);
}

export function publishedCompetitors(): CompetitorEntry[] {
  return competitorRegistry.filter((c) => c.status === "published");
}

export function competitorsForMatrix(): CompetitorEntry[] {
  return publishedCompetitors();
}

export function competitorCompareHref(slug: string): string {
  return `/compare/qtangl-vs-${slug}`;
}

export function parseCompareRouteSlug(routeSlug: string): string | null {
  const prefix = "qtangl-vs-";
  if (!routeSlug.startsWith(prefix)) return null;
  const competitorSlug = routeSlug.slice(prefix.length);
  return competitorSlug || null;
}

export const compareHubCopy = {
  metadata: {
    title: "PQC readiness vendor comparison",
    description:
      "Compare post-quantum readiness vendors side by side — discovery methods, verifiable evidence, pricing posture, and where Qtangl fits for mid-market security teams.",
  },
  hero: {
    eyebrow: "Competitive landscape",
    title: "Post-quantum readiness vendors compared.",
    description:
      "Honest comparisons for CISOs evaluating PQC readiness platforms — feature matrix, positioning map, and individual vendor breakdowns. Last validated June 2026.",
  },
  category: {
    eyebrow: "Market category",
    title: "Cryptographic Posture Management (CPM)",
    description:
      "The post-quantum readiness market is consolidating under CPM. The standard artifact is the CycloneDX CBOM. Qtangl is the neutral evidence layer — assess, monitor, convert, prove — at mid-market price.",
  },
  methodology: {
    title: "How we compare",
    description:
      "Comparisons reflect public vendor positioning validated against live sources. We acknowledge where incumbents win on depth. Qtangl wins on packaging: speed, signed publicly-verifiable evidence, mid-market price, and honest scope.",
  },
  guidePdfPath: "/downloads/qtangl-pqc-vendor-comparison.pdf",
  guideInterest: "PQC Vendor Comparison Guide (PDF)",
} as const;
