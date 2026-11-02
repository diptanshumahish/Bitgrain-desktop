import { applyPngWatermark } from "@bitgrain/engine/watermark/watermark";
import { svgNode, type SvgNode } from "@bitgrain/studio-core/shape-render/svg-node/svg-node";

const WATERMARK_SCALE = 2;
const PNG_MIME = "image/png";

export const watermarkNode = async (width: number, height: number): Promise<SvgNode> => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * WATERMARK_SCALE));
  canvas.height = Math.max(1, Math.round(height * WATERMARK_SCALE));
  await applyPngWatermark(canvas);
  return svgNode("image", { x: 0, y: 0, width, height, href: canvas.toDataURL(PNG_MIME), preserveAspectRatio: "none" });
};
