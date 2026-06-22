export type LibraryTopic = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  heroImagePath: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
  relatedResourceSlugs: string[];
  cta: {
    href: string;
    label: string;
  };
};

export const libraryTopics: LibraryTopic[] = [
  {
    slug: "quantum-software-map",
    eyebrow: "Ecosystem map",
    title: "Quantum computing software in 2026: the open-source map",
    description:
      "A guided overview of the open-source quantum software ecosystem by job-to-be-done, not just by project name.",
    intro:
      "Most newcomers meet the ecosystem as a list of logos and acronyms. That is a bad way to learn it. A better map starts with the jobs the software is trying to do: teach the basics, build circuits, simulate behavior, optimize hard problems, compile to targets, or prepare systems for a post-quantum world.",
    heroImagePath: "/learn/topics/quantum-software-map.png",
    sections: [
      {
        title: "The ecosystem is really a stack of different jobs",
        body: [
          "General-purpose SDKs like Qiskit, Cirq, PennyLane, and ProjectQ help people write and run circuits. Simulators help people test ideas locally. Compiler and language projects sit between high-level code and backend constraints. Domain-specific tools bring in chemistry, optimization, photonics, or networking concerns that generic SDKs do not fully capture.",
          "Once you see the ecosystem this way, the project list becomes much easier to navigate. You stop asking which library is the winner and start asking which layer or workflow problem you are actually trying to solve.",
        ],
      },
      {
        title: "Categories matter more than brand familiarity",
        body: [
          "Beginners often recognize a few major brands and assume the rest of the ecosystem is just smaller alternatives. That is rarely true. Many of the most valuable projects are specialized tools built for a narrow but important job: error mitigation, annealing, pulse scheduling, photonics, circuit rewriting, or interactive learning.",
          "A good ecosystem map helps people avoid two mistakes at once: choosing a general SDK when they really need a specialized tool, and dismissing specialized tools because they do not look like full platforms.",
        ],
      },
      {
        title: "How to use this map",
        body: [
          "If you are new, begin with games, katas, and a major SDK. If you care about optimization, compare QUBO, QAOA, and annealing libraries next. If you care about chemistry, simulation, or PQC, go straight into those domain clusters instead of staying stuck in a generic starting stack.",
          "The point is not to memorize every repository. It is to build a mental model of where each tool belongs and what question it answers.",
        ],
      },
    ],
    relatedResourceSlugs: [
      "qiskit-qiskit",
      "xanaduai-pennylane",
      "quantumlib-cirq",
      "dwavesystems-dwave-ocean-sdk",
      "microsoft-quantumkatas",
      "open-quantum-safe-liboqs",
    ],
    cta: {
      href: "/learn/library",
      label: "Browse the full library",
    },
  },
  {
    slug: "start-writing-quantum-code",
    eyebrow: "Learning path",
    title: "How to start writing quantum code: an honest path",
    description:
      "A practical path from playful intuition-builders to serious frameworks, without pretending everyone should start in the same place.",
    intro:
      "The honest path into quantum coding does not begin with the biggest framework by default. It begins with what helps you understand the problem space fast enough to keep going: visual tools, structured exercises, and then a serious SDK once you are ready to work in code every day.",
    heroImagePath: "/learn/topics/start-writing-quantum-code.png",
    sections: [
      {
        title: "Start with intuition, not complexity",
        body: [
          "Tools like Quirk and Quantum Game reduce setup friction and let people build intuition quickly. They are not substitutes for full SDKs, but they are often better first steps because they make gates, superposition, and measurement feel tangible before the syntax gets heavy.",
          "If you skip this stage, it is easy to confuse unfamiliar syntax with deep understanding. Many people benefit from one fast visual layer before they touch a full framework.",
        ],
      },
      {
        title: "Use structured exercises before open-ended exploration",
        body: [
          "Quantum Katas is valuable because it behaves like a curriculum. It gives you deliberate practice, not just a pile of examples. That helps build confidence before you start comparing framework APIs and ecosystem choices.",
          "Once the basic vocabulary sticks, you can move into Qiskit, PennyLane, Cirq, or ProjectQ with a much clearer sense of what the abstractions are trying to express.",
        ],
      },
      {
        title: "Pick the first serious framework that matches how you think",
        body: [
          "If you want a broad Python ecosystem with lots of examples, Qiskit is a strong first serious framework. If hybrid workflows and differentiable programming interest you, PennyLane is compelling. If you want a contrasting circuit model and research flavor, Cirq is worth seeing early.",
          "The goal is not to pick the forever framework on day one. It is to get productive enough in one major stack that you can evaluate the others intelligently.",
        ],
      },
    ],
    relatedResourceSlugs: [
      "strilanc-quirk",
      "stared-quantum-game",
      "microsoft-quantumkatas",
      "qiskit-qiskit",
      "xanaduai-pennylane",
      "quantumlib-cirq",
    ],
    cta: {
      href: "/learn/library",
      label: "Compare beginner-friendly resources",
    },
  },
  {
    slug: "quantum-optimization-compared",
    eyebrow: "Optimization guide",
    title: "Quantum optimization libraries compared: QAOA, QUBO, and annealing",
    description:
      "A practical comparison of open-source tools for modeling and testing combinatorial optimization workflows.",
    intro:
      "Optimization is where many ambitious product claims meet hard implementation reality. The useful question is not whether one quantum method wins in the abstract. It is how different libraries help you model constrained problems, how much orchestration they require, and what kinds of workflows they actually support today.",
    heroImagePath: "/learn/topics/quantum-optimization-compared.png",
    sections: [
      {
        title: "QUBO is the modeling conversation",
        body: [
          "Libraries like qubovert and dimod matter because they keep the formulation layer visible. Before you care about a solver, you need a way to express binary decisions, penalties, and tradeoffs clearly enough to test and compare.",
          "That modeling layer is especially important for product-minded teams. A scheduling or routing workflow only becomes operationally useful when the constraint model is understandable enough to tune, validate, and explain.",
        ],
      },
      {
        title: "QAOA libraries expose the research workflow",
        body: [
          "Projects like OpenQAOA and Qiskit Optimization help people inspect what a QAOA-flavored workflow actually looks like in software. That matters because many claims about quantum optimization sound impressive until you look at the bounded problem sizes, optimizer loops, and simulator assumptions involved.",
          "These libraries are valuable even when they do not beat classical baselines on the problems that matter commercially. They make the research path legible and comparable.",
        ],
      },
      {
        title: "Annealing stacks show the surrounding software burden",
        body: [
          "D-Wave-oriented tooling such as Ocean, dimod, qbsolv, and related utilities is useful because it reveals how much practical software surrounds an optimization workflow: samplers, embeddings, decomposition, cloud access, and orchestration.",
          "That is one of the strongest lessons for product builders. The solver story is never the whole product story. The surrounding stack often determines whether the workflow is usable.",
        ],
      },
      {
        title: "Why this matters to Qtangl",
        body: [
          "Qtangl is ultimately an operational planning product, so it has to stay honest about where classical baselines win and where bounded quantum research paths may still be worth exploring. These libraries form the real comparison set for that honesty.",
          "A useful product does not need to overstate the quantum step. It needs to model the problem well, orchestrate experiments carefully, and return a plan people can act on.",
        ],
      },
    ],
    relatedResourceSlugs: [
      "entropicalabs-openqaoa",
      "jtiosue-qubovert",
      "dwavesystems-dimod",
      "dwavesystems-qbsolv",
      "qiskit-qiskit-optimization",
      "dwavesystems-dwave-ocean-sdk",
    ],
    cta: {
      href: "/technology",
      label: "See Qtangl's hybrid stack",
    },
  },
  {
    slug: "quantum-simulators-guide",
    eyebrow: "Simulator guide",
    title: "Open-source quantum simulators: what each one is good at",
    description:
      "A comparison guide for developers choosing between simulation styles, tradeoffs, and intended workloads.",
    intro:
      "Not all simulators are trying to do the same thing. Some aim for broad generality. Others are optimized for stabilizer circuits, noise studies, tensor-network workloads, or raw performance. A useful comparison starts with intended workload, not with benchmark bravado.",
    heroImagePath: "/learn/topics/quantum-simulators-guide.png",
    sections: [
      {
        title: "General simulation versus specialized simulation",
        body: [
          "Qiskit Aer and similar projects are useful as broad simulation layers inside larger SDKs. Specialized tools like Stim matter for a different reason: they do one class of workload extremely well. That difference is important because it changes how you should compare them.",
          "A broad simulator can be the right default when you are already inside a major ecosystem. A specialized simulator can be the right choice when the workload is narrow, repeated, and performance-sensitive.",
        ],
      },
      {
        title: "Performance claims only matter in context",
        body: [
          "When a simulator project advertises speed, the first question should be: speed on what kind of circuit, with what assumptions, and for which audience? That is why comparing state-vector, stabilizer, and other simulation approaches directly can be misleading without context.",
          "A good ecosystem map helps readers line up the simulator with the kind of question they are asking rather than chasing generic performance language.",
        ],
      },
      {
        title: "What to choose first",
        body: [
          "If you are already using a major framework, start with its native simulator path so you can move faster. If you care about error-correction workloads, look at Stim early. If you care about broader simulator variety or performance experimentation, compare QuEST, qrack, qpp, and ddsim.",
          "The right simulator is the one that matches the job, not the one with the loudest headline.",
        ],
      },
    ],
    relatedResourceSlugs: [
      "qiskit-qiskit-aer",
      "quantumlib-stim",
      "aniabrown-quest",
      "vm6502q-qrack",
      "softwareqinc-qpp",
      "cda-tum-mqt-ddsim",
    ],
    cta: {
      href: "/learn/category/simulators",
      label: "Explore simulator resources",
    },
  },
  {
    slug: "quantum-chemistry-for-newcomers",
    eyebrow: "Chemistry guide",
    title: "Quantum chemistry software for newcomers",
    description:
      "A field guide to the chemistry-focused projects most often cited when people talk about practical quantum use cases.",
    intro:
      "Quantum chemistry is one of the clearest application areas in the ecosystem, but it can be intimidating because the software introduces domain-specific concepts immediately. The easiest way in is to understand that chemistry projects are not just general SDKs with extra demos. They bring their own problem representations, transforms, and evaluation loops.",
    heroImagePath: "/learn/topics/quantum-chemistry-for-newcomers.png",
    sections: [
      {
        title: "The chemistry layer sits above the circuit layer",
        body: [
          "OpenFermion, Tequila, Qiskit Nature, Tangelo, and related tools show how chemistry workflows add domain structure on top of general circuit programming. They help readers see how molecular problems are represented, transformed, and evaluated in code before hardware ever enters the picture.",
          "That is why domain libraries matter. They answer questions a generic SDK does not answer on its own.",
        ],
      },
      {
        title: "Why this category stays important",
        body: [
          "Chemistry remains one of the application areas people cite most often when trying to explain why quantum computing could matter. Whether or not every claim survives contact with hardware limits, the software in this category shows what serious domain-oriented quantum workflows look like today.",
          "It is a good counterweight to ecosystem summaries that stay too close to abstract circuit tutorials.",
        ],
      },
      {
        title: "How to approach the category",
        body: [
          "Start with one domain tool and one general framework, not five domain tools at once. That makes it easier to separate domain concepts from framework conventions. OpenFermion and Tequila are both strong educational anchors because they make the domain layer easier to inspect.",
          "The goal is not to master chemistry immediately. It is to understand how domain software changes the structure of a quantum workflow.",
        ],
      },
    ],
    relatedResourceSlugs: [
      "quantumlib-openfermion",
      "aspuru-guzik-group-tequila",
      "qiskit-qiskit-nature",
      "goodchemistryco-tangelo",
      "projectq-framework-fermilib",
    ],
    cta: {
      href: "/learn/category/quantum-chemistry",
      label: "Explore chemistry resources",
    },
  },
  {
    slug: "post-quantum-crypto-libraries",
    eyebrow: "PQC guide",
    title: "Post-quantum cryptography libraries you can use today",
    description:
      "A practical overview of open-source PQC libraries and why they belong in the broader quantum software conversation.",
    intro:
      "Post-quantum cryptography is different from writing quantum circuits, but it belongs in the same ecosystem map because it is one of the most practical ways organizations respond to the long-term consequences of quantum progress. These libraries help make that response tangible.",
    heroImagePath: "/learn/topics/post-quantum-crypto-libraries.png",
    sections: [
      {
        title: "Why PQC belongs in this library",
        body: [
          "A strong educational hub should make it obvious that quantum-adjacent software is not all one thing. PQC projects live on the security side of the field, not the circuit-programming side, yet they are among the most practical and deployable resources linked to quantum risk.",
          "That makes them educationally important. They help readers build a more accurate picture of what action in this field looks like right now.",
        ],
      },
      {
        title: "Reference implementations versus integrations",
        body: [
          "Projects like liboqs and PQClean help people inspect implementations and algorithm support more directly. Integrations like the OpenSSL and OpenSSH ports help people see how these ideas move closer to real systems and familiar operational surfaces.",
          "That distinction matters because it changes what the reader should expect from each project. Some are better for evaluation and research. Others are better for understanding how adoption could look in practice.",
        ],
      },
      {
        title: "How to use the category well",
        body: [
          "If you are new, start with liboqs because it anchors the conversation. Then look at PQClean for additional implementation context and the OpenSSL or OpenSSH ports to understand integration pressure. That gives you a clean sequence from algorithms to systems.",
          "The category is worth learning because it is one of the clearest examples of quantum-related software that matters today, not only in a future research setting.",
        ],
      },
    ],
    relatedResourceSlugs: [
      "open-quantum-safe-liboqs",
      "pqclean-pqclean",
      "open-quantum-safe-openssl",
      "open-quantum-safe-openssh-portable",
      "theqrl-qrl",
    ],
    cta: {
      href: "/learn/category/post-quantum-crypto",
      label: "Explore PQC resources",
    },
  },
  {
    slug: "pqc-readiness",
    eyebrow: "Readiness",
    title: "Post-quantum cryptography readiness",
    description: "From inventory to Monitor — how teams prepare for Q-Day with evidence.",
    intro:
      "Post-quantum readiness is not a single tool purchase. It is a program: baseline inventory, HNDL quantification, framework-mapped evidence, scheduled re-scans, and remediation proof.",
    heroImagePath: "/learn/topics/hndl-risk.svg",
    sections: [
      {
        title: "Inventory before migration",
        body: [
          "You cannot migrate what you have not inventoried. Start with TLS endpoints, JWKS, SSH, STARTTLS, and third-party dependencies — then map findings to NSM-10, CMMC, or NIST IR 8547 tiers.",
          "Start with the foundations curriculum at /learn/topics/quantum-crypto-foundations and the 4-week path at /blog/learning-quantum-crypto-4-week-path.",
        ],
      },
      {
        title: "Quantify HNDL exposure",
        body: [
          "Use Mosca inequality (X + Y > Z) to determine whether ciphertext captured today may be readable before migration finishes. The HNDL hub at /q-day/hndl includes an interactive exposure estimator.",
        ],
      },
      {
        title: "Assess → Monitor → Convert",
        body: [
          "Assess delivers baseline CBOM and signed PDF. Monitor catches crypto drift between audit cycles. Convert attaches re-scan proof to remediation items. See /journey for the full maturity model.",
        ],
      },
    ],
    relatedResourceSlugs: ["open-quantum-safe-liboqs", "pqclean-pqclean"],
    cta: { href: "/assess/mini", label: "Free mini-assessment" },
  },
  {
    slug: "cbom-inventory",
    eyebrow: "CBOM",
    title: "Cryptographic bill of materials",
    description: "CycloneDX CBOM exports for GRC and CMDB integration.",
    intro:
      "A Crypto Bill of Materials lists algorithms, keys, and certificates in machine-readable form. Export from Qtangl scans or study sample CBOM structure before integrating with ServiceNow or Archer.",
    heroImagePath: "/learn/topics/post-quantum-crypto-libraries.png",
    sections: [
      {
        title: "Machine-readable inventory",
        body: [
          "CBOM beats spreadsheets for audit cycles. Download the sample at /samples/sample-cbom-bank-tls-inventory.json and read the field guide at /blog/reading-qtangl-cbom-export.",
        ],
      },
    ],
    relatedResourceSlugs: ["open-quantum-safe-liboqs"],
    cta: { href: "/q-day/cbom", label: "CBOM guide" },
  },
  {
    slug: "hndl-risk",
    eyebrow: "HNDL",
    title: "Harvest-now-decrypt-later risk",
    description: "Why long-lived data faces exposure before Q-Day arrives.",
    intro:
      "HNDL means adversaries capture ciphertext today and decrypt it after quantum computers mature. Healthcare, finance, and government data with decades of shelf-life are highest risk — even while today's crypto still works.",
    heroImagePath: "/learn/topics/hndl-risk.svg",
    sections: [
      {
        title: "How ciphertext gets copied",
        body: [
          "Breach exfiltration, backups and archives, cloud misconfiguration, and bulk network collection are the dominant paths. Adversaries do not need to break RSA today — copying is faster than cryptanalysis.",
          "See /blog/video-companion-hndl-jeremy-allison, /blog/hndl-collection-vectors-deep-dive, and /blog/how-encrypted-data-is-harvested.",
        ],
      },
      {
        title: "Mosca inequality",
        body: [
          "When data shelf-life (X) plus migration time (Y) exceeds the quantum timeline (Z), you have HNDL exposure now. Healthcare payers often see X = 30–50 years with Y = 5–10 years.",
          "Use the Mosca calculator at /q-day/mosca-inequality or the vertical exposure estimator at /q-day/hndl.",
        ],
      },
      {
        title: "Shelf-life by vertical",
        body: [
          "Healthcare: 30–50 years. Government: 15–50 years. Banking: 7–25 years. SaaS: 1–7 years for transit; watch archives.",
          "Framework guides: /q-day/frameworks/hipaa-hndl, banking-hndl, and gov-hndl.",
        ],
      },
      {
        title: "What to do this quarter",
        body: [
          "Run cryptographic inventory, tag findings by shelf-life tier, pilot hybrid TLS, and export CBOM for GRC. Start with the free mini-assessment at /assess/mini.",
        ],
      },
    ],
    relatedResourceSlugs: ["open-quantum-safe-liboqs", "pqclean-pqclean"],
    cta: { href: "/q-day/hndl", label: "HNDL hub" },
  },
  {
    slug: "ml-kem-deployment",
    eyebrow: "ML-KEM",
    title: "Deploying ML-KEM in TLS",
    description: "Hybrid TLS migration with FIPS 203 ML-KEM and handshake proof.",
    intro:
      "FIPS 203 standardizes ML-KEM for key encapsulation. Hybrid deployment combines classical and post-quantum key exchange for incremental migration.",
    heroImagePath: "/learn/topics/post-quantum-crypto-libraries.png",
    sections: [
      {
        title: "Hybrid first",
        body: [
          "Pilot hybrid TLS on non-production paths, then expand. Qtangl captures handshake proof traces for auditor review.",
          "Watch /blog/video-companion-kyber-dilithium-menezes and read /blog/nist-fips-203-204-205-primer before deploying.",
        ],
      },
    ],
    relatedResourceSlugs: ["open-quantum-safe-liboqs", "open-quantum-safe-openssl"],
    cta: { href: "/q-day/frameworks/ml-kem", label: "ML-KEM guide" },
  },
  {
    slug: "quantum-crypto-foundations",
    eyebrow: "Foundations",
    title: "Quantum cryptography foundations: from Shor's to PQC",
    description:
      "Five-layer curriculum — threat, HNDL, NIST standards, migration, and evidence — with embedded videos and authoritative links.",
    intro:
      "Whether you are a CISO, security engineer, or curious developer, this guide sequences the best explainers and NIST references into a coherent learning path. Each layer links to video companions on our blog (with embedded YouTube players) and open-source PQC libraries in the Learn catalog.",
    heroImagePath: "/learn/topics/quantum-crypto-foundations.png",
    sections: [
      {
        title: "Layer 1 — Why quantum breaks RSA and ECC",
        body: [
          "Watch: /blog/video-companion-shors-algorithm-minutephysics and /blog/video-companion-quantum-power-veritasium. Read: /blog/shors-algorithm-explained-for-cisos and NIST's PQC overview at nist.gov/pqc.",
          "Checkpoint: Can you explain why Shor's breaks RSA but AES-256 mostly survives?",
        ],
      },
      {
        title: "Layer 2 — Harvest now, decrypt later",
        body: [
          "Watch: /blog/video-companion-hndl-jeremy-allison and /blog/video-companion-mosca-intel-quantum-security. Read: /blog/mosca-inequality-worked-examples and the HNDL hub at /q-day/hndl.",
          "Checkpoint: Apply X + Y > Z to one data class with the Mosca calculator.",
        ],
      },
      {
        title: "Layer 3 — NIST PQC standards",
        body: [
          "Watch: /blog/video-companion-pq-algorithms-nist and /blog/video-companion-kyber-dilithium-menezes. Read: /blog/nist-fips-203-204-205-primer and /q-day/frameworks/ml-kem.",
          "Checkpoint: Name ML-KEM, ML-DSA, and SLH-DSA and what each replaces.",
        ],
      },
      {
        title: "Layer 4 — Migration in practice",
        body: [
          "Watch: /blog/video-companion-dustin-moody-nist-strategy and /blog/video-companion-cisa-quantum-readiness. Read: /blog/hybrid-tls-migration-guide and /blog/pqc-migration-phases-explained.",
          "Checkpoint: Describe hybrid TLS and list three non-HTTPS crypto locations.",
        ],
      },
      {
        title: "Layer 5 — Crypto agility and evidence",
        body: [
          "Read: /blog/crypto-attack-surface-map, /blog/qkd-vs-post-quantum-cryptography, and /blog/reading-qtangl-cbom-export. Download: /downloads/quantum-crypto-learning-guide.md.",
          "Checkpoint: Explain what a CBOM is and why re-scan proof matters.",
        ],
      },
    ],
    relatedResourceSlugs: [
      "open-quantum-safe-liboqs",
      "open-quantum-safe-openssl",
      "pqclean-pqclean",
    ],
    cta: { href: "/learn/quantum-crypto", label: "Open learning hub" },
  },
] as const;

export const libraryTopicTeasers = libraryTopics.map((topic) => ({
  slug: topic.slug,
  title: topic.title,
  description: topic.description,
}));
