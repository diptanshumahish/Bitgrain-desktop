import type { EffectDefinition } from "../effect-definition";
import { copyPixels } from "../pixel-ops";
import { WARP_SPECS } from "../../modes/distort/warp/warp-specs";
import { warpIntoFrame } from "../../modes/distort/warp/warp-style";
import type { WarpSpec } from "../../modes/distort/warp/warp-spec";

const warpEffect = (spec: WarpSpec): EffectDefinition => ({
  key: spec.effectKey,
  label: spec.label,
  hint: spec.hint,
  params: spec.params,
  apply: ({ frame, values, scale }) => {
    const source = { data: copyPixels(frame.pixels().data), width: frame.width, height: frame.height };
    warpIntoFrame(frame, source, spec, values, scale);
  },
});

export const WARP_EFFECTS: readonly EffectDefinition[] = WARP_SPECS.map(warpEffect);
