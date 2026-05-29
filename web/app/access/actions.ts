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
import { accessFormMessages } from "@/lib/copy/access";

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

  return {
    status: "success",
    message: accessFormMessages.success,
    fieldErrors: {},
    interest: payload.interest,
  };
}
