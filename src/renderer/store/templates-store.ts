import { signal } from "../lib/signal";
import { callApi, backendEnabled } from "../lib/api-client";
import { toTemplateDef, type ApiTemplate } from "../lib/templates-api";
import { scaleTemplateToMin } from "../data/templates/scale-template";
import type { TemplateDef } from "../data/studioTypes";

const TARGET_LONGEST_SIDE = 1080;

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

const upscale = (template: TemplateDef): TemplateDef =>
  scaleTemplateToMin(template, TARGET_LONGEST_SIDE);

interface TemplatesPage {
  data: ApiTemplate[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export const templatesSignal = signal<TemplateDef[]>([]);
export const templatesLoadingSignal = signal(false);
export const templatesHasMoreSignal = signal(false);

const FIRST_PAGE = 1;

let currentPage = 0;
let currentSearch = "";
let currentCategory = "";
let hasLoadedInitial = false;
let activeFetchToken = 0;
let inFlightKey: string | null = null;

function buildTemplatesUrl(page: number, search: string, category: string): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  return `/api/templates?${params.toString()}`;
}

function fetchKey(page: number, search: string, category: string): string {
  return `${page}|${search}|${category}`;
}

async function fetchPage(page: number, search: string, category: string): Promise<void> {
  if (!backendEnabled) return;
  const key = fetchKey(page, search, category);
  if (inFlightKey === key) return;

  const token = ++activeFetchToken;
  inFlightKey = key;
  templatesLoadingSignal.value = true;

  try {
    const result = await callApi<TemplatesPage>(buildTemplatesUrl(page, search, category));

    if (token !== activeFetchToken) return;

    if (!result) {
      if (page === FIRST_PAGE) {
        templatesSignal.value = [];
        templatesHasMoreSignal.value = false;
      }
      return;
    }

    const incoming = result.data.map((t) => upscale(toTemplateDef(t)));

    if (page === FIRST_PAGE) {
      templatesSignal.value = incoming;
    } else {
      templatesSignal.value = [...templatesSignal.value, ...incoming];
    }

    currentPage = result.page;
    currentSearch = search;
    currentCategory = category;
    hasLoadedInitial = true;
    templatesHasMoreSignal.value = result.hasMore;
  } finally {
    if (inFlightKey === key) inFlightKey = null;
    if (token === activeFetchToken) templatesLoadingSignal.value = false;
  }
}

export async function loadTemplates(): Promise<void> {
  if (hasLoadedInitial || !backendEnabled) return;
  await fetchPage(FIRST_PAGE, currentSearch, currentCategory);
}

export async function setTemplateFilter(search: string, category: string): Promise<void> {
  const trimmedSearch = search.trim();
  const normalizedCategory = category === "all" ? "" : category;
  if (
    hasLoadedInitial &&
    trimmedSearch === currentSearch &&
    normalizedCategory === currentCategory
  ) {
    return;
  }
  await fetchPage(FIRST_PAGE, trimmedSearch, normalizedCategory);
}

export async function loadMoreTemplates(): Promise<void> {
  if (!templatesHasMoreSignal.value || templatesLoadingSignal.value) return;
  await fetchPage(currentPage + 1, currentSearch, currentCategory);
}

export function getBlankTemplate(): TemplateDef {
  return BLANK_TEMPLATE;
}
