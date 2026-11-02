import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import type { ParamValues } from "../../../../engine/style-types";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { hexToRgbTriple } from "../../../../postfx/pixel-ops";
import { CHANNEL_MAX, PERCENT, mix } from "../shared/screen-math";
import { CMYK_PARAMS, PLATE_KEYS, floodKey, gainKey } from "./cmyk-params";
import { PLATE_COUNT, buildPlateGrid, inkChannels, type PlateFrame } from "./cmyk-plates";
import { renderDrops } from "./cmyk-render";
import type { DropSettings } from "./cmyk-drop-mask";

const MOST_CELLS = 400;
const FEWEST_CELLS = 7;
const SIZE_CURVE = 0.7;
const FINE_GRAIN = 2000;
const COARSE_GRAIN = 200;
const COMPENSATION_SHARE = 0.1;
const DOTS_SOFT_BASE = 1.5;
const PLATES = [0, 1, 2, 3];

const unitRgb = (hex: string): number[] => hexToRgbTriple(hex).map((value) => value / CHANNEL_MAX);
const share = (params: ParamValues, key: string): number => numberParam(params, key) / PERCENT;

const compensationFor = (params: ParamValues): number => {
  const softness = share(params, "softness");
  const dotsBonus = textParam(params, "type") === "dots" ? COMPENSATION_SHARE * (DOTS_SOFT_BASE - softness) : 0;
  return COMPENSATION_SHARE * softness + COMPENSATION_SHARE * share(params, "gridNoise") + dotsBonus;
};

const dropSettings = (params: ParamValues): DropSettings => ({
  type: textParam(params, "type"),
  softness: share(params, "softness"),
  compensation: compensationFor(params),
  gains: PLATES.map((plate) => share(params, gainKey(plate))),
  floods: PLATES.map((plate) => share(params, floodKey(plate))),
  inks: PLATE_KEYS.map((key) => unitRgb(textParam(params, key))),
  paper: unitRgb(textParam(params, "paper")),
  grainMixer: share(params, "grainMix"),
  grainFrequency: mix(FINE_GRAIN, COARSE_GRAIN, share(params, "grainSize")),
  overlay: share(params, "grain"),
});

const renderCmykDrops = ({ frame, source, params }: FrameRenderInput): void => {
  const cells = mix(MOST_CELLS, FEWEST_CELLS, Math.pow(share(params, "size"), SIZE_CURVE));
  const plateFrame: PlateFrame = { width: source.width, height: source.height, cell: source.height / cells, gridNoise: share(params, "gridNoise") };
  const channels = inkChannels(source, share(params, "contrast"));
  const grids = Array.from({ length: PLATE_COUNT }, (_, plate) => buildPlateGrid(plateFrame, channels, plate));
  const output = new Uint8ClampedArray(source.data.length);
  renderDrops({ frame: plateFrame, settings: dropSettings(params), channels, grids }, output);
  frame.writePixels(output);
};

export const CMYK_DROPS_STYLE: FrameStyleDefinition = {
  id: "halftonecmyk",
  label: "CMYK drops",
  hint: "Four ink screens that bleed into droplets",
  glyph: "◕",
  category: "print",
  kind: "frame",
  params: CMYK_PARAMS,
  renderFrame: renderCmykDrops,
};
