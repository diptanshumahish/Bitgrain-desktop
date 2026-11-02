import type { Frame } from "../../../engine/frame";
import type { ParamValues } from "../../../engine/style-types";
import { warpPixels, type PixelBuffer } from "./warp-sampler";
import type { WarpSpec } from "./warp-spec";

export const warpIntoFrame = (frame: Frame, source: PixelBuffer, spec: WarpSpec, values: ParamValues, scale: number): void => {
  const mapper = spec.build(values, { width: source.width, height: source.height, scale });
  warpPixels(source, frame.pixels().data, mapper);
  frame.commit();
};
