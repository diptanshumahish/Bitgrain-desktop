import { useEffect } from "react";
import { signal } from "@bitgrain/core/signal";

interface StudioSelection {
  selectedIds: string[];
  activePageId: string;
}

export const studioSelectionSignal = signal<StudioSelection>({ selectedIds: [], activePageId: "" });

export const useSelectionPublisher = (selectedIds: string[], activePageId: string): void => {
  useEffect(() => {
    studioSelectionSignal.value = { selectedIds, activePageId };
  }, [selectedIds, activePageId]);
};
