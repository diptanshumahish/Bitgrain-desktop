import React from "react";
import { X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { elementCollectionsSignal } from "../../elements-store";
import { kindLabel } from "../../element-kinds";
import {
  clearLibraryFilters,
  clearLibrarySearch,
  libraryQuerySignal,
  libraryStatusSignal,
  libraryTotalSignal,
  setLibraryCollection,
  setLibraryKind,
} from "../element-library-store";
import { FilterChip } from "./filter-chip";

export const LibraryActiveFilters: React.FC = () => {
  const query = useSignalValue(libraryQuerySignal);
  const total = useSignalValue(libraryTotalSignal);
  const status = useSignalValue(libraryStatusSignal);
  const collection = useSignalValue(elementCollectionsSignal).find((candidate) => candidate.id === query.collectionId);
  const hasFilters = query.search !== "" || query.kind !== "" || query.collectionId !== "";

  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-5 pb-2 shrink-0">
      {status === "loading" && total === 0 && (
        <span className="mr-1 text-[12px] font-medium text-[var(--s-text-muted)]">Searching</span>
      )}
      {query.search && <FilterChip label={`"${query.search}"`} onRemove={clearLibrarySearch} />}
      {query.kind && <FilterChip label={kindLabel(query.kind)} onRemove={() => setLibraryKind("")} />}
      {query.collectionId && (
        <FilterChip label={collection?.name ?? query.collectionId} onRemove={() => setLibraryCollection("")} />
      )}
      {hasFilters && (
        <button
          type="button"
          onClick={clearLibraryFilters}
          className="h-7 flex items-center gap-1 px-2 text-[11.5px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
        >
          <X size={12} strokeWidth={2} />
          Clear all
        </button>
      )}
    </div>
  );
};
