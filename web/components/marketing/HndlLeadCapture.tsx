"use client";

import { FormEvent, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { trackEvent } from "@/lib/analytics";
import { buildAssessMiniHref } from "@/lib/hndl-funnel";

type HndlLeadCaptureProps = {
  source?: string;
};

export default function HndlLeadCapture({ source = "q-day-hndl" }: HndlLeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done">("idle");

  const assessHref = buildAssessMiniHref({ source, content: "lead-capture" });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    trackEvent("hndl_lead_capture", {
      source,
      emailDomain: email.split("@")[1] ?? "unknown",
    });
    setStatus("done");
    setEmail("");
  }

  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <Eyebrow>Board checklist</Eyebrow>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
        Get the HNDL board checklist — Mosca framing, collection vectors, and a 90-day action plan.
        Inventory aid, not formal audit.
      </p>
      {status === "done" ? (
        <p className="mt-6 text-sm text-[#6ee7a0]" role="status">
          Thanks — we&apos;ll send the checklist to your inbox. Meanwhile, run a{" "}
          <a href={assessHref} className="underline">
            free mini-assessment
          </a>
          .
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-wrap gap-3" aria-label="HNDL board checklist signup">
          <label className="sr-only" htmlFor="hndl-checklist-email">
            Work email
          </label>
          <input
            id="hndl-checklist-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
            className="min-w-[220px] flex-1 rounded-xl border border-[var(--border)] bg-black/40 px-4 py-3 text-sm text-white"
          />
          <button
            type="submit"
            className="rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white hover:bg-white/[0.12]"
          >
            Get checklist
          </button>
        </form>
      )}
      <p className="mt-3 text-xs text-[var(--color-gray-500)]">
        Or download the HNDL infographic (ungated):{" "}
        <a href="/downloads/hndl-infographic.png" className="underline hover:text-white">
          PNG
        </a>
        ,{" "}
        <a href="/downloads/hndl-infographic.pdf" className="underline hover:text-white">
          PDF
        </a>
        , or{" "}
        <a href="/downloads/hndl-infographic.svg" className="underline hover:text-white">
          SVG
        </a>
        .
      </p>
    </Card>
  );
}
