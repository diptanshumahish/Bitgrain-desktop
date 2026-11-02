import { callApi } from "@bitgrain/api/api-client";
import type { LibraryFacets, LibraryPage, LibraryQuery } from "./element-library-types";

export const LIBRARY_PAGE_SIZE = 48;

const filterParams = (query: LibraryQuery): Record<string, string> => ({
  q: query.search,
  kind: query.kind,
  collection: query.collectionId,
});

export async function fetchLibraryPage(query: LibraryQuery): Promise<LibraryPage | null> {
  const offset = (query.page - 1) * LIBRARY_PAGE_SIZE;
  const params = new URLSearchParams({
    ...filterParams(query),
    sort: query.sort,
    limit: String(LIBRARY_PAGE_SIZE),
    cursor: String(offset),
  });
  const response = await callApi<LibraryPage>(`/api/elements?${params.toString()}`);
  return response ? { data: response.data, total: response.total ?? 0 } : null;
}

export async function fetchLibraryFacets(query: LibraryQuery): Promise<LibraryFacets | null> {
  const params = new URLSearchParams(filterParams(query));
  return callApi<LibraryFacets>(`/api/element-facets?${params.toString()}`);
}
