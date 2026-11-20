"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AuthResult,
  RegisterCompleteInput,
  StartVerificationInput,
  VerifyCodeInput,
} from "@lifeos/shared";
import { api } from "@/lib/api";
import { meKey } from "./use-auth";

const json = (body: unknown) => ({ method: "POST", body: JSON.stringify(body) });

export function useRegisterStart() {
  return useMutation({
    mutationFn: (input: StartVerificationInput) =>
      api<{ ok: true }>("/auth/register/start", json(input)),
  });
}

export function useRegisterVerify() {
  return useMutation({
    mutationFn: (input: VerifyCodeInput) =>
      api<{ token: string }>("/auth/register/verify", json(input)),
  });
}

export function useRegisterComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterCompleteInput) =>
      api<AuthResult>("/auth/register/complete", json(input)),
    onSuccess: (res) => qc.setQueryData(meKey, res.user),
  });
}
