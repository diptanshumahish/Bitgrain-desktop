import type { StyleLook } from "../../../engine/style-types";
import { bloom, combine, vignette } from "../../../looks/look-builders";

const WIND_FINISH = combine(bloom(32), vignette(34));

export const LIGHT_WIND_LOOKS: readonly StyleLook[] = [
  { name: "Breeze", effects: WIND_FINISH },
  { name: "Rising", params: { direction: 270, length: 60 }, effects: WIND_FINISH },
  { name: "Comet", params: { length: 100, glow: 70, decay: 20 }, effects: WIND_FINISH },
  { name: "Ripple", params: { wave: 75, length: 80 }, effects: WIND_FINISH },
];

