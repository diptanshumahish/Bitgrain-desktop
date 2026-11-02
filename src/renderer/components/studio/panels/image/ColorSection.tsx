import React, { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import type { ImageFilters } from "../../../../data/studioTypes";
import type { ColorGrade } from "../../../../modules/grading/engine/grade-types";
import type { MaskLayer } from "../../../../modules/grading/mask/mask-types";
import { StudioScopedGrade } from "../../../../modules/grading/studio/StudioScopedGrade";
import { GradeSection } from "../../../../modules/grading/ui/grade-section";
import { PanelGroup } from "../../ui/panel-group";
import { HeaderIconButton } from "../../ui/HeaderIconButton";
import { ImageFilterSliders } from "../image-filter-sliders";
import { hasColorChanges, hasFilterChanges } from "./has-color-changes";

interface ColorUpdates {
  filters?: ImageFilters;
  colorGrade?: ColorGrade;
  masks?: MaskLayer[];
}

interface ColorSectionProps {
  filters?: ImageFilters;
  colorGrade?: ColorGrade;
  masks?: MaskLayer[];
  sourceUrl: string | null;
  hasEffect: boolean;
  onChange: (updates: ColorUpdates) => void;
}

export const ColorSection: React.FC<ColorSectionProps> = ({ filters, colorGrade, masks, sourceUrl, hasEffect, onChange }) => {
  const changed = hasColorChanges(filters, colorGrade, masks);
  const [open, setOpen] = useState(changed);

  const actions = (
    <>
      {changed && (
        <HeaderIconButton title="Reset color" onClick={() => onChange({ filters: undefined, colorGrade: undefined })}>
          <RotateCcw size={12} strokeWidth={1.75} />
        </HeaderIconButton>
      )}
      <HeaderIconButton title={open ? "Hide color controls" : "Show color controls"} active={open} onClick={() => setOpen(!open)}>
        <ChevronDown size={13} strokeWidth={1.75} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </HeaderIconButton>
    </>
  );

  return (
    <PanelGroup title="Color Grade" actions={actions}>
      {open && (
        <div className="flex flex-col">
          <StudioScopedGrade grade={colorGrade} masks={masks} sourceUrl={sourceUrl} hasEffect={hasEffect} onChange={onChange} />
          <GradeSection title="classic filters" defaultOpen={hasFilterChanges(filters)}>
            <ImageFilterSliders filters={filters} onChange={(next) => onChange({ filters: next })} />
          </GradeSection>
        </div>
      )}
    </PanelGroup>
  );
};
