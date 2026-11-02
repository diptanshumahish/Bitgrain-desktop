import type { ParamValues } from "../../../engine/style-types";
import { textParam } from "../../../engine/resolve-params";
import type { WarpMapper } from "./warp-sampler";
import { fraction, WARP_KEYS, type WarpGeometry } from "./warp-spec";

const FULL_TURN = Math.PI * 2;
const HALF = 2;
const SEAM_SHARE = 0.12;

export const POLAR_MODES = { toPolar: "rect2polar", toRect: "polar2rect" } as const;

const wrapTurn = (angle: number): number => {
  const wrapped = angle % FULL_TURN;
  return wrapped < 0 ? wrapped + FULL_TURN : wrapped;
};

const toPolarWarp = (geometry: WarpGeometry, rotation: number): WarpMapper => {
  const centreX = geometry.width / HALF;
  const centreY = geometry.height / HALF;
  const radius = Math.hypot(geometry.width, geometry.height) / HALF;
  const lastColumn = geometry.width - 1;
  const lastRow = geometry.height - 1;
  return {
    map: (x, y, point) => {
      const offsetX = x - centreX;
      const offsetY = y - centreY;
      const turn = (wrapTurn(Math.atan2(offsetY, offsetX) + Math.PI + rotation) / FULL_TURN) * (1 - SEAM_SHARE);
      point.x = turn * lastColumn;
      point.y = (1 - Math.min(1, Math.hypot(offsetX, offsetY) / radius)) * lastRow;
      if (turn >= SEAM_SHARE) return;
      point.blendX = (turn + 1 - SEAM_SHARE) * lastColumn;
      point.blendY = point.y;
      point.blend = 1 - turn / SEAM_SHARE;
    },
  };
};

const toRectWarp = (geometry: WarpGeometry, rotation: number): WarpMapper => {
  const centreX = geometry.width / HALF;
  const centreY = geometry.height / HALF;
  const radius = Math.min(geometry.width, geometry.height) / HALF;
  const lastColumn = Math.max(1, geometry.width - 1);
  const lastRow = Math.max(1, geometry.height - 1);
  return {
    map: (x, y, point) => {
      const reach = (1 - y / lastRow) * radius;
      const angle = (x / lastColumn) * FULL_TURN - Math.PI - rotation;
      point.x = centreX + reach * Math.cos(angle);
      point.y = centreY + reach * Math.sin(angle);
    },
  };
};

export const polarWarp = (values: ParamValues, geometry: WarpGeometry): WarpMapper => {
  const rotation = fraction(values, WARP_KEYS.rotation) * FULL_TURN;
  return textParam(values, WARP_KEYS.mode) === POLAR_MODES.toRect
    ? toRectWarp(geometry, rotation)
    : toPolarWarp(geometry, rotation);
};
