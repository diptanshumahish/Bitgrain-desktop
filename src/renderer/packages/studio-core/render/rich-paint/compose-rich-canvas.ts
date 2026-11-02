import type { RichRender } from "../../shape-render/rich/rich-types";
import { mergePlainPasses } from "./merge-passes";
import { drawImagePass } from "./draw-image-pass";
import { contextOf, createExportCanvas, rasterizeRichNodes, richPixelSize } from "./rich-raster";

export const composeRichCanvas = async (rich: RichRender, s: number): Promise<HTMLCanvasElement> => {
  const size = richPixelSize(rich, s);
  const canvas = createExportCanvas(size);
  const ctx = contextOf(canvas);
  for (const pass of mergePlainPasses(rich.passes)) {
    ctx.globalCompositeOperation = (pass.blendMode ?? "source-over") as GlobalCompositeOperation;
    if (pass.kind === "image") {
      await drawImagePass(ctx, rich, pass, s, size);
      continue;
    }
    const image = await rasterizeRichNodes(rich, pass.nodes, s);
    ctx.drawImage(image, 0, 0, size.width, size.height);
  }
  ctx.globalCompositeOperation = "source-over";
  return canvas;
};
