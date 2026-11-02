import { useCallback, useState } from "react";
import type { TemplatePage } from "../../data/studioTypes";

export interface HistoryEntry {
  pages: TemplatePage[];
  activePageId: string;
  canvasW: number;
  canvasH: number;
}

interface UseStudioHistoryArgs {
  pages: TemplatePage[];
  activePageId: string;
  canvasW: number;
  canvasH: number;
  setPages: (pages: TemplatePage[]) => void;
  setActivePageId: (id: string) => void;
  setCanvasW: (w: number) => void;
  setCanvasH: (h: number) => void;
}

export interface UseStudioHistoryResult {
  past: HistoryEntry[];
  future: HistoryEntry[];
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  resetHistory: () => void;
}

const MAX_HISTORY = 40;
const clonePages = (pages: TemplatePage[]): TemplatePage[] => structuredClone(pages);

export const useStudioHistory = ({
  pages,
  activePageId,
  canvasW,
  canvasH,
  setPages,
  setActivePageId,
  setCanvasW,
  setCanvasH,
}: UseStudioHistoryArgs): UseStudioHistoryResult => {
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);

  const snapshot = useCallback(
    (): HistoryEntry => ({
      pages: clonePages(pages),
      activePageId,
      canvasW,
      canvasH,
    }),
    [pages, activePageId, canvasW, canvasH],
  );

  const pushHistory = useCallback(() => {
    setPast((p) => [...p.slice(-MAX_HISTORY), snapshot()]);
    setFuture([]);
  }, [snapshot]);

  const apply = useCallback(
    (entry: HistoryEntry) => {
      setPages(entry.pages);
      setActivePageId(entry.activePageId);
      setCanvasW(entry.canvasW);
      setCanvasH(entry.canvasH);
    },
    [setPages, setActivePageId, setCanvasW, setCanvasH],
  );

  const undo = useCallback(() => {
    if (!past.length) return;
    setFuture((f) => [snapshot(), ...f]);
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    apply(prev);
  }, [past, snapshot, apply]);

  const redo = useCallback(() => {
    if (!future.length) return;
    setPast((p) => [...p, snapshot()]);
    const next = future[0];
    setFuture((f) => f.slice(1));
    apply(next);
  }, [future, snapshot, apply]);

  const resetHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return { past, future, pushHistory, undo, redo, resetHistory };
};
