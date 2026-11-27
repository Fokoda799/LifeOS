"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTransactionInput,
  Transaction,
  TransactionFilters,
  TransactionsResponse,
  TransactionsSummary,
  UpdateTransactionInput,
} from "@lifeos/shared";
import { accountsKey } from "@/features/money/accounts/use-accounts";
import { api } from "@/lib/api";

export const transactionsKey = ["money", "transactions"] as const;

export type { TransactionFilters };

function filterParams(filters: TransactionFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return params;
}

export function useTransactions(filters: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: [...transactionsKey, "list", filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = filterParams(filters);
      params.set("limit", "50");
      if (pageParam) params.set("cursor", pageParam);
      return api<TransactionsResponse>(`/money/transactions?${params}`);
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

/** Income, expense and net for the same filters, exact across all pages. */
export function useTransactionsSummary(filters: TransactionFilters) {
  return useQuery({
    queryKey: [...transactionsKey, "summary", filters],
    queryFn: () => api<TransactionsSummary>(`/money/transactions/summary?${filterParams(filters)}`),
  });
}

/** A transaction changes account balances too, so both lists are refetched. */
function useRefresh() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: transactionsKey }),
      qc.invalidateQueries({ queryKey: accountsKey }),
    ]);
}

export function useCreateTransaction() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      api<Transaction>("/money/transactions", { method: "POST", body: JSON.stringify(input) }),
    onSuccess,
  });
}

export function useUpdateTransaction() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTransactionInput }) =>
      api<Transaction>(`/money/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess,
  });
}

export function useDeleteTransaction() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/money/transactions/${id}`, { method: "DELETE" }),
    onSuccess,
  });
}
