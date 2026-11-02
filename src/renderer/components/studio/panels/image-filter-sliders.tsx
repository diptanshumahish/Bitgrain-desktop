import React from "react";
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
  { key: "brightness", label: "Brightness", min: 0, max: 200, step: 1, suffix: "%", fallback: 100 },
  { key: "contrast", label: "Contrast", min: 0, max: 200, step: 1, suffix: "%", fallback: 100 },
  { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1, suffix: "%", fallback: 100 },
  { key: "hueRotate", label: "Hue", min: 0, max: 360, step: 1, suffix: "°", fallback: 0 },
  { key: "grayscale", label: "Grayscale", min: 0, max: 100, step: 1, suffix: "%", fallback: 0 },
  { key: "sepia", label: "Sepia", min: 0, max: 100, step: 1, suffix: "%", fallback: 0 },
  { key: "blur", label: "Blur", min: 0, max: 20, step: 0.1, suffix: "px", fallback: 0 },
  { key: "invert", label: "Invert", min: 0, max: 100, step: 1, suffix: "%", fallback: 0 },
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
    </div>
  );
};
