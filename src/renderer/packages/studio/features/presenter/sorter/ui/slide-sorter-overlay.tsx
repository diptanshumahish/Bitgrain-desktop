import React, { useRef } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { themeSignal } from "@bitgrain/ui/theme/global-theme-store";
import { studioPagesSignal } from "../../../../state/studio-document-store";
import { emitSlideSorterAction } from "../state/slide-sorter-actions";
import {
  closeSlideSorter,
  setSorterSelection,
  sorterDocumentSignal,
  sorterSelectionSignal,
} from "../state/slide-sorter-store";
import { orderedIds } from "../state/page-list-ops";
import { useSorterKeys } from "../hooks/use-sorter-keys";
import { SlideSorterToolbar } from "./slide-sorter-toolbar";
import { SlideSorterGrid } from "./slide-sorter-grid";

export const SlideSorterOverlay: React.FC = () => {
  const pages = useSignalValue(studioPagesSignal);
  const selection = useSignalValue(sorterSelectionSignal);
  const { template, activePageId } = useSignalValue(sorterDocumentSignal);
  const dark = useSignalValue(themeSignal) === "dark";
  const anchorRef = useRef<string | null>(selection[0] ?? null);
  useSorterKeys();

  if (!template) return null;
  const selected = orderedIds(pages, selection);

  return (
    <div
      data-theme={dark ? "dark" : "light"}
      role="dialog"
      aria-modal="true"
      aria-label="Slide sorter"
      className="present-fade fixed inset-0 z-[150] flex flex-col bg-[var(--s-bg-canvas)] font-editorial"
    >
      <SlideSorterToolbar
        pageCount={pages.length}
        selectedCount={selected.length}
        canDelete={selected.length > 0 && selected.length < pages.length}
        onDuplicate={() => emitSlideSorterAction({ kind: "duplicate", pageIds: selected })}
        onDelete={() => emitSlideSorterAction({ kind: "delete", pageIds: selected })}
        onClose={closeSlideSorter}
      />
      <SlideSorterGrid
        pages={pages}
        template={template}
        activePageId={activePageId}
        selection={selection}
        anchorRef={anchorRef}
        onClearSelection={() => setSorterSelection([])}
      />
    </div>
  );
};
