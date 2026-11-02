import type { TemplatePageInput } from "../../model/studio-types";
import type { PageGuide } from "../../model/layout-grid-types";
import type { PageSafeZone } from "../../design-sizes/safe-zone-types";
import { makeFitContext, type FitSize } from "./fit-context";
import { fitLayers } from "./fit-layer";

export interface FitTarget extends FitSize {
  safeZones?: PageSafeZone[];
}

const fitGuide = (guide: PageGuide, from: FitSize, to: FitSize): PageGuide => {
  const ratio = guide.axis === "x" ? to.width / from.width : to.height / from.height;
  return { ...guide, position: Math.round(guide.position * ratio) };
};

export const fitPageInput = (page: TemplatePageInput, from: FitSize, target: FitTarget): TemplatePageInput => {
  const to = { width: target.width, height: target.height };
  return {
    ...page,
    x: undefined,
    y: undefined,
    width: to.width,
    height: to.height,
    layers: fitLayers(page.layers, makeFitContext(from, to, target.safeZones)),
    guides: page.guides?.map((guide) => fitGuide(guide, from, to)),
    safeZones: target.safeZones,
  };
};
