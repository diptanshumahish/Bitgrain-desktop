import React from "react";
import { Search } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { elementQuerySignal, setElementSearch } from "../elements-store";
import { ElementKindChips } from "./element-kind-chips";

export const ElementFilters: React.FC = () => {
  const query = useSignalValue(elementQuerySignal);
  return (
    <div className="px-3.5 pt-3 pb-2 flex flex-col gap-2.5 shrink-0">
      <label className="h-8 flex items-center gap-2 px-2.5 rounded-md bg-[var(--s-bg-input)] ring-1 ring-transparent focus-within:ring-[var(--s-text-subtle)] transition-shadow">
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
      <ElementKindChips />
    </div>
  );
};
