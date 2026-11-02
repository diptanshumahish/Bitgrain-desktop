import React, { useState } from "react";
import { Plus } from "lucide-react";
import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { PageLayersSection } from "./paged-layers/page-layers-section";
import type { PageSectionHandlers } from "./paged-layers/page-section-handlers";
import { pageSelectionKey } from "../canvas/page-render/page-selection-key";
import { useStableHandlers } from "../hooks/use-stable-handlers";
import { findPageIdsWithLayers } from "./layer-reveal/find-pages-with-layers";
import { LayerSearchInput } from "./layer-search/layer-search-input";
import { LayerSearchEmpty } from "./layer-search/layer-search-empty";
import { useLayerSearchQuery } from "./layer-search/layer-search-signal";
import { filterLayerTree, normalizeQuery, type FilteredLayerTree } from "./layer-search/filter-layer-tree";
import { SlideSorterButton } from "../features/presenter/sorter/ui/slide-sorter-button";

interface PagedLayersListProps {
  pages: TemplatePage[];
  activePageId: string;
  selectedIds: string[];
  onSelectPage: (id: string) => void;
  onSelectFramePage: (id: string) => void;
  onAddPage: () => void;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (id: string) => void;
  onSelect: (id: string, multi?: boolean) => void;
  onSelectIds: (ids: string[]) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayersForPage: (pageId: string, layers: Layer[]) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onDuplicate: (ids: string[]) => void;
}

export const PagedLayersList: React.FC<PagedLayersListProps> = ({
  pages,
  activePageId,
  selectedIds,
  onSelectPage,
  onSelectFramePage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onSelect,
  onSelectIds,
  onUpdateLayer,
  onDeleteLayer,
  onReorderLayersForPage,
  onGroup,
  onUngroup,
  onDuplicate,
}) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [lastSelectionKey, setLastSelectionKey] = useState<string>("");

  const selectionKey = selectedIds.join("|");
  if (lastSelectionKey !== selectionKey) {
    setLastSelectionKey(selectionKey);
    const hiddenPageIds = findPageIdsWithLayers(pages, selectedIds).filter((pageId) => collapsed[pageId]);
    if (hiddenPageIds.length > 0) {
      setCollapsed((prev) => ({ ...prev, ...Object.fromEntries(hiddenPageIds.map((pageId) => [pageId, false])) }));
    }
  }

  const searchQuery = normalizeQuery(useLayerSearchQuery());
  const filteredByPage = new Map<string, FilteredLayerTree>(
    searchQuery ? pages.map((page) => [page.id, filterLayerTree(page.layers, searchQuery)]) : [],
  );
  const visiblePages = searchQuery ? pages.filter((page) => (filteredByPage.get(page.id)?.layers.length ?? 0) > 0) : pages;

  const toggleCollapse = (pageId: string): void => {
    setCollapsed((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  const handlers = useStableHandlers<PageSectionHandlers>({
    onSelectPage,
    onSelectFramePage,
    onToggleCollapse: toggleCollapse,
    onDuplicatePage,
    onDeletePage,
    onSelect,
    onSelectIds,
    onUpdateLayer,
    onDeleteLayer,
    onReorderLayersForPage,
    onGroup,
    onUngroup,
    onDuplicate,
    readSelectedIds: () => selectedIds,
  });

  return (
    <div className="flex flex-col gap-1">
      <LayerSearchInput />
      {searchQuery && visiblePages.length === 0 && <LayerSearchEmpty />}
      {visiblePages.map((page) => (
        <PageLayersSection
          key={page.id}
          page={page}
          displayName={page.name || `Page ${pages.indexOf(page) + 1}`}
          isActive={page.id === activePageId}
          isCollapsed={!searchQuery && (collapsed[page.id] ?? false)}
          selectionKey={pageSelectionKey(page, selectedIds)}
          isSingleSelection={selectedIds.length === 1}
          filteredTree={filteredByPage.get(page.id)}
          handlers={handlers}
        />
      ))}
      <div className="flex items-center gap-0.5 mx-1 mt-1">
        <button
          type="button"
          onClick={onAddPage}
          className="group flex-1 flex items-center gap-1.5 h-7 px-2 rounded-sm text-[12px] font-medium text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors duration-100"
        >
          <span className="w-4 h-4 flex items-center justify-center shrink-0 rounded-[4px] border border-[var(--s-border)] group-hover:border-[var(--s-border-hover)] transition-colors">
            <Plus size={10} strokeWidth={2} />
          </span>
          Add page
        </button>
        <SlideSorterButton />
      </div>
    </div>
  );
};
