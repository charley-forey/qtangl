"use client";

import { useState } from "react";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { trackEvent } from "@/lib/analytics";
import {
  domainMatchesEmail,
  normalizeDomainInput,
  submitAssessSignup,
} from "@/lib/assess-signup";

export default function AssessStartClient() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setWarning(null);
    setDomainError(null);

    const trimmedDomain = domain.trim();
    if (trimmedDomain && !domainMatchesEmail(trimmedDomain, email)) {
      setDomainError(
        "Domain should match your work email domain (e.g. api.example.com for you@example.com) for auto-allowlist."
      );
      setPending(false);
      return;
    }

    trackEvent("assess_signup_started", { mode: "production", source: "assess_start" });
    try {
      const payload = await submitAssessSignup({
        email,
        company,
        domain: trimmedDomain ? normalizeDomainInput(trimmedDomain) : null,
      });
      trackEvent("assess_signup_completed", { mode: "production", source: "assess_start" });
      if (payload.warning) {
        setWarning(payload.warning);
      }
      if (payload.assessUrl) {
        setSuccessUrl(payload.assessUrl);
        if (!payload.warning) {
          window.location.href = payload.assessUrl;
        }
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Signup failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Assess"
        title="Start your authorized baseline"
        description="Create a free Assess workspace (5 scans/month). We email a secure onboarding link — no fixture demos on your production domains."
      />
      <Section gap="tight">
        <Card tone="feature" size="lg" className="mx-auto max-w-xl rounded-[var(--radius-feature)]">
          {successUrl ? (
            <div className="space-y-3 text-sm text-[var(--color-gray-300)]">
              <p>Your workspace is ready.</p>
              {warning ? <p className="text-amber-200">{warning}</p> : null}
              <Button href={successUrl}>Open production assess workspace</Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Eyebrow>Self-serve signup</Eyebrow>
              <label className="block text-sm">
                <span className="text-[var(--color-gray-400)]">Work email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm text-white"
                />
              </label>
              <label className="block text-sm">
                <span className="text-[var(--color-gray-400)]">Company</span>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm text-white"
                />
              </label>
              <label className="block text-sm">
                <span className="text-[var(--color-gray-400)]">Primary domain (optional)</span>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="api.example.com — must match email domain for auto-allowlist"
                  className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm text-white"
                />
                {domainError ? <span className="mt-1 block text-xs text-red-300">{domainError}</span> : null}
              </label>
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <Button type="submit" disabled={pending}>
                {pending ? "Creating workspace…" : "Create Assess workspace"}
              </Button>
              <p className="text-xs text-[var(--color-gray-500)]">
                Prefer sales-led onboarding?{" "}
                <a href="/access" className="underline text-white">
                  Request a pilot
                </a>
                . Want a demo only?{" "}
                <a href="/assess" className="underline text-white">
                  Public assess demo
                </a>
                .
              </p>
            </form>
          )}
        </Card>
      </Section>
    </PageShell>
  );
}
