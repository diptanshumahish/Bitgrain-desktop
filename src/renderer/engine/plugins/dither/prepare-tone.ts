import { extractLuma } from "../../tone/luminance";
import { measureLevels, stretchInPlace } from "../../tone/auto-levels";
import { unsharpInPlace } from "../../tone/unsharp";

const LEVELS_CLIP = 0.01;
const LEVELS_AMOUNT = 1;
const DETAIL_AMOUNT = 0.7;

export const prepareDitherTone = (data: Float32Array, width: number, height: number): Float32Array => {
  const tone = extractLuma(data, width * height);
  stretchInPlace(tone, measureLevels(tone, LEVELS_CLIP), LEVELS_AMOUNT);
  unsharpInPlace(tone, width, height, DETAIL_AMOUNT);
  return tone;
};
