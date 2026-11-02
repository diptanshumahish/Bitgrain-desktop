import React from "react";
import { qualityToColorCount, type ExportFormat } from "@bitgrain/engine/export/export-types";
import { ExportToggleRow } from "./ExportToggleRow";
import { QualitySlider } from "./QualitySlider";
import { updateExportSettings } from "../export-settings-store";

const PERCENT_DIVISOR = 100;

interface ExportQualityRowsProps {
  format: ExportFormat;
  quality: number;
  reducePalette: boolean;
}

const setQuality = (quality: number): void => updateExportSettings({ quality });

const PngPaletteRows: React.FC<Omit<ExportQualityRowsProps, "format">> = ({ quality, reducePalette }) => (
  <>
    <ExportToggleRow
      label="Reduce colours"
      hint="A smaller file with a limited palette"
      checked={reducePalette}
      onChange={() => updateExportSettings({ reducePalette: !reducePalette })}
    />
    {reducePalette && (
      <QualitySlider label="Colours" valueLabel={`${qualityToColorCount(quality / PERCENT_DIVISOR)}`} quality={quality} onQualityChange={setQuality} />
    )}
  </>
);

export const ExportQualityRows: React.FC<ExportQualityRowsProps> = ({ format, quality, reducePalette }) => {
  if (format === "png-hdr") return null;
  if (format === "png") return <PngPaletteRows quality={quality} reducePalette={reducePalette} />;
  return <QualitySlider label="Quality" valueLabel={`${quality}%`} quality={quality} onQualityChange={setQuality} />;
};
