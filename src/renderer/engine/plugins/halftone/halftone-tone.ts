import { extractLuma } from "../../tone/luminance";
import { measureLevels } from "../../tone/auto-levels";

const RGBA_STRIDE = 4;
const BYTE_MAX = 255;
const LEVELS_CLIP = 0.004;

export const normalizeScreenTone = (data: Float32Array, width: number, height: number): Float32Array => {
  const range = measureLevels(extractLuma(data, width * height), LEVELS_CLIP);
  const low = range.low * BYTE_MAX;
  const scale = 1 / (range.high - range.low);
  const out = new Float32Array(data.length);
  for (let index = 0; index < data.length; index += RGBA_STRIDE) {
    for (let channel = 0; channel < 3; channel++) {
      const stretched = (data[index + channel] - low) * scale;
      out[index + channel] = stretched < 0 ? 0 : stretched > BYTE_MAX ? BYTE_MAX : stretched;
    }
    out[index + 3] = BYTE_MAX;
  }
  return out;
};
