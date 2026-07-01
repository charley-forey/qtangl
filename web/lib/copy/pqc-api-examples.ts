/** Fixture-backed example payloads for PQC reference docs (from backend demo dataset). */

export const pqcScenariosResponse = {
  status: "success",
  scenarios: [
    {
      id: "bank-tls-inventory",
      title: "Regional bank TLS inventory",
      summary:
        "Board mandate to inventory RSA/ECDSA exposure across customer-facing TLS before 2030 NIST deadlines.",
      target: {
        domain: "api.regionalbank.example",
        ports: [443, 8443],
        persona: "CISO, regional bank",
        organization: "Regional Bank Holdings",
        mandate: "NSM-10 / NIST IR 8547 PQC migration program",
      },
      manualBaseline: {
        inventoryWeeks: 8,
        assetsFound: 42,
        quantumVulnerable: 38,
        readinessScore: 18,
        summary: "Spreadsheet inventory from Q1 is already stale; shadow APIs were missed.",
      },
      fixtureAssetIds: [
        "tls-api-bank",
        "tls-auth-bank",
        "jwks-oidc",
        "ssh-bastion",
        "email-mx",
        "code-sign-legacy",
        "discovery-ct-api",
      ],
    },
    {
      id: "gov-contractor-cmmc",
      title: "Gov contractor CMMC readiness",
      summary:
        "FedRAMP/CMMC assessor requires cryptographic inventory with remediation backlog before contract renewal.",
      target: {
        domain: "portal.defense-prime.example",
        ports: [443, 22],
        persona: "Compliance lead, defense contractor",
        organization: "Defense Prime Integrator",
        mandate: "CMMC Level 2 / CNSA 2.0 alignment",
      },
      manualBaseline: {
        inventoryWeeks: 6,
        assetsFound: 28,
        quantumVulnerable: 24,
        readinessScore: 22,
        summary: "Manual SSP spreadsheet; no JWKS or SSH host key coverage.",
      },
      fixtureAssetIds: ["tls-api-bank", "jwks-oidc", "ssh-bastion", "code-sign-legacy"],
    },
    {
      id: "healthcare-insurer-hndl",
      title: "Healthcare insurer HNDL exposure",
      summary:
        "Legal and security teams stress-test harvest-now-decrypt-later risk on long-retained PHI transport encryption.",
      target: {
        domain: "member.healthshield.example",
        ports: [443, 25, 993],
        persona: "CISO, healthcare insurer",
        organization: "HealthShield Mutual",
        mandate: "HIPAA + board Q-Day readiness",
      },
      manualBaseline: {
        inventoryWeeks: 10,
        assetsFound: 55,
        quantumVulnerable: 51,
        readinessScore: 15,
        summary: "Third-party email and legacy signing keys not in last inventory cycle.",
      },
      fixtureAssetIds: [
        "tls-auth-bank",
        "email-mx",
        "jwks-oidc",
        "code-sign-legacy",
        "discovery-ct-api",
      ],
    },
  ],
} as const;

export const pqcTargetResponse = {
  status: "success",
  target: {
    domain: "api.regionalbank.example",
    ports: [443, 8443],
    persona: "CISO, regional bank",
    organization: "Regional Bank Holdings",
    mandate: "NSM-10 / NIST IR 8547 PQC migration program",
  },
  scenario: pqcScenariosResponse.scenarios[0],
} as const;

export const pqcInventoryResponse = {
  status: "success",
  summary: "PQC crypto asset inventory fixture loaded.",
  inventory: [
    {
      id: "tls-api-bank",
      kind: "tls",
      host: "api.regionalbank.example",
      port: 443,
      label: "API gateway TLS",
      algorithm: "RSA",
      keySize: 2048,
      validityDays: 180,
      sanDomains: ["api.regionalbank.example", "www.regionalbank.example"],
      negotiatedCipher: "TLS_AES_256_GCM_SHA384",
      negotiatedGroup: "x25519",
      tlsVersion: "TLSv1.3",
      vulnerability: {
        algorithm: "RSA-2048",
        keySize: 2048,
        shorLogicalQubits: 4098,
        classicalSecurityBits: 2048,
        status: "at-risk",
        hndlExposed: true,
        pqcReplacement: "ML-KEM-768 + ML-DSA-65 (hybrid TLS 1.3)",
        severity: "high",
        summary: "RSA-2048 key exchange/signing is harvest-now-decrypt-later exposed.",
      },
      pqcReady: false,
    },
    {
      id: "tls-auth-bank",
      kind: "tls",
      host: "auth.regionalbank.example",
      port: 443,
      label: "Customer auth TLS",
      algorithm: "ECDSA",
      keySize: 256,
      validityDays: 90,
      sanDomains: ["auth.regionalbank.example"],
      negotiatedCipher: "TLS_AES_128_GCM_SHA256",
      negotiatedGroup: "secp256r1",
      tlsVersion: "TLSv1.3",
      vulnerability: {
        algorithm: "ECDSA-P256",
        keySize: 256,
        shorLogicalQubits: 2330,
        status: "at-risk",
        hndlExposed: true,
        pqcReplacement: "ML-DSA-65 (FIPS 204)",
        severity: "high",
        summary: "P-256 certificate is quantum-vulnerable under Shor.",
      },
      pqcReady: false,
    },
  ],
} as const;

export const pqcStandardsResponse = {
  status: "success",
  standards: {
    frameworks: [
      {
        id: "fips-203",
        name: "FIPS 203 (ML-KEM)",
        summary: "Module-Lattice-Based Key-Encapsulation Mechanism standard",
        deadline: "Available 2024",
      },
      {
        id: "fips-204",
        name: "FIPS 204 (ML-DSA)",
        summary: "Module-Lattice-Based Digital Signature Algorithm standard",
        deadline: "Available 2024",
      },
      {
        id: "cnsa-2.0",
        name: "CNSA 2.0",
        summary: "Commercial National Security Algorithm Suite 2.0",
        deadline: "2030-2033",
      },
      {
        id: "nsm-10",
        name: "NSM-10",
        summary: "National Security Memorandum on post-quantum cryptography",
        deadline: "2035",
      },
      {
        id: "cmmc",
        name: "CMMC / FedRAMP",
        summary: "Federal contractor cryptographic inventory expectations",
        deadline: "2026-2030",
      },
    ],
    mappings: {
      rsa: ["nist-ir-8547", "cnsa-2.0", "nsm-10", "pci-dss-4"],
      ecdsa: ["fips-204", "nist-ir-8547", "cnsa-2.0"],
      tls: ["nist-ir-8547", "pci-dss-4", "cmmc"],
      jwks: ["fips-204", "pci-dss-4"],
    },
  },
} as const;

export const pqcHandshakeTraceResponse = {
  status: "success",
  trace: {
    mode: "replayed",
    server: "test.openquantumsafe.org",
    port: 4433,
    tlsVersion: "TLSv1.3",
    hybridGroup: "X25519MLKEM768",
    kemAlgorithm: "ML-KEM-768",
    namedGroups: ["X25519MLKEM768", "x25519", "secp256r1"],
    cipherSuites: ["TLS_AES_256_GCM_SHA384", "TLS_AES_128_GCM_SHA256"],
    summary:
      "Captured TLS 1.3 ClientHello negotiating hybrid X25519MLKEM768 key exchange via Open Quantum Safe test server.",
    capturedAt: "2026-05-01T14:22:00Z",
    metadata: {
      provider: "open-quantum-safe/oqs-provider",
      note: "Fixture replay for predictable demos; live mode attempts real connection when enabled.",
    },
  },
} as const;

export const pqcScanFixtureRequest = {
  scenarioId: "bank-tls-inventory",
  useFixture: true,
} as const;

export const pqcScanFixtureResponse = {
  status: "success",
  scanId: "scan-84623480-dc42-430d-881a-d0e5cbaab4ed",
  scenario: pqcScenariosResponse.scenarios[0],
  scoreboard: {
    manual: {
      inventoryWeeks: 8,
      assetsFound: 42,
      quantumVulnerable: 38,
      readinessScore: 18,
      readinessBand: "critical",
      summary: "Spreadsheet inventory from Q1 is already stale; shadow APIs were missed.",
    },
    qtangl: {
      inventoryWeeks: 0,
      assetsFound: 7,
      quantumVulnerable: 7,
      readinessScore: 24,
      readinessBand: "critical",
      summary: "Fixture replay completed in seconds with signed evidence bundle.",
    },
  },
  assets: pqcInventoryResponse.inventory,
  handshakeProof: {
    mode: "replayed",
    kemAlgorithm: "ML-KEM-768",
    hybridGroup: "X25519MLKEM768",
    summary: pqcHandshakeTraceResponse.trace.summary,
  },
  mosca: {
    dataLifetimeYears: 10,
    quantumTimelineYears: 8,
    hndlRisk: "elevated",
    inequalityHolds: true,
    summary: "X + Y > Z under default assumptions — migration window is tight.",
  },
  remediationBacklog: [
    {
      id: "remediation-code-sign-legacy",
      assetId: "code-sign-legacy",
      priority: 1,
      title: "Migrate Release artifact code signing",
      action: "Migrate code/document signing to SLH-DSA (FIPS 205) per SP 800-208",
      deadline: "2030",
      effortDays: 90,
    },
  ],
} as const;

export const pqcScenarioResponseFields = [
  { name: "status", type: '"success"', required: true, description: "Operation result." },
  {
    name: "scenarios[]",
    type: "ScanScenario[]",
    required: true,
    description: "Demo scan personas with targets and manual baselines.",
  },
  { name: "scenarios[].id", type: "string", description: "Scenario slug for POST /pqc/scan." },
  { name: "scenarios[].target", type: "ScanTarget", description: "Default domain, ports, and persona." },
  {
    name: "scenarios[].manualBaseline",
    type: "ManualBaseline",
    description: "Spreadsheet-era baseline for scoreboard comparison.",
  },
  {
    name: "scenarios[].fixtureAssetIds",
    type: "string[]",
    description: "Asset ids included when useFixture is true.",
  },
] as const;
