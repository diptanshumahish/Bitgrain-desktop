import type { StyleLook } from "../engine/style-types";
import { chromatic, combine, grain, pixelate, scanlines, tint } from "./look-builders";

export const MOSAIC_LOOKS: readonly StyleLook[] = [
  { name: "Sea", params: { size: 13, contrast: 40, backdropBlur: 0 }, effects: tint("#3ca6ff", 45, "hue") },
  { name: "Tall tiles", params: { size: 12, contrast: 45, backdropBlur: 0, shape: "tall" }, effects: grain(20) },
  { name: "Vaporwave", params: { size: 16 }, effects: combine(tint("#ff3cac", 32, "overlay"), chromatic(5), scanlines(22)) },
  { name: "Chunky", params: { size: 16, backdrop: "solid", brightness: 12 }, effects: pixelate(5) },
];

export const PIXEL_LOOKS: readonly StyleLook[] = [
  { name: "Arcade", params: { size: 10, contrast: 60 }, effects: combine(chromatic(5), scanlines(26)) },
  { name: "Pixel pop", params: { size: 16, brightness: 12 }, effects: pixelate(5) },
];

export const VOXEL_LOOKS: readonly StyleLook[] = [
  { name: "Small cubes", params: { size: 10, contrast: 45 } },
  { name: "Outlined", params: { size: 16, outline: 30 } },
];

export const LEGO_LOOKS: readonly StyleLook[] = [
  { name: "Big bricks", params: { size: 24 } },
  { name: "Grainy", params: { size: 14 }, effects: grain(18) },
];

export const DISCO_LOOKS: readonly StyleLook[] = [
  { name: "Glitter", params: { size: 8, uniformity: 40 } },
  { name: "Scan", params: { size: 12 }, effects: scanlines(22) },
];
