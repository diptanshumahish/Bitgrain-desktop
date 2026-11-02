import type { StyleLook } from "../../../engine/style-types";

const frost = (name: string, values: readonly [number, number, number, number], colour: string): StyleLook => ({
  name, params: { frost: values[0], haze: values[1], milk: values[2], grain: values[3], tint: colour },
});

export const FROSTED_LOOKS: readonly StyleLook[] = [
  frost("Shower door", [70, 25, 14, 22], "#ffffff"),
  frost("Condensation", [30, 62, 22, 14], "#eef4f7"),
  frost("Sea glass", [55, 46, 16, 26], "#bfe3d0"),
  frost("Rose quartz", [42, 40, 15, 12], "#f4d3d9"),
  frost("Amber", [50, 48, 16, 16], "#f0d7a6"),
  frost("Whisper", [18, 22, 8, 8], "#ffffff"),
];

export const FLUTED_LOOKS: readonly StyleLook[] = [
  { name: "Reeded", params: { shape: "round", size: 14, distortion: 50, shadows: 40, highlights: 10 } },
  { name: "Cathedral", params: { shape: "wave", grid: "wavy", size: 40, distortion: 30, shadows: 10, blur: 10, grain: 5 } },
  { name: "Pleated", params: { shape: "pleat", size: 12, distortion: 75, shadows: 50, blur: 25 } },
  { name: "Rain", params: { shape: "wave", grid: "wavy", size: 18, distortion: 70, shadows: 25, highlights: 15, blur: 20 } },
  { name: "Prism", params: { shape: "prism", size: 22, distortion: 60, shadows: 25, highlights: 20 } },
  { name: "Chevron", params: { shape: "pleat", grid: "zigzag", size: 16, distortion: 60, shadows: 30, highlights: 10, blur: 10 } },
  { name: "Fracture", params: { shape: "flat", grid: "irregular", angle: 30, distortion: 100, size: 28, blur: 40, grain: 10 } },
];
