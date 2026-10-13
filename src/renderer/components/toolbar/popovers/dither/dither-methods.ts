import type { DitherMethod } from "../../../../engine/types";

export interface DitherMethodInfo {
  id: DitherMethod;
  name: string;
  description: string;
  glyph: string;
}

export interface DitherGroup {
  label: string;
  description: string;
  methods: DitherMethodInfo[];
}

const ERROR_DIFFUSION: DitherMethodInfo[] = [
  { id: "floyd-steinberg", name: "Floyd-Steinberg", glyph: "▒░▓▒", description: "The classic. Smooth, even grain that keeps the most detail." },
  { id: "atkinson", name: "Atkinson", glyph: "·∷∵·", description: "Crisp and high contrast, the early Mac look. Loses some shadow detail." },
  { id: "sierra", name: "Sierra", glyph: "╬╪╫╬", description: "Spreads error widely for soft, clean gradients." },
  { id: "sierra-2", name: "Sierra two-row", glyph: "╫╪╬╫", description: "A lighter Sierra. Slightly crisper and faster." },
  { id: "sierra-lite", name: "Sierra lite", glyph: "∙░∙░", description: "Minimal spread, gives a tight and slightly busy grain." },
  { id: "stucki", name: "Stucki", glyph: "▓▒░▓", description: "Very smooth with sharp edges. Good for portraits." },
  { id: "burkes", name: "Burkes", glyph: "⁚∶⁚∶", description: "A quicker take on Stucki with similar smooth tones." },
  { id: "jjn", name: "Jarvis-Judice-Ninke", glyph: "▞▚▞▚", description: "The widest spread. Softest gradients, least visible pattern." },
];

const ORDERED: DitherMethodInfo[] = [
  { id: "bayer-2", name: "Bayer 2×2", glyph: "▖▗▘▙", description: "Chunky crosshatch pattern with only a few tones." },
  { id: "bayer-4", name: "Bayer 4×4", glyph: "▛▜▟▙", description: "The retro game console pattern. Regular and graphic." },
  { id: "bayer-8", name: "Bayer 8×8", glyph: "█▉▊▋", description: "A finer grid pattern with more tones." },
  { id: "blue-noise", name: "Blue noise", glyph: "∿∾∿∾", description: "Even, organic speckle with no visible grid." },
  { id: "threshold", name: "Threshold", glyph: "━┅━┅", description: "Pure black or white with no texture. Bold and graphic." },
  { id: "random", name: "Random", glyph: "⁂※⁂※", description: "Noisy static, like a photocopy of a photocopy." },
];

export const DITHER_GROUPS: DitherGroup[] = [
  { label: "Error diffusion", description: "Organic grain that follows the image", methods: ERROR_DIFFUSION },
  { label: "Ordered", description: "Regular, repeating patterns", methods: ORDERED },
];

export const isErrorDiffusion = (method: DitherMethod): boolean =>
  ERROR_DIFFUSION.some((info) => info.id === method);

export const ditherMethodInfo = (method: DitherMethod): DitherMethodInfo | undefined =>
  [...ERROR_DIFFUSION, ...ORDERED].find((info) => info.id === method);
