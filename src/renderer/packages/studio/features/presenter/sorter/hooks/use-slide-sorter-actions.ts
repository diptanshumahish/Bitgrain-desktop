import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { requestCanvasFit } from "../../../../state/canvas-fit-request";
import { emitUndoToast } from "@bitgrain/ui/overlays/undo-toast/undo-toast-events";
import { onSlideSorterAction, type SlideSorterAction } from "../state/slide-sorter-actions";
import { closeSlideSorter, setSorterSelection } from "../state/slide-sorter-store";
import { duplicatePages, isSameOrder, movePages, removePages } from "../state/page-list-ops";

interface SlideSorterBindings {
  pages: TemplatePage[];
  activePageId: string;
  setPages: (pages: TemplatePage[]) => void;
  pushHistory: () => void;
  undo: () => void;
  selectPage: (pageId: string) => void;
}

const reorder = (bindings: SlideSorterBindings, pageIds: string[], insertIndex: number): void => {
  const next = movePages(bindings.pages, pageIds, insertIndex);
  if (isSameOrder(next, bindings.pages)) return;
  bindings.pushHistory();
  bindings.setPages(next);
  trackEvent("studio", "slide_sorter_reordered", { details: { count: pageIds.length } });
};

const duplicate = (bindings: SlideSorterBindings, pageIds: string[]): void => {
  if (pageIds.length === 0) return;
  const result = duplicatePages(bindings.pages, pageIds);
  bindings.pushHistory();
  bindings.setPages(result.pages);
  setSorterSelection(result.newIds);
  trackEvent("studio", "page_duplicated", { details: { source: "slide_sorter", count: pageIds.length } });
};

const remove = (bindings: SlideSorterBindings, pageIds: string[]): void => {
  const next = removePages(bindings.pages, pageIds);
  if (next.length === bindings.pages.length) return;
  bindings.pushHistory();
  bindings.setPages(next);
  if (pageIds.includes(bindings.activePageId)) bindings.selectPage(next[0].id);
  setSorterSelection([]);
  trackEvent("studio", "page_deleted", { details: { source: "slide_sorter", count: pageIds.length } });
  emitUndoToast({
    title: pageIds.length > 1 ? `${pageIds.length} pages deleted` : "Page deleted",
    detail: "Changed your mind? You can bring them back.",
    onUndo: bindings.undo,
    onExpire: () => undefined,
  });
};

const open = (bindings: SlideSorterBindings, pageId: string): void => {
  bindings.selectPage(pageId);
  requestCanvasFit();
  closeSlideSorter();
};

const runAction = (bindings: SlideSorterBindings, action: SlideSorterAction): void => {
  if (action.kind === "reorder") reorder(bindings, action.pageIds, action.insertIndex);
  else if (action.kind === "duplicate") duplicate(bindings, action.pageIds);
  else if (action.kind === "delete") remove(bindings, action.pageIds);
  else open(bindings, action.pageId);
};

export const useSlideSorterActions = (bindings: SlideSorterBindings): void => {
  const bindingsRef = useRef(bindings);

  useEffect(() => {
    bindingsRef.current = bindings;
  });

  useEffect(() => onSlideSorterAction((action) => runAction(bindingsRef.current, action)), []);
};
