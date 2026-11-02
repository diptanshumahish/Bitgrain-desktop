import type { OverlayGradient, TemplateDef, TemplatePageInput } from "../../model/studio-types";
import { makePageId } from "../template-pages";
import { isSameSize, makeFitContext, type FitSize } from "./fit-context";
import { fitLayers } from "./fit-layer";
import { fitPageInput, type FitTarget } from "./fit-page";

const fitOverlay = (overlay: OverlayGradient, from: FitSize, to: FitSize): OverlayGradient => {
  const ratioX = to.width / from.width;
  const ratioY = to.height / from.height;
  return { ...overlay, x0: overlay.x0 * ratioX, y0: overlay.y0 * ratioY, x1: overlay.x1 * ratioX, y1: overlay.y1 * ratioY };
};

const hasUsableSize = (size: FitSize): boolean => size.width > 0 && size.height > 0;

const pageSize = (page: TemplatePageInput, template: TemplateDef): FitSize => ({
  width: page.width ?? template.width,
  height: page.height ?? template.height,
});

const templatePageInputs = (template: TemplateDef): TemplatePageInput[] => {
  if (template.pages && template.pages.length > 0) return template.pages;
  return [{ id: makePageId(1), name: "Page 1", layers: template.layers, background: template.background, image: template.image ?? null }];
};

const fitPageOrKeep = (page: TemplatePageInput, template: TemplateDef, target: FitTarget): TemplatePageInput => {
  const from = pageSize(page, template);
  return hasUsableSize(from) ? fitPageInput(page, from, target) : page;
};

export const templateMatchesCanvas = (template: TemplateDef, target: FitSize): boolean =>
  isSameSize(template, target);

export const fitTemplateToCanvas = (template: TemplateDef, target: FitTarget): TemplateDef => {
  if (!hasUsableSize(template) || !hasUsableSize(target) || templateMatchesCanvas(template, target)) return template;
  const to = { width: target.width, height: target.height };
  return {
    ...template,
    width: to.width,
    height: to.height,
    layers: fitLayers(template.layers, makeFitContext(template, to, target.safeZones)),
    overlay: template.overlay ? fitOverlay(template.overlay, template, to) : undefined,
    pages: templatePageInputs(template).map((page) => fitPageOrKeep(page, template, target)),
  };
};
