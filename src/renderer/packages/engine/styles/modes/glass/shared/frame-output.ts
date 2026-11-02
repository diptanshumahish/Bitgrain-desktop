import type { SourceImage } from "../../../engine/style-definition";

const CHANNELS = 4;
const OPAQUE = 255;

export const opaqueBuffer = (source: SourceImage): Uint8ClampedArray => {
  const data = new Uint8ClampedArray(source.width * source.height * CHANNELS);
  for (let index = 3; index < data.length; index += CHANNELS) data[index] = OPAQUE;
  return data;
};
