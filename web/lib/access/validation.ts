export type AccessFieldName =
  | "name"
  | "email"
  | "company"
  | "interest"
  | "currentTools"
  | "message";

export type AccessFieldErrors = Partial<Record<AccessFieldName, string>>;

export type AccessPayload = {
  name: string;
  email: string;
  company: string;
  interest: string;
  currentTools: string;
  message: string;
  source: string;
  website: string;
  formStartedAt: number;
};

export function parseAccessForm(formData: FormData): AccessPayload {
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    interest: String(formData.get("interest") ?? "").trim(),
    currentTools: String(formData.get("currentTools") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
    source: String(formData.get("source") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    formStartedAt: Number(formData.get("formStartedAt") ?? "0"),
  };
}

export function isHoneypotTripped(payload: Pick<AccessPayload, "website">): boolean {
  return payload.website.length > 0;
}

export function isSubmittedTooFast(payload: Pick<AccessPayload, "formStartedAt">): boolean {
  if (!payload.formStartedAt) {
    return false;
  }

  return Date.now() - payload.formStartedAt < 2000;
}

export function validateAccessForm(
  payload: Pick<AccessPayload, "email" | "interest">
): { fieldErrors: AccessFieldErrors; valid: boolean } {
  const fieldErrors: AccessFieldErrors = {};

  if (!payload.email) {
    fieldErrors.email = "Enter a work email.";
  }

  if (!payload.interest) {
    fieldErrors.interest = "Select a planning workflow.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, valid: false };
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
  if (!isValidEmail) {
    return {
      fieldErrors: { email: "Enter a valid work email." },
      valid: false,
    };
  }

  return { fieldErrors: {}, valid: true };
}

export function isDeliveryConfigured(): boolean {
  return Boolean(
    (process.env.RESEND_API_KEY && process.env.QTANGL_ACCESS_TO_EMAIL) ||
      process.env.FORMSPREE_ENDPOINT
  );
}

export function allowConsoleFallback(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.QTANGL_ACCESS_ALLOW_CONSOLE_FALLBACK === "true"
  );
}
