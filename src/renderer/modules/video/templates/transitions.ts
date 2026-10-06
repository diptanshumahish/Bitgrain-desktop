import type { TransitionPreset } from "./types";

export const TRANSITION_PRESETS: TransitionPreset[] = [
  {
    id: "crossfade",
    label: "Crossfade",
    description: "Soft blend between adjacent clips",
    duration: 0.7,
  },
  {
    id: "dip-black",
    label: "Dip to Black",
    description: "Out clip fades to black, next clip fades in",
    duration: 0.8,
  },
  {
    id: "dip-white",
    label: "Dip to White",
    description: "Quick flash through white",
    duration: 0.4,
  },
  {
    id: "soft",
    label: "Soft Fade",
    description: "Gentle full-second overlap",
    duration: 1,
  },
];
