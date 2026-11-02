import type { ParamSpec } from "../../../engine/style-types";
import { pinchWarp, spherizeWarp, twirlWarp } from "./radial-warps";
import { rippleRingsWarp, shearWarp, zigzagWaveWarp } from "./wave-warps";
import { POLAR_MODES, polarWarp } from "./polar-warp";
import { amountParam, centreParams, signedAmountParam, WARP_KEYS, type WarpSpec } from "./warp-spec";

const wavelengthParam: ParamSpec = {
  kind: "number", key: WARP_KEYS.wavelength, label: "Wave size", min: 5, max: 100, step: 1, default: 40, suffix: "%",
};

const ringsParam: ParamSpec = {
  kind: "number", key: WARP_KEYS.rings, label: "Rings", min: 1, max: 20, step: 1, default: 16,
};

const polarModeParam: ParamSpec = {
  kind: "select", key: WARP_KEYS.mode, label: "Direction",
  options: [{ value: POLAR_MODES.toPolar, label: "Wrap into a circle" }, { value: POLAR_MODES.toRect, label: "Unroll the circle" }],
  default: POLAR_MODES.toPolar,
};

const rotationParam: ParamSpec = {
  kind: "number", key: WARP_KEYS.rotation, label: "Rotation", min: 0, max: 100, step: 1, default: 0, suffix: "%",
};

const periodParam: ParamSpec = {
  kind: "number", key: WARP_KEYS.period, label: "Waves", min: 25, max: 300, step: 1, default: 100, suffix: "%",
};

const PINCH_WARP: WarpSpec = {
  styleId: "pinch", effectKey: "pinch", label: "Pinch", glyph: "⊙",
  hint: "Draw the middle inward, or push it out",
  params: [signedAmountParam(150, 50), ...centreParams],
  build: pinchWarp,
};

const SPHERIZE_WARP: WarpSpec = {
  styleId: "spherize", effectKey: "spherize", label: "Spherize", glyph: "◍",
  hint: "Bulge the middle like a glass ball",
  params: [signedAmountParam(150, 60), ...centreParams],
  build: spherizeWarp,
};

const TWIRL_WARP: WarpSpec = {
  styleId: "twirl", effectKey: "twirl", label: "Twirl", glyph: "◉",
  hint: "Spin the middle into a swirl",
  params: [signedAmountParam(300, 60), ...centreParams],
  build: twirlWarp,
};

const ZIGZAG_WAVE_WARP: WarpSpec = {
  styleId: "zigzag-wave", effectKey: "zigzagWave", label: "Zigzag", glyph: "⌇",
  hint: "Wobble the picture in straight waves",
  params: [amountParam(50), wavelengthParam],
  build: zigzagWaveWarp,
};

const RIPPLE_RINGS_WARP: WarpSpec = {
  styleId: "ripple-rings", effectKey: "rippleRings", label: "Ripple", glyph: "≈",
  hint: "Rings spreading out like a drop in water",
  params: [amountParam(60), ringsParam, ...centreParams],
  build: rippleRingsWarp,
};

const POLAR_WARP: WarpSpec = {
  styleId: "polar", effectKey: "polar", label: "Polar", glyph: "◎",
  hint: "Wrap the picture into a little planet",
  params: [polarModeParam, rotationParam],
  build: polarWarp,
};

const SHEAR_WARP: WarpSpec = {
  styleId: "shear", effectKey: "shear", label: "Shear", glyph: "⇔",
  hint: "Bend the picture sideways in soft curves",
  params: [signedAmountParam(150, 50), periodParam],
  build: shearWarp,
};

export const WARP_SPECS: readonly WarpSpec[] = [
  PINCH_WARP, SPHERIZE_WARP, TWIRL_WARP, ZIGZAG_WAVE_WARP, RIPPLE_RINGS_WARP, POLAR_WARP, SHEAR_WARP,
];
