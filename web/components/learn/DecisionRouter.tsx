"use client";

import Link from "next/link";

import { trackEvent } from "@/lib/analytics";

const ROUTES = [
  {
    id: "build",
    label: "Build circuits",
    description: "SDKs, compilers, and cloud runtimes for gate-model workflows.",
    href: "/learn/library?cluster=build",
  },
  {
    id: "simulate",
    label: "Simulate behavior",
    description: "State-vector, stabilizer, and visualization tooling.",
    href: "/learn/library?cluster=simulate",
  },
  {
    id: "optimize",
    label: "Solve optimization",
    description: "QUBO, QAOA, annealing, chemistry, and hybrid solvers.",
    href: "/learn/library?cluster=optimize",
  },
  {
    id: "secure",
    label: "Secure systems",
    description: "PQC, error correction, and networking-oriented stacks.",
    href: "/learn/library?cluster=secure",
  },
  {
    id: "learn",
    label: "Learn the basics",
    description: "Games, katas, and approachable onboarding resources.",
    href: "/learn/library?cluster=learn",
  },
] as const;

export default function DecisionRouter() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {ROUTES.map((route) => (
        <Link
          key={route.id}
          href={route.href}
          onClick={() => trackEvent("learn_decision_router", { cluster: route.id })}
          className="group relative rounded-[var(--radius-feature)] border border-[var(--border)] bg-black/40 p-5 transition hover:border-[var(--border-strong)] hover:bg-white/[0.04]"
        >
          <p className="text-label">I want to</p>
          <h3 className="mt-3 text-lg font-semibold text-white group-hover:underline">
            {route.label}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {route.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
