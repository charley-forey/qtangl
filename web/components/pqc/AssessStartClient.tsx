"use client";

import { useState } from "react";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { qtanglApiBaseUrl } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

export default function AssessStartClient() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    trackEvent("assess_signup_started", { mode: "production", source: "assess_start" });
    try {
      const response = await fetch(`${qtanglApiBaseUrl}/public/assess-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, domain: domain || null }),
      });
      const payload = (await response.json()) as { assessUrl?: string; detail?: string };
      if (!response.ok) {
        throw new Error(typeof payload.detail === "string" ? payload.detail : "Signup failed.");
      }
      trackEvent("assess_signup_completed", { mode: "production", source: "assess_start" });
      if (payload.assessUrl) {
        setSuccessUrl(payload.assessUrl);
        window.location.href = payload.assessUrl;
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
            <p className="text-sm text-[var(--color-gray-300)]">
              Redirecting to your production assess workspace…
            </p>
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
