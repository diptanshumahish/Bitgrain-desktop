import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { workLoadStateSignal } from "../../state/studio-load-state";
import { requestCanvasFit } from "../../state/canvas-fit-request";
import { takeFigmaHandoffIds } from "./figma-handoff-param";
import { fetchFigmaSvg } from "./fetch-figma-svg";
import { buildFigmaPages } from "./figma-handoff-pages";

interface UseFigmaHandoffArgs {
  pages: TemplatePage[];
  setPages: (pages: TemplatePage[]) => void;
  setActivePageId: (pageId: string) => void;
  setSelectedIds: (ids: string[]) => void;
  pushHistory: () => void;
}

const isEmptyDocument = (pages: TemplatePage[]): boolean => pages.length === 1 && pages[0].layers.length === 0;

const fetchAll = async (ids: string[]): Promise<string[]> => {
  const settled = await Promise.allSettled(ids.map(fetchFigmaSvg));
  return settled.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
};

const announce = (added: number, requested: number, skipped: number): void => {
  if (added === 0) {
    emitStatusToast({ title: "Nothing came through from Figma", detail: "The layers could not be read. Send them again from the plugin." });
    return;
  }
  const missing = requested - added;
  const gaps = skipped > 0 ? ` ${skipped} parts could not become editable and were left out.` : "";
  const lost = missing > 0 ? ` ${missing} could not be loaded.` : "";
  emitStatusToast({ title: added === 1 ? "Opened from Figma" : `Opened ${added} items from Figma`, detail: `Each item is its own page with editable layers.${gaps}${lost}` });
};

const settledLoad = (): Promise<void> =>
  new Promise((resolve) => {
    if (workLoadStateSignal.value !== "loading") {
      resolve();
      return;
    }
    const stop = workLoadStateSignal.subscribe(() => {
      if (workLoadStateSignal.value === "loading") return;
      stop();
      resolve();
    });
  });

export const useFigmaHandoff = (args: UseFigmaHandoffArgs): void => {
  const argsRef = useRef(args);

  useEffect(() => {
    argsRef.current = args;
  });

  useEffect(() => {
    const ids = takeFigmaHandoffIds();
    if (ids.length === 0) return;
    const open = async (): Promise<void> => {
      const markups = await fetchAll(ids);
      await settledLoad();
      const current = argsRef.current;
      const keep = isEmptyDocument(current.pages) ? [] : current.pages;
      const built = await buildFigmaPages(markups, keep);
      announce(built.pages.length, ids.length, built.skipped);
      if (built.pages.length === 0) return;
      current.pushHistory();
      current.setPages([...keep, ...built.pages]);
      current.setActivePageId(built.pages[0].id);
      current.setSelectedIds([]);
      requestCanvasFit();
      trackEvent("studio", "figma_handoff_opened", { details: { items: built.pages.length } });
    };
    void open();
  }, []);
};
