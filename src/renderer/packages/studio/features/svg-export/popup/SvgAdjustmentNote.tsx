import React from "react";
import { Info } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { hasAdjustmentLayers } from "./has-adjustment-layers";

interface SvgAdjustmentNoteProps {
  layers: Layer[];
}

export const SvgAdjustmentNote: React.FC<SvgAdjustmentNoteProps> = ({ layers }) => {
  if (!hasAdjustmentLayers(layers)) return null;
  return (
    <p className="flex items-start gap-1.5 text-[11px] leading-snug text-[var(--s-text-muted)]">
      <Info size={12} strokeWidth={1.75} className="mt-px shrink-0" />
      Adjustment layers are left out of SVG, export PNG to keep them.
    </p>
  );
};
