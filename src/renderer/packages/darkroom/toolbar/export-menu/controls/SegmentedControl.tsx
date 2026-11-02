import React from "react";

export interface SegmentOption<T extends string | number> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

const segmentClass = (isActive: boolean): string =>
  `flex-1 h-7 px-2 rounded-md text-[12px] font-medium tabular-nums whitespace-nowrap transition-colors ${
    isActive
      ? "bg-[var(--s-bg-panel)] text-[var(--s-text)] shadow-[0_0_0_1px_var(--s-border)]"
      : "text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
  }`;

export const SegmentedControl = <T extends string | number>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>): React.ReactElement => (
  <div role="radiogroup" aria-label={label} className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--s-bg-input)]">
    {options.map((option) => (
      <button
        key={option.id}
        type="button"
        role="radio"
        aria-checked={value === option.id}
        onClick={() => onChange(option.id)}
        className={segmentClass(value === option.id)}
      >
        {option.label}
      </button>
    ))}
  </div>
);
