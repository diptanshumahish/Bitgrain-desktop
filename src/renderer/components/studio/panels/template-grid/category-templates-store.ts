import { signal } from "../../../../lib/signal";
import { callApi } from "../../../../lib/api-client";
import type { TemplateSummary } from "../../../../lib/template-cards/template-summary";
import { normalizeTemplateSummary, type RawTemplateRow } from "../../../../lib/template-cards/normalize-template-summary";
import { mergeUniqueTemplates, registerTemplates } from "../../../../store/templates/templates-registry";

const CATEGORY_TIMEOUT_MS = 45000;
const CARD_VIEW = "card";
const FIRST_PAGE = 1;

interface CategoryPageResponse {
  data: RawTemplateRow[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export type CategoryStatus = "idle" | "loading" | "ready" | "failed";

export interface CategoryState {
  items: TemplateSummary[];
  page: number;
  cursor: string;
  hasMore: boolean;
  total: number;
  status: CategoryStatus;
}

const EMPTY_STATE: CategoryState = { items: [], page: 0, cursor: "", hasMore: true, total: 0, status: "idle" };

export const categoryTemplatesSignal = signal<Record<string, CategoryState>>({});

export const readCategory = (key: string): CategoryState => categoryTemplatesSignal.value[key] ?? EMPTY_STATE;

const writeCategory = (key: string, patch: Partial<CategoryState>): void => {
  categoryTemplatesSignal.value = { ...categoryTemplatesSignal.value, [key]: { ...readCategory(key), ...patch } };
};

const buildUrl = (key: string, state: CategoryState): string => {
  const params = new URLSearchParams({ view: CARD_VIEW, category: key, page: String(state.page + 1) });
  if (state.cursor) params.set("cursor", state.cursor);
  return `/api/templates?${params.toString()}`;
};

const applyCategoryPage = (key: string, state: CategoryState, result: CategoryPageResponse): void => {
  const incoming = (result.data ?? []).map(normalizeTemplateSummary);
  registerTemplates(incoming);
  writeCategory(key, {
    items: state.page + 1 === FIRST_PAGE ? incoming : mergeUniqueTemplates(state.items, incoming),
    page: state.page + 1,
    cursor: result.nextCursor ?? "",
    hasMore: result.hasMore,
    total: result.total,
    status: "ready",
  });
};

export async function loadCategoryPage(key: string): Promise<void> {
  const state = readCategory(key);
  if (state.status === "loading" || !state.hasMore) return;
  writeCategory(key, { status: "loading" });
  const result = await callApi<CategoryPageResponse>(buildUrl(key, state), undefined, CATEGORY_TIMEOUT_MS);
  if (!result) {
    writeCategory(key, { status: "failed" });
    return;
  }
  applyCategoryPage(key, state, result);
}
