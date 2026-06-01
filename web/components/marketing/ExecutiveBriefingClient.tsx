"use client";

import { useActionState } from "react";

import { requestAccess } from "@/app/access/actions";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { initialAccessFormState } from "@/lib/access/form-state";
import { executiveBriefingCopy } from "@/lib/copy/readiness-briefing";

export default function ExecutiveBriefingClient() {
  const [state, formAction, pending] = useActionState(requestAccess, initialAccessFormState);
  const unlocked = state.status === "success";
  const { gate, downloadPath, sections, upsell } = executiveBriefingCopy;

  if (!unlocked) {
    return (
      <Card tone="feature" size="lg" className="mx-auto max-w-xl rounded-[var(--radius-feature)]">
        <Eyebrow>{gate.title}</Eyebrow>
        <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">{gate.description}</p>
        <form action={formAction} className="mt-8 space-y-4">
          <input type="hidden" name="interest" value="Enterprise PQC program" />
          <input type="hidden" name="source" value="executive-briefing" />
          <input type="hidden" name="formStartedAt" value={String(Date.now())} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <label className="block text-sm">
            <span className="text-[var(--color-gray-400)]">Name</span>
            <input
              type="text"
              name="name"
              required
              placeholder="Ada Lovelace"
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--color-gray-400)]">Title</span>
            <input
              type="text"
              name="company"
              required
              placeholder="CISO · Example Bank"
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm text-white"
            />
          </label>
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
          {state.status === "error" ? <p className="text-sm text-red-300">{state.message}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? gate.pendingLabel : gate.submitLabel}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)] print:border-none print:bg-white print:text-black">
        <Eyebrow>Executive briefing</Eyebrow>
        <div className="mt-6 space-y-8">
          {sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-white print:text-black">
                {index + 1}. {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)] print:text-gray-800">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button href={downloadPath} variant="secondary">
          Download markdown
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          Print / save as PDF
        </Button>
        <Button href={upsell.primary.href}>{upsell.primary.label}</Button>
        <Button href={upsell.secondary.href} variant="secondary">
          {upsell.secondary.label}
        </Button>
        <Button href={upsell.tertiary.href} variant="secondary">
          {upsell.tertiary.label}
        </Button>
      </div>
    </div>
  );
}
