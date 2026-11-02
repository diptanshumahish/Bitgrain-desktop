import type { ParamSpec, ParamValues } from "../../../engine/style-types";
import { numberParam } from "../../../engine/resolve-params";
import type { WarpMapper } from "./warp-sampler";

const PERCENT = 100;
const HALF = 2;

export const WARP_KEYS = {
  amount: "amount",
  radius: "radius",
  centreX: "x",
  centreY: "y",
  wavelength: "wavelength",
  rings: "rings",
  mode: "mode",
  rotation: "rotation",
  period: "period",
} as const;

export interface WarpGeometry {
  width: number;
  height: number;
  scale: number;
}

export interface WarpSpec {
  styleId: string;
  effectKey: string;
  label: string;
  hint: string;
  glyph: string;
  params: readonly ParamSpec[];
  build: (values: ParamValues, geometry: WarpGeometry) => WarpMapper;
}

interface WarpCentre {
  centreX: number;
  centreY: number;
  radius: number;
}

export const signedAmountParam = (limit: number, defaultValue: number): ParamSpec => ({
  kind: "number", key: WARP_KEYS.amount, label: "Amount", min: -limit, max: limit, step: 1, default: defaultValue, suffix: "%",
});

export const amountParam = (defaultValue: number): ParamSpec => ({
  kind: "number", key: WARP_KEYS.amount, label: "Amount", min: 0, max: PERCENT, step: 1, default: defaultValue, suffix: "%",
});

export const centreParams: readonly ParamSpec[] = [
  { kind: "number", key: WARP_KEYS.radius, label: "Reach", min: 10, max: 150, step: 1, default: 100, suffix: "%", advanced: true },
  { kind: "number", key: WARP_KEYS.centreX, label: "Centre across", min: 0, max: 100, step: 1, default: 50, suffix: "%", advanced: true },
  { kind: "number", key: WARP_KEYS.centreY, label: "Centre down", min: 0, max: 100, step: 1, default: 50, suffix: "%", advanced: true },
];

export const fraction = (values: ParamValues, key: string): number => numberParam(values, key) / PERCENT;

export const warpCentre = (values: ParamValues, geometry: WarpGeometry): WarpCentre => ({
  centreX: fraction(values, WARP_KEYS.centreX) * geometry.width,
  centreY: fraction(values, WARP_KEYS.centreY) * geometry.height,
  radius: Math.max(1, (Math.min(geometry.width, geometry.height) / HALF) * fraction(values, WARP_KEYS.radius)),
});
