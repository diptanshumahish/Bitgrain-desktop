import { BITGRAIN_EFFECTS, BITGRAIN_GROUPS } from "@bitgrain/studio-core/effects/bitgrain/bitgrain-effect-core";
import { emitApplyEffect } from "../effects/apply-effect-event";
import { EFFECT_PHRASES } from "./effect-phrases";
import type { PaletteEntry } from "./palette-entry";

export const EFFECT_ENTRIES: PaletteEntry[] = BITGRAIN_EFFECTS.map((effect) => ({
  id: `effect-${effect.kind}`,
  label: `${effect.label} effect`,
  group: "Effects",
  keywords: [effect.kind, effect.label, BITGRAIN_GROUPS[effect.kind], "effect", "filter", "look", ...EFFECT_PHRASES[effect.kind]],
  hint: "On the selected photo",
  run: () => emitApplyEffect(effect.kind),
}));
