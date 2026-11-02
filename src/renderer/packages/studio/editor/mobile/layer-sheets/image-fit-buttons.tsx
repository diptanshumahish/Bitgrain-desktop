import React from "react";

type ImageFit = "cover" | "contain" | "fill";

interface ImageFitButtonsProps {
  value: ImageFit;
  onChange: (fit: ImageFit) => void;
}

const FIT_OPTIONS: { value: ImageFit; label: string }[] = [
  { value: "cover", label: "Fill" },
  { value: "contain", label: "Fit" },
];

export const ImageFitButtons: React.FC<ImageFitButtonsProps> = ({ value, onChange }) => (
  <div className="flex items-center rounded-xl bg-[var(--s-bg-input)] p-0.5">
    {FIT_OPTIONS.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        className={`h-10 px-4 rounded-[10px] text-[13px] font-medium transition-colors ${
          value === option.value ? "bg-[var(--s-bg-panel)] text-[var(--s-text)] " : "text-[var(--s-text-muted)]"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);
