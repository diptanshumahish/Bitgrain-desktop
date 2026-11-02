import type { LayerEffectKind } from "@bitgrain/studio-core/model/layer-paint-types";

export const EFFECT_KIND_OPTIONS: { label: string; value: LayerEffectKind }[] = [
  { label: "Shadow", value: "drop-shadow" },
  { label: "Inner shadow", value: "inner-shadow" },
  { label: "Glow", value: "glow" },
  { label: "Blur", value: "layer-blur" },
  { label: "Blur behind", value: "background-blur" },
];
