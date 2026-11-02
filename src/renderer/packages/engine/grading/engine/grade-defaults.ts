import type {
  ColorGrade,
  CurvePoint,
  HslAdjustment,
  HslAdjustments,
  HslBand,
  ToneCurves,
  ToneWheel,
} from "./grade-types";

export const HSL_BANDS: readonly HslBand[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "aqua",
  "blue",
  "purple",
  "magenta",
];

export const IDENTITY_CURVE: readonly CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

const NEUTRAL_HSL: HslAdjustment = { hue: 0, saturation: 0, luminance: 0 };
const NEUTRAL_WHEEL: ToneWheel = { hue: 0, amount: 0 };

const buildNeutralHsl = (): HslAdjustments =>
  HSL_BANDS.reduce(
    (acc, band) => ({ ...acc, [band]: NEUTRAL_HSL }),
    {} as HslAdjustments,
  );

const NEUTRAL_CURVES: ToneCurves = {
  master: [...IDENTITY_CURVE],
  red: [...IDENTITY_CURVE],
  green: [...IDENTITY_CURVE],
  blue: [...IDENTITY_CURVE],
};

export const DEFAULT_COLOR_GRADE: ColorGrade = {
  exposure: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  curves: NEUTRAL_CURVES,
  hsl: buildNeutralHsl(),
  wheels: {
    shadows: NEUTRAL_WHEEL,
    midtones: NEUTRAL_WHEEL,
    highlights: NEUTRAL_WHEEL,
  },
  balance: 0,
};
