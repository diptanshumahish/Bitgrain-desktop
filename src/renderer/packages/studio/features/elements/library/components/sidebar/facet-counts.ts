import type { FacetCount } from "../../element-library-types";

export const countFor = (counts: FacetCount[], id: string): number =>
  counts.find((entry) => entry.id === id)?.count ?? 0;

export const sumCounts = (counts: FacetCount[]): number => counts.reduce((sum, entry) => sum + entry.count, 0);
