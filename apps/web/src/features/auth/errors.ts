import type { FieldError } from "react-hook-form";
import { ApiRequestError } from "@/lib/api";

export type ValidationKey = "required" | "email" | "passwordMin" | "tooLong" | "invalid" | "code";

export function validationKey(
  error: FieldError | undefined,
  opts?: { tooSmall?: ValidationKey; invalidFormat?: ValidationKey },
): ValidationKey | undefined {
  if (!error) return undefined;
  switch (error.type) {
    case "too_small":
      return opts?.tooSmall ?? "required";
    case "too_big":
      return "tooLong";
    case "invalid_format":
      return opts?.invalidFormat ?? "email";
    default:
      return "invalid";
  }
}

export type ApiErrorKey =
  "invalidCredentials" | "emailTaken" | "invalidCode" | "sessionExpired" | "network" | "generic";

/** `onBadRequest` says what a 400 means on the current screen. */
export function apiErrorKey(error: unknown, onBadRequest: ApiErrorKey = "generic"): ApiErrorKey {
  if (error instanceof ApiRequestError) {
    if (error.status === 400) return onBadRequest;
    if (error.status === 401) return "invalidCredentials";
    if (error.status === 409) return "emailTaken";
    return "generic";
  }
  return "network";
}
