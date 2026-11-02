import React from "react";
import { HALFTONE_PRESETS } from "../../../../engine/presets/halftone-presets";
import type { PresetConfig } from "../../../../engine/presets";
import { PresetCard } from "../PresetCard";
import { trackEvent } from "../../../../lib/tracker";
import { useSignalValue } from "../../../../lib/signal";
import { previewThumbSignal } from "../../../../store/preview-thumb-store";

const PANEL_PRESET_NAMES = new Set(["Newsprint", "CMYK Pop", "Comic Dot", "Fine Colour", "Poster Bold Dot", "Mono 45"]);
const PANEL_PRESETS = HALFTONE_PRESETS.filter((preset) => PANEL_PRESET_NAMES.has(preset.name));

interface HalftonePresetStripProps {
  onApplyPreset: (config: PresetConfig) => void;
}

export const HalftonePresetStrip: React.FC<HalftonePresetStripProps> = ({ onApplyPreset }) => {
  const thumb = useSignalValue(previewThumbSignal);
  return (
  <div className="grid grid-cols-3 gap-1.5 px-1 pb-1">
    {PANEL_PRESETS.map((preset) => (
      <div key={`${preset.name}-${thumb.id}`} className="min-w-0">
        <PresetCard
          preset={preset}
          image={thumb.src}
          small
          onApply={() => {
            onApplyPreset(preset.config);
            trackEvent("halftone", "preset_applied", { details: { name: preset.name } });
          }}
        />
      </div>
    ))}
  </div>
);
};
