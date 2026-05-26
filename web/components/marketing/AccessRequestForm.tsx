"use client";

import { useActionState, useEffect, useRef } from "react";

import type { AccessFormState } from "@/app/access/actions";
import { requestAccess } from "@/app/access/actions";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const fieldBaseClassName =
  "h-12 rounded-xl border bg-black px-4 text-sm text-white outline-none transition placeholder:text-[var(--color-gray-500)]";

const textAreaBaseClassName =
  "rounded-xl border bg-black px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-[var(--color-gray-500)]";

const initialAccessFormState: AccessFormState = {
  status: "idle",
  message: "Priority access is currently open for design partners and technical evaluation teams.",
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
  const statusMessage = pending ? "Submitting access request." : formState.message;

  useEffect(() => {
    if (formState.status !== "error") {
      return;
    }

    const firstInvalidField = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalidField?.focus();
  }, [formState.status, fieldErrors]);

  if (formState.status === "success") {
    return (
      <Card strong className="rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6">
          <Eyebrow>Request received</Eyebrow>
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Access request submitted
          </h2>
          <p className="text-base leading-8 text-[var(--color-gray-300)]">{formState.message}</p>
          <div
            className="rounded-[1.5rem] border border-[var(--border)] bg-white/[0.03] p-5 text-sm leading-7 text-[var(--color-gray-300)]"
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
    <Card strong className="rounded-[2rem] p-6 sm:p-8 lg:p-10">
      <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>Access interface</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Request pilot access
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            Share the workflow you want to improve and the systems you already use.
            Qtangl prioritizes teams with clear scheduling, routing, allocation, and
            operational planning use cases.
          </p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[var(--color-gray-400)]">
            <p>
              Strong submissions explain the planning problem, the system context,
              the operational constraints that matter most, and the current tooling
              stack.
            </p>
            <p>
              We currently prioritize design partners, API evaluation teams, and
              operations-heavy organizations preparing for a pilot.
            </p>
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
              className="text-sm leading-7 text-[var(--color-gray-400)]"
              aria-live={statusIsError ? "assertive" : "polite"}
              role={statusIsError ? "alert" : "status"}
            >
              {statusMessage}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Name"
                name="name"
                placeholder="Ada Lovelace"
                required
                error={fieldErrors.name}
              />
              <Input
                label="Work email"
                name="email"
                type="email"
                placeholder="ada@company.com"
                required
                error={fieldErrors.email}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Company"
                name="company"
                placeholder="Example Systems"
                required
                error={fieldErrors.company}
              />
              <div className="grid gap-2 text-sm text-[var(--color-gray-300)]">
                <label htmlFor="access-interest">Interest area</label>
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
                    Select
                  </option>
                  <option value="Scheduling optimization">Scheduling optimization</option>
                  <option value="Routing optimization">Routing optimization</option>
                  <option value="Resource allocation">Resource allocation</option>
                  <option value="Developer platform">Developer platform</option>
                  <option value="Research collaboration">Research collaboration</option>
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
              <label htmlFor="access-currentTools">Current tools</label>
              <input
                id="access-currentTools"
                name="currentTools"
                placeholder="Procore, spreadsheets, Samsara, Smartsheet..."
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
              <label htmlFor="access-message">System context</label>
              <textarea
                id="access-message"
                name="message"
                rows={6}
                placeholder="Describe the planning problem, system constraints, or API integration context."
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

            <div className="flex flex-col gap-4 pt-2 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm leading-7 text-[var(--color-gray-400)]">
                Required fields are checked after submission so assistive technology can
                report the exact issues.
              </p>
              <Button type="submit" disabled={pending} className="w-full lg:w-auto">
                {pending ? "Submitting..." : "Request Access"}
              </Button>
            </div>
          </fieldset>
        </form>
      </div>
    </Card>
  );
}
