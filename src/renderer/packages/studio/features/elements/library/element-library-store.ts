import { signal } from "@bitgrain/core/signal";
import { loadElementCollections } from "../elements-store";
import type { ElementCard, ElementKind, LoadStatus } from "../element-types";
import { fetchLibraryFacets, fetchLibraryPage } from "./element-library-api";
import type { LibraryFacets, LibraryOpenRequest, LibraryQuery, LibrarySort } from "./element-library-types";

const SEARCH_DEBOUNCE_MS = 250;

const DEFAULT_LIBRARY_QUERY: LibraryQuery = { search: "", kind: "", collectionId: "", sort: "featured", page: 1 };
const EMPTY_FACETS: LibraryFacets = { kinds: [], collections: [] };

export const libraryOpenSignal = signal(false);
export const libraryQuerySignal = signal<LibraryQuery>(DEFAULT_LIBRARY_QUERY);
export const libraryResultsSignal = signal<ElementCard[]>([]);
export const libraryTotalSignal = signal(0);
export const libraryStatusSignal = signal<LoadStatus>("idle");
export const libraryFacetsSignal = signal<LibraryFacets>(EMPTY_FACETS);
export const libraryCollectionFilterSignal = signal("");

let pageVersion = 0;
let facetVersion = 0;
let searchTimer: ReturnType<typeof setTimeout> | null = null;

async function loadLibraryPage(): Promise<void> {
  const version = ++pageVersion;
  libraryStatusSignal.value = "loading";
  const page = await fetchLibraryPage(libraryQuerySignal.value);
  if (version !== pageVersion) return;
  if (!page) {
    libraryStatusSignal.value = "failed";
    return;
  }
  libraryResultsSignal.value = page.data;
  libraryTotalSignal.value = page.total;
  libraryStatusSignal.value = "ready";
}

async function loadLibraryFacets(): Promise<void> {
  const version = ++facetVersion;
  const facets = await fetchLibraryFacets(libraryQuerySignal.value);
  if (version !== facetVersion || !facets) return;
  libraryFacetsSignal.value = facets;
}

function applyFilters(next: LibraryQuery): void {
  libraryQuerySignal.value = { ...next, page: 1 };
  void loadLibraryPage();
  void loadLibraryFacets();
}

function cancelPendingSearch(): void {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = null;
}

export function openElementLibrary(request: LibraryOpenRequest): void {
  libraryOpenSignal.value = true;
  libraryCollectionFilterSignal.value = "";
  void loadElementCollections();
  applyFilters({ ...DEFAULT_LIBRARY_QUERY, ...request });
}

export function closeElementLibrary(): void {
  cancelPendingSearch();
  libraryOpenSignal.value = false;
}

export function setLibrarySearch(search: string): void {
  cancelPendingSearch();
  searchTimer = setTimeout(() => applyFilters({ ...libraryQuerySignal.value, search: search.trim() }), SEARCH_DEBOUNCE_MS);
}

export function clearLibrarySearch(): void {
  cancelPendingSearch();
  applyFilters({ ...libraryQuerySignal.value, search: "" });
}

export function setLibraryKind(kind: ElementKind | ""): void {
  applyFilters({ ...libraryQuerySignal.value, kind });
}

export function setLibraryCollection(collectionId: string): void {
  applyFilters({ ...libraryQuerySignal.value, collectionId });
}

export function clearLibraryFilters(): void {
  cancelPendingSearch();
  applyFilters({ ...DEFAULT_LIBRARY_QUERY, sort: libraryQuerySignal.value.sort });
}

export function setLibrarySort(sort: LibrarySort): void {
  libraryQuerySignal.value = { ...libraryQuerySignal.value, sort, page: 1 };
  void loadLibraryPage();
}

export function setLibraryPage(page: number): void {
  libraryQuerySignal.value = { ...libraryQuerySignal.value, page };
  void loadLibraryPage();
}

export function retryLibrary(): void {
  void loadLibraryPage();
  void loadLibraryFacets();
}
