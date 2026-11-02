import type { ImageLayer, UploadLayer } from "@bitgrain/studio-core/model/studio-types";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import { loadImage } from "@bitgrain/studio-core/render/image-helpers";
import { cornerPathD, hasCustomCorners } from "@bitgrain/studio-core/shape-render/corners/corner-style";
import { svgNode, type SvgNode } from "@bitgrain/studio-core/shape-render/svg-node/svg-node";
import { fittedRect } from "@bitgrain/studio-core/image/image-crop";
import { scopedId, type ExportNodeContext } from "./layer-frame";

type PictureLayer = ImageLayer | UploadLayer;

const DATA_PREFIX = "data:";

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const toDataUrl = async (src: string): Promise<string> => {
  if (src.startsWith(DATA_PREFIX)) return src;
  const response = await fetch(src, { mode: "cors" });
  if (!response.ok) throw new Error(`Image request failed with ${response.status}`);
  return blobToDataUrl(await response.blob());
};

const clipShape = (layer: PictureLayer): SvgNode => {
  const box = { x: 0, y: 0, width: layer.width, height: layer.height };
  if (hasCustomCorners(layer)) return svgNode("path", { d: cornerPathD(layer, box, 1) });
  const radius = layer.borderRadius ?? 0;
  return svgNode("rect", { ...box, rx: radius > 0 ? radius : undefined, ry: radius > 0 ? radius : undefined });
};

const sourceOf = (layer: PictureLayer, ctx: ExportNodeContext): string | null =>
  resolveAssetUrl(layer.src ?? null) ?? (layer.type === "image" ? ctx.fallbackImage : null);

export const imageNodes = async (layer: PictureLayer, ctx: ExportNodeContext): Promise<SvgNode[]> => {
  const source = sourceOf(layer, ctx);
  if (!source) return [];
  const href = await toDataUrl(source).catch(() => source);
  const natural = await loadImage(href);
  const rect = fittedRect(layer.fit, natural.naturalWidth, natural.naturalHeight, { x: 0, y: 0, width: layer.width, height: layer.height }, layer.crop);
  const clipId = scopedId(ctx, layer, "clip");
  return [
    svgNode("defs", {}, [svgNode("clipPath", { id: clipId }, [clipShape(layer)])]),
    svgNode("g", { clipPath: `url(#${clipId})` }, [svgNode("image", { ...rect, href, preserveAspectRatio: "none" })]),
  ];
};
