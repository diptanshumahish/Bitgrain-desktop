import React from "react";
import { Search } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { elementCollectionsSignal } from "../../../elements-store";
import {
  libraryCollectionFilterSignal,
  libraryFacetsSignal,
  libraryQuerySignal,
  setLibraryCollection,
} from "../../element-library-store";
import { countFor, sumCounts } from "./facet-counts";
import { FacetRow } from "./facet-row";

const FILTER_THRESHOLD = 8;

export const LibraryCollectionList: React.FC = () => {
  const query = useSignalValue(libraryQuerySignal);
  const facets = useSignalValue(libraryFacetsSignal);
  const collections = useSignalValue(elementCollectionsSignal);
  const filter = useSignalValue(libraryCollectionFilterSignal).trim().toLowerCase();
  const visible = collections.filter(
    (collection) =>
      (collection.id === query.collectionId || countFor(facets.collections, collection.id) > 0) &&
      collection.name.toLowerCase().includes(filter),
  );

  return (
    <section className="flex flex-col gap-0.5" aria-label="Collections">
      <h3 className="px-2.5 pb-1.5 text-[11.5px] font-semibold text-[var(--s-text-subtle)]">Collections</h3>
      {collections.length > FILTER_THRESHOLD && (
        <label className="mb-1.5 h-8 flex items-center gap-2 px-2.5 rounded-md bg-[var(--s-bg-input)] ring-1 ring-transparent focus-within:ring-[var(--s-text-subtle)]">
          <Search size={12} strokeWidth={1.75} className="text-[var(--s-text-subtle)]" />
          <input
            type="search"
            aria-label="Find a collection"
            placeholder="Find a collection"
            onChange={(event) => (libraryCollectionFilterSignal.value = event.target.value)}
            className="flex-1 min-w-0 bg-transparent border-none outline-none focus-visible:outline-none! text-[11.5px] text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)]"
          />
        </label>
      )}
      <FacetRow
        label="All collections"
        count={sumCounts(facets.collections)}
        isActive={query.collectionId === ""}
        onSelect={() => setLibraryCollection("")}
      />
      {visible.map((collection) => (
        <FacetRow
          key={collection.id}
          label={collection.name}
          count={countFor(facets.collections, collection.id)}
          isActive={query.collectionId === collection.id}
          onSelect={() => setLibraryCollection(collection.id)}
        />
      ))}
      {visible.length === 0 && filter !== "" && (
        <p className="px-2.5 py-2 text-[11.5px] text-[var(--s-text-subtle)]">No collection by that name.</p>
      )}
    </section>
  );
};
