import { createCategorySchema, isSingleEmoji } from '@lifeos/shared';
import { describe, expect, it } from 'vitest';

const base = { kind: 'expense', name: 'Pets', color: 'teal' } as const;

describe('category icon', () => {
  it('accepts a single emoji, including skin tones, flags and ZWJ sequences', () => {
    for (const e of ['🐶', '✈️', '👍🏽', '🇲🇦', '👨‍👩‍👧', '🕌'])
      expect(isSingleEmoji(e)).toBe(true);
  });

  it('rejects text, digits, several emojis and empty values', () => {
    for (const v of ['', 'a', '1', 'cart!', '🐶🐱', '🐶 ', ' '])
      expect(isSingleEmoji(v)).toBe(false);
  });

  it('is accepted by the create schema next to the icon keys', () => {
    expect(
      createCategorySchema.safeParse({ ...base, icon: '🐶' }).success,
    ).toBe(true);
    expect(
      createCategorySchema.safeParse({ ...base, icon: 'pet' }).success,
    ).toBe(true);
    expect(
      createCategorySchema.safeParse({ ...base, icon: 'unknown-key' }).success,
    ).toBe(false);
    expect(
      createCategorySchema.safeParse({ ...base, icon: '🐶🐱' }).success,
    ).toBe(false);
  });
});
