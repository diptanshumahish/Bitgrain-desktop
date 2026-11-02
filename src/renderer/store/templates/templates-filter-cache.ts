import type { TemplateSummary } from "../../lib/template-cards/template-summary";

export interface FilterSnapshot {
  templates: TemplateSummary[];
  page: number;
  cursor: string;
  hasMore: boolean;
  total: number;
  lockedTotal: number;
}

const snapshots = new Map<string, FilterSnapshot>();

export function filterKey(search: string, category: string): string {
  return `${search}|${category}`;
}

export function saveSnapshot(key: string, snapshot: FilterSnapshot): void {
  snapshots.set(key, snapshot);
}

export function readSnapshot(key: string): FilterSnapshot | undefined {
  return snapshots.get(key);
}
