import type { MockupPoint } from "../../../engine/mockup/mockup-types";

export const LOUPE_SIZE = 116;
const ZOOM = 5;
const CROSSHAIR_ARM = 9;
const CROSSHAIR_COLOR = "#820000";

export const drawCornerLoupe = (
  source: HTMLCanvasElement,
  loupe: HTMLCanvasElement,
  point: MockupPoint,
): void => {
  const context = loupe.getContext("2d");
  if (!context) return;

  const viewport = LOUPE_SIZE / ZOOM;
  const centerX = point.x * source.width;
  const centerY = point.y * source.height;

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
  context.drawImage(
    source,
    centerX - viewport / 2,
    centerY - viewport / 2,
    viewport,
    viewport,
    0,
    0,
    LOUPE_SIZE,
    LOUPE_SIZE,
  );

  const middle = LOUPE_SIZE / 2;
  context.strokeStyle = CROSSHAIR_COLOR;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(middle - CROSSHAIR_ARM, middle);
  context.lineTo(middle + CROSSHAIR_ARM, middle);
  context.moveTo(middle, middle - CROSSHAIR_ARM);
  context.lineTo(middle, middle + CROSSHAIR_ARM);
  context.stroke();
};
