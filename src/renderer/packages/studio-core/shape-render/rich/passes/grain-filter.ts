import type { GrainFillParams } from "../../../model/layer-paint-types";
import { svgNode, type SvgNode } from "../../svg-node/svg-node";
import type { PaintBox } from "../rich-types";

const GRAIN_FREQUENCY = 0.9;
const GRAIN_OCTAVES = 3;
const MIN_GRAIN_SIZE = 0.25;
const GREY_FROM_RED = "1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1";

export const DEFAULT_GRAIN: GrainFillParams = { size: 1.5, seed: 7 };

export const grainFilter = (id: string, box: PaintBox, grain: GrainFillParams | undefined): SvgNode => {
  const params = grain ?? DEFAULT_GRAIN;
  const size = Math.max(MIN_GRAIN_SIZE, params.size);
  return svgNode(
    "filter",
    { id, filterUnits: "userSpaceOnUse", x: 0, y: 0, width: box.width, height: box.height, colorInterpolationFilters: "sRGB" },
    [
      svgNode("feTurbulence", { type: "fractalNoise", baseFrequency: GRAIN_FREQUENCY / size, numOctaves: GRAIN_OCTAVES, seed: params.seed, stitchTiles: "stitch" }),
      svgNode("feColorMatrix", { type: "matrix", values: GREY_FROM_RED }),
      svgNode("feComposite", { in2: "SourceAlpha", operator: "in" }),
    ],
  );
};
