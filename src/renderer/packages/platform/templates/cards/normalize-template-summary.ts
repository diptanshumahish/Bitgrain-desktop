import type { TemplateSummary } from "./template-summary";

interface LegacyTemplateData {
  width?: number;
  height?: number;
  tags?: string[];
  pages?: unknown[];
  addedAt?: string;
}

export interface RawTemplateRow extends Partial<TemplateSummary> {
  id: string;
  name: string;
  category: TemplateSummary["category"];
  data?: LegacyTemplateData;
}

const MIN_PAGE_COUNT = 1;

const numberOr = (value: number | undefined, fallback: number | undefined): number =>
  typeof value === "number" ? value : (fallback ?? 0);

export function normalizeTemplateSummary(row: RawTemplateRow): TemplateSummary {
  const legacy = row.data ?? {};
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    width: numberOr(row.width, legacy.width),
    height: numberOr(row.height, legacy.height),
    thumbnail: row.thumbnail ?? null,
    pageCount: Math.max(MIN_PAGE_COUNT, row.pageCount ?? legacy.pages?.length ?? MIN_PAGE_COUNT),
    isFree: row.isFree ?? false,
    featured: row.featured ?? false,
    isNew: row.isNew ?? false,
    tags: row.tags ?? legacy.tags ?? [],
    addedAt: row.addedAt ?? legacy.addedAt ?? null,
  };
}
