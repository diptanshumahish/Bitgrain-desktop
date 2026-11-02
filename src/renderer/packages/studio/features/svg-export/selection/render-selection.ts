import type { Layer, TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import { renderToCanvas } from "@bitgrain/studio-core/render/render-canvas";
import { bareTemplate } from "../nodes/raster-node";
import { buildSvgDocument, type SvgDocumentResult } from "../document/build-svg-document";
import type { ResolvedSelection } from "./selection-layers";

const TRANSPARENT = "transparent";

export const shiftedSelectionLayers = (selection: ResolvedSelection): Layer[] =>
  selection.layers.map((layer) => ({ ...layer, x: layer.x - selection.bounds.x, y: layer.y - selection.bounds.y }) as Layer);

const selectionPixelSize = (selection: ResolvedSelection, scale: number): [number, number] => [
  Math.max(1, Math.round(selection.bounds.width * scale)),
  Math.max(1, Math.round(selection.bounds.height * scale)),
];

export const renderSelectionCanvas = async (selection: ResolvedSelection, scale: number): Promise<HTMLCanvasElement> => {
  const [width, height] = selectionPixelSize(selection, scale);
  return renderToCanvas(
    selectionTemplate(selection),
    TRANSPARENT,
    shiftedSelectionLayers(selection),
    selection.page.image ?? null,
    width,
    height,
  );
};

export const selectionTemplate = (selection: ResolvedSelection): TemplateDef =>
  bareTemplate(selection.bounds.width, selection.bounds.height);

export const buildSelectionSvg = (selection: ResolvedSelection, watermark: boolean, scale: number): Promise<SvgDocumentResult> =>
  buildSvgDocument({
    layers: selection.layers,
    width: selection.bounds.width,
    height: selection.bounds.height,
    scale,
    offsetX: selection.bounds.x,
    offsetY: selection.bounds.y,
    background: null,
    fallbackImage: selection.page.image ?? null,
    watermark,
    idPrefix: "sel",
  });
