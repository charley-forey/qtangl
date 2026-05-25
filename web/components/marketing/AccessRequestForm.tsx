"use client";

import { useActionState } from "react";

import {
  initialAccessFormState,
  requestAccess,
} from "@/app/access/actions";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

function Input({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
      <span>{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="h-12 rounded-xl border border-[var(--border)] bg-black px-4 text-sm text-white outline-none transition placeholder:text-[var(--color-gray-500)] focus:border-[var(--border-strong)]"
      />
    </label>
  );
}

export default function AccessRequestForm() {
  const [state, formAction, pending] = useActionState(
    requestAccess,
    initialAccessFormState
  );

  return (
    <Card strong className="rounded-[2rem] p-8 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>Access interface</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Request pilot access
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            Share the workflow you want to model. Qtangl prioritizes teams working on scheduling, routing, allocation, and adjacent optimization systems.
          </p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[var(--color-gray-400)]">
            <p>Preferred signals: operational scale, integration context, and constraint complexity.</p>
            <p>Configured providers: Resend via API or Formspree via webhook endpoint.</p>
          </div>
        </div>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              placeholder="Ada Lovelace"
              required
            />
            <Input
              label="Work email"
              name="email"
              type="email"
              placeholder="ada@company.com"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Company"
              name="company"
              placeholder="Example Systems"
              required
            />
            <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
              <span>Interest area</span>
              <select
                name="interest"
                required
                className="h-12 rounded-xl border border-[var(--border)] bg-black px-4 text-sm text-white outline-none transition focus:border-[var(--border-strong)]"
                defaultValue=""
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="Scheduling optimization">Scheduling optimization</option>
                <option value="Routing optimization">Routing optimization</option>
                <option value="Resource allocation">Resource allocation</option>
                <option value="Developer platform">Developer platform</option>
                <option value="Research collaboration">Research collaboration</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
            <span>System context</span>
            <textarea
              name="message"
              rows={6}
              placeholder="Describe the planning problem, system constraints, or API integration context."
              className="rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-[var(--color-gray-500)] focus:border-[var(--border-strong)]"
            />
          </label>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={`text-sm leading-7 ${
                state.status === "error"
                  ? "text-[var(--color-gray-200)]"
                  : "text-[var(--color-gray-400)]"
              }`}
            >
              {state.message}
            </p>
            <Button type="submit" disabled={pending}>
              {pending ? "Submitting..." : "Request Access"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
