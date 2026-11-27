export type OutgoingSum = {
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  sum: bigint;
};
export type IncomingSum = { accountId: string; sum: bigint };

/**
 * What the transactions add to or take from each account's opening balance.
 * Income adds. Expense and the source side of a transfer subtract. The destination of a
 * transfer adds. Balances are always computed from this, never stored.
 */
export function computeDeltas(
  outgoing: OutgoingSum[],
  incoming: IncomingSum[],
): Map<string, bigint> {
  const deltas = new Map<string, bigint>();
  const add = (id: string, amount: bigint) =>
    deltas.set(id, (deltas.get(id) ?? 0n) + amount);
  for (const r of outgoing)
    add(r.accountId, r.type === 'income' ? r.sum : -r.sum);
  for (const r of incoming) add(r.accountId, r.sum);
  return deltas;
}
