export interface CurvePoint {
  x: number;
  y: number;
}

export type CurveChannel = "master" | "red" | "green" | "blue";

export type ToneCurves = Record<CurveChannel, CurvePoint[]>;

export type HslBand =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "aqua"
  | "blue"
  | "purple"
  | "magenta";

export interface HslAdjustment {
  hue: number;
  saturation: number;
  luminance: number;
}

export type HslAdjustments = Record<HslBand, HslAdjustment>;

export type ToneRange = "shadows" | "midtones" | "highlights";

export interface ToneWheel {
  hue: number;
  amount: number;
}

export type ToneWheels = Record<ToneRange, ToneWheel>;

export interface ColorGrade {
  exposure: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  temperature: number;
  tint: number;
  vibrance: number;
  curves: ToneCurves;
  hsl: HslAdjustments;
  wheels: ToneWheels;
  balance: number;
}

export type GradeSliderKey =
  | "exposure"
  | "highlights"
  | "shadows"
  | "whites"
  | "blacks"
  | "temperature"
  | "tint"
  | "vibrance"
  | "balance";
