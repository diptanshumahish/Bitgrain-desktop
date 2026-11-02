import type { StyleLook } from "../../engine/style-types";
import { bloom, combine, grain, scanlines, vignette } from "../../looks/look-builders";

export const HEX_MOSAIC_LOOKS: readonly StyleLook[] = [
  { name: "Grouted", params: { size: 18, grout: 60 }, effects: combine(grain(22), scanlines(16)) },
  { name: "Glass tiles", params: { size: 22, grout: 35, bevel: 70, contrast: 20 } },
  { name: "Honeycomb", params: { size: 26, grout: 70, orientation: "flat", groutColour: "#f4efe6" } },
  { name: "Fine weave", params: { size: 8, grout: 25 }, effects: grain(18) },
  { name: "Night tiles", params: { size: 20, grout: 50, bevel: 40, brightness: -10, contrast: 35 }, effects: vignette(45) },
];

export const LED_MATRIX_LOOKS: readonly StyleLook[] = [
  { name: "Amber sign", params: { ledType: "round" }, effects: combine(bloom(34), vignette(38)) },
  { name: "Marquee", params: { ledType: "bulb", size: 22, colour: "#ffd27a", glow: 70 }, effects: vignette(40) },
  { name: "RGB panel", params: { ledType: "stripe", size: 14, glow: 50, contrast: 20 } },
  { name: "Scoreboard", params: { ledType: "square", size: 12, colour: "#ff3b2f", contrast: 30 }, effects: grain(18) },
  { name: "Photo lights", params: { ledType: "round", colourMode: "source", size: 10, glow: 70 }, effects: bloom(30) },
  { name: "Terminal", params: { ledType: "square", colour: "#39ff88", size: 6, glow: 40 }, effects: scanlines(22) },
];
