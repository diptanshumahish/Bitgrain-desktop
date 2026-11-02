import React from "react";
import { MarineSearchInput } from "./MarineSearchInput";
import { MarineCategoryChips } from "./MarineCategoryChips";

interface MarineTemplatesToolbarProps {
  query: string;
  activeCategory: string;
  onQueryChange: (value: string) => void;
  onSearchBlur: () => void;
  onSelectCategory: (key: string) => void;
  stickyClass?: string;
}

const MARKETING_STICKY_CLASS = "top-0 bg-apricot/95";

export const MarineTemplatesToolbar: React.FC<MarineTemplatesToolbarProps> = ({
  query,
  activeCategory,
  onQueryChange,
  onSearchBlur,
  onSelectCategory,
  stickyClass = MARKETING_STICKY_CLASS,
}) => (
  <div className={`sticky z-[9] backdrop-blur-xl ${stickyClass}`}>
    <div className="flex flex-col gap-3 px-6.5 py-4 sm:px-10.5 md:flex-row md:items-center lg:px-14.5">
      <div className="md:w-[360px] md:shrink-0">
        <MarineSearchInput
          value={query}
          placeholder="Try grunge, jazz, synthwave..."
          onChange={onQueryChange}
          onBlur={onSearchBlur}
        />
      </div>
      <div className="min-w-0 flex-1">
        <MarineCategoryChips active={activeCategory} onSelect={onSelectCategory} />
      </div>
    </div>
  </div>
);
