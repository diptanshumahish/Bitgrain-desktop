import type { TemplateDef, TemplatePage } from "../../../../data/studioTypes";
import { renderToCanvas } from "../../hooks/export/render-canvas";

const PREVIEW_LONG_EDGE = 640;

const previewDims = (page: TemplatePage): [number, number] => {
  const ratio = PREVIEW_LONG_EDGE / Math.max(page.width, page.height);
  return [Math.max(1, Math.round(page.width * ratio)), Math.max(1, Math.round(page.height * ratio))];
};

export const renderExportPreview = async (
  template: TemplateDef,
  page: TemplatePage,
): Promise<string> => {
  const [width, height] = previewDims(page);
  const canvas = await renderToCanvas(
    { ...template, width: page.width, height: page.height },
    page.background,
    page.layers,
    page.image ?? null,
    width,
    height,
  );
  return canvas.toDataURL("image/png");
};
