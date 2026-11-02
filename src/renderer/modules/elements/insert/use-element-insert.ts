import { useEffect, useRef } from "react";
import type { Layer, TemplatePage } from "../../../data/studioTypes";
import { emitStatusToast } from "../../../components/portal/status-toast/status-toast-events";
import { trackEvent } from "../../../lib/tracker";
import { fetchElementDetail } from "../elements-api";
import { buildElementGroup, type ElementPlacement } from "./build-element-group";
import { onInsertElement, type InsertElementRequest } from "./element-insert-events";

interface UseElementInsertArgs {
  pages: TemplatePage[];
  activePageId: string;
  setLayersForPage: (pageId: string, updater: (prev: Layer[]) => Layer[]) => void;
  setActivePageId: (pageId: string) => void;
  setSelectedIds: (ids: string[]) => void;
  pushHistory: () => void;
}

const placementFor = (page: TemplatePage, request: InsertElementRequest): ElementPlacement => ({
  pageWidth: page.width,
  pageHeight: page.height,
  centerX: request.drop?.x ?? page.width / 2,
  centerY: request.drop?.y ?? page.height / 2,
});

export const useElementInsert = (args: UseElementInsertArgs): void => {
  const argsRef = useRef(args);

  useEffect(() => {
    argsRef.current = args;
  });

  useEffect(() => {
    const insert = async (request: InsertElementRequest): Promise<void> => {
      const detail = await fetchElementDetail(request.elementId);
      if (!detail) {
        emitStatusToast({ title: "Element unavailable", detail: "That element could not be loaded, try again in a moment." });
        return;
      }
      const current = argsRef.current;
      const pageId = request.drop?.pageId ?? current.activePageId;
      const page = current.pages.find((candidate) => candidate.id === pageId);
      if (!page) return;
      const group = buildElementGroup(detail, placementFor(page, request));
      current.pushHistory();
      current.setLayersForPage(pageId, (prev) => [...prev, group]);
      if (pageId !== current.activePageId) current.setActivePageId(pageId);
      current.setSelectedIds([group.id]);
      trackEvent("studio", "element_inserted", { details: { element_id: detail.id, method: request.drop ? "drag" : "click" } });
    };
    return onInsertElement((request) => void insert(request));
  }, []);
};
