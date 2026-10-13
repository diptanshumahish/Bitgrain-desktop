import React from "react";

export interface SegmentedOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface SegmentedChoiceProps {
  label: string;
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedChoice: React.FC<SegmentedChoiceProps> = ({ label, options, value, onChange }) => (
  <div role="radiogroup" aria-label={label} className="flex gap-[2px] p-0.5 rounded-lg bg-[var(--s-bg-input)]">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        role="radio"
        aria-checked={option.value === value}
        onClick={() => onChange(option.value)}
        className={`flex-1 h-7 rounded-md flex items-center justify-center gap-1.5 text-[10.5px] font-semibold transition-colors ${
          option.value === value
            ? "bg-[var(--s-bg-panel)] text-[var(--s-text)]"
            : "text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
        }`}
      >
        {option.icon}
        {option.label}
      </button>
    ))}
  </div>
);
