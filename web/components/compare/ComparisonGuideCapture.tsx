"use client";

import { useActionState, useEffect, useState } from "react";

import { requestAccess } from "@/app/access/actions";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { initialAccessFormState } from "@/lib/access/form-state";
import { trackEvent } from "@/lib/analytics";
import { compareHubCopy } from "@/lib/copy/competitors";

type ComparisonGuideCaptureProps = {
  id?: string;
};

export default function ComparisonGuideCapture({ id = "guide" }: ComparisonGuideCaptureProps) {
  const [state, formAction, pending] = useActionState(requestAccess, initialAccessFormState);
  const [formStartedAt] = useState(() => Date.now());
  const unlocked = state.status === "success";

  useEffect(() => {
    if (unlocked) {
      trackEvent("comparison_guide_unlock", { source: "comparison-guide" });
    }
  }, [unlocked]);

  return (
    <Card id={id} tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <Eyebrow>Lead magnet</Eyebrow>
      <h2 className="mt-4 text-xl font-semibold text-white">PQC Vendor Comparison Guide (PDF)</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        Full landscape matrix, positioning map, and per-vendor summaries — the same analysis on
        this page, formatted for your evaluation committee.
      </p>

      {unlocked ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-[#6ee7a0]">Unlocked — download your guide.</p>
          <div className="flex flex-wrap gap-3">
            <Button href={compareHubCopy.guidePdfPath}>Download PDF</Button>
            <Button href="/compare/guide" variant="secondary">
              View printable version
            </Button>
            <Button href="/assess" variant="secondary">
              Run Q-Day scan
            </Button>
          </div>
        </div>
      ) : (
        <form action={formAction} className="mt-6 max-w-md space-y-4">
          <input type="hidden" name="interest" value={compareHubCopy.guideInterest} />
          <input type="hidden" name="source" value="comparison-guide" />
          <input type="hidden" name="formStartedAt" value={String(formStartedAt)} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <label className="block text-sm">
            <span className="text-[var(--color-gray-400)]">Work email</span>
            <input
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm text-white"
            />
            {state.fieldErrors.email ? (
              <span className="mt-1 block text-xs text-red-300">{state.fieldErrors.email}</span>
            ) : null}
          </label>
          {state.status === "error" && state.message ? (
            <p className="text-xs text-red-300">{state.message}</p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Email me the guide"}
          </Button>
        </form>
      )}
    </Card>
  );
}
