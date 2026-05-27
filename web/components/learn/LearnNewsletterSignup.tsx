"use client";

import { FormEvent, useState } from "react";

import { trackEvent } from "@/lib/analytics";

export default function LearnNewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    trackEvent("learn_newsletter_signup", { emailDomain: email.split("@")[1] ?? "unknown" });
    setStatus("done");
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="learn-print-hide max-w-xl space-y-3">
      <p className="text-sm leading-7 text-[var(--color-gray-300)]">
        Monthly digest: new library entries, updated flagships, and one editorial pick.
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          required
          className="min-w-[220px] flex-1 rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white"
        />
        <button
          type="submit"
          className="rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white"
        >
          Subscribe
        </button>
      </div>
      {status === "done" ? (
        <p className="text-xs text-[var(--color-gray-400)]">
          Thanks — we&apos;ll wire this to your ESP in production. Preference saved locally for now.
        </p>
      ) : null}
    </form>
  );
}
