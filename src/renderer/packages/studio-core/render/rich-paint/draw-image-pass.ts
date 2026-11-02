import type { ImagePaintPass, RichRender } from "../../shape-render/rich/rich-types";
import type { ImageFit } from "../../image/image-crop";
import type { VectorFillFit } from "../../model/studio-types";
import { withAttrs } from "../../shape-render/stroke/stroke-align";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import { drawFitted, loadImage } from "../image-helpers";
import { contextOf, createExportCanvas, rasterizeRichNodes, type PixelSize } from "./rich-raster";

const MASK_COLOR = "#000000";

const toImageFit = (fit: VectorFillFit): ImageFit => (fit === "stretch" ? "fill" : fit);

export const drawImagePass = async (
  ctx: CanvasRenderingContext2D,
  rich: RichRender,
  pass: ImagePaintPass,
  s: number,
  size: PixelSize,
): Promise<void> => {
  const src = resolveAssetUrl(pass.image.src);
  if (!src) return;
  const [image, mask] = await Promise.all([
    loadImage(src),
    rasterizeRichNodes(rich, [withAttrs(pass.geometry, { fill: MASK_COLOR, stroke: "none" })], s),
  ]);
  const temp = createExportCanvas(size);
  const tempCtx = contextOf(temp);
  tempCtx.drawImage(mask, 0, 0, size.width, size.height);
  tempCtx.globalCompositeOperation = "source-in";
  const box = { x: rich.margin * s, y: rich.margin * s, width: rich.width * s, height: rich.height * s };
  drawFitted(tempCtx, image, toImageFit(pass.image.fit), box);
  ctx.globalAlpha = pass.opacity;
  ctx.drawImage(temp, 0, 0);
  ctx.globalAlpha = 1;
};
