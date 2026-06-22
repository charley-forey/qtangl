"use client";

import { FormEvent, useState } from "react";

import { trackEvent } from "@/lib/analytics";

const VARIANT_COPY = {
  library: {
    description: "Monthly digest: new library entries, updated flagships, and one editorial pick.",
    submitLabel: "Subscribe",
    eventName: "learn_newsletter_signup",
    successMessage:
      "Thanks — we'll wire this to your ESP in production. Preference saved locally for now.",
  },
  "quantum-crypto": {
    description:
      "Week-by-week watchlist, NIST bibliography, and checkpoint reminders — plus new video companions as we publish them.",
    submitLabel: "Send me the curriculum",
    eventName: "quantum_crypto_curriculum_signup",
    successMessage:
      "Thanks — we'll send the 4-week outline and curriculum updates. Preference saved locally for now.",
  },
} as const;

type LearnNewsletterSignupProps = {
  variant?: keyof typeof VARIANT_COPY;
};

export default function LearnNewsletterSignup({ variant = "library" }: LearnNewsletterSignupProps) {
  const copy = VARIANT_COPY[variant];
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    trackEvent(copy.eventName, {
      emailDomain: email.split("@")[1] ?? "unknown",
      variant,
    });
    setStatus("done");
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="learn-print-hide max-w-xl space-y-3">
      <p className="text-sm leading-7 text-[var(--color-gray-300)]">{copy.description}</p>
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
          {copy.submitLabel}
        </button>
      </div>
      {status === "done" ? (
        <p className="text-xs text-[var(--color-gray-400)]">{copy.successMessage}</p>
      ) : null}
    </form>
  );
}
