import { accessFormMessages } from "@/lib/copy/access";
import type { AccessFieldErrors } from "@/lib/access/validation";

export type AccessFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: AccessFieldErrors;
  interest?: string;
};

export const initialAccessFormState: AccessFormState = {
  status: "idle",
  message: accessFormMessages.initial,
  fieldErrors: {},
};
