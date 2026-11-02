import type { StyleLook } from "../../../../engine/style-types";
import { vignette } from "../../../../looks/look-builders";

const SENSOR_SHADE = 36;

interface HeatPreset {
  name: string;
  palette: string;
  spread: number;
  blur: number;
  noise: number;
  sensor: number;
}

const HEAT_PRESETS: readonly HeatPreset[] = [
  { name: "Ironbow", palette: "ironbow", spread: 50, blur: 25, noise: 12, sensor: 0 },
  { name: "Hunter", palette: "rainbow", spread: 65, blur: 45, noise: 20, sensor: 0 },
  { name: "Night scope", palette: "whitehot", spread: 55, blur: 20, noise: 10, sensor: 0 },
  { name: "Night watch", palette: "blackhot", spread: 50, blur: 25, noise: 15, sensor: 0 },
  { name: "Lava cam", palette: "lava", spread: 70, blur: 35, noise: 15, sensor: 0 },
  { name: "Arctic", palette: "arctic", spread: 45, blur: 30, noise: 12, sensor: 0 },
  { name: "Old sensor", palette: "ironbow", spread: 50, blur: 40, noise: 45, sensor: 55 },
];

export const THERMAL_LOOKS: readonly StyleLook[] = HEAT_PRESETS.map(({ name, ...params }) => ({
  name,
  params,
  effects: vignette(SENSOR_SHADE),
}));
