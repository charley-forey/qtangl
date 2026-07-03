"use client";

import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export default function DashboardSignupSuccess() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4 py-16">
      <Card tone="feature" className="w-full border border-emerald-500/30">
        <Eyebrow>Payment confirmed</Eyebrow>
        <h1 className="mt-3 text-xl font-semibold text-white">Your Monitor workspace is ready</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
          We sent a secure sign-in link to your work email. It expires in 24 hours — use that link to open your
          dashboard and authorize domains for scanning.
        </p>
        <p className="mt-2 text-sm leading-7 text-[var(--color-gray-400)]">
          Did not receive it? Check spam, or sign in below with the same work email you used at checkout.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/command-center/login?session=refresh">
            Sign in to your workspace
          </Button>
          <Link
            href="/access"
            className="inline-flex items-center text-sm text-[var(--color-gray-400)] underline underline-offset-4 hover:text-white"
          >
            Back to access
          </Link>
        </div>
      </Card>
    </div>
  );
}
