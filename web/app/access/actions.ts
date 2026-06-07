"use server";

import { deliverAccessRequest } from "@/lib/access/delivery";
import type { AccessFormState } from "@/lib/access/form-state";
import {
  allowConsoleFallback,
  isDeliveryConfigured,
  isHoneypotTripped,
  isSubmittedTooFast,
  parseAccessForm,
  validateAccessForm,
} from "@/lib/access/validation";
import { qtanglApiBaseUrl } from "@/lib/api";
import { accessFormMessages } from "@/lib/copy/access";

async function triggerMiniAssessmentDrip(payload: {
  email: string;
  source: string;
  scenario: string;
}) {
  try {
    await fetch(`${qtanglApiBaseUrl}/public/lead-capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        source: payload.source,
        scenario: payload.scenario,
      }),
    });
  } catch {
    // Non-blocking — Resend delivery may still succeed
  }
}

export async function requestAccess(
  _previousState: AccessFormState,
  formData: FormData
): Promise<AccessFormState> {
  const payload = parseAccessForm(formData);

  if (isHoneypotTripped(payload) || isSubmittedTooFast(payload)) {
    return {
      status: "success",
      message: accessFormMessages.honeypotSuccess,
      fieldErrors: {},
      interest: payload.interest,
    };
  }

  const { fieldErrors, valid } = validateAccessForm(payload);
  if (!valid) {
    return {
      status: "error",
      message: accessFormMessages.missingFields,
      fieldErrors,
    };
  }

  if (!isDeliveryConfigured()) {
    if (allowConsoleFallback()) {
      console.info("Qtangl access request (delivery not configured)", {
        ...payload,
        submittedAt: new Date().toISOString(),
      });

      if (payload.source.startsWith("mini-assessment")) {
        await triggerMiniAssessmentDrip({
          email: payload.email,
          source: payload.source,
          scenario: payload.source.replace("mini-assessment-", "") || "default",
        });
      }

      return {
        status: "success",
        message: accessFormMessages.capturedForReview,
        fieldErrors: {},
        interest: payload.interest,
      };
    }

    return {
      status: "error",
      message: accessFormMessages.deliveryFailed,
      fieldErrors: {},
    };
  }

  const result = await deliverAccessRequest(payload);
  if (!result.ok) {
    return {
      status: "error",
      message: accessFormMessages.deliveryFailed,
      fieldErrors: {},
    };
  }

  if (payload.source.startsWith("mini-assessment")) {
    await triggerMiniAssessmentDrip({
      email: payload.email,
      source: payload.source,
      scenario: payload.source.replace("mini-assessment-", "") || "default",
    });
  }

  return {
    status: "success",
    message: accessFormMessages.success,
    fieldErrors: {},
    interest: payload.interest,
  };
}
