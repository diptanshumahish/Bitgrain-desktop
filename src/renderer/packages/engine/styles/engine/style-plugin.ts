import type { ImagePlugin, TransformContext, TransformationResult } from "../../core/types";
import { renderStyle } from "./render-style";
import { DEFAULT_STYLE_ID } from "./style-registry";
import type { StyleSettings } from "./style-types";

const CHANNEL_MAX = 255;
const DEFAULT_SEED = 1;

const EMPTY_SETTINGS: StyleSettings = { styleId: DEFAULT_STYLE_ID, params: {}, effects: {} };

const toBytes = (data: Float32Array): Uint8ClampedArray => {
  const bytes = new Uint8ClampedArray(data.length);
  for (let index = 0; index < data.length; index++) bytes[index] = Math.min(CHANNEL_MAX, Math.max(0, data[index]));
  return bytes;
};

export const StylePlugin: ImagePlugin = {
  id: "style",
  name: "Style",
  category: "Creative",
  transform: (ctx: TransformContext): TransformationResult => {
    const colorData = renderStyle({
      source: { data: toBytes(ctx.data), width: ctx.width, height: ctx.height },
      settings: ctx.style ?? EMPTY_SETTINGS,
      scale: ctx.styleScale ?? 1,
      seed: ctx.frameSeed ?? DEFAULT_SEED,
    });
    return { colorData, workingData: Float32Array.from(colorData), gridWidth: ctx.width, gridHeight: ctx.height };
  },
};
