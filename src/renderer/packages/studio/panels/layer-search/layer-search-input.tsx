import React from "react";
import { Search, X } from "lucide-react";
import { setLayerSearchQuery, useLayerSearchQuery } from "./layer-search-signal";

const clearOnEscape = (event: React.KeyboardEvent<HTMLInputElement>): void => {
  if (event.key !== "Escape") return;
  event.stopPropagation();
  setLayerSearchQuery("");
  event.currentTarget.blur();
};

export const LayerSearchInput = (): React.ReactElement => {
  const query = useLayerSearchQuery();
  return (
    <div className="sticky top-0 z-20 px-2 pt-2 pb-1.5 bg-[var(--s-bg-panel)]">
      <div className="flex items-center gap-2 h-7 px-2 rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)] transition-colors focus-within:border-[var(--s-text-muted)]">
        <Search size={12} strokeWidth={1.75} className="shrink-0 text-[var(--s-text-subtle)]" />
        <input
          type="text"
          value={query}
          placeholder="Search layers"
          aria-label="Search layers"
          onChange={(event) => setLayerSearchQuery(event.target.value)}
          onKeyDown={clearOnEscape}
          className="w-full bg-transparent border-none outline-none text-[12px] text-[var(--s-text)] placeholder:text-[var(--s-text-muted)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setLayerSearchQuery("")}
            aria-label="Clear search"
            className="shrink-0 w-4 h-4 flex items-center justify-center rounded text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
          >
            <X size={11} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
};
