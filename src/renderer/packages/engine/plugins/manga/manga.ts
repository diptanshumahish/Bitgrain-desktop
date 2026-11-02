import type { ImagePlugin, TransformContext, TransformationResult } from "../../core/types";
import { toLuminance, writeResult } from "../ink-common";
import { boxBlur } from "./box-blur";
import { tintGreyOnPaper } from "../../tone/paper";
import { measureLevels, stretchInPlace } from "../../tone/auto-levels";
import { MANGA_DEFAULTS } from "./manga-defaults";
import { buildToneMap, screenCoverageForTone, blackForTone } from "./manga-tone-bands";
import { createDotScreen, locateDot, inkForDot } from "./manga-screen";
import { extractInkLines } from "./manga-ink-lines";
import { flattenTones } from "./manga-flatten";
import { balanceMidtonesInPlace } from "./manga-balance";

const DEG_TO_RAD = Math.PI / 180;
const MIN_CELL = 2;
const LEVELS_CLIP = 0.01;
const REFERENCE_SIDE = 1000;
const MIN_RESOLUTION_SCALE = 0.5;
const SCREEN_SIGMA_PER_CELL = 0.6;
const BLACK_SIGMA = 1.4;
const LINE_SIGMA_MIN = 0.7;
const LINE_SIGMA_MAX = 1.8;
const LINE_THRESHOLD_LOOSE = 0.03;
const LINE_THRESHOLD_TIGHT = 0.01;
const BYTE_MAX = 255;
const FLATTEN_RADIUS = 4;

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;
const toneGradient = (tone: Float32Array, x: number, y: number, width: number, height: number): number => {
  const index = y * width + x;
  const right = x + 1 < width ? tone[index + 1] : tone[index];
  const below = y + 1 < height ? tone[index + width] : tone[index];
  return Math.abs(right - tone[index]) + Math.abs(below - tone[index]);
};
const clampIndex = (value: number, size: number): number => Math.min(size - 1, Math.max(0, Math.round(value)));

export const MangaPlugin: ImagePlugin = {
  id: "manga",
  name: "Manga",
  category: "Creative",

  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const cell = Math.max(MIN_CELL, ctx.mangaCell ?? MANGA_DEFAULTS.cell);
    const angle = (ctx.mangaAngle ?? MANGA_DEFAULTS.angle) * DEG_TO_RAD;
    const lineWeight = clampUnit(ctx.mangaLineWeight ?? MANGA_DEFAULTS.lineWeight);
    const contrast = clampUnit(ctx.mangaContrast ?? MANGA_DEFAULTS.contrast);
    const resolutionScale = Math.max(MIN_RESOLUTION_SCALE, Math.max(width, height) / REFERENCE_SIDE);

    const gray = toLuminance(data, width, height);
    stretchInPlace(gray, measureLevels(gray, LEVELS_CLIP), 1);
    balanceMidtonesInPlace(gray);
    const flat = flattenTones(gray, width, height, Math.round(FLATTEN_RADIUS * resolutionScale));
    const screenTone = boxBlur(flat, width, height, cell * SCREEN_SIGMA_PER_CELL);
    const blackTone = boxBlur(flat, width, height, BLACK_SIGMA * resolutionScale);
    const lines = extractInkLines(flat, width, height, {
      sigma: lerp(LINE_SIGMA_MIN, LINE_SIGMA_MAX, lineWeight) * resolutionScale,
      threshold: lerp(LINE_THRESHOLD_LOOSE, LINE_THRESHOLD_TIGHT, lineWeight),
    });

    const toneMap = buildToneMap(contrast);
    const screen = createDotScreen(cell, angle);
    const out = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const dot = locateDot(screen, x, y);
        const dotIndex = clampIndex(dot.centreY, height) * width + clampIndex(dot.centreX, width);
        const toneInk = inkForDot(screen, dot, screenCoverageForTone(screenTone[dotIndex], toneMap));
        const ink = Math.max(toneInk, blackForTone(blackTone[index], toneGradient(blackTone, x, y, width, height), toneMap), lines[index]);
        const byte = (1 - ink) * BYTE_MAX;
        const pixel = index * 4;
        out[pixel] = byte;
        out[pixel + 1] = byte;
        out[pixel + 2] = byte;
        out[pixel + 3] = BYTE_MAX;
      }
    }

    if (ctx.paperColor) tintGreyOnPaper(out, ctx.paperColor);
    return writeResult(out);
  },
};
