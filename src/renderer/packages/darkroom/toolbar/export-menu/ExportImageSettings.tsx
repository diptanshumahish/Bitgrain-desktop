import React from "react";
import { ExportFormatPicker } from "./controls/ExportFormatPicker";
import { ExportScalePicker } from "./controls/ExportScalePicker";
import { ExportOptionsCard } from "./controls/ExportOptionsCard";
import type { ExportSettings } from "./export-settings-store";

interface ExportImageSettingsProps {
  settings: ExportSettings;
  transparent: boolean;
  onToggleTransparent: () => void;
}

export const ExportImageSettings: React.FC<ExportImageSettingsProps> = ({ settings, transparent, onToggleTransparent }) => (
  <div className="flex flex-col gap-5">
    <ExportFormatPicker format={settings.format} />
    <ExportScalePicker scale={settings.scale} />
    <ExportOptionsCard
      format={settings.format}
      quality={settings.quality}
      reducePalette={settings.reducePalette}
      transparent={transparent}
      onToggleTransparent={onToggleTransparent}
    />
  </div>
);
