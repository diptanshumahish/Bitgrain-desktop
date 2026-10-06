import React, { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Frame, Trash2 } from "lucide-react";
import type { Layer, TemplatePage } from "../../../data/studioTypes";
import { LayersList } from "./LayersList";
import { AddFrameMenu } from "./AddFrameMenu";

interface PagedLayersListProps {
  pages: TemplatePage[];
  activePageId: string;
  selectedIds: string[];
  onSelectPage: (id: string) => void;
  onAddFrame: (width: number, height: number, name?: string) => void;
  frameWidth: number;
  frameHeight: number;
  onDuplicatePage: () => void;
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

const HEADER_BASE =
  "group flex items-center gap-1.5 mx-1 h-7 px-1.5 rounded-md cursor-pointer select-none transition-colors duration-100";

export const PagedLayersList: React.FC<PagedLayersListProps> = ({
  pages,
  activePageId,
  selectedIds,
  onSelectPage,
  onAddFrame,
  frameWidth,
  frameHeight,
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

  const toggleCollapse = (pageId: string): void => {
    setCollapsed((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  return (
    <div className="flex flex-col">
      {pages.map((page, index) => {
        const isActive = page.id === activePageId;
        const isCollapsed = collapsed[page.id] ?? false;
        const displayName = page.name || `Page ${index + 1}`;
        return (
          <div key={page.id} className="flex flex-col">
            <div
              className={`${HEADER_BASE} ${
                isActive
                  ? "bg-[var(--s-accent-soft)] text-[var(--s-text)]"
                  : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)]"
              }`}
              onClick={() => {
                onSelectPage(page.id);
                onSelectIds([]);
              }}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleCollapse(page.id);
                }}
                className="w-4 h-4 flex items-center justify-center shrink-0 text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
                aria-label={isCollapsed ? "Expand page" : "Collapse page"}
              >
                {isCollapsed ? <ChevronRight size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
              </button>
              <span className={`shrink-0 ${isActive ? "text-[var(--s-accent)]" : "text-[var(--s-text-subtle)]"}`}>
                <Frame size={12} strokeWidth={1.75} />
              </span>
              <span className="flex-1 text-[11.5px] font-semibold truncate">
                {displayName}
              </span>
              <span className="text-[9px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums] group-hover:hidden">
                {page.layers.length}
              </span>
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectPage(page.id);
                    onDuplicatePage();
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
                    onDeletePage(page.id);
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded text-[var(--s-text-subtle)] hover:text-red-500 hover:bg-red-500/10"
                  aria-label="Delete page"
                >
                  <Trash2 size={11} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            {!isCollapsed && (
              <div className="pl-3">
                <LayersList
                  layers={page.layers}
                  selectedIds={selectedIds}
                  dense
                  onSelect={(id, multi) => {
                    onSelectPage(page.id);
                    onSelect(id, multi);
                  }}
                  onSelectIds={onSelectIds}
                  onUpdateLayer={onUpdateLayer}
                  onDeleteLayer={onDeleteLayer}
                  onReorderLayers={(layers) => onReorderLayersForPage(page.id, layers)}
                  onGroup={onGroup}
                  onUngroup={onUngroup}
                  onDuplicate={onDuplicate}
                />
              </div>
            )}
          </div>
        );
      })}
      <div className="mx-1.5 my-1.5">
        <AddFrameMenu onAdd={onAddFrame} currentWidth={frameWidth} currentHeight={frameHeight} />
      </div>
    </div>
  );
};
