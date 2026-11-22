"use client";

import { useMutation } from "@tanstack/react-query";
import type { ResetPasswordInput, StartVerificationInput, VerifyCodeInput } from "@lifeos/shared";
import { api } from "@/lib/api";

const json = (body: unknown) => ({ method: "POST", body: JSON.stringify(body) });

export function usePasswordForgot() {
  return useMutation({
    mutationFn: (input: StartVerificationInput) =>
      api<{ ok: true }>("/auth/password/forgot", json(input)),
  });
}

export function usePasswordVerify() {
  return useMutation({
    mutationFn: (input: VerifyCodeInput) =>
      api<{ token: string }>("/auth/password/verify", json(input)),
  });
}

export function usePasswordReset() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      api<{ ok: true }>("/auth/password/reset", json(input)),
  });
}
