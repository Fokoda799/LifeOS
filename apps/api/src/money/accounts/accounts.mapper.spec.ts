import { toAccountDto } from './accounts.mapper';

const row = (over: Partial<Parameters<typeof toAccountDto>[0]> = {}) => ({
  id: 'c1',
  name: 'Cash',
  type: 'cash' as const,
  currency: 'MAD',
  openingBalance: 150000n,
  archivedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...over,
});

describe('toAccountDto', () => {
  it('sends amounts as strings of minor units', () => {
    const dto = toAccountDto(row());
    expect(dto.openingBalance).toBe('150000');
    expect(dto.balance).toBe('150000');
  });

  it('adds the transactions delta to the opening balance', () => {
    expect(toAccountDto(row(), -25000n).balance).toBe('125000');
  });

  it('supports a negative opening balance (card debt)', () => {
    const dto = toAccountDto(row({ openingBalance: -500000n }), 100000n);
    expect(dto.openingBalance).toBe('-500000');
    expect(dto.balance).toBe('-400000');
  });

  it('keeps full precision beyond Number.MAX_SAFE_INTEGER', () => {
    const dto = toAccountDto(row({ openingBalance: 9007199254740993n }));
    expect(dto.openingBalance).toBe('9007199254740993');
  });

  it('formats dates as ISO strings', () => {
    const dto = toAccountDto(
      row({ archivedAt: new Date('2026-02-01T10:00:00.000Z') }),
    );
    expect(dto.archivedAt).toBe('2026-02-01T10:00:00.000Z');
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(toAccountDto(row()).archivedAt).toBeNull();
  });
});
