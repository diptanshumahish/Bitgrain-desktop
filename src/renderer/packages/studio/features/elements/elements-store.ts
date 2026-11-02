import { signal } from "@bitgrain/core/signal";
import { fetchElementCollections, fetchElementPage } from "./elements-api";
import type { ElementCard, ElementCollection, ElementKind, ElementQuery, LoadStatus } from "./element-types";

const SEARCH_DEBOUNCE_MS = 250;

const EMPTY_ELEMENT_QUERY: ElementQuery = { search: "", kind: "" };

export const elementCollectionsSignal = signal<ElementCollection[]>([]);
export const elementCollectionsStatusSignal = signal<LoadStatus>("idle");
export const elementQuerySignal = signal<ElementQuery>(EMPTY_ELEMENT_QUERY);
export const elementResultsSignal = signal<ElementCard[]>([]);
export const elementResultsStatusSignal = signal<LoadStatus>("idle");
export const elementResultsCursorSignal = signal("");

let requestVersion = 0;
let searchTimer: ReturnType<typeof setTimeout> | null = null;

export const isBrowsingElements = (query: ElementQuery): boolean => query.search === "" && query.kind === "";

export async function loadElementCollections(): Promise<void> {
  if (elementCollectionsStatusSignal.value === "loading" || elementCollectionsStatusSignal.value === "ready") return;
  elementCollectionsStatusSignal.value = "loading";
  const collections = await fetchElementCollections();
  elementCollectionsSignal.value = collections;
  elementCollectionsStatusSignal.value = collections.length > 0 ? "ready" : "failed";
}

async function loadResults(): Promise<void> {
  const query = elementQuerySignal.value;
  if (isBrowsingElements(query)) return;
  const version = ++requestVersion;
  elementResultsStatusSignal.value = "loading";
  const page = await fetchElementPage(query);
  if (version !== requestVersion) return;
  elementResultsSignal.value = page.data;
  elementResultsCursorSignal.value = page.nextCursor;
  elementResultsStatusSignal.value = "ready";
}

function applyQuery(next: ElementQuery): void {
  elementQuerySignal.value = next;
  elementResultsSignal.value = [];
  elementResultsCursorSignal.value = "";
  void loadResults();
}

export function setElementSearch(search: string): void {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => applyQuery({ ...elementQuerySignal.value, search: search.trim() }), SEARCH_DEBOUNCE_MS);
}

export function setElementKind(kind: ElementKind | ""): void {
  applyQuery({ ...elementQuerySignal.value, kind });
}
