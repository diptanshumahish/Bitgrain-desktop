import { useEffect } from "react";
import { studioPagesSignal } from "../../../../state/studio-document-store";
import { emitSlideSorterAction } from "../state/slide-sorter-actions";
import { closeSlideSorter, setSorterSelection, sorterSelectionSignal } from "../state/slide-sorter-store";
import { orderedIds } from "../state/page-list-ops";

type SorterKeyAction = "close" | "delete" | "duplicate" | "select-all" | "open";

const readSorterKey = (event: KeyboardEvent): SorterKeyAction | null => {
  const withModifier = event.metaKey || event.ctrlKey;
  if (event.key === "Escape") return "close";
  if (event.key === "Enter") return "open";
  if (event.key === "Delete" || event.key === "Backspace") return "delete";
  if (withModifier && event.code === "KeyD") return "duplicate";
  if (withModifier && event.code === "KeyA") return "select-all";
  return null;
};

const selectedInOrder = (): string[] => orderedIds(studioPagesSignal.value, sorterSelectionSignal.value);

const runSorterKey = (action: SorterKeyAction): void => {
  const selected = selectedInOrder();
  if (action === "close") closeSlideSorter();
  else if (action === "delete") emitSlideSorterAction({ kind: "delete", pageIds: selected });
  else if (action === "duplicate") emitSlideSorterAction({ kind: "duplicate", pageIds: selected });
  else if (action === "select-all") setSorterSelection(studioPagesSignal.value.map((page) => page.id));
  else if (selected[0]) emitSlideSorterAction({ kind: "open", pageId: selected[0] });
};

export const useSorterKeys = (): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const action = readSorterKey(event);
      if (!action) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      runSorterKey(action);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);
};
