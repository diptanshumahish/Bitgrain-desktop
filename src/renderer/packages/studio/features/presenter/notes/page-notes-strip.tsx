import React from "react";
import { ChevronDown, ChevronUp, NotebookPen } from "lucide-react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { notesStripOpenSignal, toggleNotesStrip } from "./notes-strip-signal";
import { notesStripVisibleSignal } from "./notes-strip-visibility";
import { PageNotesField } from "./page-notes-field";

interface PageNotesStripProps {
  pages: TemplatePage[];
  activePageId: string;
}

const firstLineOf = (notes: string): string => notes.split("\n").find((line) => line.trim().length > 0) ?? "";

export const PageNotesStrip: React.FC<PageNotesStripProps> = ({ pages, activePageId }) => {
  const open = useSignalValue(notesStripOpenSignal);
  const visible = useSignalValue(notesStripVisibleSignal);
  const pageIndex = pages.findIndex((page) => page.id === activePageId);
  const page = pages[pageIndex];
  if (!page || !visible) return null;

  const notes = page.notes ?? "";
  const pageLabel = page.name || `Page ${pageIndex + 1}`;
  const summary = notes ? firstLineOf(notes) : "Add speaker notes";

  return (
    <div className="shrink-0 border-t border-[var(--s-border)] bg-[var(--s-bg-panel)]">
      <button
        type="button"
        onClick={toggleNotesStrip}
        aria-expanded={open}
        className="w-full h-8 flex items-center gap-2 px-3 text-left text-[var(--s-text-muted)] hover:text-[var(--s-text)] transition-colors"
      >
        <NotebookPen size={13} strokeWidth={1.75} className="shrink-0" />
        <span className="text-[12px] font-medium text-[var(--s-text)] shrink-0">Notes</span>
        <span className="text-[11.5px] text-[var(--s-text-subtle)] shrink-0">{pageLabel}</span>
        {!open && (
          <span className="flex-1 min-w-0 truncate text-[11.5px] text-[var(--s-text-subtle)]">{summary}</span>
        )}
        <span className="ml-auto shrink-0">
          {open ? <ChevronDown size={13} strokeWidth={1.75} /> : <ChevronUp size={13} strokeWidth={1.75} />}
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3">
          <PageNotesField pageId={page.id} notes={notes} className="h-24" autoFocus />
        </div>
      )}
    </div>
  );
};
