"use client";

import { useActionState } from "react";

import {
  initialAccessFormState,
  requestAccess,
} from "@/app/access/actions";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { accessFormCopy } from "@/lib/copy/access";

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
    <Card strong className="rounded-[2rem] p-6 sm:p-8 lg:p-10">
      <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>{accessFormCopy.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {accessFormCopy.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            {accessFormCopy.description}
          </p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[var(--color-gray-400)]">
            {accessFormCopy.helpfulNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>

        <form action={formAction} className="grid gap-4 sm:gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={accessFormCopy.fields.name.label}
              name="name"
              placeholder={accessFormCopy.fields.name.placeholder}
              required
            />
            <Input
              label={accessFormCopy.fields.email.label}
              name="email"
              type="email"
              placeholder={accessFormCopy.fields.email.placeholder}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={accessFormCopy.fields.company.label}
              name="company"
              placeholder={accessFormCopy.fields.company.placeholder}
              required
            />
            <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
              <span>{accessFormCopy.fields.interest.label}</span>
              <select
                name="interest"
                required
                className="h-12 rounded-xl border border-[var(--border)] bg-black px-4 text-sm text-white outline-none transition focus:border-[var(--border-strong)]"
                defaultValue=""
              >
                <option value="" disabled>
                  {accessFormCopy.fields.interest.placeholder}
                </option>
                {accessFormCopy.fields.interest.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
            <span>{accessFormCopy.fields.currentTools.label}</span>
            <input
              name="currentTools"
              placeholder={accessFormCopy.fields.currentTools.placeholder}
              className="h-12 rounded-xl border border-[var(--border)] bg-black px-4 text-sm text-white outline-none transition placeholder:text-[var(--color-gray-500)] focus:border-[var(--border-strong)]"
            />
          </label>

          <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
            <span>{accessFormCopy.fields.message.label}</span>
            <textarea
              name="message"
              rows={6}
              placeholder={accessFormCopy.fields.message.placeholder}
              className="rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-[var(--color-gray-500)] focus:border-[var(--border-strong)]"
            />
          </label>

          <div className="flex flex-col gap-4 pt-2 lg:flex-row lg:items-center lg:justify-between">
            <p
              className={`text-sm leading-7 ${
                state.status === "error"
                  ? "text-[var(--color-gray-200)]"
                  : "text-[var(--color-gray-400)]"
              }`}
            >
              {state.message}
            </p>
            <Button type="submit" disabled={pending} className="w-full lg:w-auto">
              {pending ? accessFormCopy.pendingLabel : accessFormCopy.submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
