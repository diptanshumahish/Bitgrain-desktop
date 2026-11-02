import type { StyleLook } from "../../engine/style-types";
import { bloom, chromatic, combine, grain, mono, tint, vignette } from "../../looks/look-builders";

export const MOTION_BLUR_LOOKS: readonly StyleLook[] = [
  { name: "Pan", effects: vignette(30) },
  { name: "Rush hour", params: { amount: 60, path: "diagonal" }, effects: combine(bloom(22), vignette(30)) },
  { name: "Shaky hand", params: { amount: 25, path: "wave" }, effects: grain(16) },
  { name: "Curl", params: { amount: 45, path: "curl" }, effects: vignette(34) },
];

export const TILT_SHIFT_LOOKS: readonly StyleLook[] = [
  { name: "Toy town", effects: bloom(20) },
  { name: "Slanted", params: { angle: -18, band: 20, blur: 60 }, effects: bloom(18) },
  { name: "Quiet", params: { saturation: 100, blur: 35, band: 36 }, effects: vignette(24) },
];

export const SOFT_FOCUS_LOOKS: readonly StyleLook[] = [
  { name: "Haze", effects: bloom(24) },
  { name: "Dream", params: { amount: 35 }, effects: combine(tint("#ffb3d9", 26, "soft-light"), bloom(40)) },
  { name: "Fog", params: { amount: 55, brightness: 10 }, effects: combine(mono(40), vignette(20)) },
];

export const RADIAL_BLUR_LOOKS: readonly StyleLook[] = [
  { name: "Warp speed", effects: vignette(34) },
  { name: "Spin", params: { method: "spin", amount: 55 }, effects: vignette(34) },
  { name: "Punch in", params: { amount: 70 }, effects: combine(bloom(25), chromatic(3)) },
];
