import type { MockupQuad } from "./mockup-types";

const DEGREES_TO_RADIANS = Math.PI / 180;
const UNIT_OFFSETS = [
  { dx: -0.5, dy: -0.5 },
  { dx: 0.5, dy: -0.5 },
  { dx: 0.5, dy: 0.5 },
  { dx: -0.5, dy: 0.5 },
];

export interface LegacyMockupSlot {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

export const slotToCorners = (slot: LegacyMockupSlot, aspectRatio: number): MockupQuad => {
  const centerX = slot.x + slot.w / 2;
  const centerY = slot.y + slot.h / 2;
  const angle = (slot.rotation || 0) * DEGREES_TO_RADIANS;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return UNIT_OFFSETS.map(({ dx, dy }) => {
    const offsetX = dx * slot.w * aspectRatio;
    const offsetY = dy * slot.h;
    return {
      x: centerX + (offsetX * cosine - offsetY * sine) / aspectRatio,
      y: centerY + (offsetX * sine + offsetY * cosine),
    };
  }) as MockupQuad;
};
