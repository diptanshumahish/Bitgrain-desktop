import type { ElementCard, ElementKind } from "../element-types";

export type LibrarySort = "featured" | "newest" | "name";

export interface LibraryQuery {
  search: string;
  kind: ElementKind | "";
  collectionId: string;
  sort: LibrarySort;
  page: number;
}

export type LibraryOpenRequest = Partial<Pick<LibraryQuery, "search" | "kind" | "collectionId">>;

export interface LibraryPage {
  data: ElementCard[];
  total: number;
}

export interface FacetCount {
  id: string;
  count: number;
}

export interface LibraryFacets {
  kinds: FacetCount[];
  collections: FacetCount[];
}
