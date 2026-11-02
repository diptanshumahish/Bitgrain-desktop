import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { LayoutGrid } from "@bitgrain/studio-core/model/layout-grid-types";
import { areGuidesVisible } from "../../state/canvas-aids/canvas-aids-visibility";
import { layoutGridLines } from "../layout-grid/layout-grid-math";
import type { AidLines, TargetLine } from "./snap-engine";

interface AidBounds {
  width: number;
  height: number;
  layoutGrids?: LayoutGrid[];
}

const toTargets = (positions: number[], span: number): TargetLine[] =>
  positions.map((position) => ({ position, perpStart: 0, perpEnd: span }));

export const layoutGridAidLines = (bounds: AidBounds): AidLines => {
  const lines = layoutGridLines(bounds.layoutGrids, bounds.width, bounds.height);
  return { x: toTargets(lines.x, bounds.height), y: toTargets(lines.y, bounds.width) };
};

const guidePositions = (page: TemplatePage, axis: "x" | "y"): number[] =>
  (page.guides ?? []).filter((guide) => guide.axis === axis).map((guide) => guide.position);

export const pageAidLines = (page: TemplatePage): AidLines => {
  const grid = layoutGridAidLines(page);
  if (!areGuidesVisible()) return grid;
  return {
    x: [...grid.x, ...toTargets(guidePositions(page, "x"), page.height)],
    y: [...grid.y, ...toTargets(guidePositions(page, "y"), page.width)],
  };
};
