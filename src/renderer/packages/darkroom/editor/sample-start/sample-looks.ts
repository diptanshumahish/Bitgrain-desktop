import type { Preset, PresetConfig } from "@bitgrain/engine/presets/types";
import { GOAL_PRESETS } from "@bitgrain/engine/presets/goal-presets";
import { HALFTONE_PRESETS } from "@bitgrain/engine/presets/halftone-presets";
import { PALETTE_PRESETS } from "@bitgrain/engine/presets/palette-presets";
import { CLASSIC_PRESETS } from "@bitgrain/engine/presets/classic-presets";
import { ASCII_PRESETS } from "@bitgrain/engine/presets/ascii-presets";

export type SampleLookId = "riso" | "halftone" | "dither" | "grain" | "ascii";

export interface SampleLook {
  id: SampleLookId;
  label: string;
  config: PresetConfig;
}

interface SampleLookSource {
  id: SampleLookId;
  label: string;
  presets: Preset[];
  presetName: string;
}

export const SAMPLE_START_SRC = "/art/cat.webp";
export const DEFAULT_SAMPLE_LOOK_ID: SampleLookId = "riso";

const SAMPLE_LOOK_SOURCES: SampleLookSource[] = [
  { id: "riso", label: "Riso", presets: GOAL_PRESETS, presetName: "Risograph" },
  { id: "halftone", label: "Halftone", presets: HALFTONE_PRESETS, presetName: "CMYK Pop" },
  { id: "dither", label: "Dither", presets: PALETTE_PRESETS, presetName: "Game Boy" },
  { id: "grain", label: "Grain", presets: CLASSIC_PRESETS, presetName: "Film" },
  { id: "ascii", label: "ASCII", presets: ASCII_PRESETS, presetName: "Terminal" },
];

const resolveLook = (source: SampleLookSource): SampleLook | null => {
  const preset = source.presets.find((entry) => entry.name === source.presetName);
  return preset ? { id: source.id, label: source.label, config: preset.config } : null;
};

export const SAMPLE_LOOKS: SampleLook[] = SAMPLE_LOOK_SOURCES.map(resolveLook).filter(
  (look): look is SampleLook => look !== null,
);

export const findSampleLook = (id: SampleLookId): SampleLook | null =>
  SAMPLE_LOOKS.find((look) => look.id === id) ?? null;
