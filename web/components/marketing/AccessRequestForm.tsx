"use client";

import { useActionState, useEffect, useRef } from "react";

import type { AccessFormState } from "@/app/access/actions";
import { requestAccess } from "@/app/access/actions";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { accessFormCopy, accessFormMessages } from "@/lib/copy/access";

const fieldBaseClassName =
  "h-12 rounded-xl border bg-black px-4 text-sm text-white outline-none transition placeholder:text-[var(--color-gray-500)]";

const textAreaBaseClassName =
  "rounded-xl border bg-black px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-[var(--color-gray-500)]";

const initialAccessFormState: AccessFormState = {
  status: "idle",
  message: accessFormMessages.initial,
  fieldErrors: {},
};

function getFieldClassName(hasError: boolean) {
  return [
    hasError ? "border-[var(--border-strong)]" : "border-[var(--border)]",
    "focus:border-[var(--border-strong)]",
  ].join(" ");
}

function Input({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  const inputId = `access-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="grid gap-2 text-sm text-[var(--color-gray-300)]">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[fieldBaseClassName, getFieldClassName(Boolean(error))].join(" ")}
      />
      {error ? (
        <p id={errorId} className="text-xs leading-6 text-[var(--color-gray-200)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function AccessRequestForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    requestAccess,
    initialAccessFormState
  );
  const formState = state ?? initialAccessFormState;
  const fieldErrors = formState.fieldErrors || initialAccessFormState.fieldErrors;
  const statusIsError = formState.status === "error";
  const statusMessage = pending ? accessFormCopy.pendingLabel : formState.message;

  useEffect(() => {
    if (formState.status !== "error") {
      return;
    }

    const firstInvalidField = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalidField?.focus();
  }, [formState.status, fieldErrors]);

  if (formState.status === "success") {
    return (
      <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
        <div className="grid gap-6">
          <Eyebrow>Request received</Eyebrow>
          <h2 className="heading-section">Access request submitted</h2>
          <p className="text-base leading-8 text-[var(--color-gray-300)]">{formState.message}</p>
          <div
            className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/[0.03] p-5 text-sm leading-7 text-[var(--color-gray-300)]"
            role="status"
            aria-live="polite"
          >
            Qtangl has your details. You can close this page or return later if you need
            to share a different workflow.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>{accessFormCopy.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{accessFormCopy.title}</h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            {accessFormCopy.description}
          </p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[var(--color-gray-400)]">
            {accessFormCopy.helpfulNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>

        <form
          ref={formRef}
          action={formAction}
          className="grid gap-4 sm:gap-5"
          noValidate
          aria-busy={pending}
        >
          <fieldset disabled={pending} className="grid gap-4 border-0 p-0 sm:gap-5">
            <div
              className={`text-sm leading-7 ${
                statusIsError ? "text-[var(--color-gray-200)]" : "text-[var(--color-gray-400)]"
              }`}
              aria-live={statusIsError ? "assertive" : "polite"}
              role={statusIsError ? "alert" : "status"}
            >
              {statusMessage}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={accessFormCopy.fields.name.label}
                name="name"
                placeholder={accessFormCopy.fields.name.placeholder}
                required
                error={fieldErrors.name}
              />
              <Input
                label={accessFormCopy.fields.email.label}
                name="email"
                type="email"
                placeholder={accessFormCopy.fields.email.placeholder}
                required
                error={fieldErrors.email}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={accessFormCopy.fields.company.label}
                name="company"
                placeholder={accessFormCopy.fields.company.placeholder}
                required
                error={fieldErrors.company}
              />
              <div className="grid gap-2 text-sm text-[var(--color-gray-300)]">
                <label htmlFor="access-interest">{accessFormCopy.fields.interest.label}</label>
                <select
                  id="access-interest"
                  name="interest"
                  required
                  aria-invalid={fieldErrors.interest ? "true" : undefined}
                  aria-describedby={fieldErrors.interest ? "access-interest-error" : undefined}
                  className={[
                    fieldBaseClassName,
                    getFieldClassName(Boolean(fieldErrors.interest)),
                  ].join(" ")}
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
                {fieldErrors.interest ? (
                  <p
                    id="access-interest-error"
                    className="text-xs leading-6 text-[var(--color-gray-200)]"
                  >
                    {fieldErrors.interest}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2 text-sm text-[var(--color-gray-300)]">
              <label htmlFor="access-currentTools">{accessFormCopy.fields.currentTools.label}</label>
              <input
                id="access-currentTools"
                name="currentTools"
                placeholder={accessFormCopy.fields.currentTools.placeholder}
                aria-invalid={fieldErrors.currentTools ? "true" : undefined}
                aria-describedby={
                  fieldErrors.currentTools ? "access-currentTools-error" : undefined
                }
                className={[
                  fieldBaseClassName,
                  getFieldClassName(Boolean(fieldErrors.currentTools)),
                ].join(" ")}
              />
              {fieldErrors.currentTools ? (
                <p
                  id="access-currentTools-error"
                  className="text-xs leading-6 text-[var(--color-gray-200)]"
                >
                  {fieldErrors.currentTools}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2 text-sm text-[var(--color-gray-300)]">
              <label htmlFor="access-message">{accessFormCopy.fields.message.label}</label>
              <textarea
                id="access-message"
                name="message"
                rows={6}
                placeholder={accessFormCopy.fields.message.placeholder}
                aria-invalid={fieldErrors.message ? "true" : undefined}
                aria-describedby={fieldErrors.message ? "access-message-error" : undefined}
                className={[
                  textAreaBaseClassName,
                  getFieldClassName(Boolean(fieldErrors.message)),
                ].join(" ")}
              />
              {fieldErrors.message ? (
                <p id="access-message-error" className="text-xs leading-6 text-[var(--color-gray-200)]">
                  {fieldErrors.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 pt-2 lg:flex-row lg:items-center lg:justify-end">
              <Button type="submit" disabled={pending} className="w-full lg:w-auto">
                {pending ? accessFormCopy.pendingLabel : accessFormCopy.submitLabel}
              </Button>
            </div>
          </fieldset>
        </form>
      </div>
    </Card>
  );
}
