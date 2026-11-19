"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateProfileInput, User } from "@lifeos/shared";
import { meKey } from "@/features/auth/use-auth";
import { api } from "@/lib/api";

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      api<User>("/users/me", { method: "PATCH", body: JSON.stringify(input) }),
    // The sidebar, menu and forms all read `me`, so they update at once.
    onSuccess: (user) => qc.setQueryData(meKey, user),
  });
}
