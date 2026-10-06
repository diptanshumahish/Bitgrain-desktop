import React from "react";
import { X } from "lucide-react";
import type { ImageFilters } from "../../../data/studioTypes";
import { Slider } from "../ui/slider";

interface ImageFilterSlidersProps {
  filters?: ImageFilters;
  onChange: (filters: ImageFilters) => void;
}

interface FilterField {
  key: keyof ImageFilters;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
  fallback: number;
}

const FILTER_FIELDS: FilterField[] = [
  { key: "brightness", label: "brightness", min: 0, max: 200, step: 1, suffix: "%", fallback: 100 },
  { key: "contrast", label: "contrast", min: 0, max: 200, step: 1, suffix: "%", fallback: 100 },
  { key: "saturation", label: "saturation", min: 0, max: 200, step: 1, suffix: "%", fallback: 100 },
  { key: "hueRotate", label: "hue", min: 0, max: 360, step: 1, suffix: "°", fallback: 0 },
  { key: "grayscale", label: "gray", min: 0, max: 100, step: 1, suffix: "%", fallback: 0 },
  { key: "sepia", label: "sepia", min: 0, max: 100, step: 1, suffix: "%", fallback: 0 },
  { key: "blur", label: "blur", min: 0, max: 20, step: 0.1, suffix: "px", fallback: 0 },
  { key: "invert", label: "invert", min: 0, max: 100, step: 1, suffix: "%", fallback: 0 },
];

export const ImageFilterSliders: React.FC<ImageFilterSlidersProps> = ({
  filters = {},
  onChange,
}) => {
  const updateFilter = (key: keyof ImageFilters, value: number) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col gap-3">
      {FILTER_FIELDS.map((field) => (
        <Slider
          key={field.key}
          label={field.label}
          value={filters[field.key] ?? field.fallback}
          min={field.min}
          max={field.max}
          step={field.step}
          suffix={field.suffix}
          onChange={(value) => updateFilter(field.key, value)}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange({})}
        className="flex items-center gap-1 text-[11px] text-[var(--s-text-subtle)] hover:text-[var(--s-accent)] transition-colors bg-transparent border-none cursor-pointer w-fit"
      >
        reset <X size={11} strokeWidth={2} />
      </button>
    </div>
  );
};
