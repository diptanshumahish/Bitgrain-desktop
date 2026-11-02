import React, { useEffect } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { PLATFORM_PRESETS, type PlatformPreset } from "../../platform-presets";
import { ExportGroup } from "../ExportGroup";
import { downloadForPlatform } from "./download-for-platform";
import { pendingPlatformPresetSignal } from "./platform-choice-state";
import { PlatformExportChoice } from "./PlatformExportChoice";
import { PlatformPresetButton } from "./PlatformPresetButton";

interface PlatformSizeGridProps {
  transparent: boolean;
  showsWatermark: boolean;
  onClose: () => void;
}

const clearPendingPreset = (): void => {
  pendingPlatformPresetSignal.value = null;
};

export const PlatformSizeGrid: React.FC<PlatformSizeGridProps> = ({ transparent, showsWatermark, onClose }) => {
  const pending = useSignalValue(pendingPlatformPresetSignal);

  useEffect(() => clearPendingPreset, []);

  const choose = (preset: PlatformPreset): void => {
    if (showsWatermark) {
      pendingPlatformPresetSignal.value = preset;
      return;
    }
    onClose();
    void downloadForPlatform(preset, transparent);
  };

  return (
    <ExportGroup label="Sized for social and music platforms">
      <div className="grid grid-cols-2 gap-1.5">
        {PLATFORM_PRESETS.map((preset) => (
          <PlatformPresetButton key={preset.id} preset={preset} selected={pending?.id === preset.id} onChoose={choose} />
        ))}
      </div>
      {showsWatermark && pending && <PlatformExportChoice preset={pending} transparent={transparent} onClose={onClose} />}
    </ExportGroup>
  );
};
