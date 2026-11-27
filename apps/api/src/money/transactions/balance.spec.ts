import { computeDeltas } from './balance';

describe('computeDeltas', () => {
  it('adds income and subtracts expenses', () => {
    const d = computeDeltas(
      [
        { accountId: 'a', type: 'income', sum: 10_000n },
        { accountId: 'a', type: 'expense', sum: 2_500n },
      ],
      [],
    );
    expect(d.get('a')).toBe(7_500n);
  });

  it('moves a transfer out of the source and into the destination', () => {
    const d = computeDeltas(
      [{ accountId: 'a', type: 'transfer', sum: 4_000n }],
      [{ accountId: 'b', sum: 4_000n }],
    );
    expect(d.get('a')).toBe(-4_000n);
    expect(d.get('b')).toBe(4_000n);
  });

  it('combines everything that touches one account and leaves others out', () => {
    const d = computeDeltas(
      [
        { accountId: 'a', type: 'income', sum: 1_000n },
        { accountId: 'a', type: 'transfer', sum: 300n },
      ],
      [{ accountId: 'a', sum: 50n }],
    );
    expect(d.get('a')).toBe(750n);
    expect(d.has('z')).toBe(false);
  });

  it('is exact above 2^53', () => {
    const big = 9_007_199_254_740_993n;
    const d = computeDeltas([{ accountId: 'a', type: 'income', sum: big }], []);
    expect(d.get('a')).toBe(big);
  });
});
