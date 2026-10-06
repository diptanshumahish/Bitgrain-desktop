import {
  drawNoise,
  getChannels,
  drawScaledCentered,
  drawMosaic,
  posterize,
  threshold,
  solarize,
  invert,
  contrast,
} from "./animate-helpers";

const NOISE_SEED_STEPS = 1000;

export interface Animator {
  id: string;
  name: string;
  draw: (
    ctx: CanvasRenderingContext2D,
    base: CanvasImageSource,
    phase: number,
    width: number,
    height: number,
  ) => void;
}

const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;

// phase 0..1 → 0..1 starting low (no effect at the loop seam)
const swell = (phase: number): number => (Math.sin(phase * TWO_PI - HALF_PI) + 1) / 2;

const drawBase = (
  ctx: CanvasRenderingContext2D,
  base: CanvasImageSource,
  width: number,
  height: number,
): void => {
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(base, 0, 0, width, height);
};

export const ANIMATORS: Animator[] = [
  {
    id: "posterize",
    name: "Posterize cycle",
    draw(ctx, base, phase, width, height) {
      drawBase(ctx, base, width, height);
      posterize(ctx, width, height, Math.round(2 + swell(phase) * 6));
    },
  },
  {
    id: "threshold",
    name: "Threshold sweep",
    draw(ctx, base, phase, width, height) {
      drawBase(ctx, base, width, height);
      threshold(ctx, width, height, 128 + Math.sin(phase * TWO_PI) * 95);
    },
  },
  {
    id: "solarize",
    name: "Solarize",
    draw(ctx, base, phase, width, height) {
      drawBase(ctx, base, width, height);
      solarize(ctx, width, height, 60 + swell(phase) * 150);
    },
  },
  {
    id: "invert-flash",
    name: "Invert flash",
    draw(ctx, base, phase, width, height) {
      drawBase(ctx, base, width, height);
      invert(ctx, width, height, swell(phase));
    },
  },
  {
    id: "contrast-throb",
    name: "Contrast throb",
    draw(ctx, base, phase, width, height) {
      drawBase(ctx, base, width, height);
      contrast(ctx, width, height, 1 + Math.sin(phase * TWO_PI) * 0.65);
    },
  },
  {
    id: "mosaic",
    name: "Mosaic breathe",
    draw(ctx, base, phase, width, height) {
      drawMosaic(ctx, base, width, height, 1 - swell(phase) * 0.82);
    },
  },
  {
    id: "hue-cycle",
    name: "Hue cycle",
    draw(ctx, base, phase, width, height) {
      ctx.clearRect(0, 0, width, height);
      ctx.filter = `hue-rotate(${Math.round(phase * 360)}deg)`;
      ctx.drawImage(base, 0, 0, width, height);
      ctx.filter = "none";
    },
  },
  {
    id: "rgb-split",
    name: "RGB split",
    draw(ctx, base, phase, width, height) {
      const channels = getChannels(base, width, height);
      const dx = Math.sin(phase * TWO_PI) * width * 0.018;
      const dy = Math.cos(phase * TWO_PI) * height * 0.01;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(channels.g, 0, 0, width, height);
      ctx.drawImage(channels.r, dx, dy, width, height);
      ctx.drawImage(channels.b, -dx, -dy, width, height);
      ctx.globalCompositeOperation = "source-over";
    },
  },
  {
    id: "radial-chroma",
    name: "Lens chroma",
    draw(ctx, base, phase, width, height) {
      const channels = getChannels(base, width, height);
      const amp = swell(phase) * 0.045;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      drawScaledCentered(ctx, channels.g, width, height, 1);
      drawScaledCentered(ctx, channels.r, width, height, 1 + amp);
      drawScaledCentered(ctx, channels.b, width, height, 1 - amp);
      ctx.globalCompositeOperation = "source-over";
    },
  },
  {
    id: "glitch",
    name: "Glitch",
    draw(ctx, base, phase, width, height) {
      drawBase(ctx, base, width, height);
      const bands = 7;
      for (let band = 0; band < bands; band += 1) {
        const seed = band * 7.13;
        if (Math.sin(phase * TWO_PI + seed) < 0.5) continue;
        const bandY = (band / bands) * height;
        const bandH = (height / bands) * 0.6;
        const shift = Math.sin(phase * TWO_PI * 4 + seed) * width * 0.05;
        ctx.drawImage(base, 0, bandY, width, bandH, shift, bandY, width, bandH);
      }
    },
  },
  {
    id: "echo",
    name: "Echo",
    draw(ctx, base, phase, width, height) {
      ctx.clearRect(0, 0, width, height);
      const copies = 4;
      const direction = Math.sin(phase * TWO_PI);
      for (let copy = copies; copy >= 1; copy -= 1) {
        const offset = direction * width * 0.04 * (copy / copies);
        ctx.globalAlpha = copy === 1 ? 1 : 0.28;
        ctx.drawImage(base, offset, 0, width, height);
      }
      ctx.globalAlpha = 1;
    },
  },
  {
    id: "ripple",
    name: "Ripple",
    draw(ctx, base, phase, width, height) {
      const strip = 3;
      ctx.clearRect(0, 0, width, height);
      for (let y = 0; y < height; y += strip) {
        const shift = Math.sin((y / height) * Math.PI * 6 + phase * TWO_PI) * width * 0.012;
        ctx.drawImage(base, 0, y, width, strip, shift, y, width, strip);
      }
    },
  },
  {
    id: "grain-flicker",
    name: "Grain flicker",
    draw(ctx, base, phase, width, height) {
      drawBase(ctx, base, width, height);
      drawNoise(ctx, width, height, Math.floor(phase * NOISE_SEED_STEPS));
    },
  },
];

export const getAnimator = (id: string): Animator =>
  ANIMATORS.find((animator) => animator.id === id) ?? ANIMATORS[0];
