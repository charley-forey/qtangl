"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import {
  domainMatchesEmail,
  emailDomainFromAddress,
  normalizeDomainInput,
  submitAssessSignup,
} from "@/lib/assess-signup";
import { trackEvent } from "@/lib/analytics";

export default function AssessEmailGatePanel({
  onDismiss,
}: {
  onDismiss?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setWarning(null);

    const trimmedEmail = email.trim();
    const trimmedDomain = normalizeDomainInput(domain || emailDomainFromAddress(trimmedEmail));
    if (!trimmedDomain) {
      setError("Enter a work email with a valid domain.");
      setPending(false);
      return;
    }
    if (!domainMatchesEmail(trimmedDomain, trimmedEmail)) {
      setError("Scan domain must match your work email domain (e.g. api.example.com for you@example.com).");
      setPending(false);
      return;
    }
    if (!authorized) {
      setError("Confirm you are authorized to scan this domain.");
      setPending(false);
      return;
    }

    trackEvent("assess_signup_started", { mode: "production", source: "email_gate" });
    try {
      const company = trimmedDomain.split(".")[0] ?? "Assess";
      const payload = await submitAssessSignup({
        email: trimmedEmail,
        company: company.charAt(0).toUpperCase() + company.slice(1),
        domain: trimmedDomain,
      });
      trackEvent("assess_signup_completed", { mode: "production", source: "email_gate" });
      if (payload.warning) setWarning(payload.warning);
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

  if (successUrl) {
    return (
      <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-[var(--color-gray-300)]">
        <p className="font-medium text-white">Your one-domain live scan workspace is ready</p>
        {warning ? <p className="text-amber-200">{warning}</p> : null}
        <p>
          You get one free production live scan on your allowlisted domain. For ongoing scans, upgrade via{" "}
          <a href="/assess/start" className="underline text-white">
            full Assess workspace
          </a>
          .
        </p>
        <Button href={successUrl}>Run live scan now</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div>
        <p className="text-sm font-medium text-white">Scan one domain (work email required)</p>
        <p className="mt-1 text-xs leading-6 text-[var(--color-gray-400)]">
          Middle path between public demo and full workspace: one authorized live scan on your corporate domain.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          <span className="text-[var(--color-gray-400)]">Work email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm text-white"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--color-gray-400)]">Domain to scan</span>
          <input
            type="text"
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="api.company.com — must match email domain"
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm text-white"
          />
        </label>
        <label className="flex items-start gap-3 text-xs text-[var(--color-gray-400)]">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => setAuthorized(e.target.checked)}
            className="mt-1"
          />
          <span>
            I am authorized to scan this domain and agree to Qtangl{" "}
            <a href="/terms" className="underline text-white">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline text-white">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating workspace…" : "Allowlist domain & scan"}
          </Button>
          {onDismiss ? (
            <button type="button" onClick={onDismiss} className="text-sm text-[var(--color-gray-400)] underline">
              Back to scanner
            </button>
          ) : null}
        </div>
      </form>
      <p className="text-[10px] text-[var(--color-gray-600)]">
        Prefer fixture-only? Use &quot;Email me sample results&quot; on the intent picker for CBOM samples without live scan.
      </p>
    </div>
  );
}
