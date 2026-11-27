import { summarize } from './summary';

describe('summarize', () => {
  it('totals income, expense and net per currency, sorted by currency', () => {
    expect(
      summarize([
        { currency: 'MAD', type: 'income', sum: 500_000n },
        { currency: 'MAD', type: 'expense', sum: 120_050n },
        { currency: 'EUR', type: 'expense', sum: 2_000n },
      ]),
    ).toEqual([
      { currency: 'EUR', income: '0', expense: '2000', net: '-2000' },
      { currency: 'MAD', income: '500000', expense: '120050', net: '379950' },
    ]);
  });

  it('ignores transfers and returns nothing when there is nothing to total', () => {
    expect(summarize([{ currency: 'MAD', type: 'transfer', sum: 9n }])).toEqual(
      [],
    );
    expect(summarize([])).toEqual([]);
  });

  it('stays exact above 2^53', () => {
    const big = 9_007_199_254_740_993n;
    expect(
      summarize([{ currency: 'MAD', type: 'income', sum: big }])[0].income,
    ).toBe('9007199254740993');
  });
});
