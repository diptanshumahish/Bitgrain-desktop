import { signal } from "../../lib/signal";
import { fetchElementCollections, fetchElementPage } from "./elements-api";
import type { ElementCard, ElementCollection, ElementKind, ElementQuery } from "./element-types";

const SEARCH_DEBOUNCE_MS = 250;

type LoadStatus = "idle" | "loading" | "ready" | "failed";

export const EMPTY_ELEMENT_QUERY: ElementQuery = { search: "", kind: "", collectionId: "" };

export const elementCollectionsSignal = signal<ElementCollection[]>([]);
export const elementCollectionsStatusSignal = signal<LoadStatus>("idle");
export const elementQuerySignal = signal<ElementQuery>(EMPTY_ELEMENT_QUERY);
export const elementResultsSignal = signal<ElementCard[]>([]);
export const elementResultsStatusSignal = signal<LoadStatus>("idle");
export const elementResultsCursorSignal = signal("");

let requestVersion = 0;
let searchTimer: ReturnType<typeof setTimeout> | null = null;

export const isBrowsingElements = (query: ElementQuery): boolean =>
  query.search === "" && query.kind === "" && query.collectionId === "";

export async function loadElementCollections(): Promise<void> {
  if (elementCollectionsStatusSignal.value === "loading" || elementCollectionsStatusSignal.value === "ready") return;
  elementCollectionsStatusSignal.value = "loading";
  const collections = await fetchElementCollections();
  elementCollectionsSignal.value = collections;
  elementCollectionsStatusSignal.value = collections.length > 0 ? "ready" : "failed";
}

async function loadResults(append: boolean): Promise<void> {
  const query = elementQuerySignal.value;
  if (isBrowsingElements(query)) return;
  const version = ++requestVersion;
  elementResultsStatusSignal.value = "loading";
  const page = await fetchElementPage(query, append ? elementResultsCursorSignal.value : "");
  if (version !== requestVersion) return;
  elementResultsSignal.value = append ? [...elementResultsSignal.value, ...page.data] : page.data;
  elementResultsCursorSignal.value = page.nextCursor;
  elementResultsStatusSignal.value = "ready";
}

function applyQuery(next: ElementQuery): void {
  elementQuerySignal.value = next;
  elementResultsSignal.value = [];
  elementResultsCursorSignal.value = "";
  void loadResults(false);
}

export function setElementSearch(search: string): void {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => applyQuery({ ...elementQuerySignal.value, search: search.trim() }), SEARCH_DEBOUNCE_MS);
}

export function setElementKind(kind: ElementKind | ""): void {
  applyQuery({ ...elementQuerySignal.value, kind });
}

export function openElementCollection(collectionId: string): void {
  applyQuery({ ...elementQuerySignal.value, collectionId });
}

export function closeElementCollection(): void {
  applyQuery({ ...elementQuerySignal.value, collectionId: "" });
}

export function loadMoreElements(): void {
  if (elementResultsCursorSignal.value === "" || elementResultsStatusSignal.value === "loading") return;
  void loadResults(true);
}
