"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { initialAccessFormState } from "@/lib/access/form-state";
import { requestAccess } from "@/app/access/actions";
import AccessSuccess, { AccessFormFooter } from "@/components/marketing/AccessSuccess";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { trackEvent } from "@/lib/analytics";
import { accessFormCopy } from "@/lib/copy/access";

const fieldBaseClassName =
  "h-12 rounded-xl border bg-black px-4 text-sm text-white outline-none transition placeholder:text-[var(--color-gray-500)]";

const textAreaBaseClassName =
  "rounded-xl border bg-black px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-[var(--color-gray-500)]";

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

type AccessRequestFormProps = {
  source?: string;
  defaultInterest?: string;
};

export default function AccessRequestForm({
  source = "",
  defaultInterest = "",
}: AccessRequestFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const formStartedAtRef = useRef<number>(Date.now());
  const hasTrackedStartRef = useRef(false);
  const [showOptional, setShowOptional] = useState(false);
  const [state, formAction, pending] = useActionState(requestAccess, initialAccessFormState);
  const formState = state ?? initialAccessFormState;
  const fieldErrors = formState.fieldErrors || initialAccessFormState.fieldErrors;
  const statusIsError = formState.status === "error";
  const statusMessage = pending ? accessFormCopy.pendingLabel : formState.message;

  useEffect(() => {
    if (formState.status !== "error") {
      return;
    }

    trackEvent("access_form_error", { source });
    const firstInvalidField = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalidField?.focus();
  }, [formState.status, fieldErrors, source]);

  useEffect(() => {
    if (formState.status === "success") {
      trackEvent("access_form_success", {
        source,
        interest: formState.interest ?? defaultInterest,
      });
    }
  }, [formState.status, formState.interest, source, defaultInterest]);

  function handleFormInteraction() {
    if (hasTrackedStartRef.current) {
      return;
    }

    hasTrackedStartRef.current = true;
    trackEvent("access_form_started", { source, interest: defaultInterest });
  }

  if (formState.status === "success") {
    return <AccessSuccess message={formState.message} interest={formState.interest} />;
  }

  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <div className="grid gap-8">
        <div>
          <Eyebrow>{accessFormCopy.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{accessFormCopy.title}</h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            {accessFormCopy.description}
          </p>
        </div>

        <form
          ref={formRef}
          action={formAction}
          className="grid gap-4 sm:gap-5"
          noValidate
          aria-busy={pending}
          onFocus={handleFormInteraction}
          onSubmit={() => {
            trackEvent("access_form_submitted", { source, interest: defaultInterest });
          }}
        >
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="formStartedAt" value={formStartedAtRef.current} />
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />

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

            <Input
              label={accessFormCopy.fields.email.label}
              name="email"
              type="email"
              placeholder={accessFormCopy.fields.email.placeholder}
              required
              error={fieldErrors.email}
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
                defaultValue={defaultInterest}
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

            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/[0.02]">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-white transition hover:bg-white/[0.03]"
                aria-expanded={showOptional}
                aria-controls="access-optional-fields"
                onClick={() => setShowOptional((open) => !open)}
              >
                <span>{accessFormCopy.optionalSectionLabel}</span>
                <span aria-hidden="true" className="text-[var(--color-gray-400)]">
                  {showOptional ? "−" : "+"}
                </span>
              </button>

              {showOptional ? (
                <div
                  id="access-optional-fields"
                  className="grid gap-4 border-t border-[var(--border)] px-4 py-4 sm:gap-5"
                >
                  <p className="text-xs leading-6 text-[var(--color-gray-500)]">
                    {accessFormCopy.optionalSectionHint}
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={accessFormCopy.fields.name.label}
                      name="name"
                      placeholder={accessFormCopy.fields.name.placeholder}
                      error={fieldErrors.name}
                    />
                    <Input
                      label={accessFormCopy.fields.company.label}
                      name="company"
                      placeholder={accessFormCopy.fields.company.placeholder}
                      error={fieldErrors.company}
                    />
                  </div>

                  <div className="grid gap-2 text-sm text-[var(--color-gray-300)]">
                    <label htmlFor="access-currentTools">
                      {accessFormCopy.fields.currentTools.label}
                    </label>
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
                      rows={5}
                      placeholder={accessFormCopy.fields.message.placeholder}
                      aria-invalid={fieldErrors.message ? "true" : undefined}
                      aria-describedby={fieldErrors.message ? "access-message-error" : undefined}
                      className={[
                        textAreaBaseClassName,
                        getFieldClassName(Boolean(fieldErrors.message)),
                      ].join(" ")}
                    />
                    {fieldErrors.message ? (
                      <p
                        id="access-message-error"
                        className="text-xs leading-6 text-[var(--color-gray-200)]"
                      >
                        {fieldErrors.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <Button type="submit" disabled={pending} className="w-full sm:w-auto sm:self-end">
                {pending ? accessFormCopy.pendingLabel : accessFormCopy.submitLabel}
              </Button>
              <AccessFormFooter />
            </div>
          </fieldset>
        </form>
      </div>
    </Card>
  );
}
