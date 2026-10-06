import type { TapeStrips, TornEdgeEffect, UploadLayer } from "../data/studioTypes";
import { createRandom, hashStringSeed } from "./torn-edge";

export interface ScatterUpdate {
  id: string;
  updates: Partial<UploadLayer>;
}

const JITTER_FRACTION = 0.24;
const OVERLAP_MIN = 1.15;
const OVERLAP_RANGE = 0.4;
const MAX_ROTATION = 14;
const TAPE_CHANCE = 0.45;
const TAPE_COLOR = "#f4efe6";
const TAPE_OPACITY = 0.85;

const tornEdgeFor = (random: () => number): TornEdgeEffect => ({
  style: "torn",
  sides: { top: true, right: true, bottom: true, left: true },
  roughness: 40 + Math.round(random() * 30),
  detail: 12 + Math.round(random() * 8),
  border: 8 + Math.round(random() * 6),
  borderColor: "#ffffff",
  frame: "paper",
  seed: Math.floor(random() * 1_000_000_000),
});

const tapeFor = (random: () => number): TapeStrips | undefined => {
  if (random() >= TAPE_CHANCE) return undefined;
  const diagonal = random() < 0.5;
  return {
    corners: diagonal
      ? { tl: true, tr: false, bl: false, br: true }
      : { tl: false, tr: true, bl: true, br: false },
    color: TAPE_COLOR,
    opacity: TAPE_OPACITY,
  };
};

const scatterSeed = (uploads: UploadLayer[]): number =>
  hashStringSeed(uploads.map((layer) => `${layer.id}:${layer.x}:${layer.y}:${layer.width}`).join("|"));

export const buildScatterCollage = (
  uploads: UploadLayer[],
  canvasWidth: number,
  canvasHeight: number,
  random: () => number = createRandom(scatterSeed(uploads)),
): ScatterUpdate[] => {
  const count = uploads.length;
  if (count === 0) return [];

  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const cellWidth = canvasWidth / columns;
  const cellHeight = canvasHeight / rows;

  return uploads.map((layer, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const centerX = (column + 0.5) * cellWidth + (random() - 0.5) * cellWidth * JITTER_FRACTION;
    const centerY = (row + 0.5) * cellHeight + (random() - 0.5) * cellHeight * JITTER_FRACTION;
    const width = Math.round(cellWidth * (OVERLAP_MIN + random() * OVERLAP_RANGE));
    const height = Math.round(cellHeight * (OVERLAP_MIN + random() * OVERLAP_RANGE));

    return {
      id: layer.id,
      updates: {
        x: Math.round(centerX - width / 2),
        y: Math.round(centerY - height / 2),
        width,
        height,
        rotation: Math.round((random() - 0.5) * MAX_ROTATION),
        fit: "cover",
        borderRadius: 0,
        tornEdge: tornEdgeFor(random),
        tape: tapeFor(random),
      },
    };
  });
};
