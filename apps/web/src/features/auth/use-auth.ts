"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthResult, LoginInput, User } from "@lifeos/shared";
import { api } from "@/lib/api";

export const meKey = ["me"] as const;

export function useMe() {
  return useQuery({ queryKey: meKey, queryFn: () => api<User>("/auth/me") });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      api<AuthResult>("/auth/login", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (res) => qc.setQueryData(meKey, res.user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>("/auth/logout", { method: "POST" }),
    onSettled: () => {
      // Drop other users' data (money, tasks…) but keep the session query alive.
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== meKey[0] });
      // Reset in place: the gate sees the 401 and redirects to /login.
      return qc.resetQueries({ queryKey: meKey });
    },
  });
}
