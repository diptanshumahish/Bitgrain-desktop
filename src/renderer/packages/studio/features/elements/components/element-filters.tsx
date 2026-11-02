import React from "react";
import { LayoutGrid, Search } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { elementQuerySignal, setElementSearch } from "../elements-store";
import { emitOpenElementLibrary } from "../library/element-library-events";
import { ElementKindChips } from "./element-kind-chips";

export const ElementFilters: React.FC = () => {
  const query = useSignalValue(elementQuerySignal);
  return (
    <div className="px-3.5 pt-3 pb-2 flex flex-col gap-2.5 shrink-0">
      <div className="flex items-center gap-1.5">
        <label className="flex-1 min-w-0 h-8 flex items-center gap-2 px-2.5 rounded-md bg-[var(--s-bg-input)] ring-1 ring-transparent focus-within:ring-[var(--s-text-subtle)] transition-shadow">
          <Search size={13} strokeWidth={1.75} className="text-[var(--s-text-subtle)]" />
          <input
            type="search"
            aria-label="Search elements"
            placeholder="Search elements"
            defaultValue={query.search}
            onChange={(event) => setElementSearch(event.target.value)}
            className="flex-1 min-w-0 bg-transparent border-none outline-none focus-visible:outline-none! text-[11.5px] text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)]"
          />
        </label>
        <button
          type="button"
          onClick={() => emitOpenElementLibrary({ search: query.search, kind: query.kind })}
          aria-label="Open the full elements library"
          title="Open the full library"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-[var(--s-border)] text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
        >
          <LayoutGrid size={14} strokeWidth={1.75} />
        </button>
      </div>
      <ElementKindChips />
    </div>
  );
};
