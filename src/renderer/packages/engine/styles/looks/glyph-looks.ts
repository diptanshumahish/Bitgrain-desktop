import type { StyleLook } from "../engine/style-types";
import { bloom, chromatic, combine, crt, dust, glitch, grain, halftone, mono, scanlines, tint, vignette } from "./look-builders";

export const CHARACTERS_LOOKS: readonly StyleLook[] = [
  { name: "Noir", params: { size: 10, contrast: 135, backdropBlur: 2 }, effects: combine(mono(), vignette(60), grain(36), dust(22), bloom(25)) },
  { name: "Terminal", params: { size: 10, backdropBlur: 0, contrast: 125, glow: 60 }, effects: combine(mono(), tint("#00ff88", 46, "screen"), scanlines(34)) },
  { name: "Amber", params: { size: 11, backdropBlur: 2, contrast: 120, glow: 50 }, effects: combine(tint("#ffb000", 40, "soft-light"), scanlines(44)) },
  { name: "Pink", params: { size: 12, backdropBlur: 2, contrast: 118, glow: 50 }, effects: tint("#ff3cac", 36, "overlay") },
  { name: "Ice", params: { size: 10, backdropBlur: 2, contrast: 120, glow: 48 }, effects: combine(mono(35), tint("#7fd8ff", 42, "screen")) },
  { name: "Binary", params: { size: 8, backdropBlur: 0, contrast: 125, ramp: "binary", glow: 52 }, effects: combine(mono(), tint("#00e5ff", 38, "screen")) },
  { name: "Matrix", params: { size: 14, ramp: "binary", coverage: 96, glow: 100, edges: 40 }, effects: combine(tint("#00ff66", 59, "overlay"), scanlines(28), crt(10), grain(60), glitch(20), halftone(7)) },
  { name: "Blueprint", params: { size: 10, edges: 92, invert: true }, effects: tint("#1e6fff", 48, "multiply") },
  { name: "Retro CRT", params: { size: 10 }, effects: combine(tint("#33ff99", 18, "screen"), scanlines(45), crt(35), vignette(50)) },
  { name: "Newsprint", params: { size: 8, contrast: 150 }, effects: combine(mono(), halftone(5)) },
  { name: "Acid", params: { size: 9 }, effects: combine(tint("#aaff00", 36, "overlay"), scanlines(24), chromatic(4)) },
  { name: "Dream", params: { size: 11 }, effects: combine(tint("#ffb3d9", 36, "soft-light"), bloom(40)) },
];

export const MIXED_LOOKS: readonly StyleLook[] = [
  { name: "Warm", params: { size: 11, backdropBlur: 2, contrast: 118 }, effects: combine(tint("#ff8a3c", 36, "soft-light"), grain(26)) },
];

export const BLOCK_LOOKS: readonly StyleLook[] = [
  { name: "Gold", params: { size: 10, backdropBlur: 0, contrast: 122 }, effects: tint("#ffd23f", 32, "overlay") },
];

export const LINES_LOOKS: readonly StyleLook[] = [
  { name: "Mono scan", params: { size: 12, backdropBlur: 0, contrast: 138 }, effects: combine(mono(), scanlines(28), grain(20)) },
];

export const DIAGONAL_LOOKS: readonly StyleLook[] = [
  { name: "Blue", params: { size: 12, backdropBlur: 0, contrast: 122, glow: 48 }, effects: tint("#3ca6ff", 40, "screen") },
];

export const CROSS_LOOKS: readonly StyleLook[] = [
  { name: "Violet", params: { size: 12, backdropBlur: 2, contrast: 120, glow: 55 }, effects: tint("#b26bff", 36, "screen") },
  { name: "Blue hour", params: { backdropBlur: 2, glow: 100 }, effects: combine(tint("#3ca6ff", 32, "saturation"), scanlines(100)) },
];

export const DIAMOND_LOOKS: readonly StyleLook[] = [
  { name: "Coral", params: { size: 12, backdropBlur: 0, contrast: 120 }, effects: tint("#ff5c5c", 34, "soft-light") },
  { name: "Golden hour", params: { size: 13 }, effects: combine(tint("#d8b46a", 38, "soft-light"), mono(28), vignette(55), bloom(45)) },
];

export const DOTS_LOOKS: readonly StyleLook[] = [
  { name: "Cyan", params: { size: 9, backdropBlur: 0, contrast: 122, glow: 62 }, effects: combine(tint("#00e5ff", 44, "screen"), scanlines(36)) },
  { name: "Grey", params: { size: 12, backdropBlur: 2, contrast: 128 }, effects: combine(mono(), grain(30)) },
  { name: "Inferno", params: { size: 10 }, effects: combine(tint("#ff3b1f", 32, "overlay"), vignette(55), bloom(45)) },
];

export const BRAILLE_LOOKS: readonly StyleLook[] = [
  { name: "Lime", params: { size: 9, backdropBlur: 0, contrast: 125, glow: 50 }, effects: combine(mono(), tint("#7CFC00", 40, "screen")) },
];
