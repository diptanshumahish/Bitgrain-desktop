import type { TemplatePage } from "../../../../data/studioTypes";
import type { ExportPopupData, ExportScope } from "../export-state";

const CURRENT_PAGE_ID = "current-page";
const CURRENT_PAGE_NAME = "this page";

const currentPageFrom = (data: ExportPopupData): TemplatePage => {
  const active = data.pages?.find((page) => page.id === data.activePageId);
  return {
    id: active?.id ?? CURRENT_PAGE_ID,
    name: active?.name ?? CURRENT_PAGE_NAME,
    layers: data.layers,
    background: data.background,
    x: 0,
    y: 0,
    width: active?.width ?? data.template.width,
    height: active?.height ?? data.template.height,
    image: active?.image ?? data.image,
  };
};

export const resolvePrintPages = (data: ExportPopupData, scope: ExportScope): TemplatePage[] => {
  if (scope === "all" && data.pages && data.pages.length > 0) return data.pages;
  return [currentPageFrom(data)];
};
