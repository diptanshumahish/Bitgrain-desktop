import type { Layer, TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import { renderToCanvas } from "@bitgrain/studio-core/render/render-canvas";
import { svgNode, type SvgNode } from "@bitgrain/studio-core/shape-render/svg-node/svg-node";
import type { ExportNodeContext } from "./layer-frame";
import { rotatedBounds } from "@bitgrain/studio-core/geometry/layer-bounds";
import { effectsExtent } from "@bitgrain/studio-core/shape-render/rich/passes/compose-rich";

const TRANSPARENT = "transparent";
const BASE_PAD = 4;
const SHADOW_PAD_FACTOR = 3;
const PNG_MIME = "image/png";

export const bareTemplate = (width: number, height: number): TemplateDef => ({
  id: "svg-export",
  name: "Export",
  category: "poster",
  width,
  height,
  background: TRANSPARENT,
  exportScale: 1,
  layers: [],
});

const shadowPad = (layer: Layer): number => {
  if (!("shadow" in layer) || !layer.shadow?.enabled) return 0;
  return layer.shadow.blur * SHADOW_PAD_FACTOR + Math.max(Math.abs(layer.shadow.x), Math.abs(layer.shadow.y));
};

const effectsPad = (layer: Layer): number => ("layerEffects" in layer ? effectsExtent(layer.layerEffects) : 0);

const strokePad = (layer: Layer): number => ("strokeWidth" in layer ? layer.strokeWidth * 2 : 0);

export const rasterNodes = async (layer: Layer, ctx: ExportNodeContext): Promise<SvgNode[]> => {
  const pad = BASE_PAD + shadowPad(layer) + effectsPad(layer) + strokePad(layer);
  const bounds = rotatedBounds(layer);
  const x = Math.floor(bounds.x - pad);
  const y = Math.floor(bounds.y - pad);
  const width = Math.ceil(bounds.width + pad * 2);
  const height = Math.ceil(bounds.height + pad * 2);
  const shifted = { ...layer, x: layer.x - x, y: layer.y - y } as Layer;
  const canvas = await renderToCanvas(
    bareTemplate(width, height), TRANSPARENT, [shifted], ctx.fallbackImage,
    Math.max(1, Math.round(width * ctx.rasterScale)), Math.max(1, Math.round(height * ctx.rasterScale)),
  );
  const href = canvas.toDataURL(PNG_MIME);
  return [svgNode("image", { "data-name": layer.name, x, y, width, height, href, preserveAspectRatio: "none" })];
};
