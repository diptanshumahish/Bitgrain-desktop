import type { TransformContext, TransformationResult } from "../core/types";
import { misregisterInks, RISO_PALETTE_ID } from "./ink-misregister";

const RGBA_STRIDE = 4;
const SAME_SCALE = 1;

export const wobbleRisoInks = (result: TransformationResult, ctx: TransformContext): TransformationResult => {
  const { palette, boilSeed } = ctx;
  if (!result.colorData || !palette || palette.id !== RISO_PALETTE_ID || boilSeed === undefined) return result;
  const width = result.gridWidth ?? ctx.width;
  const height = result.gridHeight ?? ctx.height;
  if (result.colorData.length !== width * height * RGBA_STRIDE) return result;
  const pixelScale = (ctx.inkShiftScale ?? SAME_SCALE) * (width / ctx.width);
  const colorData = misregisterInks({ colorData: result.colorData, width, height, palette, seed: boilSeed, pixelScale });
  return { ...result, colorData };
};
