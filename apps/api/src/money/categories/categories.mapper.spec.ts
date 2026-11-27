import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_CATEGORIES,
} from '@lifeos/shared';
import { sortCategories, toCategoryDto } from './categories.mapper';

describe('default categories', () => {
  it('have unique keys and valid icons and colors', () => {
    const keys = DEFAULT_CATEGORIES.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const c of DEFAULT_CATEGORIES) {
      expect(CATEGORY_ICONS).toContain(c.icon);
      expect(CATEGORY_COLORS).toContain(c.color);
    }
  });

  it('cover both kinds', () => {
    const kinds = new Set(DEFAULT_CATEGORIES.map((c) => c.kind));
    expect(kinds).toEqual(new Set(['expense', 'income']));
  });
});

describe('toCategoryDto', () => {
  it('formats dates and keeps a null name for untouched defaults', () => {
    const dto = toCategoryDto({
      id: 'c1',
      kind: 'expense',
      systemKey: 'groceries',
      name: null,
      icon: 'cart',
      color: 'green',
      archivedAt: new Date('2026-02-01T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(dto.name).toBeNull();
    expect(dto.archivedAt).toBe('2026-02-01T00:00:00.000Z');
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('sortCategories', () => {
  const at = (d: string) => new Date(`2026-01-${d}T00:00:00.000Z`);

  it('puts defaults first in their defined order, then custom ones oldest first', () => {
    const rows = [
      { id: 'custom-new', systemKey: null, createdAt: at('05') },
      { id: 'salary', systemKey: 'salary', createdAt: at('01') },
      { id: 'custom-old', systemKey: null, createdAt: at('02') },
      { id: 'groceries', systemKey: 'groceries', createdAt: at('01') },
    ];
    expect(sortCategories(rows).map((r) => r.id)).toEqual([
      'groceries',
      'salary',
      'custom-old',
      'custom-new',
    ]);
  });

  it('does not change the input array', () => {
    const rows = [
      { id: 'b', systemKey: null, createdAt: at('02') },
      { id: 'a', systemKey: 'groceries', createdAt: at('01') },
    ];
    sortCategories(rows);
    expect(rows[0].id).toBe('b');
  });
});
