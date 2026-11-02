import React, { memo, useCallback, useMemo } from "react";
import { ChevronDown, ChevronRight, Copy, Frame, Trash2 } from "lucide-react";
import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { LayersList } from "../LayersList";
import type { FilteredLayerTree } from "../layer-search/filter-layer-tree";
import { idsFromSelectionKey } from "../../canvas/page-render/page-selection-key";
import type { PageSectionHandlers } from "./page-section-handlers";
import { useSectionVisibility } from "./use-section-visibility";

const HEADER_BASE =
  "group flex items-center gap-1.5 mx-1 mt-1 mb-0.5 h-7 px-2 rounded-sm cursor-pointer select-none transition-colors duration-100";

interface PageLayersSectionProps {
  page: TemplatePage;
  displayName: string;
  isActive: boolean;
  isCollapsed: boolean;
  selectionKey: string;
  isSingleSelection: boolean;
  filteredTree: FilteredLayerTree | undefined;
  handlers: PageSectionHandlers;
}

const PageLayersSectionComponent = ({
  page, displayName, isActive, isCollapsed, selectionKey, isSingleSelection, filteredTree, handlers,
}: PageLayersSectionProps): React.ReactElement => {
  const pageId = page.id;
  const selectedIds = useMemo(() => idsFromSelectionKey(selectionKey), [selectionKey]);
  const { sectionRef, listRef, isNearViewport, placeholderHeight } = useSectionVisibility(page.layers.length);
  const mountRows = isNearViewport || isActive || selectionKey !== "";
  const handleSelect = useCallback(
    (id: string, multi?: boolean) => {
      handlers.onSelectPage(pageId);
      handlers.onSelect(id, multi);
    },
    [handlers, pageId],
  );
  const handleReorder = useCallback(
    (layers: Layer[]) => handlers.onReorderLayersForPage(pageId, layers),
    [handlers, pageId],
  );

  return (
    <div ref={sectionRef} className="flex flex-col gap-0.5">
      <div
        className={`${HEADER_BASE} ${
          isActive
            ? "bg-[var(--s-bg-input-hover)] text-[var(--s-text)]"
            : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)]"
        }`}
        onClick={() => handlers.onSelectFramePage(pageId)}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handlers.onToggleCollapse(pageId);
          }}
          className="w-4 h-4 flex items-center justify-center shrink-0 text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
          aria-label={isCollapsed ? "Expand page" : "Collapse page"}
        >
          {isCollapsed ? <ChevronRight size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
        </button>
        <span className={`shrink-0 ${isActive ? "text-[var(--s-accent)]" : "text-[var(--s-text-subtle)]"}`}>
          <Frame size={12} strokeWidth={1.75} />
        </span>
        <span className="flex-1 text-[12px] font-medium truncate">{displayName}</span>
        <span className="text-[12px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums] group-hover:hidden">
          {page.layers.length}
        </span>
        <div className="hidden group-hover:flex items-center gap-0.5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handlers.onDuplicatePage(pageId);
            }}
            className="w-5 h-5 flex items-center justify-center rounded text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-panel)]"
            aria-label="Duplicate page"
          >
            <Copy size={11} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handlers.onDeletePage(pageId);
            }}
            className="w-5 h-5 flex items-center justify-center rounded text-[var(--s-text-subtle)] hover:text-red-500 hover:bg-red-500/10"
            aria-label="Delete page"
          >
            <Trash2 size={11} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      {!isCollapsed && !mountRows && <div aria-hidden="true" style={{ height: placeholderHeight }} />}
      {!isCollapsed && mountRows && (
        <div ref={listRef} className="pl-3">
          <LayersList
            layers={page.layers}
            filteredTree={filteredTree}
            selectedIds={selectedIds}
            readAllSelectedIds={handlers.readSelectedIds}
            isSingleSelection={isSingleSelection}
            dense
            onSelect={handleSelect}
            onSelectIds={handlers.onSelectIds}
            onUpdateLayer={handlers.onUpdateLayer}
            onDeleteLayer={handlers.onDeleteLayer}
            onReorderLayers={handleReorder}
            onGroup={handlers.onGroup}
            onUngroup={handlers.onUngroup}
            onDuplicate={handlers.onDuplicate}
          />
        </div>
      )}
    </div>
  );
};

export const PageLayersSection = memo(PageLayersSectionComponent);
