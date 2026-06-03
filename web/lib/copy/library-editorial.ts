export type LibraryEditorialEntry = {
  summary?: string;
  description?: string;
  whatItIs?: string[];
  whoItsFor?: string;
  whatYouCanBuild?: string[];
  qtanglRelevance?: string;
  lastVerifiedAt?: string;
  verifiedBy?: string;
};

export const libraryEditorial: Record<string, LibraryEditorialEntry> = {
  "qiskit-qiskit": {
    summary:
      "Qiskit is one of the central Python ecosystems for building, transpiling, simulating, and running quantum circuits across education, research, and production-adjacent workflows.",
    description:
      "Qiskit is a major Python ecosystem for building circuits, running primitives, and understanding how quantum software is organized in practice.",
    whatItIs: [
      "Qiskit is often the first serious SDK people encounter because it covers a wide range of developer needs: circuit authoring, operator tooling, transpilation, runtime integrations, tutorials, and a large surrounding ecosystem of application-layer packages.",
      "It matters less as a single library than as a reference point for how a mature quantum software stack is structured. If you want to understand the language, abstractions, and ergonomics that shape much of the broader ecosystem, Qiskit is one of the clearest places to start.",
    ],
    whoItsFor:
      "Developers, educators, and researchers who want a broad Python entry point into practical quantum programming and a large community around it.",
    whatYouCanBuild: [
      "Prototype circuits, transpilation flows, and primitive-based workloads in Python.",
      "Understand how a mature quantum SDK organizes execution, optimization, and ecosystem packages.",
      "Compare gate-model tooling against other major stacks like Cirq or PennyLane.",
    ],
    qtanglRelevance:
      "Qtangl's optimization story intersects with Qiskit where modeling, transpilation, and hybrid experimentation meet. Even when Qtangl stays operationally honest and classical-first, Qiskit remains an important reference point for how QAOA-flavored experiments, optimization packages, and simulator-backed research workflows are actually assembled.",
  },
  "xanaduai-pennylane": {
    summary:
      "PennyLane is a widely used framework for hybrid quantum-classical workflows, especially where differentiable programming and multi-backend experimentation matter.",
    description:
      "PennyLane is a hybrid quantum-classical framework that stands out for differentiable programming, plugin flexibility, and strong cross-domain appeal.",
    whatItIs: [
      "PennyLane sits at an interesting intersection: it is approachable enough for newcomers, serious enough for research workflows, and flexible enough to connect quantum circuits to classical optimization and machine-learning tooling.",
      "That makes it valuable even beyond pure quantum ML. It is one of the clearest examples of a framework built around hybrid execution instead of treating quantum hardware as an isolated destination.",
    ],
    whoItsFor:
      "Developers and researchers who care about hybrid workflows, differentiable programming, and the ability to move across backends without rewriting everything.",
    whatYouCanBuild: [
      "Prototype variational and hybrid workflows that combine quantum circuits with classical optimization loops.",
      "Compare plugins, devices, and backend integrations through one framework.",
      "Learn how one major ecosystem thinks about hybrid execution as a first-class idea.",
    ],
    qtanglRelevance:
      "Qtangl is not a quantum ML product, but PennyLane is still useful because it embodies a pragmatic hybrid mindset. It is a good reference for how classical optimization, bounded quantum experimentation, and developer-facing abstractions can coexist inside one readable workflow.",
  },
  "quantumlib-cirq": {
    lastVerifiedAt: "2026-05-27",
    verifiedBy: "Qtangl",
    summary:
      "Cirq is a major Python framework for circuit design, simulation, and research workflows, with a strong emphasis on circuit structure and hardware-aware experimentation.",
    description:
      "Cirq is a major framework for building and simulating circuits with a flavor that often feels closer to research and device-aware experimentation.",
    whatItIs: [
      "Cirq is one of the core reference ecosystems in quantum software. For many developers, it offers a useful contrast to Qiskit because it highlights a different style of circuit construction, decomposition, and hardware-aware workflow design.",
      "Understanding Cirq helps readers see that the ecosystem is not monolithic. Major SDKs solve similar problems with noticeably different abstractions, conventions, and strengths.",
    ],
    whoItsFor:
      "Developers and researchers who want to compare major gate-model frameworks and understand device-aware circuit workflows.",
    whatYouCanBuild: [
      "Prototype circuits and simulation workloads in a major Python framework.",
      "Compare circuit abstractions and decomposition strategies against Qiskit or PennyLane.",
      "Learn how hardware-aware research code is often structured.",
    ],
  },
  "quantumlib-stim": {
    summary:
      "Stim is a high-performance simulator focused on stabilizer circuits and error-correction workloads, and it is one of the clearest examples of a specialized tool doing one job extremely well.",
    description:
      "Stim is a fast, specialized simulator that matters most when you care about stabilizer circuits, noise analysis, and error-correction workflows.",
    whatItIs: [
      "Stim is not trying to be a general-purpose everything framework. Its value comes from being focused, fast, and explicit about the kinds of circuits and analyses it is built to support.",
      "That specialization makes it especially useful for readers mapping the ecosystem. It shows how much serious quantum software is organized around a narrow but important workload instead of around a general beginner experience.",
    ],
    whoItsFor:
      "Researchers and advanced developers working on stabilizer simulation, noise analysis, or error-correction-adjacent workloads.",
    whatYouCanBuild: [
      "Benchmark specialized simulation workflows against broader-purpose tools.",
      "Understand how error-correction-oriented tooling differs from general circuit SDKs.",
      "Learn where performance specialization matters in the ecosystem.",
    ],
  },
  "aws-amazon-braket-sdk-python": {
    summary:
      "The Amazon Braket SDK is a cloud-facing Python entry point for running quantum workflows across managed services and provider integrations.",
    description:
      "Amazon Braket matters as a provider-facing SDK and as a window into how cloud quantum access is packaged for developers.",
    whatItIs: [
      "Braket is useful because it exposes the cloud layer of the ecosystem: job submission, managed runtimes, provider abstraction, and the operational realities of working through a hosted platform instead of a purely local SDK.",
      "For readers mapping the landscape, it helps answer a practical question: what changes when quantum development moves from a local notebook or simulator into a provider-managed workflow?",
    ],
    whoItsFor:
      "Developers evaluating managed quantum services, provider integrations, or cloud-based experimentation paths.",
    whatYouCanBuild: [
      "Compare cloud access patterns against local SDK-only workflows.",
      "Understand how provider abstraction and runtime orchestration are exposed in code.",
      "See how managed services fit into a broader hybrid stack.",
    ],
    qtanglRelevance:
      "Qtangl's product value is not tied to any single provider, but Braket matters because it shows how hybrid experiments and backend access can be operationalized behind a stable developer surface. That is useful context whenever Qtangl evaluates where provider-hosted quantum steps might fit into a future bounded research band.",
  },
  "dwavesystems-dwave-ocean-sdk": {
    summary:
      "D-Wave Ocean is the anchor ecosystem for D-Wave-style annealing workflows, bundling modeling, samplers, embeddings, and surrounding utilities into one stack.",
    description:
      "Ocean is the most important umbrella to understand if you want a real picture of the annealing and Ising-tooling ecosystem.",
    whatItIs: [
      "Ocean is not just one library. It is the collection point for a family of tools that make annealing-oriented workflows usable in practice, from problem modeling and embeddings to samplers and cloud access.",
      "That makes it especially valuable for education and comparison. Instead of talking about annealing in the abstract, readers can inspect the actual software layers needed to make an annealing workflow real.",
    ],
    whoItsFor:
      "Developers exploring Ising-model formulations, D-Wave tooling, or the practical software around annealing workflows.",
    whatYouCanBuild: [
      "Model optimization workloads in an annealing-oriented ecosystem.",
      "Understand how samplers, embeddings, and utilities fit together in practice.",
      "Compare annealing stacks against gate-model optimization workflows.",
    ],
    qtanglRelevance:
      "Ocean is directly relevant to Qtangl because it shows what a real optimization-focused ecosystem looks like when modeling, embeddings, and solver selection all matter. Even if Qtangl stays classical-dominant today, this family of tools is part of the honest comparison set for QUBO and planning-style workloads.",
  },
  "dwavesystems-dimod": {
    summary:
      "dimod is one of the most important modeling libraries in the annealing ecosystem because it gives developers a practical way to express binary quadratic and related optimization models.",
    description:
      "dimod matters because it sits close to the modeling core of annealing-style optimization workflows.",
    whatItIs: [
      "For many readers, dimod is more important than the headline platform name because it exposes the modeling layer directly. It helps make optimization problems concrete in software instead of leaving them as abstract references to Ising or QUBO formulations.",
      "That is why dimod is useful in an educational library. It helps people understand how planning-style problems are encoded before any sampler, solver, or backend gets involved.",
    ],
    whoItsFor:
      "Developers who want to understand how optimization problems get modeled in practice before they worry about solver choice.",
    whatYouCanBuild: [
      "Represent QUBO and related formulations in code.",
      "Inspect the modeling layer behind annealing-style optimization workflows.",
      "Compare input-model ergonomics across optimization ecosystems.",
    ],
    qtanglRelevance:
      "dimod is highly relevant to Qtangl because the product lives or dies at the modeling layer. Scheduling, routing, and allocation workflows become usable only when their hard constraints can be represented cleanly, and dimod is a strong reference point for how that layer can be exposed to developers.",
  },
  "dwavesystems-qbsolv": {
    summary:
      "qbsolv is a well-known name in QUBO workflows because it reflects the reality that many optimization problems need decomposition or heuristic handling beyond a single clean solve step.",
    description:
      "qbsolv is useful because it points directly at a practical truth: hard optimization problems often need decomposition, heuristics, and compromise.",
    whatItIs: [
      "Even where the tooling has aged, qbsolv remains educationally valuable because it represents a class of workflow rather than just a single package. It helps readers understand that optimization stacks often rely on decomposition strategies and orchestration around the solver, not just the solver itself.",
      "That makes qbsolv a strong fit for a library like this one. It is less about memorizing one package name and more about recognizing a recurring architectural pattern in practical optimization software.",
    ],
    whoItsFor:
      "Developers comparing optimization workflows and trying to understand why orchestration and decomposition matter.",
    whatYouCanBuild: [
      "Study decomposition-oriented approaches to hard optimization problems.",
      "Compare heuristic and solver-orchestration patterns across ecosystems.",
      "Understand why one-shot idealized solves are often not the full story.",
    ],
    qtanglRelevance:
      "qbsolv is relevant to Qtangl because it reinforces the idea that orchestration matters as much as raw solver branding. Qtangl's hybrid story is ultimately about deciding what to preprocess classically, what to hand to a bounded research path, and what to post-process for execution. qbsolv is a reminder that this orchestration layer is where much of the product value lives.",
  },
  "microsoft-quantumkatas": {
    summary:
      "Quantum Katas is one of the strongest structured learning resources in the ecosystem for people who want guided practice instead of scattered examples.",
    description:
      "Quantum Katas stands out because it is a curriculum, not just a codebase.",
    whatItIs: [
      "Many repositories teach by example and expect the reader to infer the lesson. Quantum Katas is more deliberate. It gives people exercises, progression, and practice loops that make it easier to build intuition before they jump into larger frameworks.",
      "That makes it especially valuable for a learn section. It addresses a real audience need: people who are not choosing production tooling yet, but still want a serious path into the subject.",
    ],
    whoItsFor:
      "Beginners, educators, and self-directed learners who want structured practice rather than a loose pile of demos.",
    whatYouCanBuild: [
      "Build intuition for core quantum concepts through guided exercises.",
      "Use the resource as an onboarding path before moving into larger SDKs.",
      "Compare curriculum-style teaching with more exploratory learning tools.",
    ],
  },
  "unitaryfund-mitiq": {
    summary:
      "Mitiq is a focused library for error mitigation workflows and an important example of tooling built around the noisy, near-term reality of quantum computation.",
    description:
      "Mitiq matters because it centers noise-aware execution instead of pretending idealized circuits are the whole story.",
    whatItIs: [
      "Mitiq helps readers understand that useful quantum software often lives between theory and execution. It is not just about building a circuit; it is also about dealing with the quality of the result you get back.",
      "As a category-defining tool, it shows how the ecosystem has produced specialized software for practical constraints rather than waiting for perfect hardware conditions.",
    ],
    whoItsFor:
      "Researchers and advanced developers working with noisy workflows or evaluating mitigation techniques.",
    whatYouCanBuild: [
      "Inspect how mitigation workflows wrap around existing circuit execution paths.",
      "Compare mitigation-minded software with idealized tutorial stacks.",
      "Learn where practical noise handling sits in the ecosystem.",
    ],
  },
  "quantumlib-openfermion": {
    summary:
      "OpenFermion is one of the best-known chemistry-oriented projects in quantum software and a common reference point for mapping molecular problems into quantum-friendly representations.",
    description:
      "OpenFermion matters because it makes chemistry-oriented quantum workflows concrete instead of hand-wavy.",
    whatItIs: [
      "For readers new to chemistry use cases, OpenFermion helps answer an important question: what does a real domain-specific quantum software stack look like once you move past general circuit tutorials?",
      "It also helps clarify that the ecosystem is shaped by application domains as much as by core SDKs. Chemistry projects carry their own data models, transformations, and evaluation loops.",
    ],
    whoItsFor:
      "Researchers, students, and curious developers exploring chemistry-focused quantum workflows.",
    whatYouCanBuild: [
      "See how chemistry problems are represented and transformed in code.",
      "Understand the domain layer above raw circuit tooling.",
      "Compare chemistry workflows across multiple ecosystems.",
    ],
  },
  "xanaduai-strawberryfields": {
    summary:
      "Strawberry Fields is one of the flagship photonics projects and a strong entry point for readers who want to understand optical quantum computing software.",
    description:
      "Strawberry Fields matters because it opens a different branch of the ecosystem than the usual gate-model story.",
    whatItIs: [
      "Many newcomers assume the ecosystem is basically a contest among a few circuit frameworks. Strawberry Fields is a useful corrective because it shows a mature, domain-specific stack built around photonic ideas, representations, and workflows.",
      "That makes it educationally valuable whether or not the reader plans to work in photonics directly. It broadens the mental map of what quantum software can look like.",
    ],
    whoItsFor:
      "Readers exploring photonic computing, optical models, or ecosystem breadth beyond the most common gate-model stacks.",
    whatYouCanBuild: [
      "Understand photonic circuit concepts and software abstractions.",
      "Compare optical workflows with gate-model frameworks.",
      "Use the project as a reference point for a different branch of the ecosystem.",
    ],
  },
  "strilanc-quirk": {
    summary:
      "Quirk is one of the most approachable browser-based tools for building intuition about circuits, gates, and measurement through direct visual feedback.",
    description:
      "Quirk matters because it turns abstract circuit behavior into something people can manipulate immediately in the browser.",
    whatItIs: [
      "Quirk is not where most production code begins, but it is where a lot of intuition can begin. Its real value is pedagogical speed: readers can see how gates compose and how measurement changes outcomes without first setting up a full local environment.",
      "That makes it a strong bridge resource. It sits between playful learning and more serious SDK work, which is exactly the kind of handoff a learn section should support.",
    ],
    whoItsFor:
      "Beginners, educators, and developers who want fast visual intuition before they move into code-heavy frameworks.",
    whatYouCanBuild: [
      "Explore circuits visually in the browser.",
      "Use the tool as a teaching bridge into full SDKs.",
      "Build intuition around gates, composition, and measurement.",
    ],
  },
  "stared-quantum-game": {
    summary:
      "Quantum Game is a memorable educational resource because it turns quantum ideas into interactive play rather than a wall of notation or setup steps.",
    description:
      "Quantum Game matters as a public-facing teaching tool that lowers the barrier to curiosity.",
    whatItIs: [
      "Projects like Quantum Game matter because they invite people into the subject who might never start with an SDK, research paper, or API. That makes them valuable discovery and onboarding assets for the ecosystem as a whole.",
      "They also give teams a reminder that educational content does not need to feel academic to be useful. Sometimes the best first step is an interaction that makes the concepts feel tangible.",
    ],
    whoItsFor:
      "Curious newcomers, teachers, and anyone who wants a low-friction first contact with core quantum ideas.",
    whatYouCanBuild: [
      "Use the project as an onboarding step before more formal learning paths.",
      "See how interactive design can make quantum concepts feel concrete.",
      "Compare playful educational resources with curriculum-style ones like Quantum Katas.",
    ],
  },
  "cqcl-tket": {
    summary:
      "TKET is a prominent compiler and transpilation stack that matters most when circuit transformation quality and cross-backend execution become serious concerns.",
    description:
      "TKET matters because it highlights the compiler layer of the ecosystem rather than only the front-end SDK experience.",
    whatItIs: [
      "A lot of ecosystem conversation happens at the circuit authoring layer, but TKET reminds readers that compilation quality, transformation strategy, and target-aware optimization are major parts of practical quantum software.",
      "That makes it a useful anchor for people trying to understand what sits between a high-level circuit and a backend that can actually run it.",
    ],
    whoItsFor:
      "Developers and researchers who care about compilation, circuit optimization, and cross-backend portability.",
    whatYouCanBuild: [
      "Study how transpilation and compilation layers shape final execution quality.",
      "Compare front-end SDK ergonomics with compiler-focused tooling.",
      "Understand where compiler infrastructure fits in a broader stack.",
    ],
    qtanglRelevance:
      "TKET matters to Qtangl less as a direct optimization modeler and more as a reminder that backend-facing transformation layers are real product concerns. If Qtangl ever broadens how it packages bounded quantum experiments, compiler quality and target-awareness will be part of that operational story.",
  },
  "nvidia-cuda-quantum": {
    summary:
      "CUDA Quantum stands out as a modern attempt to connect quantum workflows to a broader high-performance and accelerated computing context.",
    description:
      "CUDA Quantum matters because it frames quantum software inside a larger performance-computing ecosystem instead of isolating it.",
    whatItIs: [
      "This makes CUDA Quantum useful beyond brand recognition. It lets readers see how one modern platform positions quantum workflows alongside simulation, hardware acceleration, and production-minded developer tooling.",
      "For an ecosystem map, that perspective is valuable because it shows how quantum tooling is increasingly packaged as part of wider compute narratives rather than as a standalone niche.",
    ],
    whoItsFor:
      "Developers interested in performance-minded tooling, accelerated simulation, or how quantum workflows fit into broader compute platforms.",
    whatYouCanBuild: [
      "Compare modern platform packaging against older standalone quantum SDKs.",
      "Understand how accelerated computing narratives intersect with quantum tooling.",
      "Evaluate whether the platform feels research-first, performance-first, or product-first.",
    ],
  },
  "aspuru-guzik-group-tequila": {
    summary:
      "Tequila is a chemistry- and optimization-friendly framework for building variational workflows, and it often surfaces in discussions of practical hybrid experimentation.",
    description:
      "Tequila matters because it shows a thoughtful hybrid workflow style instead of just a raw SDK surface.",
    whatItIs: [
      "Tequila is especially useful for readers who want to understand how domain problems, ansatze, optimizers, and execution loops come together inside one workflow. It makes the hybrid structure more visible than many lower-level tools do.",
      "That makes it a strong educational bridge between chemistry, optimization, and variational programming patterns.",
    ],
    whoItsFor:
      "Researchers and advanced developers exploring variational, chemistry-oriented, or hybrid optimization workflows.",
    whatYouCanBuild: [
      "Study how variational workflows are assembled in practice.",
      "Compare hybrid orchestration patterns across domain-focused libraries.",
      "Use the framework as a bridge between chemistry and optimization conversations.",
    ],
  },
  "quantumbfs-yao-jl": {
    summary:
      "Yao.jl is a major Julia-based framework and a good reminder that the quantum ecosystem is broader than the Python-first view many newcomers start with.",
    description:
      "Yao.jl matters because it offers a serious framework experience in Julia and broadens the language map of the ecosystem.",
    whatItIs: [
      "A lot of ecosystem summaries quietly collapse into a handful of Python stacks. Yao.jl is useful because it keeps that picture honest and shows how another language community approaches quantum software design and performance concerns.",
      "That makes it valuable both for Julia users specifically and for anyone trying to understand how diverse the tooling landscape really is.",
    ],
    whoItsFor:
      "Julia developers and readers who want a more complete picture of the ecosystem beyond Python-heavy stacks.",
    whatYouCanBuild: [
      "Compare a major Julia framework with Python alternatives.",
      "Understand how language choice can shape framework design.",
      "Use the project as a reference for non-Python ecosystem maturity.",
    ],
  },
  "quantomatic-pyzx": {
    summary:
      "PyZX is a specialized but influential tool for circuit rewriting and ZX-calculus-inspired optimization, making it a useful example of deeper compiler and simplification tooling.",
    description:
      "PyZX matters because it exposes a more formal rewriting and optimization layer than most beginner-facing tools do.",
    whatItIs: [
      "PyZX is valuable in an educational library because it shows what the ecosystem looks like once you move past surface-level circuit authoring and start caring about structural rewrites, simplification, and representation theory.",
      "It is not the universal starting point, but it is exactly the kind of specialized tool that helps advanced readers understand how rich the compiler side of the ecosystem has become.",
    ],
    whoItsFor:
      "Advanced developers, compiler-minded readers, and researchers interested in circuit simplification and formal rewriting techniques.",
    whatYouCanBuild: [
      "Study circuit rewriting and optimization beyond standard transpiler passes.",
      "Understand how formal methods show up in practical tooling.",
      "Compare specialized optimizer tooling with general-purpose compiler stacks.",
    ],
  },
  "entropicalabs-openqaoa": {
    summary:
      "OpenQAOA is one of the clearest open-source projects focused specifically on QAOA-style optimization workflows, making it a natural reference point for teams exploring quantum optimization claims.",
    description:
      "OpenQAOA matters because it keeps the optimization conversation concrete: models, workflow structure, and implementation details instead of marketing shorthand.",
    whatItIs: [
      "For readers trying to separate real software from abstract promise, OpenQAOA is valuable because it exposes the mechanics of a QAOA-oriented workflow in code. It gives people something inspectable to compare against both classical baselines and other hybrid libraries.",
      "That makes it an especially strong resource in a learn section built around operational honesty. It helps readers understand what QAOA actually looks like in software, not just in slideware.",
    ],
    whoItsFor:
      "Developers and evaluators comparing QAOA tooling, hybrid optimization workflows, and the practical software around combinatorial optimization experiments.",
    whatYouCanBuild: [
      "Inspect how QAOA workflows are modeled, executed, and evaluated.",
      "Compare quantum optimization tooling against classical-first baselines.",
      "Use the project as a concrete reference point in optimization discussions.",
    ],
    qtanglRelevance:
      "OpenQAOA is directly relevant to Qtangl because it sits close to the product's most visible research story: bounded quantum-assisted optimization. Even if Qtangl returns classical plans by default today, OpenQAOA is part of the real comparison set for understanding where QAOA workflows help, where they stay research-sized, and how much orchestration surrounds them in practice.",
  },
  "jtiosue-qubovert": {
    summary:
      "qubovert is a focused library for expressing QUBO-style problems, and it is especially useful for understanding the modeling layer behind optimization workflows.",
    description:
      "qubovert matters because it keeps attention on formulation, not just solver branding.",
    whatItIs: [
      "A lot of optimization conversations skip too quickly to the backend. qubovert is useful because it keeps the representation layer visible and helps readers inspect how combinatorial problems are encoded before execution.",
      "That makes it educationally important even for people who never use it directly. It reinforces the idea that the quality and clarity of the model often matter as much as the quantum story attached to the solver.",
    ],
    whoItsFor:
      "Developers who want a cleaner view of how QUBO-style problems are represented and manipulated in code.",
    whatYouCanBuild: [
      "Model binary optimization problems in a form that is easy to inspect.",
      "Compare formulation ergonomics across optimization libraries.",
      "Use the library as a bridge between abstract QUBO talk and actual code.",
    ],
    qtanglRelevance:
      "qubovert is relevant to Qtangl because good planning products live or die on formulation quality. Scheduling and routing constraints become actionable only when the model stays understandable enough to tune, test, and compare. qubovert is a useful reference for how that formulation layer can be exposed clearly.",
  },
  "cda-tum-mqt-qmap": {
    summary:
      "mqt-qmap is part of the Munich Quantum Toolkit ecosystem and is useful for readers exploring mapping and optimization concerns closer to the compilation layer.",
    description:
      "mqt-qmap matters because it highlights mapping and optimization decisions that are easy to overlook when people focus only on front-end APIs.",
    whatItIs: [
      "Projects like mqt-qmap broaden the optimization conversation beyond QUBO and annealing. They show that optimization also appears in how circuits are mapped, transformed, and prepared for target constraints.",
      "That makes the project a useful part of an ecosystem map. It reminds readers that optimization is not only an application-level concern; it also lives deeper in the toolchain.",
    ],
    whoItsFor:
      "Readers exploring compilation, mapping, and lower-level optimization concerns inside quantum software stacks.",
    whatYouCanBuild: [
      "Study mapping-aware optimization at a different layer of the stack.",
      "Compare application-level optimization libraries with toolchain-level ones.",
      "Understand why backend constraints can reshape how code is prepared.",
    ],
    qtanglRelevance:
      "mqt-qmap is relevant to Qtangl because it reinforces a broader lesson: optimization happens at multiple layers. Qtangl focuses on operational planning, but any future bounded quantum path still depends on lower-level transformations and constraints behaving predictably under the hood.",
  },
  "qiskit-qiskit-optimization": {
    summary:
      "Qiskit Optimization is a focused entry point into optimization modeling and hybrid workflows within the larger Qiskit ecosystem.",
    description:
      "Qiskit Optimization matters because it connects a major SDK surface to explicit optimization use cases.",
    whatItIs: [
      "For readers trying to understand where optimization fits inside a major framework, this package is an important waypoint. It makes the optimization story inspectable inside an ecosystem many developers already recognize.",
      "That is useful both educationally and strategically. It helps people compare whether they want a framework-embedded optimization package or a more specialized tool built around the problem class itself.",
    ],
    whoItsFor:
      "Developers already working in Qiskit or anyone comparing framework-embedded optimization tooling with standalone libraries.",
    whatYouCanBuild: [
      "Inspect how a major SDK packages optimization concepts for developers.",
      "Compare embedded optimization workflows with specialized tools like OpenQAOA or dimod.",
      "Use the package as a reference for framework-integrated hybrid experimentation.",
    ],
    qtanglRelevance:
      "Qiskit Optimization is directly relevant to Qtangl because it sits at the intersection of developer familiarity and optimization experimentation. It is part of the practical comparison set for how planning-style problems might be modeled, tested, and explained when a product wants to remain credible about hybrid research steps.",
  },
  "projectq-framework-projectq": {
    summary:
      "ProjectQ is one of the older, historically important frameworks in the ecosystem and remains useful for understanding how earlier SDKs approached circuit programming and compilation.",
    description:
      "ProjectQ matters partly as a current tool and partly as ecosystem history.",
    whatItIs: [
      "A good learn section should not only highlight what is newest. It should also help readers see which projects shaped the ecosystem's vocabulary and design patterns. ProjectQ is one of those reference points.",
      "Looking at it alongside newer frameworks helps readers compare how ideas have evolved over time, which abstractions persisted, and where the ecosystem has shifted.",
    ],
    whoItsFor:
      "Readers who want historical context, framework comparison, or a wider view of how major SDK ideas evolved.",
    whatYouCanBuild: [
      "Compare historical and modern approaches to quantum SDK design.",
      "Understand which abstractions have stayed durable across generations of tooling.",
      "Use the project as ecosystem context rather than only as a current implementation choice.",
    ],
  },
  "m-labs-artiq": {
    summary:
      "ARTIQ is a hardware-adjacent control stack that matters because it reveals the layer of software closer to experiments and instrument orchestration than most SDK overviews show.",
    description:
      "ARTIQ matters because it anchors the pulse-and-control side of the ecosystem.",
    whatItIs: [
      "Projects like ARTIQ remind readers that quantum software is not only about abstract circuits and algorithms. A large part of the ecosystem lives closer to experiments, timing, orchestration, and the realities of controlled hardware workflows.",
      "That makes ARTIQ a valuable balancing resource in the library. It expands the mental model from software-for-algorithms to software-for-systems.",
    ],
    whoItsFor:
      "Hardware-adjacent developers, researchers, and advanced readers trying to understand laboratory control and experiment orchestration tooling.",
    whatYouCanBuild: [
      "Explore how experiment control differs from high-level SDK work.",
      "Understand where pulse and orchestration layers fit in the stack.",
      "Use the project as a reference for hardware-facing software design.",
    ],
  },
  "open-quantum-safe-liboqs": {
    summary:
      "liboqs is one of the most important open-source PQC projects because it provides a practical implementation layer for evaluating quantum-safe cryptography today.",
    description:
      "liboqs matters because it anchors the post-quantum cryptography side of the broader quantum-adjacent ecosystem.",
    whatItIs: [
      "The value of liboqs is partly practical and partly educational. It shows readers that not every quantum-relevant project is about building or simulating quantum circuits. Some of the most important work is about preparing security systems for the consequences of quantum progress.",
      "That distinction matters for a strong educational hub. It helps readers separate quantum computing software from quantum-safe cryptography while still understanding why both belong in the same broader conversation.",
    ],
    whoItsFor:
      "Security-minded developers, architects, and readers evaluating real PQC implementations and integrations.",
    whatYouCanBuild: [
      "Inspect practical PQC implementations instead of only reading standards discussions.",
      "Compare crypto-oriented quantum-safe tooling with circuit-oriented ecosystems.",
      "Use the project as a starting point for understanding the security side of the field.",
      "Pair with Qtangl inventory at /assess and the ML-KEM guide at /q-day/frameworks/ml-kem.",
    ],
  },
  "pqclean-pqclean": {
    summary:
      "PQClean provides clean, portable reference implementations of NIST PQC candidates — a baseline for understanding algorithm behavior before production integration.",
    description:
      "PQClean matters as a reference layer for post-quantum algorithm evaluation and comparison.",
    whatItIs: [
      "PQClean packages implementations with consistent APIs and test vectors so researchers and integrators can compare algorithms without wading through heterogeneous codebases.",
      "For readiness teams, it is a technical reference — not an inventory tool. Pair algorithm study with operational inventory at /assess.",
    ],
    whoItsFor:
      "Cryptographers, security engineers, and teams evaluating NIST-standard algorithms before TLS or signing deployment.",
    whatYouCanBuild: [
      "Benchmark and compare PQC algorithm families with consistent interfaces.",
      "Validate test vectors before integrating liboqs or OpenSSL OQS forks.",
      "Map algorithm choices to inventory findings from /assess and the ML-KEM guide at /q-day/frameworks/ml-kem.",
    ],
  },
  "open-quantum-safe-openssl": {
    summary:
      "The Open Quantum Safe OpenSSL fork lets teams experiment with hybrid TLS and post-quantum ciphers in familiar OpenSSL workflows.",
    description:
      "OQS OpenSSL bridges standards research and production TLS experimentation for post-quantum migration.",
    whatItIs: [
      "This fork extends OpenSSL with liboqs-backed algorithms so engineers can pilot hybrid key exchange and signing without replacing their entire crypto stack overnight.",
      "Inventory still comes first: know which endpoints depend on legacy RSA/ECDSA before swapping ciphers — Qtangl Assess produces that baseline with CBOM export.",
    ],
    whoItsFor:
      "Platform engineers and security architects piloting hybrid TLS or evaluating OpenSSL-based PQC deployment paths.",
    whatYouCanBuild: [
      "Prototype hybrid TLS handshakes with ML-KEM alongside legacy algorithms.",
      "Compare OQS OpenSSL behavior against production inventory from /assess.",
      "Cross-reference deployment plans with framework guides at /q-day/frameworks/ml-kem and /q-day/frameworks/cmmc.",
    ],
  },
};
