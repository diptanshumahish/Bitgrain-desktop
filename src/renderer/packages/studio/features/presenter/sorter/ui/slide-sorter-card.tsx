import React from "react";
import { NotebookPen } from "lucide-react";
import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { SlideThumbnailImage } from "./slide-thumbnail-image";
import type { SorterDragHandlers } from "../hooks/use-sorter-drag";

interface SlideSorterCardProps {
  page: TemplatePage;
  index: number;
  template: TemplateDef;
  selected: boolean;
  active: boolean;
  dropBefore: boolean;
  dropAfter: boolean;
  drag: SorterDragHandlers;
  onClick: (event: React.MouseEvent, pageId: string) => void;
  onOpen: (pageId: string) => void;
}

const DROP_LINE = "absolute top-0 bottom-6 w-[3px] rounded-full bg-[var(--s-accent)]";

export const SlideSorterCard: React.FC<SlideSorterCardProps> = ({
  page, index, template, selected, active, dropBefore, dropAfter, drag, onClick, onOpen,
}) => (
  <div
    draggable
    role="option"
    aria-selected={selected}
    onDragStart={(event) => drag.onDragStart(event, page.id)}
    onDragOver={(event) => drag.onDragOver(event, index)}
    onDrop={drag.onDrop}
    onDragEnd={drag.onDragEnd}
    onClick={(event) => {
      event.stopPropagation();
      onClick(event, page.id);
    }}
    onDoubleClick={() => onOpen(page.id)}
    className="relative flex flex-col gap-2 cursor-pointer select-none"
  >
    {dropBefore && <span className={`${DROP_LINE} -left-[11px]`} />}
    {dropAfter && <span className={`${DROP_LINE} -right-[11px]`} />}
    <div
      className={`aspect-[4/3] flex items-center justify-center p-3 rounded-lg bg-[var(--s-bg-input)] border-2 transition-colors ${
        selected ? "border-[var(--s-accent)]" : "border-transparent hover:border-[var(--s-border)]"
      }`}
    >
      <SlideThumbnailImage page={page} template={template} />
    </div>
    <div className="flex items-center gap-2 px-0.5 min-w-0">
      <span className={`text-[11px] tabular-nums shrink-0 ${active ? "text-[var(--s-text)]" : "text-[var(--s-text-subtle)]"}`}>
        {index + 1}
      </span>
      <span className="flex-1 min-w-0 truncate text-[12px] text-[var(--s-text)]">{page.name || `Page ${index + 1}`}</span>
      {page.notes && (
        <span title="Has speaker notes" className="shrink-0 text-[var(--s-text-subtle)]">
          <NotebookPen size={12} strokeWidth={1.75} />
        </span>
      )}
    </div>
  </div>
);
