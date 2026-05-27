"use client";

import { FormEvent, useState } from "react";

import { trackEvent } from "@/lib/analytics";

export default function SubmitResourceForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      url: String(form.get("url") ?? ""),
      category: String(form.get("category") ?? ""),
      notes: String(form.get("notes") ?? ""),
    };

    try {
      const response = await fetch("/api/learn/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      setStatus("done");
      setMessage("Thanks — your submission was recorded.");
      trackEvent("learn_submit_resource", { title: payload.title });
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Could not submit right now. Try again or email the team.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
          Project name
        </span>
        <input
          name="title"
          required
          className="w-full rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
          Repository URL
        </span>
        <input
          name="url"
          type="url"
          required
          className="w-full rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
          Suggested category
        </span>
        <input
          name="category"
          className="w-full rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
          Why it belongs in the library
        </span>
        <textarea
          name="notes"
          rows={5}
          required
          className="w-full rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white"
        />
      </label>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white"
      >
        {status === "submitting" ? "Submitting…" : "Submit for review"}
      </button>
      {message ? <p className="text-sm text-[var(--color-gray-300)]">{message}</p> : null}
    </form>
  );
}
