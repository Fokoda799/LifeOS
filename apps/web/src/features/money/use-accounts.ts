"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Account,
  AccountsResponse,
  CreateAccountInput,
  UpdateAccountInput,
} from "@lifeos/shared";
import { api } from "@/lib/api";

export const accountsKey = ["money", "accounts"] as const;

export function useAccounts() {
  // One request that includes archived accounts, so showing them needs no refetch.
  return useQuery({
    queryKey: accountsKey,
    queryFn: () => api<AccountsResponse>("/money/accounts?includeArchived=true"),
  });
}

function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: accountsKey });
}

export function useCreateAccount() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: (input: CreateAccountInput) =>
      api<Account>("/money/accounts", { method: "POST", body: JSON.stringify(input) }),
    onSuccess,
  });
}

export function useUpdateAccount() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) =>
      api<Account>(`/money/accounts/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess,
  });
}

export function useDeleteAccount() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/money/accounts/${id}`, { method: "DELETE" }),
    onSuccess,
  });
}
