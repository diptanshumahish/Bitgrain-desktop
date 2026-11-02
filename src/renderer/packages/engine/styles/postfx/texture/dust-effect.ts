import type { DrawContext } from "../../engine/frame";
import type { RandomSource } from "../../engine/seeded-random";
import { numberParam } from "../../engine/resolve-params";
import { percentParam, type EffectDefinition, type EffectInput } from "../effect-definition";

const PERCENT = 100;
const FLICKER_ALPHA = 0.1;
const MIN_FLICKER = 0.002;
const SCRATCH_COUNT = 7;
const SCRATCH_KEEP = 0.75;
const SCRATCH_WHITE = 0.55;
const SCRATCH_ALPHA_BASE = 0.12;
const SCRATCH_ALPHA_RANGE = 0.38;
const SCRATCH_WIDTH_BASE = 0.4;
const SCRATCH_WIDTH_RANGE = 1.1;
const SCRATCH_SEGMENTS = 8;
const SCRATCH_JITTER = 2.5;
const SPECK_DENSITY = 200;
const SPECK_WHITE = 0.4;
const HAIR_SHARE = 0.2;
const HAIR_SPAN_X = 8;
const HAIR_SPAN_Y = 12;
const HAIR_WIDTH = 0.5;
const SPECK_RADIUS_BASE = 0.3;
const SPECK_RADIUS_RANGE = 1.2;
const FULL_TURN = Math.PI * 2;

const drawScratch = (context: DrawContext, random: RandomSource, width: number, height: number, scale: number): void => {
  const white = random() < SCRATCH_WHITE;
  const alpha = SCRATCH_ALPHA_BASE + SCRATCH_ALPHA_RANGE * random();
  context.strokeStyle = white ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
  context.lineWidth = (SCRATCH_WIDTH_BASE + SCRATCH_WIDTH_RANGE * random()) * scale;
  let x = random() * width;
  context.beginPath();
  context.moveTo(x, 0);
  for (let segment = 1; segment <= SCRATCH_SEGMENTS; segment++) {
    x += (random() - 0.5) * SCRATCH_JITTER * scale;
    context.lineTo(x, (segment / SCRATCH_SEGMENTS) * height);
  }
  context.stroke();
};

const drawSpeck = (context: DrawContext, random: RandomSource, width: number, height: number, scale: number): void => {
  const white = random() < SPECK_WHITE;
  const alpha = white ? 0.2 + 0.5 * random() : 0.2 + 0.4 * random();
  const colour = white ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
  const x = random() * width;
  const y = random() * height;
  if (random() < HAIR_SHARE) {
    context.strokeStyle = colour;
    context.lineWidth = HAIR_WIDTH * scale;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + (random() - 0.5) * HAIR_SPAN_X * scale, y + random() * HAIR_SPAN_Y * scale);
    context.stroke();
    return;
  }
  context.fillStyle = colour;
  context.beginPath();
  context.arc(x, y, (SPECK_RADIUS_BASE + SPECK_RADIUS_RANGE * random()) * scale, 0, FULL_TURN);
  context.fill();
};

const drawFlicker = (context: DrawContext, random: RandomSource, density: number, width: number, height: number): void => {
  const flicker = random() - 0.5;
  const alpha = Math.abs(flicker) * density * FLICKER_ALPHA;
  if (alpha < MIN_FLICKER) return;
  context.globalCompositeOperation = flicker >= 0 ? "lighter" : "source-over";
  context.fillStyle = flicker >= 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = "source-over";
};

const applyDust = ({ frame, values, scale, random }: EffectInput): void => {
  const density = numberParam(values, "amount") / PERCENT;
  if (density <= 0) return;
  const context = frame.context;
  const { width, height } = frame;
  drawFlicker(context, random, density, width, height);
  const scratches = Math.round(SCRATCH_COUNT * density);
  for (let scratch = 0; scratch < scratches; scratch++) {
    if (random() < SCRATCH_KEEP) drawScratch(context, random, width, height, scale);
  }
  const specks = Math.floor(SPECK_DENSITY * density * scale * scale);
  for (let speck = 0; speck < specks; speck++) drawSpeck(context, random, width, height, scale);
};

export const FILM_DUST_EFFECT: EffectDefinition = {
  key: "filmDust",
  label: "Film dust",
  hint: "Specks, hairs and scratches",
  params: [percentParam("amount", "Amount", 20)],
  apply: applyDust,
};
