import type { FrameLayer, GroupLayer, Layer } from "@bitgrain/studio-core/model/studio-types";
import { laidOutChildren } from "@bitgrain/studio-core/layout/auto-layout";
import { svgNode } from "@bitgrain/studio-core/shape-render/svg-node/svg-node";
import type { XmlNode } from "../document/xml-node";
import { frameLayer, scopedId, type ExportNodeContext } from "./layer-frame";
import { canExportAsVector } from "./vector-safe";
import { inkNodes, shapeNodes, vectorNodes } from "./shape-vector-nodes";
import { imageNodes } from "./image-node";
import { textNodes } from "./text-node";
import { rasterNodes } from "./raster-node";

export interface LayerExportContext extends ExportNodeContext {
  skipped: string[];
}

const leafNodes = async (layer: Layer, ctx: LayerExportContext): Promise<XmlNode[]> => {
  if (layer.type === "shape") return shapeNodes(layer, ctx);
  if (layer.type === "vector") return vectorNodes(layer, ctx);
  if (layer.type === "ink") return inkNodes(layer);
  if (layer.type === "text") return textNodes(layer);
  if (layer.type === "image" || layer.type === "upload") return imageNodes(layer, ctx);
  return [];
};

const frameBackground = (layer: FrameLayer, ctx: LayerExportContext): XmlNode[] => {
  const size = { width: layer.width, height: layer.height };
  const fill = layer.background && layer.background !== "transparent" ? [svgNode("rect", { x: 0, y: 0, ...size, fill: layer.background })] : [];
  if (!layer.clip) return fill;
  return [...fill, svgNode("defs", {}, [svgNode("clipPath", { id: scopedId(ctx, layer, "frame") }, [svgNode("rect", { x: 0, y: 0, ...size })])])];
};

const containerNodes = async (layer: GroupLayer | FrameLayer, ctx: LayerExportContext): Promise<XmlNode[]> => {
  const children = await layersToNodes(laidOutChildren(layer), ctx);
  if (layer.type === "group") return children;
  const clipped = layer.clip ? [{ tag: "g", attrs: { clipPath: `url(#${scopedId(ctx, layer, "frame")})` }, children }] : children;
  return [...frameBackground(layer, ctx), ...clipped];
};

const vectorLayerNodes = async (layer: Layer, ctx: LayerExportContext): Promise<XmlNode[]> => {
  const inner = await leafNodes(layer, ctx);
  return inner.length > 0 ? [frameLayer(layer, inner)] : [];
};

const safeRaster = (layer: Layer, ctx: LayerExportContext): Promise<XmlNode[]> =>
  rasterNodes(layer, ctx).catch(() => {
    ctx.skipped.push(`${layer.type} layer`);
    return [];
  });

const layerToNodes = async (layer: Layer, ctx: LayerExportContext): Promise<XmlNode[]> => {
  if (!layer.visible) return [];
  if (layer.type === "group" || layer.type === "frame") return [frameLayer(layer, await containerNodes(layer, ctx))];
  if (layer.type === "adjustment") {
    ctx.skipped.push("adjustment layer");
    return [];
  }
  if (!canExportAsVector(layer)) return safeRaster(layer, ctx);
  return vectorLayerNodes(layer, ctx).catch(() => safeRaster(layer, ctx));
};

export async function layersToNodes(layers: Layer[], ctx: LayerExportContext): Promise<XmlNode[]> {
  const nodes: XmlNode[] = [];
  for (const layer of layers) nodes.push(...(await layerToNodes(layer, ctx)));
  return nodes;
}
