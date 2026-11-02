import React from "react";
import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { emitSlideSorterAction } from "../state/slide-sorter-actions";
import { setSorterSelection, sorterDropIndexSignal } from "../state/slide-sorter-store";
import { nextSelection, selectionModeOf } from "../state/sorter-selection";
import { useSorterDrag } from "../hooks/use-sorter-drag";
import { SlideSorterCard } from "./slide-sorter-card";

interface SlideSorterGridProps {
  pages: TemplatePage[];
  template: TemplateDef;
  activePageId: string;
  selection: string[];
  anchorRef: React.MutableRefObject<string | null>;
  onClearSelection: () => void;
}

export const SlideSorterGrid: React.FC<SlideSorterGridProps> = ({
  pages, template, activePageId, selection, anchorRef, onClearSelection,
}) => {
  const dropIndex = useSignalValue(sorterDropIndexSignal);
  const drag = useSorterDrag();
  const lastIndex = pages.length - 1;

  const handleCardClick = (event: React.MouseEvent, pageId: string): void => {
    const mode = selectionModeOf(event);
    setSorterSelection(nextSelection({
      current: selection,
      clickedId: pageId,
      anchorId: anchorRef.current,
      orderedPageIds: pages.map((page) => page.id),
      mode,
    }));
    if (mode !== "range") anchorRef.current = pageId;
  };

  return (
    <div
      role="listbox"
      aria-multiselectable="true"
      aria-label="Slides"
      onClick={onClearSelection}
      onDragOver={(event) => drag.onDragOverEnd(event, pages.length)}
      onDrop={drag.onDrop}
      className="flex-1 overflow-auto px-6 py-6"
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-5 gap-y-6">
        {pages.map((page, index) => (
          <SlideSorterCard
            key={page.id}
            page={page}
            index={index}
            template={template}
            selected={selection.includes(page.id)}
            active={page.id === activePageId}
            dropBefore={dropIndex === index}
            dropAfter={dropIndex === pages.length && index === lastIndex}
            drag={drag}
            onClick={handleCardClick}
            onOpen={(pageId) => emitSlideSorterAction({ kind: "open", pageId })}
          />
        ))}
      </div>
    </div>
  );
};
