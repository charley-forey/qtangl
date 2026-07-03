import Link from "next/link";

import { workosAuthKitMissing } from "@/lib/auth/workos";

export default function DashboardLoginUnavailable() {
  const missing = workosAuthKitMissing();

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-white">Sign-in temporarily unavailable</h1>
      <p className="mt-3 text-sm text-zinc-400">
        WorkOS dashboard authentication is enabled but not fully configured on this deployment.
        The site remains available; only hosted sign-in is affected.
      </p>
      {missing.length > 0 ? (
        <ul className="mt-4 list-inside list-disc text-sm text-amber-200/90">
          {missing.map((key) => (
            <li key={key}>
              <code className="text-amber-100">{key}</code>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-6 text-sm text-zinc-500">
        Set missing variables in Vercel, redeploy, then check{" "}
        <Link href="/api/dashboard/auth-health" className="text-sky-400 underline">
          /api/dashboard/auth-health
        </Link>
        .
      </p>
      <Link
        href="/command-center"
        className="mt-8 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-white hover:border-zinc-500"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
