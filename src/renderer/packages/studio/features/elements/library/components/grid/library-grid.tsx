import React, { useEffect, useMemo, useRef } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { elementCollectionsSignal } from "../../../elements-store";
import {
  clearLibraryFilters,
  libraryQuerySignal,
  libraryResultsSignal,
  libraryStatusSignal,
  retryLibrary,
} from "../../element-library-store";
import { LibraryTile } from "./library-tile";
import { LibrarySkeleton } from "./library-skeleton";
import { LibraryGridMessage } from "./library-grid-message";

const LibraryGridBody: React.FC = () => {
  const results = useSignalValue(libraryResultsSignal);
  const status = useSignalValue(libraryStatusSignal);
  const collections = useSignalValue(elementCollectionsSignal);
  const collectionNames = useMemo(
    () => new Map(collections.map((collection) => [collection.id, collection.name])),
    [collections],
  );

  if (status === "failed") {
    return <LibraryGridMessage title="The library did not load" detail="Check your connection and try again." actionLabel="Try again" onAction={retryLibrary} />;
  }
  if (results.length === 0 && status === "ready") {
    return (
      <LibraryGridMessage
        title="Nothing matches yet"
        detail="Try a broader word like flower, wave or border, or pick a different kind or collection."
        actionLabel="Clear filters"
        onAction={clearLibraryFilters}
      />
    );
  }
  if (results.length === 0) return <LibrarySkeleton />;
  return (
    <div
      className={`grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] grid-flow-dense gap-x-3 gap-y-5 transition-opacity ${
        status === "loading" ? "opacity-50" : ""
      }`}
    >
      {results.map((element) => (
        <LibraryTile key={element.id} element={element} collectionName={collectionNames.get(element.collectionId) ?? ""} />
      ))}
    </div>
  );
};

export const LibraryGrid: React.FC = () => {
  const query = useSignalValue(libraryQuerySignal);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query]);

  return (
    <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 pt-1 pb-6">
      <LibraryGridBody />
    </div>
  );
};
