import React, { useEffect, useRef } from "react";
import { ArrowUpDown, Search, X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { Dropdown, type DropdownOption } from "../../../../ui/dropdown";
import { clearLibrarySearch, libraryQuerySignal, setLibrarySearch, setLibrarySort } from "../element-library-store";
import type { LibrarySort } from "../element-library-types";

const sortOptions = (isSearching: boolean): DropdownOption[] => [
  { value: "featured", label: isSearching ? "Best match" : "Featured" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name, A to Z" },
];

export const LibraryToolbar: React.FC = () => {
  const query = useSignalValue(libraryQuerySignal);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input && input.value.trim() !== query.search) input.value = query.search;
  }, [query.search]);

  return (
    <div className="flex items-center gap-2.5 px-5 pt-4 pb-2.5 shrink-0">
      <label className="group flex-1 min-w-0 h-10 flex items-center gap-2.5 pl-3.5 pr-1.5 rounded-lg bg-[var(--s-bg-input)] focus-within:bg-[var(--s-bg-input-hover)] transition-colors">
        <Search size={15} strokeWidth={1.75} className="shrink-0 text-[var(--s-text-subtle)] group-focus-within:text-[var(--s-text)]" />
        <input
          ref={inputRef}
          type="search"
          autoFocus
          aria-label="Search the elements library"
          placeholder="Search motifs, styles or occasions"
          defaultValue={query.search}
          onChange={(event) => setLibrarySearch(event.target.value)}
          className="flex-1 min-w-0 h-full bg-transparent border-none outline-none focus-visible:outline-none! text-[13px] text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)] [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query.search && (
          <button
            type="button"
            onClick={clearLibrarySearch}
            aria-label="Clear search"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
          >
            <X size={13} strokeWidth={2} />
          </button>
        )}
      </label>
      <div className="shrink-0 w-[172px]">
        <Dropdown
          options={sortOptions(query.search !== "")}
          value={query.sort}
          onChange={(value) => setLibrarySort(value as LibrarySort)}
          icon={<ArrowUpDown size={13} strokeWidth={1.75} />}
          size="large"
        />
      </div>
    </div>
  );
};
