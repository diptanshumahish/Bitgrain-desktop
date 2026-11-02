import React from "react";
import { PenLine } from "lucide-react";
import type { MaskArea } from "@bitgrain/engine/grading/mask/mask-types";
import { Button } from "@bitgrain/ui/components/Button";

interface AreaSummaryProps {
  area: MaskArea;
  canEdit: boolean;
  onEdit: () => void;
}

const describeArea = (area: MaskArea): string => {
  const parts = [
    area.brush ? "brush" : null,
    area.shape ? `${area.shape.kind} gradient` : null,
  ].filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(" + ") : "whole photo";
};

export const AreaSummary: React.FC<AreaSummaryProps> = ({ area, canEdit, onEdit }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11.5px] text-[var(--s-text)]">Area</span>
      <span className="text-[11px] text-[var(--s-text-subtle)] truncate">{describeArea(area)}</span>
    </div>
    <Button size="sm" onClick={onEdit} disabled={!canEdit} fullWidth>
      <PenLine size={12} strokeWidth={2} /> draw area
    </Button>
  </div>
);
