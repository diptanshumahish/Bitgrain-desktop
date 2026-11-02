import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { isSameSize, type FitSize } from "@bitgrain/studio-core/templates/canvas-fit/fit-context";

export const initialTemplateSize = (initial: TemplateDef, canvasChosen: boolean): FitSize | null =>
  canvasChosen ? null : { width: initial.width, height: initial.height };

export const isCanvasUserSized = (page: TemplatePage | undefined, templateSize: FitSize | null): boolean => {
  if (!page) return false;
  if (!templateSize) return true;
  return !isSameSize(page, templateSize);
};
