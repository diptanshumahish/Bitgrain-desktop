import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { KIND_OPTIONS } from "../../../element-kinds";
import { libraryFacetsSignal, libraryQuerySignal, setLibraryKind } from "../../element-library-store";
import { countFor, sumCounts } from "./facet-counts";
import { FacetRow } from "./facet-row";

export const LibraryKindList: React.FC = () => {
  const query = useSignalValue(libraryQuerySignal);
  const facets = useSignalValue(libraryFacetsSignal);
  return (
    <section className="flex flex-col gap-0.5" aria-label="Kinds">
      <h3 className="px-2.5 pb-1.5 text-[11.5px] font-semibold text-[var(--s-text-subtle)]">Kinds</h3>
      {KIND_OPTIONS.map((option) => (
        <FacetRow
          key={option.label}
          label={option.value === "" ? "All kinds" : option.label}
          count={option.value === "" ? sumCounts(facets.kinds) : countFor(facets.kinds, option.value)}
          isActive={query.kind === option.value}
          onSelect={() => setLibraryKind(option.value)}
        />
      ))}
    </section>
  );
};
