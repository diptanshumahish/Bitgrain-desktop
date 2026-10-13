import { signal } from "../lib/signal";
import { callApi, backendEnabled } from "../lib/api-client";
import type { TemplateDef } from "../data/studioTypes";
import type { TemplateSummary } from "../lib/template-cards/template-summary";
import { normalizeTemplateSummary, type RawTemplateRow } from "../lib/template-cards/normalize-template-summary";
import {
  hasTemplatesFailed,
  markTemplatesFailed,
  markTemplatesLoaded,
  watchForSlowLoad,
} from "./templates-network";
import { mergeUniqueTemplates, registerTemplates } from "./templates/templates-registry";
import { updateLibraryShowcase } from "./templates/library-showcase";
import {
  filterKey,
  readSnapshot,
  saveSnapshot,
  type FilterSnapshot,
} from "./templates/templates-filter-cache";

const TEMPLATES_TIMEOUT_MS = 45000;
const MIX_SEED_LENGTH = 16;
const CARD_VIEW = "card";

const BLANK_TEMPLATE: TemplateDef = {
  id: "blank-canvas",
  name: "Blank Canvas",
  free: true,
  category: "frame",
  width: 1080,
  height: 1080,
  background: "#f8fafc",
  exportScale: 2,
  layers: [],
};

interface TemplatesPage {
  data: RawTemplateRow[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  lockedTotal?: number;
  nextCursor?: string;
}

interface PageRequest {
  page: number;
  cursor: string;
  search: string;
  category: string;
}

export const templatesSignal = signal<TemplateSummary[]>([]);
export const templatesLoadingSignal = signal(false);
export const templatesReadySignal = signal(!backendEnabled);
export const templatesHasMoreSignal = signal(false);
export const templatesTotalSignal = signal(0);
export const templatesLockedTotalSignal = signal(0);

const FIRST_PAGE = 1;
const NO_CURSOR = "";
const MIX_SEED = crypto.randomUUID().replaceAll("-", "").slice(0, MIX_SEED_LENGTH);

let current: PageRequest = { page: 0, cursor: NO_CURSOR, search: "", category: "" };
let hasLoadedInitial = false;
let activeFetchToken = 0;
let inFlightKey: string | null = null;
let lastRequest: PageRequest = { page: FIRST_PAGE, cursor: NO_CURSOR, search: "", category: "" };

function buildTemplatesUrl(request: PageRequest): string {
  const params = new URLSearchParams();
  params.set("view", CARD_VIEW);
  params.set("page", String(request.page));
  params.set("seed", MIX_SEED);
  if (request.cursor) params.set("cursor", request.cursor);
  if (request.search) params.set("search", request.search);
  if (request.category) params.set("category", request.category);
  return `/api/templates?${params.toString()}`;
}

function fetchKey(request: PageRequest): string {
  return `${request.page}|${request.search}|${request.category}`;
}

function applySnapshot(snapshot: FilterSnapshot, search: string, category: string): void {
  templatesSignal.value = snapshot.templates;
  templatesHasMoreSignal.value = snapshot.hasMore;
  templatesTotalSignal.value = snapshot.total;
  templatesLockedTotalSignal.value = snapshot.lockedTotal;
  templatesReadySignal.value = true;
  current = { page: snapshot.page, cursor: snapshot.cursor, search, category };
  hasLoadedInitial = true;
}

function applyPage(result: TemplatesPage, request: PageRequest): void {
  const incoming = (result.data ?? []).map(normalizeTemplateSummary);
  registerTemplates(incoming);
  const templates =
    request.page === FIRST_PAGE ? mergeUniqueTemplates([], incoming) : mergeUniqueTemplates(templatesSignal.value, incoming);
  const snapshot: FilterSnapshot = {
    templates,
    page: request.page,
    cursor: result.nextCursor ?? NO_CURSOR,
    hasMore: result.hasMore,
    total: result.total,
    lockedTotal: result.lockedTotal ?? 0,
  };
  saveSnapshot(filterKey(request.search, request.category), snapshot);
  if (!request.search && !request.category) updateLibraryShowcase(templates, result.total);
  applySnapshot(snapshot, request.search, request.category);
}

function clearForNewFilter(): void {
  templatesSignal.value = [];
  templatesHasMoreSignal.value = false;
  templatesTotalSignal.value = 0;
  templatesLockedTotalSignal.value = 0;
  templatesReadySignal.value = !backendEnabled;
}

function cancelInFlight(): void {
  activeFetchToken += 1;
  inFlightKey = null;
  templatesLoadingSignal.value = false;
}

async function fetchPage(request: PageRequest): Promise<void> {
  if (!backendEnabled) return;
  const key = fetchKey(request);
  if (inFlightKey === key) return;

  const token = ++activeFetchToken;
  inFlightKey = key;
  lastRequest = request;
  templatesLoadingSignal.value = true;
  const stopSlowWatch = watchForSlowLoad();

  try {
    const result = await callApi<TemplatesPage>(buildTemplatesUrl(request), undefined, TEMPLATES_TIMEOUT_MS);
    if (token !== activeFetchToken) return;
    if (!result) {
      markTemplatesFailed();
      return;
    }
    markTemplatesLoaded();
    applyPage(result, request);
  } finally {
    stopSlowWatch();
    if (inFlightKey === key) inFlightKey = null;
    if (token === activeFetchToken) templatesLoadingSignal.value = false;
  }
}

function firstPage(search: string, category: string): PageRequest {
  return { page: FIRST_PAGE, cursor: NO_CURSOR, search, category };
}

export async function loadTemplates(): Promise<void> {
  if (hasLoadedInitial || !backendEnabled) return;
  await fetchPage(firstPage(current.search, current.category));
}

export async function setTemplateFilter(search: string, category: string): Promise<void> {
  const trimmedSearch = search.trim();
  const normalizedCategory = category === "all" ? "" : category;
  if (hasLoadedInitial && trimmedSearch === current.search && normalizedCategory === current.category) {
    return;
  }
  const snapshot = readSnapshot(filterKey(trimmedSearch, normalizedCategory));
  if (snapshot) {
    cancelInFlight();
    applySnapshot(snapshot, trimmedSearch, normalizedCategory);
    return;
  }
  clearForNewFilter();
  current = { ...firstPage(trimmedSearch, normalizedCategory), page: 0 };
  await fetchPage(firstPage(trimmedSearch, normalizedCategory));
}

export async function loadMoreTemplates(): Promise<void> {
  if (!templatesHasMoreSignal.value || templatesLoadingSignal.value) return;
  if (hasTemplatesFailed()) return;
  await fetchPage({ ...current, page: current.page + 1 });
}

export async function retryTemplates(): Promise<void> {
  if (templatesLoadingSignal.value) return;
  markTemplatesLoaded();
  await fetchPage(lastRequest);
}

export function getBlankTemplate(): TemplateDef {
  return BLANK_TEMPLATE;
}
