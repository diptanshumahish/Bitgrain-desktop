import type { BitgrainEffectKind } from "@bitgrain/studio-core/model/studio-types";

export const EFFECT_PHRASES: Record<BitgrainEffectKind, string[]> = {
  dither: ["pixel dots", "1 bit", "black and white dots", "game boy", "retro computer", "noise pattern", "mac paint", "low color"],
  halftone: ["dots", "comic", "newspaper", "print look", "dot pattern", "pop art dots", "screen print", "magazine print"],
  ascii: ["text art", "letters", "characters", "terminal", "code", "matrix", "typewriter art"],
  pixelate: ["pixels", "blocky", "mosaic", "8 bit", "censor", "low res", "pixel art"],
  scanlines: ["crt", "old tv", "vhs", "monitor", "television", "glitch lines", "arcade"],
  crosshatch: ["pen drawing", "sketch", "etching", "engraving", "ink lines", "hatching", "drawn"],
  popart: ["warhol", "comic colors", "bold colors", "lichtenstein", "pop"],
  posterize: ["flat colors", "fewer colors", "screen print", "poster look", "color bands", "reduce colors"],
  grain: ["film grain", "noise", "analog", "texture", "film look", "grainy"],
  photocopy: ["xerox", "copier", "zine", "punk", "high contrast", "photocopied", "black and white"],
  misprint: ["offset", "riso", "risograph", "color shift", "registration", "chromatic", "misaligned"],
  fold: ["folded paper", "crease", "creased", "paper fold", "poster fold"],
  dust: ["scratches", "old film", "dirty", "worn", "aged", "damaged", "specks"],
  style: ["styles", "ascii art", "lego", "mosaic", "pixel art", "glass", "voxel", "led", "looks"],
};
