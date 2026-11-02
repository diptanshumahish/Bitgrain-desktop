import type { FrameStyleDefinition } from "../../../engine/style-definition";
import { numberParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { blurredPixels } from "./blur-levels";

const PERCENT = 100;
const MAX_RADIUS = 60;
const RADIUS_TO_SIGMA = 1 / 3;
const AMOUNT_KEY = "amount";

export const SOFT_FOCUS_STYLE: FrameStyleDefinition = {
  id: "gaussianblur",
  label: "Soft focus",
  hint: "An even, creamy blur over the whole picture",
  glyph: "◌",
  category: "blur",
  kind: "frame",
  params: [
    { kind: "number", key: AMOUNT_KEY, label: "Amount", min: 0, max: 100, step: 1, default: 22, suffix: "%" },
    ...frameToneParams(),
  ],
  renderFrame: ({ frame, source, params, scale }) => {
    const sigma = (numberParam(params, AMOUNT_KEY) / PERCENT) * MAX_RADIUS * RADIUS_TO_SIGMA * scale;
    frame.writePixels(blurredPixels(toneAdjustedSource(source, params), sigma));
  },
};
