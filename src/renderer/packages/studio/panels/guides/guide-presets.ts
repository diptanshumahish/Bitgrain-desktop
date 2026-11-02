import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { makeGuideId, type GuideAxis, type PageGuide } from "@bitgrain/studio-core/model/layout-grid-types";
import { makeSafeZoneId, type PageSafeZone } from "@bitgrain/studio-core/design-sizes/safe-zone-types";
import type { PageAidsPatch } from "../../state/canvas-aids/page-aids-event";
import { canvasAidsStyleSignal } from "../../state/canvas-aids/canvas-aids-style";

export type GuidePreset = "center" | "thirds" | "margins" | "repeat";

export const MIN_GUIDE_SPACING_PX = 8;
const THIRD = 1 / 3;
const HALF = 0.5;

const makeGuide = (axis: GuideAxis, position: number): PageGuide => ({ id: makeGuideId(), axis, position: Math.round(position) });

const guidesAt = (page: TemplatePage, fractions: number[]): PageGuide[] =>
  fractions.flatMap((fraction) => [makeGuide("x", page.width * fraction), makeGuide("y", page.height * fraction)]);

const repeatPositions = (length: number, spacing: number): number[] =>
  Array.from({ length: Math.floor((length - 1) / spacing) }, (_, index) => (index + 1) * spacing);

const makeRepeatGuide = (axis: GuideAxis, position: number): PageGuide => ({ ...makeGuide(axis, position), preset: "repeat" });

export const repeatGuides = (page: TemplatePage, spacingPx: number): PageGuide[] => {
  const spacing = Math.max(MIN_GUIDE_SPACING_PX, spacingPx);
  return [
    ...repeatPositions(page.width, spacing).map((position) => makeRepeatGuide("x", position)),
    ...repeatPositions(page.height, spacing).map((position) => makeRepeatGuide("y", position)),
  ];
};

type BoxGeometry = Pick<PageSafeZone, "x" | "y" | "width" | "height">;

export const marginGeometry = (page: TemplatePage, marginPx: number): BoxGeometry => {
  const margin = Math.min(marginPx, page.width / 2, page.height / 2);
  return {
    x: margin / page.width,
    y: margin / page.height,
    width: (page.width - margin * 2) / page.width,
    height: (page.height - margin * 2) / page.height,
  };
};

export const makeMarginBox = (page: TemplatePage): PageSafeZone => ({
  id: makeSafeZoneId(),
  label: "Safe area",
  preset: "margins",
  ...marginGeometry(page, canvasAidsStyleSignal.value.marginPx),
});

export const makeCenterGuide = (page: TemplatePage, axis: GuideAxis): PageGuide =>
  makeGuide(axis, (axis === "x" ? page.width : page.height) * HALF);

const newGuidesFor = (page: TemplatePage, preset: Exclude<GuidePreset, "margins">): PageGuide[] => {
  if (preset === "repeat") return repeatGuides(page, canvasAidsStyleSignal.value.spacingPx);
  return guidesAt(page, preset === "center" ? [HALF] : [THIRD, THIRD * 2]);
};

export function presetPatch(page: TemplatePage, preset: GuidePreset): PageAidsPatch {
  if (preset === "margins") return { safeZones: [...(page.safeZones ?? []), makeMarginBox(page)] };
  return { guides: [...(page.guides ?? []), ...newGuidesFor(page, preset)] };
}

export const CLEAR_AIDS_PATCH: PageAidsPatch = { guides: [], safeZones: [] };
