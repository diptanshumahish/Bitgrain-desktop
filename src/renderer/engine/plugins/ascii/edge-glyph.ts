const EDGE_MIN = 6;
const EDGE_RANGE = 90;
const BYTE_MAX = 255;

const directionalGlyph = (gradientX: number, gradientY: number): string => {
  let angle = Math.atan2(gradientY, gradientX);
  if (angle < 0) angle += Math.PI;
  const degrees = (angle * 180) / Math.PI;
  if (degrees < 22.5 || degrees >= 157.5) return "|";
  if (degrees < 67.5) return "/";
  if (degrees < 112.5) return "-";
  return "\\";
};

export const edgeGlyphAt = (
  levels: Float32Array,
  cols: number,
  rows: number,
  col: number,
  row: number,
  sensitivity: number,
): string | null => {
  if (col < 1 || row < 1 || col >= cols - 1 || row >= rows - 1) return null;
  const at = (dx: number, dy: number): number => levels[(row + dy) * cols + col + dx] * BYTE_MAX;
  const gradientX = (at(1, -1) + 2 * at(1, 0) + at(1, 1)) - (at(-1, -1) + 2 * at(-1, 0) + at(-1, 1));
  const gradientY = (at(-1, 1) + 2 * at(0, 1) + at(1, 1)) - (at(-1, -1) + 2 * at(0, -1) + at(1, -1));
  const threshold = (1 - sensitivity) * EDGE_RANGE + EDGE_MIN;
  if (gradientX * gradientX + gradientY * gradientY <= threshold * threshold) return null;
  return directionalGlyph(gradientX, gradientY);
};
