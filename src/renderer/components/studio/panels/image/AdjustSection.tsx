import React, { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import type { ImageFilters } from "../../../../data/studioTypes";
import { PanelGroup } from "../../ui/panel-group";
import { HeaderIconButton } from "../../ui/HeaderIconButton";
import { ImageFilterSliders } from "../image-filter-sliders";
import { hasFilterChanges } from "./has-color-changes";

interface AdjustSectionProps {
  filters?: ImageFilters;
  onChange: (filters: ImageFilters) => void;
  defaultOpen?: boolean;
}

export const AdjustSection: React.FC<AdjustSectionProps> = ({ filters, onChange, defaultOpen = false }) => {
  const adjusted = hasFilterChanges(filters);
  const [open, setOpen] = useState(defaultOpen || adjusted);

  const actions = (
    <>
      {adjusted && (
        <HeaderIconButton title="Reset adjustments" onClick={() => onChange({})}>
          <RotateCcw size={12} strokeWidth={1.75} />
        </HeaderIconButton>
      )}
      <HeaderIconButton title={open ? "Hide adjustments" : "Show adjustments"} active={open} onClick={() => setOpen(!open)}>
        <ChevronDown size={13} strokeWidth={1.75} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </HeaderIconButton>
    </>
  );

  return (
    <PanelGroup title="Adjust" actions={actions}>
      {open && <ImageFilterSliders filters={filters} onChange={onChange} />}
    </PanelGroup>
  );
};
