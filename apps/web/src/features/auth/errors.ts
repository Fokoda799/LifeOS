import type { FieldError } from "react-hook-form";
import { ApiRequestError } from "@/lib/api";

export type ValidationKey = "required" | "email" | "passwordMin" | "tooLong" | "invalid";

export function validationKey(
  error: FieldError | undefined,
  opts?: { tooSmall?: ValidationKey },
): ValidationKey | undefined {
  if (!error) return undefined;
  switch (error.type) {
    case "too_small":
      return opts?.tooSmall ?? "required";
    case "too_big":
      return "tooLong";
    case "invalid_format":
      return "email";
    default:
      return "invalid";
  }
}

export type ApiErrorKey = "invalidCredentials" | "emailTaken" | "network" | "generic";

export function apiErrorKey(error: unknown): ApiErrorKey {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) return "invalidCredentials";
    if (error.status === 409) return "emailTaken";
    return "generic";
  }
  return "network";
}
