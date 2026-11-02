export type PrintMode = "glow" | "paper";

export interface Plate {
  colour: readonly [number, number, number];
  directionX: number;
  directionY: number;
  angleDegrees: number;
  channel: number;
  shadowRelief: number;
}

export const GLOW_PLATES: readonly Plate[] = [
  { colour: [1, 0.05, 0.06], directionX: -1, directionY: 0.5, angleDegrees: 15, channel: 0, shadowRelief: 0 },
  { colour: [0.04, 0.95, 0.3], directionX: 1, directionY: -0.6, angleDegrees: 75, channel: 1, shadowRelief: 0 },
  { colour: [0.1, 0.13, 1], directionX: 0.2, directionY: 1, angleDegrees: 0, channel: 2, shadowRelief: 0 },
];

export const PAPER_PLATES: readonly Plate[] = [
  { colour: [0, 0.47, 0.75], directionX: -1, directionY: 0.5, angleDegrees: 15, channel: 0, shadowRelief: 0 },
  { colour: [1, 0.28, 0.55], directionX: 1, directionY: -0.6, angleDegrees: 75, channel: 1, shadowRelief: 0 },
  { colour: [1, 0.91, 0], directionX: 0.2, directionY: 1, angleDegrees: 0, channel: 2, shadowRelief: 0.7 },
];

export const PAPER_TONE: readonly [number, number, number] = [0.96, 0.94, 0.89];

export const PRINT_OPTIONS = [
  { value: "paper", label: "Ink on paper" },
  { value: "glow", label: "Glow on black" },
] as const;
