import { normalizeInsights } from "./insights/normalize-insights";
import type { RawTemplateDetail, TemplateDetail } from "./template-detail-types";

const MIN_PAGE_COUNT = 1;

export function normalizeTemplateDetail(row: RawTemplateDetail): TemplateDetail {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    width: row.width ?? 0,
    height: row.height ?? 0,
    thumbnail: row.thumbnail ?? null,
    pageCount: Math.max(MIN_PAGE_COUNT, row.pageCount ?? MIN_PAGE_COUNT),
    description: row.description?.trim() ?? "",
    useCases: row.useCases ?? [],
    tags: row.tags ?? [],
    insights: normalizeInsights(row.insights),
    addedAt: row.addedAt ?? null,
  };
}
