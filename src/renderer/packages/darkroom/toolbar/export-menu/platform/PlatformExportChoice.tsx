import React from "react";
import { WatermarkExportChoice } from "../download/WatermarkExportChoice";
import { downloadForPlatform } from "./download-for-platform";
import { freePlatformSizeLabel } from "./free-platform-size";
import { pendingPlatformPresetSignal } from "./platform-choice-state";
import type { PlatformPreset } from "../../platform-presets";

const PACK_TRIGGER = "platform_sizes";

interface PlatformExportChoiceProps {
  preset: PlatformPreset;
  transparent: boolean;
  onClose: () => void;
}

const revealChoice = (node: HTMLDivElement | null): void => {
  node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
};

export const PlatformExportChoice: React.FC<PlatformExportChoiceProps> = ({ preset, transparent, onClose }) => {
  const downloadWatermarked = (): void => {
    pendingPlatformPresetSignal.value = null;
    onClose();
    void downloadForPlatform(preset, transparent);
  };

  return (
    <div ref={revealChoice} className="flex flex-col gap-2.5 pt-1">
      <WatermarkExportChoice
        label={`Download ${preset.label}`}
        sizeLabel={freePlatformSizeLabel(preset)}
        trigger={PACK_TRIGGER}
        onDownload={downloadWatermarked}
        onClose={onClose}
      />
    </div>
  );
};
