import { rgbaOf } from "../../../finish/cell-tone";
import type { LedPass } from "./led-grid";

const SOLID_HOUSING_ALPHA = 0.06;
const SOURCE_HOUSING_ALPHA = 0.05;
const WHITE: [number, number, number] = [255, 255, 255];
const SQUARE_HALF = 0.78;
const ROUND_RADIUS = 0.42;
const BULB_RADIUS = 0.62;
const STRIPE_WIDTH = 0.24;
const STRIPE_HEIGHT = 1.5;
const STRIPE_SPACING = 0.3;
const STRIPE_OFFSETS = [-1, 0, 1] as const;
const FULL_TURN = Math.PI * 2;

const traceHousing = (pass: LedPass, x: number, y: number): void => {
  const { context, half, pitch } = pass;
  if (pass.type === "square") {
    context.rect(x - SQUARE_HALF * half, y - SQUARE_HALF * half, 2 * SQUARE_HALF * half, 2 * SQUARE_HALF * half);
    return;
  }
  if (pass.type === "stripe") {
    for (const offset of STRIPE_OFFSETS) {
      const barX = x + offset * STRIPE_SPACING * pitch;
      context.rect(barX - (STRIPE_WIDTH * pitch) / 2, y - (STRIPE_HEIGHT * half) / 2, STRIPE_WIDTH * pitch, STRIPE_HEIGHT * half);
    }
    return;
  }
  const radius = (pass.type === "bulb" ? BULB_RADIUS : ROUND_RADIUS) * half;
  context.moveTo(x + radius, y);
  context.arc(x, y, radius, 0, FULL_TURN);
};

export const drawHousings = (pass: LedPass): void => {
  const { context } = pass;
  context.fillStyle = pass.fromSource ? rgbaOf(WHITE, SOURCE_HOUSING_ALPHA) : rgbaOf(pass.colour, SOLID_HOUSING_ALPHA);
  for (let row = 0; row < pass.rows; row++) {
    context.beginPath();
    for (let column = 0; column < pass.columns; column++) {
      traceHousing(pass, column * pass.pitch + pass.half, row * pass.pitch + pass.half);
    }
    context.fill();
  }
};
