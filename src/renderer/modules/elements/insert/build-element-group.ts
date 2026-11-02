import type { GroupLayer } from "../../../data/studioTypes";
import { cloneLayersWithFreshIds } from "../../../data/templates/template-pages";
import type { ElementDetail, ElementKind } from "../element-types";
import { scaleLayerTree } from "./scale-layer-tree";

const WIDE_KINDS: ReadonlySet<ElementKind> = new Set<ElementKind>(["border", "divider"]);
const WIDE_FIT_RATIO = 0.8;
const COMPACT_FIT_RATIO = 0.4;

export interface ElementPlacement {
  pageWidth: number;
  pageHeight: number;
  centerX: number;
  centerY: number;
}

const fitWidth = (detail: ElementDetail, pageWidth: number, pageHeight: number): number => {
  if (WIDE_KINDS.has(detail.kind)) return pageWidth * WIDE_FIT_RATIO;
  const box = Math.min(pageWidth, pageHeight) * COMPACT_FIT_RATIO;
  const aspect = detail.data.width / detail.data.height;
  return aspect >= 1 ? box : box * aspect;
};

export const buildElementGroup = (detail: ElementDetail, placement: ElementPlacement): GroupLayer => {
  const width = Math.round(fitWidth(detail, placement.pageWidth, placement.pageHeight));
  const scale = width / detail.data.width;
  const height = Math.round(detail.data.height * scale);
  return {
    id: `group-${crypto.randomUUID()}`,
    type: "group",
    name: detail.name,
    x: Math.round(placement.centerX - width / 2),
    y: Math.round(placement.centerY - height / 2),
    width,
    height,
    opacity: 1,
    locked: false,
    visible: true,
    layers: cloneLayersWithFreshIds(scaleLayerTree(detail.data.layers, scale)),
    layout: "none",
    gap: 0,
    padding: 0,
    alignItems: "start",
    justifyContent: "start",
  };
};
