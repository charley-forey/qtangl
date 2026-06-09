"use client";

import { useState } from "react";

import { qtanglApiBaseUrl } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

export default function MonitorSignupForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${qtanglApiBaseUrl}/public/monitor-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail ?? "Signup failed.");
      }
      if (payload.status === "success" && payload.checkoutUrl) {
        trackEvent("monitor_checkout_started", { company });
        window.location.href = payload.checkoutUrl;
        return;
      }
      trackEvent("monitor_signup_contact", { company, status: payload.status });
      setMessage(payload.message ?? "Contact hello@qtangl.com to start a Monitor pilot.");
    } catch (error) {
      trackEvent("monitor_signup_error", { company });
      setMessage(error instanceof Error ? error.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-[var(--border-subtle)] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Monitor tier</p>
      <p className="text-sm text-[var(--color-gray-300)]">
        Continuous PQC scans, drift alerts, signed evidence, and remediation workflow.
      </p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Work email"
        className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
      />
      <input
        type="text"
        required
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company name"
        className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {loading ? "Starting checkout…" : "Start Monitor checkout"}
      </button>
      {message ? <p className="text-xs text-[var(--color-gray-400)]">{message}</p> : null}
    </form>
  );
}
