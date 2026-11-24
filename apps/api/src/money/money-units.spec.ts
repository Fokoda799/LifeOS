import {
  currencyDigits,
  formatMinor,
  minorToInput,
  parseAmount,
  sumByCurrency,
} from '@lifeos/shared';

describe('currencyDigits', () => {
  it('knows the minor-unit digits', () => {
    expect(currencyDigits('MAD')).toBe(2);
    expect(currencyDigits('JPY')).toBe(0);
    expect(currencyDigits('KWD')).toBe(3);
  });
});

describe('parseAmount', () => {
  it.each([
    ['1500', 'MAD', '150000'],
    ['1500.5', 'MAD', '150050'],
    ['1,500.25', 'MAD', '150025'],
    ['1.500,25', 'MAD', '150025'],
    ['1500,25', 'MAD', '150025'],
    ['1 500,25', 'MAD', '150025'],
    ['1\u00a0500,25', 'MAD', '150025'],
    ['١٥٠٠٫٢٥', 'MAD', '150025'],
    ['1,500', 'MAD', '150000'],
    ['12.345', 'MAD', '1234500'],
    ['0.5', 'MAD', '50'],
    ['.5', 'MAD', '50'],
    ['0', 'MAD', '0'],
    ['1,500', 'JPY', '1500'],
    ['1.5', 'KWD', '1500'],
  ])('reads %s (%s) as %s', (input, currency, expected) => {
    expect(parseAmount(input, currency)).toBe(expected);
  });

  it.each([
    '',
    'abc',
    '1.2.3',
    '1,500,25',
    '1,5000',
    '0123',
    '5.',
    '12.5.',
    '--5',
    '9999999999999999',
  ])('rejects %j', (input) => {
    expect(parseAmount(input, 'MAD')).toBeNull();
  });

  it('rejects decimals the currency does not have', () => {
    expect(parseAmount('1.5', 'JPY')).toBeNull();
  });

  it('only accepts negatives when allowed', () => {
    expect(parseAmount('-300', 'MAD')).toBeNull();
    expect(parseAmount('-300', 'MAD', { allowNegative: true })).toBe('-30000');
    expect(parseAmount('\u2212300,5', 'MAD', { allowNegative: true })).toBe(
      '-30050',
    );
    expect(parseAmount('-0', 'MAD', { allowNegative: true })).toBe('0');
  });
});

describe('minorToInput', () => {
  it.each([
    ['150025', 'MAD', '1500.25'],
    ['5', 'MAD', '0.05'],
    ['-30050', 'MAD', '-300.50'],
    ['0', 'MAD', '0.00'],
    ['1500', 'JPY', '1500'],
    ['1500', 'KWD', '1.500'],
  ])('writes %s (%s) as %s', (minor, currency, expected) => {
    expect(minorToInput(minor, currency)).toBe(expected);
  });

  it('round-trips through parseAmount', () => {
    for (const [minor, currency] of [
      ['150025', 'MAD'],
      ['-30050', 'MAD'],
      ['7', 'MAD'],
      ['1500', 'JPY'],
      ['1500', 'KWD'],
    ]) {
      expect(
        parseAmount(minorToInput(minor, currency), currency, {
          allowNegative: true,
        }),
      ).toBe(minor);
    }
  });
});

describe('formatMinor', () => {
  const plain = (s: string) => s.replace(/\s/g, '');

  it('formats with the locale, always with Latin digits', () => {
    expect(plain(formatMinor('150025', 'MAD', 'en'))).toContain('1,500.25');
    expect(plain(formatMinor('150025', 'MAD', 'fr'))).toContain('1500,25');
    expect(formatMinor('150025', 'MAD', 'ar')).toMatch(/1.?500.?25/);
  });

  it('keeps full precision beyond Number.MAX_SAFE_INTEGER', () => {
    expect(plain(formatMinor('999999999999999', 'MAD', 'en'))).toContain(
      '9,999,999,999,999.99',
    );
  });

  it('formats negatives', () => {
    expect(formatMinor('-30050', 'MAD', 'en')).toContain('300.50');
    expect(formatMinor('-30050', 'MAD', 'en')).toContain('-');
  });
});

describe('sumByCurrency', () => {
  it('sums per currency, sorted, with BigInt precision', () => {
    expect(
      sumByCurrency([
        { currency: 'MAD', amount: '100000' },
        { currency: 'EUR', amount: '5000' },
        { currency: 'MAD', amount: '-25000' },
        { currency: 'EUR', amount: '9007199254740993' },
      ]),
    ).toEqual([
      { currency: 'EUR', total: '9007199254745993' },
      { currency: 'MAD', total: '75000' },
    ]);
  });

  it('returns an empty list for no accounts', () => {
    expect(sumByCurrency([])).toEqual([]);
  });
});
