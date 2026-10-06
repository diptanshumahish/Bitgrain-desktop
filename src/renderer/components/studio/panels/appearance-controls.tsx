import React from "react";
import { Circle, Blend } from "lucide-react";
import type { BlendMode, ImageFilters } from "../../../data/studioTypes";
import { ScrubField } from "../ui/panelPrimitives";
import { BLEND_MODE_OPTIONS } from "../ui/blend-modes";
import { Dropdown } from "../ui/dropdown";
import { ImageFilterSliders } from "./image-filter-sliders";

interface AppearanceControlsProps {
  opacity: number;
  blendMode?: BlendMode;
  filters?: ImageFilters;
  onOpacityChange: (value: number) => void;
  onBlendModeChange: (mode: BlendMode) => void;
  onFiltersChange: (filters: ImageFilters) => void;
}

export const AppearanceControls: React.FC<AppearanceControlsProps> = ({
  opacity,
  blendMode,
  filters,
  onOpacityChange,
  onBlendModeChange,
  onFiltersChange,
}) => (
  <>
    <div className="grid grid-cols-2 gap-2">
      <ScrubField
        label={<Circle size={12} strokeWidth={1.75} />}
        value={Math.round(opacity * 100)}
        min={0}
        max={100}
        suffix="%"
        onChange={(v) => onOpacityChange(v / 100)}
      />
      <Dropdown
        icon={<Blend size={13} strokeWidth={1.75} />}
        options={BLEND_MODE_OPTIONS}
        value={blendMode ?? "normal"}
        onChange={(v) => onBlendModeChange(v as BlendMode)}
      />
    </div>
    <ImageFilterSliders filters={filters} onChange={onFiltersChange} />
  </>
);
