import type { AccessPayload } from "@/lib/access/validation";
import { siteMetadata } from "@/lib/copy/product";

function buildInternalEmailText(payload: AccessPayload & { submittedAt: string }) {
  return [
    `Name: ${payload.name || "not provided"}`,
    `Email: ${payload.email}`,
    `Company: ${payload.company || "not provided"}`,
    `Interest: ${payload.interest}`,
    `Source: ${payload.source || "not provided"}`,
    `Current tools: ${payload.currentTools || "not provided"}`,
    "",
    payload.message ? `Message:\n${payload.message}` : "Message: none provided",
    "",
    `Submitted at: ${payload.submittedAt}`,
  ].join("\n");
}

function buildAutoReplyText(payload: Pick<AccessPayload, "name" | "interest">) {
  const greeting = payload.name ? `Hi ${payload.name},` : "Hi,";

  return [
    greeting,
    "",
    "Thanks for requesting pilot access to Qtangl.",
    "",
    `We received your interest in ${payload.interest.toLowerCase()}. Our team reviews requests on a rolling basis and will reply within 2 business days.`,
    "",
    "While you wait:",
    `- Explore the hospital demo: ${siteMetadata.url}/demo/hospital`,
    `- Read the docs: ${siteMetadata.url}/docs`,
    "",
    `Urgent timeline? Reply to this email or write directly to ${siteMetadata.contactEmail}.`,
    "",
    "— The Qtangl team",
    siteMetadata.url,
  ].join("\n");
}

export function buildSubjectLine(payload: Pick<AccessPayload, "company" | "email" | "interest">) {
  const label = payload.company || payload.email;
  return `Qtangl access request — ${label} (${payload.interest})`;
}

async function sendResendEmail(options: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
    }),
    cache: "no-store",
  });

  return response.ok;
}

export async function deliverAccessRequest(
  payload: AccessPayload
): Promise<{ ok: boolean; channel: "resend" | "formspree" | "console" | "none" }> {
  const submittedAt = new Date().toISOString();
  const enrichedPayload = { ...payload, submittedAt };

  if (process.env.RESEND_API_KEY && process.env.QTANGL_ACCESS_TO_EMAIL) {
    const from = process.env.QTANGL_FROM_EMAIL ?? "Qtangl Access <access@qtangl.com>";
    const subject = buildSubjectLine(payload);
    const internalOk = await sendResendEmail({
      apiKey: process.env.RESEND_API_KEY,
      from,
      to: [process.env.QTANGL_ACCESS_TO_EMAIL],
      subject,
      text: buildInternalEmailText(enrichedPayload),
    });

    if (!internalOk) {
      return { ok: false, channel: "resend" };
    }

    const autoReplyOk = await sendResendEmail({
      apiKey: process.env.RESEND_API_KEY,
      from,
      to: [payload.email],
      subject: "We received your Qtangl access request",
      text: buildAutoReplyText(payload),
    });

    if (!autoReplyOk) {
      return { ok: false, channel: "resend" };
    }

    await sendWebhook(enrichedPayload);
    return { ok: true, channel: "resend" };
  }

  if (process.env.FORMSPREE_ENDPOINT) {
    const response = await fetch(process.env.FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrichedPayload),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, channel: "formspree" };
    }

    await sendWebhook(enrichedPayload);
    return { ok: true, channel: "formspree" };
  }

  return { ok: false, channel: "none" };
}

async function sendWebhook(payload: AccessPayload & { submittedAt: string }) {
  const webhookUrl = process.env.QTANGL_ACCESS_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    // Webhook failures must not block the form.
  }
}
