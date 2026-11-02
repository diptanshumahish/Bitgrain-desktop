import type { SvgNode } from "../../shape-render/svg-node/svg-node";
import type { RichRender } from "../../shape-render/rich/rich-types";
import { richSvgString, svgDataUrl } from "../../shape-render/rich/rich-svg-string";
import { loadImage } from "../image-helpers";

export interface PixelSize {
  width: number;
  height: number;
}

export const richPixelSize = (rich: RichRender, s: number): PixelSize => ({
  width: Math.max(1, Math.round((rich.width + rich.margin * 2) * s)),
  height: Math.max(1, Math.round((rich.height + rich.margin * 2) * s)),
});

export const createExportCanvas = (size: PixelSize): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  return canvas;
};

export const rasterizeRichNodes = (rich: RichRender, nodes: SvgNode[], s: number): Promise<HTMLImageElement> =>
  loadImage(svgDataUrl(richSvgString(rich, nodes, s)));

export const contextOf = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas context unavailable");
  return ctx;
};
