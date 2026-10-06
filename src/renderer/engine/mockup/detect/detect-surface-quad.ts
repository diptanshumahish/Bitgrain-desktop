import { toGrayImage, blurGrayImage } from "./gray-image";
import { sobelMagnitude, magnitudeThreshold } from "./sobel";
import { detectLines } from "./hough-lines";
import { bestQuadFromLines } from "./quad-candidates";
import type { RasterSource } from "./gray-image";
import type { MockupQuad } from "../mockup-types";

const DETECT_MAX_EDGE = 480;
const EDGE_KEEP_FRACTION = 0.08;
const MAX_LINES = 14;
const MIN_ACCEPTABLE_SCORE = 0.45;

export const detectSurfaceQuad = (source: RasterSource): MockupQuad | null => {
  const gray = toGrayImage(source, DETECT_MAX_EDGE);
  if (!gray) return null;

  const field = sobelMagnitude(blurGrayImage(gray));
  const threshold = magnitudeThreshold(field, EDGE_KEEP_FRACTION);
  if (threshold <= 0) return null;

  const lines = detectLines(field, threshold, MAX_LINES);
  if (lines.length < 4) return null;

  const best = bestQuadFromLines(lines, field, threshold);
  if (!best || best.score < MIN_ACCEPTABLE_SCORE) return null;

  return best.corners.map((corner) => ({
    x: Math.min(1, Math.max(0, corner.x / field.width)),
    y: Math.min(1, Math.max(0, corner.y / field.height)),
  })) as MockupQuad;
};
