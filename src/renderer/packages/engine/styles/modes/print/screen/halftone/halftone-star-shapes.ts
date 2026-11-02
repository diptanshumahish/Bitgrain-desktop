import type { ShapeDistance } from "./halftone-shapes";

const HEART_SCALE = 0.587;
const HEART_OFFSET = 0.5518;
const HEART_LOBE_X = 0.25;
const HEART_LOBE_Y = 0.75;
const HEART_LOBE_RADIUS = Math.SQRT2 / 4;
const PETAL_INNER = 0.18;
const PETAL_SHARPNESS = 0.9;
const STAR_POINTS = 5;
const STAR_DEPTH = 2.4;
const SPARKLE_POINTS = 4;
const SPARKLE_DEPTH = 2;

const starDistance = (x: number, y: number, points: number, depth: number): number => {
  const pointAngle = Math.PI / points;
  const innerAngle = Math.PI / depth;
  const sector = 2 * pointAngle;
  const angle = Math.atan2(x, -y);
  const bent = ((angle % sector) + sector) % sector - pointAngle;
  const length = Math.hypot(x, y);
  let pointX = length * Math.cos(bent) - Math.cos(pointAngle);
  let pointY = length * Math.abs(Math.sin(bent)) - Math.sin(pointAngle);
  const reach = Math.min(Math.sin(pointAngle) / Math.sin(innerAngle), Math.max(0, -(pointX * Math.cos(innerAngle) + pointY * Math.sin(innerAngle))));
  pointX += Math.cos(innerAngle) * reach;
  pointY += Math.sin(innerAngle) * reach;
  return Math.hypot(pointX, pointY) * Math.sign(pointX);
};

export const star5Distance: ShapeDistance = (x, y) => starDistance(x, y, STAR_POINTS, STAR_DEPTH);
export const sparkleDistance: ShapeDistance = (x, y) => starDistance(x, y, SPARKLE_POINTS, SPARKLE_DEPTH);

export const heartDistance: ShapeDistance = (x, y) => {
  const pointX = Math.abs(x * HEART_SCALE);
  const pointY = -y * HEART_SCALE + HEART_OFFSET;
  if (pointY + pointX > 1) return (Math.hypot(pointX - HEART_LOBE_X, pointY - HEART_LOBE_Y) - HEART_LOBE_RADIUS) / HEART_SCALE;
  const along = 0.5 * Math.max(pointX + pointY, 0);
  const toTip = Math.hypot(pointX, pointY - 1);
  const toSpine = Math.hypot(pointX - along, pointY - along);
  return (Math.min(toTip, toSpine) * Math.sign(pointX - pointY)) / HEART_SCALE;
};

export const petalDistance: ShapeDistance = (x, y) => {
  const radius = Math.hypot(x, y);
  const lobe = Math.pow(Math.abs(Math.cos(2 * Math.atan2(y, x))), PETAL_SHARPNESS);
  return radius - (PETAL_INNER + (1 - PETAL_INNER) * lobe);
};
