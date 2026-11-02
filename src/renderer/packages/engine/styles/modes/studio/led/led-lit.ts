import { Frame, type DrawContext } from "../../../engine/frame";
import { rgbaOf } from "../../../finish/cell-tone";
import { drawSoftCopy, softCopy } from "../../../finish/soft-copy";
import type { RgbTriple } from "../../../postfx/pixel-ops";
import { sampleLed, type LedPass } from "./led-grid";

const CHANNEL_MAX = 255;
const MIN_INTENSITY = 0.04;
const HOT_MIX = 0.55;
const HOT_EXPONENT = 3;
const ALPHA_EXPONENT = 0.5;
const FULL_TURN = Math.PI * 2;
const WHITE: RgbTriple = [255, 255, 255];
const CORE = {
  round: { base: 0.3, gain: 0.5, alpha: 0.85 },
  bulb: { base: 0.42, gain: 0.48, alpha: 0.8 },
  square: { base: 0.34, gain: 0.46, alpha: 0.85 },
} as const;
const SPECULAR = { dx: -0.28, dy: -0.3, radius: 0.3, alpha: 0.6 } as const;
const STRIPE = { barAlpha: 0.9, width: 0.24, height: 1.5, spacing: 0.3 } as const;
const WIDE_GLOW = { sigmaBase: 0.45, sigmaGain: 1.1, alphaBase: 0.45, alphaGain: 0.75 } as const;
const TIGHT_GLOW = { sigma: 0.3, alpha: 0.7 } as const;
const MAX_ALPHA = 1;
const PRE_SHRINK_SIGMA = 1.5;

interface LitLed {
  x: number;
  y: number;
  intensity: number;
  colour: RgbTriple;
  raw: RgbTriple;
}

const mixToWhite = (colour: RgbTriple, amount: number): RgbTriple =>
  [colour[0] + (CHANNEL_MAX - colour[0]) * amount, colour[1] + (CHANNEL_MAX - colour[1]) * amount, colour[2] + (CHANNEL_MAX - colour[2]) * amount];

const fillDisc = (cores: DrawContext, x: number, y: number, radius: number): void => {
  cores.beginPath();
  cores.arc(x, y, radius, 0, FULL_TURN);
  cores.fill();
};

const drawCore = (pass: LedPass, cores: DrawContext, led: LitLed): void => {
  const shape = pass.type === "stripe" ? "round" : pass.type;
  const core = CORE[shape];
  const size = pass.half * (core.base + core.gain * led.intensity);
  cores.fillStyle = rgbaOf(mixToWhite(led.colour, HOT_MIX * Math.pow(led.intensity, HOT_EXPONENT)), core.alpha * Math.pow(led.intensity, ALPHA_EXPONENT));
  if (shape === "square") cores.fillRect(led.x - size, led.y - size, size * 2, size * 2);
  else fillDisc(cores, led.x, led.y, size);
  if (shape !== "bulb") return;
  cores.fillStyle = rgbaOf(WHITE, SPECULAR.alpha * led.intensity);
  fillDisc(cores, led.x + SPECULAR.dx * size, led.y + SPECULAR.dy * size, SPECULAR.radius * size);
};

const drawStripe = (pass: LedPass, cores: DrawContext, led: LitLed): void => {
  const { half, pitch } = pass;
  led.raw.forEach((channel, index) => {
    const bar: RgbTriple = [index === 0 ? CHANNEL_MAX : 0, index === 1 ? CHANNEL_MAX : 0, index === 2 ? CHANNEL_MAX : 0];
    cores.fillStyle = rgbaOf(bar, (STRIPE.barAlpha * Math.min(CHANNEL_MAX, channel * pass.gain)) / CHANNEL_MAX);
    const barX = led.x + (index - 1) * STRIPE.spacing * pitch;
    cores.fillRect(barX - (STRIPE.width * pitch) / 2, led.y - (STRIPE.height * half) / 2, STRIPE.width * pitch, STRIPE.height * half);
  });
};

const drawLed = (pass: LedPass, cores: DrawContext, column: number, row: number): void => {
  const sample = sampleLed(pass, column, row);
  if (sample.intensity < MIN_INTENSITY) return;
  const led: LitLed = {
    x: column * pass.pitch + pass.half,
    y: row * pass.pitch + pass.half,
    intensity: Math.min(1, sample.intensity * pass.gain),
    colour: sample.colour,
    raw: sample.raw,
  };
  if (pass.type === "stripe") drawStripe(pass, cores, led);
  else drawCore(pass, cores, led);
};

const shrunkCopy = (layer: Frame, factor: number): OffscreenCanvas => {
  const small = new OffscreenCanvas(Math.max(1, Math.round(layer.width / factor)), Math.max(1, Math.round(layer.height / factor)));
  const context = small.getContext("2d");
  if (!context) return small;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(layer.canvas, 0, 0, small.width, small.height);
  return small;
};

const drawBlurred = (pass: LedPass, layer: Frame, sigma: number): void => {
  const factor = Math.max(1, Math.floor(sigma / PRE_SHRINK_SIGMA));
  const small = shrunkCopy(layer, factor);
  drawSoftCopy(pass.context, softCopy(small, small.width, small.height, sigma / factor), layer.width, layer.height);
};

const addLayer = (pass: LedPass, layer: Frame, sigma: number, alpha: number): void => {
  const { context } = pass;
  context.globalAlpha = Math.min(MAX_ALPHA, alpha);
  if (sigma > 0) drawBlurred(pass, layer, sigma);
  else context.drawImage(layer.canvas, 0, 0);
  context.globalAlpha = 1;
};

export const drawLitLeds = (pass: LedPass, width: number, height: number): void => {
  const layer = new Frame(width, height);
  const cores = layer.context;
  for (let row = 0; row < pass.rows; row++) {
    for (let column = 0; column < pass.columns; column++) drawLed(pass, cores, column, row);
  }
  pass.context.globalCompositeOperation = "lighter";
  addLayer(pass, layer, pass.half * (WIDE_GLOW.sigmaBase + WIDE_GLOW.sigmaGain * pass.glow), WIDE_GLOW.alphaBase + WIDE_GLOW.alphaGain * pass.glow);
  addLayer(pass, layer, pass.half * TIGHT_GLOW.sigma, TIGHT_GLOW.alpha * pass.glow);
  addLayer(pass, layer, 0, 1);
  pass.context.globalCompositeOperation = "source-over";
};
