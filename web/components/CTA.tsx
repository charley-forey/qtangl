"use client";

import { FormEvent, useState } from "react";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    setSubmitted(true);
    setEmail("");
  }

  return (
    <div
      id="request-access"
      className="overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_45%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(8,15,29,0.96))] p-8 sm:p-10"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          Early access
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Bring Qtangl into your operations workflow.
        </h2>
        <p className="mt-4 text-base leading-8 text-slate-300">
          Request early access to shape the first enterprise optimization workflows
          for scheduling, routing, and resource allocation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@company.com"
          className="h-12 flex-1 rounded-full border border-white/10 bg-slate-950/70 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
        />
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-full bg-cyan-300 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Request Early Access
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        {submitted
          ? "Thanks. We will reach out when the next Qtangl pilot opens."
          : "Frontend-only MVP. This form captures intent locally for now."}
      </p>
    </div>
  );
}
