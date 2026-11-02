import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { renderToCanvas } from "@bitgrain/studio-core/render/render-canvas";

const SLIDE_LONG_EDGE = 1600;

const scaledSize = (page: TemplatePage): [number, number] => {
  const ratio = Math.min(1, SLIDE_LONG_EDGE / Math.max(page.width, page.height));
  return [Math.max(1, Math.round(page.width * ratio)), Math.max(1, Math.round(page.height * ratio))];
};

export const renderSlideImage = async (template: TemplateDef, page: TemplatePage): Promise<string> => {
  const [width, height] = scaledSize(page);
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
