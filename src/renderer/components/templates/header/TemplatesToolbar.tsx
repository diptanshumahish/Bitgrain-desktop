import React from "react";
import { TemplateSearchInput } from "./TemplateSearchInput";
import { CategoryChips } from "./CategoryChips";

interface TemplatesToolbarProps {
  query: string;
  activeCategory: string;
  onQueryChange: (value: string) => void;
  onSearchBlur: () => void;
  onSelectCategory: (key: string) => void;
}

export const TemplatesToolbar: React.FC<TemplatesToolbarProps> = ({
  query,
  activeCategory,
  onQueryChange,
  onSearchBlur,
  onSelectCategory,
}) => (
  <div className="sticky top-14 z-[9] border-b border-zinc-200 bg-brand-primary/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-[#09090b]/90">
    <div className="flex flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:px-8">
      <div className="md:w-[360px] md:shrink-0">
        <TemplateSearchInput
          value={query}
          placeholder="Try grunge, jazz, synthwave..."
          onChange={onQueryChange}
          onBlur={onSearchBlur}
        />
      </div>
      <div className="min-w-0 flex-1">
        <CategoryChips active={activeCategory} onSelect={onSelectCategory} />
      </div>
    </div>
  </div>
);
