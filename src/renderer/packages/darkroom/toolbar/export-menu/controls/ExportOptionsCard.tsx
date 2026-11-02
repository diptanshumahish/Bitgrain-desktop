import React from "react";
import type { ExportFormat } from "@bitgrain/engine/export/export-types";
import { ExportGroup } from "../ExportGroup";
import { ExportToggleRow } from "./ExportToggleRow";
import { ExportQualityRows } from "./ExportQualityRows";

const TRANSPARENT_HINT = "Drops the paper colour so only the ink is left";
const NO_TRANSPARENCY_HINT = "JPEG files can't keep see-through areas";

interface ExportOptionsCardProps {
  format: ExportFormat;
  quality: number;
  reducePalette: boolean;
  transparent: boolean;
  onToggleTransparent: () => void;
}

export const ExportOptionsCard: React.FC<ExportOptionsCardProps> = ({ format, quality, reducePalette, transparent, onToggleTransparent }) => {
  const supportsTransparency = format !== "jpeg";
  return (
    <ExportGroup label="Options">
      <div className="flex flex-col rounded-lg border border-[var(--s-border)] divide-y divide-[var(--s-border)]">
        <ExportToggleRow
          label="Transparent background"
          hint={supportsTransparency ? TRANSPARENT_HINT : NO_TRANSPARENCY_HINT}
          checked={transparent && supportsTransparency}
          onChange={onToggleTransparent}
          disabled={!supportsTransparency}
        />
        <ExportQualityRows format={format} quality={quality} reducePalette={reducePalette} />
      </div>
    </ExportGroup>
  );
};
