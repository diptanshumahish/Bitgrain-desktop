import type { DrawContext } from "../../../../engine/frame";

export type ShapePath = (path: DrawContext, x: number, y: number, size: number) => void;

export interface ShapeDefinition {
  trace: ShapePath;
  evenOdd: boolean;
}

const FULL_TURN = Math.PI * 2;
const TRIANGLE_HEIGHT = 0.866;
const HEX_SIDES = 6;
const PIXEL_RATIO = 0.64;
const RING_WALL = 0.14;
const THIN_WALL = 0.07;
const DONUT_WALL = 0.3;
const DOT_RING_DISC = 0.24;
const BULLSEYE_HOLE = 0.27;
const BULLSEYE_DOT = 0.12;
const PETAL_RY = 0.31;
const CORNER_RADIUS = 0.22;
const SQ_DOT_HOLE = 0.2;
const MIN_INNER_RADIUS = 1;

const circlePath = (path: DrawContext, x: number, y: number, radius: number): void => {
  path.moveTo(x + radius, y);
  path.arc(x, y, radius, 0, FULL_TURN);
};

export const rectPath = (path: DrawContext, x: number, y: number, width: number, height: number): void => {
  path.rect(x - width / 2, y - height / 2, width, height);
};

export const polygonPath = (path: DrawContext, points: readonly (readonly [number, number])[]): void => {
  points.forEach(([px, py], index) => (index === 0 ? path.moveTo(px, py) : path.lineTo(px, py)));
  path.closePath();
};

const roundedRectPath = (path: DrawContext, x: number, y: number, side: number, radius: number): void => {
  const half = side / 2;
  const corner = Math.min(radius, half);
  path.moveTo(x - half + corner, y - half);
  path.arcTo(x + half, y - half, x + half, y + half, corner);
  path.arcTo(x + half, y + half, x - half, y + half, corner);
  path.arcTo(x - half, y + half, x - half, y - half, corner);
  path.arcTo(x - half, y - half, x + half, y - half, corner);
  path.closePath();
};

const ringPath = (wall: number): ShapePath => (path, x, y, size) => {
  circlePath(path, x, y, size / 2);
  circlePath(path, x, y, size / 2 - wall * size);
};

const hexPath: ShapePath = (path, x, y, size) =>
  polygonPath(path, Array.from({ length: HEX_SIDES }, (_, corner) => {
    const angle = (corner / HEX_SIDES) * FULL_TURN - Math.PI / 2;
    return [x + Math.cos(angle) * (size / 2), y + Math.sin(angle) * (size / 2)] as const;
  }));

const solid = (trace: ShapePath): ShapeDefinition => ({ trace, evenOdd: false });
const holed = (trace: ShapePath): ShapeDefinition => ({ trace, evenOdd: true });

export const GEOMETRY_SHAPES: Readonly<Record<string, ShapeDefinition>> = {
  circle: solid((path, x, y, size) => circlePath(path, x, y, size / 2)),
  square: solid((path, x, y, size) => rectPath(path, x, y, size, size)),
  diamond: solid((path, x, y, size) => polygonPath(path, [[x, y - size / 2], [x + size / 2, y], [x, y + size / 2], [x - size / 2, y]])),
  triangle: solid((path, x, y, size) =>
    polygonPath(path, [[x, y - (TRIANGLE_HEIGHT * size) / 2], [x + size / 2, y + (TRIANGLE_HEIGHT * size) / 2], [x - size / 2, y + (TRIANGLE_HEIGHT * size) / 2]])),
  hex: solid(hexPath),
  pixel: solid((path, x, y, size) => rectPath(path, x, y, size * PIXEL_RATIO, size * PIXEL_RATIO)),
  ring: holed(ringPath(RING_WALL)),
  ringThin: holed(ringPath(THIN_WALL)),
  donut: holed(ringPath(DONUT_WALL)),
  dotRing: holed((path, x, y, size) => {
    ringPath(THIN_WALL)(path, x, y, size);
    circlePath(path, x, y, DOT_RING_DISC * size);
  }),
  bullseye: holed((path, x, y, size) => {
    circlePath(path, x, y, size / 2);
    circlePath(path, x, y, BULLSEYE_HOLE * size);
    circlePath(path, x, y, BULLSEYE_DOT * size);
  }),
  petal: solid((path, x, y, size) => {
    path.moveTo(x + size / 2, y);
    path.ellipse(x, y, size / 2, PETAL_RY * size, 0, 0, FULL_TURN);
  }),
  squareRing: holed((path, x, y, size) => {
    rectPath(path, x, y, size, size);
    rectPath(path, x, y, size * (1 - 2 * RING_WALL), size * (1 - 2 * RING_WALL));
  }),
  sqRound: solid((path, x, y, size) => roundedRectPath(path, x, y, size, CORNER_RADIUS * size)),
  sqRoundRing: holed((path, x, y, size) => {
    roundedRectPath(path, x, y, size, CORNER_RADIUS * size);
    roundedRectPath(path, x, y, size * (1 - 2 * RING_WALL), Math.max((CORNER_RADIUS - RING_WALL) * size, MIN_INNER_RADIUS));
  }),
  sqDot: holed((path, x, y, size) => {
    rectPath(path, x, y, size, size);
    circlePath(path, x, y, SQ_DOT_HOLE * size);
  }),
  corner: solid((path, x, y, size) => polygonPath(path, [[x - size / 2, y - size / 2], [x + size / 2, y - size / 2], [x - size / 2, y + size / 2]])),
};
