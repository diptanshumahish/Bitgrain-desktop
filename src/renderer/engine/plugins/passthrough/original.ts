import type { ImagePlugin, TransformContext, TransformationResult } from "../../types";

const OPAQUE = 255;

export const OriginalPlugin: ImagePlugin = {
  id: "original",
  name: "Original",
  category: "Filters",
  transform: (ctx: TransformContext): TransformationResult => {
    const colorData = Uint8ClampedArray.from(ctx.data);
    for (let index = 3; index < colorData.length; index += 4) colorData[index] = OPAQUE;
    return { colorData, workingData: Float32Array.from(colorData) };
  },
};
