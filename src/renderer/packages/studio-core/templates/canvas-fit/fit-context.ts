import type { PageSafeZone } from "../../design-sizes/safe-zone-types";

export interface FitSize {
  width: number;
  height: number;
}

export interface FitBox extends FitSize {
  x: number;
  y: number;
}

export interface FitContext {
  from: FitSize;
  to: FitSize;
  content: FitBox;
  ratioX: number;
  ratioY: number;
  scale: number;
}

const fullBox = (size: FitSize): FitBox => ({ x: 0, y: 0, width: size.width, height: size.height });

const safeContentBox = (to: FitSize, safeZones: PageSafeZone[] | undefined): FitBox => {
  const zone = safeZones?.[0];
  if (!zone) return fullBox(to);
  return { x: zone.x * to.width, y: zone.y * to.height, width: zone.width * to.width, height: zone.height * to.height };
};

export const makeFitContext = (from: FitSize, to: FitSize, safeZones?: PageSafeZone[]): FitContext => {
  const content = safeContentBox(to, safeZones);
  const ratioX = to.width / from.width;
  const ratioY = to.height / from.height;
  return { from, to, content, ratioX, ratioY, scale: Math.min(content.width / from.width, content.height / from.height) };
};

export const isSameSize = (from: FitSize, to: FitSize): boolean =>
  from.width === to.width && from.height === to.height;
