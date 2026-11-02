import type { Rgb } from "../../finish/cell-grid";

const STUD_RADIUS = 0.35;
const SHADOW_OFFSET_X = 0.04;
const SHADOW_OFFSET_Y = 0.06;
const SHADOW_ALPHA = 0.25;
const STUD_LIFT = 20;
const RIM_OFFSET = 0.3;
const RIM_INNER = 0.2;
const RIM_CLEAR_STOP = 0.7;
const RIM_ALPHA = 0.3;
const SHINE_OFFSET_X = 0.3;
const SHINE_OFFSET_Y = 0.35;
const SHINE_INNER = 0.05;
const SHINE_END_OFFSET = 0.1;
const SHINE_OUTER = 0.7;
const SHINE_ALPHA = 0.5;
const CHANNEL_MAX = 255;
const FULL_TURN = Math.PI * 2;

type Context = OffscreenCanvasRenderingContext2D;

const disc = (context: Context, x: number, y: number, radius: number, fill: string | CanvasGradient): void => {
  context.fillStyle = fill;
  context.beginPath();
  context.arc(x, y, radius, 0, FULL_TURN);
  context.fill();
};

const rgb = (colour: Rgb, lift = 0): string =>
  `rgb(${Math.min(CHANNEL_MAX, colour[0] + lift)},${Math.min(CHANNEL_MAX, colour[1] + lift)},${Math.min(CHANNEL_MAX, colour[2] + lift)})`;

const paintStudShading = (context: Context, centreX: number, centreY: number, radius: number): void => {
  const rim = context.createRadialGradient(centreX - RIM_OFFSET * radius, centreY - RIM_OFFSET * radius, RIM_INNER * radius, centreX, centreY, radius);
  rim.addColorStop(0, "rgba(0,0,0,0)");
  rim.addColorStop(RIM_CLEAR_STOP, "rgba(0,0,0,0)");
  rim.addColorStop(1, `rgba(0,0,0,${RIM_ALPHA})`);
  disc(context, centreX, centreY, radius, rim);
  const shine = context.createRadialGradient(
    centreX - SHINE_OFFSET_X * radius, centreY - SHINE_OFFSET_Y * radius, SHINE_INNER * radius,
    centreX - SHINE_END_OFFSET * radius, centreY - SHINE_END_OFFSET * radius, SHINE_OUTER * radius,
  );
  shine.addColorStop(0, `rgba(255,255,255,${SHINE_ALPHA})`);
  shine.addColorStop(1, "rgba(255,255,255,0)");
  disc(context, centreX, centreY, radius, shine);
};

export const paintBrick = (size: number, colour: Rgb): OffscreenCanvas => {
  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  const centre = size / 2;
  const radius = STUD_RADIUS * size;
  context.fillStyle = rgb(colour);
  context.fillRect(0, 0, size, size);
  disc(context, centre + SHADOW_OFFSET_X * size, centre + SHADOW_OFFSET_Y * size, radius, `rgba(0,0,0,${SHADOW_ALPHA})`);
  disc(context, centre, centre, radius, rgb(colour, STUD_LIFT));
  paintStudShading(context, centre, centre, radius);
  return canvas;
};
