import {
  DEFAULT_CATEGORIES,
  type Category,
  type CategoryColor,
  type CategoryIcon,
  type CategoryKind,
} from '@lifeos/shared';

type CategoryRow = {
  id: string;
  kind: CategoryKind;
  systemKey: string | null;
  name: string | null;
  icon: string;
  color: string;
  archivedAt: Date | null;
  createdAt: Date;
};

export function toCategoryDto(row: CategoryRow): Category {
  return {
    id: row.id,
    kind: row.kind,
    systemKey: row.systemKey,
    name: row.name,
    // Validated by the shared schemas on the way in.
    icon: row.icon as CategoryIcon,
    color: row.color as CategoryColor,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

const defaultOrder = new Map(DEFAULT_CATEGORIES.map((c, i) => [c.key, i]));

// Defaults first, in the order of DEFAULT_CATEGORIES; custom ones after, oldest first.
const rank = (r: { systemKey: string | null }) =>
  r.systemKey === null
    ? Number.POSITIVE_INFINITY
    : (defaultOrder.get(r.systemKey) ?? Number.MAX_SAFE_INTEGER);

export function sortCategories<
  T extends { systemKey: string | null; createdAt: Date },
>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra < rb ? -1 : 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}
