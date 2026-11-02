import type { DrawContext } from "../../../engine/frame";
import type { RgbTriple } from "../../../postfx/pixel-ops";
import { CHANNEL_MAX, hslTriple, mixTriple, tripleCss } from "../shared/colour";
import type { NeonTile } from "./neon-tiles";

const LEVELS = 5;
const FLICKER_CLASSES = 3;
const RING_SCALES = [0.86, 0.62, 0.38] as const;
const LEVEL_POWER = 1.9;
const FLICKER_BASE = 0.78;
const FLICKER_GAIN = 0.44;
const HUE_SPREAD = 0.034;
const LIGHTNESS = 0.52;
const MIN_SATURATION = 0.55;
const SATURATION_BASE = 1.05;
const SATURATION_DROP = 0.15;
const OUTER_ALPHA = [0.22, 0.24] as const;
const MIDDLE_ALPHA = [0.18, 0.2] as const;
const INNER_WHITE = [0.28, 0.5] as const;
const INNER_ALPHA = [0.2, 0.6] as const;
const HOT_START = 0.55;
const HOT_ALPHA = 0.3;
const WHITE: RgbTriple = [CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MAX];

interface NeonPalette {
  hue: number;
  saturation: number;
  glow: number;
}

type Batches = Map<number, number[]>;

const levelIntensity = (level: number, flicker: number): number =>
  ((level + 0.5) / LEVELS) ** LEVEL_POWER * (FLICKER_BASE + (FLICKER_GAIN * (flicker + 0.5)) / FLICKER_CLASSES);

const ringCorners = (tile: NeonTile, factor: number): number[] => {
  const corners = tile.corners;
  const centreX = (corners[0] + corners[2] + corners[4] + corners[6]) / 4;
  const centreY = (corners[1] + corners[3] + corners[5] + corners[7]) / 4;
  return corners.map((value, index) => (index % 2 === 0 ? centreX + (value - centreX) * factor : centreY + (value - centreY) * factor));
};

const batchTiles = (tiles: NeonTile[]): Batches => {
  const batches: Batches = new Map();
  for (const tile of tiles) {
    const level = Math.min(LEVELS - 1, Math.floor(tile.brightness * LEVELS));
    const flicker = Math.min(FLICKER_CLASSES - 1, Math.floor(tile.flicker * FLICKER_CLASSES));
    RING_SCALES.forEach((factor, ring) => {
      const key = (level * FLICKER_CLASSES + flicker) * RING_SCALES.length + ring;
      const list = batches.get(key) ?? [];
      list.push(...ringCorners(tile, factor));
      batches.set(key, list);
    });
  }
  return batches;
};

const levelColour = (palette: NeonPalette, level: number, intensity: number): RgbTriple => {
  const hue = palette.hue + (level / (LEVELS - 1) - 0.5) * 2 * HUE_SPREAD;
  const saturation = Math.min(1, Math.max(MIN_SATURATION, palette.saturation) * (SATURATION_BASE - SATURATION_DROP * intensity));
  return hslTriple(((hue % 1) + 1) % 1, saturation, LIGHTNESS);
};

const ringStyle = (palette: NeonPalette, key: number): string[] => {
  const ring = key % RING_SCALES.length;
  const group = Math.floor(key / RING_SCALES.length);
  const [level, flicker] = [Math.floor(group / FLICKER_CLASSES), group % FLICKER_CLASSES];
  const intensity = levelIntensity(level, flicker);
  const colour = levelColour(palette, level, intensity);
  if (ring === 0) return [tripleCss(colour, intensity * (OUTER_ALPHA[0] + OUTER_ALPHA[1] * palette.glow))];
  if (ring === 1) return [tripleCss(colour, intensity * (MIDDLE_ALPHA[0] + MIDDLE_ALPHA[1] * palette.glow))];
  const inner = tripleCss(mixTriple(colour, WHITE, INNER_WHITE[0] + INNER_WHITE[1] * intensity), INNER_ALPHA[0] + INNER_ALPHA[1] * intensity);
  return intensity > HOT_START ? [inner, tripleCss(WHITE, ((intensity - HOT_START) / (1 - HOT_START)) * HOT_ALPHA)] : [inner];
};

const fillQuads = (context: DrawContext, quads: number[], style: string): void => {
  context.fillStyle = style;
  context.beginPath();
  for (let index = 0; index < quads.length; index += 8) {
    context.moveTo(quads[index], quads[index + 1]);
    context.lineTo(quads[index + 2], quads[index + 3]);
    context.lineTo(quads[index + 4], quads[index + 5]);
    context.lineTo(quads[index + 6], quads[index + 7]);
    context.closePath();
  }
  context.fill();
};

export const paintNeonTiles = (context: DrawContext, tiles: NeonTile[], palette: NeonPalette): void => {
  context.globalCompositeOperation = "lighter";
  for (const [key, quads] of batchTiles(tiles)) {
    for (const style of ringStyle(palette, key)) fillQuads(context, quads, style);
  }
  context.globalCompositeOperation = "source-over";
};
