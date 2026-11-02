import { useCallback, useEffect, useRef, useState } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";

interface HistoryEntry {
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

interface UseStudioHistoryResult {
  past: HistoryEntry[];
  future: HistoryEntry[];
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  resetHistory: () => void;
}

const MAX_HISTORY = 40;
const pageClones = new WeakMap<TemplatePage, TemplatePage>();

const clonePage = (page: TemplatePage): TemplatePage => {
  const cached = pageClones.get(page);
  if (cached) return cached;
  const clone = structuredClone(page);
  pageClones.set(page, clone);
  pageClones.set(clone, clone);
  return clone;
};

const clonePages = (pages: TemplatePage[]): TemplatePage[] => pages.map(clonePage);

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

  const latestRef = useRef({ past, future, snapshot, apply });

  useEffect(() => {
    latestRef.current = { past, future, snapshot, apply };
  });

  const undo = useCallback(() => {
    const latest = latestRef.current;
    if (!latest.past.length) return;
    const prev = latest.past[latest.past.length - 1];
    const current = latest.snapshot();
    latestRef.current = { ...latest, past: latest.past.slice(0, -1), future: [current, ...latest.future] };
    setFuture((f) => [current, ...f]);
    setPast((p) => p.slice(0, -1));
    latest.apply(prev);
  }, []);

  const redo = useCallback(() => {
    const latest = latestRef.current;
    if (!latest.future.length) return;
    const next = latest.future[0];
    const current = latest.snapshot();
    latestRef.current = { ...latest, past: [...latest.past, current], future: latest.future.slice(1) };
    setPast((p) => [...p, current]);
    setFuture((f) => f.slice(1));
    latest.apply(next);
  }, []);

  const resetHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return { past, future, pushHistory, undo, redo, resetHistory };
};
