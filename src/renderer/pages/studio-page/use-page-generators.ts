import { useCallback } from "react";
import type { TemplatePage, UploadLayer } from "../../data/studioTypes";
import { RESIZE_FORMATS, buildResizedPage } from "../../utils/studio-resize";
import { trackEvent } from "../../lib/tracker";

const PAGE_GAP = 200;
const MOCKUP_BACKGROUND = "#ffffff";

interface UsePageGeneratorsArgs {
  pages: TemplatePage[];
  activePageId: string;
  pushHistory: () => void;
  setPages: (pages: TemplatePage[]) => void;
  setActivePageId: (id: string) => void;
}

interface PageGenerators {
  handleResizeToFormats: (formatIds: string[]) => void;
  handleAddMockupPage: (dataUrl: string, width: number, height: number) => void;
}

const rightEdge = (pages: TemplatePage[]): number =>
  pages.length ? Math.max(...pages.map((page) => page.x + page.width)) + PAGE_GAP : 0;

const buildMockupPage = (dataUrl: string, width: number, height: number, x: number): TemplatePage => {
  const layer: UploadLayer = {
    id: crypto.randomUUID(), type: "upload", name: "Mockup",
    x: 0, y: 0, width, height,
    opacity: 1, locked: false, visible: true,
    src: dataUrl, fit: "cover", borderRadius: 0,
  };
  return {
    id: crypto.randomUUID(), name: "Mockup", layers: [layer],
    background: MOCKUP_BACKGROUND, x, y: 0, width, height, image: null,
  };
};

export const usePageGenerators = ({
  pages, activePageId, pushHistory, setPages, setActivePageId,
}: UsePageGeneratorsArgs): PageGenerators => {
  const handleResizeToFormats = useCallback((formatIds: string[]) => {
    const source = pages.find((page) => page.id === activePageId);
    const formats = RESIZE_FORMATS.filter((format) => formatIds.includes(format.id));
    if (!source || formats.length === 0) return;
    pushHistory();
    let cursorX = rightEdge(pages);
    const created = formats.map((format) => {
      const page = buildResizedPage(source, format, cursorX, source.y);
      cursorX += format.width + PAGE_GAP;
      return page;
    });
    setPages([...pages, ...created]);
    setActivePageId(created[0].id);
    trackEvent("studio", "resize_formats_applied", { details: { format_count: created.length } });
  }, [pages, activePageId, pushHistory, setPages, setActivePageId]);

  const handleAddMockupPage = useCallback((dataUrl: string, width: number, height: number) => {
    pushHistory();
    const page = buildMockupPage(dataUrl, width, height, rightEdge(pages));
    setPages([...pages, page]);
    setActivePageId(page.id);
    trackEvent("studio", "mockup_applied", { details: { width, height } });
  }, [pages, pushHistory, setPages, setActivePageId]);

  return { handleResizeToFormats, handleAddMockupPage };
};
